import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, CheckCircle2, XCircle, Shield, DollarSign, Clock, Building2 } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { PrintButton } from '@/components/ui/PrintButton';

export const metadata: Metadata = {
  title: 'Compliance Gap Analysis — Hawkeye Community College | Wavelength',
  description:
    'Live Compliance Gap Analysis for Hawkeye Community College, Waterloo Iowa. 8 compliance gaps identified across 27 state-mandated programs — $3.8M estimated annual revenue opportunity.',
  alternates: { canonical: 'https://withwavelength.com/report/hawkeye-gap-audit' },
  openGraph: {
    title: 'Compliance Gap Analysis — Hawkeye Community College',
    description:
      '8 compliance gaps, $3.8M revenue opportunity. 27 Iowa-mandated programs analyzed against Hawkeye\'s current catalog.',
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

// ─── Real Pipeline Data (Generated 2026-02-19 via live compliance-gap pipeline) ──

const complianceStats = {
  totalMandated: 27,
  currentlyOffered: 19,
  gaps: 8,
  complianceRate: 70,
  estimatedAnnualRevenue: 3_834_360,
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
  'Professional Engineer Continuing Education',
  'Land Surveyor Continuing Education',
  'Dental Hygienist Continuing Education',
  'Respiratory Therapist',
  'Medical Laboratory Technician',
  'Substance Abuse Counselor (CADC)',
  'Pesticide Applicator Certification',
];

const gapPrograms = [
  {
    rank: 1,
    name: 'Barber',
    hours: 2000,
    regulatoryBody: 'Iowa Board of Barbering',
    statute: 'Iowa Code Chapter 158; Iowa Admin. Code 645-61',
    requirement: '2,000 hours of approved barber school training',
    demandLevel: 'MEDIUM' as const,
    regionalDemand: '~1,500 licensed barbers statewide; Waterloo region ~30-40',
    tuitionPerStudent: 14_546,
    tuitionRange: '$14,480–$14,980',
    annualCohortSize: 30,
    cohortsPerYear: 2,
    estimatedAnnualRevenue: 872_760,
    programLength: '12–18 months full-time',
    cipCode: '12.0402 (Barbering/Barber)',
    implementationComplexity: 'High',
    timeToRevenue: '18–24 months',
    keyInsight: 'Highest single revenue opportunity. Requires specialized facility including hydraulic barber chairs, sterilization equipment, and dedicated clinic space. Kirkwood Community College operates the nearest competing program.',
  },
  {
    rank: 2,
    name: 'Cosmetologist',
    hours: 2100,
    regulatoryBody: 'Iowa Board of Cosmetology Arts and Sciences',
    statute: 'Iowa Code Chapter 157; Iowa Admin. Code 645-60',
    requirement: '2,100 hours of approved cosmetology school training',
    demandLevel: 'HIGH' as const,
    regionalDemand: '~8,000 licensed cosmetologists statewide; Waterloo region ~180-220',
    tuitionPerStudent: 4_795,
    tuitionRange: '$4,150–$9,172',
    annualCohortSize: 60,
    cohortsPerYear: 3,
    estimatedAnnualRevenue: 863_100,
    programLength: '12–18 months full-time',
    cipCode: '12.0401 (Cosmetology/Cosmetologist, General)',
    implementationComplexity: 'High',
    timeToRevenue: '18–24 months',
    keyInsight: 'Shares facility requirements with barbering and esthetics programs, creating economies of scope. Supports federal financial aid eligibility. Consistent enrollment across economic cycles.',
  },
  {
    rank: 3,
    name: 'Certified Food Protection Manager',
    hours: 8,
    regulatoryBody: 'Iowa Dept. of Inspections and Appeals, Food and Consumer Safety Bureau',
    statute: 'Iowa Code 137F.2; Iowa Admin. Code 481-31.4',
    requirement: 'Pass ANSI-accredited food safety manager certification exam (ServSafe, Prometric, etc.); at least one certified manager required per food establishment',
    demandLevel: 'HIGH' as const,
    regionalDemand: '~8,000 food establishments statewide; Waterloo region ~200-250',
    tuitionPerStudent: 4_750,
    tuitionRange: '$3,500–$6,000',
    annualCohortSize: 60,
    cohortsPerYear: 3,
    estimatedAnnualRevenue: 855_000,
    programLength: '1–2 days',
    cipCode: '—',
    implementationComplexity: 'Low',
    timeToRevenue: '3–6 months',
    keyInsight: 'Quick-win deployment. Minimal infrastructure — standard classroom and ANSI-accredited exam partnership. Certifications expire every 5 years, creating recurring demand. Strong employer-sponsored enrollment potential.',
  },
  {
    rank: 4,
    name: 'Esthetician',
    hours: 600,
    regulatoryBody: 'Iowa Board of Cosmetology Arts and Sciences',
    statute: 'Iowa Code Chapter 157; Iowa Admin. Code 645-60',
    requirement: '600 hours of approved esthetics training',
    demandLevel: 'MEDIUM' as const,
    regionalDemand: '~1,800 licensed estheticians statewide; Waterloo region ~35-50',
    tuitionPerStudent: 12_000,
    tuitionRange: '$7,395–$14,525',
    annualCohortSize: 30,
    cohortsPerYear: 2,
    estimatedAnnualRevenue: 720_000,
    programLength: '4–6 months',
    cipCode: '—',
    implementationComplexity: 'Medium',
    timeToRevenue: '12–18 months',
    keyInsight: 'Growth sector driven by medical spa expansion and wellness industry demand. Complements cosmetology and nail technology — shared facility space. Accessible entry point with lower hour requirements.',
  },
  {
    rank: 5,
    name: 'Mandatory Reporter Training (Education & Child Care Staff)',
    hours: 2,
    regulatoryBody: 'Iowa Dept. of Education & Iowa Dept. of Health and Human Services',
    statute: 'Iowa Code 232.69; Iowa Admin. Code 441-109.7',
    requirement: '2 hours initial child abuse mandatory reporter training for all school employees and child care workers age 18+; 1-hour refresher every 3 years',
    demandLevel: 'HIGH' as const,
    regionalDemand: '~100,000+ educators and child care workers statewide; Waterloo region ~2,500-3,000',
    tuitionPerStudent: 1_575,
    tuitionRange: '$1,575',
    annualCohortSize: 60,
    cohortsPerYear: 3,
    estimatedAnnualRevenue: 283_500,
    programLength: '2 hours',
    cipCode: '—',
    implementationComplexity: 'Low',
    timeToRevenue: '2–4 months',
    keyInsight: 'Highest volume recurring demand. Online or in-person delivery. Strong institutional partnership potential with school districts and child care centers. 85%+ profit margins after initial development.',
  },
  {
    rank: 6,
    name: 'Nail Technician',
    hours: 325,
    regulatoryBody: 'Iowa Board of Cosmetology Arts and Sciences',
    statute: 'Iowa Code Chapter 157; Iowa Admin. Code 645-60',
    requirement: '325 hours of approved nail technology training',
    demandLevel: 'MEDIUM' as const,
    regionalDemand: '~2,000 licensed nail technicians statewide; Waterloo region ~40-60',
    tuitionPerStudent: 3_000,
    tuitionRange: '$1,700–$4,600',
    annualCohortSize: 30,
    cohortsPerYear: 2,
    estimatedAnnualRevenue: 180_000,
    programLength: '8–12 weeks',
    cipCode: '—',
    implementationComplexity: 'Medium',
    timeToRevenue: '12–18 months',
    keyInsight: 'Lowest hour requirement in cosmetology suite. Serves immigrant entrepreneurs disproportionately — accessible licensure pathway for non-native English speakers. Complements cosmetology and esthetics.',
  },
  {
    rank: 7,
    name: 'Real Estate Salesperson',
    hours: 45,
    regulatoryBody: 'Iowa Professional Licensing Bureau',
    statute: 'Iowa Code Chapter 543B; Iowa Admin. Code 193E',
    requirement: '45 hours of approved pre-license education within 24 months prior to examination',
    demandLevel: 'MEDIUM' as const,
    regionalDemand: '~8,000 active salespersons statewide; Waterloo region ~150-200',
    tuitionPerStudent: 500,
    tuitionRange: '$500',
    annualCohortSize: 30,
    cohortsPerYear: 2,
    estimatedAnnualRevenue: 30_000,
    programLength: '2–4 weeks',
    cipCode: '52.1501 (Real Estate)',
    implementationComplexity: 'Low',
    timeToRevenue: '3–6 months',
    keyInsight: 'Low-overhead professional development offering. Hybrid delivery (online + in-person exam prep). Partner with local brokerages for employer-sponsored enrollment.',
  },
  {
    rank: 8,
    name: 'Real Estate Broker',
    hours: 60,
    regulatoryBody: 'Iowa Professional Licensing Bureau',
    statute: 'Iowa Code Chapter 543B; Iowa Admin. Code 193E',
    requirement: '60 hours of approved broker pre-license education within 24 months prior to examination',
    demandLevel: 'MEDIUM' as const,
    regionalDemand: '~3,500 active brokers statewide; Waterloo region ~70-90',
    tuitionPerStudent: 500,
    tuitionRange: '$500',
    annualCohortSize: 30,
    cohortsPerYear: 2,
    estimatedAnnualRevenue: 30_000,
    programLength: '3–6 weeks',
    cipCode: '52.1501 (Real Estate)',
    implementationComplexity: 'Low',
    timeToRevenue: '3–6 months',
    keyInsight: 'Pairs with Salesperson program. 36-hour CE requirement every 3 years creates recurring revenue. Partner with Coldwell Banker, RE/MAX, Keller Williams for employer-sponsored cohorts.',
  },
];

const complianceCategories = [
  { category: 'Healthcare & Emergency Services', mandated: 10, offered: 10, gaps: 0, color: 'teal' },
  { category: 'Skilled Trades & Transportation', mandated: 3, offered: 2, gaps: 1, color: 'blue' },
  { category: 'Personal Care & Cosmetology', mandated: 4, offered: 0, gaps: 4, color: 'rose' },
  { category: 'Food Safety & Public Health', mandated: 1, offered: 0, gaps: 1, color: 'rose' },
  { category: 'Education & Child Welfare', mandated: 1, offered: 0, gaps: 1, color: 'rose' },
  { category: 'Real Estate & Professional Licensing', mandated: 2, offered: 0, gaps: 2, color: 'amber' },
  { category: 'Agriculture & Environmental', mandated: 3, offered: 3, gaps: 0, color: 'teal' },
  { category: 'Engineering & Surveying', mandated: 3, offered: 3, gaps: 0, color: 'teal' },
];

const strategicRecommendations = [
  {
    timeline: 'Quick Wins (0–6 Months)',
    color: 'teal',
    icon: '⚡',
    actions: [
      {
        title: 'Launch Certified Food Protection Manager training — partner with ServSafe or Prometric',
        effort: 'Low',
        impact: 'High',
        revenue: '$855K/yr',
      },
      {
        title: 'Deploy Mandatory Reporter Training as online compliance solution for regional school districts',
        effort: 'Low',
        impact: 'High',
        revenue: '$284K/yr',
      },
      {
        title: 'Develop Real Estate Salesperson & Broker pre-license programs — classroom + hybrid delivery',
        effort: 'Low',
        impact: 'Medium',
        revenue: '$60K/yr',
      },
    ],
  },
  {
    timeline: 'Strategic Builds (6–18 Months)',
    color: 'blue',
    icon: '🔨',
    actions: [
      {
        title: 'Conduct feasibility study for Cosmetology & Barbering Center of Excellence',
        effort: 'Medium',
        impact: 'High',
        revenue: 'Enables $2.6M cluster',
      },
      {
        title: 'Launch Nail Technician and Esthetician programs in shared cosmetology facility',
        effort: 'Medium',
        impact: 'High',
        revenue: '$900K/yr combined',
      },
      {
        title: 'Establish Regulatory Compliance Advisory Board with Iowa licensing agency representatives',
        effort: 'Low',
        impact: 'Medium',
        revenue: 'Strategic positioning',
      },
    ],
  },
  {
    timeline: 'Long-Term Investments (18+ Months)',
    color: 'purple',
    icon: '🔭',
    actions: [
      {
        title: 'Open Cosmetology & Barbering Center — 8,000-10,000 sq ft dedicated facility with student clinic',
        effort: 'High',
        impact: 'High',
        revenue: '$2.64M/yr at steady state',
      },
      {
        title: 'Pursue Perkins V funding and Iowa Skilled Workforce Shortage Tuition Grant eligibility',
        effort: 'Medium',
        impact: 'High',
        revenue: 'Offsets $350-450K capital',
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
  return (
    <div className="overflow-x-hidden bg-theme-page">

      {/* ═══════════ LIVE DATA BANNER ═══════════ */}
      <div className="w-full bg-teal-500/10 border-b border-teal-500/20 py-2.5 px-4 text-center">
        <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
          ✅ Generated by live pipeline — real regulatory data, real catalog scan, real market-rate pricing. February 19, 2026.
        </p>
      </div>

      {/* ═══════════ A. HERO ═══════════ */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-32 lg:pt-36 pb-16">
        <Stars count={120} />
        <Aurora className="opacity-60" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">Compliance Gap Analysis · Live Report</span>
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
                27 Mandated Programs
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                19 Currently Offered
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                8 Compliance Gaps
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                $3.8M Revenue Opportunity
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
                  70%
                </div>
                <p className="text-sm text-theme-muted">19 of 27 mandated programs</p>
                <div className="mt-4">
                  <HealthBar score={70} color="amber" />
                </div>
                <p className="mt-5 text-xs text-theme-tertiary leading-relaxed">
                  Hawkeye offers 19 of 27 Iowa state-mandated training programs. 8 gaps represent both regulatory exposure and $3.8M in unrealized annual revenue.
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
                Hawkeye Community College currently offers 19 of the 27 state-mandated training programs required under Iowa law, representing a <strong>70% compliance rate</strong> with statutory workforce development obligations. This analysis identifies <strong>8 high-priority compliance gaps</strong> that represent both regulatory exposure and significant unrealized revenue potential.
              </p>
              <p>
                The institution is not currently positioned to serve mandatory training markets in <strong>food safety management, cosmetology and barbering, real estate licensing, and mandatory reporter education</strong> — sectors with established demand and regulatory enforcement mechanisms. Three programs alone — Barber ($872,760), Cosmetologist ($863,100), and Certified Food Protection Manager ($855,000) — account for $2.59 million of the $3.83 million total opportunity.
              </p>
              <p>
                These programs are governed by Iowa Code Chapters 137F, 157, 158, 232, and 543B, with active enforcement by the Iowa Department of Inspections and Appeals, Iowa Board of Cosmetology Arts and Sciences, Iowa Board of Barbering, and Iowa Professional Licensing Bureau. Regional demand analysis indicates <strong>2,500–3,500 potential students annually</strong> in the Waterloo service area across these eight program categories.
              </p>
              <p>
                Hawkeye maintains <strong>strong compliance in healthcare-related mandated training</strong>, offering all required programs for CNAs, EMTs, Paramedics, LPNs, RNs, Pharmacy Technicians, and therapy professionals. The CDL Entry Level Driver Training, Child Care Provider Professional Development, and Licensed Massage Therapist programs are also in compliance. The compliance gaps cluster in three domains: personal care/cosmetology services (4 gaps), food safety (1 gap), mandatory reporter obligations (1 gap), and real estate licensing (2 gaps).
              </p>
            </div>
          </AnimateOnScroll>

          {/* Key Findings Strip */}
          <AnimateOnScroll variant="fade-up" delay={160}>
            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl p-5 bg-teal-500/5 border border-teal-500/15">
                <CheckCircle2 className="w-5 h-5 text-teal-500 mb-3" />
                <p className="text-sm font-bold text-theme-primary mb-1">Full Compliance</p>
                <p className="text-xs text-theme-secondary leading-relaxed">Healthcare, emergency services, agriculture, and engineering programs — all mandated programs offered.</p>
              </div>
              <div className="rounded-xl p-5 bg-rose-500/5 border border-rose-500/15">
                <XCircle className="w-5 h-5 text-rose-500 mb-3" />
                <p className="text-sm font-bold text-theme-primary mb-1">Major Gap Cluster</p>
                <p className="text-xs text-theme-secondary leading-relaxed">Personal care & cosmetology: 0 of 4 mandated programs offered. $2.64M combined annual revenue left on the table.</p>
              </div>
              <div className="rounded-xl p-5 bg-amber-500/5 border border-amber-500/15">
                <AlertTriangle className="w-5 h-5 text-amber-500 mb-3" />
                <p className="text-sm font-bold text-theme-primary mb-1">Quick Wins Available</p>
                <p className="text-xs text-theme-secondary leading-relaxed">Food Protection Manager, Mandatory Reporter, and Real Estate programs can launch in 2–6 months with minimal infrastructure.</p>
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
                19 Mandated Programs Currently Offered
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
              <span className="overline">Section E · Compliance Gaps</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                8 State-Mandated Programs Not Offered
              </h2>
              <p className="mt-3 text-theme-secondary max-w-xl mx-auto text-sm">
                Each gap represents an Iowa-mandated training program with confirmed statutory citations, regulatory enforcement, and market-rate revenue estimates.
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
                        Compliance Gap · {gap.hours.toLocaleString()} Hours Required
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

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="rounded-lg p-3 bg-theme-surface/50 border border-theme-subtle text-center">
                    <DollarSign className="w-4 h-4 text-teal-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-0.5">Annual Revenue</p>
                    <p className="text-lg font-bold font-mono text-teal-600 dark:text-teal-400">
                      ${gap.estimatedAnnualRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg p-3 bg-theme-surface/50 border border-theme-subtle text-center">
                    <Building2 className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-0.5">Tuition</p>
                    <p className="text-sm font-bold font-mono text-theme-primary">${gap.tuitionPerStudent.toLocaleString()}</p>
                    <p className="text-[10px] text-theme-muted">{gap.tuitionRange}</p>
                  </div>
                  <div className="rounded-lg p-3 bg-theme-surface/50 border border-theme-subtle text-center">
                    <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-0.5">Program Length</p>
                    <p className="text-sm font-bold text-theme-primary">{gap.programLength}</p>
                  </div>
                  <div className="rounded-lg p-3 bg-theme-surface/50 border border-theme-subtle text-center">
                    <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-0.5">Time to Revenue</p>
                    <p className="text-sm font-bold text-theme-primary">{gap.timeToRevenue}</p>
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
                        {gap.annualCohortSize} students/cohort × {gap.cohortsPerYear} cohort{gap.cohortsPerYear > 1 ? 's' : ''}/year × ${gap.tuitionPerStudent.toLocaleString()} tuition
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
                $3,834,360 Annual Revenue Opportunity
              </h2>
              <p className="mt-3 text-theme-secondary max-w-xl mx-auto text-sm">
                Conservative enrollment projections based on regional demand analysis and market-rate tuition at comparable Iowa community colleges.
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
                <p
                  className="text-4xl font-bold font-mono mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  $2,635,860
                </p>
                <p className="text-sm text-theme-muted">69% of total opportunity · High capital investment</p>
                <p className="text-xs text-theme-tertiary mt-2">Cosmetologist + Barber + Esthetician + Nail Technician</p>
              </div>
              <div className="card-cosmic rounded-2xl p-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-2">
                  Short-Cycle Programs
                </p>
                <p
                  className="text-4xl font-bold font-mono mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  $1,198,500
                </p>
                <p className="text-sm text-theme-muted">31% of total opportunity · Minimal capital</p>
                <p className="text-xs text-theme-tertiary mt-2">Food Protection + Mandatory Reporter + Real Estate (×2)</p>
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
                    <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Annual Revenue</th>
                    <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Complexity</th>
                    <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Time to Revenue</th>
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
                        ${gap.estimatedAnnualRevenue.toLocaleString()}
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
                      <td className="py-3 px-4 text-center text-[13px] text-theme-secondary">{gap.timeToRevenue}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-theme-subtle">
                    <td className="py-3 px-4 font-bold text-theme-primary">TOTAL</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[16px]" style={{
                      background: 'linear-gradient(135deg, #a855f7, #14b8a6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      $3,834,360
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
                      desc: 'Scraped hawkeyecollege.edu and searched 37 candidate pages. Fetched 12 relevant program pages and extracted 107 programs via AI analysis. Duration: 46 seconds.',
                    },
                    {
                      step: 'Agent 2: Regulatory Scanner',
                      desc: 'Executed 16 targeted web searches across Iowa regulatory databases, licensing boards, and administrative code. Fetched 6 regulatory pages. Identified 27 state-mandated programs with statute citations. Duration: 156 seconds.',
                    },
                    {
                      step: 'Agent 3: Gap Analyzer & Report Writer',
                      desc: 'Cross-referenced 27 mandated programs against 107 offered programs. Found 8 gaps. Conducted 24 market-rate tuition searches across Iowa community colleges for pricing. Wrote professional report. Duration: 177 seconds.',
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
                  Data Sources
                </p>
                <ul className="space-y-3">
                  {[
                    { source: 'Iowa Code', desc: 'Chapters 105, 137F, 157, 158, 232, 543B — mandatory training and licensing statutes' },
                    { source: 'Iowa Admin. Code', desc: 'Rules 441-109.7, 481-31.4, 645-60, 645-61, 193E — regulatory implementation details' },
                    { source: 'Hawkeye Website', desc: 'hawkeyecollege.edu — program catalog, continuing education, workforce training pages' },
                    { source: 'Licensing Boards', desc: 'Iowa Board of Cosmetology Arts and Sciences, Board of Barbering, Professional Licensing Bureau, DIAL' },
                    { source: 'Market Pricing', desc: 'Tuition data from Iowa community colleges, private training providers, and certification bodies' },
                    { source: 'Demand Data', desc: 'Iowa Professional Licensing Bureau licensure counts, regional population-proportional estimates' },
                  ].map((item) => (
                    <li key={item.source} className="flex items-start gap-3">
                      <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 pt-0.5 flex-shrink-0 w-24">{item.source}</span>
                      <span className="text-[12px] text-theme-secondary leading-snug">{item.desc}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 pt-4 border-t border-theme-subtle">
                  <p className="text-[11px] text-theme-muted leading-relaxed">
                    <strong>Pipeline runtime:</strong> 380 seconds total · <strong>Model:</strong> Claude Sonnet 4.5 · <strong>Searches:</strong> 40+ web queries · <strong>Pages analyzed:</strong> 18 fetched pages
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
              Know exactly which state-mandated programs you&apos;re missing — with real statute citations, market-rate pricing, and revenue projections.
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
                $295
              </div>
              <span className="text-theme-muted text-sm">per institution · delivered within 48 hours</span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="btn-cosmic btn-cosmic-primary text-sm py-3 px-8">
                  Order a Compliance Gap Analysis
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
              Includes: catalog scan, regulatory mandate identification, gap analysis, market-rate tuition research, revenue projections, and implementation roadmap.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

    </div>
  );
}
