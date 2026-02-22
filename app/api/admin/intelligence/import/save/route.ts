import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';

const ALLOWED_TABLES = [
  'intel_wages', 'intel_statutes', 'intel_institutions', 'intel_credentials',
  'intel_employers', 'intel_sources', 'intel_institution_programs', 'intel_institution_custom',
];

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { targetTable, records, sourceUrl } = await req.json();

  if (!targetTable || !ALLOWED_TABLES.includes(targetTable)) {
    return NextResponse.json({ error: 'Invalid target table' }, { status: 400 });
  }
  if (!Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ error: 'No records to save' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();

  // Add metadata to each record
  const enriched = records.map(r => ({
    ...r,
    source_url: r.source_url || sourceUrl || null,
    last_verified: now,
    verified_by: 'matt',
  }));

  const { data, error } = await supabase
    .from(targetTable)
    .insert(enriched)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message, detail: error.details }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    inserted: data?.length || 0,
    targetTable,
  });
}
