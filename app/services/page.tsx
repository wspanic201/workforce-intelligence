import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';

export const metadata: Metadata = {
  title: 'Services | Wavelength — Workforce Program Intelligence',
  description:
    'The complete Wavelength service catalog: program opportunity scans, validation, curriculum design, and standalone intelligence reports for community college CE divisions.',
  alternates: { canonical: 'https://withwavelength.com/services' },
};

// ─── Data ────────────────────────────────────────────────────────────────────

const LIFECYCLE_STAGES = [
  {
    stage: '1',
    name: 'Program Opportunity Scan',
    price: '$1,500',
    available: true,
    href: '/discover',
    description: 'Identify the highest-potential programs for your region — scored, ranked, and backed by real employer demand signals.',
  },
  {
    stage: '2',
    name: 'Program Validation',
    price: '$3,500',
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
    price: '$295',
    href: '/compliance-gap',
  },
  {
    name: 'Grant Intelligence Scan',
    description: 'Surface and prioritize every grant your programs qualify for — scored and ready to pursue.',
    price: '$495',
    href: '/grants',
  },
  {
    name: 'Curriculum Drift Analysis',
    description: 'Annual review that flags where course content has fallen behind employer expectations and industry standards.',
    price: 'from $495',
    href: '/drift',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">

      {/* ===== HERO ===== */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-36 lg:pt-40 pb-16 overflow-hidden">
        <Stars count={80} />
        <Aurora className="opacity-60" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">Service Catalog</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="font-heading font-bold leading-[1.05] mx-auto max-w-3xl"
              style={{ fontSize: 'clamp(2.25rem, 4.5vw + 0.5rem, 4rem)' }}
            >
              Everything{' '}
              <span className="text-gradient-cosmic">Wavelength</span>{' '}
              offers — in one place
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200} duration={800}>
            <p className="mt-6 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed">
              A complete intelligence stack for community college CE divisions — from opportunity discovery through program launch, plus standalone reports you can order anytime.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={300} duration={800}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pell">
                <button className="btn-cosmic btn-cosmic-primary">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link href="/discover">
                <button className="btn-cosmic btn-cosmic-ghost">
                  Start with a Market Scan
                </button>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== CLIENT JOURNEY ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[900px] mx-auto px-6">

          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">How It Works</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-14">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              From &ldquo;what should we build?&rdquo; to a program that runs.
            </h2>
            <p className="text-theme-secondary mt-3 max-w-xl mx-auto">
              Most institutions start at Stage 1. Each stage hands off directly to the next — no lost context, no starting over.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="space-y-6">

            {/* Step 1 */}
            <div className="grid md:grid-cols-[120px_1fr] gap-6 items-start">
              <div className="text-center md:text-right pt-1">
                <span className="font-mono text-xs text-theme-muted tracking-widest uppercase">Stage 1</span>
                <div className="font-mono font-bold text-gradient-cosmic text-sm mt-0.5">$1,500</div>
              </div>
              <div className="card-cosmic rounded-2xl p-6">
                <h3 className="font-heading font-semibold text-theme-primary text-base mb-2">
                  Discover which programs your region actually needs
                </h3>
                <p className="text-theme-secondary text-sm leading-relaxed">
                  We scan regional employer demand, BLS labor data, job posting trends, and competitor catalogs to surface the 7–10 programs with the strongest case for your institution. You receive a professional brief — scored, ranked, ready to present.
                </p>
                <p className="text-theme-muted text-xs mt-3 italic">
                  Typical outcome: a ranked shortlist of opportunities your leadership can act on immediately.
                </p>
              </div>
            </div>

            {/* Arrow connector */}
            <div className="flex items-center justify-center md:pl-[144px]">
              <div className="flex flex-col items-center gap-1 text-theme-muted">
                <div className="w-px h-4 bg-gradient-to-b from-purple-500/40 to-blue-500/30" />
                <span className="text-xs font-mono text-theme-muted tracking-widest">You pick one</span>
                <div className="w-px h-4 bg-gradient-to-b from-blue-500/30 to-teal-500/20" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-[120px_1fr] gap-6 items-start">
              <div className="text-center md:text-right pt-1">
                <span className="font-mono text-xs text-theme-muted tracking-widest uppercase">Stage 2</span>
                <div className="font-mono font-bold text-gradient-cosmic text-sm mt-0.5">$3,500</div>
              </div>
              <div className="card-cosmic rounded-2xl p-6">
                <h3 className="font-heading font-semibold text-theme-primary text-base mb-2">
                  Validate it — before you hire faculty or write a course
                </h3>
                <p className="text-theme-secondary text-sm leading-relaxed">
                  Seven specialist analysts — market, financial, employer, regulatory, competitive, institutional fit, implementation — each run independent analyses on your chosen program. You get a 5-year financial model, a competitive positioning assessment, and a definitive GO&nbsp;/&nbsp;NO-GO recommendation. Not a maybe.
                </p>
                <p className="text-theme-muted text-xs mt-3 italic">
                  Typical outcome: a board-ready validation report and a clear decision to proceed — or redirect resources to a better opportunity.
                </p>
              </div>
            </div>

            {/* Arrow connector */}
            <div className="flex items-center justify-center md:pl-[144px]">
              <div className="flex flex-col items-center gap-1 text-theme-muted">
                <div className="w-px h-4 bg-gradient-to-b from-blue-500/30 to-teal-500/20" />
                <span className="text-xs font-mono text-theme-muted tracking-widest">You get a GO</span>
                <div className="w-px h-4 bg-gradient-to-b from-teal-500/20 to-transparent" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-[120px_1fr] gap-6 items-start opacity-65">
              <div className="text-center md:text-right pt-1">
                <span className="font-mono text-xs text-theme-muted tracking-widest uppercase">Stage 3</span>
                <div className="font-mono text-xs text-theme-muted mt-0.5 tracking-widest">Coming Soon</div>
              </div>
              <div className="rounded-2xl p-6 border border-theme-subtle bg-white/[0.015]">
                <h3 className="font-heading font-semibold text-theme-tertiary text-base mb-2">
                  Build the curriculum from validated data
                </h3>
                <p className="text-theme-muted text-sm leading-relaxed">
                  Competency maps, course architecture, learning outcomes, and assessment frameworks — derived from O*NET task data, employer input gathered during validation, and accreditor requirements. No starting from scratch.
                </p>
              </div>
            </div>

            {/* Step 4+ */}
            <div className="grid md:grid-cols-[120px_1fr] gap-6 items-start opacity-45">
              <div className="text-center md:text-right pt-1">
                <span className="font-mono text-xs text-theme-muted tracking-widest uppercase">Stages 4–8</span>
                <div className="font-mono text-xs text-theme-muted mt-0.5 tracking-widest">Coming Soon</div>
              </div>
              <div className="rounded-2xl p-6 border border-theme-subtle bg-white/[0.01]">
                <h3 className="font-heading font-semibold text-theme-muted text-base mb-2">
                  Pathway design, launch, and ongoing quality control
                </h3>
                <p className="text-theme-muted text-sm leading-relaxed">
                  Stackable credential architecture, articulation agreements, content production, marketing strategy, enrollment operations, and outcomes tracking — closing the loop back to your next discovery cycle.
                </p>
              </div>
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
              Sequential stages — each builds on the last.
            </h2>
            <p className="text-theme-secondary mt-3 max-w-xl mx-auto">
              Start at Stage 1 or jump in at any stage. Stages 1 and 2 are live and ready to order today.
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
              Standalone reports — order anytime.
            </h2>
            <p className="text-theme-secondary mt-3 max-w-xl mx-auto">
              Independent of the lifecycle — bolt these onto any stage, or use them on their own. No subscription required.
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

      {/* ===== CTA ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[700px] mx-auto px-6 text-center">
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
              Start with the free Pell check.
            </h2>
            <p className="text-theme-secondary mb-10 max-w-lg mx-auto">
              No commitment. In five minutes you&apos;ll know whether your programs qualify for Workforce Pell funding — and what to do next.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pell">
                <button className="btn-cosmic btn-cosmic-primary">
                  Run the Free Pell Check
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="btn-cosmic btn-cosmic-ghost">
                  Talk to Us First
                </button>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

    </div>
  );
}
