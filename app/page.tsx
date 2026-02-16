import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Check,
  TrendingUp,
  DollarSign,
  Map,
  ArrowRight,
  Heart,
  Factory,
  Monitor,
  Briefcase,
  ShieldCheck,
  Truck,
  Clock,
  BarChart3,
  FileText,
  Building2,
  Quote,
  Shield,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-50/60 to-white" />
        <div className="absolute inset-0 bg-grid opacity-30" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-36 lg:pb-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-navy-50 px-4 py-1.5 mb-8 animate-fade-up">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                Program Validation for Community Colleges
              </span>
            </div>

            <h1
              className="font-heading font-extrabold tracking-tight text-slate-900 animate-fade-up animation-delay-100"
              style={{ fontSize: 'clamp(2.75rem, 5vw + 1rem, 4rem)', lineHeight: 1.08 }}
            >
              Validate Any Workforce Program
              <span className="text-gradient"> in 48 Hours</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto animate-fade-up animation-delay-200">
              Comprehensive market analysis, financial projections, and strategic
              recommendations — the rigor of a six-figure consulting engagement,
              delivered in days, not months.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animation-delay-300">
              <Link href="/submit">
                <Button
                  size="lg"
                  className="bg-navy-800 hover:bg-navy-900 text-white shadow-md btn-lift px-8 h-13 text-base font-semibold"
                >
                  Start a Validation
                </Button>
              </Link>
              <Link href="#sample-report">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-navy-300 text-navy-800 hover:bg-navy-50 hover:border-navy-400 px-8 h-13 text-base font-semibold transition-all duration-200"
                >
                  See a Sample Report →
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 sm:mt-20 animate-fade-up animation-delay-400">
            <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-4">
              {[
                { stat: '48-Hour', label: 'Report Delivery' },
                { stat: '6-Lens', label: 'Analysis Framework' },
                { stat: '14+ Page', label: 'Comprehensive Reports' },
                { stat: '50,000+', label: 'Employer Data Points' },
              ].map(({ stat, label }) => (
                <div key={label} className="text-center">
                  <p className="font-heading text-2xl sm:text-3xl font-bold text-navy-800">
                    {stat}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== IMPACT STATS ===== */}
      <section className="border-y border-slate-200 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <p className="overline mb-3 text-navy-600">Measurable Impact</p>
            <h2
              className="font-heading font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}
            >
              Why Institutions Choose Us
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {[
              {
                stat: '$500k+',
                description: 'Saved on average by avoiding failed program launches',
                icon: DollarSign,
              },
              {
                stat: '48hrs',
                description: 'Vs. 6 months with traditional consulting firms',
                icon: Clock,
              },
              {
                stat: '6',
                description: 'Expert perspectives analyzed in every single report',
                icon: BarChart3,
              },
              {
                stat: '100%',
                description: 'Data-backed recommendations with cited sources',
                icon: FileText,
              },
            ].map(({ stat, description, icon: Icon }) => (
              <div
                key={stat}
                className="group relative text-center p-8 rounded-xl border border-slate-200 bg-white card-hover"
              >
                <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-navy-50 text-navy-700 transition-colors group-hover:bg-navy-100">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <p className="font-heading text-4xl sm:text-5xl font-bold text-navy-800">
                  {stat}
                </p>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NUMBERED PRODUCT SECTIONS (01, 02, 03) ===== */}
      <section className="section bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="section-header">
            <p className="overline mb-3">Our Framework</p>
            <h2
              className="font-heading font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}
            >
              The 6-Lens Validation Framework
            </h2>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Every program is evaluated through six critical business perspectives,
              organized into three comprehensive analysis pillars.
            </p>
          </div>

          <div className="space-y-20 lg:space-y-24">
            {/* 01 */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <span className="font-heading text-6xl sm:text-7xl font-bold text-navy-100">
                  01
                </span>
                <h3
                  className="font-heading font-bold text-slate-900 -mt-4"
                  style={{ fontSize: 'var(--text-heading-lg)' }}
                >
                  Market Intelligence
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed text-lg">
                  Understand real employer demand before you invest. Our analysts
                  synthesize labor market data from thousands of sources to give you
                  a clear picture of opportunity — or risk.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: 'BLS Employment Data', desc: 'Federal projections for job growth and industry trends' },
                  { title: 'Job Posting Analysis', desc: 'Real-time demand from 50,000+ employers nationwide' },
                  { title: 'Wage Trend Mapping', desc: 'Regional and national compensation benchmarks' },
                  { title: 'Growth Projections', desc: '5-year outlook with demographic and economic factors' },
                ].map(({ title, desc }) => (
                  <div key={title} className="rounded-lg border border-slate-200 p-5 card-hover bg-white">
                    <h4 className="font-heading font-semibold text-slate-900 text-sm">{title}</h4>
                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 02 */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div className="lg:order-2">
                <span className="font-heading text-6xl sm:text-7xl font-bold text-navy-100">
                  02
                </span>
                <h3
                  className="font-heading font-bold text-slate-900 -mt-4"
                  style={{ fontSize: 'var(--text-heading-lg)' }}
                >
                  Financial Analysis
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed text-lg">
                  CFO-ready financial modeling that answers the hard questions.
                  Know your break-even timeline, enrollment targets, and true ROI
                  before committing resources.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 lg:order-1">
                {[
                  { title: 'Startup Cost Modeling', desc: 'Equipment, facilities, staffing, and accreditation costs' },
                  { title: 'Enrollment Projections', desc: 'Realistic cohort sizing based on regional demographics' },
                  { title: 'Break-Even Analysis', desc: 'Timeline to financial sustainability with scenario modeling' },
                  { title: '5-Year ROI Forecast', desc: 'Net revenue projections with sensitivity analysis' },
                ].map(({ title, desc }) => (
                  <div key={title} className="rounded-lg border border-slate-200 p-5 card-hover bg-white">
                    <h4 className="font-heading font-semibold text-slate-900 text-sm">{title}</h4>
                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 03 */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <span className="font-heading text-6xl sm:text-7xl font-bold text-navy-100">
                  03
                </span>
                <h3
                  className="font-heading font-bold text-slate-900 -mt-4"
                  style={{ fontSize: 'var(--text-heading-lg)' }}
                >
                  Strategic Roadmap
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed text-lg">
                  A clear path from validation to launch. Every report includes
                  actionable next steps for curriculum, marketing, partnerships,
                  and competitive positioning.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: 'Curriculum Design', desc: 'Skill-to-job alignment, credentials, and stackable pathways' },
                  { title: 'Competitive Landscape', desc: 'Nearby program mapping with differentiation strategy' },
                  { title: 'Marketing Strategy', desc: 'Target audience, channels, enrollment funnel, and launch plan' },
                  { title: 'Implementation Plan', desc: 'Phased timeline with milestones and resource requirements' },
                ].map(({ title, desc }) => (
                  <div key={title} className="rounded-lg border border-slate-200 p-5 card-hover bg-white">
                    <h4 className="font-heading font-semibold text-slate-900 text-sm">{title}</h4>
                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INDUSTRY VERTICALS ===== */}
      <section className="section bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="section-header">
            <p className="overline mb-3">Industry Verticals</p>
            <h2
              className="font-heading font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}
            >
              Programs We Validate
            </h2>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Our methodology applies to any workforce program. Here are the sectors
              we see the most demand in.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: 'Healthcare & Nursing', desc: 'RN, LPN, CNA, Medical Assisting, Health Information Technology, and allied health programs.' },
              { icon: Factory, title: 'Manufacturing & Trades', desc: 'CNC machining, welding, industrial maintenance, HVAC, electrical, and construction technology.' },
              { icon: Monitor, title: 'Information Technology', desc: 'Cybersecurity, cloud computing, software development, networking, and data analytics.' },
              { icon: Briefcase, title: 'Business & Finance', desc: 'Accounting, business administration, entrepreneurship, supply chain, and human resources.' },
              { icon: ShieldCheck, title: 'Public Safety', desc: 'Criminal justice, fire science, emergency management, paramedic, and corrections programs.' },
              { icon: Truck, title: 'Transportation & Logistics', desc: 'CDL training, logistics management, aviation maintenance, and supply chain operations.' },
            ].map(({ icon: Icon, title, desc }) => (
              <Link
                key={title}
                href="/submit"
                className="group relative rounded-xl border border-slate-200 bg-white p-8 card-hover block"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-gold-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-navy-50 text-navy-700 transition-colors group-hover:bg-navy-100">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  {desc}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 group-hover:text-navy-900 transition-colors">
                  Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SAMPLE REPORT ===== */}
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
                  <p className="text-xs text-navy-300 uppercase tracking-wider mb-1">Region</p>
                  <p className="text-white font-medium">Midwest Region</p>
                </div>
                <div>
                  <p className="text-xs text-navy-300 uppercase tracking-wider mb-1">Job Growth</p>
                  <p className="text-white font-medium">18% projected</p>
                </div>
                <div>
                  <p className="text-xs text-navy-300 uppercase tracking-wider mb-1">Median Salary</p>
                  <p className="text-white font-medium">$52,000</p>
                </div>
              </div>

              <p className="text-sm text-navy-200 mb-6">
                14-page report including Executive Summary, Market Demand Analysis,
                Competitive Landscape, Curriculum Design, Financial Projections &
                Marketing Strategy.
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

      {/* ===== TESTIMONIALS ===== */}
      <section className="section bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="section-header">
            <p className="overline mb-3">What People Are Saying</p>
            <h2
              className="font-heading font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}
            >
              Trusted by Academic Leaders
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                quote: 'The depth of analysis was equivalent to what we previously received from a $75,000 consulting engagement — delivered in two days instead of four months.',
                name: 'VP of Academic Affairs',
                org: 'Midwest Community College',
              },
              {
                quote: 'The NO-GO recommendation on our proposed program saved us from a costly mistake. The data made the board decision easy and defensible.',
                name: 'Dean of Workforce Development',
                org: 'Southeast Technical College',
              },
              {
                quote: 'We used the financial projections directly in our Perkins grant application. The ROI modeling was exactly what our state board required.',
                name: 'Director of Institutional Research',
                org: 'Pacific Northwest College',
              },
            ].map(({ quote, name, org }) => (
              <div
                key={name}
                className="rounded-xl border border-slate-200 bg-white p-8 card-hover flex flex-col"
              >
                <Quote className="h-8 w-8 text-navy-200 mb-4 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-slate-700 leading-relaxed flex-1">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="font-heading font-semibold text-slate-900 text-sm">{name}</p>
                  <p className="text-sm text-slate-500">{org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="section bg-slate-50">
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
              No &quot;contact for pricing&quot; — here&apos;s exactly what it costs.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mx-auto max-w-5xl items-start">
            {/* Entry */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 card-hover">
              <div className="mb-6">
                <h3 className="font-heading text-lg font-semibold text-slate-900">Entry Validation</h3>
                <p className="text-sm text-slate-500 mt-1">Perfect for testing our service</p>
                <div className="mt-4">
                  <span className="font-heading text-4xl font-bold text-slate-900">$2,500</span>
                  <span className="text-sm text-slate-500 ml-1">one-time</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8" role="list">
                {['Single program validation', 'All 6 lenses analyzed', 'GO/NO-GO recommendation', '48-hour delivery'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-navy-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/submit" className="block">
                <Button variant="outline" className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all">
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
                <h3 className="font-heading text-lg font-semibold text-white">Standard Validation</h3>
                <p className="text-sm text-navy-200 mt-1">Comprehensive analysis + roadmap</p>
                <div className="mt-4">
                  <span className="font-heading text-4xl font-bold text-white">$7,500</span>
                  <span className="text-sm text-navy-300 ml-1">one-time</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8" role="list">
                {['Everything in Entry, plus:', 'Implementation roadmap', 'Risk mitigation strategies', '1-hour consultation call'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-gold-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-navy-100">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/submit" className="block">
                <Button size="lg" className="w-full h-11 bg-white text-navy-800 hover:bg-navy-50 font-semibold btn-lift">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Annual */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 card-hover">
              <div className="mb-6">
                <h3 className="font-heading text-lg font-semibold text-slate-900">Annual Partnership</h3>
                <p className="text-sm text-slate-500 mt-1">Up to 5 validations per year</p>
                <div className="mt-4">
                  <span className="font-heading text-4xl font-bold text-slate-900">$25,000</span>
                  <span className="text-sm text-slate-500 ml-1">/year</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8" role="list">
                {['5 standard validations', 'Quarterly market updates', 'Priority support', 'Save $12,500/year'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-navy-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/submit" className="block">
                <Button variant="outline" className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Shield className="h-4 w-4" />
              <span>100% satisfaction guarantee on your first validation — full refund if not actionable</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section bg-white">
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-slate-600 leading-relaxed">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="section bg-navy-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="bg-grid h-full w-full" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="font-heading font-bold tracking-tight"
              style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}
            >
              Ready to validate your next program?
            </h2>
            <p className="mt-4 text-lg text-navy-200">
              Get comprehensive validation backed by real labor market data —
              delivered in 48 hours.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit">
                <Button
                  size="lg"
                  className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold btn-lift px-8 h-13 text-base shadow-md"
                >
                  Start a Validation
                </Button>
              </Link>
              <Link href="#pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 h-13 text-base font-semibold transition-all"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-navy-400">
              Questions? Reach us at{' '}
              <a href="mailto:hello@workforceintel.com" className="text-navy-300 hover:text-white transition-colors underline underline-offset-2">
                hello@workforceintel.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
