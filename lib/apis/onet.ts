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
      const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      console.warn(`[O*NET] Rate limited (${response.status}), retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
      await delay(backoffMs);
      continue;
    }

    // 401 could also be transient rate limiting on O*NET — retry once
    if (response.status === 401 && attempt < maxRetries) {
      const backoffMs = Math.pow(2, attempt) * 1500; // 1.5s, 3s, 6s
      console.warn(`[O*NET] Got 401 (possible rate limit), retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
      await delay(backoffMs);
      continue;
    }

    // Non-retryable error
    return response;
  }

  // Should not reach here, but just in case
  throw new Error(`[O*NET] Max retries exceeded for ${url}`);
}

export async function searchONET(keyword: string): Promise<string | null> {
  const auth = Buffer.from(':' + process.env.ONET_API_PASSWORD).toString('base64');

  const response = await fetchWithRetry(
    `https://services.onetcenter.org/ws/online/search?keyword=${encodeURIComponent(keyword)}`,
    {
      headers: { Authorization: `Basic ${auth}` },
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
  const auth = Buffer.from(':' + process.env.ONET_API_PASSWORD).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };
  const baseUrl = `https://services.onetcenter.org/ws/online/occupations/${onetCode}`;

  // Serialize requests with delays to avoid rate limiting
  const endpoints = [
    { url: baseUrl, key: 'occupation' },
    { url: `${baseUrl}/summary/skills`, key: 'skills' },
    { url: `${baseUrl}/summary/knowledge`, key: 'knowledge' },
    { url: `${baseUrl}/summary/technology_skills`, key: 'technology' },
  ];

  const results: Record<string, any> = {};

  for (const endpoint of endpoints) {
    const response = await fetchWithRetry(endpoint.url, {
      headers,
      signal: AbortSignal.timeout(30000),
    });

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
