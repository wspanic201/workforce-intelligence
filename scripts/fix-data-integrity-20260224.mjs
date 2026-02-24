#!/usr/bin/env node
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function normalizeOccupationTitle(raw = '') {
  if (!raw) return raw;
  const original = raw;

  // If parser glued multiple occupations with huge spacing, keep first segment.
  const split = original.split(/\s{3,}/).map(s => s.trim()).filter(Boolean);
  let out = split.length > 0 ? split[0] : original;

  // Remove leading wage artifact like "($33,330)"
  out = out.replace(/^\(\$[\d,]+(?:\.\d+)?\)\s*/i, '');

  // Remove doubled punctuation artifacts
  out = out.replace(/\s{2,}/g, ' ').replace(/\s+,/g, ',').trim();

  return out;
}

async function fixStatePriorities() {
  const { data, error } = await supabase
    .from('intel_state_priorities')
    .select('id, occupation_title')
    .order('updated_at', { ascending: false })
    .limit(5000);

  if (error) throw new Error(`intel_state_priorities fetch failed: ${error.message}`);

  let changed = 0;
  for (const row of data || []) {
    const next = normalizeOccupationTitle(row.occupation_title || '');
    if (next && next !== row.occupation_title) {
      const { error: uErr } = await supabase
        .from('intel_state_priorities')
        .update({ occupation_title: next })
        .eq('id', row.id);
      if (!uErr) changed++;
    }
  }

  return { scanned: (data || []).length, changed };
}

async function backfillTigerTeamPlaceholders() {
  const expected = [
    'labor_market',
    'competitive_landscape',
    'learner_demand',
    'financial_viability',
    'institutional_fit',
    'regulatory_compliance',
    'employer_demand',
  ];

  const { data: comps, error } = await supabase
    .from('research_components')
    .select('project_id, component_type')
    .in('component_type', [...expected, 'tiger_team_synthesis'])
    .limit(10000);

  if (error) throw new Error(`research_components fetch failed: ${error.message}`);

  const byProject = new Map();
  for (const c of comps || []) {
    if (!byProject.has(c.project_id)) byProject.set(c.project_id, new Set());
    byProject.get(c.project_id).add(c.component_type);
  }

  const needing = [];
  for (const [projectId, set] of byProject.entries()) {
    const hasCore = expected.every(t => set.has(t));
    const hasTiger = set.has('tiger_team_synthesis');
    if (hasCore && !hasTiger) needing.push(projectId);
  }

  let inserted = 0;
  for (const projectId of needing) {
    const { error: iErr } = await supabase.from('research_components').insert({
      project_id: projectId,
      component_type: 'tiger_team_synthesis',
      agent_persona: 'system-backfill',
      status: 'completed',
      content: {
        backfilled: true,
        reason: 'Legacy run missing tiger_team_synthesis component. Placeholder inserted for integrity.',
      },
      markdown_output:
        '## Tiger Team Synthesis (Backfilled)\n\nThis legacy run completed core validation components but did not persist tiger team synthesis. Use the full report and component sections for decision review.',
      completed_at: new Date().toISOString(),
    });
    if (!iErr) inserted++;
  }

  return { candidates: needing.length, inserted };
}

async function main() {
  console.log('Running data integrity fixes (2026-02-24)...');

  const sp = await fixStatePriorities();
  console.log(`✓ intel_state_priorities normalized: ${sp.changed}/${sp.scanned}`);

  const tiger = await backfillTigerTeamPlaceholders();
  console.log(`✓ tiger_team_synthesis placeholders inserted: ${tiger.inserted}/${tiger.candidates}`);

  console.log('Done.');
}

main().catch((e) => {
  console.error('Fix script failed:', e.message);
  process.exit(1);
});
