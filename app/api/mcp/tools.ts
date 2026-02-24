import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import {
  getCountyDemographics,
  getFrameworks,
  getH1BDemand,
  getInstitution,
  getOccupationProjections,
  getOccupationSkills,
  getOccupationWages,
  isStatePriority,
  type LookupResult,
} from '@/lib/intelligence/lookup';

type JsonRecord = Record<string, unknown>;

type ToolContent = {
  content: Array<{ type: 'text'; text: string }>;
};

interface EmployerRow {
  employer_name: string | null;
  city: string | null;
  state: string | null;
  naics_code: string | null;
  industry: string | null;
  estimated_employees: number | null;
  key_occupations: string[] | null;
  is_hiring: boolean | null;
}

interface CompletionRow {
  cip_code: string | null;
  program_title: string | null;
  institution_name: string | null;
  institution_id: string | null;
  award_level: string | null;
  total_completions: number | null;
  state: string | null;
  institution_state: string | null;
  year: number | null;
}

interface OccupationSearchRow {
  soc_code: string;
  occupation_title: string;
}

function text(content: string): ToolContent {
  return { content: [{ type: 'text', text: content }] };
}

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

function normalizeOccupationCode(code: string): string {
  return code.trim().replace(/\.\d+$/, '');
}

function lookupFooter<T>(result: LookupResult<T>): string {
  const parts: string[] = [];
  if (result.citation) parts.push(`Source: ${result.citation}`);
  if (result.freshness.period) parts.push(`Data period: ${result.freshness.period}`);
  if (result.freshness.lastRefreshed) parts.push(`Last refreshed: ${result.freshness.lastRefreshed}`);
  if (result.sourceUrl) parts.push(`URL: ${result.sourceUrl}`);
  return parts.length ? `\n\n${parts.join(' | ')}` : '';
}

function noDataMessage(message: string): ToolContent {
  return text(message);
}

async function fetchEmployers(stateFips: string, naicsPrefix?: string): Promise<EmployerRow[]> {
  let query = getSupabaseServerClient()
    .from('intel_employers')
    .select('employer_name, city, state, naics_code, industry, estimated_employees, key_occupations, is_hiring')
    .eq('state', stateFips.toUpperCase())
    .order('estimated_employees', { ascending: false })
    .limit(25);

  if (naicsPrefix) {
    query = query.like('naics_code', `${naicsPrefix}%`);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as EmployerRow[];
}

async function fetchCompletions(cipCode: string, stateFips?: string): Promise<CompletionRow[]> {
  const { data, error } = await getSupabaseServerClient()
    .from('intel_completions')
    .select('cip_code, program_title, institution_name, institution_id, award_level, total_completions, state, institution_state, year')
    .eq('cip_code', cipCode)
    .order('total_completions', { ascending: false })
    .limit(50);

  if (error || !data) return [];

  const rows = data as CompletionRow[];
  if (!stateFips) return rows;

  const target = stateFips.toUpperCase();
  return rows.filter((row) => row.state === target || row.institution_state === target);
}

async function searchOccupations(keyword: string): Promise<OccupationSearchRow[]> {
  const safeKeyword = keyword.trim().replace(/[,%]/g, '');
  if (!safeKeyword) return [];

  const { data, error } = await getSupabaseServerClient()
    .from('intel_wages')
    .select('soc_code, occupation_title')
    .or(`occupation_title.ilike.%${safeKeyword}%,soc_code.ilike.%${safeKeyword}%`)
    .limit(100);

  if (error || !data) return [];

  const unique = new Map<string, OccupationSearchRow>();
  for (const row of data as OccupationSearchRow[]) {
    if (!unique.has(row.soc_code)) {
      unique.set(row.soc_code, row);
    }
  }

  return Array.from(unique.values()).slice(0, 20);
}

export function registerMcpTools(server: McpServer): void {
  server.registerTool(
    'get_wages',
    {
      description: 'Returns BLS OES wage levels for an occupation, nationally or by state.',
      inputSchema: {
        socCode: z.string().describe('SOC occupation code, for example 29-2052.'),
        stateCode: z.string().optional().describe('Optional two-letter state code, for example IA.'),
      },
    },
    async ({ socCode, stateCode }) => {
      try {
        const normalizedSoc = normalizeOccupationCode(socCode);
        const result = await getOccupationWages(normalizedSoc, stateCode);
        if (!result.found || !result.data) {
          return noDataMessage(`No wage data found for SOC ${normalizedSoc}${stateCode ? ` in ${stateCode.toUpperCase()}` : ''}. Try a broader search.`);
        }

        const wage = result.data;
        return text(
          [
            `Wage data for ${wage.occupation_title} (SOC ${wage.soc_code})`,
            `Geography: ${wage.geo_name} (${wage.geo_level})`,
            `Median annual wage: ${formatCurrency(wage.median_annual)}`,
            `Mean annual wage: ${formatCurrency(wage.mean_annual)}`,
            `Employment: ${formatNumber(wage.employment)}`,
            `Percentiles: 10th ${formatCurrency(wage.pct_10)} | 25th ${formatCurrency(wage.pct_25)} | 75th ${formatCurrency(wage.pct_75)} | 90th ${formatCurrency(wage.pct_90)}`,
            `Release: ${wage.bls_release}`,
          ].join('\n') + lookupFooter(result),
        );
      } catch {
        return noDataMessage('Unable to retrieve wage data right now.');
      }
    },
  );

  server.registerTool(
    'get_projections',
    {
      description: 'Returns occupation employment projections including growth and annual openings.',
      inputSchema: {
        socCode: z.string().describe('SOC occupation code, for example 29-2052.'),
        stateFips: z.string().optional().describe('Optional state code for the projection geography.'),
      },
    },
    async ({ socCode, stateFips }) => {
      try {
        const normalizedSoc = normalizeOccupationCode(socCode);
        const result = await getOccupationProjections(normalizedSoc, stateFips);
        if (!result.found || !result.data) {
          return noDataMessage(`No projection data found for SOC ${normalizedSoc}${stateFips ? ` in ${stateFips}` : ''}. Try another code or remove the state filter.`);
        }

        const projection = result.data;
        return text(
          [
            `Employment projections for ${projection.occupation_title} (SOC ${projection.soc_code})`,
            `Geography: ${projection.geo_code}`,
            `Base year ${projection.base_year}: ${formatNumber(projection.employment_base)} jobs`,
            `Projected year ${projection.projected_year}: ${formatNumber(projection.employment_projected)} jobs`,
            `Change: ${formatNumber(projection.change_number)} (${formatPercent(projection.change_percent)})`,
            `Annual openings: ${formatNumber(projection.annual_openings)}`,
            `Growth category: ${projection.growth_category ?? 'N/A'}`,
          ].join('\n') + lookupFooter(result),
        );
      } catch {
        return noDataMessage('Unable to retrieve projection data right now.');
      }
    },
  );

  server.registerTool(
    'get_skills',
    {
      description: 'Returns top O*NET skills, knowledge, abilities, and technology signals for an occupation code.',
      inputSchema: {
        onetCode: z.string().describe('O*NET-SOC/SOC code, for example 29-2052.00 or 29-2052.'),
      },
    },
    async ({ onetCode }) => {
      try {
        const socCode = normalizeOccupationCode(onetCode);
        const result = await getOccupationSkills(socCode, ['skill', 'knowledge', 'ability', 'technology', 'tool'], 10);
        if (!result.found || !result.data?.length) {
          return noDataMessage(`No skills data found for occupation code ${onetCode}. Try searching occupations first.`);
        }

        const lines = result.data.slice(0, 15).map((skill) =>
          `- ${skill.skill_name} (${skill.skill_type}) | importance ${skill.importance ?? 'N/A'} | level ${skill.level ?? 'N/A'}`,
        );

        return text(
          [`Top skills for SOC ${socCode}:`, ...lines].join('\n') + lookupFooter(result),
        );
      } catch {
        return noDataMessage('Unable to retrieve occupation skills right now.');
      }
    },
  );

  server.registerTool(
    'get_employers',
    {
      description: 'Returns major employers in a state, optionally filtered by NAICS prefix.',
      inputSchema: {
        stateFips: z.string().describe('State code used in employer data (for example IA).'),
        naicsPrefix: z.string().optional().describe('Optional NAICS prefix filter, for example 62 for healthcare.'),
      },
    },
    async ({ stateFips, naicsPrefix }) => {
      try {
        const rows = await fetchEmployers(stateFips, naicsPrefix);
        if (!rows.length) {
          return noDataMessage(`No employer records found for ${stateFips.toUpperCase()}${naicsPrefix ? ` with NAICS prefix ${naicsPrefix}` : ''}.`);
        }

        const lines = rows.slice(0, 15).map((row, index) => {
          const occupations = row.key_occupations?.slice(0, 3).join(', ') || 'N/A';
          return `${index + 1}. ${row.employer_name ?? 'Unknown employer'} (${row.city ?? 'Unknown city'}, ${row.state ?? stateFips.toUpperCase()}) | NAICS ${row.naics_code ?? 'N/A'} | Employees ${formatNumber(row.estimated_employees)} | Hiring: ${row.is_hiring ? 'Yes' : 'No'} | Occupations: ${occupations}`;
        });

        return text([
          `Top employers for ${stateFips.toUpperCase()}${naicsPrefix ? ` (NAICS ${naicsPrefix}*)` : ''}:`,
          ...lines,
        ].join('\n'));
      } catch {
        return noDataMessage('Unable to retrieve employer data right now.');
      }
    },
  );

  server.registerTool(
    'get_completions',
    {
      description: 'Returns IPEDS completions by CIP code, optionally filtered to a state.',
      inputSchema: {
        cipCode: z.string().describe('CIP code, for example 51.0805.'),
        stateFips: z.string().optional().describe('Optional state code, for example IA.'),
      },
    },
    async ({ cipCode, stateFips }) => {
      try {
        const rows = await fetchCompletions(cipCode, stateFips);
        if (!rows.length) {
          return noDataMessage(`No completions found for CIP ${cipCode}${stateFips ? ` in ${stateFips.toUpperCase()}` : ''}. Try removing state filters.`);
        }

        const lines = rows.slice(0, 15).map((row, index) => {
          return `${index + 1}. ${row.program_title ?? 'Program'} | ${row.institution_name ?? row.institution_id ?? 'Unknown institution'} | Completions: ${formatNumber(row.total_completions)} | Award: ${row.award_level ?? 'N/A'} | Year: ${row.year ?? 'N/A'}`;
        });

        return text([
          `Top completions for CIP ${cipCode}${stateFips ? ` in ${stateFips.toUpperCase()}` : ''}:`,
          ...lines,
        ].join('\n'));
      } catch {
        return noDataMessage('Unable to retrieve completions data right now.');
      }
    },
  );

  server.registerTool(
    'get_state_priority',
    {
      description: 'Checks whether an occupation is on a state WIOA/priority occupations list.',
      inputSchema: {
        socCode: z.string().describe('SOC occupation code, for example 29-2052.'),
        stateFips: z.string().describe('State code, for example IA.'),
      },
    },
    async ({ socCode, stateFips }) => {
      try {
        const normalizedSoc = normalizeOccupationCode(socCode);
        const result = await isStatePriority(normalizedSoc, stateFips);

        if (!result.isPriority || !result.data) {
          return noDataMessage(`${normalizedSoc} is not currently marked as a priority occupation in ${stateFips.toUpperCase()}.`);
        }

        return text(
          [
            `${result.data.occupation_title} (SOC ${normalizedSoc}) is on ${stateFips.toUpperCase()} priority lists.`,
            `Priority level: ${result.data.priority_level}`,
            `Scholarship eligible: ${result.scholarshipEligible ? 'Yes' : 'No'}`,
            `WIOA fundable: ${result.wioaFundable ? 'Yes' : 'No'}`,
            `Sector: ${result.data.sector ?? 'N/A'}`,
            `Effective year: ${result.data.effective_year}`,
            `Source: ${result.data.designation_source}`,
          ].join('\n'),
        );
      } catch {
        return noDataMessage('Unable to check state priority status right now.');
      }
    },
  );

  server.registerTool(
    'get_demographics',
    {
      description: 'Returns Census ACS demographic metrics for a county FIPS code.',
      inputSchema: {
        fips: z.string().describe('County FIPS code, for example 19113.'),
      },
    },
    async ({ fips }) => {
      try {
        const result = await getCountyDemographics(fips);
        if (!result.found || !result.data) {
          return noDataMessage(`No demographics found for county FIPS ${fips}.`);
        }

        const row = result.data as JsonRecord;
        return text(
          [
            `Demographics for county FIPS ${fips}`,
            `County: ${(row.county_name as string | undefined) ?? 'N/A'}`,
            `State: ${(row.state as string | undefined) ?? 'N/A'}`,
            `Population: ${formatNumber(row.total_population as number | null | undefined)}`,
            `Median household income: ${formatCurrency(row.median_household_income as number | null | undefined)}`,
            `Poverty rate: ${formatPercent(row.poverty_rate as number | null | undefined)}`,
            `Bachelor's or higher: ${formatPercent(row.bachelors_or_higher_pct as number | null | undefined)}`,
            `Unemployment rate: ${formatPercent(row.unemployment_rate as number | null | undefined)}`,
          ].join('\n') + lookupFooter(result),
        );
      } catch {
        return noDataMessage('Unable to retrieve demographics right now.');
      }
    },
  );

  server.registerTool(
    'get_h1b_demand',
    {
      description: 'Returns H-1B demand and wage signals for an occupation SOC code.',
      inputSchema: {
        socCode: z.string().describe('SOC occupation code, for example 15-1252.'),
      },
    },
    async ({ socCode }) => {
      try {
        const normalizedSoc = normalizeOccupationCode(socCode);
        const result = await getH1BDemand(normalizedSoc);
        if (!result.found || !result.data?.length) {
          return noDataMessage(`No H-1B demand records found for SOC ${normalizedSoc}.`);
        }

        const lines = result.data.slice(0, 10).map((row) =>
          `- ${row.state}: applications ${formatNumber(row.total_applications)}, certified ${formatNumber(row.total_certified)}, employers ${formatNumber(row.unique_employers)}, median wage ${formatCurrency(row.median_wage)}`,
        );

        return text(
          [`H-1B demand for ${normalizedSoc}:`, ...lines].join('\n') + lookupFooter(result),
        );
      } catch {
        return noDataMessage('Unable to retrieve H-1B demand right now.');
      }
    },
  );

  server.registerTool(
    'get_frameworks',
    {
      description: 'Returns workforce planning frameworks and implementation guidance by category.',
      inputSchema: {
        category: z.string().optional().describe('Optional framework category filter.'),
      },
    },
    async ({ category }) => {
      try {
        const result = await getFrameworks(undefined, category);
        if (!result.found || !result.data?.length) {
          return noDataMessage(`No workforce frameworks found${category ? ` for category ${category}` : ''}.`);
        }

        const lines = result.data.slice(0, 8).map((row, index) =>
          `${index + 1}. ${row.framework_name} (${row.framework_type}) | Category: ${row.category} | Organization: ${row.organization}`,
        );

        return text(
          ['Available workforce frameworks:', ...lines].join('\n') + lookupFooter(result),
        );
      } catch {
        return noDataMessage('Unable to retrieve workforce frameworks right now.');
      }
    },
  );

  server.registerTool(
    'get_institution',
    {
      description: 'Returns institution profile data by UNITID/IPEDS ID or institution name.',
      inputSchema: {
        unitid: z.string().describe('IPEDS UNITID (6 digits) or institution name.'),
      },
    },
    async ({ unitid }) => {
      try {
        const result = await getInstitution(unitid);
        if (!result.found || !result.data) {
          return noDataMessage(`No institution found for query ${unitid}.`);
        }

        const inst = result.data;
        return text(
          [
            `${inst.name} (${inst.short_name ?? 'No short name'})`,
            `State: ${inst.state} | City: ${inst.city ?? 'N/A'} | Type: ${inst.type}`,
            `IPEDS ID: ${inst.ipeds_id ?? 'N/A'}`,
            `Total enrollment: ${formatNumber(inst.total_enrollment)}`,
            `Credit enrollment: ${formatNumber(inst.credit_enrollment)} | Noncredit enrollment: ${formatNumber(inst.noncredit_enrollment)}`,
            `Program count: ${formatNumber(inst.program_count)}`,
            `Website: ${inst.website ?? 'N/A'}`,
          ].join('\n') + lookupFooter(result),
        );
      } catch {
        return noDataMessage('Unable to retrieve institution data right now.');
      }
    },
  );

  server.registerTool(
    'search_occupations',
    {
      description: 'Searches occupation titles and SOC codes to help find the right occupation code for other tools.',
      inputSchema: {
        keyword: z.string().describe('Keyword like nurse, welder, software, etc.'),
      },
    },
    async ({ keyword }) => {
      try {
        const rows = await searchOccupations(keyword);
        if (!rows.length) {
          return noDataMessage(`No occupations matched "${keyword}". Try a broader keyword.`);
        }

        const lines = rows.map((row, index) => `${index + 1}. ${row.occupation_title} (SOC ${row.soc_code})`);
        return text([
          `Occupation matches for "${keyword}":`,
          ...lines,
          'Use a SOC code from this list with get_wages, get_projections, get_skills, or get_h1b_demand.',
        ].join('\n'));
      } catch {
        return noDataMessage('Unable to search occupations right now.');
      }
    },
  );
}
