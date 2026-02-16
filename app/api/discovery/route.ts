import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { orchestrateDiscovery } from '@/lib/agents/discovery/orchestrator';
import { generateDiscoveryReport } from '@/lib/reports/discovery-report';

/**
 * POST /api/discovery
 * Create a new discovery project and kick off the scan
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { institution_name, geographic_area, current_programs, user_id } = body;

    // Validation
    if (!institution_name || !geographic_area) {
      return NextResponse.json(
        { error: 'Missing required fields: institution_name and geographic_area' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Create discovery project record
    const { data: project, error: projectError } = await supabase
      .from('discovery_projects')
      .insert({
        user_id: user_id || null,
        institution_name,
        geographic_area,
        current_programs: current_programs || [],
        status: 'pending',
      })
      .select()
      .single();

    if (projectError || !project) {
      console.error('Error creating discovery project:', projectError);
      return NextResponse.json(
        { error: 'Failed to create discovery project' },
        { status: 500 }
      );
    }

    console.log(`[API] Created discovery project: ${project.id}`);

    // Kick off discovery scan asynchronously
    // In production, this should be a background job/queue
    runDiscoveryScan(project.id, {
      institutionName: institution_name,
      geographicArea: geographic_area,
      currentPrograms: current_programs || [],
    }).catch(error => {
      console.error(`[API] Discovery scan failed for project ${project.id}:`, error);
    });

    return NextResponse.json({
      projectId: project.id,
      status: 'pending',
      message: 'Discovery scan started. Poll /api/discovery/[id] for status.',
    });
  } catch (error) {
    console.error('Error in discovery API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Run discovery scan (async function)
 */
async function runDiscoveryScan(
  projectId: string,
  input: {
    institutionName: string;
    geographicArea: string;
    currentPrograms: string[];
  }
) {
  const supabase = getSupabaseServerClient();

  try {
    console.log(`[Discovery Scan] Starting scan for project ${projectId}`);

    // Run orchestrator
    const result = await orchestrateDiscovery({
      projectId,
      institutionName: input.institutionName,
      geographicArea: input.geographicArea,
      currentPrograms: input.currentPrograms,
    });

    // Generate markdown report
    const reportMarkdown = generateDiscoveryReport(result);

    // Save results to database
    await supabase
      .from('discovery_projects')
      .update({
        status: result.status === 'success' ? 'completed' : result.status,
        results: {
          regionalScan: result.regionalScan,
          gapAnalysis: result.gapAnalysis,
          programRecommendations: result.programRecommendations,
          executiveSummary: result.executiveSummary,
          errors: result.errors,
        },
        report_markdown: reportMarkdown,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    console.log(`[Discovery Scan] Completed for project ${projectId}: ${result.status}`);
  } catch (error) {
    console.error(`[Discovery Scan] Fatal error for project ${projectId}:`, error);

    await supabase
      .from('discovery_projects')
      .update({
        status: 'error',
        results: {
          error: error instanceof Error ? error.message : String(error),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);
  }
}

/**
 * GET /api/discovery
 * List all discovery projects for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    const supabase = getSupabaseServerClient();

    let query = supabase
      .from('discovery_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error('Error fetching discovery projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch discovery projects' },
        { status: 500 }
      );
    }

    return NextResponse.json(projects || []);
  } catch (error) {
    console.error('Error in discovery list API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
