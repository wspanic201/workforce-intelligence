import { loadPersona } from '@/lib/confluence-labs/loader';
import { callClaude } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { searchGoogleJobs } from '@/lib/apis/serpapi';
import { searchONET, getONETCompetencies } from '@/lib/apis/onet';
import { withCache } from '@/lib/apis/cache';
import { getBLSData } from '@/lib/apis/bls';
import { fetchONETOnline, searchJobsBrave } from '@/lib/apis/web-fallbacks';
import { findSOCCode, onetToSOC, isValidSOCCode, getSOCTitle } from '@/lib/mappings/soc-codes';
// Intelligence context is injected by orchestrator via (project as any)._intelContext

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

    // 1. Resolve occupation and SOC code with validation
    const rawLocation = (project as any).geographic_area || 'United States';
    const serpApiLocation = cleanLocationForSerpAPI(rawLocation);
    
    // Extract occupation name (strip program qualifiers like "Certificate", "Diploma")
    const targetOccupation = (project as any).target_occupation || 
      project.program_name.replace(/\s*(certificate|diploma|degree|program|associate|bachelor|training|course)/gi, '').trim();
    
    // Step 1: Try to find SOC code using our validated mapping
    let resolvedSOC = (project as any).soc_codes || '';
    let socSource = 'project';
    
    if (!resolvedSOC || !isValidSOCCode(resolvedSOC)) {
      console.log(`[Market Analyst] No valid SOC code in project, searching mapping for "${targetOccupation}"`);
      const mapped = findSOCCode(targetOccupation);
      if (mapped) {
        resolvedSOC = mapped.code;
        socSource = 'mapping';
        console.log(`[Market Analyst] ✓ Mapped "${targetOccupation}" → SOC ${resolvedSOC} (${mapped.title})`);
      }
    }
    
    // Step 2: If still no SOC code, fall back to O*NET search
    let onetCode = resolvedSOC;
    if (!resolvedSOC) {
      console.log(`[Market Analyst] No mapping found, searching O*NET for "${project.program_name}"`);
      onetCode = await withCache(
        'onet_search',
        { keyword: project.program_name },
        () => searchONET(project.program_name),
        720
      ).catch((err) => { 
        console.warn('[Market Analyst] O*NET search failed:', err.message); 
        return null; 
      });
      
      if (onetCode) {
        resolvedSOC = onetToSOC(onetCode);
        socSource = 'onet';
        console.log(`[Market Analyst] ✓ O*NET found: ${onetCode} → SOC ${resolvedSOC}`);
      }
    }
    
    // Validate final SOC code
    if (resolvedSOC && isValidSOCCode(resolvedSOC)) {
      const socTitle = getSOCTitle(resolvedSOC);
      console.log(`[Market Analyst] Using SOC ${resolvedSOC} (${socTitle || 'title unknown'}) from ${socSource}`);
    } else {
      console.warn(`[Market Analyst] ⚠️  No valid SOC code found for "${targetOccupation}" — BLS data unavailable`);
    }
    
    // Step 2.5: Get Verified Intelligence (from shared context or fetch fresh)
    const sharedContext = (project as any)._intelContext;
    const verifiedPromptBlock = sharedContext?.promptBlock || '';
    if (sharedContext) {
      console.log(`[Market Analyst] Using shared intelligence context (${sharedContext.tablesUsed.length} sources)`);
    }

    // Step 3: Fetch live jobs data
    const liveJobsDataResult = await withCache(
      'serpapi_jobs',
      { occupation: targetOccupation, location: serpApiLocation },
      () => searchGoogleJobs(targetOccupation, serpApiLocation),
      168 // Cache for 7 days
    ).catch((err) => { 
      console.warn('[Market Analyst] SerpAPI failed, continuing without live jobs:', err.message); 
      return null; 
    });

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

    // Step 4: Get wage/employment data from BLS API using validated SOC code
    let blsData = null;
    if (resolvedSOC && isValidSOCCode(resolvedSOC)) {
      blsData = await getBLSData(resolvedSOC).catch((err) => {
        console.warn(`[Market Analyst] BLS API failed for SOC ${resolvedSOC}:`, err.message);
        return null;
      });
      
      if (blsData && (blsData.median_wage || blsData.employment_total)) {
        console.log(`[Market Analyst] ✓ BLS data (SOC ${resolvedSOC}): employment=${blsData.employment_total?.toLocaleString()}, median=$${blsData.median_wage?.toLocaleString()}`);
      } else {
        console.warn(`[Market Analyst] BLS API returned no data for SOC ${resolvedSOC}`);
        blsData = null;
      }
    } else {
      console.warn('[Market Analyst] No valid SOC code — skipping BLS data fetch');
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
the occupation${resolvedSOC ? ` (SOC ${resolvedSOC}: ${getSOCTitle(resolvedSOC)})` : ''} to provide
a comprehensive labor market analysis for ${rawLocation}.
═══════════════════════════════════════════════════════════`;

    const prompt = `${persona.name}

TASK: Analyze labor market data and provide strategic insights.

PROGRAM: ${project.program_name}
CLIENT: ${project.client_name}
TYPE: ${project.program_type || 'Not specified'}
AUDIENCE: ${project.target_audience || 'Not specified'}
OCCUPATION: ${targetOccupation}
REGION: ${rawLocation}
SOC CODE: ${resolvedSOC || 'Not found'} ${resolvedSOC ? `(${getSOCTitle(resolvedSOC) || 'validated'}, source: ${socSource})` : ''}
${verifiedPromptBlock}
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
Source: ${blsData.source || 'BLS OEWS'}
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
ANALYSIS TASK:
═══════════════════════════════════════════════════════════

Write a consulting-grade labor market analysis. Start with SCORE: X/10 | RATIONALE: [one sentence].

Cover these sections using the REAL data above:
1. **Labor Market Overview** — job openings, wage analysis (entry/mid/senior with BLS percentiles), supply/demand balance, automation risk
2. **Employer Landscape** — top employers hiring, sectors, typical requirements, retention patterns
3. **Skills & Certifications** — most-requested skills from postings, O*NET alignment, certification requirements
4. **5-Year Forecast** — BLS projections, industry trends, risk factors
5. **Competitive Programs** — competing programs in region, market saturation ratio
6. **Recommendations** — 5-7 specific, actionable recommendations

CRITICAL: Contextualize demand with macro drivers when relevant. Don't just say "demand is up 15%" — explain WHY:
- **Reshoring/Nearshoring:** Manufacturing returning from China/Mexico → domestic production labor needs
- **Immigration Policy:** Restricted immigration → structural labor shortages in traditionally immigrant-heavy occupations
- **Federal Spending:** Infrastructure bills, CHIPS Act, IRA → construction, semiconductor, clean energy jobs
- **Workforce Pell Expansion:** Federal policy shift making short-term credentials financially accessible
- **Regulatory Changes:** New licensing requirements, scope of practice expansions

Example (Good): "Pharmacy tech demand is up 18% — driven by nationwide pharmacy staffing crisis compounded by immigration restrictions that previously filled these roles with H-1B visa holders."
Example (Bad): "Pharmacy tech demand is strong and growing."

Make it strategic, not just descriptive. Connect local data to national/policy trends.

GO BEYOND THE DATA PROVIDED. The verified intelligence data gives you the baseline. Now investigate:
- Search for actual current job postings in the specific region. Name the employers.
- Look for industry trend reports, workforce development news, policy changes affecting this occupation.
- Check if major employers in the area have announced expansions, closures, or hiring freezes.
- If something doesn't add up (like AWS being listed as a pharmacy tech skill), call it out and investigate why.

Write with authority. You're not summarizing a database — you're telling the client whether the labor market supports their investment.

Rules:
- Cite specific numbers from the data above (not vague claims)
- If data is missing, say so — don't fabricate
- Be specific about employers, wages, and regional factors
- Use markdown headers for structure

LENGTH: 800–1,200 words. Every sentence earns its space.`;

    // 5. Call Claude for analysis
    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 4000,  // 4k tokens ≈ 1,500 words — balanced depth vs API speed
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
