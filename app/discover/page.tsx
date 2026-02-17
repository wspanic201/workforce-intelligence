'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Target,
  Sparkles,
  FileText,
  CheckCircle2,
  Users,
  TrendingUp,
} from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';

const discoverProductJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Market Scan",
  description:
    "Full market intelligence before you build a new program — 25+ pages of scored opportunities, employer demand signals, competitive gaps, and grant alignment for community colleges.",
  url: "https://withwavelength.com/discover",
  brand: { "@type": "Brand", name: "Wavelength" },
  offers: {
    "@type": "Offer",
    price: "1500",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://withwavelength.com/discover",
  },
};

export default function DiscoverPage() {
  return (
    <div className="overflow-x-hidden bg-[#050510]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(discoverProductJsonLd) }}
      />
      {/* ===== HERO ===== */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-24 pb-16">
        <Stars count={200} />
        <Aurora />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">Market Intelligence</span>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)' }}
            >
              Market Scan
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200} duration={800}>
            <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
              Find out exactly what programs your region needs — before you invest a dollar in development.
            </p>
            <p className="mt-3 text-base md:text-lg text-white/45 max-w-2xl mx-auto leading-relaxed">
              A 25+ page report with scored opportunities, competitive gaps, employer demand signals, grant alignment, and hidden opportunities your competitors will miss. All from 50+ verified sources.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={350} duration={800}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/#hero">
                <button className="btn-cosmic btn-cosmic-ghost">
                  Start Free — Pell Readiness Check
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </a>
              <a href="mailto:hello@withwavelength.com?subject=Market%20Scan%20Order&body=College%20name%3A%20%0ACity%2C%20State%3A%20%0AAny%20focus%20areas%3A%20">
                <button className="btn-cosmic btn-cosmic-primary">
                  Order a Market Scan — $1,500
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </a>
            </div>
            <p className="mt-4 text-sm text-white/80">
              Not sure yet?{' '}
              <Link href="/report/demo" className="text-white/70 hover:text-white/70 underline underline-offset-4 transition-colors">
                See a real example first
              </Link>
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== WHAT'S INSIDE ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline">What You Get</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-16">
            <h2
              className="font-heading font-bold text-white"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Six phases of research. One comprehensive Market Scan.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                title: 'Regional Intelligence',
                desc: 'Your institution profiled. Top employers mapped. Economic trends identified. Existing programs cataloged.',
              },
              {
                icon: TrendingUp,
                title: 'Demand Signal Detection',
                desc: 'Employment data, active job postings, employer expansion signals, and matching grant opportunities — from 50+ verified sources.',
              },
              {
                icon: Users,
                title: 'Competitive Landscape',
                desc: 'Every provider in your region mapped. Their programs cataloged. White space and competitive gaps identified.',
              },
              {
                icon: Target,
                title: 'Opportunity Scoring',
                desc: 'Each opportunity scored across 5 dimensions: demand, competition, revenue, wages, and launch speed.',
              },
              {
                icon: Sparkles,
                title: 'Blue Ocean Scanner',
                desc: 'The opportunities no standard analysis finds. Employer pain points, supply chain gaps, and emerging roles before they hit any database.',
              },
              {
                icon: FileText,
                title: 'The Market Scan Report',
                desc: '25+ page report with scored programs, evidence trails, grant alignment, barriers, Workforce Pell readiness scores, and specific next steps.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-cosmic rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-heading font-semibold text-white mb-2">{title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== SAMPLE FINDINGS ===== */}
      <section className="relative py-20 md:py-28" id="sample">
        <div className="max-w-[1000px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline">Real Results</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-12">
            <h2
              className="font-heading font-bold text-white"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              What we found for Wake Technical Community College
            </h2>
            <p className="text-white/70 text-sm mt-2">
              Research Triangle — Raleigh, Durham, Chapel Hill · Real data, real analysis
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="card-cosmic rounded-2xl overflow-hidden">
              {/* Conventional */}
              <div className="p-6 md:p-8 border-b border-white/[0.06]">
                <h3 className="text-xs font-medium uppercase tracking-widest text-white/70 mb-4">
                  Conventional Opportunities
                </h3>
                <div className="space-y-2">
                  {[
                    { name: 'Healthcare Management Certificate', score: 8.7, tag: 'Quick Win' },
                    { name: 'Construction Management Certificate', score: 8.5, tag: 'Quick Win' },
                    { name: 'Industrial Machinery Maintenance', score: 8.1, tag: 'Strategic Build' },
                    { name: 'Plumbing Technology Certificate', score: 8.0, tag: 'Quick Win' },
                    { name: 'Cybersecurity Fundamentals', score: 7.9, tag: 'Quick Win' },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-white/[0.02]">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white/80 text-sm">{p.name}</span>
                        <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.05] text-white/70">
                          {p.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-14 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{ width: `${(p.score / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-white/70 text-sm font-mono w-7 text-right">{p.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blue Ocean */}
              <div className="p-6 md:p-8">
                <h3 className="text-xs font-medium uppercase tracking-widest text-white/70 mb-1">
                  Blue Ocean — Hidden Opportunities
                </h3>
                <p className="text-white/80 text-xs mb-4">
                  The programs standard analyses miss entirely
                </p>
                <div className="space-y-2">
                  {[
                    { name: 'Biologics Manufacturing Quality Systems', score: 9.05 },
                    { name: 'Educational Facilities Operations Specialist', score: 8.55 },
                    { name: 'State Government Workforce Transition Bridge', score: 8.0 },
                    { name: 'Healthcare Supply Chain Coordination', score: 7.85 },
                    { name: 'Entertainment Venue Technical Operations', score: 7.35 },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-teal-500/[0.03] border border-teal-500/[0.08]">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white/80 text-sm">{p.name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cosmic-teal/20 text-teal-300 border border-teal-500/20">
                          Blue Ocean
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-14 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                            style={{ width: `${(p.score / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-teal-300/70 text-sm font-mono w-7 text-right">{p.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 md:p-8 border-t border-white/[0.06] flex justify-center">
                <Link href="/report/demo">
                  <button className="btn-cosmic btn-cosmic-ghost text-sm">
                    Read the Full Wake Tech Market Scan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== WHAT MAKES THIS DIFFERENT ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <h2
              className="font-heading font-bold text-white"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Not another labor market report.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="space-y-6">
            {[
              {
                title: 'Every claim is sourced',
                desc: 'No made-up statistics. Every data point links back to verified sources. Your VP of Instruction can verify anything.',
              },
              {
                title: 'We find what standard tools miss',
                desc: 'Standard LMI tools only know about occupations already categorized. Our Blue Ocean Scanner finds demand from live signals — employer pain points, supply chain gaps, economic development announcements — before they show up in any database.',
              },
              {
                title: 'Scored and ranked, not just listed',
                desc: 'Every opportunity is scored across demand evidence, competitive gap, revenue viability, wage outcomes, and launch speed. You get a clear priority order — not a 50-page PDF where everything looks equally important.',
              },
              {
                title: 'Built for action, not the shelf',
                desc: 'Each program section includes specific barriers, grant alignment, and "What Validation Would Confirm" questions. This is a decision document, not a research paper.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-4">
                <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading font-semibold text-white mb-1">{title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== FREE ENTRY POINT + PAID PRODUCT ===== */}
      <section className="relative py-20 md:py-28" id="get-started">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <span className="overline">Get Started</span>
            <h2
              className="font-heading font-bold text-white mt-4"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Start free. Go deeper when you&apos;re ready.
            </h2>
            <p className="text-white/70 mt-3 max-w-xl mx-auto">
              The Pell Readiness Check is free and gets you started in 60 seconds. When you&apos;re ready for full market intelligence, a Market Scan is the next step.
            </p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free tier */}
            <AnimateOnScroll variant="scale" delay={100}>
              <div className="card-cosmic rounded-2xl p-8 md:p-10 text-center border-teal-500/20 h-full flex flex-col">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-5 mx-auto">
                  <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-teal-300 text-xs font-medium">Free — No Credit Card</span>
                </div>

                <h3 className="font-heading font-bold text-white text-xl mb-2">Pell Readiness Check</h3>
                <p className="text-white/70 text-sm mb-5">
                  Find out if your programs qualify for Workforce Pell before July 1, 2026.
                </p>

                <div className="mb-5">
                  <span className="font-heading font-bold text-4xl text-white">$0</span>
                </div>

                <ul className="text-left max-w-xs mx-auto space-y-3 mb-7 flex-1">
                  {[
                    'Program eligibility assessment',
                    'Clock-hour compliance review',
                    'Pell gap identification',
                    'Delivered in ~48 hours',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <a href="/">
                  <button className="btn-cosmic btn-cosmic-ghost w-full sm:w-auto">
                    Get Free Pell Check
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </a>
                <p className="text-white/70 text-xs mt-3">No login required.</p>
              </div>
            </AnimateOnScroll>

            {/* Paid tier */}
            <AnimateOnScroll variant="scale" delay={200}>
              <div className="card-cosmic rounded-2xl p-8 md:p-10 text-center border-purple-500/20 h-full flex flex-col relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/20">
                    Founding Rate
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="font-heading font-bold text-white text-xl mb-2">Market Scan</h3>
                  <p className="text-white/70 text-sm mb-5">
                    Full market intelligence — 25+ pages, 50+ sources, programs scored and ranked.
                  </p>

                  <div className="mb-1">
                    <span className="font-heading font-bold text-4xl text-white">$1,500</span>
                    <span className="text-white/80 text-sm ml-2 line-through">$3,500</span>
                  </div>
                  <p className="text-white/80 text-xs mb-5">Founding rate — first 5 institutions</p>

                  <ul className="text-left max-w-xs mx-auto space-y-3 mb-7 flex-1">
                    {[
                      'Full 25+ page Market Scan',
                      'Conventional + Blue Ocean opportunities',
                      '50+ sources cited & verified',
                      'Scored & ranked program recommendations',
                      'Workforce Pell readiness scoring',
                      'Grant alignment for each program',
                      'Delivered in ~1 week',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                        <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <a href="mailto:hello@withwavelength.com?subject=Market%20Scan%20Order&body=College%20name%3A%20%0ACity%2C%20State%3A%20%0AAny%20focus%20areas%3A%20">
                    <button className="btn-cosmic btn-cosmic-primary w-full sm:w-auto">
                      Order Market Scan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </a>
                  <p className="text-white/70 text-xs mt-3">
                    We&apos;ll follow up within 48 hours.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ===== WHAT HAPPENS NEXT ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[800px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <h2
              className="font-heading font-bold text-white"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              After Your Market Scan
            </h2>
            <p className="text-white/70 mt-3">
              Your Market Scan identifies the opportunities. The next stages help you act on them.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="space-y-4">
            {[
              {
                stage: '2',
                name: 'Program Validation',
                desc: 'Deep-dive feasibility analysis with financial projections, employer verification, and a GO / NO-GO recommendation.',
              },
              {
                stage: '3',
                name: 'Curriculum Design & Development',
                desc: 'Competency mapping, course architecture, and learning outcomes built from real occupation data.',
              },
              {
                stage: '4–8',
                name: 'Pathway Development → Launch → QC',
                desc: 'Stackable credentials, course content, marketing strategy, launch readiness, and outcomes tracking.',
              },
            ].map(({ stage, name, desc }) => (
              <div key={stage} className="flex gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-sm text-white/80">{stage}</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-white text-sm">{name}</h3>
                  <p className="text-white/70 text-sm mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>

          <AnimateOnScroll variant="fade-up" delay={300} className="text-center mt-10">
            <Link href="/validate">
              <button className="btn-cosmic btn-cosmic-ghost text-sm">
                Learn About Program Validation
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
