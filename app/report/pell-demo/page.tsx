import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { PrintButton } from '@/components/ui/PrintButton';

export const metadata: Metadata = {
  title: 'Pell Readiness Check — Pima Community College | Wavelength Sample Report',
  description:
    'Live Pell Readiness Check report for Pima Community College. 68 programs analyzed — 23 Workforce Pell candidates, 39 already eligible, 12 gap opportunities identified.',
  alternates: { canonical: 'https://withwavelength.com/report/pell-demo' },
  openGraph: {
    title: 'Pell Readiness Check — Pima Community College',
    description:
      'Full Workforce Pell eligibility audit for 68 programs at Pima Community College, Tucson, AZ. Real data from BLS, SerpAPI, and AI analysis.',
    url: 'https://withwavelength.com/report/pell-demo',
    type: 'article',
  },
};

// ─── Real Pipeline Data (Pima Community College, February 2026) ───────────────

type CriteriaStatus = 'pass' | 'warn' | 'fail';
type ProgramStatus = 'eligible' | 'adjustment' | 'ineligible';

interface Program {
  id: number;
  name: string;
  soc: string;
  occupation: string;
  clockHours: number;
  credentialType: string;
  medianWage: number;
  score: number;
  status: ProgramStatus;
  criteria: {
    clockHours: CriteriaStatus;
    credential: CriteriaStatus;
    socAlignment: CriteriaStatus;
    stateApproval: CriteriaStatus;
    wageThreshold: CriteriaStatus;
  };
  actions: string[];
  note: string;
}

// 8 representative programs from the real pipeline output (23 Workforce Pell candidates)
const programs: Program[] = [
  {
    id: 1,
    name: 'Emergency Medical Technology',
    soc: '29-2042',
    occupation: 'Emergency Medical Technicians',
    clockHours: 405,
    credentialType: 'Certificate',
    medianWage: 41340,
    score: 91,
    status: 'eligible',
    criteria: {
      clockHours: 'pass',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'pass',
      wageThreshold: 'pass',
    },
    actions: [],
    note: 'Strong candidate at 405 clock hours. EMT certification is nationally recognized and stackable toward Paramedic AAS. Median wage of $41,340 (BLS May 2024) clears the federal threshold. Arizona DHS approves this credential type.',
  },
  {
    id: 2,
    name: 'Automated Industrial Technology Level I',
    soc: '49-9041',
    occupation: 'Industrial Machinery Mechanics',
    clockHours: 405,
    credentialType: 'Certificate',
    medianWage: 63510,
    score: 94,
    status: 'eligible',
    criteria: {
      clockHours: 'pass',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'pass',
      wageThreshold: 'pass',
    },
    actions: [],
    note: 'High-value program with strong wage outcomes ($63,510 median). Industrial machinery mechanics are in high demand across Tucson\'s manufacturing and defense sectors. Stackable to Level II and AAS. Priority program for Pell conversion.',
  },
  {
    id: 3,
    name: 'Truck Driving',
    soc: '53-3032',
    occupation: 'Heavy and Tractor-Trailer Truck Drivers',
    clockHours: 270,
    credentialType: 'Certificate',
    medianWage: 57440,
    score: 88,
    status: 'eligible',
    criteria: {
      clockHours: 'pass',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'pass',
      wageThreshold: 'pass',
    },
    actions: [],
    note: 'At 270 hours and $57,440 median wage, this program clears all thresholds comfortably. CDL is a federally recognized credential with FMCSA ELDT compliance. High regional demand along I-10/I-19 corridor logistics routes.',
  },
  {
    id: 4,
    name: 'Pharmacy Technology',
    soc: '29-2052',
    occupation: 'Pharmacy Technicians',
    clockHours: 405,
    credentialType: 'Certificate',
    medianWage: 43460,
    score: 86,
    status: 'eligible',
    criteria: {
      clockHours: 'pass',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'pass',
      wageThreshold: 'pass',
    },
    actions: [],
    note: 'Meets all criteria. PTCB certification alignment supports credential recognition. Median wage of $43,460 (BLS May 2024) clears the threshold. Stackable toward health sciences pathways.',
  },
  {
    id: 5,
    name: 'Google IT Support Professional Certificate',
    soc: '15-1232',
    occupation: 'Computer User Support Specialists',
    clockHours: 270,
    credentialType: 'Certificate',
    medianWage: 47580,
    score: 92,
    status: 'eligible',
    criteria: {
      clockHours: 'pass',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'pass',
      wageThreshold: 'pass',
    },
    actions: [],
    note: 'High-scoring program with excellent wage outcomes ($47,580). Industry-recognized Google credential with strong employer demand. 270 hours is well within the 150–599 Workforce Pell window. IT sector growing rapidly in Tucson.',
  },
  {
    id: 6,
    name: 'Medical Assistant',
    soc: '31-9092',
    occupation: 'Medical Assistants',
    clockHours: 405,
    credentialType: 'Certificate',
    medianWage: 44200,
    score: 84,
    status: 'eligible',
    criteria: {
      clockHours: 'pass',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'pass',
      wageThreshold: 'pass',
    },
    actions: [],
    note: 'At 405 hours, this program fits cleanly within the Workforce Pell window. CMA/RMA certification is nationally portable. Median wage of $44,200 meets the threshold. Strong healthcare labor market demand in Pima County.',
  },
  {
    id: 7,
    name: 'Nursing Assistant',
    soc: '31-1131',
    occupation: 'Nursing Assistants',
    clockHours: 270,
    credentialType: 'Certificate',
    medianWage: 39530,
    score: 79,
    status: 'adjustment',
    criteria: {
      clockHours: 'pass',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'pass',
      wageThreshold: 'warn',
    },
    actions: [
      'Verify Arizona Board of Nursing approval documentation is current and includes Workforce Pell eligibility language.',
      'Consider expanding clinical rotation hours to strengthen placement outcomes and boost wage trajectory data.',
      'Track and report graduate wage outcomes at 6 and 12 months post-completion to ensure ongoing wage threshold compliance.',
    ],
    note: 'Clock hours (270) and credential type are fully compliant. Wage threshold compliance is marginal at $36,260 — above the $35,110 floor but with limited buffer. Recommend strengthening outcome tracking to demonstrate sustained compliance.',
  },
  {
    id: 8,
    name: 'Childhood Development Associate',
    soc: '39-9011',
    occupation: 'Childcare Workers',
    clockHours: 405,
    credentialType: 'Certificate',
    medianWage: 32050,
    score: 42,
    status: 'ineligible',
    criteria: {
      clockHours: 'pass',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'pass',
      wageThreshold: 'fail',
    },
    actions: [
      'Median wage of $28,000 falls well below the $35,110 federal threshold — this is a structural barrier, not an administrative fix.',
      'Explore restructuring as a Lead Teacher or Center Director pathway with higher SOC code alignment (25-2011, median $31,250).',
      'Consider bundling with Early Childhood Studies credits that stack toward the AAS, which is already Pell-eligible.',
      'Monitor legislative updates — childcare workforce wage supplements may affect future threshold calculations.',
    ],
    note: 'Clock hours and credential structure meet all requirements, but the median wage for childcare workers ($28,000) is $7,110 below the federal minimum. This is a sector-wide wage issue, not a program design problem. The program may become eligible if paired with higher-wage occupation pathways or if federal wage threshold adjustments are made for essential-worker occupations.',
  },
];

// ─── Gap Opportunities (from real pipeline gap analysis) ──────────────────────

interface GapOpportunity {
  name: string;
  soc: string;
  medianWage: number;
  suggestedHours: string;
  priority: string;
  demand: string;
  pellEligible: boolean;
  opportunityScore: number;
}

const gapOpportunities: GapOpportunity[] = [
  {
    name: 'Phlebotomy Technician',
    soc: '31-9097',
    medianWage: 37540,
    suggestedHours: '180 hours (9 weeks)',
    priority: 'high',
    demand: 'Healthcare sector dominates Tucson hiring; 27,123 projected jobs statewide through 2026. Existing Medical Lab Technician program provides faculty expertise and clinical partnerships.',
    pellEligible: true,
    opportunityScore: 9.2,
  },
  {
    name: 'Cybersecurity Support Technician',
    soc: '15-1212',
    medianWage: 92160,
    suggestedHours: '360 hours (12 weeks)',
    priority: 'high',
    demand: 'Fastest-growing IT sector; federal/defense presence in Arizona. Davis-Monthan AFB, Raytheon partnerships. +33% projected growth (2022–2032).',
    pellEligible: true,
    opportunityScore: 9.1,
  },
  {
    name: 'Sterile Processing Technician',
    soc: '31-9093',
    medianWage: 38910,
    suggestedHours: '240 hours (12 weeks)',
    priority: 'high',
    demand: 'Hospital and surgical center growth; mandated credential with guaranteed employer demand. Limited competition in region.',
    pellEligible: true,
    opportunityScore: 9.0,
  },
  {
    name: 'Electrician Helper/Apprentice',
    soc: '47-2111',
    medianWage: 48820,
    suggestedHours: '300 hours (12 weeks)',
    priority: 'high',
    demand: 'Construction boom in Pima County; residential and commercial electrical demand outpacing labor supply.',
    pellEligible: true,
    opportunityScore: 8.8,
  },
  {
    name: 'Plumbing Helper/Apprentice',
    soc: '47-2152',
    medianWage: 48860,
    suggestedHours: '300 hours (12 weeks)',
    priority: 'high',
    demand: 'Aging infrastructure replacement driving sustained demand; limited existing training pipeline.',
    pellEligible: true,
    opportunityScore: 8.7,
  },
  {
    name: 'Data Analytics Support Specialist',
    soc: '15-2051',
    medianWage: 82630,
    suggestedHours: '360 hours (12 weeks)',
    priority: 'high',
    demand: 'Healthcare, government, and tech sectors seeking data-literate workforce; 15% projected growth.',
    pellEligible: true,
    opportunityScore: 8.6,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return 'text-teal-600 dark:text-teal-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

function criteriaClasses(status: CriteriaStatus) {
  if (status === 'pass')
    return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20';
  if (status === 'warn')
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
  return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
}

function criteriaIcon(status: CriteriaStatus) {
  if (status === 'pass') return 'PASS';
  if (status === 'warn') return 'WARN';
  return 'FAIL';
}

function statusLabel(status: ProgramStatus) {
  if (status === 'eligible') return { text: 'Fully Eligible', cls: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' };
  if (status === 'adjustment') return { text: 'Needs Adjustment', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' };
  return { text: 'Not Eligible', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' };
}

function statusDot(status: ProgramStatus) {
  if (status === 'eligible') return 'bg-teal-500';
  if (status === 'adjustment') return 'bg-amber-500';
  return 'bg-rose-500';
}

function actionDotColor(status: ProgramStatus) {
  if (status === 'ineligible') return 'bg-rose-500';
  return 'bg-amber-500';
}

function priorityColor(priority: string) {
  if (priority === 'high') return 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20';
  if (priority === 'medium') return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-theme-muted bg-theme-surface border-theme-subtle';
}

/** Pure-CSS clock hour bar: 0–700 range, green zone 150–599 */
function ClockHourBar({ hours }: { hours: number }) {
  const TOTAL = 700;
  const MIN = 150;
  const MAX = 599;

  const greenStart = (MIN / TOTAL) * 100;
  const greenWidth = ((MAX - MIN) / TOTAL) * 100;
  const markerPos = Math.min((hours / TOTAL) * 100, 100);

  const markerColor =
    hours >= MIN && hours <= MAX ? '#14b8a6' : hours < MIN ? '#f43f5e' : '#f43f5e';

  return (
    <div className="mt-3 mb-1">
      <div className="flex items-center justify-between text-[10px] text-theme-muted mb-1 font-mono">
        <span>0</span>
        <span>{hours} hrs</span>
        <span>700</span>
      </div>
      <div className="relative h-2.5 rounded-full bg-theme-surface overflow-visible" style={{ background: 'rgba(148,163,184,0.15)' }}>
        {/* Green zone 150–599 */}
        <div
          className="absolute top-0 h-full rounded-full opacity-30"
          style={{
            left: `${greenStart}%`,
            width: `${greenWidth}%`,
            background: '#14b8a6',
          }}
        />
        {/* Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-theme-card shadow-sm"
          style={{
            left: `calc(${markerPos}% - 6px)`,
            background: markerColor,
            borderColor: 'var(--bg-card, #0a0a1a)',
            zIndex: 2,
          }}
        />
      </div>
      {/* Boundary labels */}
      <div
        className="relative mt-1 text-[10px] font-mono text-theme-muted"
        style={{ height: '14px' }}
      >
        <span
          className="absolute"
          style={{ left: `${greenStart}%`, transform: 'translateX(-50%)' }}
        >
          150
        </span>
        <span
          className="absolute"
          style={{ left: `${(MAX / TOTAL) * 100}%`, transform: 'translateX(-50%)' }}
        >
          599
        </span>
      </div>
    </div>
  );
}

/** Single program card */
function ProgramCard({ program }: { program: Program }) {
  const { text: statusText, cls: statusCls } = statusLabel(program.status);
  const criteria = [
    { key: 'clockHours', label: 'Clock Hours', val: program.criteria.clockHours },
    { key: 'credential', label: 'Credential Type', val: program.criteria.credential },
    { key: 'socAlignment', label: 'SOC Alignment', val: program.criteria.socAlignment },
    { key: 'stateApproval', label: 'State Approval', val: program.criteria.stateApproval },
    { key: 'wageThreshold', label: 'Wage Threshold', val: program.criteria.wageThreshold },
  ];

  const wageAbove = program.medianWage >= 35110;

  return (
    <div className="card-cosmic rounded-2xl p-6 mb-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-lg text-theme-primary leading-snug">
            {program.name}
          </h3>
          <p className="text-sm text-theme-muted mt-0.5">
            {program.occupation} · SOC {program.soc}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-4xl font-bold font-mono ${scoreColor(program.score)}`}>
            {program.score}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusCls}`}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Criteria pills */}
      <div className="flex flex-wrap gap-2 mt-4">
        {criteria.map((c) => (
          <span
            key={c.key}
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${criteriaClasses(c.val)}`}
          >
            <span className="text-[10px]">{criteriaIcon(c.val)}</span>
            {c.label}
          </span>
        ))}
      </div>

      {/* Clock hour bar + wage */}
      <div className="mt-5 grid sm:grid-cols-2 gap-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-1">
            Clock Hours
          </p>
          <ClockHourBar hours={program.clockHours} />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-1">
            Median Wage (BLS 2024)
          </p>
          <p className="text-2xl font-mono font-bold text-theme-primary mt-2">
            ${program.medianWage.toLocaleString()}
          </p>
          <p className={`text-[11px] mt-0.5 font-medium ${wageAbove ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {wageAbove ? 'Above' : 'Below'} federal threshold ($35,110)
          </p>
        </div>
      </div>

      {/* Note */}
      <p className="mt-5 text-sm text-theme-secondary leading-relaxed">
        {program.note}
      </p>

      {/* Required actions */}
      {program.actions.length > 0 && (
        <div className="mt-5 pt-5 border-t border-theme-subtle">
          <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-3">
            Required Actions
          </p>
          <ul className="space-y-2">
            {program.actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-theme-secondary">
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${actionDotColor(program.status)}`}
                />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PellDemoPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">

      {/* ═══════════════════════════════════════════════════════
          A. HERO
      ════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[50vh] flex items-center justify-center pt-36 lg:pt-40 pb-16">
        <Stars count={120} />
        <Aurora className="opacity-60" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">Pell Readiness Check · Live Report</span>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="font-heading font-bold text-gradient-cosmic leading-[1.05] mx-auto max-w-3xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4rem)' }}
            >
              Pima Community College
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={180} duration={800}>
            <p className="mt-4 text-lg text-theme-secondary">
              Tucson, Arizona · 68 programs analyzed · 23 Workforce Pell candidates · February 2026
            </p>
          </AnimateOnScroll>

          {/* Stat pills */}
          <AnimateOnScroll variant="fade-up" delay={260} duration={800}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                39 Already Pell-Eligible
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                23 Workforce Pell Candidates
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                12 Gap Opportunities
              </span>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={340} duration={800}>
            <p className="mt-6 text-xs text-theme-muted max-w-xl mx-auto leading-relaxed">
              Generated by Wavelength&apos;s AI pipeline — real BLS wage data, real web research, real program analysis. Pipeline runtime: 14 minutes.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={380} duration={800}>
            <div className="mt-5 flex justify-center">
              <PrintButton label="Download PDF" />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          B. EXECUTIVE SUMMARY
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-[860px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Executive Summary</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              23 programs could unlock new Pell funding on July 1, 2026.
            </h2>
          </AnimateOnScroll>

          {/* Stat cards */}
          <StaggerChildren stagger={80} variant="fade-up" className="grid sm:grid-cols-3 gap-4 mt-10">
            <div className="card-cosmic rounded-2xl p-6 text-center">
              <p className="text-5xl font-mono font-bold text-gradient-cosmic">68</p>
              <p className="mt-2 text-sm text-theme-secondary leading-snug">
                Total programs identified across certificates, AAS degrees, and workforce training
              </p>
            </div>
            <div className="card-cosmic rounded-2xl p-6 text-center">
              <p className="text-5xl font-mono font-bold text-gradient-cosmic">23</p>
              <p className="mt-2 text-sm text-theme-secondary leading-snug">
                Programs in the 150–599 hour Workforce Pell window — ready for eligibility assessment
              </p>
            </div>
            <div className="card-cosmic rounded-2xl p-6 text-center">
              <p className="text-3xl font-mono font-bold text-gradient-cosmic">$2.6M</p>
              <p className="mt-2 text-sm text-theme-secondary leading-snug">
                Estimated annual revenue potential from gap programs addressing mandated credentials
              </p>
            </div>
          </StaggerChildren>

          {/* Narrative */}
          <AnimateOnScroll variant="fade-up" delay={100}>
            <p className="mt-10 text-base text-theme-secondary leading-relaxed">
              Pima Community College&apos;s 39 existing programs already meet the 600+ clock hour threshold for traditional Pell eligibility — a strong foundation. But the real opportunity lies in the <strong className="text-theme-primary font-semibold">23 short-term certificates between 150–599 hours</strong> that could qualify under the new Workforce Pell Grant launching July 1, 2026. Programs like Emergency Medical Technology (405 hrs), Automated Industrial Technology (405 hrs), and Truck Driving (270 hrs) are strong candidates with median wages well above the federal threshold.
            </p>
            <p className="mt-4 text-base text-theme-secondary leading-relaxed">
              Our gap analysis identified <strong className="text-theme-primary font-semibold">12 high-priority program opportunities</strong> — including Phlebotomy Technician ($37,540 median, fastest path to healthcare), Cybersecurity Support ($92,160), and Data Analytics ($82,630) — where Tucson employer demand outstrips the current training supply. Additionally, <strong className="text-theme-primary font-semibold">20 Arizona-mandated credentials</strong> that Pima doesn&apos;t currently offer represent guaranteed enrollment demand.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          C. CATALOG OVERVIEW
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-12 md:py-16 border-t border-theme-subtle">
        <div className="max-w-[860px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Catalog Breakdown</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-8"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              68 programs, four categories.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={60} variant="fade-up" className="grid sm:grid-cols-2 gap-4">
            <div className="card-cosmic rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full bg-teal-500" />
                <span className="text-sm font-bold text-theme-primary">Already Pell-Eligible</span>
              </div>
              <p className="text-4xl font-mono font-bold text-teal-600 dark:text-teal-400">39</p>
              <p className="mt-2 text-sm text-theme-secondary">Programs ≥600 hours — AAS degrees, long certificates. Already qualify for traditional Pell.</p>
            </div>
            <div className="card-cosmic rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-bold text-theme-primary">Workforce Pell Candidates</span>
              </div>
              <p className="text-4xl font-mono font-bold text-blue-600 dark:text-blue-400">23</p>
              <p className="mt-2 text-sm text-theme-secondary">Programs 150–599 hours. Could qualify under the new Workforce Pell Grant effective July 2026.</p>
            </div>
            <div className="card-cosmic rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-sm font-bold text-theme-primary">Too Short</span>
              </div>
              <p className="text-4xl font-mono font-bold text-rose-600 dark:text-rose-400">4</p>
              <p className="mt-2 text-sm text-theme-secondary">Programs under 150 hours. Below the Workforce Pell floor — may need expansion to qualify.</p>
            </div>
            <div className="card-cosmic rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full bg-theme-muted" />
                <span className="text-sm font-bold text-theme-primary">Other</span>
              </div>
              <p className="text-4xl font-mono font-bold text-theme-muted">2</p>
              <p className="mt-2 text-sm text-theme-secondary">1 program exceeds typical certificate length, 1 with unclear clock hours or classification pending.</p>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          D. WORKFORCE PELL SCORECARD (8 representative programs)
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20 border-t border-theme-subtle">
        <div className="max-w-[960px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Workforce Pell Eligibility Scorecard</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              8 programs, scored and assessed.
            </h2>
            <p className="mt-3 text-base text-theme-secondary">
              Representative selection from 23 Workforce Pell candidates. Scored against federal criteria with real BLS wage data.
            </p>
          </AnimateOnScroll>

          <div className="mt-10">
            <StaggerChildren stagger={60} variant="fade-up">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          E. SUMMARY TABLE
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-12 md:py-16 border-t border-theme-subtle">
        <div className="max-w-[860px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">At a Glance</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-8"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              All scored programs, one view.
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={80}>
            <div className="card-cosmic rounded-2xl overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-theme-subtle">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted">Program</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted w-24">Clock Hrs</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted w-24">Wage</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted w-16">Score</th>
                    <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted w-40">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p, i) => {
                    const { text: sText, cls: sCls } = statusLabel(p.status);
                    const textColor = sCls.split(' ').filter((c: string) => c.startsWith('text-')).join(' ');
                    return (
                      <tr
                        key={p.id}
                        className={i < programs.length - 1 ? 'border-b border-theme-subtle' : ''}
                      >
                        <td className="px-5 py-3.5 text-sm font-medium text-theme-primary">{p.name}</td>
                        <td className="px-4 py-3.5 text-sm font-mono text-theme-secondary text-right">{p.clockHours}</td>
                        <td className="px-4 py-3.5 text-sm font-mono text-theme-secondary text-right">${p.medianWage.toLocaleString()}</td>
                        <td className={`px-4 py-3.5 text-sm font-mono font-bold text-right ${scoreColor(p.score)}`}>{p.score}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex items-center justify-end gap-1.5">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(p.status)}`} />
                            <span className={`text-[11px] font-semibold ${textColor}`}>{sText}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          F. GAP OPPORTUNITIES
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20 border-t border-theme-subtle">
        <div className="max-w-[960px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Gap Analysis</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              12 programs Tucson needs but Pima doesn&apos;t offer.
            </h2>
            <p className="mt-3 text-base text-theme-secondary">
              Top 6 of 12 gap opportunities ranked by opportunity score — combining regional demand, wage outcomes, and Pell eligibility potential.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={60} variant="fade-up" className="mt-10 grid gap-4">
            {gapOpportunities.map((gap, i) => (
              <div key={i} className="card-cosmic rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-heading font-semibold text-lg text-theme-primary leading-snug">
                        {gap.name}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${priorityColor(gap.priority)}`}>
                        {gap.priority} priority
                      </span>
                      {gap.pellEligible && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          Pell Eligible
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-theme-muted">SOC {gap.soc} · {gap.suggestedHours}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-2xl font-mono font-bold text-theme-primary">
                      ${gap.medianWage.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-theme-muted">median wage</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-theme-secondary leading-relaxed">{gap.demand}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-theme-muted">Opportunity Score</span>
                  <div className="flex-1 h-2 rounded-full bg-theme-surface" style={{ background: 'rgba(148,163,184,0.15)' }}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500"
                      style={{ width: `${(gap.opportunityScore / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-bold text-teal-600 dark:text-teal-400">{gap.opportunityScore}</span>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          G. KEY FINDINGS
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-12 md:py-16 border-t border-theme-subtle">
        <div className="max-w-[760px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Key Findings</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-8"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              What to do before July 1, 2026.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="flex flex-col gap-4">
            <div className="card-cosmic rounded-2xl p-6 flex gap-5 items-start border-teal-500/20">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
                <span className="text-teal-600 dark:text-teal-400 font-mono font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-semibold text-base text-theme-primary">
                    Assess all 23 Workforce Pell candidates
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    Immediate
                  </span>
                </div>
                <p className="mt-2 text-sm text-theme-secondary leading-relaxed">
                  Programs like EMT, Automated Industrial Tech, Truck Driving, and Pharmacy Tech have strong fundamentals.
                  Conduct full Workforce Pell readiness assessments for all 23 candidates to identify documentation gaps
                  and ensure compliance with the 8 federal eligibility criteria.
                </p>
              </div>
            </div>

            <div className="card-cosmic rounded-2xl p-6 flex gap-5 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-semibold text-base text-theme-primary">
                    Build outcome tracking infrastructure
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Q1 2026
                  </span>
                </div>
                <p className="mt-2 text-sm text-theme-secondary leading-relaxed">
                  Workforce Pell requires documented completion rates, placement rates, and earnings outcomes.
                  Establish data collection systems for all short-term certificates now — you&apos;ll need 6+ months
                  of data before the July 2026 deadline.
                </p>
              </div>
            </div>

            <div className="card-cosmic rounded-2xl p-6 flex gap-5 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-semibold text-base text-theme-primary">
                    Develop high-value gap programs
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Strategic
                  </span>
                </div>
                <p className="mt-2 text-sm text-theme-secondary leading-relaxed">
                  Phlebotomy Tech (180 hrs, fast healthcare entry), Cybersecurity ($92K median wage), and Data Analytics ($83K)
                  represent massive unmet demand in Tucson. These programs could launch as Workforce Pell-eligible
                  from day one, capturing students who currently have no financial aid pathway to these careers.
                </p>
              </div>
            </div>
          </StaggerChildren>

          <AnimateOnScroll variant="fade-up" delay={120}>
            <div className="mt-8 p-5 rounded-xl border border-teal-500/15 bg-teal-500/5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-theme-secondary leading-relaxed">
                  <strong className="text-theme-primary font-semibold">39 programs are already Pell-eligible</strong> through traditional pathways.
                  The opportunity cost is in the 23 short-term certificates and 12 gap programs — early movers
                  will capture market share while competitors wait for guidance. The time to act is{' '}
                  <strong className="text-theme-primary font-semibold">now, not spring 2026</strong>.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          H. CTA
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 border-t border-theme-subtle">
        <Stars count={60} />
        <Aurora className="opacity-60" />

        <div className="relative z-10 max-w-[700px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Get Your Institution&apos;s Report</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              See where your programs stand.
            </h2>
            <p className="mt-5 text-base text-theme-secondary leading-relaxed max-w-xl mx-auto">
              This report was generated by Wavelength&apos;s AI pipeline using real data — BLS wages, web research,
              and program analysis. Your Pell Readiness Check assesses your actual catalog against federal and
              state criteria — delivered within 48 hours.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pell">
                <button className="btn-cosmic btn-cosmic-primary text-sm py-3 px-7">
                  Get Your Free Pell Check →
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link href="/samples">
                <button className="btn-cosmic btn-cosmic-ghost text-sm py-3 px-7">
                  View All Sample Reports
                </button>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

    </div>
  );
}
