// ============================================================
// [BRAND] Report Types
// ============================================================

export interface EvidencePoint {
  point: string;
  source: string;
}

export interface ProgramScores {
  demandEvidence?: number;
  competitiveGap?: number;
  revenueViability?: number;
  wageOutcomes?: number;
  launchSpeed?: number;
  composite?: number;
  // Blue ocean variant
  demand?: number;
  competition?: number;
  revenue?: number;
  wages?: number;
  speed?: number;
}

export interface KeyMetrics {
  regionalAnnualOpenings?: string;
  medianHourlyWage?: string;
  projectedGrowth?: string;
  activeJobPostings?: string;
}

export interface ProgramSnapshot {
  estimatedDuration?: string;
  deliveryFormat?: string;
  stackableCredentials?: string[];
  targetAudience?: string;
}

export interface ScoredOpportunity {
  rank: number;
  programTitle: string;
  description: string;
  targetOccupation: string;
  socCode: string;
  tier: 'quick_win' | 'strategic_build' | 'emerging' | string;
  scores: ProgramScores;
  demandEvidence: EvidencePoint[];
  competitivePosition: string;
  keyMetrics: KeyMetrics;
  programSnapshot: ProgramSnapshot;
  whatValidationWouldConfirm: string[];
  barriers: string[];
  // Flag to identify type
  isBlueOcean?: false;
}

export interface BlueOceanOpportunity {
  programTitle: string;
  discoveryMethod: string;
  description: string;
  targetOccupation: string;
  socCode: string;
  evidence: EvidencePoint[];
  whyNonObvious: string;
  whyDefensible: string;
  estimatedDemand: string;
  medianWage: string;
  competitivePosition: string;
  firstMoverAdvantage: string;
  scores: ProgramScores;
  whatValidationWouldConfirm: string[];
  // Flag to identify type
  isBlueOcean: true;
  rank?: number;
}

export type AnyProgram = ScoredOpportunity | BlueOceanOpportunity;

export interface Employer {
  name: string;
  employees?: number | string;
  industry?: string;
  location?: string;
  source?: string;
}

export interface CompetitiveProvider {
  name: string;
  type: string;
  distance: string;
  website?: string;
  programs?: string[];
  recentLaunches?: string[];
  source?: string;
}

export interface Institution {
  name: string;
  city: string;
  state: string;
  website?: string;
  serviceArea?: string;
  currentPrograms?: string[];
  strategicPriorities?: string[];
  recentNews?: string[];
  demographics?: Record<string, {
    population?: string;
    medianIncome?: string;
    educationalAttainment?: string;
  }>;
}

export interface RegionalIntelligence {
  institution: Institution;
  topEmployers?: Employer[];
  economicTrends?: string;
  workforcePriorities?: string;
  majorEconomicEvents?: string;
  dataSources?: string;
  searchesExecuted?: number;
}

export interface DemandSignal {
  occupation: string;
  socCode?: string;
  signalType: string;
  strength: string;
  evidence: string;
}

export interface DemandSignals {
  region?: string;
  signals: DemandSignal[];
  grantOpportunities?: string;
  trendingCertifications?: string[];
  topIndustries?: { industry: string; signalCount: number; averageStrength: string }[];
  searchesExecuted?: number;
}

export interface CompetitiveLandscape {
  region?: string;
  providers: CompetitiveProvider[];
  gaps?: string[];
  whiteSpaceCount?: number;
  saturatedCount?: number;
  searchesExecuted?: number;
}

export interface StructuredData {
  regionalIntelligence: RegionalIntelligence;
  demandSignals: DemandSignals;
  competitiveLandscape: CompetitiveLandscape;
  scoredOpportunities: {
    scoredOpportunities: ScoredOpportunity[];
    fullCandidateMatrix?: unknown;
    quickWins?: unknown[];
    strategicBuilds?: unknown[];
    emergingOpps?: unknown[];
  };
  blueOceanResults: {
    hiddenOpportunities: BlueOceanOpportunity[];
    strategiesUsed?: string[];
    searchesExecuted?: number;
    keyInsight?: string;
  };
}

export interface Brief {
  markdown: string;
  wordCount: number;
  pageEstimate: number;
  programCount: number;
  generatedAt?: string;
}

export interface ReportMetadata {
  startTime?: string;
  endTime?: string;
  durationSeconds?: number;
  totalSearches?: number;
  errors?: string[];
}

export interface ReportConfig {
  token: string;
  hasPassword: boolean;
  generatedAt: string;
}

export interface ReportData {
  status: string;
  brief: Brief;
  structuredData: StructuredData;
  metadata: ReportMetadata;
  reportConfig: ReportConfig;
}
