/**
 * project-intel.ts
 *
 * Direct intelligence layer — bypasses MCP HTTP loopback.
 *
 * The MCP server (app/api/mcp/) still exists for EXTERNAL clients
 * (Claude Desktop, third-party integrations). This module gives
 * internal agents the same data via direct Supabase queries
 * through lookup.ts, eliminating 8 HTTP roundtrips per pipeline run.
 *
 * Drop-in replacement for the public API of mcp-client.ts.
 */

import {
  getFullOccupationBrief,
  getOccupationWages,
  getOccupationProjections,
  getOccupationSkills,
  isStatePriority,
  getH1BDemand,
  getIndustryEmployment,
  generateCitationsSection,
} from './lookup';

// ── Re-export the OccupationIntel type so callers don't break ───────────────

export interface OccupationIntel {
  wages: string;
  projections: string;
  skills: string;
  statePriority: string;
  employers: string;
  h1bDemand: string;
}

// ── Structured intel returned alongside formatted text ──────────────────────

export interface StructuredProjectIntel {
  available: boolean;
  /** Formatted text blocks ready to inject into prompts */
  text: OccupationIntel;
  /** Structured data for programmatic use / Claude tool_use */
  data: {
    wages: any | null;
    projections: any | null;
    skills: any[] | null;
    statePriority: { isPriority: boolean; scholarshipEligible: boolean; wioaFundable: boolean; data: any | null };
    h1bDemand: any[] | null;
    wageGap: any | null;
  };
  citations: string;
}

// ── State code helpers (moved from mcp-client.ts) ───────────────────────────

const STATE_ABBR: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO',
  Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
  Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI',
  'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT',
  Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
};

const STATE_FIPS: Record<string, string> = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06', CO: '08', CT: '09', DE: '10',
  FL: '12', GA: '13', HI: '15', ID: '16', IL: '17', IN: '18', IA: '19', KS: '20',
  KY: '21', LA: '22', ME: '23', MD: '24', MA: '25', MI: '26', MN: '27', MS: '28',
  MO: '29', MT: '30', NE: '31', NV: '32', NH: '33', NJ: '34', NM: '35', NY: '36',
  NC: '37', ND: '38', OH: '39', OK: '40', OR: '41', PA: '42', RI: '44', SC: '45',
  SD: '46', TN: '47', TX: '48', UT: '49', VT: '50', VA: '51', WA: '53',
  WV: '54', WI: '55', WY: '56',
};

export function extractStateFromLocation(location: string): { abbr: string; fips: string } {
  if (!location) return { abbr: '', fips: '' };
  for (const [name, abbr] of Object.entries(STATE_ABBR)) {
    if (location.includes(name)) {
      return { abbr, fips: STATE_FIPS[abbr] ?? '' };
    }
  }
  const abbrMatch = location.match(/\b([A-Z]{2})\b/);
  if (abbrMatch && STATE_FIPS[abbrMatch[1]]) {
    return { abbr: abbrMatch[1], fips: STATE_FIPS[abbrMatch[1]] };
  }
  return { abbr: '', fips: '' };
}

// ── Formatting helpers ──────────────────────────────────────────────────────

function formatNumber(value: number | null | undefined): string {
  if (typeof value !== 'number') return 'N/A';
  return value.toLocaleString('en-US');
}

function formatCurrency(value: number | null | undefined): string {
  if (typeof value !== 'number') return 'N/A';
  return `$${value.toLocaleString('en-US')}`;
}

function formatPercent(value: number | null | undefined): string {
  if (typeof value !== 'number') return 'N/A';
  return `${value.toFixed(1)}%`;
}

function formatWageData(wage: any): string {
  if (!wage) return '';
  return [
    `Wage data for ${wage.occupation_title} (SOC ${wage.soc_code})`,
    `Geography: ${wage.geo_name} (${wage.geo_level})`,
    `Median annual wage: ${formatCurrency(wage.median_annual)}`,
    `Mean annual wage: ${formatCurrency(wage.mean_annual)}`,
    `Employment: ${formatNumber(wage.employment)}`,
    `Percentiles: 10th ${formatCurrency(wage.pct_10)} | 25th ${formatCurrency(wage.pct_25)} | 75th ${formatCurrency(wage.pct_75)} | 90th ${formatCurrency(wage.pct_90)}`,
    wage.bls_release ? `Release: ${wage.bls_release}` : '',
  ].filter(Boolean).join('\n');
}

function formatProjectionData(projection: any): string {
  if (!projection) return '';
  return [
    `Employment projections for ${projection.occupation_title} (SOC ${projection.soc_code})`,
    `Geography: ${projection.geo_code}`,
    `Base year ${projection.base_year}: ${formatNumber(projection.employment_base)} jobs`,
    `Projected year ${projection.projected_year}: ${formatNumber(projection.employment_projected)} jobs`,
    `Change: ${formatNumber(projection.change_number)} (${formatPercent(projection.change_percent)})`,
    `Annual openings: ${formatNumber(projection.annual_openings)}`,
    `Growth category: ${projection.growth_category ?? 'N/A'}`,
  ].join('\n');
}

function formatSkillsData(skills: any[]): string {
  if (!skills?.length) return '';
  const lines = skills.slice(0, 15).map((skill: any) =>
    `- ${skill.skill_name} (${skill.skill_type}) | importance ${skill.importance ?? 'N/A'} | level ${skill.level ?? 'N/A'}`,
  );
  return [`Top skills for SOC ${skills[0].soc_code}:`, ...lines].join('\n');
}

function formatStatePriorityData(priority: { isPriority: boolean; data: any | null }): string {
  if (!priority.isPriority || !priority.data) return '';
  const d = priority.data;
  return [
    `${d.occupation_title} (SOC ${d.soc_code}) is on ${d.state} priority lists.`,
    `Priority level: ${d.priority_level}`,
    `Scholarship eligible: ${d.scholarship_eligible ? 'Yes' : 'No'}`,
    `WIOA fundable: ${d.wioa_fundable ? 'Yes' : 'No'}`,
    `Sector: ${d.sector ?? 'N/A'}`,
    `Effective year: ${d.effective_year}`,
    `Source: ${d.designation_source}`,
  ].join('\n');
}

function formatH1BData(records: any[]): string {
  if (!records?.length) return '';
  const lines = records.slice(0, 10).map((row: any) =>
    `- ${row.state}: applications ${formatNumber(row.total_applications)}, certified ${formatNumber(row.total_certified)}, employers ${formatNumber(row.unique_employers)}, median wage ${formatCurrency(row.median_wage)}`,
  );
  return [`H-1B demand:`, ...lines].join('\n');
}

function formatEmployerData(records: any[]): string {
  if (!records?.length) return '';
  const lines = records.slice(0, 10).map((row: any, i: number) =>
    `${i + 1}. ${row.name} (${row.naics}) | Employees: ${formatNumber(row.employees)}`,
  );
  return [`Regional employers:`, ...lines].join('\n');
}

// ── Main API (drop-in replacement for mcp-client.ts) ────────────────────────

/**
 * Fetch all intel for a project — call this ONCE in the orchestrator.
 * Direct Supabase queries via lookup.ts — no HTTP loopback.
 *
 * Returns both formatted text (for prompt injection) and structured data
 * (for programmatic use and future Claude tool_use).
 */
export async function getProjectIntel(project: {
  soc_codes?: string | null;
  onet_codes?: string | null;
  geographic_area?: string | null;
}): Promise<StructuredProjectIntel> {
  const soc = project.soc_codes?.trim() || '';
  const location = project.geographic_area || '';
  const { abbr } = extractStateFromLocation(location);

  if (!soc) {
    console.log('[Intel] No SOC code — skipping intel fetch');
    return emptyIntel();
  }

  console.log(`[Intel] Fetching intel for SOC ${soc} | State ${abbr || 'national'} (direct lookup)`);

  try {
    // Single call → parallel Supabase queries (vs 8 sequential HTTP calls before)
    const brief = await getFullOccupationBrief(soc, abbr || undefined);

    const text: OccupationIntel = {
      wages: formatWageData(brief.wages),
      projections: formatProjectionData(brief.projections),
      skills: formatSkillsData(brief.skills || []),
      statePriority: formatStatePriorityData(brief.statePriority),
      h1bDemand: formatH1BData(brief.h1bDemand || []),
      employers: '',  // employers come from a different query path
    };

    // Fetch employer/industry data separately (not in getFullOccupationBrief)
    if (abbr) {
      try {
        const employerResult = await getIndustryEmployment(abbr);
        if (employerResult.found && employerResult.data) {
          text.employers = formatEmployerData(employerResult.data);
        }
      } catch {
        // Non-fatal — employers are supplementary
      }
    }

    const available = !!(brief.wages || brief.projections);
    console.log(`[Intel] ✓ Intel loaded (direct) — wages: ${!!brief.wages}, projections: ${!!brief.projections}, skills: ${!!brief.skills}, priority: ${brief.statePriority.isPriority}`);

    return {
      available,
      text,
      data: {
        wages: brief.wages,
        projections: brief.projections,
        skills: brief.skills,
        statePriority: brief.statePriority,
        h1bDemand: brief.h1bDemand,
        wageGap: brief.wageGap,
      },
      citations: brief.citations,
    };
  } catch (err) {
    console.warn('[Intel] Intel fetch failed (non-fatal):', (err as Error).message);
    return emptyIntel();
  }
}

/**
 * Backward-compatible wrapper — returns the old OccupationIntel & { available } shape
 * so existing orchestrator code works without changes during migration.
 */
export async function getProjectIntelCompat(project: {
  soc_codes?: string | null;
  onet_codes?: string | null;
  geographic_area?: string | null;
}): Promise<OccupationIntel & { available: boolean }> {
  const intel = await getProjectIntel(project);
  return { ...intel.text, available: intel.available };
}

/**
 * Format intel as a prompt block for agent injection.
 * Returns empty string if no data available.
 */
export function formatIntelBlock(intel: OccupationIntel | StructuredProjectIntel): string {
  const text = 'text' in intel ? intel.text : intel;

  if (!text.wages && !text.projections && !text.statePriority) return '';

  const lines: string[] = [
    '═══════════════════════════════════════════════════════════',
    'VERIFIED INTELLIGENCE DATABASE (government sources — treat as confirmed baselines):',
    '═══════════════════════════════════════════════════════════',
  ];
  if (text.wages) { lines.push('WAGE DATA (BLS OES):'); lines.push(text.wages); lines.push(''); }
  if (text.projections) { lines.push('EMPLOYMENT PROJECTIONS:'); lines.push(text.projections); lines.push(''); }
  if (text.statePriority) { lines.push('STATE PRIORITY / WIOA STATUS:'); lines.push(text.statePriority); lines.push(''); }
  if (text.skills) { lines.push('O*NET VERIFIED SKILLS:'); lines.push(text.skills); lines.push(''); }
  if (text.employers) { lines.push('REGIONAL EMPLOYERS (Census CBP):'); lines.push(text.employers); lines.push(''); }
  lines.push('═══════════════════════════════════════════════════════════');
  return lines.join('\n');
}

function emptyIntel(): StructuredProjectIntel {
  return {
    available: false,
    text: { wages: '', projections: '', skills: '', statePriority: '', employers: '', h1bDemand: '' },
    data: {
      wages: null, projections: null, skills: null,
      statePriority: { isPriority: false, scholarshipEligible: false, wioaFundable: false, data: null },
      h1bDemand: null, wageGap: null,
    },
    citations: '',
  };
}
