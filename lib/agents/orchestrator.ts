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
import { enrichProject } from './project-enricher';
import type { DiscoveryContext } from '@/lib/stages/handoff';
import { getProjectIntel, formatIntelBlock } from '@/lib/intelligence/mcp-client';
import { startPipelineRun, completePipelineRun, hashMarkdown, type PipelineConfig } from '@/lib/pipeline/track-run';

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
  const orchestratorStart = Date.now();
  let pipelineRunId: string | null = null;

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

    // 2.5. Fetch shared intelligence via MCP (one query, all 7 agents share it)
    const mcpIntel = await getProjectIntel(projectToValidate);
    const mcpIntelBlock = formatIntelBlock(mcpIntel);
    (projectToValidate as any)._mcpIntel = mcpIntel;
    (projectToValidate as any)._mcpIntelBlock = mcpIntelBlock;
    console.log(`[Orchestrator] MCP intel: available=${mcpIntel.available}, block=${mcpIntelBlock.length} chars`);

    // 2.9. Start pipeline run tracking
    try {
      const pipelineConfig: PipelineConfig = {
        model: 'claude-sonnet-4-6',
        pipelineVersion: 'v2.0',
        reportTemplate: 'professional-v2',
        agentsEnabled: AGENT_CONFIG.map(a => a.type),
        tigerTeamEnabled: true,
        citationAgentEnabled: true,
        intelContextEnabled: mcpIntel.available,
      };
      pipelineRunId = await startPipelineRun(projectId, pipelineConfig);
    } catch (e) {
      console.warn('[Orchestrator] Pipeline run tracking failed to start (non-fatal):', e);
    }

    // 3. Update status to researching
    await supabase
      .from('validation_projects')
      .update({ status: 'researching', updated_at: new Date().toISOString() })
      .eq('id', projectId);

    // 4. Create research component records for all 7 stages
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

    // 5. Run all 7 research agents sequentially (prevents OOM crashes)
    console.log(`[Orchestrator] Running 7 research agents sequentially...`);

    const results: PromiseSettledResult<void>[] = [];

    for (const agent of AGENT_CONFIG) {
      try {
        console.log(`[Orchestrator] Starting ${agent.label}...`);
        
        const result = await withTimeout(
          runResearchComponent(
            projectId,
            componentIds[agent.type],
            projectToValidate,
            agent.runner,
            agent.dimension
          ),
          360000, // 6 minutes per agent — streaming + stall detection handles hangs
          agent.label
        );
        
        results.push({ status: 'fulfilled', value: result });
        console.log(`[Orchestrator] ✓ ${agent.label} completed`);
      } catch (error) {
        results.push({ status: 'rejected', reason: error });
        console.error(`[Orchestrator] ✗ ${agent.label} failed:`, error);
      }
    }

    // Check for failures and update database status
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error(`[Orchestrator] ${failures.length} research agents failed`);
      
      // Mark failed agents as error in database (timeout doesn't trigger catch block)
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'rejected') {
          const agent = AGENT_CONFIG[i];
          const reason = (results[i] as PromiseRejectedResult).reason;
          
          console.error(`  - ${agent.label}: ${reason}`);
          
          await supabase
            .from('research_components')
            .update({
              status: 'error',
              error_message: reason instanceof Error ? reason.message : String(reason),
              completed_at: new Date().toISOString(),
            })
            .eq('project_id', projectId)
            .eq('component_type', agent.type);
          
          console.log(`[Orchestrator] Marked ${agent.label} as error in database`);
        }
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

    console.log(`[Orchestrator] Found ${completedComponents?.length || 0} completed components in DB`);

    // Validate minimum completion threshold
    if (!completedComponents || completedComponents.length === 0) {
      const { data: allComponents } = await supabase
        .from('research_components')
        .select('id, component_type, status')
        .eq('project_id', projectId);
      console.log(`[Orchestrator] All components:`, JSON.stringify(allComponents?.map(c => ({ type: c.component_type, status: c.status }))));
      throw new Error(`No research completed (0/7). Cannot proceed.`);
    }

    // Warn if partial completion but proceed
    if (completedComponents.length < 7) {
      console.warn(`[Orchestrator] ⚠️  Only ${completedComponents.length}/7 agents completed - proceeding with partial data`);
      console.warn(`[Orchestrator] Report quality may be reduced due to missing dimensions`);
    }

    // 7. Run citation agent for fact-checking and inline citations
    let citationResults: Awaited<ReturnType<typeof runCitationAgent>> | null = null;
    try {
      console.log(`[Orchestrator] Running citation agent for fact-checking...`);

      // Extract markdown from completed components
      const componentsByType = completedComponents.reduce((acc, c) => {
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

      console.log(`[Orchestrator] ✓ Citation agent complete — ${citationResults.verifiedClaims.length} claims verified`);

      // Apply citation corrections to component markdown before report generation
      if (citationResults.corrections && citationResults.corrections.length > 0) {
        console.log(`[Orchestrator] Applying ${citationResults.corrections.length} citation corrections...`);
        for (const correction of citationResults.corrections) {
          // Find matching component by type
          const comp = completedComponents.find(c => c.component_type === correction.componentType);
          if (comp && comp.markdown_output && comp.markdown_output.includes(correction.original)) {
            comp.markdown_output = comp.markdown_output.replace(correction.original, correction.corrected);
            console.log(`[Orchestrator]   ✓ Corrected [${correction.componentType}]: ${correction.reason}`);
          }
        }
      }
    } catch (e) {
      console.warn('[Orchestrator] Citation agent failed, continuing without citation verification:', e);
    }

    // 8. Calculate program scores
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

    // 9. Run tiger team synthesis (optional, for backward compat)
    let tigerTeamMarkdown = '';
    try {
      console.log(`[Orchestrator] Running tiger team synthesis...`);
      const { synthesis, markdown } = await withTimeout(
        runTigerTeam(
          projectId,
          projectToValidate as ValidationProject,
          completedComponents as ResearchComponent[]
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
    } catch (e) {
      console.warn('[Orchestrator] Tiger team synthesis failed, continuing with report generation:', e);
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
    console.log(`[Orchestrator] Generating professional report...`);

    let fullReport = generateReport({
      project: projectToValidate as ValidationProject,
      components: completedComponents as ResearchComponent[],
      programScore,
      tigerTeamMarkdown,

    });

    // Save initial report (only columns that exist: project_id, executive_summary, full_report_markdown, version)
    const { data: reportRow, error: reportError } = await supabase.from('validation_reports').insert({
      project_id: projectId,
      executive_summary: `Recommendation: ${programScore.recommendation} (${programScore.compositeScore}/10)\n\nDimensions: ${programScore.dimensions.map((d: any) => `${d.dimension}: ${d.score}/10`).join(', ')}`,
      full_report_markdown: fullReport,
      version: 1,
    }).select('id').single();
    
    if (reportError) {
      console.error(`[Orchestrator] ✗ Report save failed:`, reportError.message);
    }

    console.log(`[Orchestrator] ✓ Report saved (${fullReport.length} chars)`);

    // 11. QA Review — optional fact-check, updates report if issues found
    // DISABLED: QA's 80K+ token prompt causes OOM on 8GB machines
    // TODO: Re-enable with summarized inputs instead of raw agent outputs
    if (false && tigerTeamMarkdown) {
      try {
        console.log(`[Orchestrator] Running QA review / fact-check...`);
        const qaResult = await runQAReview(
          tigerTeamMarkdown,
          completedComponents as ResearchComponent[],
          { program_name: projectToValidate.program_name!, client_name: projectToValidate.client_name! }
        );

        if (qaResult.issueCount.critical > 0 || qaResult.issueCount.warning > 0) {
          console.log(`[Orchestrator] QA found ${qaResult.issueCount.critical} critical, ${qaResult.issueCount.warning} warning issues — updating report`);
          tigerTeamMarkdown = qaResult.cleanedMarkdown;

          // Regenerate report with QA-cleaned tiger team
          fullReport = generateReport({
            project: projectToValidate as ValidationProject,
            components: completedComponents as ResearchComponent[],
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
        for (const comp of completedComponents || []) {
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
          intelTablesUsed: mcpIntel.available ? 1 : 0,
          reportMarkdownHash: hashMarkdown(fullReport),
          reportSizeKb: Math.round(Buffer.from(fullReport).length / 1024),
        });
      } catch (e) {
        console.warn('[Orchestrator] Pipeline run tracking failed to complete (non-fatal):', e);
      }
    }

    // 11.6. Generate PDF and upload to Supabase Storage
    try {
      console.log(`[Orchestrator] Generating PDF...`);
      const { generatePDF } = await import('@/lib/pdf/generate-pdf');

      // Clean markdown for PDF pipeline
      let pdfMarkdown = fullReport;
      pdfMarkdown = pdfMarkdown.replace(/^---[\s\S]*?---\n/, '');
      pdfMarkdown = pdfMarkdown.replace(/<div style="text-align:center[^>]*>[\s\S]*?<\/div>\s*<div style="page-break-after:\s*always;?\s*"><\/div>/i, '');
      pdfMarkdown = pdfMarkdown.replace(/^# Table of Contents\n[\s\S]*?<div style="page-break-after:\s*always;?\s*"><\/div>/m, '');
      pdfMarkdown = pdfMarkdown.replace(/<div style="page-break-after:\s*always;?\s*"><\/div>\s*/g, '');
      pdfMarkdown = pdfMarkdown.replace(/^### /gm, '#### ');
      pdfMarkdown = pdfMarkdown.replace(/^## /gm, '### ');
      pdfMarkdown = pdfMarkdown.replace(/^# /gm, '## ');
      pdfMarkdown = pdfMarkdown.replace(/\n{4,}/g, '\n\n').trim();

      const tmpPath = `/tmp/wavelength-${projectId.slice(0, 8)}-${Date.now()}.pdf`;
      const pdfResult = await generatePDF(pdfMarkdown, {
        title: projectToValidate.program_name || 'Program',
        subtitle: 'Program Validation Report',
        preparedFor: projectToValidate.client_name || '',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        reportType: 'validation',
        outputPath: tmpPath,
      });

      // Upload to Supabase Storage
      const { readFileSync, unlinkSync } = await import('fs');
      const pdfBuffer = readFileSync(tmpPath);
      const storagePath = `reports/${projectId}/validation-report.pdf`;

      await supabase.storage.from('reports').upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

      // Update report record with storage path
      if (reportRow?.id) {
        await supabase.from('validation_reports')
          .update({ pdf_url: storagePath })
          .eq('id', reportRow.id);
      }

      // Update pipeline run with page count and size
      if (pipelineRunId) {
        await supabase.from('pipeline_runs')
          .update({ report_page_count: pdfResult.pageCount, report_size_kb: pdfResult.sizeKB })
          .eq('id', pipelineRunId);
      }

      // Clean up temp file
      try { unlinkSync(tmpPath); } catch {}
      console.log(`[Orchestrator] ✓ PDF uploaded (${pdfResult.pageCount} pages, ${pdfResult.sizeKB}KB)`);
    } catch (pdfErr: any) {
      console.warn(`[Orchestrator] PDF generation failed (non-fatal):`, pdfErr.message);
    }

    // 12. Update project status
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

  console.log(`[Orchestrator:InMemory] Starting validation for "${projectData.program_name || projectData.title}"`);

  // Build the project object that agents expect (matches ValidationProject shape)
  const project: Record<string, any> = {
    id: `inmemory-${Date.now()}`,
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

  // Run all 7 research agents sequentially
  console.log(`[Orchestrator:InMemory] Running 7 research agents sequentially...`);

  const components: InMemoryValidationResult['components'] = [];
  const fakeProjectId = project.id;

  for (const agent of AGENT_CONFIG) {
    try {
      console.log(`[Orchestrator:InMemory] Starting ${agent.label}...`);

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

      console.log(`[Orchestrator:InMemory] ✓ ${agent.label} completed${score ? ` — Score: ${score}/10` : ''}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[Orchestrator:InMemory] ✗ ${agent.label} failed:`, errorMsg);

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
    }
  }

  const completedComponents = components.filter(c => c.status === 'completed');
  const successCount = completedComponents.length;
  console.log(`[Orchestrator:InMemory] ${successCount}/7 agents completed`);

  if (successCount === 0) {
    throw new Error('No research agents completed (0/7). Cannot proceed.');
  }

  // Run citation agent for fact-checking
  let citationResults: Awaited<ReturnType<typeof runCitationAgent>> | null = null;
  try {
    console.log(`[Orchestrator:InMemory] Running citation agent for fact-checking...`);

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
  } catch (e) {
    console.warn('[Orchestrator:InMemory] Citation agent failed:', e);
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
  try {
    console.log(`[Orchestrator:InMemory] Running tiger team synthesis...`);

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
        tigerTeamComponents as any
      ),
      420000,
      'Tiger Team Synthesis'
    );
    tigerTeamMarkdown = markdown;
    console.log(`[Orchestrator:InMemory] ✓ Tiger team completed`);
  } catch (e) {
    console.warn('[Orchestrator:InMemory] Tiger team failed:', e);
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
  console.log(`[Orchestrator:InMemory] Generating report...`);

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

  const fullReport = generateReport({
    project: project as any,
    components: reportComponents as any,
    programScore,
    tigerTeamMarkdown,
  });

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
