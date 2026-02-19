import { NextRequest, NextResponse } from 'next/server';
import { runDriftScan } from '@/lib/stages/drift-monitor/orchestrator';
import type { DriftProgram } from '@/lib/stages/drift-monitor/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as DriftProgram;

    // Validate required fields
    if (!body.programName || !body.occupationTitle || !body.curriculumDescription || !body.institutionName) {
      return NextResponse.json(
        { error: 'Missing required fields: programName, occupationTitle, curriculumDescription, institutionName' },
        { status: 400 }
      );
    }

    console.log(`[API] Starting drift scan for ${body.programName}`);

    const { result, employerSkills, reportHtml } = await runDriftScan(body);

    return NextResponse.json({
      success: true,
      result,
      reportHtml,
    });

  } catch (error) {
    console.error('[API] Drift scan error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scan failed' },
      { status: 500 }
    );
  }
}
