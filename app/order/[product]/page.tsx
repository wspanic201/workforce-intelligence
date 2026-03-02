'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { InstitutionTypeahead } from '@/components/ui/InstitutionTypeahead';
import { trackEvent } from '@/lib/analytics';

const PRODUCTS: Record<string, { name: string; price: string; amountDisplay: string }> = {
  'program-finder': { name: 'Program Finder', price: '$1,500', amountDisplay: '$1,500' },
  'feasibility-study': { name: 'Feasibility Study', price: '$3,000', amountDisplay: '$3,000' },
};

const JOB_TITLES = [
  'Dean / Director',
  'Program Developer',
  'VP Academic Affairs',
  'Faculty',
  'Other',
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

export default function OrderIntakePage() {
  const params = useParams<{ product: string }>();
  const product = PRODUCTS[params.product];
  if (!product) notFound();

  const [form, setForm] = useState({
    name: '',
    email: '',
    title: '',
    institution: '',
    state: '',
    serviceRegion: '',
    learningGoal: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, product: params.product }),
      });
      const data = await res.json();

      if (!res.ok || !data.checkoutUrl) {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        return;
      }

      trackEvent(
        params.product === 'program-finder' ? 'Order Program Finder' : 'Order Feasibility Study',
        { source: 'intake-form' }
      );

      window.location.href = data.checkoutUrl;
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-theme-surface border border-theme-base text-theme-primary placeholder:text-theme-muted text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors';
  const labelClass =
    'block text-xs font-semibold text-theme-secondary uppercase tracking-wider mb-2';

  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* Hero */}
      <section className="relative min-h-[35vh] flex items-center justify-center pt-36 lg:pt-40 pb-12 overflow-hidden">
        <Stars count={60} />
        <Aurora className="opacity-50" />
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
            <span className="overline">Order</span>
            <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
          </div>
          <h1
            className="font-heading font-bold text-theme-primary leading-[1.05]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}
          >
            {product.name} —{' '}
            <span className="text-gradient-cosmic">{product.price}</span>
          </h1>
          <p className="mt-4 text-theme-secondary text-lg max-w-xl mx-auto leading-relaxed">
            Tell us about your institution and region so we can tailor the analysis. You&apos;ll complete payment on the next screen.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="relative py-12 md:py-16">
        <div className="max-w-[640px] mx-auto px-6">
          <form onSubmit={handleSubmit} className="card-cosmic rounded-2xl p-8 space-y-5">
            {/* Name + Email */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full Name <span className="text-purple-400 ml-0.5">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>
                  Work Email <span className="text-purple-400 ml-0.5">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                  placeholder="you@institution.edu"
                />
              </div>
            </div>

            {/* Job Title */}
            <div>
              <label htmlFor="title" className={labelClass}>
                Job Title <span className="text-purple-400 ml-0.5">*</span>
              </label>
              <select
                id="title"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select your role...</option>
                {JOB_TITLES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Institution */}
            <div>
              <label htmlFor="institution" className={labelClass}>
                Institution Name <span className="text-purple-400 ml-0.5">*</span>
              </label>
              <InstitutionTypeahead
                value={form.institution}
                onChange={(value) => setForm((f) => ({ ...f, institution: value }))}
                placeholder="Your community college"
                required
              />
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className={labelClass}>
                State <span className="text-purple-400 ml-0.5">*</span>
              </label>
              <select
                id="state"
                required
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select state...</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Service Region */}
            <div>
              <label htmlFor="serviceRegion" className={labelClass}>
                Service Region Description <span className="text-purple-400 ml-0.5">*</span>
              </label>
              <input
                id="serviceRegion"
                type="text"
                required
                value={form.serviceRegion}
                onChange={(e) => setForm((f) => ({ ...f, serviceRegion: e.target.value }))}
                className={inputClass}
                placeholder="e.g. Iowa City metro + surrounding counties"
              />
            </div>

            {/* Learning Goal */}
            <div>
              <label htmlFor="learningGoal" className={labelClass}>
                What are you hoping to learn? <span className="text-theme-muted ml-0.5">(optional)</span>
              </label>
              <textarea
                id="learningGoal"
                rows={3}
                value={form.learningGoal}
                onChange={(e) => setForm((f) => ({ ...f, learningGoal: e.target.value }))}
                className={`${inputClass} resize-none`}
                placeholder="Any specific programs, industries, or questions you want us to focus on..."
              />
            </div>

            {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-cosmic btn-cosmic-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing checkout...
                </>
              ) : (
                <>
                  Continue to Payment — {product.amountDisplay}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
