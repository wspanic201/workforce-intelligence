import { getSupabaseServerClient } from '@/lib/supabase/client';
import { orchestrateValidation } from '@/lib/agents/orchestrator';

export async function enqueueRunJob(input: {
  orderId: string;
  projectId: string;
  requestedBy?: string;
}) {
  const supabase = getSupabaseServerClient();

  const { data: active } = await supabase
    .from('run_jobs')
    .select('id, status')
    .eq('order_id', input.orderId)
    .in('status', ['queued', 'running'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (active) return { job: active, alreadyActive: true };

  const { data, error } = await supabase
    .from('run_jobs')
    .insert({
      order_id: input.orderId,
      project_id: input.projectId,
      status: 'queued',
      requested_by: input.requestedBy || 'admin',
    })
    .select('id, status, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to enqueue run job');
  }

  return { job: data, alreadyActive: false };
}

export async function processNextRunJob() {
  const supabase = getSupabaseServerClient();

  const { data: nextJob } = await supabase
    .from('run_jobs')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!nextJob) {
    return { processed: false, reason: 'no_queued_jobs' as const };
  }

  const startedAt = new Date().toISOString();
  const { data: claimed } = await supabase
    .from('run_jobs')
    .update({
      status: 'running',
      started_at: startedAt,
      attempts: (nextJob.attempts || 0) + 1,
    })
    .eq('id', nextJob.id)
    .eq('status', 'queued')
    .select('*')
    .maybeSingle();

  if (!claimed) {
    return { processed: false, reason: 'claim_lost' as const };
  }

  await supabase
    .from('orders')
    .update({
      order_status: 'running',
      pipeline_started_at: startedAt,
      pipeline_metadata: {
        queued_job_id: claimed.id,
        queue_status: 'running',
      },
    })
    .eq('id', claimed.order_id);

  try {
    await orchestrateValidation(claimed.project_id);

    const completedAt = new Date().toISOString();
    await supabase
      .from('run_jobs')
      .update({
        status: 'completed',
        completed_at: completedAt,
        error_message: null,
      })
      .eq('id', claimed.id);

    await supabase
      .from('orders')
      .update({
        order_status: 'review',
        pipeline_completed_at: completedAt,
        pipeline_metadata: {
          queued_job_id: claimed.id,
          queue_status: 'completed',
        },
      })
      .eq('id', claimed.order_id);

    return { processed: true, jobId: claimed.id, status: 'completed' as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await supabase
      .from('run_jobs')
      .update({
        status: 'failed',
        error_message: message,
        completed_at: new Date().toISOString(),
      })
      .eq('id', claimed.id);

    await supabase
      .from('orders')
      .update({
        order_status: 'review',
        pipeline_metadata: {
          queued_job_id: claimed.id,
          queue_status: 'failed',
          last_error: message,
        },
      })
      .eq('id', claimed.order_id);

    return { processed: true, jobId: claimed.id, status: 'failed' as const, error: message };
  }
}
