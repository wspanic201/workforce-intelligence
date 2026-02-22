import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { handleCreate } from '@/lib/intelligence/crud';
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { data, error } = await getSupabaseServerClient().from('intel_institution_programs').select('*').eq('institution_id', id).order('program_name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_institution_programs'); }
