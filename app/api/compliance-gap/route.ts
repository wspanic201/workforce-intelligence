/**
 * POST /api/compliance-gap
 *
 * Triggers a State-Mandated Program Gap Analysis for a community college.
 * Scans state regulatory mandates, cross-references current offerings,
 * and returns a professional gap report with revenue sizing.
 *
 * Request body:
 *   {
 *     collegeName: string,   // required
 *     state: string,         // required
 *     city?: string,         // optional — helps scope regional demand
 *     siteUrl?: string,      // optional — auto-detected if not provided
 *   }
 *
 * Response:
 *   200: { status, report, gaps, stats, metadata }
 *   400: { error: "missing required fields" }
 *   500: { error: "pipeline error", details: string[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { runComplianceGap } from '@/lib/stages/compliance-gap/orchestrator';

export const maxDuration = 300; // 5-min timeout — Vercel Hobby plan max

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collegeName, state, city, siteUrl } = body;

    if (!collegeName || !state) {
      return NextResponse.json(
        { error: 'collegeName and state are required' },
        { status: 400 },
      );
    }

    console.log(
      `[State-Mandated Program Gap API] Starting for ${collegeName} (${state}) at ${new Date().toISOString()}`,
    );

    const result = await runComplianceGap({
      collegeName,
      state,
      city: city || undefined,
      siteUrl: siteUrl || undefined,
    });

    if (!result.report && result.metadata.errors.length > 0) {
      return NextResponse.json(
        {
          error: 'State-Mandated Program Gap Analysis failed',
          details: result.metadata.errors,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: result.metadata.errors.length === 0 ? 'success' : 'partial',
      report: result.report,
      gaps: result.gaps,
      stats: result.stats,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('[State-Mandated Program Gap API] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
