import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { generateReportId } from '@/lib/utils/report-id';

/** GET /api/admin/pipeline-runs — List pipeline runs with project info */
export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('project_id');
  const reviewed = searchParams.get('reviewed');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = supabase
    .from('pipeline_runs')
    .select('*, validation_projects(program_name, client_name, status)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  if (reviewed === 'true') {
    query = query.not('reviewed_at', 'is', null);
  } else if (reviewed === 'false') {
    query = query.is('reviewed_at', null);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/** POST /api/admin/pipeline-runs — Create a new pipeline run */
export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const model = body.model || 'claude-sonnet-4-6';
    const reportId = await generateReportId(model, new Date());

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('pipeline_runs')
      .insert({
        project_id: body.project_id,
        pipeline_version: body.pipeline_version || 'v2.0',
        model,
        report_id: reportId,
        prompt_version: body.prompt_version || null,
        report_template: body.report_template || 'professional-v2',
        config: body.config || {},
        runtime_seconds: body.runtime_seconds || null,
        total_tokens: body.total_tokens || null,
        estimated_cost_usd: body.estimated_cost_usd || null,
        agents_run: body.agents_run || [],
        agent_scores: body.agent_scores || {},
        composite_score: body.composite_score || null,
        recommendation: body.recommendation || null,
        citation_corrections: body.citation_corrections || 0,
        citation_warnings: body.citation_warnings || 0,
        intel_tables_used: body.intel_tables_used || 0,
        tiger_team_enabled: body.tiger_team_enabled ?? true,
        report_version: body.report_version || 1,
        report_markdown_hash: body.report_markdown_hash || null,
        report_page_count: body.report_page_count || null,
        report_size_kb: body.report_size_kb || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
