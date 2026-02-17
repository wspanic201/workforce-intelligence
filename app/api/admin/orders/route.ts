import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { getSupabaseServerClient } from '@/lib/supabase/client';

/** GET /api/admin/orders — List all orders */
export async function GET(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const supabase = getSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('order_status', status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/** POST /api/admin/orders — Create order (admin intake, no payment) */
export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const {
      contact_name,
      contact_email,
      contact_phone,
      contact_title,
      institution_name,
      institution_data,
      service_tier,
      amount_cents,
      admin_notes,
    } = body;

    if (!contact_name || !contact_email || !institution_name) {
      return NextResponse.json(
        { error: 'contact_name, contact_email, and institution_name are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('orders')
      .insert({
        contact_name,
        contact_email,
        contact_phone: contact_phone || null,
        contact_title: contact_title || null,
        institution_name,
        institution_data: institution_data || {},
        service_tier: service_tier || 'discovery',
        amount_cents: amount_cents || 0,
        payment_status: 'waived',
        order_status: 'paid', // Admin orders skip payment
        admin_created: true,
        admin_notes: admin_notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
