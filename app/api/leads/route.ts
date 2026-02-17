import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, institution, state } = body;

    // Validate required fields
    if (!name || !email || !institution || !state) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Supabase integration — insert into `leads` table
    // const supabase = createClient();
    // const { data, error } = await supabase.from('leads').insert({
    //   name,
    //   email,
    //   institution,
    //   state,
    //   source: 'pell-readiness-check',
    //   created_at: new Date().toISOString(),
    // });
    // if (error) throw error;

    console.log('[Lead captured]', {
      name,
      email,
      institution,
      state,
      source: 'pell-readiness-check',
      timestamp: new Date().toISOString(),
    });

    // TODO: Send confirmation email via Resend/Loops
    // TODO: Notify hello@withwavelength.com of new lead

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully. Check your inbox!',
    });
  } catch (error) {
    console.error('[Lead capture error]', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
