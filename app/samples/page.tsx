import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Sample Reports | Wavelength',
  description:
    'See exactly what you receive from every Wavelength service — interactive demos, deliverable formats, and sample output for all six reports.',
  alternates: { canonical: 'https://withwavelength.com/samples' },
};

const services = [
  {
    id: 'opportunity-scan',
    name: 'Program Opportunity Scan',
    price: '$1,500',
    liveDemo: true,
    format: 'Interactive web report + PDF download',
    formatDot: 'bg-purple-400',
    whatsInside: [
      '7–10 scored, ranked program opportunities for your region',
      'Demand score, competitive gap score, revenue viability, wage outcomes, launch speed',
      'Regional labor market summary (employment, wage data, growth trends)',
      "Employer landscape (who\u2019s hiring, how many openings, top employers)",
      'Executive summary with top 3 recommended programs',
      'Full methodology and data sources audit trail',
    ],
    value:
      'Gives your CE leadership a prioritized shortlist to act on — scored against real data, not gut feel.',
    cta: {
      label: 'View Sample Report',
      href: '/report/wake-tech-program-opportunity-scan',
      primary: true,
    },
  },
  {
    id: 'program-validation',
    name: 'Program Validation',
    price: '$3,500',
    liveDemo: true,
    format: 'PDF report — delivered by email within 5 business days',
    formatDot: 'bg-blue-400',
    whatsInside: [
      'GO / NO-GO recommendation with full rationale',
      '5-year financial projection (enrollment curves, revenue, break-even)',
      'Employer demand verification (actual employers, open positions, growth)',
      'Competitive analysis (enrollment trends, pricing, program weaknesses)',
      'Regulatory & Pell eligibility analysis',
      'Implementation roadmap (faculty, equipment, timeline to first cohort)',
      '7 independent specialist analyses, cross-checked',
    ],
    value:
      'Replaces months of internal research with a single authoritative decision document — ready to present to your board or cabinet.',
    cta: {
      label: 'View Sample Report',
      href: '/report/kirkwood-pharmtech-validation',
      primary: true,
    },
  },
  {
    id: 'pell-readiness',
    name: 'Pell Readiness Check',
    price: 'Free',
    liveDemo: true,
    format: 'PDF report — delivered by email within 48 hours',
    formatDot: 'bg-teal-400',
    whatsInside: [
      'Eligibility score for each program assessed (0–100)',
      'Federal criteria analysis (clock hours, credential type, SOC alignment)',
      'State-specific requirements (Iowa ICSPS, reporting codes, approval status)',
      'Completion rate benchmarking',
      'Wage threshold analysis (BLS median wage vs. federal threshold)',
      'Prioritized action items to achieve/maintain eligibility',
    ],
    value:
      'Know exactly where each program stands before July 1, 2026 — and what to fix to maximize your Pell-eligible catalog.',
    cta: {
      label: 'View Sample Report',
      href: '/report/pell-demo',
      primary: true,
    },
  },
  {
    id: 'program-gap-audit',
    name: 'Program Gap Audit',
    price: '$295',
    liveDemo: true,
    format: 'Interactive web report + PDF download',
    formatDot: 'bg-orange-400',
    whatsInside: [
      'Current catalog scan against regional employer demand',
      "Programs you\u2019re missing vs. active hiring demand",
      'Compliance flags (outdated content, accreditor drift, regulatory gaps)',
      'Priority gap ranking by demand + revenue potential',
      "Competitor comparison (what nearby institutions offer that you\u2019re not)",
    ],
    value:
      'A snapshot of where your catalog has fallen behind regional demand — and the highest-value gaps worth filling first.',
    cta: {
      label: 'View Sample Report',
      href: '/report/hawkeye-gap-audit',
      primary: true,
    },
  },
  {
    id: 'grant-intelligence',
    name: 'Grant Intelligence Scan',
    price: '$495',
    liveDemo: false,
    format: 'PDF report — delivered by email within 3–5 business days',
    formatDot: 'bg-green-400',
    whatsInside: [
      '30+ federal, state, and foundation grants scanned',
      'Eligibility match score for each grant (High / Medium / Low)',
      'Award range and deadline for each opportunity',
      'Alignment analysis (which programs qualify, which do not)',
      'Past award data (who received it, award amounts, institution profiles)',
      'Prioritized pursuit list — ranked by eligibility match + award size',
    ],
    value:
      'Stops you from chasing grants you won\u2019t win and surfaces the ones your programs are actually built for.',
    cta: {
      label: 'Request Sample PDF',
      href: '/contact',
      primary: false,
    },
  },
  {
    id: 'curriculum-drift',
    name: 'Curriculum Drift Analysis',
    price: 'from $495/yr',
    liveDemo: false,
    format: 'PDF report — delivered by email quarterly',
    formatDot: 'bg-pink-400',
    whatsInside: [
      'Drift score by program (0–100; higher = more drift)',
      'Section-by-section comparison: current content vs. current O*NET task data',
      'New employer-required skills not in current curriculum',
      'Skills/topics in curriculum no longer reflected in job postings',
      'Industry certification alignment gaps',
      'Recommended curriculum update priority list',
    ],
    value:
      'Catches curriculum drift before it shows up in placement rates — giving faculty and curriculum staff a specific, evidence-based update agenda.',
    cta: {
      label: 'Request Sample PDF',
      href: '/contact',
      primary: false,
    },
  },
];

export default function SamplesPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[55vh] flex items-center justify-center pt-36 lg:pt-40 pb-16">
        <Stars count={100} />
        <Aurora className="opacity-75" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">Sample Reports</span>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="font-heading font-bold text-gradient-cosmic leading-[1.05] mx-auto max-w-3xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4rem)' }}
            >
              See exactly what you get.
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200} duration={800}>
            <p className="mt-5 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed">
              Every Wavelength service produces a specific, professional deliverable.
              Here&apos;s what that looks like before you order.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== SERVICE CARDS ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <StaggerChildren
            stagger={80}
            variant="fade-up"
            className="grid md:grid-cols-2 gap-6 lg:gap-8"
          >
            {services.map((svc) => (
              <div
                key={svc.id}
                className={`card-cosmic rounded-2xl p-7 flex flex-col gap-5 ${
                  svc.liveDemo ? 'border-purple-500/30' : ''
                }`}
              >
                {/* Live demo badge */}
                {svc.liveDemo && (
                  <span className="overline !text-[10px] !tracking-widest text-purple-400">
                    Live Demo Available
                  </span>
                )}

                {/* Name + Price */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <h2 className="font-heading font-bold text-xl text-theme-primary leading-snug">
                    {svc.name}
                  </h2>
                  <span className="font-mono text-gradient-cosmic font-bold text-base flex-shrink-0">
                    {svc.price}
                  </span>
                </div>

                {/* Format */}
                <p className="flex items-center gap-1.5 text-sm text-theme-secondary">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${svc.formatDot} inline-block flex-shrink-0`}
                  />
                  {svc.format}
                </p>

                {/* What's inside */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-3">
                    What&apos;s Inside
                  </p>
                  <ul className="space-y-2">
                    {svc.whatsInside.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-theme-secondary">
                        <CheckCircle2 className="h-4 w-4 text-theme-muted flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Value statement */}
                <p className="text-sm italic text-theme-tertiary leading-relaxed">
                  {svc.value}
                </p>

                {/* CTA */}
                <div className="mt-auto pt-1">
                  <Link href={svc.cta.href}>
                    <button
                      className={`btn-cosmic ${svc.cta.primary ? 'btn-cosmic-primary' : 'btn-cosmic-ghost'} text-sm w-full sm:w-auto`}
                    >
                      {svc.cta.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== FOOTER CTA ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Ready to Order?</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Start with the scan that fits your timeline.
            </h2>
            <p className="mt-4 text-theme-tertiary text-lg leading-relaxed">
              Every report is built for your institution — no templates, no filler.
              Questions before ordering? We respond within 24 hours.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pell">
                <button className="btn-cosmic btn-cosmic-primary text-sm py-3 px-7">
                  Get Started Free — Pell Readiness Check
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="btn-cosmic btn-cosmic-ghost text-sm py-3 px-7">
                  Ask a Question
                </button>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
