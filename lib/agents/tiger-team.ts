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

    const prompt = `You are Wavelength's senior advisory team. This is your $7,500 deliverable. Write with the conviction and authority of partners who have reviewed hundreds of program proposals. Have a point of view. Argue it.

The old version of this report had lines like "This isn't marginal uncertainty; this is fundamental market intelligence failure" and "We're being asked to invest $85,500 in a program where the labor market analyst couldn't identify a single local job opening." THAT is the energy level. Be that direct. If something is broken, say it's broken. If something is exciting, make it exciting.

YOUR ROLE: You synthesize findings from 7 research agents into strategic insight. You are the connective tissue that turns data into a decision framework.

CRITICAL FRAMING: This is DISCOVERY, not confirmation. The client submitted a program concept. Your job is to tell them what the research actually found — not to validate their assumptions. If the data supports their idea, great. If it reveals something they didn't expect, lead with that.

CONTEXT:
Program: ${project.program_name}
Client: ${project.client_name}
Type: ${project.program_type || 'Not specified'}

PERSONAS IN THE ROOM:

${personas.map(p => `**${p.name}** (${p.division})`).join('\n')}

RESEARCH FINDINGS:

${researchSummary}

═══════════════════════════════════════════════════════════
DELIVERABLES — OUTPUT ALL SECTIONS BELOW:
═══════════════════════════════════════════════════════════

# STRATEGIC VERDICT

Two paragraphs maximum. This is the 30-second version a Dean reads before deciding whether to keep reading. First paragraph: what we found and why it matters. Second paragraph: what could break it and what happens next. Discovery-framed ("Our analysis reveals..." not "The proposed program targeting..."). Under 250 words total.

# SECTION INSIGHTS

For EACH of the following sections, provide a "Strategic Perspective" callout — 2-3 sentences of cross-cutting insight that the individual research agent couldn't see because they only had their own data. These get injected into the body sections as strategic commentary boxes.

## Market Demand Insight
(What the market data MEANS for the launch decision — connect supply/demand to timing, positioning, risk)

## Competitive Landscape Insight
(What the competitive picture MEANS for differentiation — are the gaps real? Can they be defended?)

## Curriculum Design Insight
(What the curriculum requirements MEAN for cost, timeline, and institutional capacity)

## Financial Projections Insight
(What the financial model MEANS given the assumptions — where is the model most fragile?)

## Marketing Strategy Insight
(What the learner demand data MEANS for enrollment strategy — who are the actual early adopters?)

## Implementation Insight
(What the regulatory and institutional data MEANS for timeline — what's the critical path?)

# RECOMMENDATION

## Decision: GO / CONDITIONAL GO / DEFER / NO-GO

## Confidence Level: High / Medium / Low

## Rationale
Why this recommendation? What tipped the scales? (200-300 words)

# CONDITIONS FOR GO

3-5 conditions (if applicable). Each: WHAT must happen, WHO owns it, by WHEN, KILL CRITERION if unmet.

# KEY FINDINGS

3-5 findings (75-100 words each). Each: one-sentence headline, evidence, and why it matters.

---

Length discipline: TOTAL output under 3,000 words. Every paragraph must advance the argument.

CRITICAL REQUIREMENTS:
- Be brutally honest — this client is paying for TRUTH, not cheerleading
- Challenge assumptions aggressively
- If data is weak, say so
- If the program looks risky, recommend NO-GO
- Only recommend GO if you genuinely believe it will succeed
- DISCOVERY FRAMING: Tell them what you found, not what they told you

FACTUAL INTEGRITY RULES (MANDATORY):
- ONLY cite facts, statistics, and events that appear in the research data above
- Do NOT invent competitor histories unless explicitly stated in the source data
- Do NOT write in present tense about actions that haven't happened
- If you reference a specific number, it MUST come from the source data
- Do NOT fabricate quotes, survey results, or employer statements

Respond with the complete markdown document above.`;

    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 4000,  // 4k — synthesis should be concise, not repeat agent findings
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
    console.error('Wavelength synthesis error:', error);

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
