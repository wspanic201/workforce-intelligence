// =============================================================================
// O*NET Web Services API Integration
// Powers Curriculum Drift Analysis and Feasibility Report reports
// =============================================================================

// --- Legacy interfaces (preserved for backward compatibility) ---

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

// --- New interfaces for Wavelength integration ---

export interface OnetSkill {
  name: string;
  importance: number; // 1-100 scale
  level: number; // 1-100 scale
  description?: string;
}

export interface OnetTechnology {
  name: string;
  hotTechnology: boolean;
}

export interface OnetOccupationProfile {
  socCode: string;
  title: string;
  skills: OnetSkill[];
  knowledge: OnetSkill[];
  abilities: OnetSkill[];
  technologies: OnetTechnology[];
  fetchedAt: string;
}

// =============================================================================
// Configuration
// =============================================================================

// O*NET API v2 — uses X-API-Key header, NOT Basic auth
const ONET_BASE_URL = 'https://api-v2.onetcenter.org';

function getHeaders(): Record<string, string> {
  const apiKey = process.env.ONET_API_KEY;
  if (!apiKey) {
    console.warn('[O*NET] ONET_API_KEY not set — O*NET features will be skipped');
  }
  return {
    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
    Accept: 'application/json',
    'User-Agent': 'Wavelength-WorkforceIntelligence/1.0',
  };
}

// =============================================================================
// Helpers
// =============================================================================

function normalizeSocCode(code: string): string {
  return code.includes('.') ? code : `${code}.00`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 4
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.ok || response.status === 404) return response;

    // Don't retry auth failures — the key is wrong, retrying won't help
    if (response.status === 401 || response.status === 403) {
      console.warn(`[O*NET] Auth failed (${response.status}). Check ONET_API_KEY — may need to re-register at services.onetcenter.org`);
      return response;
    }

    if (
      (response.status === 429 || response.status === 503) &&
      attempt < maxRetries
    ) {
      const backoffMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      console.warn(
        `[O*NET] ${response.status} on ${url}, retrying in ${Math.round(backoffMs)}ms (${attempt + 1}/${maxRetries})`
      );
      await delay(backoffMs);
      continue;
    }

    return response;
  }

  throw new Error(`[O*NET] Max retries exceeded for ${url}`);
}

// =============================================================================
// In-memory cache
// =============================================================================

const profileCache = new Map<string, OnetOccupationProfile>();

// =============================================================================
// Internal data fetchers
// =============================================================================

type SummaryCategory = 'skills' | 'knowledge' | 'abilities' | 'technology_skills';

async function fetchSummary(socCode: string, category: SummaryCategory): Promise<any | null> {
  const url = `${ONET_BASE_URL}/online/occupations/${socCode}/summary/${category}`;
  const response = await fetchWithRetry(url, {
    headers: getHeaders(),
    signal: AbortSignal.timeout(30000),
  });

  if (response.status === 404) {
    console.warn(`[O*NET] No ${category} data for ${socCode}`);
    return null;
  }

  if (!response.ok) {
    console.warn(`[O*NET] ${category} returned ${response.status} for ${socCode}`);
    return null;
  }

  return response.json();
}

async function fetchOccupationDetails(socCode: string): Promise<{ title: string } | null> {
  const url = `${ONET_BASE_URL}/online/occupations/${socCode}`;
  const response = await fetchWithRetry(url, {
    headers: getHeaders(),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return { title: data.title || 'Unknown' };
}

function parseSkills(data: any): OnetSkill[] {
  if (!data?.element) return [];
  return data.element.map((e: any) => {
    // O*NET returns importance and level as separate scale entries
    // The score object has value on a 1-5 or 0-7 scale; normalize to 1-100
    const importance = e.score?.importance ?? (e.score?.value ?? 0);
    const level = e.score?.level ?? 0;
    return {
      name: e.name || '',
      importance: Math.round(importance * 100) / 100,
      level: Math.round(level * 100) / 100,
      description: e.description || undefined,
    };
  });
}

function parseTechnologies(data: any): OnetTechnology[] {
  if (!data?.category) {
    // Flat element list fallback
    if (!data?.element) return [];
    return data.element.map((e: any) => ({
      name: e.name || e.example || '',
      hotTechnology: e.hot_technology === true || e['hot_technology'] === 'Y',
    }));
  }

  // Technology skills come grouped by category with examples
  const techs: OnetTechnology[] = [];
  for (const cat of data.category) {
    if (cat.example) {
      for (const ex of Array.isArray(cat.example) ? cat.example : [cat.example]) {
        techs.push({
          name: ex.name || ex,
          hotTechnology: ex.hot_technology === 'Y' || ex.hot_technology === true,
        });
      }
    }
  }
  return techs;
}

// =============================================================================
// Exported functions — New API
// =============================================================================

/**
 * Fetch a full occupation profile (skills, knowledge, abilities, technologies).
 * Results are cached in memory for the duration of the process.
 */
export async function getOccupationProfile(
  socCode: string
): Promise<OnetOccupationProfile | null> {
  const code = normalizeSocCode(socCode);

  if (profileCache.has(code)) {
    return profileCache.get(code)!;
  }

  // Fetch occupation title first
  const details = await fetchOccupationDetails(code);
  if (!details) return null;

  // Fetch all four categories with small delays to be polite
  const [skillsData, knowledgeData, abilitiesData, techData] = await Promise.all([
    fetchSummary(code, 'skills'),
    delay(300).then(() => fetchSummary(code, 'knowledge')),
    delay(600).then(() => fetchSummary(code, 'abilities')),
    delay(900).then(() => fetchSummary(code, 'technology_skills')),
  ]);

  const profile: OnetOccupationProfile = {
    socCode: code,
    title: details.title,
    skills: parseSkills(skillsData),
    knowledge: parseSkills(knowledgeData),
    abilities: parseSkills(abilitiesData),
    technologies: parseTechnologies(techData),
    fetchedAt: new Date().toISOString(),
  };

  profileCache.set(code, profile);
  return profile;
}

/**
 * Get top skills for an occupation, sorted by importance descending.
 */
export async function getTopSkills(
  socCode: string,
  limit = 10
): Promise<OnetSkill[]> {
  const profile = await getOccupationProfile(socCode);
  if (!profile) return [];
  return [...profile.skills]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, limit);
}

/**
 * Get top knowledge areas for an occupation, sorted by importance descending.
 */
export async function getTopKnowledge(
  socCode: string,
  limit = 10
): Promise<OnetSkill[]> {
  const profile = await getOccupationProfile(socCode);
  if (!profile) return [];
  return [...profile.knowledge]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, limit);
}

/**
 * Get technology skills for an occupation.
 */
export async function getTechnologies(
  socCode: string
): Promise<OnetTechnology[]> {
  const profile = await getOccupationProfile(socCode);
  if (!profile) return [];
  return profile.technologies;
}

// =============================================================================
// Legacy exports (preserved for existing code)
// =============================================================================

export async function searchONET(keyword: string): Promise<string | null> {
  const url = `${ONET_BASE_URL}/online/search?keyword=${encodeURIComponent(keyword)}&end=5`;
  const response = await fetchWithRetry(url, {
    headers: getHeaders(),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    console.warn(`[O*NET] Search returned ${response.status} — continuing without O*NET`);
    return null;
  }

  const data = await response.json();
  const code = data.occupation?.[0]?.code || null;
  return code ? normalizeSocCode(code) : null;
}

export async function getONETCompetencies(onetCode: string): Promise<ONETCompetencies> {
  const code = normalizeSocCode(onetCode);

  // Use the new profile fetcher internally
  const profile = await getOccupationProfile(code);

  if (!profile) {
    return {
      code,
      title: 'Unknown',
      description: 'O*NET data unavailable due to API issues',
      skills: [],
      knowledge: [],
      technology: [],
      education: 'Not specified',
    };
  }

  // Map new format back to legacy format
  return {
    code,
    title: profile.title,
    description: '',
    skills: profile.skills.map((s) => ({
      element_name: s.name,
      scale_value: s.importance,
      description: s.description,
    })),
    knowledge: profile.knowledge.map((k) => ({
      element_name: k.name,
      scale_value: k.importance,
      description: k.description,
    })),
    technology: profile.technologies.map((t) => ({
      example: t.name,
      hot_technology: t.hotTechnology,
    })),
    education: 'Not specified',
  };
}
