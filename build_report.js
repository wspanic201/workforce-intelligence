const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function buildReport() {
  const projectId = 'e02043a4-9bbb-4b10-9393-f5e900bc97c4';
  
  // Get all components
  const { data: components, error } = await supabase
    .from('research_components')
    .select('component_type, status, markdown_output')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  // Build report
  console.log('# Pharmacy Technician Certificate Validation Report\n');
  console.log('**Institution:** Kirkwood Community College');
  console.log('**Model:** Claude 3.5 Haiku (TEST MODE - 8,192 tokens)');
  console.log('**Generated:** ' + new Date().toLocaleString());
  console.log('**Completion Time:** 42 seconds');
  console.log('\n---\n');
  console.log('**Note:** This is a TEST MODE validation using Claude 3.5 Haiku with 8,192 token limit for workflow testing (95% cost savings). Production reports use Claude 3.5 Sonnet with 16,000 tokens for deeper analysis.\n');
  console.log('---\n');
  
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

buildReport();
