import { getSupabaseServerClient } from '@/lib/supabase/client';
import { ValidationProject, ResearchComponent } from '@/lib/types/database';
import { runMarketAnalysis } from './researchers/market-analyst';
import { runCompetitiveAnalysis } from './researchers/competitor-analyst';
import { runLearnerDemand } from './researchers/learner-demand';
import { runFinancialAnalysis } from './researchers/financial-analyst';
import { runInstitutionalFit } from './researchers/institutional-fit';
import { runRegulatoryCompliance } from './researchers/regulatory-analyst';
import { runEmployerDemand } from './researchers/employer-analyst';
import { runTigerTeam } from './tiger-team';
import { runQAReview } from './qa-reviewer';
import { runCitationAgent } from './researchers/citation-agent';
import { calculateProgramScore, buildDimensionScore, DIMENSION_WEIGHTS } from '@/lib/scoring/program-scorer';
import { generateReport } from '@/lib/reports/report-generator';
import { writeValidationBrief } from '@/lib/reports/validation-brief-writer';
import { enrichProject } from './project-enricher';
import type { DiscoveryContext } from '@/lib/stages/handoff';
import { getAgentIntelligenceContext, type AgentIntelligenceContext } from '@/lib/intelligence/agent-context';
import { startPipelineRun, completePipelineRun, hashMarkdown, type PipelineConfig } from '@/lib/pipeline/track-run';
import {
  loadValidationCheckpoints,
  markStageStarted,
  markStageCompleted,
  markStageFailed,
  shouldSkipStage,
} from '@/lib/pipeline/checkpoints';
import { logRunEvent } from '@/lib/pipeline/telemetry';
import { setRuntimeModelOverride } from '@/lib/ai/anthropic';

// Timeout wrapper for research agents
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, taskName: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${taskName} timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

// 7-stage agent configuration
const AGENT_CONFIG = [
  {
    type: 'labor_market' as const,
    dimension: 'Labor Market Demand',
    persona: 'market-analyst',
    runner: runMarketAnalysis,
    label: 'Labor Market Analysis',
  },
  {
    type: 'competitive_landscape' as const,
    dimension: 'Competitive Landscape',
    persona: 'research-director',
    runner: runCompetitiveAnalysis,
    label: 'Competitive Landscape',
  },
  {
    type: 'learner_demand' as const,
    dimension: 'Target Learner Demand',
    persona: 'learner-demand-analyst',
    runner: runLearnerDemand,
    label: 'Learner Demand Assessment',
  },
  {
    type: 'financial_viability' as const,
    dimension: 'Financial Viability',
    persona: 'cfo',
    runner: runFinancialAnalysis,
    label: 'Financial Viability',
  },
  {
    type: 'institutional_fit' as const,
    dimension: 'Institutional Fit & Capacity',
    persona: 'institutional-fit-analyst',
    runner: runInstitutionalFit,
    label: 'Institutional Fit',
  },
  {
    type: 'regulatory_compliance' as const,
    dimension: 'Regulatory & Compliance',
    persona: 'regulatory-compliance-analyst',
    runner: runRegulatoryCompliance,
    label: 'Regulatory & Compliance',
  },
  {
    type: 'employer_demand' as const,
    dimension: 'Employer Demand & Partnerships',
    persona: 'employer-demand-analyst',
    runner: runEmployerDemand,
    label: 'Employer Demand',
  },
];


const MAX_STAGE_ATTEMPTS = Math.max(1, parseInt(process.env.VALIDATION_STAGE_MAX_ATTEMPTS || '2', 10));
const STAGE_RETRY_BACKOFF_MS = Math.max(0, parseInt(process.env.VALIDATION_STAGE_RETRY_BACKOFF_MS || '2000', 10));

function componentTimestampValue(component: any): number {
  const completed = component?.completed_at ? Date.parse(component.completed_at) : 0;
  const created = component?.created_at ? Date.parse(component.created_at) : 0;
  return Math.max(completed || 0, created || 0);
}

function dedupeCompletedComponents<T extends { component_type: string }>(components: T[]): T[] {
  const byType = new Map<string, T>();
  for (const component of components) {
    const existing = byType.get(component.component_type);
    if (!existing || componentTimestampValue(component) >= componentTimestampValue(existing)) {
      byType.set(component.component_type, component);
    }
  }
  return Array.from(byType.values());
}

export interface OrchestrateValidationOptions {
  modelOverride?: string;
  modelProfile?: string;
  personaSlugs?: string[];
}

export async function orchestrateValidation(
  projectId: string,
  options: OrchestrateValidationOptions = {}
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const runtimeModel = options.modelOverride || process.env.VALIDATION_MODEL || 'claude-sonnet-4-6';
  const modelProfile = options.modelProfile || null;
  const tigerTeamPersonaSlugs = options.personaSlugs && options.personaSlugs.length
    ? options.personaSlugs
    : ['product-manager', 'cfo', 'cmo', 'coo'];
  setRuntimeModelOverride(runtimeModel);

  const orchestratorStart = Date.now();
  let pipelineRunId: string | null = null;
  let checkpointMap = new Map<string, { attempts?: number; payload?: Record<string, any> }>();
  const stageAttempts = new Map<string, number>();

  try {
    console.log(`[Orchestrator] Starting 7-stage validation for project ${projectId}`);

    // 1. Load project details
    const { data: project, error: projectError } = await supabase
      .from('validation_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    // 2. Enrich project with missing fields (occupation, SOC code, region, etc.)
    console.log('[Orchestrator] Enriching project with occupation, SOC code, and region...');
    const enrichment = await enrichProject(project as ValidationProject);
    
    // Update project with enriched data
    await supabase
      .from('validation_projects')
      .update({
        target_occupation: enrichment.target_occupation,
        geographic_area: enrichment.geographic_area,
        soc_codes: enrichment.soc_codes,
        industry_sector: enrichment.industry_sector,
        program_level: enrichment.program_level,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);
    
    // Reload project with enriched data
    const { data: enrichedProject } = await supabase
      .from('validation_projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    const projectToValidate = enrichedProject || project;
    
    console.log(`[Orchestrator] ✓ Enriched: Occupation="${enrichment.target_occupation}", SOC=${enrichment.soc_codes || 'none'}, Region="${enrichment.geographic_area}"`);

    // 2.5. Fetch shared intelligence via direct lookup (bypasses MCP HTTP loop)
    const intelContext: AgentIntelligenceContext = await getAgentIntelligenceContext(projectToValidate);
    (projectToValidate as any)._mcpIntelBlock = intelContext.promptBlock;
    (projectToValidate as any)._intelContext = intelContext;
    console.log(`[Orchestrator] Intel context: ${intelContext.tablesUsed.length} tables, ${intelContext.promptBlock.length} chars`);

    // 2.9. Start pipeline run tracking
    try {
      const pipelineConfig: PipelineConfig = {
        model: runtimeModel,
        pipelineVersion: 'v2.0',
        reportTemplate: 'professional-v2',
        agentsEnabled: AGENT_CONFIG.map(a => a.type),
        tigerTeamEnabled: true,
        citationAgentEnabled: true,
        intelContextEnabled: intelContext.tablesUsed.length > 0,
        modelProfile,
        tigerTeamPersonas: tigerTeamPersonaSlugs,
      };
      pipelineRunId = await startPipelineRun(projectId, pipelineConfig);
    } catch (e) {
      console.warn('[Orchestrator] Pipeline run tracking failed to start (non-fatal):', e);
    }

    checkpointMap = await loadValidationCheckpoints(projectId);
    for (const [stageKey, cp] of checkpointMap.entries()) {
      stageAttempts.set(stageKey, cp.attempts || 0);
    }

    // 3. Update status to researching
    await supabase
      .from('validation_projects')
      .update({ status: 'researching', updated_at: new Date().toISOString() })
      .eq('id', projectId);

    await logRunEvent({
      pipelineRunId,
      projectId,
      eventType: 'run_started',
      level: 'info',
      message: 'Validation pipeline started',
      metadata: { projectId },
    });

    // 4. Run all 7 research agents sequentially (prevents OOM crashes)
    console.log(`[Orchestrator] Running 7 research agents sequentially...`);

    const results: PromiseSettledResult<any>[] = [];

    for (const agent of AGENT_CONFIG) {
      const stageKey = agent.type;
      const shouldSkip = await shouldSkipStage(projectId, stageKey);
      if (shouldSkip) {
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_skipped',
          stageKey,
          level: 'info',
          message: `${agent.label} skipped (checkpoint complete)`,
        });
        results.push({ status: 'fulfilled', value: undefined });
        console.log(`[Orchestrator] ↷ Skipped ${agent.label} (checkpoint complete)`);
        continue;
      }

      let stageSucceeded = false;
      let lastError: unknown = null;

      while (!stageSucceeded) {
        const attempt = (stageAttempts.get(stageKey) || 0) + 1;
        stageAttempts.set(stageKey, attempt);

        const { data: componentRow, error: componentError } = await supabase
          .from('research_components')
          .insert({
            project_id: projectId,
            component_type: stageKey,
            agent_persona: agent.persona,
            status: 'pending',
            content: {},
          })
          .select()
          .single();

        if (componentError || !componentRow) {
          throw new Error(`Failed to create component: ${stageKey}`);
        }

        await markStageStarted(projectId, stageKey, attempt);
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_started',
          stageKey,
          level: 'info',
          message: `${agent.label} started`,
          metadata: { attempt, componentId: componentRow.id },
        });

        const stageStart = Date.now();
        try {
          console.log(`[Orchestrator] Starting ${agent.label} (attempt ${attempt}/${MAX_STAGE_ATTEMPTS})...`);

          const result = await withTimeout(
            runResearchComponent(
              projectId,
              componentRow.id,
              projectToValidate,
              agent.runner,
              agent.dimension
            ),
            360000, // 6 minutes per agent — streaming + stall detection handles hangs
            agent.label
          );

          const durationMs = Date.now() - stageStart;
          await markStageCompleted(projectId, stageKey, {
            componentId: componentRow.id,
            label: agent.label,
            data: result.data,
            markdown: result.markdown,
            score: result.score,
            scoreRationale: result.scoreRationale,
            completedAt: new Date().toISOString(),
          }, durationMs);
          await logRunEvent({
            pipelineRunId,
            projectId,
            eventType: 'stage_completed',
            stageKey,
            level: 'info',
            message: `${agent.label} completed`,
            metadata: { durationMs, attempt, componentId: componentRow.id },
          });

          results.push({ status: 'fulfilled', value: result });
          stageSucceeded = true;
          console.log(`[Orchestrator] ✓ ${agent.label} completed`);
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
            level: 'error',
            message: `${agent.label} failed`,
            metadata: { durationMs, attempt, error: errorMessage, componentId: componentRow.id },
          });

          if (attempt < MAX_STAGE_ATTEMPTS) {
            const backoffMs = STAGE_RETRY_BACKOFF_MS * attempt;
            await logRunEvent({
              pipelineRunId,
              projectId,
              eventType: 'stage_retry_scheduled',
              stageKey,
              level: 'warn',
              message: `${agent.label} retry scheduled`,
              metadata: { attempt, nextAttempt: attempt + 1, backoffMs, error: errorMessage },
            });
            console.warn(`[Orchestrator] ⚠ ${agent.label} failed (attempt ${attempt}/${MAX_STAGE_ATTEMPTS}), retrying in ${backoffMs}ms...`);
            if (backoffMs > 0) {
              await new Promise((resolve) => setTimeout(resolve, backoffMs));
            }
            continue;
          }

          results.push({ status: 'rejected', reason: error });
          console.error(`[Orchestrator] ✗ ${agent.label} failed after ${attempt} attempts:`, error);
          break;
        }
      }

      if (!stageSucceeded && lastError) {
        console.warn(`[Orchestrator] ${agent.label} exhausted retries:`, lastError instanceof Error ? lastError.message : String(lastError));
      }
    }

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[Orchestrator] ${successCount}/${results.length} research agents completed successfully`);

    // 6. Load completed research components
    const { data: completedComponents, error: componentsError } = await supabase
      .from('research_components')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'completed');

    if (componentsError) {
      throw new Error(`Failed to load research components: ${componentsError.message}`);
    }

    let normalizedCompletedComponents = dedupeCompletedComponents((completedComponents || []) as any[]);

    // If a completed checkpoint exists but component row is missing, reuse checkpoint payload.
    for (const agent of AGENT_CONFIG) {
      if (normalizedCompletedComponents.find(c => c.component_type === agent.type)) continue;
      const cp = checkpointMap.get(agent.type);
      if (cp?.payload?.markdown || cp?.payload?.data) {
        normalizedCompletedComponents.push({
          id: cp.payload.componentId || `checkpoint-${projectId}-${agent.type}`,
          project_id: projectId,
          component_type: agent.type,
          agent_persona: agent.persona,
          content: cp.payload.data || {},
          markdown_output: cp.payload.markdown || '',
          status: 'completed',
          created_at: cp.payload.createdAt || new Date().toISOString(),
          completed_at: cp.payload.completedAt || new Date().toISOString(),
          dimension_score: cp.payload.score || null,
          score_rationale: cp.payload.scoreRationale || null,
        } as any);
      }
    }

    console.log(`[Orchestrator] Found ${normalizedCompletedComponents.length} completed components in DB/checkpoints`);

    // Validate minimum completion threshold
    if (normalizedCompletedComponents.length === 0) {
      const { data: allComponents } = await supabase
        .from('research_components')
        .select('id, component_type, status')
        .eq('project_id', projectId);
      console.log(`[Orchestrator] All components:`, JSON.stringify(allComponents?.map(c => ({ type: c.component_type, status: c.status }))));
      throw new Error(`No research completed (0/7). Cannot proceed.`);
    }

    // Warn if partial completion but proceed
    if (normalizedCompletedComponents.length < 7) {
      console.warn(`[Orchestrator] ⚠️  Only ${normalizedCompletedComponents.length}/7 agents completed - proceeding with partial data`);
      console.warn(`[Orchestrator] Report quality may be reduced due to missing dimensions`);
    }

    // 7. Run citation agent for fact-checking and inline citations
    let citationResults: Awaited<ReturnType<typeof runCitationAgent>> | null = null;
    const citationStageKey = 'citation_agent';
    const skipCitation = await shouldSkipStage(projectId, citationStageKey);
    if (skipCitation) {
      const { data: citationComponent } = await supabase
        .from('research_components')
        .select('content')
        .eq('project_id', projectId)
        .eq('component_type', 'citation_verification')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      citationResults = (citationComponent?.content || null) as any;
      await logRunEvent({
        pipelineRunId,
        projectId,
        eventType: 'stage_skipped',
        stageKey: citationStageKey,
        level: 'info',
        message: 'Citation agent skipped (checkpoint complete)',
      });
      console.log('[Orchestrator] ↷ Skipped Citation Agent (checkpoint complete)');
    } else {
      let citationSucceeded = false;
      while (!citationSucceeded) {
        const attempt = (stageAttempts.get(citationStageKey) || 0) + 1;
        stageAttempts.set(citationStageKey, attempt);
        await markStageStarted(projectId, citationStageKey, attempt);
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_started',
          stageKey: citationStageKey,
          level: 'info',
          message: 'Citation agent started',
          metadata: { attempt },
        });
        const citationStart = Date.now();
        try {
          console.log(`[Orchestrator] Running citation agent for fact-checking (attempt ${attempt}/${MAX_STAGE_ATTEMPTS})...`);

          // Extract markdown from completed components
          const componentsByType = normalizedCompletedComponents.reduce((acc, c) => {
            const key = c.component_type.replace('_', '');
            acc[key] = c.markdown_output || '';
            return acc;
          }, {} as Record<string, string>);

          citationResults = await withTimeout(
            runCitationAgent({
              projectId,
              occupation: projectToValidate.target_occupation || projectToValidate.program_name || 'Unknown',
              state: projectToValidate.geographic_area || 'United States',
              regulatoryAnalysis: componentsByType['regulatorycompliance'],
              marketAnalysis: componentsByType['labormarket'],
              employerAnalysis: componentsByType['employerdemand'],
              financialAnalysis: componentsByType['financialviability'],
              academicAnalysis: componentsByType['institutionalfit'],
              demographicAnalysis: componentsByType['learnerdemand'],
              competitiveAnalysis: componentsByType['competitivelandscape'],
            }),
            300000, // 5 minutes for citation verification
            'Citation Agent'
          );

          // Store citation results in database
          await supabase.from('research_components').insert({
            project_id: projectId,
            component_type: 'citation_verification',
            agent_persona: 'citation-agent',
            status: 'completed',
            content: citationResults,
            markdown_output: `# Citation Verification\n\n${citationResults.summary}\n\n## Verified Claims\n${citationResults.verifiedClaims.map(c => `- ${c.claim} [${c.citation}]`).join('\n')}\n\n${citationResults.warnings.length > 0 ? `## Warnings\n${citationResults.warnings.map(w => `- ${w}`).join('\n')}` : ''}`,
          });

          const durationMs = Date.now() - citationStart;
          await markStageCompleted(projectId, citationStageKey, {
            verifiedClaims: citationResults.verifiedClaims.length,
            warnings: citationResults.warnings.length,
            corrections: citationResults.corrections?.length || 0,
          }, durationMs);
          await logRunEvent({
            pipelineRunId,
            projectId,
            eventType: 'stage_completed',
            stageKey: citationStageKey,
            level: 'info',
            message: `Citation agent complete — ${citationResults.verifiedClaims.length} claims verified`,
            metadata: {
              durationMs,
              attempt,
              verifiedClaims: citationResults.verifiedClaims.length,
              warnings: citationResults.warnings.length,
              corrections: citationResults.corrections?.length || 0,
            },
          });

          console.log(`[Orchestrator] ✓ Citation agent complete — ${citationResults.verifiedClaims.length} claims verified`);

          // Apply citation corrections to component markdown before report generation
          if (citationResults.corrections && citationResults.corrections.length > 0) {
            console.log(`[Orchestrator] Applying ${citationResults.corrections.length} citation corrections...`);
            for (const correction of citationResults.corrections) {
              // Find matching component by type
              const comp = normalizedCompletedComponents.find(c => c.component_type === correction.componentType);
              if (comp && comp.markdown_output && comp.markdown_output.includes(correction.original)) {
                comp.markdown_output = comp.markdown_output.replace(correction.original, correction.corrected);
                console.log(`[Orchestrator]   ✓ Corrected [${correction.componentType}]: ${correction.reason}`);
              }
            }
          }

          citationSucceeded = true;
        } catch (e) {
          const durationMs = Date.now() - citationStart;
          const errorMessage = e instanceof Error ? e.message : String(e);
          await markStageFailed(projectId, citationStageKey, errorMessage, durationMs);
          await logRunEvent({
            pipelineRunId,
            projectId,
            eventType: 'stage_failed',
            stageKey: citationStageKey,
            level: 'warn',
            message: 'Citation agent failed; continuing',
            metadata: { durationMs, attempt, error: errorMessage },
          });

          if (attempt < MAX_STAGE_ATTEMPTS) {
            const backoffMs = STAGE_RETRY_BACKOFF_MS * attempt;
            await logRunEvent({
              pipelineRunId,
              projectId,
              eventType: 'stage_retry_scheduled',
              stageKey: citationStageKey,
              level: 'warn',
              message: 'Citation agent retry scheduled',
              metadata: { attempt, nextAttempt: attempt + 1, backoffMs, error: errorMessage },
            });
            if (backoffMs > 0) {
              await new Promise((resolve) => setTimeout(resolve, backoffMs));
            }
            continue;
          }

          console.warn('[Orchestrator] Citation agent failed, continuing without citation verification:', e);
          break;
        }
      }
    }

    // 8. Calculate program scores
    console.log(`[Orchestrator] Calculating program scores...`);

    const dimensionScores = normalizedCompletedComponents
      .filter(c => {
        const score = c.dimension_score ?? (c.content as any)?._score ?? (c.content as any)?.score;
        return score != null;
      })
      .map(c => {
        const agentConfig = AGENT_CONFIG.find(a => a.type === c.component_type);
        if (!agentConfig) return null;
        const score = c.dimension_score ?? (c.content as any)?._score ?? (c.content as any)?.score;
        const rationale = c.score_rationale ?? (c.content as any)?._scoreRationale ?? (c.content as any)?.scoreRationale ?? 'Score derived from agent analysis';
        return buildDimensionScore(
          agentConfig.dimension,
          score,
          rationale
        );
      })
      .filter(Boolean) as any[];

    // Fill in defaults for missing dimensions
    for (const agent of AGENT_CONFIG) {
      if (!dimensionScores.find(d => d.dimension === agent.dimension)) {
        dimensionScores.push(buildDimensionScore(agent.dimension, 5, 'Default score — agent did not complete'));
      }
    }

    const programScore = calculateProgramScore(dimensionScores);

    console.log(`[Orchestrator] Composite Score: ${programScore.compositeScore}/10 — ${programScore.recommendation}`);

    // 9. Run tiger team synthesis (optional, for backward compat)
    let tigerTeamMarkdown = '';
    const tigerTeamStageKey = 'tiger_team';
    const skipTigerTeam = await shouldSkipStage(projectId, tigerTeamStageKey);
    if (skipTigerTeam) {
      const { data: tigerTeamComponent } = await supabase
        .from('research_components')
        .select('markdown_output')
        .eq('project_id', projectId)
        .eq('component_type', 'tiger_team_synthesis')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      tigerTeamMarkdown = tigerTeamComponent?.markdown_output || '';
      await logRunEvent({
        pipelineRunId,
        projectId,
        eventType: 'stage_skipped',
        stageKey: tigerTeamStageKey,
        level: 'info',
        message: 'Tiger team synthesis skipped (checkpoint complete)',
      });
      console.log('[Orchestrator] ↷ Skipped Tiger Team (checkpoint complete)');
    } else {
      let tigerSucceeded = false;
      while (!tigerSucceeded) {
        const attempt = (stageAttempts.get(tigerTeamStageKey) || 0) + 1;
        stageAttempts.set(tigerTeamStageKey, attempt);
        await markStageStarted(projectId, tigerTeamStageKey, attempt);
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_started',
          stageKey: tigerTeamStageKey,
          level: 'info',
          message: 'Tiger team synthesis started',
          metadata: { attempt },
        });
        const tigerTeamStart = Date.now();
        try {
          console.log(`[Orchestrator] Running tiger team synthesis (attempt ${attempt}/${MAX_STAGE_ATTEMPTS})...`);
          const { synthesis, markdown } = await withTimeout(
            runTigerTeam(
              projectId,
              projectToValidate as ValidationProject,
              normalizedCompletedComponents as ResearchComponent[],
              { personaSlugs: tigerTeamPersonaSlugs }
            ),
            420000, // 7 minutes for tiger team — streaming handles hangs
            'Tiger Team Synthesis'
          );
          tigerTeamMarkdown = markdown;

          await supabase.from('research_components').insert({
            project_id: projectId,
            component_type: 'tiger_team_synthesis',
            agent_persona: 'multi-persona',
            status: 'completed',
            content: synthesis,
            markdown_output: tigerTeamMarkdown,
          });

          const durationMs = Date.now() - tigerTeamStart;
          await markStageCompleted(projectId, tigerTeamStageKey, {
            markdownLength: tigerTeamMarkdown.length,
            synthesisGenerated: true,
          }, durationMs);
          await logRunEvent({
            pipelineRunId,
            projectId,
            eventType: 'stage_completed',
            stageKey: tigerTeamStageKey,
            level: 'info',
            message: 'Tiger team synthesis completed',
            metadata: { durationMs, attempt, markdownLength: tigerTeamMarkdown.length },
          });
          tigerSucceeded = true;
        } catch (e) {
          const durationMs = Date.now() - tigerTeamStart;
          const errorMessage = e instanceof Error ? e.message : String(e);
          await markStageFailed(projectId, tigerTeamStageKey, errorMessage, durationMs);
          await logRunEvent({
            pipelineRunId,
            projectId,
            eventType: 'stage_failed',
            stageKey: tigerTeamStageKey,
            level: 'warn',
            message: 'Tiger team synthesis failed; continuing',
            metadata: { durationMs, attempt, error: errorMessage },
          });

          if (attempt < MAX_STAGE_ATTEMPTS) {
            const backoffMs = STAGE_RETRY_BACKOFF_MS * attempt;
            await logRunEvent({
              pipelineRunId,
              projectId,
              eventType: 'stage_retry_scheduled',
              stageKey: tigerTeamStageKey,
              level: 'warn',
              message: 'Tiger team synthesis retry scheduled',
              metadata: { attempt, nextAttempt: attempt + 1, backoffMs, error: errorMessage },
            });
            if (backoffMs > 0) {
              await new Promise((resolve) => setTimeout(resolve, backoffMs));
            }
            continue;
          }

          console.warn('[Orchestrator] Tiger team synthesis failed, continuing with report generation:', e);
          break;
        }
      }
    }

    // 9.5. Apply citation corrections to tiger team markdown
    if (citationResults?.corrections && citationResults.corrections.length > 0 && tigerTeamMarkdown) {
      for (const correction of citationResults.corrections) {
        if (tigerTeamMarkdown.includes(correction.original)) {
          tigerTeamMarkdown = tigerTeamMarkdown.replace(correction.original, correction.corrected);
          console.log(`[Orchestrator]   ✓ Tiger team corrected: ${correction.reason}`);
        }
      }
    }

    // 10. Generate report FIRST (so a crash during QA doesn't lose everything)
    let fullReport = '';
    let reportRow: { id: string } | null = null;
    const reportStageKey = 'report_generation';
    const skipReport = await shouldSkipStage(projectId, reportStageKey);
    if (skipReport) {
      const { data: latestReport } = await supabase
        .from('validation_reports')
        .select('id, full_report_markdown')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestReport?.full_report_markdown) {
        fullReport = latestReport.full_report_markdown;
        reportRow = latestReport;
      }

      await logRunEvent({
        pipelineRunId,
        projectId,
        eventType: 'stage_skipped',
        stageKey: reportStageKey,
        level: 'info',
        message: 'Report generation skipped (checkpoint complete)',
      });
      console.log('[Orchestrator] ↷ Skipped Report Generation (checkpoint complete)');
    } else {
      let reportSucceeded = false;
      while (!reportSucceeded) {
        const attempt = (stageAttempts.get(reportStageKey) || 0) + 1;
        stageAttempts.set(reportStageKey, attempt);
        await markStageStarted(projectId, reportStageKey, attempt);
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_started',
          stageKey: reportStageKey,
          level: 'info',
          message: 'Report generation started',
          metadata: { attempt },
        });

        const reportStart = Date.now();
        console.log(`[Orchestrator] Generating professional report (attempt ${attempt}/${MAX_STAGE_ATTEMPTS})...`);

        try {
          try {
            fullReport = await writeValidationBrief({
              project: projectToValidate as ValidationProject,
              components: normalizedCompletedComponents as ResearchComponent[],
              programScore,
              tigerTeamMarkdown,
            });
            console.log('[Orchestrator] ✓ Validation brief writer generated polished report');
          } catch (e) {
            console.warn('[Orchestrator] Validation brief writer failed, falling back to legacy report generator:', e);
            fullReport = generateReport({
              project: projectToValidate as ValidationProject,
              components: normalizedCompletedComponents as ResearchComponent[],
              programScore,
              tigerTeamMarkdown,
            });
          }

          // Save initial report (only columns that exist: project_id, executive_summary, full_report_markdown, version)
          const { data, error: reportError } = await supabase.from('validation_reports').insert({
            project_id: projectId,
            executive_summary: `Recommendation: ${programScore.recommendation} (${programScore.compositeScore}/10)\n\nDimensions: ${programScore.dimensions.map((d: any) => `${d.dimension}: ${d.score}/10`).join(', ')}`,
            full_report_markdown: fullReport,
            version: 1,
          }).select('id').single();
          reportRow = data || null;

          if (reportError) {
            throw new Error(`Report save failed: ${reportError.message}`);
          }

          const durationMs = Date.now() - reportStart;
          await markStageCompleted(projectId, reportStageKey, {
            reportId: reportRow?.id || null,
            reportLength: fullReport.length,
            reportHash: hashMarkdown(fullReport),
          }, durationMs);
          await logRunEvent({
            pipelineRunId,
            projectId,
            eventType: 'stage_completed',
            stageKey: reportStageKey,
            level: 'info',
            message: `Report generated (${fullReport.length} chars)`,
            metadata: { durationMs, attempt, reportId: reportRow?.id || null, reportLength: fullReport.length },
          });

          console.log(`[Orchestrator] ✓ Report saved (${fullReport.length} chars)`);
          reportSucceeded = true;
        } catch (reportErr) {
          const durationMs = Date.now() - reportStart;
          const errorMessage = reportErr instanceof Error ? reportErr.message : String(reportErr);
          await markStageFailed(projectId, reportStageKey, errorMessage, durationMs);
          await logRunEvent({
            pipelineRunId,
            projectId,
            eventType: 'stage_failed',
            stageKey: reportStageKey,
            level: 'error',
            message: 'Report generation failed',
            metadata: { durationMs, attempt, error: errorMessage },
          });

          if (attempt < MAX_STAGE_ATTEMPTS) {
            const backoffMs = STAGE_RETRY_BACKOFF_MS * attempt;
            await logRunEvent({
              pipelineRunId,
              projectId,
              eventType: 'stage_retry_scheduled',
              stageKey: reportStageKey,
              level: 'warn',
              message: 'Report generation retry scheduled',
              metadata: { attempt, nextAttempt: attempt + 1, backoffMs, error: errorMessage },
            });
            if (backoffMs > 0) {
              await new Promise((resolve) => setTimeout(resolve, backoffMs));
            }
            continue;
          }

          throw reportErr;
        }
      }
    }

    // 11. QA Review — optional fact-check, updates report if issues found
    // DISABLED: QA's 80K+ token prompt causes OOM on 8GB machines
    // TODO: Re-enable with summarized inputs instead of raw agent outputs
    if (false && tigerTeamMarkdown) {
      try {
        console.log(`[Orchestrator] Running QA review / fact-check...`);
        const qaResult = await runQAReview(
          tigerTeamMarkdown,
          normalizedCompletedComponents as ResearchComponent[],
          { program_name: projectToValidate.program_name!, client_name: projectToValidate.client_name! }
        );

        if (qaResult.issueCount.critical > 0 || qaResult.issueCount.warning > 0) {
          console.log(`[Orchestrator] QA found ${qaResult.issueCount.critical} critical, ${qaResult.issueCount.warning} warning issues — updating report`);
          tigerTeamMarkdown = qaResult.cleanedMarkdown;

          // Regenerate report with QA-cleaned tiger team
          fullReport = generateReport({
            project: projectToValidate as ValidationProject,
            components: normalizedCompletedComponents as ResearchComponent[],
            programScore,
            tigerTeamMarkdown,
      
          });

          // Update the saved report
          if (reportRow?.id) {
            await supabase.from('validation_reports')
              .update({ full_report_markdown: fullReport, version: 2 })
              .eq('id', reportRow!.id);
          }

          // Log QA results
          await supabase.from('research_components').insert({
            project_id: projectId,
            component_type: 'qa_review',
            agent_persona: 'qa-reviewer',
            status: 'completed',
            content: { issues: qaResult.issues, issueCount: qaResult.issueCount },
            markdown_output: `QA Review: ${qaResult.issueCount.critical} critical, ${qaResult.issueCount.warning} warnings fixed`,
          });
        } else {
          console.log(`[Orchestrator] QA review passed — no issues found`);
        }
      } catch (e) {
        console.warn('[Orchestrator] QA review failed — report already saved without QA:', e);
      }
    }

    // 11.5. Complete pipeline run tracking
    if (pipelineRunId) {
      try {
        const runtimeSeconds = (Date.now() - orchestratorStart) / 1000;
        const agentScores: Record<string, number> = {};
        for (const comp of normalizedCompletedComponents || []) {
          const score = comp.dimension_score ?? (comp.content as any)?._score ?? (comp.content as any)?.score;
          if (score != null) agentScores[comp.component_type] = score;
        }
        await completePipelineRun(pipelineRunId, {
          runtimeSeconds,
          agentScores,
          compositeScore: programScore.compositeScore,
          recommendation: programScore.recommendation,
          citationCorrections: citationResults?.corrections?.length ?? 0,
          citationWarnings: citationResults?.warnings?.length ?? 0,
          intelTablesUsed: intelContext.tablesUsed.length,
          reportMarkdownHash: hashMarkdown(fullReport),
          reportSizeKb: Math.round(Buffer.from(fullReport).length / 1024),
        });
      } catch (e) {
        console.warn('[Orchestrator] Pipeline run tracking failed to complete (non-fatal):', e);
      }
    }

    // 11.6. Generate PDF and upload to Supabase Storage
    const pdfStageKey = 'pdf_generation';
    const skipPdf = await shouldSkipStage(projectId, pdfStageKey);
    if (skipPdf) {
      await logRunEvent({
        pipelineRunId,
        projectId,
        eventType: 'stage_skipped',
        stageKey: pdfStageKey,
        level: 'info',
        message: 'PDF generation skipped (checkpoint complete)',
      });
      console.log('[Orchestrator] ↷ Skipped PDF Generation (checkpoint complete)');
    } else {
      let pdfSucceeded = false;
      while (!pdfSucceeded) {
        const attempt = (stageAttempts.get(pdfStageKey) || 0) + 1;
        stageAttempts.set(pdfStageKey, attempt);
        await markStageStarted(projectId, pdfStageKey, attempt);
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_started',
          stageKey: pdfStageKey,
          level: 'info',
          message: 'PDF generation started',
          metadata: { attempt },
        });

        const pdfStart = Date.now();
        try {
          console.log(`[Orchestrator] Generating PDF (attempt ${attempt}/${MAX_STAGE_ATTEMPTS})...`);
          const { buildValidationPDF } = await import('@/lib/reports/build-pdf');
          const pdfResult = await buildValidationPDF(supabase, {
            projectId,
            programName: projectToValidate.program_name || 'Program',
            clientName: projectToValidate.client_name || '',
            fullReport,
          });

          // Update report record with storage path
          if (reportRow?.id) {
            await supabase.from('validation_reports')
              .update({ pdf_url: pdfResult.storagePath })
              .eq('id', reportRow.id);
          }

          // Update pipeline run with page count and size
          if (pipelineRunId) {
            await supabase.from('pipeline_runs')
              .update({ report_page_count: pdfResult.pageCount, report_size_kb: pdfResult.sizeKB })
              .eq('id', pipelineRunId);
          }

          const durationMs = Date.now() - pdfStart;
          await markStageCompleted(projectId, pdfStageKey, {
            pageCount: pdfResult.pageCount,
            sizeKB: pdfResult.sizeKB,
            storagePath: pdfResult.storagePath,
          }, durationMs);
          await logRunEvent({
            pipelineRunId,
            projectId,
            eventType: 'stage_completed',
            stageKey: pdfStageKey,
            level: 'info',
            message: `PDF uploaded (${pdfResult.pageCount} pages)`,
            metadata: {
              durationMs,
              attempt,
              pageCount: pdfResult.pageCount,
              sizeKB: pdfResult.sizeKB,
            },
          });

          console.log(`[Orchestrator] ✓ PDF uploaded (${pdfResult.pageCount} pages, ${pdfResult.sizeKB}KB)`);
          pdfSucceeded = true;
        } catch (pdfErr: unknown) {
          const durationMs = Date.now() - pdfStart;
          const errorMessage = (pdfErr as Error).message;
          await markStageFailed(projectId, pdfStageKey, errorMessage, durationMs);
          await logRunEvent({
            pipelineRunId,
            projectId,
            eventType: 'stage_failed',
            stageKey: pdfStageKey,
            level: 'warn',
            message: 'PDF generation failed (non-fatal)',
            metadata: { durationMs, attempt, error: errorMessage },
          });

          if (attempt < MAX_STAGE_ATTEMPTS) {
            const backoffMs = STAGE_RETRY_BACKOFF_MS * attempt;
            await logRunEvent({
              pipelineRunId,
              projectId,
              eventType: 'stage_retry_scheduled',
              stageKey: pdfStageKey,
              level: 'warn',
              message: 'PDF generation retry scheduled',
              metadata: { attempt, nextAttempt: attempt + 1, backoffMs, error: errorMessage },
            });
            if (backoffMs > 0) {
              await new Promise((resolve) => setTimeout(resolve, backoffMs));
            }
            continue;
          }

          console.warn(`[Orchestrator] PDF generation failed (non-fatal):`, errorMessage);
          break;
        }
      }
    }

    // 12. Update project status
    await supabase
      .from('validation_projects')
      .update({
        status: 'review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    await logRunEvent({
      pipelineRunId,
      projectId,
      eventType: 'run_completed',
      level: 'info',
      message: 'Validation pipeline completed',
      metadata: {
        recommendation: programScore.recommendation,
        compositeScore: programScore.compositeScore,
        runtimeMs: Date.now() - orchestratorStart,
      },
    });

    console.log(`[Orchestrator] 7-stage validation complete for project ${projectId}`);
    console.log(`[Orchestrator] Final: ${programScore.recommendation} (${programScore.compositeScore}/10)`);
  } catch (error) {
    console.error(`[Orchestrator] Fatal error:`, error);

    await logRunEvent({
      pipelineRunId,
      projectId,
      eventType: 'run_failed',
      level: 'error',
      message: 'Validation pipeline failed',
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        runtimeMs: Date.now() - orchestratorStart,
      },
    });

    await supabase
      .from('validation_projects')
      .update({
        status: 'error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    throw error;
  } finally {
    setRuntimeModelOverride(null);
  }
}

async function runResearchComponent(
  projectId: string,
  componentId: string,
  project: any,
  researchFunction: (projectId: string, project: any) => Promise<{ data: any; markdown: string }>,
  dimensionName: string
): Promise<{ data: any; markdown: string; score: number | null; scoreRationale: string | null }> {
  const supabase = getSupabaseServerClient();

  try {
    // Update status to in_progress
    await supabase
      .from('research_components')
      .update({ status: 'in_progress' })
      .eq('id', componentId);

    // Run research
    const { data, markdown } = await researchFunction(projectId, project);

    // Extract score from agent output if available
    const score = data?.score ?? null;
    const rationale = data?.scoreRationale ?? null;

    // Update component — store score in content JSON since dimension_score column may not exist
    const { error: updateError } = await supabase
      .from('research_components')
      .update({
        status: 'completed',
        content: { ...data, _score: score, _scoreRationale: rationale },
        markdown_output: markdown,
      })
      .eq('id', componentId);

    if (updateError) {
      console.error(`[Orchestrator] Failed to update component ${componentId}:`, updateError);
      // Last resort — just update status
      await supabase
        .from('research_components')
        .update({ status: 'completed' })
        .eq('id', componentId);
    }

    console.log(`[Orchestrator] ${dimensionName} completed${score ? ` — Score: ${score}/10` : ''}`);
    return { data, markdown, score, scoreRationale: rationale };
  } catch (error) {
    console.error(`[Orchestrator] ${dimensionName} failed:`, error);

    await supabase
      .from('research_components')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : String(error),
        completed_at: new Date().toISOString(),
      })
      .eq('id', componentId);

    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// In-Memory Validation (for Pipeline — no Supabase required)
// ═══════════════════════════════════════════════════════════════

/** Result from in-memory validation */
export interface InMemoryValidationResult {
  project: Record<string, any>;
  components: Array<{
    type: string;
    dimension: string;
    data: any;
    markdown: string;
    score: number | null;
    scoreRationale: string | null;
    status: 'completed' | 'error';
    error?: string;
  }>;
  programScore: ReturnType<typeof calculateProgramScore>;
  tigerTeamMarkdown: string;
  fullReport: string;
  discoveryContextUsed: boolean;
}

/**
 * Run validation in-memory without Supabase.
 * Used by the Pipeline orchestrator for Discovery → Validation flow.
 * 
 * When discoveryContext is provided:
 *   - Skips the AI enrichment step (SOC, region, occupation already known)
 *   - Injects relevant Discovery data into each agent's prompt via project._discoveryContext
 *   - Agents use Discovery data as a starting point, then do their own research
 */
export async function orchestrateValidationInMemory(
  projectData: Record<string, any>,
  discoveryContext?: DiscoveryContext
): Promise<InMemoryValidationResult> {
  const startTime = Date.now();
  let checkpointMap = new Map<string, { attempts?: number; payload?: Record<string, any> }>();
  const stageAttempts = new Map<string, number>();

  console.log(`[Orchestrator:InMemory] Starting validation for "${projectData.program_name || projectData.title}"`);

  // Build the full project object that agents expect
  const projectData_ = {
    program_name: projectData.program_name || projectData.title,
    client_name: projectData.client_name || projectData.collegeName || 'Unknown Institution',
    client_email: 'pipeline@wavelength.local',
    program_type: projectData.program_type || projectData.level || 'certificate',
    target_audience: projectData.target_audience || 'Adult learners and career changers',
    target_occupation: projectData.target_occupation || projectData.occupation || '',
    geographic_area: projectData.geographic_area || projectData.region || 'United States',
    soc_codes: projectData.soc_codes || projectData.soc_code || '',
    industry_sector: projectData.industry_sector || projectData.sector || '',
    program_level: projectData.program_level || projectData.level || 'certificate',
    constraints: projectData.constraints || '',
    status: 'researching' as const,
  };

  // Persist to Supabase — only include columns that exist in validation_projects table
  let projectId = `inmemory-${Date.now()}`;
  try {
    const supabase = getSupabaseServerClient();
    const { data: dbProject, error: dbError } = await supabase
      .from('validation_projects')
      .insert({
        program_name: projectData_.program_name,
        client_name: projectData_.client_name,
        client_email: projectData_.client_email,
        program_type: projectData_.program_type,
        target_audience: projectData_.target_audience,
        constraints: projectData_.constraints,
        status: projectData_.status,
      })
      .select('id')
      .single();
    if (dbProject && !dbError) {
      projectId = dbProject.id;
      console.log(`[Orchestrator:InMemory] ✓ Created validation_project: ${projectId}`);
    } else {
      console.warn('[Orchestrator:InMemory] Failed to create DB project (non-fatal):', dbError?.message);
    }
  } catch (e) {
    console.warn('[Orchestrator:InMemory] DB insert failed (non-fatal):', e);
  }

  const project: Record<string, any> = {
    id: projectId,
    ...projectData_,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // When discoveryContext is present, skip enrichment — we already have the data
  if (discoveryContext) {
    console.log(`[Orchestrator:InMemory] ✓ Discovery context provided — skipping AI enrichment`);
    console.log(`[Orchestrator:InMemory]   College: ${discoveryContext.collegeName}`);
    console.log(`[Orchestrator:InMemory]   Region: ${discoveryContext.region}`);
    console.log(`[Orchestrator:InMemory]   Occupation: ${project.target_occupation}`);
    console.log(`[Orchestrator:InMemory]   SOC: ${project.soc_codes}`);

    // Attach discovery context to project so agents can access it
    project._discoveryContext = discoveryContext;
  } else {
    // No discovery context — run the enricher like normal standalone validation
    console.log('[Orchestrator:InMemory] No discovery context — running AI enrichment...');
    try {
      const enrichment = await enrichProject(project as any);
      project.target_occupation = enrichment.target_occupation;
      project.geographic_area = enrichment.geographic_area;
      project.soc_codes = enrichment.soc_codes;
      project.industry_sector = enrichment.industry_sector;
      project.program_level = enrichment.program_level;
      console.log(`[Orchestrator:InMemory] ✓ Enriched: ${enrichment.target_occupation}, SOC=${enrichment.soc_codes}`);
    } catch (err) {
      console.warn('[Orchestrator:InMemory] Enrichment failed, continuing with provided data:', err);
    }
  }

  // Start pipeline run tracking (best-effort, don't break in-memory flow)
  let pipelineRunId: string | null = null;
  try {
    const pipelineConfig: PipelineConfig = {
      model: 'claude-sonnet-4-6',
      pipelineVersion: 'v2.0',
      reportTemplate: 'professional-v2',
      agentsEnabled: AGENT_CONFIG.map(a => a.type),
      tigerTeamEnabled: true,
      citationAgentEnabled: true,
      intelContextEnabled: false,
    };
    pipelineRunId = await startPipelineRun(project.id, pipelineConfig);
  } catch (e) {
    console.warn('[Orchestrator:InMemory] Pipeline run tracking failed to start (non-fatal):', e);
  }

  if (!projectId.startsWith('inmemory-')) {
    checkpointMap = await loadValidationCheckpoints(projectId);
    for (const [stageKey, cp] of checkpointMap.entries()) {
      stageAttempts.set(stageKey, cp.attempts || 0);
    }
  }

  await logRunEvent({
    pipelineRunId,
    projectId: project.id,
    eventType: 'run_started',
    level: 'info',
    message: 'In-memory validation pipeline started',
    metadata: { discoveryContextUsed: !!discoveryContext },
  });

  // Run all 7 research agents sequentially
  console.log(`[Orchestrator:InMemory] Running 7 research agents sequentially...`);

  const components: InMemoryValidationResult['components'] = [];
  const fakeProjectId = project.id;
  const hasPersistentProject = !projectId.startsWith('inmemory-');

  for (const agent of AGENT_CONFIG) {
    const stageKey = agent.type;
    if (hasPersistentProject) {
      const skip = await shouldSkipStage(projectId, stageKey);
      if (skip) {
        const cp = checkpointMap.get(stageKey);
        const payload = cp?.payload || {};
        components.push({
          type: stageKey,
          dimension: agent.dimension,
          data: payload.data || {},
          markdown: payload.markdown || '',
          score: payload.score ?? null,
          scoreRationale: payload.scoreRationale ?? null,
          status: 'completed',
        });
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_skipped',
          stageKey,
          level: 'info',
          message: `${agent.label} skipped (checkpoint complete)`,
        });
        console.log(`[Orchestrator:InMemory] ↷ Skipped ${agent.label} (checkpoint complete)`);
        continue;
      }
    }

    let stageSucceeded = false;
    let finalError: string | null = null;

    while (!stageSucceeded) {
      const attempt = (stageAttempts.get(stageKey) || 0) + 1;
      stageAttempts.set(stageKey, attempt);

      if (hasPersistentProject) {
        await markStageStarted(projectId, stageKey, attempt);
      }
      await logRunEvent({
        pipelineRunId,
        projectId,
        eventType: 'stage_started',
        stageKey,
        level: 'info',
        message: `${agent.label} started`,
        metadata: { attempt },
      });

      const stageStart = Date.now();
      try {
        console.log(`[Orchestrator:InMemory] Starting ${agent.label} (attempt ${attempt}/${MAX_STAGE_ATTEMPTS})...`);

        // Inject discovery context into the project for this agent
        const projectWithContext = discoveryContext
          ? injectDiscoveryContext(project, agent.type, discoveryContext)
          : project;

        const runnerResult = await withTimeout(
          (agent.runner as (id: string, project: any) => Promise<{ data: any; markdown: string }>)(fakeProjectId, projectWithContext),
          360000,
          agent.label
        );
        const { data, markdown } = runnerResult;

        const score = data?.score ?? null;
        const scoreRationale = data?.scoreRationale ?? null;

        components.push({
          type: agent.type,
          dimension: agent.dimension,
          data,
          markdown,
          score,
          scoreRationale,
          status: 'completed',
        });

        if (hasPersistentProject) {
          await markStageCompleted(projectId, stageKey, {
            data,
            markdown,
            score,
            scoreRationale,
            completedAt: new Date().toISOString(),
          }, Date.now() - stageStart);
        }
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_completed',
          stageKey,
          level: 'info',
          message: `${agent.label} completed`,
          metadata: { durationMs: Date.now() - stageStart, score, attempt },
        });

        // Persist to Supabase for admin dashboard visibility
        if (hasPersistentProject) {
          try {
            const supabase = getSupabaseServerClient();
            await supabase.from('research_components').insert({
              project_id: projectId,
              component_type: agent.type,
              agent_persona: agent.persona,
              content: data,
              markdown_output: markdown,
              status: 'completed',
              completed_at: new Date().toISOString(),
            });
          } catch (e) {
            console.warn(`[Orchestrator:InMemory] Failed to persist ${agent.type} to DB (non-fatal)`);
          }
        }

        stageSucceeded = true;
        console.log(`[Orchestrator:InMemory] ✓ ${agent.label} completed${score ? ` — Score: ${score}/10` : ''}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        finalError = errorMsg;
        console.error(`[Orchestrator:InMemory] ✗ ${agent.label} failed:`, errorMsg);
        if (hasPersistentProject) {
          await markStageFailed(projectId, stageKey, errorMsg, Date.now() - stageStart);
        }
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_failed',
          stageKey,
          level: 'error',
          message: `${agent.label} failed`,
          metadata: { durationMs: Date.now() - stageStart, error: errorMsg, attempt },
        });

        if (attempt < MAX_STAGE_ATTEMPTS) {
          const backoffMs = STAGE_RETRY_BACKOFF_MS * attempt;
          await logRunEvent({
            pipelineRunId,
            projectId,
            eventType: 'stage_retry_scheduled',
            stageKey,
            level: 'warn',
            message: `${agent.label} retry scheduled`,
            metadata: { attempt, nextAttempt: attempt + 1, backoffMs, error: errorMsg },
          });
          if (backoffMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
          }
          continue;
        }

        components.push({
          type: agent.type,
          dimension: agent.dimension,
          data: null,
          markdown: '',
          score: null,
          scoreRationale: null,
          status: 'error',
          error: errorMsg,
        });
        break;
      }
    }

    if (!stageSucceeded && finalError) {
      console.warn(`[Orchestrator:InMemory] ${agent.label} exhausted retries: ${finalError}`);
    }
  }

  const completedComponents = components.filter(c => c.status === 'completed');
  const successCount = completedComponents.length;
  console.log(`[Orchestrator:InMemory] ${successCount}/7 agents completed`);

  if (successCount === 0) {
    await logRunEvent({
      pipelineRunId,
      projectId,
      eventType: 'run_failed',
      level: 'error',
      message: 'In-memory validation failed (0/7 completed)',
      metadata: { runtimeMs: Date.now() - startTime },
    });
    throw new Error('No research agents completed (0/7). Cannot proceed.');
  }

  // Run citation agent for fact-checking
  let citationResults: Awaited<ReturnType<typeof runCitationAgent>> | null = null;
  const citationStageKey = 'citation_agent';
  const skipCitation = hasPersistentProject && await shouldSkipStage(projectId, citationStageKey);
  if (skipCitation) {
    const cp = checkpointMap.get(citationStageKey);
    citationResults = (cp?.payload?.result || null) as any;
    await logRunEvent({
      pipelineRunId,
      projectId,
      eventType: 'stage_skipped',
      stageKey: citationStageKey,
      level: 'info',
      message: 'Citation agent skipped (checkpoint complete)',
    });
    console.log('[Orchestrator:InMemory] ↷ Skipped Citation Agent (checkpoint complete)');
  } else {
    let citationSucceeded = false;
    while (!citationSucceeded) {
      const attempt = (stageAttempts.get(citationStageKey) || 0) + 1;
      stageAttempts.set(citationStageKey, attempt);
      if (hasPersistentProject) {
        await markStageStarted(projectId, citationStageKey, attempt);
      }
      await logRunEvent({
        pipelineRunId,
        projectId,
        eventType: 'stage_started',
        stageKey: citationStageKey,
        level: 'info',
        message: 'Citation agent started',
        metadata: { attempt },
      });
      const citationStart = Date.now();
      try {
        console.log(`[Orchestrator:InMemory] Running citation agent for fact-checking (attempt ${attempt}/${MAX_STAGE_ATTEMPTS})...`);

        const componentsByType = completedComponents.reduce((acc, c) => {
          const key = c.type.replace('_', '');
          acc[key] = c.markdown || '';
          return acc;
        }, {} as Record<string, string>);

        citationResults = await withTimeout(
          runCitationAgent({
            projectId: fakeProjectId,
            occupation: project.target_occupation || project.program_name || 'Unknown',
            state: project.geographic_area || 'United States',
            regulatoryAnalysis: componentsByType['regulatorycompliance'],
            marketAnalysis: componentsByType['labormarket'],
            employerAnalysis: componentsByType['employerdemand'],
            financialAnalysis: componentsByType['financialviability'],
            academicAnalysis: componentsByType['institutionalfit'],
            demographicAnalysis: componentsByType['learnerdemand'],
            competitiveAnalysis: componentsByType['competitivelandscape'],
          }),
          300000,
          'Citation Agent'
        );

        if (hasPersistentProject) {
          await markStageCompleted(projectId, citationStageKey, {
            result: citationResults,
            verifiedClaims: citationResults.verifiedClaims.length,
            warnings: citationResults.warnings.length,
          }, Date.now() - citationStart);
        }
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_completed',
          stageKey: citationStageKey,
          level: 'info',
          message: `Citation agent complete — ${citationResults.verifiedClaims.length} claims verified`,
          metadata: {
            durationMs: Date.now() - citationStart,
            attempt,
            verifiedClaims: citationResults.verifiedClaims.length,
            warnings: citationResults.warnings.length,
            corrections: citationResults.corrections?.length || 0,
          },
        });

        console.log(`[Orchestrator:InMemory] ✓ Citation agent complete — ${citationResults.verifiedClaims.length} claims verified`);

        // Apply citation corrections to component markdown before report generation
        if (citationResults.corrections && citationResults.corrections.length > 0) {
          console.log(`[Orchestrator:InMemory] Applying ${citationResults.corrections.length} citation corrections...`);
          for (const correction of citationResults.corrections) {
            const comp = completedComponents.find(c => c.type === correction.componentType);
            if (comp && comp.markdown && comp.markdown.includes(correction.original)) {
              comp.markdown = comp.markdown.replace(correction.original, correction.corrected);
              console.log(`[Orchestrator:InMemory]   ✓ Corrected [${correction.componentType}]: ${correction.reason}`);
            }
          }
        }

        citationSucceeded = true;
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        if (hasPersistentProject) {
          await markStageFailed(projectId, citationStageKey, errorMsg, Date.now() - citationStart);
        }
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_failed',
          stageKey: citationStageKey,
          level: 'warn',
          message: 'Citation agent failed; continuing',
          metadata: { durationMs: Date.now() - citationStart, attempt, error: errorMsg },
        });

        if (attempt < MAX_STAGE_ATTEMPTS) {
          const backoffMs = STAGE_RETRY_BACKOFF_MS * attempt;
          await logRunEvent({
            pipelineRunId,
            projectId,
            eventType: 'stage_retry_scheduled',
            stageKey: citationStageKey,
            level: 'warn',
            message: 'Citation agent retry scheduled',
            metadata: { attempt, nextAttempt: attempt + 1, backoffMs, error: errorMsg },
          });
          if (backoffMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
          }
          continue;
        }

        console.warn('[Orchestrator:InMemory] Citation agent failed:', e);
        break;
      }
    }
  }

  // Calculate program scores
  console.log(`[Orchestrator:InMemory] Calculating program scores...`);

  const dimensionScores = completedComponents
    .filter(c => c.score != null)
    .map(c => {
      const agentConfig = AGENT_CONFIG.find(a => a.type === c.type);
      if (!agentConfig) return null;
      return buildDimensionScore(
        agentConfig.dimension,
        c.score!,
        c.scoreRationale || 'Score derived from agent analysis'
      );
    })
    .filter(Boolean) as any[];

  // Fill in defaults for missing dimensions
  for (const agent of AGENT_CONFIG) {
    if (!dimensionScores.find((d: any) => d.dimension === agent.dimension)) {
      dimensionScores.push(buildDimensionScore(agent.dimension, 5, 'Default score — agent did not complete'));
    }
  }

  const programScore = calculateProgramScore(dimensionScores);
  console.log(`[Orchestrator:InMemory] Composite Score: ${programScore.compositeScore}/10 — ${programScore.recommendation}`);

  // Run tiger team synthesis
  let tigerTeamMarkdown = '';
  const tigerTeamStageKey = 'tiger_team';
  const skipTigerTeam = hasPersistentProject && await shouldSkipStage(projectId, tigerTeamStageKey);
  if (skipTigerTeam) {
    const cp = checkpointMap.get(tigerTeamStageKey);
    tigerTeamMarkdown = cp?.payload?.markdown || '';
    await logRunEvent({
      pipelineRunId,
      projectId,
      eventType: 'stage_skipped',
      stageKey: tigerTeamStageKey,
      level: 'info',
      message: 'Tiger team synthesis skipped (checkpoint complete)',
    });
    console.log('[Orchestrator:InMemory] ↷ Skipped Tiger Team (checkpoint complete)');
  } else {
    let tigerSucceeded = false;
    while (!tigerSucceeded) {
      const attempt = (stageAttempts.get(tigerTeamStageKey) || 0) + 1;
      stageAttempts.set(tigerTeamStageKey, attempt);
      if (hasPersistentProject) {
        await markStageStarted(projectId, tigerTeamStageKey, attempt);
      }
      await logRunEvent({
        pipelineRunId,
        projectId,
        eventType: 'stage_started',
        stageKey: tigerTeamStageKey,
        level: 'info',
        message: 'Tiger team synthesis started',
        metadata: { attempt },
      });
      const tigerStart = Date.now();
      try {
        console.log(`[Orchestrator:InMemory] Running tiger team synthesis (attempt ${attempt}/${MAX_STAGE_ATTEMPTS})...`);

        // Build ResearchComponent-compatible objects for tiger team
        const tigerTeamComponents = completedComponents.map(c => ({
          id: `inmemory-${c.type}`,
          project_id: fakeProjectId,
          component_type: c.type,
          agent_persona: AGENT_CONFIG.find(a => a.type === c.type)?.persona || 'unknown',
          content: c.data || {},
          markdown_output: c.markdown,
          status: 'completed' as const,
          created_at: new Date().toISOString(),
        }));

        const { markdown } = await withTimeout(
          runTigerTeam(
            fakeProjectId,
            project as any,
            tigerTeamComponents as any,
            { personaSlugs: ['product-manager', 'cfo', 'cmo', 'coo'] }
          ),
          420000,
          'Tiger Team Synthesis'
        );
        tigerTeamMarkdown = markdown;
        if (hasPersistentProject) {
          await markStageCompleted(projectId, tigerTeamStageKey, {
            markdown: tigerTeamMarkdown,
            markdownLength: tigerTeamMarkdown.length,
          }, Date.now() - tigerStart);
        }
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_completed',
          stageKey: tigerTeamStageKey,
          level: 'info',
          message: 'Tiger team synthesis completed',
          metadata: { durationMs: Date.now() - tigerStart, attempt, markdownLength: tigerTeamMarkdown.length },
        });
        console.log(`[Orchestrator:InMemory] ✓ Tiger team completed`);
        tigerSucceeded = true;
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        if (hasPersistentProject) {
          await markStageFailed(projectId, tigerTeamStageKey, errorMsg, Date.now() - tigerStart);
        }
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_failed',
          stageKey: tigerTeamStageKey,
          level: 'warn',
          message: 'Tiger team synthesis failed; continuing',
          metadata: { durationMs: Date.now() - tigerStart, attempt, error: errorMsg },
        });

        if (attempt < MAX_STAGE_ATTEMPTS) {
          const backoffMs = STAGE_RETRY_BACKOFF_MS * attempt;
          await logRunEvent({
            pipelineRunId,
            projectId,
            eventType: 'stage_retry_scheduled',
            stageKey: tigerTeamStageKey,
            level: 'warn',
            message: 'Tiger team synthesis retry scheduled',
            metadata: { attempt, nextAttempt: attempt + 1, backoffMs, error: errorMsg },
          });
          if (backoffMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
          }
          continue;
        }

        console.warn('[Orchestrator:InMemory] Tiger team failed:', e);
        break;
      }
    }
  }

  // Apply citation corrections to tiger team markdown
  if (citationResults?.corrections && citationResults.corrections.length > 0 && tigerTeamMarkdown) {
    for (const correction of citationResults.corrections) {
      if (tigerTeamMarkdown.includes(correction.original)) {
        tigerTeamMarkdown = tigerTeamMarkdown.replace(correction.original, correction.corrected);
        console.log(`[Orchestrator:InMemory]   ✓ Tiger team corrected: ${correction.reason}`);
      }
    }
  }

  // Generate report

  const reportComponents = completedComponents.map(c => ({
    id: `inmemory-${c.type}`,
    project_id: fakeProjectId,
    component_type: c.type,
    agent_persona: AGENT_CONFIG.find(a => a.type === c.type)?.persona || 'unknown',
    content: { ...c.data, _score: c.score, _scoreRationale: c.scoreRationale },
    markdown_output: c.markdown,
    status: 'completed' as const,
    created_at: new Date().toISOString(),
  }));

  let fullReport = '';
  const reportStageKey = 'report_generation';
  const skipReport = hasPersistentProject && await shouldSkipStage(projectId, reportStageKey);
  if (skipReport) {
    const cp = checkpointMap.get(reportStageKey);
    fullReport = cp?.payload?.fullReport || '';
    await logRunEvent({
      pipelineRunId,
      projectId,
      eventType: 'stage_skipped',
      stageKey: reportStageKey,
      level: 'info',
      message: 'Report generation skipped (checkpoint complete)',
    });
    console.log('[Orchestrator:InMemory] ↷ Skipped Report Generation (checkpoint complete)');
  } else {
    let reportSucceeded = false;
    while (!reportSucceeded) {
      const attempt = (stageAttempts.get(reportStageKey) || 0) + 1;
      stageAttempts.set(reportStageKey, attempt);
      if (hasPersistentProject) {
        await markStageStarted(projectId, reportStageKey, attempt);
      }
      await logRunEvent({
        pipelineRunId,
        projectId,
        eventType: 'stage_started',
        stageKey: reportStageKey,
        level: 'info',
        message: 'Report generation started',
        metadata: { attempt },
      });

      const reportStart = Date.now();
      console.log(`[Orchestrator:InMemory] Generating report (attempt ${attempt}/${MAX_STAGE_ATTEMPTS})...`);
      try {
        try {
          fullReport = await writeValidationBrief({
            project: project as any,
            components: reportComponents as any,
            programScore,
            tigerTeamMarkdown,
          });
          console.log('[Orchestrator:InMemory] ✓ Validation brief writer generated polished report');
        } catch (e) {
          console.warn('[Orchestrator:InMemory] Validation brief writer failed, falling back to legacy report generator:', e);
          fullReport = generateReport({
            project: project as any,
            components: reportComponents as any,
            programScore,
            tigerTeamMarkdown,
          });
        }
        if (hasPersistentProject) {
          await markStageCompleted(projectId, reportStageKey, {
            fullReport,
            reportLength: fullReport.length,
            reportHash: hashMarkdown(fullReport),
          }, Date.now() - reportStart);
        }
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_completed',
          stageKey: reportStageKey,
          level: 'info',
          message: `Report generated (${fullReport.length} chars)`,
          metadata: { durationMs: Date.now() - reportStart, attempt, reportLength: fullReport.length },
        });
        reportSucceeded = true;
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        if (hasPersistentProject) {
          await markStageFailed(projectId, reportStageKey, errorMsg, Date.now() - reportStart);
        }
        await logRunEvent({
          pipelineRunId,
          projectId,
          eventType: 'stage_failed',
          stageKey: reportStageKey,
          level: 'error',
          message: 'Report generation failed',
          metadata: { durationMs: Date.now() - reportStart, attempt, error: errorMsg },
        });

        if (attempt < MAX_STAGE_ATTEMPTS) {
          const backoffMs = STAGE_RETRY_BACKOFF_MS * attempt;
          await logRunEvent({
            pipelineRunId,
            projectId,
            eventType: 'stage_retry_scheduled',
            stageKey: reportStageKey,
            level: 'warn',
            message: 'Report generation retry scheduled',
            metadata: { attempt, nextAttempt: attempt + 1, backoffMs, error: errorMsg },
          });
          if (backoffMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
          }
          continue;
        }

        throw e;
      }
    }
  }

  const totalDuration = Date.now() - startTime;
  console.log(`[Orchestrator:InMemory] ✓ Validation complete in ${Math.round(totalDuration / 1000)}s`);
  console.log(`[Orchestrator:InMemory] Final: ${programScore.recommendation} (${programScore.compositeScore}/10)`);

  // Complete pipeline run tracking
  if (pipelineRunId) {
    try {
      const agentScores: Record<string, number> = {};
      for (const c of completedComponents) {
        if (c.score != null) agentScores[c.type] = c.score;
      }
      await completePipelineRun(pipelineRunId, {
        runtimeSeconds: totalDuration / 1000,
        agentScores,
        compositeScore: programScore.compositeScore,
        recommendation: programScore.recommendation,
        citationCorrections: citationResults?.corrections?.length ?? 0,
        citationWarnings: citationResults?.warnings?.length ?? 0,
        intelTablesUsed: 0,
        reportMarkdownHash: hashMarkdown(fullReport),
        reportSizeKb: Math.round(Buffer.from(fullReport).length / 1024),
      });
    } catch (e) {
      console.warn('[Orchestrator:InMemory] Pipeline run tracking failed to complete (non-fatal):', e);
    }
  }

  // Save final report and update project status in Supabase
  if (!projectId.startsWith('inmemory-')) {
    try {
      const supabase = getSupabaseServerClient();

      // Save validation_reports row
      await supabase.from('validation_reports').insert({
        project_id: projectId,
        full_report_markdown: fullReport,
        version: 1,
      });

      // Save tiger team as research_component
      if (tigerTeamMarkdown) {
        await supabase.from('research_components').insert({
          project_id: projectId,
          component_type: 'tiger_team_synthesis',
          agent_persona: 'tiger-team',
          content: { programScore },
          markdown_output: tigerTeamMarkdown,
          status: 'completed',
          completed_at: new Date().toISOString(),
        });
      }

      // Update project status to 'review'
      await supabase
        .from('validation_projects')
        .update({ status: 'review' })
        .eq('id', projectId);

      console.log(`[Orchestrator:InMemory] ✓ Report saved to DB, project status → review`);
    } catch (e) {
      console.warn('[Orchestrator:InMemory] Failed to save report to DB (non-fatal):', e);
    }
  }

  await logRunEvent({
    pipelineRunId,
    projectId,
    eventType: 'run_completed',
    level: 'info',
    message: 'In-memory validation pipeline completed',
    metadata: {
      recommendation: programScore.recommendation,
      compositeScore: programScore.compositeScore,
      runtimeMs: totalDuration,
    },
  });

  return {
    project,
    components,
    programScore,
    tigerTeamMarkdown,
    fullReport,
    discoveryContextUsed: !!discoveryContext,
  };
}

// ── Discovery Context Injection ──

/**
 * Maps agent types to relevant Discovery context sections.
 * Returns the discovery context block to append to the agent's prompt.
 */
function getDiscoveryContextForAgent(
  agentType: string,
  ctx: DiscoveryContext
): string {
  const sections: string[] = [];

  switch (agentType) {
    case 'labor_market':
      if (ctx.demandSignals) sections.push(`Demand Signals:\n${ctx.demandSignals}`);
      if (ctx.blsData) sections.push(`BLS/Wage Data:\n${ctx.blsData}`);
      if (ctx.jobPostings) sections.push(`Job Posting Evidence:\n${ctx.jobPostings}`);
      break;

    case 'competitive_landscape':
      if (ctx.competitors) sections.push(`Regional Providers:\n${ctx.competitors}`);
      if (ctx.competitivePosition) sections.push(`Competitive Position: ${ctx.competitivePosition}`);
      if (ctx.gaps) sections.push(`Competitive Gaps:\n${ctx.gaps}`);
      break;

    case 'learner_demand':
      if (ctx.demographics) sections.push(`Regional Demographics:\n${ctx.demographics}`);
      if (ctx.wageOutcomes) sections.push(`Wage Outcomes:\n${ctx.wageOutcomes}`);
      if (ctx.demandSignals) sections.push(`Demand Context:\n${ctx.demandSignals}`);
      break;

    case 'financial_viability':
      if (ctx.grantOpportunities) sections.push(`Grant Opportunities:\n${ctx.grantOpportunities}`);
      if (ctx.revenueEstimates) sections.push(`Revenue Estimates:\n${ctx.revenueEstimates}`);
      if (ctx.topEmployers) sections.push(`Employer Landscape:\n${ctx.topEmployers}`);
      break;

    case 'institutional_fit':
      if (ctx.currentPrograms) sections.push(`Current Programs: ${ctx.currentPrograms}`);
      if (ctx.strategicPriorities) sections.push(`Strategic Priorities:\n${ctx.strategicPriorities}`);
      break;

    case 'regulatory_compliance':
      if (ctx.certifications) sections.push(`Trending Certifications:\n${ctx.certifications}`);
      if (ctx.region) sections.push(`Region: ${ctx.region}`);
      break;

    case 'employer_demand':
      if (ctx.topEmployers) sections.push(`Top Regional Employers:\n${ctx.topEmployers}`);
      if (ctx.employerExpansions) sections.push(`Expansion Signals:\n${ctx.employerExpansions}`);
      if (ctx.demandSignals) sections.push(`Demand Evidence:\n${ctx.demandSignals}`);
      break;
  }

  if (sections.length === 0) return '';

  return `\n\n## PRIOR DISCOVERY RESEARCH (from Stage 1)
The following data was gathered during the Discovery stage and is provided as context.
Use this as a starting point — verify, expand, and deepen the analysis.
Do NOT simply repeat this data. Use it to focus your research on what's NEW.

${sections.join('\n\n')}`;
}

/**
 * Injects discovery context into the project object for a specific agent.
 * 
 * The agents build their prompts from project fields. We add a
 * `_discoveryPromptSuffix` field that the agent can append to its prompt.
 * For agents that don't check this field, the context still lives on
 * `project._discoveryContext` for future use.
 */
function injectDiscoveryContext(
  project: Record<string, any>,
  agentType: string,
  ctx: DiscoveryContext
): Record<string, any> {
  const contextBlock = getDiscoveryContextForAgent(agentType, ctx);

  return {
    ...project,
    _discoveryContext: ctx,
    _discoveryPromptSuffix: contextBlock,
    // Also enrich specific fields that agents directly read:
    // - constraints field is a natural place to inject discovery context
    //   since most agents include it in their prompt
    constraints: project.constraints
      ? `${project.constraints}${contextBlock}`
      : contextBlock || project.constraints || '',
  };
}
