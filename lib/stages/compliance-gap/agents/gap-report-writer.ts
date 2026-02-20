/**
 * Compliance Gap: Gap Analyzer + Report Writer Agent
 *
 * Takes current programs offered by a college and the full list of
 * state-mandated programs, cross-references them, sizes the revenue
 * opportunity for each gap, and produces a professional consulting
 * report in Markdown.
 *
 * Report sections:
 *   1. Executive Summary
 *   2. Compliance Overview
 *   3. Gap Analysis Table
 *   4. Revenue Opportunity Sizing
 *   5. Recommendations
 *   6. Methodology
 */

import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { fetchCompetitorPricing } from '@/lib/agents/researchers/competitor-analyst';
import type {
  CatalogScanOutput,
  RegulatoryScanOutput,
  MandatedProgram,
  GapItem,
  ComplianceGapStats,
  OfferedProgram,
} from '../types';
import { normalizeProgramName } from './catalog-scanner';
import { socToCip, getCrosswalkData } from '@/lib/mappings/soc-cip-crosswalk';

/** Best-effort CIP lookup by occupation name when no SOC code is available */
function findCipByOccupation(occupation: string): { cipCode: string; cipTitle: string } | null {
  const norm = occupation.toLowerCase();
  const crosswalk = getCrosswalkData();
  // Try matching SOC title first, then CIP title
  const match = crosswalk.find(e =>
    norm.includes(e.socTitle.toLowerCase().split(',')[0]) ||
    e.socTitle.toLowerCase().includes(norm.split(/\s+/).slice(0, 2).join(' '))
  );
  return match ? { cipCode: match.cipCode, cipTitle: match.cipTitle } : null;
}

// ── Fuzzy Matching Helpers ──

/**
 * Returns true if the mandated program appears to be covered by
 * any of the college's current offerings.
 */
function isAlreadyOffered(
  mandate: MandatedProgram,
  offeredPrograms: OfferedProgram[],
): boolean {
  const mandateNorm = normalizeProgramName(mandate.occupation);

  // Key terms that must be present in a matching program
  const mandateKeywords = extractKeywords(mandateNorm);

  for (const offered of offeredPrograms) {
    const offeredKeywords = extractKeywords(offered.normalizedName);
    // If the mandate's top keyword appears in the offered program name — it's a match
    if (mandateKeywords.some(kw => offered.normalizedName.includes(kw))) {
      return true;
    }
    // Check reverse: offered name keywords in mandate
    if (offeredKeywords.some(kw => mandateNorm.includes(kw))) {
      return true;
    }
  }
  return false;
}

function extractKeywords(name: string): string[] {
  // Stopwords to ignore
  const stopwords = new Set([
    'a', 'an', 'the', 'and', 'or', 'of', 'for', 'in', 'to', 'with',
    'program', 'training', 'course', 'certification', 'certificate',
    'license', 'licensed', 'certified', 'technician', 'technology',
  ]);
  return name
    .split(' ')
    .filter(w => w.length > 3 && !stopwords.has(w));
}

// ── Revenue Sizing ──
// 
// Revenue model grounded in realistic CE program operations:
// - Cohort sizes: 12-18 for hands-on/lab programs, 18-25 for classroom-based
// - New programs typically run 1-2 cohorts in year 1, scaling to 2-3 by year 2-3
// - High demand ≠ huge cohorts. It means easier to fill, not larger classes.
// - Facility/instructor constraints are real — you can't run 60 cosmetology
//   students through a 10-chair salon.

/**
 * Realistic cohort size based on program type and demand.
 * Hands-on programs (cosmetology, trades, healthcare) have smaller cohorts
 * due to lab/equipment constraints. Classroom-based programs can be larger.
 */
function getRealisticCohortSize(mandate: MandatedProgram): number {
  const handsOnKeywords = [
    'barber', 'cosmetolog', 'esthetician', 'nail', 'massage',
    'cna', 'nurse aide', 'emt', 'paramedic', 'phlebotom',
    'cdl', 'driver', 'hvac', 'electric', 'plumb', 'weld',
    'pharmacy tech', 'surgical', 'dental', 'dialysis',
  ];
  const isHandsOn = handsOnKeywords.some(kw =>
    mandate.occupation.toLowerCase().includes(kw)
  );

  if (isHandsOn) {
    // Lab/clinical programs: 12-18 students per cohort
    return mandate.demandLevel === 'high' ? 16 : mandate.demandLevel === 'medium' ? 14 : 12;
  }
  // Classroom-based (real estate, insurance, food safety, mandatory reporter):
  return mandate.demandLevel === 'high' ? 25 : mandate.demandLevel === 'medium' ? 20 : 15;
}

/**
 * Realistic cohorts per year for a NEW program.
 * Year 1 is always conservative. The rationale field explains the ramp.
 */
function getCohortsPerYear(mandate: MandatedProgram): { year1: number; year2: number } {
  // Short programs (<80 hours) can run more frequently
  if (mandate.clockHours > 0 && mandate.clockHours <= 80) {
    return mandate.demandLevel === 'high'
      ? { year1: 3, year2: 4 }
      : { year1: 2, year2: 3 };
  }
  // Medium programs (80-300 hours)
  if (mandate.clockHours <= 300) {
    return mandate.demandLevel === 'high'
      ? { year1: 2, year2: 3 }
      : { year1: 1, year2: 2 };
  }
  // Long programs (300+ hours — cosmetology, barber, etc.)
  return mandate.demandLevel === 'high'
    ? { year1: 2, year2: 2 }
    : { year1: 1, year2: 2 };
}

/**
 * Estimate annual revenue for a mandated program not currently offered.
 * Uses realistic cohort sizes and conservative Year 1 ramp assumptions.
 */
function estimateRevenue(mandate: MandatedProgram): {
  cohortSize: number;
  tuitionPerStudent: number;
  annualRevenue: number;
  year2Revenue: number;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
} {
  const cohortSize = getRealisticCohortSize(mandate);
  const cohorts = getCohortsPerYear(mandate);

  // Tuition estimate based on clock hours
  // Short courses: $10-15/hr, longer programs: $8-12/hr (volume discount effect)
  const hourlyRate = mandate.clockHours <= 100 ? 12 : mandate.clockHours <= 300 ? 10 : 8;
  const baseTuition = Math.max(
    250,
    Math.round(mandate.clockHours * hourlyRate / 50) * 50,
  );
  const tuitionPerStudent = Math.min(baseTuition, 8000);

  const annualRevenue = cohortSize * cohorts.year1 * tuitionPerStudent;
  const year2Revenue = cohortSize * cohorts.year2 * tuitionPerStudent;

  const confidence: 'high' | 'medium' | 'low' =
    mandate.demandLevel === 'high' && mandate.clockHours > 0 ? 'medium' : 'low';

  const rationale =
    `Year 1: ${cohortSize} students/cohort × ${cohorts.year1} cohort(s) × ` +
    `$${tuitionPerStudent.toLocaleString()} = $${annualRevenue.toLocaleString()} | ` +
    `Year 2+: ${cohortSize} × ${cohorts.year2} cohort(s) = $${year2Revenue.toLocaleString()} ` +
    `(${mandate.demandLevel} demand, ${mandate.clockHours} clock hours)`;

  return { cohortSize, tuitionPerStudent, annualRevenue, year2Revenue, confidence, rationale };
}

/**
 * Market-rate revenue estimation — uses real competitor pricing from web search
 * combined with realistic cohort sizing.
 */
function estimateRevenueWithMarketRate(mandate: MandatedProgram, marketTuition: number): {
  cohortSize: number;
  tuitionPerStudent: number;
  annualRevenue: number;
  year2Revenue: number;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
} {
  const cohortSize = getRealisticCohortSize(mandate);
  const cohorts = getCohortsPerYear(mandate);
  const annualRevenue = cohortSize * cohorts.year1 * marketTuition;
  const year2Revenue = cohortSize * cohorts.year2 * marketTuition;

  return {
    cohortSize,
    tuitionPerStudent: marketTuition,
    annualRevenue,
    year2Revenue,
    confidence: 'medium',
    rationale:
      `Year 1: ${cohortSize} students/cohort × ${cohorts.year1} cohort(s) × ` +
      `$${marketTuition.toLocaleString()} (market rate) = $${annualRevenue.toLocaleString()} | ` +
      `Year 2+: ${cohortSize} × ${cohorts.year2} = $${year2Revenue.toLocaleString()}`,
  };
}

// ── Opportunity Scoring ──

function scoreOpportunity(mandate: MandatedProgram, revenueEstimate: number): number {
  let score = 5; // baseline

  // Demand level
  if (mandate.demandLevel === 'high') score += 3;
  else if (mandate.demandLevel === 'medium') score += 1;
  else score -= 1;

  // Revenue potential (realistic CE program revenue thresholds)
  if (revenueEstimate >= 100000) score += 2;
  else if (revenueEstimate >= 50000) score += 1;
  else if (revenueEstimate < 15000) score -= 1;

  // Renewal CE demand (recurring revenue)
  if (mandate.renewalRequired) score += 1;

  // Program fits noncredit sweet spot (not too short, not too long)
  if (mandate.clockHours >= 40 && mandate.clockHours <= 600) score += 1;

  return Math.min(10, Math.max(1, score));
}

// ── Main Agent ──

export async function analyzeGapsAndWriteReport(
  catalog: CatalogScanOutput,
  regulatory: RegulatoryScanOutput,
  collegeName: string,
  state: string,
  city?: string,
): Promise<{ report: string; gaps: GapItem[]; stats: ComplianceGapStats }> {
  const ts = () => new Date().toISOString();
  console.log(
    `\n[${ts()}][Gap Report Writer] Analyzing gaps for ${collegeName}`,
  );
  const startTime = Date.now();

  const mandated = regulatory.mandatedPrograms;
  const offered = catalog.programs;

  // ── Step 1: Identify gaps ──
  console.log(
    `[${ts()}][Gap Report Writer] Cross-referencing ${mandated.length} mandated programs vs ${offered.length} offered programs...`,
  );

  const gapMandates: MandatedProgram[] = [];
  const offeredMandates: MandatedProgram[] = [];

  for (const mandate of mandated) {
    if (isAlreadyOffered(mandate, offered)) {
      offeredMandates.push(mandate);
    } else {
      gapMandates.push(mandate);
    }
  }

  console.log(
    `[${ts()}][Gap Report Writer] Found ${gapMandates.length} gaps, ${offeredMandates.length} already offered`,
  );

  // ── Step 2: Size revenue for each gap (market-rate for top gaps) ──
  console.log(
    `[${ts()}][Gap Report Writer] Sizing revenue for ${gapMandates.length} gaps (market-rate lookup for top 8)...`,
  );

  // Fetch real market pricing for top gaps by demand level
  const sortedByDemand = [...gapMandates].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.demandLevel] - order[b.demandLevel];
  });
  const marketPriceCache = new Map<string, number>();
  for (const mandate of sortedByDemand.slice(0, 8)) {
    try {
      const location = city ? `${city}, ${state}` : state;
      const pricing = await fetchCompetitorPricing(mandate.occupation, location);
      if (pricing.marketMedian > 0) {
        marketPriceCache.set(mandate.occupation, pricing.marketMedian);
        console.log(
          `[${ts()}][Gap Report Writer] Market price for ${mandate.occupation}: $${pricing.marketMedian} (range $${pricing.marketLow}-$${pricing.marketHigh})`,
        );
      }
    } catch {
      // Fall back to formula
    }
    await new Promise(r => setTimeout(r, 400));
  }

  const gaps: GapItem[] = gapMandates.map(mandate => {
    // Use market price if available, otherwise fall back to formula
    const marketPrice = marketPriceCache.get(mandate.occupation);
    const rev = marketPrice
      ? estimateRevenueWithMarketRate(mandate, marketPrice)
      : estimateRevenue(mandate);
    const score = scoreOpportunity(mandate, rev.annualRevenue);
    const tier: 'high' | 'medium' | 'low' =
      score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low';

    return {
      mandatedProgram: mandate,
      estimatedAnnualCohortSize: rev.cohortSize,
      estimatedTuitionPerStudent: rev.tuitionPerStudent,
      estimatedAnnualRevenue: rev.annualRevenue,
      estimatedYear2Revenue: rev.year2Revenue,
      revenueConfidence: marketPrice ? 'medium' as const : rev.confidence,
      revenueRationale: rev.rationale,
      opportunityScore: score,
      priorityTier: tier,
      keyInsight: buildKeyInsight(mandate, rev.annualRevenue),
    };
  });

  // Sort by opportunity score descending
  gaps.sort((a, b) => b.opportunityScore - a.opportunityScore);

  const totalRevenue = gaps.reduce((sum, g) => sum + g.estimatedAnnualRevenue, 0);
  const highPriority = gaps.filter(g => g.priorityTier === 'high').length;

  const stats: ComplianceGapStats = {
    totalMandated: mandated.length,
    currentlyOffered: offeredMandates.length,
    gaps: gaps.length,
    estimatedAnnualRevenue: totalRevenue,
    highPriorityGaps: highPriority,
  };

  // ── Step 3: Write the full report with AI ──
  console.log(`[${ts()}][Gap Report Writer] Writing professional report...`);

  const gapTableRows = gaps
    .slice(0, 20) // top 20 for prompt size
    .map(
      g => {
        const cip = findCipByOccupation(g.mandatedProgram.occupation);
        const cipCol = cip ? `${cip.cipCode} (${cip.cipTitle})` : '—';
        return `| ${g.mandatedProgram.occupation} | ${g.mandatedProgram.clockHours}h | ${g.mandatedProgram.regulatoryBody} | ${g.mandatedProgram.statute} | ${cipCol} | ${g.mandatedProgram.demandLevel.toUpperCase()} | ${g.estimatedAnnualCohortSize}/cohort | $${g.estimatedAnnualRevenue.toLocaleString()} Yr1 / $${(g.estimatedYear2Revenue ?? g.estimatedAnnualRevenue).toLocaleString()} Yr2+ |`;
      },
    )
    .join('\n');

  const topGapsNarrative = gaps.slice(0, 8).map(g =>
    `- **${g.mandatedProgram.occupation}** (${g.mandatedProgram.clockHours} hours required): ${g.mandatedProgram.trainingRequirement}. Governed by ${g.mandatedProgram.regulatoryBody} under ${g.mandatedProgram.statute}. Estimated demand: ${g.mandatedProgram.estimatedRegionalDemand}. Revenue estimate: ${g.revenueRationale}.`
  ).join('\n');

  const offeredList = offeredMandates
    .slice(0, 15)
    .map(m => `- ${m.occupation}`)
    .join('\n');

  const reportPrompt = `You are a senior workforce intelligence consultant at Wavelength, a firm specializing in community college program strategy and regulatory compliance analysis. Write a professional consulting report for ${collegeName}.

CONTEXT:
- Institution: ${collegeName}${city ? `, ${city}` : ''}, ${state}
- Report type: Compliance Gap Analysis — state-mandated training programs not currently offered
- Total mandated programs in ${state}: ${mandated.length}
- Currently offered by this institution: ${offeredMandates.length}
- Compliance gaps identified: ${gaps.length}
- Total estimated Year 1 revenue (conservative): $${totalRevenue.toLocaleString()}
- Total estimated Year 2+ revenue (at scale): $${gaps.reduce((s, g) => s + (g.estimatedYear2Revenue ?? g.estimatedAnnualRevenue), 0).toLocaleString()}
- High-priority gaps: ${highPriority}

CURRENTLY OFFERED (mandated programs they DO have):
${offeredList || '(none identified from website)'}

TOP COMPLIANCE GAPS (programs mandated by ${state} law that they do NOT offer):
${topGapsNarrative}

FULL GAP TABLE (for the table section):
| Program | Required Hours | Regulatory Body | Citation | CIP Code | Demand | Cohort Size | Revenue (Yr1 / Yr2+) |
|---------|---------------|-----------------|----------|----------|--------|-------------|----------------------|
${gapTableRows}

REVENUE METHODOLOGY (include this in the Methodology section):
Revenue estimates use conservative Year 1 / Year 2+ projections based on:
- Realistic cohort sizes: 12-18 for hands-on/lab programs (cosmetology, healthcare, trades), 18-25 for classroom programs (real estate, food safety)
- Year 1 assumes new program ramp (1-2 cohorts). Year 2+ assumes moderate scaling (2-3 cohorts).
- Tuition based on market-rate competitor pricing via web search when available, or regional benchmarks when not.
- These are TUITION REVENUE estimates only. They do not include fees, materials charges, or grant funding. They also do not subtract instructor costs, equipment, or overhead.
- Actual revenue depends on enrollment, retention, and institutional pricing decisions.

REPORT REQUIREMENTS:
Write a complete, polished consulting report in Markdown with these exact sections:

1. **Executive Summary** (2-3 paragraphs): What the analysis found, key numbers, urgency of the compliance gaps
2. **Compliance Overview** (1-2 paragraphs + summary table): Programs already offered vs gaps, by category
3. **Gap Analysis** (markdown table + narrative for top 5-6 gaps): Full table, then deep-dive on the highest-priority gaps
4. **Revenue Opportunity Sizing** (narrative + table): Conservative annual revenue estimates for each gap, total opportunity
5. **Strategic Recommendations** (numbered list, 5-8 recommendations): Specific, actionable steps to close the most valuable gaps
6. **Methodology** (brief): How we identified mandated programs, how we cross-referenced, how revenue was estimated

TONE AND STYLE RULES:
- Professional consulting tone — authoritative, data-driven, precise
- Write as if this is a deliverable from a paid engagement
- NO references to AI, artificial intelligence, algorithms, automation, or "generated"
- NO phrases like "our analysis suggests" — be declarative: "The analysis identifies..."
- Include the Wavelength brand in the header and footer
- Include the specific ${state} statutes and regulatory body names throughout
- Use dollar signs, percentages, and specific numbers wherever possible
- Report should be substantial — approximately 3-5 pages when printed
- Use the current year (${new Date().getFullYear()}) in the report date

HEADER FORMAT:
\`\`\`
---
**WAVELENGTH WORKFORCE INTELLIGENCE**
Compliance Gap Analysis
${collegeName} | ${state} | ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
*Confidential — Prepared for Institutional Leadership*
---
\`\`\`

Write the complete report now. Return ONLY the markdown — no preamble, no explanation.`;

  const reportResult = await callClaude(reportPrompt, {
    maxTokens: 12000,
    temperature: 0.3,
  });

  const report = reportResult.content.trim();

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(
    `[${ts()}][Gap Report Writer] Complete in ${duration}s — ${report.length} chars written`,
  );

  return { report, gaps, stats };
}

// ── Helpers ──

function buildKeyInsight(mandate: MandatedProgram, revenue: number): string {
  const demandAdj =
    mandate.demandLevel === 'high'
      ? 'High-demand'
      : mandate.demandLevel === 'medium'
      ? 'Moderate-demand'
      : 'Emerging';
  return `${demandAdj} state mandate: ${mandate.clockHours}h required by ${mandate.regulatoryBody}. Est. ~$${Math.round(revenue / 1000)}K/yr revenue.`;
}
