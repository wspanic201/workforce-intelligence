/**
 * IPEDS Completions API integration via College Scorecard API
 * https://api.data.gov/ed/collegescorecard/v1/schools
 *
 * Fetches program-level completions (CIP 4-digit) for Title IV institutions.
 * Used for competitor analysis: "How many students completed X program at nearby colleges?"
 */

const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';
const API_KEY = process.env.DATA_GOV_API_KEY || 'DEMO_KEY';

// Only request fields we need to minimize payload
const FIELDS = [
  'id',
  'school.name',
  'school.city',
  'school.state',
  'latest.programs.cip_4_digit',
].join(',');

// Rate limiting: 1 req/sec
let lastRequestTime = 0;
async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1000) {
    await new Promise((r) => setTimeout(r, 1000 - elapsed));
  }
  lastRequestTime = Date.now();
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Scorecard API error: ${res.status} ${res.statusText}`);
  }
  return res;
}

// In-memory cache
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T;
  if (entry) cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

// --- Types ---

export interface IpedsProgram {
  cipCode: string;
  cipTitle: string;
  credentialLevel: number;
  credentialLabel: string;
  completions: number;
  year: string;
}

export interface IpedsInstitution {
  unitId: string;
  name: string;
  city: string;
  state: string;
  programs: IpedsProgram[];
}

const CREDENTIAL_LABELS: Record<number, string> = {
  1: 'Undergraduate Certificate or Diploma',
  2: "Associate's Degree",
  3: "Bachelor's Degree",
  4: 'Post-baccalaureate Certificate',
  5: "Master's Degree",
  6: 'Post-master\'s Certificate',
  7: 'Doctoral Degree',
  8: 'First Professional Degree',
};

// --- Internal helpers ---

interface ScorecardSchool {
  id: number;
  'school.name': string;
  'school.city': string;
  'school.state': string;
  'latest.programs.cip_4_digit': Array<{
    code: string;
    title: string;
    credential: { level: number };
    counts: { awarded: number };
  }> | null;
}

interface ScorecardResponse {
  metadata: { total: number; page: number; per_page: number };
  results: ScorecardSchool[];
}

function parseInstitution(school: ScorecardSchool): IpedsInstitution {
  const rawPrograms = school['latest.programs.cip_4_digit'] || [];
  const programs: IpedsProgram[] = rawPrograms.map((p) => ({
    cipCode: p.code,
    cipTitle: p.title,
    credentialLevel: p.credential.level,
    credentialLabel: CREDENTIAL_LABELS[p.credential.level] || `Level ${p.credential.level}`,
    completions: p.counts?.awarded ?? 0,
    year: 'latest', // Scorecard API returns "latest" vintage
  }));

  return {
    unitId: String(school.id),
    name: school['school.name'],
    city: school['school.city'],
    state: school['school.state'],
    programs,
  };
}

async function fetchSchools(params: Record<string, string>): Promise<IpedsInstitution[]> {
  const allResults: IpedsInstitution[] = [];
  let page = 0;
  const perPage = 20;

  while (true) {
    const qs = new URLSearchParams({
      api_key: API_KEY,
      fields: FIELDS,
      per_page: String(perPage),
      page: String(page),
      ...params,
    });

    const url = `${BASE_URL}?${qs}`;
    const res = await rateLimitedFetch(url);
    const json = (await res.json()) as ScorecardResponse;

    for (const school of json.results) {
      allResults.push(parseInstitution(school));
    }

    // Check if more pages exist
    const totalPages = Math.ceil(json.metadata.total / perPage);
    page++;
    if (page >= totalPages) break;
  }

  return allResults;
}

// --- Exported functions ---

/**
 * Get completions for a specific institution by IPEDS Unit ID
 */
export async function getInstitutionCompletions(
  unitId: string
): Promise<IpedsInstitution | null> {
  const cacheKey = `inst:${unitId}`;
  const cached = getCached<IpedsInstitution>(cacheKey);
  if (cached) return cached;

  const qs = new URLSearchParams({
    api_key: API_KEY,
    fields: FIELDS,
    id: unitId,
  });

  const res = await rateLimitedFetch(`${BASE_URL}?${qs}`);
  const json = (await res.json()) as ScorecardResponse;

  if (!json.results?.length) return null;

  const institution = parseInstitution(json.results[0]);
  setCache(cacheKey, institution);
  return institution;
}

/**
 * Search institutions by name and state, return with completions
 */
export async function searchInstitutions(
  name: string,
  state: string
): Promise<IpedsInstitution[]> {
  const cacheKey = `search:${name}:${state}`;
  const cached = getCached<IpedsInstitution[]>(cacheKey);
  if (cached) return cached;

  const results = await fetchSchools({
    'school.name': name,
    'school.state': state,
  });

  setCache(cacheKey, results);
  return results;
}

/**
 * Get completions for a specific CIP code across all institutions in a state.
 * Returns institutions sorted by completions descending.
 */
export async function getCompletionsByCip(
  cipCode: string,
  state: string
): Promise<Array<{ institution: string; unitId: string; completions: number }>> {
  const cacheKey = `cip:${cipCode}:${state}`;
  const cached = getCached<Array<{ institution: string; unitId: string; completions: number }>>(cacheKey);
  if (cached) return cached;

  // Fetch all schools in the state that have this CIP program
  const institutions = await fetchSchools({
    'school.state': state,
    'latest.programs.cip_4_digit.code': cipCode,
  });

  const results = institutions
    .map((inst) => {
      const matching = inst.programs.filter((p) => p.cipCode === cipCode);
      const totalCompletions = matching.reduce((sum, p) => sum + p.completions, 0);
      return {
        institution: inst.name,
        unitId: inst.unitId,
        completions: totalCompletions,
      };
    })
    .filter((r) => r.completions > 0)
    .sort((a, b) => b.completions - a.completions);

  setCache(cacheKey, results);
  return results;
}

/**
 * Get competitor completions: find other colleges in the same state
 * offering the same CIP program, optionally excluding one institution.
 */
export async function getCompetitorCompletions(
  cipCode: string,
  state: string,
  excludeUnitId?: string
): Promise<Array<{ institution: string; city: string; completions: number }>> {
  const cacheKey = `comp:${cipCode}:${state}:${excludeUnitId || ''}`;
  const cached = getCached<Array<{ institution: string; city: string; completions: number }>>(cacheKey);
  if (cached) return cached;

  const institutions = await fetchSchools({
    'school.state': state,
    'latest.programs.cip_4_digit.code': cipCode,
  });

  const results = institutions
    .filter((inst) => !excludeUnitId || inst.unitId !== excludeUnitId)
    .map((inst) => {
      const matching = inst.programs.filter((p) => p.cipCode === cipCode);
      const totalCompletions = matching.reduce((sum, p) => sum + p.completions, 0);
      return {
        institution: inst.name,
        city: inst.city,
        completions: totalCompletions,
      };
    })
    .filter((r) => r.completions > 0)
    .sort((a, b) => b.completions - a.completions);

  setCache(cacheKey, results);
  return results;
}
