import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Pell Readiness Check — Pima Community College | Wavelength Sample Report',
  description:
    'Sample Pell Readiness Check report for Pima Community College. 5 of 8 programs are Pell-eligible today — see the full program-by-program breakdown with scores and action items.',
  alternates: { canonical: 'https://withwavelength.com/report/pell-demo' },
  openGraph: {
    title: 'Pell Readiness Check Sample Report — Pima Community College',
    description:
      'See a full Workforce Pell eligibility assessment for 8 programs at Pima Community College, Tucson, AZ.',
    url: 'https://withwavelength.com/report/pell-demo',
    type: 'article',
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

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

const programs: Program[] = [
  {
    id: 1,
    name: 'HVAC Technology Certificate',
    soc: '49-9021',
    occupation: 'Heating, A/C & Refrigeration Mechanics',
    clockHours: 480,
    credentialType: 'Certificate',
    medianWage: 53410,
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
    note: 'Strong candidate. Clock hours, credential type, and wage outcomes all meet federal and Arizona state criteria without modification.',
  },
  {
    id: 2,
    name: 'Cybersecurity Certificate',
    soc: '15-1212',
    occupation: 'Information Security Analysts',
    clockHours: 540,
    credentialType: 'Certificate',
    medianWage: 112000,
    score: 97,
    status: 'eligible',
    criteria: {
      clockHours: 'pass',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'pass',
      wageThreshold: 'pass',
    },
    actions: [],
    note: 'Highest-scoring program. Wage outcomes far exceed the federal threshold. Priority program for Pell conversion.',
  },
  {
    id: 3,
    name: 'Welding Technology Certificate',
    soc: '51-4121',
    occupation: 'Welders, Cutters, Solderers & Brazers',
    clockHours: 510,
    credentialType: 'Certificate',
    medianWage: 46590,
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
    note: 'Fully eligible. Strong regional employer demand from construction and manufacturing sectors reinforces SOC alignment.',
  },
  {
    id: 4,
    name: 'Medical Coding & Billing',
    soc: '29-2072',
    occupation: 'Medical Records Specialists',
    clockHours: 450,
    credentialType: 'Certificate',
    medianWage: 46690,
    score: 89,
    status: 'eligible',
    criteria: {
      clockHours: 'pass',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'pass',
      wageThreshold: 'pass',
    },
    actions: [],
    note: 'Fully eligible. Remote-delivery format does not affect eligibility; AHIMA alignment supports credential recognition.',
  },
  {
    id: 5,
    name: 'Phlebotomy Technician',
    soc: '31-9097',
    occupation: 'Phlebotomists',
    clockHours: 165,
    credentialType: 'Certificate',
    medianWage: 38010,
    score: 87,
    status: 'eligible',
    criteria: {
      clockHours: 'pass',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'pass',
      wageThreshold: 'pass',
    },
    actions: [],
    note: 'Clock hours (165) clear the 150-hour floor with an appropriate margin. Wage threshold met; NPA/ASCP certification alignment confirmed.',
  },
  {
    id: 6,
    name: 'Medical Assistant Certificate',
    soc: '31-9092',
    occupation: 'Medical Assistants',
    clockHours: 620,
    credentialType: 'Certificate',
    medianWage: 37190,
    score: 72,
    status: 'adjustment',
    criteria: {
      clockHours: 'fail',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'pass',
      wageThreshold: 'pass',
    },
    actions: [
      'Reduce program clock hours from 620 to 599 or fewer. Recommend targeting 570–580 hours to maintain buffer.',
      'Review which elective or lab components can be restructured as co-curricular without reducing learning outcomes.',
      'Resubmit to Arizona ACCS for updated program clock hour approval after revision.',
    ],
    note: 'Strong program — one structural adjustment required. At 620 hours, the program exceeds the 599-hour ceiling for Workforce Pell. A 21–50 hour reduction, focused on lab redundancy, would make this immediately eligible.',
  },
  {
    id: 7,
    name: 'CDL / Commercial Driver Training',
    soc: '53-3032',
    occupation: 'Heavy and Tractor-Trailer Truck Drivers',
    clockHours: 320,
    credentialType: 'Certificate',
    medianWage: 47130,
    score: 79,
    status: 'adjustment',
    criteria: {
      clockHours: 'pass',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'warn',
      wageThreshold: 'pass',
    },
    actions: [
      'Submit FMCSA Entry-Level Driver Training (ELDT) compliance documentation to Arizona ACCS to complete state approval.',
      'Confirm training provider registry (TPR) listing is current and active — required for Pell processing.',
      'No curriculum changes required; approval is a documentation gap only.',
    ],
    note: 'Program structure and wage outcomes are fully compliant. Eligibility is blocked only by a documentation gap in FMCSA ELDT state approval — a 30–60 day administrative resolution, not a structural program change.',
  },
  {
    id: 8,
    name: 'CNA (Certified Nursing Assistant)',
    soc: '31-1131',
    occupation: 'Nursing Assistants & Orderlies',
    clockHours: 140,
    credentialType: 'Certificate',
    medianWage: 35760,
    score: 41,
    status: 'ineligible',
    criteria: {
      clockHours: 'fail',
      credential: 'pass',
      socAlignment: 'pass',
      stateApproval: 'pass',
      wageThreshold: 'warn',
    },
    actions: [
      'Add a minimum of 10 clock hours to reach the 150-hour federal floor. Recommend targeting 160 hours.',
      'Consider expanding clinical rotation component to add hours — this also strengthens employer placement outcomes.',
      'Verify median wage data after any program revision; wage threshold compliance is currently marginal.',
      'Resubmit to Arizona Department of Health Services for updated program approval after clock hour revision.',
    ],
    note: 'At 140 clock hours, this program falls 10 hours short of the federal minimum. Arizona also requires Board of Nursing approval for any clock hour changes. The fix is straightforward but requires two approval steps. Wage outcomes are marginal — enhancement of clinical hours would improve both eligibility and graduate outcomes.',
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
  if (status === 'pass') return '✓';
  if (status === 'warn') return '⚠';
  return '✗';
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
            Median Wage
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
            <span className="overline">Pell Readiness Check · Sample Report</span>
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
              Tucson, Arizona · 8 programs assessed · February 2026
            </p>
          </AnimateOnScroll>

          {/* Stat pills */}
          <AnimateOnScroll variant="fade-up" delay={260} duration={800}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                5 Fully Eligible
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                2 Need Adjustment
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                1 Not Eligible
              </span>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={340} duration={800}>
            <p className="mt-6 text-xs text-theme-muted max-w-xl mx-auto leading-relaxed">
              This is a sample report. All data reflects real federal criteria and BLS wage data for illustrative purposes.
            </p>
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
              5 of 8 programs are Pell-ready today.
            </h2>
          </AnimateOnScroll>

          {/* Stat cards */}
          <StaggerChildren stagger={80} variant="fade-up" className="grid sm:grid-cols-3 gap-4 mt-10">
            <div className="card-cosmic rounded-2xl p-6 text-center">
              <p className="text-3xl font-mono font-bold text-gradient-cosmic">$1.2M–$1.8M</p>
              <p className="mt-2 text-sm text-theme-secondary leading-snug">
                Estimated new annual Pell revenue if all eligible programs activate
              </p>
            </div>
            <div className="card-cosmic rounded-2xl p-6 text-center">
              <p className="text-5xl font-mono font-bold text-gradient-cosmic">3</p>
              <p className="mt-2 text-sm text-theme-secondary leading-snug">
                Programs requiring action before July 1, 2026
              </p>
            </div>
            <div className="card-cosmic rounded-2xl p-6 text-center">
              <p className="text-3xl font-mono font-bold text-gradient-cosmic">10 hrs</p>
              <p className="mt-2 text-sm text-theme-secondary leading-snug">
                Minimum change needed for the lowest-scoring fixable program (CNA)
              </p>
            </div>
          </StaggerChildren>

          {/* Narrative */}
          <AnimateOnScroll variant="fade-up" delay={100}>
            <p className="mt-10 text-base text-theme-secondary leading-relaxed">
              Of the three programs requiring action, two are administrative fixes, not curriculum overhauls.
              The Medical Assistant Certificate needs only a 21-hour clock hour reduction to clear the 599-hour ceiling —
              a single lab-restructuring decision. CDL requires only FMCSA documentation paperwork, with no curriculum
              changes at all. Only CNA involves structural additions to the program itself. Put simply: 87.5% of this
              catalog is within reach of full Pell eligibility with focused, near-term action.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          C. PROGRAM ELIGIBILITY SCORECARD
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20 border-t border-theme-subtle">
        <div className="max-w-[960px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Program Eligibility Scorecard</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-10"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Program-by-program breakdown.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={60} variant="fade-up">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          D. SUMMARY TABLE
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-12 md:py-16 border-t border-theme-subtle">
        <div className="max-w-[860px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">At a Glance</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-8"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              All programs, one view.
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={80}>
            <div className="card-cosmic rounded-2xl overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-theme-subtle">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted">Program</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted w-24">Clock Hrs</th>
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
          E. PRIORITY ACTIONS
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-12 md:py-16 border-t border-theme-subtle">
        <div className="max-w-[760px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Priority Actions</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-8"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              What to do before July 1, 2026.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="flex flex-col gap-4">
            {/* Action 1 */}
            <div className="card-cosmic rounded-2xl p-6 flex gap-5 items-start border-teal-500/20">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
                <span className="text-teal-600 dark:text-teal-400 font-mono font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-semibold text-base text-theme-primary">
                    Submit CDL FMCSA documentation
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    Immediate
                  </span>
                </div>
                <p className="mt-2 text-sm text-theme-secondary leading-relaxed">
                  Administrative only — no curriculum changes required. Submit FMCSA Entry-Level Driver Training
                  (ELDT) compliance documentation to Arizona ACCS and verify TPR listing is active.
                  Estimated resolution: <strong className="text-theme-primary font-semibold">30–60 days.</strong>
                </p>
              </div>
            </div>

            {/* Action 2 */}
            <div className="card-cosmic rounded-2xl p-6 flex gap-5 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-semibold text-base text-theme-primary">
                    Restructure Medical Assistant clock hours
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    30–60 days
                  </span>
                </div>
                <p className="mt-2 text-sm text-theme-secondary leading-relaxed">
                  Reduce from 620 hours to the 570–580 range by restructuring elective or lab components
                  as co-curricular. Resubmit to Arizona ACCS for updated approval. Learning outcomes
                  should be preserved with targeted lab consolidation.
                </p>
              </div>
            </div>

            {/* Action 3 */}
            <div className="card-cosmic rounded-2xl p-6 flex gap-5 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-semibold text-base text-theme-primary">
                    Expand CNA clinical rotation
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    60–90 days
                  </span>
                </div>
                <p className="mt-2 text-sm text-theme-secondary leading-relaxed">
                  Add 20 clock hours (target 160 total) via expanded clinical rotation. Resubmit to
                  Arizona Department of Health Services and Board of Nursing for updated program approval.
                  Extended clinical time also strengthens graduate placement outcomes.
                </p>
              </div>
            </div>
          </StaggerChildren>

          {/* Footer note */}
          <AnimateOnScroll variant="fade-up" delay={120}>
            <div className="mt-8 p-5 rounded-xl border border-teal-500/15 bg-teal-500/5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-theme-secondary leading-relaxed">
                  <strong className="text-theme-primary font-semibold">Fully eligible programs</strong>{' '}
                  (HVAC, Cybersecurity, Welding, Medical Coding, Phlebotomy) require no action —
                  ensure they are submitted for Pell processing by your financial aid office before
                  the <strong className="text-theme-primary font-semibold">July 1, 2026</strong> effective date.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          F. CTA
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
              This sample reflects one institution&apos;s snapshot. Your Pell Readiness Check assesses your
              actual catalog against federal and state criteria — delivered within 48 hours.
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
