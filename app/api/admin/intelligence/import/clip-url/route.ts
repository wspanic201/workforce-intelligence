import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { url, targetTable, aiExtract } = await req.json();
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Wavelength Intelligence Bot/1.0' },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.status}` }, { status: 400 });
    }

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    // Strip HTML to plain text
    const plainText = contentType.includes('html')
      ? text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 50000)
      : text.slice(0, 50000);

    // Extract title from HTML
    const titleMatch = text.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;

    // Detect source type from URL
    const hostname = new URL(url).hostname.toLowerCase();
    const sourceType = hostname.includes('.gov') ? 'government'
      : hostname.includes('.edu') ? 'research'
      : hostname.includes('bls.gov') ? 'government'
      : 'news';

    // If AI extraction requested, use Claude to structure the data
    if (aiExtract && targetTable) {
      const structured = await aiExtractData(plainText, url, targetTable);
      return NextResponse.json({
        success: true,
        source: { title, url, sourceType, textLength: plainText.length },
        extracted: structured,
        targetTable,
      });
    }

    // Default: save as a source record
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('intel_sources').insert({
      title,
      source_type: sourceType,
      url,
      summary: plainText.slice(0, 500),
      full_text: plainText,
      reliability: sourceType === 'government' ? 'official' : 'unverified',
      publisher: new URL(url).hostname.replace('www.', ''),
      topics: [],
      states: [],
      institution_ids: [],
      soc_codes: [],
      last_verified: new Date().toISOString(),
      verified_by: 'matt',
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      success: true,
      source: data,
      textPreview: plainText.slice(0, 1000),
      textLength: plainText.length,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to clip URL' }, { status: 500 });
  }
}

async function aiExtractData(text: string, url: string, targetTable: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const client = new Anthropic({ apiKey });

  const tableSchemas: Record<string, string> = {
    intel_wages: `Extract wage/salary data. Return JSON array of objects with: soc_code, occupation_title, geo_level (national|state|msa), geo_code, geo_name, median_annual, mean_annual, pct_10, pct_25, pct_75, pct_90, employment, bls_release, source_url, notes`,
    intel_statutes: `Extract statute/regulation data. Return JSON array of objects with: state (2-letter), code_type (statute|admin_rule|regulation), code_chapter, code_section, title, summary, admin_code_ref, regulatory_body, status (active|repealed|amended|pending), category, source_url, notes`,
    intel_credentials: `Extract credential/licensing data. Return JSON array of objects with: state (2-letter), credential_name, credential_type (license|certification|registration|permit), required_hours, hour_type (clock|credit), education_requirement, exam_required (boolean), exam_name, regulatory_body, renewal_period_years, ce_hours_required, source_url, notes`,
    intel_employers: `Extract employer data. Return JSON array of objects with: employer_name, industry, naics_code, state (2-letter), city, msa, estimated_employees, key_occupations (array of strings), source_url, notes`,
    intel_institutions: `Extract institution data. Return JSON array of objects with: name, short_name, state (2-letter), city, county, zip, ipeds_id, type (community_college|technical_college|4yr_public|4yr_private), accreditor, website, system_name, total_enrollment, notes`,
  };

  const schema = tableSchemas[targetTable];
  if (!schema) throw new Error(`Unknown target table: ${targetTable}`);

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Extract structured data from this document for a workforce intelligence database.

Source URL: ${url}

${schema}

IMPORTANT: Only extract data that is explicitly stated in the text. Do not infer or estimate. If a field is not found, use null.
Return ONLY a JSON array — no markdown, no explanation.

Document text:
${text.slice(0, 30000)}`
    }],
  });

  const content = msg.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  // Parse the JSON from the response
  const jsonText = content.text.trim();
  const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found in AI response');

  return JSON.parse(jsonMatch[0]);
}
