import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';

/** GET /api/admin/pipeline-runs/[id]/events — Timeline events for a pipeline run */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const limit = Math.max(1, Math.min(500, parseInt(new URL(req.url).searchParams.get('limit') || '200')));
  const supabase = getSupabaseServerClient();

  const { data: run, error: runError } = await supabase
    .from('pipeline_runs')
    .select('id, project_id, created_at')
    .eq('id', id)
    .maybeSingle();

  if (runError || !run) {
    return NextResponse.json({ error: 'Pipeline run not found' }, { status: 404 });
  }

  const bootstrapStart = new Date(Date.parse(run.created_at) - 5 * 60 * 1000).toISOString();

  const [runEventsResult, bootstrapEventsResult] = await Promise.all([
    supabase
      .from('pipeline_run_events')
      .select('id, pipeline_run_id, project_id, event_type, stage_key, level, message, metadata, created_at')
      .eq('pipeline_run_id', id)
      .order('created_at', { ascending: true })
      .limit(limit),
    supabase
      .from('pipeline_run_events')
      .select('id, pipeline_run_id, project_id, event_type, stage_key, level, message, metadata, created_at')
      .eq('project_id', run.project_id)
      .is('pipeline_run_id', null)
      .gte('created_at', bootstrapStart)
      .order('created_at', { ascending: true })
      .limit(limit),
  ]);

  if (runEventsResult.error) {
    return NextResponse.json({ error: runEventsResult.error.message }, { status: 500 });
  }

  if (bootstrapEventsResult.error) {
    return NextResponse.json(runEventsResult.data || []);
  }

  const merged = [...(runEventsResult.data || []), ...(bootstrapEventsResult.data || [])]
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));

  const deduped = Array.from(new Map(merged.map(e => [e.id, e])).values()).slice(-limit);
  return NextResponse.json(deduped);
}
