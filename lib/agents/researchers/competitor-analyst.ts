import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export interface CompetitorProgram {
  institution: string;
  program_name: string;
  format: string;
  duration: string;
  cost: string;
  enrollment?: string;
  unique_features: string[];
  website?: string;
}

export interface CompetitiveAnalysisData {
  score: number;
  scoreRationale: string;
  competitors: CompetitorProgram[];
  market_gaps: string[];
  differentiation_opportunities: string[];
  competitive_advantages: string[];
  threats: string[];
  recommendations: string[];
}

export async function runCompetitiveAnalysis(
  projectId: string,
  project: ValidationProject
): Promise<{ data: CompetitiveAnalysisData; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    const prompt = `You are a competitive landscape analyst for workforce education programs.

Analyze the competitive landscape for this program and return ONLY valid JSON.

PROGRAM: ${project.program_name}
TYPE: ${project.program_type || 'Not specified'}
AUDIENCE: ${project.target_audience || 'Not specified'}
CLIENT: ${project.client_name}
${project.constraints ? `CONSTRAINTS: ${project.constraints}` : ''}

Identify 3-5 competing programs, market gaps, and differentiation opportunities.

SCORING: Rate the competitive landscape 1-10 for program viability.
8-10 = Few/weak competitors, strong differentiation potential
5-7 = Moderate competition, some differentiation possible
1-4 = Saturated market, difficult to differentiate

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation outside JSON. Keep values concise.

{
  "score": 7,
  "scoreRationale": "Brief explanation of competitive landscape score",
  "competitors": [
    {
      "institution": "College Name",
      "program_name": "Program Name",
      "format": "online or in-person or hybrid",
      "duration": "X months",
      "cost": "estimated cost",
      "unique_features": ["Feature 1"]
    }
  ],
  "market_gaps": ["Gap 1"],
  "differentiation_opportunities": ["Opp 1"],
  "competitive_advantages": ["Advantage 1"],
  "threats": ["Threat 1"],
  "recommendations": ["Recommendation 1"]
}`;

    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 8000,
    });

    const data = extractJSON(content) as CompetitiveAnalysisData;
    const markdown = formatCompetitiveAnalysis(data, project);

    const duration = Date.now() - startTime;
    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'competitor-analyst',
      persona: 'research-director',
      prompt: prompt.substring(0, 5000),
      response: content.substring(0, 10000),
      tokens_used: tokensUsed,
      duration_ms: duration,
      status: 'success',
    });

    return { data, markdown };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Competitive analysis error:', error);

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'competitor-analyst',
      persona: 'research-director',
      duration_ms: duration,
      status: 'error',
      error_message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

function formatCompetitiveAnalysis(data: CompetitiveAnalysisData, project: ValidationProject): string {
  return `# Competitive Landscape: ${project.program_name}

## Executive Summary

This analysis examines ${data.competitors.length} competing programs and identifies opportunities for differentiation.

## Competitor Programs

${data.competitors.map((comp, i) => `
### ${i + 1}. ${comp.institution} - ${comp.program_name}

- **Format:** ${comp.format}
- **Duration:** ${comp.duration}
- **Cost:** ${comp.cost}
${comp.enrollment ? `- **Enrollment:** ${comp.enrollment}` : ''}
${comp.website ? `- **Website:** ${comp.website}` : ''}

**Unique Features:**
${comp.unique_features.map(f => `- ${f}`).join('\n')}
`).join('\n')}

## Market Gaps

The following needs are not being adequately addressed by current offerings:

${data.market_gaps.map(gap => `- ${gap}`).join('\n')}

## Differentiation Opportunities

${data.differentiation_opportunities.map((opp, i) => `${i + 1}. ${opp}`).join('\n')}

## Competitive Advantages

${data.competitive_advantages.map(adv => `- ${adv}`).join('\n')}

## Threats & Challenges

${data.threats.map(threat => `- ${threat}`).join('\n')}

## Strategic Recommendations

${data.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
*This analysis is based on publicly available information as of ${new Date().toLocaleDateString()}.*
`;
}
