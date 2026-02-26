import { NextRequest, NextResponse, after } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { orchestrateValidation } from '@/lib/agents/orchestrator';

export const maxDuration = 800;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_name, client_email, program_name, program_type, target_audience, constraints } =
      body;

    if (!client_name || !client_email || !program_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Create validation project
    const { data: project, error } = await supabase
      .from('validation_projects')
      .insert({
        client_name,
        client_email,
        program_name,
        program_type,
        target_audience,
        constraints,
        status: 'intake',
      })
      .select()
      .single();

    if (error || !project) {
      console.error('Error creating project:', error);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    // Start validation after response using Next.js after().
    after(async () => {
      try {
        await orchestrateValidation(project.id);
      } catch (error) {
        console.error(`[API] Orchestration failed for project ${project.id}:`, error);
      }
    });

    return NextResponse.json({ projectId: project.id }, { status: 201 });
  } catch (error) {
    console.error('Error in create project API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
