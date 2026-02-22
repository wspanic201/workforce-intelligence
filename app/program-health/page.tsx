import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';

export const metadata: Metadata = {
  title: 'Program Health & Curriculum Alignment | Wavelength Curriculum Drift Analysis',
  description: 'Keep existing workforce programs aligned to employer demand. Quarterly drift scans compare your curriculum against live job postings and deliver a Drift Score — by Wavelength, the workforce program intelligence platform for community colleges.',
  alternates: { canonical: 'https://withwavelength.com/program-health' },
};

export default function ProgramHealthPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-24 pb-16">
        <Stars count={100} />
        <Aurora className="opacity-75" />
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Monitor</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)' }}
            >
              The market doesn&apos;t wait for your next curriculum review cycle.
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200}>
            <p className="text-theme-secondary text-lg md:text-xl max-w-3xl mx-auto mt-6 leading-relaxed">
              We scan live job postings against your course outcomes and show you exactly where programs are falling behind.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={300}>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {['Quarterly scans', '$495/scan', 'Accreditation-ready reports'].map(s => (
                <span key={s} className="inline-flex items-center gap-1.5 text-xs font-medium text-theme-tertiary">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
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
              { role: 'Department Chair', pain: "You're responsible for program quality and accreditation readiness. You need documented proof that your curriculum reflects current employer requirements." },
              { role: 'Curriculum Coordinator', pain: "You don't have time for a full curriculum review every year, but you need to know which courses need updating before they affect placement rates." },
              { role: 'VP Academic Affairs', pain: "You're managing Workforce Pell placement requirements (70% within 180 days) and need early warning when a program is drifting toward non-compliance." },
            ].map(({ role, pain }) => (
              <div key={role} className="card-cosmic rounded-2xl p-6 border-orange-500/20">
                <h3 className="font-heading font-semibold text-orange-300 text-sm uppercase tracking-wider mb-3">{role}</h3>
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
            <div className="card-cosmic rounded-2xl p-8 md:p-10 border-orange-500/20">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-theme-tertiary mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                $495/scan
              </span>
              <h3 className="font-heading font-bold text-theme-primary text-2xl mb-3">Curriculum Drift Analysis</h3>
              <p className="text-theme-secondary text-sm leading-relaxed mb-6">
                Quarterly scans of live job postings against your curriculum. A Drift Score tells you exactly where programs are falling behind employer demand.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  'Quarterly curriculum scans against live job postings',
                  'Drift Score per program (0–100)',
                  'Skill-by-skill gap analysis',
                  'Accreditation-ready reports',
                  'Trend tracking over time',
                  'Perkins V / WIOA eligible expense',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-theme-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/drift">
                <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                  See Full Curriculum Drift Analysis Details & Pricing
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
              Program Health is the ongoing layer. Market Research finds the right programs to build. Feasibility Study confirms demand. Curriculum Drift Analysis keeps them aligned once they&apos;re live.
            </p>
          </AnimateOnScroll>
          <StaggerChildren stagger={100} variant="fade-up" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', label: 'Market Research', desc: 'Find what to build', href: '/market-research', active: false },
              { step: '2', label: 'Feasibility Study', desc: 'Confirm demand', href: '/program-development', active: false },
              { step: '3', label: 'Program Health', desc: 'Keep programs aligned', href: '/program-health', active: true },
            ].map(({ step, label, desc, href, active }) => (
              <Link key={step} href={href} className={`block p-5 rounded-xl border ${active ? 'border-orange-500/30 bg-orange-500/5' : 'border-theme-subtle bg-white/[0.02]'} hover:bg-white/[0.04] transition-colors`}>
                <span className="font-mono text-xs text-theme-muted">Step {step}</span>
                <h3 className={`font-heading font-semibold text-sm mt-1 ${active ? 'text-orange-300' : 'text-theme-primary'}`}>{label}</h3>
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
              See how your programs are performing.
            </h2>
            <Link href="/drift">
              <button className="btn-cosmic btn-cosmic-primary text-sm">
                Order a Drift Scan
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
            <div className="mt-4">
              <Link href="/drift" className="text-sm text-theme-tertiary hover:text-theme-secondary transition-colors">
                See the full Curriculum Drift Analysis page →
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
