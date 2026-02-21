/**
 * Catalog Gap Analysis — Type Definitions
 *
 * A standalone product that scans a state's regulatory codes for ALL
 * mandated training/licensing programs, compares against what a given
 * college currently offers, and reports every gap with revenue sizing.
 */

// ── Input ──

export interface ComplianceGapInput {
  collegeName: string;
  state: string;
  city?: string;
  siteUrl?: string; // optional — we'll find the college's website if not provided
}

// ── Catalog Scanner ──

export interface OfferedProgram {
  name: string;
  normalizedName: string; // lowercase, stripped — for fuzzy matching
}

export interface CatalogScanOutput {
  collegeName: string;
  siteUrl: string;
  programs: OfferedProgram[];
  totalFound: number;
  scrapedAt: string;
  searchesUsed: number;
}

// ── Regulatory Scanner ──

export interface MandatedProgram {
  occupation: string;           // "Certified Nurse Aide"
  regulatoryBody: string;       // "NC Division of Health Service Regulation"
  statute: string;              // "NC G.S. §131E-114" or "NC Admin Code 10A NCAC 13O"
  trainingRequirement: string;  // "75 hours initial training including clinical"
  clockHours: number;           // 75
  renewalRequired: boolean;
  renewalDetails: string;       // "12 hours annually"
  typicalProgramLength: string; // "4-6 weeks"
  demandLevel: 'high' | 'medium' | 'low';
  estimatedRegionalDemand: string; // "~800 CNAs employed in Wake County"
  source: string;               // URL or citation
}

export interface RegulatoryScanOutput {
  state: string;
  mandatedPrograms: MandatedProgram[];
  searchesUsed: number;
  scannedAt: string;
}

// ── Gap Analysis ──

export interface GapItem {
  // What's mandated
  mandatedProgram: MandatedProgram;

  // Revenue sizing (realistic Year 1 / Year 2+ projections)
  estimatedAnnualCohortSize: number;    // Students per cohort
  estimatedTuitionPerStudent: number;   // Dollars
  estimatedAnnualRevenue: number;       // Year 1 revenue (conservative ramp)
  estimatedYear2Revenue?: number;       // Year 2+ revenue (at scale)
  revenueConfidence: 'high' | 'medium' | 'low';
  revenueRationale: string;            // Shows Year 1 and Year 2+ breakdown

  // Priority
  opportunityScore: number; // 1–10
  priorityTier: 'high' | 'medium' | 'low';
  keyInsight: string; // One-line summary of the opportunity
}

// ── Report Writer ──

export interface ComplianceGapStats {
  totalMandated: number;
  currentlyOffered: number;
  gaps: number;
  estimatedAnnualRevenue: number; // Total across all gaps
  highPriorityGaps: number;
}

export interface ComplianceGapResult {
  report: string; // Full markdown report
  gaps: GapItem[];
  stats: ComplianceGapStats;
  metadata: {
    collegeName: string;
    state: string;
    generatedAt: string;
    durationSeconds: number;
    errors: string[];
  };
}
