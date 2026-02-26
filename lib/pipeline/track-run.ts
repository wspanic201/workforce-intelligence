/**
 * Pipeline run tracking — creates and completes pipeline_runs records
 * for internal quality management and version comparison.
 */

import crypto from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { generateReportId } from '@/lib/utils/report-id';

export interface PipelineConfig {
  model: string;
  pipelineVersion: string;
  promptVersion?: string;
  reportTemplate: string;
  agentsEnabled: string[];
  tigerTeamEnabled: boolean;
  citationAgentEnabled: boolean;
  intelContextEnabled: boolean;
  modelProfile?: string | null;
  tigerTeamPersonas?: string[];
}

export interface PipelineResults {
  runtimeSeconds: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
  agentScores: Record<string, number>;
  compositeScore: number;
  recommendation: string;
  citationCorrections: number;
  citationWarnings: number;
  intelTablesUsed: number;
  reportPageCount?: number;
  reportSizeKb?: number;
  reportMarkdownHash: string;
  /** Full citation agent output for admin review (never shown to clients) */
  citationDetails?: {
    corrections: Array<{ componentType: string; original: string; corrected: string; reason: string }>;
    warnings: string[];
    dataSources: string[];
  };
}

/**
 * Create a pipeline_runs record at the start of a run.
 * Returns the run ID for later completion.
 */
export async function startPipelineRun(
  projectId: string,
  config: PipelineConfig
): Promise<string> {
  const supabase = getSupabaseServerClient();
  const reportId = await generateReportId(config.model, new Date());

  const { data, error } = await supabase
    .from('pipeline_runs')
    .insert({
      project_id: projectId,
      pipeline_version: config.pipelineVersion,
      model: config.model,
      prompt_version: config.promptVersion || null,
      report_template: config.reportTemplate,
      config: {
        agentsEnabled: config.agentsEnabled,
        citationAgentEnabled: config.citationAgentEnabled,
        intelContextEnabled: config.intelContextEnabled,
        model: config.model,
        modelProfile: config.modelProfile || null,
        tigerTeamPersonas: config.tigerTeamPersonas || null,
      },
      agents_run: config.agentsEnabled,
      tiger_team_enabled: config.tigerTeamEnabled,
      report_id: reportId,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('[PipelineTracker] Failed to create pipeline run:', error?.message);
    throw new Error(`Failed to create pipeline run: ${error?.message}`);
  }

  console.log(`[PipelineTracker] Started run ${data.id} for project ${projectId}`);
  return data.id;
}

/**
 * Update a pipeline_runs record when the run completes.
 */
export async function completePipelineRun(
  runId: string,
  results: PipelineResults
): Promise<void> {
  const supabase = getSupabaseServerClient();

  const { data: existingRun } = await supabase
    .from('pipeline_runs')
    .select('config')
    .eq('id', runId)
    .maybeSingle();

  const mergedConfig = results.citationDetails
    ? {
        ...(existingRun?.config || {}),
        citationDetails: results.citationDetails,
      }
    : undefined;

  const { error } = await supabase
    .from('pipeline_runs')
    .update({
      runtime_seconds: results.runtimeSeconds,
      total_tokens: results.totalTokens || null,
      estimated_cost_usd: results.estimatedCostUsd || null,
      agent_scores: results.agentScores,
      composite_score: results.compositeScore,
      recommendation: results.recommendation,
      citation_corrections: results.citationCorrections,
      citation_warnings: results.citationWarnings,
      intel_tables_used: results.intelTablesUsed,
      config: mergedConfig,
      report_version: 1,
      report_markdown_hash: results.reportMarkdownHash,
      report_page_count: results.reportPageCount || null,
      report_size_kb: results.reportSizeKb || null,
    })
    .eq('id', runId);

  if (error) {
    console.error('[PipelineTracker] Failed to complete pipeline run:', error.message);
  } else {
    console.log(`[PipelineTracker] Completed run ${runId} — ${results.compositeScore}/10 ${results.recommendation}`);
  }
}

/**
 * Compute SHA-256 hash of report markdown for change detection.
 */
export function hashMarkdown(markdown: string): string {
  return crypto.createHash('sha256').update(markdown).digest('hex');
}
