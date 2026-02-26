import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { orchestrateValidation } from '@/lib/agents/orchestrator';
import { logRunEvent } from '@/lib/pipeline/telemetry';

/**
 * POST /api/admin/pipeline-runs/[id]/resume
 * Resume/replay a project pipeline from checkpoints.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data: run, error: runError } = await supabase
    .from('pipeline_runs')
    .select('id, project_id')
    .eq('id', id)
    .maybeSingle();

  if (runError || !run) {
    return NextResponse.json({ error: 'Pipeline run not found' }, { status: 404 });
  }

  const { data: project, error: projectError } = await supabase
    .from('validation_projects')
    .select('id, status')
    .eq('id', run.project_id)
    .maybeSingle();

  if (projectError || !project) {
    return NextResponse.json({ error: 'Validation project not found' }, { status: 404 });
  }

  if (project.status === 'researching') {
    return NextResponse.json(
      { error: 'Project is already running', projectId: project.id },
      { status: 409 }
    );
  }

  await logRunEvent({
    pipelineRunId: run.id,
    projectId: run.project_id,
    eventType: 'manual_resume_requested',
    level: 'warn',
    message: 'Manual resume requested from admin dashboard',
    metadata: { source: 'admin_dashboard' },
  });

  // Kick off async resume. The orchestrator is checkpoint-aware and will skip completed stages.
  orchestrateValidation(run.project_id).catch(async (error) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Admin Resume] Failed for project ${run.project_id}:`, error);
    await logRunEvent({
      pipelineRunId: run.id,
      projectId: run.project_id,
      eventType: 'manual_resume_failed',
      level: 'error',
      message: 'Manual resume failed',
      metadata: { error: errorMessage },
    });
  });

  return NextResponse.json({ ok: true, projectId: run.project_id, message: 'Resume started' });
}
