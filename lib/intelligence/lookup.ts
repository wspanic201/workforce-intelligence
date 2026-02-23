/**
 * Verified Intelligence Layer — Lookup Library
 * 
 * Agents call these functions BEFORE web search.
 * Every function returns LookupResult<T> with data + citation + freshness.
 * Returns { found: false } when no data available — agent falls back to web search.
 * 
 * USAGE IN AGENTS:
 *   const wages = await getOccupationWages('29-1141', 'IA');
 *   if (wages.found) {
 *     // Use wages.data, cite wages.citation
 *   } else {
 *     // Fall back to web search
 *   }
 */

import { getSupabaseServerClient } from '@/lib/supabase/client';
import type {
  IntelWage, IntelStatute, IntelInstitution,
  IntelInstitutionProgram, IntelInstitutionCustom,
  IntelDistance, IntelCredential, IntelEmployer, IntelSource,
} from './types';

const supabase = () => getSupabaseServerClient();

// ════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════

export interface LookupResult<T> {
  data: T | null;
  found: boolean;
  citation: string;
  sourceUrl?: string;
  dataContext: 'credit_only' | 'noncredit_relevant' | 'all';
  freshness: {
    period: string;
    lastRefreshed: string;
    isStale: boolean;
  };
}

interface OccupationWageData {
  soc_code: string;
  occupation_title: string;
  median_annual: number | null;
  mean_annual: number | null;
  pct_10: number | null;
  pct_25: number | null;
  pct_75: number | null;
  pct_90: number | null;
  employment: number | null;
  geo_level: string;
  geo_code: string;
  geo_name: string;
  bls_release: string;
}

interface OccupationProjectionData {
  soc_code: string;
  occupation_title: string;
  base_year: number;
  projected_year: number;
  employment_base: number | null;
  employment_projected: number | null;
  change_number: number | null;
  change_percent: number | null;
  annual_openings: number | null;
  growth_category: string | null;
  geo_code: string;
}

interface OccupationSkillData {
  soc_code: string;
  occupation_title: string;
  skill_type: string;
  skill_name: string;
  importance: number | null;
  level: number | null;
  category: string | null;
}

interface H1BDemandData {
  soc_code: string;
  occupation_title: string;
  state: string;
  total_applications: number;
  total_certified: number;
  avg_wage: number | null;
  median_wage: number | null;
  unique_employers: number;
  top_employers: string[];
}

interface StatePriorityData {
  state: string;
  occupation_title: string;
  soc_code: string | null;
  sector: string | null;
  priority_level: string;
  scholarship_eligible: boolean;
  wioa_fundable: boolean;
  entry_hourly_wage: number | null;
  entry_annual_salary: number | null;
  effective_year: string;
  designation_source: string;
}

interface ServiceAreaEconomyData {
  counties: { fips: string; name: string; is_primary: boolean }[];
  totalPopulation: number;
  avgMedianIncome: number | null;
  avgPovertyRate: number | null;
  avgBachelorsRate: number | null;
  avgUnemployment: number | null;
  topIndustries: { naics: string; name: string; employees: number; establishments: number }[];
  totalEmployees: number;
  totalEstablishments: number;
}

interface FrameworkData {
  framework_name: string;
  short_name: string | null;
  framework_type: string;
  category: string;
  organization: string;
  summary: string;
  key_principles: string[];
  implementation_steps: string[];
  quality_indicators: string[];
  common_pitfalls: string[];
  when_to_use: string | null;
  citation_text: string | null;
  source_url: string | null;
  applicable_sectors: string[];
  applicable_program_types: string[];
}

interface WageGapData {
  industryWage: OccupationWageData;
  facultyWage: OccupationWageData;
  gap: number;
  gapPercent: number;
  industryPaysMore: boolean;
}

// ════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════

const NAICS_NAMES: Record<string, string> = {
  '11': 'Agriculture, Forestry, Fishing & Hunting', '21': 'Mining, Quarrying & Oil/Gas',
  '23': 'Construction', '31-33': 'Manufacturing', '42': 'Wholesale Trade',
  '44-45': 'Retail Trade', '48-49': 'Transportation & Warehousing', '51': 'Information',
  '52': 'Finance & Insurance', '54': 'Professional & Technical Services',
  '56': 'Administrative & Waste Services', '61': 'Educational Services',
  '62': 'Health Care & Social Assistance', '72': 'Accommodation & Food Services',
  '81': 'Other Services',
};

// Cache freshness data per request
const freshnessCache = new Map<string, any>();

async function getFreshness(tableName: string): Promise<{ period: string; lastRefreshed: string; isStale: boolean; citation: string; sourceUrl: string }> {
  if (freshnessCache.has(tableName)) return freshnessCache.get(tableName);
  
  const { data } = await supabase()
    .from('intel_data_freshness')
    .select('data_period, last_refreshed_at, is_stale, citation_text, citation_url')
    .eq('table_name', tableName)
    .single();

  const result = {
    period: data?.data_period || 'Unknown',
    lastRefreshed: data?.last_refreshed_at || '',
    isStale: data?.is_stale || false,
    citation: data?.citation_text || tableName,
    sourceUrl: data?.citation_url || '',
  };
  freshnessCache.set(tableName, result);
  return result;
}

function empty<T>(tableName: string, citation: string = '', context: LookupResult<T>['dataContext'] = 'all'): LookupResult<T> {
  return { data: null, found: false, citation, sourceUrl: undefined, dataContext: context, freshness: { period: '', lastRefreshed: '', isStale: false } };
}

async function wrap<T>(tableName: string, data: T | null, context: LookupResult<T>['dataContext'] = 'all'): Promise<LookupResult<T>> {
  if (!data) {
    return empty(tableName, '', context);
  }
  const f = await getFreshness(tableName);
  return {
    data,
    found: true,
    citation: f.citation,
    sourceUrl: f.sourceUrl,
    dataContext: context,
    freshness: { period: f.period, lastRefreshed: f.lastRefreshed, isStale: f.isStale },
  };
}

async function wrapList<T>(tableName: string, data: T[], context: LookupResult<T[]>['dataContext'] = 'all'): Promise<LookupResult<T[]>> {
  if (!data?.length) {
    return empty(tableName, '', context);
  }
  const f = await getFreshness(tableName);
  return {
    data,
    found: true,
    citation: f.citation,
    sourceUrl: f.sourceUrl,
    dataContext: context,
    freshness: { period: f.period, lastRefreshed: f.lastRefreshed, isStale: f.isStale },
  };
}

// ════════════════════════════════════════════════════════
// 1. OCCUPATION INTELLIGENCE
// ════════════════════════════════════════════════════════

/**
 * Get wage data for an occupation (national, state, or MSA)
 * @param soc SOC code (e.g., '29-1141')
 * @param geo State code (e.g., 'IA') or 'US' for national. Defaults to national.
 */
export async function getOccupationWages(soc: string, geo?: string): Promise<LookupResult<OccupationWageData>> {
  try {
    let query = supabase().from('intel_wages').select('*').eq('soc_code', soc);
    if (geo && geo !== 'US') {
      query = query.eq('geo_level', 'state').eq('geo_code', geo);
    } else {
      query = query.eq('geo_level', 'national');
    }
    const { data } = await query.limit(1).single();
    return wrap('intel_wages', data as OccupationWageData | null);
  } catch { return empty('intel_wages'); }
}

/**
 * Get all wage levels for an occupation (national + all states with data)
 */
export async function getOccupationWagesAllGeos(soc: string): Promise<LookupResult<OccupationWageData[]>> {
  try {
    const { data } = await supabase().from('intel_wages').select('*').eq('soc_code', soc).order('geo_level').order('geo_code');
    return wrapList('intel_wages', (data || []) as OccupationWageData[]);
  } catch { return empty('intel_wages'); }
}

/**
 * Get employment projections for an occupation (2022-2032)
 * @param soc SOC code
 * @param geo State code or 'US'. Defaults to all states.
 */
export async function getOccupationProjections(soc: string, geo?: string): Promise<LookupResult<OccupationProjectionData>> {
  try {
    let query = supabase().from('intel_occupation_projections').select('*').eq('soc_code', soc);
    if (geo) {
      query = query.eq('geo_code', geo);
    }
    const { data } = await query.limit(1).single();
    return wrap('intel_occupation_projections', data as OccupationProjectionData | null);
  } catch { return empty('intel_occupation_projections'); }
}

/**
 * Get projections across all states for an occupation
 */
export async function getOccupationProjectionsAllStates(soc: string): Promise<LookupResult<OccupationProjectionData[]>> {
  try {
    const { data } = await supabase().from('intel_occupation_projections').select('*').eq('soc_code', soc).order('change_percent', { ascending: false });
    return wrapList('intel_occupation_projections', (data || []) as OccupationProjectionData[]);
  } catch { return empty('intel_occupation_projections'); }
}

/**
 * Get top skills, knowledge, and technology for an occupation
 * @param soc SOC code
 * @param types Filter by skill_type: 'skill', 'knowledge', 'ability', 'technology', 'tool'
 * @param limit Max results per type (default 10)
 */
export async function getOccupationSkills(soc: string, types?: string[], limit = 10): Promise<LookupResult<OccupationSkillData[]>> {
  try {
    let query = supabase().from('intel_occupation_skills').select('*').eq('soc_code', soc);
    if (types?.length) query = query.in('skill_type', types);
    const { data } = await query.order('importance', { ascending: false }).limit(limit * (types?.length || 5));
    return wrapList('intel_occupation_skills', (data || []) as OccupationSkillData[]);
  } catch { return empty('intel_occupation_skills'); }
}

/**
 * Get H-1B visa demand signals for an occupation or state
 */
export async function getH1BDemand(soc?: string, state?: string): Promise<LookupResult<H1BDemandData[]>> {
  try {
    let query = supabase().from('intel_h1b_demand').select('*');
    if (soc) query = query.eq('soc_code', soc);
    if (state) query = query.eq('state', state);
    const { data } = await query.order('total_applications', { ascending: false }).limit(20);
    return wrapList('intel_h1b_demand', (data || []) as H1BDemandData[]);
  } catch { return empty('intel_h1b_demand'); }
}

/**
 * Get state in-demand / priority occupations (WIOA lists)
 */
export async function getStatePriorities(state: string): Promise<LookupResult<StatePriorityData[]>> {
  try {
    const { data } = await supabase().from('intel_state_priorities').select('*').eq('state', state.toUpperCase()).order('sector').order('occupation_title');
    return wrapList('intel_state_priorities', (data || []) as StatePriorityData[]);
  } catch { return empty('intel_state_priorities'); }
}

/**
 * Check if a specific occupation is on a state's priority list
 */
export async function isStatePriority(soc: string, state: string): Promise<{ isPriority: boolean; scholarshipEligible: boolean; wioaFundable: boolean; data: StatePriorityData | null }> {
  try {
    const { data } = await supabase().from('intel_state_priorities').select('*').eq('state', state.toUpperCase()).eq('soc_code', soc).limit(1).single();
    if (data) return { isPriority: true, scholarshipEligible: data.scholarship_eligible, wioaFundable: data.wioa_fundable, data: data as StatePriorityData };
    return { isPriority: false, scholarshipEligible: false, wioaFundable: false, data: null };
  } catch { return { isPriority: false, scholarshipEligible: false, wioaFundable: false, data: null }; }
}

/**
 * Get faculty/instructor wage for a teaching field
 * Maps industry SOC → postsecondary teacher SOC (25-xxxx)
 */
export async function getFacultyWageBenchmark(facultySoc: string, geo?: string): Promise<LookupResult<OccupationWageData>> {
  // Faculty SOCs are 25-xxxx
  if (!facultySoc.startsWith('25-')) {
    return empty('intel_wages');
  }
  return getOccupationWages(facultySoc, geo);
}

/**
 * Compare industry wage vs. faculty wage for a field
 * @param industrySoc Industry SOC (e.g., '29-1141' for RN)
 * @param facultySoc Faculty SOC (e.g., '25-1072' for Nursing Instructor)
 * @param geo State code
 */
export async function getWageGap(industrySoc: string, facultySoc: string, geo?: string): Promise<LookupResult<WageGapData>> {
  try {
    const [industry, faculty] = await Promise.all([
      getOccupationWages(industrySoc, geo),
      getOccupationWages(facultySoc, geo),
    ]);
    if (!industry.found || !faculty.found || !industry.data?.median_annual || !faculty.data?.median_annual) {
      return empty('intel_wages');
    }
    const gap = industry.data.median_annual - faculty.data.median_annual;
    return wrap('intel_wages', {
      industryWage: industry.data,
      facultyWage: faculty.data,
      gap: Math.abs(gap),
      gapPercent: Math.round((Math.abs(gap) / faculty.data.median_annual) * 100),
      industryPaysMore: gap > 0,
    });
  } catch { return empty('intel_wages'); }
}

// ════════════════════════════════════════════════════════
// 2. INSTITUTION INTELLIGENCE
// ════════════════════════════════════════════════════════

/**
 * Look up an institution by name, short name, or IPEDS ID
 */
export async function getInstitution(query: string): Promise<LookupResult<IntelInstitution>> {
  try {
    const s = supabase();
    // Try IPEDS ID
    if (/^\d{6}$/.test(query)) {
      const { data } = await s.from('intel_institutions').select('*').eq('ipeds_id', query).limit(1).single();
      if (data) return wrap('intel_institutions', data as IntelInstitution, 'credit_only');
    }
    // Try exact or fuzzy name
    const { data: exact } = await s.from('intel_institutions').select('*').or(`name.ilike.%${query}%,short_name.ilike.%${query}%`).limit(1).single();
    return wrap('intel_institutions', exact as IntelInstitution | null, 'credit_only');
  } catch { return empty('intel_institutions', '', 'credit_only'); }
}

/**
 * Get IPEDS program completions for an institution
 * @param cip Optional CIP code filter (e.g., '51.0805')
 */
export async function getInstitutionCompletions(institutionId: string, cip?: string): Promise<LookupResult<any[]>> {
  try {
    let query = supabase().from('intel_completions').select('*').eq('institution_id', institutionId);
    if (cip) query = query.eq('cip_code', cip);
    const { data } = await query.order('total_completions', { ascending: false }).limit(50);
    return wrapList('intel_completions', data || [], 'credit_only');
  } catch { return empty('intel_completions', '', 'credit_only'); }
}

/**
 * Get aggregated economy profile for an institution's service area
 */
export async function getServiceAreaEconomy(institutionId: string): Promise<LookupResult<ServiceAreaEconomyData>> {
  try {
    const s = supabase();
    
    // Get service area counties
    const { data: areas } = await s.from('intel_service_areas').select('county_fips, county_name, is_primary').eq('institution_id', institutionId);
    if (!areas?.length) return empty('intel_service_areas');
    
    const countyFips = areas.map(a => a.county_fips);
    const countyNames = areas.map(a => a.county_name.replace(' County', ''));
    
    // Get demographics
    const { data: demos } = await s.from('intel_county_demographics').select('*').in('county_fips', countyFips);
    
    // Get employer data (CBP uses county name in city field)
    // Need to determine state from service area
    const { data: instData } = await s.from('intel_institutions').select('state').eq('id', institutionId).single();
    const state = instData?.state || 'IA';
    
    const { data: employers } = await s.from('intel_employers').select('naics_code, estimated_employees, notes, city').eq('state', state).in('city', countyNames.map(n => n + ' County'));
    
    // Aggregate industries
    const industryAgg: Record<string, { employees: number; establishments: number }> = {};
    for (const e of (employers || [])) {
      const code = e.naics_code || 'unknown';
      if (!industryAgg[code]) industryAgg[code] = { employees: 0, establishments: 0 };
      industryAgg[code].employees += e.estimated_employees || 0;
      const estMatch = (e.notes as string)?.match(/^(\d+)\s+establishments?/);
      if (estMatch) industryAgg[code].establishments += parseInt(estMatch[1]);
    }
    
    const topIndustries = Object.entries(industryAgg)
      .map(([code, d]) => ({ naics: code, name: NAICS_NAMES[code] || code, ...d }))
      .sort((a, b) => b.employees - a.employees);
    
    const totalPop = (demos || []).reduce((s, d) => s + (d.total_population || 0), 0);
    const avgIncome = demos?.length ? Math.round(demos.reduce((s, d) => s + (d.median_household_income || 0), 0) / demos.length) : null;
    const avgPoverty = demos?.length ? Math.round(demos.reduce((s, d) => s + (d.poverty_rate || 0), 0) / demos.length * 10) / 10 : null;
    const avgBachelors = demos?.length ? Math.round(demos.reduce((s, d) => s + (d.bachelors_or_higher_pct || 0), 0) / demos.length * 10) / 10 : null;
    const avgUnemp = demos?.length ? Math.round(demos.reduce((s, d) => s + (d.unemployment_rate || 0), 0) / demos.length * 10) / 10 : null;
    
    return wrap('intel_service_areas', {
      counties: areas.map(a => ({ fips: a.county_fips, name: a.county_name, is_primary: a.is_primary })),
      totalPopulation: totalPop,
      avgMedianIncome: avgIncome,
      avgPovertyRate: avgPoverty,
      avgBachelorsRate: avgBachelors,
      avgUnemployment: avgUnemp,
      topIndustries,
      totalEmployees: topIndustries.reduce((s, i) => s + i.employees, 0),
      totalEstablishments: topIndustries.reduce((s, i) => s + i.establishments, 0),
    });
  } catch { return empty('intel_service_areas'); }
}

/**
 * Get competing institutions in the same state
 */
export async function getCompetitors(state: string, type?: string): Promise<LookupResult<IntelInstitution[]>> {
  try {
    let query = supabase().from('intel_institutions').select('*').eq('state', state.toUpperCase());
    if (type) query = query.eq('type', type);
    const { data } = await query.order('total_enrollment', { ascending: false }).limit(25);
    return wrapList('intel_institutions', (data || []) as IntelInstitution[], 'credit_only');
  } catch { return empty('intel_institutions', '', 'credit_only'); }
}

/**
 * Get Matt's custom institutional knowledge
 */
export async function getInstitutionCustom(institutionId: string, category?: string): Promise<LookupResult<IntelInstitutionCustom[]>> {
  try {
    let query = supabase().from('intel_institution_custom').select('*').eq('institution_id', institutionId);
    if (category) query = query.eq('data_category', category);
    const { data } = await query.order('data_category').order('data_key');
    return wrapList('intel_institution_custom', (data || []) as IntelInstitutionCustom[]);
  } catch { return empty('intel_institution_custom'); }
}

// ════════════════════════════════════════════════════════
// 3. REGULATORY INTELLIGENCE
// ════════════════════════════════════════════════════════

/**
 * Look up state statutes by state and topic/category
 */
export async function getStateStatutes(state: string, category?: string): Promise<LookupResult<IntelStatute[]>> {
  try {
    let query = supabase().from('intel_statutes').select('*').eq('state', state.toUpperCase()).eq('status', 'active');
    if (category) query = query.or(`category.ilike.%${category}%,title.ilike.%${category}%`);
    const { data } = await query.order('code_chapter');
    return wrapList('intel_statutes', (data || []) as IntelStatute[]);
  } catch { return empty('intel_statutes'); }
}

/**
 * Look up credential/licensing requirements
 */
export async function getStateCredentials(state: string, occupation?: string): Promise<LookupResult<IntelCredential[]>> {
  try {
    let query = supabase().from('intel_credentials').select('*').eq('state', state.toUpperCase());
    if (occupation) query = query.ilike('credential_name', `%${occupation}%`);
    const { data } = await query.order('credential_name');
    return wrapList('intel_credentials', (data || []) as IntelCredential[], 'noncredit_relevant');
  } catch { return empty('intel_credentials', '', 'noncredit_relevant'); }
}

// ════════════════════════════════════════════════════════
// 4. DEMOGRAPHICS
// ════════════════════════════════════════════════════════

/**
 * Get demographics for a specific county
 */
export async function getCountyDemographics(countyFips: string): Promise<LookupResult<any>> {
  try {
    const { data } = await supabase().from('intel_county_demographics').select('*').eq('county_fips', countyFips).single();
    return wrap('intel_county_demographics', data);
  } catch { return empty('intel_county_demographics'); }
}

/**
 * Get aggregated demographics for all counties in a state
 */
export async function getStateDemographics(state: string): Promise<LookupResult<{ totalPopulation: number; avgMedianIncome: number; avgPovertyRate: number; avgBachelorsRate: number; avgUnemployment: number; countyCount: number }>> {
  try {
    const { data } = await supabase().from('intel_county_demographics').select('*').eq('state', state.toUpperCase());
    if (!data?.length) return empty('intel_county_demographics');
    
    const result = {
      totalPopulation: data.reduce((s, d) => s + (d.total_population || 0), 0),
      avgMedianIncome: Math.round(data.reduce((s, d) => s + (d.median_household_income || 0), 0) / data.length),
      avgPovertyRate: Math.round(data.reduce((s, d) => s + (d.poverty_rate || 0), 0) / data.length * 10) / 10,
      avgBachelorsRate: Math.round(data.reduce((s, d) => s + (d.bachelors_or_higher_pct || 0), 0) / data.length * 10) / 10,
      avgUnemployment: Math.round(data.reduce((s, d) => s + (d.unemployment_rate || 0), 0) / data.length * 10) / 10,
      countyCount: data.length,
    };
    return wrap('intel_county_demographics', result);
  } catch { return empty('intel_county_demographics'); }
}

/**
 * Get industry employment data for a state or county
 */
export async function getIndustryEmployment(state: string, county?: string): Promise<LookupResult<{ naics: string; name: string; employees: number; establishments: number }[]>> {
  try {
    let query = supabase().from('intel_employers').select('naics_code, estimated_employees, notes, city').eq('state', state.toUpperCase());
    if (county) query = query.ilike('city', `%${county}%`);
    const { data } = await query;
    
    const agg: Record<string, { employees: number; establishments: number }> = {};
    for (const e of (data || [])) {
      const code = e.naics_code || 'unknown';
      if (!agg[code]) agg[code] = { employees: 0, establishments: 0 };
      agg[code].employees += e.estimated_employees || 0;
      const m = (e.notes as string)?.match(/^(\d+)\s+est/);
      if (m) agg[code].establishments += parseInt(m[1]);
    }
    
    const result = Object.entries(agg)
      .map(([code, d]) => ({ naics: code, name: NAICS_NAMES[code] || code, ...d }))
      .sort((a, b) => b.employees - a.employees);
    
    return wrapList('intel_employers', result);
  } catch { return empty('intel_employers'); }
}

// ════════════════════════════════════════════════════════
// 5. FRAMEWORKS & BEST PRACTICES
// ════════════════════════════════════════════════════════

/**
 * Get frameworks by type and/or category
 */
export async function getFrameworks(type?: string, category?: string): Promise<LookupResult<FrameworkData[]>> {
  try {
    let query = supabase().from('intel_frameworks').select('*').eq('is_current', true);
    if (type) query = query.eq('framework_type', type);
    if (category) query = query.eq('category', category);
    const { data } = await query.order('framework_name');
    return wrapList('intel_frameworks', (data || []) as FrameworkData[]);
  } catch { return empty('intel_frameworks'); }
}

/**
 * Search frameworks by keywords (matches name, summary, tags, sectors)
 */
export async function getFrameworksForContext(keywords: string[]): Promise<LookupResult<FrameworkData[]>> {
  try {
    const orClauses = keywords.map(k => `framework_name.ilike.%${k}%,summary.ilike.%${k}%,short_name.ilike.%${k}%`).join(',');
    const { data } = await supabase().from('intel_frameworks').select('*').eq('is_current', true).or(orClauses).limit(5);
    return wrapList('intel_frameworks', (data || []) as FrameworkData[]);
  } catch { return empty('intel_frameworks'); }
}

/**
 * Get frameworks applicable to a specific sector and program type
 */
export async function getFrameworksForProgram(sector: string, programType: string): Promise<LookupResult<FrameworkData[]>> {
  try {
    const { data } = await supabase().from('intel_frameworks').select('*').eq('is_current', true)
      .or(`applicable_sectors.cs.{${sector}},applicable_sectors.cs.{all}`)
      .or(`applicable_program_types.cs.{${programType}},applicable_program_types.cs.{all}`);
    return wrapList('intel_frameworks', (data || []) as FrameworkData[]);
  } catch { return empty('intel_frameworks'); }
}

// ════════════════════════════════════════════════════════
// 6. META / CITATIONS
// ════════════════════════════════════════════════════════

/**
 * Get citation for a specific data table
 */
export async function getCitation(tableName: string): Promise<{ text: string; url: string | null; period: string } | null> {
  const f = await getFreshness(tableName);
  if (!f.citation) return null;
  return { text: f.citation, url: f.sourceUrl || null, period: f.period };
}

/**
 * Get freshness info for a table
 */
export async function getDataFreshness(tableName?: string) {
  if (tableName) {
    const { data } = await supabase().from('intel_data_freshness').select('*').eq('table_name', tableName).single();
    return data;
  }
  const { data } = await supabase().from('intel_data_freshness').select('*').order('table_name');
  return data;
}

/**
 * Generate a complete citations section for a report
 * Pass the table names that were used in the report
 */
export async function generateCitationsSection(tablesUsed: string[]): Promise<string> {
  const citations: string[] = [];
  for (const table of tablesUsed) {
    const c = await getCitation(table);
    if (c) {
      citations.push(`- ${c.text} (${c.period})${c.url ? ` — ${c.url}` : ''}`);
    }
  }
  if (!citations.length) return '';
  return `## Sources & Citations\n\n${citations.join('\n')}`;
}

// ════════════════════════════════════════════════════════
// CONVENIENCE: FULL OCCUPATION BRIEF
// ════════════════════════════════════════════════════════

/**
 * Pull everything we know about an occupation in one call.
 * Used by agents to get a complete picture before writing analysis.
 */
export async function getFullOccupationBrief(soc: string, state?: string) {
  const [wages, projections, skills, h1b, priority] = await Promise.all([
    getOccupationWages(soc, state),
    getOccupationProjections(soc, state),
    getOccupationSkills(soc, ['skill', 'knowledge', 'technology'], 8),
    getH1BDemand(soc, state),
    state ? isStatePriority(soc, state) : Promise.resolve({ isPriority: false, scholarshipEligible: false, wioaFundable: false, data: null }),
  ]);

  // Try to find faculty wage gap
  const facultySocMap: Record<string, string> = {
    '29-1141': '25-1072', // RN → Nursing Instructor
    '29-2052': '25-1071', // Pharm Tech → Health Specialties
    '15-1252': '25-1021', // Software Dev → CS Teacher
    '47-2111': '25-1194', // Electrician → CTE Teacher
    '51-4121': '25-1194', // Welder → CTE Teacher
    '29-2061': '25-1072', // LPN → Nursing Instructor
  };
  
  let wageGap = null;
  const facultySoc = facultySocMap[soc];
  if (facultySoc) {
    const gapResult = await getWageGap(soc, facultySoc, state);
    if (gapResult.found) wageGap = gapResult.data;
  }

  const tablesUsed = ['intel_wages', 'intel_occupation_projections', 'intel_occupation_skills', 'intel_h1b_demand', 'intel_state_priorities'].filter(t => {
    if (t === 'intel_wages') return wages.found;
    if (t === 'intel_occupation_projections') return projections.found;
    if (t === 'intel_occupation_skills') return skills.found;
    if (t === 'intel_h1b_demand') return h1b.found;
    if (t === 'intel_state_priorities') return priority.isPriority;
    return false;
  });

  return {
    soc,
    state: state || 'US',
    wages: wages.found ? wages.data : null,
    projections: projections.found ? projections.data : null,
    skills: skills.found ? skills.data : null,
    h1bDemand: h1b.found ? h1b.data : null,
    statePriority: priority,
    wageGap,
    tablesUsed,
    citations: await generateCitationsSection(tablesUsed),
  };
}

// ════════════════════════════════════════════════════════
// LEGACY EXPORTS (backward compatibility)
// ════════════════════════════════════════════════════════

export { getInstitution as lookupInstitution };
export { getOccupationWages as lookupWage };
export { getStateStatutes as lookupStatute };
export { getStateCredentials as lookupCredential };

export async function lookupWagesBySoc(socCode: string): Promise<IntelWage[]> {
  const result = await getOccupationWagesAllGeos(socCode);
  return (result.data || []) as IntelWage[];
}

export async function lookupStatuteByChapter(state: string, chapter: string): Promise<IntelStatute | null> {
  try {
    const { data } = await supabase().from('intel_statutes').select('*').eq('state', state.toUpperCase()).eq('code_chapter', chapter).limit(1).single();
    return data as IntelStatute | null;
  } catch { return null; }
}

export async function lookupInstitutionPrograms(institutionId: string): Promise<IntelInstitutionProgram[]> {
  const result = await getInstitutionCompletions(institutionId);
  return (result.data || []) as any[];
}

export async function lookupInstitutionCustom(institutionId: string, category?: string): Promise<IntelInstitutionCustom[]> {
  const result = await getInstitutionCustom(institutionId, category);
  return (result.data || []) as IntelInstitutionCustom[];
}

export async function lookupDistance(from: string, to: string): Promise<IntelDistance | null> {
  try {
    const fromInst = await getInstitution(from);
    const toInst = await getInstitution(to);
    if (!fromInst.data || !toInst.data) return null;
    const { data } = await supabase().from('intel_distances').select('*')
      .or(`and(from_institution_id.eq.${fromInst.data.id},to_institution_id.eq.${toInst.data.id}),and(from_institution_id.eq.${toInst.data.id},to_institution_id.eq.${fromInst.data.id})`)
      .limit(1).single();
    return data as IntelDistance | null;
  } catch { return null; }
}

export async function lookupEmployers(state: string, msa?: string): Promise<IntelEmployer[]> {
  const result = await getIndustryEmployment(state);
  return (result.data || []) as any[];
}

export async function lookupSources(topics: string[]): Promise<IntelSource[]> {
  try {
    const { data } = await supabase().from('intel_sources').select('*').overlaps('topics', topics).order('published_date', { ascending: false }).limit(10);
    return (data || []) as IntelSource[];
  } catch { return []; }
}

// ── Dashboard Stats (unchanged) ────────────────────────

export async function getDashboardStats() {
  const s = supabase();
  const tables = [
    'intel_wages', 'intel_statutes', 'intel_institutions', 'intel_sources',
    'intel_credentials', 'intel_employers', 'intel_distances', 'intel_completions',
    'intel_financial_aid', 'intel_occupation_projections', 'intel_occupation_skills',
    'intel_training_providers', 'intel_apprenticeships', 'intel_license_counts',
    'intel_state_priorities', 'intel_county_demographics', 'intel_h1b_demand',
    'intel_frameworks', 'intel_service_areas',
  ];
  
  const counts = await Promise.all(
    tables.map(async t => {
      try {
        const r = await s.from(t).select('id', { count: 'exact', head: true });
        return { table: t, count: r.count ?? 0 };
      } catch {
        return { table: t, count: 0 };
      }
    })
  );
  
  const byTable = Object.fromEntries(counts.map(c => [c.table, c.count]));
  const flagged = await s.from('intel_review_queue').select('id', { count: 'exact', head: true }).eq('verification_status', 'flagged');

  return {
    wages: { count: byTable.intel_wages, verified_pct: 100 },
    statutes: { count: byTable.intel_statutes, verified_pct: 100 },
    institutions: { count: byTable.intel_institutions, verified_pct: 100 },
    sources: { count: byTable.intel_sources, verified_pct: 100 },
    credentials: { count: byTable.intel_credentials, verified_pct: 100 },
    employers: { count: byTable.intel_employers, verified_pct: 100 },
    distances: { count: byTable.intel_distances },
    review_queue: { flagged: flagged.count ?? 0, total: 0 },
    completions: { count: byTable.intel_completions },
    financial_aid: { count: byTable.intel_financial_aid },
    projections: { count: byTable.intel_occupation_projections },
    skills: { count: byTable.intel_occupation_skills },
    training_providers: { count: byTable.intel_training_providers },
    apprenticeships: { count: byTable.intel_apprenticeships },
    license_counts: { count: byTable.intel_license_counts },
    state_priorities: { count: byTable.intel_state_priorities },
    demographics: { count: byTable.intel_county_demographics },
    h1b_demand: { count: byTable.intel_h1b_demand },
    frameworks: { count: byTable.intel_frameworks },
    service_areas: { count: byTable.intel_service_areas },
  };
}

export async function getDataInventory() {
  const s = supabase();

  const TABLE_META: Record<string, { icon: string; category: string }> = {
    intel_institutions: { icon: '🏫', category: 'credit' },
    intel_completions: { icon: '🎓', category: 'credit' },
    intel_financial_aid: { icon: '💳', category: 'credit' },
    intel_employers: { icon: '🏢', category: 'both' },
    intel_occupation_projections: { icon: '📈', category: 'both' },
    intel_wages: { icon: '💰', category: 'both' },
    intel_occupation_skills: { icon: '🧠', category: 'both' },
    intel_statutes: { icon: '📜', category: 'both' },
    intel_credentials: { icon: '📋', category: 'noncredit' },
    intel_training_providers: { icon: '🏭', category: 'noncredit' },
    intel_apprenticeships: { icon: '🔧', category: 'noncredit' },
    intel_license_counts: { icon: '🔢', category: 'noncredit' },
    intel_distances: { icon: '📏', category: 'reference' },
    intel_sources: { icon: '📰', category: 'reference' },
    intel_state_priorities: { icon: '🏛️', category: 'both' },
    intel_county_demographics: { icon: '🏘️', category: 'reference' },
    intel_h1b_demand: { icon: '🛂', category: 'both' },
    intel_frameworks: { icon: '📚', category: 'reference' },
    intel_service_areas: { icon: '🗺️', category: 'reference' },
  };

  const { data: freshness } = await s.from('intel_data_freshness').select('*').order('table_name');
  if (!freshness) return [];

  const results = await Promise.all(
    freshness.map(async (f) => {
      const meta = TABLE_META[f.table_name] || { icon: '📦', category: 'reference' };
      const countRes = await s.from(f.table_name).select('id', { count: 'exact', head: true });
      return {
        table: f.table_name, label: f.dataset_label, icon: meta.icon, category: meta.category,
        count: countRes.count ?? 0, source: f.source_name, sourceUrl: f.source_url,
        dataPeriod: f.data_period, dataReleaseDate: f.data_release_date,
        nextExpectedRelease: f.next_expected_release, recordsLoaded: f.records_loaded,
        lastRefreshedAt: f.last_refreshed_at, refreshedBy: f.refreshed_by,
        refreshMethod: f.refresh_method, citationText: f.citation_text,
        citationUrl: f.citation_url, coverageNotes: f.coverage_notes,
        knownLimitations: f.known_limitations, isStale: f.is_stale,
        staleReason: f.stale_reason, description: f.coverage_notes || '',
      };
    })
  );
  return results;
}

// Keep legacy alias
export async function getCitationForTable(tableName: string) {
  return getCitation(tableName);
}
