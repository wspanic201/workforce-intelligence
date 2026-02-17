/**
 * Web Research Utility Layer
 * Provides programmatic web search and page content extraction
 * for discovery agents. Wraps SerpAPI + fetch with caching.
 */

import { withCache } from './cache';

// ── Types ──

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  position: number;
}

export interface WebSearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number | null;
}

export interface PageContent {
  url: string;
  title: string;
  text: string; // cleaned text content
  fetchedAt: string;
  truncated: boolean;
}

export interface JobSearchResult {
  query: string;
  location: string;
  totalEstimate: number | null;
  jobs: Array<{
    title: string;
    company: string;
    location: string;
    salary?: string;
    posted?: string;
    schedule?: string;
    description: string;
  }>;
}

// ── Web Search (SerpAPI Google Search) ──

export async function searchWeb(
  query: string,
  options: { num?: number; location?: string } = {}
): Promise<WebSearchResponse> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error('SERPAPI_KEY not set');

  const { num = 10, location } = options;

  return withCache('web_search', { query, num, location }, async () => {
    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      api_key: apiKey,
      num: String(num),
    });
    if (location) params.set('location', location);

    console.log(`[WebSearch] "${query}"${location ? ` (${location})` : ''}`);

    const response = await fetch(`https://serpapi.com/search.json?${params}`, {
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      console.warn(`[WebSearch] HTTP ${response.status} for query: ${query}`);
      return { query, results: [], totalResults: null };
    }

    const data = await response.json();
    const organic = data.organic_results || [];

    return {
      query,
      results: organic.map((r: any, i: number) => ({
        title: r.title || '',
        url: r.link || '',
        snippet: r.snippet || '',
        position: i + 1,
      })),
      totalResults: data.search_information?.total_results || null,
    };
  }, 24); // cache 24 hours
}

// ── Google Jobs Search (SerpAPI) ──

export async function searchJobs(
  query: string,
  location: string
): Promise<JobSearchResult> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error('SERPAPI_KEY not set');

  return withCache('job_search', { query, location }, async () => {
    const params = new URLSearchParams({
      engine: 'google_jobs',
      q: query,
      location,
      api_key: apiKey,
    });

    console.log(`[JobSearch] "${query}" in ${location}`);

    const response = await fetch(`https://serpapi.com/search.json?${params}`, {
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      console.warn(`[JobSearch] HTTP ${response.status}`);
      return { query, location, totalEstimate: null, jobs: [] };
    }

    const data = await response.json();
    const jobs = (data.jobs_results || []).map((j: any) => ({
      title: j.title || '',
      company: j.company_name || '',
      location: j.location || '',
      salary: j.detected_extensions?.salary || undefined,
      posted: j.detected_extensions?.posted_at || undefined,
      schedule: j.detected_extensions?.schedule_type || undefined,
      description: (j.description || '').slice(0, 500),
    }));

    return {
      query,
      location,
      totalEstimate: jobs.length > 0 ? jobs.length : null,
      jobs,
    };
  }, 24);
}

// ── Page Content Fetcher ──

export async function fetchPage(
  url: string,
  maxChars: number = 15000
): Promise<PageContent> {
  return withCache('page_fetch', { url }, async () => {
    console.log(`[FetchPage] ${url}`);

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return {
        url,
        title: '',
        text: `[Failed to fetch: HTTP ${response.status}]`,
        fetchedAt: new Date().toISOString(),
        truncated: false,
      };
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch?.[1]?.replace(/\s+/g, ' ').trim() || '';

    // Strip HTML to text
    let text = html
      // Remove script and style blocks
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      // Replace tags with spacing
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/tr>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      // Strip remaining tags
      .replace(/<[^>]+>/g, ' ')
      // Decode common entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Clean whitespace
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const truncated = text.length > maxChars;
    if (truncated) text = text.slice(0, maxChars) + '\n[...truncated]';

    return {
      url,
      title,
      text,
      fetchedAt: new Date().toISOString(),
      truncated,
    };
  }, 24);
}

// ── Batch Search Helper ──
// Runs multiple searches sequentially (avoids rate limits) and collects results

export async function batchSearch(
  queries: string[],
  options: { location?: string; delayMs?: number } = {}
): Promise<WebSearchResponse[]> {
  const { location, delayMs = 500 } = options;
  const results: WebSearchResponse[] = [];

  for (const query of queries) {
    try {
      const result = await searchWeb(query, { location });
      results.push(result);
    } catch (err) {
      console.warn(`[BatchSearch] Failed for "${query}": ${err}`);
      results.push({ query, results: [], totalResults: null });
    }

    // Rate limit buffer between searches
    if (delayMs > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  return results;
}

// ── Research Helper: Search + Fetch Top Results ──
// Searches, then fetches content from top N results for deeper analysis

export async function deepSearch(
  query: string,
  options: { location?: string; fetchTopN?: number; maxPageChars?: number } = {}
): Promise<{ search: WebSearchResponse; pages: PageContent[] }> {
  const { location, fetchTopN = 3, maxPageChars = 8000 } = options;

  const search = await searchWeb(query, { location });
  const pages: PageContent[] = [];

  // Fetch content from top results
  for (const result of search.results.slice(0, fetchTopN)) {
    try {
      const page = await fetchPage(result.url, maxPageChars);
      pages.push(page);
    } catch (err) {
      console.warn(`[DeepSearch] Failed to fetch ${result.url}: ${err}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  return { search, pages };
}
