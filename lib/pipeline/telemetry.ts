import { getSupabaseServerClient } from '@/lib/supabase/client';

export interface LogRunEventInput {
  pipelineRunId?: string | null;
  projectId: string;
  eventType: string;
  stageKey?: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

function isMissingTableError(error: any): boolean {
  const msg = (error?.message || '').toLowerCase();
  const code = error?.code || '';
  return code === '42P01' || msg.includes('does not exist') || msg.includes('relation');
}

export async function logRunEvent(input: LogRunEventInput): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('pipeline_run_events').insert({
      pipeline_run_id: input.pipelineRunId || null,
      project_id: input.projectId,
      event_type: input.eventType,
      stage_key: input.stageKey || null,
      level: input.level,
      message: input.message,
      metadata: input.metadata || {},
    });

    if (error && !isMissingTableError(error)) {
      console.warn('[Telemetry] Failed to log pipeline event (non-fatal):', error.message);
    }
  } catch (e) {
    console.warn('[Telemetry] logRunEvent error (non-fatal):', e);
  }
}
