import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { generatePDFBuffer } from '@/lib/pdf/generate-pdf-serverless';

/** Vercel serverless config — needs more memory + time for PDF generation */
export const maxDuration = 60;

/** GET /api/admin/pipeline-runs/[id]/download-pdf — Generate and download PDF */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: projectId } = await params;
  const supabase = getSupabaseServerClient();

  // Fetch report markdown
  const { data: report } = await supabase
    .from('validation_reports')
    .select('full_report_markdown, version, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!report?.full_report_markdown) {
    return NextResponse.json({ error: 'No report found' }, { status: 404 });
  }

  // Fetch project info for PDF metadata
  const { data: project } = await supabase
    .from('validation_projects')
    .select('program_name, client_name')
    .eq('id', projectId)
    .single();

  const programName = project?.program_name || 'Program';
  const clientName = project?.client_name || '';

  // Clean markdown for PDF pipeline
  let markdown = report.full_report_markdown;
  
  // Strip YAML frontmatter
  markdown = markdown.replace(/^---[\s\S]*?---\n/, '');
  
  // Strip HTML cover page (template generates its own)
  markdown = markdown.replace(/<div style="text-align:center[^>]*>[\s\S]*?<\/div>\s*<div style="page-break-after:\s*always;?\s*"><\/div>/i, '');
  
  // Strip markdown TOC (template generates its own)
  markdown = markdown.replace(/^# Table of Contents\n[\s\S]*?<div style="page-break-after:\s*always;?\s*"><\/div>/m, '');
  
  // Strip inline page break divs
  markdown = markdown.replace(/<div style="page-break-after:\s*always;?\s*"><\/div>\s*/g, '');
  
  // Downgrade headers for PDF template
  markdown = markdown.replace(/^### /gm, '#### ');
  markdown = markdown.replace(/^## /gm, '### ');
  markdown = markdown.replace(/^# /gm, '## ');
  
  markdown = markdown.replace(/\n{4,}/g, '\n\n').trim();

  try {
    const pdfBuffer = await generatePDFBuffer(markdown, {
      title: programName,
      subtitle: 'Program Validation Report',
      preparedFor: clientName,
      date: new Date(report.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
      reportType: 'validation',
    });

    const filename = `${programName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-')}-Validation-Report.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error('[PDF Download] Generation failed:', err);
    return NextResponse.json({ error: `PDF generation failed: ${err.message}` }, { status: 500 });
  }
}
