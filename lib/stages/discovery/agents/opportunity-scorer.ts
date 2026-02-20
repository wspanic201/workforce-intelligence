/**
 * Phase 4: Opportunity Synthesis & Scoring
 * 
 * Cross-references Phases 1-3 to identify and rank the strongest
 * program opportunities. Uses Matt's weighted scoring matrix:
 *   Demand Evidence: 30%
 *   Competitive Gap: 25%
 *   Revenue Viability: 20%
 *   Wage Outcomes: 15%
 *   Launch Speed: 10%
 * 
 * Categorizes: Quick Win / Strategic Build / Emerging Opportunity
 * Selects top 5-8 for the final brief.
 */

import { callClaude } from '@/lib/ai/anthropic';
import type { RegionalIntelligenceOutput } from './regional-intelligence';
import type { DemandSignalOutput } from './demand-signals';
import type { CompetitiveLandscapeOutput, CompetitiveGap } from './competitive-landscape';
import { getCategoryConstraint } from '../category-constraint';

// ── Types ──

export interface ScoredOpportunity {
  rank: number;
  programTitle: string;
  description: string;                 // 2-3 sentence elevator pitch
  targetOccupation: string;
  socCode: string;
  tier: 'quick_win' | 'strategic_build' | 'emerging';
  scores: {
    demandEvidence: number;            // 1-10
    competitiveGap: number;            // 1-10
    revenueViability: number;          // 1-10
    wageOutcomes: number;              // 1-10
    launchSpeed: number;               // 1-10
    composite: number;                 // weighted average
  };
  demandEvidence: Array<{
    point: string;
    source: string;
  }>;
  competitivePosition: string;         // white_space / undersaturated / etc
  keyMetrics: {
    regionalAnnualOpenings: string;
    medianHourlyWage: string;
    projectedGrowth: string;
    activeJobPostings: string;
  };
  programSnapshot: {
    estimatedDuration: string;
    deliveryFormat: string;
    stackableCredentials: string[];
    targetAudience: string;
  };
  whatValidationWouldConfirm: string[]; // 2-3 questions for Stage 2
  barriers: string[];
}

export interface OpportunityScorerOutput {
  scoredOpportunities: ScoredOpportunity[];
  fullCandidateMatrix: Array<{         // All 10-15 candidates, not just top 5-8
    programTitle: string;
    compositeScore: number;
    tier: string;
    included: boolean;
  }>;
  quickWins: ScoredOpportunity[];
  strategicBuilds: ScoredOpportunity[];
  emergingOpps: ScoredOpportunity[];
}

// ── Main Agent ──

export async function scoreOpportunities(
  regionalIntel: RegionalIntelligenceOutput,
  demandSignals: DemandSignalOutput,
  competitiveLandscape: CompetitiveLandscapeOutput,
  category?: string
): Promise<OpportunityScorerOutput> {
  const { institution, topEmployers } = regionalIntel;
  const region = `${institution.city}, ${institution.state}`;

  console.log(`[Phase 4: Opportunity Scorer] Starting synthesis for ${region}`);

  // ── Build candidate list from demand signals + competitive gaps ──
  
  // Compile all data into a structured brief for Claude
  const demandSummary = demandSignals.signals
    .filter(s => s.signalType !== 'grant_funding')
    .map(s => `- ${s.occupation} (${s.socCode || 'no SOC'}): ${s.strength} — ${s.evidence.slice(0, 150)}`)
    .join('\n');

  const gapSummary = competitiveLandscape.gaps
    .map(g => `- ${g.occupation} (${g.socCode}): ${g.gapCategory} — ${g.providerCount} providers — ${g.opportunity.slice(0, 100)}`)
    .join('\n');

  const employerSummary = topEmployers
    .slice(0, 15)
    .map(e => `- ${e.name} (${e.industry}): ${e.estimatedLocalEmployment} employees — ${e.hiringSignals}`)
    .join('\n');

  const grantSummary = demandSignals.grantOpportunities
    .map(g => `- ${g.name}: ${g.industry} — ${g.details}`)
    .join('\n');

  const certSummary = demandSignals.trendingCertifications
    .map(c => `- ${c.certification} (${c.industry}): ${c.frequency}`)
    .join('\n');

  const currentPrograms = institution.currentPrograms.join(', ') || 'Not fully cataloged';

  // ── Score and rank with Claude ──

  const categoryConstraint = getCategoryConstraint(category);

  const scoringResult = await callClaude(
    `${categoryConstraint}You are a Senior Workforce Intelligence Analyst scoring program opportunities for ${institution.name} in ${institution.serviceArea}, ${institution.state}${category ? `.\n\nThis is a **${category} Category Deep Dive** — ONLY score and recommend programs within the ${category} domain` : ''}.

## SCORING MATRIX
Score each candidate 1-10 on these dimensions:

| Dimension | Weight | 10 (Best) | 1 (Worst) |
|-----------|--------|-----------|-----------|
| Demand Evidence | 30% | 3+ strong local signals | Single national trend only |
| Competitive Gap | 25% | No local provider (white space) | 3+ providers already |
| Revenue Viability | 20% | High enrollment + premium pricing | Uncertain market + low price |
| Wage Outcomes | 15% | $25+/hr median | Below $16/hr |
| Launch Speed | 10% | Launchable in 0-6 months | 12+ months with major barriers |

Composite = (demand × 0.30) + (gap × 0.25) + (revenue × 0.20) + (wages × 0.15) + (speed × 0.10)

## CATEGORIZATION
- Quick Win: Composite 7+, launchable in 3-6 months, low startup cost
- Strategic Build: Composite 6+, needs 6-12 months but high long-term value
- Emerging: Composite 5+, early signals, potential first-mover advantage

## INPUT DATA

### Current Programs (DO NOT RECOMMEND DUPLICATES):
${currentPrograms}

### Demand Signals (from job postings, BLS, employers):
${demandSummary}

### Competitive Gaps:
${gapSummary}

### Top Regional Employers:
${employerSummary}

### Grant/Funding Opportunities:
${grantSummary || 'None identified'}

### Trending Certifications:
${certSummary || 'None identified'}

### Institution Strategic Priorities:
${institution.strategicPriorities.join(', ') || 'Not identified'}

## INSTRUCTIONS

1. Build a candidate list of 10-15 potential programs from the data above
2. Score each on the 5-dimension matrix
3. Rank by composite score
4. Select top 5-8 for the final brief
5. Categorize each as Quick Win / Strategic Build / Emerging
6. For EACH of the top 5-8, provide the full detail structure below

CRITICAL RULES:
- Do NOT recommend programs the college already offers
- Minimum 2 independent demand signals per recommendation
- Every data point must come from the input data above — do NOT fabricate
- At least 2 Quick Wins (launchable in 3-6 months)
- Maximum 8 recommendations
- "What Validation Would Confirm" must contain questions that genuinely require Stage 2 to answer

Return ONLY valid JSON:
{
  "scoredOpportunities": [
    {
      "rank": 1,
      "programTitle": "Specific Program Name",
      "description": "2-3 sentence elevator pitch — why this matters NOW for this college in this region",
      "targetOccupation": "Specific Occupation",
      "socCode": "XX-XXXX",
      "tier": "quick_win",
      "scores": {
        "demandEvidence": 9,
        "competitiveGap": 8,
        "revenueViability": 7,
        "wageOutcomes": 8,
        "launchSpeed": 9,
        "composite": 8.3
      },
      "demandEvidence": [
        { "point": "Specific data point", "source": "Source name" },
        { "point": "Second data point", "source": "Source name" }
      ],
      "competitivePosition": "white_space",
      "keyMetrics": {
        "regionalAnnualOpenings": "number or estimate",
        "medianHourlyWage": "$XX.XX",
        "projectedGrowth": "X% over 10 years",
        "activeJobPostings": "number"
      },
      "programSnapshot": {
        "estimatedDuration": "12 weeks / 6 months / etc.",
        "deliveryFormat": "hybrid / in-person / online",
        "stackableCredentials": ["Cert 1", "Cert 2"],
        "targetAudience": "1-2 sentence description"
      },
      "whatValidationWouldConfirm": [
        "Question 1 that only Stage 2 can answer",
        "Question 2",
        "Question 3"
      ],
      "barriers": ["Risk or barrier 1", "Risk 2"]
    }
  ],
  "fullCandidateMatrix": [
    { "programTitle": "Program Name", "compositeScore": 8.3, "tier": "quick_win", "included": true },
    { "programTitle": "Another Program", "compositeScore": 5.1, "tier": "emerging", "included": false }
  ]
}`,
    { maxTokens: 8000, temperature: 0.4 }
  );

  // Parse the scored opportunities
  let result: any = {};
  try {
    // Strip markdown code fences if present
    let content = scoringResult.content
      .replace(/^```(?:json)?\s*\n?/gm, '')
      .replace(/\n?```\s*$/gm, '')
      .trim();
    const jsonStr = content.match(/\{[\s\S]*\}/)?.[0];
    if (jsonStr) {
      result = JSON.parse(jsonStr);
    }
  } catch (e) {
    console.error('[Phase 4] Failed to parse scoring output, attempting recovery...');
    try {
      // Try extracting the array directly (use greedy match for nested objects)
      const arrayMatch = scoringResult.content.match(/"scoredOpportunities"\s*:\s*(\[[\s\S]*\])\s*[,}]/);
      if (arrayMatch) {
        result = { scoredOpportunities: JSON.parse(arrayMatch[1]) };
      }
    } catch (e2) {
      console.error('[Phase 4] Recovery also failed:', (e2 as Error).message?.slice(0, 200));
    }
  }

  const scoredOpportunities: ScoredOpportunity[] = (result.scoredOpportunities || []).map((opp: any, i: number) => ({
    rank: opp.rank || i + 1,
    programTitle: opp.programTitle || 'Unknown Program',
    description: opp.description || '',
    targetOccupation: opp.targetOccupation || '',
    socCode: opp.socCode || '',
    tier: opp.tier || 'strategic_build',
    scores: {
      demandEvidence: opp.scores?.demandEvidence || 5,
      competitiveGap: opp.scores?.competitiveGap || 5,
      revenueViability: opp.scores?.revenueViability || 5,
      wageOutcomes: opp.scores?.wageOutcomes || 5,
      launchSpeed: opp.scores?.launchSpeed || 5,
      composite: opp.scores?.composite || calculateComposite(opp.scores),
    },
    demandEvidence: opp.demandEvidence || [],
    competitivePosition: opp.competitivePosition || 'unknown',
    keyMetrics: opp.keyMetrics || {},
    programSnapshot: opp.programSnapshot || {},
    whatValidationWouldConfirm: opp.whatValidationWouldConfirm || [],
    barriers: opp.barriers || [],
  }));

  // Sort by composite score
  scoredOpportunities.sort((a, b) => b.scores.composite - a.scores.composite);

  // Categorize
  const quickWins = scoredOpportunities.filter(o => o.tier === 'quick_win');
  const strategicBuilds = scoredOpportunities.filter(o => o.tier === 'strategic_build');
  const emergingOpps = scoredOpportunities.filter(o => o.tier === 'emerging');

  console.log(`[Phase 4: Opportunity Scorer] Complete. ${scoredOpportunities.length} opportunities scored.`);
  console.log(`  Quick Wins: ${quickWins.length}, Strategic Builds: ${strategicBuilds.length}, Emerging: ${emergingOpps.length}`);

  return {
    scoredOpportunities,
    fullCandidateMatrix: result.fullCandidateMatrix || scoredOpportunities.map(o => ({
      programTitle: o.programTitle,
      compositeScore: o.scores.composite,
      tier: o.tier,
      included: true,
    })),
    quickWins,
    strategicBuilds,
    emergingOpps,
  };
}

function calculateComposite(scores: any): number {
  if (!scores) return 5;
  return Math.round((
    (scores.demandEvidence || 5) * 0.30 +
    (scores.competitiveGap || 5) * 0.25 +
    (scores.revenueViability || 5) * 0.20 +
    (scores.wageOutcomes || 5) * 0.15 +
    (scores.launchSpeed || 5) * 0.10
  ) * 10) / 10;
}
