/**
 * Financial Viability Model — Wavelength Program Validator
 *
 * Builds a data-driven P&L model for community college workforce programs.
 * All cost benchmarks are sourced from public data (cited inline).
 * Claude's role: interpret these numbers — NOT invent them.
 *
 * CE (Continuing Education) model — uses seat hours, not credit hours.
 * CE programs are non-credit; no credit-hour conversion needed.
 *
 * PROGRAM TYPE ROUTING (as of 2026-02-20):
 * - Initial Licensure: High tuition ($8K+), long program (1000+ hours), lower volume
 * - Continuing Ed/CEU: Low cost ($150-300), short program (6-20 hours), high volume
 * Regulatory analyst provides programType, which routes to appropriate financial model.
 */

import { getBLSData, getBLSStateData } from '@/lib/apis/bls';

// ─── Cost Benchmarks ─────────────────────────────────────────────────────────
// Source: AAUP, CUPA-HR, and community college budget reports

const COMMUNITY_COLLEGE_COST_BENCHMARKS = {
  // CE programs use seat hours (contact hours) directly — no credit conversion.
  // Instructor cost = totalSeatHours × perHourRate × sectionsPerYear
  // Source: Iowa Board of Pharmacy minimum training hour requirements;
  //         ASHP/ACPE accredited pharmacy tech program standards

  // Lab/clinical setup — one-time capital, range
  // Source: PTCB, ASHP program standards; health program setup averages
  labSetupCost: { low: 15_000, mid: 30_000, high: 60_000 },

  // Annual lab supplies per enrolled student
  // Source: ASHP pharmacy tech program cost surveys
  labSuppliesPerStudent: 150,

  // Program coordinator — fractional FTE at Iowa CC median coordinator salary
  // Source: CUPA-HR Administrative Salary Survey
  coordinatorFTEPortion: 0.25,
  coordinatorAnnualSalary: 45_000,

  // Marketing and recruitment budget — Year 1 launch only
  // Source: Community college enrollment management benchmarks
  marketingYear1: 3_000,

  // Accreditation and regulatory fees — Iowa Board of Pharmacy, etc.
  // Source: Iowa Board of Pharmacy, PTCB program standards
  regulatoryFees: { low: 500, high: 3_000 },

  // Administrative overhead applied to all direct costs
  // Source: NACUBO overhead allocation benchmarks for continuing education
  adminOverheadPct: 0.15,

  // Perkins V annual award for new health workforce certificate program
  // Source: Iowa Department of Education Perkins V state allocations
  perkinsV: { low: 8_000, high: 28_000 },
} as const;

// ─── SOC Code Mapping ─────────────────────────────────────────────────────────

interface SocMapping {
  soc: string;
  label: string;
}

/**
 * Map a program to the closest BLS postsecondary instructor SOC code.
 * Used to pull real adjunct wage data from BLS OES.
 */
export function mapProgramToInstructorSoc(programName: string): SocMapping {
  const name = programName.toLowerCase();

  if (/(pharma|health|medical|nursing|allied health|clinical|dental|optom|radiol|surgical)/i.test(name)) {
    return { soc: '25-1071', label: 'Health Specialties Teachers, Postsecondary' };
  }
  if (/(computer|cyber|it |information tech|software|network|data science)/i.test(name)) {
    return { soc: '25-1021', label: 'Computer Science Teachers, Postsecondary' };
  }
  if (/(business|accounting|finance|management|marketing|entrepreneurship)/i.test(name)) {
    return { soc: '25-1011', label: 'Business Teachers, Postsecondary' };
  }
  if (/(weld|hvac|electric|plumb|construct|auto|mechanic|trade|cte|vocational)/i.test(name)) {
    return { soc: '25-1194', label: 'Vocational Education Teachers, Postsecondary' };
  }
  return { soc: '25-1099', label: 'Postsecondary Teachers, All Other' };
}

// Known-good national fallback medians (BLS OES 2023 data) — used if API unavailable
const BLS_FALLBACK_ANNUAL: Record<string, number> = {
  '25-1071': 64_820, // Health Specialties Teachers (BLS 2023)
  '25-1021': 81_870, // Computer Science Teachers (BLS 2023)
  '25-1011': 80_400, // Business Teachers (BLS 2023)
  '25-1194': 59_240, // Vocational Education Teachers (BLS 2023)
  '25-1099': 63_910, // All Other Postsecondary (BLS 2023)
};

// State wage adjustments vs. national median (approximate, sourced from BLS state profiles)
const STATE_WAGE_ADJUSTMENTS: Record<string, number> = {
  '19': 0.95, // Iowa: ~5% below national median
  '27': 0.97, // Minnesota
  '55': 0.94, // Wisconsin
  '17': 1.01, // Illinois
  '39': 0.96, // Ohio
};

/**
 * Fetch adjunct hourly rate from BLS OES.
 * Returns hourly rate + source citation for assumption manifest.
 */
export async function fetchAdjunctHourlyRate(
  soc: string,
  stateFips?: string
): Promise<{ hourlyRate: number; annualMedian: number; source: string }> {
  let annualMedian: number | null = null;
  let source = '';

  // Try state-level first
  if (stateFips) {
    try {
      const stateData = await getBLSStateData(soc, stateFips);
      if (stateData?.median_wage && stateData.median_wage > 10_000) {
        annualMedian = stateData.median_wage;
        source = `BLS OES SOC ${soc} — State FIPS ${stateFips} median (${stateData.year})`;
      }
    } catch {
      // Fall through to national
    }
  }

  // Fall back to national
  if (!annualMedian) {
    try {
      const national = await getBLSData(soc);
      if (national?.median_wage && national.median_wage > 10_000) {
        annualMedian = national.median_wage;
        const stateAdj = stateFips ? (STATE_WAGE_ADJUSTMENTS[stateFips] ?? 1.0) : 1.0;
        annualMedian = Math.round(annualMedian * stateAdj);
        const adjLabel = stateFips ? ` (${Math.round((stateAdj - 1) * 100)}% state adj)` : '';
        source = `BLS OES SOC ${soc} — national median${adjLabel} (${national.year})`;
      }
    } catch {
      // Fall through to hardcoded
    }
  }

  // Final fallback — hardcoded BLS 2023 values
  if (!annualMedian) {
    const fallback = BLS_FALLBACK_ANNUAL[soc] ?? 64_820;
    const stateAdj = stateFips ? (STATE_WAGE_ADJUSTMENTS[stateFips] ?? 1.0) : 1.0;
    annualMedian = Math.round(fallback * stateAdj);
    source = `BLS OES SOC ${soc} — hardcoded 2023 median${stateFips ? ` (Iowa-adjusted)` : ''} [API unavailable]`;
  }

  const hourlyRate = Math.round((annualMedian / 2080) * 100) / 100;
  return { hourlyRate, annualMedian, source };
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FinancialModelInputs {
  programName: string;
  tuitionEstimate: number;          // per student, per cohort
  cohortSize: number;               // target first-year cohort
  // CE programs use seat hours (contact hours) — no credit-hour conversion
  totalSeatHours: number;           // total program contact hours (from state board reqs or competitor programs)
  totalSeatHoursSource: string;     // e.g. "Iowa Board of Pharmacy minimum requirement" or "DMACC program schedule"
  sectionsPerYear: number;          // how many times the program runs per year (default 2)
  adjunctHourlyRate: number;        // from BLS lookup
  adjunctHourlyRateSource: string;
  hasExistingLabSpace: boolean;
  perkinsEligible: boolean;
  deliveryFormat: 'in-person' | 'hybrid' | 'online';
  stateFips?: string;               // for state-specific BLS lookup
  // Optional client overrides
  clientAdjunctRate?: number;
  clientCohortSize?: number;
}

export interface YearlyProjection {
  year: number;
  enrollment: number;
  revenue: {
    tuition: number;
    perkinsV: number;
    total: number;
  };
  expenses: {
    instructorCost: number;
    labSetup: number;      // Year 1 only
    labSupplies: number;
    coordinatorCost: number;
    marketing: number;     // Year 1 only
    regulatory: number;
    adminOverhead: number;
    total: number;
  };
  netPosition: number;
  margin: number;          // % (net / revenue)
}

export interface FinancialModelOutput {
  assumptions: Array<{ item: string; value: string; source: string }>;
  scenarios: {
    pessimistic: YearlyProjection; // 60% of target enrollment
    base: YearlyProjection;        // 85% of target enrollment
    optimistic: YearlyProjection;  // 100% of target enrollment
  };
  // 3-year projections (base scenario)
  year2Base: YearlyProjection;
  year3Base: YearlyProjection;
  // Full scenario matrix
  year2Pessimistic: YearlyProjection;
  year2Optimistic: YearlyProjection;
  year3Pessimistic: YearlyProjection;
  year3Optimistic: YearlyProjection;
  breakEvenEnrollment: number;
  perkinsImpact: string;
  year1NetPosition: number;   // base scenario
  viabilityScore: number;     // 1–10, algorithmic
  viabilityRationale: string;
}

// ─── Core Model ──────────────────────────────────────────────────────────────

function computeYearProjection(
  inputs: FinancialModelInputs,
  year: number,
  enrollmentOverride: number
): YearlyProjection {
  const bm = COMMUNITY_COLLEGE_COST_BENCHMARKS;
  const enrollment = Math.round(enrollmentOverride);
  const effectiveRate = inputs.clientAdjunctRate ?? inputs.adjunctHourlyRate;

  // Revenue
  const tuitionRevenue = enrollment * inputs.tuitionEstimate;
  const perkinsRevenue = inputs.perkinsEligible
    ? Math.round((bm.perkinsV.low + bm.perkinsV.high) / 2)
    : 0;
  const totalRevenue = tuitionRevenue + perkinsRevenue;

  // Expenses
  // CE model: instructor cost = totalSeatHours × hourlyRate × sectionsPerYear
  // No credit-hour conversion — CE programs use seat hours directly
  const instructorCost = Math.round(
    inputs.totalSeatHours * effectiveRate * inputs.sectionsPerYear
  );
  const labSetup = year === 1 && !inputs.hasExistingLabSpace
    ? bm.labSetupCost.mid
    : 0;
  const labSupplies = enrollment * bm.labSuppliesPerStudent;
  const coordinatorCost = Math.round(bm.coordinatorFTEPortion * bm.coordinatorAnnualSalary);
  const marketing = year === 1 ? bm.marketingYear1 : 0;
  const regulatory = Math.round((bm.regulatoryFees.low + bm.regulatoryFees.high) / 2);

  const directCosts =
    instructorCost + labSetup + labSupplies + coordinatorCost + marketing + regulatory;
  const adminOverhead = Math.round(directCosts * bm.adminOverheadPct);
  const totalExpenses = directCosts + adminOverhead;

  const netPosition = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? netPosition / totalRevenue : 0;

  return {
    year,
    enrollment,
    revenue: {
      tuition: tuitionRevenue,
      perkinsV: perkinsRevenue,
      total: totalRevenue,
    },
    expenses: {
      instructorCost,
      labSetup,
      labSupplies,
      coordinatorCost,
      marketing,
      regulatory,
      adminOverhead,
      total: totalExpenses,
    },
    netPosition,
    margin,
  };
}

function computeBreakEvenEnrollment(
  inputs: FinancialModelInputs
): number {
  const bm = COMMUNITY_COLLEGE_COST_BENCHMARKS;
  const effectiveRate = inputs.clientAdjunctRate ?? inputs.adjunctHourlyRate;

  // Fixed costs (Year 1, not enrollment-dependent)
  // CE model: instructor cost = totalSeatHours × hourlyRate × sectionsPerYear
  const instructorCost = inputs.totalSeatHours * effectiveRate * inputs.sectionsPerYear;
  const labSetup = !inputs.hasExistingLabSpace ? bm.labSetupCost.mid : 0;
  const coordinatorCost = bm.coordinatorFTEPortion * bm.coordinatorAnnualSalary;
  const marketing = bm.marketingYear1;
  const regulatory = (bm.regulatoryFees.low + bm.regulatoryFees.high) / 2;
  const fixedDirect = instructorCost + labSetup + coordinatorCost + marketing + regulatory;

  // Variable per student
  const variablePerStudent = bm.labSuppliesPerStudent;

  // Overhead applied to all direct costs
  const overheadFactor = 1 + bm.adminOverheadPct;

  // Perkins V revenue (fixed, not per-student)
  const perkinsRevenue = inputs.perkinsEligible
    ? (bm.perkinsV.low + bm.perkinsV.high) / 2
    : 0;

  // Break-even: tuition*n + perkins = (fixedDirect + variable*n) * overhead
  // tuition*n + perkins = fixedDirect*overhead + variable*overhead*n
  // n * (tuition - variable*overhead) = fixedDirect*overhead - perkins
  // n = (fixedDirect*overhead - perkins) / (tuition - variable*overhead)

  const numerator = fixedDirect * overheadFactor - perkinsRevenue;
  const denominator = inputs.tuitionEstimate - variablePerStudent * overheadFactor;

  if (denominator <= 0) return inputs.cohortSize; // degenerate case

  return Math.max(1, Math.ceil(numerator / denominator));
}

function computeViabilityScore(
  year1Base: YearlyProjection,
  year2Base: YearlyProjection,
  year3Base: YearlyProjection,
  breakEven: number,
  inputs: FinancialModelInputs
): { score: number; rationale: string } {
  let score = 0;
  const notes: string[] = [];

  // Year 3 margin ≥ 20%
  if (year3Base.margin >= 0.20) {
    score += 3;
    notes.push(`Year 3 margin ${(year3Base.margin * 100).toFixed(1)}% ≥ 20% threshold (+3)`);
  } else {
    notes.push(`Year 3 margin ${(year3Base.margin * 100).toFixed(1)}% below 20% threshold (+0)`);
  }

  // Break-even enrollment ≤ 60% of target cohort
  const breakEvenPct = breakEven / inputs.cohortSize;
  if (breakEvenPct <= 0.60) {
    score += 2;
    notes.push(`Break-even at ${breakEven} students = ${(breakEvenPct * 100).toFixed(0)}% of target ≤ 60% (+2)`);
  } else {
    notes.push(`Break-even at ${breakEven} students = ${(breakEvenPct * 100).toFixed(0)}% of target > 60% (+0)`);
  }

  // Perkins V covers ≥ 50% of Year 1 gap (without Perkins)
  if (inputs.perkinsEligible) {
    const perkinsAmount = year1Base.revenue.perkinsV;
    const year1NetWithoutPerkins = year1Base.netPosition - perkinsAmount;
    const year1GapWithoutPerkins = Math.abs(Math.min(0, year1NetWithoutPerkins));
    if (year1GapWithoutPerkins === 0 || perkinsAmount >= year1GapWithoutPerkins * 0.5) {
      score += 1;
      notes.push(`Perkins V $${perkinsAmount.toLocaleString()} covers ${year1GapWithoutPerkins === 0 ? '100%' : Math.round((perkinsAmount / year1GapWithoutPerkins) * 100) + '%'} of Year 1 gap (+1)`);
    } else {
      notes.push(`Perkins V covers only ${Math.round((perkinsAmount / year1GapWithoutPerkins) * 100)}% of Year 1 gap (+0)`);
    }
  }

  // Year 2 net positive
  if (year2Base.netPosition > 0) {
    score += 2;
    notes.push(`Year 2 net position $${year2Base.netPosition.toLocaleString()} > 0 (+2)`);
  } else {
    notes.push(`Year 2 net position $${year2Base.netPosition.toLocaleString()} not positive (+0)`);
  }

  // Year 1 net loss ≤ $15K (or profitable)
  const year1Loss = Math.max(0, -year1Base.netPosition);
  if (year1Loss <= 15_000) {
    score += 1;
    notes.push(`Year 1 loss $${year1Loss.toLocaleString()} ≤ $15,000 (+1)`);
  } else {
    notes.push(`Year 1 loss $${year1Loss.toLocaleString()} > $15,000 (+0)`);
  }

  // Online/hybrid delivery
  if (inputs.deliveryFormat === 'online' || inputs.deliveryFormat === 'hybrid') {
    score += 1;
    notes.push(`${inputs.deliveryFormat} delivery — lower overhead (+1)`);
  }

  const finalScore = Math.max(1, Math.min(10, score));

  // Pre-curriculum caveat — score is indicative until Stage 3 seat-time breakdown is available
  const caveat = `Indicative score (±1–2 pts pre-curriculum): instruction cost uses BLS benchmark ` +
    `($${inputs.adjunctHourlyRate.toFixed(2)}/hr × ${inputs.totalSeatHours} seat hrs × ${inputs.sectionsPerYear} sections/yr) ` +
    `and will be recomputed from actual seat-time breakdown after curriculum design.`;

  const rationale = notes.join('; ') + '. ' + caveat;

  return { score: finalScore, rationale };
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

/**
 * Build a complete financial P&L model for a community college CE program.
 * Returns structured output for both display tables and Claude interpretation.
 *
 * CE programs use seat hours (contact hours) — no credit hour conversion.
 */
export function buildFinancialModel(inputs: FinancialModelInputs): FinancialModelOutput {
  const targetCohort = inputs.clientCohortSize ?? inputs.cohortSize;

  // Year 1 scenarios
  const pessY1 = computeYearProjection(inputs, 1, targetCohort * 0.60);
  const baseY1  = computeYearProjection(inputs, 1, targetCohort * 0.85);
  const optY1   = computeYearProjection(inputs, 1, targetCohort * 1.00);

  // Year 2 (no lab setup, +20% from Year 1)
  const pessY2 = computeYearProjection(inputs, 2, pessY1.enrollment * 1.20);
  const baseY2  = computeYearProjection(inputs, 2, baseY1.enrollment * 1.20);
  const optY2   = computeYearProjection(inputs, 2, optY1.enrollment * 1.20);

  // Year 3 (+15% from Year 2)
  const pessY3 = computeYearProjection(inputs, 3, pessY2.enrollment * 1.15);
  const baseY3  = computeYearProjection(inputs, 3, baseY2.enrollment * 1.15);
  const optY3   = computeYearProjection(inputs, 3, optY2.enrollment * 1.15);

  const breakEven = computeBreakEvenEnrollment(inputs);
  const { score, rationale } = computeViabilityScore(baseY1, baseY2, baseY3, breakEven, inputs);

  const perkinsAmount = inputs.perkinsEligible
    ? Math.round((COMMUNITY_COLLEGE_COST_BENCHMARKS.perkinsV.low + COMMUNITY_COLLEGE_COST_BENCHMARKS.perkinsV.high) / 2)
    : 0;
  const year1NetWithoutPerkins = baseY1.netPosition - perkinsAmount;
  const year1GapWithoutPerkins = Math.max(0, -year1NetWithoutPerkins);
  const perkinsImpact = inputs.perkinsEligible
    ? (year1GapWithoutPerkins > 0
        ? `Perkins V funding ($${perkinsAmount.toLocaleString()}/yr) converts Year 1 from a ` +
          `-$${year1GapWithoutPerkins.toLocaleString()} loss ` +
          `to a +$${baseY1.netPosition.toLocaleString()} surplus at base enrollment`
        : `Perkins V funding ($${perkinsAmount.toLocaleString()}/yr) boosts Year 1 from ` +
          `+$${year1NetWithoutPerkins.toLocaleString()} to +$${baseY1.netPosition.toLocaleString()} at base enrollment`)
    : 'Program is not Perkins V eligible — no grant offset applied';

  // Assumption manifest
  const adjRate = inputs.clientAdjunctRate ?? inputs.adjunctHourlyRate;
  const assumptions: Array<{ item: string; value: string; source: string }> = [
    {
      item: 'Instructor Rate ($/hr)',
      value: `$${adjRate.toFixed(2)}/hr`,
      source: inputs.adjunctHourlyRateSource,
    },
    {
      item: 'Total Seat Hours',
      value: `${inputs.totalSeatHours} hrs`,
      source: inputs.totalSeatHoursSource,
    },
    {
      item: 'Sections per Year',
      value: `${inputs.sectionsPerYear} sections`,
      source: 'CE program scheduling — fall + spring cohorts',
    },
    {
      item: 'Instructor Cost (annual)',
      value: `$${Math.round(adjRate * inputs.totalSeatHours * inputs.sectionsPerYear).toLocaleString()} (${inputs.totalSeatHours} hrs × $${adjRate.toFixed(0)}/hr × ${inputs.sectionsPerYear} sections)`,
      source: 'Seat-hour model — BLS OES rate × actual contact hours × sections run per year',
    },
    {
      item: 'Target Cohort Size',
      value: `${targetCohort} students`,
      source: 'Peer benchmark — DMACC, Hawkeye CC program data',
    },
    {
      item: 'Tuition (per student)',
      value: `$${inputs.tuitionEstimate.toLocaleString()}`,
      source: 'Iowa community college CE market rate analysis',
    },
    {
      item: 'Lab Setup Cost (mid estimate)',
      value: `$${COMMUNITY_COLLEGE_COST_BENCHMARKS.labSetupCost.mid.toLocaleString()}`,
      source: 'PTCB / ASHP pharmacy tech program standards',
    },
    {
      item: 'Lab Supplies per Student',
      value: `$${COMMUNITY_COLLEGE_COST_BENCHMARKS.labSuppliesPerStudent}/student/yr`,
      source: 'ASHP pharmacy program cost surveys',
    },
    {
      item: 'Program Coordinator Cost',
      value: `$${Math.round(COMMUNITY_COLLEGE_COST_BENCHMARKS.coordinatorFTEPortion * COMMUNITY_COLLEGE_COST_BENCHMARKS.coordinatorAnnualSalary).toLocaleString()}/yr (0.25 FTE)`,
      source: 'CUPA-HR Administrative Salary Survey (Iowa median)',
    },
    {
      item: 'Marketing Budget (Year 1)',
      value: `$${COMMUNITY_COLLEGE_COST_BENCHMARKS.marketingYear1.toLocaleString()}`,
      source: 'CC enrollment management benchmarks',
    },
    {
      item: 'Regulatory Fees',
      value: `$${Math.round((COMMUNITY_COLLEGE_COST_BENCHMARKS.regulatoryFees.low + COMMUNITY_COLLEGE_COST_BENCHMARKS.regulatoryFees.high) / 2).toLocaleString()} (midpoint)`,
      source: 'Iowa Board of Pharmacy, PTCB program standards',
    },
    {
      item: 'Admin Overhead Rate',
      value: `${COMMUNITY_COLLEGE_COST_BENCHMARKS.adminOverheadPct * 100}% of direct costs`,
      source: 'NACUBO continuing education overhead benchmarks',
    },
    {
      item: 'Perkins V Award',
      value: inputs.perkinsEligible
        ? `$${perkinsAmount.toLocaleString()}/yr (midpoint $${COMMUNITY_COLLEGE_COST_BENCHMARKS.perkinsV.low.toLocaleString()}–$${COMMUNITY_COLLEGE_COST_BENCHMARKS.perkinsV.high.toLocaleString()})`
        : 'Not eligible',
      source: 'Iowa Dept. of Education Perkins V state allocations',
    },
    {
      item: 'Enrollment Scenarios',
      value: 'Pessimistic 60% · Base 85% · Optimistic 100% of target',
      source: 'CC program launch benchmark (Year 1 ramp standard)',
    },
    {
      item: 'Year 2 Enrollment Growth',
      value: '+20% vs. Year 1',
      source: 'Peer program growth trajectory (DMACC, Hawkeye)',
    },
    {
      item: 'Year 3 Enrollment Growth',
      value: '+15% vs. Year 2',
      source: 'Peer program growth trajectory (DMACC, Hawkeye)',
    },
    {
      item: 'Existing Lab Space',
      value: inputs.hasExistingLabSpace ? 'Yes — no capital setup cost' : 'No — $30,000 Year 1 setup',
      source: 'Client project input',
    },
  ];

  return {
    assumptions,
    scenarios: {
      pessimistic: pessY1,
      base: baseY1,
      optimistic: optY1,
    },
    year2Base: baseY2,
    year3Base: baseY3,
    year2Pessimistic: pessY2,
    year2Optimistic: optY2,
    year3Pessimistic: pessY3,
    year3Optimistic: optY3,
    breakEvenEnrollment: breakEven,
    perkinsImpact,
    year1NetPosition: baseY1.netPosition,
    viabilityScore: score,
    viabilityRationale: rationale,
  };
}

// ─── CEU / Continuing Education Financial Model ─────────────────────────────

/**
 * Build financial model for continuing education / re-licensure programs.
 * 
 * Key differences from full program model:
 * - Low tuition ($150-300 per student)
 * - Short duration (6-20 contact hours)
 * - High volume (100-300 students per year across multiple sections)
 * - Minimal equipment/lab costs
 * - Focus on margin per section vs. cohort sustainability
 * 
 * Example: Cosmetology CEU renewal (6 hours, $155, 200 students/year)
 */
export function buildCEUFinancialModel(inputs: {
  programName: string;
  tuitionPerStudent: number; // e.g., $155
  contactHours: number; // e.g., 6
  studentsPerSection: number; // e.g., 25
  sectionsPerYear: number; // e.g., 8 (run frequently for high volume)
  instructorHourlyRate: number;
  deliveryFormat: 'in-person' | 'hybrid' | 'online';
}): FinancialModelOutput {
  const { tuitionPerStudent, contactHours, studentsPerSection, sectionsPerYear, instructorHourlyRate } = inputs;

  // Revenue calculations
  const totalStudentsYear1 = studentsPerSection * sectionsPerYear;
  const tuitionRevenueYear1 = totalStudentsYear1 * tuitionPerStudent;

  // Cost calculations (minimal overhead for CEU programs)
  const instructorCostPerSection = contactHours * instructorHourlyRate;
  const totalInstructorCost = instructorCostPerSection * sectionsPerYear;
  
  // Materials per student (printed handouts, certificates, etc.)
  const materialsPerStudent = 5; // $5 per student for handouts
  const totalMaterialsCost = totalStudentsYear1 * materialsPerStudent;
  
  // Coordinator overhead (fractional - CEU programs don't need dedicated staff)
  const coordinatorOverhead = 2000; // ~$2K/year for scheduling/registration
  
  // Marketing (minimal for CEU - mostly word of mouth + state board listings)
  const marketingCost = 500;
  
  // Regulatory (if state-approved CEU provider)
  const regulatoryCost = 300;
  
  // Total expenses
  const totalExpensesYear1 = totalInstructorCost + totalMaterialsCost + coordinatorOverhead + marketingCost + regulatoryCost;
  
  // Net position
  const netPositionYear1 = tuitionRevenueYear1 - totalExpensesYear1;
  const marginYear1 = netPositionYear1 / tuitionRevenueYear1;
  
  // Year 2-3 projections (assume 10% growth per year as word spreads)
  const totalStudentsYear2 = Math.round(totalStudentsYear1 * 1.10);
  const totalStudentsYear3 = Math.round(totalStudentsYear2 * 1.10);
  
  const tuitionRevenueYear2 = totalStudentsYear2 * tuitionPerStudent;
  const tuitionRevenueYear3 = totalStudentsYear3 * tuitionPerStudent;
  
  // Expenses scale linearly with student count (more sections needed)
  const sectionsYear2 = Math.ceil(totalStudentsYear2 / studentsPerSection);
  const sectionsYear3 = Math.ceil(totalStudentsYear3 / studentsPerSection);
  
  const totalExpensesYear2 = 
    (contactHours * instructorHourlyRate * sectionsYear2) +
    (totalStudentsYear2 * materialsPerStudent) +
    coordinatorOverhead +
    marketingCost +
    regulatoryCost;
    
  const totalExpensesYear3 = 
    (contactHours * instructorHourlyRate * sectionsYear3) +
    (totalStudentsYear3 * materialsPerStudent) +
    coordinatorOverhead +
    marketingCost +
    regulatoryCost;
  
  const netPositionYear2 = tuitionRevenueYear2 - totalExpensesYear2;
  const netPositionYear3 = tuitionRevenueYear3 - totalExpensesYear3;
  
  const marginYear2 = netPositionYear2 / tuitionRevenueYear2;
  const marginYear3 = netPositionYear3 / tuitionRevenueYear3;
  
  // Build output format matching full program model
  const baseY1: YearlyProjection = {
    year: 1,
    enrollment: totalStudentsYear1,
    revenue: {
      tuition: tuitionRevenueYear1,
      perkinsV: 0, // CEU programs typically don't qualify for Perkins
      total: tuitionRevenueYear1,
    },
    expenses: {
      instructorCost: totalInstructorCost,
      labSetup: 0, // CEU programs don't need lab setup
      labSupplies: totalMaterialsCost,
      coordinatorCost: coordinatorOverhead,
      marketing: marketingCost,
      regulatory: regulatoryCost,
      adminOverhead: 0, // Minimal for CEU
      total: totalExpensesYear1,
    },
    netPosition: netPositionYear1,
    margin: marginYear1,
  };

  const baseY2: YearlyProjection = {
    year: 2,
    enrollment: totalStudentsYear2,
    revenue: { tuition: tuitionRevenueYear2, perkinsV: 0, total: tuitionRevenueYear2 },
    expenses: {
      instructorCost: contactHours * instructorHourlyRate * sectionsYear2,
      labSetup: 0,
      labSupplies: totalStudentsYear2 * materialsPerStudent,
      coordinatorCost: coordinatorOverhead,
      marketing: marketingCost,
      regulatory: regulatoryCost,
      adminOverhead: 0,
      total: totalExpensesYear2,
    },
    netPosition: netPositionYear2,
    margin: marginYear2,
  };

  const baseY3: YearlyProjection = {
    year: 3,
    enrollment: totalStudentsYear3,
    revenue: { tuition: tuitionRevenueYear3, perkinsV: 0, total: tuitionRevenueYear3 },
    expenses: {
      instructorCost: contactHours * instructorHourlyRate * sectionsYear3,
      labSetup: 0,
      labSupplies: totalStudentsYear3 * materialsPerStudent,
      coordinatorCost: coordinatorOverhead,
      marketing: marketingCost,
      regulatory: regulatoryCost,
      adminOverhead: 0,
      total: totalExpensesYear3,
    },
    netPosition: netPositionYear3,
    margin: marginYear3,
  };

  // Break-even: very low for CEU programs (typically 5-10 students)
  const fixedCosts = coordinatorOverhead + marketingCost + regulatoryCost;
  const variableCostPerStudent = materialsPerStudent + (instructorCostPerSection / studentsPerSection);
  const contributionMargin = tuitionPerStudent - variableCostPerStudent;
  const breakEven = Math.ceil(fixedCosts / contributionMargin);

  // Viability score for CEU programs (different criteria than full programs)
  let score = 10; // Start optimistic - CEU programs are usually profitable
  let rationale = '';
  
  if (marginYear1 < 0.50) {
    score -= 3;
    rationale += `Year 1 margin ${(marginYear1 * 100).toFixed(1)}% below 50% target for CEU programs. `;
  } else {
    rationale += `Year 1 margin ${(marginYear1 * 100).toFixed(1)}% exceeds 50% — strong profitability. `;
  }
  
  if (netPositionYear1 < 5000) {
    score -= 2;
    rationale += `Year 1 net $${netPositionYear1.toLocaleString()} below $5K minimum threshold. `;
  } else {
    rationale += `Year 1 net $${netPositionYear1.toLocaleString()} exceeds $5K minimum. `;
  }
  
  if (breakEven > 15) {
    score -= 2;
    rationale += `Break-even ${breakEven} students seems high for CEU model. `;
  } else {
    rationale += `Break-even ${breakEven} students — easily achievable. `;
  }

  rationale += `CEU programs are low-overhead, high-margin offerings ideal for community college CE portfolios.`;

  return {
    scenarios: {
      base: baseY1,
      pessimistic: baseY1, // CEU models don't typically need pessimistic scenarios
      optimistic: baseY1,
    },
    year2Base: baseY2,
    year3Base: baseY3,
    year2Pessimistic: baseY2,
    year2Optimistic: baseY2,
    year3Pessimistic: baseY3,
    year3Optimistic: baseY3,
    breakEvenEnrollment: breakEven,
    perkinsImpact: 'Not applicable — CEU programs typically do not qualify for Perkins V funding',
    year1NetPosition: netPositionYear1,
    viabilityScore: Math.max(1, Math.min(10, score)),
    viabilityRationale: rationale,
    assumptions: [
      { item: 'Tuition per student', value: `$${tuitionPerStudent}`, source: 'Project input' },
      { item: 'Contact hours', value: `${contactHours} hours`, source: 'Program specification' },
      { item: 'Students per section', value: `${studentsPerSection}`, source: 'CEU model standard' },
      { item: 'Sections per year', value: `${sectionsPerYear}`, source: 'Project input' },
      { item: 'Instructor hourly rate', value: `$${instructorHourlyRate.toFixed(2)}/hour`, source: 'BLS postsecondary instructor median' },
      { item: 'Materials per student', value: `$${materialsPerStudent}`, source: 'CEU model benchmark (handouts, certificates)' },
      { item: 'Coordinator overhead', value: `$${coordinatorOverhead}/year`, source: 'CEU model benchmark (fractional)' },
      { item: 'Marketing budget', value: `$${marketingCost}/year`, source: 'CEU model benchmark (word-of-mouth dominant)' },
      { item: 'Year 2-3 growth', value: '10% annually', source: 'CEU model assumption (as word spreads among licensed professionals)' },
    ],
  };
}

/**
 * Convenience: fetch BLS rate and run model in one call.
 * Used by the financial analyst agent.
 * 
 * Now routes to appropriate model based on programType from regulatory analyst.
 */
export async function buildFinancialModelWithBLS(
  programName: string,
  inputs: Omit<FinancialModelInputs, 'adjunctHourlyRate' | 'adjunctHourlyRateSource'>,
  programType?: 'initial_licensure' | 'continuing_education' | 'non_licensed' | 'unclear'
): Promise<FinancialModelOutput> {
  const socMapping = mapProgramToInstructorSoc(programName);
  const { hourlyRate, source } = await fetchAdjunctHourlyRate(socMapping.soc, inputs.stateFips);

  // Route to appropriate financial model based on program type
  if (programType === 'continuing_education') {
    // CEU/Re-licensure model: low cost, high volume, short duration
    return buildCEUFinancialModel({
      programName,
      tuitionPerStudent: inputs.tuitionEstimate,
      contactHours: inputs.totalSeatHours,
      studentsPerSection: 25, // Typical CEU class size
      sectionsPerYear: inputs.sectionsPerYear,
      instructorHourlyRate: hourlyRate,
      deliveryFormat: inputs.deliveryFormat,
    });
  }

  // Default: Full program model (initial licensure or non-licensed long programs)
  return buildFinancialModel({
    ...inputs,
    adjunctHourlyRate: hourlyRate,
    adjunctHourlyRateSource: source,
  });
}
