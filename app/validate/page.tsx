'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Building2,
  Shield,
  Swords,
  Map,
  Flag,
  BarChart3,
  Briefcase,
  Scale,
  BookOpen,
  Users,
} from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { Waveform } from '@/components/cosmic/Waveform';

export default function ValidatePage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">

      {/* ===== HERO ===== */}
      <section className="relative min-h-[75vh] flex items-center justify-center pt-36 lg:pt-40 pb-16 overflow-hidden">
        <Stars count={100} />
        <Aurora className="opacity-75" />
        <Waveform className="opacity-40" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">Stage 2</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={50} duration={800}>
            <div className="mb-6">
              <Link href="/program-development" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gradient-cosmic hover:opacity-80 transition-opacity group">
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                Program Development
              </Link>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)' }}
            >
              Feasibility Report
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200} duration={800}>
            <p className="mt-6 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed font-medium">
              Confirm feasibility before you invest. Before you hire faculty, build curriculum, or seek approval — know with certainty that your program will succeed.
            </p>
            <p className="mt-3 text-base md:text-lg text-theme-tertiary max-w-2xl mx-auto leading-relaxed">
              Seven specialist analyses. Financial projections grounded in comparable program data. A definitive GO&nbsp;/&nbsp;NO-GO recommendation — not a maybe.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={350} duration={800}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="btn-cosmic btn-cosmic-primary">
                  Start Validation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link href="/discover">
                <button className="btn-cosmic btn-cosmic-ghost">
                  Start with a Market Scan First
                </button>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-20 md:py-28" id="how-it-works">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">How It Works</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-16">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Seven specialist analyses, working in sequence.
            </h2>
            <p className="text-theme-secondary mt-3 max-w-xl mx-auto">
              Each discipline produces an independent finding. Together they build the complete picture.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-purple-500/40 via-blue-500/30 to-teal-500/20 hidden md:block" aria-hidden="true" />

            <div className="space-y-4">
              {[
                {
                  icon: TrendingUp,
                  role: 'Market Analyst',
                  desc: 'Verifies employment demand signals, cross-references BLS projections, and quantifies the local hiring pipeline.',
                },
                {
                  icon: DollarSign,
                  role: 'Financial Analyst',
                  desc: 'Builds the 5-year financial model: enrollment curves, tuition modeling, cost structure, break-even point, and ROI benchmarks from comparable programs.',
                },
                {
                  icon: Building2,
                  role: 'Employer Analyst',
                  desc: "Maps the specific employer landscape — not just industry categories. Which companies, how many positions, what wages, and who's open to partnership.",
                },
                {
                  icon: Shield,
                  role: 'Regulatory Analyst',
                  desc: 'Navigates state approval pathways, accreditor requirements, certification body alignments, and scores Workforce Pell grant eligibility.',
                },
                {
                  icon: Swords,
                  role: 'Competitor Analyst',
                  desc: 'Performs a surgical competitive analysis: competitor enrollment data, pricing, program gaps, and positioning vulnerabilities.',
                },
                {
                  icon: Briefcase,
                  role: 'Institutional Fit Analyst',
                  desc: "Evaluates how the program aligns with your college's mission, existing infrastructure, budget capacity, and strategic priorities.",
                },
                {
                  icon: BookOpen,
                  role: 'Implementation Analyst',
                  desc: 'Scopes what the program actually requires to launch: faculty, equipment, space, timeline from approval to first cohort, and realistic startup costs.',
                },
              ].map(({ icon: Icon, role, desc }, i) => (
                <div key={role} className="flex gap-5 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-theme-strong transition-colors">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-theme-strong flex items-center justify-center z-10 relative">
                      <Icon className="h-4 w-4 text-purple-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-theme-muted tracking-widest">0{i + 1}</span>
                      <h3 className="font-heading font-semibold text-theme-primary text-sm">{role}</h3>
                    </div>
                    <p className="text-theme-secondary text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ===== SAMPLE OUTPUT ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">SAMPLE OUTPUT</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-16">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              What your validation looks like
            </h2>
            <p className="text-theme-secondary mt-3 max-w-xl mx-auto">
              Every validation produces a scored assessment across five dimensions — plus a definitive GO&nbsp;/&nbsp;NO-GO recommendation.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="scale" delay={200}>
            <div className="card-cosmic rounded-2xl p-8 md:p-10">
              {/* Program header */}
              <div className="mb-6">
                <h3 className="font-heading font-bold text-theme-primary text-xl">
                  Advanced Cybersecurity Operations Certificate
                </h3>
                <p className="text-theme-tertiary text-sm mt-1">
                  Midwest Community College · Cedar Rapids, IA
                </p>
              </div>

              {/* Score bars */}
              <div className="space-y-3 mb-8">
                {[
                  { label: 'Demand Evidence', score: 8.2, color: 'blue' as const },
                  { label: 'Competitive Gap', score: 7.1, color: 'teal' as const },
                  { label: 'Revenue Viability', score: 8.9, color: 'green' as const },
                  { label: 'Wage Outcomes', score: 7.7, color: 'amber' as const },
                  { label: 'Launch Speed', score: 6.5, color: 'purple' as const },
                ].map((dim) => (
                  <div key={dim.label} className="flex items-center gap-3">
                    <span className="text-xs text-theme-tertiary w-28 shrink-0 text-right">{dim.label}</span>
                    <div className="flex-1 rounded-full bg-white/[0.06] h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          dim.color === 'blue' ? 'from-blue-600 to-blue-400' :
                          dim.color === 'teal' ? 'from-teal-600 to-teal-400' :
                          dim.color === 'green' ? 'from-emerald-600 to-emerald-400' :
                          dim.color === 'amber' ? 'from-amber-600 to-amber-400' :
                          'from-violet-600 to-purple-500'
                        }`}
                        style={{ width: `${(dim.score / 10) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold tabular-nums w-8 text-right ${
                      dim.color === 'blue' ? 'text-blue-400' :
                      dim.color === 'teal' ? 'text-teal-400' :
                      dim.color === 'green' ? 'text-emerald-400' :
                      dim.color === 'amber' ? 'text-amber-400' :
                      'text-violet-400'
                    }`}>
                      {dim.score.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Composite score */}
              <div className="flex items-center justify-between py-4 px-5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6">
                <span className="text-sm font-medium text-theme-secondary">Composite Score</span>
                <span className="font-heading font-black text-2xl text-gradient-cosmic">7.7 / 10</span>
              </div>

              {/* Verdict */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-heading font-bold text-emerald-500 text-lg">
                    GO — Strong market fundamentals with manageable competition
                  </span>
                </div>
                <p className="text-sm text-theme-secondary leading-relaxed pl-[18px]">
                  Regional cybersecurity demand significantly exceeds current training capacity, with employer partnerships readily available and median wages well above program cost thresholds.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== WHAT MAKES THIS DIFFERENT ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">What Makes This Different</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-12">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Not a feasibility study. A decision.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="space-y-6">
            {[
              {
                title: 'Every number is verified',
                desc: "Financial projections are anchored to comparable program data — actual enrollment figures, actual cost structures from programs like yours. No spreadsheet fantasies.",
              },
              {
                title: 'GO / NO-GO, not a maybe',
                desc: "We commit to a recommendation. If the program isn't viable, we say so clearly — and explain exactly why, so you can redirect resources confidently.",
              },
              {
                title: 'Implementation-ready, not theoretical',
                desc: "The roadmap tells you what faculty to hire, what equipment to budget, and what your marketing plan should look like — before you write a single course.",
              },
              {
                title: 'Seven independent analyses, cross-checked',
                desc: "Each specialist works from the same base data but reaches their conclusions independently. Conflicts surface and get resolved. You get a coherent, internally consistent picture.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-4">
                <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading font-semibold text-theme-primary mb-1">{title}</h3>
                  <p className="text-theme-secondary text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="relative py-20 md:py-28" id="pricing">
        <div className="max-w-[700px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Know before you build.
            </h2>
            <p className="text-theme-secondary mt-3">
              One Validation pays for itself if it stops a single failed program — or confirms one that becomes a revenue engine.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="scale" delay={100}>
            <div className="card-cosmic rounded-2xl p-8 md:p-10 text-center">
              <p className="overline mb-4">ONE-TIME VALIDATION</p>
              <p className="label-brand mb-6 text-center">
                <span className="text-gradient-cosmic">∿ ·</span> Founding rate — limited availability
              </p>

              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-3">
                  <span className="font-heading font-black text-6xl text-theme-primary">$2,000</span>
                  <span className="text-theme-secondary text-sm line-through">$5,500</span>
                </div>
                <p className="text-theme-secondary text-sm mt-2">
                  Full Validation — includes Market Scan deliverables
                </p>
              </div>

              <ul className="text-left max-w-sm mx-auto space-y-3 mb-8">
                {[
                  'Everything in Market Scan',
                  'Deep Market Validation',
                  'Full 5-Year Financial Projections',
                  'Employer Demand Verification',
                  'Regulatory & Accreditation Analysis',
                  'Competitive Deep-Dive',
                  'Implementation Roadmap',
                  'GO / NO-GO Recommendation',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-theme-secondary">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/contact">
                <button className="btn-cosmic btn-cosmic-primary w-full sm:w-auto">
                  Start Your Validation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>

              <p className="text-theme-secondary text-xs mt-4">
                Questions?{' '}
                <Link href="/contact" className="underline underline-offset-2 hover:text-theme-primary transition-colors">
                  Contact us
                </Link>{' '}
                — we&apos;ll follow up within 48 hours.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200} className="text-center mt-8">
            <p className="text-theme-tertiary text-sm">
              Delivered as: PDF report + executive summary — typically within 5 business days
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════ CROSS-SELL ═══════════════ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-8">
            <span className="overline">Where to go next</span>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimateOnScroll variant="fade-up" delay={100}>
              <Link href="/market-research" className="block card-cosmic rounded-2xl p-7 border-violet-500/20 hover:bg-white/[0.03] transition-colors group h-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading font-bold text-theme-primary text-lg">Program Finder</h3>
                  <span className="text-xs font-semibold text-theme-muted">$1,500</span>
                </div>
                <p className="text-theme-secondary text-sm mb-4">Discover 7–10 validated program opportunities for your region — scored, ranked, and backed by real employer demand.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-300 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={200}>
              <Link href="/grant-alignment" className="block card-cosmic rounded-2xl p-7 border-green-500/20 hover:bg-white/[0.03] transition-colors group h-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading font-bold text-theme-primary text-lg">Grant Finder</h3>
                  <span className="text-xs font-semibold text-theme-muted">$495</span>
                </div>
                <p className="text-theme-secondary text-sm mb-4">Find and prioritize the grants your programs qualify for — scored, ranked, and ready to pursue.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-300 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

    </div>
  );
}
