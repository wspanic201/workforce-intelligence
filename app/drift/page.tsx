import Link from 'next/link';
import { CheckCircle, ArrowRight, Check } from 'lucide-react';
import { AnimateOnScroll } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { Waveform } from '@/components/cosmic/Waveform';
import { DriftFAQ } from './DriftFAQ';

// ── Metadata ──

export const metadata = {
  title: 'Curriculum Drift Analysis — Quarterly Curriculum Alignment Scans | Wavelength',
  description:
    'Find out if your workforce programs are still aligned to employer demand. Quarterly drift scans compare your curriculum against live job postings and deliver a scored gap report.',
  alternates: { canonical: 'https://withwavelength.com/drift' },
  openGraph: {
    title: 'Curriculum Drift Analysis — Keep Your Programs Aligned to the Job Market',
    description:
      'Quarterly curriculum drift scans for community college workforce programs. Drift Score, gap analysis, and curriculum recommendations — delivered every quarter.',
    url: 'https://withwavelength.com/drift',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Curriculum Drift Analysis by Wavelength',
    description:
      'Quarterly curriculum alignment scans. Know if your programs are drifting from employer demand before your placement numbers tell you.',
  },
};

// ── JSON-LD ──

const driftProductJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Curriculum Drift Analysis',
  description:
    'Quarterly curriculum alignment scans that compare your program content against live employer job postings. Catch curriculum drift before it affects student placement rates.',
  url: 'https://withwavelength.com/drift',
  brand: { '@type': 'Brand', name: 'Wavelength' },
  offers: {
    '@type': 'Offer',
    price: '1200',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: 'https://withwavelength.com/drift',
  },
};

// ── Helpers ──

function WaveDivider() {
  return (
    <div className="w-full overflow-hidden py-6" aria-hidden="true">
      <svg
        viewBox="0 0 1200 60"
        className="w-full h-10 opacity-[0.15]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="drift-wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
        </defs>
        <path
          d="M0,30 C100,10 200,50 300,30 C400,10 500,50 600,30 C700,10 800,50 900,30 C1000,10 1100,50 1200,30"
          fill="none"
          stroke="url(#drift-wave-gradient)"
          strokeWidth="2.5"
        />
        <path
          d="M0,30 C100,10 200,50 300,30 C400,10 500,50 600,30 C700,10 800,50 900,30 C1000,10 1100,50 1200,30"
          fill="none"
          stroke="url(#drift-wave-gradient)"
          strokeWidth="1"
          opacity="0.4"
          transform="translate(0, 6)"
        />
      </svg>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="overline inline-flex items-center gap-3">
      <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-orange-500/50" />
      {children}
      <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-orange-500/50" />
    </span>
  );
}

const FREE_SCAN_MAILTO = '/contact';

// ── Page ──

export default function DriftPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(driftProductJsonLd) }}
      />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-36 lg:pt-40 pb-20">
        <Stars count={150} />
        <Aurora className="opacity-75" />
        <Waveform className="opacity-40" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={600}>
            <p className="label-brand mb-5 text-center">
              <span className="text-gradient-cosmic">∿ ·</span> Monitor
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={50} duration={800}>
            <div className="mb-6">
              <Link href="/program-health" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gradient-cosmic hover:opacity-80 transition-opacity group">
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                Program Health
              </Link>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw + 0.5rem, 4.75rem)' }}
            >
              The market doesn&apos;t wait for your next curriculum review cycle.
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={220} duration={800}>
            <p className="mt-6 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed">
              We scan live job postings against your course outcomes and show you exactly where programs are falling behind.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={340} duration={800}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={FREE_SCAN_MAILTO}>
                <button className="btn-cosmic btn-cosmic-primary text-base px-8 py-4">
                  Order a Drift Scan →
                </button>
              </Link>
              <a href="#example">
                <button className="btn-cosmic btn-cosmic-ghost text-base px-8 py-4">
                  See a Sample Score →
                </button>
              </a>
            </div>
            <p className="mt-4 text-sm text-theme-muted">
              No login required. One program, instant results.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ PROBLEM ═══════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <SectionLabel>The Problem</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-theme-primary mt-4">
                The curriculum gap you can&apos;t see
              </h2>
              <div className="mt-6 text-theme-secondary max-w-2xl mx-auto space-y-4 text-base leading-relaxed text-left">
                <p>
                  Your programs were built on solid research. But that was 18 months ago. Two years ago. Maybe longer.
                </p>
                <p>
                  The job market doesn&apos;t wait for your next curriculum review cycle. Employers redesign job requirements quarterly. New tools emerge. Soft skills shift. Certifications change. And the credential your students earn quietly drifts from what hiring managers are actually posting.
                </p>
                <p className="font-medium text-theme-primary">
                  You don&apos;t feel it until the placement numbers come in.
                </p>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { value: '3–5 yrs', label: 'Average curriculum review cycle' },
              { value: '12–18 mo', label: 'Average time for employer skill requirements to shift' },
              { value: '70%', label: 'Workforce Pell job placement requirement within 180 days' },
            ].map((stat, idx) => (
              <AnimateOnScroll key={stat.label} variant="fade-up" delay={idx * 100}>
                <div className="card-cosmic rounded-xl p-7 text-center border-orange-500/15">
                  <div className="font-heading font-black text-4xl text-gradient-cosmic mb-2">
                    {stat.value}
                  </div>
                  <p className="text-theme-tertiary text-sm leading-relaxed">{stat.label}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <SectionLabel>How It Works</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-theme-primary mt-4">
                Know before your students do.
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Register your program',
                desc: 'Tell us the program name, target occupation, and what your curriculum covers. Takes 5 minutes.',
              },
              {
                step: '02',
                title: 'We scan the market',
                desc: 'Curriculum Drift Analysis analyzes 30–50 current job postings for your occupation. It extracts the top skills, certifications, and competencies employers are requiring right now.',
              },
              {
                step: '03',
                title: 'Get your Drift Score',
                desc: 'We compare what employers want against what you teach. You receive a scored gap report — what\'s covered, what\'s missing, what\'s gone stale — with specific recommendations on what to update.',
              },
            ].map((step, idx) => (
              <AnimateOnScroll key={step.step} variant="fade-left" delay={idx * 100}>
                <div className="card-cosmic rounded-xl p-7 flex gap-6 items-start">
                  <div className="shrink-0 text-4xl font-heading font-black text-gradient-cosmic opacity-40 leading-none">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-theme-primary text-lg mb-2">
                      {step.title}
                    </h3>
                    <p className="text-theme-secondary leading-relaxed text-sm">{step.desc}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ WHAT YOU RECEIVE ═══════════════ */}
      <section className="relative py-16 px-6">
        <div className="max-w-[760px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-10">
              <SectionLabel>What You Receive</SectionLabel>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="card-cosmic rounded-2xl p-8 space-y-5">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" aria-hidden="true">
                      <path d="M4 4h8l4 4v8H4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M12 4v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ),
                  label: 'Quarterly PDF report',
                  detail: 'Emailed directly to your inbox each quarter',
                },
                {
                  icon: (
                    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" aria-hidden="true">
                      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                  label: 'Executive summary',
                  detail: 'Top 3 drift findings surfaced for quick leadership review',
                },
                {
                  icon: (
                    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" aria-hidden="true">
                      <rect x="2.5" y="2.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M6 7h8M6 10.5h8M6 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ),
                  label: 'Recommended curriculum updates by module',
                  detail: 'Specific, actionable changes — not vague suggestions',
                },
                {
                  icon: (
                    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" aria-hidden="true">
                      <path d="M3 5h14M3 10h14M3 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="15.5" cy="14.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M15.5 13.5v1l.75.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                  label: 'Optional 30-min walkthrough call',
                  detail: 'Review findings with your analyst before acting on them',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  {item.icon}
                  <div>
                    <p className="text-sm font-semibold text-theme-primary">{item.label}</p>
                    <p className="text-sm text-theme-secondary leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ DRIFT SCORE ═══════════════ */}
      <section id="example" className="relative py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <SectionLabel>The Score</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-theme-primary mt-4">
                One number that tells you everything.
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            {[
              { score: '0–20', status: '✅ Aligned', border: 'border-teal-500/30', bg: 'bg-teal-500/5', dot: 'bg-teal-400', meaning: 'Curriculum matches employer demand well' },
              { score: '21–40', status: '⚠️ Minor Drift', border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', dot: 'bg-yellow-400', meaning: 'A few gaps — schedule a review' },
              { score: '41–60', status: '🟠 Moderate Drift', border: 'border-orange-500/30', bg: 'bg-orange-500/5', dot: 'bg-orange-400', meaning: 'Meaningful gaps — update within 6 months' },
              { score: '61–80', status: '🔴 Significant Drift', border: 'border-red-500/30', bg: 'bg-red-500/5', dot: 'bg-red-400', meaning: 'Immediate curriculum action needed' },
              { score: '81–100', status: '🚨 Critical', border: 'border-red-600/40', bg: 'bg-red-600/10', dot: 'bg-red-500', meaning: 'Program may be at risk — act now' },
            ].map((tier, idx) => (
              <AnimateOnScroll key={tier.score} variant="fade-up" delay={idx * 80}>
                <div className={`card-cosmic rounded-xl p-5 border ${tier.border} ${tier.bg} text-center h-full flex flex-col`}>
                  <div className="font-heading font-black text-2xl text-theme-primary mb-1">{tier.score}</div>
                  <div className="text-sm font-semibold text-theme-primary mb-2">{tier.status}</div>
                  <p className="text-xs text-theme-tertiary leading-relaxed mt-auto">{tier.meaning}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll variant="fade-up" delay={200}>
            <p className="text-center text-theme-tertiary text-sm leading-relaxed max-w-2xl mx-auto">
              Most programs don&apos;t start at critical. They drift there slowly, quarter by quarter, while everyone assumes the curriculum is fine because it was fine last year.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ REAL EXAMPLE ═══════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-[860px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-theme-primary text-center mb-10">
              What drift looks like in practice
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll variant="scale" delay={100}>
            <div className="card-cosmic rounded-2xl p-8 border-orange-500/25 relative overflow-hidden">
              {/* Subtle glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/0 via-orange-500/60 to-orange-500/0" />

              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <span className="text-xl">📡</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-theme-primary text-lg">
                    Pharmacy Technician Certificate — Drift Score: 60 / Moderate
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-theme-muted mt-1">
                    <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                    🟠 Moderate Drift
                  </span>
                </div>
              </div>

              <p className="text-theme-secondary leading-relaxed text-base">
                The program covers core dispensing and compliance well. But employer postings have shifted: patient interaction, collaborative care, and pharmacy automation systems are now in the top 10 requirements — and none appear in the current curriculum objectives.
              </p>

              <p className="mt-5 text-theme-tertiary text-sm italic">
                This program hasn&apos;t been updated since 2023. The field has.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ WHO IT'S FOR ═══════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <SectionLabel>Who It&apos;s For</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-theme-primary mt-4">
                Built for the people responsible for program quality
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                role: 'VP of Academic Affairs',
                desc: 'Quarterly proof that your programs are market-aligned — for board reports, accreditation, and strategic planning.',
                icon: '🎓',
              },
              {
                role: 'Workforce Development Directors',
                desc: 'Protect your Workforce Pell placement rates before they\'re at risk. Catch drift before it costs you eligibility.',
                icon: '📊',
              },
              {
                role: 'Department Chairs',
                desc: 'Know which courses need updating before accreditation asks. Stop relying on anecdotal feedback from advisory boards.',
                icon: '🏛️',
              },
              {
                role: 'Curriculum Coordinators',
                desc: 'Stop guessing which skills to add. See exactly what employers are requiring right now, updated every quarter.',
                icon: '📋',
              },
            ].map((card, idx) => (
              <AnimateOnScroll key={card.role} variant="fade-up" delay={idx * 80}>
                <div className="card-cosmic rounded-xl p-7 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xl">
                      {card.icon}
                    </div>
                    <h3 className="font-heading font-semibold text-theme-primary text-lg">{card.role}</h3>
                  </div>
                  <p className="text-theme-secondary text-sm leading-relaxed">{card.desc}</p>
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

        <div className="max-w-[1100px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-4">
              <SectionLabel>Annual Subscription</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-theme-primary mt-4">
                Straightforward, subscription-based
              </h2>
              <p className="mt-4 text-sm text-theme-muted">
                💰 Eligible for Perkins V, WIOA Title I, and state workforce development grant funding.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

            {/* Tier 1 — Essentials */}
            <AnimateOnScroll variant="fade-up" delay={100}>
              <div className="card-cosmic rounded-2xl p-8 h-full flex flex-col">
                <div className="mb-6">
                  <p className="overline mb-2">Essentials</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="font-heading font-black text-6xl text-theme-primary">$495</span>
                    <span className="text-theme-tertiary text-sm mb-1">/scan</span>
                  </div>
                  <p className="text-theme-tertiary text-xs">One program, one comprehensive scan</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {[
                    '4 quarterly drift scans',
                    'Drift Score + full gap analysis each quarter',
                    'PDF report delivered by email',
                    'Specific curriculum update recommendations',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm text-theme-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href={FREE_SCAN_MAILTO} className="block">
                  <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                    Get Started →
                  </button>
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Tier 2 — Portfolio (Most Popular) */}
            <AnimateOnScroll variant="fade-up" delay={200}>
              <div className="card-cosmic rounded-2xl p-8 h-full flex flex-col border-orange-500/30 relative">
                <div className="mb-6 mt-1">
                  <p className="overline mb-2">Most Popular</p>
                  <p className="overline mb-2">Portfolio</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="font-heading font-black text-4xl text-theme-primary">$4,800</span>
                    <span className="text-theme-tertiary text-sm mb-1">/year</span>
                  </div>
                  <p className="text-theme-tertiary text-xs">Starting at — up to 5 programs</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {[
                    'Up to 5 programs monitored',
                    'All quarterly scans + reports',
                    'Year-over-year drift trend tracking',
                    'Priority support',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm text-theme-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="block">
                  <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                    Order Portfolio →
                  </button>
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Tier 3 — Enterprise */}
            <AnimateOnScroll variant="fade-up" delay={300}>
              <div className="card-cosmic rounded-2xl p-8 h-full flex flex-col">
                <div className="mb-6">
                  <p className="overline mb-2">Enterprise</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="font-heading font-black text-4xl text-theme-primary">Custom</span>
                  </div>
                  <p className="text-theme-tertiary text-xs">15–50+ programs monitored</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {[
                    '15–50+ programs monitored',
                    'Formatted for HLC / SACSCOC accreditation documentation',
                    'Dedicated account manager',
                    'API access for your IR team',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm text-theme-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="block">
                  <button className="btn-cosmic btn-cosmic-ghost w-full text-sm">
                    Contact Us →
                  </button>
                </Link>
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll variant="fade-up" delay={150}>
            <div className="mt-10 max-w-2xl mx-auto text-center">
              <p className="text-theme-tertiary text-sm leading-relaxed">
                A single program coordinator spends 40–80 hours on a curriculum review cycle. Curriculum Drift Analysis replaces that with a quarterly automated scan — and gives you the documentation to prove alignment to accreditors, employers, and grant funders.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ FAQ ═══════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-[760px] mx-auto">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <SectionLabel>FAQ</SectionLabel>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-12">
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Common questions
            </h2>
          </AnimateOnScroll>
          <DriftFAQ />
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ CLOSING CTA ═══════════════ */}
      <section className="relative py-24 px-6 text-center">
        <Stars count={50} />

        <AnimateOnScroll variant="fade-up">
          <div className="max-w-[680px] mx-auto">
            <SectionLabel>Ready?</SectionLabel>
            <h2
              className="font-heading font-bold text-theme-primary mt-5 mb-5"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Don&apos;t wait for the placement numbers to tell you.
            </h2>
            <p className="text-theme-secondary text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              Run a drift scan on one of your existing programs. See your score.
            </p>
            <Link href={FREE_SCAN_MAILTO}>
              <button className="btn-cosmic btn-cosmic-primary text-base px-10 py-4">
                Order a Drift Scan →
              </button>
            </Link>
            <p className="mt-6 text-theme-muted text-sm">
              If the score is green, great — you&apos;ll know. If it&apos;s not, you&apos;ll know that too.
            </p>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ═══════════════ CROSS-SELL ═══════════════ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-8">
            <span className="overline">Looking to build new programs?</span>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimateOnScroll variant="fade-up" delay={100}>
              <Link href="/market-research" className="block card-cosmic rounded-2xl p-7 border-violet-500/20 hover:bg-white/[0.03] transition-colors group h-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading font-bold text-theme-primary text-lg">Market Research</h3>
                  <span className="text-xs font-semibold text-theme-muted">From $1,500</span>
                </div>
                <p className="text-theme-secondary text-sm mb-4">Discover what programs your region needs — backed by 50+ live data sources and real employer demand signals.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-300 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={200}>
              <Link href="/program-analysis" className="block card-cosmic rounded-2xl p-7 border-blue-500/20 hover:bg-white/[0.03] transition-colors group h-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading font-bold text-theme-primary text-lg">Program Analysis</h3>
                  <span className="text-xs font-semibold text-theme-muted">$295</span>
                </div>
                <p className="text-theme-secondary text-sm mb-4">Audit your existing portfolio for Workforce Pell eligibility and state compliance gaps you may be missing.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-300 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="py-10 px-6 text-center border-t border-theme-subtle">
        <p className="text-theme-secondary text-sm">
          Wavelength Workforce Intelligence ·{' '}
          <Link
            href="/contact"
            className="hover:text-theme-secondary transition-colors"
          >
            Contact Us
          </Link>
        </p>
        <p className="mt-2 text-theme-muted text-xs">
          Curriculum Drift Analysis reports are research deliverables based on live job posting analysis. They do not constitute legal or accreditation advice.
        </p>
      </footer>
    </div>
  );
}
