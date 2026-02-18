/**
 * Grant Intelligence Writer — Agent 5
 *
 * Synthesizes all upstream data into a comprehensive Grant Intelligence Report.
 * This is the final deliverable — a polished, actionable document that helps
 * a community college's leadership decide which grants to pursue and when.
 *
 * Report sections:
 *   - Executive Summary
 *   - Priority Grants (pursue immediately)
 *   - Strategic Grants (plan ahead)
 *   - Monitor List (track for future cycles)
 *   - Skip List (with rationale)
 *   - Per-grant detail cards
 *   - Deadline Calendar (by month)
 *   - Recommendations (NOW vs NEXT QUARTER)
 *
 * Branding rule: Do not mention any third-party company or brand names
 * that were not found in source data.
 */

import { callClaude } from '@/lib/ai/anthropic';
import type { ScoredGrant } from './grant-matcher';
import type { PastAwardData } from './past-award-analyzer';
import type { GrantRequirements } from './requirements-analyzer';
import type { InstitutionProfile } from './grant-matcher';

// ── Types ──

export interface BriefWriterInput {
  collegeName: string;
  state: string;
  city?: string;
  programFocusAreas?: string[];
  institutionProfile: InstitutionProfile;
  scoredGrants: ScoredGrant[];
  pastAwards: PastAwardData[];
  requirements: GrantRequirements[];
}

export interface GrantBrief {
  fullMarkdown: string;
  wordCount: number;
  pageEstimate: number;
  metadata: {
    totalGrantsReviewed: number;
    priorityGrantCount: number;
    strategicGrantCount: number;
    monitorGrantCount: number;
    skipGrantCount: number;
    topGrantTitle: string;
    generatedAt: string;
  };
}

// ── Main Agent ──

export async function writeGrantBrief(input: BriefWriterInput): Promise<GrantBrief> {
  console.log(`\n[Grant Brief Writer] Generating Grant Intelligence Report for ${input.collegeName}`);
  const startTime = Date.now();

  const { scoredGrants, pastAwards, requirements, institutionProfile } = input;

  // Build lookup maps
  const pastAwardMap = new Map<string, PastAwardData>();
  for (const pa of pastAwards) pastAwardMap.set(pa.grantId, pa);

  const requirementsMap = new Map<string, GrantRequirements>();
  for (const req of requirements) requirementsMap.set(req.grantId, req);

  // Segment grants by tier
  const priorityGrants = scoredGrants.filter(g => g.matchTier === 'priority');
  const strategicGrants = scoredGrants.filter(g => g.matchTier === 'strategic');
  const monitorGrants = scoredGrants.filter(g => g.matchTier === 'monitor');
  const skipGrants = scoredGrants.filter(g => g.matchTier === 'skip');

  // Build grant data context for Claude
  const grantContext = buildGrantContext(scoredGrants, pastAwardMap, requirementsMap, 20);

  // ── Build the report in two passes: structure then write ──
  // Pass 1: Executive summary and categorization
  // Pass 2: Full report with all detail cards

  const today = new Date();
  const reportDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const prompt = `You are a senior grant intelligence analyst writing a professional Grant Opportunity Report for a community college's leadership team.

INSTITUTION:
- Name: ${input.collegeName}
- State: ${input.state}
- City: ${input.city || 'unknown'}
- Current Programs: ${institutionProfile.currentPrograms.join(', ') || 'General workforce training'}
- Strategic Priorities: ${institutionProfile.strategicPriorities.join(', ') || 'Workforce development'}
- Focus Areas: ${input.programFocusAreas?.join(', ') || 'All workforce areas'}

GRANT DATA:
${grantContext}

TIER SUMMARY:
- Priority (pursue immediately): ${priorityGrants.length} grants
- Strategic (plan ahead): ${strategicGrants.length} grants
- Monitor (track for future): ${monitorGrants.length} grants
- Skip (low fit): ${skipGrants.length} grants

BRANDING RULE: Do not mention any third-party company or brand names that were not found in the source data above.

Write a comprehensive Grant Intelligence Report in Markdown. Include these sections:

---

# Grant Intelligence Report: ${input.collegeName}
*Prepared: ${reportDate} | ${scoredGrants.length} opportunities reviewed*

## Executive Summary
(3-5 sentences highlighting the top 3-5 opportunities and the overall funding landscape for ${input.collegeName}. Mention total potential funding if the top grants were awarded.)

## Priority Grants — Pursue Immediately
(For each priority-tier grant: grant name as ### heading, then: agency, deadline, award range, fit score, why it fits the college, top 2-3 action items to begin applying. Sort by deadline ascending.)

## Strategic Grants — Plan Ahead
(For each strategic-tier grant: similar detail cards but shorter. Mention approximate future cycle if this cycle's deadline has passed.)

## Monitor List — Track for Future Cycles
(Bullet list format: grant name, agency, why it's worth watching, what needs to change for it to become priority)

## Skip List
(Bullet list with one-sentence explanation of why each was deprioritized)

## Grant Detail Cards
(Full detail card for each Priority and Strategic grant. Each card should include:
- **Grant Name:** full title
- **Grant Number:** number
- **Agency:** name
- **Award Range:** floor to ceiling
- **Deadline:** date + days remaining
- **Fit Score:** X.X/10 with breakdown table
- **Past Award Intelligence:** who won before, avg award, success rate, competitive insights
- **Application Requirements:** narrative sections, data needs, letters of support, budget notes, match requirements
- **Estimated Effort:** level + hours + rationale
- **Why This Fits ${input.collegeName}:** specific rationale
- **Grants.gov Link:** URL
)

## Deadline Calendar
(Table or month-by-month list of all priority + strategic grant deadlines)

## Recommendations

### Apply NOW (Next 30-60 Days)
(Specific grants with clear action steps)

### Plan for Next Quarter
(Specific grants to prepare for, with prep steps)

### Foundation and State Funding to Explore
(Brief section on other funding sources beyond what was found in Grants.gov)

---

Write in a professional but accessible consulting style. Be specific and actionable — avoid generic advice. 
Every recommendation should be tied to actual data from the grants above.
Use tables where they add clarity.
Include Grants.gov URLs for all featured grants.`;

  const response = await callClaude(prompt, { temperature: 0.5, maxTokens: 16000 });
  const markdown = response.content;

  // Compute metadata
  const wordCount = markdown.split(/\s+/).length;
  const pageEstimate = Math.ceil(wordCount / 500);

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Grant Brief Writer] Complete in ${elapsed}s — ${wordCount} words, ~${pageEstimate} pages`);

  return {
    fullMarkdown: markdown,
    wordCount,
    pageEstimate,
    metadata: {
      totalGrantsReviewed: scoredGrants.length,
      priorityGrantCount: priorityGrants.length,
      strategicGrantCount: strategicGrants.length,
      monitorGrantCount: monitorGrants.length,
      skipGrantCount: skipGrants.length,
      topGrantTitle: priorityGrants[0]?.title || strategicGrants[0]?.title || 'None',
      generatedAt: new Date().toISOString(),
    },
  };
}

// ── Context Builder ──

function buildGrantContext(
  grants: ScoredGrant[],
  pastAwardMap: Map<string, PastAwardData>,
  requirementsMap: Map<string, GrantRequirements>,
  maxGrants: number
): string {
  const sections: string[] = [];
  const today = new Date();

  for (const grant of grants.slice(0, maxGrants)) {
    const pa = pastAwardMap.get(grant.id);
    const req = requirementsMap.get(grant.id);
    const closeDate = grant.closeDate ? new Date(grant.closeDate) : null;
    const daysLeft = closeDate
      ? Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const effortEmoji = req?.effortLevel === 'light' ? '🟢' : req?.effortLevel === 'medium' ? '🟡' : '🔴';

    sections.push(`
### ${grant.matchTier.toUpperCase()}: ${grant.title}
- Grant Number: ${grant.number || 'N/A'}
- Agency: ${grant.agency}
- Status: ${grant.oppStatus}
- Deadline: ${grant.closeDate || 'unknown'}${daysLeft !== null ? ` (${daysLeft} days)` : ''}
- Award: ${grant.awardFloor ? `$${grant.awardFloor.toLocaleString()}` : '?'} – ${grant.awardCeiling ? `$${grant.awardCeiling.toLocaleString()}` : '?'}
- CFDA: ${grant.cfdaList?.join(', ') || 'N/A'}
- Fit Score: ${grant.scores.composite}/10 (Eligibility: ${grant.scores.eligibilityFit}, Alignment: ${grant.scores.strategicAlignment}, Award Size: ${grant.scores.awardSize}, Competition: ${grant.scores.competitionLevel}, Timeline: ${grant.scores.timelineFeasibility})
- Why It Fits: ${grant.whyItFits}
- Grants.gov: ${grant.pageUrl || `https://www.grants.gov/search-results-detail/${grant.id}`}
${pa ? `- Past Recipients: ${pa.pastRecipients.slice(0, 3).map(r => r.institution).join(', ') || 'none found'}
- Avg Award: ${pa.avgAwardAmount ? `$${pa.avgAwardAmount.toLocaleString()}` : 'unknown'}
- Success Rate: ${pa.successRate || 'unknown'}
- Competitive Insights: ${pa.competitiveInsights}` : '- Past Awards: No data available'}
${req ? `- Effort: ${effortEmoji} ${req.effortLevel.toUpperCase()} (${req.estimatedHours})
- Narrative Sections: ${req.narrativeSections.join(', ')}
- Data Needed: ${req.dataRequirements.join(', ')}
- Letters of Support: ${req.lettersOfSupport.join(', ')}
- Budget Notes: ${req.budgetRequirements}
- Match Requirements: ${req.matchRequirements}` : '- Requirements: Not analyzed'}
`);
  }

  return sections.join('\n---\n');
}
