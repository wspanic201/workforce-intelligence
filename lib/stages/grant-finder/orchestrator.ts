/**
 * Grant Finder Orchestrator
 *
 * Runs the 5-agent Grant Finder pipeline sequentially:
 *   Agent 1: Grant Scanner      — Find relevant grants (Grants.gov + web)
 *   Agent 2: Past Award Analyzer — Research past recipients and award data
 *   Agent 3: Grant Matcher       — Score and rank grants by fit
 *   Agent 4: Requirements Analyzer — Extract application requirements
 *   Agent 5: Grant Brief Writer  — Generate the final intelligence report
 *
 * Total: ~5-10 minutes, ~$3-6 in API costs, 30-50 web searches
 *
 * Usage:
 *   import { runGrantFinder } from '@/lib/stages/grant-finder/orchestrator';
 *   const result = await runGrantFinder({
 *     collegeName: "Kirkwood Community College",
 *     state: "Iowa",
 *     city: "Cedar Rapids",
 *     programFocusAreas: ["manufacturing", "healthcare", "IT"],
 *   });
 */

import { scanGrants } from './agents/grant-scanner';
import { analyzePastAwards } from './agents/past-award-analyzer';
import { matchGrants, type InstitutionProfile } from './agents/grant-matcher';
import { analyzeRequirements } from './agents/requirements-analyzer';
import { writeGrantBrief } from './agents/grant-brief-writer';

// ── Types ──

export interface GrantFinderInput {
  collegeName: string;
  state: string;
  city?: string;
  programFocusAreas?: string[];  // e.g. ['manufacturing', 'healthcare', 'IT']
  institutionProfile?: Partial<InstitutionProfile>;
}

export interface GrantFinderOutput {
  status: 'success' | 'partial' | 'error';
  report?: {
    fullMarkdown: string;
    wordCount: number;
    pageEstimate: number;
    metadata: {
      totalGrantsReviewed: number;
      priorityGrantCount: number;
      strategicGrantCount: number;
      monitorGrantCount: number;
      skipGrantCount: number;
      topGrantTitle: string;
      generatedAt: string;
    };
  };
  grants?: any[];    // Structured grant data (scored + annotated)
  timing: Record<string, number>;
  errors: string[];
  metadata: {
    collegeName: string;
    state: string;
    startTime: string;
    endTime: string;
    durationSeconds: number;
    totalSearches: number;
    grantsFound: number;
  };
}

// ── Progress Callback ──

export type GrantFinderProgressCallback = (event: {
  agent: number;
  agentName: string;
  status: 'starting' | 'complete' | 'error';
  message: string;
  elapsed: number;
}) => void;

// ── Orchestrator ──

export async function runGrantFinder(
  input: GrantFinderInput,
  onProgress?: GrantFinderProgressCallback
): Promise<GrantFinderOutput> {
  const startTime = Date.now();
  const errors: string[] = [];
  const timing: Record<string, number> = {};
  let totalSearches = 0;

  function elapsed(): number {
    return Math.round((Date.now() - startTime) / 1000);
  }

  function progress(
    agent: number,
    name: string,
    status: 'starting' | 'complete' | 'error',
    message: string
  ) {
    console.log(`[Grant Finder] Agent ${agent}: ${name} — ${status} (${elapsed()}s) ${message}`);
    onProgress?.({ agent, agentName: name, status, message, elapsed: elapsed() });
  }

  // Build institution profile (merge defaults with any provided profile)
  const profile: InstitutionProfile = {
    collegeName: input.collegeName,
    state: input.state,
    city: input.city,
    currentPrograms: input.programFocusAreas || ['workforce training', 'career technical education'],
    strategicPriorities: [
      'workforce development',
      'career technical education',
      'student success',
      ...(input.programFocusAreas || []),
    ],
    ...input.institutionProfile,
  };

  console.log('\n' + '═'.repeat(60));
  console.log(`  GRANT FINDER PIPELINE`);
  console.log(`  Institution: ${input.collegeName}`);
  console.log(`  State: ${input.state}`);
  console.log(`  Focus Areas: ${input.programFocusAreas?.join(', ') || 'general workforce'}`);
  console.log(`  Started: ${new Date().toISOString()}`);
  console.log('═'.repeat(60) + '\n');

  // ── Agent 1: Grant Scanner ──
  let scanOutput = null;
  try {
    progress(1, 'Grant Scanner', 'starting', 'Searching Grants.gov and web for opportunities...');
    const phaseStart = Date.now();

    scanOutput = await scanGrants({
      collegeName: input.collegeName,
      state: input.state,
      city: input.city,
      programFocusAreas: input.programFocusAreas,
    });

    timing.scanner = Math.round((Date.now() - phaseStart) / 1000);
    totalSearches += scanOutput.searchesUsed;
    progress(1, 'Grant Scanner', 'complete',
      `Found ${scanOutput.grants.length} grants + ${scanOutput.webLeads.length} web leads`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Agent 1 (Grant Scanner): ${msg}`);
    progress(1, 'Grant Scanner', 'error', msg);
    return buildOutput('error', null, null, null, null, startTime, timing, totalSearches, errors, input);
  }

  if (scanOutput.grants.length === 0) {
    errors.push('No grants found — cannot proceed. Check API connectivity.');
    return buildOutput('error', null, null, null, null, startTime, timing, totalSearches, errors, input);
  }

  // ── Agent 2: Past Award Analyzer ──
  // Limit to top 10 grants for past award research (time/cost constraint)
  let pastAwardOutput = null;
  try {
    const grantsForAnalysis = scanOutput.grants.slice(0, 10);
    progress(2, 'Past Award Analyzer', 'starting',
      `Researching past awards for ${grantsForAnalysis.length} grants...`);
    const phaseStart = Date.now();

    pastAwardOutput = await analyzePastAwards(grantsForAnalysis);

    timing.pastAwards = Math.round((Date.now() - phaseStart) / 1000);
    totalSearches += pastAwardOutput.searchesUsed;
    progress(2, 'Past Award Analyzer', 'complete',
      `Found past award data for ${pastAwardOutput.awards.filter(a => a.pastRecipients.length > 0).length} grants`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Agent 2 (Past Award Analyzer): ${msg}`);
    progress(2, 'Past Award Analyzer', 'error', `${msg} — continuing with partial data`);
    pastAwardOutput = { awards: [], searchesUsed: 0 };
  }

  // ── Agent 3: Grant Matcher ──
  let matchOutput = null;
  try {
    progress(3, 'Grant Matcher', 'starting',
      `Scoring ${scanOutput.grants.length} grants for ${input.collegeName}...`);
    const phaseStart = Date.now();

    matchOutput = await matchGrants(
      scanOutput.grants,
      pastAwardOutput.awards,
      profile
    );

    timing.matcher = Math.round((Date.now() - phaseStart) / 1000);
    const tierCounts = {
      priority: matchOutput.scoredGrants.filter(g => g.matchTier === 'priority').length,
      strategic: matchOutput.scoredGrants.filter(g => g.matchTier === 'strategic').length,
    };
    progress(3, 'Grant Matcher', 'complete',
      `${tierCounts.priority} priority + ${tierCounts.strategic} strategic grants identified`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Agent 3 (Grant Matcher): ${msg}`);
    progress(3, 'Grant Matcher', 'error', msg);
    return buildOutput('error', null, null, null, null, startTime, timing, totalSearches, errors, input);
  }

  // ── Agent 4: Requirements Analyzer ──
  let requirementsOutput = null;
  try {
    // Only analyze top 8 — priority + strategic tiers (saves memory on 8GB machines)
    const topGrants = matchOutput.scoredGrants
      .filter(g => g.matchTier === 'priority' || g.matchTier === 'strategic')
      .slice(0, 8);
    progress(4, 'Requirements Analyzer', 'starting',
      `Analyzing requirements for top ${topGrants.length} grants...`);
    const phaseStart = Date.now();

    requirementsOutput = await analyzeRequirements(topGrants, 8);

    timing.requirements = Math.round((Date.now() - phaseStart) / 1000);
    progress(4, 'Requirements Analyzer', 'complete',
      `Analyzed ${requirementsOutput.grantsAnalyzed} grants (${requirementsOutput.grantsFailed} failed)`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Agent 4 (Requirements Analyzer): ${msg}`);
    progress(4, 'Requirements Analyzer', 'error', `${msg} — continuing with partial data`);
    requirementsOutput = { requirements: [], grantsAnalyzed: 0, grantsFailed: 0 };
  }

  // ── Agent 5: Grant Brief Writer ──
  let briefOutput = null;
  try {
    progress(5, 'Grant Brief Writer', 'starting', 'Writing Grant Intelligence Report...');
    const phaseStart = Date.now();

    briefOutput = await writeGrantBrief({
      collegeName: input.collegeName,
      state: input.state,
      city: input.city,
      programFocusAreas: input.programFocusAreas,
      institutionProfile: profile,
      scoredGrants: matchOutput.scoredGrants,
      pastAwards: pastAwardOutput.awards,
      requirements: requirementsOutput.requirements,
    });

    timing.briefWriter = Math.round((Date.now() - phaseStart) / 1000);
    progress(5, 'Grant Brief Writer', 'complete',
      `${briefOutput.wordCount} words, ~${briefOutput.pageEstimate} pages`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Agent 5 (Grant Brief Writer): ${msg}`);
    progress(5, 'Grant Brief Writer', 'error', msg);
    // Return partial result — we have data, just no formatted report
    return buildOutput(
      'partial',
      null,
      matchOutput.scoredGrants,
      pastAwardOutput.awards,
      requirementsOutput.requirements,
      startTime,
      timing,
      totalSearches,
      errors,
      input
    );
  }

  // ── Final Summary ──
  const status = errors.length > 0 ? 'partial' : 'success';

  console.log('\n' + '═'.repeat(60));
  console.log(`  GRANT FINDER COMPLETE — ${status.toUpperCase()}`);
  console.log(`  Duration: ${elapsed()}s`);
  console.log(`  Grants Found: ${scanOutput.grants.length}`);
  console.log(`  Priority Grants: ${matchOutput.scoredGrants.filter(g => g.matchTier === 'priority').length}`);
  console.log(`  Strategic Grants: ${matchOutput.scoredGrants.filter(g => g.matchTier === 'strategic').length}`);
  console.log(`  Report: ${briefOutput.wordCount} words, ~${briefOutput.pageEstimate} pages`);
  if (errors.length > 0) console.log(`  Errors: ${errors.length}`);
  console.log('═'.repeat(60) + '\n');

  return buildOutput(
    status,
    briefOutput,
    matchOutput.scoredGrants,
    pastAwardOutput.awards,
    requirementsOutput.requirements,
    startTime,
    timing,
    totalSearches,
    errors,
    input
  );
}

// ── Helper: Build Output ──

function buildOutput(
  status: 'success' | 'partial' | 'error',
  brief: any,
  grants: any[] | null,
  pastAwards: any[] | null,
  requirements: any[] | null,
  startTime: number,
  timing: Record<string, number>,
  totalSearches: number,
  errors: string[],
  input: GrantFinderInput
): GrantFinderOutput {
  return {
    status,
    report: brief || undefined,
    grants: grants || undefined,
    timing,
    errors,
    metadata: {
      collegeName: input.collegeName,
      state: input.state,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: Math.round((Date.now() - startTime) / 1000),
      totalSearches,
      grantsFound: grants?.length || 0,
    },
  };
}
