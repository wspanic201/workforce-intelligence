/**
 * Grant Scanner — Agent 1
 *
 * Searches Grants.gov and the open web for grant opportunities relevant
 * to a specific community college. Uses multiple keyword strategies to
 * ensure broad coverage, then deduplicates and filters by eligibility.
 *
 * Outputs a raw array of GrantSummary objects ready for downstream analysis.
 */

import { searchMultipleKeywords, fetchGrantDetails, type GrantSummary, type GrantDetails } from '@/lib/apis/grants-gov';
import { searchWeb } from '@/lib/apis/web-research';

// ── Types ──

export interface GrantScanInput {
  collegeName: string;
  state: string;
  city?: string;
  programFocusAreas?: string[]; // e.g. ['manufacturing', 'healthcare', 'IT']
}

export interface GrantScanOutput {
  grants: GrantDetails[];
  webLeads: WebGrantLead[];
  searchesUsed: number;
  totalFound: number;
}

export interface WebGrantLead {
  title: string;
  url: string;
  snippet: string;
  source: 'web';
}

// ── Eligibility Filter ──
// Keep grants open to: 06 = Public Higher Ed, 99 = Unrestricted, 25 = Others
const ELIGIBLE_STATUSES = new Set(['posted', 'forecasted']);

// ── Main Agent ──

export async function scanGrants(input: GrantScanInput): Promise<GrantScanOutput> {
  console.log(`\n[Grant Scanner] Starting scan for: ${input.collegeName} (${input.state})`);
  const startTime = Date.now();
  let searchesUsed = 0;

  const { collegeName, state, programFocusAreas = [] } = input;

  // ── 1. Build keyword list for Grants.gov ──
  const grantsGovKeywords: string[] = [
    `community college workforce ${state}`,
    'workforce development training',
    'career technical education',
    'adult education workforce',
    'Perkins',
    'apprenticeship',
    'STEM education',
  ];

  // Add focus-area-specific keywords
  for (const area of programFocusAreas) {
    grantsGovKeywords.push(`${area} grant`);
    grantsGovKeywords.push(`${area} workforce training`);
  }

  console.log(`[Grant Scanner] Searching Grants.gov with ${grantsGovKeywords.length} keywords...`);

  // ── 2. Search Grants.gov ──
  const rawGrants: GrantSummary[] = await searchMultipleKeywords(grantsGovKeywords, {
    oppStatuses: ['posted', 'forecasted'],
    eligibilities: ['06', '99', '25'],
    fundingCategories: ['ED', 'ELT', 'ST', 'HL', 'CD'],
    rows: 25,
  });
  searchesUsed += grantsGovKeywords.length;

  console.log(`[Grant Scanner] Grants.gov returned ${rawGrants.length} unique grants`);

  // ── 3. Filter to eligible statuses ──
  const eligibleGrants = rawGrants.filter(g => {
    const status = (g.oppStatus || '').toLowerCase();
    return ELIGIBLE_STATUSES.has(status) || status.includes('post') || status.includes('forecast');
  });

  console.log(`[Grant Scanner] ${eligibleGrants.length} grants pass eligibility filter`);

  // ── 4. Fetch details for top grants (up to 30) ──
  const topGrants = eligibleGrants.slice(0, 30);
  const detailedGrants: GrantDetails[] = [];

  console.log(`[Grant Scanner] Fetching details for ${topGrants.length} grants...`);
  for (const grant of topGrants) {
    if (!grant.id) continue;
    try {
      const details = await fetchGrantDetails(grant.id);
      if (details) {
        // Merge summary fields in case detail page didn't parse them
        detailedGrants.push({
          ...grant,
          ...details,
          // Preserve summary data if detail scrape missed it
          title: details.title || grant.title,
          agency: details.agency || grant.agency,
          agencyCode: details.agencyCode || grant.agencyCode,
          closeDate: details.closeDate || grant.closeDate,
          openDate: details.openDate || grant.openDate,
          oppStatus: details.oppStatus || grant.oppStatus,
          cfdaList: details.cfdaList?.length ? details.cfdaList : grant.cfdaList,
          awardFloor: grant.awardFloor ?? details.awardFloor,
          awardCeiling: grant.awardCeiling ?? details.awardCeiling,
        });
      } else {
        // Fall back to summary data without full details
        detailedGrants.push({
          ...grant,
          pageUrl: `https://www.grants.gov/search-results-detail/${grant.id}`,
          fetchedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn(`[Grant Scanner] Failed to fetch details for grant ${grant.id}: ${err instanceof Error ? err.message : String(err)}`);
      detailedGrants.push({
        ...grant,
        pageUrl: `https://www.grants.gov/search-results-detail/${grant.id}`,
        fetchedAt: new Date().toISOString(),
      });
    }
    searchesUsed++;
  }

  // ── 5. Web searches for foundation/state/NSF grants ──
  const webSearchQueries: string[] = [
    `${state} workforce development grants 2026 community college`,
    `${state} community college grants funding 2026`,
    'NSF ATE advanced technological education grant',
  ];

  for (const area of programFocusAreas) {
    webSearchQueries.push(`${area} workforce training foundation grant 2026`);
  }

  const webLeads: WebGrantLead[] = [];

  console.log(`[Grant Scanner] Running ${webSearchQueries.length} web searches...`);
  for (const query of webSearchQueries) {
    try {
      const results = await searchWeb(query, { num: 5 });
      searchesUsed++;
      for (const r of results.results) {
        // Skip grants.gov itself — we already covered it
        if (!r.url.includes('grants.gov')) {
          webLeads.push({
            title: r.title,
            url: r.url,
            snippet: r.snippet,
            source: 'web',
          });
        }
      }
    } catch (err) {
      console.warn(`[Grant Scanner] Web search failed for "${query}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Deduplicate web leads by URL
  const seenUrls = new Set<string>();
  const uniqueWebLeads = webLeads.filter(lead => {
    if (seenUrls.has(lead.url)) return false;
    seenUrls.add(lead.url);
    return true;
  });

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Grant Scanner] Complete in ${elapsed}s — ${detailedGrants.length} grants + ${uniqueWebLeads.length} web leads`);

  return {
    grants: detailedGrants,
    webLeads: uniqueWebLeads,
    searchesUsed,
    totalFound: detailedGrants.length + uniqueWebLeads.length,
  };
}
