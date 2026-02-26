import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';

interface ProfileInput {
  slug?: string;
  display_name?: string;
  model?: string;
  description?: string | null;
  is_active?: boolean;
  is_default?: boolean;
  settings?: Record<string, any>;
}

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export async function GET() {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('model_profiles')
    .select('id, slug, display_name, model, description, is_active, is_default, settings, created_at, updated_at')
    .order('is_default', { ascending: false })
    .order('display_name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as ProfileInput;
  const displayName = String(body.display_name || '').trim();
  const model = String(body.model || '').trim();
  const slug = sanitizeSlug(String(body.slug || displayName));

  if (!displayName || !model || !slug) {
    return NextResponse.json({ error: 'display_name, model, and slug are required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (body.is_default) {
    await supabase.from('model_profiles').update({ is_default: false }).eq('is_default', true);
  }

  const { data, error } = await supabase
    .from('model_profiles')
    .insert({
      slug,
      display_name: displayName,
      model,
      description: body.description?.trim() || null,
      is_active: body.is_active ?? true,
      is_default: body.is_default ?? false,
      settings: body.settings || {},
    })
    .select('id, slug, display_name, model, description, is_active, is_default, settings, created_at, updated_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
