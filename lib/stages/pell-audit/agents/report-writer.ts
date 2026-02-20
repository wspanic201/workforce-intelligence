/**
 * Phase 5: Report Writer Agent
 * 
 * Synthesizes all phase outputs into a polished, branded
 * Workforce Pell Readiness Audit report. The report should
 * feel like a deliverable from a consulting firm — professional
 * but approachable, data-heavy but readable.
 * 
 * The report's job: (1) Impress the dean with thoroughness,
 * (2) Create urgency around July 1, 2026 Pell deadline,
 * (3) Natural lead-in to full Market Scan purchase.
 */

import { callClaude } from '@/lib/ai/anthropic';
import type {
  CatalogScrapeOutput,
  ProgramClassificationOutput,
  PellScoringOutput,
  GapAnalysisOutput,
  PellAuditReport,
} from '../types';
import type { RegulatoryScanOutput } from './regulatory-scanner';

// ── Main Agent ──

export async function writeReport(
  catalog: CatalogScrapeOutput,
  classification: ProgramClassificationOutput,
  scoring: PellScoringOutput,
  gaps: GapAnalysisOutput,
  regulatory?: RegulatoryScanOutput | null
): Promise<PellAuditReport> {
  console.log(`\n[Report Writer] Generating Workforce Pell Readiness Audit report`);
  const startTime = Date.now();

  const institutionName = catalog.institution.name;
  const state = catalog.institution.state;

  // ── Build data context for the writer ──

  // Program inventory summary
  const inventorySummary = classification.programs.map(p => 
    `- **${p.name}** (${p.credentialType}) — ${p.clockHourEstimate} hrs / ${p.weekEstimate} wks — ${p.pellCategory.replace(/-/g, ' ')}${p.primarySOC ? ` [SOC: ${p.primarySOC}]` : ''}`
  ).join('\n');

  // Pell scores for scored programs
  const pellScores = scoring.scoredPrograms.map(p => {
    const stateItems = [
      `High-Skill/High-Wage: ${p.stateCriteria.highSkillHighWage?.status || 'N/A'}`,
      `Employer Demand: ${p.stateCriteria.employerHiringNeeds?.status || 'N/A'}`,
      `Stackable Credential: ${p.stateCriteria.stackableCredential?.status || 'N/A'}`,
      `Credit Toward Degree: ${p.stateCriteria.creditTowardDegree?.status || 'N/A'}`,
    ].join(' | ');
    const fedItems = [
      `Offered 1 Year: ${p.federalCriteria.offeredOneYear?.status || 'N/A'}`,
      `Completion ≥70%: ${p.federalCriteria.completionRate70?.status || 'N/A'}`,
      `Placement ≥70%: ${p.federalCriteria.placementRate70?.status || 'N/A'}`,
      `Earnings > Tuition: ${p.federalCriteria.earningsExceedTuition?.status || 'N/A'}`,
    ].join(' | ');
    return `**${p.programName}** — Overall: ${p.overallPellReadiness.toUpperCase()}
  State (${p.stateScore}/100): ${stateItems}
  Federal (${p.federalScore}/100): ${fedItems}
  ${p.medianWage ? `Median Wage: $${p.medianWage.toLocaleString()}/yr` : ''}${p.estimatedTuition ? ` | Est. Tuition: $${p.estimatedTuition.toLocaleString()}` : ''}${p.earningsToTuitionRatio ? ` | Wage-to-Tuition: ${p.earningsToTuitionRatio}x` : ''}
  Recommendations: ${p.recommendations.join('; ')}`;
  }).join('\n\n');

  // Gap opportunities
  const gapDetails = gaps.gaps.map((g, i) => 
    `${i + 1}. **${g.occupationTitle}** (SOC: ${g.socCode}) — Score: ${g.opportunityScore}/10 [${g.priorityTier.toUpperCase()}]
   Demand: ${g.regionalDemand}
   Median Wage: $${g.medianWage.toLocaleString()}/yr | Growth: ${g.growthRate}
   Pell-Eligible Design: ${g.pellEligible ? 'Yes' : 'No'} — ${g.suggestedProgramLength}
   Credential: ${g.suggestedCredential}
   Competition: ${g.nearbyCompetitors}
   Your Advantage: ${g.competitiveAdvantage}`
  ).join('\n\n');

  // ── Generate the full report ──
  const reportPrompt = `You are writing a Workforce Pell Readiness Audit report for ${institutionName}. This is a professional consulting deliverable — not a blog post, not a summary. Think McKinsey meets community college workforce development.

INSTITUTION: ${institutionName} (${catalog.institution.city}, ${state})
TYPE: ${catalog.institution.type}
PROGRAMS FOUND: ${classification.summary.totalPrograms}

CLASSIFICATION SUMMARY:
- Already Pell-eligible (≥600 hrs): ${classification.summary.alreadyPellEligible}
- Workforce Pell candidates (150-599 hrs): ${classification.summary.workforcePellCandidates}
- Too short for any Pell (<150 hrs): ${classification.summary.tooShort}
- Degree programs (too long for Workforce Pell): ${classification.summary.tooLong}
- Unclear/insufficient data: ${classification.summary.unclear}

PELL SCORING SUMMARY:
- Pell-Ready: ${scoring.institutionSummary.pellReady}
- Likely Ready: ${scoring.institutionSummary.likelyReady}
- Needs Work: ${scoring.institutionSummary.needsWork}
- Not Eligible: ${scoring.institutionSummary.notEligible}

FULL PROGRAM INVENTORY:
${inventorySummary}

PELL ELIGIBILITY SCORECARDS:
${pellScores}

GAP OPPORTUNITIES (programs they should consider):
${gapDetails}

GAP ANALYSIS METHODOLOGY:
${gaps.methodology}

${regulatory && regulatory.notOffered.length > 0 ? `
REGULATORY MANDATE GAPS (state-mandated programs NOT currently offered):
${regulatory.notOffered.map((m, i) => 
  `${i + 1}. **${m.occupation}** — ${m.regulatoryBody}
   Mandate: ${m.trainingRequirement} (${m.clockHours} hours) [${m.statute}]
   Regional Demand: ${m.estimatedRegionalDemand}
   Revenue Potential: ${m.revenueEstimate}
   Pell-Eligible: ${m.pellEligible ? 'Yes' : 'No'}
   Renewal/CE Required: ${m.renewalRequired ? `Yes — ${m.renewalDetails}` : 'No'}
   Score: ${m.opportunityScore}/10`
).join('\n\n')}
` : 'No regulatory mandate data available.'}

DATA SOURCES: ${gaps.dataSources.length} sources + BLS wage data + ${catalog.catalogUrls.length} institutional pages scraped${regulatory ? ` + ${regulatory.searchesUsed} regulatory searches` : ''}

REPORT STRUCTURE — Write the following sections in clean, professional Markdown:

1. **EXECUTIVE SUMMARY** (250-400 words)
   - Lead with the headline number: how many programs are Workforce Pell ready vs total
   - State the July 1, 2026 deadline and why acting now matters
   - Summarize top gaps/opportunities (the hook)
   - Close with "what this means for [institution]"

2. **PROGRAM INVENTORY** (present ALL programs in a clean table)
   - Columns: Program Name | Type | Est. Hours | Pell Category | SOC Code
   - Group by Pell category (ready first, then candidates, then others)
   - Include total count

3. **PELL READINESS SCORECARDS** (the detail section)
   - For each scored program, show the 8-criteria breakdown
   - Use ✅ (met), 🟡 (likely/uncertain), ❌ (not met) for visual scanning
   - Include state and federal scores
   - Include specific recommendations per program

4. **GAP ANALYSIS: PROGRAMS YOU SHOULD CONSIDER** (the hook section)
   - Lead with: "Based on regional labor market analysis, the following programs represent significant opportunities..."
   - Present each gap with demand evidence, wage data, and suggested Pell-eligible design
   - Prioritize by opportunity score
   - Make it clear these gaps represent real revenue and enrollment opportunities

5. **REGULATORY MANDATE GAPS: GUARANTEED-DEMAND PROGRAMS** (if regulatory data available)
   - Lead with: "The following programs are REQUIRED by ${state} state law. Every licensed professional must complete this training — the only question is where."
   - Present each mandated program gap with: regulatory body, statute reference, required hours, estimated regional demand, revenue potential
   - Flag which are Pell-eligible
   - Note renewal/CE requirements (ongoing revenue stream)
   - This section should make the dean think: "Why are we leaving this money on the table?"

6. **STRATEGIC RECOMMENDATIONS** (4-6 bullet points)
   - What to do NOW (before July 1)
   - Quick wins (programs closest to Pell-ready)
   - Medium-term (programs that need work)
   - Data infrastructure needs (completion/placement tracking)
   - New program development priorities (from gap analysis)

7. **METHODOLOGY & SOURCES**
   - Brief description of our analysis approach
   - List key data sources
   - Note any limitations

WRITING RULES:
- Professional but accessible. A Dean of CCE should be able to read this in 15 minutes.
- Every claim must be grounded in the data provided. Do not fabricate statistics.
- Use the actual institution name throughout — make it feel personalized.
- NO references to AI, algorithms, or automated systems. This reads like a human analyst wrote it.
- NO references to any company name for who produced this report. Keep the focus on the institution.
- Include data citations inline (e.g., "according to BLS wage data" or "based on current job postings").
- Use tables where they improve clarity.
- Bold key numbers and findings for scannability.
- The tone should convey: "you have real opportunities here, and the clock is ticking."

Write the COMPLETE report. All 6 sections. In markdown format.`;

  const result = await callClaude(reportPrompt, {
    maxTokens: 32000,
    temperature: 0.3,
  });

  const fullMarkdown = result.content;

  // Extract executive summary (first section)
  const execMatch = fullMarkdown.match(/##?\s*(?:1\.?\s*)?Executive Summary[\s\S]*?(?=\n##?\s*(?:2\.?\s*)?)/i);
  const executiveSummary = execMatch ? execMatch[0].trim() : '';

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Report Writer] Complete in ${duration}s — ${fullMarkdown.length} chars`);

  return {
    title: `Workforce Pell Readiness Audit — ${institutionName}`,
    institutionName,
    generatedAt: new Date().toISOString(),
    executiveSummary,
    sections: {
      programInventory: extractSection(fullMarkdown, 'Program Inventory'),
      pellReadinessScorecard: extractSection(fullMarkdown, 'Pell Readiness Scorecard'),
      gapAnalysis: extractSection(fullMarkdown, 'Gap Analysis'),
      recommendations: extractSection(fullMarkdown, 'Strategic Recommendation'),
      methodology: extractSection(fullMarkdown, 'Methodology'),
    },
    fullMarkdown,
    metadata: {
      totalPrograms: classification.summary.totalPrograms,
      pellReadyCount: scoring.institutionSummary.pellReady + scoring.institutionSummary.likelyReady,
      gapsIdentified: gaps.gaps.length + (regulatory?.notOffered.length || 0),
      dataSources: gaps.dataSources.length + catalog.catalogUrls.length + (regulatory?.searchesUsed || 0),
    },
  };
}

// ── Helper: Extract a section by heading ──

function extractSection(markdown: string, headingKeyword: string): string {
  // Find section by keyword in heading
  const regex = new RegExp(
    `(##?\\s*(?:\\d+\\.?\\s*)?[^\\n]*${headingKeyword}[^\\n]*\\n[\\s\\S]*?)(?=\\n##?\\s*(?:\\d+\\.?\\s*)?[A-Z]|$)`,
    'i'
  );
  const match = markdown.match(regex);
  return match ? match[1].trim() : '';
}
