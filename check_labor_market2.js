const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLaborMarket() {
  const projectId = '2a5e789f-024d-468e-bd3b-0b926b1c1b27';
  
  const { data, error } = await supabase
    .from('research_components')
    .select('content')
    .eq('project_id', projectId)
    .eq('component_type', 'labor_market')
    .single();
  
  if (error || !data) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  console.log('=== LABOR MARKET DATA (FRESH FETCH) ===\n');
  console.log('Job Count:', data.content?.live_jobs?.count);
  console.log('Top Employers:', data.content?.live_jobs?.topEmployers?.slice(0, 5).map(e => `${e.name} (${e.openings} openings)`));
  console.log('Required Skills:', data.content?.live_jobs?.requiredSkills?.slice(0, 5).map(s => `${s.skill} (${s.frequency}%)`));
  console.log('\nO*NET Data:');
  console.log('  Code:', data.content?.onet_data?.code);
  console.log('  Title:', data.content?.onet_data?.title);
  console.log('  Skills:', data.content?.onet_data?.skills?.slice(0, 3).map(s => s.element_name));
}

checkLaborMarket();
