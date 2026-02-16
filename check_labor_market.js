const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLaborMarket() {
  const projectId = '5045ebfd-d521-4ed5-a17c-5ad2e183b45f';
  
  const { data, error } = await supabase
    .from('research_components')
    .select('content, markdown_output')
    .eq('project_id', projectId)
    .eq('component_type', 'labor_market')
    .single();
  
  if (error || !data) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  console.log('=== LABOR MARKET DATA ===\n');
  console.log('Job Count:', data.content?.live_jobs?.count || 'N/A');
  console.log('Median Salary:', data.content?.live_jobs?.salaries?.median || 'N/A');
  console.log('Top Employers:', data.content?.live_jobs?.topEmployers?.slice(0, 3).map(e => e.name).join(', ') || 'N/A');
  console.log('\n=== MARKDOWN PREVIEW ===\n');
  console.log(data.markdown_output?.substring(0, 1000));
}

checkLaborMarket();
