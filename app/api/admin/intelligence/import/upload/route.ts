import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const targetTable = formData.get('targetTable') as string | null;

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const filename = file.name;
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    let textContent: string;
    let fileType: string;

    if (ext === 'csv') {
      textContent = buffer.toString('utf-8');
      fileType = 'csv';
    } else if (ext === 'txt' || ext === 'md') {
      textContent = buffer.toString('utf-8');
      fileType = 'text';
    } else if (ext === 'json') {
      textContent = buffer.toString('utf-8');
      fileType = 'json';
    } else if (ext === 'pdf') {
      // For PDF, extract text using a simple approach
      // PDFs are sent to Claude as a document for extraction
      textContent = `[PDF file: ${filename}, ${buffer.length} bytes]`;
      fileType = 'pdf';
    } else if (ext === 'xlsx' || ext === 'xls') {
      textContent = `[Excel file: ${filename}, ${buffer.length} bytes]`;
      fileType = 'excel';
    } else {
      return NextResponse.json({ error: `Unsupported file type: .${ext}` }, { status: 400 });
    }

    // If no target table, just save as a source with the raw text
    if (!targetTable) {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase.from('intel_sources').insert({
        title: filename,
        source_type: 'internal',
        summary: textContent.slice(0, 500),
        full_text: textContent.slice(0, 100000),
        reliability: 'verified',
        publisher: 'Uploaded document',
        topics: [],
        states: [],
        institution_ids: [],
        soc_codes: [],
        last_verified: new Date().toISOString(),
        verified_by: 'matt',
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, source: data, fileType, textLength: textContent.length });
    }

    // AI extraction for structured data
    const extracted = await aiExtractFromFile(buffer, filename, fileType, textContent, targetTable);

    return NextResponse.json({
      success: true,
      extracted,
      targetTable,
      filename,
      fileType,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}

async function aiExtractFromFile(
  buffer: Buffer,
  filename: string,
  fileType: string,
  textContent: string,
  targetTable: string
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const client = new Anthropic({ apiKey });

  const tableSchemas: Record<string, string> = {
    intel_wages: `Extract wage/salary data. Return JSON array: [{soc_code, occupation_title, geo_level (national|state|msa), geo_code, geo_name, median_annual, mean_annual, pct_10, pct_25, pct_75, pct_90, employment, bls_release, notes}]`,
    intel_statutes: `Extract statute/regulation data. Return JSON array: [{state, code_type, code_chapter, code_section, title, summary, admin_code_ref, regulatory_body, status, category, notes}]`,
    intel_credentials: `Extract credential/licensing data. Return JSON array: [{state, credential_name, credential_type, required_hours, hour_type, education_requirement, exam_required, exam_name, regulatory_body, renewal_period_years, ce_hours_required, notes}]`,
    intel_employers: `Extract employer data. Return JSON array: [{employer_name, industry, naics_code, state, city, msa, estimated_employees, key_occupations, notes}]`,
    intel_institutions: `Extract institution data. Return JSON array: [{name, short_name, state, city, county, zip, ipeds_id, type, accreditor, website, system_name, total_enrollment, notes}]`,
  };

  const schema = tableSchemas[targetTable];
  if (!schema) throw new Error(`Unknown target table: ${targetTable}`);

  const messages: Anthropic.MessageCreateParams['messages'] = [];

  if (fileType === 'pdf') {
    // Send PDF as base64 document
    messages.push({
      role: 'user',
      content: [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: buffer.toString('base64'),
          },
        },
        {
          type: 'text',
          text: `Extract structured data from this PDF for a workforce intelligence database.\n\n${schema}\n\nIMPORTANT: Only extract data explicitly stated. Use null for missing fields. Return ONLY a JSON array.`,
        },
      ],
    });
  } else {
    // Send text content directly
    messages.push({
      role: 'user',
      content: `Extract structured data from this ${fileType} file for a workforce intelligence database.

Filename: ${filename}

${schema}

IMPORTANT: Only extract data explicitly stated. Use null for missing fields. Return ONLY a JSON array.

File content:
${textContent.slice(0, 40000)}`,
    });
  }

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 8192,
    messages,
  });

  const content = msg.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  const jsonText = content.text.trim();
  const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found in AI response');

  return JSON.parse(jsonMatch[0]);
}
