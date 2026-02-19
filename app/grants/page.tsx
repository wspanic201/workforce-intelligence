'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Target,
  FileText,
  BarChart3,
  Calendar,
  Search,
  TrendingUp,
  Award,
} from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';

export default function GrantsPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-24 pb-16">
        <Stars count={100} />
        <Aurora className="opacity-75" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">Grant Intelligence</span>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={50} duration={800}>
            <div className="mb-6 mt-4">
              <Link href="/grant-alignment" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gradient-cosmic hover:opacity-80 transition-opacity group">
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                Grant Alignment
              </Link>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)' }}
            >
              Grant Intelligence Scan
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200} duration={800}>
            <p className="mt-6 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed font-medium">
              Tune into funding opportunities your competitors are missing.
            </p>
            <p className="mt-3 text-base md:text-lg text-theme-tertiary max-w-2xl mx-auto leading-relaxed">
              30+ federal and foundation grants scanned, scored for your institution, and ranked into a prioritized action plan — with deadlines, effort estimates, and past award data.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={350} duration={800}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:hello@withwavelength.com?subject=Grant%20Intelligence%20Scan%20Order&body=College%20name%3A%20%0ACity%2C%20State%3A%20%0AProgram%20focus%20areas%3A%20">
                <button className="btn-cosmic btn-cosmic-primary">
                  Order Grant Intelligence Scan — $495
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </a>
              <a href="#how-it-works">
                <button className="btn-cosmic btn-cosmic-ghost">
                  See How It Works
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </a>
            </div>
            <p className="mt-4 text-sm text-theme-muted">
              Founding rate — $495 now, $995 at standard pricing. We&apos;ll follow up within 48 hours.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== OUTCOME STATEMENT ===== */}
      <section className="relative py-14">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <div className="card-cosmic rounded-2xl p-8 md:p-10">
              <h2
                className="font-heading font-bold text-theme-primary"
                style={{ fontSize: 'clamp(1.4rem, 2.5vw + 0.5rem, 2rem)' }}
              >
                Know exactly which grants to pursue — and which to skip.
              </h2>
              <p className="mt-4 text-theme-tertiary text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                Most colleges either chase every grant (exhausting) or miss them entirely (expensive). The Grant Intelligence Scan gives you a clear, prioritized list matched to your institution&apos;s actual profile, programs, and capacity.
              </p>
              <p className="mt-3 text-theme-tertiary text-sm leading-relaxed max-w-xl mx-auto">
                Grants fund the programs. The right grant strategy pays for new workforce programs before the first student enrolls.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== WHAT'S INCLUDED ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline">What You Get</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-16">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Six deliverables. One prioritized action plan.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: '30+ Grants Scanned',
                desc: 'Federal agencies, DOL programs, foundation grants, and workforce-specific opportunities — all checked against your institution profile.',
                color: 'from-green-500/20 to-emerald-500/20',
                iconColor: 'text-green-400',
              },
              {
                icon: BarChart3,
                title: '5-Dimension Fit Scoring',
                desc: 'Every grant scored on eligibility match, program alignment, award size, competition level, and institutional readiness. No guesswork.',
                color: 'from-blue-500/20 to-cyan-500/20',
                iconColor: 'text-blue-400',
              },
              {
                icon: Award,
                title: 'Past Award Research',
                desc: 'Who won these grants before? Award amounts, recipient profiles, and what made them competitive — so you know what it actually takes.',
                color: 'from-purple-500/20 to-violet-500/20',
                iconColor: 'text-purple-400',
              },
              {
                icon: FileText,
                title: 'Requirements Analysis',
                desc: 'Full breakdown of application requirements for your top opportunities: eligibility rules, narrative requirements, match obligations, and compliance conditions.',
                color: 'from-orange-500/20 to-amber-500/20',
                iconColor: 'text-orange-400',
              },
              {
                icon: Calendar,
                title: 'Deadline Tracking',
                desc: 'Every grant organized by deadline with a realistic effort estimate. You see exactly what to work on now and what can wait.',
                color: 'from-pink-500/20 to-rose-500/20',
                iconColor: 'text-pink-400',
              },
              {
                icon: Target,
                title: 'Prioritized Action Plan',
                desc: 'A clear stack-ranked list of which grants to pursue, in what order, with strategic notes on positioning and how to strengthen your application.',
                color: 'from-teal-500/20 to-emerald-500/20',
                iconColor: 'text-teal-400',
              },
            ].map(({ icon: Icon, title, desc, color, iconColor }) => (
              <div key={title} className="card-cosmic rounded-xl p-6">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <h3 className="font-heading font-semibold text-theme-primary mb-2">{title}</h3>
                <p className="text-theme-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-20 md:py-28" id="how-it-works">
        <div className="max-w-[800px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline">The Process</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-16">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              From submission to action plan in one week.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={150} variant="fade-up" className="space-y-6">
            {[
              {
                step: '01',
                title: 'Submit your college profile',
                desc: 'Tell us about your institution — programs, region, strategic priorities, and capacity. A short intake form takes under 10 minutes.',
                accent: 'text-green-400',
              },
              {
                step: '02',
                title: 'We scan 30+ grant databases',
                desc: 'We research federal agencies (DOL, ED, NSF, HHS and more), private foundations, and workforce-specific programs. Every opportunity is checked for eligibility and fit.',
                accent: 'text-blue-400',
              },
              {
                step: '03',
                title: 'Get your prioritized report',
                desc: 'A ranked list of your best grant opportunities, complete with scoring, past award data, requirements analysis, deadlines, and strategic recommendations. Delivered as a professional PDF report.',
                accent: 'text-purple-400',
              },
            ].map(({ step, title, desc, accent }) => (
              <div key={step} className="flex gap-6 p-6 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex-shrink-0">
                  <span className={`font-mono text-2xl font-bold ${accent}`}>{step}</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-theme-primary mb-2">{title}</h3>
                  <p className="text-theme-secondary text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== SAMPLE STATS ===== */}
      <section className="relative py-16">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="card-cosmic rounded-2xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-theme-subtle">
                <h3 className="text-xs font-medium uppercase tracking-widest text-theme-secondary mb-6">
                  What a Grant Intelligence Scan delivers
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { stat: '30+', label: 'Grants Scanned', color: 'text-green-400' },
                    { stat: '5-dim', label: 'Fit Scoring', color: 'text-blue-400' },
                    { stat: '5–9', label: 'Top Opportunities', color: 'text-purple-400' },
                    { stat: '1 wk', label: 'Turnaround', color: 'text-teal-400' },
                  ].map(({ stat, label, color }) => (
                    <div key={label} className="text-center">
                      <div className={`font-heading font-bold text-3xl md:text-4xl ${color} mb-1`}>{stat}</div>
                      <div className="text-theme-tertiary text-xs uppercase tracking-widest">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample grant ranking preview */}
              <div className="p-6 md:p-8">
                <h3 className="text-xs font-medium uppercase tracking-widest text-theme-secondary mb-4">
                  Sample — Top Opportunities (ranked by fit score)
                </h3>
                <div className="space-y-2">
                  {[
                    { name: 'TAACCCT Workforce Training Grants (DOL)', score: 9.1, tag: 'Pursue Now', color: 'text-green-300', bg: 'bg-green-500/[0.03] border-green-500/[0.08]' },
                    { name: 'Trade Adjustment Assistance Community College (ED)', score: 8.7, tag: 'Pursue Now', color: 'text-green-300', bg: 'bg-green-500/[0.03] border-green-500/[0.08]' },
                    { name: 'Strengthening Community Colleges (NSF)', score: 8.2, tag: 'High Priority', color: 'text-blue-300', bg: 'bg-blue-500/[0.03] border-blue-500/[0.08]' },
                    { name: 'Rural Health Workforce Initiative (HHS)', score: 7.8, tag: 'High Priority', color: 'text-blue-300', bg: 'bg-blue-500/[0.03] border-blue-500/[0.08]' },
                    { name: 'Regional Innovation Clusters (EDA)', score: 7.4, tag: 'Monitor', color: 'text-theme-muted', bg: 'bg-white/[0.02] border-white/[0.04]' },
                  ].map((g) => (
                    <div key={g.name} className={`flex items-center justify-between py-2.5 px-4 rounded-lg ${g.bg} border`}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-theme-secondary text-sm">{g.name}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-theme-muted">
                          <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                          {g.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-14 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                            style={{ width: `${(g.score / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-theme-secondary text-sm font-mono w-7 text-right">{g.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-theme-muted text-xs mt-4 text-center">
                  Illustrative example — actual results scanned and scored for your specific institution
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== WHY THIS MATTERS ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Grants fund the programs. A clear scan saves weeks.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="space-y-6">
            {[
              {
                title: 'Every claim is sourced',
                desc: 'Past award data comes from USASpending.gov, agency award databases, and foundation grant records — not guesswork. Your grants team can verify every number.',
              },
              {
                title: 'Matched to your actual profile',
                desc: 'Generic grant lists are useless. We match against your institution type, location, student population, existing programs, and strategic priorities. Only real opportunities make the list.',
              },
              {
                title: 'Scored on what actually matters',
                desc: 'Five scoring dimensions: eligibility match, program alignment, award size potential, competition level, and institutional readiness. You see exactly why each grant ranks where it does.',
              },
              {
                title: 'Built for action, not the filing cabinet',
                desc: 'Every top opportunity includes requirements analysis, effort estimates, and strategic positioning notes. This is a decision document — you know what to do next before the report is two pages in.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-4">
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
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
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <span className="overline">Pricing</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              One scan. Clear ROI.
            </h2>
            <p className="text-theme-secondary mt-3 max-w-xl mx-auto">
              A single grant award often covers $250,000–$2,000,000 in program funding. The scan pays for itself if it helps you win one.
            </p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Founding tier */}
            <AnimateOnScroll variant="scale" delay={100}>
              <div className="card-cosmic rounded-2xl p-8 md:p-10 text-center border-green-500/20 h-full flex flex-col relative">
                <div>
                  <h3 className="font-heading font-bold text-theme-primary text-xl mb-2">Grant Intelligence Scan</h3>
                  <p className="text-theme-secondary text-sm mb-5">
                    30+ grants scanned, scored, and ranked for your institution.
                  </p>

                  <div className="mb-1">
                    <span className="font-heading font-bold text-4xl text-theme-primary">$495</span>
                    <span className="text-theme-secondary text-sm ml-2 line-through">$995</span>
                  </div>
                  <p className="text-theme-secondary text-xs mb-5">Founding rate — limited availability</p>

                  <ul className="text-left max-w-xs mx-auto space-y-3 mb-7 flex-1">
                    {[
                      '30+ federal & foundation grants scanned',
                      '5-dimension fit scoring for each grant',
                      'Past award recipient research',
                      'Requirements analysis for top opportunities',
                      'Deadline tracking & effort estimates',
                      'Prioritized action plan with strategic notes',
                      'Delivered as a professional PDF report',
                      'Turnaround in ~1 week',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-theme-secondary">
                        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <a href="mailto:hello@withwavelength.com?subject=Grant%20Intelligence%20Scan%20Order&body=College%20name%3A%20%0ACity%2C%20State%3A%20%0AProgram%20focus%20areas%3A%20">
                    <button className="btn-cosmic btn-cosmic-primary w-full sm:w-auto">
                      Order Grant Intelligence Scan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </a>
                  <p className="text-theme-secondary text-xs mt-3">
                    We&apos;ll follow up within 48 hours.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Standard tier */}
            <AnimateOnScroll variant="scale" delay={200}>
              <div className="card-cosmic rounded-2xl p-8 md:p-10 text-center border-theme-base h-full flex flex-col">
                <p className="label-brand mb-5 text-center">
                  <span className="text-gradient-cosmic">∿ ·</span> Standard Pricing
                </p>

                <h3 className="font-heading font-bold text-theme-primary text-xl mb-2">Grant Intelligence Scan</h3>
                <p className="text-theme-secondary text-sm mb-5">
                  Same complete scan at the standard rate after founding slots fill.
                </p>

                <div className="mb-5">
                  <span className="font-heading font-bold text-4xl text-theme-primary">$995</span>
                </div>

                <ul className="text-left max-w-xs mx-auto space-y-3 mb-7 flex-1">
                  {[
                    'Everything in the Founding Scan',
                    'Available after founding slots fill',
                    'Same 1-week turnaround',
                    'Same deliverables and quality',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-theme-secondary">
                      <CheckCircle2 className="h-4 w-4 text-theme-muted flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <a href="mailto:hello@withwavelength.com?subject=Grant%20Intelligence%20Scan%20Inquiry">
                  <button className="btn-cosmic btn-cosmic-ghost w-full sm:w-auto">
                    Get Notified When Available
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </a>
                <p className="text-theme-muted text-xs mt-3">
                  Lock in the founding rate now — $495
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ===== UPSELLS ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline">Ready to Go Further?</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-12">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              From scan to submission — we can help.
            </h2>
            <p className="text-theme-secondary mt-3 max-w-xl mx-auto">
              The Grant Intelligence Scan identifies your opportunities. If you want help actually pursuing them, Wavelength offers two ways to go deeper.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="grid md:grid-cols-2 gap-6">
            {/* Grant Application Package */}
            <div className="card-cosmic rounded-2xl p-8 border-purple-500/20 flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="font-heading font-semibold text-theme-primary text-lg mb-1">Grant Application Package</h3>
              <p className="text-purple-300/80 text-sm font-semibold mb-3">$3,500 – $7,500</p>
              <p className="text-theme-tertiary text-sm leading-relaxed mb-4">
                We help write and assemble the full grant application — so your team can focus on running the college, not writing narrative prose.
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {[
                  'Professional grant writing & narrative drafting',
                  'Budget development & justification',
                  'Letters of support coordination',
                  'Compliance review & final assembly',
                  'Submission-ready application package',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-theme-secondary">
                    <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@withwavelength.com?subject=Grant%20Application%20Package%20Inquiry">
                <button className="btn-cosmic btn-cosmic-ghost text-sm w-full">
                  Ask About Grant Writing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </a>
            </div>

            {/* Grant Monitoring Retainer */}
            <div className="card-cosmic rounded-2xl p-8 border-teal-500/20 flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5 text-teal-400" />
              </div>
              <h3 className="font-heading font-semibold text-theme-primary text-lg mb-1">Grant Monitoring Retainer</h3>
              <p className="text-teal-300/80 text-sm font-semibold mb-3">$1,500 – $3,000 / month</p>
              <p className="text-theme-tertiary text-sm leading-relaxed mb-4">
                Never miss a grant deadline again. We monitor continuously for new opportunities and keep your pipeline up to date.
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {[
                  'Continuous scanning for new opportunities',
                  'Deadline tracking & calendar management',
                  'Monthly opportunity briefings',
                  'Quarterly grant strategy sessions',
                  'Priority alerts for high-fit opportunities',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-theme-secondary">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@withwavelength.com?subject=Grant%20Monitoring%20Retainer%20Inquiry">
                <button className="btn-cosmic btn-cosmic-ghost text-sm w-full">
                  Ask About Monitoring
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </a>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ===== WHAT HAPPENS NEXT ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[800px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              The full Wavelength toolkit
            </h2>
            <p className="text-theme-secondary mt-3">
              Grants fund the programs. Programs need market intelligence and validation before they launch.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="space-y-4">
            {[
              {
                stage: '→',
                name: 'Pell Readiness Check',
                href: '/pell',
                desc: 'Free assessment of your programs\' Workforce Pell eligibility before the July 2026 deadline.',
                tag: 'Free',
              },
              {
                stage: '→',
                name: 'Program Opportunity Scan',
                href: '/discover',
                desc: '25+ page market intelligence report — scored program opportunities, employer demand signals, and grant alignment. Identifies the programs worth funding.',
                tag: '$1,500',
              },
              {
                stage: '→',
                name: 'Program Validation',
                href: '/validate',
                desc: 'Deep-dive feasibility with financial projections, employer verification, and a GO / NO-GO recommendation.',
                tag: '$2,000',
              },
            ].map(({ stage, name, href, desc, tag }) => (
              <Link key={name} href={href}>
                <div className="flex gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-theme-subtle transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-sm text-theme-secondary">{stage}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-theme-primary text-sm group-hover:text-theme-primary transition-colors">{name}</h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-theme-muted">
                        <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                        {tag}
                      </span>
                    </div>
                    <p className="text-theme-secondary text-sm">{desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════ CROSS-SELL ═══════════════ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-theme-muted">Where to go next</span>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimateOnScroll variant="fade-up" delay={100}>
              <Link href="/market-research" className="block card-cosmic rounded-2xl p-7 border-violet-500/20 hover:bg-white/[0.03] transition-colors group h-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading font-bold text-theme-primary text-lg">Program Opportunity Scan</h3>
                  <span className="text-xs font-semibold text-theme-muted">$1,500</span>
                </div>
                <p className="text-theme-secondary text-sm mb-4">Discover 7–10 validated program opportunities for your region — scored, ranked, and backed by real employer demand.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-300 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={200}>
              <Link href="/program-development" className="block card-cosmic rounded-2xl p-7 border-emerald-500/20 hover:bg-white/[0.03] transition-colors group h-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading font-bold text-theme-primary text-lg">Program Validation</h3>
                  <span className="text-xs font-semibold text-theme-muted">$2,000</span>
                </div>
                <p className="text-theme-secondary text-sm mb-4">Validate a specific program idea with a full financial model, competitive analysis, and Go/No-Go recommendation.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-300 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <Stars count={30} />
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Start tuning in to your funding landscape.
            </h2>
            <p className="mt-4 text-theme-tertiary text-lg leading-relaxed">
              30+ grants scanned. Your best opportunities ranked. A clear action plan in one week.
            </p>
            <div className="mt-8">
              <a href="mailto:hello@withwavelength.com?subject=Grant%20Intelligence%20Scan%20Order&body=College%20name%3A%20%0ACity%2C%20State%3A%20%0AProgram%20focus%20areas%3A%20">
                <button className="btn-cosmic btn-cosmic-primary text-base py-3 px-8">
                  Order Grant Intelligence Scan — $495
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </a>
            </div>
            <p className="mt-4 text-sm text-theme-muted">
              Founding rate. We&apos;ll reach out within 48 hours to kick things off.
            </p>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
