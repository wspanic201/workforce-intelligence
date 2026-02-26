'use client';

import Link from 'next/link';
import { ArrowRight, Search, BarChart3, HandCoins, Activity, CheckCircle2 } from 'lucide-react';
import {
  AnimateOnScroll,
  StaggerChildren,
} from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { ParticleConstellation } from '@/components/cosmic/ParticleConstellation';

// ─── Data ────────────────────────────────────────────────────────────────────

const LIFECYCLE_STAGES = [
  {
    stage: '1',
    name: 'Program Finder',
    price: '$1,500',
    available: true,
    href: '/discover',
    description: 'Identify the highest-potential programs for your region — scored, ranked, and backed by real employer demand signals.',
  },
  {
    stage: '2',
    name: 'Feasibility Study',
    price: '$3,000',
    available: true,
    href: '/validate',
    description: 'Seven-specialist feasibility analysis with financial projections and a definitive GO / NO-GO recommendation.',
  },
  {
    stage: '3',
    name: 'Curriculum Design & Development',
    price: null,
    available: false,
    href: null,
    description: 'Competency-mapped curriculum built to employer specs, accreditor standards, and credit-to-clock alignment.',
  },
  {
    stage: '4',
    name: 'Pathway Development',
    price: null,
    available: false,
    href: null,
    description: 'Stackable credential architecture, articulation agreements, and employer partnership frameworks.',
  },
  {
    stage: '5–8',
    name: 'Content · Launch · Quality Control',
    price: null,
    available: false,
    href: null,
    description: 'Full-cycle content production, market launch support, and ongoing program quality assurance.',
  },
];

const ADDONS = [
  {
    name: 'Pell Readiness Check',
    description: 'Score your program against Workforce Pell eligibility criteria before you apply.',
    price: 'Free',
    href: '/pell',
  },
  {
    name: 'Program Gap Audit',
    description: 'Identify compliance gaps, curriculum drift, and accreditor alignment issues in existing programs.',
    price: '$300',
    href: '/compliance-gap',
  },
  {
    name: 'Grant Finder',
    description: 'Federal, state, and foundation grants — researched, scored, and ranked for your institution.',
    price: '$750',
    href: '/grants',
  },
  {
    name: 'Curriculum Drift Analysis',
    description: 'Annual review that flags where course content has fallen behind employer expectations and industry standards.',
    price: '$500',
    href: '/drift',
  },
];

// ─── Category chips for hero ──────────────────────────────────────────────────

const CATEGORY_CHIPS = [
  { label: 'Market Research', href: '/discover', icon: Search },
  { label: 'Program Analysis', href: '/validate', icon: BarChart3 },
  { label: 'Funding & Grants', href: '/grants', icon: HandCoins },
  { label: 'Program Health', href: '/drift', icon: Activity },
];

const PROOF_POINTS = [
  'Used by community college workforce teams',
  'BLS + employer demand + competitor intelligence',
  'Board-ready reports in days, not months',
];

// ─── Static Hero ──────────────────────────────────────────────────────────────

function StaticHero() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-[700px] flex items-center justify-center pt-36 lg:pt-40 pb-16 overflow-hidden">
      <Stars count={120} />
      <Aurora />
      <ParticleConstellation particleCount={30} connectionDistance={90} mouseRadius={120} speed={0.2} />

      <div className="relative z-10 max-w-[860px] mx-auto px-6 w-full text-center">

        {/* Descriptor */}
        <p className="label-brand mb-6">
          Workforce Program Intelligence for Community Colleges
        </p>

        {/* Variant A — Speed / efficiency ("days not months") */}
        <h1
          className="text-gradient-cosmic font-heading font-bold leading-[1.05]"
          style={{ fontSize: 'clamp(2.4rem, 5vw + 0.5rem, 4.2rem)' }}
        >
          Your labor market changed. Did your program portfolio?
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-lg md:text-xl text-theme-secondary leading-relaxed max-w-2xl mx-auto">
          Wavelength helps CE and workforce teams choose the right programs, validate demand, and move with confidence — with clear recommendations, not vague research decks.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/discover">
            <button className="btn-cosmic btn-cosmic-primary text-sm">
              Start with Program Finder
            </button>
          </Link>
          <Link href="/contact">
            <button className="btn-cosmic btn-cosmic-ghost text-sm">
              Book a 20-min Walkthrough
            </button>
          </Link>
        </div>

        {/* Proof points */}
        <div className="mt-8 grid gap-2 max-w-2xl mx-auto text-left">
          {PROOF_POINTS.map((point) => (
            <div key={point} className="flex items-center gap-2 text-sm text-theme-secondary">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <span>{point}</span>
            </div>
          ))}
        </div>

        {/* Category links */}
        <div className="mt-10 flex flex-wrap gap-2 justify-center">
          {CATEGORY_CHIPS.map((chip) => {
            const Icon = chip.icon;
            return (
              <Link
                key={chip.label}
                href={chip.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-theme-secondary text-sm font-medium hover:bg-white/[0.08] hover:border-white/[0.15] hover:text-theme-primary transition-all duration-200"
              >
                <Icon className="h-4 w-4" />
                {chip.label}
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">

      {/* ===== HERO ===== */}
      <StaticHero />

      {/* ===== VALUE PROPS ===== */}
      <section className="relative py-16 md:py-20" id="services">
        <div className="max-w-[980px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-10">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.4rem, 2vw + 0.5rem, 2rem)' }}
            >
              Actionable intelligence for continuing education program decisions.
            </h2>
            <p className="text-theme-secondary mt-3 max-w-2xl mx-auto">
              We do not hand you a generic market report. We give your team clear recommendations, decision-ready scoring, and practical next steps you can take this term.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="card-cosmic rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-theme-primary text-base mb-2">Decision-ready, not just data-heavy</h3>
              <p className="text-theme-secondary text-sm leading-relaxed">Every deliverable ends with ranked opportunities, confidence scoring, and a clear recommended action.</p>
            </div>
            <div className="card-cosmic rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-theme-primary text-base mb-2">Built for CE and workforce teams</h3>
              <p className="text-theme-secondary text-sm leading-relaxed">We focus on noncredit and workforce program development realities: employer demand, speed to launch, and ROI pressure.</p>
            </div>
            <div className="card-cosmic rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-theme-primary text-base mb-2">Defensible with leadership</h3>
              <p className="text-theme-secondary text-sm leading-relaxed">Use board-friendly briefs with labor market evidence, financial framing, and implementation risk flags in one place.</p>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ===== CORE PROGRAM LIFECYCLE ===== */}
      <section className="relative py-20 md:py-28" id="lifecycle">
        <div className="max-w-[860px] mx-auto px-6">

          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">Core Program Intelligence Services</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-16">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Pick your next move
            </h2>
            <p className="text-theme-secondary mt-3 max-w-xl mx-auto">
              Start with opportunity discovery, then pressure-test the winner before you commit budget, staffing, and launch time.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="relative">
            {/* Vertical connector line */}
            <div
              className="absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-purple-500/50 via-blue-500/30 to-teal-500/10 hidden md:block"
              aria-hidden="true"
            />

            <div className="space-y-3">
              {LIFECYCLE_STAGES.map(({ stage, name, price, available, href, description }) => (
                <div
                  key={stage}
                  className={`flex gap-5 p-6 rounded-2xl border transition-colors ${
                    available
                      ? 'bg-theme-card border-theme-base hover:border-theme-strong'
                      : 'bg-white/[0.015] border-theme-subtle opacity-60'
                  }`}
                >
                  {/* Stage number bubble */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-[54px] h-[54px] rounded-full border flex items-center justify-center z-10 relative ${
                        available
                          ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/40'
                          : 'bg-white/[0.03] border-theme-subtle'
                      }`}
                    >
                      <span
                        className={`font-mono text-sm font-bold tracking-tight ${
                          available ? 'text-purple-300' : 'text-theme-muted'
                        }`}
                      >
                        {stage}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <h3
                        className={`font-heading font-semibold text-base leading-snug ${
                          available ? 'text-theme-primary' : 'text-theme-tertiary'
                        }`}
                      >
                        {name}
                      </h3>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {available ? (
                          <span className="font-mono font-bold text-sm text-gradient-cosmic">
                            {price}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-theme-muted tracking-widest uppercase">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>

                    <p
                      className={`text-sm leading-relaxed mb-3 ${
                        available ? 'text-theme-secondary' : 'text-theme-muted'
                      }`}
                    >
                      {description}
                    </p>

                    {available && href && (
                      <Link
                        href={href}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-violet-300 hover:text-violet-200 transition-colors group"
                      >
                        Learn More
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ===== ADD-ON INTELLIGENCE ===== */}
      <section className="relative py-20 md:py-28" id="add-ons">
        <div className="max-w-[960px] mx-auto px-6">

          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">Add-On Intelligence</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-16">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Precision add-ons for real program decisions.
            </h2>
            <p className="text-theme-secondary mt-3 max-w-xl mx-auto">
              Use these standalone or alongside your core engagement when you need sharper answers fast. No subscription required.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ADDONS.map(({ name, description, price, href }) => (
              <Link key={name} href={href} className="block group">
                <div className="card-cosmic rounded-2xl p-7 h-full hover:border-purple-500/30 transition-colors flex flex-col">
                  <h3 className="font-heading font-semibold text-theme-primary text-lg mb-2 group-hover:text-gradient-cosmic transition-colors">
                    {name}
                  </h3>
                  <p className="text-theme-secondary text-sm leading-relaxed flex-1 mb-5">
                    {description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-gradient-cosmic">
                      {price}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-300 group-hover:text-violet-200 transition-colors group-hover:gap-1.5">
                      Learn More
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== MINI SAMPLE SNAPSHOT ===== */}
      <section className="relative py-20 md:py-24" id="sample-snapshot">
        <div className="max-w-[980px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">Sample Snapshot</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.4rem, 2vw + 0.5rem, 2rem)' }}
            >
              What a decision-ready output looks like
            </h2>
            <p className="text-theme-secondary mt-3 max-w-2xl mx-auto">
              Example: Pharmacy Technician program opportunity for a Midwest community college region.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={80}>
            <div className="card-cosmic rounded-2xl p-7 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-theme-base bg-white/[0.02] p-4">
                  <p className="text-theme-muted text-xs uppercase tracking-widest mb-2">Recommendation</p>
                  <p className="text-theme-primary font-semibold">GO — High Confidence</p>
                </div>
                <div className="rounded-xl border border-theme-base bg-white/[0.02] p-4">
                  <p className="text-theme-muted text-xs uppercase tracking-widest mb-2">Regional Demand Signal</p>
                  <p className="text-theme-primary font-semibold">Strong + growing</p>
                </div>
                <div className="rounded-xl border border-theme-base bg-white/[0.02] p-4">
                  <p className="text-theme-muted text-xs uppercase tracking-widest mb-2">Launch Risk</p>
                  <p className="text-theme-primary font-semibold">Moderate (manageable)</p>
                </div>
              </div>

              <div className="rounded-xl border border-theme-base bg-white/[0.02] p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-theme-muted text-xs uppercase tracking-widest">Confidence Score</p>
                  <p className="text-theme-primary text-sm font-semibold">8.4 / 10</p>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div className="h-full w-[84%] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
                </div>
              </div>

              <div className="rounded-xl border border-theme-base bg-white/[0.02] p-4 mb-6">
                <p className="text-theme-muted text-xs uppercase tracking-widest mb-3">Source signals used</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs bg-white/[0.06] border border-theme-subtle text-theme-secondary">BLS wage + projection data</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-white/[0.06] border border-theme-subtle text-theme-secondary">Live employer posting trends</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-white/[0.06] border border-theme-subtle text-theme-secondary">Regional competitor program scan</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-heading font-semibold text-theme-primary mb-2">Key findings</h3>
                  <ul className="space-y-2 text-sm text-theme-secondary">
                    <li>• Employer demand is consistently above local completion volume.</li>
                    <li>• Competitive density is moderate, with room for differentiated delivery.</li>
                    <li>• Wage outcomes support student ROI and state performance narratives.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-theme-primary mb-2">Immediate next steps</h3>
                  <ul className="space-y-2 text-sm text-theme-secondary">
                    <li>• Validate employer advisory partners for clinical pipeline support.</li>
                    <li>• Finalize cohort model and delivery format assumptions.</li>
                    <li>• Move to full feasibility analysis before launch commitment.</li>
                  </ul>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-20 md:py-28">
        <Aurora />
        <Stars count={60} />
        <div className="max-w-[700px] mx-auto px-6 text-center relative z-10">
          <AnimateOnScroll variant="fade-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">Not Sure Where to Start?</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
            <h2
              className="font-heading font-bold text-theme-primary mb-4"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Ready to pick the right next program?
            </h2>
            <p className="text-theme-secondary mb-10 max-w-lg mx-auto">
              Start with Program Finder for a data-backed shortlist, or run the free Pell check if funding eligibility is your immediate priority.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/discover">
                <button className="btn-cosmic btn-cosmic-primary">
                  Start Program Finder
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link href="/pell">
                <button className="btn-cosmic btn-cosmic-ghost">
                  Run Free Pell Check
                </button>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

    </div>
  );
}
