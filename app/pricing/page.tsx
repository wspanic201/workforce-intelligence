import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';

export const metadata: Metadata = {
  title: 'Pricing | Wavelength — Workforce Program Intelligence',
  description:
    'Transparent pricing for every Wavelength service. From free Pell checks to full program validation — intelligence that pays for itself.',
  alternates: { canonical: 'https://withwavelength.com/pricing' },
};

/* ─── Service Data ──────────────────────────────────────────────────────── */

interface Service {
  name: string;
  slug: string;
  price: string;
  priceNote?: string;
  description: string;
  turnaround: string;
  features: string[];
  category: 'core' | 'addon';
  cta: string;
  ctaStyle: 'primary' | 'secondary' | 'ghost';
  badge?: string;
  sampleReport?: string;
}

const SERVICES: Service[] = [
  {
    name: 'Pell Readiness Check',
    slug: 'pell',
    price: 'Free',
    description: 'Score your noncredit programs against Workforce Pell eligibility criteria before you apply.',
    turnaround: '< 24 hours',
    features: [
      'Full program catalog classification',
      'Pell eligibility scoring per program',
      'Gap-to-eligible pathway recommendations',
      'BLS wage data for eligible occupations',
    ],
    category: 'addon',
    cta: 'Start Free Check',
    ctaStyle: 'primary',
    badge: 'FREE',
    sampleReport: '/report/pell-demo',
  },
  {
    name: 'Program Opportunity Scan',
    slug: 'discover',
    price: '$1,500',
    description: 'Identify the highest-potential new programs for your region — scored, ranked, and backed by real employer demand data.',
    turnaround: '5–7 business days',
    features: [
      '8–12 program opportunities scored & ranked',
      'Regional employer demand analysis',
      'Competitive landscape mapping',
      'Blue ocean opportunity identification',
      'Grant eligibility matrix',
      'Implementation timeline estimates',
    ],
    category: 'core',
    cta: 'Get Started',
    ctaStyle: 'primary',
    sampleReport: '/report/wake-tech-program-opportunity-scan',
  },
  {
    name: 'Program Validation',
    slug: 'validate',
    price: '$3,500',
    description: 'Seven-specialist feasibility analysis with financial projections and a definitive GO / NO-GO recommendation.',
    turnaround: '7–10 business days',
    features: [
      'Market demand validation (BLS + real postings)',
      'Financial viability model with P&L projections',
      'Employer demand verification',
      'Competitive positioning analysis',
      'Regulatory & accreditation compliance check',
      'Student demand signals',
      'Composite GO / NO-GO score',
    ],
    category: 'core',
    cta: 'Get Started',
    ctaStyle: 'primary',
    badge: 'MOST POPULAR',
    sampleReport: '/report/kirkwood-pharmtech-validation',
  },
  {
    name: 'Program Gap Audit',
    slug: 'compliance-gap',
    price: '$295',
    description: 'Compare your program catalog against state mandates and identify compliance gaps with revenue estimates.',
    turnaround: '3–5 business days',
    features: [
      'Full catalog scan vs. state requirements',
      'Gap identification with statute citations',
      'Revenue potential per gap (Year 1 & Year 2+)',
      'Market-rate tuition benchmarking',
      'Priority-ranked implementation roadmap',
    ],
    category: 'addon',
    cta: 'Get Started',
    ctaStyle: 'secondary',
    sampleReport: '/report/hawkeye-gap-audit',
  },
  {
    name: 'Grant Intelligence Scan',
    slug: 'grants',
    price: '$495',
    description: 'Surface and prioritize every federal grant your programs qualify for — scored, ranked, and ready to pursue.',
    turnaround: '5–7 business days',
    features: [
      '20+ grants from Grants.gov + web sources',
      '5-dimension fit scoring per grant',
      'Past award intelligence & success rates',
      'Application requirements analysis',
      'Effort estimates per application',
      'Deadline calendar & action plan',
    ],
    category: 'addon',
    cta: 'Get Started',
    ctaStyle: 'secondary',
    sampleReport: '/report/valencia-grant-scan',
  },
  {
    name: 'Curriculum Drift Analysis',
    slug: 'drift',
    price: '$495',
    priceNote: 'per program',
    description: 'Annual review that flags where course content has fallen behind employer expectations and industry standards.',
    turnaround: '5–7 business days',
    features: [
      'Employer skill demand analysis (real job postings)',
      'O*NET federal baseline comparison',
      'Curriculum auto-scraping & gap identification',
      'Covered / Gap / Stale skill classification',
      'Drift score with severity rating',
      'Actionable curriculum update recommendations',
    ],
    category: 'addon',
    cta: 'Get Started',
    ctaStyle: 'secondary',
    sampleReport: '/report/bellevue-cybersecurity-drift',
  },
];

/* ─── Feature Comparison ────────────────────────────────────────────────── */

const COMPARISON_FEATURES = [
  { label: 'Regional labor market analysis', scan: true, validation: true },
  { label: 'Employer demand data', scan: true, validation: true },
  { label: 'Competitive landscape mapping', scan: true, validation: true },
  { label: 'Program scoring & ranking', scan: true, validation: false },
  { label: 'Financial viability model (P&L)', scan: false, validation: true },
  { label: 'Regulatory compliance check', scan: false, validation: true },
  { label: 'Student demand signals', scan: false, validation: true },
  { label: 'GO / NO-GO recommendation', scan: false, validation: true },
  { label: 'Blue ocean opportunities', scan: true, validation: false },
  { label: 'Grant eligibility matrix', scan: true, validation: false },
  { label: 'Dedicated sample report', scan: true, validation: true },
];

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-theme-page">

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <Stars count={120} />
        <div className="relative z-10 max-w-[900px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <h1
              className="font-heading font-bold text-theme-primary leading-[1.08] mb-4"
              style={{ fontSize: 'clamp(2.2rem, 4.5vw + 0.5rem, 3.4rem)' }}
            >
              Intelligence that pays for itself.
            </h1>
            <p className="text-lg md:text-xl text-theme-secondary leading-relaxed max-w-2xl mx-auto mb-6">
              Every Wavelength service is designed to save your team weeks of research and
              surface revenue opportunities worth 10–50× the investment.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-theme-tertiary">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-teal-400" /> Days, not months</span>
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-purple-400" /> No long-term contracts</span>
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-400" /> Invoice or pay online</span>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Grant Eligibility Callout */}
      <section className="relative pb-12">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="card-cosmic rounded-2xl p-6 md:p-8 text-center border border-teal-500/20">
              <p className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-2">💡 Did you know?</p>
              <p className="text-theme-secondary text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                Most Wavelength services qualify as allowable expenses under{' '}
                <strong className="text-theme-primary">Perkins V</strong>,{' '}
                <strong className="text-theme-primary">WIOA Title II</strong>, and{' '}
                <strong className="text-theme-primary">state workforce development grants</strong>.
                Your institution may already have funding earmarked for program development research.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Core Services */}
      <section className="relative py-12">
        <div className="max-w-[1100px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <p className="label-brand text-center mb-3">Core Program Intelligence Services</p>
            <h2 className="font-heading font-bold text-theme-primary text-center text-2xl md:text-3xl mb-10">
              From discovery to validation
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={120}>
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {SERVICES.filter(s => s.category === 'core').map(service => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* Core Comparison Table */}
      <section className="relative pb-16">
        <div className="max-w-[700px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <h3 className="font-heading font-bold text-theme-primary text-center text-xl mb-6">
              Scan vs. Validation — What&apos;s the difference?
            </h3>
            <div className="card-cosmic rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-theme-subtle">
                    <th className="text-left px-5 py-3 text-theme-secondary font-medium">Feature</th>
                    <th className="text-center px-4 py-3 text-theme-secondary font-medium w-24">Scan</th>
                    <th className="text-center px-4 py-3 text-theme-secondary font-medium w-24">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((row, i) => (
                    <tr key={i} className="border-b border-theme-subtle/50 last:border-0">
                      <td className="px-5 py-2.5 text-theme-tertiary">{row.label}</td>
                      <td className="text-center px-4 py-2.5">
                        {row.scan ? <Check className="h-4 w-4 text-teal-400 mx-auto" /> : <span className="text-theme-muted">—</span>}
                      </td>
                      <td className="text-center px-4 py-2.5">
                        {row.validation ? <Check className="h-4 w-4 text-purple-400 mx-auto" /> : <span className="text-theme-muted">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Add-On Services */}
      <section className="relative py-12">
        <div className="max-w-[1100px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <p className="label-brand text-center mb-3">Add-On Intelligence</p>
            <h2 className="font-heading font-bold text-theme-primary text-center text-2xl md:text-3xl mb-10">
              Targeted reports for specific needs
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100}>
            <div className="grid md:grid-cols-2 gap-6">
              {SERVICES.filter(s => s.category === 'addon').map(service => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* How Payment Works */}
      <section className="relative py-16">
        <div className="max-w-[800px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <h2 className="font-heading font-bold text-theme-primary text-center text-2xl md:text-3xl mb-10">
              Flexible payment options
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-cosmic rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="font-heading font-bold text-theme-primary">Pay Online</h3>
                </div>
                <p className="text-theme-tertiary text-sm leading-relaxed mb-3">
                  Secure credit card checkout. Pay now, get started immediately. Ideal for
                  individual departments or p-card purchases.
                </p>
                <p className="text-theme-muted text-xs">Powered by Stripe — encrypted & PCI compliant.</p>
              </div>
              <div className="card-cosmic rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-teal-400" />
                  </div>
                  <h3 className="font-heading font-bold text-theme-primary">Invoice / PO</h3>
                </div>
                <p className="text-theme-tertiary text-sm leading-relaxed mb-3">
                  Need to process through purchasing? We send a professional invoice with Net-30 terms.
                  W-9 available on request.
                </p>
                <p className="text-theme-muted text-xs">Most colleges process under $5K without board approval.</p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-16">
        <div className="max-w-[700px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <h2 className="font-heading font-bold text-theme-primary text-center text-2xl md:text-3xl mb-10">
              Common questions
            </h2>
            <div className="space-y-6">
              <FaqItem
                q="Can I use grant funding to pay for Wavelength services?"
                a="Yes. Wavelength services qualify as allowable program development expenses under Perkins V, WIOA Title II, and most state workforce development grants. We can provide documentation to support your grant compliance requirements."
              />
              <FaqItem
                q="How long does delivery take?"
                a="Most add-on reports deliver in 3–7 business days. Core services (Opportunity Scan, Program Validation) take 5–10 business days depending on scope. We'll confirm your timeline during onboarding."
              />
              <FaqItem
                q="Do you offer volume discounts?"
                a="Yes — if you're ordering multiple services or running analyses across several programs, reach out for a custom quote. We offer bundled pricing for multi-service engagements."
              />
              <FaqItem
                q="What if I need something custom?"
                a="We build custom intelligence packages for institutions with unique needs. Contact us with your requirements and we'll scope a proposal within 48 hours."
              />
              <FaqItem
                q="Can my Dean approve this without board approval?"
                a="All of our individual services are priced below $5,000 — which falls within most institutions' departmental approval thresholds. No board meeting required."
              />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <h2 className="font-heading font-bold text-theme-primary text-2xl md:text-3xl mb-4">
              Ready to get started?
            </h2>
            <p className="text-theme-secondary text-lg mb-8">
              Start with a free Pell Readiness Check — or tell us what you need.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/pell">
                <button className="btn-cosmic btn-cosmic-primary text-sm py-3 px-8">
                  Start Free Pell Check
                </button>
              </Link>
              <Link href="/contact">
                <button className="btn-cosmic btn-cosmic-ghost text-sm py-3 px-8">
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}

/* ─── Service Card Component ────────────────────────────────────────────── */

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="card-cosmic rounded-2xl p-6 md:p-8 flex flex-col relative">
      {service.badge && (
        <div className="absolute -top-3 left-6">
          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
            service.badge === 'FREE'
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
              : service.badge === 'MOST POPULAR'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}>
            {service.badge}
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-heading font-bold text-theme-primary text-lg mb-1">{service.name}</h3>
        <p className="text-theme-tertiary text-sm leading-relaxed">{service.description}</p>
      </div>

      <div className="mb-5">
        <span className="text-3xl font-bold text-theme-primary">{service.price}</span>
        {service.priceNote && (
          <span className="text-theme-muted text-sm ml-1">/{service.priceNote}</span>
        )}
        <div className="text-theme-muted text-xs mt-1 flex items-center gap-1">
          <Clock className="h-3 w-3" /> {service.turnaround}
        </div>
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        {service.features.map((feat, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-theme-secondary">
            <Check className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2">
        <Link href={service.price === 'Free' ? `/${service.slug}` : '/contact'}>
          <button className={`btn-cosmic w-full text-sm py-2.5 ${
            service.ctaStyle === 'primary' ? 'btn-cosmic-primary' :
            service.ctaStyle === 'secondary' ? 'btn-cosmic-secondary' :
            'btn-cosmic-ghost'
          }`}>
            {service.cta}
          </button>
        </Link>
        {service.sampleReport && (
          <Link
            href={service.sampleReport}
            className="text-xs text-theme-muted hover:text-theme-tertiary text-center transition-colors"
          >
            View sample report →
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─── FAQ Item ──────────────────────────────────────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="card-cosmic rounded-xl p-5">
      <h4 className="font-heading font-bold text-theme-primary text-sm mb-2">{q}</h4>
      <p className="text-theme-tertiary text-sm leading-relaxed">{a}</p>
    </div>
  );
}
