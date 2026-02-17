import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, institution, state } = body;

    if (!name || !email || !institution || !state) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('[Lead captured]', { name, email, institution, state, timestamp: new Date().toISOString() });

    // Notify Matt of new lead
    try {
      await resend.emails.send({
        from: 'Wavelength <hello@signal.withwavelength.com>',
        to: 'mttmrphy@icloud.com',
        subject: `🎯 New Pell Check Lead: ${institution} (${state})`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 500px;">
            <h2 style="color: #7c3aed;">New Pell Readiness Check Request</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666; width: 100px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0; font-weight: 600;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Institution</td><td style="padding: 8px 0; font-weight: 600;">${institution}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">State</td><td style="padding: 8px 0; font-weight: 600;">${state}</td></tr>
            </table>
            <p style="color: #999; font-size: 13px; margin-top: 20px;">Submitted at ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('[Lead notification email failed]', emailErr);
      // Don't fail the request if notification fails
    }

    // Send confirmation to the lead
    try {
      await resend.emails.send({
        from: 'Wavelength <hello@signal.withwavelength.com>',
        to: email,
        subject: `Your Pell Readiness Check is on the way`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7c3aed, #3b82f6, #14b8a6); padding: 2px; border-radius: 12px;">
              <div style="background: #050510; border-radius: 10px; padding: 32px;">
                <h1 style="color: #fff; font-size: 24px; margin: 0 0 8px 0;">Thanks, ${name}!</h1>
                <p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                  We've received your Pell Readiness Check request for <strong style="color: #fff;">${institution}</strong>.
                </p>
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">What happens next</p>
                  <p style="color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6; margin: 0;">
                    We'll scan your institution's program catalog against Workforce Pell eligibility criteria — state requirements, federal requirements, clock-hour compliance, and gap opportunities. Your report will be delivered to this email within <strong style="color: #fff;">48 hours</strong>.
                  </p>
                </div>
                <p style="color: rgba(255,255,255,0.5); font-size: 13px; line-height: 1.6; margin: 0;">
                  Questions? Reply to this email — it goes straight to our team.
                </p>
              </div>
            </div>
            <p style="color: #666; font-size: 11px; text-align: center; margin-top: 16px;">
              Wavelength · Market intelligence for community college programs
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('[Lead confirmation email failed]', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Check your inbox — confirmation on the way.',
    });
  } catch (error) {
    console.error('[Lead capture error]', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
