import * as z from 'zod/v4';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getCompletionsByCIP, getInstitution, getFrameworks } from '@/lib/intelligence/lookup';
import { text, noDataMessage, formatNumber, lookupFooter, withMetrics } from '../tool-helpers';

export function registerEducationTools(server: McpServer): void {
  server.registerTool(
    'get_completions',
    {
      description: 'Returns IPEDS completions by CIP code, optionally filtered to a state.',
      inputSchema: {
        cipCode: z.string().describe('CIP code, for example 51.0805.'),
        stateFips: z.string().optional().describe('Optional state code, for example IA.'),
      },
    },
    withMetrics('get_completions', async ({ cipCode, stateFips }) => {
      try {
        const result = await getCompletionsByCIP(cipCode, stateFips);
        if (!result.found || !result.data?.length) {
          return noDataMessage(`No completions found for CIP ${cipCode}${stateFips ? ` in ${stateFips.toUpperCase()}` : ''}. Try removing state filters.`);
        }

        const lines = result.data.slice(0, 15).map((row, index) => {
          return `${index + 1}. ${row.program_title ?? 'Program'} | ${row.institution_name ?? row.institution_id ?? 'Unknown institution'} | Completions: ${formatNumber(row.total_completions)} | Award: ${row.award_level ?? 'N/A'} | Year: ${row.year ?? 'N/A'}`;
        });

        return text([
          `Top completions for CIP ${cipCode}${stateFips ? ` in ${stateFips.toUpperCase()}` : ''}:`,
          ...lines,
        ].join('\n'));
      } catch {
        return noDataMessage('Unable to retrieve completions data right now.');
      }
    }),
  );

  server.registerTool(
    'get_institution',
    {
      description: 'Returns institution profile data by UNITID/IPEDS ID or institution name.',
      inputSchema: {
        unitid: z.string().describe('IPEDS UNITID (6 digits) or institution name.'),
      },
    },
    withMetrics('get_institution', async ({ unitid }) => {
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
    }),
  );

  server.registerTool(
    'get_frameworks',
    {
      description: 'Returns workforce planning frameworks and implementation guidance by category.',
      inputSchema: {
        category: z.string().optional().describe('Optional framework category filter.'),
      },
    },
    withMetrics('get_frameworks', async ({ category }) => {
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
    }),
  );
}
