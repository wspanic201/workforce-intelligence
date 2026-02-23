/**
 * Financial Viability Agent — Wavelength Program Validator
 *
 * Architecture:
 *  1. buildFinancialModelWithBLS()  — fetches real BLS data, runs deterministic P&L model
 *  2. callClaude()                  — interprets the model numbers (does NOT invent them)
 *
 * Score comes from the model. Claude writes narrative. No more hallucinated financials.
 */

import { loadPersona } from '@/lib/confluence-labs/loader';
import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import {
  buildFinancialModelWithBLS,
  mapProgramToInstructorSoc,
  FinancialModelOutput,
} from '@/lib/stages/validation/financial-model';

// ─── Output Types ─────────────────────────────────────────────────────────────

export interface FinancialProjectionsData {
  score: number;
  scoreRationale: string;
  financialModel: FinancialModelOutput;
  keyRisks: string[];
  mitigations: string[];
  assumptions: Array<{ item: string; value: string; source: string }>;
  // Legacy fields preserved for backward compatibility with report renderer
  startup_costs: {
    curriculum_development: number;
    equipment_labs: number;
    marketing_launch: number;
    faculty_training: number;
    accreditation_fees: number;
    other: number;
    total: number;
  };
  annual_operating_costs: {
    faculty_salaries: number;
    adjunct_instructors: number;
    equipment_maintenance: number;
    software_licenses: number;
    marketing: number;
    administrative_overhead: number;
    total: number;
  };
  revenue_projections: {
    year1: { enrollment: number; tuition_per_student: number; total_revenue: number };
    year2: { enrollment: number; tuition_per_student: number; total_revenue: number };
    year3: { enrollment: number; tuition_per_student: number; total_revenue: number };
  };
  break_even_analysis: {
    break_even_enrollment: number;
    break_even_timeline: string;
  };
  roi_analysis: {
    three_year_net: number;
    roi_percentage: string;
    assumptions: string[];
  };
  funding_sources: string[];
  risks: string[];
  recommendations: string[];
}

// ─── Claude Interpretation Prompt ────────────────────────────────────────────

function buildInterpretationPrompt(
  model: FinancialModelOutput,
  project: ValidationProject,
  persona: { fullContext: string }
): string {
  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  const b = model.scenarios.base;
  const p = model.scenarios.pessimistic;
  const o = model.scenarios.optimistic;

  return `${persona.fullContext}

You are a CFO consultant interpreting a Stage 2 (pre-curriculum) financial model. The numbers are already calculated — your job is to explain them, identify risks, and suggest mitigations. Do NOT invent new numbers.

IMPORTANT CONTEXT: This is a validation-stage estimate. Precise modeling requires curriculum design (Stage 3), when actual seat time, contact-hour breakdown (lecture vs. lab vs. clinical), and materials lists are known. Instruction cost — currently from BLS benchmarks — is the largest variable. Frame your narrative to reflect this honest uncertainty while still giving actionable direction.

═══════════════════════════════════════════════════════════
FINANCIAL MODEL OUTPUT — ${project.program_name}
Client: ${project.client_name}
═══════════════════════════════════════════════════════════

VIABILITY SCORE (from model): ${model.viabilityScore}/10
Score logic: ${model.viabilityRationale}

YEAR 1 P&L:
  Pessimistic (${p.enrollment} students): Revenue ${fmt(p.revenue.total)} | Expenses ${fmt(p.expenses.total)} | Net ${fmt(p.netPosition)} | Margin ${pct(p.margin)}
  Base (${b.enrollment} students): Revenue ${fmt(b.revenue.total)} | Expenses ${fmt(b.expenses.total)} | Net ${fmt(b.netPosition)} | Margin ${pct(b.margin)}
  Optimistic (${o.enrollment} students): Revenue ${fmt(o.revenue.total)} | Expenses ${fmt(o.expenses.total)} | Net ${fmt(o.netPosition)} | Margin ${pct(o.margin)}

YEAR 2 P&L (base: ${model.year2Base.enrollment} students, no lab setup):
  Net: ${fmt(model.year2Base.netPosition)} | Margin: ${pct(model.year2Base.margin)}

YEAR 3 P&L (base: ${model.year3Base.enrollment} students):
  Net: ${fmt(model.year3Base.netPosition)} | Margin: ${pct(model.year3Base.margin)}

BREAK-EVEN: ${model.breakEvenEnrollment} students (${((model.breakEvenEnrollment / b.enrollment) * 100).toFixed(0)}% of base enrollment)
PERKINS V IMPACT: ${model.perkinsImpact}

KEY COST DRIVERS:
  - Instructor cost (Year 1): ${fmt(b.expenses.instructorCost)} (BLS-sourced adjunct rate)
  - Lab setup (Year 1, one-time): ${fmt(b.expenses.labSetup)}
  - Admin overhead (15% of direct): ${fmt(b.expenses.adminOverhead)}
  - Coordinator (0.25 FTE): ${fmt(b.expenses.coordinatorCost)}

ASSUMPTIONS USED:
${model.assumptions ? model.assumptions.map(a => `  - ${a.item}: ${a.value} [${a.source}]`).join('\n') : '  - CEU model: minimal assumptions, uses instructor hourly rate + fixed overhead'}

═══════════════════════════════════════════════════════════
YOUR TASK:
Write a brief narrative interpretation of these model results. Then identify 3-5 key financial risks with mitigations, and 3-5 strategic recommendations.

You MUST return ONLY the following JSON — no preamble, no questions:

{
  "scoreRationale": "2-3 sentence interpretation of why this score makes sense given the model results",
  "keyRisks": [
    "Risk 1 — specific, grounded in the model numbers",
    "Risk 2",
    "Risk 3"
  ],
  "mitigations": [
    "Mitigation 1 — actionable and specific",
    "Mitigation 2",
    "Mitigation 3"
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ],
  "funding_sources": [
    "Perkins V — $8,000–$28,000/yr (eligible based on CIP code)",
    "WIOA ETPL — per-student funding for eligible participants",
    "Employer tuition reimbursement"
  ]
}

CRITICAL: Return ONLY the JSON. No preamble.`;
}

// ─── Agent Runner ─────────────────────────────────────────────────────────────

export async function runFinancialAnalysis(
  projectId: string,
  project: ValidationProject & {
    geographic_area?: string;
    delivery_format?: string;
    estimated_tuition?: string;
    has_existing_lab_space?: boolean;
    target_cohort_size?: number;
    // CE model — seat hours replace credit hours
    total_seat_hours?: number;
    total_seat_hours_source?: string;
    sections_per_year?: number;
    // Legacy field kept for fallback
    program_credit_hours?: number;
    funding_sources?: string[];
    // Optional: competitor pricing from competitive analysis agent
    competitor_pricing?: {
      marketMedian: number;
      marketLow: number;
      marketHigh: number;
      source?: string;
      comps?: Array<{ institution: string; price: number; seatHours?: number; url: string }>;
    };
  },
  programType?: 'initial_licensure' | 'continuing_education' | 'non_licensed' | 'unclear'
): Promise<{ data: FinancialProjectionsData; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    // ── Step 0: Fetch programType from regulatory analysis (if available) ─────
    
    if (!programType) {
      // Try to fetch from regulatory component results
      const { data: regulatoryComponent } = await supabase
        .from('research_components')
        .select('content')
        .eq('project_id', projectId)
        .eq('component_type', 'regulatory_compliance')
        .eq('status', 'completed')
        .single();
      
      if (regulatoryComponent?.content?.programType) {
        programType = regulatoryComponent.content.programType;
        console.log(`[Financial Agent] Using programType from regulatory analysis: ${programType}`);
      } else {
        console.log(`[Financial Agent] No programType available — using default full program model`);
      }
    }

    // ── Step 1: Determine inputs ──────────────────────────────────────────────

    // Parse tuition from string range or use mid
    let tuition = 4_800;
    if (project.estimated_tuition) {
      const nums = project.estimated_tuition.replace(/[$,]/g, '').match(/\d+/g);
      if (nums && nums.length >= 1) {
        const vals = nums.map(Number);
        tuition = vals.length === 1 ? vals[0] : Math.round((vals[0] + vals[vals.length - 1]) / 2);
      }
    }

    const deliveryFormat = (project.delivery_format as 'in-person' | 'hybrid' | 'online') ?? 'hybrid';
    const hasExistingLabSpace = project.has_existing_lab_space ?? false;
    const cohortSize = project.target_cohort_size ?? 18;
    // CE programs use seat hours (contact hours) — not credit hours
    const totalSeatHours = project.total_seat_hours ?? project.program_credit_hours ?? 160;
    const totalSeatHoursSource = project.total_seat_hours_source ?? 'Iowa Board of Pharmacy minimum training hours for pharmacy technician programs';
    const sectionsPerYear = project.sections_per_year ?? 2;
    const perkinsEligible = project.funding_sources?.includes('perkins_v') ?? true;

    // Use competitor pricing if available (passed from orchestrator after competitive agent runs)
    let tuitionSource = 'Iowa community college CE market rate analysis';
    if (project.competitor_pricing?.marketMedian) {
      tuition = project.competitor_pricing.marketMedian;
      tuitionSource = `Competitor market rate (median from ${project.competitor_pricing.source ?? 'web search'})`;
      console.log(`[Financial Agent] Using competitor market median tuition: $${tuition} (${tuitionSource})`);
    }

    // Extract state FIPS from geographic area (look for Iowa)
    let stateFips: string | undefined;
    const geo = (project.geographic_area ?? '').toLowerCase();
    if (geo.includes('iowa') || geo.includes(' ia') || geo.includes(', ia')) stateFips = '19';
    else if (geo.includes('minnesota') || geo.includes(' mn')) stateFips = '27';
    else if (geo.includes('illinois') || geo.includes(' il')) stateFips = '17';
    else if (geo.includes('wisconsin') || geo.includes(' wi')) stateFips = '55';

    const socMapping = mapProgramToInstructorSoc(project.program_name);

    console.log(`[Financial Agent] Building model for "${project.program_name}"`);
    console.log(`[Financial Agent] SOC: ${socMapping.soc} (${socMapping.label}), State FIPS: ${stateFips ?? 'national'}`);

    // ── Step 2: Build deterministic financial model ───────────────────────────

    const financialModel = await buildFinancialModelWithBLS(
      project.program_name, 
      {
        programName: project.program_name,
        tuitionEstimate: tuition,
        cohortSize,
        // CE model: seat hours, not credit hours
        totalSeatHours,
        totalSeatHoursSource,
        sectionsPerYear,
        hasExistingLabSpace,
        perkinsEligible,
        deliveryFormat,
        stateFips,
      },
      programType // Route to CEU model if continuing_education
    );

    console.log(`[Financial Agent] Model complete — viability score: ${financialModel.viabilityScore}/10`);
    console.log(`[Financial Agent] Year 1 net (base): $${financialModel.year1NetPosition.toLocaleString()}`);
    console.log(`[Financial Agent] Break-even enrollment: ${financialModel.breakEvenEnrollment} students`);

    // ── Step 3: Claude interprets the model (does NOT invent numbers) ─────────

    const persona = await loadPersona('cfo');
    const verifiedIntelBlock = (project as any)._intelContext?.promptBlock || '';
    const prompt = buildInterpretationPrompt(financialModel, project, persona) + '\n' + verifiedIntelBlock;

    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 2000,
      model: 'claude-sonnet-4-6',
    });

    let claudeOutput: any = {};
    try {
      claudeOutput = extractJSON(content);
    } catch {
      console.warn('[Financial Agent] Could not parse Claude JSON — using fallback narrative');
      claudeOutput = {
        scoreRationale: financialModel.viabilityRationale,
        keyRisks: ['Enrollment shortfall risk if Year 1 falls below break-even threshold'],
        mitigations: ['Secure employer pre-commitments before capital expenditure'],
        recommendations: ['Validate enrollment demand before committing to lab buildout'],
        funding_sources: ['Perkins V', 'WIOA'],
      };
    }

    // ── Step 4: Build output ──────────────────────────────────────────────────

    const base1 = financialModel.scenarios.base;
    const base2 = financialModel.year2Base;
    const base3 = financialModel.year3Base;

    const threeYearNet = base1.netPosition + base2.netPosition + base3.netPosition;
    const threeYearRevenue = base1.revenue.total + base2.revenue.total + base3.revenue.total;
    const threeYearROI = threeYearRevenue > 0
      ? `${((threeYearNet / threeYearRevenue) * 100).toFixed(1)}%`
      : 'N/A';

    const data: FinancialProjectionsData = {
      score: financialModel.viabilityScore,
      scoreRationale: claudeOutput.scoreRationale ?? financialModel.viabilityRationale,
      financialModel,
      keyRisks: Array.isArray(claudeOutput.keyRisks) ? claudeOutput.keyRisks : [],
      mitigations: Array.isArray(claudeOutput.mitigations) ? claudeOutput.mitigations : [],
      assumptions: financialModel.assumptions,

      // Legacy fields for backward-compat
      startup_costs: {
        curriculum_development: 0,
        equipment_labs: !hasExistingLabSpace ? 30_000 : 0,
        marketing_launch: 3_000,
        faculty_training: 0,
        accreditation_fees: base1.expenses.regulatory,
        other: 0,
        total: (!hasExistingLabSpace ? 30_000 : 0) + 3_000 + base1.expenses.regulatory,
      },
      annual_operating_costs: {
        faculty_salaries: 0,
        adjunct_instructors: base1.expenses.instructorCost,
        equipment_maintenance: base1.expenses.labSupplies,
        software_licenses: 0,
        marketing: base1.expenses.marketing,
        administrative_overhead: base1.expenses.adminOverhead,
        total: base1.expenses.total,
      },
      revenue_projections: {
        year1: {
          enrollment: base1.enrollment,
          tuition_per_student: tuition,
          total_revenue: base1.revenue.total,
        },
        year2: {
          enrollment: base2.enrollment,
          tuition_per_student: tuition,
          total_revenue: base2.revenue.total,
        },
        year3: {
          enrollment: base3.enrollment,
          tuition_per_student: tuition,
          total_revenue: base3.revenue.total,
        },
      },
      break_even_analysis: {
        break_even_enrollment: financialModel.breakEvenEnrollment,
        break_even_timeline: `Year 1 at ${financialModel.breakEvenEnrollment} students (${((financialModel.breakEvenEnrollment / cohortSize) * 100).toFixed(0)}% of target cohort)`,
      },
      roi_analysis: {
        three_year_net: threeYearNet,
        roi_percentage: threeYearROI,
        assumptions: financialModel.assumptions.slice(0, 6).map(a => `${a.item}: ${a.value}`),
      },
      funding_sources: Array.isArray(claudeOutput.funding_sources)
        ? claudeOutput.funding_sources
        : ['Perkins V', 'WIOA'],
      risks: Array.isArray(claudeOutput.keyRisks) ? claudeOutput.keyRisks : [],
      recommendations: Array.isArray(claudeOutput.recommendations) ? claudeOutput.recommendations : [],
    };

    const markdown = formatFinancialAnalysis(data, project);
    const duration = Date.now() - startTime;

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'financial-analyst',
      persona: 'cfo',
      prompt: prompt.substring(0, 5_000),
      response: content.substring(0, 10_000),
      tokens_used: tokensUsed,
      duration_ms: duration,
      status: 'success',
    });

    return { data, markdown };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Financial analysis error:', error);

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'financial-analyst',
      persona: 'cfo',
      duration_ms: duration,
      status: 'error',
      error_message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

// ─── Markdown Formatter ──────────────────────────────────────────────────────

function $(val: unknown): string {
  if (val == null) return 'N/A';
  if (typeof val === 'number') return val.toLocaleString();
  return String(val);
}

function formatFinancialAnalysis(data: FinancialProjectionsData, project: ValidationProject): string {
  if (!data) return `# Financial Analysis: ${project.program_name}\n\nFinancial data unavailable.`;

  const m = data.financialModel;
  const b1 = m?.scenarios?.base;
  const b2 = m?.year2Base;
  const b3 = m?.year3Base;
  const p1 = m?.scenarios?.pessimistic;
  const o1 = m?.scenarios?.optimistic;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return `# Financial Analysis: ${project.program_name}
**Viability Score: ${data.score}/10** (model-driven, not estimated)

## Year 1–3 P&L Projection (Base Scenario)

| Line Item | Year 1 | Year 2 | Year 3 |
|-----------|--------|--------|--------|
| **Enrollment** | ${b1?.enrollment ?? '—'} students | ${b2?.enrollment ?? '—'} students | ${b3?.enrollment ?? '—'} students |
| Tuition Revenue | ${b1 ? fmt(b1.revenue.tuition) : '—'} | ${b2 ? fmt(b2.revenue.tuition) : '—'} | ${b3 ? fmt(b3.revenue.tuition) : '—'} |
| Perkins V | ${b1 ? fmt(b1.revenue.perkinsV) : '—'} | ${b2 ? fmt(b2.revenue.perkinsV) : '—'} | ${b3 ? fmt(b3.revenue.perkinsV) : '—'} |
| **Total Revenue** | **${b1 ? fmt(b1.revenue.total) : '—'}** | **${b2 ? fmt(b2.revenue.total) : '—'}** | **${b3 ? fmt(b3.revenue.total) : '—'}** |
| Instructor Cost | ${b1 ? fmt(b1.expenses.instructorCost) : '—'} | ${b2 ? fmt(b2.expenses.instructorCost) : '—'} | ${b3 ? fmt(b3.expenses.instructorCost) : '—'} |
| Lab Setup (one-time) | ${b1 ? fmt(b1.expenses.labSetup) : '—'} | $0 | $0 |
| Lab Supplies | ${b1 ? fmt(b1.expenses.labSupplies) : '—'} | ${b2 ? fmt(b2.expenses.labSupplies) : '—'} | ${b3 ? fmt(b3.expenses.labSupplies) : '—'} |
| Coordinator (0.25 FTE) | ${b1 ? fmt(b1.expenses.coordinatorCost) : '—'} | ${b2 ? fmt(b2.expenses.coordinatorCost) : '—'} | ${b3 ? fmt(b3.expenses.coordinatorCost) : '—'} |
| Marketing | ${b1 ? fmt(b1.expenses.marketing) : '—'} | $0 | $0 |
| Regulatory | ${b1 ? fmt(b1.expenses.regulatory) : '—'} | ${b2 ? fmt(b2.expenses.regulatory) : '—'} | ${b3 ? fmt(b3.expenses.regulatory) : '—'} |
| Admin Overhead (15%) | ${b1 ? fmt(b1.expenses.adminOverhead) : '—'} | ${b2 ? fmt(b2.expenses.adminOverhead) : '—'} | ${b3 ? fmt(b3.expenses.adminOverhead) : '—'} |
| **Total Expenses** | **${b1 ? fmt(b1.expenses.total) : '—'}** | **${b2 ? fmt(b2.expenses.total) : '—'}** | **${b3 ? fmt(b3.expenses.total) : '—'}** |
| **Net Position** | **${b1 ? fmt(b1.netPosition) : '—'}** | **${b2 ? fmt(b2.netPosition) : '—'}** | **${b3 ? fmt(b3.netPosition) : '—'}** |
| Margin | ${b1 ? pct(b1.margin) : '—'} | ${b2 ? pct(b2.margin) : '—'} | ${b3 ? pct(b3.margin) : '—'} |

## Scenario Comparison — Year 1

| Scenario | Enrollment | Revenue | Expenses | Net |
|----------|-----------|---------|----------|-----|
| Pessimistic (60%) | ${p1?.enrollment ?? '—'} | ${p1 ? fmt(p1.revenue.total) : '—'} | ${p1 ? fmt(p1.expenses.total) : '—'} | ${p1 ? fmt(p1.netPosition) : '—'} |
| Base (85%) | ${b1?.enrollment ?? '—'} | ${b1 ? fmt(b1.revenue.total) : '—'} | ${b1 ? fmt(b1.expenses.total) : '—'} | ${b1 ? fmt(b1.netPosition) : '—'} |
| Optimistic (100%) | ${o1?.enrollment ?? '—'} | ${o1 ? fmt(o1.revenue.total) : '—'} | ${o1 ? fmt(o1.expenses.total) : '—'} | ${o1 ? fmt(o1.netPosition) : '—'} |

**Break-Even:** ${m?.breakEvenEnrollment ?? '—'} students (${m ? ((m.breakEvenEnrollment / b1.enrollment) * 100).toFixed(0) : '—'}% of base enrollment)

**Perkins V Impact:** ${m?.perkinsImpact ?? 'N/A'}

## Assumption Manifest

| Item | Value | Source |
|------|-------|--------|
${(m?.assumptions ?? []).map(a => `| ${a.item} | ${a.value} | ${a.source} |`).join('\n')}

## Narrative

${data.scoreRationale}

## Key Risks
${(data.keyRisks ?? []).map(r => `- ${r}`).join('\n')}

## Mitigations
${(data.mitigations ?? []).map(r => `- ${r}`).join('\n')}

## Recommendations
${(data.recommendations ?? []).map((r, i) => `${i + 1}. ${r}`).join('\n')}

---
*Financial model: BLS OES wage data · AAUP/CUPA-HR cost benchmarks · Iowa DE Perkins V allocations*
`;
}
