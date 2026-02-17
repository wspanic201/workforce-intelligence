/**
 * Discovery Stage Orchestrator
 * 
 * Runs all 6 phases sequentially, each building on the previous:
 *   Phase 1: Regional Intelligence (10-15 searches)
 *   Phase 2: Demand Signal Detection (15-20 searches)
 *   Phase 3: Competitive Landscape (10-15 searches)
 *   Phase 4: Opportunity Scoring (synthesis, minimal search)
 *   Phase 5: Blue Ocean Scanner (15-20 creative searches for hidden opportunities)
 *   Phase 6: Brief Writing (no search, pure synthesis)
 * 
 * Total: ~55-80 web searches, 7-12 Claude calls, ~7-15 minutes
 */

import { gatherRegionalIntelligence, RegionalIntelligenceOutput } from './agents/regional-intelligence';
import { detectDemandSignals, DemandSignalOutput } from './agents/demand-signals';
import { scanCompetitiveLandscape, CompetitiveLandscapeOutput } from './agents/competitive-landscape';
import { scoreOpportunities, OpportunityScorerOutput } from './agents/opportunity-scorer';
import { scanBlueOcean, BlueOceanScannerOutput } from './agents/blue-ocean-scanner';
import { writeDiscoveryBrief, DiscoveryBrief } from './agents/brief-writer';

// ── Types ──

export interface ServiceRegion {
  primaryCity: string;           // "Cedar Rapids"
  additionalCities: string[];   // ["Iowa City", "Coralville", "Marion"]
  metroArea: string;             // "Cedar Rapids-Iowa City Corridor"
  counties: string;              // "Linn, Johnson, Benton, Iowa, Jones, Cedar, Washington"
  state: string;
}

export interface DiscoveryInput {
  collegeName: string;
  /** @deprecated Use serviceRegion instead */
  collegeCity?: string;
  /** @deprecated Use serviceRegion instead */
  collegeState?: string;
  /** @deprecated Use serviceRegion.counties instead */
  serviceAreaCounties?: string;
  /** New: structured multi-city region */
  serviceRegion?: ServiceRegion;
  focusAreas?: string;
  additionalContext?: string;
}

/** Normalize legacy single-city input to ServiceRegion */
function normalizeRegion(input: DiscoveryInput): ServiceRegion {
  if (input.serviceRegion) return input.serviceRegion;
  // Legacy fallback
  const city = input.collegeCity || '';
  const state = input.collegeState || '';
  return {
    primaryCity: city,
    additionalCities: [],
    metroArea: `${city}, ${state}`,
    counties: input.serviceAreaCounties || '',
    state,
  };
}

export interface DiscoveryOutput {
  status: 'success' | 'partial' | 'error';
  brief: DiscoveryBrief | null;
  structuredData: {
    regionalIntelligence: RegionalIntelligenceOutput | null;
    demandSignals: DemandSignalOutput | null;
    competitiveLandscape: CompetitiveLandscapeOutput | null;
    scoredOpportunities: OpportunityScorerOutput | null;
    blueOceanResults: BlueOceanScannerOutput | null;
  };
  metadata: {
    startTime: string;
    endTime: string;
    durationSeconds: number;
    totalSearches: number;
    phaseTiming: Record<string, number>;
    errors: string[];
  };
}

export type ProgressCallback = (event: {
  phase: number;
  phaseName: string;
  status: 'starting' | 'complete' | 'error';
  message: string;
  elapsed: number;
}) => void;

// ── Main Orchestrator ──

export async function runDiscovery(
  input: DiscoveryInput,
  onProgress?: ProgressCallback
): Promise<DiscoveryOutput> {
  const startTime = Date.now();
  const errors: string[] = [];
  const phaseTiming: Record<string, number> = {};
  const region = normalizeRegion(input);
  const allCities = [region.primaryCity, ...region.additionalCities];

  let regionalIntel: RegionalIntelligenceOutput | null = null;
  let demandSignals: DemandSignalOutput | null = null;
  let competitiveLandscape: CompetitiveLandscapeOutput | null = null;
  let scoredOpportunities: OpportunityScorerOutput | null = null;
  let blueOceanResults: BlueOceanScannerOutput | null = null;
  let brief: DiscoveryBrief | null = null;

  const progress = (phase: number, phaseName: string, status: 'starting' | 'complete' | 'error', message: string) => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`[Discovery] Phase ${phase}/6 (${phaseName}) — ${status}: ${message} [${elapsed}s]`);
    onProgress?.({ phase, phaseName, status, message, elapsed });
  };

  console.log('═══════════════════════════════════════════════════');
  console.log(`  WORKFORCEOS DISCOVERY PIPELINE`);
  console.log(`  ${input.collegeName} — ${region.metroArea}`);
  console.log(`  Cities: ${allCities.join(', ')}`);
  console.log(`  Counties: ${region.counties}`);
  console.log('═══════════════════════════════════════════════════');

  // ── Phase 1: Regional Intelligence ──
  try {
    progress(1, 'Regional Intelligence', 'starting', 'Researching institution, employers, and regional economics');
    const phaseStart = Date.now();

    regionalIntel = await gatherRegionalIntelligence(
      input.collegeName,
      region,
      input.focusAreas
    );

    phaseTiming['phase1_regional'] = Math.round((Date.now() - phaseStart) / 1000);
    progress(1, 'Regional Intelligence', 'complete',
      `Found ${regionalIntel.topEmployers.length} employers, ${regionalIntel.institution.currentPrograms.length} existing programs, ${regionalIntel.searchesExecuted} searches`
    );
  } catch (err) {
    const msg = `Phase 1 failed: ${err instanceof Error ? err.message : String(err)}`;
    errors.push(msg);
    progress(1, 'Regional Intelligence', 'error', msg);
    // Can't continue without regional intel
    return buildOutput('error', null, { regionalIntelligence: null, demandSignals: null, competitiveLandscape: null, scoredOpportunities: null, blueOceanResults: null }, startTime, 0, phaseTiming, errors);
  }

  // ── Phase 2: Demand Signals ──
  try {
    progress(2, 'Demand Signals', 'starting', 'Analyzing job postings, BLS data, employer signals, grants');
    const phaseStart = Date.now();

    demandSignals = await detectDemandSignals(regionalIntel, region);

    phaseTiming['phase2_demand'] = Math.round((Date.now() - phaseStart) / 1000);
    progress(2, 'Demand Signals', 'complete',
      `${demandSignals.signals.length} signals, ${demandSignals.topIndustries.length} industries, ${demandSignals.searchesExecuted} searches`
    );
  } catch (err) {
    const msg = `Phase 2 failed: ${err instanceof Error ? err.message : String(err)}`;
    errors.push(msg);
    progress(2, 'Demand Signals', 'error', msg);
    // Can't score without demand signals
    return buildOutput('error', null, { regionalIntelligence: regionalIntel, demandSignals: null, competitiveLandscape: null, scoredOpportunities: null, blueOceanResults: null }, startTime, regionalIntel.searchesExecuted, phaseTiming, errors);
  }

  // ── Phase 3: Competitive Landscape ──
  try {
    progress(3, 'Competitive Landscape', 'starting', 'Mapping educational providers and program gaps');
    const phaseStart = Date.now();

    competitiveLandscape = await scanCompetitiveLandscape(regionalIntel, demandSignals, region);

    phaseTiming['phase3_competitive'] = Math.round((Date.now() - phaseStart) / 1000);
    progress(3, 'Competitive Landscape', 'complete',
      `${competitiveLandscape.providers.length} providers, ${competitiveLandscape.gaps.length} gaps (${competitiveLandscape.whiteSpaceCount} white space), ${competitiveLandscape.searchesExecuted} searches`
    );
  } catch (err) {
    const msg = `Phase 3 failed: ${err instanceof Error ? err.message : String(err)}`;
    errors.push(msg);
    progress(3, 'Competitive Landscape', 'error', msg);
    // Can continue with partial data — scorer can work without competitive data
  }

  // ── Phase 4: Opportunity Scoring ──
  try {
    progress(4, 'Opportunity Scoring', 'starting', 'Cross-referencing data and scoring opportunities');
    const phaseStart = Date.now();

    scoredOpportunities = await scoreOpportunities(
      regionalIntel,
      demandSignals,
      competitiveLandscape || { region: '', providers: [], gaps: [], whiteSpaceCount: 0, saturatedCount: 0, searchesExecuted: 0 }
    );

    phaseTiming['phase4_scoring'] = Math.round((Date.now() - phaseStart) / 1000);
    progress(4, 'Opportunity Scoring', 'complete',
      `${scoredOpportunities.scoredOpportunities.length} programs scored — ` +
      `${scoredOpportunities.quickWins.length} quick wins, ` +
      `${scoredOpportunities.strategicBuilds.length} strategic, ` +
      `${scoredOpportunities.emergingOpps.length} emerging`
    );
  } catch (err) {
    const msg = `Phase 4 failed: ${err instanceof Error ? err.message : String(err)}`;
    errors.push(msg);
    progress(4, 'Opportunity Scoring', 'error', msg);
    return buildOutput('partial', null, { regionalIntelligence: regionalIntel, demandSignals, competitiveLandscape, scoredOpportunities: null, blueOceanResults: null }, startTime, countSearches(regionalIntel, demandSignals, competitiveLandscape), phaseTiming, errors);
  }

  // ── Phase 5: Blue Ocean Scanner (Enhancement — failure won't kill pipeline) ──
  try {
    progress(5, 'Blue Ocean Scanner', 'starting', 'Hunting non-obvious hidden opportunities');
    const phaseStart = Date.now();

    blueOceanResults = await scanBlueOcean(
      regionalIntel,
      demandSignals,
      competitiveLandscape || { region: '', providers: [], gaps: [], whiteSpaceCount: 0, saturatedCount: 0, searchesExecuted: 0 },
      scoredOpportunities,
      region
    );

    phaseTiming['phase5_blue_ocean'] = Math.round((Date.now() - phaseStart) / 1000);
    progress(5, 'Blue Ocean Scanner', 'complete',
      `${blueOceanResults.hiddenOpportunities.length} hidden opportunities found, ${blueOceanResults.searchesExecuted} searches`
    );
  } catch (err) {
    const msg = `Phase 5 failed (non-critical): ${err instanceof Error ? err.message : String(err)}`;
    errors.push(msg);
    progress(5, 'Blue Ocean Scanner', 'error', msg);
    // Blue Ocean is enhancement — pipeline continues without it
    console.warn('[Discovery] Blue Ocean Scanner failed — continuing without hidden opportunities');
  }

  // ── Phase 6: Brief Writing ──
  try {
    progress(6, 'Brief Writing', 'starting', 'Generating the Discovery Brief');
    const phaseStart = Date.now();

    brief = await writeDiscoveryBrief(
      regionalIntel,
      demandSignals,
      competitiveLandscape || { region: '', providers: [], gaps: [], whiteSpaceCount: 0, saturatedCount: 0, searchesExecuted: 0 },
      scoredOpportunities,
      blueOceanResults
    );

    phaseTiming['phase6_brief'] = Math.round((Date.now() - phaseStart) / 1000);
    progress(6, 'Brief Writing', 'complete',
      `${brief.wordCount} words, ~${brief.pageEstimate} pages, ${brief.programCount} programs`
    );
  } catch (err) {
    const msg = `Phase 6 failed: ${err instanceof Error ? err.message : String(err)}`;
    errors.push(msg);
    progress(6, 'Brief Writing', 'error', msg);
    // We still have structured data even if the brief failed
  }

  // ── Final Output ──
  const totalSearches = countSearches(regionalIntel, demandSignals, competitiveLandscape, blueOceanResults);
  const status = errors.length === 0 ? 'success' : brief ? 'partial' : 'error';

  console.log('═══════════════════════════════════════════════════');
  console.log(`  DISCOVERY COMPLETE — ${status.toUpperCase()}`);
  console.log(`  Duration: ${Math.round((Date.now() - startTime) / 1000)}s`);
  console.log(`  Searches: ${totalSearches}`);
  console.log(`  Programs: ${scoredOpportunities?.scoredOpportunities.length || 0}`);
  if (blueOceanResults) console.log(`  Hidden Opportunities: ${blueOceanResults.hiddenOpportunities.length}`);
  if (brief) console.log(`  Brief: ${brief.wordCount} words, ~${brief.pageEstimate} pages`);
  if (errors.length > 0) console.log(`  Errors: ${errors.length}`);
  console.log('═══════════════════════════════════════════════════');

  return buildOutput(status, brief, {
    regionalIntelligence: regionalIntel,
    demandSignals,
    competitiveLandscape,
    scoredOpportunities,
    blueOceanResults,
  }, startTime, totalSearches, phaseTiming, errors);
}

// ── Helpers ──

function buildOutput(
  status: 'success' | 'partial' | 'error',
  brief: DiscoveryBrief | null,
  structuredData: DiscoveryOutput['structuredData'],
  startTime: number,
  totalSearches: number,
  phaseTiming: Record<string, number>,
  errors: string[]
): DiscoveryOutput {
  return {
    status,
    brief,
    structuredData,
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

function countSearches(
  regional: RegionalIntelligenceOutput | null,
  demand: DemandSignalOutput | null,
  competitive: CompetitiveLandscapeOutput | null,
  blueOcean: BlueOceanScannerOutput | null = null
): number {
  return (regional?.searchesExecuted || 0) +
    (demand?.searchesExecuted || 0) +
    (competitive?.searchesExecuted || 0) +
    (blueOcean?.searchesExecuted || 0);
}
