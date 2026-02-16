import { loadPersona } from '@/lib/confluence-labs/loader';
import { callClaude } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { searchGoogleJobs } from '@/lib/apis/serpapi';
import { searchONET, getONETCompetencies } from '@/lib/apis/onet';
import { withCache } from '@/lib/apis/cache';

export interface MarketAnalysisData {
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
    const [liveJobsData, onetCode] = await Promise.all([
      withCache(
        'serpapi_jobs',
        { occupation: project.program_name, location: (project as any).geographic_area || 'United States' },
        () => searchGoogleJobs(project.program_name, (project as any).geographic_area || 'United States'),
        168 // Cache for 7 days
      ).catch((err) => { console.warn('[Market Analyst] SerpAPI failed, continuing without live jobs:', err.message); return null; }),
      withCache(
        'onet_search',
        { keyword: project.program_name },
        () => searchONET(project.program_name),
        720 // Cache for 30 days (O*NET changes slowly)
      ).catch((err) => { console.warn('[Market Analyst] O*NET failed, continuing without O*NET data:', err.message); return null; }),
    ]);

    // 2. Get O*NET competencies if code was found
    let onetData = null;
    if (onetCode) {
      onetData = await withCache(
        'onet_competencies',
        { code: onetCode },
        () => getONETCompetencies(onetCode),
        720
      );
    }

    console.log(`[Market Analyst] Data fetched - Jobs: ${liveJobsData.count}, O*NET: ${onetCode || 'not found'}`);

    // 3. Load persona
    const persona = await loadPersona('market-analyst');

    // 4. Build prompt with REAL data
    const prompt = `${persona.name}

TASK: Analyze this REAL labor market data and provide strategic insights.

PROGRAM: ${project.program_name}
CLIENT: ${project.client_name}
TYPE: ${project.program_type || 'Not specified'}
AUDIENCE: ${project.target_audience || 'Not specified'}

═══════════════════════════════════════════════════════════
REAL DATA FROM GOOGLE JOBS (SerpAPI - ${new Date().toLocaleDateString()}):
═══════════════════════════════════════════════════════════

Current Job Openings in Region: ${liveJobsData.count}

Salary Ranges (from actual job postings):
- Entry-Level: ${liveJobsData.salaries.ranges.entry}
- Mid-Career: ${liveJobsData.salaries.ranges.mid}
- Senior: ${liveJobsData.salaries.ranges.senior}
- Overall Range: $${liveJobsData.salaries.min.toLocaleString()} - $${liveJobsData.salaries.max.toLocaleString()}
- Median: $${liveJobsData.salaries.median.toLocaleString()}

Top Employers (by number of openings):
${liveJobsData.topEmployers.map((e, i) => `${i + 1}. ${e.name} (${e.openings} openings)`).join('\n')}

Most Requested Skills (% of job postings):
${liveJobsData.requiredSkills.map(s => `- ${s.skill}: ${s.frequency}%`).join('\n')}

Certifications Mentioned:
${liveJobsData.certifications.map(c => `- ${c.cert}: ${c.frequency}%`).join('\n')}

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
YOUR ANALYSIS TASK:
═══════════════════════════════════════════════════════════

Analyze this REAL data and provide:

1. **Market Demand Assessment** - Is demand strong, moderate, or weak? Evidence?
2. **Salary Competitiveness** - Are these salaries attractive to students? Comparison to similar roles?
3. **Employer Landscape** - Who's hiring? Any concentration risks?
4. **Skills Alignment** - Do the most-requested skills match O*NET? Any gaps?
5. **Career Viability** - Is this a sustainable career path for graduates?
6. **Recommendations** - 3-5 strategic recommendations based on this data

CRITICAL:
- You are analyzing REAL data, not making predictions
- Cite specific numbers: "347 current openings" not "strong demand"
- Identify data gaps honestly
- Cross-reference job postings with O*NET standards
- Be specific about what employers want

Provide 3-5 strategic recommendations for the client.`;

    // 5. Call Claude for analysis
    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 8000,
    });

    // 6. Parse recommendations
    const recommendationsMatch = content.match(/(?:recommendations?|strategic insights?)[\s\S]*?(\d+\.[\s\S]*?)(?=\n\n|$)/i);
    const recommendations = recommendationsMatch
      ? recommendationsMatch[1]
          .split(/\n\d+\./)
          .slice(1)
          .map(r => r.trim())
      : [];

    const data: MarketAnalysisData = {
      live_jobs: liveJobsData,
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
