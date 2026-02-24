/**
 * Discovery Pipeline Checkpointing
 * 
 * Saves each phase's output to Supabase so pipeline can resume
 * from the last completed phase if killed or crashed.
 * 
 * Run key format: "{institution}:{city}:{state}:{focus}:{date}"
 * e.g. "kirkwood-community-college:cedar-rapids:iowa:healthcare:2026-02-24"
 */

import { getSupabaseServerClient } from '@/lib/supabase/client';

export interface Checkpoint {
  phase_number: number;
  phase_name: string;
  phase_output: any;
  runtime_seconds: number;
}

/**
 * Generate a deterministic run key for checkpoint matching.
 * Same institution + city + state + focus on the same day = same run.
 */
export function buildRunKey(
  institution: string,
  city: string,
  state: string,
  focus?: string
): string {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${normalize(institution)}:${normalize(city)}:${normalize(state)}:${normalize(focus || 'general')}:${date}`;
}

/**
 * Load all completed checkpoints for a run.
 * Returns map of phase_number → phase_output.
 */
export async function loadCheckpoints(runKey: string): Promise<Map<number, Checkpoint>> {
  const checkpoints = new Map<number, Checkpoint>();
  
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('discovery_checkpoints')
      .select('phase_number, phase_name, phase_output, runtime_seconds')
      .eq('run_key', runKey)
      .eq('status', 'completed')
      .order('phase_number', { ascending: true });

    if (error) {
      console.warn('[Checkpoint] Failed to load checkpoints:', error.message);
      return checkpoints;
    }

    for (const row of data || []) {
      checkpoints.set(row.phase_number, {
        phase_number: row.phase_number,
        phase_name: row.phase_name,
        phase_output: row.phase_output,
        runtime_seconds: row.runtime_seconds,
      });
    }

    if (checkpoints.size > 0) {
      console.log(`[Checkpoint] ✓ Loaded ${checkpoints.size} checkpoints for run ${runKey}`);
      for (const [num, cp] of checkpoints) {
        console.log(`[Checkpoint]   Phase ${num}: ${cp.phase_name} (${cp.runtime_seconds}s)`);
      }
    }
  } catch (e) {
    console.warn('[Checkpoint] Load error (non-fatal):', e);
  }

  return checkpoints;
}

/**
 * Save a phase checkpoint to Supabase.
 * Uses upsert so re-runs overwrite stale data.
 */
export async function saveCheckpoint(
  runKey: string,
  institutionName: string,
  phaseNumber: number,
  phaseName: string,
  phaseOutput: any,
  runtimeSeconds: number,
  inputConfig?: any
): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('discovery_checkpoints')
      .upsert({
        run_key: runKey,
        institution_name: institutionName,
        phase_number: phaseNumber,
        phase_name: phaseName,
        phase_output: phaseOutput,
        runtime_seconds: runtimeSeconds,
        input_config: inputConfig || {},
        status: 'completed',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'run_key,phase_number',
      });

    if (error) {
      console.warn(`[Checkpoint] Failed to save phase ${phaseNumber}:`, error.message);
    } else {
      console.log(`[Checkpoint] ✓ Saved phase ${phaseNumber} (${phaseName}) — ${runtimeSeconds}s`);
    }
  } catch (e) {
    console.warn(`[Checkpoint] Save error for phase ${phaseNumber} (non-fatal):`, e);
  }
}

/**
 * Clear all checkpoints for a run (for fresh re-runs).
 */
export async function clearCheckpoints(runKey: string): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    await supabase
      .from('discovery_checkpoints')
      .delete()
      .eq('run_key', runKey);
    console.log(`[Checkpoint] Cleared checkpoints for ${runKey}`);
  } catch (e) {
    console.warn('[Checkpoint] Clear error:', e);
  }
}
