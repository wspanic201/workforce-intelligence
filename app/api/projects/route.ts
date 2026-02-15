import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    const { data: projects, error } = await supabase
      .from('validation_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json(projects || []);
  } catch (error) {
    console.error('Error in projects API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
