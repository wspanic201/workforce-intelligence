import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';

/** GET /api/admin/pipeline-runs/[id]/download-pdf — Download stored PDF */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: projectId } = await params;
  const supabase = getSupabaseServerClient();

  // Get report with PDF storage path
  const { data: report } = await supabase
    .from('validation_reports')
    .select('pdf_url')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!report?.pdf_url) {
    return NextResponse.json(
      { error: 'No PDF available. Run the pipeline to generate one.' },
      { status: 404 }
    );
  }

  // Download from Supabase Storage
  const { data: fileData, error } = await supabase.storage
    .from('reports')
    .download(report.pdf_url);

  if (error || !fileData) {
    return NextResponse.json(
      { error: `Failed to download PDF: ${error?.message}` },
      { status: 500 }
    );
  }

  // Get project name for filename
  const { data: project } = await supabase
    .from('validation_projects')
    .select('program_name')
    .eq('id', projectId)
    .single();

  const programName = project?.program_name || 'Report';
  const filename = `${programName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-')}-Validation-Report.pdf`;

  const buffer = await fileData.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.byteLength.toString(),
    },
  });
}
