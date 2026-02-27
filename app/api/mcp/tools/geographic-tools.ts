import * as z from 'zod/v4';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getCountyDemographics, isStatePriority } from '@/lib/intelligence/lookup';
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

type JsonRecord = Record<string, unknown>;

export function registerGeographicTools(server: McpServer): void {
  server.registerTool(
    'get_demographics',
    {
      description: 'Returns Census ACS demographic metrics for a county FIPS code.',
      inputSchema: {
        fips: z.string().describe('County FIPS code, for example 19113.'),
      },
    },
    withMetrics('get_demographics', async ({ fips }) => {
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
    }),
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
    withMetrics('get_state_priority', async ({ socCode, stateFips }) => {
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
    }),
  );
}
