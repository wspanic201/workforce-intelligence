'use client';

import Link from 'next/link';
import { Check, Shield, ArrowRight, Zap, Database, TrendingUp } from 'lucide-react';
import {
  AnimateOnScroll,
  StaggerChildren,
} from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { Pipeline } from '@/components/cosmic/Pipeline';

export default function HomePage() {
  return (
    <div className="overflow-x-hidden bg-[#050510]">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16">
        {/* Background layers */}
        <Stars count={250} />
        <Aurora />

        {/* Content */}
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl"
              style={{ fontSize: 'clamp(2.75rem, 6vw + 0.5rem, 5rem)' }}
            >
              See what others can&apos;t.
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={150} duration={800}>
            <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
              Program intelligence for the full lifecycle.
            </p>
            <p className="mt-3 text-base md:text-lg text-white/45 max-w-2xl mx-auto leading-relaxed">
              Find what to build. Validate the market. Design the curriculum. Launch with confidence. Every finding sourced. Every decision backed by data.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={300} duration={800}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#pricing">
                <button className="btn-cosmic btn-cosmic-primary">
                  Get Your Discovery Brief
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link href="#report-preview">
                <button className="btn-cosmic btn-cosmic-ghost">
                  See Sample Report
                </button>
              </Link>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={450} duration={800}>
            <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { value: '74+', label: 'live data sources' },
                { value: '25+', label: 'page brief' },
                { value: '100%', label: 'cited & sourced' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="font-heading font-bold text-2xl md:text-3xl text-gradient-cosmic">
                    {value}
                  </div>
                  <p className="text-white/40 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== PIPELINE SECTION ===== */}
      <section className="relative py-20 md:py-32" id="how-it-works">
        <div className="max-w-[1400px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline">The Platform</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-6">
            <h2
              className="font-heading font-bold text-white mx-auto max-w-3xl"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              The full lifecycle — from program discovery through launch.
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200} className="text-center mb-16">
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Every stage delivers standalone value.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={300}>
            <Pipeline />
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== REPORT PREVIEW / PROOF ===== */}
      <section className="relative py-20 md:py-32" id="report-preview">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-16">
            <h2
              className="font-heading font-bold text-white mx-auto max-w-3xl"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              This is what invisible looks like
              <br className="hidden sm:block" />
              <span className="text-gradient-cosmic">when you can finally see it.</span>
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll variant="scale" delay={100}>
            <div className="max-w-4xl mx-auto card-cosmic rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-white/[0.06]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-white/40 mb-1">
                      Discovery Brief
                    </p>
                    <p className="font-heading font-semibold text-white text-xl">
                      Wake Technical Community College
                    </p>
                    <p className="text-white/40 text-sm mt-0.5">
                      Research Triangle — Raleigh, Durham, Chapel Hill, Cary
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/30">
                    <Database className="h-4 w-4" />
                    <span>74 data sources</span>
                    <span className="mx-1">·</span>
                    <TrendingUp className="h-4 w-4" />
                    <span>~25 pages</span>
                  </div>
                </div>
              </div>

              {/* Top Programs */}
              <div className="p-6 md:p-8 border-b border-white/[0.06]">
                <h3 className="text-xs font-medium uppercase tracking-widest text-white/40 mb-4">
                  Top Opportunities — Scored & Ranked
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      name: 'Biologics Manufacturing Quality Systems',
                      score: 9.05,
                      badge: 'Blue Ocean',
                    },
                    {
                      name: 'Healthcare Management Certificate',
                      score: 8.7,
                      badge: null,
                    },
                    {
                      name: 'Educational Facilities Operations Specialist',
                      score: 8.55,
                      badge: 'Blue Ocean',
                    },
                    {
                      name: 'Construction Management Certificate',
                      score: 8.5,
                      badge: null,
                    },
                  ].map((program) => (
                    <div
                      key={program.name}
                      className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-white/80 text-sm font-medium">
                          {program.name}
                        </span>
                        {program.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cosmic-teal/20 text-teal-300 border border-teal-500/20">
                            {program.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{
                              width: `${(program.score / 10) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-white/60 text-sm font-mono w-8 text-right">
                          {program.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
                {[
                  { value: '13', label: 'opportunities found' },
                  { value: '20+', label: 'employers researched' },
                  { value: '8', label: 'competitors mapped' },
                ].map(({ value, label }) => (
                  <div key={label} className="p-4 md:p-6 text-center">
                    <div className="font-heading font-bold text-xl text-gradient-cosmic">
                      {value}
                    </div>
                    <p className="text-white/30 text-xs mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="p-6 md:p-8 border-t border-white/[0.06] flex justify-center">
                <button className="btn-cosmic btn-cosmic-ghost text-sm">
                  Download Sample Brief
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="relative py-20 md:py-32" id="pricing">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline">Pricing</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-4">
            <h2
              className="font-heading font-bold text-white"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Transparent pricing. No &ldquo;contact us&rdquo; games.
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200} className="text-center mb-16">
            <p className="text-white/50 text-lg">
              🚀 Founding rates — first 5 institutions only
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={150} variant="fade-up" className="grid lg:grid-cols-3 gap-8 mx-auto max-w-5xl items-start">
            {/* Tier 1 — Discovery Brief */}
            <div className="card-cosmic rounded-2xl p-8">
              <h3 className="font-heading font-semibold text-white text-lg">
                Discovery Brief
              </h3>
              <p className="text-white/40 text-sm mt-1">
                What should you build?
              </p>
              <div className="mt-5 mb-1">
                <span className="font-heading font-bold text-4xl text-gradient-cosmic">
                  $1,500
                </span>
                <span className="text-white/30 text-sm ml-2 line-through">
                  $3,500
                </span>
              </div>
              <p className="text-xs text-white/30 mb-6">Founding rate</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Regional market intelligence',
                  'Demand signal analysis',
                  'Competitive landscape',
                  'Blue Ocean opportunities',
                  'Grant alignment',
                  'Scored & ranked programs',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-cosmic-teal flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-white/60">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="btn-cosmic btn-cosmic-ghost w-full text-sm">
                Get Started
              </button>
            </div>

            {/* Tier 2 — Discovery + Validation (POPULAR) */}
            <div className="card-cosmic rounded-2xl p-8 relative border-purple-500/20 lg:-mt-4 lg:mb-[-1rem]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/20">
                  Most Popular
                </span>
              </div>
              <div className="mt-2">
                <h3 className="font-heading font-semibold text-white text-lg">
                  Discovery + Validation
                </h3>
                <p className="text-white/40 text-sm mt-1">
                  Should you build it?
                </p>
                <div className="mt-5 mb-1">
                  <span className="font-heading font-bold text-4xl text-gradient-cosmic">
                    $2,000
                  </span>
                  <span className="text-white/30 text-sm ml-2 line-through">
                    $4,500
                  </span>
                </div>
                <p className="text-xs text-white/30 mb-6">Founding rate</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Discovery, plus:',
                  'Deep market validation',
                  'Financial projections',
                  'Regulatory analysis',
                  'Employer demand verification',
                  'Implementation roadmap',
                  'GO/NO-GO recommendation',
                ].map((item, i) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                        i === 0 ? 'text-purple-400' : 'text-cosmic-teal'
                      }`}
                      strokeWidth={2}
                    />
                    <span
                      className={`text-sm ${
                        i === 0
                          ? 'text-purple-300 font-medium'
                          : 'text-white/60'
                      }`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            {/* Tier 3 — Full Lifecycle */}
            <div className="card-cosmic rounded-2xl p-8">
              <h3 className="font-heading font-semibold text-white text-lg">
                Full Lifecycle
              </h3>
              <p className="text-white/40 text-sm mt-1">
                Build it right.
              </p>
              <div className="mt-5 mb-1">
                <span className="font-heading font-bold text-4xl text-gradient-cosmic">
                  $3,000
                </span>
                <span className="text-white/30 text-sm ml-2 line-through">
                  $6,500
                </span>
              </div>
              <p className="text-xs text-white/30 mb-6">Founding rate</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything above, plus:',
                  'Curriculum architecture',
                  'Pathway mapping',
                  'Marketing strategy',
                  'Launch plan',
                  'Quality framework',
                ].map((item, i) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                        i === 0 ? 'text-purple-400' : 'text-cosmic-teal'
                      }`}
                      strokeWidth={2}
                    />
                    <span
                      className={`text-sm ${
                        i === 0
                          ? 'text-purple-300 font-medium'
                          : 'text-white/60'
                      }`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <button className="btn-cosmic btn-cosmic-ghost w-full text-sm">
                Get Started
              </button>
            </div>
          </StaggerChildren>

          {/* Under $5K note */}
          <AnimateOnScroll variant="fade" delay={400}>
            <div className="mt-12 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-white/60">
                  All founding tier prices are under Dean-level purchase authority.{' '}
                  <span className="text-white/80 font-medium">
                    No Board approval needed.
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                <Shield className="h-4 w-4" />
                <span>
                  100% satisfaction guarantee — full refund if not actionable
                </span>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== FOUNDER SECTION ===== */}
      <section className="relative py-20 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <AnimateOnScroll variant="fade-up">
              <div className="card-cosmic rounded-2xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Photo placeholder */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/[0.06] flex items-center justify-center">
                      <span className="text-white/20 text-xs font-medium text-center">
                        [FOUNDER<br />PHOTO]
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2
                      className="font-heading font-bold text-white mb-4"
                      style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}
                    >
                      Built by someone who&apos;s been in your shoes.
                    </h2>
                    <p className="text-white/50 leading-relaxed mb-4">
                      15 years of building workforce programs at a community college.
                      I got tired of guessing what to build next. So I built the thing I
                      wish I&apos;d had — an AI system that sees the full market picture in
                      days, not months.
                    </p>
                    <p className="text-white/50 leading-relaxed">
                      The first Discovery Brief I ran found a $2M opportunity that every
                      competitor had missed. That&apos;s when I knew this needed to exist
                      for every college, not just mine.
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        {/* Aurora background */}
        <Aurora />
        <Stars count={100} />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <h2
              className="font-heading font-bold text-white mx-auto max-w-3xl leading-tight"
              style={{ fontSize: 'clamp(1.75rem, 4vw + 0.5rem, 3rem)' }}
            >
              Your next great program is hiding in plain sight.
              <br className="hidden sm:block" />
              <span className="text-gradient-cosmic">Let&apos;s find it.</span>
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="mt-10">
              <Link href="#pricing">
                <button className="btn-cosmic btn-cosmic-primary text-base px-10 py-4">
                  Get Your Discovery Brief
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/30">
              Questions?{' '}
              <a
                href="mailto:hello@workforceintel.com"
                className="text-white/50 hover:text-white/70 underline underline-offset-4 transition-colors"
              >
                hello@workforceintel.com
              </a>
            </p>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
