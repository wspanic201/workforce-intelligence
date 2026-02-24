/**
 * Run a Pharmacy Tech validation directly from CLI
 * Bypasses API route, runs orchestrator with enriched project data
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('🧪 Pharmacy Technician Certificate — Kirkwood Community College');
  console.log('📍 Cedar Rapids & Iowa City, Iowa\n');

  // Create project in DB with only existing columns
  const { data: dbProject, error } = await supabase
    .from('validation_projects')
    .insert({
      client_name: 'Kirkwood Community College',
      client_email: 'hello@workforceintel.com',
      program_name: 'Pharmacy Technician Certificate',
      program_type: 'certificate',
      target_audience: 'Career changers, recent high school graduates, and current retail workers seeking healthcare careers',
      constraints: 'Must meet Iowa Board of Pharmacy requirements. Clinical rotation sites needed. Lab equipment investment required.',
      status: 'intake',
    })
    .select()
    .single();

  if (error || !dbProject) {
    console.error('Failed to create project:', error);
    process.exit(1);
  }

  const projectId = dbProject.id;
  console.log(`Project ID: ${projectId}`);

  // Build enriched project object that agents will receive
  const enrichedProject = {
    ...dbProject,
    program_description: 'A certificate program preparing students for entry-level pharmacy technician positions in retail, hospital, and specialty pharmacy settings. Program would include pharmacy law, pharmacology, sterile and non-sterile compounding, medication dispensing, and pharmacy calculations. Prepares students for the PTCB (Pharmacy Technician Certification Board) national exam.',
    target_occupation: 'Pharmacy Technician',
    geographic_area: 'Cedar Rapids and Iowa City, Iowa (Linn and Johnson Counties)',
    target_learner_profile: 'Adults 18-45 seeking stable healthcare career with relatively short training period. Mix of recent grads and career changers. Many working part-time or in retail.',
    delivery_format: 'hybrid',
    estimated_program_length: '9-12 months (2 semesters)',
    estimated_tuition: '$4,500-$6,000',
    institutional_capacity: 'Kirkwood has existing health sciences infrastructure including lab space and clinical partnerships. Would need dedicated pharmacy lab setup.',
    employer_interest: 'Regional pharmacies (CVS, Walgreens, Hy-Vee) and hospital systems (UnityPoint, UIHC) have expressed informal interest in pipeline programs.',
    strategic_context: 'Kirkwood CC serves a 7-county area in Eastern Iowa. Strong existing health programs (nursing, medical assisting). Pharmacy tech would complement the health sciences pathway and meet growing regional demand.',
    soc_codes: '29-2052',
    onet_codes: '29-2052.00',
    stackable_credential: true,
    funding_sources: ['perkins_v', 'wioa', 'self_pay'],
  };

  // Import agents
  const { runMarketAnalysis } = await import('../lib/agents/researchers/market-analyst');
  const { runCompetitiveAnalysis } = await import('../lib/agents/researchers/competitor-analyst');
  const { runLearnerDemand } = await import('../lib/agents/researchers/learner-demand');
  const { runFinancialAnalysis } = await import('../lib/agents/researchers/financial-analyst');
  const { runInstitutionalFit } = await import('../lib/agents/researchers/institutional-fit');
  const { runRegulatoryCompliance } = await import('../lib/agents/researchers/regulatory-analyst');
  const { runEmployerDemand } = await import('../lib/agents/researchers/employer-analyst');
  const { runTigerTeam } = await import('../lib/agents/tiger-team');
  const { calculateProgramScore, buildDimensionScore } = await import('../lib/scoring/program-scorer');
  const { generateReport } = await import('../lib/reports/report-generator');

  // Update status
  await supabase.from('validation_projects').update({ status: 'researching', updated_at: new Date().toISOString() }).eq('id', projectId);

  // Agent configs
  const agents = [
    { type: 'labor_market', dimension: 'Labor Market Demand', persona: 'market-analyst', runner: runMarketAnalysis, label: 'Labor Market' },
    { type: 'competitive_landscape', dimension: 'Competitive Landscape', persona: 'research-director', runner: runCompetitiveAnalysis, label: 'Competitive' },
    { type: 'learner_demand', dimension: 'Target Learner Demand', persona: 'learner-demand-analyst', runner: runLearnerDemand, label: 'Learner Demand' },
    { type: 'financial_viability', dimension: 'Financial Viability', persona: 'cfo', runner: runFinancialAnalysis, label: 'Financial' },
    { type: 'institutional_fit', dimension: 'Institutional Fit & Capacity', persona: 'institutional-fit-analyst', runner: runInstitutionalFit, label: 'Institutional Fit' },
    { type: 'regulatory_compliance', dimension: 'Regulatory & Compliance', persona: 'regulatory-compliance-analyst', runner: runRegulatoryCompliance, label: 'Regulatory' },
    { type: 'employer_demand', dimension: 'Employer Demand & Partnerships', persona: 'employer-demand-analyst', runner: runEmployerDemand, label: 'Employer Demand' },
  ];

  // Create component records
  const componentIds: Record<string, string> = {};
  for (const agent of agents) {
    const { data } = await supabase.from('research_components').insert({
      project_id: projectId, component_type: agent.type, agent_persona: agent.persona, status: 'pending', content: {},
    }).select().single();
    if (data) componentIds[agent.type] = data.id;
  }

  console.log(`\n🚀 Launching 7 research agents in parallel...\n`);
  const start = Date.now();

  // Run all 7 in parallel with enriched project
  const results = await Promise.allSettled(
    agents.map(async (agent) => {
      const compId = componentIds[agent.type];
      await supabase.from('research_components').update({ status: 'in_progress' }).eq('id', compId);
      
      try {
        const { data, markdown } = await agent.runner(projectId, enrichedProject as any);
        const score = (data as any)?.score ?? null;
        const rationale = (data as any)?.scoreRationale ?? null;
        
        await supabase.from('research_components').update({
          status: 'completed',
          content: { ...data, _score: score, _scoreRationale: rationale },
        }).eq('id', compId);
        
        console.log(`  ✅ ${agent.label} complete${score ? ` (${score}/10)` : ''}`);
        return { agent, data, score, rationale };
      } catch (err: any) {
        console.error(`  ❌ ${agent.label} failed: ${err.message}`);
        await supabase.from('research_components').update({
          status: 'error', error_message: err.message,
        }).eq('id', compId);
        throw err;
      }
    })
  );

  const successCount = results.filter(r => r.status === 'fulfilled').length;
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n📊 ${successCount}/7 agents completed in ${elapsed}s`);

  if (successCount < 4) {
    console.error('Too many failures. Aborting.');
    await supabase.from('validation_projects').update({ status: 'error' }).eq('id', projectId);
    process.exit(1);
  }

  // Load completed components
  const { data: completedComponents } = await supabase
    .from('research_components').select('*').eq('project_id', projectId).eq('status', 'completed');

  // Calculate scores
  console.log('\n📈 Calculating program scores...');
  const dimensionScores = agents.map(agent => {
    const comp = completedComponents?.find(c => c.component_type === agent.type);
    const score = comp?.content?._score ?? comp?.content?.score ?? 5;
    const rationale = comp?.content?._scoreRationale ?? comp?.content?.scoreRationale ?? 'Default score';
    return buildDimensionScore(agent.dimension, score, rationale);
  });

  const programScore = calculateProgramScore(dimensionScores);
  console.log(`\n🎯 Composite Score: ${programScore.compositeScore}/10 — ${programScore.recommendation}`);

  // Tiger team synthesis
  let tigerTeamMarkdown = '';
  try {
    console.log('\n🐯 Running tiger team synthesis...');
    const { synthesis, markdown } = await runTigerTeam(projectId, enrichedProject as any, completedComponents as any);
    tigerTeamMarkdown = markdown;
    await supabase.from('research_components').insert({
      project_id: projectId, component_type: 'tiger_team_synthesis', agent_persona: 'multi-persona',
      status: 'completed', content: synthesis, markdown_output: tigerTeamMarkdown,
    });
    console.log('  ✅ Tiger team complete');
  } catch (e: any) {
    console.warn(`  ⚠️ Tiger team failed: ${e.message}`);
  }

  // Generate report
  console.log('\n📝 Generating final report...');
  const fullReport = generateReport({
    project: enrichedProject as any,
    components: completedComponents as any,
    programScore,
    tigerTeamMarkdown,
  });

  // Save report
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
    },
    version: 1,
  });

  // Update project
  await supabase.from('validation_projects').update({ status: 'review', updated_at: new Date().toISOString() }).eq('id', projectId);

  // Save to desktop
  const fs = await import('fs');
  const reportPath = '/Users/matt/Desktop/Kirkwood-PharmTech-Validation-Report.md';
  fs.writeFileSync(reportPath, fullReport);

  const totalElapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ VALIDATION COMPLETE — ${totalElapsed}s total`);
  console.log(`📊 Score: ${programScore.compositeScore}/10 — ${programScore.recommendation}`);
  console.log(`📄 Report: ${reportPath}`);
  console.log(`🔗 Project: ${projectId}`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
