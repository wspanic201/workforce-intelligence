/**
 * POST /api/subscribe-signal
 *
 * Subscribes an email address to "The Signal by Wavelength" newsletter
 * by adding them as a contact in the Resend audience.
 *
 * Body: { email: string, firstName?: string, institution?: string }
 *
 * TODO: Create the Resend audience for The Signal and set RESEND_AUDIENCE_ID_SIGNAL
 * in your environment before using this endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, institution } = body;

    // Validate
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID_SIGNAL;
    if (!audienceId) {
      console.error('[Subscribe Signal] RESEND_AUDIENCE_ID_SIGNAL not set');
      return NextResponse.json(
        { success: false, error: 'Newsletter subscription is not configured yet' },
        { status: 503 }
      );
    }

    // Add contact to Resend audience
    const contactData: {
      email: string;
      firstName?: string;
      lastName?: string;
      unsubscribed: boolean;
    } = {
      email: cleanEmail,
      unsubscribed: false,
    };

    if (firstName && typeof firstName === 'string') {
      contactData.firstName = firstName.trim();
    }

    // Store institution in lastName field as a workaround since Resend
    // doesn't have a custom fields API yet. Could also be handled via
    // metadata if Resend adds support.
    if (institution && typeof institution === 'string' && !contactData.firstName) {
      // Only set if no firstName provided, to avoid clobbering real name
      contactData.lastName = institution.trim();
    }

    const { data, error } = await resend.contacts.create({
      audienceId,
      ...contactData,
    });

    if (error) {
      // Resend returns a specific error for duplicate contacts
      if (error.message?.toLowerCase().includes('already exists')) {
        console.log(`[Subscribe Signal] Contact already exists: ${cleanEmail}`);
        return NextResponse.json({ success: true, alreadySubscribed: true });
      }
      console.error('[Subscribe Signal] Resend error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    console.log(`[Subscribe Signal] Subscribed: ${cleanEmail} (contact ID: ${data?.id})`);

    // Send confirmation email with welcome signals
    const displayName = firstName ? firstName.trim() : 'there';
    const institutionLine = institution ? `<p style="margin:0 0 4px 0;color:#6c757d;font-size:13px;">${institution.trim()}</p>` : '';

    const confirmationHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#1a1a2e;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
    <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#93c5fd;">FREE NEWSLETTER</p>
    <h1 style="margin:0;font-size:32px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">THE SIGNAL</h1>
    <p style="margin:4px 0 0 0;font-size:14px;color:rgba(255,255,255,0.5);font-weight:400;">by Wavelength</p>
  </td></tr>

  <!-- Welcome body -->
  <tr><td style="background:#ffffff;padding:36px 40px;">
    <p style="margin:0 0 20px 0;font-size:16px;color:#1a1a2e;font-weight:600;">Hey ${displayName} — you're in. 👋</p>
    ${institutionLine}
    <p style="margin:0 0 20px 0;font-size:14px;color:#495057;line-height:1.7;">
      Welcome to The Signal. Three times a week you'll get the labor market trends, workforce news, and industry spotlights that actually matter for CE and workforce development teams — no noise, no fluff.
    </p>
    <p style="margin:0 0 28px 0;font-size:14px;color:#495057;line-height:1.7;">
      Your first full edition lands <strong style="color:#1a1a2e;">Monday, Wednesday, or Friday</strong> — whichever comes first. Until then, here's what's moving right now:
    </p>

    <!-- Divider -->
    <div style="height:1px;background:#e9ecef;margin:0 0 28px 0;"></div>

    <!-- Signal 1 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
      <tr>
        <td style="padding-right:14px;vertical-align:top;width:36px;">
          <div style="width:32px;height:32px;background:#eff6ff;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">📊</div>
        </td>
        <td style="vertical-align:top;">
          <p style="margin:0 0 4px 0;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#3b82f6;">Labor Market Signal</p>
          <p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:#1a1a2e;line-height:1.4;">The credential gap is structural — and it's getting wider</p>
          <p style="margin:0;font-size:13px;color:#495057;line-height:1.6;">Lightcast's new "Fault Lines" report (dropped this week) puts it plainly: 66% of job postings require a credential, but only 31% of workers have one. They're calling this permanent — driven by aging demographics, declining immigration, and rising credential barriers. Healthcare and advanced manufacturing are hardest hit. For CE teams, this isn't a talking point — it's your mission statement.</p>
        </td>
      </tr>
    </table>

    <!-- Signal 2 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
      <tr>
        <td style="padding-right:14px;vertical-align:top;width:36px;">
          <div style="width:32px;height:32px;background:#f0fdf4;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">🏛️</div>
        </td>
        <td style="vertical-align:top;">
          <p style="margin:0 0 4px 0;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#16a34a;">Policy Signal</p>
          <p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:#1a1a2e;line-height:1.4;">Workforce Pell goes live July 1, 2026 — 132 days away</p>
          <p style="margin:0;font-size:13px;color:#495057;line-height:1.6;">The OBBBA is signed. Short-term programs between 150–599 clock hours now qualify for federal Pell Grants for the first time. Colleges that have qualifying programs mapped, enrolled, and trackable on July 1 capture the revenue. Colleges that don't — miss the window. CE teams are scrambling. This is the moment.</p>
        </td>
      </tr>
    </table>

    <!-- Signal 3 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
      <tr>
        <td style="padding-right:14px;vertical-align:top;width:36px;">
          <div style="width:32px;height:32px;background:#faf5ff;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">🏭</div>
        </td>
        <td style="vertical-align:top;">
          <p style="margin:0 0 4px 0;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#7c3aed;">Industry Spotlight</p>
          <p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:#1a1a2e;line-height:1.4;">Advanced manufacturing: the hiring boom hiding in plain sight</p>
          <p style="margin:0;font-size:13px;color:#495057;line-height:1.6;">Reshoring, EV component production, and agricultural tech expansion are driving a sustained manufacturing surge across the Midwest. Iowa, Kansas, and Indiana are leading the region. Programs in CNC machining, quality systems, and industrial maintenance are seeing 40%+ YoY increases in employer job postings — with limited CE programs in the pipeline to meet demand. First-mover advantage is real here.</p>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <div style="height:1px;background:#e9ecef;margin:0 0 28px 0;"></div>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:#f8f9fa;border-radius:10px;padding:20px 24px;text-align:center;">
        <p style="margin:0 0 12px 0;font-size:13px;color:#495057;">Curious what these signals mean for your specific region and program portfolio?</p>
        <a href="https://withwavelength.com" style="display:inline-block;background:#1a1a2e;color:#ffffff;font-size:13px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">Run a Free Wavelength Scan →</a>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f1f3f5;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
    <p style="margin:0 0 6px 0;font-size:12px;color:#6c757d;">The Signal by Wavelength — workforce intelligence for community colleges</p>
    <p style="margin:0;font-size:11px;color:#adb5bd;">
      You're receiving this because you subscribed at withwavelength.com/signal.<br>
      <a href="https://withwavelength.com" style="color:#6c757d;">withwavelength.com</a> · hello@signal.withwavelength.com
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    // Send confirmation email — must be awaited before returning the response.
    // Vercel serverless functions terminate immediately on response; fire-and-forget
    // promises are killed before they can complete.
    try {
      await resend.emails.send({
        from: 'The Signal by Wavelength <hello@signal.withwavelength.com>',
        to: cleanEmail,
        subject: "You're in — here's what's moving in workforce dev right now",
        html: confirmationHtml,
      });
      console.log(`[Subscribe Signal] Confirmation email sent to ${cleanEmail}`);
    } catch (emailErr) {
      // Log but don't fail the signup — contact is already in the audience
      console.error('[Subscribe Signal] Confirmation email failed:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Subscribe Signal] Unexpected error:', message);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
