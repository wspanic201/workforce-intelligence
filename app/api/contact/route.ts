import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, institution, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: 'Name, email, and message are required.' }, { status: 400 });
    }

    // Notify Matt
    await resend.emails.send({
      from: 'Wavelength <hello@signal.withwavelength.com>',
      to: 'mttmrphy@icloud.com',
      subject: `📬 Wavelength Contact: ${subject || 'General Inquiry'} — ${name}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 520px;">
          <h2 style="color: #7c3aed; margin-bottom: 4px;">New Contact Form Submission</h2>
          <p style="color: #999; font-size: 13px; margin-top: 0;">withwavelength.com/contact</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 7px 0; color: #666; width: 110px; vertical-align: top;">Name</td><td style="padding: 7px 0; font-weight: 600;">${name}</td></tr>
            <tr><td style="padding: 7px 0; color: #666; vertical-align: top;">Email</td><td style="padding: 7px 0; font-weight: 600;"><a href="mailto:${email}">${email}</a></td></tr>
            ${institution ? `<tr><td style="padding: 7px 0; color: #666; vertical-align: top;">Institution</td><td style="padding: 7px 0; font-weight: 600;">${institution}</td></tr>` : ''}
            ${subject ? `<tr><td style="padding: 7px 0; color: #666; vertical-align: top;">Subject</td><td style="padding: 7px 0; font-weight: 600;">${subject}</td></tr>` : ''}
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f9f9fb; border-left: 3px solid #7c3aed; border-radius: 0 8px 8px 0;">
            <p style="color: #444; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 16px;">Submitted ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT</p>
        </div>
      `,
    });

    // Auto-reply to sender
    await resend.emails.send({
      from: 'Wavelength <hello@signal.withwavelength.com>',
      to: email,
      subject: `We got your message, ${name.split(' ')[0]}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 540px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #7c3aed, #3b82f6, #14b8a6); padding: 2px; border-radius: 12px;">
            <div style="background: #050510; border-radius: 10px; padding: 32px;">
              <p style="color: #14b8a6; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Wavelength</p>
              <h1 style="color: #fff; font-size: 22px; margin: 0 0 12px 0;">Thanks for reaching out.</h1>
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                We've received your message and will get back to you within <strong style="color: #fff;">1–2 business days</strong>.
              </p>
              <p style="color: rgba(255,255,255,0.5); font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">
                In the meantime, you can explore our services at <a href="https://withwavelength.com/services" style="color: #a78bfa;">withwavelength.com/services</a> or run a free Pell Readiness Check at <a href="https://withwavelength.com/pell" style="color: #14b8a6;">withwavelength.com/pell</a>.
              </p>
              <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">— The Wavelength Team</p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Message sent. We\'ll be in touch within 1–2 business days.' });
  } catch (error) {
    console.error('[Contact form error]', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
