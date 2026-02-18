/**
 * Grants.gov API Client
 *
 * Searches grant opportunities via the Grants.gov search2 API (POST, no auth needed).
 * Fetches full grant details by scraping the grants.gov detail page (the fetchOpportunity
 * API endpoint is broken and returns backend errors, so we scrape instead).
 *
 * Rate limit: 1 request/sec (polite default).
 *
 * Eligibility codes:
 *   06 = Public/State Institutions of Higher Education
 *   99 = Unrestricted
 *   25 = Others (including non-profits, community orgs)
 *
 * Funding categories:
 *   ED = Education
 *   ELT = Employment, Labor and Training
 *   ST = Science and Technology R&D
 *   HL = Health
 *   CD = Community Development
 */

// ── Types ──

export interface GrantSearchParams {
  keyword?: string;
  oppStatuses?: string[];       // e.g. ['posted', 'forecasted']
  eligibilities?: string[];     // e.g. ['06', '99', '25']
  fundingCategories?: string[]; // e.g. ['ED', 'ELT']
  agencies?: string[];          // e.g. ['DOL', 'ED']
  rows?: number;
  startRecordNum?: number;
}

export interface GrantSummary {
  id: string;
  number: string;
  title: string;
  agencyCode: string;
  agency: string;
  openDate: string;
  closeDate: string;
  oppStatus: string;
  cfdaList: string[];
  awardFloor?: number;
  awardCeiling?: number;
  expectedAwards?: number;
  description?: string;
}

export interface GrantDetails extends GrantSummary {
  synopsis?: string;
  eligibilityDetails?: string;
  costSharing?: boolean;
  matchingFunds?: string;
  applicationDeadlines?: string[];
  contactInfo?: string;
  relatedDocuments?: string[];
  pageUrl: string;
  fetchedAt: string;
}

export interface GrantSearchResponse {
  grants: GrantSummary[];
  totalResults: number;
  startRecord: number;
  keyword?: string;
}

// ── Rate Limiter ──

let lastRequestTime = 0;
const RATE_LIMIT_MS = 1000; // 1 request per second

async function rateLimitedWait(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

// ── Core Search ──

const SEARCH_URL = 'https://api.grants.gov/v1/api/search2';

export async function searchGrants(params: GrantSearchParams): Promise<GrantSearchResponse> {
  await rateLimitedWait();

  const body: Record<string, any> = {
    rows: params.rows || 25,
    startRecordNum: params.startRecordNum || 0,
  };

  if (params.keyword) body.keyword = params.keyword;
  // Grants.gov API requires pipe-separated strings for multi-value filters (not arrays)
  if (params.oppStatuses?.length) body.oppStatuses = params.oppStatuses.join('|');
  if (params.eligibilities?.length) body.eligibilities = params.eligibilities.join('|');
  if (params.fundingCategories?.length) body.fundingCategories = params.fundingCategories.join('|');
  if (params.agencies?.length) body.agencies = params.agencies.join('|');

  console.log(`[Grants.gov] Searching: "${params.keyword || '(no keyword)'}" | statuses=${params.oppStatuses?.join(',')} | eligibilities=${params.eligibilities?.join(',')}`);

  let response: Response;
  try {
    response = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`Grants.gov API network error: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Grants.gov API error ${response.status}: ${text.slice(0, 200)}`);
  }

  let json: any;
  try {
    json = await response.json();
  } catch (err) {
    throw new Error(`Grants.gov API returned non-JSON response`);
  }

  // Normalize the response — grants.gov search2 returns { data: { oppHits: [...], hitCount: N } }
  const hits: any[] = json?.data?.oppHits || json?.hits || json?.opportunities || json?.results || [];
  const total: number = json?.data?.hitCount ?? json?.data?.totalOppHits ?? json?.total ?? hits.length;

  const grants: GrantSummary[] = hits.map((hit: any) => ({
    id: String(hit.id || hit.oppId || hit.opportunityId || ''),
    number: hit.number || hit.oppNum || hit.opportunityNumber || '',
    title: hit.title || hit.oppTitle || '',
    agencyCode: hit.agencyCode || hit.agency?.code || '',
    agency: hit.agencyName || hit.agency?.name || hit.agency || '',
    openDate: hit.openDate || hit.postDate || '',
    closeDate: hit.closeDate || hit.dueDate || '',
    oppStatus: (hit.oppStatus || hit.status || 'unknown').toLowerCase(),
    cfdaList: Array.isArray(hit.cfdaList) ? hit.cfdaList : 
              hit.cfda ? [hit.cfda] : [],
    awardFloor: hit.awardFloor !== undefined ? Number(hit.awardFloor) : undefined,
    awardCeiling: hit.awardCeiling !== undefined ? Number(hit.awardCeiling) : undefined,
    expectedAwards: hit.expectedNumberOfAwards !== undefined ? Number(hit.expectedNumberOfAwards) : undefined,
    description: hit.synopsis || hit.description || '',
  }));

  console.log(`[Grants.gov] Found ${grants.length} grants (total: ${total})`);
  return { grants, totalResults: total, startRecord: params.startRecordNum || 0, keyword: params.keyword };
}

// ── Multi-Keyword Search with Deduplication ──

export async function searchMultipleKeywords(
  keywordList: string[],
  baseParams: Omit<GrantSearchParams, 'keyword'> = {}
): Promise<GrantSummary[]> {
  const seen = new Set<string>();
  const allGrants: GrantSummary[] = [];

  for (const keyword of keywordList) {
    try {
      const result = await searchGrants({ ...baseParams, keyword, rows: 25 });
      for (const grant of result.grants) {
        if (grant.id && !seen.has(grant.id)) {
          seen.add(grant.id);
          allGrants.push(grant);
        }
      }
    } catch (err) {
      console.warn(`[Grants.gov] Search failed for "${keyword}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`[Grants.gov] Multi-keyword search complete: ${allGrants.length} unique grants from ${keywordList.length} keywords`);
  return allGrants;
}

// ── Fetch Grant Details (scraping — API is broken) ──

export async function fetchGrantDetails(grantId: string): Promise<GrantDetails | null> {
  await rateLimitedWait();

  const pageUrl = `https://www.grants.gov/search-results-detail/${grantId}`;
  console.log(`[Grants.gov] Fetching detail page: ${pageUrl}`);

  let pageText = '';
  try {
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WorkforceOS/1.0; research)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!response.ok) {
      console.warn(`[Grants.gov] Detail page ${grantId} returned ${response.status}`);
      return null;
    }
    pageText = await response.text();
  } catch (err) {
    console.warn(`[Grants.gov] Failed to fetch detail page for ${grantId}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }

  // Strip HTML tags and extract readable text
  const text = stripHtml(pageText);

  // Extract key fields from the page text
  const details: GrantDetails = {
    id: grantId,
    number: extractField(text, /Opportunity Number[:\s]+([A-Z0-9\-\.]+)/i) || '',
    title: extractField(text, /Opportunity Title[:\s]+([^\n]+)/i) || '',
    agencyCode: extractField(text, /Agency Code[:\s]+([A-Z0-9\-]+)/i) || '',
    agency: extractField(text, /Agency[:\s]+([^\n]+)/i) || '',
    openDate: extractField(text, /Posted Date[:\s]+([\d\/\-]+)/i) || '',
    closeDate: extractField(text, /(?:Close|Application Due)[^\n]*?[:\s]+([\d\/\-]+)/i) || '',
    oppStatus: extractField(text, /Opportunity Status[:\s]+([^\n]+)/i)?.toLowerCase() || 'unknown',
    cfdaList: extractCfdaNumbers(text),
    synopsis: extractSection(text, 'Description', 3000),
    eligibilityDetails: extractSection(text, 'Eligib', 2000),
    costSharing: /cost.?shar/i.test(text) && /yes/i.test(extractField(text, /Cost Sharing[:\s]+([^\n]+)/i) || ''),
    matchingFunds: extractField(text, /matching[^\n]*/i) || '',
    contactInfo: extractSection(text, 'Contact', 500),
    pageUrl,
    fetchedAt: new Date().toISOString(),
  };

  return details;
}

// ── Helpers ──

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractField(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match ? match[1]?.trim() || null : null;
}

function extractSection(text: string, sectionName: string, maxLength = 1000): string {
  const pattern = new RegExp(`${sectionName}[^\\n]*\\n([\\s\\S]{10,${maxLength}})`, 'i');
  const match = text.match(pattern);
  return match ? match[1].trim().slice(0, maxLength) : '';
}

function extractCfdaNumbers(text: string): string[] {
  const matches = text.match(/\d{2}\.\d{3}/g);
  return matches ? [...new Set(matches)] : [];
}
