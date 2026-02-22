'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Layers,
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

const categoryProductJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Category Deep Dive",
  description:
    "Focused program intelligence for a specific category — Business, Healthcare, Manufacturing, Technology, and more. Scored opportunities, competitive gaps, and hidden programs within your chosen area.",
  url: "https://withwavelength.com/category",
  brand: { "@type": "Brand", name: "Wavelength" },
  offers: {
    "@type": "Offer",
    price: "800",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://withwavelength.com/category",
  },
};

const CATEGORIES = [
  'Business & Professional Development',
  'Healthcare & Allied Health',
  'Manufacturing & Skilled Trades',
  'Technology & IT',
  'Transportation & Logistics',
  'Education & Training',
  'Public Safety & Law Enforcement',
  'Agriculture & Natural Resources',
];

export default function CategoryPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryProductJsonLd) }}
      />
      {/* ===== HERO ===== */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-36 lg:pt-40 pb-16">
        <Stars count={100} />
        <Aurora className="opacity-75" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">Discover</span>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)' }}
            >
              Every new program opportunity researched, mapped, and ranked for a specific industry.
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200} duration={800}>
            <p className="mt-6 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed font-medium">
              Same research depth as the Program Finder, focused on the industry your team cares about most.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={350} duration={800}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="btn-cosmic btn-cosmic-primary">
                  Order a Category Deep Dive — $800
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
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
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Full discovery pipeline — constrained to your category.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: 'Category-Specific Research',
                desc: 'Every search, every analysis, every data point filtered through your chosen program area. No noise from unrelated sectors.',
              },
              {
                icon: TrendingUp,
                title: 'Demand Signals in Your Category',
                desc: 'Job postings, employer expansion, certification trends, and grant opportunities — all specific to your program area and region.',
              },
              {
                icon: Users,
                title: 'Competitive Gap Analysis',
                desc: 'Who offers what in your category locally. Where the white space is. Where you can win.',
              },
              {
                icon: Target,
                title: 'Scored Opportunities',
                desc: '7-10 scored program opportunities within your category, ranked by demand, competition, revenue, wages, and launch speed.',
              },
              {
                icon: Sparkles,
                title: 'Blue Ocean — In Category',
                desc: 'Hidden opportunities within your category that standard analyses miss. Niche sub-specialties, emerging roles, underserved segments.',
              },
              {
                icon: FileText,
                title: 'The Deep Dive Report',
                desc: '20-35 page report with regional snapshot, employer landscape, scored programs, evidence trails, and specific next steps.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-cosmic rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-heading font-semibold text-theme-primary mb-2">{title}</h3>
                <p className="text-theme-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline">Available Categories</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-12">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Pick the area that matters most to your team.
            </h2>
            <p className="text-theme-secondary mt-3 max-w-xl mx-auto">
              Don&apos;t see your category? We can run a deep dive on any program area — just tell us what you need.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={60} variant="fade-up" className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                className="card-cosmic rounded-xl p-4 text-center flex items-center justify-center min-h-[80px]"
              >
                <p className="text-sm font-medium text-theme-secondary">{cat}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== SAMPLE RESULTS ===== */}
      <section className="relative py-20 md:py-28" id="sample">
        <div className="max-w-[1000px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <span className="overline">Real Results</span>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-12">
            <p className="text-theme-secondary text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              We ran a Category Deep Dive in the Business &amp; Professional Development category for an Iowa community college. Here&apos;s what we found.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="card-cosmic rounded-2xl overflow-hidden">
              {/* Conventional */}
              <div className="p-6 md:p-8 border-b border-theme-subtle">
                <h3 className="text-xs font-medium uppercase tracking-widest text-theme-secondary mb-4">
                  Scored Opportunities
                </h3>
                <div className="space-y-2">
                  {[
                    { name: 'Training & Development Specialist Certificate', score: 8.65, tag: 'Quick Win' },
                    { name: 'Management Analyst / Business Analysis Certificate', score: 8.35, tag: 'Quick Win' },
                    { name: 'Supply Chain & Logistics Management Certificate', score: 8.25, tag: 'Quick Win' },
                    { name: 'HR Leadership & Compliance Certificate', score: 8.2, tag: 'Quick Win' },
                    { name: 'Financial Management & Leadership Certificate', score: 7.95, tag: 'Strategic Build' },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-white/[0.02]">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-theme-secondary text-sm">{p.name}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-theme-muted">
                          <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                          {p.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-14 h-1.5 rounded-full bg-theme-base overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{ width: `${(p.score / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-theme-secondary text-sm font-mono w-7 text-right">{p.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blue Ocean */}
              <div className="p-6 md:p-8">
                <h3 className="text-xs font-medium uppercase tracking-widest text-theme-secondary mb-1">
                  Blue Ocean — Hidden Opportunities
                </h3>
                <p className="text-theme-secondary text-xs mb-4">
                  Non-obvious programs within Business &amp; Professional Development
                </p>
                <div className="space-y-2">
                  {[
                    { name: 'Casino Operations Business Management', score: 8.15 },
                    { name: 'Workforce Analytics & People Operations', score: 8.0 },
                    { name: 'Technology Leadership for Non-Technical Managers', score: 7.95 },
                    { name: 'Business Broker & M&A Transition Specialist', score: 7.95 },
                    { name: 'Freight Brokerage & Transportation Business Ops', score: 7.75 },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-teal-500/[0.03] border border-teal-500/[0.08]">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-theme-secondary text-sm">{p.name}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-theme-muted">
                          <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                          Blue Ocean
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-14 h-1.5 rounded-full bg-theme-base overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                            style={{ width: `${(p.score / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-theme-secondary text-sm font-mono w-7 text-right">{p.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== FULL SCAN vs DEEP DIVE ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Deep Dive vs. Full Scan — which do you need?
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="space-y-6">
            {[
              {
                title: 'You already know the category',
                desc: 'Your dean says "we need to grow our Business programs" — the Category Deep Dive gives them exactly what to build and why, for half the cost of a full scan.',
              },
              {
                title: 'You need a quick win for one department',
                desc: 'A 20-35 page focused report that a department chair can act on immediately. No wading through Healthcare data when you need Manufacturing answers.',
              },
              {
                title: 'You want to test before going all-in',
                desc: 'Start with a $800 Deep Dive. If the opportunities are strong, upgrade to a full $1,500 Program Finder across all sectors.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-4">
                <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading font-semibold text-theme-primary mb-1">{title}</h3>
                  <p className="text-theme-secondary text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="relative py-20 md:py-28" id="get-started">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <span className="overline">Get Started</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Focused intelligence. One category. One price.
            </h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Deep Dive */}
            <AnimateOnScroll variant="scale" delay={100}>
              <div className="card-cosmic rounded-2xl p-8 md:p-10 text-center border-purple-500/20 h-full flex flex-col relative">
                <p className="overline mb-4">Category Deep Dive</p>
                <p className="text-theme-secondary text-sm mb-5">
                  Full pipeline intelligence focused on a single program area of your choice.
                </p>

                <div className="mb-1">
                  <span className="font-heading font-black text-6xl text-theme-primary">$800</span>
                </div>
                <p className="text-theme-secondary text-xs mb-2">Founding rate</p>
                <p className="text-theme-tertiary text-xs mb-5">Eligible for Perkins V and state workforce grant funding</p>

                <ul className="text-left max-w-xs mx-auto space-y-3 mb-7 flex-1">
                  {[
                    '20-35 page focused report',
                    '7-10 scored program opportunities',
                    'Blue Ocean hidden opportunities',
                    '75+ searches across 6 research phases',
                    'Regional snapshot & employer landscape',
                    'Competitive gap analysis within category',
                    'Evidence trails & data sources',
                    'Delivered in ~1 week',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-theme-secondary">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link href="/contact">
                  <button className="btn-cosmic btn-cosmic-primary w-full sm:w-auto">
                    Order Category Deep Dive
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
                <p className="text-theme-secondary text-xs mt-3">
                  We&apos;ll follow up within 48 hours.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Upsell to full scan */}
            <AnimateOnScroll variant="scale" delay={200}>
              <div className="card-cosmic rounded-2xl p-8 md:p-10 text-center border-teal-500/20 h-full flex flex-col">
                <p className="overline mb-4">Need more?</p>
                <h3 className="font-heading font-bold text-theme-primary text-xl mb-2">Program Finder</h3>
                <p className="text-theme-secondary text-sm mb-5">
                  Full market intelligence across all program areas. 25+ pages, 100+ searches, every sector analyzed.
                </p>

                <div className="mb-5">
                  <span className="font-heading font-bold text-4xl text-theme-primary">$1,500</span>
                </div>

                <ul className="text-left max-w-xs mx-auto space-y-3 mb-7 flex-1">
                  {[
                    'All sectors, not just one category',
                    '25+ page comprehensive report',
                    '100+ verified data sources',
                    'Cross-category opportunity comparison',
                    'Full Blue Ocean analysis',
                    'Grant alignment for each program',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-theme-secondary">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link href="/discover">
                  <button className="btn-cosmic btn-cosmic-ghost w-full sm:w-auto">
                    Learn About Full Scan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </div>
  );
}
