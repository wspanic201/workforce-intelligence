export interface DimensionScore {
  dimension: string;
  score: number; // 1-10
  weight: number; // decimal (e.g., 0.25)
  rationale: string;
}

export type Recommendation = 'Strong Go' | 'Conditional Go' | 'Cautious Proceed' | 'Defer' | 'No Go';

export interface ProgramScore {
  dimensions: DimensionScore[];
  compositeScore: number;
  recommendation: Recommendation;
  overrideApplied: boolean;
  overrideReason?: string;
  conditions?: string[];
}

export const DIMENSION_WEIGHTS: Record<string, number> = {
  'Labor Market Demand': 0.25,
  'Financial Viability': 0.20,
  'Employer Demand & Partnerships': 0.15,
  'Target Learner Demand': 0.15,
  'Competitive Landscape': 0.10,
  'Institutional Fit & Capacity': 0.10,
  'Regulatory & Compliance': 0.05,
};

export function calculateProgramScore(dimensions: DimensionScore[]): ProgramScore {
  // Calculate weighted composite
  let compositeScore = 0;
  for (const dim of dimensions) {
    compositeScore += dim.score * dim.weight;
  }

  // Determine recommendation
  let recommendation: Recommendation;
  if (compositeScore >= 8.0) recommendation = 'Strong Go';
  else if (compositeScore >= 6.5) recommendation = 'Conditional Go';
  else if (compositeScore >= 5.0) recommendation = 'Cautious Proceed';
  else if (compositeScore >= 3.5) recommendation = 'Defer';
  else recommendation = 'No Go';

  // Apply override rules
  let overrideApplied = false;
  let overrideReason = '';
  const conditions: string[] = [];

  // Rule 1: Any dimension <= 3 caps at Conditional Go
  const weakDimensions = dimensions.filter(d => d.score <= 3);
  if (weakDimensions.length > 0 && recommendation === 'Strong Go') {
    recommendation = 'Conditional Go';
    overrideApplied = true;
    overrideReason = `${weakDimensions[0].dimension} scored ${weakDimensions[0].score}/10, capping recommendation at Conditional Go`;
    conditions.push(`Address weakness in ${weakDimensions[0].dimension} before proceeding`);
  }

  // Rule 2: Financial Viability < 4 = Defer or No Go
  const financial = dimensions.find(d => d.dimension === 'Financial Viability');
  if (financial && financial.score < 4) {
    recommendation = compositeScore >= 3.5 ? 'Defer' : 'No Go';
    overrideApplied = true;
    overrideReason = `Financial Viability scored ${financial.score}/10 — CE programs cannot launch without viable financial model`;
  }

  // Rule 3: Labor Market < 4 = Defer or No Go
  const laborMarket = dimensions.find(d => d.dimension === 'Labor Market Demand');
  if (laborMarket && laborMarket.score < 4) {
    recommendation = compositeScore >= 3.5 ? 'Defer' : 'No Go';
    overrideApplied = true;
    overrideReason = `Labor Market Demand scored ${laborMarket.score}/10 — there must be jobs for completers`;
  }

  return {
    dimensions,
    compositeScore: Math.round(compositeScore * 10) / 10,
    recommendation,
    overrideApplied,
    overrideReason: overrideReason || undefined,
    conditions: conditions.length > 0 ? conditions : undefined,
  };
}

/**
 * Build a DimensionScore from an agent's output
 */
export function buildDimensionScore(
  dimension: string,
  score: number,
  rationale: string
): DimensionScore {
  const weight = DIMENSION_WEIGHTS[dimension];
  if (!weight) {
    throw new Error(`Unknown dimension: ${dimension}. Valid dimensions: ${Object.keys(DIMENSION_WEIGHTS).join(', ')}`);
  }
  return { dimension, score: Math.max(1, Math.min(10, score)), weight, rationale };
}
