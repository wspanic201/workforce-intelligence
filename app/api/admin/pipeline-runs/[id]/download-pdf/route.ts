import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { generatePDFServerless } from '@/lib/pdf/generate-pdf-serverless';

/** GET /api/admin/pipeline-runs/[id]/download-pdf — Download or generate PDF */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: projectId } = await params;
  const supabase = getSupabaseServerClient();

  // Get report
  const { data: report } = await supabase
    .from('validation_reports')
    .select('pdf_url, full_report_markdown')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!report) {
    return NextResponse.json(
      { error: 'No report found for this project.' },
      { status: 404 }
    );
  }

  // Get project info for filename and PDF metadata
  const { data: project } = await supabase
    .from('validation_projects')
    .select('program_name, client_name, program_type')
    .eq('id', projectId)
    .single();

  const programName = project?.program_name || 'Report';
  const clientName = project?.client_name || 'Institution';
  const filename = `${programName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-')}-Report.pdf`;

  // Option A: Stored PDF exists — download from storage
  if (report.pdf_url) {
    const { data: fileData, error } = await supabase.storage
      .from('reports')
      .download(report.pdf_url);

    if (!error && fileData) {
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
    // If storage download fails, fall through to generate from markdown
  }

  // Option B: No stored PDF — generate from markdown on-the-fly
  if (!report.full_report_markdown) {
    return NextResponse.json(
      { error: 'No PDF or report markdown available.' },
      { status: 404 }
    );
  }

  try {
    const reportType = (project?.program_type === 'discovery') ? 'discovery' : 'validation';

    const pdfBuffer = await generatePDFServerless(report.full_report_markdown, {
      title: programName,
      preparedFor: clientName,
      reportType,
    });

    const uint8 = new Uint8Array(pdfBuffer);
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': uint8.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error('[PDF Download] Generation failed:', err);
    return NextResponse.json(
      { error: `PDF generation failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
