import * as z from 'zod/v4';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getEmployers } from '@/lib/intelligence/lookup';
import { text, noDataMessage, formatNumber, withMetrics } from '../tool-helpers';

export function registerEmployerTools(server: McpServer): void {
  server.registerTool(
    'get_employers',
    {
      description: 'Returns major employers in a state, optionally filtered by NAICS prefix.',
      inputSchema: {
        stateFips: z.string().describe('State code used in employer data (for example IA).'),
        naicsPrefix: z.string().optional().describe('Optional NAICS prefix filter, for example 62 for healthcare.'),
      },
    },
    withMetrics('get_employers', async ({ stateFips, naicsPrefix }) => {
      try {
        const result = await getEmployers(stateFips, naicsPrefix);
        if (!result.found || !result.data?.length) {
          return noDataMessage(`No employer records found for ${stateFips.toUpperCase()}${naicsPrefix ? ` with NAICS prefix ${naicsPrefix}` : ''}.`);
        }

        const lines = result.data.slice(0, 15).map((row, index) => {
          const occupations = row.key_occupations?.slice(0, 3).join(', ') || 'N/A';
          const isCountyAggregate = /county$/i.test((row.employer_name || '').trim());
          const displayName = isCountyAggregate
            ? `${row.city || row.employer_name} — County/NAICS aggregate`
            : (row.employer_name ?? 'Unknown employer');
          return `${index + 1}. ${displayName} (${row.city ?? 'Unknown city'}, ${row.state ?? stateFips.toUpperCase()}) | NAICS ${row.naics_code ?? 'N/A'} | Employees ${formatNumber(row.estimated_employees)} | Hiring: ${row.is_hiring ? 'Yes' : 'No'} | Occupations: ${occupations}`;
        });

        return text([
          `Top employer records for ${stateFips.toUpperCase()}${naicsPrefix ? ` (NAICS ${naicsPrefix}*)` : ''}:`,
          `Note: current intel_employers dataset is county/industry aggregate-first (CBP-based), not fully normalized company-level entities.`,
          ...lines,
        ].join('\n'));
      } catch {
        return noDataMessage('Unable to retrieve employer data right now.');
      }
    }),
  );
}
