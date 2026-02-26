import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { processNextRunJob } from '@/lib/pipeline/run-jobs';

export const maxDuration = 300;

/**
 * POST /api/admin/run-jobs/process
 * Processes one queued run job.
 */
export async function POST(_req: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await processNextRunJob();
  return NextResponse.json({ ok: true, result });
}
