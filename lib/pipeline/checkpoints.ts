import { getSupabaseServerClient } from '@/lib/supabase/client';

export type ValidationCheckpointStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export interface ValidationCheckpoint {
  project_id: string;
  stage_key: string;
  payload: Record<string, any>;
  status: ValidationCheckpointStatus;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  attempts: number;
  error: string | null;
}

function isMissingTableError(error: any): boolean {
  const msg = (error?.message || '').toLowerCase();
  const code = error?.code || '';
  return code === '42P01' || msg.includes('does not exist') || msg.includes('relation');
}

export async function loadValidationCheckpoints(projectId: string): Promise<Map<string, ValidationCheckpoint>> {
  const checkpoints = new Map<string, ValidationCheckpoint>();

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('validation_checkpoints')
      .select('project_id, stage_key, payload, status, started_at, completed_at, duration_ms, attempts, error')
      .eq('project_id', projectId);

    if (error) {
      if (!isMissingTableError(error)) {
        console.warn('[Checkpoints] Failed to load checkpoints:', error.message);
      }
      return checkpoints;
    }

    for (const row of data || []) {
      checkpoints.set(row.stage_key, row as ValidationCheckpoint);
    }
  } catch (e) {
    console.warn('[Checkpoints] Load error (non-fatal):', e);
  }

  return checkpoints;
}

export async function markStageStarted(projectId: string, stageKey: string, attempt: number): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    const { data: existing } = await supabase
      .from('validation_checkpoints')
      .select('status, attempts')
      .eq('project_id', projectId)
      .eq('stage_key', stageKey)
      .maybeSingle();

    if (existing?.status === 'completed') {
      return;
    }

    const { error } = await supabase
      .from('validation_checkpoints')
      .upsert(
        {
          project_id: projectId,
          stage_key: stageKey,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          completed_at: null,
          duration_ms: null,
          attempts: Math.max(existing?.attempts || 0, attempt),
          error: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id,stage_key' }
      );

    if (error && !isMissingTableError(error)) {
      console.warn(`[Checkpoints] Failed to mark stage started (${stageKey}):`, error.message);
    }
  } catch (e) {
    console.warn(`[Checkpoints] markStageStarted error for ${stageKey} (non-fatal):`, e);
  }
}

export async function markStageCompleted(
  projectId: string,
  stageKey: string,
  payload: Record<string, any>,
  durationMs: number
): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    const { data: existing } = await supabase
      .from('validation_checkpoints')
      .select('attempts, started_at')
      .eq('project_id', projectId)
      .eq('stage_key', stageKey)
      .maybeSingle();

    const { error } = await supabase
      .from('validation_checkpoints')
      .upsert(
        {
          project_id: projectId,
          stage_key: stageKey,
          payload: payload || {},
          status: 'completed',
          started_at: existing?.started_at || new Date().toISOString(),
          completed_at: new Date().toISOString(),
          duration_ms: durationMs,
          attempts: Math.max(existing?.attempts || 0, 1),
          error: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id,stage_key' }
      );

    if (error && !isMissingTableError(error)) {
      console.warn(`[Checkpoints] Failed to mark stage completed (${stageKey}):`, error.message);
    }
  } catch (e) {
    console.warn(`[Checkpoints] markStageCompleted error for ${stageKey} (non-fatal):`, e);
  }
}

export async function markStageFailed(
  projectId: string,
  stageKey: string,
  errorMessage: string,
  durationMs: number
): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    const { data: existing } = await supabase
      .from('validation_checkpoints')
      .select('attempts, started_at, payload')
      .eq('project_id', projectId)
      .eq('stage_key', stageKey)
      .maybeSingle();

    const { error } = await supabase
      .from('validation_checkpoints')
      .upsert(
        {
          project_id: projectId,
          stage_key: stageKey,
          payload: existing?.payload || {},
          status: 'failed',
          started_at: existing?.started_at || new Date().toISOString(),
          completed_at: new Date().toISOString(),
          duration_ms: durationMs,
          attempts: Math.max(existing?.attempts || 0, 1),
          error: errorMessage,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id,stage_key' }
      );

    if (error && !isMissingTableError(error)) {
      console.warn(`[Checkpoints] Failed to mark stage failed (${stageKey}):`, error.message);
    }
  } catch (e) {
    console.warn(`[Checkpoints] markStageFailed error for ${stageKey} (non-fatal):`, e);
  }
}

export async function shouldSkipStage(projectId: string, stageKey: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('validation_checkpoints')
      .select('status')
      .eq('project_id', projectId)
      .eq('stage_key', stageKey)
      .maybeSingle();

    if (error) {
      if (!isMissingTableError(error)) {
        console.warn(`[Checkpoints] Failed to check skip for ${stageKey}:`, error.message);
      }
      return false;
    }

    return data?.status === 'completed';
  } catch (e) {
    console.warn(`[Checkpoints] shouldSkipStage error for ${stageKey} (non-fatal):`, e);
    return false;
  }
}
