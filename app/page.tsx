'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Check, Shield, ArrowRight, Clock, Zap, ChevronDown, ChevronUp, FileSearch, BarChart3, Mail } from 'lucide-react';
import {
  AnimateOnScroll,
  StaggerChildren,
} from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { Waveform } from '@/components/cosmic/Waveform';
import { ParticleConstellation } from '@/components/cosmic/ParticleConstellation';
import { Equalizer, EqualizerWide } from '@/components/cosmic/Equalizer';
// import { Satellite } from '@/components/cosmic/Satellite';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming',
];

function WaveDivider() {
  return (
    <div className="w-full overflow-hidden py-6" aria-hidden="true">
      <svg
        viewBox="0 0 1200 60"
        className="w-full h-10 opacity-[0.15]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <path
          d="M0,30 C100,10 200,50 300,30 C400,10 500,50 600,30 C700,10 800,50 900,30 C1000,10 1100,50 1200,30"
          fill="none"
          stroke="url(#wave-gradient)"
          strokeWidth="2.5"
        />
        <path
          d="M0,30 C100,10 200,50 300,30 C400,10 500,50 600,30 C700,10 800,50 900,30 C1000,10 1100,50 1200,30"
          fill="none"
          stroke="url(#wave-gradient)"
          strokeWidth="1"
          opacity="0.4"
          transform="translate(0, 6)"
        />
      </svg>
    </div>
  );
}

function PellForm({ onFocus, onBlur }: { onFocus?: () => void; onBlur?: () => void } = {}) {
  const [formData, setFormData] = useState({ name: '', email: '', institution: '', state: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="card-cosmic rounded-2xl p-8 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
          <Check className="h-6 w-6 text-teal-400" />
        </div>
        <h3 className="font-heading font-bold text-theme-primary text-xl mb-2">Check your inbox</h3>
        <p className="text-theme-secondary text-sm">
          We&apos;ll be in touch within 48 hours with your Pell Readiness Check results.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onFocus={onFocus} onBlur={onBlur} className="card-cosmic rounded-2xl p-6 md:p-8 max-w-md mx-auto w-full">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-theme-secondary uppercase tracking-wider mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            required
            placeholder="Dr. Sarah Chen"
            value={formData.name}
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            className="w-full bg-white/[0.05] border border-theme-strong rounded-lg px-4 py-2.5 text-theme-primary placeholder-white/40 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-theme-secondary uppercase tracking-wider mb-1.5">
            Work Email
          </label>
          <input
            type="email"
            required
            placeholder="sarah@college.edu"
            value={formData.email}
            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
            className="w-full bg-white/[0.05] border border-theme-strong rounded-lg px-4 py-2.5 text-theme-primary placeholder-white/40 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-theme-secondary uppercase tracking-wider mb-1.5">
            Institution
          </label>
          <input
            type="text"
            required
            placeholder="Your community college"
            value={formData.institution}
            onChange={e => setFormData(p => ({ ...p, institution: e.target.value }))}
            className="w-full bg-white/[0.05] border border-theme-strong rounded-lg px-4 py-2.5 text-theme-primary placeholder-white/40 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-theme-secondary uppercase tracking-wider mb-1.5">
            State
          </label>
          <select
            required
            value={formData.state}
            onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
            className="w-full bg-white/[0.05] border border-theme-strong rounded-lg px-4 py-2.5 text-theme-primary text-sm focus:outline-none focus:border-purple-500/50 transition-colors appearance-none"
          >
            <option value="" className="bg-theme-page">Select your state…</option>
            {US_STATES.map(s => (
              <option key={s} value={s} className="bg-theme-page">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {status === 'error' && (
        <p className="mt-3 text-xs text-red-400">Something went wrong — please try again or email us directly.</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-cosmic btn-cosmic-primary w-full mt-6 text-sm disabled:opacity-50"
      >
        {status === 'submitting' ? 'Sending…' : (
          <>
            Get My Free Pell Readiness Check
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </button>
      <p className="text-theme-secondary text-xs text-center mt-3">
        No credit card. No login. Results delivered by email.
      </p>
    </form>
  );
}

function LeadMagnetForm() {
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, institution, source: 'lead-magnet-checklist', name: '' }),
      });
      if (res.ok) setStatus('success');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
          <Check className="h-5 w-5 text-teal-400" />
        </div>
        <p className="text-theme-primary font-semibold mb-1">Check your inbox</p>
        <p className="text-theme-tertiary text-sm">Your checklist is on its way.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          placeholder="your@college.edu"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 bg-white/[0.05] border border-theme-strong rounded-lg px-4 py-2.5 text-theme-primary placeholder-white/40 text-sm focus:outline-none focus:border-teal-500/50 transition-colors"
        />
        <input
          type="text"
          required
          placeholder="Institution name"
          value={institution}
          onChange={e => setInstitution(e.target.value)}
          className="flex-1 bg-white/[0.05] border border-theme-strong rounded-lg px-4 py-2.5 text-theme-primary placeholder-white/40 text-sm focus:outline-none focus:border-teal-500/50 transition-colors"
        />
      </div>
      {status === 'error' && <p className="text-xs text-red-400">Something went wrong — please try again.</p>}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-cosmic btn-cosmic-primary w-full text-sm disabled:opacity-50"
      >
        {status === 'submitting' ? 'Sending\u2026' : (
          <>
            Send Me the Checklist
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </button>
      <p className="text-theme-muted text-xs text-center">No spam. Unsubscribe anytime.</p>
    </form>
  );
}

const FAQ_ITEMS = [
  {
    q: 'Is Wavelength right for my institution?',
    a: 'If you\'re a community college or technical college with a continuing education or workforce division, yes. We work with institutions that want to make smarter decisions about which programs to build — using real labor market data instead of intuition or outdated surveys. If you\'re a VP of Academic Affairs, Workforce Development Director, or Dean-level leader asking \'what should we build next?\' — this was built for you.',
  },
  {
    q: 'What is the Workforce Pell Grant?',
    a: 'Starting July 1, 2026, short-term programs between 150 and 599 clock hours become eligible for federal Pell Grant funding for the first time. This opens significant new enrollment and revenue opportunities for community colleges that have qualifying programs in place.',
  },
  {
    q: 'What does the free Pell Readiness Check include?',
    a: 'We assess your current program portfolio against the Workforce Pell eligibility criteria — clock hours, credential type, and labor market alignment requirements. You\'ll receive a clear breakdown of which programs likely qualify, which need adjustments, and where the biggest opportunities are.',
  },
  {
    q: 'What do I get in a Program Opportunity Scan?',
    a: 'A Program Opportunity Scan delivers 7–10 validated program opportunities for your region — each scored across five dimensions. The 25+ page report includes regional labor market intelligence, employer demand verification, competitive landscape mapping, Blue Ocean opportunity scoring, and Workforce Pell readiness — all from 50+ verified sources.',
  },
  {
    q: 'What is the Program Gap Audit?',
    a: 'The Program Gap Audit shows every state-mandated program your institution isn\'t currently offering — along with estimated enrollment demand and revenue potential for each gap. It replaces weeks of manual research with a 25+ page intelligence report your team can act on immediately.',
  },
  {
    q: 'How is this different from standard labor market reports?',
    a: 'Standard LMI tools (O*NET, Lightcast) only surface occupations already cataloged by the government. Our analysis draws from 50+ live sources — employer job postings, economic development announcements, industry supply chain signals — to surface demand before it shows up in any database.',
  },
  {
    q: 'How long does a Program Opportunity Scan take?',
    a: 'Approximately one week from the time we receive your intake form. Rush delivery is available for an additional fee. The Pell Readiness Check is faster — typically 2–3 business days.',
  },
  {
    q: 'Can this be funded through grants?',
    a: 'Yes. Workforce intelligence and curriculum alignment tools are eligible expenses under Perkins V, WIOA Title I, and most state workforce development grant programs. Many institutions fund these projects through existing professional development or program development line items. We can provide documentation to support your grant reporting.',
  },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="relative py-20 md:py-28" id="faq">
      <div className="max-w-[760px] mx-auto px-6">
        <AnimateOnScroll variant="fade-up" className="text-center mb-4">
          <span className="overline inline-flex items-center gap-3">
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/50" />
            FAQ
            <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-teal-500/50" />
          </span>
        </AnimateOnScroll>
        <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-12">
          <h2
            className="font-heading font-bold text-theme-primary"
            style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
          >
            Common questions
          </h2>
        </AnimateOnScroll>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <AnimateOnScroll key={i} variant="fade-up" delay={i * 60}>
              <div className="card-cosmic rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left gap-4"
                >
                  <span className="font-heading font-semibold text-theme-primary text-sm md:text-base">
                    {item.q}
                  </span>
                  {open === i
                    ? <ChevronUp className="h-4 w-4 text-theme-secondary flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-theme-secondary flex-shrink-0" />
                  }
                </button>
                {open === i && (
                  <div className="px-5 pb-5">
                    <p className="text-theme-secondary text-sm leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Static Hero ───────────── */

const CATEGORY_CHIPS = [
  { label: 'Market Research',     href: '/market-research' },
  { label: 'Program Analysis',    href: '/program-analysis' },
  { label: 'Program Development', href: '/program-development' },
  { label: 'Grant Alignment',     href: '/grant-alignment' },
  { label: 'Program Health',      href: '/program-health' },
];

function StaticHero() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-[700px] flex items-center justify-center pt-36 lg:pt-40 pb-16 overflow-hidden">
      <Stars count={120} />
      <Aurora />
      <Waveform className="opacity-30" />
      <ParticleConstellation particleCount={30} connectionDistance={90} mouseRadius={120} speed={0.2} />

      <div className="relative z-10 max-w-[860px] mx-auto px-6 w-full text-center">

        {/* Descriptor */}
        <p className="label-brand mb-6">
          <span className="text-gradient-cosmic">∿ ·</span> Workforce Program Intelligence for Community Colleges
        </p>

        {/*
          ════════════════════════════════════════════════════
          HERO COPY VARIANTS — 2026-02-19
          Implement: Variant A (speed/efficiency angle)
          Others are commented out below for reference.
          ════════════════════════════════════════════════════

          ── Variant B: Specificity ("not dashboards, scored programs") ──
          <h1 ...>Not dashboards. Specific, scored programs worth building.</h1>
          <p ...>Every report delivers 7–10 vetted opportunities — each scored
          across demand, competition, revenue, and Pell readiness. Skip the raw
          data.</p>

          ── Variant C: Outcomes / action ("build the right programs") ──
          <h1 ...>Build the programs your region is asking for.</h1>
          <p ...>Wavelength surfaces, validates, and scores workforce program
          opportunities for your institution — ready to present, fund, and
          build.</p>
          ════════════════════════════════════════════════════
        */}

        {/* Variant A — Speed / efficiency ("days not months") */}
        <h1
          className="text-gradient-cosmic font-heading font-bold leading-[1.05]"
          style={{ fontSize: 'clamp(2.4rem, 5vw + 0.5rem, 4.2rem)' }}
        >
          Program intelligence delivered in days, not months.
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-lg md:text-xl text-theme-secondary leading-relaxed max-w-2xl mx-auto">
          A complete intelligence stack for community college CE divisions — from opportunity discovery through program launch, plus standalone reports you can order anytime.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/pell">
            <button className="btn-cosmic btn-cosmic-primary text-sm">
              Start Free — Pell Check
            </button>
          </Link>
          <Link href="#products">
            <button className="btn-cosmic btn-cosmic-ghost text-sm">
              Explore Products ↓
            </button>
          </Link>
        </div>

        {/* Category chips */}
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          {CATEGORY_CHIPS.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-theme-base bg-theme-card text-theme-secondary text-sm font-medium hover:border-theme-strong hover:text-theme-primary transition-colors"
            >
              <span className="opacity-40">●</span>
              {chip.label}
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">

      {/* ===== HERO ===== */}
      <StaticHero />

      {/* Equalizer divider — replaces wave after hero */}
      <div className="py-6 flex justify-center">
        <EqualizerWide bars={60} height={36} muted />
      </div>

      {/* ===== FIND YOUR PATH — CATEGORY GRID ===== */}
      <section className="relative py-24 md:py-36" id="products">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline inline-flex items-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/50" />
              Where to Start
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-teal-500/50" />
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-4">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Find what you need.
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200} className="text-center mb-16">
            <p className="text-theme-secondary text-lg max-w-2xl mx-auto">
              Wavelength has five product categories. Pick the one that matches what you&apos;re trying to do — and go straight to the right product.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {[
              {
                category: 'Market Research',
                headline: 'Not sure what to build next?',
                pain: "Your region is signaling demand you haven\'t captured yet. We surface the programs worth building — before your competitors do.",
                products: [{ name: 'Program Opportunity Scan', price: '$1,500' }],
                href: '/market-research',
                border: 'border-violet-500/30',
                text: 'text-violet-300',
                bg: 'bg-violet-500/10',
              },
              {
                category: 'Program Analysis',
                headline: "Not sure what you\'re missing?",
                pain: 'Between Workforce Pell eligibility and state compliance mandates, most institutions are leaving programs — and funding — uncaptured.',
                products: [{ name: 'Pell Readiness Check', price: 'Free' }, { name: 'Program Gap Audit', price: '$295' }],
                href: '/program-analysis',
                border: 'border-blue-500/30',
                text: 'text-blue-300',
                bg: 'bg-blue-500/10',
              },
              {
                category: 'Program Development',
                headline: 'Have an idea and need to validate it?',
                pain: 'Before you invest in curriculum, advisory boards, and approvals — get data-backed confirmation that real demand exists.',
                products: [{ name: 'Program Validation', price: '$2,000' }],
                href: '/program-development',
                border: 'border-emerald-500/30',
                text: 'text-emerald-300',
                bg: 'bg-emerald-500/10',
              },
              {
                category: 'Grant Alignment',
                headline: 'Need funding before you can build?',
                pain: 'Perkins V, WIOA, and state workforce grants are available — most institutions pursue fewer than a third of what they qualify for.',
                products: [{ name: 'Grant Intelligence Scan', price: '$495' }],
                href: '/grant-alignment',
                border: 'border-green-500/30',
                text: 'text-green-300',
                bg: 'bg-green-500/10',
              },
              {
                category: 'Program Health',
                headline: 'Worried your programs are falling behind?',
                pain: 'Employer requirements shift faster than curriculum review cycles. Know exactly where your programs are drifting — every quarter.',
                products: [{ name: 'Curriculum Drift Analysis', price: 'from $1,200/yr' }],
                href: '/program-health',
                border: 'border-orange-500/30',
                text: 'text-orange-300',
                bg: 'bg-orange-500/10',
              },
            ].map((cat, i) => (
              <AnimateOnScroll key={cat.category} variant="fade-up" delay={100 * i} className={i === 4 ? 'md:col-span-2 md:max-w-[calc(50%-0.5rem)] md:mx-auto' : ''}>
                <Link href={cat.href} className="block card-cosmic rounded-2xl p-7 h-full group hover:bg-white/[0.03] transition-colors">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-3">{cat.category}</p>
                  <h3 className="font-heading font-bold text-theme-primary text-xl mb-2">{cat.headline}</h3>
                  <p className="text-theme-secondary text-sm leading-relaxed mb-5">{cat.pain}</p>
                  <div className="space-y-2 mb-5">
                    {cat.products.map(p => (
                      <div key={p.name} className="flex items-center justify-between gap-4">
                        <span className="text-sm text-theme-secondary">{p.name}</span>
                        <span className="text-sm font-bold text-theme-primary whitespace-nowrap">{p.price}</span>
                      </div>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-theme-tertiary group-hover:text-theme-primary group-hover:gap-2 transition-all">
                    Go <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MID-FUNNEL LEAD MAGNET ===== */}
      <section className="relative py-14 md:py-20">
        <div className="max-w-[680px] mx-auto px-6">
          <div className="card-cosmic rounded-2xl p-8 md:p-10 border-teal-500/20">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-theme-tertiary mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                Free Download
              </span>
              <h2 className="font-heading font-bold text-theme-primary text-2xl md:text-3xl mb-3">
                5 Signs Your Program Portfolio Has Gaps
              </h2>
              <p className="text-theme-tertiary text-sm leading-relaxed max-w-md mx-auto">
                A quick self-assessment for workforce leaders. See which gaps are costing your institution enrollment — and what to do about them.
              </p>
            </div>
            <LeadMagnetForm />
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-24 md:py-36" id="how-it-works">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline inline-flex items-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/50" />
              How It Works
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-teal-500/50" />
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-16">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              From signal to program plan.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={120} variant="fade-up" className="grid md:grid-cols-3 gap-12 md:gap-8">
            {[
              {
                step: '01',
                title: 'Tune In',
                desc: 'Tell us about your institution, region, and any program focus areas. Takes 60 seconds.',
              },
              {
                step: '02',
                title: 'We Scan',
                desc: 'We cross-reference 50+ sources — labor data, employer signals, competitive gaps — to find the programs your region is missing.',
              },
              {
                step: '03',
                title: 'Clear Signal',
                desc: '7–10 vetted new program leads — scored, ranked, and ready to build. Each one backed by real demand and a clear path forward.',
              },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="text-center relative">
                {/* Gradient number */}
                <div className="mx-auto mb-6 relative">
                  <span
                    className="font-heading font-bold text-6xl text-gradient-cosmic opacity-20 select-none"
                    aria-hidden="true"
                  >
                    {step}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-theme-primary text-xl mb-3">{title}</h3>
                <p className="text-theme-tertiary text-sm leading-relaxed max-w-[280px] mx-auto">{desc}</p>

                {/* Connector line between steps (desktop only) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8">
                    <div className="h-[1px] w-full bg-gradient-to-r from-purple-500/20 to-teal-500/20" />
                  </div>
                )}
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <WaveDivider />

      {/* ===== SOCIAL PROOF ===== */}
      <section className="relative py-16 md:py-24" id="proof">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <span className="overline inline-flex items-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/50" />
              In The Field
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-teal-500/50" />
            </span>
            <h2 className="font-heading font-bold text-theme-primary mt-4" style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}>
              Built by someone who&apos;s been in the room.
            </h2>
            <p className="text-theme-tertiary text-base max-w-xl mx-auto mt-4 leading-relaxed">
              Wavelength was built by a 15-year community college workforce development professional who ran into the same wall every institution does: too many requests, too little data, and no good way to know which programs were actually worth building.
            </p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { value: '15+', label: 'Years in workforce development', sub: 'Direct institutional experience' },
              { value: '50+', label: 'Live data sources per scan', sub: 'Not just O*NET and Lightcast' },
              { value: '$0', label: 'To get started', sub: 'Free Pell check, no strings attached' },
            ].map(({ value, label, sub }) => (
              <AnimateOnScroll key={label} variant="fade-up">
                <div className="card-cosmic rounded-xl p-6 text-center">
                  <div className="font-heading font-bold text-3xl text-gradient-cosmic mb-1">{value}</div>
                  <div className="text-theme-primary font-medium text-sm mb-1">{label}</div>
                  <div className="text-theme-muted text-xs">{sub}</div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll variant="fade-up" delay={200} className="mt-10">
            <div className="card-cosmic rounded-2xl p-8 border-purple-500/20 relative">
              <div className="absolute top-6 left-8 text-purple-400/30 font-serif text-6xl leading-none select-none">&ldquo;</div>
              <blockquote className="relative z-10 text-theme-secondary text-lg leading-relaxed italic pt-4 text-center max-w-2xl mx-auto">
                &ldquo;The programs we were offering looked fine on paper. What we didn&apos;t know was how many we were missing — and what each one was worth. That&apos;s the gap this fills.&rdquo;
              </blockquote>
              <div className="mt-6 text-center">
                <div className="text-theme-primary font-semibold text-sm">Workforce Development Leader</div>
                <div className="text-theme-muted text-xs mt-1">Midwest Community College</div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <WaveDivider />

      {/* ===== WHAT'S IN A MARKET SCAN ===== */}
      <section className="relative py-24 md:py-36" id="market-scan">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline inline-flex items-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/50" />
              What&apos;s in a Program Opportunity Scan
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-teal-500/50" />
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-4">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Six phases of research. 7–10 programs worth building.
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200} className="text-center mb-16">
            <p className="text-theme-secondary text-lg max-w-2xl mx-auto">
              Every program lead backed by real workforce demand. Every opportunity scored so you know exactly where to invest.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Regional Intelligence',
                desc: 'Your institution profiled. Top employers mapped. Economic trends identified. Existing programs cataloged.',
              },
              {
                num: '02',
                title: 'Demand Signal Detection',
                desc: 'Employment data, active job postings, employer expansion signals, and matching grant opportunities — from 50+ verified sources.',
              },
              {
                num: '03',
                title: 'Competitive Landscape',
                desc: 'Every provider in your region mapped. Their programs cataloged. White space and competitive gaps identified.',
              },
              {
                num: '04',
                title: 'Opportunity Scoring',
                desc: 'Each opportunity scored across 5 dimensions: demand, competition, revenue, wages, and launch speed.',
              },
              {
                num: '05',
                title: 'Blue Ocean Scanner',
                desc: 'The opportunities no standard analysis finds — emerging roles, employer pain points, and supply chain gaps before they hit any database.',
              },
              {
                num: '06',
                title: 'The Program Opportunity Scan Report',
                desc: '7–10 vetted program leads in a 25+ page report — scored, ranked, with evidence trails, grant alignment, Pell readiness, and specific next steps.',
              },
            ].map(({ num, title, desc }) => (
              <div key={num} className="card-cosmic rounded-xl p-6">
                <div className="font-mono text-xs text-theme-muted tracking-widest mb-3">{num}</div>
                <h3 className="font-heading font-semibold text-theme-primary mb-2">{title}</h3>
                <p className="text-theme-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </StaggerChildren>

          {/* Report preview card */}
          <AnimateOnScroll variant="scale" delay={200} className="mt-16">
            <div className="max-w-4xl mx-auto card-cosmic rounded-2xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-theme-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-theme-secondary mb-1">
                      Program Opportunity Scan
                    </p>
                    <p className="font-heading font-semibold text-theme-primary text-xl">
                      Riverside Community College
                    </p>
                    <p className="text-theme-secondary text-sm mt-0.5">
                      Research Triangle — Raleigh, Durham, Chapel Hill, Cary
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-theme-secondary">
                    <span>50+ cited sources · ~25 pages</span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 border-b border-theme-subtle">
                <h3 className="text-xs font-medium uppercase tracking-widest text-theme-secondary mb-4">
                  Top Opportunities — Scored &amp; Ranked
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Biologics Manufacturing Quality Systems', score: 9.05, badge: 'Blue Ocean' },
                    { name: 'Healthcare Management Certificate', score: 8.7, badge: null },
                    { name: 'Educational Facilities Operations Specialist', score: 8.55, badge: 'Blue Ocean' },
                    { name: 'Construction Management Certificate', score: 8.5, badge: null },
                  ].map((program) => (
                    <div
                      key={program.name}
                      className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-theme-secondary text-sm font-medium">{program.name}</span>
                        {program.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cosmic-teal/20 text-teal-300 border border-teal-500/20">
                            {program.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{ width: `${(program.score / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-theme-secondary text-sm font-mono w-8 text-right">{program.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 md:p-8 border-t border-theme-subtle flex justify-center">
                <Link href="/report/demo">
                  <button className="btn-cosmic btn-cosmic-ghost text-sm">
                    View Full Sample Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>


      {/* ===== THE SIGNAL NEWSLETTER STRIP ===== */}
      <section className="relative py-20 md:py-24">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="card-cosmic rounded-2xl p-8 md:p-10 text-center border-blue-500/20">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-theme-tertiary mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              Free Newsletter
            </span>
            <h2 className="font-heading font-bold text-theme-primary text-2xl md:text-3xl mb-3">
              The Signal <span className="text-theme-tertiary font-normal text-xl">by Wavelength</span>
            </h2>
            <p className="text-theme-tertiary text-sm leading-relaxed max-w-md mx-auto mb-8">
              Labor market signals, workforce news, and industry spotlights — for CE and workforce development teams. Free, 3× per week.
            </p>
            <Link href="/signal">
              <button className="btn-cosmic btn-cosmic-primary text-sm">
                <Mail className="mr-2 h-4 w-4" />
                Subscribe Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
            <div className="flex flex-wrap justify-center gap-5 mt-6 text-xs text-theme-muted">
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-teal-400" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-teal-400" /> No spam</span>
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-teal-400" /> Unsubscribe anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <FAQSection />

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        <Aurora />
        <Stars count={60} />
        <Waveform className="opacity-20" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <h2
              className="font-heading font-bold text-theme-primary mx-auto max-w-3xl leading-tight"
              style={{ fontSize: 'clamp(1.75rem, 4vw + 0.5rem, 3rem)' }}
            >
              Your community needs programs you haven&apos;t built yet.
              <br className="hidden sm:block" />
              <span className="text-gradient-cosmic">Let&apos;s get on the same wavelength.</span>
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#hero">
                <button className="btn-cosmic btn-cosmic-primary text-base px-10 py-4">
                  <Zap className="mr-2 h-5 w-5" />
                  Get Your Free Pell Readiness Check
                </button>
              </a>
              <Link href="/contact">
                <button className="btn-cosmic btn-cosmic-ghost text-base px-8 py-4">
                  Order a Program Opportunity Scan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </Link>
            </div>
            <p className="mt-8 text-xs font-mono text-theme-muted tracking-widest uppercase">
              Wavelength · Workforce Program Intelligence · withwavelength.com
            </p>
            <p className="mt-6 text-sm text-theme-secondary">
              Questions?{' '}
              <Link
                href="/contact"
                className="text-theme-secondary hover:text-theme-secondary underline underline-offset-4 transition-colors"
              >
                Contact Us
              </Link>
            </p>
          </AnimateOnScroll>
        </div>
      </section>

    </div>
  );
}
