/**
 * Grant Matcher — Agent 3
 *
 * Scores each grant on 5 dimensions (1-10) and produces a composite
 * weighted score. Ranks grants from best to worst fit for a specific
 * institution profile.
 *
 * Scoring dimensions:
 *   1. Eligibility Fit (30%) — Is this college eligible?
 *   2. Strategic Alignment (25%) — Does it match programs/priorities?
 *   3. Award Size (20%) — Bigger = better
 *   4. Competition Level (15%) — Fewer applicants = better
 *   5. Timeline Feasibility (10%) — Enough time to apply?
 */

import { callClaude } from '@/lib/ai/anthropic';
import type { GrantDetails } from '@/lib/apis/grants-gov';
import type { PastAwardData } from './past-award-analyzer';

// ── Types ──

export interface InstitutionProfile {
  collegeName: string;
  state: string;
  city?: string;
  currentPrograms: string[];
  strategicPriorities: string[];
  annualRevenue?: string;
  enrollmentSize?: string;
}

export interface GrantScores {
  eligibilityFit: number;       // 1-10, weight 30%
  strategicAlignment: number;   // 1-10, weight 25%
  awardSize: number;            // 1-10, weight 20%
  competitionLevel: number;     // 1-10, weight 15%
  timelineFeasibility: number;  // 1-10, weight 10%
  composite: number;            // weighted average 1-10
}

export interface ScoredGrant extends GrantDetails {
  scores: GrantScores;
  scoreRationale: {
    eligibilityFit: string;
    strategicAlignment: string;
    awardSize: string;
    competitionLevel: string;
    timelineFeasibility: string;
  };
  matchTier: 'priority' | 'strategic' | 'monitor' | 'skip';
  whyItFits: string;
}

export interface GrantMatchOutput {
  scoredGrants: ScoredGrant[];
  institutionProfile: InstitutionProfile;
}

// ── Weights ──
const WEIGHTS = {
  eligibilityFit: 0.30,
  strategicAlignment: 0.25,
  awardSize: 0.20,
  competitionLevel: 0.15,
  timelineFeasibility: 0.10,
};

function computeComposite(scores: Omit<GrantScores, 'composite'>): number {
  return Math.round(
    (scores.eligibilityFit * WEIGHTS.eligibilityFit +
      scores.strategicAlignment * WEIGHTS.strategicAlignment +
      scores.awardSize * WEIGHTS.awardSize +
      scores.competitionLevel * WEIGHTS.competitionLevel +
      scores.timelineFeasibility * WEIGHTS.timelineFeasibility) * 10
  ) / 10;
}

function scoreToTier(composite: number): 'priority' | 'strategic' | 'monitor' | 'skip' {
  if (composite >= 7.5) return 'priority';
  if (composite >= 6.0) return 'strategic';
  if (composite >= 4.5) return 'monitor';
  return 'skip';
}

// ── Main Agent ──

export async function matchGrants(
  grants: GrantDetails[],
  pastAwards: PastAwardData[],
  profile: InstitutionProfile
): Promise<GrantMatchOutput> {
  console.log(`\n[Grant Matcher] Scoring ${grants.length} grants for ${profile.collegeName}`);
  const startTime = Date.now();

  const pastAwardMap = new Map<string, PastAwardData>();
  for (const pa of pastAwards) {
    pastAwardMap.set(pa.grantId, pa);
  }

  const scoredGrants: ScoredGrant[] = [];

  // Process in parallel batches of 5 (concurrent Claude calls)
  const CONCURRENCY = 5;
  for (let i = 0; i < grants.length; i += CONCURRENCY) {
    const batch = grants.slice(i, i + CONCURRENCY);
    console.log(`[Grant Matcher] Scoring batch ${Math.floor(i / CONCURRENCY) + 1}/${Math.ceil(grants.length / CONCURRENCY)} (${batch.length} grants)...`);

    const results = await Promise.allSettled(
      batch.map(async (grant) => {
        const pastAward = pastAwardMap.get(grant.id);
        return scoreOneGrant(grant, pastAward, profile);
      })
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const grant = batch[j];
      if (result.status === 'fulfilled') {
        scoredGrants.push(result.value);
      } else {
        console.warn(`[Grant Matcher] Failed to score grant ${grant.id}: ${result.reason?.message || result.reason}`);
        scoredGrants.push({
          ...grant,
          scores: {
            eligibilityFit: 3,
            strategicAlignment: 3,
            awardSize: 3,
            competitionLevel: 3,
            timelineFeasibility: 3,
            composite: 3,
          },
          scoreRationale: {
            eligibilityFit: 'Scoring failed — defaulted',
            strategicAlignment: 'Scoring failed — defaulted',
            awardSize: 'Unknown award size',
            competitionLevel: 'Unknown competition',
            timelineFeasibility: 'Unknown timeline',
          },
          matchTier: 'monitor',
          whyItFits: 'Could not analyze this grant automatically.',
        });
      }
    }
  }

  // Sort by composite score descending
  scoredGrants.sort((a, b) => b.scores.composite - a.scores.composite);

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const tierCounts = {
    priority: scoredGrants.filter(g => g.matchTier === 'priority').length,
    strategic: scoredGrants.filter(g => g.matchTier === 'strategic').length,
    monitor: scoredGrants.filter(g => g.matchTier === 'monitor').length,
    skip: scoredGrants.filter(g => g.matchTier === 'skip').length,
  };
  console.log(`[Grant Matcher] Complete in ${elapsed}s — Priority: ${tierCounts.priority}, Strategic: ${tierCounts.strategic}, Monitor: ${tierCounts.monitor}, Skip: ${tierCounts.skip}`);

  return { scoredGrants, institutionProfile: profile };
}

// ── Single Grant Scorer ──

async function scoreOneGrant(
  grant: GrantDetails,
  pastAward: PastAwardData | undefined,
  profile: InstitutionProfile
): Promise<ScoredGrant> {
  const today = new Date();
  const closeDate = grant.closeDate ? new Date(grant.closeDate) : null;
  const daysUntilDeadline = closeDate
    ? Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const pastAwardContext = pastAward
    ? `Past recipients: ${pastAward.pastRecipients.map(r => r.institution).join(', ') || 'none found'}
Average award: ${pastAward.avgAwardAmount ? `$${pastAward.avgAwardAmount.toLocaleString()}` : 'unknown'}
Success rate: ${pastAward.successRate || 'unknown'}
Competitive insights: ${pastAward.competitiveInsights}`
    : 'No past award data available.';

  const prompt = `You are a grant matching expert for community colleges. Score this grant opportunity for the institution below.

INSTITUTION PROFILE:
- Name: ${profile.collegeName}
- State: ${profile.state}
- City: ${profile.city || 'unknown'}
- Current Programs: ${profile.currentPrograms.join(', ') || 'general workforce training'}
- Strategic Priorities: ${profile.strategicPriorities.join(', ') || 'workforce development'}
- Enrollment: ${profile.enrollmentSize || 'unknown'}

GRANT OPPORTUNITY:
- Title: ${grant.title}
- Number: ${grant.number}
- Agency: ${grant.agency}
- Status: ${grant.oppStatus}
- Close Date: ${grant.closeDate || 'unknown'} (${daysUntilDeadline !== null ? `${daysUntilDeadline} days away` : 'unknown timeline'})
- Award Floor: ${grant.awardFloor ? `$${grant.awardFloor.toLocaleString()}` : 'not specified'}
- Award Ceiling: ${grant.awardCeiling ? `$${grant.awardCeiling.toLocaleString()}` : 'not specified'}
- CFDA: ${grant.cfdaList?.join(', ') || 'none'}
- Description: ${(grant.synopsis || grant.description || '').slice(0, 800)}
- Eligibility: ${grant.eligibilityDetails?.slice(0, 400) || 'see grant details'}

PAST AWARD INTELLIGENCE:
${pastAwardContext}

Score this grant on 5 dimensions (1-10 each):

1. Eligibility Fit (30% weight): Is a public community college clearly eligible? 10 = explicitly eligible, 1 = clearly ineligible
2. Strategic Alignment (25% weight): Does this match the college's programs and priorities? 10 = perfect match, 1 = no connection
3. Award Size (20% weight): How substantial is the award? 10 = $500K+, 7 = $100-500K, 4 = $50-100K, 2 = <$50K or unknown
4. Competition Level (15% weight): How winnable is this? 10 = niche, few applicants, 5 = moderate, 1 = extremely competitive (hundreds of applicants)
5. Timeline Feasibility (10% weight): Is there enough time to apply? 10 = 90+ days, 7 = 60 days, 4 = 30 days, 1 = <14 days or already closed

Return a JSON object:
{
  "scores": {
    "eligibilityFit": 8,
    "strategicAlignment": 7,
    "awardSize": 6,
    "competitionLevel": 5,
    "timelineFeasibility": 8
  },
  "scoreRationale": {
    "eligibilityFit": "One sentence explaining this score",
    "strategicAlignment": "One sentence explaining this score",
    "awardSize": "One sentence explaining this score",
    "competitionLevel": "One sentence explaining this score",
    "timelineFeasibility": "One sentence explaining this score"
  },
  "whyItFits": "2-3 sentences explaining why (or why not) this grant is a good fit for ${profile.collegeName} specifically"
}

Return only valid JSON.`;

  const response = await callClaude(prompt, { temperature: 0.25, maxTokens: 1500 });
  const jsonStr = response.content.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonStr) {
    throw new Error('No JSON in Claude response for grant scoring');
  }

  const parsed = JSON.parse(jsonStr);
  const rawScores = parsed.scores;

  const composite = computeComposite(rawScores);
  const scores: GrantScores = { ...rawScores, composite };
  const matchTier = scoreToTier(composite);

  return {
    ...grant,
    scores,
    scoreRationale: parsed.scoreRationale,
    matchTier,
    whyItFits: parsed.whyItFits || '',
  };
}
