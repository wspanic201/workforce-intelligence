import Link from 'next/link';
import { CheckCircle, ArrowRight, Check } from 'lucide-react';
import { AnimateOnScroll } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { Waveform } from '@/components/cosmic/Waveform';
import { DriftFAQ } from './DriftFAQ';

// ── Metadata ──

export const metadata = {
  title: 'Drift Monitor — Quarterly Curriculum Alignment Scans | Wavelength',
  description:
    'Find out if your workforce programs are still aligned to employer demand. Quarterly drift scans compare your curriculum against live job postings and deliver a scored gap report.',
  alternates: { canonical: 'https://withwavelength.com/drift' },
  openGraph: {
    title: 'Drift Monitor — Keep Your Programs Aligned to the Job Market',
    description:
      'Quarterly curriculum drift scans for community college workforce programs. Drift Score, gap analysis, and curriculum recommendations — delivered every quarter.',
    url: 'https://withwavelength.com/drift',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drift Monitor by Wavelength',
    description:
      'Quarterly curriculum alignment scans. Know if your programs are drifting from employer demand before your placement numbers tell you.',
  },
};

// ── JSON-LD ──

const driftProductJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Drift Monitor',
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

const FREE_SCAN_MAILTO =
  'mailto:hello@withwavelength.com?subject=Drift%20Monitor%20Free%20Scan&body=Program%20name%3A%20%0ATarget%20occupation%3A%20%0AInstitution%3A%20';

// ── Page ──

export default function DriftPage() {
  return (
    <div className="overflow-x-hidden bg-[#050510]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(driftProductJsonLd) }}
      />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-20">
        <Stars count={150} />
        <Aurora className="opacity-75" />
        <Waveform className="opacity-40" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={600}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-orange-300 text-sm font-medium tracking-wide uppercase text-xs">
                Program Health &amp; Maintenance
              </span>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={50} duration={800}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Link
                href="/program-health"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-semibold uppercase tracking-wider hover:bg-orange-500/20 transition-colors"
              >
                ← Program Health
              </Link>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw + 0.5rem, 4.75rem)' }}
            >
              Your curriculum was built for yesterday&apos;s job market.
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={220} duration={800}>
            <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Drift Monitor tracks what employers are actually hiring for — and tells you exactly where your programs are falling behind.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={340} duration={800}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href={FREE_SCAN_MAILTO}>
                <button className="btn-cosmic btn-cosmic-primary text-base px-8 py-4">
                  Run a Free Drift Scan →
                </button>
              </a>
              <a href="#example">
                <button className="btn-cosmic btn-cosmic-ghost text-base px-8 py-4">
                  See a Sample Score →
                </button>
              </a>
            </div>
            <p className="mt-4 text-sm text-white/40">
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
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mt-4">
                The curriculum gap you can&apos;t see
              </h2>
              <div className="mt-6 text-white/70 max-w-2xl mx-auto space-y-4 text-base leading-relaxed text-left">
                <p>
                  Your programs were built on solid research. But that was 18 months ago. Two years ago. Maybe longer.
                </p>
                <p>
                  The job market doesn&apos;t wait for your next curriculum review cycle. Employers redesign job requirements quarterly. New tools emerge. Soft skills shift. Certifications change. And the credential your students earn quietly drifts from what hiring managers are actually posting.
                </p>
                <p className="font-medium text-white/90">
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
                  <p className="text-white/60 text-sm leading-relaxed">{stat.label}</p>
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
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mt-4">
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
                desc: 'Drift Monitor analyzes 30–50 current job postings for your occupation. It extracts the top skills, certifications, and competencies employers are requiring right now.',
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
                    <h3 className="font-heading font-semibold text-white text-lg mb-2">
                      {step.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed text-sm">{step.desc}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ DRIFT SCORE ═══════════════ */}
      <section id="example" className="relative py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <SectionLabel>The Score</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mt-4">
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
                  <div className="font-heading font-black text-2xl text-white mb-1">{tier.score}</div>
                  <div className="text-sm font-semibold text-white/90 mb-2">{tier.status}</div>
                  <p className="text-xs text-white/60 leading-relaxed mt-auto">{tier.meaning}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll variant="fade-up" delay={200}>
            <p className="text-center text-white/60 text-sm leading-relaxed max-w-2xl mx-auto">
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white text-center mb-10">
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
                  <h3 className="font-heading font-bold text-white text-lg">
                    Pharmacy Technician Certificate — Drift Score: 60 / Moderate
                  </h3>
                  <span className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold uppercase tracking-wider text-orange-300">
                    🟠 Moderate Drift
                  </span>
                </div>
              </div>

              <p className="text-white/75 leading-relaxed text-base">
                The program covers core dispensing and compliance well. But employer postings have shifted: patient interaction, collaborative care, and pharmacy automation systems are now in the top 10 requirements — and none appear in the current curriculum objectives.
              </p>

              <p className="mt-5 text-white/45 text-sm italic">
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
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mt-4">
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
                    <h3 className="font-heading font-semibold text-white text-lg">{card.role}</h3>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{card.desc}</p>
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
              <SectionLabel>Pricing</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mt-4">
                Straightforward, subscription-based
              </h2>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10">
                <span className="text-green-300 text-sm">
                  💰 Eligible for Perkins V, WIOA Title I, and state workforce development grant funding.
                </span>
              </div>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

            {/* Tier 1 — Essentials */}
            <AnimateOnScroll variant="fade-up" delay={100}>
              <div className="card-cosmic rounded-2xl p-8 h-full flex flex-col">
                <div className="mb-6">
                  <p className="text-orange-300 text-[11px] font-bold uppercase tracking-widest mb-2">Essentials</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="font-heading font-black text-4xl text-white">$1,200</span>
                    <span className="text-white/60 text-sm mb-1">/program/year</span>
                  </div>
                  <p className="text-white/50 text-xs">One program, fully monitored</p>
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
                      <span className="text-sm text-white/75">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href={FREE_SCAN_MAILTO} className="block">
                  <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                    Get Started →
                  </button>
                </a>
              </div>
            </AnimateOnScroll>

            {/* Tier 2 — Portfolio (Most Popular) */}
            <AnimateOnScroll variant="fade-up" delay={200}>
              <div className="card-cosmic rounded-2xl p-8 h-full flex flex-col border-orange-500/30 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-orange-500/20">
                    Most Popular
                  </span>
                </div>
                <div className="mb-6 mt-3">
                  <p className="text-orange-300 text-[11px] font-bold uppercase tracking-widest mb-2">Portfolio</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="font-heading font-black text-4xl text-white">$4,800</span>
                    <span className="text-white/60 text-sm mb-1">/year</span>
                  </div>
                  <p className="text-white/50 text-xs">Starting at — up to 5 programs</p>
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
                      <span className="text-sm text-white/75">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="mailto:hello@withwavelength.com?subject=Drift%20Monitor%20Portfolio%20Order&body=Institution%3A%20%0APrograms%20to%20monitor%3A%20" className="block">
                  <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                    Order Portfolio →
                  </button>
                </a>
              </div>
            </AnimateOnScroll>

            {/* Tier 3 — Enterprise */}
            <AnimateOnScroll variant="fade-up" delay={300}>
              <div className="card-cosmic rounded-2xl p-8 h-full flex flex-col">
                <div className="mb-6">
                  <p className="text-orange-300 text-[11px] font-bold uppercase tracking-widest mb-2">Enterprise</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="font-heading font-black text-4xl text-white">Custom</span>
                  </div>
                  <p className="text-white/50 text-xs">15–50+ programs monitored</p>
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
                      <span className="text-sm text-white/75">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="mailto:hello@withwavelength.com?subject=Drift%20Monitor%20Enterprise&body=Institution%3A%20%0AProgram%20count%3A%20" className="block">
                  <button className="btn-cosmic btn-cosmic-ghost w-full text-sm">
                    Contact Us →
                  </button>
                </a>
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll variant="fade-up" delay={150}>
            <div className="mt-10 max-w-2xl mx-auto text-center">
              <p className="text-white/55 text-sm leading-relaxed">
                A single program coordinator spends 40–80 hours on a curriculum review cycle. Drift Monitor replaces that with a quarterly automated scan — and gives you the documentation to prove alignment to accreditors, employers, and grant funders.
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
              className="font-heading font-bold text-white mt-4"
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
              className="font-heading font-bold text-white mt-5 mb-5"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Don&apos;t wait for the placement numbers to tell you.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              Run a free drift scan on one of your existing programs. See your score. No sales call required.
            </p>
            <a href={FREE_SCAN_MAILTO}>
              <button className="btn-cosmic btn-cosmic-primary text-base px-10 py-4">
                Run a Free Drift Scan →
              </button>
            </a>
            <p className="mt-6 text-white/35 text-sm">
              One program, one scan, zero commitment. If the score is green, great — you&apos;ll know. If it&apos;s not, you&apos;ll know that too.
            </p>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ═══════════════ CROSS-SELL ═══════════════ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Looking to build new programs?</span>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimateOnScroll variant="fade-up" delay={100}>
              <Link href="/market-research" className="block card-cosmic rounded-2xl p-7 border-violet-500/20 hover:bg-white/[0.03] transition-colors group h-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading font-bold text-white text-lg">Market Research</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300">From $1,500</span>
                </div>
                <p className="text-white/70 text-sm mb-4">Discover what programs your region needs — backed by 50+ live data sources and real employer demand signals.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-300 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={200}>
              <Link href="/program-analysis" className="block card-cosmic rounded-2xl p-7 border-blue-500/20 hover:bg-white/[0.03] transition-colors group h-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading font-bold text-white text-lg">Program Analysis</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">Free + $295</span>
                </div>
                <p className="text-white/70 text-sm mb-4">Audit your existing portfolio for Workforce Pell eligibility and state compliance gaps you may be missing.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-300 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="py-10 px-6 text-center border-t border-white/5">
        <p className="text-white/70 text-sm">
          Wavelength Workforce Intelligence ·{' '}
          <a
            href="mailto:hello@withwavelength.com"
            className="hover:text-white/80 transition-colors"
          >
            hello@withwavelength.com
          </a>
        </p>
        <p className="mt-2 text-white/20 text-xs">
          Drift Monitor reports are research deliverables based on live job posting analysis. They do not constitute legal or accreditation advice.
        </p>
      </footer>
    </div>
  );
}
