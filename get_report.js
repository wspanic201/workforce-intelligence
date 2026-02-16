const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getReport() {
  const projectId = 'e02043a4-9bbb-4b10-9393-f5e900bc97c4';
  
  // Get all components
  const { data: components, error } = await supabase
    .from('research_components')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  console.log(JSON.stringify(components, null, 2));
}

getReport();
