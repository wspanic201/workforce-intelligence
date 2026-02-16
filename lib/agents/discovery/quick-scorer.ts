import { callClaude } from '@/lib/ai/anthropic';
import { ProgramRecommendation } from './program-mapper';

export interface ScoredProgram extends ProgramRecommendation {
  opportunityScore: number; // 1-10 composite score
  scoreBreakdown: {
    demandStrength: number; // 1-10
    competitionGap: number; // 1-10
    salaryROI: number; // 1-10
    institutionalFit: number; // 1-10
  };
  recommendation: 'High Priority' | 'Strong Opportunity' | 'Consider' | 'Low Priority';
  keyInsights: string[]; // 3-4 bullet points
  risks: string[];
}

/**
 * Quick Scorer
 * Runs a lightweight version of the 7-stage validation to score each program.
 * Focuses on the most critical signals without full research depth.
 */
export async function scoreProgramRecommendations(
  institutionName: string,
  geographicArea: string,
  recommendations: ProgramRecommendation[]
): Promise<ScoredProgram[]> {
  console.log(`[Quick Scorer] Scoring ${recommendations.length} program recommendations`);

  // Score in batches
  const batchSize = 5;
  const allScored: ScoredProgram[] = [];

  for (let i = 0; i < recommendations.length; i += batchSize) {
    const batch = recommendations.slice(i, i + batchSize);
    const scored = await scoreBatch(institutionName, geographicArea, batch);
    allScored.push(...scored);
  }

  // Sort by opportunity score (descending)
  allScored.sort((a, b) => b.opportunityScore - a.opportunityScore);

  console.log(`[Quick Scorer] Scored ${allScored.length} programs`);
  console.log(`[Quick Scorer] Top 3:`);
  allScored.slice(0, 3).forEach((prog, i) => {
    console.log(`  ${i + 1}. ${prog.programName} - ${prog.opportunityScore}/10 (${prog.recommendation})`);
  });

  return allScored;
}

async function scoreBatch(
  institutionName: string,
  geographicArea: string,
  programs: ProgramRecommendation[]
): Promise<ScoredProgram[]> {
  const prompt = `You are a program validation expert conducting quick opportunity scoring for ${institutionName} in ${geographicArea}.

For each program below, score it on 4 key dimensions (each 1-10):

1. **Demand Strength** (1-10): How strong is labor market demand?
   - Job growth trends
   - Current hiring volume
   - Long-term sustainability

2. **Competition Gap** (1-10): How favorable is the competitive landscape?
   - Few existing programs = 10
   - Saturated market = 1-3
   - Consider local and online competitors

3. **Salary ROI** (1-10): Does the career outcome justify student investment?
   - Median salary vs. program cost
   - Career advancement potential
   - Debt-to-income ratio

4. **Institutional Fit** (1-10): Can this institution realistically launch it?
   - Complexity vs. capacity
   - Resource requirements
   - Faculty availability
   - Accreditation barriers

PROGRAMS TO SCORE:
${programs.map((prog, i) => `
${i + 1}. **${prog.programName}**
   - Target: ${prog.targetOccupation} (SOC ${prog.socCode})
   - Type: ${prog.credentialType}, ${prog.programLength}
   - Cost Tier: ${prog.estimatedCostTier}
   - Complexity: ${prog.implementationComplexity}/5
   - Components: ${prog.coreComponents.slice(0, 3).join(', ')}
   - Resources: ${prog.requiredResources.slice(0, 2).join(', ')}
   - Rationale: ${prog.rationale}
`).join('\n')}

For EACH program, provide:
- 4 dimension scores (1-10)
- Opportunity Score (weighted average: demand 30%, competition 25%, salary 25%, fit 20%)
- Recommendation tier
- 3-4 key insights (strengths/opportunities)
- 2-3 risks to watch

Return ONLY a JSON array:
[
  {
    "programName": "Registered Nursing (ADN)",
    "opportunityScore": 8.7,
    "scoreBreakdown": {
      "demandStrength": 9,
      "competitionGap": 7,
      "salaryROI": 9,
      "institutionalFit": 6
    },
    "recommendation": "High Priority",
    "keyInsights": [
      "Strong nursing shortage creates sustained demand for 10+ years",
      "Excellent salary ($75k median) justifies 2-year investment",
      "State nursing board partnerships can accelerate approval"
    ],
    "risks": [
      "High startup cost ($500k+ for simulation lab)",
      "Faculty shortage (MSN-prepared nurses scarce)",
      "Accreditation timeline 18-24 months minimum"
    ]
  }
]

SCORING GUIDELINES:
- Demand Strength: Use BLS projections + regional data
- Competition Gap: Consider both local and online programs
- Salary ROI: $50k+ median = 7+, $70k+ = 9+
- Institutional Fit: Complexity 1-2 = 8-10 fit, Complexity 4-5 = 4-6 fit
- Opportunity Score = (demand × 0.30) + (competition × 0.25) + (salary × 0.25) + (fit × 0.20)
- Recommendation: 8+ = High Priority, 6.5-7.9 = Strong Opportunity, 5-6.4 = Consider, <5 = Low Priority
- Be honest about risks — better to flag issues now than after launch`;

  const { content } = await callClaude(prompt, {
    maxTokens: 6000,
    temperature: 0.5,
  });

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      const scored = JSON.parse(jsonMatch[0]);
      
      // Merge with original program data
      return programs.map(prog => {
        const scoreData = scored.find((s: any) => 
          s.programName === prog.programName || 
          s.programName.includes(prog.targetOccupation)
        );

        if (!scoreData) {
          console.warn(`[Quick Scorer] No score found for ${prog.programName}, using defaults`);
          return {
            ...prog,
            opportunityScore: 5,
            scoreBreakdown: {
              demandStrength: 5,
              competitionGap: 5,
              salaryROI: 5,
              institutionalFit: 5,
            },
            recommendation: 'Consider' as const,
            keyInsights: ['Insufficient data for full scoring'],
            risks: ['Requires additional validation'],
          };
        }

        return {
          ...prog,
          opportunityScore: scoreData.opportunityScore || 5,
          scoreBreakdown: scoreData.scoreBreakdown || {
            demandStrength: 5,
            competitionGap: 5,
            salaryROI: 5,
            institutionalFit: 5,
          },
          recommendation: scoreData.recommendation || 'Consider',
          keyInsights: scoreData.keyInsights || [],
          risks: scoreData.risks || [],
        };
      });
    } catch (e) {
      console.error('[Quick Scorer] Failed to parse scores:', e);
      return programs.map(prog => ({
        ...prog,
        opportunityScore: 5,
        scoreBreakdown: {
          demandStrength: 5,
          competitionGap: 5,
          salaryROI: 5,
          institutionalFit: 5,
        },
        recommendation: 'Consider' as const,
        keyInsights: [],
        risks: [],
      }));
    }
  }

  console.warn('[Quick Scorer] No valid JSON in response');
  return programs.map(prog => ({
    ...prog,
    opportunityScore: 5,
    scoreBreakdown: {
      demandStrength: 5,
      competitionGap: 5,
      salaryROI: 5,
      institutionalFit: 5,
    },
    recommendation: 'Consider' as const,
    keyInsights: [],
    risks: [],
  }));
}
