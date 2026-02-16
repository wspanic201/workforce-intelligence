import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Check,
  TrendingUp,
  DollarSign,
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
  Quote,
  Shield,
} from 'lucide-react';
import {
  AnimateOnScroll,
  StaggerChildren,
  CountUp,
  Parallax,
  GlowOrb,
} from '@/components/motion';

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-50/80 via-white to-slate-50" />
        <div className="absolute inset-0 bg-grid opacity-[0.25]" style={{ animation: 'gridScroll 20s linear infinite' }} />
        <div className="absolute inset-0 bg-dots opacity-[0.15]" />

        {/* Decorative orbs */}
        <GlowOrb color="var(--navy-400)" size={600} top="-10%" right="-10%" opacity={0.12} blur={140} />
        <GlowOrb color="var(--gold-400)" size={400} bottom="0%" left="-5%" opacity={0.1} blur={120} />
        <GlowOrb color="var(--navy-300)" size={300} top="60%" right="20%" opacity={0.08} blur={100} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-36 lg:pb-24 w-full">
          <div className="mx-auto max-w-4xl text-center">
            <AnimateOnScroll variant="fade" duration={500}>
              <div className="inline-flex items-center gap-2 rounded-full border border-navy-200/60 bg-white/80 backdrop-blur-sm px-4 py-1.5 mb-8 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-500" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Program Validation for Community Colleges
                </span>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
              <h1
                className="font-heading font-extrabold tracking-tight text-slate-900"
                style={{ fontSize: 'clamp(2.75rem, 5vw + 1rem, 4.25rem)', lineHeight: 1.06 }}
              >
                Validate Any Workforce Program{' '}
                <span className="text-shimmer">in 48 Hours</span>
              </h1>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fade-up" delay={250} duration={800}>
              <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Comprehensive market analysis, financial projections, and strategic
                recommendations — the rigor of a six-figure consulting engagement,
                delivered in days, not months.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fade-up" delay={400} duration={800}>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/submit">
                  <Button
                    size="lg"
                    className="bg-navy-800 hover:bg-navy-900 text-white shadow-md btn-lift btn-glow-navy px-8 h-13 text-base font-semibold"
                  >
                    Start a Validation
                  </Button>
                </Link>
                <Link href="#sample-report">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-navy-200 text-navy-800 hover:bg-navy-50 hover:border-navy-400 px-8 h-13 text-base font-semibold transition-all duration-300 backdrop-blur-sm bg-white/60"
                  >
                    See a Sample Report →
                  </Button>
                </Link>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Stats row */}
          <div className="mt-20 sm:mt-24">
            <StaggerChildren stagger={150} variant="fade-up" className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-4">
              {[
                { value: 48, suffix: '-Hour', label: 'Report Delivery' },
                { value: 6, suffix: '-Lens', label: 'Analysis Framework' },
                { value: 14, suffix: '+ Page', label: 'Comprehensive Reports' },
                { value: 50000, suffix: '+', label: 'Employer Data Points' },
              ].map(({ value, suffix, label }) => (
                <div key={label} className="text-center">
                  <p className="font-heading text-3xl sm:text-4xl font-bold text-navy-800">
                    <CountUp end={value} suffix={suffix} duration={2200} />
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </StaggerChildren>
          </div>
        </div>

        {/* Bottom gradient fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-slate-50/80 pointer-events-none" />
      </section>

      {/* ===== IMPACT STATS ===== */}
      <section className="relative border-y border-slate-200/60 bg-slate-50/80 overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-[0.08]" />
        <GlowOrb color="var(--gold-500)" size={300} top="20%" left="5%" opacity={0.06} blur={100} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24">
          <AnimateOnScroll variant="fade-up" className="text-center mb-14">
            <p className="overline mb-3 text-navy-600">Measurable Impact</p>
            <h2
              className="font-heading font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}
            >
              Why Institutions Choose Us
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={120} variant="scale" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
            {[
              {
                value: 500,
                prefix: '$',
                suffix: 'k+',
                description: 'Saved on average by avoiding failed program launches',
                icon: DollarSign,
              },
              {
                value: 48,
                prefix: '',
                suffix: 'hrs',
                description: 'Vs. 6 months with traditional consulting firms',
                icon: Clock,
              },
              {
                value: 6,
                prefix: '',
                suffix: '',
                description: 'Expert perspectives analyzed in every single report',
                icon: BarChart3,
              },
              {
                value: 100,
                prefix: '',
                suffix: '%',
                description: 'Data-backed recommendations with cited sources',
                icon: FileText,
              },
            ].map(({ value, prefix, suffix, description, icon: Icon }) => (
              <div
                key={description}
                className="group relative text-center p-8 rounded-2xl border border-slate-200/80 card-glass card-hover"
              >
                <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-700 transition-all duration-300 group-hover:bg-navy-100 group-hover:scale-110">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <p className="font-heading text-4xl sm:text-5xl font-bold text-navy-800">
                  <CountUp end={value} prefix={prefix} suffix={suffix} duration={2000} />
                </p>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== NUMBERED PRODUCT SECTIONS (01, 02, 03) ===== */}
      <section className="section bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-[0.04]" />
        <GlowOrb color="var(--navy-300)" size={500} top="10%" right="-15%" opacity={0.06} blur={150} />
        <GlowOrb color="var(--gold-400)" size={350} bottom="15%" left="-10%" opacity={0.05} blur={130} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <AnimateOnScroll variant="fade-up" className="section-header">
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
          </AnimateOnScroll>

          <div className="space-y-24 lg:space-y-32">
            {/* 01 — Market Intelligence */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <AnimateOnScroll variant="fade-right" duration={800}>
                <Parallax speed={0.15}>
                  <span className="font-heading text-7xl sm:text-8xl font-bold text-navy-100/80 select-none">
                    01
                  </span>
                </Parallax>
                <h3
                  className="font-heading font-bold text-slate-900 -mt-6"
                  style={{ fontSize: 'var(--text-heading-lg)' }}
                >
                  Market Intelligence
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed text-lg">
                  Understand real employer demand before you invest. Our analysts
                  synthesize labor market data from thousands of sources to give you
                  a clear picture of opportunity — or risk.
                </p>
              </AnimateOnScroll>
              <StaggerChildren stagger={100} variant="fade-up" className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: 'BLS Employment Data', desc: 'Federal projections for job growth and industry trends' },
                  { title: 'Job Posting Analysis', desc: 'Real-time demand from 50,000+ employers nationwide' },
                  { title: 'Wage Trend Mapping', desc: 'Regional and national compensation benchmarks' },
                  { title: 'Growth Projections', desc: '5-year outlook with demographic and economic factors' },
                ].map(({ title, desc }) => (
                  <div key={title} className="rounded-xl border border-slate-200/80 p-5 card-glass card-hover">
                    <h4 className="font-heading font-semibold text-slate-900 text-sm">{title}</h4>
                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </StaggerChildren>
            </div>

            {/* Subtle divider */}
            <div className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent" />

            {/* 02 — Financial Analysis */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <AnimateOnScroll variant="fade-left" duration={800} className="lg:order-2">
                <Parallax speed={0.15}>
                  <span className="font-heading text-7xl sm:text-8xl font-bold text-navy-100/80 select-none">
                    02
                  </span>
                </Parallax>
                <h3
                  className="font-heading font-bold text-slate-900 -mt-6"
                  style={{ fontSize: 'var(--text-heading-lg)' }}
                >
                  Financial Analysis
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed text-lg">
                  CFO-ready financial modeling that answers the hard questions.
                  Know your break-even timeline, enrollment targets, and true ROI
                  before committing resources.
                </p>
              </AnimateOnScroll>
              <StaggerChildren stagger={100} variant="fade-up" className="grid sm:grid-cols-2 gap-4 lg:order-1">
                {[
                  { title: 'Startup Cost Modeling', desc: 'Equipment, facilities, staffing, and accreditation costs' },
                  { title: 'Enrollment Projections', desc: 'Realistic cohort sizing based on regional demographics' },
                  { title: 'Break-Even Analysis', desc: 'Timeline to financial sustainability with scenario modeling' },
                  { title: '5-Year ROI Forecast', desc: 'Net revenue projections with sensitivity analysis' },
                ].map(({ title, desc }) => (
                  <div key={title} className="rounded-xl border border-slate-200/80 p-5 card-glass card-hover">
                    <h4 className="font-heading font-semibold text-slate-900 text-sm">{title}</h4>
                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </StaggerChildren>
            </div>

            {/* Subtle divider */}
            <div className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent" />

            {/* 03 — Strategic Roadmap */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <AnimateOnScroll variant="fade-right" duration={800}>
                <Parallax speed={0.15}>
                  <span className="font-heading text-7xl sm:text-8xl font-bold text-navy-100/80 select-none">
                    03
                  </span>
                </Parallax>
                <h3
                  className="font-heading font-bold text-slate-900 -mt-6"
                  style={{ fontSize: 'var(--text-heading-lg)' }}
                >
                  Strategic Roadmap
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed text-lg">
                  A clear path from validation to launch. Every report includes
                  actionable next steps for curriculum, marketing, partnerships,
                  and competitive positioning.
                </p>
              </AnimateOnScroll>
              <StaggerChildren stagger={100} variant="fade-up" className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: 'Curriculum Design', desc: 'Skill-to-job alignment, credentials, and stackable pathways' },
                  { title: 'Competitive Landscape', desc: 'Nearby program mapping with differentiation strategy' },
                  { title: 'Marketing Strategy', desc: 'Target audience, channels, enrollment funnel, and launch plan' },
                  { title: 'Implementation Plan', desc: 'Phased timeline with milestones and resource requirements' },
                ].map(({ title, desc }) => (
                  <div key={title} className="rounded-xl border border-slate-200/80 p-5 card-glass card-hover">
                    <h4 className="font-heading font-semibold text-slate-900 text-sm">{title}</h4>
                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INDUSTRY VERTICALS ===== */}
      <section className="section relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef3fb 100%)' }}>
        <div className="absolute inset-0 bg-grid opacity-[0.12]" />
        <GlowOrb color="var(--navy-400)" size={400} bottom="10%" right="5%" opacity={0.06} blur={120} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <AnimateOnScroll variant="fade-up" className="section-header">
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
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="group relative rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm p-8 card-hover block"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-navy-400 to-gold-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-700 transition-all duration-300 group-hover:bg-navy-100 group-hover:scale-110">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  {desc}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 group-hover:text-navy-900 transition-colors link-underline">
                  Explore <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </Link>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== SAMPLE REPORT ===== */}
      <section
        id="sample-report"
        className="section text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a1628 0%, #162d54 40%, #1e3a6b 100%)' }}
      >
        <div className="absolute inset-0 bg-dots-light opacity-40" />
        <GlowOrb color="var(--gold-500)" size={500} top="-15%" right="10%" opacity={0.08} blur={140} />
        <GlowOrb color="var(--navy-400)" size={400} bottom="-10%" left="20%" opacity={0.1} blur={120} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <AnimateOnScroll variant="fade-up">
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
            </AnimateOnScroll>

            <AnimateOnScroll variant="scale" delay={200} duration={900}>
              <div className="mt-10 rounded-2xl card-glass-dark p-8 sm:p-10 text-left shadow-elevated">
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
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    <span className="text-sm font-semibold text-emerald-300">
                      Conditional GO
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6 mb-8">
                  {[
                    { label: 'Region', value: 'Midwest Region' },
                    { label: 'Job Growth', value: '18% projected' },
                    { label: 'Median Salary', value: '$52,000' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-navy-300 uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-white font-medium">{value}</p>
                    </div>
                  ))}
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
                      className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                    >
                      Download Sample Report (PDF)
                    </Button>
                  </Link>
                  <Link href="/submit">
                    <Button
                      size="lg"
                      className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold btn-lift btn-glow-gold"
                    >
                      Start Your Own Validation →
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-[0.04]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <AnimateOnScroll variant="fade-up" className="section-header">
            <p className="overline mb-3">What People Are Saying</p>
            <h2
              className="font-heading font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}
            >
              Trusted by Academic Leaders
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={150} variant="fade-up" className="grid md:grid-cols-3 gap-6 lg:gap-8">
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
                className="group rounded-2xl border border-slate-200/80 bg-white p-8 card-hover flex flex-col"
              >
                <Quote className="h-8 w-8 text-navy-200 mb-4 flex-shrink-0 transition-colors duration-300 group-hover:text-navy-400" strokeWidth={1.5} />
                <p className="text-slate-700 leading-relaxed flex-1">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="font-heading font-semibold text-slate-900 text-sm">{name}</p>
                  <p className="text-sm text-slate-500">{org}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="section relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef3fb 50%, #f8fafc 100%)' }}>
        <div className="absolute inset-0 bg-grid opacity-[0.08]" />
        <GlowOrb color="var(--navy-300)" size={400} top="20%" left="-10%" opacity={0.05} blur={130} />
        <GlowOrb color="var(--gold-400)" size={300} bottom="10%" right="-5%" opacity={0.04} blur={100} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <AnimateOnScroll variant="fade-up" className="section-header">
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
          </AnimateOnScroll>

          <StaggerChildren stagger={150} variant="scale" className="grid lg:grid-cols-3 gap-6 lg:gap-8 mx-auto max-w-5xl items-start">
            {/* Entry */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 card-hover">
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
                <Button variant="outline" className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Standard — Featured */}
            <div className="relative rounded-2xl text-white p-8 lg:-mt-4 lg:mb-[-1rem]" style={{ background: 'linear-gradient(160deg, #162d54 0%, #1e3a6b 100%)', boxShadow: '0 20px 60px -12px rgba(22, 45, 84, 0.4)' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-gold-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-navy-950 shadow-lg">
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
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 card-hover">
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
                <Button variant="outline" className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all duration-300">
                  Contact Us
                </Button>
              </Link>
            </div>
          </StaggerChildren>

          <AnimateOnScroll variant="fade" delay={400}>
            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                <Shield className="h-4 w-4" />
                <span>100% satisfaction guarantee on your first validation — full refund if not actionable</span>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section bg-white relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <AnimateOnScroll variant="fade-up" className="section-header">
            <p className="overline mb-3">Common Questions</p>
            <h2
              className="font-heading font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}
            >
              Frequently Asked Questions
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="mx-auto max-w-3xl space-y-3">
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
                className="group rounded-xl border border-slate-200/80 bg-white transition-all duration-300 hover:border-slate-300 [&[open]]:border-navy-200 [&[open]]:shadow-md [&[open]]:bg-navy-50/30"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left font-heading font-semibold text-slate-900 [&::-webkit-details-marker]:hidden list-none">
                  <span>{q}</span>
                  <svg
                    className="ml-4 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-45"
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
          </StaggerChildren>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section
        className="section text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a1628 0%, #162d54 50%, #1e3a6b 100%)' }}
      >
        <div className="absolute inset-0 bg-dots-light opacity-30" />
        <GlowOrb color="var(--gold-500)" size={500} top="-20%" left="30%" opacity={0.1} blur={150} />
        <GlowOrb color="var(--navy-400)" size={400} bottom="-15%" right="10%" opacity={0.08} blur={120} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <AnimateOnScroll variant="scale" duration={900}>
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
                    className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold btn-lift btn-glow-gold px-8 h-13 text-base shadow-md"
                  >
                    Start a Validation
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 h-13 text-base font-semibold transition-all duration-300"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-navy-400">
                Questions? Reach us at{' '}
                <a href="mailto:hello@workforceintel.com" className="text-navy-300 hover:text-white transition-colors duration-300 underline underline-offset-2 decoration-navy-500 hover:decoration-white">
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
