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

CONTEXT:
Program: ${project.program_name}
Client: ${project.client_name}
Type: ${project.program_type || 'Not specified'}
Target Audience: ${project.target_audience || 'Not specified'}

PERSONAS IN THE ROOM:

${personas.map(p => `**${p.name}** (${p.division})`).join('\n')}

RESEARCH FINDINGS:

${researchSummary}

═══════════════════════════════════════════════════════════
DELIVERABLES:
═══════════════════════════════════════════════════════════

# Executive Summary (600-800 words MAX)

Write a NARRATIVE executive summary. Discovery-framed: lead with what the research FOUND, not what the client is evaluating.

WRONG: "Kirkwood Community College is evaluating whether to launch a Pharmacy Technician Certificate program targeting career changers..."
RIGHT: "Our analysis reveals a market with genuine structural demand, a defensible competitive window, and economics that hold — if one critical assumption resolves in the program's favor."

**Structure:**
- **Opening:** What did we FIND? Lead with the research verdict. Not "the institution is considering" — "our analysis reveals." (1-2 sentences)
- **The Opportunity:** What makes this strategically attractive? What did the data show that justifies investment? (2 paragraphs)
- **The Critical Risk:** What is the one thing that could break this? Be direct. (1 paragraph)
- **The Verdict:** Recommendation + what must happen next. (1 paragraph)

**Tone:** Write like a consulting partner presenting to a Board. Be confident but honest. Lead with the answer, support it with evidence.

# Recommendation (600-800 words MAX)

## Decision: GO / CONDITIONAL GO / DEFER / NO-GO

## Confidence Level: High / Medium / Low

## Rationale
Explain WHY this recommendation was reached. Connect it to the research data. What tipped the scales?

## Conditions (if CONDITIONAL GO)
List 3-5 SPECIFIC conditions with WHAT must happen, by WHEN, and HOW to verify.

## Timeline for Revisiting (if DEFER)
When to revisit and what would need to change.

## Alternative Approaches (if NO-GO)
2-3 alternative approaches that could work.

# Key Findings

Provide 3-5 key findings (100-150 words each) that synthesize across all research dimensions. Each finding: one-sentence statement, the evidence, and why it matters for the launch decision.

# Conditions for Go

If CONDITIONAL GO: Identify the 1-2 TRUE GATES — conditions that would genuinely change the recommendation if unmet. These are launch blockers. Additional "nice to have" items are implementation tasks, not conditions.

For each true gate (maximum 2): WHAT must happen, WHO owns it, by WHEN, KILL CRITERION if unmet.

Do NOT list 5 conditions when only 1-2 are genuinely make-or-break. A list of 5 kill-criteria conditions is functionally a Defer recommendation and should be called what it is.

# Advisory Assessment

**This is the most important section of the report. 800–1,000 words. ONE unified voice.**

Do NOT write four separate persona sections. Do NOT use sub-headers for each advisor. Write as a single, cohesive consulting team voice — the way a senior partner would present findings after a full team debrief.

The voice is sharp, direct, and earned. It carries the financial caution of a CFO, the strategic edge of a strategist, the market instinct of a CMO, and the academic rigor of an education director — but fused into one perspective, not four parallel monologues. Think: the smartest person in the room who has already heard all the arguments and is now delivering the verdict.

**What this section must do:**
- Deliver the team's genuine, integrated point of view on this program — not a summary of the research
- Call out the one or two things that actually determine whether this program succeeds or fails
- Name the tension, if there is one (e.g., the strategic opportunity is real but the financial model is built on an assumption nobody has verified)
- Be opinionated. Make a case. Don't hedge every sentence.
- Speak directly to the decision-maker: what do you need to do, and why does it matter now?

**Tone reference (this is the energy level):**
> "The competitive vacuum is real. No Iowa community college is publishing PTCB pass rates. Penn Foster can't place a student in an Iowa externship. Walgreens is training techs who are permanently capped in retail. UnityPoint Health has three open positions and no community college pipeline partner in Cedar Rapids. That is not a market gap — that is an invitation. The only question is whether Kirkwood shows up with the right program or a minimum-compliance certificate that competes on price with a $999 online product. Those are two very different decisions, and the financial model right now is built for the wrong one."

That's ONE voice. Not four. Pull the threads together — strategic opportunity, financial reality, market entry, curriculum stakes — and write them as one argument, not four chapters.

---

Length discipline: Every paragraph must advance the argument. No filler. No repeating what the research agents already said — synthesize and add insight.

CRITICAL REQUIREMENTS:
- Be brutally honest - this client is paying for TRUTH, not cheerleading
- Challenge assumptions aggressively
- If data is weak, say so
- If the program looks risky, recommend NO-GO
- Only recommend GO if you genuinely believe it will succeed

FACTUAL INTEGRITY RULES (MANDATORY):
- ONLY cite facts, statistics, and events that appear in the research data above
- Do NOT invent competitor histories unless explicitly stated in the source data
- Do NOT write in present tense about actions that haven't happened
- If you reference a specific number, it MUST come from the source data
- Do NOT fabricate quotes, survey results, or employer statements
- Clearly distinguish between SOURCE DATA FINDINGS and YOUR ANALYSIS/RECOMMENDATIONS

Respond with the complete markdown document above.`;

    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 8000,  // 8k — allows exec summary + recommendation + key findings + 4 persona sections
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
