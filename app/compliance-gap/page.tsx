'use client';

import { Mail, CheckCircle, AlertTriangle, TrendingUp, FileText, ArrowRight, DollarSign, BookOpen, MapPin } from 'lucide-react';
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
          <linearGradient id="cg-wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <path
          d="M0,30 C100,10 200,50 300,30 C400,10 500,50 600,30 C700,10 800,50 900,30 C1000,10 1100,50 1200,30"
          fill="none"
          stroke="url(#cg-wave-gradient)"
          strokeWidth="2.5"
        />
        <path
          d="M0,30 C100,10 200,50 300,30 C400,10 500,50 600,30 C700,10 800,50 900,30 C1000,10 1100,50 1200,30"
          fill="none"
          stroke="url(#cg-wave-gradient)"
          strokeWidth="1"
          opacity="0.4"
          transform="translate(0, 6)"
        />
      </svg>
    </div>
  );
}

// ── Sample Gap Data ──

const SAMPLE_GAPS = [
  {
    program: 'Certified Nurse Aide (CNA)',
    hours: 75,
    authority: 'State Health Services Division',
    demand: 'High',
    revenue: '$186,000',
    demandColor: 'text-emerald-400',
    insight: 'Required by state law for all residential care facilities. Perpetual hiring demand.',
  },
  {
    program: 'Cosmetology Pre-Licensing',
    hours: 1500,
    authority: 'State Board of Cosmetology',
    demand: 'High',
    revenue: '$312,000',
    demandColor: 'text-emerald-400',
    insight: 'One of the most searched vocational programs in the state. Guaranteed exam pipeline.',
  },
  {
    program: 'CDL Class A Training',
    hours: 160,
    authority: 'State DOT / FMCSA',
    demand: 'High',
    revenue: '$270,000',
    demandColor: 'text-emerald-400',
    insight: 'Federal shortage designation. Employers actively seeking approved training providers.',
  },
  {
    program: 'Pharmacy Technician',
    hours: 120,
    authority: 'State Board of Pharmacy',
    demand: 'Medium',
    revenue: '$108,000',
    demandColor: 'text-amber-400',
    insight: 'Licensing board requires approved coursework. Retail and hospital placement strong.',
  },
  {
    program: 'Real Estate Pre-Licensing',
    hours: 75,
    authority: 'State Real Estate Commission',
    demand: 'Medium',
    revenue: '$90,000',
    demandColor: 'text-amber-400',
    insight: 'Recurring CE cohorts plus initial licensing. Low overhead, high margins.',
  },
  {
    program: 'Security Guard Pre-Licensing',
    hours: 40,
    authority: 'State Licensing Division',
    demand: 'Medium',
    revenue: '$60,000',
    demandColor: 'text-amber-400',
    insight: 'Rapid-cycle 1-week cohorts. Employers often sponsor employee tuition directly.',
  },
];

// ── Deliverables ──

const DELIVERABLES = [
  {
    icon: AlertTriangle,
    title: 'Every Regulatory Gap',
    description:
      'A complete list of programs your state requires — by statute — that your institution does not currently offer.',
  },
  {
    icon: DollarSign,
    title: 'Revenue Sizing Per Gap',
    description:
      'Conservative annual revenue estimates for each missing program, based on cohort size, tuition benchmarks, and demand level.',
  },
  {
    icon: BookOpen,
    title: 'Compliance Citations',
    description:
      'Exact statutory references, regulatory body names, required clock hours, and renewal requirements for every program.',
  },
  {
    icon: TrendingUp,
    title: 'Prioritized Action Plan',
    description:
      'Gaps ranked by opportunity score — so your leadership team knows exactly where to focus first.',
  },
  {
    icon: FileText,
    title: 'Board-Ready Report',
    description:
      'A complete deliverable in professional consulting format — ready to share with your cabinet, dean, or board.',
  },
  {
    icon: MapPin,
    title: 'State-Specific Intelligence',
    description:
      'Not a national template. Every finding is sourced from your state\'s actual licensing boards and regulatory codes.',
  },
];

// ── Steps ──

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Tell Us Your College',
    description:
      'Submit your institution name and state. We locate your program catalog and document every offering you currently list.',
  },
  {
    step: '02',
    title: 'We Scan State Requirements',
    description:
      'Our research team cross-references your state\'s licensing boards, administrative codes, and regulatory statutes to identify every training program required by law.',
  },
  {
    step: '03',
    title: 'Get Your Gap Report',
    description:
      'Within 24 hours, you receive a complete Compliance Gap Report — every mandate you\'re missing, sized by revenue, cited to the statute.',
  },
];

// ── Page ──

export default function ComplianceGapPage() {
  return (
    <div className="overflow-x-hidden bg-[#050510]">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16">
        <Stars count={280} />
        <Aurora />
        <Waveform className="opacity-50" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <p className="overline mb-4 tracking-widest">
              WAVELENGTH COMPLIANCE INTELLIGENCE
            </p>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw + 0.5rem, 4.5rem)' }}
            >
              What mandated programs are you missing?
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={150} duration={800}>
            <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Your state requires dozens of licensed occupations to complete specific training programs. We find every one you don't offer — and size the revenue you're leaving on the table.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={300} duration={800}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:hello@withwavelength.com?subject=Compliance Gap Report Request">
                <button className="btn-cosmic btn-cosmic-primary">
                  Get My Gap Report — $79
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </a>
              <a href="#sample">
                <button className="btn-cosmic btn-cosmic-ghost">
                  See Sample Findings
                </button>
              </a>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={450} duration={800}>
            <p className="mt-5 text-sm text-white/35">
              One-time fee · No subscription · Delivered to your inbox
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ WHAT YOU GET ═══════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <p className="overline mb-3">THE DELIVERABLE</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">
                What you receive
              </h2>
              <p className="mt-4 text-white/70 max-w-xl mx-auto">
                A complete Compliance Gap Report — specific to your institution and your state's regulatory landscape.
              </p>
            </div>
          </AnimateOnScroll>

          <StaggerChildren stagger={80}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DELIVERABLES.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="card-cosmic p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <Icon className="h-5 w-5 text-violet-400" />
                      </div>
                      <h3 className="font-heading font-semibold text-white text-base">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
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

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <p className="overline mb-3">THE PROCESS</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">
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
                    <h3 className="font-heading font-semibold text-white text-lg mb-2">
                      {step.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed text-sm">
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

      {/* ═══════════════ SAMPLE FINDINGS ═══════════════ */}
      <section id="sample" className="relative py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-14">
              <p className="overline mb-3">SAMPLE FINDINGS</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">
                Gaps we commonly find
              </h2>
              <p className="mt-4 text-white/70 max-w-xl mx-auto">
                These are programs required by state law across most states — yet routinely absent from community college catalogs.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Table */}
          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="card-cosmic rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-5 py-4 text-left text-white/70 font-normal overline text-xs">Program</th>
                      <th className="px-5 py-4 text-left text-white/70 font-normal overline text-xs">Req. Hours</th>
                      <th className="px-5 py-4 text-left text-white/70 font-normal overline text-xs hidden md:table-cell">Authority</th>
                      <th className="px-5 py-4 text-left text-white/70 font-normal overline text-xs">Demand</th>
                      <th className="px-5 py-4 text-right text-white/70 font-normal overline text-xs">Est. Revenue / Yr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_GAPS.map((gap, idx) => (
                      <tr
                        key={gap.program}
                        className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${idx === SAMPLE_GAPS.length - 1 ? 'border-b-0' : ''}`}
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-white">{gap.program}</div>
                          <div className="text-white/35 text-xs mt-0.5 hidden sm:block">{gap.insight}</div>
                        </td>
                        <td className="px-5 py-4 text-white/80 font-mono">{gap.hours}h</td>
                        <td className="px-5 py-4 text-white/70 hidden md:table-cell">{gap.authority}</td>
                        <td className={`px-5 py-4 font-medium ${gap.demandColor}`}>{gap.demand}</td>
                        <td className="px-5 py-4 text-right font-heading font-semibold text-white">{gap.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-white/80 text-xs">
                  Sample data — actual findings vary by state and institution.
                </span>
                <span className="font-heading font-bold text-white/80">
                  $1,026,000 / yr — just these 6 programs
                </span>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200}>
            <p className="mt-6 text-center text-white/35 text-sm">
              A typical state has 20–35 mandated programs. Most community colleges offer fewer than half.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <WaveDivider />

      {/* ═══════════════ PRICING / CTA ═══════════════ */}
      <section className="relative py-24 px-6">
        <Stars count={120} />

        <div className="max-w-[680px] mx-auto text-center">
          <AnimateOnScroll variant="scale">
            <div className="card-cosmic rounded-2xl p-10 border border-violet-500/20">
              <p className="overline mb-4">ONE-TIME REPORT</p>

              <div className="flex items-end justify-center gap-2 mb-2">
                <span className="text-6xl font-heading font-black text-white">$79</span>
                <span className="text-white/70 mb-3 text-lg">one-time</span>
              </div>
              <p className="text-white/70 text-sm mb-8">
                Full Compliance Gap Report · State-specific · No subscription
              </p>

              <div className="space-y-3 mb-10 text-left max-w-sm mx-auto">
                {[
                  'Every state-mandated training program',
                  'Gap analysis vs your current catalog',
                  'Revenue sizing for each missing program',
                  'Statutory citations and licensing body details',
                  'Prioritized recommendations',
                  'Board-ready report format',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-sm text-white/70">{item}</span>
                  </div>
                ))}
              </div>

              <a
                href="mailto:hello@withwavelength.com?subject=Compliance Gap Report — $79&body=Institution Name:%0AState:%0ACity (optional):%0AWebsite (optional):%0A%0AI'd like to order a Compliance Gap Report."
                className="block"
              >
                <button className="btn-cosmic btn-cosmic-primary w-full text-base py-4">
                  <Mail className="mr-2 h-4 w-4" />
                  Order Your Report — hello@withwavelength.com
                </button>
              </a>

              <p className="mt-5 text-white/25 text-xs">
                Email us your institution name + state. We'll invoice and deliver your report.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════ FOOTER NOTE ═══════════════ */}
      <footer className="py-10 px-6 text-center border-t border-white/5">
        <p className="text-white/70 text-sm">
          Wavelength Workforce Intelligence ·{' '}
          <a
            href="mailto:hello@withwavelength.com"
            className="hover:text-white/70 transition-colors"
          >
            hello@withwavelength.com
          </a>
        </p>
        <p className="mt-2 text-white/10 text-xs">
          Compliance Gap Reports are research deliverables based on publicly available regulatory data and do not constitute legal advice.
        </p>
      </footer>
    </div>
  );
}
