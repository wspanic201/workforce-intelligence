/**
 * Shared helpers for MCP tool handlers.
 * Extracted from the monolithic tools.ts for reuse across domain modules.
 */

import type { LookupResult } from '@/lib/intelligence/lookup';

export type ToolContent = {
  content: Array<{ type: 'text'; text: string }>;
};

export function text(content: string): ToolContent {
  return { content: [{ type: 'text', text: content }] };
}

export function noDataMessage(message: string): ToolContent {
  return text(message);
}

export function formatNumber(value: number | null | undefined): string {
  if (typeof value !== 'number') return 'N/A';
  return value.toLocaleString('en-US');
}

export function formatCurrency(value: number | null | undefined): string {
  if (typeof value !== 'number') return 'N/A';
  return `$${value.toLocaleString('en-US')}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (typeof value !== 'number') return 'N/A';
  return `${value.toFixed(1)}%`;
}

export function normalizeOccupationCode(code: string): string {
  return code.trim().replace(/\.\d+$/, '');
}

export function lookupFooter<T>(result: LookupResult<T>): string {
  const parts: string[] = [];
  if (result.citation) parts.push(`Source: ${result.citation}`);
  if (result.freshness.period) parts.push(`Data period: ${result.freshness.period}`);
  if (result.freshness.lastRefreshed) parts.push(`Last refreshed: ${result.freshness.lastRefreshed}`);
  if (result.sourceUrl) parts.push(`URL: ${result.sourceUrl}`);
  return parts.length ? `\n\n${parts.join(' | ')}` : '';
}

// ════════════════════════════════════════════════════════
// OBSERVABILITY — Structured metrics wrapper (Phase 4)
// ════════════════════════════════════════════════════════

type ToolHandler<TArgs> = (args: TArgs) => Promise<ToolContent>;

/**
 * Wraps a tool handler with structured JSON logging for observability.
 * Vercel's log viewer parses these structured events automatically.
 */
export function withMetrics<TArgs>(toolName: string, handler: ToolHandler<TArgs>): ToolHandler<TArgs> {
  return async (args: TArgs) => {
    const start = Date.now();
    try {
      const result = await handler(args);
      console.log(JSON.stringify({
        event: 'mcp_tool_call',
        tool: toolName,
        durationMs: Date.now() - start,
        success: true,
      }));
      return result;
    } catch (err) {
      console.log(JSON.stringify({
        event: 'mcp_tool_call',
        tool: toolName,
        durationMs: Date.now() - start,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }));
      throw err;
    }
  };
}
