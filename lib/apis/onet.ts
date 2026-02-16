export interface ONETOccupation {
  code: string;
  title: string;
  description: string;
}

export interface ONETSkill {
  element_name: string;
  scale_value: number;
  description?: string;
}

export interface ONETKnowledge {
  element_name: string;
  scale_value: number;
  description?: string;
}

export interface ONETTechnology {
  example: string;
  hot_technology?: boolean;
}

export interface ONETCompetencies {
  code: string;
  title: string;
  description: string;
  skills: ONETSkill[];
  knowledge: ONETKnowledge[];
  technology: ONETTechnology[];
  education: string;
}

// O*NET Web Services v2 base URL
const ONET_BASE_URL = 'https://api-v2.onetcenter.org';

// Common headers for O*NET v2 API
function getONETHeaders(): Record<string, string> {
  const apiKey = process.env.ONET_API_KEY || process.env.ONET_API_PASSWORD || '';
  return {
    'X-API-Key': apiKey,
    'User-Agent': 'nodejs-OnetWebService/2.10 (bot)',
    'Accept': 'application/json',
  };
}

// Delay helper
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch with exponential backoff retry for rate limiting
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.ok) return response;

    // Rate limited (429) or temporary server error — retry with backoff
    if ((response.status === 429 || response.status === 503) && attempt < maxRetries) {
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.warn(`[O*NET] Rate limited (${response.status}), retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
      await delay(backoffMs);
      continue;
    }

    // 401/403 could be transient — retry once
    if ((response.status === 401 || response.status === 403) && attempt < maxRetries) {
      const backoffMs = Math.pow(2, attempt) * 1500;
      console.warn(`[O*NET] Got ${response.status} (possible rate limit), retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
      await delay(backoffMs);
      continue;
    }

    // Non-retryable error
    return response;
  }

  throw new Error(`[O*NET] Max retries exceeded for ${url}`);
}

export async function searchONET(keyword: string): Promise<string | null> {
  const headers = getONETHeaders();

  const response = await fetchWithRetry(
    `${ONET_BASE_URL}/online/search?keyword=${encodeURIComponent(keyword)}&end=5`,
    {
      headers,
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!response.ok) {
    console.warn(`[O*NET] Search API returned ${response.status} ${response.statusText} after retries — continuing without O*NET`);
    return null;
  }

  const data = await response.json();
  return data.occupation?.[0]?.code || null;
}

export async function getONETCompetencies(onetCode: string): Promise<ONETCompetencies> {
  const headers = getONETHeaders();
  const basePath = `online/occupations/${onetCode}`;

  // Serialize requests with delays to avoid rate limiting
  const endpoints = [
    { path: basePath, key: 'occupation' },
    { path: `${basePath}/summary/skills`, key: 'skills' },
    { path: `${basePath}/summary/knowledge`, key: 'knowledge' },
    { path: `${basePath}/summary/technology_skills`, key: 'technology' },
  ];

  const results: Record<string, any> = {};

  for (const endpoint of endpoints) {
    const response = await fetchWithRetry(
      `${ONET_BASE_URL}/${endpoint.path}`,
      {
        headers,
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!response.ok) {
      console.warn(`[O*NET] ${endpoint.key} API returned ${response.status} — using empty data`);
      results[endpoint.key] = null;
    } else {
      results[endpoint.key] = await response.json();
    }

    // Small delay between sequential requests to avoid rate limiting
    await delay(500);
  }

  const occupation = results.occupation;
  if (!occupation) {
    console.warn(`[O*NET] Could not fetch occupation data for ${onetCode} — returning minimal data`);
    return {
      code: onetCode,
      title: 'Unknown',
      description: 'O*NET data unavailable due to API issues',
      skills: [],
      knowledge: [],
      technology: [],
      education: 'Not specified',
    };
  }

  return {
    code: onetCode,
    title: occupation.title,
    description: occupation.description,
    skills: results.skills?.skill || [],
    knowledge: results.knowledge?.knowledge || [],
    technology: results.technology?.technology || [],
    education: occupation.education?.description || 'Not specified',
  };
}
