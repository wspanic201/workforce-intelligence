'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  Mail,
  ChevronRight,
  GraduationCap,
  BarChart3,
  FileSearch,
  ListChecks,
  TrendingUp,
  FileText,
  AlertCircle,
  Users,
  DollarSign,
  Zap,
} from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { Waveform } from '@/components/cosmic/Waveform';

// ── Wave Divider ──

function WaveDivider() {
  return (
    <div className="w-full overflow-hidden py-6" aria-hidden="true">
      <svg
        viewBox="0 0 1200 60"
        className="w-full h-10 opacity-[0.15]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="pell-wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <path
          d="M0,30 C100,10 200,50 300,30 C400,10 500,50 600,30 C700,10 800,50 900,30 C1000,10 1100,50 1200,30"
          fill="none"
          stroke="url(#pell-wave-gradient)"
          strokeWidth="2.5"
        />
        <path
          d="M0,30 C100,10 200,50 300,30 C400,10 500,50 600,30 C700,10 800,50 900,30 C1000,10 1100,50 1200,30"
          fill="none"
          stroke="url(#pell-wave-gradient)"
          strokeWidth="1"
          opacity="0.4"
          transform="translate(0, 6)"
        />
      </svg>
    </div>
  );
}

// ── Section Label ──

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="overline inline-flex items-center gap-3">
      <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/50" />
      {children}
      <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-teal-500/50" />
    </span>
  );
}

// ── Data ──

const WHAT_YOU_GET = [
  {
    icon: FileSearch,
    title: 'Full Program Catalog Review',
    description:
      "Every short-term program in your catalog evaluated against Workforce Pell's clock-hour and duration thresholds.",
  },
  {
    icon: Clock,
    title: 'Clock-Hour & Duration Check',
    description:
      'We flag programs that fall short of the 150–599 clock-hour range or outside the 8–15 week window — and those that need minor adjustments to qualify.',
  },
  {
    icon: BarChart3,
    title: 'Pell Eligibility Scoring',
    description:
      'Each program scored against both state criteria (high-skill occupation, employer demand, stackable credentials) and federal criteria (completion, placement, earnings).',
  },
  {
    icon: AlertCircle,
    title: 'Gap Identification',
    description:
      "Programs you should consider adding — high-demand occupations in your region that qualify for Pell and aren't in your catalog yet.",
  },
  {
    icon: Users,
    title: 'Competitive Readiness Comparison',
    description:
      "How your institution's Pell-eligible footprint stacks up against comparable colleges in your region.",
  },
  {
    icon: ListChecks,
    title: 'Summary Report & Next Steps',
    description:
      'A prioritized action plan — which programs to submit for Pell eligibility first, which need structural changes, and which are ready to go on Day 1.',
  },
];

const WHY_ACT_NOW = [
  {
    icon: Clock,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    title: 'July 1, 2026 is the starting line',
    description:
      'Institutions must have eligible programs designated before the deadline. That process takes time — curriculum review, state approval, federal submission. The window to prepare is now.',
  },
  {
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'First-movers capture the students',
    description:
      "Pell-eligible students will search for qualifying programs. Colleges that are ready on Day 1 will show up. Colleges that aren't ready will watch those students enroll somewhere else.",
  },
  {
    icon: GraduationCap,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
    title: 'Enrollment impact is immediate',
    description:
      'Short-term programs are price-sensitive. Pell eligibility removes the biggest barrier for working adults — cost. Qualifying programs routinely see enrollment lift once Pell is available.',
  },
  {
    icon: DollarSign,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: '$200K–$500K+ per eligible program',
    description:
      'Each Pell-eligible program that fills cohorts generates significant new federal aid revenue. Multiply that across your catalog — the financial upside is substantial.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Tell Us Your Institution',
    description:
      'Email us your college name and state. We locate your current program catalog and document every short-term offering you list.',
  },
  {
    step: '02',
    title: 'We Evaluate Against Pell Criteria',
    description:
      'Our team cross-references your programs against federal clock-hour thresholds, state high-skill/high-wage occupation lists, completion and placement benchmarks, and earnings data.',
  },
  {
    step: '03',
    title: 'Get Your Readiness Report in 48 Hours',
    description:
      'You receive a complete Pell Readiness Check — which programs qualify, which need changes, and exactly what steps to take before July 1, 2026.',
  },
];

const DELIVERABLES = [
  'Complete program catalog reviewed against Pell criteria',
  'Clock-hour and duration compliance assessment',
  'State eligibility criteria scoring (per program)',
  'Federal criteria scoring (completion, placement, earnings)',
  'Gap analysis — programs you should add',
  'Competitive readiness comparison',
  'Prioritized next-steps action plan',
];

const UPSELL_PRODUCTS = [
  {
    name: 'Compliance Gap Report',
    price: '$295',
    description:
      "Find every state-mandated training program your institution doesn't offer — sized by revenue, cited to the statute.",
    href: '/compliance-gap',
    color: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/20',
  },
  {
    name: 'Market Scan',
    price: '$1,500',
    description:
      'Full market intelligence before you build — 25+ pages of scored opportunities, employer demand signals, competitive gaps, and grant alignment.',
    href: '/discover',
    color: 'from-teal-500/20 to-teal-500/5',
    border: 'border-teal-500/20',
  },
];

// ── Page ──

const pellProductJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Pell Readiness Check",
  description:
    "Free Pell Readiness Check for community colleges: full program catalog review against Workforce Pell eligibility criteria, gap identification, and prioritized next steps.",
  url: "https://withwavelength.com/pell",
  brand: { "@type": "Brand", name: "Wavelength" },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://withwavelength.com/pell",
  },
};

export default function PellPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pellProductJsonLd) }}
      />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-20">
        <Stars count={150} />
        <Aurora className="opacity-75" />
        <Waveform className="opacity-40" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          {/* Urgency badge */}
          <AnimateOnScroll variant="fade-up" duration={600}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-300 text-sm font-medium tracking-wide">
                July 1, 2026 — Workforce Pell launches
              </span>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={50} duration={800}>
            <div className="mb-6">
              <Link href="/program-analysis" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gradient-cosmic hover:opacity-80 transition-opacity group">
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                Program Analysis
              </Link>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw + 0.5rem, 4.75rem)' }}
            >
              Is your institution Pell ready?
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={220} duration={800}>
            <p className="mt-6 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed">
              Starting July 1, 2026, short-term workforce programs can qualify for federal Pell Grants for the first time in history. This free check tells you exactly which of your programs qualify — and what to do before the deadline.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={340} duration={800}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:hello@withwavelength.com?subject=Pell%20Readiness%20Check">
                <button className="btn-cosmic btn-cosmic-primary text-base px-8 py-4">
                  <Mail className="mr-2 h-4 w-4" />
                  Get Your Free Check
                </button>
              </a>
              <Link href="/report/demo">
                <button className="btn-cosmic btn-cosmic-ghost text-base px-8 py-4">
                  View Sample Report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </AnimateOnScroll>

          {/* Stats */}
          <AnimateOnScroll variant="fade-up" delay={460} duration={800}>
            <div className="mt-14 flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { value: 'Free', label: 'No cost, ever' },
                { value: '48h', label: 'Turnaround' },
                { value: '50+', label: 'Sources verified' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-heading font-black text-gradient-cosmic">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs text-theme-tertiary tracking-widest uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ WHAT IS WORKFORCE PELL? ═══════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <SectionLabel>THE LEGISLATION</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-theme-primary mt-4">
                What is Workforce Pell?
              </h2>
              <p className="mt-5 text-theme-secondary max-w-2xl mx-auto leading-relaxed">
                Bipartisan legislation expanding Pell Grant eligibility to short-term workforce programs — 150 to 599 clock hours, 8 to 15 weeks in length. For the first time, students in career-focused, non-degree programs can access federal grant funding.
              </p>
              <p className="mt-3 text-theme-secondary max-w-2xl mx-auto leading-relaxed">
                Colleges that prepare early will be positioned to enroll Pell-eligible students from Day 1. Those that wait will lose those students to institutions that are ready.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* State Criteria */}
            <AnimateOnScroll variant="fade-left" delay={100}>
              <div className="card-cosmic rounded-xl p-7 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <Star className="h-5 w-5 text-violet-400" />
                  </div>
                  <h3 className="font-heading font-semibold text-theme-primary text-lg">
                    State Criteria
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'High-skill or high-wage occupation',
                    'Demonstrated employer demand',
                    'Stackable credential toward a degree',
                    'Credits that count toward a recognized credential',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-theme-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>

            {/* Federal Criteria */}
            <AnimateOnScroll variant="fade-right" delay={100}>
              <div className="card-cosmic rounded-xl p-7 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
                    <TrendingUp className="h-5 w-5 text-teal-400" />
                  </div>
                  <h3 className="font-heading font-semibold text-theme-primary text-lg">
                    Federal Criteria
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Program offered for at least 1 year',
                    '≥70% student completion rate',
                    '≥70% graduate placement rate',
                    'Graduate earnings exceed the cost of tuition',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-theme-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ WHAT YOU GET ═══════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <SectionLabel>THE DELIVERABLE</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-theme-primary mt-4">
                What you get
              </h2>
              <p className="mt-4 text-theme-secondary max-w-xl mx-auto">
                A complete Pell Readiness Check — specific to your institution's catalog and your state's eligibility landscape.
              </p>
            </div>
          </AnimateOnScroll>

          <StaggerChildren stagger={80}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHAT_YOU_GET.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="card-cosmic p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <Icon className="h-5 w-5 text-violet-400" />
                      </div>
                      <h3 className="font-heading font-semibold text-theme-primary text-base">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-theme-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </StaggerChildren>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ WHY ACT NOW ═══════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <SectionLabel>THE WINDOW</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-theme-primary mt-4">
                Why act now
              </h2>
              <p className="mt-4 text-theme-secondary max-w-xl mx-auto">
                Workforce Pell is one of the most significant shifts in community college funding in decades. The colleges that prepare now will define the competitive landscape for years.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {WHY_ACT_NOW.map((item, idx) => {
              const Icon = item.icon;
              return (
                <AnimateOnScroll key={item.title} variant="fade-up" delay={idx * 80}>
                  <div className="card-cosmic rounded-xl p-7 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg border ${item.bg}`}>
                        <Icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <h3 className="font-heading font-semibold text-theme-primary text-base">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-theme-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <SectionLabel>THE PROCESS</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-theme-primary mt-4">
                How it works
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="space-y-8">
            {HOW_IT_WORKS.map((step, idx) => (
              <AnimateOnScroll key={step.step} variant="fade-left" delay={idx * 100}>
                <div className="card-cosmic rounded-xl p-7 flex gap-6 items-start">
                  <div className="shrink-0 text-4xl font-heading font-black text-gradient-cosmic opacity-40 leading-none">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-theme-primary text-lg mb-2">
                      {step.title}
                    </h3>
                    <p className="text-theme-secondary leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ PRICING ═══════════════ */}
      <section className="relative py-24 px-6">
        <Stars count={60} />

        <div className="max-w-[680px] mx-auto text-center">
          <AnimateOnScroll variant="scale">
            <div className="card-cosmic rounded-2xl p-10 border border-violet-500/20">
              <SectionLabel>PRICING</SectionLabel>

              <div className="flex items-end justify-center gap-2 mt-5 mb-2">
                <span className="text-6xl font-heading font-black text-theme-primary">$0</span>
                <span className="text-theme-secondary mb-3 text-lg">— always free</span>
              </div>
              <p className="text-theme-secondary text-sm mb-8">
                No login. No sales call. Just data.
              </p>

              <div className="space-y-3 mb-10 text-left max-w-sm mx-auto">
                {DELIVERABLES.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-sm text-theme-secondary">{item}</span>
                  </div>
                ))}
              </div>

              <a
                href="mailto:hello@withwavelength.com?subject=Pell%20Readiness%20Check&body=Institution%20Name%3A%0AState%3A%0AWebsite%20(optional)%3A%0A%0AI'd%20like%20a%20free%20Pell%20Readiness%20Check."
                className="block"
              >
                <button className="btn-cosmic btn-cosmic-primary w-full text-base py-4">
                  <Mail className="mr-2 h-4 w-4" />
                  Get Your Free Check — hello@withwavelength.com
                </button>
              </a>

              <p className="mt-5 text-theme-muted text-xs">
                Email us your institution name and state. We handle the rest.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ AFTER YOUR PELL CHECK ═══════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <SectionLabel>WHAT COMES NEXT</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-theme-primary mt-4">
                After your Pell Check
              </h2>
              <p className="mt-4 text-theme-secondary max-w-xl mx-auto">
                The Pell Readiness Check is your starting point. Once you know where you stand, Wavelength can help you move fast.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {UPSELL_PRODUCTS.map((product, idx) => (
              <AnimateOnScroll key={product.name} variant="fade-up" delay={idx * 120}>
                <Link href={product.href} className="block h-full">
                  <div className={`card-cosmic rounded-xl p-7 h-full border ${product.border} bg-gradient-to-br ${product.color} hover:border-theme-strong transition-all group`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-heading font-bold text-theme-primary text-xl">
                        {product.name}
                      </h3>
                      <span className="font-heading font-black text-theme-secondary text-xl shrink-0 ml-4">
                        {product.price}
                      </span>
                    </div>
                    <p className="text-theme-secondary text-sm leading-relaxed mb-5">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-theme-tertiary group-hover:text-theme-secondary transition-colors">
                      <span>Learn more</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CROSS-SELL ═══════════════ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-[800px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Also in Program Analysis</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100}>
            <Link href="/compliance-gap" className="block card-cosmic rounded-2xl p-7 border-blue-500/20 hover:bg-white/[0.03] transition-colors group">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading font-bold text-theme-primary text-lg">Program Gap Audit</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">$295</span>
                  </div>
                  <p className="text-theme-secondary text-sm">Find every state-mandated program your institution isn&apos;t offering — with revenue estimates for each gap.</p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-300 group-hover:gap-2 transition-all flex-shrink-0">
                  Learn More <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════ FOOTER CTA ═══════════════ */}
      <section className="relative py-20 px-6 text-center">
        <Stars count={40} />
        <AnimateOnScroll variant="fade-up">
          <p className="text-theme-tertiary text-sm tracking-widest uppercase mb-3">Ready?</p>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-theme-primary mb-6">
            Get your free Pell Readiness Check today.
          </h2>
          <a href="mailto:hello@withwavelength.com?subject=Pell%20Readiness%20Check">
            <button className="btn-cosmic btn-cosmic-primary text-base px-10 py-4">
              <Mail className="mr-2 h-4 w-4" />
              hello@withwavelength.com
            </button>
          </a>
          <p className="mt-5 text-theme-muted text-sm">
            No login. No sales call. Just data.
          </p>
        </AnimateOnScroll>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="py-10 px-6 text-center border-t border-white/5">
        <p className="text-theme-secondary text-sm">
          Wavelength Workforce Intelligence ·{' '}
          <a
            href="mailto:hello@withwavelength.com"
            className="hover:text-theme-secondary transition-colors"
          >
            hello@withwavelength.com
          </a>
        </p>
        <p className="mt-2 text-theme-muted text-xs">
          Pell Readiness Check is a research deliverable based on publicly available federal and state regulatory data. It does not constitute legal or compliance advice.
        </p>
      </footer>
    </div>
  );
}
