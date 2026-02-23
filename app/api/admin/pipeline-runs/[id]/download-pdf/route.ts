import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { generatePDF } from '@/lib/pdf/generate-pdf';
import { readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

/** GET /api/admin/pipeline-runs/[id]/download-pdf — Generate and download PDF for a project */
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
    .select('program_name, client_name, created_at')
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
  
  // Downgrade headers for PDF template (H1→H2, H2→H3, H3→H4)
  markdown = markdown.replace(/^### /gm, '#### ');
  markdown = markdown.replace(/^## /gm, '### ');
  markdown = markdown.replace(/^# /gm, '## ');
  
  // Clean excessive blank lines
  markdown = markdown.replace(/\n{4,}/g, '\n\n');
  markdown = markdown.trim();

  // Generate PDF
  const tmpPath = join(tmpdir(), `wavelength-report-${projectId.slice(0, 8)}-${Date.now()}.pdf`);
  
  try {
    const result = await generatePDF(markdown, {
      title: programName,
      subtitle: 'Program Validation Report',
      preparedFor: clientName,
      date: new Date(report.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
      reportType: 'validation',
      outputPath: tmpPath,
    });

    // Read PDF and return as download
    const pdfBuffer = readFileSync(tmpPath);
    
    // Clean up temp file
    try { unlinkSync(tmpPath); } catch {}

    const filename = `${programName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-')}-Validation-Report.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error('[PDF Download] Generation failed:', err);
    // Clean up temp file on error
    try { unlinkSync(tmpPath); } catch {}
    return NextResponse.json({ error: `PDF generation failed: ${err.message}` }, { status: 500 });
  }
}
