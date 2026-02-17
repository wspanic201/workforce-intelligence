/**
 * Pell Audit Orchestrator
 * 
 * Runs all 5 phases of the Workforce Pell Readiness Audit sequentially:
 *   Phase 1: Catalog Scraper (~60-90s) — Find and extract all programs
 *   Phase 2: Program Classifier (~30-45s) — Classify for Pell eligibility
 *   Phase 3: Pell Alignment Scorer (~45-90s) — Score against 8 criteria + BLS
 *   Phase 4: Gap Analyzer (~60-90s) — Identify missing program opportunities
 *   Phase 5: Report Writer (~30-45s) — Generate polished deliverable
 * 
 * Total: ~4-6 minutes, ~$2-4 in API costs, ~8-12 web searches
 * 
 * Usage:
 *   import { runPellAudit } from '@/lib/stages/pell-audit/orchestrator';
 *   const result = await runPellAudit({
 *     collegeName: "Wake Technical Community College",
 *     state: "North Carolina",
 *     city: "Raleigh",
 *   });
 */

import { scrapeCatalog } from './agents/catalog-scraper';
import { classifyPrograms } from './agents/program-classifier';
import { scorePellAlignment } from './agents/pell-scorer';
import { analyzeGaps } from './agents/gap-analyzer';
import { writeReport } from './agents/report-writer';
import type { PellAuditInput, PellAuditOutput } from './types';

// ── Progress Callback ──

export type PellAuditProgressCallback = (event: {
  phase: number;
  phaseName: string;
  status: 'starting' | 'complete' | 'error';
  message: string;
  elapsed: number;
}) => void;

// ── Main Orchestrator ──

export async function runPellAudit(
  input: PellAuditInput,
  onProgress?: PellAuditProgressCallback
): Promise<PellAuditOutput> {
  const startTime = Date.now();
  const errors: string[] = [];
  const phaseTiming: Record<string, number> = {};
  let totalSearches = 0;

  function elapsed() { return Math.round((Date.now() - startTime) / 1000); }

  function progress(phase: number, name: string, status: 'starting' | 'complete' | 'error', message: string) {
    console.log(`[Pell Audit] Phase ${phase}: ${name} — ${status} (${elapsed()}s) ${message}`);
    onProgress?.({ phase, phaseName: name, status, message, elapsed: elapsed() });
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`  WORKFORCE PELL READINESS AUDIT`);
  console.log(`  Institution: ${input.collegeName}`);
  console.log(`  State: ${input.state}`);
  console.log(`  Started: ${new Date().toISOString()}`);
  console.log('═'.repeat(60) + '\n');

  // ── Phase 1: Catalog Scraper ──
  let catalog = null;
  try {
    progress(1, 'Catalog Scraper', 'starting', 'Scraping institution website...');
    const phaseStart = Date.now();
    catalog = await scrapeCatalog(input.collegeName, input.state, input.collegeUrl, input.city);
    phaseTiming['catalog'] = Math.round((Date.now() - phaseStart) / 1000);
    totalSearches += catalog.searchesUsed;
    progress(1, 'Catalog Scraper', 'complete', `Found ${catalog.totalProgramsFound} programs`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Phase 1 (Catalog Scraper): ${msg}`);
    progress(1, 'Catalog Scraper', 'error', msg);
    // Fatal — can't continue without program data
    return buildOutput('error', null, null, null, null, null, startTime, phaseTiming, totalSearches, errors);
  }

  if (catalog.totalProgramsFound === 0) {
    errors.push('No programs found on institution website — cannot proceed');
    return buildOutput('error', null, catalog, null, null, null, startTime, phaseTiming, totalSearches, errors);
  }

  // ── Phase 2: Program Classifier ──
  let classification = null;
  try {
    progress(2, 'Program Classifier', 'starting', `Classifying ${catalog.totalProgramsFound} programs...`);
    const phaseStart = Date.now();
    classification = await classifyPrograms(catalog.programs, catalog.institution.name, input.state);
    phaseTiming['classification'] = Math.round((Date.now() - phaseStart) / 1000);
    progress(2, 'Program Classifier', 'complete', 
      `${classification.summary.workforcePellCandidates} Workforce Pell candidates, ${classification.summary.alreadyPellEligible} already eligible`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Phase 2 (Program Classifier): ${msg}`);
    progress(2, 'Program Classifier', 'error', msg);
    // Can continue with gap analysis even without classification
  }

  // ── Phase 3: Pell Alignment Scorer ──
  let pellScoring = null;
  if (classification && classification.programs.length > 0) {
    try {
      progress(3, 'Pell Alignment Scorer', 'starting', 'Scoring programs against Pell criteria...');
      const phaseStart = Date.now();
      pellScoring = await scorePellAlignment(classification.programs, catalog.institution.name, input.state);
      phaseTiming['pellScoring'] = Math.round((Date.now() - phaseStart) / 1000);
      progress(3, 'Pell Alignment Scorer', 'complete', 
        `${pellScoring.institutionSummary.pellReady} ready, ${pellScoring.institutionSummary.likelyReady} likely ready`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Phase 3 (Pell Scorer): ${msg}`);
      progress(3, 'Pell Alignment Scorer', 'error', msg);
    }
  }

  // ── Phase 4: Gap Analyzer ──
  let gapAnalysis = null;
  try {
    progress(4, 'Gap Analyzer', 'starting', 'Identifying program gap opportunities...');
    const phaseStart = Date.now();
    gapAnalysis = await analyzeGaps(
      classification?.programs || [],
      catalog.institution.name,
      input.state,
      input.city
    );
    phaseTiming['gapAnalysis'] = Math.round((Date.now() - phaseStart) / 1000);
    totalSearches += 12; // approximate searches used
    progress(4, 'Gap Analyzer', 'complete', `${gapAnalysis.gaps.length} gap opportunities identified`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Phase 4 (Gap Analyzer): ${msg}`);
    progress(4, 'Gap Analyzer', 'error', msg);
  }

  // ── Phase 5: Report Writer ──
  let report = null;
  if (catalog && (classification || gapAnalysis)) {
    try {
      progress(5, 'Report Writer', 'starting', 'Generating Pell Readiness Audit report...');
      const phaseStart = Date.now();
      report = await writeReport(
        catalog,
        classification || { programs: [], summary: { totalPrograms: 0, alreadyPellEligible: 0, workforcePellCandidates: 0, tooShort: 0, tooLong: 0, unclear: 0 } },
        pellScoring || { scoredPrograms: [], institutionSummary: { pellReady: 0, likelyReady: 0, needsWork: 0, notEligible: 0 } },
        gapAnalysis || { gaps: [], methodology: '', dataSources: [], regionAnalyzed: '' }
      );
      phaseTiming['report'] = Math.round((Date.now() - phaseStart) / 1000);
      progress(5, 'Report Writer', 'complete', `${report.fullMarkdown.length} chars written`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Phase 5 (Report Writer): ${msg}`);
      progress(5, 'Report Writer', 'error', msg);
    }
  }

  // ── Final Output ──
  const status = report ? (errors.length > 0 ? 'partial' : 'success') : 'error';

  console.log('\n' + '═'.repeat(60));
  console.log(`  PELL AUDIT COMPLETE — ${status.toUpperCase()}`);
  console.log(`  Duration: ${elapsed()}s`);
  console.log(`  Programs Found: ${catalog?.totalProgramsFound || 0}`);
  console.log(`  Pell Candidates: ${classification?.summary.workforcePellCandidates || 0}`);
  console.log(`  Gaps Identified: ${gapAnalysis?.gaps.length || 0}`);
  if (errors.length > 0) console.log(`  Errors: ${errors.length}`);
  console.log('═'.repeat(60) + '\n');

  return buildOutput(status, report, catalog, classification, pellScoring, gapAnalysis, startTime, phaseTiming, totalSearches, errors);
}

// ── Helper: Build output object ──

function buildOutput(
  status: 'success' | 'partial' | 'error',
  report: any,
  catalog: any,
  classification: any,
  pellScoring: any,
  gapAnalysis: any,
  startTime: number,
  phaseTiming: Record<string, number>,
  totalSearches: number,
  errors: string[]
): PellAuditOutput {
  return {
    status,
    report,
    structuredData: {
      catalog,
      classification,
      pellScoring,
      gapAnalysis,
    },
    metadata: {
      startTime: new Date(startTime).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: Math.round((Date.now() - startTime) / 1000),
      totalSearches,
      phaseTiming,
      errors,
    },
  };
}
