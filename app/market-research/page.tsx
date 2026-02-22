import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';

export const metadata: Metadata = {
  title: 'Market Research for Community College Programs | Wavelength',
  description: 'Find the workforce programs your region actually needs. Data-backed program opportunity scans for community college CE and workforce teams — by Wavelength, the workforce program intelligence platform for community colleges.',
  alternates: { canonical: 'https://withwavelength.com/market-research' },
};

export default function MarketResearchPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-24 pb-16">
        <Stars count={100} />
        <Aurora className="opacity-75" />
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Market Research</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)' }}
            >
              Build programs your region is already asking for.
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200}>
            <p className="text-theme-secondary text-lg md:text-xl max-w-3xl mx-auto mt-6 leading-relaxed">
              Stop relying on advisory board gut feelings and outdated LMI reports. Wavelength surfaces live demand signals — employer postings, economic shifts, competitive gaps — and turns them into program opportunities you can act on.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={300}>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {['50+ live sources', '7–10 opportunities per scan', '~1 week turnaround'].map(s => (
                <span key={s} className="inline-flex items-center px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-sm text-violet-300 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== WHO THIS IS FOR ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[1000px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <h2 className="font-heading font-bold text-theme-primary" style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}>
              Who this is for
            </h2>
          </AnimateOnScroll>
          <StaggerChildren stagger={100} variant="fade-up" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: 'VP of Academic Affairs', pain: 'You need to justify new program investment to a board that wants evidence, not intuition. We give you the data layer.' },
              { role: 'Workforce Development Director', pain: "You're fielding requests from local employers who can't find trained workers. We tell you exactly which programs fill that gap." },
              { role: 'Strategic Planning Lead', pain: "You're building a 3-year program roadmap and need regional market data that goes beyond what Lightcast can give you." },
            ].map(({ role, pain }) => (
              <div key={role} className="card-cosmic rounded-2xl p-6 border-violet-500/20">
                <h3 className="font-heading font-semibold text-violet-300 text-sm uppercase tracking-wider mb-3">{role}</h3>
                <p className="text-theme-secondary text-sm leading-relaxed">{pain}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== PRODUCT ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[800px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="card-cosmic rounded-2xl p-8 md:p-10 border-violet-500/20">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 mb-4">
                <span className="text-violet-300 text-[10px] font-bold uppercase tracking-wider">$1,500</span>
              </div>
              <h3 className="font-heading font-bold text-theme-primary text-2xl mb-3">Program Finder</h3>
              <p className="text-theme-secondary text-sm leading-relaxed mb-6">
                We research your regional labor market across 50+ sources and deliver 7–10 validated program opportunities — each scored, ranked, and backed by real employer demand.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  '7–10 validated program opportunities',
                  '50+ data sources analyzed',
                  '6-phase research pipeline',
                  'Scored and ranked by opportunity strength',
                  'Workforce Pell readiness assessment',
                  'Grant alignment for each opportunity',
                  '25+ page professional report',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-theme-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/discover">
                <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                  Learn More About Program Finder
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== HOW IT CONNECTS ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <h2 className="font-heading font-bold text-theme-primary" style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}>
              How it connects
            </h2>
            <p className="text-theme-secondary mt-4 max-w-2xl mx-auto">
              Market Research is the starting point. Once you know what to build, Feasibility Study confirms the demand is deep enough to justify investment. Grant Alignment finds the funding to build it.
            </p>
          </AnimateOnScroll>
          <StaggerChildren stagger={100} variant="fade-up" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', label: 'Market Research', desc: 'Find what to build', href: '/market-research', active: true },
              { step: '2', label: 'Feasibility Study', desc: 'Confirm demand is real', href: '/program-development', active: false },
              { step: '3', label: 'Grant Alignment', desc: 'Find the funding', href: '/grant-alignment', active: false },
            ].map(({ step, label, desc, href, active }) => (
              <Link key={step} href={href} className={`block p-5 rounded-xl border ${active ? 'border-violet-500/30 bg-violet-500/5' : 'border-theme-subtle bg-white/[0.02]'} hover:bg-white/[0.04] transition-colors`}>
                <span className="font-mono text-xs text-theme-muted">Step {step}</span>
                <h3 className={`font-heading font-semibold text-sm mt-1 ${active ? 'text-violet-300' : 'text-theme-primary'}`}>{label}</h3>
                <p className="text-theme-tertiary text-xs mt-1">{desc}</p>
              </Link>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-20 md:py-28 text-center">
        <div className="max-w-[600px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <h2 className="font-heading font-bold text-theme-primary text-2xl md:text-3xl mb-6">
              Ready to discover what your region needs?
            </h2>
            <Link href="/contact">
              <button className="btn-cosmic btn-cosmic-primary text-sm">
                Run a Program Finder
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
            <div className="mt-4">
              <Link href="/pell" className="text-sm text-theme-tertiary hover:text-theme-secondary transition-colors">
                Start free — Pell Readiness Check →
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
