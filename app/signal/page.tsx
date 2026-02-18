'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Radio, Mail, Zap } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { Waveform } from '@/components/cosmic/Waveform';

const SAMPLE_ITEMS = [
  {
    label: '📊 Labor Market Signal',
    desc: 'One key data point or trend shaping workforce demand this week — sourced from BLS, Lightcast, and real employer data.',
  },
  {
    label: '📰 Workforce News',
    desc: 'Two or three headlines your team actually needs to know, with a sentence of context on why it matters for CE programs.',
  },
  {
    label: '🏭 Industry Spotlight',
    desc: 'One sector in focus — what\'s growing, what\'s contracting, and what that means for your program portfolio.',
  },
];

export default function SignalPage() {
  const [formData, setFormData] = useState({ email: '', firstName: '', institution: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/subscribe-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
      } else {
        setErrorMsg(data.error || 'Something went wrong. Try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error — please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] overflow-x-hidden">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-32 pb-16 overflow-hidden">
        <Stars count={isMobile ? 60 : 200} />
        <Aurora />
        {!isMobile && <Waveform className="opacity-40" />}

        <div className="relative z-10 max-w-[680px] mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Radio className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-blue-300 text-xs font-semibold uppercase tracking-wider">Free Newsletter</span>
          </div>

          <h1
            className="font-heading font-bold text-white leading-[1.05] mb-4"
            style={{ fontSize: 'clamp(2.4rem, 5vw + 0.5rem, 3.8rem)' }}
          >
            <span className="text-gradient-cosmic">The Signal</span>
            <br />
            <span className="text-white/90 text-[0.7em] font-semibold tracking-wide">by Wavelength</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-xl mx-auto mb-8">
            Workforce intelligence for community college CE and workforce development teams.
            3× per week. Free. No noise.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60 mb-12">
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-teal-400" /> Free forever</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-teal-400" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-teal-400" /> Unsubscribe anytime</span>
          </div>
        </div>
      </section>

      {/* What's in each edition */}
      <section className="relative py-16">
        <div className="max-w-[900px] mx-auto px-6">
          <h2 className="font-heading font-bold text-white text-center text-2xl md:text-3xl mb-10">
            Every edition, three signals.
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {SAMPLE_ITEMS.map((item) => (
              <div key={item.label} className="card-cosmic rounded-xl p-6">
                <div className="font-semibold text-white mb-3 text-sm">{item.label}</div>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Sample snippet */}
          <div className="card-cosmic rounded-2xl overflow-hidden mb-16">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-white/40 text-xs font-mono">The Signal — Sample Edition</span>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
                  <span className="text-blue-300 text-[10px] font-bold uppercase tracking-wider">📊 Labor Market Signal</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  <strong className="text-white">66% of job postings now require a credential, but only 31% of workers have one.</strong> Lightcast's new "Fault Lines" report frames this as structural, not cyclical — driven by aging demographics and declining immigration. Healthcare and hospitality are hardest hit. For CE teams, this is the clearest mandate yet: short-term credentials in high-demand sectors are not optional, they're urgent.
                </p>
              </div>
              <div className="border-t border-white/[0.06] pt-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-3">
                  <span className="text-teal-300 text-[10px] font-bold uppercase tracking-wider">🏭 Industry Spotlight</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  <strong className="text-white">Advanced manufacturing in the Midwest is outpacing national growth.</strong> Iowa and Kansas are leading the region — driven by reshoring, EV component production, and agricultural tech expansion. Programs in CNC machining, quality control, and industrial maintenance are seeing 40%+ YoY demand increases in job postings. If you don't have a manufacturing pathway, this is the moment.
                </p>
              </div>
              <div className="border-t border-white/[0.06] pt-6 text-center">
                <p className="text-white/30 text-xs italic">— Subscribe to receive the full edition —</p>
              </div>
            </div>
          </div>

          {/* Signup form */}
          <div className="max-w-lg mx-auto">
            <h2 className="font-heading font-bold text-white text-center text-2xl mb-2">
              Join the Signal.
            </h2>
            <p className="text-white/60 text-center text-sm mb-8">
              Free. 3× per week. Built for workforce development professionals.
            </p>

            {status === 'success' ? (
              <div className="card-cosmic rounded-2xl p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-7 w-7 text-teal-400" />
                </div>
                <h3 className="font-heading font-bold text-white text-xl mb-2">You&apos;re in.</h3>
                <p className="text-white/60 text-sm">
                  Your first edition lands Monday, Wednesday, or Friday — whichever comes first.
                  Welcome to the Signal.
                </p>
                <Link href="/" className="block mt-6">
                  <button className="btn-cosmic btn-cosmic-ghost text-sm">
                    Back to Wavelength
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card-cosmic rounded-2xl p-6 md:p-8 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/70 uppercase tracking-wider mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Sarah"
                    value={formData.firstName}
                    onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/[0.15] rounded-lg px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 uppercase tracking-wider mb-1.5">
                    Work Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@college.edu"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/[0.15] rounded-lg px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 uppercase tracking-wider mb-1.5">
                    Institution
                  </label>
                  <input
                    type="text"
                    placeholder="Lakeland Community College"
                    value={formData.institution}
                    onChange={e => setFormData(p => ({ ...p, institution: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/[0.15] rounded-lg px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-xs text-red-400">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn-cosmic btn-cosmic-primary w-full text-sm disabled:opacity-50 mt-2"
                >
                  {status === 'submitting' ? (
                    'Subscribing…'
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Subscribe — It&apos;s Free
                    </>
                  )}
                </button>
                <p className="text-white/40 text-xs text-center">
                  No spam. No credit card. Unsubscribe any time.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer nudge */}
      <section className="py-12 text-center">
        <p className="text-white/30 text-sm">
          The Signal is published by{' '}
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            Wavelength
          </Link>
          {' '}— workforce intelligence for community colleges.
        </p>
      </section>

    </div>
  );
}
