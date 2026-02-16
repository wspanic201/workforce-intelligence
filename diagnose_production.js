const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose() {
  const projectId = '1d8be4a2-1b1a-4f69-afd3-f8508c60d681';
  
  const { data: components } = await supabase
    .from('research_components')
    .select('component_type, status, created_at, completed_at, content')
    .eq('project_id', projectId)
    .order('created_at');
  
  console.log('=== PRODUCTION RUN DIAGNOSIS ===\n');
  
  components?.forEach(c => {
    const start = new Date(c.created_at);
    const end = c.completed_at ? new Date(c.completed_at) : new Date();
    const duration = Math.round((end - start) / 1000);
    
    console.log(`${c.component_type}:`);
    console.log(`  Status: ${c.status}`);
    console.log(`  Duration: ${duration}s (${Math.round(duration/60)}m)`);
    
    if (c.status === 'error') {
      console.log(`  ❌ TIMED OUT at 10 minutes`);
    }
    
    if (c.content) {
      // Check if agent actually got data
      const hasLiveJobs = c.content.live_jobs?.count > 0;
      const hasOnetData = c.content.onet_data?.code;
      const hasFinancialData = c.content.startup_costs;
      
      if (c.component_type === 'labor_market') {
        console.log(`  Live Jobs: ${hasLiveJobs ? c.content.live_jobs.count : 'NONE'}`);
        console.log(`  O*NET: ${hasOnetData ? c.content.onet_data.code : 'NONE'}`);
      }
      
      if (c.component_type === 'financial_viability') {
        console.log(`  Startup Costs: ${hasFinancialData ? 'YES' : 'NONE'}`);
      }
    }
    
    console.log('');
  });
  
  // Check what's in tiger_team and qa_review
  const tigerTeam = components.find(c => c.component_type === 'tiger_team_synthesis');
  const qaReview = components.find(c => c.component_type === 'qa_review');
  
  console.log('Missing Components:');
  if (!tigerTeam) console.log('  ❌ tiger_team_synthesis (never created)');
  if (!qaReview) console.log('  ❌ qa_review (never created)');
}

diagnose();
