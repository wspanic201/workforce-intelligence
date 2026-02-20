/**
 * Multi-source news fetching with automatic fallback chain
 * for The Signal newsletter.
 * 
 * Priority: Brave Search → NewsAPI → Google News RSS → Cached fallback
 */

export interface NewsItem {
  title: string;
  url: string;
  snippet: string;
  date?: string;
  source?: string;
}

export interface NewsSourceResult {
  source: 'brave' | 'newsapi' | 'google-rss' | 'cache';
  items: NewsItem[];
  error?: string;
}

// ── Brave Search ──────────────────────────────────────────────────────────

async function fetchFromBrave(): Promise<NewsSourceResult> {
  const apiKey = process.env.BRAVE_API_KEY || process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return { source: 'brave', items: [], error: 'No API key' };
  }

  const queries = [
    'workforce development community college training programs',
    'labor market trends jobs hiring skills shortage',
    'community college continuing education enrollment',
  ];

  const allResults: NewsItem[] = [];
  const seen = new Set<string>();
  let errors = 0;

  for (const query of queries) {
    try {
      const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&freshness=pw`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': apiKey,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        errors++;
        console.warn(`[Signal:Brave] HTTP ${response.status} for "${query}"`);
        continue;
      }

      const data = await response.json();
      const results = data.web?.results || [];

      for (const result of results) {
        if (seen.has(result.url)) continue;
        seen.add(result.url);
        allResults.push({
          title: result.title || '',
          url: result.url || '',
          snippet: result.description || '',
          date: result.age,
          source: 'Brave Search',
        });
      }
    } catch (err) {
      errors++;
      console.warn(`[Signal:Brave] Query failed: "${query}"`, err);
    }
  }

  if (allResults.length === 0 && errors === queries.length) {
    return { source: 'brave', items: [], error: 'All queries failed' };
  }

  console.log(`[Signal:Brave] ✓ Fetched ${allResults.length} items`);
  return { source: 'brave', items: allResults.slice(0, 10) };
}

// ── NewsAPI.org (fallback #1) ────────────────────────────────────────────

async function fetchFromNewsAPI(): Promise<NewsSourceResult> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    return { source: 'newsapi', items: [], error: 'No API key' };
  }

  try {
    const url = `https://newsapi.org/v2/everything?` +
      `q=workforce OR "community college" OR "job training" OR "skills gap"&` +
      `language=en&sortBy=publishedAt&pageSize=10&` +
      `apiKey=${apiKey}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { source: 'newsapi', items: [], error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const articles = data.articles || [];

    const items: NewsItem[] = articles.map((article: any) => ({
      title: article.title || '',
      url: article.url || '',
      snippet: article.description || '',
      date: article.publishedAt,
      source: article.source?.name || 'NewsAPI',
    }));

    console.log(`[Signal:NewsAPI] ✓ Fetched ${items.length} items`);
    return { source: 'newsapi', items };
  } catch (err) {
    console.warn('[Signal:NewsAPI] Fetch failed:', err);
    return { source: 'newsapi', items: [], error: String(err) };
  }
}

// ── Google News RSS (fallback #2) ────────────────────────────────────────

async function fetchFromGoogleNewsRSS(): Promise<NewsSourceResult> {
  try {
    const query = encodeURIComponent('workforce development OR community college OR job training');
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { source: 'google-rss', items: [], error: `HTTP ${response.status}` };
    }

    const xml = await response.text();
    
    // Simple XML parsing for RSS items
    const items: NewsItem[] = [];
    const itemRegex = /<item>(.*?)<\/item>/gs;
    const matches = xml.matchAll(itemRegex);

    for (const match of matches) {
      const itemXML = match[1];
      const title = itemXML.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || '';
      const link = itemXML.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const description = itemXML.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || '';
      const pubDate = itemXML.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';

      if (title && link) {
        items.push({
          title,
          url: link,
          snippet: description.replace(/<[^>]*>/g, '').substring(0, 200),
          date: pubDate,
          source: 'Google News',
        });
      }
    }

    console.log(`[Signal:GoogleRSS] ✓ Fetched ${items.length} items`);
    return { source: 'google-rss', items: items.slice(0, 10) };
  } catch (err) {
    console.warn('[Signal:GoogleRSS] Fetch failed:', err);
    return { source: 'google-rss', items: [], error: String(err) };
  }
}

// ── Cached fallback (last resort) ────────────────────────────────────────

let lastSuccessfulFetch: NewsItem[] = [];
let lastFetchTimestamp = 0;

function getCachedNews(): NewsSourceResult {
  if (lastSuccessfulFetch.length === 0) {
    return { source: 'cache', items: [], error: 'No cache available' };
  }

  const ageHours = (Date.now() - lastFetchTimestamp) / (1000 * 60 * 60);
  console.log(`[Signal:Cache] Using cache from ${ageHours.toFixed(1)}h ago (${lastSuccessfulFetch.length} items)`);

  return { source: 'cache', items: lastSuccessfulFetch };
}

function updateCache(items: NewsItem[]) {
  if (items.length > 0) {
    lastSuccessfulFetch = items;
    lastFetchTimestamp = Date.now();
  }
}

// ── Main fetch with fallback chain ───────────────────────────────────────

export async function fetchNewsWithFallback(): Promise<NewsSourceResult> {
  console.log('[Signal] Starting news fetch with fallback chain...');

  // Try Brave first
  const braveResult = await fetchFromBrave();
  if (braveResult.items.length >= 5) {
    updateCache(braveResult.items);
    return braveResult;
  }

  console.log('[Signal] Brave insufficient, trying NewsAPI...');
  
  // Try NewsAPI
  const newsApiResult = await fetchFromNewsAPI();
  if (newsApiResult.items.length >= 5) {
    updateCache(newsApiResult.items);
    return newsApiResult;
  }

  console.log('[Signal] NewsAPI insufficient, trying Google News RSS...');

  // Try Google News RSS
  const googleResult = await fetchFromGoogleNewsRSS();
  if (googleResult.items.length >= 5) {
    updateCache(googleResult.items);
    return googleResult;
  }

  console.log('[Signal] All sources failed, falling back to cache...');

  // Last resort: use cache
  return getCachedNews();
}

// ── Health check ─────────────────────────────────────────────────────────

export async function checkNewsSourcesHealth(): Promise<{
  brave: boolean;
  newsapi: boolean;
  googleRss: boolean;
  cache: boolean;
}> {
  const [brave, newsapi, google] = await Promise.all([
    fetchFromBrave().then(r => r.items.length > 0),
    fetchFromNewsAPI().then(r => r.items.length > 0),
    fetchFromGoogleNewsRSS().then(r => r.items.length > 0),
  ]);

  return {
    brave,
    newsapi,
    googleRss: google,
    cache: lastSuccessfulFetch.length > 0,
  };
}
