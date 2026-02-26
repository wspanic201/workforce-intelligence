import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { orchestrateValidation } from '@/lib/agents/orchestrator';

/**
 * POST /api/admin/orders/[id]/run
 * Create a validation_project from an admin order and start orchestrator.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseServerClient();

  // Load order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // If already linked, don't create duplicates
  if (order.validation_project_id) {
    return NextResponse.json(
      { error: 'Order already linked to a validation project', projectId: order.validation_project_id },
      { status: 409 }
    );
  }

  // These tiers map to validation flow
  if (!['validation', 'discovery_validation', 'full_lifecycle'].includes(order.service_tier)) {
    return NextResponse.json(
      { error: `Service tier '${order.service_tier}' is not configured for validation pipeline runs from this button.` },
      { status: 400 }
    );
  }

  const institutionData = order.institution_data || {};
  const programName = institutionData.specificProgram || order.institution_name || 'Program Validation';
  const constraints = [
    institutionData.additionalContext,
    institutionData.counties ? `Counties: ${institutionData.counties}` : null,
    institutionData.metroArea ? `Metro: ${institutionData.metroArea}` : null,
    institutionData.focusAreas ? `Focus Areas: ${institutionData.focusAreas}` : null,
  ].filter(Boolean).join('\n');

  // Create validation project
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

  // Link order to project + mark as truly running
  const startedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      order_status: 'running',
      validation_project_id: project.id,
      pipeline_started_at: startedAt,
      pipeline_metadata: {
        triggered_from: 'admin_run_button',
        started_at: startedAt,
      },
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Fire and forget orchestrator
  orchestrateValidation(project.id).catch(async (error) => {
    console.error(`[AdminRun] Orchestration failed for order ${id}, project ${project.id}:`, error);
    await supabase
      .from('orders')
      .update({
        order_status: 'review',
        pipeline_metadata: {
          triggered_from: 'admin_run_button',
          started_at: startedAt,
          last_error: error?.message || String(error),
        },
      })
      .eq('id', id);
  });

  return NextResponse.json({ ok: true, orderId: id, projectId: project.id });
}
