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
  Search,
  Target,
  Zap,
  ChevronRight,
} from 'lucide-react';
import {
  AnimateOnScroll,
  StaggerChildren,
  CountUp,
  Parallax,
  GlowOrb,
} from '@/components/motion';

/* ──────────────────── Decorative: Hero Geometric Art ──────────────────── */
function HeroArt() {
  return (
    <div className="hidden lg:block absolute right-[-4%] top-1/2 -translate-y-1/2 w-[520px] h-[520px] pointer-events-none select-none" aria-hidden="true">
      {/* Large circle */}
      <div className="absolute w-72 h-72 rounded-full top-8 right-8" style={{ background: 'linear-gradient(135deg, var(--navy-200) 0%, var(--navy-400) 100%)', opacity: 0.25 }} />
      {/* Medium rectangle */}
      <div className="absolute w-56 h-40 rounded-2xl top-32 right-36 rotate-12" style={{ background: 'linear-gradient(135deg, var(--gold-300) 0%, var(--gold-500) 100%)', opacity: 0.2, boxShadow: '0 20px 60px rgba(184,146,46,0.15)' }} />
      {/* Small circle */}
      <div className="absolute w-36 h-36 rounded-full bottom-24 right-12" style={{ background: 'linear-gradient(135deg, var(--navy-500) 0%, var(--navy-700) 100%)', opacity: 0.2 }} />
      {/* Tiny accent circle */}
      <div className="absolute w-16 h-16 rounded-full top-16 right-64" style={{ background: 'var(--gold-400)', opacity: 0.3 }} />
      {/* Dots grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 520 520">
        {Array.from({ length: 12 }).map((_, row) =>
          Array.from({ length: 12 }).map((_, col) => (
            <circle key={`${row}-${col}`} cx={30 + col * 42} cy={30 + row * 42} r="2" fill="var(--navy-600)" />
          ))
        )}
      </svg>
      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.12]" viewBox="0 0 520 520" fill="none">
        <path d="M200 100 L350 200 L280 380" stroke="var(--navy-400)" strokeWidth="1.5" strokeDasharray="6 4" />
        <path d="M100 250 L300 150 L420 300" stroke="var(--gold-500)" strokeWidth="1" strokeDasharray="4 6" />
      </svg>
    </div>
  );
}

/* ──────────────────── Decorative: Flow Diagram ──────────────────── */
function FlowDiagram() {
  const steps = [
    { label: 'Program Concept', icon: Search, color: 'var(--navy-700)' },
    { label: '6-Lens Analysis', icon: Target, color: 'var(--navy-500)' },
    { label: 'Validated Report', icon: FileText, color: 'var(--gold-500)' },
  ];
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <div key={step.label} className="flex items-center gap-4 sm:gap-0">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: step.color }}
              >
                <Icon className="w-9 h-9 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-semibold text-slate-700 text-center max-w-[120px]">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden sm:flex items-center mx-6">
                <div className="w-16 h-0.5 bg-gradient-to-r from-navy-300 to-gold-300" />
                <ChevronRight className="w-5 h-5 text-gold-500 -ml-1" />
              </div>
            )}
            {i < steps.length - 1 && (
              <div className="sm:hidden flex flex-col items-center my-1">
                <div className="w-0.5 h-8 bg-gradient-to-b from-navy-300 to-gold-300" />
                <ChevronRight className="w-5 h-5 text-gold-500 rotate-90 -mt-1" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Gradient wash background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #eef3fb 0%, #e8edf8 30%, #f0e8f4 60%, #eef3fb 100%)' }} />
        <div className="absolute inset-0 bg-grid opacity-[0.3]" style={{ animation: 'gridScroll 20s linear infinite' }} />
        <div className="absolute inset-0 bg-dots opacity-[0.18]" />

        {/* Decorative orbs */}
        <GlowOrb color="var(--navy-400)" size={600} top="-10%" right="-10%" opacity={0.15} blur={140} />
        <GlowOrb color="var(--gold-400)" size={400} bottom="0%" left="-5%" opacity={0.12} blur={120} />
        <GlowOrb color="var(--navy-300)" size={300} top="60%" right="20%" opacity={0.1} blur={100} />

        {/* Geometric art on right */}
        <HeroArt />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-36 lg:pb-24 w-full">
          <div className="mx-auto max-w-3xl lg:mx-0 lg:max-w-2xl">
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
                style={{ fontSize: 'clamp(3rem, 5.5vw + 1rem, 4.75rem)', lineHeight: 1.04 }}
              >
                Validate Any Workforce Program{' '}
                <span className="text-shimmer">in 48 Hours</span>
              </h1>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fade-up" delay={250} duration={800}>
              <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                Comprehensive market analysis, financial projections, and strategic
                recommendations — the rigor of a six-figure consulting engagement,
                delivered in days, not months.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fade-up" delay={400} duration={800}>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/submit">
                  <Button
                    size="lg"
                    className="bg-navy-800 hover:bg-navy-900 text-white shadow-lg btn-lift btn-glow-navy px-8 h-14 text-base font-semibold"
                  >
                    Start a Validation
                  </Button>
                </Link>
                <Link href="#sample-report">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-navy-300 text-navy-800 hover:bg-navy-50 hover:border-navy-400 px-8 h-14 text-base font-semibold transition-all duration-300 backdrop-blur-sm bg-white/70"
                  >
                    See a Sample Report →
                  </Button>
                </Link>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Stats row */}
          <div className="mt-20 sm:mt-24">
            <StaggerChildren stagger={150} variant="fade-up" className="mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
              {[
                { value: 48, suffix: '-Hour', label: 'Report Delivery' },
                { value: 6, suffix: '-Lens', label: 'Analysis Framework' },
                { value: 14, suffix: '+ Page', label: 'Comprehensive Reports' },
                { value: 50000, suffix: '+', label: 'Employer Data Points' },
              ].map(({ value, suffix, label }) => (
                <div key={label} className="text-center rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm p-6">
                  <p className="font-heading font-bold" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.1, background: 'linear-gradient(135deg, var(--navy-800), var(--gold-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    <CountUp end={value} suffix={suffix} duration={2200} />
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-500">{label}</p>
                </div>
              ))}
            </StaggerChildren>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-slate-50 pointer-events-none" />
      </section>

      {/* ===== PROCESS FLOW ===== */}
      <section className="relative py-20 bg-slate-50 border-y border-slate-200/60 overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-[0.06]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <AnimateOnScroll variant="fade-up" className="text-center mb-14">
            <p className="overline mb-3 text-navy-600">How It Works</p>
            <h2 className="font-heading font-bold tracking-tight text-slate-900" style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}>
              From Concept to Confidence
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Our structured validation process turns uncertain program ideas into data-backed decisions.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="scale" delay={200}>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-10 sm:p-14">
              <FlowDiagram />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== IMPACT STATS ===== */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef3fb 100%)' }}>
        <div className="absolute inset-0 bg-grid opacity-[0.1]" />
        <GlowOrb color="var(--gold-500)" size={300} top="20%" left="5%" opacity={0.08} blur={100} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-28">
          <AnimateOnScroll variant="fade-up" className="text-center mb-16">
            <p className="overline mb-3 text-navy-600">Measurable Impact</p>
            <h2 className="font-heading font-bold tracking-tight text-slate-900" style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}>
              Why Institutions Choose Us
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={120} variant="scale" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
            {[
              { value: 500, prefix: '$', suffix: 'k+', description: 'Saved on average by avoiding failed program launches', icon: DollarSign },
              { value: 48, prefix: '', suffix: 'hrs', description: 'Vs. 6 months with traditional consulting firms', icon: Clock },
              { value: 6, prefix: '', suffix: '', description: 'Expert perspectives analyzed in every single report', icon: BarChart3 },
              { value: 100, prefix: '', suffix: '%', description: 'Data-backed recommendations with cited sources', icon: FileText },
            ].map(({ value, prefix, suffix, description, icon: Icon }) => (
              <div key={description} className="group relative text-center p-8 rounded-2xl border border-slate-200 bg-white shadow-md card-hover">
                <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-navy-50 text-navy-700 transition-all duration-300 group-hover:bg-navy-100 group-hover:scale-110 shadow-sm">
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <p className="font-heading font-bold" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', lineHeight: 1.1, background: 'linear-gradient(135deg, var(--navy-800), var(--gold-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  <CountUp end={value} prefix={prefix} suffix={suffix} duration={2000} />
                </p>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== NUMBERED PRODUCT SECTIONS (01, 02, 03) ===== */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-dots opacity-[0.05]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-28">
          <AnimateOnScroll variant="fade-up" className="section-header">
            <p className="overline mb-3">Our Framework</p>
            <h2 className="font-heading font-bold tracking-tight text-slate-900" style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}>
              The 6-Lens Validation Framework
            </h2>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Every program is evaluated through six critical business perspectives,
              organized into three comprehensive analysis pillars.
            </p>
          </AnimateOnScroll>

          <div className="space-y-12">
            {/* 01 — Market Intelligence */}
            <AnimateOnScroll variant="fade-up" duration={800}>
              <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16" style={{ background: 'linear-gradient(135deg, #eef3fb 0%, #dce6f5 100%)' }}>
                {/* Giant background number */}
                <span className="absolute top-4 right-6 sm:right-12 font-heading font-bold text-navy-200/40 select-none" style={{ fontSize: 'clamp(8rem, 15vw, 14rem)', lineHeight: 1 }}>01</span>
                <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-navy-100 px-4 py-1.5 mb-4">
                      <Search className="w-4 h-4 text-navy-600" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-navy-700">Pillar One</span>
                    </div>
                    <h3 className="font-heading font-bold text-slate-900" style={{ fontSize: 'var(--text-heading-lg)' }}>
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
                      <div key={title} className="rounded-xl border border-navy-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-heading font-semibold text-slate-900 text-sm">{title}</h4>
                        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* 02 — Financial Analysis */}
            <AnimateOnScroll variant="fade-up" duration={800}>
              <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16" style={{ background: 'linear-gradient(135deg, #fdf9f0 0%, #f2dfa0 30%, #fdf9f0 100%)' }}>
                <span className="absolute top-4 right-6 sm:right-12 font-heading font-bold text-gold-300/40 select-none" style={{ fontSize: 'clamp(8rem, 15vw, 14rem)', lineHeight: 1 }}>02</span>
                <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-4 py-1.5 mb-4">
                      <DollarSign className="w-4 h-4 text-gold-600" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gold-700">Pillar Two</span>
                    </div>
                    <h3 className="font-heading font-bold text-slate-900" style={{ fontSize: 'var(--text-heading-lg)' }}>
                      Financial Analysis
                    </h3>
                    <p className="mt-4 text-slate-600 leading-relaxed text-lg">
                      CFO-ready financial modeling that answers the hard questions.
                      Know your break-even timeline, enrollment targets, and true ROI
                      before committing resources.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { title: 'Startup Cost Modeling', desc: 'Equipment, facilities, staffing, and accreditation costs' },
                      { title: 'Enrollment Projections', desc: 'Realistic cohort sizing based on regional demographics' },
                      { title: 'Break-Even Analysis', desc: 'Timeline to financial sustainability with scenario modeling' },
                      { title: '5-Year ROI Forecast', desc: 'Net revenue projections with sensitivity analysis' },
                    ].map(({ title, desc }) => (
                      <div key={title} className="rounded-xl border border-gold-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-heading font-semibold text-slate-900 text-sm">{title}</h4>
                        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* 03 — Strategic Roadmap */}
            <AnimateOnScroll variant="fade-up" duration={800}>
              <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16" style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)' }}>
                <span className="absolute top-4 right-6 sm:right-12 font-heading font-bold text-slate-300/50 select-none" style={{ fontSize: 'clamp(8rem, 15vw, 14rem)', lineHeight: 1 }}>03</span>
                <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-4 py-1.5 mb-4">
                      <Target className="w-4 h-4 text-slate-600" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Pillar Three</span>
                    </div>
                    <h3 className="font-heading font-bold text-slate-900" style={{ fontSize: 'var(--text-heading-lg)' }}>
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
                      <div key={title} className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-heading font-semibold text-slate-900 text-sm">{title}</h4>
                        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ===== INDUSTRY VERTICALS ===== */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0a1628 0%, #162d54 40%, #1e3a6b 100%)' }}>
        <div className="absolute inset-0 bg-dots-light opacity-30" />
        <GlowOrb color="var(--gold-500)" size={400} top="10%" right="5%" opacity={0.06} blur={120} />
        <GlowOrb color="var(--navy-400)" size={350} bottom="10%" left="10%" opacity={0.08} blur={100} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <AnimateOnScroll variant="fade-right">
              <p className="overline mb-3 text-navy-300">Industry Verticals</p>
              <h2 className="font-heading font-bold tracking-tight text-white" style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}>
                <span className="block">From healthcare</span>
                <span className="block">to manufacturing</span>
                <span className="block">to cybersecurity</span>
              </h2>
              <p className="mt-6 text-lg text-navy-200 leading-relaxed">
                Our methodology applies to any workforce program. Here are the sectors
                we see the most demand in.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-6">
                {[
                  { val: '200+', label: 'Programs Analyzed' },
                  { val: '35', label: 'States Covered' },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <p className="font-heading text-4xl font-bold text-gold-400">{val}</p>
                    <p className="text-sm text-navy-300 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>

            <StaggerChildren stagger={100} variant="fade-up" className="grid gap-4">
              {[
                { icon: Heart, title: 'Healthcare & Nursing', desc: 'RN, LPN, CNA, Medical Assisting, Health IT, and allied health.' },
                { icon: Factory, title: 'Manufacturing & Trades', desc: 'CNC, welding, industrial maintenance, HVAC, electrical.' },
                { icon: Monitor, title: 'Information Technology', desc: 'Cybersecurity, cloud, software dev, networking, data analytics.' },
                { icon: Briefcase, title: 'Business & Finance', desc: 'Accounting, business admin, entrepreneurship, supply chain.' },
                { icon: ShieldCheck, title: 'Public Safety', desc: 'Criminal justice, fire science, emergency management, paramedic.' },
                { icon: Truck, title: 'Transportation & Logistics', desc: 'CDL training, logistics management, aviation maintenance.' },
              ].map(({ icon: Icon, title, desc }) => (
                <Link
                  key={title}
                  href="/submit"
                  className="group flex items-start gap-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex-shrink-0 mt-1 h-11 w-11 rounded-xl bg-navy-700/50 border border-navy-500/30 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-base font-semibold text-white mb-1">{title}</h3>
                    <p className="text-sm text-navy-200 leading-relaxed">{desc}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-navy-400 group-hover:text-gold-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-2" />
                </Link>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* ===== SAMPLE REPORT ===== */}
      <section
        id="sample-report"
        className="section text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #162d54 0%, #1e3a6b 50%, #0a1628 100%)' }}
      >
        <div className="absolute inset-0 bg-grid opacity-[0.06]" />
        <GlowOrb color="var(--gold-500)" size={500} top="-15%" right="10%" opacity={0.08} blur={140} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <AnimateOnScroll variant="fade-up">
              <p className="overline mb-3 text-navy-300">See What You Get</p>
              <h2 className="font-heading font-bold tracking-tight" style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}>
                Sample Validation Report
              </h2>
              <p className="mt-4 text-lg text-navy-200 leading-relaxed max-w-2xl mx-auto">
                A complete program validation for an Industrial Coatings Specialist
                Certificate — delivered in 48 hours.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll variant="scale" delay={200} duration={900}>
              <div className="mt-10 rounded-2xl card-glass-dark p-8 sm:p-10 text-left shadow-elevated border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-navy-300 mb-1">Program Validation Report</p>
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
                      <p className="text-xs text-navy-300 uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-white font-medium text-lg">{value}</p>
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
                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300">
                      Download Sample Report (PDF)
                    </Button>
                  </Link>
                  <Link href="/submit">
                    <Button size="lg" className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold btn-lift btn-glow-gold">
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
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #eef3fb 0%, #f8fafc 100%)' }}>
        <div className="absolute inset-0 bg-dots opacity-[0.08]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-28">
          <AnimateOnScroll variant="fade-up" className="section-header">
            <p className="overline mb-3">What People Are Saying</p>
            <h2 className="font-heading font-bold tracking-tight text-slate-900" style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}>
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
                className="group rounded-2xl border border-navy-200/50 bg-white p-8 shadow-md card-hover flex flex-col"
              >
                {/* Decorative quote mark */}
                <div className="mb-4 flex-shrink-0">
                  <svg className="w-10 h-10 text-navy-200 group-hover:text-navy-400 transition-colors duration-300" viewBox="0 0 40 40" fill="currentColor" aria-hidden="true">
                    <path d="M10.7 27.3c-2.4-1.5-4-3.8-4-7 0-5.2 4-9.8 9.3-12.3l1.5 2.5c-4.7 2.2-6.2 5.2-6.5 7.5 0.5-0.3 1.3-0.5 2.2-0.5 2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5c-1.3 0-2.5-0.5-3.3-1.3zM25.7 27.3c-2.4-1.5-4-3.8-4-7 0-5.2 4-9.8 9.3-12.3l1.5 2.5c-4.7 2.2-6.2 5.2-6.5 7.5 0.5-0.3 1.3-0.5 2.2-0.5 2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5c-1.3 0-2.5-0.5-3.3-1.3z" />
                  </svg>
                </div>
                <p className="text-slate-700 leading-relaxed flex-1 text-base">
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
      <section id="pricing" className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-grid opacity-[0.08]" />
        <GlowOrb color="var(--navy-300)" size={400} top="20%" left="-10%" opacity={0.05} blur={130} />
        <GlowOrb color="var(--gold-400)" size={300} bottom="10%" right="-5%" opacity={0.04} blur={100} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-28">
          <AnimateOnScroll variant="fade-up" className="section-header">
            <p className="overline mb-3">Investment</p>
            <h2 className="font-heading font-bold tracking-tight text-slate-900" style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}>
              Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              No &quot;contact for pricing&quot; — here&apos;s exactly what it costs.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={150} variant="scale" className="grid lg:grid-cols-3 gap-6 lg:gap-8 mx-auto max-w-5xl items-start">
            {/* Entry */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md card-hover">
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
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md card-hover">
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
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef3fb 100%)' }}>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-28">
          <AnimateOnScroll variant="fade-up" className="section-header">
            <p className="overline mb-3">Common Questions</p>
            <h2 className="font-heading font-bold tracking-tight text-slate-900" style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}>
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
                className="group rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 [&[open]]:border-navy-200 [&[open]]:shadow-md [&[open]]:bg-navy-50/30"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left font-heading font-semibold text-slate-900 [&::-webkit-details-marker]:hidden list-none">
                  <span>{q}</span>
                  <svg className="ml-4 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-45" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
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
        className="text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a1628 0%, #162d54 50%, #1e3a6b 100%)' }}
      >
        <div className="absolute inset-0 bg-dots-light opacity-30" />
        <GlowOrb color="var(--gold-500)" size={500} top="-20%" left="30%" opacity={0.1} blur={150} />
        <GlowOrb color="var(--navy-400)" size={400} bottom="-15%" right="10%" opacity={0.08} blur={120} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-28">
          <AnimateOnScroll variant="scale" duration={900}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading font-bold tracking-tight" style={{ fontSize: 'var(--text-display-lg)', lineHeight: 1.15 }}>
                Ready to validate your next program?
              </h2>
              <p className="mt-4 text-lg text-navy-200">
                Get comprehensive validation backed by real labor market data —
                delivered in 48 hours.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/submit">
                  <Button size="lg" className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold btn-lift btn-glow-gold px-8 h-14 text-base shadow-md">
                    Start a Validation
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 h-14 text-base font-semibold transition-all duration-300">
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
