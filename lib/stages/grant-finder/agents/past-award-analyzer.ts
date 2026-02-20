/**
 * Past Award Analyzer — Agent 2
 *
 * For each grant opportunity, searches the web for past award information:
 * prior recipients, award amounts, funded projects, and success rates.
 * Uses Claude to extract structured intelligence from raw search results.
 *
 * This gives the college's grant writers competitive context:
 * "Who wins these grants? What do they propose? What are we up against?"
 */

import { callClaude } from '@/lib/ai/anthropic';
import { searchWeb } from '@/lib/apis/web-research';
import type { GrantDetails } from '@/lib/apis/grants-gov';

// ── Types ──

export interface PastAwardData {
  grantId: string;
  grantTitle: string;
  grantNumber: string;
  pastRecipients: PastRecipient[];
  avgAwardAmount: number | null;
  successRate: string | null;
  competitiveInsights: string;
  rawSearchResults: string;
}

export interface PastRecipient {
  institution: string;
  year: string;
  amount: string;
  description: string;
  verified: boolean; // true if found in a verifiable source URL, false if inferred
}

export interface PastAwardOutput {
  awards: PastAwardData[];
  searchesUsed: number;
}

// ── Main Agent ──

export async function analyzePastAwards(grants: GrantDetails[]): Promise<PastAwardOutput> {
  console.log(`\n[Past Award Analyzer] Analyzing ${grants.length} grants for past award data`);
  const startTime = Date.now();
  let searchesUsed = 0;

  const awards: PastAwardData[] = [];

  // Process grants in parallel batches of 5
  const CONCURRENCY = 5;
  for (let i = 0; i < grants.length; i += CONCURRENCY) {
    const batch = grants.slice(i, i + CONCURRENCY);
    console.log(`[Past Award Analyzer] Batch ${Math.floor(i / CONCURRENCY) + 1}/${Math.ceil(grants.length / CONCURRENCY)} (${batch.length} grants)...`);

    const results = await Promise.allSettled(
      batch.map(async (grant) => {
        console.log(`[Past Award Analyzer] Researching: ${grant.title?.slice(0, 50) || grant.id}`);
        return analyzeOneGrant(grant);
      })
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const grant = batch[j];
      if (result.status === 'fulfilled') {
        searchesUsed += result.value._searchesUsed || 0;
        awards.push(result.value);
      } else {
        console.warn(`[Past Award Analyzer] Failed for grant ${grant.id}: ${result.reason?.message || result.reason}`);
        awards.push({
          grantId: grant.id,
          grantTitle: grant.title,
          grantNumber: grant.number,
          pastRecipients: [],
          avgAwardAmount: grant.awardCeiling || null,
          successRate: null,
          competitiveInsights: 'No past award data found — new program or limited public records.',
          rawSearchResults: '',
        });
      }
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Past Award Analyzer] Complete in ${elapsed}s — analyzed ${awards.length} grants`);

  return { awards, searchesUsed };
}

// ── Single Grant Analysis ──

async function analyzeOneGrant(
  grant: GrantDetails
): Promise<PastAwardData & { _searchesUsed: number }> {
  const title = grant.title || `Grant ${grant.id}`;
  const number = grant.number || grant.id;
  const agency = grant.agency || grant.agencyCode || '';
  const currentYear = new Date().getFullYear();
  let searchesUsed = 0;

  // Build search queries for past recipients
  const queries = [
    `"${title}" past recipients community college award`,
    `"${number}" award winners recipients`,
    `${agency} "${title}" awards ${currentYear - 1}`,
  ];

  // Collect search snippets
  const snippets: string[] = [];
  for (const query of queries) {
    try {
      const results = await searchWeb(query, { num: 5 });
      searchesUsed++;
      for (const r of results.results) {
        snippets.push(`[${r.title}]\n${r.snippet}\nURL: ${r.url}`);
      }
    } catch (err) {
      console.warn(`[Past Award Analyzer] Search failed: "${query}" — ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const rawSearchResults = snippets.slice(0, 15).join('\n\n---\n\n');

  if (!rawSearchResults.trim()) {
    return {
      grantId: grant.id,
      grantTitle: title,
      grantNumber: number,
      pastRecipients: [],
      avgAwardAmount: grant.awardCeiling || null,
      successRate: null,
      competitiveInsights: 'No past award data found in web search.',
      rawSearchResults: '',
      _searchesUsed: searchesUsed,
    };
  }

  // Use Claude to extract structured intelligence
  const prompt = `You are a grant research analyst. Below is web search data about past recipients of the grant "${title}" (${number}) from ${agency}.

SEARCH RESULTS:
${rawSearchResults}

Extract past award intelligence. Return a JSON object with this exact structure:
{
  "pastRecipients": [
    {
      "institution": "Name of recipient institution",
      "year": "Award year (e.g. 2024)",
      "amount": "Award amount as string (e.g. '$250,000')",
      "description": "Brief description of what was funded",
      "verified": true
    }
  ],
  "avgAwardAmount": 250000,
  "successRate": "Estimated success rate if mentioned (e.g. '15%' or null)",
  "competitiveInsights": "2-3 sentences about who wins these grants, what makes a winning proposal, and how competitive this is for a community college"
}

Rules:
- Only include recipients explicitly mentioned in the search results
- If no recipients found, return empty array
- avgAwardAmount should be a number (no currency symbols), or null if unknown
- Do not fabricate data — if uncertain, omit it
- Set "verified": true ONLY if the recipient is explicitly named in a search result with a .gov or .edu URL. Otherwise set false.
- competitiveInsights should be actionable for a grant writer

Return only valid JSON.`;

  let extracted: Partial<PastAwardData> = {};
  try {
    const response = await callClaude(prompt, { temperature: 0.2, maxTokens: 2000 });
    const jsonStr = response.content.match(/\{[\s\S]*\}/)?.[0];
    if (jsonStr) {
      extracted = JSON.parse(jsonStr);
    }
  } catch (err) {
    console.warn(`[Past Award Analyzer] Claude extraction failed for ${grant.id}: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    grantId: grant.id,
    grantTitle: title,
    grantNumber: number,
    pastRecipients: extracted.pastRecipients || [],
    avgAwardAmount: extracted.avgAwardAmount ?? grant.awardCeiling ?? null,
    successRate: extracted.successRate || null,
    competitiveInsights: extracted.competitiveInsights || 'Limited competitive data available.',
    rawSearchResults: rawSearchResults.slice(0, 2000), // Keep first 2000 chars for downstream use
    _searchesUsed: searchesUsed,
  };
}
