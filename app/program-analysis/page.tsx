import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';

export const metadata: Metadata = {
  title: 'Program Portfolio Analysis for Community Colleges | Wavelength',
  description: "Understand what programs you're missing, what you already have that qualifies for Workforce Pell, and where your compliance gaps are costing you.",
  alternates: { canonical: 'https://withwavelength.com/program-analysis' },
};

export default function ProgramAnalysisPage() {
  return (
    <div className="overflow-x-hidden bg-[#050510]">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-24 pb-16">
        <Stars count={200} />
        <Aurora />
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Program Analysis</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)' }}
            >
              Know exactly what your portfolio is — and isn&apos;t — doing.
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200}>
            <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto mt-6 leading-relaxed">
              Two tools. One clear picture. Pell Readiness Check tells you which programs qualify for federal funding starting July 1, 2026. Program Gap Audit shows you every state-mandated program you&apos;re not offering — and what each one is worth.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={300}>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {['Free Pell check', '$295 gap audit', '48–72hr turnaround'].map(s => (
                <span key={s} className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300 font-medium">
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
            <h2 className="font-heading font-bold text-white" style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}>
              Who this is for
            </h2>
          </AnimateOnScroll>
          <StaggerChildren stagger={100} variant="fade-up" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: 'VP of Academic Affairs', pain: 'You need a clear, defensible picture of your portfolio before the next board meeting or accreditation cycle.' },
              { role: 'Workforce Development Director', pain: "You're trying to maximize Workforce Pell eligibility and need to know which programs qualify — and which need adjustments." },
              { role: 'Dean / Department Chair', pain: "You've heard there are compliance gaps in your catalog. You need to know exactly what they are and what they're worth before you bring it to leadership." },
            ].map(({ role, pain }) => (
              <div key={role} className="card-cosmic rounded-2xl p-6 border-blue-500/20">
                <h3 className="font-heading font-semibold text-blue-300 text-sm uppercase tracking-wider mb-3">{role}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{pain}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== PRODUCTS ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimateOnScroll variant="fade-up">
              <div className="card-cosmic rounded-2xl p-8 border-blue-500/20 h-full">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 mb-4">
                  <span className="text-teal-300 text-[10px] font-bold uppercase tracking-wider">Free</span>
                </div>
                <h3 className="font-heading font-bold text-white text-xl mb-3">Pell Readiness Check</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Full catalog review against federal and state Workforce Pell criteria. Know which programs qualify before the July 1 deadline.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    'Full program catalog review against federal + state Pell criteria',
                    'Clock-hour compliance assessment',
                    'Eligibility scoring per program',
                    'Gap identification — programs you should add',
                    'Action plan with next steps',
                    'Delivered in 48 hours',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/pell">
                  <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                    Start Free Pell Check
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={100}>
              <div className="card-cosmic rounded-2xl p-8 border-blue-500/20 h-full">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 mb-4">
                  <span className="text-blue-300 text-[10px] font-bold uppercase tracking-wider">$295</span>
                </div>
                <h3 className="font-heading font-bold text-white text-xl mb-3">Program Gap Audit</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Every state-mandated program you&apos;re not offering — with revenue estimates and statutory citations.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    "Every state-mandated program you're not offering",
                    'Revenue estimate per gap (average: $2M+ uncaptured)',
                    'Statutory citations for every finding',
                    'Prioritized opportunity ranking',
                    'Board-ready report format',
                    'State-specific (not a national template)',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/compliance-gap">
                  <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                    Order Program Gap Audit — $295
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ===== HOW IT CONNECTS ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <h2 className="font-heading font-bold text-white" style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}>
              How it connects
            </h2>
            <p className="text-white/70 mt-4 max-w-2xl mx-auto">
              Program Analysis tells you what you have and what you&apos;re missing. Market Research shows you what new programs your region is ready for. Grant Alignment finds funding to build what you discover.
            </p>
          </AnimateOnScroll>
          <StaggerChildren stagger={100} variant="fade-up" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', label: 'Program Analysis', desc: 'Audit what you have', href: '/program-analysis', active: true },
              { step: '2', label: 'Market Research', desc: 'Find what to build', href: '/market-research', active: false },
              { step: '3', label: 'Grant Alignment', desc: 'Find the funding', href: '/grant-alignment', active: false },
            ].map(({ step, label, desc, href, active }) => (
              <Link key={step} href={href} className={`block p-5 rounded-xl border ${active ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/[0.06] bg-white/[0.02]'} hover:bg-white/[0.04] transition-colors`}>
                <span className="font-mono text-xs text-white/40">Step {step}</span>
                <h3 className={`font-heading font-semibold text-sm mt-1 ${active ? 'text-blue-300' : 'text-white'}`}>{label}</h3>
                <p className="text-white/60 text-xs mt-1">{desc}</p>
              </Link>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-20 md:py-28 text-center">
        <div className="max-w-[600px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <h2 className="font-heading font-bold text-white text-2xl md:text-3xl mb-6">
              Start with what you know — your existing catalog.
            </h2>
            <Link href="/pell">
              <button className="btn-cosmic btn-cosmic-primary text-sm">
                Start with the free Pell check
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
            <div className="mt-4">
              <Link href="/compliance-gap" className="text-sm text-white/50 hover:text-white/70 transition-colors">
                Order a Program Gap Audit — $295 →
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
