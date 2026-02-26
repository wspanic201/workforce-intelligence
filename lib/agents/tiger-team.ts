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
  researchComponents: ResearchComponent[],
  options: { personaSlugs?: string[] } = {}
): Promise<{ synthesis: TigerTeamSynthesis; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    // Load tiger team personas
    const personaSlugs = options.personaSlugs && options.personaSlugs.length
      ? options.personaSlugs
      : ['product-manager', 'cfo', 'cmo', 'coo'];
    const personas = await loadMultiplePersonas(personaSlugs);

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

═══════════════════════════════════════════════════════════
DELIVERABLES (5,000-7,000 WORDS — THIS IS THE SYNTHESIS THAT JUSTIFIES $7,500):
═══════════════════════════════════════════════════════════

# Executive Summary (800-1,000 words)

Write a NARRATIVE executive summary, not bullet points. Tell the story of this program opportunity.

**Structure:**
- **Opening:** What is this program and why is the institution considering it? (2-3 sentences)
- **The Opportunity:** What makes this strategically attractive? Paint the picture of success. What are the strong points? (2-3 paragraphs)
- **The Challenges:** What are the critical execution risks? What could go wrong? What assumptions are we betting on? (2-3 paragraphs)
- **The Verdict:** What's the recommendation and why? What needs to happen next? (1-2 paragraphs)

**Tone:** Write like a consulting partner presenting to a Board. Be confident but honest. If the program is risky, say it directly. If it's a strong opportunity, make the case compellingly.

**Example opening:** "The Pharmacy Technician Certificate presents a strategically sound but operationally precarious opportunity for Kirkwood Community College. The fundamentals are solid: documented employer demand across retail and hospital sectors, strong institutional alignment with health sciences priorities, clear regulatory pathways, and reasonable startup costs ($123K). The program addresses a legitimate workforce gap in Eastern Iowa with 67-93 estimated annual positions across major employers..."

# Recommendation (1,200-1,500 words)

## Decision: GO / CONDITIONAL GO / DEFER / NO-GO

## Confidence Level: High / Medium / Low

## Rationale (500+ words)
Explain WHY this recommendation was reached. Connect it to the research data. What tipped the scales? What would need to change for a different recommendation?

## Conditions (if CONDITIONAL GO) (400+ words)
If recommending CONDITIONAL GO, list 3-5 SPECIFIC conditions that MUST be met before proceeding:
- Each condition should include: WHAT must happen, by WHEN, and HOW to verify it was met
- Example: "Secure signed MOUs with minimum 6 pharmacy sites guaranteeing rotation capacity for 40 students annually at zero cost. Deadline: 60 days. Verification: Legal-reviewed agreements with site signatures on file."

## Timeline for Revisiting (if DEFER)
If recommending DEFER, specify when to revisit (6 months? 12 months?) and what would need to change in the market/data to reconsider.

## Alternative Approaches (if NO-GO)
If recommending NO-GO, suggest 2-3 alternative approaches that could work:
- Pivot to employer contract training model (serving single employer's needs)?
- Different credential level (stackable certificate vs full program)?
- Geographic focus (different region with less competition)?

# Key Findings (1,000-1,200 words)

Provide 5-7 key findings that synthesize across all research dimensions. Each finding should be 150-200 words with:
- **The Finding:** One-sentence statement
- **The Evidence:** What data supports this? Cite specific research components.
- **The Implication:** Why does this matter for the launch decision?
- **Cross-Dimensional Connections:** How does this finding relate to other research areas?

**Example:**
**Finding 1: Solid Employer Demand, Weak Labor Market Data**
Strong qualitative signals from major employers (UnityPoint, UIHC, Hy-Vee, CVS) indicate hiring need, but quantitative labor market analysis scored 3/10 with "critical data unavailable." The Market Analyst cited wrong O*NET code (Pharmacy Aides 31-9095 vs Technicians 29-2052), suggesting methodology problems. This gap creates unacceptable uncertainty about actual job placement rates, wage trajectories, and market saturation. The Employer Demand analysis showed strong informal interest, but Financial Viability scored only 6/10 partly due to this uncertainty. **Implication:** We're recommending a six-figure investment with incomplete information about the labor market. This isn't acceptable diligence for a program launch decision. Before proceeding, conduct a 30-day employer survey with 10+ major pharmacy employers documenting actual hiring intentions, not just "interest."

# Critical Success Factors (1,200-1,500 words)

List 3-5 factors that MUST be true for this program to succeed. For each factor provide:

## Factor Name (e.g., "Clinical Site Partnerships with Committed Capacity")

### Why This Is Critical (200+ words)
Explain the business logic. Why is this non-negotiable? What happens if this factor isn't achieved?

### Current Status (100+ words)
Where are we now? What's confirmed vs assumed? What's the gap?

### How to Achieve It (300+ words)
Provide DETAILED implementation guidance:
- List of 10 specific target sites/partners with contact names (if available)
- MOU template outline (key clauses to include)
- Negotiation talking points ("You get well-trained graduates, we provide...")
- Timeline (Month 1: Identify sites, Month 2: Initial outreach, Month 3: Negotiate terms...)
- Budget required ($X,XXX for legal review, relationship management)
- Owner (Who is responsible? Program director? Dean?)

### How to Verify Success
What's the proof that this factor has been achieved? Specific deliverables or milestones.

# Top Risks & Mitigation Strategies (1,500-2,000 words)

Identify 3-5 risks rated by **Impact** (Low/Medium/High/Critical) and **Likelihood** (Low/Medium/High).

## Risk 1: [Risk Name] (Impact: HIGH | Likelihood: MEDIUM)

### Impact Analysis (200+ words)
If this risk materializes, what happens? Quantify the impact on financials, enrollment, reputation. Paint the worst-case scenario.

Example: "If Year 1 enrolls 8 students instead of 15, revenue drops $29,400 and cumulative loss reaches $226,900. Program break-even extends from 22 months to 36+ months, likely triggering Board review and potential suspension. Reputation damage from low enrollment makes Year 2 recruitment even harder."

### Likelihood Assessment (150+ words)
How probable is this risk? What evidence suggests it could happen? What are the warning signs?

### Mitigation Strategy (400+ words)
Provide DETAILED, ACTIONABLE mitigation:
- **Preventive actions:** What can we do NOW to reduce likelihood? (with specific tactics, budget, timeline)
- **Contingency plans:** If the risk materializes, what's Plan B? (with decision triggers and alternative approaches)
- **Cost of mitigation:** How much does it cost to address this risk? Is it worth it?
- **Owner:** Who is responsible for monitoring and mitigating this risk?

Example: "Market validation survey (30 days): Hire workforce research firm to survey 50+ prospective students validating willingness to pay $4,200 and commit 8-10 months. Cost: $3K-$5K. If survey shows <60% enrollment intent, delay launch 6 months and pivot to employer contract training model (serving Hy-Vee corporate training) to validate demand before open enrollment."

# Perspective Assessments (2,000-2,500 words total, 400-500 each)

Write as if each persona is speaking directly. Use first person. Be opinionated. DEBATE and CHALLENGE, don't just summarize.

## Market Fit (Product Manager - Marcus Chen) (400-500 words)

**Assessment:** CONDITIONAL PASS / YELLOW LIGHT / RED FLAG (pick one and rate X/10)

**Voice:** Product managers care about product-market fit, customer validation, and competitive positioning. They ask: Will students actually buy this? What's our unique value prop? How do we beat the competition?

**Structure:**
- What Works: 2-3 strengths of the product/market fit
- What Concerns Me: 3-4 specific red flags or gaps in validation
- Product Validation Needed: Specific research to conduct (customer discovery interviews, competitive mystery shopping, etc.)
- My Recommendation: Should we build this product or not? Under what conditions?

**Example tone:** "I'm deeply concerned about market positioning and competitive differentiation. We're launching into a space with three established Iowa competitors, and the research hasn't validated our unique value proposition with actual customer data. Did we talk to 50 retail pharmacy workers and ask if they'd pay $4,200? No. Did we survey recent high school grads about awareness and interest? No. This is Product Management 101—you validate demand before building. Indian Hills shut down their program in 2019 with <10 enrollment—that's our reality check."

## Financial Viability (CFO - Marcus Reinholt) (400-500 words)

**Assessment:** GREEN LIGHT / YELLOW LIGHT / RED FLAG (rate X/10 financial confidence)

**Voice:** CFOs care about ROI, cash flow, risk-adjusted returns, and fiduciary responsibility. They ask: Can we afford this? What's the downside? Are the assumptions realistic?

**Structure:**
- The Numbers That Work: Financial strengths (reasonable startup costs, acceptable ROI, etc.)
- The Numbers That Terrify Me: Critical financial risks (enrollment shortfalls, unvalidated assumptions, etc.)
- What I Need to See Before Approving: Specific financial validations required
- My Recommendation: Would I sign off on this investment? Under what conditions?

**Example tone:** "Let me be blunt: this program is financially viable IF—and only if—five critical assumptions hold true. Right now, those assumptions are unvalidated, which means we're betting $123K of institutional capital on a 50% ROI that could easily become a -$35K loss. The clinical site assumption is $0 cost and unlimited capacity—this is the entire business model. If UnityPoint says 'we'll take 4 students per cohort, $1,000 fee per student,' our annual costs jump $16K and enrollment is capped. Have we signed MOUs? No. This is unacceptable financial planning."

## Go-to-Market (CMO - Valentina Rojas-Medina) (400-500 words)

**Assessment:** [Pick one and rate marketability X/10]

**Voice:** CMOs care about brand positioning, competitive messaging, customer acquisition cost, and conversion funnels. They ask: Can I sell this? What's the compelling story? Can we reach the right audience?

**Structure:**
- What's Working in Our Favor: Marketing assets and advantages
- What's Working Against Us: Competitive and messaging challenges
- Marketing Strategy Needed: Specific campaigns, channels, budget allocation
- My Recommendation: Is this marketable or not?

## Implementation Feasibility (COO - Sarah Martinez-Williams) (400-500 words)

**Assessment:** [Pick one and rate operational readiness X/10]

**Voice:** COOs care about execution, operational capacity, timelines, and resource constraints. They ask: Can we actually pull this off? Do we have the people, systems, and processes?

**Structure:**
- Operational Strengths: What we have in place (infrastructure, experience, etc.)
- Operational Gaps: What we're missing or underestimating
- Implementation Complexity: What could go wrong during launch and scale
- My Recommendation: Are we operationally ready to execute?

---

CRITICAL REQUIREMENTS:
- Be brutally honest - this client is paying $10k for TRUTH, not cheerleading
- Challenge assumptions aggressively
- If data is weak, say so
- If the program looks risky, recommend NO-GO
- Only recommend GO if you genuinely believe it will succeed
- Remember: colleges have limited resources - a bad program hurts students AND the institution

FACTUAL INTEGRITY RULES (MANDATORY):
- ONLY cite facts, statistics, and events that appear in the research data above
- Do NOT invent competitor histories (e.g. "Program X was discontinued in YYYY") unless explicitly stated in the source data
- Do NOT write in present tense about actions that haven't happened (e.g. "the grant has been submitted"). Use future/conditional tense for recommendations ("should submit", "would need to")
- If you reference a specific number (enrollment, salary, cost), it MUST come from the source data. If the data is missing, say "data not available" rather than estimating
- Do NOT fabricate quotes, survey results, or employer statements
- Clearly distinguish between SOURCE DATA FINDINGS and YOUR ANALYSIS/RECOMMENDATIONS

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
