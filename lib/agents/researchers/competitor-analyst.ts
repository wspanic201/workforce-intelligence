import { loadPersona } from '@/lib/confluence-labs/loader';
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
    const persona = await loadPersona('research-director');

    const prompt = `${persona.fullContext}

TASK: Conduct competitive landscape analysis for a workforce program.

PROGRAM DETAILS:
- Program Name: ${project.program_name}
- Program Type: ${project.program_type || 'Not specified'}
- Target Audience: ${project.target_audience || 'Not specified'}
- Client: ${project.client_name}
${project.constraints ? `- Constraints: ${project.constraints}` : ''}

RESEARCH REQUIRED:
1. Identify 5-8 competing programs (community colleges, universities, bootcamps)
2. For each competitor, document:
   - Institution name
   - Program name
   - Format (online, in-person, hybrid)
   - Duration
   - Cost
   - Enrollment numbers (if available)
   - Unique features
3. Identify market gaps (what's NOT being offered)
4. Find differentiation opportunities
5. Assess competitive advantages we could have
6. Identify threats and challenges

OUTPUT FORMAT (JSON):
{
  "competitors": [
    {
      "institution": "College Name",
      "program_name": "Program Name",
      "format": "online|in-person|hybrid",
      "duration": "X months/weeks",
      "cost": "$X,XXX",
      "enrollment": "X students" or null,
      "unique_features": ["Feature 1", "Feature 2"],
      "website": "URL" or null
    }
  ],
  "market_gaps": ["Gap 1", "Gap 2"],
  "differentiation_opportunities": ["Opp 1", "Opp 2"],
  "competitive_advantages": ["Advantage 1", "Advantage 2"],
  "threats": ["Threat 1", "Threat 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

CRITICAL REQUIREMENTS:
- Research real programs (search college websites, program catalogs)
- Cite specific institutions and programs
- Be honest about what information is publicly available
- Focus on regional competitors first, then national
- No hallucinations - only factual information

Respond with valid JSON wrapped in \`\`\`json code blocks.`;

    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 4000,
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
