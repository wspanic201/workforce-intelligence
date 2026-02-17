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
import type {
  CatalogScanOutput,
  RegulatoryScanOutput,
  MandatedProgram,
  GapItem,
  ComplianceGapStats,
  OfferedProgram,
} from '../types';
import { normalizeProgramName } from './catalog-scanner';

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

/**
 * Estimate annual revenue for a mandated program not currently offered.
 * Uses conservative cohort sizing based on demand level and hours.
 */
function estimateRevenue(mandate: MandatedProgram): {
  cohortSize: number;
  tuitionPerStudent: number;
  annualRevenue: number;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
} {
  // Cohort size by demand level
  const cohortByDemand: Record<'high' | 'medium' | 'low', number> = {
    high: 60,
    medium: 30,
    low: 15,
  };

  // Tuition estimate based on program length / clock hours
  // ~$8–$14 per clock hour is typical for noncredit workforce training
  const hourlyRate = mandate.clockHours >= 300 ? 10 : 12;
  const baseTuition = Math.max(
    400,
    Math.round(mandate.clockHours * hourlyRate / 50) * 50, // round to nearest $50
  );

  // Cap at reasonable levels
  const tuitionPerStudent = Math.min(baseTuition, 3500);
  const cohortSize = cohortByDemand[mandate.demandLevel];

  // High-demand programs often run multiple cohorts per year
  const cohortMultiplier = mandate.demandLevel === 'high' ? 3 : mandate.demandLevel === 'medium' ? 2 : 1;
  const annualRevenue = cohortSize * cohortMultiplier * tuitionPerStudent;

  const confidence: 'high' | 'medium' | 'low' =
    mandate.demandLevel === 'high' && mandate.clockHours > 0
      ? 'medium'
      : 'low';

  const rationale =
    `${cohortSize} students/cohort × ${cohortMultiplier} cohort(s)/year × ` +
    `$${tuitionPerStudent.toLocaleString()} tuition = ` +
    `$${annualRevenue.toLocaleString()}/year (${mandate.demandLevel} demand, ${mandate.clockHours} clock hours)`;

  return { cohortSize, tuitionPerStudent, annualRevenue, confidence, rationale };
}

// ── Opportunity Scoring ──

function scoreOpportunity(mandate: MandatedProgram, revenueEstimate: number): number {
  let score = 5; // baseline

  // Demand level
  if (mandate.demandLevel === 'high') score += 3;
  else if (mandate.demandLevel === 'medium') score += 1;
  else score -= 1;

  // Revenue potential
  if (revenueEstimate >= 200000) score += 2;
  else if (revenueEstimate >= 100000) score += 1;
  else if (revenueEstimate < 30000) score -= 1;

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

  // ── Step 2: Size revenue for each gap ──
  const gaps: GapItem[] = gapMandates.map(mandate => {
    const rev = estimateRevenue(mandate);
    const score = scoreOpportunity(mandate, rev.annualRevenue);
    const tier: 'high' | 'medium' | 'low' =
      score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low';

    return {
      mandatedProgram: mandate,
      estimatedAnnualCohortSize: rev.cohortSize,
      estimatedTuitionPerStudent: rev.tuitionPerStudent,
      estimatedAnnualRevenue: rev.annualRevenue,
      revenueConfidence: rev.confidence,
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
      g =>
        `| ${g.mandatedProgram.occupation} | ${g.mandatedProgram.clockHours}h | ${g.mandatedProgram.regulatoryBody} | ${g.mandatedProgram.statute} | ${g.mandatedProgram.demandLevel.toUpperCase()} | $${g.estimatedAnnualRevenue.toLocaleString()}/yr |`,
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
- Total estimated unrealized annual revenue: $${totalRevenue.toLocaleString()}
- High-priority gaps: ${highPriority}

CURRENTLY OFFERED (mandated programs they DO have):
${offeredList || '(none identified from website)'}

TOP COMPLIANCE GAPS (programs mandated by ${state} law that they do NOT offer):
${topGapsNarrative}

FULL GAP TABLE (for the table section):
| Program | Required Hours | Regulatory Body | Citation | Demand | Est. Revenue |
|---------|---------------|-----------------|----------|--------|-------------|
${gapTableRows}

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
