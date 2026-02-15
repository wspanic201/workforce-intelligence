import { getSupabaseServerClient } from '@/lib/supabase/client';
import { ValidationProject, ResearchComponent } from '@/lib/types/database';
import { runMarketAnalysis } from './researchers/market-analyst';
import { runCompetitiveAnalysis } from './researchers/competitor-analyst';
import { runCurriculumDesign } from './researchers/curriculum-designer';
import { runFinancialAnalysis } from './researchers/financial-analyst';
import { runMarketingStrategy } from './researchers/marketing-strategist';
import { runTigerTeam } from './tiger-team';

export async function orchestrateValidation(projectId: string): Promise<void> {
  const supabase = getSupabaseServerClient();

  try {
    console.log(`[Orchestrator] Starting validation for project ${projectId}`);

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

    // 3. Create research component records
    const componentTypes = [
      { type: 'market_analysis', persona: 'market-analyst' },
      { type: 'competitive_landscape', persona: 'research-director' },
      { type: 'curriculum_design', persona: 'curriculum-director' },
      { type: 'financial_projections', persona: 'cfo' },
      { type: 'marketing_strategy', persona: 'cmo' },
    ];

    const componentIds: Record<string, string> = {};

    for (const comp of componentTypes) {
      const { data, error } = await supabase
        .from('research_components')
        .insert({
          project_id: projectId,
          component_type: comp.type,
          agent_persona: comp.persona,
          status: 'pending',
          content: {},
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to create component: ${comp.type}`);
      }

      componentIds[comp.type] = data.id;
    }

    console.log(`[Orchestrator] Created ${Object.keys(componentIds).length} research components`);

    // 4. Run research agents in parallel
    console.log(`[Orchestrator] Spawning research agents...`);

    const researchTasks = [
      runResearchComponent(projectId, componentIds['market_analysis'], project, runMarketAnalysis),
      runResearchComponent(projectId, componentIds['competitive_landscape'], project, runCompetitiveAnalysis),
      runResearchComponent(projectId, componentIds['curriculum_design'], project, runCurriculumDesign),
      runResearchComponent(projectId, componentIds['financial_projections'], project, runFinancialAnalysis),
      runResearchComponent(projectId, componentIds['marketing_strategy'], project, runMarketingStrategy),
    ];

    const results = await Promise.allSettled(researchTasks);

    // Check for failures
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error(`[Orchestrator] ${failures.length} research agents failed`);
      failures.forEach((f, i) => {
        if (f.status === 'rejected') {
          console.error(`  - Agent ${i + 1}: ${f.reason}`);
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

    if (!completedComponents || completedComponents.length < 3) {
      throw new Error(`Insufficient research completed (${completedComponents?.length || 0}/5). Cannot proceed with tiger team.`);
    }

    // 6. Run tiger team synthesis
    console.log(`[Orchestrator] Running tiger team synthesis...`);

    const { synthesis, markdown: tigerTeamMarkdown } = await runTigerTeam(
      projectId,
      project as ValidationProject,
      completedComponents as ResearchComponent[]
    );

    // Save tiger team synthesis as a component
    await supabase.from('research_components').insert({
      project_id: projectId,
      component_type: 'tiger_team_synthesis',
      agent_persona: 'multi-persona',
      status: 'completed',
      content: synthesis,
      markdown_output: tigerTeamMarkdown,
    });

    // 7. Generate final report
    console.log(`[Orchestrator] Generating final report...`);

    const fullReport = await compileReport(
      project as ValidationProject,
      completedComponents as ResearchComponent[],
      tigerTeamMarkdown
    );

    // Save report
    await supabase.from('validation_reports').insert({
      project_id: projectId,
      executive_summary: synthesis.executive_summary,
      full_report_markdown: fullReport,
      version: 1,
    });

    // 8. Update project status
    await supabase
      .from('validation_projects')
      .update({
        status: 'review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    console.log(`[Orchestrator] Validation complete for project ${projectId}`);
  } catch (error) {
    console.error(`[Orchestrator] Fatal error:`, error);

    // Update project status to error
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
  researchFunction: (projectId: string, project: any) => Promise<{ data: any; markdown: string }>
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

    // Update component with results
    await supabase
      .from('research_components')
      .update({
        status: 'completed',
        content: data,
        markdown_output: markdown,
        completed_at: new Date().toISOString(),
      })
      .eq('id', componentId);

    console.log(`[Orchestrator] Research component ${componentId} completed`);
  } catch (error) {
    console.error(`[Orchestrator] Research component ${componentId} failed:`, error);

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

async function compileReport(
  project: ValidationProject,
  components: ResearchComponent[],
  tigerTeamMarkdown: string
): Promise<string> {
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Sort components in logical order
  const componentOrder = [
    'market_analysis',
    'competitive_landscape',
    'curriculum_design',
    'financial_projections',
    'marketing_strategy',
  ];

  const sortedComponents = componentOrder
    .map(type => components.find(c => c.component_type === type))
    .filter(Boolean) as ResearchComponent[];

  const report = `# Workforce Program Validation Report

**Program:** ${project.program_name}  
**Client:** ${project.client_name}  
**Report Date:** ${reportDate}  
**Prepared by:** Murphy Workforce Intelligence

---

${tigerTeamMarkdown}

---

${sortedComponents.map(comp => comp.markdown_output).join('\n\n---\n\n')}

---

## Appendix: Methodology

This validation report was produced using Murphy Workforce Intelligence's proprietary AI-powered research methodology, which combines:

1. **Multi-Perspective Analysis:** Research conducted by specialized AI agents embodying different professional perspectives (market analyst, curriculum designer, financial analyst, etc.)

2. **Real Data Sources:** All findings are based on publicly available labor market data, competitor research, and industry standards. No hallucinated data.

3. **Tiger Team Synthesis:** Executive-level debate process where multiple personas challenge assumptions and assess viability from different angles.

4. **15 Years of Expertise:** Research prompts and frameworks developed by Matt Murphy, incorporating 15 years of workforce program development experience.

**Data Sources Referenced:**
- U.S. Bureau of Labor Statistics (BLS)
- O*NET OnLine
- State labor market information systems
- College and university program catalogs
- Industry certification bodies
- Job market aggregators

**Limitations:**
- This report provides strategic guidance based on available data and analysis. It should be supplemented with local market research and institutional considerations.
- Financial projections are estimates based on typical program economics and should be validated with institutional budgeting processes.
- Implementation success depends on execution quality, market conditions, and institutional capacity.

---

**Contact:**
Matt Murphy  
Murphy Workforce Intelligence  
matt@murphyworkforce.com

© ${new Date().getFullYear()} Murphy Workforce Intelligence. All rights reserved.
`;

  return report;
}
