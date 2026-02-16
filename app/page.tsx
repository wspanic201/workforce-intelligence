'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Shield } from 'lucide-react';
import {
  AnimateOnScroll,
  StaggerChildren,
  CountUp,
} from '@/components/motion';
import { Marquee } from '@/components/marquee';

const tabs = [
  {
    label: 'Assess Market',
    title: 'Assess Market Demand',
    desc: 'Understand real employer demand before you invest. We synthesize labor market data from BLS projections, O*NET standards, and 50,000+ employer job postings to show you exactly where the jobs are — and where they\'re headed.',
    features: ['BLS employment projections', 'Real-time job posting analysis', 'Regional wage benchmarks', 'Growth trend mapping'],
  },
  {
    label: 'Model Financials',
    title: 'Model Financials',
    desc: 'CFO-ready financial modeling that answers the hard questions. Know your startup costs, enrollment projections, break-even timeline, and true ROI before committing resources.',
    features: ['Startup cost modeling', 'Enrollment projections', 'Break-even analysis', 'Scenario modeling'],
  },
  {
    label: 'Map Curriculum',
    title: 'Map Curriculum',
    desc: 'Design programs that align directly with employer needs. We map skills to occupations, identify credential pathways, and benchmark against competing programs in your region.',
    features: ['Skill-to-job alignment', 'Credential pathways', 'Competitive landscape', 'Stackable certificates'],
  },
  {
    label: 'Plan Marketing',
    title: 'Plan Marketing',
    desc: 'Launch with a clear strategy for student recruitment, employer partnerships, and community engagement. Every recommendation is backed by demographic and market data.',
    features: ['Target demographics', 'Recruitment strategy', 'Employer partnerships', 'Community engagement'],
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="overflow-x-hidden">
      {/* ===== HERO ===== */}
      <section className="bg-white pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <h1 className="heading-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.08] mx-auto max-w-3xl">
              Validation that drives decisions
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <p className="mt-6 text-lg text-[#4C4C4C] max-w-2xl mx-auto">
              Workforce Intelligence helps institutions turn program concepts into confident launch decisions with comprehensive market analysis, financial projections, and strategic recommendations.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={200} duration={800}>
            <div className="mt-8 flex gap-3 justify-center">
              <Link href="/submit">
                <Button className="bg-[#1F2023] hover:bg-black text-white rounded-full px-8 h-12 font-medium text-base">
                  Start Validation
                </Button>
              </Link>
              <Link href="#sample-report">
                <Button variant="outline" className="rounded-full px-8 h-12 font-medium text-base border-[#E0E0E0] text-[#1F2023] hover:bg-gray-50">
                  See Sample Report
                </Button>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <Marquee />
        </div>
      </section>

      {/* ===== HERO FEATURE CALLOUTS + PREVIEW ===== */}
      <section className="bg-white pt-16 pb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { title: 'Discover demand', desc: 'Answer market questions in hours, not months.' },
                { title: 'Understand viability', desc: 'See financial projections, competition, and curriculum fit in one unified view.' },
                { title: 'Act with confidence', desc: 'Back every program decision with data you can trust.' },
              ].map(({ title, desc }) => (
                <div key={title} className="text-center">
                  <h3 className="heading-display text-lg">{title}</h3>
                  <p className="mt-2 text-sm text-[#4C4C4C]">{desc}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Product Preview Card */}
          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="rounded-2xl bg-[#FAFAFA] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.12)] p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-[#4C4C4C] mb-1">Program Validation Report</p>
                  <p className="heading-display text-xl">Industrial Coatings Specialist Certificate</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-sm font-medium text-emerald-700">Conditional GO</span>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { label: 'Region', value: 'Midwest Region' },
                  { label: 'Job Growth', value: '18% projected' },
                  { label: 'Median Salary', value: '$52,000' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-[#4C4C4C] uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-[#1F2023] font-medium text-lg">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== TABBED FEATURES ===== */}
      <section className="bg-white py-16 md:py-[120px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="min-w-0">
              <AnimateOnScroll variant="fade-up">
                <h2 className="heading-display text-[clamp(1.75rem,3vw,2.25rem)]">
                  Turn data into action — at every stage
                </h2>
                <p className="mt-4 text-[#4C4C4C] text-base md:text-lg">
                  From initial market assessment to launch-ready marketing plan, every section of your report is designed to move you forward.
                </p>
                <div className="mt-8 hidden lg:block">
                  <Link href="#sample-report">
                    <Button variant="outline" className="rounded-full px-6 h-11 font-medium border-[#E0E0E0] text-[#1F2023] hover:bg-gray-50">
                      See Sample Report
                    </Button>
                  </Link>
                </div>
              </AnimateOnScroll>
            </div>

            <div className="min-w-0">
              {/* Tab buttons — horizontal scroll on mobile */}
              <div className="flex flex-row lg:flex-col gap-2 lg:gap-1 mb-6 lg:mb-8 overflow-x-auto pb-2 lg:pb-0 -mx-2 px-2 scrollbar-hide">
                {tabs.map((tab, i) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(i)}
                    className={`text-left px-4 lg:px-5 py-2.5 lg:py-3 rounded-full lg:rounded-xl transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      activeTab === i
                        ? 'bg-[#1F2023] text-white lg:bg-[#FAFAFA] lg:text-[#1F2023] shadow-sm'
                        : 'bg-[#FAFAFA] text-[#4C4C4C] lg:bg-transparent hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-heading font-medium text-sm">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active tab content */}
              <div className="rounded-2xl bg-[#FAFAFA] p-6 md:p-8 shadow-sm">
                <h3 className="heading-display text-lg md:text-xl mb-3">{tabs[activeTab].title}</h3>
                <p className="text-[#4C4C4C] text-sm leading-relaxed mb-6">{tabs[activeTab].desc}</p>
                <div className="space-y-2">
                  {tabs[activeTab].features.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-navy-600 flex-shrink-0" strokeWidth={2} />
                      <span className="text-sm text-[#4C4C4C]">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 lg:hidden">
                <Link href="#sample-report">
                  <Button variant="outline" className="rounded-full px-6 h-11 font-medium border-[#E0E0E0] text-[#1F2023] hover:bg-gray-50 w-full">
                    See Sample Report
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GRADIENT HERO SECTION ===== */}
      <section className="bg-brand-gradient pt-24 pb-32" style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}>
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <h2 className="heading-display text-[clamp(1.75rem,3vw,2.25rem)] !text-white">
              The engine for confident program decisions
            </h2>
            <p className="mt-4 text-white/70 text-lg max-w-2xl mx-auto">
              Every report combines six expert perspectives into one comprehensive analysis — delivered in 48 hours, not 6 months.
            </p>
            <div className="mt-8">
              <Link href="/submit">
                <Button className="bg-white text-[#1F2023] hover:bg-white/90 rounded-full px-8 h-12 font-medium text-base">
                  Start Validation
                </Button>
              </Link>
            </div>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {[
              { title: 'All your trusted data, in one place', desc: 'BLS, O*NET, Census, real-time job market — synthesized into clear insights.' },
              { title: 'Get answers in 48 hours', desc: 'Parallel analysis across all 6 lenses. No waiting months for a consulting firm.' },
              { title: 'Make confident decisions', desc: 'GO/NO-GO recommendations backed by comprehensive, cited data.' },
              { title: 'From validation to launch', desc: 'Implementation roadmap and marketing strategy included in every report.' },
            ].map(({ title, desc }) => (
              <div key={title} className="card-glass-dark rounded-2xl p-6 text-left">
                <h3 className="font-heading font-medium text-white text-base mb-2">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== WHY INSTITUTIONS CHOOSE US ===== */}
      <section className="bg-white py-16 md:py-[120px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
            <div>
              <AnimateOnScroll variant="fade-up">
                <h2 className="heading-display text-[clamp(1.75rem,3vw,2.25rem)] max-w-lg">
                  Why institutions choose Workforce Intelligence
                </h2>
              </AnimateOnScroll>
            </div>
            <AnimateOnScroll variant="fade-up" delay={100}>
              <div className="flex flex-col items-start lg:items-end gap-3">
                <p className="text-[#4C4C4C] max-w-sm lg:text-right">
                  Replace months of consulting with 48-hour validation backed by federal data sources.
                </p>
                <Link href="/submit">
                  <Button className="bg-[#1F2023] hover:bg-black text-white rounded-full px-6 h-11 font-medium">
                    Start Validation
                  </Button>
                </Link>
              </div>
            </AnimateOnScroll>
          </div>

          <StaggerChildren stagger={100} variant="fade-up" className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Built for speed', desc: '48-hour delivery, not 6-month consulting engagements. Run all research in parallel across six analytical lenses.' },
              { title: 'Comprehensive analysis', desc: '6 expert perspectives in every report — market demand, financials, curriculum, competition, implementation, and marketing.' },
              { title: 'Data you can trust', desc: 'Federal sources including BLS, O*NET, and Census. Real-time job market data from 50,000+ employers. Every claim cited.' },
              { title: 'From concept to launch', desc: 'Not just validation — you get a complete implementation roadmap, risk mitigation strategies, and marketing plan.' },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-2xl bg-[#FAFAFA] p-8 shadow-sm">
                <h3 className="heading-display text-lg mb-3">{title}</h3>
                <p className="text-[#4C4C4C] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== ENTERPRISE / TESTIMONIAL ===== */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #162d54 50%, #0a1628 100%)' }}>
        {/* Conic gradient decorations */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-0 top-0 w-1/2 h-full bg-conic-left" />
          <div className="absolute right-0 top-0 w-1/2 h-full bg-conic-right" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-24">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <h2 className="heading-display text-[clamp(1.75rem,3vw,2.25rem)] !text-white">
              Enterprise-ready. Without the complexity.
            </h2>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {['Trusted Methodology', 'SOC 2 Compliant', 'Secure by Default'].map((pill) => (
                <span key={pill} className="card-glass-dark rounded-full px-5 py-2 text-sm text-white/80 font-medium">
                  {pill}
                </span>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Testimonial */}
          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="card-glass-dark rounded-2xl p-8 sm:p-10 max-w-3xl mx-auto mb-16">
              <p className="text-white/80 text-lg leading-relaxed italic">
                &ldquo;The depth of analysis was equivalent to what we previously received from a $75,000 consulting engagement — delivered in two days instead of four months.&rdquo;
              </p>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="font-heading font-medium text-white">VP of Academic Affairs</p>
                <p className="text-white/50 text-sm">Midwest Community College</p>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Stats */}
          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="flex justify-center gap-8 md:gap-16 flex-wrap">
              {[
                { value: 48, suffix: 'hr', label: 'Average delivery time' },
                { value: 6, suffix: '', label: 'Expert perspectives per report' },
                { value: 14, suffix: '+', label: 'Pages of comprehensive analysis' },
              ].map(({ value, suffix, label }) => (
                <div key={label} className="text-center">
                  <div className="font-heading font-medium text-white text-4xl md:text-6xl tracking-tight">
                    <CountUp end={value} suffix={suffix} duration={2200} />
                  </div>
                  <p className="text-white/50 text-sm mt-2">{label}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== SUPPORT FOR EVERY STEP ===== */}
      <section className="bg-white py-16 md:py-[120px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-16">
            <h2 className="heading-display text-[clamp(1.75rem,3vw,2.25rem)]">
              Support for every step of the journey
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Self-service validation', desc: 'Submit your program concept and receive a comprehensive validation report in 48 hours.', cta: 'Start Validation', href: '/submit' },
              { title: 'Partner with experts', desc: 'Standard plan includes a 1-hour consultation call to walk through findings and next steps.', cta: 'Learn More', href: '#pricing' },
              { title: 'Dedicated partnerships', desc: 'Annual plans with up to 5 validations, quarterly market updates, and priority support.', cta: 'Contact Us', href: 'mailto:hello@workforceintel.com' },
            ].map(({ title, desc, cta, href }) => (
              <div key={title} className="rounded-2xl bg-[#FAFAFA] p-8 shadow-sm flex flex-col">
                <h3 className="heading-display text-lg mb-3">{title}</h3>
                <p className="text-[#4C4C4C] text-sm leading-relaxed flex-1">{desc}</p>
                <Link href={href} className="mt-6 text-sm font-medium text-[#1F2023] hover:underline underline-offset-4">
                  {cta} →
                </Link>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="bg-white py-16 md:py-[120px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-16">
            <h2 className="heading-display text-[clamp(1.75rem,3vw,2.25rem)]">
              Transparent pricing
            </h2>
            <p className="mt-4 text-[#4C4C4C] text-lg">
              No &quot;contact for pricing&quot; — here&apos;s exactly what it costs.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={150} variant="fade-up" className="grid lg:grid-cols-3 gap-8 mx-auto max-w-5xl items-start">
            {/* Entry */}
            <div className="rounded-2xl bg-[#FAFAFA] p-8 shadow-sm">
              <h3 className="heading-display text-lg">Entry Validation</h3>
              <p className="text-sm text-[#4C4C4C] mt-1">Perfect for testing our service</p>
              <div className="mt-4 mb-6">
                <span className="font-heading font-medium text-4xl text-[#1F2023]">$2,500</span>
                <span className="text-sm text-[#4C4C4C] ml-1">one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Single program validation', 'All 6 lenses analyzed', 'GO/NO-GO recommendation', '48-hour delivery'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-navy-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-[#4C4C4C]">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/submit" className="block">
                <Button variant="outline" className="w-full h-11 rounded-full border-[#E0E0E0] text-[#1F2023] hover:bg-white font-medium">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Standard — Featured */}
            <div className="relative rounded-2xl bg-[#1F2023] text-white p-8 lg:-mt-4 lg:mb-[-1rem]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-gold-400 px-4 py-1 text-xs font-medium uppercase tracking-wider text-[#1F2023]">
                  Most Popular
                </span>
              </div>
              <div className="mt-2">
                <h3 className="font-heading font-medium text-lg text-white">Standard Validation</h3>
                <p className="text-sm text-white/50 mt-1">Comprehensive analysis + roadmap</p>
                <div className="mt-4 mb-6">
                  <span className="font-heading font-medium text-4xl text-white">$7,500</span>
                  <span className="text-sm text-white/50 ml-1">one-time</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {['Everything in Entry, plus:', 'Implementation roadmap', 'Risk mitigation strategies', '1-hour consultation call'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-gold-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/submit" className="block">
                <Button className="w-full h-11 rounded-full bg-white text-[#1F2023] hover:bg-gray-100 font-medium">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Annual */}
            <div className="rounded-2xl bg-[#FAFAFA] p-8 shadow-sm">
              <h3 className="heading-display text-lg">Annual Partnership</h3>
              <p className="text-sm text-[#4C4C4C] mt-1">Up to 5 validations per year</p>
              <div className="mt-4 mb-6">
                <span className="font-heading font-medium text-4xl text-[#1F2023]">$25,000</span>
                <span className="text-sm text-[#4C4C4C] ml-1">/year</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['5 standard validations', 'Quarterly market updates', 'Priority support', 'Save $12,500/year'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-navy-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-[#4C4C4C]">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/submit" className="block">
                <Button variant="outline" className="w-full h-11 rounded-full border-[#E0E0E0] text-[#1F2023] hover:bg-white font-medium">
                  Contact Us
                </Button>
              </Link>
            </div>
          </StaggerChildren>

          <AnimateOnScroll variant="fade" delay={400}>
            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-[#4C4C4C]">
                <Shield className="h-4 w-4" />
                <span>100% satisfaction guarantee — full refund if not actionable</span>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="heading-display text-[clamp(1.75rem,3.5vw,2.75rem)]">
                Workforce Intelligence is for teams that plan. Make your move.
              </h2>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/submit">
                  <Button className="bg-[#1F2023] hover:bg-black text-white rounded-full px-8 h-14 font-medium text-base">
                    Start Validation
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button variant="outline" className="rounded-full px-8 h-14 font-medium text-base border-[#E0E0E0] text-[#1F2023] hover:bg-gray-50">
                    See Pricing
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-[#4C4C4C]">
                Questions?{' '}
                <a href="mailto:hello@workforceintel.com" className="text-[#1F2023] hover:underline underline-offset-2">
                  hello@workforceintel.com
                </a>
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
