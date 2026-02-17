'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Check, Shield, ArrowRight, Clock, Zap, ChevronDown, ChevronUp, FileSearch, BarChart3, Radio } from 'lucide-react';
import {
  AnimateOnScroll,
  StaggerChildren,
} from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { Waveform } from '@/components/cosmic/Waveform';
import { ParticleConstellation } from '@/components/cosmic/ParticleConstellation';
import { Equalizer, EqualizerWide } from '@/components/cosmic/Equalizer';
import { Satellite } from '@/components/cosmic/Satellite';

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
        <h3 className="font-heading font-bold text-white text-xl mb-2">Check your inbox</h3>
        <p className="text-white/70 text-sm">
          We&apos;ll be in touch within 48 hours with your Pell Readiness Check results.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onFocus={onFocus} onBlur={onBlur} className="card-cosmic rounded-2xl p-6 md:p-8 max-w-md mx-auto w-full">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-white/70 uppercase tracking-wider mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            required
            placeholder="Dr. Jane Smith"
            value={formData.name}
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            className="w-full bg-white/[0.05] border border-white/[0.15] rounded-lg px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/70 uppercase tracking-wider mb-1.5">
            Work Email
          </label>
          <input
            type="email"
            required
            placeholder="you@college.edu"
            value={formData.email}
            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
            className="w-full bg-white/[0.05] border border-white/[0.15] rounded-lg px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/70 uppercase tracking-wider mb-1.5">
            Institution
          </label>
          <input
            type="text"
            required
            placeholder="Midwest Community College"
            value={formData.institution}
            onChange={e => setFormData(p => ({ ...p, institution: e.target.value }))}
            className="w-full bg-white/[0.05] border border-white/[0.15] rounded-lg px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/70 uppercase tracking-wider mb-1.5">
            State
          </label>
          <select
            required
            value={formData.state}
            onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
            className="w-full bg-white/[0.05] border border-white/[0.15] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors appearance-none"
          >
            <option value="" className="bg-[#050510]">Select your state…</option>
            {US_STATES.map(s => (
              <option key={s} value={s} className="bg-[#050510]">{s}</option>
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
      <p className="text-white/70 text-xs text-center mt-3">
        No credit card. No login. Results delivered by email.
      </p>
    </form>
  );
}

const FAQ_ITEMS = [
  {
    q: 'What is the Workforce Pell Grant?',
    a: 'Starting July 1, 2026, short-term programs between 150 and 599 clock hours become eligible for federal Pell Grant funding for the first time. This opens significant new enrollment and revenue opportunities for community colleges that have qualifying programs in place.',
  },
  {
    q: 'What does the free Pell Readiness Check include?',
    a: 'We assess your current program portfolio against the Workforce Pell eligibility criteria — clock hours, credential type, and labor market alignment requirements. You\'ll receive a clear breakdown of which programs likely qualify, which need adjustments, and where the biggest opportunities are.',
  },
  {
    q: 'What is a Market Scan?',
    a: 'A Market Scan is a 25+ page intelligence report that identifies the workforce programs your region actually needs. It includes regional market analysis, demand signal detection, competitive landscape mapping, Blue Ocean opportunity scoring, and Workforce Pell readiness assessment — all from 50+ verified sources.',
  },
  {
    q: 'What is the Compliance Gap Report?',
    a: 'The Compliance Gap Report shows every state-mandated or regionally critical program your institution isn\'t currently offering — along with estimated enrollment demand and revenue potential for each gap. It\'s a fast, affordable way to find programs you should already be running.',
  },
  {
    q: 'How is this different from standard labor market reports?',
    a: 'Standard LMI tools (O*NET, Lightcast) only surface occupations already cataloged by the government. Our analysis draws from 50+ live sources — employer job postings, economic development announcements, industry supply chain signals — to surface demand before it shows up in any database.',
  },
  {
    q: 'How long does a Market Scan take?',
    a: 'Approximately one week from the time we receive your intake form. Rush delivery is available for an additional fee. The Pell Readiness Check is faster — typically 2–3 business days.',
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
            className="font-heading font-bold text-white"
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
                  <span className="font-heading font-semibold text-white text-sm md:text-base">
                    {item.q}
                  </span>
                  {open === i
                    ? <ChevronUp className="h-4 w-4 text-white/70 flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-white/70 flex-shrink-0" />
                  }
                </button>
                {open === i && (
                  <div className="px-5 pb-5">
                    <p className="text-white/70 text-sm leading-relaxed">{item.a}</p>
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

/* ───────────── Hero Carousel ───────────── */

const HERO_SLIDES = [
  {
    id: 'main',
    badge: null,
    headline: 'Market intelligence for community college programs.',
    subtitle: 'We scan 50+ data sources so you can build programs with confidence — not guesswork. From compliance gaps to full market scans, Wavelength tunes you into what your region actually needs.',
    stats: [
      { value: '50+', label: 'verified sources' },
      { value: '3', label: 'product tiers' },
      { value: '$0', label: 'to get started' },
    ],
    cta: { text: 'See Our Products ↓', href: '#products' },
    ctaSecondary: { text: 'View Sample Report', href: '/report/demo' },
    icon: <Radio className="h-3.5 w-3.5 text-teal-400" />,
    badgeColor: 'teal',
    showForm: false,
  },
  {
    id: 'pell',
    badge: 'July 1, 2026 Deadline',
    headline: 'Is your institution Workforce Pell ready?',
    subtitle: 'Starting July 1, 2026, short-term programs qualify for federal Pell Grants for the first time. Find out which of your programs are eligible — for free — before your competitors get there first.',
    stats: [
      { value: '50+', label: 'verified sources' },
      { value: 'Free', label: 'readiness check' },
      { value: '48h', label: 'turnaround' },
    ],
    cta: null,
    ctaSecondary: null,
    icon: <Clock className="h-3.5 w-3.5 text-purple-400" />,
    badgeColor: 'purple',
    showForm: true,
  },
  {
    id: 'compliance',
    badge: '$295 · Instant ROI',
    headline: 'What mandated programs are you missing?',
    subtitle: 'Every state requires specific training programs — CNA, cosmetology, CDL, pharmacy tech, and more. We cross-reference your catalog against state regulatory codes and show you exactly what you\'re not offering — and what it\'s worth.',
    stats: [
      { value: '$295', label: 'one-time' },
      { value: '21+', label: 'gap categories' },
      { value: '$4.2M', label: 'avg opportunity' },
    ],
    cta: { text: 'Learn More →', href: '/compliance-gap' },
    ctaSecondary: { text: 'Order Now', href: 'mailto:hello@withwavelength.com?subject=Compliance%20Gap%20Report' },
    icon: <FileSearch className="h-3.5 w-3.5 text-blue-400" />,
    badgeColor: 'blue',
    showForm: false,
  },
  {
    id: 'market-scan',
    badge: 'Founding Rate · $1,500',
    headline: 'Full market intelligence before you build.',
    subtitle: 'A comprehensive market scan for any program you\'re considering. Demand signals, employer verification, financial projections, competitive analysis, and a clear GO / NO-GO recommendation backed by real data.',
    stats: [
      { value: '$1,500', label: 'founding rate' },
      { value: '6', label: 'research phases' },
      { value: '25+', label: 'page report' },
    ],
    cta: { text: 'Learn More →', href: '/discover' },
    ctaSecondary: { text: 'Order a Market Scan', href: 'mailto:hello@withwavelength.com?subject=Market%20Scan%20Order' },
    icon: <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />,
    badgeColor: 'emerald',
    showForm: false,
  },
];

const BADGE_COLORS: Record<string, string> = {
  teal: 'bg-teal-500/10 border-teal-500/20 text-teal-300',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
};

const DOT_COLORS: Record<string, string> = {
  teal: 'bg-teal-400',
  purple: 'bg-purple-400',
  blue: 'bg-blue-400',
  emerald: 'bg-emerald-400',
};

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    if (index === current || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  }, [current, isTransitioning]);

  // Auto-rotate every 8 seconds — pauses when user is interacting with form
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % HERO_SLIDES.length);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 300);
    }, 8000);
    return () => clearInterval(timer);
  }, [paused]);

  const slide = HERO_SLIDES[current];

  return (
    <section className="relative min-h-[90vh] lg:h-[90vh] lg:min-h-[700px] lg:max-h-[900px] flex items-center justify-center pt-36 lg:pt-40 pb-16 overflow-hidden">
      <Stars count={250} />
      <Aurora />
      <Waveform className="opacity-60" />
      <ParticleConstellation particleCount={70} connectionDistance={130} mouseRadius={180} speed={0.25} />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left: Content */}
          <div
            className={`flex-1 text-center lg:text-left transition-all duration-500 ease-out min-h-[320px] ${
              isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            {slide.badge && (
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6 ${BADGE_COLORS[slide.badgeColor]}`}>
                {slide.icon}
                <span className="text-xs font-medium uppercase tracking-wider">{slide.badge}</span>
              </div>
            )}

            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05]"
              style={{ fontSize: 'clamp(2.2rem, 5vw + 0.5rem, 4rem)' }}
            >
              {slide.headline}
            </h1>

            <div className="mt-4 flex lg:justify-start justify-center">
              <Equalizer bars={9} size="sm" muted />
            </div>

            <p className="mt-4 text-lg md:text-xl text-white/80 leading-relaxed max-w-xl">
              {slide.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap gap-5 lg:justify-start justify-center">
              {slide.stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="font-heading font-bold text-2xl text-gradient-cosmic">{value}</div>
                  <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>

            {slide.cta && (
              <div className="mt-8 flex flex-wrap gap-4 lg:justify-start justify-center">
                <Link href={slide.cta.href}>
                  <button className="btn-cosmic btn-cosmic-primary text-sm">
                    {slide.cta.text}
                  </button>
                </Link>
                {slide.ctaSecondary && (
                  <Link href={slide.ctaSecondary.href}>
                    <button className="btn-cosmic btn-cosmic-ghost text-sm">
                      {slide.ctaSecondary.text}
                    </button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right: Form or visual card */}
          <div
            className={`w-full lg:w-auto lg:min-w-[420px] lg:max-w-[480px] lg:min-h-[350px] flex items-center transition-all duration-500 ease-out ${
              isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            {slide.showForm ? (
              <PellForm onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} />
            ) : slide.id === 'main' ? (
              /* ── Overview: Stacked product preview cards ── */
              <div className="space-y-3 w-full">
                {[
                  { icon: '🎯', label: 'Pell Readiness Check', tag: 'Free', color: 'purple', desc: 'Know if your programs qualify' },
                  { icon: '📋', label: 'Compliance Gap Report', tag: '$295', color: 'blue', desc: '21+ regulatory categories scanned' },
                  { icon: '📊', label: 'Market Scan', tag: '$1,500', color: 'teal', desc: '50+ sources, 25+ page report' },
                ].map((item, idx) => (
                  <div
                    key={item.label}
                    className="card-cosmic rounded-xl p-4 flex items-center gap-4 hover:border-white/20 transition-all cursor-default"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-semibold text-white text-sm">{item.label}</h4>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${BADGE_COLORS[item.color]}`}>
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs mt-0.5">{item.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/30 flex-shrink-0" />
                  </div>
                ))}
                <div className="pt-2 flex items-center gap-2 justify-center">
                  <Equalizer bars={5} size="sm" muted />
                  <span className="text-white/30 text-xs tracking-wider uppercase">Tuned to your market</span>
                  <Equalizer bars={5} size="sm" muted />
                </div>
              </div>
            ) : slide.id === 'compliance' ? (
              /* ── Compliance: Mock gap findings table ── */
              <div className="card-cosmic rounded-2xl p-6 w-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <FileSearch className="h-4 w-4 text-blue-400" />
                  </div>
                  <h4 className="font-heading font-semibold text-white text-sm">Sample Gap Findings</h4>
                </div>
                <div className="space-y-2">
                  {[
                    { program: 'CNA / Nurse Aide', status: 'Missing', revenue: '$420K', urgency: 'high' },
                    { program: 'CDL Class A', status: 'Missing', revenue: '$890K', urgency: 'high' },
                    { program: 'Pharmacy Technician', status: 'Partial', revenue: '$310K', urgency: 'med' },
                    { program: 'HVAC Technician', status: 'Missing', revenue: '$560K', urgency: 'high' },
                    { program: 'Cosmetology', status: 'Offered', revenue: '—', urgency: 'ok' },
                  ].map((row) => (
                    <div key={row.program} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/[0.03] text-xs">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        row.urgency === 'high' ? 'bg-red-400' : row.urgency === 'med' ? 'bg-yellow-400' : 'bg-green-400'
                      }`} />
                      <span className="text-white/80 flex-1 font-medium">{row.program}</span>
                      <span className={`font-medium ${
                        row.status === 'Missing' ? 'text-red-400' : row.status === 'Partial' ? 'text-yellow-400' : 'text-green-400'
                      }`}>{row.status}</span>
                      <span className="text-white/50 w-14 text-right">{row.revenue}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-white/40 text-xs">Total uncaptured revenue</span>
                  <span className="text-blue-400 font-heading font-bold text-sm">$2.18M</span>
                </div>
              </div>
            ) : (
              /* ── Market Scan: Mock research pipeline ── */
              <div className="card-cosmic rounded-2xl p-6 w-full">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h4 className="font-heading font-semibold text-white text-sm">6-Phase Research Pipeline</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { phase: 'Regional Intelligence', pct: 100 },
                    { phase: 'Demand Signals', pct: 100 },
                    { phase: 'Competitive Landscape', pct: 100 },
                    { phase: 'Opportunity Scoring', pct: 85 },
                    { phase: 'Blue Ocean Scanner', pct: 60 },
                    { phase: 'Report Synthesis', pct: 20 },
                  ].map((step, idx) => (
                    <div key={step.phase} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/70">{idx + 1}. {step.phase}</span>
                        <span className={`font-medium ${step.pct === 100 ? 'text-emerald-400' : 'text-white/50'}`}>
                          {step.pct === 100 ? '✓' : `${step.pct}%`}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${step.pct}%`,
                            background: step.pct === 100
                              ? 'linear-gradient(90deg, #14b8a6, #10b981)'
                              : 'linear-gradient(90deg, #3b82f6, #14b8a6)',
                            animation: `barGrow 1.5s ease-out ${idx * 0.2}s both`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-white/40 text-xs">Estimated completion</span>
                  <span className="text-emerald-400 font-heading font-bold text-sm flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    Running...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center lg:justify-start gap-3 mt-12">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? `${BADGE_COLORS[s.badgeColor]} border`
                  : 'bg-white/5 border border-white/10 hover:border-white/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? DOT_COLORS[s.badgeColor] : 'bg-white/30 group-hover:bg-white/50'
              }`} />
              <span className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${
                i === current ? '' : 'text-white/40 group-hover:text-white/60'
              }`}>
                {s.id === 'main' && 'Overview'}
                {s.id === 'pell' && 'Pell Check'}
                {s.id === 'compliance' && 'Compliance'}
                {s.id === 'market-scan' && 'Market Scan'}
              </span>
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4 max-w-md lg:mx-0 mx-auto">
          <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              key={current}
              className={`h-full ${DOT_COLORS[HERO_SLIDES[current].badgeColor]} rounded-full`}
              style={{
                animation: 'heroProgress 8s linear',
              }}
            />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes heroProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes barGrow {
          from { width: 0%; }
        }
      `}} />
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-x-hidden bg-[#050510]">

      {/* ===== HERO CAROUSEL ===== */}
      <HeroCarousel />

      {/* Equalizer divider — replaces wave after hero */}
      <div className="py-6 flex justify-center">
        <EqualizerWide bars={60} height={36} />
      </div>

      {/* ===== THREE-PRODUCT FUNNEL ===== */}
      <section className="relative py-20 md:py-32" id="products">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline inline-flex items-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/50" />
              Our Products
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-teal-500/50" />
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-4">
            <h2
              className="font-heading font-bold text-white"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Start free. Dial in when you&apos;re ready.
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200} className="text-center mb-16">
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Each product delivers standalone value. Each one feeds the next.
            </p>
          </AnimateOnScroll>

          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-0 max-w-5xl mx-auto">

            {/* Card 1 — Pell Readiness Check */}
            <AnimateOnScroll variant="fade-up" delay={100} className="w-full lg:flex-1">
              <div className="card-cosmic rounded-2xl p-7 border-teal-500/20 h-full">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-4">
                  <span className="text-teal-300 text-[10px] font-bold uppercase tracking-wider">Free</span>
                </div>
                <h3 className="font-heading font-bold text-white text-xl mb-2">Pell Readiness Check</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Find out if your programs qualify before July 1 — before your competitors do.
                </p>
                <div className="mb-2">
                  <span className="font-heading font-bold text-4xl text-gradient-cosmic">$0</span>
                  <span className="text-white/80 text-sm ml-2">— email required</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
                  <Clock className="h-3 w-3 text-teal-400" />
                  <span className="text-teal-300 text-[10px] font-bold uppercase tracking-wider">Delivered in 48 hours</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {[
                    'Full program catalog review',
                    'Clock-hour & duration compliance check',
                    'Pell eligibility scoring (state + federal criteria)',
                    'Gap identification — programs you should add',
                    'Summary report with next steps',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="#hero">
                  <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                    Get Started — It&apos;s Free
                  </button>
                </a>
                <Link href="/pell" className="block mt-2">
                  <button className="btn-cosmic btn-cosmic-ghost w-full text-sm">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Arrow 1 */}
            <div className="hidden lg:flex items-center justify-center px-2 flex-shrink-0">
              <div className="flex flex-col items-center gap-1">
                <ArrowRight className="h-6 w-6 text-purple-500/50" />
              </div>
            </div>
            <div className="lg:hidden flex items-center justify-center py-1">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-purple-500/50 rotate-90" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Card 2 — Compliance Gap Report */}
            <AnimateOnScroll variant="fade-up" delay={200} className="w-full lg:flex-1">
              <div className="card-cosmic rounded-2xl p-7 h-full">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                  <span className="text-blue-300 text-[10px] font-bold uppercase tracking-wider">$295</span>
                </div>
                <h3 className="font-heading font-bold text-white text-xl mb-2">Compliance Gap Report</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Every state requires specific training programs. We show you which ones you&apos;re not offering — and what they&apos;re worth.
                </p>
                <div className="mb-2">
                  <span className="font-heading font-bold text-4xl text-gradient-cosmic">$295</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                  <Clock className="h-3 w-3 text-blue-400" />
                  <span className="text-blue-300 text-[10px] font-bold uppercase tracking-wider">Delivered in 3–5 business days</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {[
                    'Full catalog scan of your current programs',
                    'State regulatory code cross-reference',
                    'Every mandated gap with statutory citation',
                    'Revenue estimate per missing program',
                    'Prioritized opportunity ranking (1–10)',
                    'Professional consulting-grade report',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-cosmic-teal flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="mailto:hello@withwavelength.com?subject=Compliance%20Gap%20Report&body=College%20name%3A%20%0ACity%2C%20State%3A%20">
                  <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                    Order Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </a>
                <Link href="/compliance-gap" className="block mt-2">
                  <button className="btn-cosmic btn-cosmic-ghost w-full text-sm">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Arrow 2 */}
            <div className="hidden lg:flex items-center justify-center px-2 flex-shrink-0">
              <div className="flex flex-col items-center gap-1">
                <ArrowRight className="h-6 w-6 text-purple-500/50" />
              </div>
            </div>
            <div className="lg:hidden flex items-center justify-center py-1">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-purple-500/50 rotate-90" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Card 3 — Market Scan */}
            <AnimateOnScroll variant="fade-up" delay={300} className="w-full lg:flex-1">
              <div className="card-cosmic rounded-2xl p-7 border-purple-500/20 relative h-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/20">
                    Most Popular
                  </span>
                </div>
                <div className="mt-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                    <span className="text-purple-300 text-[10px] font-bold uppercase tracking-wider">Founding Rate</span>
                  </div>
                  <h3 className="font-heading font-bold text-white text-xl mb-2">Market Scan</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-6">
                    The full picture before you invest. 25+ page report backed by 50+ verified sources with a clear GO / NO-GO recommendation.
                  </p>
                  <div className="mb-1">
                    <span className="font-heading font-bold text-4xl text-gradient-cosmic">$1,500</span>
                    <span className="text-white/80 text-sm ml-2 line-through">$3,500</span>
                  </div>
                  <p className="text-xs text-white/80 mb-2">Founding rate — first 5 institutions</p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                    <Clock className="h-3 w-3 text-purple-400" />
                    <span className="text-purple-300 text-[10px] font-bold uppercase tracking-wider">Delivered in 5–7 business days</span>
                  </div>
                  <ul className="space-y-2.5 mb-7">
                    {[
                      'Regional labor market intelligence',
                      'Employer demand verification',
                      'Competitive landscape + Blue Ocean analysis',
                      'Programs scored, ranked & categorized',
                      'Financial projections & enrollment modeling',
                      'Workforce Pell readiness scoring',
                      'Grant alignment + funding opportunities',
                      'Executive summary + full report (25+ pages)',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-cosmic-teal flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <span className="text-sm text-white/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="mailto:hello@withwavelength.com?subject=Market%20Scan%20Order&body=College%20name%3A%20%0ACity%2C%20State%3A%20%0AAny%20focus%20areas%3A%20">
                    <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                      Order Market Scan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </a>
                  <Link href="/discover" className="block mt-2">
                    <button className="btn-cosmic btn-cosmic-ghost w-full text-sm">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>

          </div>
        </div>
      </section>

      <WaveDivider />

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-20 md:py-32" id="how-it-works">
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
              className="font-heading font-bold text-white"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Simple. Fast. Actionable.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={120} variant="fade-up" className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Submit',
                desc: 'Fill out the form above. Tell us your institution, state, and any program focus areas. Takes 60 seconds.',
                icon: '📬',
              },
              {
                step: '02',
                title: 'We Analyze',
                desc: 'Our system draws from 50+ verified sources — labor data, employer signals, competitive maps — to build your report.',
                icon: '🔬',
              },
              {
                step: '03',
                title: 'You Decide',
                desc: 'Receive a clear, sourced report with scored opportunities and specific next steps. No jargon. No hedging.',
                icon: '✅',
              },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-5 text-2xl">
                  {icon}
                </div>
                <div className="font-mono text-xs text-white/25 tracking-widest mb-2">{step}</div>
                <h3 className="font-heading font-bold text-white text-xl mb-3">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <WaveDivider />

      {/* ===== WHAT'S IN A MARKET SCAN ===== */}
      <section className="relative py-20 md:py-32" id="market-scan">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline inline-flex items-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/50" />
              What&apos;s in a Market Scan
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-teal-500/50" />
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-4">
            <h2
              className="font-heading font-bold text-white"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Six phases of research. One comprehensive report.
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200} className="text-center mb-16">
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Every data point sourced and cited. Every opportunity scored across five dimensions.
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
                title: 'The Market Scan Report',
                desc: '25+ pages with scored programs, evidence trails, grant alignment, barriers, Workforce Pell readiness scores, and specific next steps.',
              },
            ].map(({ num, title, desc }) => (
              <div key={num} className="card-cosmic rounded-xl p-6">
                <div className="font-mono text-xs text-white/25 tracking-widest mb-3">{num}</div>
                <h3 className="font-heading font-semibold text-white mb-2">{title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </StaggerChildren>

          {/* Report preview card */}
          <AnimateOnScroll variant="scale" delay={200} className="mt-16">
            <div className="max-w-4xl mx-auto card-cosmic rounded-2xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-white/[0.06]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-white/70 mb-1">
                      Market Scan
                    </p>
                    <p className="font-heading font-semibold text-white text-xl">
                      Wake Technical Community College
                    </p>
                    <p className="text-white/70 text-sm mt-0.5">
                      Research Triangle — Raleigh, Durham, Chapel Hill, Cary
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <span>50+ cited sources · ~25 pages</span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 border-b border-white/[0.06]">
                <h3 className="text-xs font-medium uppercase tracking-widest text-white/70 mb-4">
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
                        <span className="text-white/80 text-sm font-medium">{program.name}</span>
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
                        <span className="text-white/80 text-sm font-mono w-8 text-right">{program.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 md:p-8 border-t border-white/[0.06] flex justify-center">
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

      <WaveDivider />

      {/* ===== PRICING ===== */}
      <section className="relative py-20 md:py-32" id="pricing">
        <div className="max-w-[1100px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline inline-flex items-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/50" />
              Pricing
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-teal-500/50" />
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-4">
            <h2
              className="font-heading font-bold text-white"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Simple, transparent pricing.
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200} className="text-center mb-16">
            <p className="text-white/70 text-lg">
              🚀 Founding rates active — first 5 institutions only
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={120} variant="fade-up" className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto items-start">

            {/* Tier 1 — Pell Readiness Check */}
            <div className="card-cosmic rounded-2xl p-7 border-teal-500/20">
              <h3 className="font-heading font-semibold text-white text-lg">Pell Readiness Check</h3>
              <p className="text-white/70 text-sm mt-1">Find your Pell opportunity.</p>
              <div className="mt-5 mb-6">
                <span className="font-heading font-bold text-4xl text-gradient-cosmic">$0</span>
                <span className="text-white/80 text-sm ml-2">— email required</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {[
                  'Program eligibility assessment',
                  'Clock-hour compliance review',
                  'Pell gap identification',
                  'Delivered in ~48 hours',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="#hero">
                <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                  Get Started — Free
                </button>
              </a>
              <Link href="/pell" className="block mt-2">
                <button className="btn-cosmic btn-cosmic-ghost w-full text-sm">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>

            {/* Tier 2 — Compliance Gap Report */}
            <div className="card-cosmic rounded-2xl p-7">
              <h3 className="font-heading font-semibold text-white text-lg">Compliance Gap Report</h3>
              <p className="text-white/70 text-sm mt-1">Find the revenue you&apos;re missing.</p>
              <div className="mt-5 mb-6">
                <span className="font-heading font-bold text-4xl text-gradient-cosmic">$295</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {[
                  'State-mandated program analysis',
                  'Regional demand sizing',
                  'Revenue opportunity estimate',
                  'Prioritized action list',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-cosmic-teal flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@withwavelength.com?subject=Compliance%20Gap%20Report%20Order&body=College%20name%3A%20%0ACity%2C%20State%3A%20">
                <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                  Order Report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </a>
              <Link href="/compliance-gap" className="block mt-2">
                <button className="btn-cosmic btn-cosmic-ghost w-full text-sm">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>

            {/* Tier 3 — Market Scan (featured) */}
            <div className="card-cosmic rounded-2xl p-7 relative border-purple-500/20 md:-mt-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/20">
                  Founding Rate
                </span>
              </div>
              <div className="mt-3">
                <h3 className="font-heading font-semibold text-white text-lg">Market Scan</h3>
                <p className="text-white/70 text-sm mt-1">Full intelligence before you build.</p>
                <div className="mt-5 mb-1">
                  <span className="font-heading font-bold text-4xl text-gradient-cosmic">$1,500</span>
                  <span className="text-white/80 text-sm ml-2 line-through">$3,500</span>
                </div>
                <p className="text-xs text-white/80 mb-6">Founding rate</p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    'Regional market intelligence',
                    'Demand signal analysis',
                    'Competitive landscape',
                    'Blue Ocean opportunities',
                    'Workforce Pell readiness scoring',
                    'Grant alignment',
                    'Scored & ranked programs',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-cosmic-teal flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="mailto:hello@withwavelength.com?subject=Market%20Scan%20Order&body=College%20name%3A%20%0ACity%2C%20State%3A%20%0AAny%20focus%20areas%3A%20">
                  <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                    Order Market Scan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </a>
                <Link href="/discover" className="block mt-2">
                  <button className="btn-cosmic btn-cosmic-ghost w-full text-sm">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>

          </StaggerChildren>

          <AnimateOnScroll variant="fade" delay={400}>
            <div className="mt-12 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-white/70">
                <Shield className="h-4 w-4" />
                <span>100% satisfaction guarantee — full refund if not actionable</span>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <WaveDivider />

      {/* ===== FAQ ===== */}
      <FAQSection />

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        <Aurora />
        <Stars count={100} />
        <Waveform className="opacity-40" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <h2
              className="font-heading font-bold text-white mx-auto max-w-3xl leading-tight"
              style={{ fontSize: 'clamp(1.75rem, 4vw + 0.5rem, 3rem)' }}
            >
              Your next great program is hiding in the noise.
              <br className="hidden sm:block" />
              <span className="text-gradient-cosmic">We&apos;ll tune you in.</span>
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
              <a href="mailto:hello@withwavelength.com?subject=Market%20Scan%20Order&body=College%20name%3A%20%0ACity%2C%20State%3A%20">
                <button className="btn-cosmic btn-cosmic-ghost text-base px-8 py-4">
                  Order a Market Scan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </a>
            </div>
            <p className="mt-6 text-sm text-white/80">
              Questions?{' '}
              <a
                href="mailto:hello@withwavelength.com"
                className="text-white/70 hover:text-white/70 underline underline-offset-4 transition-colors"
              >
                hello@withwavelength.com
              </a>
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== SATELLITE — pointing up toward the stars ===== */}
      <div className="relative py-16 md:py-24 flex justify-center">
        <Satellite />
      </div>
    </div>
  );
}
