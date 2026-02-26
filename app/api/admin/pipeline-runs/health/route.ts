import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';

function percentile(values: number[], p: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx] ?? null;
}

/** GET /api/admin/pipeline-runs/health — basic reliability/SLO metrics */
export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const lookbackHours = Math.max(1, Math.min(168, parseInt(new URL(req.url).searchParams.get('hours') || '24', 10)));
  const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000).toISOString();

  const supabase = getSupabaseServerClient();

  const [runsResult, eventsResult] = await Promise.all([
    supabase
      .from('pipeline_runs')
      .select('id, runtime_seconds, created_at, recommendation')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(300),
    supabase
      .from('pipeline_run_events')
      .select('event_type, stage_key, level, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(2000),
  ]);

  if (runsResult.error) {
    return NextResponse.json({ error: runsResult.error.message }, { status: 500 });
  }
  if (eventsResult.error) {
    return NextResponse.json({ error: eventsResult.error.message }, { status: 500 });
  }

  const runs = runsResult.data || [];
  const events = eventsResult.data || [];

  const runtimeValues = runs
    .map((r) => r.runtime_seconds)
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0);

  const stageFailed = events.filter((e) => e.event_type === 'stage_failed').length;
  const stageRetried = events.filter((e) => e.event_type === 'stage_retry_scheduled').length;
  const runFailed = events.filter((e) => e.event_type === 'run_failed').length;
  const runCompleted = events.filter((e) => e.event_type === 'run_completed').length;

  const health = {
    lookbackHours,
    runCount: runs.length,
    runCompleted,
    runFailed,
    stageFailed,
    stageRetried,
    retryRate: stageFailed > 0 ? Number((stageRetried / stageFailed).toFixed(3)) : 0,
    avgRuntimeSeconds: runtimeValues.length ? Number((runtimeValues.reduce((a, b) => a + b, 0) / runtimeValues.length).toFixed(2)) : null,
    p95RuntimeSeconds: percentile(runtimeValues, 95),
    latestRunAt: runs[0]?.created_at || null,
  };

  return NextResponse.json(health);
}
