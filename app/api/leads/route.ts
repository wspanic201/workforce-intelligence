import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, institution, state, source } = body;

    const isLeadMagnet = source === 'lead-magnet-checklist';
    const isFooterNewsletter = source === 'footer-newsletter';

    // Footer newsletter only needs email
    if (isFooterNewsletter) {
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email is required' },
          { status: 400 }
        );
      }
    } else if (isLeadMagnet) {
      // Lead magnet only needs email + institution
      if (!email || !institution) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        );
      }
    } else {
      // Pell form requires all fields
      if (!name || !email || !institution || !state) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        );
      }
    }

    console.log('[Lead captured]', { name, email, institution, state, source, timestamp: new Date().toISOString() });

    if (isFooterNewsletter) {
      // ── Footer newsletter: Simple email subscription ──

      // Notify Matt
      try {
        await resend.emails.send({
          from: 'Wavelength <hello@signal.withwavelength.com>',
          to: 'hello@withwavelength.com',
          subject: `📧 Newsletter Signup: ${email}`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 500px;">
              <h2 style="color: #14b8a6;">New Newsletter Subscriber</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666; width: 120px;">Email</td><td style="padding: 8px 0; font-weight: 600;"><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Source</td><td style="padding: 8px 0; font-weight: 600;">Footer Newsletter Form</td></tr>
              </table>
              <p style="color: #999; font-size: 13px; margin-top: 20px;">Submitted at ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('[Footer newsletter notification failed]', emailErr);
      }

      // Send welcome email
      try {
        await resend.emails.send({
          from: 'Wavelength <hello@signal.withwavelength.com>',
          to: email,
          subject: `Welcome to Wavelength updates`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #7c3aed, #3b82f6, #14b8a6); padding: 2px; border-radius: 12px;">
                <div style="background: #050510; border-radius: 10px; padding: 32px;">
                  <p style="color: #14b8a6; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Wavelength</p>
                  <h1 style="color: #fff; font-size: 24px; margin: 0 0 8px 0;">Thanks for subscribing.</h1>
                  <p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                    You're now on the list for Wavelength updates — we'll keep you posted on new resources, services, and workforce intelligence insights.
                  </p>
                  <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                    <p style="color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">In the meantime</p>
                    <p style="color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                      Curious what program opportunities exist in your region? Start with a free <strong style="color: #fff;">Pell Readiness Check</strong> — takes 5 minutes, no commitment.
                    </p>
                    <a href="https://withwavelength.com/pell" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">Get Your Free Pell Check →</a>
                  </div>
                  <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 24px; line-height: 1.6;">
                    Questions? Reply to this email — it goes straight to our team.<br/>
                    Wavelength · <a href="https://withwavelength.com" style="color: #14b8a6;">withwavelength.com</a>
                  </p>
                </div>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('[Footer newsletter welcome email failed]', emailErr);
      }

      return NextResponse.json({ success: true, message: 'Subscribed! Check your inbox.' });
    }

    if (isLeadMagnet) {
      // ── Lead magnet: "5 Signs Your Program Portfolio Has Gaps" ──

      // Notify Matt
      try {
        await resend.emails.send({
          from: 'Wavelength <hello@signal.withwavelength.com>',
          to: 'hello@withwavelength.com',
          subject: `📋 Checklist Download: ${institution}`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 500px;">
              <h2 style="color: #14b8a6;">New Checklist Lead</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666; width: 120px;">Email</td><td style="padding: 8px 0; font-weight: 600;"><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Institution</td><td style="padding: 8px 0; font-weight: 600;">${institution}</td></tr>
              </table>
              <p style="color: #999; font-size: 13px; margin-top: 20px;">Submitted at ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('[Lead magnet notification failed]', emailErr);
      }

      // Send checklist to lead
      try {
        await resend.emails.send({
          from: 'Wavelength <hello@signal.withwavelength.com>',
          to: email,
          subject: `Your checklist: 5 Signs Your Program Portfolio Has Gaps`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff;">
              <div style="background: linear-gradient(135deg, #7c3aed, #3b82f6, #14b8a6); padding: 2px; border-radius: 12px;">
                <div style="background: #050510; border-radius: 10px; padding: 36px 32px;">
                  <p style="color: #14b8a6; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Wavelength</p>
                  <h1 style="color: #fff; font-size: 22px; margin: 0 0 8px 0; line-height: 1.3;">5 Signs Your Program Portfolio Has Gaps</h1>
                  <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0 0 28px 0;">A quick self-assessment for ${institution}</p>

                  ${[
                    {
                      num: '1',
                      sign: 'Your region has a documented labor shortage in a field you don\'t offer',
                      detail: 'If local employers are posting jobs they can\'t fill and your catalog doesn\'t include that training, you\'re leaving enrollment — and community impact — on the table. Check your regional economic development reports and local employer job posting volumes.',
                    },
                    {
                      num: '2',
                      sign: 'You haven\'t done a program portfolio review in the last 18 months',
                      detail: 'Employer skill requirements shift every 12–18 months in fast-moving fields like healthcare, IT, and manufacturing. A portfolio that was well-aligned two years ago may have significant drift today — and you won\'t know until placement rates tell you.',
                    },
                    {
                      num: '3',
                      sign: 'A competitor college nearby recently launched a program you considered',
                      detail: 'When another institution moves first on a workforce need, they capture the employer relationships, the advisory board seats, and the regional reputation. The window to be the primary provider in your region is finite.',
                    },
                    {
                      num: '4',
                      sign: 'Your Workforce Pell program list is shorter than your short-term catalog',
                      detail: 'Starting July 1, 2026, programs between 150–599 clock hours qualify for federal Pell funding — but only if they meet eligibility criteria. If your short-term programs haven\'t been audited against those requirements, you likely have both qualifying programs you\'re not leveraging and gaps you could fill.',
                    },
                    {
                      num: '5',
                      sign: 'You\'re making new program decisions based on advisory board feedback alone',
                      detail: 'Advisory boards are valuable — but they reflect the employers in the room, not the full regional market. A board of 8 local employers can\'t see the same demand signals as 50+ live data sources cross-referenced against your competitive landscape.',
                    },
                  ].map(item => `
                    <div style="margin-bottom: 20px; padding: 18px 20px; background: rgba(255,255,255,0.04); border-left: 3px solid #7c3aed; border-radius: 0 8px 8px 0;">
                      <p style="color: #a78bfa; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0;">Sign #${item.num}</p>
                      <p style="color: #fff; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">${item.sign}</p>
                      <p style="color: rgba(255,255,255,0.6); font-size: 13px; line-height: 1.6; margin: 0;">${item.detail}</p>
                    </div>
                  `).join('')}

                  <div style="margin-top: 28px; padding: 20px; background: rgba(20,184,166,0.08); border: 1px solid rgba(20,184,166,0.2); border-radius: 8px;">
                    <p style="color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">What to do next</p>
                    <p style="color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                      If 2 or more of these signs sound familiar, your portfolio likely has gaps worth understanding. The fastest way to see them clearly: a <strong style="color: #fff;">Program Finder</strong> — 7–10 validated program opportunities for your region, scored and ranked.
                    </p>
                    <a href="https://withwavelength.com/discover" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">See What a Program Finder Includes →</a>
                  </div>

                  <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 24px; line-height: 1.6;">
                    Questions? Reply to this email — it goes straight to our team.<br/>
                    Wavelength · <a href="https://withwavelength.com" style="color: #14b8a6;">withwavelength.com</a>
                  </p>
                </div>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('[Lead magnet email failed]', emailErr);
      }

      return NextResponse.json({ success: true, message: 'Check your inbox — checklist on the way.' });
    }

    // ── Standard Pell form flow ──

    // Notify Matt of new lead
    try {
      await resend.emails.send({
        from: 'Wavelength <hello@signal.withwavelength.com>',
        to: 'hello@withwavelength.com',
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
