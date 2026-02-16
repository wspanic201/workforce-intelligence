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
import { calculateProgramScore, buildDimensionScore, DIMENSION_WEIGHTS } from '@/lib/scoring/program-scorer';
import { generateReport } from '@/lib/reports/report-generator';

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

export async function orchestrateValidation(projectId: string): Promise<void> {
  const supabase = getSupabaseServerClient();

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

    // 2. Update status to researching
    await supabase
      .from('validation_projects')
      .update({ status: 'researching', updated_at: new Date().toISOString() })
      .eq('id', projectId);

    // 3. Create research component records for all 7 stages
    const componentIds: Record<string, string> = {};

    for (const agent of AGENT_CONFIG) {
      const { data, error } = await supabase
        .from('research_components')
        .insert({
          project_id: projectId,
          component_type: agent.type,
          agent_persona: agent.persona,
          status: 'pending',
          content: {},
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to create component: ${agent.type}`);
      }

      componentIds[agent.type] = data.id;
    }

    console.log(`[Orchestrator] Created ${Object.keys(componentIds).length} research components (7-stage framework)`);

    // 4. Run all 7 research agents in parallel
    console.log(`[Orchestrator] Spawning 7 research agents...`);

    const researchTasks = AGENT_CONFIG.map(agent =>
      withTimeout(
        runResearchComponent(
          projectId,
          componentIds[agent.type],
          project,
          agent.runner,
          agent.dimension
        ),
        300000, // 5 minutes per agent
        agent.label
      )
    );

    const results = await Promise.allSettled(researchTasks);

    // Check for failures
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error(`[Orchestrator] ${failures.length} research agents failed`);
      failures.forEach((f, i) => {
        if (f.status === 'rejected') {
          console.error(`  - ${AGENT_CONFIG[i].label}: ${f.reason}`);
        }
      });
    }

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[Orchestrator] ${successCount}/${results.length} research agents completed successfully`);

    // 5. Load completed research components
    const { data: completedComponents, error: componentsError } = await supabase
      .from('research_components')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'completed');

    if (componentsError) {
      throw new Error(`Failed to load research components: ${componentsError.message}`);
    }

    console.log(`[Orchestrator] Found ${completedComponents?.length || 0} completed components in DB`);

    // If DB query returned 0 but agents succeeded, try fetching all components
    if (!completedComponents || completedComponents.length < 4) {
      const { data: allComponents, error: allError } = await supabase
        .from('research_components')
        .select('id, component_type, status')
        .eq('project_id', projectId);
      console.log(`[Orchestrator] All components:`, JSON.stringify(allComponents?.map(c => ({ type: c.component_type, status: c.status }))));
      if (allError) console.error(`[Orchestrator] Error fetching all components:`, allError);
      throw new Error(`Insufficient research completed (${completedComponents?.length || 0}/7). Cannot proceed.`);
    }

    // 6. Calculate program scores
    console.log(`[Orchestrator] Calculating program scores...`);

    const dimensionScores = completedComponents
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

    // 7. Run tiger team synthesis (optional, for backward compat)
    let tigerTeamMarkdown = '';
    try {
      console.log(`[Orchestrator] Running tiger team synthesis...`);
      const { synthesis, markdown } = await runTigerTeam(
        projectId,
        project as ValidationProject,
        completedComponents as ResearchComponent[]
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
    } catch (e) {
      console.warn('[Orchestrator] Tiger team synthesis failed, continuing with report generation:', e);
    }

    // 8. Generate professional report
    console.log(`[Orchestrator] Generating professional report...`);

    const fullReport = generateReport({
      project: project as ValidationProject,
      components: completedComponents as ResearchComponent[],
      programScore,
      tigerTeamMarkdown,
    });

    // 9. Save report with scores
    await supabase.from('validation_reports').insert({
      project_id: projectId,
      executive_summary: `Recommendation: ${programScore.recommendation} (${programScore.compositeScore}/10)`,
      full_report_markdown: fullReport,
      composite_score: programScore.compositeScore,
      recommendation: programScore.recommendation,
      scorecard: {
        dimensions: programScore.dimensions,
        compositeScore: programScore.compositeScore,
        recommendation: programScore.recommendation,
        overrideApplied: programScore.overrideApplied,
        overrideReason: programScore.overrideReason,
      },
      version: 1,
    });

    // 10. Update project status
    await supabase
      .from('validation_projects')
      .update({
        status: 'review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    console.log(`[Orchestrator] 7-stage validation complete for project ${projectId}`);
    console.log(`[Orchestrator] Final: ${programScore.recommendation} (${programScore.compositeScore}/10)`);
  } catch (error) {
    console.error(`[Orchestrator] Fatal error:`, error);

    await supabase
      .from('validation_projects')
      .update({
        status: 'error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    throw error;
  }
}

async function runResearchComponent(
  projectId: string,
  componentId: string,
  project: any,
  researchFunction: (projectId: string, project: any) => Promise<{ data: any; markdown: string }>,
  dimensionName: string
): Promise<void> {
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
