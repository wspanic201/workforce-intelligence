import { NextResponse } from 'next/server';
import { stripe, PRODUCTS } from '@/lib/stripe';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      const productSlug = session.metadata?.product;

      if (!orderId) {
        console.error('[Webhook] No order_id in session metadata');
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const supabase = getSupabaseServerClient();

      // Fetch the order
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) {
        console.error('[Webhook] Order not found:', orderId, fetchError);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Update order status
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          order_status: 'queued',
          stripe_payment_intent_id: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : null,
        })
        .eq('id', orderId);

      // Resolve product details
      const productConfig = productSlug ? PRODUCTS[productSlug] : null;
      const productName = productConfig?.name || 'Wavelength Report';
      const amountDollars = (order.amount_cents / 100).toLocaleString();
      const orderRef = orderId.slice(0, 8);

      // Send confirmation email to client
      await resend.emails.send({
        from: 'Wavelength <hello@signal.withwavelength.com>',
        to: order.contact_email,
        subject: `Your ${productName} order is confirmed — Wavelength`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 540px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7c3aed, #3b82f6, #14b8a6); padding: 2px; border-radius: 12px;">
              <div style="background: #050510; border-radius: 10px; padding: 32px;">
                <p style="color: #14b8a6; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Wavelength</p>
                <h1 style="color: #fff; font-size: 22px; margin: 0 0 12px 0;">Your order is confirmed.</h1>
                <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                  We received your order for <strong style="color: #fff;">${productName}</strong>.
                </p>
                <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                  Your report will be delivered to this email within <strong style="color: #fff;">5\u20137 business days</strong>.
                </p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr>
                    <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px;">Order reference</td>
                    <td style="padding: 8px 0; color: #fff; font-size: 13px; font-family: monospace; text-align: right;">${orderRef}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px;">Amount</td>
                    <td style="padding: 8px 0; color: #fff; font-size: 13px; text-align: right;">$${amountDollars}</td>
                  </tr>
                </table>
                <p style="color: rgba(255,255,255,0.5); font-size: 13px; line-height: 1.6; margin: 20px 0 0 0;">
                  Want to see what to expect? Check out our <a href="https://withwavelength.com/samples" style="color: #a78bfa;">sample reports</a>.
                </p>
                <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 24px 0 0 0;">\u2014 The Wavelength Team</p>
              </div>
            </div>
          </div>
        `,
      });

      // Send Telegram notification to Matt
      const serviceRegion = order.institution_data?.serviceRegion || 'N/A';
      try {
        await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: '8562817832',
              text: `\uD83D\uDCB3 New Wavelength order!\n\n*${productName}* \u2014 $${amountDollars}\n${order.contact_name} @ ${order.institution_name}\n${order.contact_email}\nRegion: ${serviceRegion}\n\nOrder ID: \`${orderId}\`\nStatus: queued \u2014 ready to run pipeline`,
              parse_mode: 'Markdown',
            }),
          }
        );
      } catch (telegramError) {
        console.error('[Webhook] Telegram notification failed:', telegramError);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed.' },
      { status: 400 }
    );
  }
}
