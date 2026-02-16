import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';

/**
 * GET /api/discovery/[id]
 * Check discovery project status and get results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: project, error } = await supabase
      .from('discovery_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !project) {
      console.error('Error fetching discovery project:', error);
      return NextResponse.json(
        { error: 'Discovery project not found' },
        { status: 404 }
      );
    }

    // Return different response based on status
    const response: any = {
      id: project.id,
      institutionName: project.institution_name,
      geographicArea: project.geographic_area,
      currentPrograms: project.current_programs,
      status: project.status,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };

    // Include results if completed
    if (project.status === 'completed' || project.status === 'partial') {
      response.results = project.results;
      response.reportMarkdown = project.report_markdown;
      response.completedAt = project.completed_at;
    }

    // Include errors if failed
    if (project.status === 'error') {
      response.error = project.results?.error || 'Discovery scan failed';
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in discovery status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/discovery/[id]
 * Delete a discovery project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from('discovery_projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting discovery project:', error);
      return NextResponse.json(
        { error: 'Failed to delete discovery project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in discovery delete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/discovery/[id]
 * Update discovery project (e.g., retry failed scan)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Handle retry action
    if (action === 'retry') {
      const { error } = await supabase
        .from('discovery_projects')
        .update({
          status: 'pending',
          results: null,
          report_markdown: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error retrying discovery project:', error);
        return NextResponse.json(
          { error: 'Failed to retry discovery project' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Discovery project queued for retry',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in discovery update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
