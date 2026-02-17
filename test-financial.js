/**
 * Test the financial analyst agent in isolation
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testFinancialAgent() {
  // Use the recent test project
  const projectId = '7e82b097-7b48-422f-a0b6-239bf2e0d3dd';
  
  console.log('Loading project...');
  const { data: project } = await supabase
    .from('validation_projects')
    .select('*')
    .eq('id', projectId)
    .single();
  
  if (!project) {
    console.error('Project not found');
    process.exit(1);
  }
  
  console.log('Project:', project.program_name);
  console.log('\nRunning financial analyst...\n');
  
  // Dynamically import the financial analyst
  const { runFinancialAnalysis } = await import('./lib/agents/researchers/financial-analyst.ts');
  
  try {
    const startTime = Date.now();
    const result = await runFinancialAnalysis(projectId, project);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\n✅ Success! Completed in ${duration}s`);
    console.log('\nScore:', result.data.score);
    console.log('Score Rationale:', result.data.scoreRationale);
    console.log('\nStartup Costs Total:', `$${result.data.startup_costs.total.toLocaleString()}`);
    console.log('Year 1 Operating:', `$${result.data.annual_operating_costs.total.toLocaleString()}`);
    console.log('Year 1 Revenue:', `$${result.data.revenue_projections.year1.total_revenue.toLocaleString()}`);
    console.log('Break-even:', result.data.break_even_analysis.break_even_timeline);
    console.log('3-Year ROI:', result.data.roi_analysis.roi_percentage);
    
    console.log('\nMarkdown output length:', result.markdown.length, 'chars');
    console.log('First 500 chars:', result.markdown.substring(0, 500));
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    if (error.message.includes('Invalid JSON')) {
      console.error('\nThe model did not return valid JSON. Check the prompt.');
    }
    process.exit(1);
  }
}

testFinancialAgent();
