import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';

/** GET /api/admin/pipeline-runs/[id] — Single run with full details */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('pipeline_runs')
    .select('*, validation_projects(program_name, client_name, status)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Pipeline run not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

/** PATCH /api/admin/pipeline-runs/[id] — Update review scores */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();

    const allowed = [
      'review_scores', 'review_notes', 'reviewed_at', 'reviewed_by',
      'runtime_seconds', 'total_tokens', 'estimated_cost_usd',
      'agent_scores', 'composite_score', 'recommendation',
      'citation_corrections', 'citation_warnings', 'intel_tables_used',
      'report_version', 'report_markdown_hash', 'report_page_count', 'report_size_kb',
    ];

    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('pipeline_runs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
