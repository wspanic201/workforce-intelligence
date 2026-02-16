const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkError() {
  const projectId = '847e307d-87de-4cd5-8059-83b6cb1e18ef';
  
  const { data: components } = await supabase
    .from('research_components')
    .select('component_type, status, error_message')
    .eq('project_id', projectId);
  
  console.log('Agent Status:');
  components?.forEach(c => {
    console.log(`  - ${c.component_type}: ${c.status}`);
    if (c.error_message) {
      console.log(`    Error: ${c.error_message.substring(0, 200)}`);
    }
  });
}

checkError();
