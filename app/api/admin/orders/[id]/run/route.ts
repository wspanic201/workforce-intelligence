import { NextRequest, NextResponse, after } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { enqueueRunJob, processNextRunJob } from '@/lib/pipeline/run-jobs';
import { orchestrateDiscovery } from '@/lib/agents/discovery/orchestrator';
import { generateDiscoveryReport } from '@/lib/reports/discovery-report';

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

  const supportedTiers = ['discovery', 'validation', 'discovery_validation', 'full_lifecycle'];
  if (!supportedTiers.includes(order.service_tier)) {
    return NextResponse.json(
      { error: `Service tier '${order.service_tier}' is not configured for pipeline runs from this button.` },
      { status: 400 }
    );
  }

  // Discovery-only orders run the discovery pipeline directly.
  if (order.service_tier === 'discovery') {
    const institutionData = order.institution_data || {};
    const geographicArea = [institutionData.primaryCity, institutionData.state].filter(Boolean).join(', ') || institutionData.metroArea || 'Regional service area';

    const { data: discoveryProject, error: discoveryError } = await supabase
      .from('discovery_projects')
      .insert({
        user_id: null,
        institution_name: order.institution_name,
        geographic_area: geographicArea,
        current_programs: institutionData.focusAreas ? [institutionData.focusAreas] : [],
        status: 'pending',
      })
      .select('id')
      .single();

    if (discoveryError || !discoveryProject) {
      return NextResponse.json({ error: discoveryError?.message || 'Failed to create discovery project' }, { status: 500 });
    }

    const startedAt = new Date().toISOString();
    await supabase
      .from('orders')
      .update({
        order_status: 'running',
        pipeline_started_at: startedAt,
        discovery_cache_key: discoveryProject.id,
        pipeline_metadata: {
          run_type: 'discovery',
          discovery_project_id: discoveryProject.id,
          model_override: modelOverride,
          model_profile: modelProfile,
          persona_slugs: personaSlugs,
        },
      })
      .eq('id', id);

    after(async () => {
      try {
        const result = await orchestrateDiscovery({
          projectId: discoveryProject.id,
          institutionName: order.institution_name,
          geographicArea,
          currentPrograms: institutionData.focusAreas ? [institutionData.focusAreas] : [],
        });

        const reportMarkdown = generateDiscoveryReport(result);
        const completedAt = new Date().toISOString();

        await supabase
          .from('discovery_projects')
          .update({
            status: result.status === 'success' ? 'completed' : result.status,
            results: {
              regionalScan: result.regionalScan,
              gapAnalysis: result.gapAnalysis,
              programRecommendations: result.programRecommendations,
              executiveSummary: result.executiveSummary,
              errors: result.errors,
            },
            report_markdown: reportMarkdown,
            completed_at: completedAt,
            updated_at: completedAt,
          })
          .eq('id', discoveryProject.id);

        await supabase
          .from('orders')
          .update({
            order_status: 'review',
            report_markdown: reportMarkdown,
            pipeline_completed_at: completedAt,
            pipeline_metadata: {
              run_type: 'discovery',
              discovery_project_id: discoveryProject.id,
              model_override: modelOverride,
              model_profile: modelProfile,
              persona_slugs: personaSlugs,
              completed: true,
            },
          })
          .eq('id', id);
      } catch (error) {
        await supabase
          .from('orders')
          .update({
            order_status: 'review',
            pipeline_metadata: {
              run_type: 'discovery',
              discovery_project_id: discoveryProject.id,
              last_error: error instanceof Error ? error.message : String(error),
            },
          })
          .eq('id', id);
      }
    });

    return NextResponse.json({
      ok: true,
      orderId: id,
      discoveryProjectId: discoveryProject.id,
      mode: 'discovery',
      modelOverride,
      modelProfile,
      personaSlugs,
    });
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
