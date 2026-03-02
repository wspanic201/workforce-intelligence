import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRODUCTS } from '@/lib/stripe';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, title, institution, state, serviceRegion, learningGoal, product } = body;

    // Validate required fields
    if (!name || !email || !title || !institution || !state || !serviceRegion) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Validate product
    const productConfig = PRODUCTS[product];
    if (!productConfig) {
      return NextResponse.json(
        { error: 'Invalid product.' },
        { status: 400 }
      );
    }

    const priceId = process.env[productConfig.priceEnvKey];
    if (!priceId || priceId === 'price_REPLACE_ME') {
      return NextResponse.json(
        { error: 'Checkout is not configured yet. Please contact us.' },
        { status: 503 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Create pending order in Supabase
    const { data: order, error: dbError } = await supabase
      .from('orders')
      .insert({
        contact_name: name,
        contact_email: email,
        contact_title: title,
        institution_name: institution,
        institution_data: { state, serviceRegion, learningGoal: learningGoal || null },
        service_tier: productConfig.serviceTier,
        amount_cents: productConfig.amountCents,
        payment_status: 'pending',
        order_status: 'pending_payment',
        admin_created: false,
      })
      .select('id')
      .single();

    if (dbError || !order) {
      console.error('[Checkout] DB insert error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create order. Please try again.' },
        { status: 500 }
      );
    }

    // Determine base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://withwavelength.com';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      customer_email: email,
      metadata: {
        order_id: order.id,
        product: product,
      },
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/order/${product}`,
    });

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', order.id);

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('[Checkout] Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
