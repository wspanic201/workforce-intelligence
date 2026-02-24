import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getSupabaseServerClient } from '@/lib/supabase/client';

async function main() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('api_cache')
    .delete()
    .in('api_name', ['serpapi_jobs', 'employer_jobs', 'employer_jobs_brave', 'brave_jobs'])
    .select('api_name');
  if (error) console.error('Error:', error);
  else console.log(`Cleared ${data?.length || 0} cache entries:`, data?.map((r: any) => r.api_name));
}
main().catch(console.error);
