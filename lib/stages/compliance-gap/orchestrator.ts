/**
 * Catalog Gap Analysis Orchestrator
 *
 * Runs 3 agents sequentially to produce a Catalog Gap Analysis:
 *   Agent 1: Catalog Scanner     — find all programs the college currently offers
 *   Agent 2: Regulatory Scanner  — find all state-mandated training programs
 *   Agent 3: Gap Analyzer + Report Writer — cross-reference, size revenue, write report
 *
 * Usage:
 *   import { runComplianceGap } from '@/lib/stages/compliance-gap/orchestrator';
 *   const result = await runComplianceGap({
 *     collegeName: "Wake Technical Community College",
 *     state: "North Carolina",
 *     city: "Raleigh",
 *   });
 */

import { scanCatalog } from './agents/catalog-scanner';
import { scanRegulatoryMandates } from './agents/regulatory-scanner';
import { analyzeGapsAndWriteReport } from './agents/gap-report-writer';
import type {
  ComplianceGapInput,
  ComplianceGapResult,
} from './types';

// ── Progress Callback ──

export type ComplianceGapProgressCallback = (event: {
  agent: number;
  agentName: string;
  status: 'starting' | 'complete' | 'error';
  message: string;
  elapsed: number;
}) => void;

// ── Main Orchestrator ──

export async function runComplianceGap(
  input: ComplianceGapInput,
  onProgress?: ComplianceGapProgressCallback,
): Promise<ComplianceGapResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  function elapsed() {
    return Math.round((Date.now() - startTime) / 1000);
  }

  function progress(
    agent: number,
    name: string,
    status: 'starting' | 'complete' | 'error',
    message: string,
  ) {
    console.log(
      `[Catalog Gap] Agent ${agent}: ${name} — ${status} (${elapsed()}s) ${message}`,
    );
    onProgress?.({ agent, agentName: name, status, message, elapsed: elapsed() });
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`  COMPLIANCE GAP REPORT`);
  console.log(`  Institution: ${input.collegeName}`);
  console.log(`  State: ${input.state}`);
  if (input.city) console.log(`  City: ${input.city}`);
  console.log(`  Started: ${new Date().toISOString()}`);
  console.log('═'.repeat(60) + '\n');

  // ── Agent 1: Catalog Scanner ──
  let catalog = null;
  try {
    progress(1, 'Catalog Scanner', 'starting', 'Scraping institution website for current programs...');
    catalog = await scanCatalog(
      input.collegeName,
      input.state,
      input.siteUrl,
      input.city,
    );
    progress(1, 'Catalog Scanner', 'complete', `Found ${catalog.totalFound} programs`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Agent 1 (Catalog Scanner): ${msg}`);
    progress(1, 'Catalog Scanner', 'error', msg);
    // Non-fatal — proceed with empty catalog (all mandates will show as gaps)
    catalog = {
      collegeName: input.collegeName,
      siteUrl: input.siteUrl || '',
      programs: [],
      totalFound: 0,
      scrapedAt: new Date().toISOString(),
      searchesUsed: 0,
    };
  }

  // ── Agent 2: Regulatory Scanner ──
  let regulatory = null;
  try {
    progress(2, 'Regulatory Scanner', 'starting', `Scanning ${input.state} regulatory mandates...`);
    regulatory = await scanRegulatoryMandates(input.state, input.city);
    progress(2, 'Regulatory Scanner', 'complete', `Found ${regulatory.mandatedPrograms.length} mandated programs`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Agent 2 (Regulatory Scanner): ${msg}`);
    progress(2, 'Regulatory Scanner', 'error', msg);
    // Fatal — can't produce a report without mandate data
    return buildErrorOutput(input, startTime, errors);
  }

  if (regulatory.mandatedPrograms.length === 0) {
    errors.push('Regulatory Scanner returned 0 mandates — cannot produce gap report');
    return buildErrorOutput(input, startTime, errors);
  }

  // ── Agent 3: Gap Analyzer + Report Writer ──
  let reportResult = null;
  try {
    progress(
      3,
      'Gap Analyzer & Report Writer',
      'starting',
      `Cross-referencing ${catalog.totalFound} offered programs vs ${regulatory.mandatedPrograms.length} mandated programs...`,
    );
    reportResult = await analyzeGapsAndWriteReport(
      catalog,
      regulatory,
      input.collegeName,
      input.state,
      input.city,
    );
    progress(
      3,
      'Gap Analyzer & Report Writer',
      'complete',
      `${reportResult.gaps.length} gaps identified, $${reportResult.stats.estimatedAnnualRevenue.toLocaleString()} revenue opportunity, ${reportResult.report.length} char report written`,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Agent 3 (Gap Report Writer): ${msg}`);
    progress(3, 'Gap Analyzer & Report Writer', 'error', msg);
    return buildErrorOutput(input, startTime, errors);
  }

  // ── Summary ──
  const durationSeconds = elapsed();

  console.log('\n' + '═'.repeat(60));
  console.log(`  COMPLIANCE GAP REPORT COMPLETE`);
  console.log(`  Duration: ${durationSeconds}s`);
  console.log(`  Mandated Programs Found: ${regulatory.mandatedPrograms.length}`);
  console.log(`  Currently Offered: ${reportResult.stats.currentlyOffered}`);
  console.log(`  Catalog Gaps: ${reportResult.stats.gaps}`);
  console.log(`  Est. Revenue Opportunity: $${reportResult.stats.estimatedAnnualRevenue.toLocaleString()}`);
  console.log(`  High-Priority Gaps: ${reportResult.stats.highPriorityGaps}`);
  if (errors.length > 0) console.log(`  Errors: ${errors.length}`);
  console.log('═'.repeat(60) + '\n');

  return {
    report: reportResult.report,
    gaps: reportResult.gaps,
    stats: reportResult.stats,
    metadata: {
      collegeName: input.collegeName,
      state: input.state,
      generatedAt: new Date().toISOString(),
      durationSeconds,
      errors,
    },
  };
}

// ── Helpers ──

function buildErrorOutput(
  input: ComplianceGapInput,
  startTime: number,
  errors: string[],
): ComplianceGapResult {
  return {
    report: '',
    gaps: [],
    stats: {
      totalMandated: 0,
      currentlyOffered: 0,
      gaps: 0,
      estimatedAnnualRevenue: 0,
      highPriorityGaps: 0,
    },
    metadata: {
      collegeName: input.collegeName,
      state: input.state,
      generatedAt: new Date().toISOString(),
      durationSeconds: Math.round((Date.now() - startTime) / 1000),
      errors,
    },
  };
}
