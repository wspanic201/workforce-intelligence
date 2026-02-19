'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';

const SUBJECTS = [
  'Program Opportunity Scan',
  'Program Validation',
  'Pell Readiness Check',
  'Program Gap Audit',
  'Grant Intelligence Scan',
  'Curriculum Drift Analysis',
  'General Question',
  'Partnership Inquiry',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', institution: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(data.message || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  const field = (id: keyof typeof form, label: string, type = 'text', required = false) => (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-theme-secondary uppercase tracking-wider mb-2">
        {label}{required && <span className="text-purple-400 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={form[id]}
        onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
        className="w-full px-4 py-3 rounded-xl bg-theme-surface border border-theme-base text-theme-primary placeholder:text-theme-muted text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors"
        placeholder={id === 'email' ? 'you@institution.edu' : id === 'institution' ? 'Your community college' : ''}
      />
    </div>
  );

  return (
    <div className="overflow-x-hidden bg-theme-page">

      {/* Hero */}
      <section className="relative min-h-[45vh] flex items-center justify-center pt-36 lg:pt-40 pb-16 overflow-hidden">
        <Stars count={60} />
        <Aurora className="opacity-50" />
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
            <span className="overline">Contact</span>
            <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
          </div>
          <h1 className="font-heading font-bold text-theme-primary leading-[1.05]" style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}>
            Let&apos;s talk about your <span className="text-gradient-cosmic">programs.</span>
          </h1>
          <p className="mt-4 text-theme-secondary text-lg max-w-xl mx-auto leading-relaxed">
            Questions about a report, want to discuss your institution&apos;s needs, or just exploring? We&apos;ll get back to you within 1–2 business days.
          </p>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_340px] gap-12 items-start">

            {/* Form */}
            <div>
              {status === 'success' ? (
                <div className="card-cosmic rounded-2xl p-10 text-center">
                  <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                  <h2 className="font-heading font-bold text-theme-primary text-2xl mb-3">Message sent.</h2>
                  <p className="text-theme-secondary mb-6">We&apos;ll be in touch within 1–2 business days. Check your inbox for a confirmation.</p>
                  <Link href="/">
                    <button className="btn-cosmic btn-cosmic-ghost text-sm">Back to Home</button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card-cosmic rounded-2xl p-8 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    {field('name', 'Full Name', 'text', true)}
                    {field('email', 'Work Email', 'email', true)}
                  </div>

                  {field('institution', 'Institution', 'text', false)}

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-xs font-semibold text-theme-secondary uppercase tracking-wider mb-2">
                      What can we help with?
                    </label>
                    <select
                      id="subject"
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-theme-surface border border-theme-base text-theme-primary text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors"
                    >
                      <option value="">Select a topic...</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-xs font-semibold text-theme-secondary uppercase tracking-wider mb-2">
                      Message <span className="text-purple-400">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us about your institution, what you're exploring, or any questions you have..."
                      className="w-full px-4 py-3 rounded-xl bg-theme-surface border border-theme-base text-theme-primary placeholder:text-theme-muted text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-red-400 text-sm">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-cosmic btn-cosmic-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                    {status !== 'loading' && <ArrowRight className="ml-2 h-4 w-4" />}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5 lg:pt-2">
              <div className="card-cosmic rounded-2xl p-6">
                <h3 className="font-heading font-semibold text-theme-primary mb-1">Response time</h3>
                <p className="text-theme-secondary text-sm">We reply to all inquiries within 1–2 business days.</p>
              </div>

              <div className="card-cosmic rounded-2xl p-6">
                <h3 className="font-heading font-semibold text-theme-primary mb-3">Or start for free</h3>
                <p className="text-theme-secondary text-sm mb-4">Not ready to talk yet? Run a free Pell Readiness Check — no commitment, takes 5 minutes.</p>
                <Link href="/pell">
                  <button className="btn-cosmic btn-cosmic-primary text-sm w-full">
                    Free Pell Check
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>

              <div className="card-cosmic rounded-2xl p-6">
                <h3 className="font-heading font-semibold text-theme-primary mb-3">Explore services</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Program Opportunity Scan', href: '/discover', price: '$1,500' },
                    { label: 'Program Validation', href: '/validate', price: '$3,500' },
                    { label: 'Grant Intelligence Scan', href: '/grants', price: '$495' },
                    { label: 'Curriculum Drift Analysis', href: '/drift', price: '$495/yr' },
                  ].map((s) => (
                    <Link key={s.href} href={s.href} className="flex items-center justify-between text-sm text-theme-secondary hover:text-theme-primary transition-colors group">
                      <span className="group-hover:text-gradient-cosmic transition-colors">{s.label}</span>
                      <span className="text-xs text-theme-muted font-mono">{s.price}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
