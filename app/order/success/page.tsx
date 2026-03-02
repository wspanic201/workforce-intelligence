import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { PRODUCTS } from '@/lib/stripe';

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  let order: {
    id: string;
    contact_email: string;
    service_tier: string;
  } | null = null;

  if (session_id) {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from('orders')
      .select('id, contact_email, service_tier')
      .eq('stripe_checkout_session_id', session_id)
      .single();
    order = data;
  }

  // Resolve product name from service tier
  const productEntry = order
    ? Object.values(PRODUCTS).find((p) => p.serviceTier === order!.service_tier)
    : null;
  const productName = productEntry?.name || 'Wavelength Report';
  const orderRef = order?.id?.slice(0, 8);

  return (
    <div className="overflow-x-hidden bg-theme-page">
      <section className="relative min-h-[80vh] flex items-center justify-center pt-36 lg:pt-40 pb-16 overflow-hidden">
        <Stars count={60} />
        <Aurora className="opacity-50" />
        <div className="relative z-10 max-w-[600px] mx-auto px-6">
          <div className="card-cosmic rounded-2xl p-10 text-center">
            <CheckCircle2 className="w-16 h-16 text-teal-400 mx-auto mb-6" />

            {order ? (
              <>
                <h1 className="font-heading font-bold text-theme-primary text-3xl mb-4">
                  You&apos;re confirmed.
                </h1>
                <p className="text-theme-secondary text-lg leading-relaxed mb-2">
                  We&apos;ll deliver your <strong className="text-theme-primary">{productName}</strong> report
                  to <strong className="text-theme-primary">{order.contact_email}</strong> within 5–7 business days.
                </p>
                <p className="text-theme-muted text-sm mb-8">
                  Order reference: <span className="font-mono">{orderRef}</span>
                </p>
              </>
            ) : (
              <>
                <h1 className="font-heading font-bold text-theme-primary text-3xl mb-4">
                  Thank you.
                </h1>
                <p className="text-theme-secondary text-lg leading-relaxed mb-8">
                  We&apos;ll be in touch with your report soon.
                </p>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <button className="btn-cosmic btn-cosmic-ghost text-sm">Back to Home</button>
              </Link>
              <Link href="/samples">
                <button className="btn-cosmic btn-cosmic-primary text-sm">See Sample Reports</button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
