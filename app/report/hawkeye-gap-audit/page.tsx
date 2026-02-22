import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, CheckCircle2, XCircle, Shield, DollarSign, Clock, Building2, TrendingUp } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { PrintButton } from '@/components/ui/PrintButton';

export const metadata: Metadata = {
  title: 'State-Mandated Program Gap Analysis — Hawkeye Community College | Wavelength',
  description:
    'Live State-Mandated Program Gap Analysis for Hawkeye Community College, Waterloo Iowa. 8 compliance gaps identified across 25 state-mandated programs — $1.2M Year 1, scaling to $1.9M Year 2+.',
  alternates: { canonical: 'https://withwavelength.com/report/hawkeye-gap-audit' },
  openGraph: {
    title: 'State-Mandated Program Gap Analysis — Hawkeye Community College',
    description:
      '8 compliance gaps, $1.2M–$1.9M revenue opportunity. 25 Iowa-mandated programs analyzed against Hawkeye\'s current catalog.',
    url: 'https://withwavelength.com/report/hawkeye-gap-audit',
    type: 'article',
  },
};

// ─── Helper Components ────────────────────────────────────────────────────────

function HealthBar({ score, max = 100, color = 'purple' }: { score: number; max?: number; color?: string }) {
  const pct = (score / max) * 100;
  const gradients: Record<string, string> = {
    purple: 'linear-gradient(90deg, #a855f7, #6366f1)',
    teal: 'linear-gradient(90deg, #14b8a6, #0ea5e9)',
    amber: 'linear-gradient(90deg, #f59e0b, #f97316)',
    rose: 'linear-gradient(90deg, #f43f5e, #e11d48)',
    blue: 'linear-gradient(90deg, #3b82f6, #6366f1)',
    green: 'linear-gradient(90deg, #22c55e, #14b8a6)',
  };
  return (
    <div className="w-full h-2 rounded-full bg-theme-surface overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: gradients[color] ?? gradients.purple }}
      />
    </div>
  );
}

function DemandBadge({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const map = {
    HIGH: { cls: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20' },
    MEDIUM: { cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' },
    LOW: { cls: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20' },
  };
  const m = map[level];
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${m.cls}`}>{level}</span>;
}

// ─── Real Pipeline Data (Generated 2026-02-19 via live compliance-gap pipeline v2) ──

const complianceStats = {
  totalMandated: 25,
  currentlyOffered: 17,
  gaps: 8,
  complianceRate: 68,
  year1Revenue: 515_932,
  year2Revenue: 998_614,
  highPriorityGaps: 8,
};

const offeredPrograms = [
  'Certified Nurse Aide (CNA)',
  'Emergency Medical Technician (EMT)',
  'Paramedic',
  'Licensed Practical Nurse (LPN)',
  'Registered Nurse (RN/ADN)',
  'Certified Pharmacy Technician',
  'Occupational Therapy Continuing Education',
  'Physical Therapy Continuing Education',
  'Licensed Massage Therapist',
  'Commercial Driver\'s License (CDL) Entry Level Driver Training',
  'Child Care Provider Professional Development',
  'Plumbing Journeyperson',
  'HVAC/Mechanical Systems Journeyperson',
  'Professional Engineer Continuing Education',
  'Land Surveyor Continuing Education',
  'Dental Hygienist Continuing Education',
  'Respiratory Therapist',
];

const gapPrograms = [
  {
    rank: 1,
    name: 'Barber',
    hours: 2100,
    regulatoryBody: 'Iowa Board of Barbering and Cosmetology Arts and Sciences',
    statute: 'Iowa Code Chapter 157; IAC 481—Chapters 940-946',
    requirement: '2,100 hours of training from an approved barber school',
    demandLevel: 'LOW' as const,
    regionalDemand: '~1,800 licensed barbers statewide; Waterloo region ~40-50',
    tuitionPerStudent: 14_546,
    tuitionRange: '$14,480–$14,980',
    cohortSize: 12,
    cohortsYear1: 1,
    cohortsYear2: 2,
    year1Revenue: 174_552,
    year2Revenue: 349_104,
    programLength: '12–18 months full-time',
    cipCode: '12.0402 (Barbering/Barber)',
    implementationComplexity: 'High',
    timeToRevenue: '18–24 months',
    keyInsight: 'Premium tuition ($14,546) reflects 2,100-hour requirement. As of 2023, barbering is regulated under the consolidated Board of Barbering and Cosmetology Arts and Sciences (IAC 481). Kirkwood Community College operates the nearest competing program.',
  },
  {
    rank: 2,
    name: 'Esthetician',
    hours: 600,
    regulatoryBody: 'Iowa Board of Barbering and Cosmetology Arts and Sciences',
    statute: 'Iowa Code Chapter 157; IAC 481—Chapters 940-946',
    requirement: '600 hours of training from an approved school',
    demandLevel: 'MEDIUM' as const,
    regionalDemand: '~3,000 licensed estheticians statewide; Waterloo region ~65-80',
    tuitionPerStudent: 12_000,
    tuitionRange: '$7,395–$14,525',
    cohortSize: 14,
    cohortsYear1: 1,
    cohortsYear2: 2,
    year1Revenue: 168_000,
    year2Revenue: 336_000,
    programLength: '4–6 months full-time',
    cipCode: '—',
    implementationComplexity: 'Medium',
    timeToRevenue: '12–18 months',
    keyInsight: 'Growth sector driven by medical spa expansion. $12,000 market-rate tuition for 600-hour program. Complements cosmetology and nail technology — shared facility space. Recommended as first cosmetology-cluster launch.',
  },
  {
    rank: 3,
    name: 'Cosmetologist',
    hours: 2100,
    regulatoryBody: 'Iowa Board of Barbering and Cosmetology Arts and Sciences',
    statute: 'Iowa Code Chapter 157; IAC 481—Chapters 940-946',
    requirement: '2,100 hours of training from an approved cosmetology school',
    demandLevel: 'MEDIUM' as const,
    regionalDemand: '~12,000 licensed cosmetologists statewide; Waterloo region ~260-300',
    tuitionPerStudent: 4_795,
    tuitionRange: '$4,150–$9,172',
    cohortSize: 14,
    cohortsYear1: 1,
    cohortsYear2: 2,
    year1Revenue: 67_130,
    year2Revenue: 134_260,
    programLength: '12–18 months full-time',
    cipCode: '12.0401 (Cosmetology/Cosmetologist, General)',
    implementationComplexity: 'High',
    timeToRevenue: '18–24 months',
    keyInsight: 'Largest licensee population in the cosmetology cluster (260-300 regional). Shares facility requirements with esthetics and nail programs, creating economies of scope. Supports federal financial aid eligibility.',
  },
  {
    rank: 4,
    name: 'Nail Technician',
    hours: 325,
    regulatoryBody: 'Iowa Board of Barbering and Cosmetology Arts and Sciences',
    statute: 'Iowa Code Chapter 157; IAC 481—Chapters 940-946',
    requirement: '325 hours of training from an approved school',
    demandLevel: 'MEDIUM' as const,
    regionalDemand: '~2,500 licensed nail technicians statewide; Waterloo region ~55-70',
    tuitionPerStudent: 3_000,
    tuitionRange: '$1,700–$4,600',
    cohortSize: 14,
    cohortsYear1: 1,
    cohortsYear2: 2,
    year1Revenue: 42_000,
    year2Revenue: 84_000,
    programLength: '8–12 weeks full-time',
    cipCode: '—',
    implementationComplexity: 'Medium',
    timeToRevenue: '12–18 months',
    keyInsight: 'Lowest hour requirement in cosmetology suite. Serves immigrant entrepreneurs disproportionately — accessible licensure pathway for non-native English speakers. Complements cosmetology and esthetics.',
  },
  {
    rank: 5,
    name: 'Real Estate Salesperson',
    hours: 60,
    regulatoryBody: 'Iowa Professional Licensing Bureau',
    statute: 'Iowa Code Chapter 543B; Iowa Admin. Code 193E',
    requirement: '60 hours of pre-license education from an approved provider within 24 months prior to examination',
    demandLevel: 'MEDIUM' as const,
    regionalDemand: '~8,500 active salespersons statewide; Waterloo region ~180-220',
    tuitionPerStudent: 500,
    tuitionRange: '$500',
    cohortSize: 20,
    cohortsYear1: 2,
    cohortsYear2: 3,
    year1Revenue: 20_000,
    year2Revenue: 30_000,
    programLength: '6–10 weeks part-time',
    cipCode: '52.1501 (Real Estate)',
    implementationComplexity: 'Low',
    timeToRevenue: '3–6 months',
    keyInsight: 'Low-overhead professional development offering. Hybrid delivery (online + in-person exam prep). Partner with local brokerages for employer-sponsored enrollment. 36-hour CE requirement every 3 years creates recurring revenue.',
  },
  {
    rank: 6,
    name: 'Real Estate Broker',
    hours: 60,
    regulatoryBody: 'Iowa Professional Licensing Bureau',
    statute: 'Iowa Code Chapter 543B; Iowa Admin. Code 193E',
    requirement: '60 hours of broker pre-license education within 24 months prior to examination (requires 2 years salesperson experience)',
    demandLevel: 'MEDIUM' as const,
    regionalDemand: '~3,200 active brokers statewide; Waterloo region ~70-90',
    tuitionPerStudent: 500,
    tuitionRange: '$500',
    cohortSize: 20,
    cohortsYear1: 2,
    cohortsYear2: 3,
    year1Revenue: 20_000,
    year2Revenue: 30_000,
    programLength: '6–10 weeks part-time',
    cipCode: '52.1501 (Real Estate)',
    implementationComplexity: 'Low',
    timeToRevenue: '3–6 months',
    keyInsight: 'Pairs with Salesperson program. Advanced curriculum covers agency, finance, and brokerage management. Partner with Coldwell Banker, RE/MAX, Keller Williams for employer-sponsored cohorts.',
  },
  {
    rank: 7,
    name: 'Mandatory Reporter Training — Educators & School Staff',
    hours: 2,
    regulatoryBody: 'Iowa Department of Education',
    statute: 'Iowa Code Chapter 232; Iowa Admin. Code 281-13.28',
    requirement: '2 hours child abuse mandatory reporter training for all school employees 18+; renewal every 3 years for educator license maintenance',
    demandLevel: 'HIGH' as const,
    regionalDemand: '~110,000 K-12 educators and staff statewide; Waterloo region ~2,500-3,000',
    tuitionPerStudent: 45,
    tuitionRange: '$25–$75',
    cohortSize: 25,
    cohortsYear1: 6,
    cohortsYear2: 8,
    year1Revenue: 6_750,
    year2Revenue: 9_000,
    programLength: '2 hours',
    cipCode: '—',
    implementationComplexity: 'Low',
    timeToRevenue: '2–4 months',
    keyInsight: 'Highest-volume recurring demand with 3-year renewal cycle. Online or in-person delivery. Strong institutional partnership potential with school districts and child care centers. Minimal infrastructure — revenue is modest per student but highly scalable.',
  },
  {
    rank: 8,
    name: 'Certified Food Protection Manager',
    hours: 8,
    regulatoryBody: 'Iowa Dept. of Inspections and Appeals, Food and Consumer Safety Bureau',
    statute: 'Iowa Code Chapter 137F; Iowa Admin. Code 481-31.4',
    requirement: 'Pass ANSI-accredited food safety manager certification exam (ServSafe, Prometric, etc.); at least one certified manager required per food establishment',
    demandLevel: 'HIGH' as const,
    regionalDemand: '~15,000 food establishments statewide; Waterloo region ~350-400',
    tuitionPerStudent: 175,
    tuitionRange: '$150–$200',
    cohortSize: 25,
    cohortsYear1: 4,
    cohortsYear2: 6,
    year1Revenue: 17_500,
    year2Revenue: 26_250,
    programLength: '1–2 days',
    cipCode: '—',
    implementationComplexity: 'Low',
    timeToRevenue: '3–6 months',
    keyInsight: 'Quick-win deployment. Minimal infrastructure — standard classroom and ANSI-accredited exam partnership (ServSafe). Certifications expire every 5 years, creating recurring demand. Strong employer-sponsored enrollment potential.',
  },
];

const complianceCategories = [
  { category: 'Healthcare & Allied Health', mandated: 7, offered: 7, gaps: 0, color: 'teal' },
  { category: 'Skilled Trades & Transportation', mandated: 3, offered: 3, gaps: 0, color: 'teal' },
  { category: 'Cosmetology & Barbering', mandated: 4, offered: 0, gaps: 4, color: 'rose' },
  { category: 'Mandatory Professional Training', mandated: 2, offered: 0, gaps: 2, color: 'rose' },
  { category: 'Real Estate & Professional Licensing', mandated: 2, offered: 0, gaps: 2, color: 'amber' },
  { category: 'Education & Child Welfare', mandated: 1, offered: 1, gaps: 0, color: 'teal' },
  { category: 'Professional Services & CE', mandated: 6, offered: 6, gaps: 0, color: 'teal' },
];

const strategicRecommendations = [
  {
    timeline: 'Quick Wins (0–6 Months)',
    color: 'teal',
    icon: '⚡',
    actions: [
      {
        title: 'Launch Mandatory Reporter Training as online compliance solution for regional school districts',
        effort: 'Low',
        impact: 'High',
        revenue: '$7K–$9K/yr (high volume)',
      },
      {
        title: 'Deploy Certified Food Protection Manager training — partner with ServSafe or Prometric',
        effort: 'Low',
        impact: 'Medium',
        revenue: '$18K–$26K/yr',
      },
      {
        title: 'Develop Real Estate Salesperson & Broker pre-license programs — classroom + hybrid delivery',
        effort: 'Low',
        impact: 'Medium',
        revenue: '$40K–$60K/yr combined',
      },
    ],
  },
  {
    timeline: 'Strategic Builds (6–18 Months)',
    color: 'blue',
    icon: '🔨',
    actions: [
      {
        title: 'Launch Esthetician program as first cosmetology-cluster offering — 600 hours, $12K tuition',
        effort: 'Medium',
        impact: 'High',
        revenue: '$168K Yr1 → $336K Yr2+',
      },
      {
        title: 'Conduct feasibility study for Cosmetology & Barbering Center of Excellence',
        effort: 'Medium',
        impact: 'High',
        revenue: 'Enables $903K cluster',
      },
      {
        title: 'Launch Nail Technician program in shared cosmetology facility — 325 hours',
        effort: 'Medium',
        impact: 'Medium',
        revenue: '$42K Yr1 → $84K Yr2+',
      },
    ],
  },
  {
    timeline: 'Long-Term Investments (18+ Months)',
    color: 'purple',
    icon: '🔭',
    actions: [
      {
        title: 'Open Cosmetology & Barbering programs — 2,100 hours each, dedicated facility with student clinic',
        effort: 'High',
        impact: 'High',
        revenue: '$242K Yr1 → $483K Yr2+',
      },
      {
        title: 'Pursue Perkins V funding and Iowa Skilled Workforce Shortage Tuition Grant eligibility',
        effort: 'Medium',
        impact: 'High',
        revenue: 'Offsets capital investment',
      },
      {
        title: 'Integrate compliance programs into strategic enrollment management and equity initiatives',
        effort: 'Medium',
        impact: 'Medium',
        revenue: 'Enrollment growth',
      },
    ],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HawkeyeGapAuditPage() {
  const totalYear1 = gapPrograms.reduce((s, g) => s + g.year1Revenue, 0);
  const totalYear2 = gapPrograms.reduce((s, g) => s + g.year2Revenue, 0);

  return (
    <div className="overflow-x-hidden bg-theme-page">

      {/* ═══════════ A. HERO ═══════════ */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-32 lg:pt-36 pb-16">
        <Stars count={120} />
        <Aurora className="opacity-60" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">State-Mandated Program Gap Analysis · Live Report</span>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="font-heading font-bold text-gradient-cosmic leading-[1.05] mx-auto max-w-4xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4rem)' }}
            >
              Hawkeye Community College
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={180} duration={800}>
            <p className="mt-4 text-lg text-theme-secondary">
              Waterloo, Iowa · State-Mandated Program Compliance · February 2026
            </p>
          </AnimateOnScroll>

          {/* Stat Pills */}
          <AnimateOnScroll variant="fade-up" delay={260} duration={800}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                25 Mandated Programs
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                17 Currently Offered
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                8 State-Mandated Program Gaps
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                $516K → $999K Revenue
              </span>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={340} duration={800}>
            <div className="mt-6 flex justify-center">
              <PrintButton />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ B. COMPLIANCE SCORE ═══════════ */}
      <section className="relative py-16 md:py-24 print:py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Compliance Score</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                State-Mandated Program Coverage
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
            {/* Big Score */}
            <AnimateOnScroll variant="fade-up">
              <div className="card-cosmic rounded-2xl p-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-4">
                  Compliance Rate
                </p>
                <div
                  className="text-8xl font-bold font-mono mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  68%
                </div>
                <p className="text-sm text-theme-muted">17 of 25 mandated programs</p>
                <div className="mt-4">
                  <HealthBar score={68} color="amber" />
                </div>
                <p className="mt-5 text-xs text-theme-tertiary leading-relaxed">
                  Hawkeye offers 17 of 25 Iowa state-mandated training programs. 8 gaps represent both regulatory exposure and unrealized revenue scaling from $516K in Year 1 to $999K annually at steady state.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Category Breakdown */}
            <AnimateOnScroll variant="fade-up" delay={100}>
              <div className="card-cosmic rounded-2xl p-7">
                <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-6">
                  Compliance by Category
                </p>
                <div className="space-y-5">
                  {complianceCategories.map((cat) => (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-theme-primary">{cat.category}</span>
                        <span className="text-sm font-mono font-bold text-theme-secondary">
                          {cat.offered}/{cat.mandated}
                          {cat.gaps > 0 && (
                            <span className="text-rose-500 ml-2">({cat.gaps} gap{cat.gaps > 1 ? 's' : ''})</span>
                          )}
                        </span>
                      </div>
                      <HealthBar score={cat.offered} max={cat.mandated} color={cat.gaps === 0 ? 'teal' : cat.color} />
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════ C. EXECUTIVE SUMMARY ═══════════ */}
      <section className="relative py-16 md:py-20 bg-theme-surface/30 print:py-8">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline block text-center mb-3">Executive Summary</span>
            <h2
              className="font-heading font-bold text-theme-primary text-center mb-8"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              What This Analysis Found
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={80}>
            <div className="space-y-5 text-theme-secondary leading-relaxed">
              <p>
                Hawkeye Community College currently offers 17 of the 25 state-mandated training programs required under Iowa law, representing a <strong>68% compliance rate</strong>. This analysis identifies <strong>8 critical compliance gaps</strong> where the institution is not currently serving populations legally required to obtain licensure or certification.
              </p>
              <p>
                The eight missing programs span three high-demand sectors: <strong>cosmetology and barbering</strong> (Esthetician, Cosmetologist, Nail Technician, Barber), <strong>mandatory professional training</strong> (Mandatory Reporter Training for educators, Certified Food Protection Manager), and <strong>real estate licensing</strong> (Salesperson and Broker pre-license education).
              </p>
              <p>
                Conservative revenue projections estimate <strong>$515,932 in Year 1 tuition revenue</strong> from initial program launches, scaling to <strong>$998,614 annually by Year 2+</strong> as cohorts expand. These figures use realistic cohort sizes (12–25 students) and market-rate tuition verified through web research at comparable Iowa institutions. Tuition revenue only — does not include fees, materials, or grant funding.
              </p>
              <p>
                The highest-revenue programs — Barber ($174,552 Year 1), Esthetician ($168,000), and Cosmetologist ($67,130) — require significant facility investment but serve established markets with verified demand. Quick-win programs — Real Estate, Mandatory Reporter, and Food Protection — can launch within 3–6 months with minimal infrastructure.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Key Findings Strip */}
          <AnimateOnScroll variant="fade-up" delay={160}>
            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl p-5 bg-teal-500/5 border border-teal-500/15">
                <CheckCircle2 className="w-5 h-5 text-teal-500 mb-3" />
                <p className="text-sm font-bold text-theme-primary mb-1">Full Compliance</p>
                <p className="text-xs text-theme-secondary leading-relaxed">Healthcare, skilled trades, transportation, and professional CE programs — all mandated programs offered.</p>
              </div>
              <div className="rounded-xl p-5 bg-rose-500/5 border border-rose-500/15">
                <XCircle className="w-5 h-5 text-rose-500 mb-3" />
                <p className="text-sm font-bold text-theme-primary mb-1">Major Gap Cluster</p>
                <p className="text-xs text-theme-secondary leading-relaxed">Cosmetology & barbering: 0 of 4 mandated programs offered. $451K Year 1, scaling to $903K at steady state.</p>
              </div>
              <div className="rounded-xl p-5 bg-amber-500/5 border border-amber-500/15">
                <AlertTriangle className="w-5 h-5 text-amber-500 mb-3" />
                <p className="text-sm font-bold text-theme-primary mb-1">Quick Wins Available</p>
                <p className="text-xs text-theme-secondary leading-relaxed">Real Estate, Mandatory Reporter, and Food Protection can launch in 2–6 months with minimal infrastructure investment.</p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ D. CURRENTLY OFFERED ═══════════ */}
      <section className="relative py-16 md:py-24 print:py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Section D · Programs in Compliance</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                17 Mandated Programs Currently Offered
              </h2>
              <p className="mt-3 text-theme-secondary max-w-xl mx-auto text-sm">
                These state-mandated training programs are already part of Hawkeye&apos;s catalog, meeting Iowa regulatory requirements.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={80}>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {offeredPrograms.map((prog) => (
                <div
                  key={prog}
                  className="flex items-center gap-2.5 rounded-lg p-3.5 bg-teal-500/5 border border-teal-500/15"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <span className="text-[13px] text-theme-primary font-medium">{prog}</span>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ E. COMPLIANCE GAPS ═══════════ */}
      <section className="relative py-16 md:py-24 bg-theme-surface/30 print:py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Section E · State-Mandated Program Gaps</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                8 State-Mandated Programs Not Offered
              </h2>
              <p className="mt-3 text-theme-secondary max-w-xl mx-auto text-sm">
                Each gap includes Iowa statutory citations, market-rate tuition, realistic cohort sizes (12–25), and Year 1 / Year 2+ revenue projections.
              </p>
            </div>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="space-y-6">
            {gapPrograms.map((gap) => (
              <div key={gap.rank} className="card-cosmic rounded-2xl p-7">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
                    >
                      {gap.rank}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-0.5">
                        State-Mandated Program Gap · {gap.hours.toLocaleString()} Hours Required
                      </p>
                      <h3 className="font-heading font-bold text-lg text-theme-primary leading-snug">
                        {gap.name}
                      </h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <DemandBadge level={gap.demandLevel} />
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      gap.implementationComplexity === 'Low'
                        ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20'
                        : gap.implementationComplexity === 'Medium'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {gap.implementationComplexity} Complexity
                    </span>
                  </div>
                </div>

                {/* Stats Row — now shows Year 1 AND Year 2+ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="rounded-lg p-3 bg-theme-surface/50 border border-theme-subtle text-center">
                    <DollarSign className="w-4 h-4 text-teal-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-0.5">Year 1</p>
                    <p className="text-lg font-bold font-mono text-teal-600 dark:text-teal-400">
                      ${gap.year1Revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg p-3 bg-theme-surface/50 border border-theme-subtle text-center">
                    <TrendingUp className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-0.5">Year 2+</p>
                    <p className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">
                      ${gap.year2Revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg p-3 bg-theme-surface/50 border border-theme-subtle text-center">
                    <Building2 className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-0.5">Tuition</p>
                    <p className="text-sm font-bold font-mono text-theme-primary">${gap.tuitionPerStudent.toLocaleString()}</p>
                    <p className="text-[10px] text-theme-muted">{gap.tuitionRange}</p>
                  </div>
                  <div className="rounded-lg p-3 bg-theme-surface/50 border border-theme-subtle text-center">
                    <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-0.5">Program Length</p>
                    <p className="text-sm font-bold text-theme-primary">{gap.programLength}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-2">
                        <Shield className="w-3.5 h-3.5 inline mr-1" />
                        Regulatory Authority
                      </p>
                      <p className="text-sm text-theme-secondary">{gap.regulatoryBody}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-2">
                        Statutory Citation
                      </p>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-mono">{gap.statute}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-2">
                        Training Requirement
                      </p>
                      <p className="text-sm text-theme-secondary">{gap.requirement}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-2">
                        Regional Demand
                      </p>
                      <p className="text-sm text-theme-secondary">{gap.regionalDemand}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-2">
                        Revenue Model
                      </p>
                      <p className="text-sm text-theme-secondary">
                        {gap.cohortSize} students/cohort × {gap.cohortsYear1} cohort{gap.cohortsYear1 > 1 ? 's' : ''} Yr1 → {gap.cohortsYear2} Yr2+ × ${gap.tuitionPerStudent.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl p-4 bg-purple-500/5 border border-purple-500/15">
                      <p className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">
                        Key Insight
                      </p>
                      <p className="text-sm text-theme-secondary leading-relaxed">{gap.keyInsight}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════ F. REVENUE OPPORTUNITY SIZING ═══════════ */}
      <section className="relative py-16 md:py-24 print:py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Section F · Revenue Opportunity</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                $516K Year 1 → $999K Year 2+
              </h2>
              <p className="mt-3 text-theme-secondary max-w-xl mx-auto text-sm">
                Conservative enrollment projections with realistic cohort sizes (12–25 students) and market-rate tuition verified at comparable Iowa institutions.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Revenue Summary Cards */}
          <AnimateOnScroll variant="fade-up" delay={80}>
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              <div className="card-cosmic rounded-2xl p-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-2">
                  Cosmetology & Barbering Cluster
                </p>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div>
                    <p className="text-[10px] text-theme-muted">Year 1</p>
                    <p
                      className="text-2xl font-bold font-mono"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      $451K
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-theme-muted" />
                  <div>
                    <p className="text-[10px] text-theme-muted">Year 2+</p>
                    <p
                      className="text-2xl font-bold font-mono"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      $903K
                    </p>
                  </div>
                </div>
                <p className="text-sm text-theme-muted">87% of total opportunity · High capital investment</p>
                <p className="text-xs text-theme-tertiary mt-2">Barber + Esthetician + Cosmetologist + Nail Technician</p>
              </div>
              <div className="card-cosmic rounded-2xl p-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-2">
                  Quick-Launch Programs
                </p>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div>
                    <p className="text-[10px] text-theme-muted">Year 1</p>
                    <p
                      className="text-2xl font-bold font-mono"
                      style={{
                        background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      $64K
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-theme-muted" />
                  <div>
                    <p className="text-[10px] text-theme-muted">Year 2+</p>
                    <p
                      className="text-2xl font-bold font-mono"
                      style={{
                        background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      $95K
                    </p>
                  </div>
                </div>
                <p className="text-sm text-theme-muted">13% of total · Minimal capital required</p>
                <p className="text-xs text-theme-tertiary mt-2">Real Estate (×2) + Mandatory Reporter + Food Protection</p>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Revenue Table */}
          <AnimateOnScroll variant="fade-up" delay={120}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-theme-subtle">
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Program</th>
                    <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Year 1</th>
                    <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Year 2+</th>
                    <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Cohort</th>
                    <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Complexity</th>
                  </tr>
                </thead>
                <tbody>
                  {gapPrograms.map((gap) => (
                    <tr
                      key={gap.rank}
                      className="border-b border-theme-subtle/50 hover:bg-theme-surface/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-theme-primary text-[13px]">{gap.name}</p>
                        <p className="text-[11px] text-theme-muted mt-0.5">{gap.statute}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-teal-600 dark:text-teal-400 text-[14px]">
                        ${gap.year1Revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-purple-600 dark:text-purple-400 text-[14px]">
                        ${gap.year2Revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center text-[13px] text-theme-secondary">
                        {gap.cohortSize} students
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          gap.implementationComplexity === 'Low'
                            ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400'
                            : gap.implementationComplexity === 'Medium'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                        }`}>
                          {gap.implementationComplexity}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-theme-subtle">
                    <td className="py-3 px-4 font-bold text-theme-primary">TOTAL</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[16px]" style={{
                      background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      ${totalYear1.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[16px]" style={{
                      background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      ${totalYear2.toLocaleString()}
                    </td>
                    <td />
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ G. STRATEGIC RECOMMENDATIONS ═══════════ */}
      <section className="relative py-16 md:py-24 bg-theme-surface/30 print:py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Section G · Strategic Recommendations</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                Implementation Roadmap
              </h2>
              <p className="mt-3 text-theme-secondary max-w-xl mx-auto text-sm">
                Organized by timeline. Quick wins require minimal resources; long-term investments require capital but generate the largest sustained revenue.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            {strategicRecommendations.map((tier) => (
              <AnimateOnScroll key={tier.timeline} variant="fade-up" delay={80}>
                <div className="card-cosmic rounded-2xl p-6 h-full flex flex-col">
                  <div className="mb-5">
                    <span className="text-2xl">{tier.icon}</span>
                    <h3 className={`font-heading font-bold text-base mt-2 ${
                      tier.color === 'teal' ? 'text-teal-600 dark:text-teal-400'
                      : tier.color === 'blue' ? 'text-blue-600 dark:text-blue-400'
                      : 'text-purple-600 dark:text-purple-400'
                    }`}>
                      {tier.timeline}
                    </h3>
                  </div>
                  <div className="space-y-4 flex-1">
                    {tier.actions.map((action, j) => (
                      <div
                        key={j}
                        className="rounded-lg p-3.5 bg-theme-surface/50 border border-theme-subtle"
                      >
                        <p className="text-[12px] font-semibold text-theme-primary leading-snug mb-1.5">
                          {action.title}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            action.effort === 'Low' ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400'
                            : action.effort === 'Medium' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                          }`}>
                            Effort: {action.effort}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            action.impact === 'High' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
                            : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                          }`}>
                            Impact: {action.impact}
                          </span>
                        </div>
                        <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">{action.revenue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ H. METHODOLOGY ═══════════ */}
      <section className="relative py-16 md:py-20 print:py-10">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline block text-center mb-3">Section H · Methodology</span>
            <h2
              className="font-heading font-bold text-theme-primary text-center mb-10"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              How This Report Was Generated
            </h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 gap-6">
            <AnimateOnScroll variant="fade-up" delay={80}>
              <div className="card-cosmic rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-4">
                  Three-Agent Pipeline
                </p>
                <ul className="space-y-4">
                  {[
                    {
                      step: 'Agent 1: Catalog Scanner',
                      desc: 'Scraped hawkeyecollege.edu across 37 candidate pages. Fetched 12 relevant program pages and extracted 107 distinct programs via AI analysis. Duration: 28 seconds.',
                    },
                    {
                      step: 'Agent 2: Regulatory Scanner',
                      desc: 'Executed 16 targeted web searches across Iowa regulatory databases. Analyzed Iowa Code and Admin. Code across 5 regulatory bodies. Identified 25 state-mandated programs with statute citations. Duration: 88 seconds.',
                    },
                    {
                      step: 'Agent 3: Gap Analyzer',
                      desc: 'Cross-referenced 25 mandated programs vs 107 offered. Found 8 gaps, 17 already offered. Conducted 24 market-rate tuition searches for pricing verification. Duration: 124 seconds.',
                    },
                  ].map((item) => (
                    <li key={item.step} className="flex items-start gap-3">
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 pt-0.5 flex-shrink-0 w-32">{item.step}</span>
                      <span className="text-[12px] text-theme-secondary leading-snug">{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fade-up" delay={160}>
              <div className="card-cosmic rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-4">
                  Data Sources & Revenue Model
                </p>
                <ul className="space-y-3">
                  {[
                    { source: 'Iowa Code', desc: 'Chapters 137F, 157, 158, 232, 543B — mandatory training and licensing statutes' },
                    { source: 'Iowa Admin. Code', desc: 'Rules 281-13.28, 481-31.4, 645-60/61/64/65, 193E — regulatory implementation' },
                    { source: 'Hawkeye Website', desc: 'hawkeyecollege.edu — 107 programs extracted from catalog and workforce training pages' },
                    { source: 'Licensing Boards', desc: 'Iowa Board of Barbering and Cosmetology Arts and Sciences, Board of Barbering, Professional Licensing Bureau' },
                    { source: 'Market Pricing', desc: 'Tuition verified via web search at Iowa community colleges and private training providers' },
                    { source: 'Revenue Model', desc: 'Cohorts of 12–25 students (lab vs classroom). Year 1: 1–2 cohorts. Year 2+: 2–4 cohorts at scale.' },
                  ].map((item) => (
                    <li key={item.source} className="flex items-start gap-3">
                      <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 pt-0.5 flex-shrink-0 w-24">{item.source}</span>
                      <span className="text-[12px] text-theme-secondary leading-snug">{item.desc}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 pt-4 border-t border-theme-subtle">
                  <p className="text-[11px] text-theme-muted leading-relaxed">
                    <strong>Pipeline runtime:</strong> 240 seconds · <strong>Model:</strong> Claude Sonnet 4.5 · <strong>Searches:</strong> 40+ web queries · <strong>Pages analyzed:</strong> 18 fetched pages
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════ I. CTA ═══════════ */}
      <section className="relative py-20 md:py-28 bg-theme-surface/30 print:hidden">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Get Your Audit</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              What compliance gaps exist in your catalog?
            </h2>
            <p className="mt-4 text-theme-secondary text-lg leading-relaxed">
              Know exactly which state-mandated programs you&apos;re missing — with real statute citations, market-rate pricing, and Year 1 / Year 2+ revenue projections.
              Delivered in 48 hours.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div
                className="text-3xl font-bold font-mono"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #6366f1, #14b8a6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                $300
              </div>
              <span className="text-theme-muted text-sm">per institution · delivered within 48 hours</span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="btn-cosmic btn-cosmic-primary text-sm py-3 px-8">
                  Order a State-Mandated Program Gap Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link href="/samples">
                <button className="btn-cosmic btn-cosmic-ghost text-sm py-3 px-8">
                  View All Sample Reports
                </button>
              </Link>
            </div>

            <p className="mt-6 text-xs text-theme-muted">
              Includes: catalog scan, regulatory mandate identification, gap analysis, market-rate tuition research, Year 1 &amp; Year 2+ revenue projections, and implementation roadmap.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

    </div>
  );
}
