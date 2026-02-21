import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';

export const metadata: Metadata = {
  title: 'Feasibility Report for Community Colleges | Wavelength',
  description: 'Validate new program ideas with real market data before you invest in curriculum, advisory boards, and approvals — by Wavelength, the workforce program intelligence platform for community colleges.',
  alternates: { canonical: 'https://withwavelength.com/program-development' },
};

export default function ProgramDevelopmentPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-24 pb-16">
        <Stars count={100} />
        <Aurora className="opacity-75" />
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Program Development</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)' }}
            >
              Validate demand before you invest in development.
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200}>
            <p className="text-theme-secondary text-lg md:text-xl max-w-3xl mx-auto mt-6 leading-relaxed">
              A Market Scan tells you what to build. Feasibility Report tells you whether a specific idea is worth the investment — with a full financial model, competitive analysis, and accreditation pathway mapped out before you write a single course objective.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={300}>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {['7 validation dimensions', '5-year financial model', '~1 week turnaround'].map(s => (
                <span key={s} className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300 font-medium">
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
              { role: 'Department Chair', pain: "You've pitched a new program and need data behind it before leadership will approve the budget." },
              { role: 'Curriculum Coordinator', pain: "You've been asked to develop a new program and need to understand the employer landscape before you start writing competencies." },
              { role: 'Workforce Development Director', pain: 'You have a specific program in mind — maybe from a Market Scan lead — and need to validate it fully before committing.' },
            ].map(({ role, pain }) => (
              <div key={role} className="card-cosmic rounded-2xl p-6 border-emerald-500/20">
                <h3 className="font-heading font-semibold text-emerald-300 text-sm uppercase tracking-wider mb-3">{role}</h3>
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
            <div className="card-cosmic rounded-2xl p-8 md:p-10 border-emerald-500/20">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
                <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">$2,000</span>
              </div>
              <h3 className="font-heading font-bold text-theme-primary text-2xl mb-3">Feasibility Report</h3>
              <p className="text-theme-secondary text-sm leading-relaxed mb-6">
                Full feasibility analysis for a specific program idea — market validation, financial model, competitive intelligence, and a Go/No-Go recommendation.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  'Deep market validation (primary employer data, not just BLS)',
                  'Full 5-year financial model (enrollment, revenue, costs, break-even)',
                  'Competitive intelligence (who else offers this, how you differentiate)',
                  'Regulatory & accreditation pathway (HLC, state boards, certification bodies)',
                  'Workforce Pell eligibility analysis',
                  'Employer partnership opportunities',
                  'Go/Conditional Go/No-Go recommendation with rationale',
                  '35+ page report',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-theme-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/validate">
                <button className="btn-cosmic btn-cosmic-primary w-full text-sm">
                  Learn More About Feasibility Report
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
              Feasibility Report is most powerful when it follows Market Research. A Program Finder identifies what your region needs — Validation confirms that one specific program is worth building. After validation, Grant Alignment finds funding.
            </p>
          </AnimateOnScroll>
          <StaggerChildren stagger={100} variant="fade-up" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', label: 'Market Research', desc: 'Find what to build', href: '/market-research', active: false },
              { step: '2', label: 'Feasibility Report', desc: 'Confirm demand is real', href: '/program-development', active: true },
              { step: '3', label: 'Grant Alignment', desc: 'Find the funding', href: '/grant-alignment', active: false },
            ].map(({ step, label, desc, href, active }) => (
              <Link key={step} href={href} className={`block p-5 rounded-xl border ${active ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-theme-subtle bg-white/[0.02]'} hover:bg-white/[0.04] transition-colors`}>
                <span className="font-mono text-xs text-theme-muted">Step {step}</span>
                <h3 className={`font-heading font-semibold text-sm mt-1 ${active ? 'text-emerald-300' : 'text-theme-primary'}`}>{label}</h3>
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
              Have a program idea? Let&apos;s validate it.
            </h2>
            <Link href="/contact">
              <button className="btn-cosmic btn-cosmic-primary text-sm">
                Order Feasibility Report — $2,000
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
            <div className="mt-4">
              <Link href="/market-research" className="text-sm text-theme-tertiary hover:text-theme-secondary transition-colors">
                Start with a Program Finder first →
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
