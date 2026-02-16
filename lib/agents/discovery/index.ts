/**
 * Program Discovery Report - Entry Point
 * 
 * This module provides a lower-ticket product ($997-$1,497) that scans
 * a college's region and delivers a ranked list of 10-15 program opportunities.
 * 
 * It's the natural upsell funnel to the full $2,500-$7,500 validation.
 */

export { scanRegionalLaborMarket } from './regional-scanner';
export type { RegionalScanResult, OccupationDemand } from './regional-scanner';

export { analyzeMarketGaps } from './gap-analyzer';
export type { GapAnalysisResult, ProgramGap } from './gap-analyzer';

export { mapGapsToPrograms, validateRecommendations } from './program-mapper';
export type { ProgramRecommendation } from './program-mapper';

export { scoreProgramRecommendations } from './quick-scorer';
export type { ScoredProgram } from './quick-scorer';

export { orchestrateDiscovery } from './orchestrator';
export type { DiscoveryInput, DiscoveryResult } from './orchestrator';
