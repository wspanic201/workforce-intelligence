'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Zap, Shield, Clock, Search, Sparkles, BarChart3, HandCoins, ScanSearch, GraduationCap, Bolt, Lightbulb, ChevronDown, type LucideIcon } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { InlineLeadCapture } from '@/components/InlineLeadCapture';

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
  sampleReport?: string;
  // Search / filter metadata
  solves: string[];     // problem statements this service addresses
  outcomes: string[];   // what the client walks away with
  audience: string[];   // who typically buys this
  keywords: string[];   // additional search terms
}

const SERVICES: Service[] = [
  {
    name: 'Pell Readiness Check',
    slug: 'pell',
    price: 'Free',
    description: 'See which of your programs are Workforce Pell eligible right now — and what to fix on the ones that aren\'t.',
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
    sampleReport: '/report/pell-demo',
    solves: ['pell eligibility', 'federal funding', 'short-term program compliance', 'financial aid'],
    outcomes: ['eligibility scorecard', 'gap recommendations', 'compliance report'],
    audience: ['ce director', 'financial aid', 'dean', 'program developer'],
    keywords: ['pell', 'eligibility', 'free', 'workforce pell', 'clock hours', 'financial aid', 'short-term'],
  },
  {
    name: 'Program Finder',
    slug: 'discover',
    price: '$1,500',
    description: 'Find your next high-demand program before competitors do. 8–12 opportunities scored, ranked, and backed by real employer data.',
    turnaround: '5–7 business days',
    features: [
      '8–12 program opportunities scored & ranked',
      'Regional employer demand analysis (BLS QCEW)',
      'Competitive landscape mapping',
      'Blue ocean opportunity identification',
      'Grant eligibility matrix',
      'Implementation timeline estimates',
    ],
    category: 'core',
    cta: 'Order Now',
    ctaStyle: 'primary',
    sampleReport: '/report/wake-tech-program-opportunity-scan',
    solves: ['what should we build next', 'new program ideas', 'market research', 'competitive gaps', 'enrollment growth'],
    outcomes: ['ranked program list', 'employer demand data', 'competitive map', 'grant alignment', 'implementation plan'],
    audience: ['dean', 'vp academic affairs', 'ce director', 'provost', 'program developer'],
    keywords: ['new programs', 'market scan', 'opportunity', 'demand', 'what to build', 'grow enrollment', 'competitive', 'regional'],
  },
  {
    name: 'Category Deep Dive',
    slug: 'category',
    price: '$800',
    description: 'Zero in on the best opportunity in one program area — healthcare, business, manufacturing, trades, or any category you choose.',
    turnaround: '3–5 business days',
    features: [
      'Deep scan within one program category',
      '6–8 opportunities scored & ranked',
      'Category-specific competitive analysis',
      'Blue ocean opportunities within category',
      'Employer demand mapped by NAICS industry',
      'Natural upsell path to full Opportunity Scan',
    ],
    category: 'core',
    cta: 'Order Now',
    ctaStyle: 'primary',
    sampleReport: '/report/kirkwood-business-category-deep-dive',
    solves: ['focused research', 'one program area', 'specific category', 'healthcare programs', 'manufacturing programs'],
    outcomes: ['category report', 'ranked opportunities', 'competitive analysis'],
    audience: ['ce director', 'program developer', 'department chair'],
    keywords: ['healthcare', 'business', 'manufacturing', 'trades', 'IT', 'category', 'focused', 'one area', 'deep dive'],
  },
  {
    name: 'Feasibility Study',
    slug: 'validate',
    price: '$3,000',
    description: 'Know if a program will succeed before you invest in building it. Full feasibility analysis with financial projections and a GO / NO-GO recommendation.',
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
    cta: 'Order Now',
    ctaStyle: 'primary',
    sampleReport: '/report/kirkwood-pharmtech-validation',
    solves: ['justify a program', 'prove ROI', 'convince my dean', 'business case', 'should we build this', 'feasibility', 'program approval'],
    outcomes: ['GO/NO-GO recommendation', 'financial projections', 'P&L model', 'market validation', 'board-ready report'],
    audience: ['dean', 'vp', 'ce director', 'program developer', 'provost'],
    keywords: ['feasibility', 'validate', 'justify', 'ROI', 'business case', 'dean', 'board', 'approval', 'financial', 'projections'],
  },
  {
    name: 'Program Gap Analysis',
    slug: 'compliance-gap',
    price: '$300',
    description: 'Find required programs you aren\'t offering yet — with revenue estimates for each gap and a prioritized launch roadmap.',
    turnaround: '3–5 business days',
    features: [
      'Full catalog scan vs. state requirements',
      'Gap identification with statute citations',
      'Revenue potential per gap (Year 1 & Year 2+)',
      'Market-rate tuition benchmarking',
      'Priority-ranked implementation roadmap',
    ],
    category: 'addon',
    cta: 'Order Now',
    ctaStyle: 'secondary',
    sampleReport: '/report/hawkeye-gap-audit',
    solves: ['compliance', 'state mandates', 'missing programs', 'required programs', 'regulatory gaps', 'revenue opportunities'],
    outcomes: ['gap list with citations', 'revenue estimates', 'launch roadmap', 'compliance report'],
    audience: ['ce director', 'compliance officer', 'dean', 'program developer'],
    keywords: ['gap', 'compliance', 'state mandated', 'required', 'missing', 'audit', 'regulation', 'statute'],
  },
  {
    name: 'Grant Finder',
    slug: 'grants',
    price: '$750',
    description: 'Find grants you qualify for and haven\'t applied to yet — researched, scored, and ranked by fit for your institution.',
    turnaround: '48 hours',
    features: [
      'Federal, state & foundation grants researched',
      '5-dimension fit scoring per grant',
      'Past award intelligence & success rates',
      'Application requirements analysis',
      'Effort estimates per application',
      'Deadline calendar & action plan',
    ],
    category: 'addon',
    cta: 'Order Now',
    ctaStyle: 'secondary',
    sampleReport: '/report/valencia-grant-scan',
    solves: ['funding', 'grants', 'money for programs', 'grant writing', 'federal grants', 'foundation grants'],
    outcomes: ['grant list scored by fit', 'deadline calendar', 'application requirements', 'success rate data'],
    audience: ['grant writer', 'ce director', 'dean', 'development office', 'program developer'],
    keywords: ['grant', 'funding', 'federal', 'state', 'foundation', 'Perkins', 'WIOA', 'DOL', 'money', 'budget'],
  },
  {
    name: 'Curriculum Drift Analysis',
    slug: 'drift',
    price: '$500',
    priceNote: 'per program',
    description: 'See where your programs have fallen behind the job market — with specific recommendations on what to update.',
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
    cta: 'Order Now',
    ctaStyle: 'secondary',
    sampleReport: '/report/bellevue-cybersecurity-drift',
    solves: ['outdated curriculum', 'program review', 'accreditation prep', 'employer alignment', 'skills gap'],
    outcomes: ['drift score', 'gap report', 'update recommendations', 'accreditation evidence'],
    audience: ['program developer', 'department chair', 'ce director', 'accreditation coordinator'],
    keywords: ['drift', 'outdated', 'curriculum', 'review', 'accreditation', 'alignment', 'skills', 'update', 'refresh'],
  },
];

/* ─── Scenario Cards ────────────────────────────────────────────────────── */

interface Scenario {
  label: string;
  query: string;
  icon: LucideIcon;
}

const SCENARIOS: Scenario[] = [
  { label: 'Find new programs to build', query: 'new programs what to build', icon: Search },
  { label: 'Justify a program to my dean', query: 'justify approve feasibility dean', icon: BarChart3 },
  { label: 'Find grants & funding', query: 'grants funding money', icon: HandCoins },
  { label: 'Audit existing programs', query: 'audit compliance drift review', icon: ScanSearch },
  { label: 'Prepare for accreditation', query: 'accreditation review evidence', icon: GraduationCap },
  { label: 'Quick win under $500', query: 'quick cheap affordable', icon: Bolt },
];

/* ─── Search Logic ──────────────────────────────────────────────────────── */

function scoreService(service: Service, query: string): number {
  if (!query.trim()) return 0;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const searchableText = [
    service.name,
    service.description,
    ...service.solves,
    ...service.outcomes,
    ...service.audience,
    ...service.keywords,
    ...service.features,
  ].join(' ').toLowerCase();

  let score = 0;
  for (const term of terms) {
    if (searchableText.includes(term)) score += 1;
    // Boost for name match
    if (service.name.toLowerCase().includes(term)) score += 3;
    // Boost for solves match (problem-based)
    if (service.solves.some(s => s.includes(term))) score += 2;
  }

  // Budget filter: "under 500" or "cheap" or "quick"
  const priceNum = parseInt(service.price.replace(/[^0-9]/g, '')) || 0;
  if (terms.some(t => ['cheap', 'affordable', 'quick', 'budget', 'free'].includes(t))) {
    if (priceNum === 0) score += 5; // free
    else if (priceNum <= 500) score += 3;
    else if (priceNum <= 800) score += 1;
  }

  return score;
}

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

export default function PricingClient() {
  const [query, setQuery] = useState('');
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveQuery = activeScenario || query;

  const sortedServices = useMemo(() => {
    if (!effectiveQuery.trim()) return SERVICES;
    const scored = SERVICES.map(s => ({ service: s, score: scoreService(s, effectiveQuery) }));
    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.service);
  }, [effectiveQuery]);

  const hasQuery = effectiveQuery.trim().length > 0;

  const getOpacity = (service: Service) => {
    if (!hasQuery) return 1;
    const score = scoreService(service, effectiveQuery);
    if (score >= 3) return 1;
    if (score >= 1) return 0.55;
    return 0.25;
  };

  function handleScenarioClick(scenario: Scenario) {
    if (activeScenario === scenario.query) {
      setActiveScenario(null);
      setQuery('');
    } else {
      setActiveScenario(scenario.query);
      setQuery('');
    }
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setActiveScenario(null);
  }

  return (
    <div className="min-h-screen bg-theme-page">

      {/* Hero */}
      <section className="relative pt-32 pb-10 overflow-hidden">
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

      {/* Search + Scenarios */}
      <section className="relative pb-6">
        <div className="max-w-[700px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            {/* Search Input */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-theme-muted" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="What do you need help with?"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-theme-surface border border-theme-subtle text-theme-primary placeholder:text-theme-muted text-base focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
              {(query || activeScenario) && (
                <button
                  onClick={() => { setQuery(''); setActiveScenario(null); }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-theme-muted hover:text-theme-secondary transition-colors"
                >
                  <span aria-hidden="true">×</span>
                </button>
              )}
            </div>

            {/* Scenario Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {SCENARIOS.map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <button
                    key={scenario.query}
                    onClick={() => handleScenarioClick(scenario)}
                    className={`group text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                      activeScenario === scenario.query
                        ? 'bg-violet-500/15 border-violet-500/40 text-theme-primary'
                        : 'bg-theme-surface border-theme-subtle text-theme-secondary hover:border-theme-strong hover:text-theme-primary'
                    }`}
                  >
                    <Icon className="h-4 w-4 inline mr-2" />
                    <span className="text-sm font-medium">{scenario.label}</span>
                  </button>
                );
              })}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Grant Eligibility Callout */}
      <section className="relative pb-8 pt-4">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="card-cosmic rounded-2xl p-6 md:p-8 text-center border border-teal-500/20">
              <p className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-2 inline-flex items-center gap-1.5"><Lightbulb className="h-4 w-4" /> Did you know?</p>
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

      {/* All Services — unified grid, ordered by search relevance */}
      <section className="relative py-12">
        <div className="max-w-[1100px] mx-auto px-6">
          {!hasQuery && (
            <AnimateOnScroll variant="fade-up">
              <p className="label-brand text-center mb-3">All Services</p>
              <h2 className="font-heading font-bold text-theme-primary text-center text-2xl md:text-3xl mb-10">
                From discovery to validation
              </h2>
            </AnimateOnScroll>
          )}
          {hasQuery && (
            <div className="text-center mb-10">
              <p className="text-theme-secondary text-sm">
                <Sparkles className="h-4 w-4 inline mr-1 text-violet-400" />
                Showing best matches first
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {sortedServices.map(service => (
              <div
                key={service.slug}
                className="transition-all duration-300"
                style={{ opacity: getOpacity(service) }}
              >
                <ServiceCard service={service} highlighted={hasQuery && scoreService(service, effectiveQuery) >= 3} />
              </div>
            ))}
          </div>

          {/* Inline Lead Capture */}
          <div className="max-w-lg mx-auto">
            <InlineLeadCapture page="pricing" />
          </div>
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
            <div className="space-y-3">
              <FaqAccordionItem
                q="How is this different from Lightcast or EMSI?"
                a="Lightcast provides raw labor market data — job posting counts, wage tables, occupation projections. Wavelength takes that data (plus 50+ other sources) and turns it into actionable intelligence: scored program recommendations, competitive landscape analysis, financial viability models, and clear GO/NO-GO recommendations. We don't sell data access — we deliver finished analysis your team can act on."
              />
              <FaqAccordionItem
                q="Can we start with just one service?"
                a="Absolutely. Most institutions start with either a free Pell Readiness Check or a single Program Finder. There's no minimum commitment, no subscription, and no pressure to buy more. Each service delivers standalone value."
              />
              <FaqAccordionItem
                q="What data sources do you use?"
                a="We pull from 50+ live sources including BLS QCEW employment data, real-time job postings, Census ACS demographics, IPEDS program completions, state licensing databases, employer expansion announcements, and grant opportunity databases. Every claim in your report is sourced and cited."
              />
              <FaqAccordionItem
                q="How is the report delivered?"
                a="You receive a professional PDF report delivered to your email. Reports are designed to be board-ready — you can present them directly to leadership, accreditors, or grant reviewers without reformatting."
              />
              <FaqAccordionItem
                q="What is your refund policy?"
                a="If you're not satisfied with the quality of your report, let us know within 7 days of delivery. We'll either revise the analysis to address your concerns or issue a full refund. We've never had to issue one."
              />
              <FaqAccordionItem
                q="Can you present findings to our leadership team?"
                a="Yes. We offer virtual presentation sessions where we walk your leadership team through the findings, answer questions, and discuss implementation priorities. This is included at no extra cost for Feasibility Study clients and available as an add-on for other services."
              />
              <FaqAccordionItem
                q="Do you work with 4-year institutions?"
                a="Our core focus is community colleges and workforce-oriented institutions, but we've worked with 4-year schools on specific workforce program development projects — particularly applied bachelor's degrees, professional certificates, and continuing education divisions. Reach out and we'll let you know if we're a fit."
              />
              <FaqAccordionItem
                q="How do you handle confidentiality?"
                a="All client data and reports are treated as confidential. We never share your institution's data, strategic plans, or competitive intelligence with other clients — even if they're in the same region. We're happy to sign an NDA before engagement."
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

function ServiceCard({ service, highlighted }: { service: Service; highlighted?: boolean }) {
  return (
    <div className={`card-cosmic rounded-2xl p-6 md:p-8 flex flex-col relative transition-all duration-300 ${
      highlighted ? 'ring-1 ring-violet-500/30 border-violet-500/20' : ''
    }`}>
      <div className="mb-4">
        <h3 className="font-heading font-bold text-theme-primary text-lg mb-1">{service.name}</h3>
        <p className="text-theme-tertiary text-sm leading-relaxed">{service.description}</p>
      </div>

      <div className="mb-5">
        <span className="text-2xl font-mono font-bold text-gradient-cosmic">{service.price}</span>
        {service.priceNote && (
          <span className="text-theme-muted text-xs font-mono ml-1">/{service.priceNote}</span>
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

/* ─── FAQ Accordion Item ───────────────────────────────────────────────── */

function FaqAccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card-cosmic rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <h4 className="font-heading font-bold text-theme-primary text-sm pr-4">{q}</h4>
        <ChevronDown className={`h-4 w-4 text-theme-muted flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="text-theme-tertiary text-sm leading-relaxed px-5 pb-5">{a}</p>
        </div>
      </div>
    </div>
  );
}
