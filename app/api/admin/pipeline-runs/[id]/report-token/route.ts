import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';

/** GET /api/admin/pipeline-runs/[id]/report-token — Check if a report exists for this project */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: projectId } = await params;
  const supabase = getSupabaseServerClient();

  // Check validation_reports
  const { data: report } = await supabase
    .from('validation_reports')
    .select('id, pdf_url')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (report) {
    return NextResponse.json({ hasReport: true, hasPdf: !!report.pdf_url });
  }

  // Fallback: check if pipeline_run exists with a report hash (meaning report was generated)
  const { data: run } = await supabase
    .from('pipeline_runs')
    .select('id, report_markdown_hash, report_size_kb')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (run?.report_markdown_hash) {
    return NextResponse.json({ hasReport: true, hasPdf: false });
  }

  return NextResponse.json({ hasReport: false, hasPdf: false });
}
