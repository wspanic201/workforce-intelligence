import { loadMultiplePersonas } from '@/lib/confluence-labs/loader';
import { callClaude } from '@/lib/ai/anthropic';
import { ValidationProject, ResearchComponent } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export interface TigerTeamSynthesis {
  recommendation: 'go' | 'no-go' | 'conditional';
  confidence_level: 'high' | 'medium' | 'low';
  executive_summary: string;
  key_findings: string[];
  critical_success_factors: string[];
  top_risks: {
    risk: string;
    mitigation: string;
  }[];
  market_fit_assessment: string;
  financial_viability_assessment: string;
  implementation_feasibility_assessment: string;
  go_to_market_assessment: string;
  next_steps: string[];
}

export async function runTigerTeam(
  projectId: string,
  project: ValidationProject,
  researchComponents: ResearchComponent[]
): Promise<{ synthesis: TigerTeamSynthesis; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    // Load tiger team personas
    const personas = await loadMultiplePersonas([
      'product-manager',
      'cfo',
      'cmo',
      'coo',
    ]);

    // Compile all research findings
    const researchSummary = researchComponents
      .map(comp => {
        return `## ${comp.component_type.replace(/_/g, ' ').toUpperCase()}\n\n${comp.markdown_output || JSON.stringify(comp.content, null, 2)}`;
      })
      .join('\n\n---\n\n');

    const prompt = `You are conducting a TIGER TEAM REVIEW - a multi-perspective executive debate to determine if this workforce program should be launched.

CONTEXT:
Program: ${project.program_name}
Client: ${project.client_name}
Type: ${project.program_type || 'Not specified'}
Target Audience: ${project.target_audience || 'Not specified'}

PERSONAS IN THE ROOM:

${personas.map(p => `**${p.name}** (${p.division})`).join('\n')}

RESEARCH FINDINGS:

${researchSummary}

YOUR TASK:

Simulate a rigorous executive debate where each persona challenges the program from their perspective:

1. **Product Manager:** Does this have market fit? Will students actually enroll?
2. **CFO (${personas.find(p => p.slug === 'cfo')?.name}):** Is this financially viable? What are the risks?
3. **CMO (${personas.find(p => p.slug === 'cmo')?.name}):** Can we market this? Is there a compelling story?
4. **COO (${personas.find(p => p.slug === 'coo')?.name}):** Can we actually implement this? Do we have the capacity?

DEBATE STRUCTURE:
- Identify the STRONGEST arguments FOR launching
- Identify the BIGGEST risks and red flags
- Challenge key assumptions (what could be wrong?)
- Find gaps in the research
- Reach a consensus recommendation

DELIVERABLES (respond in markdown format):

# Executive Summary
[3-5 paragraph synthesis]

# Recommendation
**Decision:** GO / NO-GO / CONDITIONAL GO
**Confidence Level:** High / Medium / Low
**Rationale:** [Why?]

# Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]
4. [Finding 4]
5. [Finding 5]

# Critical Success Factors
What MUST be true for this program to succeed:
1. [CSF 1]
2. [CSF 2]
3. [CSF 3]

# Top Risks & Mitigation Strategies

## Risk 1: [Risk Name]
**Mitigation:** [How to address]

## Risk 2: [Risk Name]
**Mitigation:** [How to address]

## Risk 3: [Risk Name]
**Mitigation:** [How to address]

# Perspective Assessments

## Market Fit (Product Manager)
[Assessment]

## Financial Viability (CFO)
[Assessment]

## Go-to-Market (CMO)
[Assessment]

## Implementation Feasibility (COO)
[Assessment]

# Next Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

---

CRITICAL REQUIREMENTS:
- Be brutally honest - this client is paying $10k for TRUTH, not cheerleading
- Challenge assumptions aggressively
- If data is weak, say so
- If the program looks risky, recommend NO-GO
- Only recommend GO if you genuinely believe it will succeed
- Remember: colleges have limited resources - a bad program hurts students AND the institution

Respond with the complete markdown document above.`;

    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 6000,
      temperature: 1.0,
    });

    // Parse the synthesis from markdown
    const synthesis = parseSynthesis(content);
    const markdown = content;

    const duration = Date.now() - startTime;
    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'tiger-team',
      persona: 'multi-persona',
      prompt: prompt.substring(0, 5000),
      response: content.substring(0, 10000),
      tokens_used: tokensUsed,
      duration_ms: duration,
      status: 'success',
    });

    return { synthesis, markdown };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Tiger team error:', error);

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'tiger-team',
      persona: 'multi-persona',
      duration_ms: duration,
      status: 'error',
      error_message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

function parseSynthesis(markdown: string): TigerTeamSynthesis {
  // Extract key information from markdown
  // This is a simple parser - could be made more robust

  const recommendationMatch = markdown.match(/\*\*Decision:\*\*\s*(GO|NO-GO|CONDITIONAL)/i);
  const recommendation = recommendationMatch 
    ? (recommendationMatch[1].toLowerCase().replace(/\s+/g, '-') as 'go' | 'no-go' | 'conditional')
    : 'conditional';

  const confidenceMatch = markdown.match(/\*\*Confidence Level:\*\*\s*(High|Medium|Low)/i);
  const confidence_level = confidenceMatch 
    ? (confidenceMatch[1].toLowerCase() as 'high' | 'medium' | 'low')
    : 'medium';

  // Extract executive summary
  const execSummaryMatch = markdown.match(/# Executive Summary\s+([\s\S]*?)(?=\n#)/);
  const executive_summary = execSummaryMatch ? execSummaryMatch[1].trim() : '';

  // Extract key findings
  const findingsMatch = markdown.match(/# Key Findings\s+([\s\S]*?)(?=\n#)/);
  const key_findings: string[] = [];
  if (findingsMatch) {
    const findings = findingsMatch[1].match(/^\d+\.\s+(.+)$/gm);
    if (findings) {
      key_findings.push(...findings.map(f => f.replace(/^\d+\.\s+/, '')));
    }
  }

  // Extract critical success factors
  const csfMatch = markdown.match(/# Critical Success Factors[\s\S]*?\n([\s\S]*?)(?=\n#)/);
  const critical_success_factors: string[] = [];
  if (csfMatch) {
    const csfs = csfMatch[1].match(/^\d+\.\s+(.+)$/gm);
    if (csfs) {
      critical_success_factors.push(...csfs.map(c => c.replace(/^\d+\.\s+/, '')));
    }
  }

  // Extract risks
  const risksSection = markdown.match(/# Top Risks & Mitigation Strategies\s+([\s\S]*?)(?=\n# )/);
  const top_risks: { risk: string; mitigation: string }[] = [];
  if (risksSection) {
    const riskBlocks = risksSection[1].match(/## Risk \d+: (.+?)\n\*\*Mitigation:\*\* (.+?)(?=\n\n|$)/g);
    if (riskBlocks) {
      riskBlocks.forEach(block => {
        const match = block.match(/## Risk \d+: (.+?)\n\*\*Mitigation:\*\* (.+)/);
        if (match) {
          top_risks.push({
            risk: match[1].trim(),
            mitigation: match[2].trim(),
          });
        }
      });
    }
  }

  // Extract assessments
  const marketFitMatch = markdown.match(/## Market Fit.*?\n([\s\S]*?)(?=\n##)/);
  const market_fit_assessment = marketFitMatch ? marketFitMatch[1].trim() : '';

  const financialMatch = markdown.match(/## Financial Viability.*?\n([\s\S]*?)(?=\n##)/);
  const financial_viability_assessment = financialMatch ? financialMatch[1].trim() : '';

  const gotoMarketMatch = markdown.match(/## Go-to-Market.*?\n([\s\S]*?)(?=\n##)/);
  const go_to_market_assessment = gotoMarketMatch ? gotoMarketMatch[1].trim() : '';

  const implMatch = markdown.match(/## Implementation Feasibility.*?\n([\s\S]*?)(?=\n#)/);
  const implementation_feasibility_assessment = implMatch ? implMatch[1].trim() : '';

  // Extract next steps
  const stepsMatch = markdown.match(/# Next Steps\s+([\s\S]*?)(?=\n---|$)/);
  const next_steps: string[] = [];
  if (stepsMatch) {
    const steps = stepsMatch[1].match(/^\d+\.\s+(.+)$/gm);
    if (steps) {
      next_steps.push(...steps.map(s => s.replace(/^\d+\.\s+/, '')));
    }
  }

  return {
    recommendation,
    confidence_level,
    executive_summary,
    key_findings,
    critical_success_factors,
    top_risks,
    market_fit_assessment,
    financial_viability_assessment,
    implementation_feasibility_assessment,
    go_to_market_assessment,
    next_steps,
  };
}
