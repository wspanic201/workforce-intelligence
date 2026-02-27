import * as z from 'zod/v4';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  getOccupationWages,
  getOccupationProjections,
  getOccupationSkills,
  getH1BDemand,
  searchOccupationsByKeyword,
} from '@/lib/intelligence/lookup';
import {
  text,
  noDataMessage,
  formatNumber,
  formatCurrency,
  formatPercent,
  normalizeOccupationCode,
  lookupFooter,
  withMetrics,
} from '../tool-helpers';

export function registerOccupationTools(server: McpServer): void {
  server.registerTool(
    'get_wages',
    {
      description: 'Returns BLS OES wage levels for an occupation, nationally or by state.',
      inputSchema: {
        socCode: z.string().describe('SOC occupation code, for example 29-2052.'),
        stateCode: z.string().optional().describe('Optional two-letter state code, for example IA.'),
      },
    },
    withMetrics('get_wages', async ({ socCode, stateCode }) => {
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
    }),
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
    withMetrics('get_projections', async ({ socCode, stateFips }) => {
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
    }),
  );

  server.registerTool(
    'get_skills',
    {
      description: 'Returns top O*NET skills, knowledge, abilities, and technology signals for an occupation code.',
      inputSchema: {
        onetCode: z.string().describe('O*NET-SOC/SOC code, for example 29-2052.00 or 29-2052.'),
      },
    },
    withMetrics('get_skills', async ({ onetCode }) => {
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
    }),
  );

  server.registerTool(
    'get_h1b_demand',
    {
      description: 'Returns H-1B demand and wage signals for an occupation SOC code.',
      inputSchema: {
        socCode: z.string().describe('SOC occupation code, for example 15-1252.'),
      },
    },
    withMetrics('get_h1b_demand', async ({ socCode }) => {
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
    }),
  );

  server.registerTool(
    'search_occupations',
    {
      description: 'Searches occupation titles and SOC codes to help find the right occupation code for other tools.',
      inputSchema: {
        keyword: z.string().describe('Keyword like nurse, welder, software, etc.'),
      },
    },
    withMetrics('search_occupations', async ({ keyword }) => {
      try {
        const result = await searchOccupationsByKeyword(keyword);
        if (!result.found || !result.data?.length) {
          return noDataMessage(`No occupations matched "${keyword}". Try a broader keyword.`);
        }

        const lines = result.data.map((row, index) => `${index + 1}. ${row.occupation_title} (SOC ${row.soc_code})`);
        return text([
          `Occupation matches for "${keyword}":`,
          ...lines,
          'Use a SOC code from this list with get_wages, get_projections, get_skills, or get_h1b_demand.',
        ].join('\n'));
      } catch {
        return noDataMessage('Unable to search occupations right now.');
      }
    }),
  );
}
