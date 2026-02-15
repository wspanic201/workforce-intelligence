import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Check,
  TrendingUp,
  DollarSign,
  Users,
  BookOpen,
  Target,
  Megaphone,
  Shield,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-50/50 to-white" />
        <div className="absolute inset-0 bg-grid opacity-40" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <p className="overline mb-4 text-navy-600">
              Program Validation for Community Colleges
            </p>
            <h1
              className="font-heading font-extrabold tracking-tight text-slate-900 animate-fade-up"
              style={{ fontSize: 'var(--text-display-xl)', lineHeight: 1.1 }}
            >
              Validate Any Workforce Program in 48 Hours
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto animate-fade-up animation-delay-100">
              Comprehensive market analysis, financial projections, and strategic
              recommendations — the rigor of a $100k consulting engagement,
              delivered in days.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animation-delay-200">
              <Link href="#sample-report">
                <Button
                  size="lg"
                  className="bg-navy-800 hover:bg-navy-900 text-white shadow-md btn-lift px-8 h-12 text-base font-semibold"
                >
                  See a Sample Report
                </Button>
              </Link>
              <Link href="/submit">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-navy-300 text-navy-800 hover:bg-navy-50 hover:border-navy-400 px-8 h-12 text-base font-semibold transition-all duration-200"
                >
                  Start a Validation →
                </Button>
              </Link>
            </div>
            <p className="mt-8 text-sm text-slate-400 animate-fade-up animation-delay-300">
              Trusted by community colleges nationwide
            </p>
          </div>
        </div>
      </section>

      {/* Data Trust Bar */}
      <section className="border-y border-slate-200 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Built on trusted data
            </p>
            <div className="hidden sm:block w-px h-5 bg-slate-300" aria-hidden="true" />
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {[
                'Bureau of Labor Statistics',
                'O*NET Occupational Data',
                'U.S. Census Bureau',
                'Real-Time Labor Market Intelligence',
              ].map((source) => (
                <span
                  key={source}
                  className="text-sm font-medium text-slate-500 whitespace-nowrap"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6-Lens Framework */}
      <section className="section bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="section-header">
            <p className="overline mb-3">Our Approach</p>
            <h2
              className="font-heading font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}
            >
              The 6-Lens Validation Framework
            </h2>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Every program is evaluated through six critical business perspectives —
              the same analysis a $100k consulting engagement would provide.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Market Demand Analysis',
                description:
                  'Real-time employer job postings, BLS growth projections, regional workforce gaps, and wage trend data.',
              },
              {
                icon: DollarSign,
                title: 'Financial Viability',
                description:
                  'CFO-level analysis: startup costs, enrollment projections, break-even timeline, and 5-year ROI modeling.',
              },
              {
                icon: Users,
                title: 'Competitive Landscape',
                description:
                  'Nearby program mapping, enrollment benchmarks, market saturation analysis, and differentiation opportunities.',
              },
              {
                icon: BookOpen,
                title: 'Curriculum Design',
                description:
                  'Skill-to-job alignment, industry credential mapping, optimal program length, and stackability pathways.',
              },
              {
                icon: Target,
                title: 'Workforce Alignment',
                description:
                  'Employer partnership opportunities, work-based learning models, placement potential, and industry input.',
              },
              {
                icon: Megaphone,
                title: 'Marketing Strategy',
                description:
                  'Target audience identification, enrollment funnel design, channel recommendations, and launch timeline.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group relative rounded-xl border border-slate-200 bg-white p-8 card-hover"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-gold-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="section bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="section-header">
            <p className="overline mb-3">How It Works</p>
            <h2
              className="font-heading font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}
            >
              From Concept to Clarity in 4 Steps
            </h2>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="relative">
              <div
                className="absolute left-5 top-5 bottom-5 w-px bg-navy-200"
                aria-hidden="true"
              />
              <div className="space-y-10">
                {[
                  {
                    step: '01',
                    title: 'Submit Program Details',
                    description:
                      'Provide basic information about your program concept, target audience, and institutional constraints.',
                  },
                  {
                    step: '02',
                    title: 'Comprehensive Research',
                    description:
                      'Our analysis engine evaluates market demand, competition, curriculum design, financials, and marketing strategy using real labor market data.',
                  },
                  {
                    step: '03',
                    title: '6-Lens Evaluation',
                    description:
                      'Multi-perspective analysis evaluates viability from every critical business angle and provides a GO/NO-GO recommendation.',
                  },
                  {
                    step: '04',
                    title: 'Professional Report',
                    description:
                      'Receive a comprehensive validation report with executive summary, detailed analysis, and implementation roadmap.',
                  },
                ].map(({ step, title, description }) => (
                  <div key={step} className="relative flex gap-6">
                    <div className="flex-shrink-0 relative z-10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 text-white text-sm font-bold font-heading">
                        {step}
                      </div>
                    </div>
                    <div className="pt-1">
                      <h3 className="font-heading text-lg font-semibold text-slate-900 mb-1">
                        {title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Report */}
      <section
        id="sample-report"
        className="section bg-navy-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="bg-grid h-full w-full" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="overline mb-3 text-navy-300">See What You Get</p>
            <h2
              className="font-heading font-bold tracking-tight"
              style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}
            >
              Sample Validation Report
            </h2>
            <p className="mt-4 text-lg text-navy-200 leading-relaxed max-w-2xl mx-auto">
              A complete program validation for an Industrial Coatings Specialist
              Certificate — delivered in 48 hours.
            </p>

            <div className="mt-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 sm:p-10 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-navy-300 mb-1">
                    Program Validation Report
                  </p>
                  <p className="text-white font-heading font-semibold text-lg">
                    Industrial Coatings Specialist Certificate
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-4 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300">
                    Conditional GO
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-xs text-navy-300 uppercase tracking-wider mb-1">
                    Region
                  </p>
                  <p className="text-white font-medium">Midwest Region</p>
                </div>
                <div>
                  <p className="text-xs text-navy-300 uppercase tracking-wider mb-1">
                    Job Growth
                  </p>
                  <p className="text-white font-medium">18% projected</p>
                </div>
                <div>
                  <p className="text-xs text-navy-300 uppercase tracking-wider mb-1">
                    Median Salary
                  </p>
                  <p className="text-white font-medium">$52,000</p>
                </div>
              </div>

              <p className="text-sm text-navy-200 mb-6">
                14-page report including Executive Summary, Market Demand
                Analysis, Competitive Landscape, Curriculum Design, Financial
                Projections & Marketing Strategy.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sample-report.pdf" download>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all"
                  >
                    Download Sample Report (PDF)
                  </Button>
                </Link>
                <Link href="/submit">
                  <Button
                    size="lg"
                    className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold btn-lift"
                  >
                    Start Your Own Validation →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="section-header">
            <p className="overline mb-3">Investment</p>
            <h2
              className="font-heading font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}
            >
              Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              No &quot;contact for pricing&quot; — here&apos;s exactly what it
              costs.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mx-auto max-w-5xl items-start">
            {/* Entry */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 card-hover">
              <div className="mb-6">
                <h3 className="font-heading text-lg font-semibold text-slate-900">
                  Entry Validation
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Perfect for testing our service
                </p>
                <div className="mt-4">
                  <span className="font-heading text-4xl font-bold text-slate-900">
                    $2,500
                  </span>
                  <span className="text-sm text-slate-500 ml-1">one-time</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8" role="list">
                {[
                  'Single program validation',
                  'All 6 lenses analyzed',
                  'GO/NO-GO recommendation',
                  '48-hour delivery',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      className="h-5 w-5 text-navy-600 flex-shrink-0 mt-0.5"
                      strokeWidth={2}
                    />
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/submit" className="block">
                <Button
                  variant="outline"
                  className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Standard — Featured */}
            <div className="relative rounded-xl bg-navy-800 text-white p-8 shadow-elevated lg:-mt-4 lg:mb-[-1rem]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-gold-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-navy-950">
                  Most Popular
                </span>
              </div>
              <div className="mb-6 mt-2">
                <h3 className="font-heading text-lg font-semibold text-white">
                  Standard Validation
                </h3>
                <p className="text-sm text-navy-200 mt-1">
                  Comprehensive analysis + roadmap
                </p>
                <div className="mt-4">
                  <span className="font-heading text-4xl font-bold text-white">
                    $7,500
                  </span>
                  <span className="text-sm text-navy-300 ml-1">one-time</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8" role="list">
                {[
                  'Everything in Entry, plus:',
                  'Implementation roadmap',
                  'Risk mitigation strategies',
                  '1-hour consultation call',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      className="h-5 w-5 text-gold-400 flex-shrink-0 mt-0.5"
                      strokeWidth={2}
                    />
                    <span className="text-sm text-navy-100">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/submit" className="block">
                <Button
                  size="lg"
                  className="w-full h-11 bg-white text-navy-800 hover:bg-navy-50 font-semibold btn-lift"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Annual */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 card-hover">
              <div className="mb-6">
                <h3 className="font-heading text-lg font-semibold text-slate-900">
                  Annual Partnership
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Up to 5 validations per year
                </p>
                <div className="mt-4">
                  <span className="font-heading text-4xl font-bold text-slate-900">
                    $25,000
                  </span>
                  <span className="text-sm text-slate-500 ml-1">/year</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8" role="list">
                {[
                  '5 standard validations',
                  'Quarterly market updates',
                  'Priority support',
                  'Save $12,500/year',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      className="h-5 w-5 text-navy-600 flex-shrink-0 mt-0.5"
                      strokeWidth={2}
                    />
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/submit" className="block">
                <Button
                  variant="outline"
                  className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Shield className="h-4 w-4" />
              <span>
                100% satisfaction guarantee on your first validation — full
                refund if not actionable
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="section-header">
            <p className="overline mb-3">Common Questions</p>
            <h2
              className="font-heading font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}
            >
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-3">
            {[
              {
                q: 'How is this different from hiring a consultant?',
                a: 'Traditional consultants bring 1-2 people and deliver in 3-6 months for $50k-$150k. We provide the same multi-perspective rigor — financial, marketing, curriculum, market demand — in 48 hours using our structured analysis framework backed by real labor market data.',
              },
              {
                q: 'What data sources do you use?',
                a: 'Bureau of Labor Statistics employment projections, O*NET occupational standards, real-time job posting data from 50,000+ employers, U.S. Census demographic data, and BLS wage information. All citations included in your report.',
              },
              {
                q: 'What if the report recommends NO-GO?',
                a: "That's valuable! A NO-GO recommendation saves you from investing $500k+ in a program with weak demand. The report explains exactly why and what would need to change for the program to succeed.",
              },
              {
                q: 'How long does it actually take?',
                a: 'Entry validations: 48 hours. Standard validations with implementation roadmap: 72 hours. We run all research in parallel, so the timeline is consistent regardless of program complexity.',
              },
              {
                q: "Is my institution's data secure?",
                a: 'Yes. All data is encrypted in transit and at rest using SOC 2 Type II certified infrastructure. Your program details are never shared with third parties. Reports are delivered via secure link.',
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-lg border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 [&[open]]:border-navy-200 [&[open]]:shadow-sm"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left font-heading font-semibold text-slate-900 [&::-webkit-details-marker]:hidden list-none">
                  <span>{q}</span>
                  <svg
                    className="ml-4 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-45"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="font-heading font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'var(--text-heading-lg)', lineHeight: 1.2 }}
            >
              Ready to validate your program idea?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Get comprehensive validation backed by real labor market data —
              delivered in 48 hours.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit">
                <Button
                  size="lg"
                  className="bg-navy-800 hover:bg-navy-900 text-white shadow-md btn-lift px-8 h-12 text-base font-semibold"
                >
                  Start a Validation
                </Button>
              </Link>
              <Link href="#pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 h-12 text-base font-semibold"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
