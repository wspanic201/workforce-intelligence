const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMissing() {
  const projectId = '1d8be4a2-1b1a-4f69-afd3-f8508c60d681';
  
  const { data: components } = await supabase
    .from('research_components')
    .select('component_type, status, error_message, markdown_output')
    .eq('project_id', projectId)
    .order('created_at');
  
  console.log('Component Status:\n');
  components?.forEach(c => {
    const hasMarkdown = c.markdown_output && c.markdown_output.length > 100;
    console.log(`${c.component_type}:`);
    console.log(`  Status: ${c.status}`);
    console.log(`  Has Output: ${hasMarkdown ? 'YES (' + c.markdown_output.length + ' chars)' : 'NO'}`);
    if (c.error_message) {
      console.log(`  Error: ${c.error_message.substring(0, 100)}`);
    }
    console.log('');
  });
}

checkMissing();
