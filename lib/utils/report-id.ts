/**
 * Report ID generation — WV-{MODEL}-{YYYYMMDD}-{SEQ}
 */

import { getSupabaseServerClient } from '@/lib/supabase/client';

const MODEL_CODES: Record<string, string> = {
  'claude-sonnet-4-6': 'S46',
  'claude-opus-4-6': 'O46',
  'claude-sonnet-4-5': 'S45',
  'claude-haiku-3-7': 'H37',
};

export function modelToCode(model: string): string {
  return MODEL_CODES[model] || model.slice(0, 3).toUpperCase();
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Generate a report ID for a new pipeline run.
 * Counts existing runs for that date to determine sequence number.
 */
export async function generateReportId(model: string, createdAt: Date): Promise<string> {
  const code = modelToCode(model);
  const dateStr = formatDate(createdAt);

  const supabase = getSupabaseServerClient();
  const prefix = `WV-${code}-${dateStr}-`;

  const { count } = await supabase
    .from('pipeline_runs')
    .select('id', { count: 'exact', head: true })
    .like('report_id', `${prefix}%`);

  const seq = String((count || 0) + 1).padStart(3, '0');
  return `${prefix}${seq}`;
}

/**
 * Build a report ID from known values (for backfill scripts).
 */
export function buildReportId(model: string, createdAt: Date, seq: number): string {
  const code = modelToCode(model);
  const dateStr = formatDate(createdAt);
  return `WV-${code}-${dateStr}-${String(seq).padStart(3, '0')}`;
}
