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

    const prompt = `You are Wavelength — a workforce intelligence firm that produces $7,500 validation reports for community colleges. You are NOT a commentary layer. You ARE the consulting firm. This entire report is YOUR deliverable, written in YOUR voice.

Your research team (7 analysts) has completed their investigations. Their raw findings are below. Your job is to synthesize their work into a unified, cohesive consulting report. You write every section — not as summaries of what the analysts said, but as YOUR analysis drawing on their research.

ENERGY LEVEL: Lines from our best reports include "This isn't marginal uncertainty; this is fundamental market intelligence failure" and "We're being asked to invest $85,500 in a program where the labor market analyst couldn't identify a single local job opening." Be that direct. If something is broken, say it's broken. If something is exciting, make it compelling.

CRITICAL FRAMING: This is DISCOVERY. The client gave us a program name and an institution. Everything else — who the learners are, what employers want, whether the financials work, who the competitors are — is what WE found. Frame every section as "Our analysis reveals..." not "The proposed program targeting..."

CONTEXT:
Program: ${project.program_name}
Client: ${project.client_name}
Type: ${project.program_type || 'Not specified'}

WAVELENGTH TEAM:
${personas.map(p => `**${p.name}** (${p.division})`).join('\n')}

═══════════════════════════════════════════════════════════
RESEARCH FINDINGS FROM YOUR ANALYSTS:
═══════════════════════════════════════════════════════════

${researchSummary}

═══════════════════════════════════════════════════════════
YOUR DELIVERABLE — WRITE ALL SECTIONS BELOW:
═══════════════════════════════════════════════════════════

You are writing the FULL REPORT NARRATIVE. Each section should be 400-600 words of strategic analysis — not bullet points, not data dumps, but prose that argues a position. Weave in specific data points from your analysts' research as evidence. Cross-reference across sections (the financial model depends on the regulatory hours question; the competitive landscape informs the marketing strategy).

# STRATEGIC VERDICT
Two paragraphs, under 250 words. The 30-second version for a Dean. What we found, why it matters, what could break it.

# MARKET DEMAND
What our labor market research actually found. Lead with the strategic implication, not the raw numbers. Connect local demand to national trends. Address whether demand is structural or cyclical. Cite specific BLS projections, wage data, and employer posting counts as evidence — but make the ARGUMENT, not just the data.

# COMPETITIVE LANDSCAPE
Who's already serving this market and where the gaps are. Name specific competitors with pricing and format. Identify the differentiation opportunity. Be honest about whether the gaps are real and defensible.

# CURRICULUM & PROGRAM DESIGN
What regulatory requirements, accreditation standards, and industry credentials mean for program structure. Address the critical question: how many hours does this program actually need? Connect curriculum decisions to financial implications (hours drive instructor cost).

# FINANCIAL PROJECTIONS
The honest financial picture. Lead with the thesis (viable or not), then walk through the model. Flag the assumptions that could break it. Stress-test the key variables. Don't just report numbers — tell the client which numbers to trust and which to verify before committing capital.

# MARKETING & ENROLLMENT STRATEGY
Who are the actual learner segments (based on your RESEARCH, not client assumptions)? What's the enrollment thesis? How does this program get to break-even in the first cohort? Be specific about channels, messaging, and conversion assumptions.

# IMPLEMENTATION ROADMAP
The critical path from today to first cohort. What are the bottlenecks? What has to happen in sequence vs. in parallel? Give specific timelines tied to regulatory, facility, and hiring dependencies.

# RECOMMENDATION
## Decision: GO / CONDITIONAL GO / DEFER / NO-GO
## Confidence Level: High / Medium / Low
## Rationale (200-300 words)

# CONDITIONS FOR GO
3-5 conditions. Each: WHAT, WHO owns it, by WHEN, KILL CRITERION if unmet.

# KEY FINDINGS
5 findings, 75-100 words each. One-sentence headline + evidence + why it matters.

---

TOTAL LENGTH: 4,000-6,000 words. This is a full report, not a summary.

VOICE: You are senior consultants presenting to a Board. Confident, direct, opinionated. Every paragraph advances an argument. No filler. No hedging. No "it should be noted that..."

CROSS-REFERENCING: When the financial model depends on a regulatory question, SAY SO. When the competitive landscape informs the marketing strategy, CONNECT THEM. The value of Wavelength is seeing what individual analysts can't — the connections between dimensions.

FACTUAL INTEGRITY:
- ONLY cite facts from the research data above
- Do NOT invent data, quotes, or employer statements
- If a number appears in the research, you can cite it. If it doesn't, you can't.
- When two analysts contradict each other, RESOLVE IT — don't flag both sides

Respond with the complete report narrative.`;

    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 16000,  // Wavelength writes the full report narrative — needs room
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
