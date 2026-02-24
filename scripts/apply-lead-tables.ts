import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getSupabaseServerClient } from '@/lib/supabase/client';

async function main() {
  const s = getSupabaseServerClient();
  const r1 = await s.from('signal_subscribers').select('id').limit(1);
  console.log('signal_subscribers:', r1.error?.message?.includes('does not exist') ? '❌ needs create' : '✅ exists');
  const r2 = await s.from('pell_checks').select('id').limit(1);
  console.log('pell_checks:', r2.error?.message?.includes('does not exist') ? '❌ needs create' : '✅ exists');
}
main().catch(console.error);
