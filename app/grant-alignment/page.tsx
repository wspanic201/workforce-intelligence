import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';

export const metadata: Metadata = {
  title: 'Grant Intelligence for Community College Workforce Programs | Wavelength',
  description: 'Find and prioritize the federal, state, and foundation grants your workforce programs qualify for. Scored, ranked, and ready to pursue — by Wavelength, the workforce program intelligence platform for community colleges.',
  alternates: { canonical: 'https://withwavelength.com/grant-alignment' },
};

export default function GrantAlignmentPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-24 pb-16">
        <Stars count={100} />
        <Aurora className="opacity-75" />
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Grant Alignment</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)' }}
            >
              Find the funding your programs already qualify for.
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200}>
            <p className="text-theme-secondary text-lg md:text-xl max-w-3xl mx-auto mt-6 leading-relaxed">
              Most institutions pursue fewer than a third of the grants they&apos;re eligible for. Not because the funding isn&apos;t there — because finding, evaluating, and prioritizing 30+ opportunities takes research capacity most teams don&apos;t have. We do it for you in a week.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={300}>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {['30+ grants scanned', '$500 one-time', '~1 week turnaround'].map(s => (
                <span key={s} className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-sm text-green-300 font-medium">
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
              { role: 'Workforce Development Director', pain: 'You know Perkins V and WIOA funding exists, but you need a prioritized list of what to actually pursue this cycle.' },
              { role: 'VP of Finance / Budget Officer', pain: "You're looking for external funding sources to offset program development costs before next fiscal year." },
              { role: 'Grant Writer / Development Office', pain: "You need a pre-qualified, scored list of grant opportunities with past award data and effort estimates before you write a single word." },
            ].map(({ role, pain }) => (
              <div key={role} className="card-cosmic rounded-2xl p-6 border-green-500/20">
                <h3 className="font-heading font-semibold text-green-300 text-sm uppercase tracking-wider mb-3">{role}</h3>
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
            <div className="card-cosmic rounded-2xl p-8 md:p-10 border-green-500/20">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 mb-4">
                <span className="text-green-300 text-[10px] font-bold uppercase tracking-wider">$500</span>
              </div>
              <h3 className="font-heading font-bold text-theme-primary text-2xl mb-3">Grant Finder</h3>
              <p className="text-theme-secondary text-sm leading-relaxed mb-6">
                We scan 30+ federal and foundation grants, score each against your institution profile, and deliver a ranked, prioritized report — ready to act on.
              </p>
              <ul className="space-y-2.5 mb-6">
                {[
                  '30+ federal and foundation grants scanned',
                  'Eligibility scored against your institution profile',
                  'Ranked by: fit score, award size, competition level, and strategic value',
                  'Past award data and typical applicant profiles',
                  'Effort-to-reward analysis (so you pursue the right ones)',
                  'Application deadlines and key requirements',
                  'Strategic positioning notes (what makes your institution competitive)',
                  'Professional PDF report, ~1 week turnaround',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-theme-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-theme-tertiary mb-6 italic">
                Many institutions fund the Grant Finder itself through Perkins V or institutional effectiveness line items.
              </p>
              <Link href="/grants">
                <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                  Learn More About Grant Finder
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
              Grant Alignment works best after Market Research or Program Analysis — once you know what you&apos;re building, we help you fund it. Perkins V, WIOA Title I, and state workforce development grants can all support program intelligence work like Wavelength.
            </p>
          </AnimateOnScroll>
          <StaggerChildren stagger={100} variant="fade-up" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', label: 'Market Research', desc: 'Find what to build', href: '/market-research', active: false },
              { step: '2', label: 'Program Analysis', desc: 'Audit what you have', href: '/program-analysis', active: false },
              { step: '3', label: 'Grant Alignment', desc: 'Find the funding', href: '/grant-alignment', active: true },
            ].map(({ step, label, desc, href, active }) => (
              <Link key={step} href={href} className={`block p-5 rounded-xl border ${active ? 'border-green-500/30 bg-green-500/5' : 'border-theme-subtle bg-white/[0.02]'} hover:bg-white/[0.04] transition-colors`}>
                <span className="font-mono text-xs text-theme-muted">Step {step}</span>
                <h3 className={`font-heading font-semibold text-sm mt-1 ${active ? 'text-green-300' : 'text-theme-primary'}`}>{label}</h3>
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
              Stop leaving funding on the table.
            </h2>
            <Link href="/contact">
              <button className="btn-cosmic btn-cosmic-primary text-sm">
                Order Grant Finder — $500
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
            <div className="mt-4">
              <Link href="/discover" className="text-sm text-theme-tertiary hover:text-theme-secondary transition-colors">
                Not sure what to build yet? Start with Market Research →
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
