/**
 * Intelligence Hub Lookup Library
 * Agents call these functions BEFORE web search.
 * Returns verified data or null (agent falls back to web search).
 */

import { getSupabaseServerClient } from '@/lib/supabase/client';
import type {
  IntelWage, IntelStatute, IntelInstitution,
  IntelInstitutionProgram, IntelInstitutionCustom,
  IntelDistance, IntelCredential, IntelEmployer, IntelSource,
} from './types';

const supabase = () => getSupabaseServerClient();

// ── Wages ──────────────────────────────────────────────

export async function lookupWage(
  socCode: string,
  state?: string,
  msa?: string
): Promise<IntelWage | null> {
  try {
    let query = supabase().from('intel_wages').select('*').eq('soc_code', socCode);

    if (msa) {
      query = query.eq('geo_level', 'msa').eq('geo_code', msa);
    } else if (state) {
      query = query.eq('geo_level', 'state').eq('geo_code', state);
    } else {
      query = query.eq('geo_level', 'national');
    }

    const { data, error } = await query.limit(1).single();
    if (error || !data) return null;
    return data as IntelWage;
  } catch {
    return null;
  }
}

export async function lookupWagesBySoc(socCode: string): Promise<IntelWage[]> {
  try {
    const { data, error } = await supabase()
      .from('intel_wages')
      .select('*')
      .eq('soc_code', socCode)
      .order('geo_level');
    if (error || !data) return [];
    return data as IntelWage[];
  } catch {
    return [];
  }
}

// ── Statutes ───────────────────────────────────────────

export async function lookupStatute(
  state: string,
  topic: string
): Promise<IntelStatute[]> {
  try {
    const { data, error } = await supabase()
      .from('intel_statutes')
      .select('*')
      .eq('state', state.toUpperCase())
      .eq('status', 'active')
      .or(`category.ilike.%${topic}%,title.ilike.%${topic}%,tags.cs.{${topic}}`);
    if (error || !data) return [];
    return data as IntelStatute[];
  } catch {
    return [];
  }
}

export async function lookupStatuteByChapter(
  state: string,
  chapter: string
): Promise<IntelStatute | null> {
  try {
    const { data, error } = await supabase()
      .from('intel_statutes')
      .select('*')
      .eq('state', state.toUpperCase())
      .eq('code_chapter', chapter)
      .limit(1)
      .single();
    if (error || !data) return null;
    return data as IntelStatute;
  } catch {
    return null;
  }
}

// ── Institutions ───────────────────────────────────────

export async function lookupInstitution(
  nameOrIpeds: string
): Promise<IntelInstitution | null> {
  try {
    // Try IPEDS ID first
    if (/^\d+$/.test(nameOrIpeds)) {
      const { data, error } = await supabase()
        .from('intel_institutions')
        .select('*')
        .eq('ipeds_id', nameOrIpeds)
        .limit(1)
        .single();
      if (!error && data) return data as IntelInstitution;
    }

    // Try exact name match
    const { data: exact } = await supabase()
      .from('intel_institutions')
      .select('*')
      .ilike('name', nameOrIpeds)
      .limit(1)
      .single();
    if (exact) return exact as IntelInstitution;

    // Try short name
    const { data: short } = await supabase()
      .from('intel_institutions')
      .select('*')
      .ilike('short_name', nameOrIpeds)
      .limit(1)
      .single();
    if (short) return short as IntelInstitution;

    // Fuzzy search
    const { data: fuzzy } = await supabase()
      .from('intel_institutions')
      .select('*')
      .or(`name.ilike.%${nameOrIpeds}%,short_name.ilike.%${nameOrIpeds}%`)
      .limit(1)
      .single();
    if (fuzzy) return fuzzy as IntelInstitution;

    return null;
  } catch {
    return null;
  }
}

export async function lookupInstitutionPrograms(
  institutionId: string
): Promise<IntelInstitutionProgram[]> {
  try {
    const { data, error } = await supabase()
      .from('intel_institution_programs')
      .select('*')
      .eq('institution_id', institutionId)
      .eq('active', true)
      .order('program_name');
    if (error || !data) return [];
    return data as IntelInstitutionProgram[];
  } catch {
    return [];
  }
}

export async function lookupInstitutionCustom(
  institutionId: string,
  category?: string
): Promise<IntelInstitutionCustom[]> {
  try {
    let query = supabase()
      .from('intel_institution_custom')
      .select('*')
      .eq('institution_id', institutionId);
    if (category) query = query.eq('data_category', category);
    const { data, error } = await query.order('data_category').order('data_key');
    if (error || !data) return [];
    return data as IntelInstitutionCustom[];
  } catch {
    return [];
  }
}

// ── Distances ──────────────────────────────────────────

export async function lookupDistance(
  fromInstitution: string,
  toInstitution: string
): Promise<IntelDistance | null> {
  try {
    // Resolve institution names to IDs
    const from = await lookupInstitution(fromInstitution);
    const to = await lookupInstitution(toInstitution);
    if (!from || !to) return null;

    // Check both directions
    const { data, error } = await supabase()
      .from('intel_distances')
      .select('*')
      .or(
        `and(from_institution_id.eq.${from.id},to_institution_id.eq.${to.id}),` +
        `and(from_institution_id.eq.${to.id},to_institution_id.eq.${from.id})`
      )
      .limit(1)
      .single();
    if (error || !data) return null;
    return data as IntelDistance;
  } catch {
    return null;
  }
}

// ── Credentials ────────────────────────────────────────

export async function lookupCredential(
  state: string,
  credentialName: string
): Promise<IntelCredential[]> {
  try {
    const { data, error } = await supabase()
      .from('intel_credentials')
      .select('*')
      .eq('state', state.toUpperCase())
      .ilike('credential_name', `%${credentialName}%`);
    if (error || !data) return [];
    return data as IntelCredential[];
  } catch {
    return [];
  }
}

// ── Employers ──────────────────────────────────────────

export async function lookupEmployers(
  state: string,
  msa?: string,
  socCode?: string
): Promise<IntelEmployer[]> {
  try {
    let query = supabase()
      .from('intel_employers')
      .select('*')
      .eq('state', state.toUpperCase());
    if (msa) query = query.eq('msa', msa);
    if (socCode) query = query.contains('key_occupations', [socCode]);
    const { data, error } = await query.order('estimated_employees', { ascending: false }).limit(20);
    if (error || !data) return [];
    return data as IntelEmployer[];
  } catch {
    return [];
  }
}

// ── Sources ────────────────────────────────────────────

export async function lookupSources(
  topics: string[],
  states?: string[]
): Promise<IntelSource[]> {
  try {
    let query = supabase()
      .from('intel_sources')
      .select('*')
      .overlaps('topics', topics);
    if (states?.length) query = query.overlaps('states', states);
    const { data, error } = await query
      .order('published_date', { ascending: false })
      .limit(10);
    if (error || !data) return [];
    return data as IntelSource[];
  } catch {
    return [];
  }
}

// ── Dashboard Stats ────────────────────────────────────

export async function getDashboardStats() {
  const s = supabase();

  const [wages, statutes, institutions, sources, credentials, employers, distances, review,
         completions, financial_aid, projections, skills, training_providers, apprenticeships, license_counts] = await Promise.all([
    s.from('intel_wages').select('id', { count: 'exact', head: true }),
    s.from('intel_statutes').select('id', { count: 'exact', head: true }),
    s.from('intel_institutions').select('id', { count: 'exact', head: true }),
    s.from('intel_sources').select('id', { count: 'exact', head: true }),
    s.from('intel_credentials').select('id', { count: 'exact', head: true }),
    s.from('intel_employers').select('id', { count: 'exact', head: true }),
    s.from('intel_distances').select('id', { count: 'exact', head: true }),
    s.from('intel_review_queue').select('id', { count: 'exact', head: true }).eq('verification_status', 'flagged'),
    s.from('intel_completions').select('id', { count: 'exact', head: true }),
    s.from('intel_financial_aid').select('id', { count: 'exact', head: true }),
    s.from('intel_occupation_projections').select('id', { count: 'exact', head: true }),
    s.from('intel_occupation_skills').select('id', { count: 'exact', head: true }),
    s.from('intel_training_providers').select('id', { count: 'exact', head: true }),
    s.from('intel_apprenticeships').select('id', { count: 'exact', head: true }),
    s.from('intel_license_counts').select('id', { count: 'exact', head: true }),
  ]);

  return {
    wages: { count: wages.count ?? 0, verified_pct: 100 },
    statutes: { count: statutes.count ?? 0, verified_pct: 100 },
    institutions: { count: institutions.count ?? 0, verified_pct: 100 },
    sources: { count: sources.count ?? 0, verified_pct: 100 },
    credentials: { count: credentials.count ?? 0, verified_pct: 100 },
    employers: { count: employers.count ?? 0, verified_pct: 100 },
    distances: { count: distances.count ?? 0 },
    review_queue: { flagged: review.count ?? 0, total: 0 },
    completions: { count: completions.count ?? 0 },
    financial_aid: { count: financial_aid.count ?? 0 },
    projections: { count: projections.count ?? 0 },
    skills: { count: skills.count ?? 0 },
    training_providers: { count: training_providers.count ?? 0 },
    apprenticeships: { count: apprenticeships.count ?? 0 },
    license_counts: { count: license_counts.count ?? 0 },
  };
}

export async function getDataInventory() {
  const s = supabase();

  // Get counts + most recent updated_at for each table
  const tables = [
    { table: 'intel_institutions', label: 'Community Colleges', icon: '🏫', source: 'IPEDS 2022', sourceYear: '2022', category: 'credit' as const, description: 'Public 2-year institutions with enrollment, location, Pell rates' },
    { table: 'intel_completions', label: 'Program Completions', icon: '🎓', source: 'IPEDS 2021', sourceYear: '2021', category: 'credit' as const, description: 'Awards by CIP code, institution, and award level' },
    { table: 'intel_financial_aid', label: 'Financial Aid & Tuition', icon: '💳', source: 'College Scorecard', sourceYear: '2023', category: 'credit' as const, description: 'Pell grant rates, tuition, median earnings 10yr post-entry' },
    { table: 'intel_employers', label: 'Employers by Industry', icon: '🏢', source: 'Census CBP 2021', sourceYear: '2021', category: 'both' as const, description: 'Employer counts by NAICS industry by county' },
    { table: 'intel_occupation_projections', label: 'Job Projections (10yr)', icon: '📈', source: 'BLS Projections', sourceYear: '2022-2032', category: 'both' as const, description: '10-year growth, annual openings, education requirements' },
    { table: 'intel_wages', label: 'Occupation Wages', icon: '💰', source: 'BLS OES', sourceYear: '—', category: 'both' as const, description: 'Median/mean annual wages, percentiles, employment by SOC' },
    { table: 'intel_occupation_skills', label: 'Skills & Knowledge', icon: '🧠', source: 'O*NET', sourceYear: '—', category: 'both' as const, description: 'Skills, knowledge, abilities, technology per occupation' },
    { table: 'intel_statutes', label: 'State Statutes', icon: '📜', source: 'Manual + AI', sourceYear: '—', category: 'both' as const, description: 'State codes, admin rules, regulatory requirements' },
    { table: 'intel_credentials', label: 'Credentials & Licenses', icon: '📋', source: 'CareerOneStop / Manual', sourceYear: '—', category: 'noncredit' as const, description: 'License/cert requirements, CE hours, regulatory bodies' },
    { table: 'intel_training_providers', label: 'Training Providers', icon: '🏭', source: 'ETPL / FMCSA / Manual', sourceYear: '—', category: 'noncredit' as const, description: 'Noncredit providers: CDL schools, trade schools, bootcamps' },
    { table: 'intel_apprenticeships', label: 'Apprenticeships', icon: '🔧', source: 'DOL RAPIDS', sourceYear: '—', category: 'noncredit' as const, description: 'Registered apprenticeship programs, sponsors, completion data' },
    { table: 'intel_license_counts', label: 'Licensee Counts', icon: '🔢', source: 'State Boards', sourceYear: '—', category: 'noncredit' as const, description: 'Active licensees per occupation per state' },
    { table: 'intel_distances', label: 'Institution Distances', icon: '📏', source: 'Computed', sourceYear: '—', category: 'reference' as const, description: 'Driving distance/time between institutions' },
    { table: 'intel_sources', label: 'Clipped Sources', icon: '📰', source: 'Manual', sourceYear: '—', category: 'reference' as const, description: 'Research articles, gov reports, industry data you\'ve saved' },
  ];

  const results = await Promise.all(
    tables.map(async (t) => {
      const [countRes, latestRes] = await Promise.all([
        s.from(t.table).select('id', { count: 'exact', head: true }),
        s.from(t.table).select('updated_at').order('updated_at', { ascending: false }).limit(1),
      ]);
      return {
        ...t,
        count: countRes.count ?? 0,
        lastUpdated: latestRes.data?.[0]?.updated_at ?? null,
      };
    })
  );

  return results;
}
