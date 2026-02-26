import { NextRequest, NextResponse, after } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { orchestrateValidation } from '@/lib/agents/orchestrator';
import { logRunEvent } from '@/lib/pipeline/telemetry';

export const maxDuration = 300;

/**
 * POST /api/admin/pipeline-runs/[id]/resume
 * Resume/replay a project pipeline from checkpoints.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const payload = await req.json().catch(() => ({}));
  const selectedModel = typeof payload?.model === 'string' && payload.model.trim().length > 0
    ? payload.model.trim().slice(0, 120)
    : null;
  const selectedProfile = typeof payload?.modelProfile === 'string' && payload.modelProfile.trim().length > 0
    ? payload.modelProfile.trim().slice(0, 120)
    : null;

  const { data: run, error: runError } = await supabase
    .from('pipeline_runs')
    .select('id, project_id, model, config')
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

  let resolvedModel = selectedModel || run.model;
  let resolvedProfile = selectedProfile;

  if (selectedProfile && selectedProfile !== 'custom') {
    const { data: profile } = await supabase
      .from('model_profiles')
      .select('slug, model, is_active')
      .eq('slug', selectedProfile)
      .eq('is_active', true)
      .maybeSingle();

    if (profile?.model && !selectedModel) {
      resolvedModel = profile.model;
    }
    if (!profile) {
      resolvedProfile = null;
    }
  }

  if (selectedModel || selectedProfile) {
    const mergedConfig = {
      ...(run.config || {}),
      model: resolvedModel,
      modelProfile: resolvedProfile || null,
    };

    await supabase
      .from('pipeline_runs')
      .update({
        model: resolvedModel,
        config: mergedConfig,
      })
      .eq('id', run.id);
  }

  await logRunEvent({
    pipelineRunId: run.id,
    projectId: run.project_id,
    eventType: 'manual_resume_requested',
    level: 'warn',
    message: 'Manual resume requested from admin dashboard',
    metadata: {
      source: 'admin_dashboard',
      selectedModel: resolvedModel,
      selectedProfile: resolvedProfile,
    },
  });

  // Resume after response using Next.js after() for more reliable background execution.
  after(async () => {
    try {
      await orchestrateValidation(run.project_id, {
        modelOverride: resolvedModel,
        modelProfile: resolvedProfile || undefined,
      });
    } catch (error) {
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
    }
  });

  return NextResponse.json({
    ok: true,
    projectId: run.project_id,
    message: 'Resume started',
    model: resolvedModel,
    modelProfile: resolvedProfile || null,
  });
}
