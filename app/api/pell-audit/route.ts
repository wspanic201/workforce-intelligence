/**
 * POST /api/pell-audit
 * 
 * Triggers a Workforce Pell Readiness Audit for an institution.
 * This is the API endpoint that will power the lead magnet landing page.
 * 
 * Request body:
 *   {
 *     collegeName: string,
 *     state: string,
 *     city?: string,
 *     collegeUrl?: string,
 *     email?: string           // For lead capture
 *   }
 * 
 * Response:
 *   - 200: Audit complete, returns report + structured data
 *   - 400: Missing required fields
 *   - 500: Pipeline error
 * 
 * Note: This runs synchronously (~4-6 min). For production,
 * consider a job queue with webhook/polling for status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runPellAudit } from '@/lib/stages/pell-audit/orchestrator';

export const maxDuration = 300; // 5 min timeout (Vercel Hobby max)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collegeName, state, city, collegeUrl, email } = body;

    if (!collegeName || !state) {
      return NextResponse.json(
        { error: 'collegeName and state are required' },
        { status: 400 }
      );
    }

    console.log(`[Pell Audit API] Starting audit for ${collegeName} (${state})`);
    if (email) {
      console.log(`[Pell Audit API] Lead email: ${email}`);
      // TODO: Save lead to database / email list
    }

    const result = await runPellAudit({
      collegeName,
      state,
      city,
      collegeUrl,
    });

    if (result.status === 'error') {
      return NextResponse.json(
        { 
          error: 'Audit failed', 
          details: result.metadata.errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: result.status,
      report: {
        title: result.report?.title,
        markdown: result.report?.fullMarkdown,
        metadata: result.report?.metadata,
      },
      summary: {
        totalPrograms: result.report?.metadata.totalPrograms,
        pellReadyCount: result.report?.metadata.pellReadyCount,
        gapsIdentified: result.report?.metadata.gapsIdentified,
        durationSeconds: result.metadata.durationSeconds,
      },
    });
  } catch (error) {
    console.error('[Pell Audit API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
