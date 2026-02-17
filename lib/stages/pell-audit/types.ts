/**
 * Workforce Pell Readiness Audit — Type Definitions
 * 
 * A lead magnet product that scrapes an institution's website,
 * catalogs their programs, scores each against Workforce Pell
 * eligibility criteria, and identifies gap opportunities.
 */

// ── Input ──

export interface PellAuditInput {
  collegeName: string;
  collegeUrl?: string;            // Optional — we'll find it if not provided
  state: string;                   // Required for state WIOA definitions
  city?: string;                   // Optional — helps scope BLS/regional data
  /** Custom focus or context (e.g., "strong healthcare programs") */
  additionalContext?: string;
}

// ── Phase 1: Catalog Scraper Output ──

export interface ScrapedProgram {
  name: string;
  department: string;              // e.g., "Continuing Education", "Health Sciences"
  credentialType: string;          // e.g., "Certificate", "AAS", "Micro-credential", "Noncredit"
  description: string;
  estimatedHours: number | null;   // Clock hours if discoverable
  estimatedWeeks: number | null;   // Duration if discoverable
  tuition: string | null;          // If listed
  isCredit: boolean;               // Credit vs noncredit
  url: string;                     // Source page
  relatedOccupation: string | null; // Best guess occupation
}

export interface CatalogScrapeOutput {
  institution: {
    name: string;
    url: string;
    city: string;
    state: string;
    type: string;                  // e.g., "Community College", "Technical College"
    accreditation: string | null;
  };
  programs: ScrapedProgram[];
  catalogUrls: string[];           // Pages we scraped
  totalProgramsFound: number;
  scrapedAt: string;
  searchesUsed: number;
}

// ── Phase 2: Program Classifier Output ──

export interface ClassifiedProgram extends ScrapedProgram {
  // Pell-relevant classification
  clockHourEstimate: number;       // Best estimate of clock hours
  weekEstimate: number;            // Best estimate of weeks
  pellCategory: 'already-eligible' | 'workforce-pell-candidate' | 'too-short' | 'too-long' | 'unclear';
  // already-eligible: ≥600 hours / ≥15 weeks (traditional Pell)
  // workforce-pell-candidate: 150-599 hours / 8-15 weeks
  // too-short: <150 hours / <8 weeks
  // too-long: doesn't fit either window cleanly
  // unclear: insufficient data
  
  credentialStackable: boolean | null;    // Could stack into higher credential?
  credentialPortable: boolean | null;     // Industry-recognized?
  primarySOC: string | null;              // Best-match SOC code
  occupationTitle: string | null;         // Human-readable occupation
  
  classificationConfidence: 'high' | 'medium' | 'low';
  classificationNotes: string;
}

export interface ProgramClassificationOutput {
  programs: ClassifiedProgram[];
  summary: {
    totalPrograms: number;
    alreadyPellEligible: number;
    workforcePellCandidates: number;
    tooShort: number;
    tooLong: number;
    unclear: number;
  };
}

// ── Phase 3: Pell Alignment Scorer Output ──

export type PellCriterionStatus = 'met' | 'likely-met' | 'uncertain' | 'likely-not-met' | 'not-met';

export interface PellCriterionScore {
  criterion: string;
  status: PellCriterionStatus;
  evidence: string;
  source: string;
}

export interface PellScoredProgram {
  programName: string;
  pellCategory: string;
  
  // State-level criteria (Step 1)
  stateCriteria: {
    highSkillHighWage: PellCriterionScore;        // Prepares for high-skill/high-wage/in-demand occupation
    employerHiringNeeds: PellCriterionScore;       // Meets hiring requirements of employers
    stackableCredential: PellCriterionScore;       // Leads to stackable, portable credential
    creditTowardDegree: PellCriterionScore;        // Counts as credit toward subsequent program
  };
  stateScore: number;              // 0-100
  
  // Federal-level criteria (Step 2)
  federalCriteria: {
    offeredOneYear: PellCriterionScore;            // Program offered ≥1 year
    completionRate70: PellCriterionScore;          // ≥70% completion rate
    placementRate70: PellCriterionScore;           // ≥70% job placement (180 days)
    earningsExceedTuition: PellCriterionScore;     // Median earnings > tuition+fees
  };
  federalScore: number;            // 0-100
  
  overallPellReadiness: 'ready' | 'likely-ready' | 'needs-work' | 'not-eligible';
  recommendations: string[];       // Specific actions to improve eligibility
  
  // Wage data for earnings test
  medianWage: number | null;
  estimatedTuition: number | null;
  earningsToTuitionRatio: number | null;
}

export interface PellScoringOutput {
  scoredPrograms: PellScoredProgram[];
  institutionSummary: {
    pellReady: number;
    likelyReady: number;
    needsWork: number;
    notEligible: number;
  };
}

// ── Phase 4: Gap Analyzer Output ──

export interface ProgramGap {
  occupationTitle: string;
  socCode: string;
  
  // Why this is a gap
  regionalDemand: string;          // e.g., "450 annual openings in service area"
  medianWage: number;
  growthRate: string;              // e.g., "+12% projected over 10 years"
  
  // Pell fitness
  pellEligible: boolean;          // Could be designed for 150-599 hour window
  suggestedProgramLength: string;  // e.g., "200-300 clock hours (10-12 weeks)"
  suggestedCredential: string;     // e.g., "Certificate of Completion → stackable to AAS"
  
  // Competitive context
  nearbyCompetitors: string;       // Who else offers this in the region
  competitiveAdvantage: string;    // Why this college could win
  
  opportunityScore: number;        // 0-10
  priorityTier: 'high' | 'medium' | 'low';
}

export interface GapAnalysisOutput {
  gaps: ProgramGap[];
  methodology: string;
  dataSources: string[];
  regionAnalyzed: string;
}

// ── Phase 4b: Regulatory Scanner Output ──
// (imported from regulatory-scanner.ts — RegulatoryMandate, RegulatoryScanOutput)

// ── Phase 5: Report Writer Output ──

export interface PellAuditReport {
  title: string;
  institutionName: string;
  generatedAt: string;
  
  executiveSummary: string;
  
  sections: {
    programInventory: string;      // Markdown section
    pellReadinessScorecard: string; // Markdown section with scores
    gapAnalysis: string;           // Markdown section
    recommendations: string;       // Markdown section
    methodology: string;           // Markdown section
  };
  
  fullMarkdown: string;            // Complete report
  
  metadata: {
    totalPrograms: number;
    pellReadyCount: number;
    gapsIdentified: number;
    dataSources: number;
  };
}

// ── Orchestrator Output ──

export interface PellAuditOutput {
  status: 'success' | 'partial' | 'error';
  report: PellAuditReport | null;
  structuredData: {
    catalog: CatalogScrapeOutput | null;
    classification: ProgramClassificationOutput | null;
    pellScoring: PellScoringOutput | null;
    gapAnalysis: GapAnalysisOutput | null;
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
