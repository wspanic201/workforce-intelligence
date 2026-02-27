/**
 * intel-tools.ts
 *
 * Bridge between lookup.ts and Claude's tool_use API.
 *
 * Defines tool schemas that can be passed to callClaude() and a handler
 * that routes tool calls to the correct lookup.ts function. This lets
 * Claude dynamically query intelligence data instead of having it all
 * pre-fetched and stuffed into the prompt.
 *
 * Usage:
 *   import { INTEL_TOOLS, executeIntelTool } from '@/lib/intelligence/intel-tools';
 *
 *   const { content } = await callClaude(prompt, {
 *     system: 'You are a labor market analyst...',
 *     tools: INTEL_TOOLS,
 *     toolHandler: executeIntelTool,
 *   });
 */

import type { ClaudeTool } from '@/lib/ai/anthropic';
import {
  getOccupationWages,
  getOccupationProjections,
  getOccupationSkills,
  getH1BDemand,
  isStatePriority,
  getCountyDemographics,
  getIndustryEmployment,
  getFrameworks,
  getInstitution,
  getInstitutionCompletions,
  getStateStatutes,
  getStateCredentials,
} from './lookup';

// ── Tool Definitions ────────────────────────────────────────────────────────

export const INTEL_TOOLS: ClaudeTool[] = [
  {
    name: 'get_wages',
    description: 'Returns BLS OES wage levels (median, mean, percentiles) for an occupation, nationally or by state.',
    input_schema: {
      type: 'object',
      properties: {
        socCode: { type: 'string', description: 'SOC occupation code, e.g. 29-2052' },
        stateCode: { type: 'string', description: 'Optional two-letter state code, e.g. IA. Omit for national data.' },
      },
      required: ['socCode'],
    },
  },
  {
    name: 'get_projections',
    description: 'Returns occupation employment projections including growth rate and annual openings.',
    input_schema: {
      type: 'object',
      properties: {
        socCode: { type: 'string', description: 'SOC occupation code, e.g. 29-2052' },
        stateCode: { type: 'string', description: 'Optional state code for the projection geography.' },
      },
      required: ['socCode'],
    },
  },
  {
    name: 'get_skills',
    description: 'Returns top O*NET skills, knowledge, abilities, and technology signals for an occupation.',
    input_schema: {
      type: 'object',
      properties: {
        socCode: { type: 'string', description: 'SOC or O*NET code, e.g. 29-2052 or 29-2052.00' },
      },
      required: ['socCode'],
    },
  },
  {
    name: 'get_h1b_demand',
    description: 'Returns H-1B visa application volume, certification rates, and wage signals for an occupation.',
    input_schema: {
      type: 'object',
      properties: {
        socCode: { type: 'string', description: 'SOC occupation code' },
      },
      required: ['socCode'],
    },
  },
  {
    name: 'get_state_priority',
    description: 'Checks whether an occupation is on a state WIOA/priority occupations list with scholarship and funding eligibility.',
    input_schema: {
      type: 'object',
      properties: {
        socCode: { type: 'string', description: 'SOC occupation code' },
        stateCode: { type: 'string', description: 'Two-letter state code' },
      },
      required: ['socCode', 'stateCode'],
    },
  },
  {
    name: 'get_employers',
    description: 'Returns industry employment data for a state (from Census County Business Patterns).',
    input_schema: {
      type: 'object',
      properties: {
        stateCode: { type: 'string', description: 'Two-letter state code' },
        county: { type: 'string', description: 'Optional county name to filter results.' },
      },
      required: ['stateCode'],
    },
  },
  {
    name: 'get_demographics',
    description: 'Returns Census ACS demographic metrics (population, income, poverty, education, unemployment) for a county.',
    input_schema: {
      type: 'object',
      properties: {
        countyFips: { type: 'string', description: 'County FIPS code, e.g. 19113' },
      },
      required: ['countyFips'],
    },
  },
  {
    name: 'get_institution',
    description: 'Returns institution profile data by IPEDS ID or name (enrollment, programs, type).',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'IPEDS UNITID (6 digits) or institution name' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_completions',
    description: 'Returns IPEDS program completions for an institution, optionally filtered by CIP code.',
    input_schema: {
      type: 'object',
      properties: {
        institutionId: { type: 'string', description: 'Institution ID from get_institution' },
        cipCode: { type: 'string', description: 'Optional CIP code filter, e.g. 51.0805' },
      },
      required: ['institutionId'],
    },
  },
  {
    name: 'get_regulations',
    description: 'Returns state statutes and regulatory requirements, optionally filtered by topic.',
    input_schema: {
      type: 'object',
      properties: {
        stateCode: { type: 'string', description: 'Two-letter state code' },
        category: { type: 'string', description: 'Optional topic/category filter (e.g. pharmacy, nursing)' },
      },
      required: ['stateCode'],
    },
  },
  {
    name: 'get_credentials',
    description: 'Returns credential and licensing requirements for a state and occupation.',
    input_schema: {
      type: 'object',
      properties: {
        stateCode: { type: 'string', description: 'Two-letter state code' },
        occupation: { type: 'string', description: 'Optional occupation keyword to filter' },
      },
      required: ['stateCode'],
    },
  },
  {
    name: 'get_frameworks',
    description: 'Returns workforce planning frameworks and implementation guidance.',
    input_schema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Optional framework category filter' },
      },
      required: [],
    },
  },
];

// ── Tool Handler ────────────────────────────────────────────────────────────

function formatNumber(v: number | null | undefined): string {
  return typeof v === 'number' ? v.toLocaleString('en-US') : 'N/A';
}
function formatCurrency(v: number | null | undefined): string {
  return typeof v === 'number' ? `$${v.toLocaleString('en-US')}` : 'N/A';
}
function formatPercent(v: number | null | undefined): string {
  return typeof v === 'number' ? `${v.toFixed(1)}%` : 'N/A';
}

/**
 * Execute an intel tool call — route to the correct lookup.ts function.
 * Returns formatted text for Claude to consume.
 */
export async function executeIntelTool(
  name: string,
  input: Record<string, any>
): Promise<string> {
  switch (name) {
    case 'get_wages': {
      const soc = (input.socCode as string).replace(/\.\d+$/, '');
      const result = await getOccupationWages(soc, input.stateCode);
      if (!result.found || !result.data) return `No wage data found for SOC ${soc}${input.stateCode ? ` in ${input.stateCode}` : ''}.`;
      const w = result.data;
      return [
        `Wage data for ${w.occupation_title} (SOC ${w.soc_code})`,
        `Geography: ${w.geo_name} (${w.geo_level})`,
        `Median annual: ${formatCurrency(w.median_annual)} | Mean: ${formatCurrency(w.mean_annual)}`,
        `Employment: ${formatNumber(w.employment)}`,
        `10th: ${formatCurrency(w.pct_10)} | 25th: ${formatCurrency(w.pct_25)} | 75th: ${formatCurrency(w.pct_75)} | 90th: ${formatCurrency(w.pct_90)}`,
        result.citation ? `Source: ${result.citation}` : '',
      ].filter(Boolean).join('\n');
    }

    case 'get_projections': {
      const soc = (input.socCode as string).replace(/\.\d+$/, '');
      const result = await getOccupationProjections(soc, input.stateCode);
      if (!result.found || !result.data) return `No projection data found for SOC ${soc}.`;
      const p = result.data;
      return [
        `Projections for ${p.occupation_title} (SOC ${p.soc_code})`,
        `Base ${p.base_year}: ${formatNumber(p.employment_base)} → Projected ${p.projected_year}: ${formatNumber(p.employment_projected)}`,
        `Change: ${formatNumber(p.change_number)} (${formatPercent(p.change_percent)})`,
        `Annual openings: ${formatNumber(p.annual_openings)}`,
        `Growth: ${p.growth_category ?? 'N/A'}`,
        result.citation ? `Source: ${result.citation}` : '',
      ].filter(Boolean).join('\n');
    }

    case 'get_skills': {
      const soc = (input.socCode as string).replace(/\.\d+$/, '');
      const result = await getOccupationSkills(soc, ['skill', 'knowledge', 'ability', 'technology'], 10);
      if (!result.found || !result.data?.length) return `No skills data found for SOC ${soc}.`;
      const lines = result.data.slice(0, 15).map(s =>
        `- ${s.skill_name} (${s.skill_type}) | importance ${s.importance ?? 'N/A'} | level ${s.level ?? 'N/A'}`
      );
      return [`Skills for SOC ${soc}:`, ...lines].join('\n');
    }

    case 'get_h1b_demand': {
      const soc = (input.socCode as string).replace(/\.\d+$/, '');
      const result = await getH1BDemand(soc);
      if (!result.found || !result.data?.length) return `No H-1B data for SOC ${soc}.`;
      const lines = result.data.slice(0, 10).map(r =>
        `- ${r.state}: apps ${formatNumber(r.total_applications)}, certified ${formatNumber(r.total_certified)}, employers ${formatNumber(r.unique_employers)}, median wage ${formatCurrency(r.median_wage)}`
      );
      return [`H-1B demand for ${soc}:`, ...lines].join('\n');
    }

    case 'get_state_priority': {
      const soc = (input.socCode as string).replace(/\.\d+$/, '');
      const result = await isStatePriority(soc, input.stateCode);
      if (!result.isPriority || !result.data) return `SOC ${soc} is not on ${input.stateCode} priority list.`;
      const d = result.data;
      return [
        `${d.occupation_title} IS a priority occupation in ${d.state}.`,
        `Priority: ${d.priority_level} | Scholarship: ${d.scholarship_eligible ? 'Yes' : 'No'} | WIOA: ${d.wioa_fundable ? 'Yes' : 'No'}`,
        `Sector: ${d.sector ?? 'N/A'} | Year: ${d.effective_year}`,
      ].join('\n');
    }

    case 'get_employers': {
      const result = await getIndustryEmployment(input.stateCode, input.county);
      if (!result.found || !result.data?.length) return `No employer data for ${input.stateCode}.`;
      const lines = result.data.slice(0, 10).map((r: any, i: number) =>
        `${i + 1}. ${r.name} (NAICS ${r.naics}) | Employees: ${formatNumber(r.employees)}`
      );
      return [`Industry employment in ${input.stateCode}:`, ...lines].join('\n');
    }

    case 'get_demographics': {
      const result = await getCountyDemographics(input.countyFips);
      if (!result.found || !result.data) return `No demographics for FIPS ${input.countyFips}.`;
      const d = result.data as any;
      return [
        `Demographics for ${d.county_name ?? 'County'}, ${d.state ?? ''}`,
        `Population: ${formatNumber(d.total_population)}`,
        `Median income: ${formatCurrency(d.median_household_income)}`,
        `Poverty: ${formatPercent(d.poverty_rate)} | Bachelor's+: ${formatPercent(d.bachelors_or_higher_pct)}`,
        `Unemployment: ${formatPercent(d.unemployment_rate)}`,
      ].join('\n');
    }

    case 'get_institution': {
      const result = await getInstitution(input.query);
      if (!result.found || !result.data) return `No institution found for "${input.query}".`;
      const inst = result.data;
      return [
        `${inst.name} (${inst.short_name ?? ''})`,
        `State: ${inst.state} | City: ${inst.city ?? 'N/A'} | Type: ${inst.type}`,
        `IPEDS: ${inst.ipeds_id ?? 'N/A'} | Enrollment: ${formatNumber(inst.total_enrollment)}`,
        `Programs: ${formatNumber(inst.program_count)}`,
      ].join('\n');
    }

    case 'get_completions': {
      const result = await getInstitutionCompletions(input.institutionId, input.cipCode);
      if (!result.found || !result.data?.length) return `No completions data found.`;
      const lines = (result.data as any[]).slice(0, 10).map((r: any, i: number) =>
        `${i + 1}. ${r.program_title ?? 'Program'} (CIP ${r.cip_code ?? 'N/A'}) — ${formatNumber(r.total_completions)} completions`
      );
      return lines.join('\n');
    }

    case 'get_regulations': {
      const result = await getStateStatutes(input.stateCode, input.category);
      if (!result.found || !result.data?.length) return `No regulations found for ${input.stateCode}${input.category ? ` (${input.category})` : ''}.`;
      const lines = (result.data as any[]).slice(0, 8).map((s: any) =>
        `- ${s.title} (${s.code_chapter}) — ${s.summary?.substring(0, 200) ?? 'No summary'}`
      );
      return [`State regulations for ${input.stateCode}:`, ...lines].join('\n');
    }

    case 'get_credentials': {
      const result = await getStateCredentials(input.stateCode, input.occupation);
      if (!result.found || !result.data?.length) return `No credential requirements found.`;
      const lines = (result.data as any[]).slice(0, 8).map((c: any) =>
        `- ${c.credential_name}: ${c.requirements?.substring(0, 200) ?? 'No details'}`
      );
      return lines.join('\n');
    }

    case 'get_frameworks': {
      const result = await getFrameworks(undefined, input.category);
      if (!result.found || !result.data?.length) return `No frameworks found.`;
      const lines = result.data.slice(0, 5).map((f, i) =>
        `${i + 1}. ${f.framework_name} (${f.framework_type}) — ${f.summary?.substring(0, 150) ?? ''}`
      );
      return lines.join('\n');
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

/**
 * Returns a subset of tools relevant to a specific agent persona.
 * Keeps prompt token usage down by only giving Claude the tools it needs.
 */
export function getToolsForAgent(agentType: string): ClaudeTool[] {
  const common = ['get_wages', 'get_projections', 'get_skills', 'get_state_priority'];

  const agentToolMap: Record<string, string[]> = {
    labor_market: [...common, 'get_h1b_demand', 'get_employers'],
    competitive_landscape: [...common, 'get_institution', 'get_completions'],
    learner_demand: [...common, 'get_demographics', 'get_institution'],
    financial_viability: [...common, 'get_institution', 'get_completions'],
    institutional_fit: [...common, 'get_institution', 'get_completions', 'get_credentials'],
    regulatory_compliance: [...common, 'get_regulations', 'get_credentials'],
    employer_demand: [...common, 'get_h1b_demand', 'get_employers'],
  };

  const toolNames = agentToolMap[agentType] || common;
  return INTEL_TOOLS.filter(t => toolNames.includes(t.name));
}
