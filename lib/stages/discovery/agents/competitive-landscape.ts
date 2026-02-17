/**
 * Phase 3: Competitive Landscape Scanner
 * 
 * 10-15 searches to map ALL educational/training providers within 50 miles.
 * Catalogs their programs, identifies white space, flags saturation.
 */

import { searchWeb, fetchPage, batchSearch } from '@/lib/apis/web-research';
import { callClaude } from '@/lib/ai/anthropic';
import type { RegionalIntelligenceOutput } from './regional-intelligence';
import type { DemandSignalOutput, DemandSignal } from './demand-signals';
import type { ServiceRegion } from '../orchestrator';

// ── Types ──

export interface CompetitorProvider {
  name: string;
  type: 'community_college' | 'career_center' | 'proprietary_school' | 'university_ce' | 'online_provider';
  distance: string;        // "15 miles", "same city"
  website: string | null;
  programs: string[];      // workforce/CTE programs they offer
  recentLaunches: string[];// new programs (signals they detected demand too)
  source: string;
}

export interface CompetitiveGap {
  occupation: string;
  socCode: string;
  gapCategory: 'white_space' | 'undersaturated' | 'competitive' | 'saturated';
  providerCount: number;
  providers: string[];     // names of providers offering related programs
  opportunity: string;     // why this matters
  demandSignalStrength: string;
}

export interface CompetitiveLandscapeOutput {
  region: string;
  providers: CompetitorProvider[];
  gaps: CompetitiveGap[];
  whiteSpaceCount: number;
  saturatedCount: number;
  searchesExecuted: number;
}

// ── Main Agent ──

export async function scanCompetitiveLandscape(
  regionalIntel: RegionalIntelligenceOutput,
  demandSignals: DemandSignalOutput,
  serviceRegion?: ServiceRegion
): Promise<CompetitiveLandscapeOutput> {
  const { institution } = regionalIntel;
  const allCities = serviceRegion 
    ? [serviceRegion.primaryCity, ...serviceRegion.additionalCities]
    : [institution.city];
  const region = serviceRegion?.metroArea || `${institution.city}, ${institution.state}`;

  console.log(`[Phase 3: Competitive Landscape] Starting for ${region}`);
  console.log(`[Phase 3] Covering cities: ${allCities.join(', ')}`);

  let searchCount = 0;
  const providers: CompetitorProvider[] = [];

  // ── Step 1: Find all educational providers across the full service region ──
  console.log('[Phase 3] Step 1: Mapping educational providers...');

  const providerQueries = [
    `community colleges near ${region}`,
    `career technical education centers ${institution.serviceArea} ${institution.state}`,
    // Search each city for trade schools/training programs
    ...allCities.map(city => `trade schools vocational training ${city} ${institution.state}`),
    `${region} workforce training programs certificate`,
  ].slice(0, 6); // Cap at 6 queries

  const providerResults = await batchSearch(providerQueries, { delayMs: 500 });
  searchCount += providerQueries.length;

  // Collect all unique institutions from search results
  const allResults = providerResults.flatMap(r => r.results);
  
  const providerExtract = await callClaude(
    `From these search results, identify ALL educational/training institutions within roughly 50 miles of ${institution.city}, ${institution.state} that could be competitors for workforce training programs.

EXCLUDE: ${institution.name} (that's us)

SEARCH RESULTS:
${allResults.map(r => `- ${r.title} (${r.url}): ${r.snippet}`).join('\n')}

For each institution, classify its type:
- community_college: 2-year public college
- career_center: Career/technical education center
- proprietary_school: For-profit trade/vocational school
- university_ce: University continuing education division
- online_provider: Major online training provider with local presence

Return ONLY valid JSON array:
[
  {
    "name": "Institution Name",
    "type": "community_college",
    "distance": "15 miles" or "same city",
    "website": "URL or null",
    "source": "where found"
  }
]

Be thorough — include every institution you can identify. Don't fabricate names.`,
    { maxTokens: 3000, temperature: 0.2 }
  );

  let rawProviders: Array<{ name: string; type: string; distance: string; website: string | null; source: string }> = [];
  try {
    rawProviders = JSON.parse(providerExtract.content.match(/\[[\s\S]*\]/)?.[0] || '[]');
  } catch {
    console.warn('[Phase 3] Failed to parse providers');
  }

  // ── Step 2: Research each provider's programs ──
  console.log(`[Phase 3] Step 2: Researching ${rawProviders.length} providers' programs...`);

  for (const provider of rawProviders.slice(0, 10)) {
    // Search for their program offerings
    const progSearch = await searchWeb(
      `"${provider.name}" programs certificates workforce training`,
      { num: 5 }
    );
    searchCount++;

    let programs: string[] = [];
    let recentLaunches: string[] = [];

    // Try to fetch their program page
    if (progSearch.results.length > 0) {
      try {
        const page = await fetchPage(progSearch.results[0].url, 8000);
        
        const programExtract = await callClaude(
          `Extract the workforce/CTE/certificate programs offered by ${provider.name} from this page content. Focus on non-credit workforce training, certificates, and career-technical programs.

PAGE CONTENT (from ${progSearch.results[0].url}):
${page.text.slice(0, 6000)}

Return ONLY valid JSON:
{
  "programs": ["Program 1", "Program 2", ...],
  "recentLaunches": ["Any new programs mentioned as recently launched or coming soon"]
}`,
          { maxTokens: 1500, temperature: 0.2 }
        );

        try {
          const parsed = JSON.parse(programExtract.content.match(/\{[\s\S]*\}/)?.[0] || '{}');
          programs = parsed.programs || [];
          recentLaunches = parsed.recentLaunches || [];
        } catch {}
      } catch {}
    }

    providers.push({
      name: provider.name,
      type: provider.type as CompetitorProvider['type'],
      distance: provider.distance,
      website: provider.website || progSearch.results[0]?.url || null,
      programs,
      recentLaunches,
      source: provider.source,
    });

    await new Promise(r => setTimeout(r, 400));
  }

  // ── Step 3: Map competitive gaps ──
  console.log('[Phase 3] Step 3: Analyzing competitive gaps...');

  // Get unique high-demand occupations from demand signals
  const demandOccupations = getUniqueOccupations(demandSignals.signals);

  const gapAnalysis = await callClaude(
    `You are analyzing the competitive landscape for workforce programs in ${region}.

DEMAND: These occupations have strong demand signals:
${demandOccupations.map(o => `- ${o.occupation} (SOC ${o.socCode}) — ${o.strength} demand`).join('\n')}

EXISTING PROVIDERS AND THEIR PROGRAMS:
${providers.map(p => `
${p.name} (${p.type}, ${p.distance}):
  Programs: ${p.programs.length > 0 ? p.programs.join(', ') : 'Unknown/not found'}
  Recent launches: ${p.recentLaunches.length > 0 ? p.recentLaunches.join(', ') : 'None found'}`).join('\n')}

OUR INSTITUTION (${institution.name}) CURRENT PROGRAMS:
${institution.currentPrograms.length > 0 ? institution.currentPrograms.join(', ') : 'To be determined'}

For each high-demand occupation, classify the competitive landscape:

- **white_space**: NO local provider offers a program targeting this occupation. This is gold.
- **undersaturated**: 1 provider offers something, but demand suggests room for more (or their program doesn't fully address the need).
- **competitive**: 2+ providers already serve this, but differentiation is possible.
- **saturated**: 3+ providers with established programs. Only recommend if extraordinary demand.

Return ONLY valid JSON array:
[
  {
    "occupation": "Occupation Name",
    "socCode": "XX-XXXX",
    "gapCategory": "white_space",
    "providerCount": 0,
    "providers": [],
    "opportunity": "Why this gap matters — 1-2 sentences",
    "demandSignalStrength": "strong"
  }
]

Be conservative with white_space — only classify as white_space if you genuinely found no competing programs. When in doubt, classify as undersaturated.`,
    { maxTokens: 4000, temperature: 0.3 }
  );

  let gaps: CompetitiveGap[] = [];
  try {
    gaps = JSON.parse(gapAnalysis.content.match(/\[[\s\S]*\]/)?.[0] || '[]');
  } catch {
    console.warn('[Phase 3] Failed to parse gap analysis');
  }

  const whiteSpaceCount = gaps.filter(g => g.gapCategory === 'white_space').length;
  const saturatedCount = gaps.filter(g => g.gapCategory === 'saturated').length;

  console.log(`[Phase 3: Competitive Landscape] Complete. ${providers.length} providers, ${gaps.length} gaps (${whiteSpaceCount} white space), ${searchCount} searches.`);

  return {
    region,
    providers,
    gaps,
    whiteSpaceCount,
    saturatedCount,
    searchesExecuted: searchCount,
  };
}

// ── Helpers ──

function getUniqueOccupations(signals: DemandSignal[]): Array<{ occupation: string; socCode: string; strength: string }> {
  const seen = new Set<string>();
  const result: Array<{ occupation: string; socCode: string; strength: string }> = [];

  for (const signal of signals) {
    if (signal.signalType === 'employer_expansion' || signal.signalType === 'grant_funding') continue;
    const key = signal.socCode || signal.occupation;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      occupation: signal.occupation,
      socCode: signal.socCode,
      strength: signal.strength,
    });
  }

  return result.slice(0, 20);
}
