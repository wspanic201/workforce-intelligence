import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { PROGRAM_VALIDATOR_SYSTEM_PROMPT } from '@/lib/prompts/program-validator';

export interface LearnerDemandData {
  score: number;
  scoreRationale: string;
  targetPopulation: {
    estimatedSize: number;
    primarySegments: string[];
    demographics: string;
  };
  learnerMotivation: {
    primaryDrivers: string[];
    careerOutcomes: string[];
    urgencyLevel: 'high' | 'moderate' | 'low';
  };
  barriers: {
    financial: string[];
    logistical: string[];
    awareness: string[];
    mitigationStrategies: string[];
  };
  enrollmentProjection: {
    estimatedPerCohort: number;
    annualCohorts: number;
    conversionRate: number;
    benchmarkSource: string;
  };
  seasonality: string[];
  marketingReach: {
    channels: string[];
    estimatedCost: string;
    expectedInquiries: number;
  };
  peerBenchmarks: {
    institution: string;
    program: string;
    enrollment: string;
  }[];
  dataSources: string[];
  markdownReport: string;
}

export async function runLearnerDemand(
  projectId: string,
  project: ValidationProject
): Promise<{ data: LearnerDemandData; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    console.log(`[Learner Demand] Starting for "${project.program_name}"`);

    const prompt = `${PROGRAM_VALIDATOR_SYSTEM_PROMPT}

ROLE: You are conducting Stage 3 — Target Learner Demand Assessment.

PROGRAM DETAILS:
- Program Name: ${project.program_name}
- Program Type: ${project.program_type || 'Not specified'}
- Target Audience: ${project.target_audience || 'Not specified'}
- Institution: ${project.client_name}
- Geographic Area: ${(project as any).geographic_area || 'the specified region'}
${project.constraints ? `- Constraints: ${project.constraints}` : ''}
${(project as any).delivery_format ? `- Delivery Format: ${(project as any).delivery_format}` : ''}
${(project as any).estimated_tuition ? `- Estimated Tuition: ${(project as any).estimated_tuition}` : ''}
${(project as any).target_learner_profile ? `- Learner Profile: ${(project as any).target_learner_profile}` : ''}

ANALYSIS REQUIRED:
1. Estimate target learner population size in the service area
2. Profile learner motivations (career changers, upskilling, unemployed, incumbent workers)
3. Identify barriers to enrollment (financial, logistical, awareness)
4. Research enrollment benchmarks from peer institutions offering similar programs
5. Assess seasonality and optimal launch timing
6. Estimate marketing reach and conversion funnel (CE benchmark: 10-20% inquiry-to-enrollment)
7. Project realistic enrollment per cohort

SCORING CRITERIA:
- Strong (8-10): Large pool, clear motivation, low barriers, 20+ per cohort achievable
- Moderate (5-7): Moderate pool, mixed motivation, 12-20 per cohort
- Weak (1-4): Small/hard-to-reach pool, <12 per cohort

OUTPUT FORMAT (JSON):
{
  "score": <1-10>,
  "scoreRationale": "Detailed explanation of score",
  "targetPopulation": {
    "estimatedSize": <number>,
    "primarySegments": ["Segment 1", "Segment 2"],
    "demographics": "Description"
  },
  "learnerMotivation": {
    "primaryDrivers": ["Driver 1", "Driver 2"],
    "careerOutcomes": ["Outcome 1", "Outcome 2"],
    "urgencyLevel": "high|moderate|low"
  },
  "barriers": {
    "financial": ["Barrier 1"],
    "logistical": ["Barrier 1"],
    "awareness": ["Barrier 1"],
    "mitigationStrategies": ["Strategy 1"]
  },
  "enrollmentProjection": {
    "estimatedPerCohort": <number>,
    "annualCohorts": <number>,
    "conversionRate": <decimal>,
    "benchmarkSource": "Source"
  },
  "seasonality": ["Note 1"],
  "marketingReach": {
    "channels": ["Channel 1"],
    "estimatedCost": "$X,XXX",
    "expectedInquiries": <number>
  },
  "peerBenchmarks": [
    { "institution": "Name", "program": "Program", "enrollment": "X per cohort" }
  ],
  "dataSources": ["Source 1"]
}

IMPORTANT: Return ONLY valid JSON. No markdown outside JSON. Keep string values concise. Do NOT include a markdownReport field. Be conservative in estimates.`;

    const { content, tokensUsed } = await callClaude(prompt, { maxTokens: 16000 });
    const data = extractJSON(content) as LearnerDemandData;

    // Generate markdown if not provided by AI
    if (!data.markdownReport) {
      data.markdownReport = formatLearnerDemand(data, project);
    }

    const markdown = data.markdownReport;
    const duration = Date.now() - startTime;

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'learner-demand',
      persona: 'learner-demand-analyst',
      prompt: prompt.substring(0, 5000),
      response: content.substring(0, 10000),
      tokens_used: tokensUsed,
      duration_ms: duration,
      status: 'success',
    });

    console.log(`[Learner Demand] Completed in ${duration}ms, score: ${data.score}/10`);
    return { data, markdown };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Learner Demand] Error:', error);

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'learner-demand',
      persona: 'learner-demand-analyst',
      duration_ms: duration,
      status: 'error',
      error_message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

function formatLearnerDemand(data: LearnerDemandData, project: ValidationProject): string {
  return `# Target Learner Demand Assessment: ${project.program_name}

## Dimension Score: ${data.score}/10
**Rationale:** ${data.scoreRationale}

## Target Population

**Estimated Pool Size:** ${data.targetPopulation.estimatedSize.toLocaleString()}

**Primary Segments:**
${data.targetPopulation.primarySegments.map(s => `- ${s}`).join('\n')}

**Demographics:** ${data.targetPopulation.demographics}

## Learner Motivation Profile

**Primary Drivers:**
${data.learnerMotivation.primaryDrivers.map(d => `- ${d}`).join('\n')}

**Career Outcomes:**
${data.learnerMotivation.careerOutcomes.map(o => `- ${o}`).join('\n')}

**Urgency Level:** ${data.learnerMotivation.urgencyLevel}

## Barriers to Enrollment

**Financial:** ${data.barriers.financial.map(b => `\n- ${b}`).join('')}
**Logistical:** ${data.barriers.logistical.map(b => `\n- ${b}`).join('')}
**Awareness:** ${data.barriers.awareness.map(b => `\n- ${b}`).join('')}

**Mitigation Strategies:**
${data.barriers.mitigationStrategies.map(s => `- ${s}`).join('\n')}

## Enrollment Projection

- **Estimated Per Cohort:** ${data.enrollmentProjection.estimatedPerCohort}
- **Annual Cohorts:** ${data.enrollmentProjection.annualCohorts}
- **Conversion Rate:** ${(data.enrollmentProjection.conversionRate * 100).toFixed(0)}%
- **Benchmark Source:** ${data.enrollmentProjection.benchmarkSource}

## Peer Benchmarks

${data.peerBenchmarks.map(p => `- **${p.institution}** — ${p.program}: ${p.enrollment}`).join('\n')}

## Seasonality

${data.seasonality.map(s => `- ${s}`).join('\n')}

## Marketing Reach

- **Channels:** ${data.marketingReach.channels.join(', ')}
- **Estimated Cost:** ${data.marketingReach.estimatedCost}
- **Expected Inquiries:** ${data.marketingReach.expectedInquiries}

---
**Data Sources:** ${data.dataSources.join('; ')}
`;
}
