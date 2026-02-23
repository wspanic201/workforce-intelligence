import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';

/** GET /api/admin/pipeline-runs/[id]/compare — This run + previous run for same project */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseServerClient();

  // Fetch the current run
  const { data: current, error: currentError } = await supabase
    .from('pipeline_runs')
    .select('*, validation_projects(program_name, client_name, status)')
    .eq('id', id)
    .single();

  if (currentError || !current) {
    return NextResponse.json({ error: 'Pipeline run not found' }, { status: 404 });
  }

  // Fetch the previous run for the same project (created before this one)
  const { data: previous } = await supabase
    .from('pipeline_runs')
    .select('*, validation_projects(program_name, client_name, status)')
    .eq('project_id', current.project_id)
    .lt('created_at', current.created_at)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({
    current,
    previous: previous || null,
  });
}
