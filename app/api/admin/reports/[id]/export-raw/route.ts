import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';

/** GET /api/admin/reports/[id]/export-raw — Export raw agent outputs as .md */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: projectId } = await params;
  const supabase = getSupabaseServerClient();

  const [componentsResult, projectResult] = await Promise.all([
    supabase
      .from('research_components')
      .select('component_type, agent_persona, markdown_output, status')
      .eq('project_id', projectId)
      .eq('status', 'completed')
      .order('created_at', { ascending: true }),
    supabase
      .from('validation_projects')
      .select('program_name, client_name')
      .eq('id', projectId)
      .single(),
  ]);

  if (componentsResult.error) {
    return NextResponse.json({ error: componentsResult.error.message }, { status: 500 });
  }

  const components = componentsResult.data || [];
  if (components.length === 0) {
    return NextResponse.json({ error: 'No completed research components found' }, { status: 404 });
  }

  const project = projectResult.data;
  const title = project?.program_name || 'Report';
  const client = project?.client_name || 'Unknown';

  const sections = [
    `# ${title}`,
    `**Client:** ${client}`,
    `**Exported:** ${new Date().toISOString().split('T')[0]}`,
    `**Status:** Partial — raw agent outputs (no final synthesis)`,
    '',
    '---',
    '',
  ];

  for (const comp of components) {
    sections.push(`## ${comp.agent_persona} (${comp.component_type})`);
    sections.push('');
    sections.push(comp.markdown_output || '*No output*');
    sections.push('');
    sections.push('---');
    sections.push('');
  }

  const markdown = sections.join('\n');
  const filename = `${title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-')}-raw-export.md`;

  return new NextResponse(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
