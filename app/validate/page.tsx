'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Building2,
  Shield,
  Swords,
  Map,
  Flag,
  BarChart3,
  Briefcase,
  Scale,
  BookOpen,
  Users,
} from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { Waveform } from '@/components/cosmic/Waveform';

export default function ValidatePage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">

      {/* ===== HERO ===== */}
      <section className="relative min-h-[75vh] flex items-center justify-center pt-36 lg:pt-40 pb-16 overflow-hidden">
        <Stars count={100} />
        <Aurora className="opacity-75" />
        <Waveform className="opacity-40" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">Stage 2</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={50} duration={800}>
            <div className="mb-6">
              <Link href="/program-development" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gradient-cosmic hover:opacity-80 transition-opacity group">
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                Program Development
              </Link>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="text-gradient-cosmic font-heading font-bold leading-[1.05] mx-auto max-w-4xl"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)' }}
            >
              Program Validation
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200} duration={800}>
            <p className="mt-6 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed font-medium">
              Confirm feasibility before you invest. Before you hire faculty, build curriculum, or seek approval — know with certainty that your program will succeed.
            </p>
            <p className="mt-3 text-base md:text-lg text-theme-tertiary max-w-2xl mx-auto leading-relaxed">
              Seven specialist analyses. Financial projections grounded in comparable program data. A definitive GO&nbsp;/&nbsp;NO-GO recommendation — not a maybe.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={350} duration={800}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:hello@withwavelength.com?subject=Program%20Validation%20Inquiry&body=College%20name%3A%20%0AProgram%20of%20interest%3A%20%0ACity%2C%20State%3A%20">
                <button className="btn-cosmic btn-cosmic-primary">
                  Start Validation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </a>
              <Link href="/discover">
                <button className="btn-cosmic btn-cosmic-ghost">
                  Start with a Market Scan First
                </button>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== WHAT YOU GET ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">What You Get</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-16">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Seven deliverables. One comprehensive answer.
            </h2>
            <p className="text-theme-secondary mt-3 max-w-xl mx-auto">
              Validation goes far deeper than Market Scan surface signals — every analysis is verified against primary data, comparable programs, and employer reality.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'Deep Market Validation',
                desc: 'Beyond Discovery surface signals. Demand verified with primary employer data, salary benchmarks validated against BLS, hiring pipeline depth confirmed.',
              },
              {
                icon: DollarSign,
                title: 'Financial Projections',
                desc: 'Full 5-year financial model: enrollment projections, tuition revenue, cost analysis, break-even timeline, and ROI — based on comparable program data, not guesses.',
              },
              {
                icon: Building2,
                title: 'Employer Demand Verification',
                desc: "The actual employer landscape: who's hiring, how many open positions, growth trajectory, and which employers will partner on work-based learning.",
              },
              {
                icon: Scale,
                title: 'Regulatory Analysis',
                desc: 'State approval requirements, accreditation considerations, licensing and certification alignment, and Workforce Pell eligibility scoring.',
              },
              {
                icon: Swords,
                title: 'Competitive Deep-Dive',
                desc: "Beyond listing competitors. Analyzes their enrollment trends, program strengths and weaknesses, tuition pricing, and where they're vulnerable.",
              },
              {
                icon: Map,
                title: 'Implementation Roadmap',
                desc: 'Timeline from approval to first cohort. Faculty requirements, equipment and space needs, partnership opportunities, and marketing budget.',
              },
              {
                icon: Flag,
                title: 'GO / NO-GO Recommendation',
                desc: 'A clear, evidence-based recommendation. Not hedging — a definitive answer backed by seven independent specialist analyses.',
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

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-20 md:py-28" id="how-it-works">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">How It Works</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-16">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Seven specialist analyses, working in sequence.
            </h2>
            <p className="text-theme-secondary mt-3 max-w-xl mx-auto">
              Each discipline produces an independent finding. Together they build the complete picture.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-purple-500/40 via-blue-500/30 to-teal-500/20 hidden md:block" aria-hidden="true" />

            <div className="space-y-4">
              {[
                {
                  icon: TrendingUp,
                  role: 'Market Analyst',
                  desc: 'Verifies employment demand signals, cross-references BLS projections, and quantifies the local hiring pipeline.',
                },
                {
                  icon: DollarSign,
                  role: 'Financial Analyst',
                  desc: 'Builds the 5-year financial model: enrollment curves, tuition modeling, cost structure, break-even point, and ROI benchmarks from comparable programs.',
                },
                {
                  icon: Building2,
                  role: 'Employer Analyst',
                  desc: "Maps the specific employer landscape — not just industry categories. Which companies, how many positions, what wages, and who's open to partnership.",
                },
                {
                  icon: Shield,
                  role: 'Regulatory Analyst',
                  desc: 'Navigates state approval pathways, accreditor requirements, certification body alignments, and scores Workforce Pell grant eligibility.',
                },
                {
                  icon: Swords,
                  role: 'Competitor Analyst',
                  desc: 'Performs a surgical competitive analysis: competitor enrollment data, pricing, program gaps, and positioning vulnerabilities.',
                },
                {
                  icon: Briefcase,
                  role: 'Institutional Fit Analyst',
                  desc: "Evaluates how the program aligns with your college's mission, existing infrastructure, budget capacity, and strategic priorities.",
                },
                {
                  icon: BookOpen,
                  role: 'Curriculum Designer',
                  desc: 'Scopes the implementation: what faculty, equipment, and space this program requires — and a realistic timeline from approval to first cohort.',
                },
              ].map(({ icon: Icon, role, desc }, i) => (
                <div key={role} className="flex gap-5 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-theme-strong transition-colors">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-theme-strong flex items-center justify-center z-10 relative">
                      <Icon className="h-4 w-4 text-purple-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-theme-muted tracking-widest">0{i + 1}</span>
                      <h3 className="font-heading font-semibold text-theme-primary text-sm">{role}</h3>
                    </div>
                    <p className="text-theme-secondary text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ===== WHAT MAKES THIS DIFFERENT ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-4">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500/60" />
              <span className="overline">What Makes This Different</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-purple-500/60" />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={100} className="text-center mb-12">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Not a feasibility study. A decision.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="space-y-6">
            {[
              {
                title: 'Every number is verified',
                desc: "Financial projections are anchored to comparable program data — actual enrollment figures, actual cost structures from programs like yours. No spreadsheet fantasies.",
              },
              {
                title: 'GO / NO-GO, not a maybe',
                desc: "We commit to a recommendation. If the program isn't viable, we say so clearly — and explain exactly why, so you can redirect resources confidently.",
              },
              {
                title: 'Implementation-ready, not theoretical',
                desc: "The roadmap tells you what faculty to hire, what equipment to budget, and what your marketing plan should look like — before you write a single course.",
              },
              {
                title: 'Seven independent analyses, cross-checked',
                desc: "Each specialist works from the same base data but reaches their conclusions independently. Conflicts surface and get resolved. You get a coherent, internally consistent picture.",
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
      <section className="relative py-20 md:py-28" id="pricing">
        <div className="max-w-[700px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Know before you build.
            </h2>
            <p className="text-theme-secondary mt-3">
              One Validation pays for itself if it stops a single failed program — or confirms one that becomes a revenue engine.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="scale" delay={100}>
            <div className="card-cosmic rounded-2xl p-8 md:p-10 text-center">
              <p className="overline mb-4">ONE-TIME VALIDATION</p>
              <p className="label-brand mb-6 text-center">
                <span className="text-gradient-cosmic">∿ ·</span> Founding rate — limited availability
              </p>

              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-3">
                  <span className="font-heading font-black text-6xl text-theme-primary">$2,000</span>
                  <span className="text-theme-secondary text-sm line-through">$5,500</span>
                </div>
                <p className="text-theme-secondary text-sm mt-2">
                  Full Validation — includes Market Scan deliverables
                </p>
              </div>

              <ul className="text-left max-w-sm mx-auto space-y-3 mb-8">
                {[
                  'Everything in Market Scan',
                  'Deep Market Validation',
                  'Full 5-Year Financial Projections',
                  'Employer Demand Verification',
                  'Regulatory & Accreditation Analysis',
                  'Competitive Deep-Dive',
                  'Implementation Roadmap',
                  'GO / NO-GO Recommendation',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-theme-secondary">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <a href="mailto:hello@withwavelength.com?subject=Program%20Validation%20Inquiry&body=College%20name%3A%20%0AProgram%20of%20interest%3A%20%0ACity%2C%20State%3A%20%0AAny%20additional%20context%3A%20">
                <button className="btn-cosmic btn-cosmic-primary w-full sm:w-auto">
                  Start Your Validation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </a>

              <p className="text-theme-secondary text-xs mt-4">
                Email us at hello@withwavelength.com — we&apos;ll follow up within 48 hours.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════ CROSS-SELL ═══════════════ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-8">
            <span className="overline">Where to go next</span>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimateOnScroll variant="fade-up" delay={100}>
              <Link href="/market-research" className="block card-cosmic rounded-2xl p-7 border-violet-500/20 hover:bg-white/[0.03] transition-colors group h-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading font-bold text-theme-primary text-lg">Program Opportunity Scan</h3>
                  <span className="text-xs font-semibold text-theme-muted">$1,500</span>
                </div>
                <p className="text-theme-secondary text-sm mb-4">Discover 7–10 validated program opportunities for your region — scored, ranked, and backed by real employer demand.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-300 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={200}>
              <Link href="/grant-alignment" className="block card-cosmic rounded-2xl p-7 border-green-500/20 hover:bg-white/[0.03] transition-colors group h-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading font-bold text-theme-primary text-lg">Grant Intelligence Scan</h3>
                  <span className="text-xs font-semibold text-theme-muted">$495</span>
                </div>
                <p className="text-theme-secondary text-sm mb-4">Find and prioritize the grants your programs qualify for — scored, ranked, and ready to pursue.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-300 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ===== AFTER VALIDATION ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[800px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up" className="text-center mb-12">
            <h2
              className="font-heading font-bold text-theme-primary"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              After Validation
            </h2>
            <p className="text-theme-secondary mt-3">
              A GO recommendation means you&apos;re cleared to build. The next stages take you from validated concept to fully operational program.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="space-y-4">
            {[
              {
                stage: '3',
                name: 'Curriculum Design & Development',
                desc: 'Competency mapping, course architecture, and learning outcomes built from real occupation data and employer input.',
              },
              {
                stage: '4',
                name: 'Pathway Development',
                desc: 'Stackable credential design, articulation agreements, and career pathway mapping for maximum student outcomes.',
              },
              {
                stage: '5–8',
                name: 'Content → Launch → Quality Control',
                desc: 'Course content creation, marketing strategy, launch readiness review, and ongoing outcomes tracking.',
              },
            ].map(({ stage, name, desc }) => (
              <div key={stage} className="flex gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-sm text-theme-secondary">{stage}</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-theme-primary text-sm">{name}</h3>
                  <p className="text-theme-secondary text-sm mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>

          <AnimateOnScroll variant="fade-up" delay={300} className="text-center mt-10">
            <Link href="/#how-it-works">
              <button className="btn-cosmic btn-cosmic-ghost text-sm">
                See the Full Lifecycle
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

    </div>
  );
}
