#!/usr/bin/env node
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const runId = process.argv[2];
if (!runId) {
  console.error('Usage: node scripts/phase-c-smoke-check.mjs <pipelineRunId>');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

const { data: events, error } = await supabase
  .from('pipeline_run_events')
  .select('event_type, stage_key, created_at, metadata')
  .eq('pipeline_run_id', runId)
  .order('created_at', { ascending: true });

if (error) {
  console.error('Failed to load events:', error.message);
  process.exit(1);
}

if (!events?.length) {
  console.error('No events found for run:', runId);
  process.exit(1);
}

const failedStages = new Set(events.filter((e) => e.event_type === 'stage_failed').map((e) => e.stage_key).filter(Boolean));
const completedStages = new Set(events.filter((e) => e.event_type === 'stage_completed').map((e) => e.stage_key).filter(Boolean));
const retriedStages = new Set(events.filter((e) => e.event_type === 'stage_retry_scheduled').map((e) => e.stage_key).filter(Boolean));

const unrecovered = [...failedStages].filter((stage) => !completedStages.has(stage));

console.log('Phase C smoke summary');
console.log('Run ID:', runId);
console.log('Failures:', failedStages.size);
console.log('Retries scheduled:', retriedStages.size);
console.log('Recovered stages:', [...failedStages].filter((stage) => completedStages.has(stage)).length);
console.log('Run completed event present:', events.some((e) => e.event_type === 'run_completed'));

if (failedStages.size === 0) {
  console.warn('⚠ No stage_failed events found. For a real smoke test, inject at least one stage failure.');
}

if (unrecovered.length > 0) {
  console.error('❌ Unrecovered failed stages:', unrecovered.join(', '));
  process.exit(2);
}

if (!events.some((e) => e.event_type === 'run_completed')) {
  console.error('❌ Run did not complete');
  process.exit(3);
}

console.log('✅ Smoke check passed: failures (if any) were recovered and run completed.');
