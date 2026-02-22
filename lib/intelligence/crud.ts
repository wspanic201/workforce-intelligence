/**
 * Generic CRUD operations for Intelligence Hub tables.
 * Used by API routes to avoid code duplication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';

function supabase() { return getSupabaseServerClient(); }

interface ListOptions {
  table: string;
  searchColumns?: string[];       // columns to search with ilike
  filterColumns?: string[];       // columns that can be exact-filtered via query params
  defaultOrder?: string;
  defaultLimit?: number;
}

export async function handleList(req: NextRequest, opts: ListOptions) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || String(opts.defaultLimit ?? 50));
  const q = url.searchParams.get('q') || '';
  const offset = (page - 1) * limit;

  try {
    let query = supabase().from(opts.table).select('*', { count: 'exact' });

    // Search
    if (q && opts.searchColumns?.length) {
      const searchClauses = opts.searchColumns.map(col => `${col}.ilike.%${q}%`).join(',');
      query = query.or(searchClauses);
    }

    // Filters
    if (opts.filterColumns) {
      for (const col of opts.filterColumns) {
        const val = url.searchParams.get(col);
        if (val) query = query.eq(col, val);
      }
    }

    query = query.order(opts.defaultOrder || 'created_at', { ascending: false })
                 .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch' }, { status: 500 });
  }
}

export async function handleCreate(req: NextRequest, table: string) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { data, error } = await supabase().from(table).insert(body).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create' }, { status: 500 });
  }
}

export async function handleGet(id: string, table: string) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data, error } = await supabase().from(table).select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch' }, { status: 500 });
  }
}

export async function handleUpdate(req: NextRequest, id: string, table: string) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    delete body.id;
    delete body.created_at;
    const { data, error } = await supabase().from(table).update(body).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 });
  }
}

export async function handleDelete(id: string, table: string) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { error } = await supabase().from(table).delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 });
  }
}
