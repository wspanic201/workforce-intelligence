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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as ProfileInput;

  const updates: Record<string, any> = {};
  if (typeof body.display_name === 'string') updates.display_name = body.display_name.trim();
  if (typeof body.model === 'string') updates.model = body.model.trim();
  if (typeof body.description === 'string' || body.description === null) updates.description = body.description ? body.description.trim() : null;
  if (typeof body.is_active === 'boolean') updates.is_active = body.is_active;
  if (typeof body.is_default === 'boolean') updates.is_default = body.is_default;
  if (typeof body.slug === 'string') updates.slug = sanitizeSlug(body.slug);
  if (body.settings && typeof body.settings === 'object') updates.settings = body.settings;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (updates.is_default === true) {
    await supabase.from('model_profiles').update({ is_default: false }).eq('is_default', true);
  }

  const { data, error } = await supabase
    .from('model_profiles')
    .update(updates)
    .eq('id', id)
    .select('id, slug, display_name, model, description, is_active, is_default, settings, created_at, updated_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from('model_profiles')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
