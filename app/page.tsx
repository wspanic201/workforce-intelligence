import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Check,
  DollarSign,
  ArrowRight,
  Heart,
  Factory,
  Monitor,
  Briefcase,
  ShieldCheck,
  Truck,
  Shield,
  Search,
  Target,
} from 'lucide-react';
import {
  AnimateOnScroll,
  StaggerChildren,
  CountUp,
} from '@/components/motion';
import { Marquee } from '@/components/marquee';

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* ===== HERO ===== */}
      <section className="bg-white min-h-[85vh] flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left: Text */}
          <div>
            <AnimateOnScroll variant="fade-up" duration={800}>
              <h1
                style={{ fontSize: 'clamp(2.75rem, 4.5vw, 3.5rem)', lineHeight: 1.08 }}
                className="font-heading font-extrabold text-slate-900 tracking-tight"
              >
                The new standard for workforce program validation
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={150} duration={800}>
              <p className="mt-6 text-lg text-gray-500 max-w-lg">
                Comprehensive market analysis, financial projections, and strategic
                recommendations — delivered in 48 hours, not 6 months.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={300} duration={800}>
              <div className="mt-8 flex gap-3">
                <Link href="/submit">
                  <Button size="lg" className="bg-navy-800 hover:bg-navy-900 text-white px-8 h-12 font-semibold">
                    Start Validation
                  </Button>
                </Link>
                <Link href="#sample-report">
                  <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 h-12 font-semibold">
                    See Sample Report
                  </Button>
                </Link>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Right: Decorative overlapping rectangles */}
          <div className="hidden lg:block relative h-[400px]">
            <div className="absolute w-64 h-44 rounded-2xl top-8 right-4 rotate-3" style={{ background: 'linear-gradient(135deg, #162d54, #1e3a6b)', opacity: 0.9 }} />
            <div className="absolute w-56 h-40 rounded-2xl top-24 right-24 -rotate-2" style={{ background: 'linear-gradient(135deg, #b8922e, #d4ad3c)', opacity: 0.85 }} />
            <div className="absolute w-48 h-36 rounded-2xl top-44 right-8 rotate-1" style={{ background: 'linear-gradient(135deg, #5a86c4, #89abd8)', opacity: 0.8 }} />
            <div className="absolute w-40 h-28 rounded-2xl top-16 right-48 -rotate-3" style={{ background: 'linear-gradient(135deg, #dce6f5, #eef3fb)', opacity: 0.9, border: '1px solid #e2e8f0' }} />
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <Marquee />
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <div className="flex justify-center gap-16 flex-wrap">
              {[
                { end: 48, suffix: 'hr', label: 'Report Delivery' },
                { end: 6, suffix: '-Lens', label: 'Analysis Framework' },
                { end: 14, suffix: '+', label: 'Page Reports' },
                { end: 50, suffix: 'k+', label: 'Employer Data Points' },
              ].map(({ end, suffix, label }) => (
                <div key={label}>
                  <span className="text-gradient-stats font-heading font-bold" style={{ fontSize: '5rem', lineHeight: 1 }}>
                    <CountUp end={end} suffix={suffix} duration={2200} />
                  </span>
                  <p className="text-sm text-gray-500 mt-2">{label}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== PRODUCT SECTIONS ===== */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 space-y-32">
          {/* 01 — Market Intelligence */}
          <AnimateOnScroll variant="fade-up" duration={800}>
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
              <div>
                <span className="font-heading font-bold text-gray-200 block" style={{ fontSize: '6rem', lineHeight: 1 }}>01</span>
                <p className="text-xs uppercase tracking-widest text-gray-400 mt-2 mb-2">Pillar One</p>
                <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }} className="font-heading font-bold text-slate-900">
                  Market Intelligence
                </h2>
                <p className="mt-4 text-gray-500 leading-relaxed text-lg">
                  Understand real employer demand before you invest. We synthesize labor market data from thousands of sources.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'BLS Employment Data', desc: 'Federal projections for job growth and industry trends' },
                  { title: 'Job Posting Analysis', desc: 'Real-time demand from 50,000+ employers nationwide' },
                  { title: 'Wage Trend Mapping', desc: 'Regional and national compensation benchmarks' },
                ].map(({ title, desc }) => (
                  <div key={title} className="border-l-2 border-navy-800 pl-5 py-3">
                    <h4 className="font-heading font-semibold text-slate-900 text-sm">{title}</h4>
                    <p className="mt-1 text-sm text-gray-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          {/* 02 — Financial Analysis */}
          <AnimateOnScroll variant="fade-up" duration={800}>
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
              <div>
                <span className="font-heading font-bold text-gray-200 block" style={{ fontSize: '6rem', lineHeight: 1 }}>02</span>
                <p className="text-xs uppercase tracking-widest text-gray-400 mt-2 mb-2">Pillar Two</p>
                <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }} className="font-heading font-bold text-slate-900">
                  Financial Analysis
                </h2>
                <p className="mt-4 text-gray-500 leading-relaxed text-lg">
                  CFO-ready financial modeling that answers the hard questions. Know your break-even timeline and true ROI.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Startup Cost Modeling', desc: 'Equipment, facilities, staffing, and accreditation costs' },
                  { title: 'Enrollment Projections', desc: 'Realistic cohort sizing based on regional demographics' },
                  { title: 'Break-Even Analysis', desc: 'Timeline to financial sustainability with scenario modeling' },
                ].map(({ title, desc }) => (
                  <div key={title} className="border-l-2 border-navy-800 pl-5 py-3">
                    <h4 className="font-heading font-semibold text-slate-900 text-sm">{title}</h4>
                    <p className="mt-1 text-sm text-gray-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          {/* 03 — Strategic Roadmap */}
          <AnimateOnScroll variant="fade-up" duration={800}>
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
              <div>
                <span className="font-heading font-bold text-gray-200 block" style={{ fontSize: '6rem', lineHeight: 1 }}>03</span>
                <p className="text-xs uppercase tracking-widest text-gray-400 mt-2 mb-2">Pillar Three</p>
                <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }} className="font-heading font-bold text-slate-900">
                  Strategic Roadmap
                </h2>
                <p className="mt-4 text-gray-500 leading-relaxed text-lg">
                  A clear path from validation to launch with actionable next steps for curriculum, marketing, and partnerships.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Curriculum Design', desc: 'Skill-to-job alignment, credentials, and stackable pathways' },
                  { title: 'Competitive Landscape', desc: 'Nearby program mapping with differentiation strategy' },
                  { title: 'Implementation Plan', desc: 'Phased timeline with milestones and resource requirements' },
                ].map(({ title, desc }) => (
                  <div key={title} className="border-l-2 border-navy-800 pl-5 py-3">
                    <h4 className="font-heading font-semibold text-slate-900 text-sm">{title}</h4>
                    <p className="mt-1 text-sm text-gray-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== INDUSTRY ===== */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <AnimateOnScroll variant="fade-right">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Industry Verticals</p>
                <h2 style={{ fontSize: 'clamp(2rem, 3vw, 3rem)' }} className="font-heading font-bold text-slate-900 leading-tight">
                  From healthcare<br />
                  to manufacturing<br />
                  to cybersecurity
                </h2>
                <p className="mt-6 text-lg text-gray-500">
                  Our methodology applies to any workforce program. Here are the sectors we see the most demand in.
                </p>
                <div className="mt-10 flex gap-12">
                  <div>
                    <p className="text-gradient-stats font-heading text-4xl font-bold">200+</p>
                    <p className="text-sm text-gray-500 mt-1">Programs Analyzed</p>
                  </div>
                  <div>
                    <p className="text-gradient-stats font-heading text-4xl font-bold">35</p>
                    <p className="text-sm text-gray-500 mt-1">States Covered</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            <StaggerChildren stagger={100} variant="fade-up" className="space-y-3">
              {[
                { icon: Heart, title: 'Healthcare & Nursing', desc: 'RN, LPN, CNA, Medical Assisting, Health IT' },
                { icon: Factory, title: 'Manufacturing & Trades', desc: 'CNC, welding, industrial maintenance, HVAC' },
                { icon: Monitor, title: 'Information Technology', desc: 'Cybersecurity, cloud, software dev, networking' },
                { icon: Briefcase, title: 'Business & Finance', desc: 'Accounting, business admin, supply chain' },
                { icon: ShieldCheck, title: 'Public Safety', desc: 'Criminal justice, fire science, emergency mgmt' },
                { icon: Truck, title: 'Transportation & Logistics', desc: 'CDL training, logistics management, aviation' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-shrink-0 mt-1 h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-navy-700">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* ===== SAMPLE REPORT (dark) ===== */}
      <section id="sample-report" className="bg-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <AnimateOnScroll variant="fade-up">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">See What You Get</p>
              <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }} className="font-heading font-bold tracking-tight text-white">
                Sample Validation Report
              </h2>
              <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                A complete program validation for an Industrial Coatings Specialist
                Certificate — delivered in 48 hours.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fade-up" delay={200}>
              <div className="mt-10 rounded-2xl bg-slate-800 border border-slate-700 p-8 sm:p-10 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-700">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Program Validation Report</p>
                    <p className="text-white font-heading font-semibold text-lg">Industrial Coatings Specialist Certificate</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-4 py-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    <span className="text-sm font-semibold text-emerald-300">Conditional GO</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6 mb-8">
                  {[
                    { label: 'Region', value: 'Midwest Region' },
                    { label: 'Job Growth', value: '18% projected' },
                    { label: 'Median Salary', value: '$52,000' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-white font-medium text-lg">{value}</p>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-slate-400 mb-6">
                  14-page report including Executive Summary, Market Demand Analysis,
                  Competitive Landscape, Curriculum Design, Financial Projections &
                  Marketing Strategy.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/sample-report.pdf" download>
                    <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                      Download Sample (PDF)
                    </Button>
                  </Link>
                  <Link href="/submit">
                    <Button size="lg" className="bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold">
                      Start Your Validation →
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimateOnScroll variant="fade-up" className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">What People Are Saying</p>
            <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }} className="font-heading font-bold tracking-tight text-slate-900">
              Trusted by Academic Leaders
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={150} variant="fade-up" className="grid md:grid-cols-3 gap-8">
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
              <div key={name} className="rounded-2xl bg-white border border-gray-200 p-8 flex flex-col">
                <p className="text-gray-500 leading-relaxed flex-1">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="font-heading font-semibold text-slate-900 text-sm">{name}</p>
                  <p className="text-sm text-gray-400">{org}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimateOnScroll variant="fade-up" className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Investment</p>
            <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }} className="font-heading font-bold tracking-tight text-slate-900">
              Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              No &quot;contact for pricing&quot; — here&apos;s exactly what it costs.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={150} variant="fade-up" className="grid lg:grid-cols-3 gap-8 mx-auto max-w-5xl items-start">
            {/* Entry */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="font-heading text-lg font-semibold text-slate-900">Entry Validation</h3>
              <p className="text-sm text-gray-400 mt-1">Perfect for testing our service</p>
              <div className="mt-4 mb-6">
                <span className="font-heading text-4xl font-bold text-slate-900">$2,500</span>
                <span className="text-sm text-gray-400 ml-1">one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Single program validation', 'All 6 lenses analyzed', 'GO/NO-GO recommendation', '48-hour delivery'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-navy-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-gray-500">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/submit" className="block">
                <Button variant="outline" className="w-full h-11 border-gray-300 text-slate-700 hover:bg-gray-50 font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Standard — Featured */}
            <div className="relative rounded-2xl bg-slate-900 text-white p-8 lg:-mt-4 lg:mb-[-1rem]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-gold-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-slate-900">
                  Most Popular
                </span>
              </div>
              <div className="mt-2">
                <h3 className="font-heading text-lg font-semibold text-white">Standard Validation</h3>
                <p className="text-sm text-slate-400 mt-1">Comprehensive analysis + roadmap</p>
                <div className="mt-4 mb-6">
                  <span className="font-heading text-4xl font-bold text-white">$7,500</span>
                  <span className="text-sm text-slate-400 ml-1">one-time</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {['Everything in Entry, plus:', 'Implementation roadmap', 'Risk mitigation strategies', '1-hour consultation call'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-gold-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/submit" className="block">
                <Button size="lg" className="w-full h-11 bg-white text-slate-900 hover:bg-gray-100 font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Annual */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="font-heading text-lg font-semibold text-slate-900">Annual Partnership</h3>
              <p className="text-sm text-gray-400 mt-1">Up to 5 validations per year</p>
              <div className="mt-4 mb-6">
                <span className="font-heading text-4xl font-bold text-slate-900">$25,000</span>
                <span className="text-sm text-gray-400 ml-1">/year</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['5 standard validations', 'Quarterly market updates', 'Priority support', 'Save $12,500/year'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-navy-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-gray-500">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/submit" className="block">
                <Button variant="outline" className="w-full h-11 border-gray-300 text-slate-700 hover:bg-gray-50 font-semibold">
                  Contact Us
                </Button>
              </Link>
            </div>
          </StaggerChildren>

          <AnimateOnScroll variant="fade" delay={400}>
            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                <Shield className="h-4 w-4" />
                <span>100% satisfaction guarantee — full refund if not actionable</span>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimateOnScroll variant="fade-up" className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Common Questions</p>
            <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }} className="font-heading font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="mx-auto max-w-3xl space-y-3">
            {[
              {
                q: 'How is this different from hiring a consultant?',
                a: 'Traditional consultants bring 1-2 people and deliver in 3-6 months for $50k-$150k. We provide the same multi-perspective rigor in 48 hours using our structured analysis framework backed by real labor market data.',
              },
              {
                q: 'What data sources do you use?',
                a: 'Bureau of Labor Statistics employment projections, O*NET occupational standards, real-time job posting data from 50,000+ employers, U.S. Census demographic data, and BLS wage information. All citations included.',
              },
              {
                q: 'What if the report recommends NO-GO?',
                a: "That's valuable! A NO-GO recommendation saves you from investing $500k+ in a program with weak demand. The report explains exactly why and what would need to change.",
              },
              {
                q: 'How long does it actually take?',
                a: 'Entry validations: 48 hours. Standard validations with implementation roadmap: 72 hours. We run all research in parallel.',
              },
              {
                q: "Is my institution's data secure?",
                a: 'Yes. All data is encrypted in transit and at rest using SOC 2 Type II certified infrastructure. Your program details are never shared with third parties.',
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-gray-200 bg-white [&[open]]:border-gray-300"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left font-heading font-semibold text-slate-900 [&::-webkit-details-marker]:hidden list-none">
                  <span>{q}</span>
                  <svg className="ml-4 h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-45" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-gray-500 leading-relaxed">{a}</div>
              </details>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== FINAL CTA (dark) ===== */}
      <section className="bg-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimateOnScroll variant="fade-up">
            <div className="mx-auto max-w-2xl text-center">
              <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }} className="font-heading font-bold tracking-tight text-white">
                Ready to validate your next program?
              </h2>
              <p className="mt-4 text-lg text-slate-400">
                Get comprehensive validation backed by real labor market data —
                delivered in 48 hours.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/submit">
                  <Button size="lg" className="bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold px-8 h-14 text-base">
                    Start a Validation
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8 h-14 text-base font-semibold">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-slate-500">
                Questions?{' '}
                <a href="mailto:hello@workforceintel.com" className="text-slate-400 hover:text-white underline underline-offset-2">
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
