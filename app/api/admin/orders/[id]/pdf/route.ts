/**
 * GET /api/admin/orders/[id]/pdf
 * 
 * Generate and download a branded PDF for a completed order.
 * Requires admin auth (cookie).
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { generatePDFBuffer } from '@/lib/pdf/generate-pdf-serverless';

export const maxDuration = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Auth check
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, report_markdown, institution_data, service_tier, program_name, contact_name, institution_name, created_at')
      .eq('id', params.id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.report_markdown) {
      return NextResponse.json({ error: 'No report available for this order' }, { status: 400 });
    }

    // Determine report type from service tier
    const reportType = order.service_tier?.includes('validation') ? 'validation' : 'discovery';
    const reportTypeLabel = reportType === 'discovery'
      ? 'Program Market Scan'
      : 'Program Validation Report';

    const title = order.program_name
      ? `${order.program_name} — ${reportTypeLabel}`
      : `${reportTypeLabel} — ${order.institution_name || 'Report'}`;

    const date = new Date(order.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const pdfBuffer = await generatePDFBuffer(order.report_markdown, {
      title,
      preparedFor: order.institution_name || order.contact_name || undefined,
      reportType,
      date,
    });

    // Generate filename
    const slug = (order.institution_name || 'report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const filename = `wavelength-${slug}-${reportType}-${order.id.slice(0, 8)}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (err) {
    console.error('[PDF] Generation failed:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'PDF generation failed', details: message }, { status: 500 });
  }
}
