import { loadPersona } from '@/lib/confluence-labs/loader';
import { callClaude } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { searchGoogleJobs } from '@/lib/apis/serpapi';
import { searchONET, getONETCompetencies } from '@/lib/apis/onet';
import { withCache } from '@/lib/apis/cache';
import { fetchBLSData, fetchONETOnline, searchJobsBrave } from '@/lib/apis/web-fallbacks';

/**
 * Clean a geographic area string for SerpAPI location parameter.
 * SerpAPI needs simple "City, State" format.
 * Example: "Cedar Rapids and Iowa City, Iowa (Linn and Johnson Counties)" → "Cedar Rapids, Iowa"
 */
function cleanLocationForSerpAPI(location: string): string {
  if (!location) return 'United States';
  // Strip parenthetical content
  let clean = location.replace(/\([^)]*\)/g, '').trim();
  // Extract state (look for ", State" pattern)
  const stateMatch = clean.match(/,\s*([A-Za-z\s]+)$/);
  const state = stateMatch?.[1]?.trim() || '';
  // Take the first city if "and" is present
  const beforeState = stateMatch ? clean.substring(0, stateMatch.index) : clean;
  const firstCity = beforeState.split(/\s+and\s+/i)[0].trim();
  // Reassemble
  if (state && !firstCity.includes(state)) {
    return `${firstCity}, ${state}`;
  }
  return firstCity || location;
}

export interface MarketAnalysisData {
  score?: number;
  scoreRationale?: string;
  live_jobs: {
    count: number;
    salaries: any;
    topEmployers: any[];
    requiredSkills: any[];
    certifications: any[];
  };
  onet_data: {
    code: string;
    title: string;
    description: string;
    skills: any[];
    knowledge: any[];
  } | null;
  recommendations: string[];
}

export async function runMarketAnalysis(
  projectId: string,
  project: ValidationProject
): Promise<{ data: MarketAnalysisData; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    console.log(`[Market Analyst] Starting for "${project.program_name}"`);

    // 1. Fetch REAL data from APIs (with caching, fault-tolerant)
    const rawLocation = (project as any).geographic_area || 'United States';
    const serpApiLocation = cleanLocationForSerpAPI(rawLocation);
    const socCode = (project as any).soc_codes || '';

    const [liveJobsDataResult, onetCode] = await Promise.all([
      withCache(
        'serpapi_jobs',
        { occupation: project.program_name, location: serpApiLocation },
        () => searchGoogleJobs(
          // Search for occupation title, not program name (e.g. "Pharmacy Technician" not "Pharmacy Technician Certificate")
          (project as any).target_occupation || project.program_name.replace(/\s*(certificate|diploma|degree|program|associate|bachelor)/gi, '').trim(),
          serpApiLocation
        ),
        168 // Cache for 7 days
      ).catch((err) => { console.warn('[Market Analyst] SerpAPI failed, continuing without live jobs:', err.message); return null; }),
      // Use SOC code directly if provided, otherwise search by program name
      socCode
        ? Promise.resolve(socCode)
        : withCache(
            'onet_search',
            { keyword: project.program_name },
            () => searchONET(project.program_name),
            720 // Cache for 30 days (O*NET changes slowly)
          ).catch((err) => { console.warn('[Market Analyst] O*NET failed, continuing without O*NET data:', err.message); return null; }),
    ]);

    // Fallback: If SerpAPI failed, try Brave Search for job data
    let liveJobsData = liveJobsDataResult;
    if (!liveJobsData) {
      console.log('[Market Analyst] Trying Brave Search fallback for job data...');
      const braveResult = await searchJobsBrave(project.program_name, serpApiLocation).catch(() => null);
      if (braveResult?.estimated_job_count) {
        console.log(`[Market Analyst] Brave Search found ~${braveResult.estimated_job_count} jobs`);
        // Create a minimal ProcessedJobData-compatible structure
        liveJobsData = {
          count: braveResult.estimated_job_count,
          salaries: { min: 0, max: 0, median: 0, ranges: { entry: 'Not available', mid: 'Not available', senior: 'Not available' } },
          topEmployers: [],
          requiredSkills: [],
          certifications: [],
        } as any;
      }
    }

    // 2. Get O*NET competencies if code was found
    let onetData = null;
    if (onetCode) {
      onetData = await withCache(
        'onet_competencies',
        { code: onetCode },
        () => getONETCompetencies(onetCode),
        720
      ).catch(async (err) => {
        console.warn('[Market Analyst] O*NET API failed for competencies, trying web fallback:', err.message);
        const fallback = await fetchONETOnline(onetCode).catch(() => null);
        if (fallback) {
          return {
            code: onetCode,
            title: fallback.title,
            description: fallback.description,
            skills: fallback.skills.map(s => ({ element_name: s, scale_value: 4 })),
            knowledge: fallback.knowledge.map(k => ({ element_name: k, scale_value: 4 })),
            technology: [],
            education: 'Not specified (from web fallback)',
          };
        }
        return null;
      });
    }

    // 3. Always try BLS for salary/employment data (free, no auth)
    // Try project SOC code first, then resolved O*NET code
    let blsData = null;
    const codesToTry = [socCode, onetCode].filter(Boolean).map(c => c!.split('.')[0]); // Strip O*NET suffix like .00
    for (const code of [...new Set(codesToTry)]) {
      blsData = await fetchBLSData(code).catch(() => null);
      if (blsData && (blsData.median_wage || blsData.employment_total)) {
        console.log(`[Market Analyst] BLS data (${code}): employment=${blsData.employment_total}, median=$${blsData.median_wage}`);
        break;
      }
    }
    if (!blsData || (!blsData.median_wage && !blsData.employment_total)) {
      console.warn('[Market Analyst] BLS scraping returned no usable data — BLS may be blocking requests');
      blsData = null;
    }

    console.log(`[Market Analyst] Data fetched - Jobs: ${liveJobsData?.count ?? 0}, O*NET: ${onetCode || 'not found'}, BLS: ${blsData ? 'yes' : 'no'}`);

    // Gracefully handle missing API data — use placeholder structure
    if (!liveJobsData) {
      console.warn('[Market Analyst] No live jobs data available — using AI analysis only');
    }
    const jobsAvailable = !!liveJobsData;

    // 3. Load persona
    const persona = await loadPersona('market-analyst');

    // 4. Build prompt with REAL data (gracefully handle missing APIs)
    const jobsSection = jobsAvailable ? `
═══════════════════════════════════════════════════════════
REAL DATA FROM GOOGLE JOBS (SerpAPI - ${new Date().toLocaleDateString()}):
═══════════════════════════════════════════════════════════

Current Job Openings in Region: ${liveJobsData!.count}

Salary Ranges (from actual job postings):
- Entry-Level: ${liveJobsData!.salaries.ranges.entry}
- Mid-Career: ${liveJobsData!.salaries.ranges.mid}
- Senior: ${liveJobsData!.salaries.ranges.senior}
- Overall Range: $${liveJobsData!.salaries.min.toLocaleString()} - $${liveJobsData!.salaries.max.toLocaleString()}
- Median: $${liveJobsData!.salaries.median.toLocaleString()}

Top Employers (by number of openings):
${liveJobsData!.topEmployers.map((e: any, i: number) => `${i + 1}. ${e.name} (${e.openings} openings)`).join('\n')}

Most Requested Skills (% of job postings):
${liveJobsData!.requiredSkills.map((s: any) => `- ${s.skill}: ${s.frequency}%`).join('\n')}

Certifications Mentioned:
${liveJobsData!.certifications.map((c: any) => `- ${c.cert}: ${c.frequency}%`).join('\n')}` : `
═══════════════════════════════════════════════════════════
NOTE: Live job posting data was unavailable (API issue).
Use your expert knowledge of BLS data, industry trends, and
the occupation (SOC ${project.soc_codes || '29-2052'}) to provide
a comprehensive labor market analysis for ${project.geographic_area || 'the target region'}.
═══════════════════════════════════════════════════════════`;

    const prompt = `${persona.name}

TASK: Analyze labor market data and provide strategic insights.

PROGRAM: ${project.program_name}
CLIENT: ${project.client_name}
TYPE: ${project.program_type || 'Not specified'}
AUDIENCE: ${project.target_audience || 'Not specified'}
OCCUPATION: ${(project as any).target_occupation || 'Not specified'}
REGION: ${(project as any).geographic_area || 'Not specified'}
SOC CODE: ${(project as any).soc_codes || 'Not specified'}
${jobsSection}

${blsData ? `
═══════════════════════════════════════════════════════════
REAL DATA FROM BLS (Bureau of Labor Statistics):
═══════════════════════════════════════════════════════════

National Employment: ${blsData.employment_total?.toLocaleString() || 'Not available'}
Median Annual Wage: $${blsData.median_wage?.toLocaleString() || 'Not available'}
Mean Annual Wage: $${blsData.mean_wage?.toLocaleString() || 'Not available'}
Wage Percentiles:
  10th: $${blsData.wage_percentiles.p10?.toLocaleString() || 'N/A'}
  25th: $${blsData.wage_percentiles.p25?.toLocaleString() || 'N/A'}
  75th: $${blsData.wage_percentiles.p75?.toLocaleString() || 'N/A'}
  90th: $${blsData.wage_percentiles.p90?.toLocaleString() || 'N/A'}
Source: ${blsData.source_url}
` : ''}
${onetData ? `
═══════════════════════════════════════════════════════════
REAL DATA FROM O*NET (Occupational Standards):
═══════════════════════════════════════════════════════════

O*NET Code: ${onetData.code}
Occupation Title: ${onetData.title}
Description: ${onetData.description}

Core Skills (Level 4-5):
${onetData.skills.filter(s => s.scale_value >= 4).map(s => `- ${s.element_name} (Level ${s.scale_value}/5)`).join('\n')}

Knowledge Areas (Level 4-5):
${onetData.knowledge.filter(k => k.scale_value >= 4).map(k => `- ${k.element_name} (Level ${k.scale_value}/5)`).join('\n')}

Technology Requirements:
${onetData.technology.slice(0, 10).map(t => `- ${t.example}${t.hot_technology ? ' (HOT)' : ''}`).join('\n')}

Education Typical: ${onetData.education}
` : '(O*NET occupation code not found - analysis will rely on job posting data)'}

═══════════════════════════════════════════════════════════
YOUR ANALYSIS TASK (THIS IS A $7,500 CONSULTING ENGAGEMENT):
═══════════════════════════════════════════════════════════

Provide a COMPREHENSIVE labor market analysis of 3,000-4,000 words with the following structure:

## 1. LABOR MARKET ANALYSIS (1,000+ words)

### Current Job Openings
- Total count in region with breakdown by employer type (hospital, retail, specialty)
- Geographic distribution (which cities/counties have most openings)
- Job posting trends (increasing, stable, declining over last 6-12 months)
- Seasonal patterns if applicable

### Wage Analysis
- Entry-level range with specific employer examples ("CVS: $15-17/hr, Hospital systems: $17-21/hr")
- Mid-career progression (3-5 years experience)
- Senior/specialized roles (lead tech, specialty pharmacy)
- Comparison to similar occupations (e.g., medical assistant, dental assistant)
- Regional wage differences (metro vs rural, state comparisons)
- Percentile distribution (10th, 25th, median, 75th, 90th from BLS if available)
- 5-year wage trend analysis

### Supply/Demand Modeling
- Annual job openings in region (calculate from turnover rate + growth)
- Current program completers supplying the market (list competing programs with annual graduates)
- Supply-demand ratio: Are we oversupplying or undersupplying?
- Evidence: "40 annual openings, 3 programs producing 35 graduates = potential saturation"

### Automation/Displacement Risk
- Specific technologies impacting the role (e.g., automated dispensing systems, telepharmacy)
- Tasks most at risk of automation
- Tasks that remain human-dependent
- Net employment impact (offsetting factors like aging population, increased medication use)

### Career Pathway Analysis
- Entry requirements (education, certification, experience)
- Typical progression: Entry → Senior → Specialist → Management
- Timeline for advancement
- Lateral move opportunities (other healthcare roles, pharmacy school)
- Long-term viability (is this a 5-year job or a 20-year career?)

## 2. EMPLOYER LANDSCAPE DEEP DIVE (800+ words)

### Top 10 Employers by Hiring Volume
For each employer, provide:
- Name and type (hospital system, retail chain, specialty)
- Estimated annual hires (based on job posting frequency)
- Starting wage range
- Typical requirements (PTCB, state license, experience)
- Work environment (shift patterns, full-time vs part-time)

### Hiring Practices
- Application process (online portals, referrals, on-site applications)
- Typical interview process
- Common requirements beyond certification (customer service, bilingual, computer skills)
- Deal-breakers (background check issues, gaps in employment)

### Retention Data
- Average tenure in role (if available)
- Turnover rates by employer type
- Common reasons for leaving (better pay elsewhere, burnout, career change)
- Promotion opportunities

### Workplace Conditions
- Shift patterns (day/evening/night, weekends, holidays)
- Physical demands (standing, lifting, repetitive tasks)
- Work environment quality (modern facilities, adequate staffing)
- Job satisfaction indicators

## 3. SKILLS & COMPETENCIES BREAKDOWN (600+ words)

### Most-Requested Skills with Frequency Data
Analyze 50-100+ job postings and rank skills by frequency:
- Top 20 technical skills (e.g., "inventory management: 87%", "prescription processing: 95%")
- Top 15 soft skills (e.g., "customer service: 78%", "attention to detail: 92%")
- Technology requirements (specific software: "QS/1: 34%", "PrimeRx: 21%")

### O*NET Alignment Analysis
- Which O*NET skills match market demand? (list with evidence)
- Which market-demanded skills are missing from O*NET? (emerging competencies)
- Skill gaps that programs should address

### Certification Requirements
- PTCB Certification: Required vs. preferred (% of postings)
- State pharmacy technician license: Required in all cases
- Specialized certifications (sterile compounding, chemotherapy, etc.)
- Certification pass rates and exam difficulty

### Technology Requirements
- Pharmacy management software (specific brands mentioned in postings)
- Insurance/billing systems
- Automated dispensing systems
- Electronic health records

## 4. FIVE-YEAR MARKET FORECAST (500+ words)

### BLS Employment Projections
- National occupation growth rate (cite specific BLS projection)
- Regional factors that may increase or decrease that rate
- Absolute number of projected annual openings

### Industry Trends Affecting Demand
- Aging population demographics (quantify: "65+ population in region growing X% annually")
- Healthcare utilization trends (prescription volume increasing/decreasing)
- Retail pharmacy consolidation (CVS/Walgreens store closures vs openings)
- Hospital pharmacy expansion (24-hour pharmacies, telepharmacy, specialty services)
- Regulatory changes (scope of practice expansions, reimbursement changes)

### Risk Factors That Could Reduce Demand
- Automation accelerating faster than predicted
- Economic downturn reducing healthcare utilization
- Policy changes (Medicare reimbursement cuts affecting pharmacy economics)
- Competition from alternative models (mail-order pharmacy, vending machines)

### Offsetting Factors Supporting Demand
- Aging population and chronic disease growth
- Pharmacy services expanding (vaccinations, point-of-care testing, medication therapy management)
- Shortage of pharmacists leading to greater reliance on techs
- Healthcare access expansion

## 5. COMPETITIVE PROGRAM SUPPLY ANALYSIS (400+ words)

### List All Competing Programs Within 100-Mile Radius
For each program:
- Institution name and location
- Program length and format (full-time, part-time, hybrid, online)
- Annual enrollment capacity
- Estimated completers per year (if public data available, otherwise estimate)
- Tuition cost
- ASHP/ACPE accreditation status
- Notable strengths (clinical partnerships, job placement rate)

### Market Saturation Calculation
- Total annual program completers in region: X
- Total annual job openings in region: Y
- Saturation ratio: X/Y
- Analysis: Undersupplied (ratio <0.8), balanced (0.8-1.2), oversupplied (>1.2)

### Program Discontinuations (Last 5 Years)
- Any programs shut down? When and why? (cite specific sources if available)
- Market lessons: What does this tell us about demand?

## SCORING & RECOMMENDATIONS

### Score: X/10
**Rationale:** [One sentence explaining the score based on comprehensive analysis above]

### Strategic Recommendations (5-7 recommendations)
1. [Specific, actionable recommendation with justification]
2. [...]

═══════════════════════════════════════════════════════════
OUTPUT FORMAT REQUIREMENTS:
═══════════════════════════════════════════════════════════

- Start with: SCORE: X/10 | RATIONALE: [one sentence]
- Then provide your full analysis following the structure above
- Use markdown headers (##, ###) for structure
- Include detailed tables where specified
- Cite specific numbers: "347 current openings" not "strong demand"
- Identify data gaps honestly: "BLS data unavailable for this occupation code"
- Cross-reference sources: "Job posting data shows X, O*NET standards indicate Y"
- **Target length:** 3,000-4,000 words (this is consulting-grade work)

CRITICAL:
- You are analyzing REAL data from APIs, not making predictions
- Every claim must be backed by data provided above or explicitly labeled as estimate/inference
- If data is missing or APIs failed, state it clearly: "Live job data unavailable due to API failure"
- Be specific about employers, wages, and requirements
- Provide actionable insights, not generic observations`;

    // 5. Call Claude for analysis
    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 16000,
    });

    // 6. Parse recommendations
    const recommendationsMatch = content.match(/(?:recommendations?|strategic insights?)[\s\S]*?(\d+\.[\s\S]*?)(?=\n\n|$)/i);
    const recommendations = recommendationsMatch
      ? recommendationsMatch[1]
          .split(/\n\d+\./)
          .slice(1)
          .map(r => r.trim())
      : [];

    // Extract score from first line
    const scoreMatch = content.match(/SCORE:\s*(\d+(?:\.\d+)?)\s*\/\s*10\s*\|\s*RATIONALE:\s*(.+)/i);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;
    const scoreRationale = scoreMatch ? scoreMatch[2].trim() : null;

    const data: MarketAnalysisData = {
      score: score ?? undefined,
      scoreRationale: scoreRationale ?? undefined,
      live_jobs: liveJobsData || { count: 0, salaries: {}, topEmployers: [], requiredSkills: [], certifications: [] },
      onet_data: onetData ? {
        code: onetData.code,
        title: onetData.title,
        description: onetData.description,
        skills: onetData.skills.filter(s => s.scale_value >= 4),
        knowledge: onetData.knowledge.filter(k => k.scale_value >= 4),
      } : null,
      recommendations,
    };

    // 7. Generate markdown
    const markdown = formatMarketAnalysis(data, project, content);

    // 8. Log session
    const duration = Date.now() - startTime;
    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'market-analyst',
      persona: 'market-analyst',
      prompt: prompt.substring(0, 5000),
      response: content.substring(0, 10000),
      tokens_used: tokensUsed,
      duration_ms: duration,
      status: 'success',
    });

    console.log(`[Market Analyst] Completed in ${duration}ms`);

    return { data, markdown };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Market Analyst] Error:', error);

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'market-analyst',
      persona: 'market-analyst',
      duration_ms: duration,
      status: 'error',
      error_message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

function formatMarketAnalysis(
  data: MarketAnalysisData,
  project: ValidationProject,
  aiAnalysis: string
): string {
  return `# Market Analysis: ${project.program_name}

## Current Market Conditions

**Analysis Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

### Job Demand

**Current Regional Openings:** ${data.live_jobs.count}  
*Source: Google Jobs via SerpAPI*

### Salary Ranges

| Level | Salary Range |
|-------|-------------|
| Entry-Level | ${data.live_jobs.salaries.ranges.entry} |
| Mid-Career | ${data.live_jobs.salaries.ranges.mid} |
| Senior | ${data.live_jobs.salaries.ranges.senior} |
| **Median** | **$${data.live_jobs.salaries.median.toLocaleString()}** |

*Source: Analysis of ${data.live_jobs.count} current job postings (Google Jobs, ${new Date().toLocaleDateString()})*

### Top Employers Hiring

${data.live_jobs.topEmployers.map((e, i) => `${i + 1}. **${e.name}** - ${e.openings} openings`).join('\n')}

### Most Requested Skills

${data.live_jobs.requiredSkills.map(s => `- **${s.skill}**: Mentioned in ${s.frequency}% of job postings`).join('\n')}

### Industry Certifications

${data.live_jobs.certifications.map(c => `- **${c.cert}**: Required/preferred in ${c.frequency}% of postings`).join('\n')}

${data.onet_data ? `
## Occupational Standards (O*NET)

**O*NET Code:** ${data.onet_data.code}  
**Title:** ${data.onet_data.title}

**Description:** ${data.onet_data.description}

### Core Competencies (Level 4-5)

**Skills:**
${data.onet_data.skills.map(s => `- ${s.element_name} (Level ${s.scale_value}/5)`).join('\n')}

**Knowledge Areas:**
${data.onet_data.knowledge.map(k => `- ${k.element_name} (Level ${k.scale_value}/5)`).join('\n')}

*Source: O*NET OnLine (${data.onet_data.code})*
` : ''}

## Strategic Analysis

${aiAnalysis}

## Recommendations

${data.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n\n')}

---

**Data Sources:**
- Google Jobs (via SerpAPI) - Live job postings as of ${new Date().toLocaleDateString()}
${data.onet_data ? `- O*NET OnLine - Occupational standards (${data.onet_data.code})` : ''}
- AI Analysis: Claude Sonnet 4.5 (Anthropic)
`;
}
