import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';

/** GET /api/admin/research-components — List research components for a project */
export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('project_id');

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const [componentsResult, projectResult] = await Promise.all([
    supabase
      .from('research_components')
      .select('id, project_id, component_type, agent_persona, markdown_output, status, error_message, created_at, completed_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true }),
    supabase
      .from('validation_projects')
      .select('program_name, client_name, status, created_at')
      .eq('id', projectId)
      .single(),
  ]);

  if (componentsResult.error) {
    return NextResponse.json({ error: componentsResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    components: componentsResult.data || [],
    project: projectResult.data || null,
  });
}
