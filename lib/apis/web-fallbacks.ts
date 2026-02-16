/**
 * Web scraping fallbacks for when primary APIs (SerpAPI, O*NET API) fail.
 * These provide degraded but functional data from public web sources.
 */

// ── BLS Fallback ──

export interface BLSFallbackData {
  employment_total: number | null;
  median_wage: number | null;
  mean_wage: number | null;
  wage_percentiles: {
    p10: number | null;
    p25: number | null;
    p75: number | null;
    p90: number | null;
  };
  source_url: string;
}

/**
 * Fetch employment and wage data from BLS OES pages (free, no auth needed).
 * @param socCode e.g. "29-2052"
 */
export async function fetchBLSData(socCode: string): Promise<BLSFallbackData | null> {
  try {
    const cleanCode = socCode.replace(/[-.]/g, '');
    const url = `https://www.bls.gov/oes/current/oes${cleanCode}.htm`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    });

    if (!response.ok) {
      console.warn(`[BLS Fallback] HTTP ${response.status} for ${url}`);
      return null;
    }

    const html = await response.text();

    // Parse wage data from BLS structured HTML
    const extractNumber = (pattern: RegExp): number | null => {
      const match = html.match(pattern);
      if (!match) return null;
      return parseFloat(match[1].replace(/,/g, ''));
    };

    // BLS pages have wage data in a consistent format
    const employment_total = extractNumber(/Employment\s*(?:<[^>]+>)*\s*\(1\)\s*(?:<[^>]+>)*\s*([\d,]+)/i)
      || extractNumber(/Employment[^<]*<[^>]+>([\d,]+)/i);
    const median_wage = extractNumber(/Median\s*(?:hourly|annual)\s*wage[^<]*<[^>]+>\$([\d,.]+)/i)
      || extractNumber(/50%\s*\(Median\)[^$]*\$([\d,.]+)/i);
    const mean_wage = extractNumber(/Mean\s*(?:hourly|annual)\s*wage[^<]*<[^>]+>\$([\d,.]+)/i)
      || extractNumber(/Mean\s*annual\s*wage[^$]*\$([\d,.]+)/i);

    const p10 = extractNumber(/10%[^$]*\$([\d,.]+)/i);
    const p25 = extractNumber(/25%[^$]*\$([\d,.]+)/i);
    const p75 = extractNumber(/75%[^$]*\$([\d,.]+)/i);
    const p90 = extractNumber(/90%[^$]*\$([\d,.]+)/i);

    return {
      employment_total,
      median_wage,
      mean_wage,
      wage_percentiles: { p10, p25, p75, p90 },
      source_url: url,
    };
  } catch (err) {
    console.warn('[BLS Fallback] Error:', err instanceof Error ? err.message : err);
    return null;
  }
}

// ── O*NET Online Fallback ──

export interface ONETFallbackData {
  title: string;
  description: string;
  tasks: string[];
  skills: string[];
  knowledge: string[];
  source_url: string;
}

/**
 * Scrape O*NET Online summary page as fallback when the API is down.
 * @param onetCode e.g. "29-2052.00"
 */
export async function fetchONETOnline(onetCode: string): Promise<ONETFallbackData | null> {
  try {
    const url = `https://www.onetonline.org/link/summary/${onetCode}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    });

    if (!response.ok) {
      console.warn(`[O*NET Fallback] HTTP ${response.status} for ${url}`);
      return null;
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const title = titleMatch?.[1]?.trim() || onetCode;

    // Extract description
    const descMatch = html.match(/(?:Summary|Description)[^<]*<[^>]+>([^<]{20,500})/i);
    const description = descMatch?.[1]?.trim() || '';

    // Extract list items from sections
    const extractSection = (sectionName: string): string[] => {
      const sectionRegex = new RegExp(`${sectionName}[\\s\\S]*?<ul[^>]*>([\\s\\S]*?)<\\/ul>`, 'i');
      const sectionMatch = html.match(sectionRegex);
      if (!sectionMatch) return [];
      const items = sectionMatch[1].match(/<li[^>]*>([^<]+)/g) || [];
      return items.map(item => item.replace(/<li[^>]*>/, '').trim()).filter(Boolean).slice(0, 10);
    };

    return {
      title,
      description,
      tasks: extractSection('Tasks'),
      skills: extractSection('Skills'),
      knowledge: extractSection('Knowledge'),
      source_url: url,
    };
  } catch (err) {
    console.warn('[O*NET Fallback] Error:', err instanceof Error ? err.message : err);
    return null;
  }
}

// ── Brave Search Fallback (for job counts) ──

export interface BraveJobSearchResult {
  estimated_job_count: number | null;
  snippets: string[];
  urls: string[];
  source: string;
}

/**
 * Use Brave Search API to estimate job availability when SerpAPI fails.
 * Requires BRAVE_SEARCH_API_KEY env var.
 */
export async function searchJobsBrave(
  occupation: string,
  location: string
): Promise<BraveJobSearchResult | null> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    console.warn('[Brave Fallback] No BRAVE_SEARCH_API_KEY set');
    return null;
  }

  try {
    const query = `${occupation} jobs ${location}`;
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`[Brave Fallback] HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    const results = data.web?.results || [];

    // Try to extract job count estimates from snippets
    let estimatedCount: number | null = null;
    const snippets: string[] = [];
    const urls: string[] = [];

    for (const result of results) {
      const snippet = result.description || '';
      snippets.push(snippet);
      urls.push(result.url || '');

      // Look for patterns like "1,234 jobs", "Over 500 positions"
      if (!estimatedCount) {
        const countMatch = snippet.match(/([\d,]+)\s*(?:jobs?|positions?|openings?|results?)/i);
        if (countMatch) {
          estimatedCount = parseInt(countMatch[1].replace(/,/g, ''));
        }
      }
    }

    return {
      estimated_job_count: estimatedCount,
      snippets: snippets.slice(0, 5),
      urls: urls.slice(0, 5),
      source: 'Brave Search',
    };
  } catch (err) {
    console.warn('[Brave Fallback] Error:', err instanceof Error ? err.message : err);
    return null;
  }
}
