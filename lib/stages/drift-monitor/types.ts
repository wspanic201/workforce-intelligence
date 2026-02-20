export interface DriftProgram {
  id?: string;
  institutionName: string;
  contactEmail?: string;
  programName: string;
  occupationTitle: string;
  socCode?: string;
  curriculumDescription: string; // bullet points of what they teach (can be auto-scraped)
  lastCurriculumUpdate?: string; // date as string
  collegeUrl?: string; // institution website URL (used for auto-scraping curriculum)
  state?: string; // state for regional context
}

export interface EmployerSkill {
  skill: string;
  frequency: number; // how many postings mentioned it
  examples: string[]; // example phrases from postings
}

export interface DriftScanResult {
  programId?: string;
  scannedAt: string;
  postingsAnalyzed: number;
  employerSkills: EmployerSkill[]; // top skills employers want (sorted by frequency)
  coveredSkills: string[]; // employer skills found in curriculum
  gapSkills: string[]; // employer skills NOT in curriculum
  staleSkills: string[]; // curriculum skills NOT in top employer list
  driftScore: number; // 0-100
  driftDelta?: number; // change from previous scan
  driftLevel: 'aligned' | 'minor' | 'moderate' | 'significant' | 'critical';
  narrative: string; // Claude-generated analysis paragraph
  recommendations: string[]; // specific action items
  onetSkillsUsed?: boolean; // whether O*NET baseline was included in analysis
  onetGaps?: string[]; // O*NET essential skills missing from curriculum
}

export function getDriftLevel(score: number): DriftScanResult['driftLevel'] {
  if (score <= 20) return 'aligned';
  if (score <= 40) return 'minor';
  if (score <= 60) return 'moderate';
  if (score <= 80) return 'significant';
  return 'critical';
}
