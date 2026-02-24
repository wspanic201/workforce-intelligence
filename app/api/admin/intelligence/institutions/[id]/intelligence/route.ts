import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseServerClient();

  try {
    const { data: inst, error: instErr } = await supabase
      .from('intel_institutions')
      .select('id, name, short_name, state, city')
      .eq('id', id)
      .single();

    if (instErr || !inst) return NextResponse.json({ error: 'Institution not found' }, { status: 404 });

    // Pull all sources and filter in memory for flexible matching
    const { data: allSources, error: srcErr } = await supabase
      .from('intel_sources')
      .select('id,title,publisher,url,summary,source_type,topics,states,institution_ids,updated_at,created_at')
      .order('updated_at', { ascending: false })
      .limit(200);

    if (srcErr) throw srcErr;

    const instName = (inst.name || '').toLowerCase();
    const instShort = (inst.short_name || '').toLowerCase();
    const state = (inst.state || '').toLowerCase();

    const matches = (allSources || []).filter((s: any) => {
      const topicStr = (s.topics || []).join(' ').toLowerCase();
      const title = (s.title || '').toLowerCase();
      const summary = (s.summary || '').toLowerCase();
      const states = (s.states || []).map((x: string) => x.toLowerCase());
      const instIds = s.institution_ids || [];

      // Explicit institution mapping wins
      if (instIds.includes(id)) return true;

      // State + semantic text match
      const text = `${title} ${summary} ${topicStr}`;
      const nameMatch = (instName && text.includes(instName)) || (instShort && text.includes(instShort));
      const stateMatch = state && (states.includes(state) || text.includes(state));

      return nameMatch || stateMatch;
    });

    const byType = matches.reduce((acc: Record<string, number>, s: any) => {
      acc[s.source_type || 'other'] = (acc[s.source_type || 'other'] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      institution: inst,
      total: matches.length,
      byType,
      recent: matches.slice(0, 20),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch intelligence' }, { status: 500 });
  }
}
