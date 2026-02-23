/**
 * Agent Intelligence Context
 * 
 * One function that gathers ALL relevant verified intelligence for a project.
 * Every research agent calls this once, gets a formatted data block to inject into prompts.
 * 
 * New data sources automatically flow to all agents — no per-agent wiring needed.
 */

import { ValidationProject } from '@/lib/types/database';
import {
  getFullOccupationBrief,
  getServiceAreaEconomy,
  getInstitution,
  getInstitutionCompletions,
  getStateStatutes,
  getStateCredentials,
  getStatePriorities,
  isStatePriority,
  getFrameworks,
  getFrameworksForContext,
  getStateDemographics,
  getIndustryEmployment,
  getOccupationWages,
  generateCitationsSection,
  type LookupResult,
} from './lookup';
import { findSOCCode, isValidSOCCode } from '@/lib/mappings/soc-codes';

// ════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════

export interface AgentIntelligenceContext {
  /** Formatted text block to inject into any agent prompt */
  promptBlock: string;
  /** List of intel tables that had data (for citation generation) */
  tablesUsed: string[];
  /** Raw data objects (agents can use programmatically if needed) */
  raw: {
    occupation: Awaited<ReturnType<typeof getFullOccupationBrief>> | null;
    institution: LookupResult<any> | null;
    serviceArea: LookupResult<any> | null;
    completions: LookupResult<any> | null;
    statutes: LookupResult<any> | null;
    credentials: LookupResult<any> | null;
    statePriorities: LookupResult<any> | null;
    stateDemographics: LookupResult<any> | null;
    frameworks: LookupResult<any> | null;
  };
  /** Pre-formatted citations section for reports */
  citations: string;
}

// ════════════════════════════════════════════════════════
// STATE EXTRACTION
// ════════════════════════════════════════════════════════

const STATE_NAMES: Record<string, string> = {
  'alabama':'AL','alaska':'AK','arizona':'AZ','arkansas':'AR','california':'CA',
  'colorado':'CO','connecticut':'CT','delaware':'DE','florida':'FL','georgia':'GA',
  'hawaii':'HI','idaho':'ID','illinois':'IL','indiana':'IN','iowa':'IA',
  'kansas':'KS','kentucky':'KY','louisiana':'LA','maine':'ME','maryland':'MD',
  'massachusetts':'MA','michigan':'MI','minnesota':'MN','mississippi':'MS','missouri':'MO',
  'montana':'MT','nebraska':'NE','nevada':'NV','new hampshire':'NH','new jersey':'NJ',
  'new mexico':'NM','new york':'NY','north carolina':'NC','north dakota':'ND','ohio':'OH',
  'oklahoma':'OK','oregon':'OR','pennsylvania':'PA','rhode island':'RI','south carolina':'SC',
  'south dakota':'SD','tennessee':'TN','texas':'TX','utah':'UT','vermont':'VT',
  'virginia':'VA','washington':'WA','west virginia':'WV','wisconsin':'WI','wyoming':'WY',
  'district of columbia':'DC',
};

function extractStateCode(project: ValidationProject): string | null {
  const geo = (project as any).geographic_area || '';
  
  // Try 2-letter code
  const codeMatch = geo.match(/\b([A-Z]{2})\b/);
  if (codeMatch && Object.values(STATE_NAMES).includes(codeMatch[1])) return codeMatch[1];
  
  // Try full state name
  for (const [name, code] of Object.entries(STATE_NAMES)) {
    if (geo.toLowerCase().includes(name)) return code;
  }
  
  // Try institution state
  const instState = (project as any).institution_state;
  if (instState && instState.length === 2) return instState.toUpperCase();
  
  return null;
}

function extractSOCCode(project: ValidationProject): string | null {
  // Check explicit SOC code
  const explicit = (project as any).soc_codes;
  if (explicit && isValidSOCCode(explicit)) return explicit;
  
  // Try to find from program name
  const occupation = (project as any).target_occupation || 
    project.program_name.replace(/\s*(certificate|diploma|degree|program|associate|bachelor|training|course)/gi, '').trim();
  
  const mapped = findSOCCode(occupation);
  if (mapped) return mapped.code;
  
  return null;
}

// ════════════════════════════════════════════════════════
// MAIN FUNCTION
// ════════════════════════════════════════════════════════

/**
 * Gather all verified intelligence relevant to a project.
 * Call once per validation run, share the result across all agents.
 * 
 * @param project The validation project
 * @param options Optional: limit which data to fetch
 */
export async function getAgentIntelligenceContext(
  project: ValidationProject,
  options?: {
    skipFrameworks?: boolean;
    skipServiceArea?: boolean;
    skipRegulatory?: boolean;
    frameworkKeywords?: string[];
  }
): Promise<AgentIntelligenceContext> {
  const startTime = Date.now();
  const stateCode = extractStateCode(project);
  const socCode = extractSOCCode(project);
  const tablesUsed: string[] = [];
  const parts: string[] = [];
  
  console.log(`[Intelligence Context] Building for "${project.program_name}" | SOC: ${socCode || 'none'} | State: ${stateCode || 'none'}`);

  // Initialize raw results
  const raw: AgentIntelligenceContext['raw'] = {
    occupation: null,
    institution: null,
    serviceArea: null,
    completions: null,
    statutes: null,
    credentials: null,
    statePriorities: null,
    stateDemographics: null,
    frameworks: null,
  };

  parts.push('');
  parts.push('═══════════════════════════════════════════════════════════');
  parts.push('VERIFIED INTELLIGENCE LAYER');
  parts.push('The following data comes from government and verified sources.');
  parts.push('ALWAYS cite these sources when using this data in your analysis.');
  parts.push('If data is not available below, use web search as a fallback.');
  parts.push('═══════════════════════════════════════════════════════════');

  // ── 1. Occupation Intelligence ───────────────────────
  if (socCode) {
    try {
      raw.occupation = await getFullOccupationBrief(socCode, stateCode || undefined);
      const occ = raw.occupation;

      if (occ.wages) {
        const w = occ.wages;
        parts.push('');
        parts.push(`📊 VERIFIED WAGES — ${w.geo_name} (BLS OES ${w.bls_release}):`);
        parts.push(`  Occupation: ${w.occupation_title} (SOC ${w.soc_code})`);
        parts.push(`  Median Annual: $${w.median_annual?.toLocaleString() || 'N/A'}`);
        parts.push(`  Mean Annual: $${w.mean_annual?.toLocaleString() || 'N/A'}`);
        parts.push(`  10th: $${w.pct_10?.toLocaleString() || 'N/A'} | 25th: $${w.pct_25?.toLocaleString() || 'N/A'} | 75th: $${w.pct_75?.toLocaleString() || 'N/A'} | 90th: $${w.pct_90?.toLocaleString() || 'N/A'}`);
        if (w.employment) parts.push(`  Employment: ${w.employment.toLocaleString()}`);
        tablesUsed.push('intel_wages');
      }

      if (occ.projections) {
        const p = occ.projections;
        parts.push('');
        parts.push(`📈 VERIFIED PROJECTIONS — ${p.geo_code} (${p.base_year}-${p.projected_year}):`);
        parts.push(`  Base Employment: ${p.employment_base?.toLocaleString() || 'N/A'}`);
        parts.push(`  Projected: ${p.employment_projected?.toLocaleString() || 'N/A'}`);
        parts.push(`  Change: ${p.change_number?.toLocaleString() || 'N/A'} (${p.change_percent}%) — ${p.growth_category}`);
        parts.push(`  Annual Openings: ${p.annual_openings?.toLocaleString() || 'N/A'}`);
        tablesUsed.push('intel_occupation_projections');
      }

      if (occ.skills && occ.skills.length > 0) {
        const skills = occ.skills.filter((s: any) => s.skill_type === 'skill').slice(0, 5);
        const knowledge = occ.skills.filter((s: any) => s.skill_type === 'knowledge').slice(0, 5);
        const tech = occ.skills.filter((s: any) => s.skill_type === 'technology').slice(0, 5);
        parts.push('');
        parts.push('🧠 VERIFIED SKILLS & KNOWLEDGE (O*NET v30.1):');
        if (skills.length) parts.push(`  Skills: ${skills.map((s: any) => s.skill_name).join(', ')}`);
        if (knowledge.length) parts.push(`  Knowledge: ${knowledge.map((s: any) => s.skill_name).join(', ')}`);
        if (tech.length) parts.push(`  Technology: ${tech.map((s: any) => s.skill_name).join(', ')}`);
        tablesUsed.push('intel_occupation_skills');
      }

      if (occ.h1bDemand && occ.h1bDemand.length > 0) {
        const h = occ.h1bDemand[0] as any;
        parts.push('');
        parts.push('🛂 H-1B VISA DEMAND (DOL, FY2025 Q4):');
        parts.push(`  Applications: ${h.total_applications?.toLocaleString()} | Certified: ${h.total_certified?.toLocaleString()}`);
        if (h.avg_wage) parts.push(`  Avg Wage on Applications: $${h.avg_wage.toLocaleString()}`);
        if (h.unique_employers) parts.push(`  Unique Employers Filing: ${h.unique_employers}`);
        tablesUsed.push('intel_h1b_demand');
      }

      if (occ.statePriority.isPriority) {
        parts.push('');
        parts.push(`🏛️ STATE PRIORITY STATUS — ${stateCode}:`);
        parts.push(`  ✅ ON the state in-demand occupation list`);
        parts.push(`  WIOA Fundable: ${occ.statePriority.wioaFundable ? 'YES' : 'No'}`);
        parts.push(`  Scholarship Eligible: ${occ.statePriority.scholarshipEligible ? 'YES' : 'No'}`);
        tablesUsed.push('intel_state_priorities');
      } else if (stateCode) {
        parts.push('');
        parts.push(`🏛️ STATE PRIORITY STATUS — ${stateCode}:`);
        parts.push('  ⚠️ NOT on the state in-demand occupation list (check manually — data may be incomplete)');
      }

      if (occ.wageGap) {
        const g = occ.wageGap;
        parts.push('');
        parts.push('⚠️ FACULTY WAGE GAP:');
        parts.push(`  Industry: $${g.industryWage.median_annual?.toLocaleString()} (${g.industryWage.occupation_title})`);
        parts.push(`  Instructor: $${g.facultyWage.median_annual?.toLocaleString()} (${g.facultyWage.occupation_title})`);
        parts.push(`  Gap: $${g.gap.toLocaleString()} (${g.gapPercent}%) — ${g.industryPaysMore ? 'industry pays MORE (faculty recruitment risk)' : 'teaching pays MORE (recruitment advantage)'}`);
      }
    } catch (err) {
      console.warn('[Intelligence Context] Occupation lookup failed:', (err as Error).message);
    }
  }

  // ── 2. Institution & Service Area ────────────────────
  if (!options?.skipServiceArea) {
    try {
      raw.institution = await getInstitution(project.client_name);
      if (raw.institution.found && raw.institution.data) {
        const inst = raw.institution.data;
        parts.push('');
        parts.push(`🏫 INSTITUTION — ${inst.name} (IPEDS ${inst.ipeds_id || 'N/A'}):`);
        parts.push(`  Location: ${inst.city}, ${inst.state}`);
        if (inst.total_enrollment) parts.push(`  Total Enrollment: ${inst.total_enrollment.toLocaleString()}`);
        if (inst.credit_enrollment) parts.push(`  Credit: ${inst.credit_enrollment.toLocaleString()}`);
        if (inst.noncredit_enrollment) parts.push(`  Noncredit: ${inst.noncredit_enrollment.toLocaleString()}`);
        tablesUsed.push('intel_institutions');

        // Service area economy
        const econ = await getServiceAreaEconomy(inst.id);
        raw.serviceArea = econ;
        if (econ.found && econ.data) {
          const d = econ.data;
          parts.push('');
          parts.push(`🌐 SERVICE AREA ECONOMY (${d.counties.length} counties, Census CBP 2022 + ACS 2023):`);
          parts.push(`  Population: ${d.totalPopulation.toLocaleString()}`);
          parts.push(`  Establishments: ${d.totalEstablishments.toLocaleString()} | Employees: ${d.totalEmployees.toLocaleString()}`);
          if (d.avgMedianIncome) parts.push(`  Avg Median Income: $${d.avgMedianIncome.toLocaleString()}`);
          if (d.avgPovertyRate) parts.push(`  Avg Poverty Rate: ${d.avgPovertyRate}%`);
          if (d.avgBachelorsRate) parts.push(`  Avg Bachelor's+: ${d.avgBachelorsRate}%`);
          if (d.avgUnemployment) parts.push(`  Avg Unemployment: ${d.avgUnemployment}%`);
          parts.push('  Top Industries:');
          for (const ind of d.topIndustries.slice(0, 6)) {
            const pct = d.totalEmployees > 0 ? Math.round((ind.employees / d.totalEmployees) * 100) : 0;
            parts.push(`    ${ind.naics} ${ind.name}: ${ind.employees.toLocaleString()} (${pct}%)`);
          }
          tablesUsed.push('intel_employers', 'intel_county_demographics', 'intel_service_areas');
        }

        // Completions
        const comp = await getInstitutionCompletions(inst.id);
        raw.completions = comp;
        if (comp.found && comp.data && comp.data.length > 0) {
          parts.push('');
          parts.push(`🎓 PROGRAM COMPLETIONS (IPEDS 2021, top 10):`);
          for (const c of comp.data.slice(0, 10)) {
            parts.push(`  ${(c as any).cip_code} ${(c as any).program_name || '—'}: ${(c as any).total_completions} completions`);
          }
          tablesUsed.push('intel_completions');
        }
      }
    } catch (err) {
      console.warn('[Intelligence Context] Institution/service area lookup failed:', (err as Error).message);
    }
  }

  // ── 3. Regulatory Intelligence ───────────────────────
  if (!options?.skipRegulatory && stateCode) {
    try {
      const occupation = (project as any).target_occupation || project.program_name;
      
      const statutes = await getStateStatutes(stateCode, occupation);
      raw.statutes = statutes;
      if (statutes.found && statutes.data && statutes.data.length > 0) {
        parts.push('');
        parts.push(`📜 STATE STATUTES — ${stateCode}:`);
        for (const s of statutes.data.slice(0, 5)) {
          parts.push(`  • ${(s as any).code_chapter}: ${(s as any).title} (${(s as any).regulatory_body || 'N/A'})`);
        }
        tablesUsed.push('intel_statutes');
      }

      const creds = await getStateCredentials(stateCode, occupation);
      raw.credentials = creds;
      if (creds.found && creds.data && creds.data.length > 0) {
        parts.push('');
        parts.push(`📋 CREDENTIAL REQUIREMENTS — ${stateCode}:`);
        for (const c of creds.data.slice(0, 5)) {
          parts.push(`  • ${(c as any).credential_name}: ${(c as any).required_hours || '?'} hrs, Exam: ${(c as any).exam_required ? 'Yes' : 'No'}, Body: ${(c as any).regulatory_body || 'N/A'}`);
        }
        tablesUsed.push('intel_credentials');
      }
    } catch (err) {
      console.warn('[Intelligence Context] Regulatory lookup failed:', (err as Error).message);
    }
  }

  // ── 4. State Demographics ────────────────────────────
  if (stateCode) {
    try {
      const demos = await getStateDemographics(stateCode);
      raw.stateDemographics = demos;
      // Only include if we didn't already get service area data
      if (demos.found && !raw.serviceArea?.found) {
        parts.push('');
        parts.push(`📊 STATE DEMOGRAPHICS — ${stateCode} (Census ACS 2023):`);
        parts.push(`  Population: ${demos.data!.totalPopulation.toLocaleString()} across ${demos.data!.countyCount} counties`);
        parts.push(`  Avg Median Income: $${demos.data!.avgMedianIncome.toLocaleString()}`);
        parts.push(`  Avg Poverty: ${demos.data!.avgPovertyRate}% | Bachelor's+: ${demos.data!.avgBachelorsRate}% | Unemployment: ${demos.data!.avgUnemployment}%`);
        tablesUsed.push('intel_county_demographics');
      }
    } catch (err) {
      // Non-critical, skip silently
    }
  }

  // ── 5. Frameworks ────────────────────────────────────
  if (!options?.skipFrameworks) {
    try {
      const keywords = options?.frameworkKeywords || [
        project.program_name,
        (project as any).program_type || '',
        'workforce', 'program design'
      ].filter(Boolean);

      const fw = await getFrameworksForContext(keywords);
      raw.frameworks = fw;
      if (fw.found && fw.data && fw.data.length > 0) {
        parts.push('');
        parts.push('📚 RELEVANT FRAMEWORKS & BEST PRACTICES:');
        for (const f of fw.data.slice(0, 3)) {
          parts.push(`  • ${f.short_name || f.framework_name} (${f.organization})`);
          parts.push(`    ${(f.when_to_use || f.summary || '').slice(0, 150)}...`);
          if (f.key_principles?.length) {
            parts.push(`    Key principles: ${f.key_principles.slice(0, 3).join('; ')}`);
          }
        }
        tablesUsed.push('intel_frameworks');
      }
    } catch (err) {
      // Non-critical
    }
  }

  // ── Build Citations ──────────────────────────────────
  const uniqueTables = [...new Set(tablesUsed)];
  let citations = '';
  if (uniqueTables.length > 0) {
    try {
      citations = await generateCitationsSection(uniqueTables);
    } catch {
      citations = '';
    }
  }

  if (uniqueTables.length > 0) {
    parts.push('');
    parts.push('═══════════════════════════════════════════════════════════');
    parts.push(`Verified data from ${uniqueTables.length} government/institutional sources.`);
    parts.push('Cite these sources in your analysis. Supplement with web search for gaps.');
    parts.push('═══════════════════════════════════════════════════════════');
  } else {
    parts.push('');
    parts.push('⚠️ No verified intelligence data matched this project.');
    parts.push('Use web search as your primary data source.');
  }

  const elapsed = Date.now() - startTime;
  console.log(`[Intelligence Context] Built in ${elapsed}ms — ${uniqueTables.length} tables, ${parts.length} lines`);

  return {
    promptBlock: parts.join('\n'),
    tablesUsed: uniqueTables,
    raw,
    citations,
  };
}

/**
 * Lightweight version — just occupation data, no institution/service area.
 * Use for discovery-stage agents that don't have a specific institution context.
 */
export async function getOccupationContext(
  programName: string,
  socCode?: string,
  stateCode?: string,
): Promise<{ promptBlock: string; tablesUsed: string[] }> {
  const resolvedSoc = socCode || findSOCCode(programName)?.code;
  if (!resolvedSoc) {
    return { promptBlock: '\n⚠️ No SOC code resolved — no verified occupation data available.\n', tablesUsed: [] };
  }

  const brief = await getFullOccupationBrief(resolvedSoc, stateCode);
  const parts: string[] = [];
  const tablesUsed: string[] = [];

  if (brief.wages) {
    const w = brief.wages;
    parts.push(`📊 Wages (${w.geo_name}, BLS OES ${w.bls_release}): Median $${w.median_annual?.toLocaleString()} | Employment: ${w.employment?.toLocaleString()}`);
    tablesUsed.push('intel_wages');
  }
  if (brief.projections) {
    const p = brief.projections;
    parts.push(`📈 Projections (${p.geo_code}, ${p.base_year}-${p.projected_year}): ${p.change_percent}% growth, ${p.annual_openings?.toLocaleString()} annual openings`);
    tablesUsed.push('intel_occupation_projections');
  }
  if (brief.statePriority.isPriority) {
    parts.push(`🏛️ State Priority: YES — WIOA Fundable: ${brief.statePriority.wioaFundable ? 'Yes' : 'No'}`);
    tablesUsed.push('intel_state_priorities');
  }

  return {
    promptBlock: parts.length > 0 ? '\nVERIFIED DATA:\n' + parts.join('\n') + '\n' : '',
    tablesUsed,
  };
}
