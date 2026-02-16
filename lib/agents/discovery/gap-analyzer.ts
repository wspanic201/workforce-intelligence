import { callClaude } from '@/lib/ai/anthropic';
import { OccupationDemand, RegionalScanResult } from './regional-scanner';

export interface ProgramGap {
  occupation: string;
  socCode: string;
  gapType: 'unmet_demand' | 'underserved' | 'saturated';
  opportunityScore: number; // 1-10
  rationale: string;
  demandStrength: number;
  competitionLevel: 'low' | 'moderate' | 'high';
}

export interface GapAnalysisResult {
  institution: string;
  totalGapsIdentified: number;
  highOpportunityGaps: ProgramGap[]; // opportunityScore >= 7
  moderateOpportunityGaps: ProgramGap[]; // 5-6.9
  saturatedAreas: string[]; // Programs to avoid
  analysisDate: string;
}

/**
 * Gap Analyzer
 * Identifies gaps between regional labor demand and institution's current offerings.
 * Flags both opportunities (unmet demand) and saturated markets (avoid).
 */
export async function analyzeMarketGaps(
  institutionName: string,
  regionalData: RegionalScanResult,
  currentPrograms: string[] = []
): Promise<GapAnalysisResult> {
  console.log(`[Gap Analyzer] Analyzing gaps for ${institutionName}`);
  console.log(`[Gap Analyzer] Current programs: ${currentPrograms.length}`);
  console.log(`[Gap Analyzer] Regional occupations analyzed: ${regionalData.topOccupations.length}`);

  // Step 1: Use AI to identify which occupations are already covered by current programs
  const programMappings = await identifyExistingCoverage(
    institutionName,
    regionalData.topOccupations,
    currentPrograms
  );

  // Step 2: Calculate gaps and opportunities
  const gaps: ProgramGap[] = [];
  const saturated: string[] = [];

  for (const occupation of regionalData.topOccupations) {
    const coverage = programMappings.find(m => m.socCode === occupation.socCode);
    
    if (!coverage || coverage.coverageLevel === 'none') {
      // UNMET DEMAND: Strong demand, no program
      const opportunityScore = calculateOpportunityScore(occupation, 'unmet');
      gaps.push({
        occupation: occupation.occupation,
        socCode: occupation.socCode,
        gapType: 'unmet_demand',
        opportunityScore,
        rationale: `No current program serves this occupation. ${occupation.rationale}`,
        demandStrength: occupation.demandScore,
        competitionLevel: 'low',
      });
    } else if (coverage.coverageLevel === 'partial') {
      // UNDERSERVED: Some coverage but could expand
      const opportunityScore = calculateOpportunityScore(occupation, 'underserved');
      gaps.push({
        occupation: occupation.occupation,
        socCode: occupation.socCode,
        gapType: 'underserved',
        opportunityScore,
        rationale: `Partially served by "${coverage.matchingPrograms[0]}" but could expand. ${occupation.rationale}`,
        demandStrength: occupation.demandScore,
        competitionLevel: 'moderate',
      });
    } else if (coverage.coverageLevel === 'full' && coverage.competitorCount > 3) {
      // SATURATED: Already have program + many competitors
      saturated.push(`${occupation.occupation} - Already offered, ${coverage.competitorCount} competitors in region`);
    }
  }

  // Sort gaps by opportunity score
  gaps.sort((a, b) => b.opportunityScore - a.opportunityScore);

  const highOpportunity = gaps.filter(g => g.opportunityScore >= 7);
  const moderateOpportunity = gaps.filter(g => g.opportunityScore >= 5 && g.opportunityScore < 7);

  console.log(`[Gap Analyzer] Found ${highOpportunity.length} high-opportunity gaps`);
  console.log(`[Gap Analyzer] Found ${moderateOpportunity.length} moderate-opportunity gaps`);
  console.log(`[Gap Analyzer] Identified ${saturated.length} saturated areas`);

  return {
    institution: institutionName,
    totalGapsIdentified: gaps.length,
    highOpportunityGaps: highOpportunity.slice(0, 15),
    moderateOpportunityGaps: moderateOpportunity.slice(0, 10),
    saturatedAreas: saturated.slice(0, 5),
    analysisDate: new Date().toISOString(),
  };
}

interface ProgramCoverage {
  socCode: string;
  occupation: string;
  coverageLevel: 'none' | 'partial' | 'full';
  matchingPrograms: string[];
  competitorCount: number;
}

async function identifyExistingCoverage(
  institutionName: string,
  occupations: OccupationDemand[],
  currentPrograms: string[]
): Promise<ProgramCoverage[]> {
  if (currentPrograms.length === 0) {
    // No existing programs = all gaps are unmet demand
    return occupations.map(occ => ({
      socCode: occ.socCode,
      occupation: occ.occupation,
      coverageLevel: 'none' as const,
      matchingPrograms: [],
      competitorCount: estimateCompetitors(occ.socCode),
    }));
  }

  // Use AI to map existing programs to occupations
  const mappingPrompt = `You are analyzing which occupations are served by an institution's current programs.

INSTITUTION: ${institutionName}

CURRENT PROGRAMS:
${currentPrograms.map((p, i) => `${i + 1}. ${p}`).join('\n')}

OCCUPATIONS TO CHECK:
${occupations.slice(0, 30).map(occ => `- ${occ.occupation} (SOC ${occ.socCode})`).join('\n')}

For each occupation, determine:
1. Is it fully served (institution has direct program)?
2. Is it partially served (related program but not exact match)?
3. Is it not served at all?

Return ONLY a JSON array:
[
  {
    "socCode": "29-1141",
    "occupation": "Registered Nurses",
    "coverageLevel": "full",
    "matchingPrograms": ["Associate Degree in Nursing (ADN)"],
    "competitorCount": 2
  }
]

Rules:
- coverageLevel: "full", "partial", or "none"
- competitorCount: estimate 1-5 based on how common the program is
- matchingPrograms: empty array if coverageLevel is "none"`;

  const { content } = await callClaude(mappingPrompt, {
    maxTokens: 4000,
    temperature: 0.3,
  });

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('[Gap Analyzer] Failed to parse coverage mapping');
    }
  }

  // Fallback: assume no coverage
  return occupations.map(occ => ({
    socCode: occ.socCode,
    occupation: occ.occupation,
    coverageLevel: 'none' as const,
    matchingPrograms: [],
    competitorCount: estimateCompetitors(occ.socCode),
  }));
}

function calculateOpportunityScore(
  occupation: OccupationDemand,
  gapType: 'unmet' | 'underserved'
): number {
  let score = occupation.demandScore; // Start with labor demand score

  // Boost for unmet demand
  if (gapType === 'unmet') {
    score += 1.5;
  } else {
    score += 0.5; // Smaller boost for underserved
  }

  // Wage bonus (programs with better ROI)
  if (occupation.medianWage && occupation.medianWage > 70000) {
    score += 1;
  } else if (occupation.medianWage && occupation.medianWage > 50000) {
    score += 0.5;
  }

  return Math.min(Math.round(score * 10) / 10, 10);
}

function estimateCompetitors(socCode: string): number {
  // Healthcare: moderate competition
  if (socCode.startsWith('29-') || socCode.startsWith('31-')) return 3;
  // Tech: low-moderate competition
  if (socCode.startsWith('15-')) return 2;
  // Business: high competition
  if (socCode.startsWith('11-') || socCode.startsWith('13-')) return 4;
  // Trades: low competition
  if (socCode.startsWith('47-') || socCode.startsWith('49-')) return 2;
  // Default
  return 3;
}
