/**
 * stage-runner.ts
 *
 * Generic stage execution wrapper with retry, checkpoint, and telemetry.
 *
 * Before this, every stage in orchestrator.ts had ~50 lines of identical
 * retry/checkpoint/telemetry boilerplate. This module extracts that into
 * a single reusable function.
 */

import {
  markStageStarted,
  markStageCompleted,
  markStageFailed,
  shouldSkipStage,
} from './checkpoints';
import { logRunEvent } from './telemetry';

// ── Configuration ───────────────────────────────────────────────────────────

const MAX_STAGE_ATTEMPTS = Math.max(1, parseInt(process.env.VALIDATION_STAGE_MAX_ATTEMPTS || '2', 10));
const STAGE_RETRY_BACKOFF_MS = Math.max(0, parseInt(process.env.VALIDATION_STAGE_RETRY_BACKOFF_MS || '2000', 10));

// ── Types ───────────────────────────────────────────────────────────────────

export interface StageConfig<T> {
  /** Database project ID */
  projectId: string;
  /** Unique key for this stage (e.g. 'labor_market', 'tiger_team') */
  stageKey: string;
  /** Human-readable label for logs (e.g. 'Labor Market Analysis') */
  label: string;
  /** Pipeline run ID for telemetry (nullable) */
  pipelineRunId?: string | null;
  /** Hard timeout for the stage in ms */
  timeoutMs: number;
  /** The actual work to execute */
  run: () => Promise<T>;
  /**
   * Build the checkpoint payload from the result.
   * If omitted, an empty object is stored.
   */
  buildCheckpointPayload?: (result: T, durationMs: number) => Record<string, any>;
  /**
   * If true, stage failure doesn't throw — returns null instead.
   * Use for optional stages like tiger team, citation, PDF.
   */
  optional?: boolean;
  /**
   * If provided, this is called to load a cached result when the checkpoint
   * shows the stage already completed. Lets the orchestrator skip re-running
   * but still get the data it needs.
   */
  loadCachedResult?: () => Promise<T | null>;
  /**
   * Shared attempt counter map — passed from orchestrator so retries
   * across checkpoint reloads are tracked correctly.
   */
  stageAttempts?: Map<string, number>;
}

export interface StageResult<T> {
  /** The result from run(), or null if skipped/failed (when optional) */
  result: T | null;
  /** Whether the stage was skipped due to an existing checkpoint */
  skipped: boolean;
  /** Duration in ms (0 if skipped) */
  durationMs: number;
}

// ── Timeout helper ──────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, taskName: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${taskName} timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

// ── Main runner ─────────────────────────────────────────────────────────────

/**
 * Execute a pipeline stage with retry, checkpoint, telemetry, and timeout.
 *
 * Handles:
 * - Checkpoint skip detection (stage already completed in a previous run)
 * - Retry with exponential backoff
 * - Telemetry events (started, completed, failed, skipped, retry_scheduled)
 * - Hard timeout per stage
 * - Optional stages (failure returns null instead of throwing)
 */
export async function runStage<T>(config: StageConfig<T>): Promise<StageResult<T>> {
  const {
    projectId,
    stageKey,
    label,
    pipelineRunId,
    timeoutMs,
    run,
    buildCheckpointPayload,
    optional = false,
    loadCachedResult,
    stageAttempts = new Map(),
  } = config;

  // ── Check if stage can be skipped ───────────────────────────────────────
  const canSkip = await shouldSkipStage(projectId, stageKey);
  if (canSkip) {
    let cachedResult: T | null = null;
    if (loadCachedResult) {
      try {
        cachedResult = await loadCachedResult();
      } catch {
        // Non-fatal — we'll re-run the stage
      }
    }

    if (cachedResult !== null || !loadCachedResult) {
      await logRunEvent({
        pipelineRunId,
        projectId,
        eventType: 'stage_skipped',
        stageKey,
        level: 'info',
        message: `${label} skipped (checkpoint complete)`,
      });
      console.log(`[StageRunner] ↷ Skipped ${label} (checkpoint complete)`);
      return { result: cachedResult, skipped: true, durationMs: 0 };
    }
  }

  // ── Retry loop ──────────────────────────────────────────────────────────
  let lastError: unknown = null;

  while (true) {
    const attempt = (stageAttempts.get(stageKey) || 0) + 1;
    stageAttempts.set(stageKey, attempt);

    await markStageStarted(projectId, stageKey, attempt);
    await logRunEvent({
      pipelineRunId,
      projectId,
      eventType: 'stage_started',
      stageKey,
      level: 'info',
      message: `${label} started`,
      metadata: { attempt },
    });

    const stageStart = Date.now();

    try {
      console.log(`[StageRunner] Starting ${label} (attempt ${attempt}/${MAX_STAGE_ATTEMPTS})...`);

      const result = await withTimeout(run(), timeoutMs, label);
      const durationMs = Date.now() - stageStart;

      const checkpointPayload = buildCheckpointPayload
        ? buildCheckpointPayload(result, durationMs)
        : {};

      await markStageCompleted(projectId, stageKey, checkpointPayload, durationMs);
      await logRunEvent({
        pipelineRunId,
        projectId,
        eventType: 'stage_completed',
        stageKey,
        level: 'info',
        message: `${label} completed`,
        metadata: { durationMs, attempt },
      });

      console.log(`[StageRunner] ✓ ${label} completed in ${Math.round(durationMs / 1000)}s`);
      return { result, skipped: false, durationMs };
    } catch (error) {
      lastError = error;
      const durationMs = Date.now() - stageStart;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await markStageFailed(projectId, stageKey, errorMessage, durationMs);
      await logRunEvent({
        pipelineRunId,
        projectId,
        eventType: 'stage_failed',
        stageKey,
        level: optional ? 'warn' : 'error',
        message: `${label} failed`,
        metadata: { durationMs, attempt, error: errorMessage },
      });

      if (attempt < MAX_STAGE_ATTEMPTS) {
        const backoffMs = STAGE_RETRY_BACKOFF_MS * attempt;
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_retry_scheduled',
          stageKey,
          level: 'warn',
          message: `${label} retry scheduled`,
          metadata: { attempt, nextAttempt: attempt + 1, backoffMs, error: errorMessage },
        });
        console.warn(`[StageRunner] ⚠ ${label} failed (attempt ${attempt}/${MAX_STAGE_ATTEMPTS}), retrying in ${backoffMs}ms...`);
        if (backoffMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
        continue;
      }

      // Exhausted retries
      if (optional) {
        console.warn(`[StageRunner] ${label} failed after ${attempt} attempts (optional — continuing):`, errorMessage);
        return { result: null, skipped: false, durationMs };
      }

      console.error(`[StageRunner] ✗ ${label} failed after ${attempt} attempts:`, errorMessage);
      throw error;
    }
  }
}

/**
 * Run multiple independent stages concurrently with the same retry guarantees.
 * Useful for stages that don't depend on each other (though currently agents
 * run sequentially to avoid OOM — this is here for future use when memory
 * constraints are relaxed).
 */
export async function runStagesParallel<T>(
  configs: StageConfig<T>[]
): Promise<StageResult<T>[]> {
  return Promise.all(configs.map(c => runStage(c)));
}
