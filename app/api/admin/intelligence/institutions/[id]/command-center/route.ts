import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseServerClient();

  try {
    const { data: inst, error: instErr } = await supabase
      .from('intel_institutions')
      .select('id,name,short_name,state,city')
      .eq('id', id)
      .single();

    if (instErr || !inst) return NextResponse.json({ error: 'Institution not found' }, { status: 404 });

    const instName = inst.name || '';
    const shortName = inst.short_name || '';

    // Programs + custom data counts and recent rows
    const [{ data: programs }, { data: custom }] = await Promise.all([
      supabase.from('intel_institution_programs').select('id,program_name,credential_level,credit_type,active,updated_at').eq('institution_id', id).order('updated_at', { ascending: false }).limit(20),
      supabase.from('intel_institution_custom').select('id,data_category,data_key,data_value,confidence,updated_at').eq('institution_id', id).order('updated_at', { ascending: false }).limit(20),
    ]);

    // State priorities for institution state
    const { data: priorities } = await supabase
      .from('intel_state_priorities')
      .select('id,occupation_title,soc_code,sector,priority_level,effective_year,wioa_fundable,scholarship_eligible')
      .eq('state', inst.state)
      .order('updated_at', { ascending: false })
      .limit(25);

    // Recent reports for this institution
    const { data: projects } = await supabase
      .from('validation_projects')
      .select('id,program_name,status,created_at')
      .or(`client_name.ilike.%${instName}%,client_name.ilike.%${shortName}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    let reports: any[] = [];
    if (projects && projects.length) {
      const ids = projects.map((p: any) => p.id);
      const { data: runs } = await supabase
        .from('pipeline_runs')
        .select('project_id,report_id,composite_score,recommendation,created_at')
        .in('project_id', ids)
        .order('created_at', { ascending: false });

      const runMap = new Map((runs || []).map((r: any) => [r.project_id, r]));
      reports = projects.map((p: any) => ({ ...p, run: runMap.get(p.id) || null, source: 'validation_project' }));
    }

    // Also link generated order reports
    const { data: orders } = await supabase
      .from('orders')
      .select('id, institution_name, order_status, created_at, report_markdown, service_tier, validation_project_id, pipeline_run_id, validation_report_id')
      .or(`institution_name.ilike.%${instName}%,institution_name.ilike.%${shortName}%`)
      .order('created_at', { ascending: false })
      .limit(12);

    const orderReports = (orders || []).map((o: any) => ({
      id: o.id,
      program_name: `${(o.service_tier || 'Order').toString().replace(/_/g,' ')} report`,
      status: o.order_status,
      created_at: o.created_at,
      run: {
        report_id: `ORD-${o.id.slice(0, 8).toUpperCase()}`,
        composite_score: null,
        recommendation: o.report_markdown ? 'Report Generated' : 'No report markdown',
      },
      source: 'order',
      links: {
        validation_project_id: o.validation_project_id || null,
        pipeline_run_id: o.pipeline_run_id || null,
        validation_report_id: o.validation_report_id || null,
      },
    }));

    const allReports = [...reports, ...orderReports].sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const programCounts = {
      total: programs?.length || 0,
      active: (programs || []).filter((p: any) => p.active).length,
      credit: (programs || []).filter((p: any) => p.credit_type === 'credit').length,
      noncredit: (programs || []).filter((p: any) => p.credit_type === 'noncredit').length,
      both: (programs || []).filter((p: any) => p.credit_type === 'both').length,
    };

    return NextResponse.json({
      institution: inst,
      programCounts,
      programs: programs || [],
      custom: custom || [],
      statePriorities: priorities || [],
      reports: allReports,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load command center data' }, { status: 500 });
  }
}
