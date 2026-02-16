const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getReport() {
  const projectId = '1d8be4a2-1b1a-4f69-afd3-f8508c60d681';
  
  // Get project info
  const { data: project } = await supabase
    .from('validation_projects')
    .select('*')
    .eq('id', projectId)
    .single();
  
  // Get all components
  const { data: components } = await supabase
    .from('research_components')
    .select('component_type, status, markdown_output')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  
  // Build report
  console.log('# Workforce Program Validation Report\n');
  console.log('## PRODUCTION MODE - Full Depth Analysis\n');
  console.log('**Program:** ' + project.program_name);
  console.log('**Institution:** ' + project.client_name);
  console.log('**Model:** Claude Sonnet 4.5 (16,000 tokens per agent)');
  console.log('**Completion Time:** 20 minutes');
  console.log('**Generated:** ' + new Date().toLocaleString());
  console.log('\n---\n');
  
  const order = [
    'labor_market',
    'financial_viability',
    'employer_demand',
    'learner_demand',
    'competitive_landscape',
    'regulatory_compliance',
    'institutional_fit',
    'tiger_team_synthesis',
    'qa_review'
  ];
  
  for (const type of order) {
    const comp = components.find(c => c.component_type === type);
    if (comp && comp.markdown_output) {
      console.log(comp.markdown_output);
      console.log('\n---\n');
    }
  }
}

getReport();
