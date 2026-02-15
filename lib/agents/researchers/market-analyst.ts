import { loadPersona } from '@/lib/confluence-labs/loader';
import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export interface MarketAnalysisData {
  job_demand: {
    current_openings?: number;
    demand_level: string;
    data_source: string;
    regional_concentration: string;
  };
  salary_ranges: {
    entry: string;
    mid: string;
    senior: string;
    data_source: string;
  };
  growth_projections: {
    five_year: string;
    outlook: string;
    data_source: string;
  };
  key_employers: string[];
  in_demand_skills: string[];
  certifications: string[];
  recommendations: string[];
}

export async function runMarketAnalysis(
  projectId: string,
  project: ValidationProject
): Promise<{ data: MarketAnalysisData; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    // Load persona
    const persona = await loadPersona('market-analyst');

    // Build prompt
    const prompt = `${persona.fullContext}

TASK: Conduct comprehensive labor market analysis for a workforce program.

PROGRAM DETAILS:
- Program Name: ${project.program_name}
- Program Type: ${project.program_type || 'Not specified'}
- Target Audience: ${project.target_audience || 'Not specified'}
- Client: ${project.client_name}
${project.constraints ? `- Constraints: ${project.constraints}` : ''}

RESEARCH REQUIRED:
1. Current job demand (search for real labor market data - BLS, O*NET, state labor departments)
2. Salary ranges (entry-level, mid-career, senior)
3. 5-year growth projections
4. Key employers hiring for these roles (in Iowa and nationally)
5. Most in-demand skills and competencies
6. Industry-recognized certifications

OUTPUT FORMAT (JSON):
{
  "job_demand": {
    "current_openings": <number or null if unavailable>,
    "demand_level": "high|medium|low",
    "data_source": "URL or source name",
    "regional_concentration": "Where jobs are concentrated"
  },
  "salary_ranges": {
    "entry": "$XX,XXX - $XX,XXX",
    "mid": "$XX,XXX - $XX,XXX",
    "senior": "$XX,XXX - $XX,XXX",
    "data_source": "URL or source name"
  },
  "growth_projections": {
    "five_year": "XX% growth",
    "outlook": "Bright|Good|Fair|Limited",
    "data_source": "URL or source name"
  },
  "key_employers": ["Company 1", "Company 2", ...],
  "in_demand_skills": ["Skill 1", "Skill 2", ...],
  "certifications": ["Cert 1", "Cert 2", ...],
  "recommendations": ["Key insight 1", "Key insight 2", ...]
}

CRITICAL REQUIREMENTS:
- Use REAL data sources (BLS.gov, O*NET Online, state labor market info)
- Cite specific URLs or sources
- Be honest about data limitations
- If you can't find specific data, say so
- No hallucinations - only factual information

Respond with valid JSON wrapped in \`\`\`json code blocks.`;

    // Call Claude
    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 4000,
    });

    // Extract JSON
    const data = extractJSON(content) as MarketAnalysisData;

    // Generate markdown section
    const markdown = formatMarketAnalysis(data, project);

    // Log session
    const duration = Date.now() - startTime;
    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'market-analyst',
      persona: 'market-analyst',
      prompt: prompt.substring(0, 5000), // Truncate for storage
      response: content.substring(0, 10000),
      tokens_used: tokensUsed,
      duration_ms: duration,
      status: 'success',
    });

    return { data, markdown };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Market analysis error:', error);

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

function formatMarketAnalysis(data: MarketAnalysisData, project: ValidationProject): string {
  return `# Market Analysis: ${project.program_name}

## Executive Summary

This market analysis evaluates the labor market demand, salary prospects, and growth outlook for ${project.program_name}.

## Job Demand

**Current Market Conditions:** ${data.job_demand.demand_level} demand

${data.job_demand.current_openings ? `- Estimated Current Openings: ${data.job_demand.current_openings}` : ''}
- Regional Concentration: ${data.job_demand.regional_concentration}
- Data Source: ${data.job_demand.data_source}

## Salary Ranges

| Level | Salary Range |
|-------|-------------|
| Entry-Level | ${data.salary_ranges.entry} |
| Mid-Career | ${data.salary_ranges.mid} |
| Senior | ${data.salary_ranges.senior} |

*Source: ${data.salary_ranges.data_source}*

## Growth Projections

**5-Year Outlook:** ${data.growth_projections.outlook}

- Projected Growth: ${data.growth_projections.five_year}
- Source: ${data.growth_projections.data_source}

## Key Employers

The following organizations are actively hiring for these roles:

${data.key_employers.map(emp => `- ${emp}`).join('\n')}

## In-Demand Skills

${data.in_demand_skills.map(skill => `- ${skill}`).join('\n')}

## Industry Certifications

${data.certifications.map(cert => `- ${cert}`).join('\n')}

## Recommendations

${data.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
*This analysis was conducted using publicly available labor market data and industry research.*
`;
}
