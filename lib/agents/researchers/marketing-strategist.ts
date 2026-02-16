import { loadPersona } from '@/lib/confluence-labs/loader';
import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export interface MarketingStrategyData {
  target_audiences: {
    primary: {
      description: string;
      demographics: string;
      motivations: string[];
      pain_points: string[];
    };
    secondary?: {
      description: string;
      demographics: string;
      motivations: string[];
      pain_points: string[];
    };
  };
  value_proposition: {
    headline: string;
    key_benefits: string[];
    differentiators: string[];
  };
  marketing_channels: {
    channel: string;
    strategy: string;
    estimated_cost: string;
    expected_reach: string;
  }[];
  partnerships: {
    partner_type: string;
    value: string;
    approach: string;
  }[];
  messaging_framework: {
    awareness_stage: string[];
    consideration_stage: string[];
    decision_stage: string[];
  };
  launch_campaign: {
    timeline: string;
    key_activities: string[];
    budget_estimate: string;
  };
  success_metrics: string[];
  recommendations: string[];
}

export async function runMarketingStrategy(
  projectId: string,
  project: ValidationProject
): Promise<{ data: MarketingStrategyData; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    const persona = await loadPersona('cmo');

    const prompt = `${persona.fullContext}

TASK: Develop a comprehensive marketing strategy for a workforce program launch.

PROGRAM DETAILS:
- Program Name: ${project.program_name}
- Program Type: ${project.program_type || 'Not specified'}
- Target Audience: ${project.target_audience || 'Not specified'}
- Client: ${project.client_name}
${project.constraints ? `- Constraints: ${project.constraints}` : ''}

MARKETING STRATEGY REQUIRED:
1. Define target audiences (primary and secondary)
2. Craft value proposition
3. Identify marketing channels (digital, traditional, partnerships)
4. Develop messaging framework (awareness → decision)
5. Plan launch campaign
6. Define success metrics
7. Budget recommendations

OUTPUT FORMAT (JSON):
{
  "target_audiences": {
    "primary": {
      "description": "Who they are",
      "demographics": "Age, employment status, education",
      "motivations": ["Motivation 1", "Motivation 2"],
      "pain_points": ["Pain 1", "Pain 2"]
    },
    "secondary": { ...same structure... }
  },
  "value_proposition": {
    "headline": "One compelling sentence",
    "key_benefits": ["Benefit 1", "Benefit 2"],
    "differentiators": ["What makes us different 1", "Different 2"]
  },
  "marketing_channels": [
    {
      "channel": "Channel name",
      "strategy": "How we'll use it",
      "estimated_cost": "$X,XXX",
      "expected_reach": "X people"
    }
  ],
  "partnerships": [
    {
      "partner_type": "Employers, workforce boards, etc.",
      "value": "What they bring",
      "approach": "How to engage them"
    }
  ],
  "messaging_framework": {
    "awareness_stage": ["Message 1", "Message 2"],
    "consideration_stage": ["Message 1", "Message 2"],
    "decision_stage": ["Message 1", "Message 2"]
  },
  "launch_campaign": {
    "timeline": "X months before launch",
    "key_activities": ["Activity 1", "Activity 2"],
    "budget_estimate": "$X,XXX"
  },
  "success_metrics": ["Metric 1", "Metric 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

CRITICAL REQUIREMENTS:
- Focus on practical, cost-effective tactics for community college context
- Emphasize employer partnerships and workforce connections
- Consider both credit-seeking students and incumbent workers
- Include digital and traditional channels
- Be realistic about budget constraints
- Align with enrollment goals

Respond with valid JSON wrapped in \`\`\`json code blocks.`;

    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 12000,
    });

    const data = extractJSON(content) as MarketingStrategyData;
    const markdown = formatMarketingStrategy(data, project);

    const duration = Date.now() - startTime;
    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'marketing-strategist',
      persona: 'cmo',
      prompt: prompt.substring(0, 5000),
      response: content.substring(0, 10000),
      tokens_used: tokensUsed,
      duration_ms: duration,
      status: 'success',
    });

    return { data, markdown };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Marketing strategy error:', error);

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'marketing-strategist',
      persona: 'cmo',
      duration_ms: duration,
      status: 'error',
      error_message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

function formatMarketingStrategy(data: MarketingStrategyData, project: ValidationProject): string {
  return `# Marketing Strategy: ${project.program_name}

## Target Audiences

### Primary Audience

**${data.target_audiences.primary.description}**

- **Demographics:** ${data.target_audiences.primary.demographics}

**Motivations:**
${data.target_audiences.primary.motivations.map(m => `- ${m}`).join('\n')}

**Pain Points:**
${data.target_audiences.primary.pain_points.map(p => `- ${p}`).join('\n')}

${data.target_audiences.secondary ? `
### Secondary Audience

**${data.target_audiences.secondary.description}**

- **Demographics:** ${data.target_audiences.secondary.demographics}

**Motivations:**
${data.target_audiences.secondary.motivations.map(m => `- ${m}`).join('\n')}

**Pain Points:**
${data.target_audiences.secondary.pain_points.map(p => `- ${p}`).join('\n')}
` : ''}

## Value Proposition

### ${data.value_proposition.headline}

**Key Benefits:**
${data.value_proposition.key_benefits.map(b => `- ${b}`).join('\n')}

**What Makes Us Different:**
${data.value_proposition.differentiators.map(d => `- ${d}`).join('\n')}

## Marketing Channels

${data.marketing_channels.map(ch => `
### ${ch.channel}

**Strategy:** ${ch.strategy}

- **Estimated Cost:** ${ch.estimated_cost}
- **Expected Reach:** ${ch.expected_reach}
`).join('\n')}

## Strategic Partnerships

${data.partnerships.map(p => `
### ${p.partner_type}

**Value:** ${p.value}

**Engagement Approach:** ${p.approach}
`).join('\n')}

## Messaging Framework

### Awareness Stage
${data.messaging_framework.awareness_stage.map(m => `- ${m}`).join('\n')}

### Consideration Stage
${data.messaging_framework.consideration_stage.map(m => `- ${m}`).join('\n')}

### Decision Stage
${data.messaging_framework.decision_stage.map(m => `- ${m}`).join('\n')}

## Launch Campaign

**Timeline:** ${data.launch_campaign.timeline}

**Budget:** ${data.launch_campaign.budget_estimate}

**Key Activities:**
${data.launch_campaign.key_activities.map((a, i) => `${i + 1}. ${a}`).join('\n')}

## Success Metrics

${data.success_metrics.map(m => `- ${m}`).join('\n')}

## Marketing Recommendations

${data.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
*This marketing strategy is designed for cost-effective enrollment growth.*
`;
}
