import { NextRequest, NextResponse, after } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { enqueueRunJob, processNextRunJob } from '@/lib/pipeline/run-jobs';

export const maxDuration = 300;

/**
 * POST /api/admin/orders/[id]/run
 * Queue a durable run job from admin. Creates project if needed.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const payload = await req.json().catch(() => ({} as any));
  const modelOverride = typeof payload?.modelOverride === 'string' && payload.modelOverride.trim().length > 0
    ? payload.modelOverride.trim().slice(0, 120)
    : null;
  const modelProfile = typeof payload?.modelProfile === 'string' && payload.modelProfile.trim().length > 0
    ? payload.modelProfile.trim().slice(0, 120)
    : null;
  const personaSlugs = Array.isArray(payload?.personaSlugs)
    ? payload.personaSlugs
        .filter((s: unknown) => typeof s === 'string')
        .map((s: string) => s.trim().toLowerCase())
        .filter((s: string) => /^[a-z0-9-_]{2,80}$/.test(s))
        .slice(0, 8)
    : [];


  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (!['validation', 'discovery_validation', 'full_lifecycle'].includes(order.service_tier)) {
    return NextResponse.json(
      { error: `Service tier '${order.service_tier}' is not configured for validation pipeline runs from this button.` },
      { status: 400 }
    );
  }

  let projectId = order.validation_project_id as string | null;

  if (!projectId) {
    const institutionData = order.institution_data || {};
    const programName = institutionData.specificProgram || order.institution_name || 'Program Validation';
    const constraints = [
      institutionData.additionalContext,
      institutionData.counties ? `Counties: ${institutionData.counties}` : null,
      institutionData.metroArea ? `Metro: ${institutionData.metroArea}` : null,
      institutionData.focusAreas ? `Focus Areas: ${institutionData.focusAreas}` : null,
    ].filter(Boolean).join('\n');

    const { data: project, error: projectError } = await supabase
      .from('validation_projects')
      .insert({
        client_name: order.institution_name,
        client_email: order.contact_email,
        program_name: programName,
        program_type: order.service_tier,
        target_audience: institutionData.focusAreas || null,
        constraints: constraints || null,
        status: 'intake',
      })
      .select('id')
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: projectError?.message || 'Failed to create validation project' }, { status: 500 });
    }

    projectId = project.id;

    await supabase
      .from('orders')
      .update({ validation_project_id: projectId, order_status: 'queued' })
      .eq('id', id);
  }

  if (!projectId) {
    return NextResponse.json({ error: 'Failed to resolve project id for queued run' }, { status: 500 });
  }

  const queued = await enqueueRunJob({
    orderId: id,
    projectId,
    requestedBy: 'admin_dashboard',
    modelOverride,
    modelProfile,
    personaSlugs,
  });

  await supabase
    .from('orders')
    .update({
      order_status: 'queued',
      pipeline_metadata: {
        queue_status: queued.alreadyActive ? 'already_active' : 'queued',
        queued_job_id: queued.job.id,
        model_override: modelOverride,
        model_profile: modelProfile,
        persona_slugs: personaSlugs,
      },
    })
    .eq('id', id);

  after(async () => {
    await processNextRunJob();
  });

  return NextResponse.json({
    ok: true,
    orderId: id,
    projectId,
    jobId: queued.job.id,
    alreadyActive: queued.alreadyActive,
    modelOverride,
    modelProfile,
    personaSlugs,
  });
}
