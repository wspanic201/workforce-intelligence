import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Program Opportunity Scan — Wake Technical Community College | Wavelength Sample Report',
  description:
    'Sample Program Opportunity Scan for Wake Technical Community College, Raleigh, NC. 8 high-potential programs ranked and scored against Research Triangle employer demand — see the full report.',
  alternates: { canonical: 'https://withwavelength.com/report/demo' },
  openGraph: {
    title: 'Program Opportunity Scan Sample Report — Wake Technical Community College',
    description:
      '8 high-potential programs ranked and scored for Wake Tech in the Research Triangle. See the full scan with demand scores, grant alignment, and employer data.',
    url: 'https://withwavelength.com/report/demo',
    type: 'article',
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

type Category = 'quick_win' | 'strategic_build' | 'blue_ocean';

interface Program {
  rank: number;
  name: string;
  score: number;
  category: Category;
  scores: { demand: number; competition: number; revenue: number; wages: number; speed: number };
  duration: string;
  medianWage: string;
  annualOpenings: string;
  opportunity: string;
  topEmployers: string[];
  grantAlignment: string[];
  whyNow: string;
}

const programs: Program[] = [
  {
    rank: 1,
    name: 'Biologics Manufacturing Quality Systems Certificate',
    score: 9.05,
    category: 'blue_ocean',
    scores: { demand: 10, competition: 9, revenue: 9, wages: 9, speed: 7 },
    duration: '16–20 weeks',
    medianWage: '$28–38/hr',
    annualOpenings: '170–195 (2-yr horizon)',
    opportunity:
      'The Research Triangle is experiencing a $10.8B life sciences boom (Novartis $2B, J&J $2B, Genentech expanding). These biologics facilities need specialized QA/QC technicians who understand FDA biologics compliance — a skill set distinct from general biomanufacturing.',
    topEmployers: ['Novartis (700 new jobs)', 'Johnson & Johnson', 'Genentech', 'Fujifilm'],
    grantAlignment: ['Accelerate NC Life Sciences Manufacturing ($25M)', 'Workforce Pell (July 2026)', 'STWD Grant'],
    whyNow:
      'First-mover advantage — Novartis flagship facility opens 2027–2028. Curriculum partnerships available now before employers build internal training programs.',
  },
  {
    rank: 2,
    name: 'Healthcare Management Certificate',
    score: 8.7,
    category: 'quick_win',
    scores: { demand: 9, competition: 8, revenue: 9, wages: 8, speed: 9 },
    duration: '12–16 weeks',
    medianWage: '$48–55/hr',
    annualOpenings: '200–300',
    opportunity:
      'Critical gap in healthcare leadership pipeline serving Duke Health (43K employees), WakeMed, and UNC Rex. Only one proprietary competitor in the region. Stackable into existing Business AAS.',
    topEmployers: ['Duke University Health System', 'WakeMed Health & Hospitals', 'UNC Rex Healthcare'],
    grantAlignment: ['Workforce Pell (July 2026)', 'STWD Grant', 'Industry-Driven Skills Training Fund ($30M)'],
    whyNow:
      'Healthcare management vacancies are immediate. Program leverages existing Business faculty — minimal startup cost.',
  },
  {
    rank: 3,
    name: 'Educational Facilities Operations Specialist',
    score: 8.55,
    category: 'blue_ocean',
    scores: { demand: 9, competition: 10, revenue: 8, wages: 7, speed: 8 },
    duration: '14–16 weeks',
    medianWage: '$22–32/hr',
    annualOpenings: '200+ (150+ WCPSS facilities)',
    opportunity:
      'Wake County Public School System (largest in NC) is offering $10K retention bonuses for hard-to-fill positions while under a hiring freeze. No NC community college offers educational-facility-specific training — HVAC, electrical, and safety systems knowledge tailored to K-12 environments.',
    topEmployers: ['Wake County Public Schools', 'Durham Public Schools', 'Chapel Hill-Carrboro Schools'],
    grantAlignment: ['Workforce Pell (July 2026)', 'STWD Grant'],
    whyNow: 'WCPSS has unfilled positions NOW. Direct pipeline partnership available immediately.',
  },
  {
    rank: 4,
    name: 'Construction Management Certificate',
    score: 8.5,
    category: 'quick_win',
    scores: { demand: 8, competition: 8, revenue: 9, wages: 8, speed: 9 },
    duration: '16 weeks',
    medianWage: '$42–50/hr',
    annualOpenings: '150–250',
    opportunity:
      'Amazon (4,770+ employees, fastest growing), Novo Nordisk $4.1B investment, and regional commercial development create immediate demand. Only one proprietary competitor. Leverages existing Architectural Technology faculty.',
    topEmployers: ['Amazon RDU1 Fulfillment', 'Novo Nordisk', 'Regional general contractors'],
    grantAlignment: ['Workforce Pell (July 2026)', 'STWD Grant', 'Industry-Driven Skills Training Fund ($30M)'],
    whyNow: 'Construction boom is active now. Quick Win — launchable in 3–6 months using existing faculty.',
  },
  {
    rank: 5,
    name: 'Industrial Machinery Maintenance Certificate',
    score: 8.1,
    category: 'strategic_build',
    scores: { demand: 8, competition: 8, revenue: 8, wages: 7, speed: 7 },
    duration: '24 weeks',
    medianWage: '$24–28/hr',
    annualOpenings: '100–150',
    opportunity:
      "Novo Nordisk's $4.1B pharmaceutical expansion and Lenovo's 5,100-employee manufacturing HQ create demand for specialized machinery maintenance. Existing Advanced Manufacturing training provides the foundation.",
    topEmployers: ['Novo Nordisk', 'Lenovo North America HQ', 'Pharmaceutical manufacturers'],
    grantAlignment: ['Accelerate NC Life Sciences Manufacturing ($25M)', 'Workforce Pell (July 2026)', 'STWD Grant'],
    whyNow:
      'Accelerate NC Life Sciences Manufacturing grant ($25M already awarded to Wake Tech) can fund curriculum and equipment.',
  },
  {
    rank: 6,
    name: 'Biomanufacturing Technician Certificate',
    score: 7.9,
    category: 'strategic_build',
    scores: { demand: 8, competition: 7, revenue: 8, wages: 7, speed: 7 },
    duration: '16–20 weeks',
    medianWage: '$23–28/hr',
    annualOpenings: '150–200',
    opportunity:
      "Novo Nordisk's 1,000 new pharmaceutical manufacturing jobs and $25M Accelerate NC grant already in hand. Existing Biotechnology workforce training provides the platform.",
    topEmployers: ['Novo Nordisk', 'Pfizer', 'Pharmaceutical sector'],
    grantAlignment: ['Accelerate NC Life Sciences Manufacturing ($25M)', 'Workforce Pell (July 2026)'],
    whyNow: 'Hiring begins 2026–2027 for the Novo Nordisk expansion. Development window is open now.',
  },
  {
    rank: 7,
    name: 'Cybersecurity Fundamentals Certificate',
    score: 7.9,
    category: 'quick_win',
    scores: { demand: 8, competition: 7, revenue: 8, wages: 8, speed: 8 },
    duration: '16 weeks',
    medianWage: '$38–45/hr',
    annualOpenings: '100–150',
    opportunity:
      'Cisco Systems (5,000+ employees) and Fidelity Investments (8,290 employees, 15% growth) drive demand. Existing providers focus on IT support — not specialized cybersecurity. Leverages existing Information & Digital Technology infrastructure.',
    topEmployers: ['Cisco Systems', 'Fidelity Investments', 'State of NC agencies', 'Government contractors'],
    grantAlignment: ['Workforce Pell (July 2026)', 'STWD Grant', 'Industry-Driven Skills Training Fund'],
    whyNow: 'Quick Win — existing IT faculty can deliver core content. CompTIA Security+ alignment ready.',
  },
  {
    rank: 8,
    name: 'Plumbing Technology Certificate',
    score: 8.0,
    category: 'quick_win',
    scores: { demand: 8, competition: 7, revenue: 8, wages: 7, speed: 9 },
    duration: '16 weeks',
    medianWage: '$22–26/hr',
    annualOpenings: '120–180',
    opportunity:
      'Both existing providers are proprietary schools — a community college alternative offers an affordable pathway. Amazon, Novo Nordisk construction, and regional development drive persistent demand.',
    topEmployers: ['Amazon RDU1', 'Commercial contractors', 'Residential builders'],
    grantAlignment: ['Workforce Pell (July 2026)', 'STWD Grant', 'Build Your Future Grant (NC)'],
    whyNow: 'Existing Construction and Maintenance workforce training infrastructure supports fast launch.',
  },
];

const topEmployers = [
  { name: 'Duke University & Health System', employees: '43,108', sector: 'Healthcare / Higher Ed', note: '' },
  { name: 'Wake County Public School System', employees: '17,000', sector: 'Education', note: '' },
  { name: 'State of North Carolina', employees: '24,083', sector: 'Government', note: '' },
  { name: 'Amazon (RDU1)', employees: '4,770+', sector: 'Logistics', note: 'fastest growing' },
  { name: 'Fidelity Investments', employees: '8,290', sector: 'Financial Services', note: '+15% growth' },
  { name: 'Cisco Systems', employees: '5,000+', sector: 'Technology', note: '' },
  { name: 'Novo Nordisk', employees: '2,500+', sector: 'Pharmaceutical', note: '$4.1B expansion' },
  { name: 'WakeMed Health & Hospitals', employees: '10,307', sector: 'Healthcare', note: '' },
];

const keyTrends = [
  'NC ranked #1 in the nation for workforce development — Site Selection Magazine 2026',
  '$10.8B life sciences investment wave: Novartis ($2B), J&J ($2B Wilson biologics campus), Genentech expansion',
  'CHIPS Act semiconductor manufacturing expansion — Wolfspeed, $750M proposed NC funding',
  '$4.1B Novo Nordisk pharmaceutical manufacturing investment — 1,000 new jobs by 2027',
  'Amazon fastest-growing employer in region — fulfillment center expansion ongoing',
];

const activeGrants = [
  { name: 'Workforce Pell Grants', info: 'Federal · July 1, 2026' },
  { name: 'STWD Grant', info: 'State · 2025–2026' },
  { name: 'Accelerate NC Life Sciences Manufacturing', info: 'Federal/State · $25M Phase 2' },
  { name: 'Industry-Driven Skills Training Fund', info: 'Federal DOL · $30M' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function categoryBadge(category: Category) {
  if (category === 'quick_win')
    return {
      label: 'Quick Win',
      cls: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
    };
  if (category === 'strategic_build')
    return {
      label: 'Strategic Build',
      cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    };
  return {
    label: 'Blue Ocean',
    cls: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  };
}

function scoreClasses(score: number) {
  if (score >= 9.0) return 'text-gradient-cosmic font-heading font-bold text-4xl';
  if (score >= 8.0) return 'text-teal-600 dark:text-teal-400 font-heading font-bold text-4xl';
  return 'text-blue-600 dark:text-blue-400 font-heading font-bold text-4xl';
}

const scoreLabels = ['demand', 'competition', 'revenue', 'wages', 'speed'] as const;
const scoreDisplayLabels: Record<string, string> = {
  demand: 'Demand',
  competition: 'Competition',
  revenue: 'Revenue',
  wages: 'Wages',
  speed: 'Speed',
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 10) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-theme-muted w-[80px] flex-shrink-0">
        {scoreDisplayLabels[label]}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-theme-surface overflow-hidden" style={{ background: 'rgba(148,163,184,0.15)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #a855f7, #14b8a6)',
          }}
        />
      </div>
      <span className="text-[11px] font-mono font-bold text-theme-secondary w-4 text-right flex-shrink-0">
        {value}
      </span>
    </div>
  );
}

function ProgramCard({ program }: { program: Program }) {
  const { label: catLabel, cls: catCls } = categoryBadge(program.category);
  return (
    <div className="card-cosmic rounded-2xl p-6 mb-4">
      {/* Top row */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mt-0.5">
          <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-xs">
            #{program.rank}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-lg text-theme-primary leading-snug">
            {program.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${catCls}`}>
              {catLabel}
            </span>
            <span className="font-mono text-[11px] text-theme-muted">
              {program.duration} · {program.annualOpenings} openings/yr
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className={scoreClasses(program.score)}>{program.score}</span>
          <p className="text-[10px] text-theme-muted mt-0.5 font-mono">/ 10</p>
        </div>
      </div>

      {/* Score bars */}
      <div className="mt-5 space-y-2">
        {scoreLabels.map((key) => (
          <ScoreBar key={key} label={key} value={program.scores[key]} />
        ))}
      </div>

      {/* Opportunity */}
      <p className="mt-5 text-sm text-theme-secondary leading-relaxed">
        {program.opportunity}
      </p>

      {/* Employers + Grants */}
      <div className="mt-5 grid sm:grid-cols-2 gap-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-2">
            Top Employers
          </p>
          <ul className="space-y-1.5">
            {program.topEmployers.map((e) => (
              <li key={e} className="flex items-start gap-2 text-sm text-theme-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                {e}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-2">
            Grant Alignment
          </p>
          <ul className="space-y-1.5">
            {program.grantAlignment.map((g) => (
              <li key={g} className="flex items-start gap-2 text-sm text-theme-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Duration + Wage */}
      <div className="mt-5 flex flex-wrap items-center gap-4 pt-4 border-t border-theme-subtle">
        <span className="font-mono text-xs text-theme-muted">
          Duration: <span className="text-theme-secondary">{program.duration}</span>
        </span>
        <span className="font-mono text-xs text-theme-muted">
          Median Wage: <span className="text-theme-secondary">{program.medianWage}</span>
        </span>
      </div>

      {/* Why Now */}
      <p className="mt-3 text-sm italic text-theme-tertiary leading-relaxed">
        ⚡ {program.whyNow}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScanDemoPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">

      {/* ═══════════════════════════════════════════════════════
          A. HERO
      ════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[55vh] flex items-center justify-center pt-36 lg:pt-40 pb-16">
        <Stars count={140} />
        <Aurora className="opacity-60" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">Program Opportunity Scan · Sample Report</span>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="font-heading font-bold text-gradient-cosmic leading-[1.05] mx-auto max-w-4xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4rem)' }}
            >
              Wake Technical Community College
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={180} duration={800}>
            <p className="mt-4 text-lg text-theme-secondary">
              Research Triangle, NC · 8 programs identified · February 2026
            </p>
          </AnimateOnScroll>

          {/* Stat pills */}
          <AnimateOnScroll variant="fade-up" delay={260} duration={800}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                9.05 Top Score
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                5 Quick Wins
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                $1,500
              </span>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={340} duration={800}>
            <p className="mt-6 text-xs text-theme-muted max-w-xl mx-auto leading-relaxed">
              This is a real scan for Wake Technical Community College. Data reflects live BLS, EMSI, and regional employer sources as of February 2026. All findings are institution-specific.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          B. EXECUTIVE SUMMARY
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Executive Summary</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              8 high-potential programs. 5 launchable in 3–6 months.
            </h2>
          </AnimateOnScroll>

          {/* Stat cards */}
          <StaggerChildren stagger={80} variant="fade-up" className="grid sm:grid-cols-3 gap-4 mt-10">
            <div className="card-cosmic rounded-2xl p-6 text-center">
              <p className="text-4xl font-mono font-bold text-gradient-cosmic">$10.8B</p>
              <p className="mt-2 text-sm text-theme-secondary leading-snug">
                Life sciences investment wave hitting the Research Triangle — driving demand across 4 identified programs
              </p>
            </div>
            <div className="card-cosmic rounded-2xl p-6 text-center">
              <p className="text-4xl font-mono font-bold text-gradient-cosmic">5 of 8</p>
              <p className="mt-2 text-sm text-theme-secondary leading-snug">
                Programs classified as Quick Wins — launchable within 3–6 months using existing faculty and infrastructure
              </p>
            </div>
            <div className="card-cosmic rounded-2xl p-6 text-center">
              <p className="text-4xl font-mono font-bold text-gradient-cosmic">#1</p>
              <p className="mt-2 text-sm text-theme-secondary leading-snug">
                North Carolina ranked #1 in the nation for workforce development — Site Selection Magazine 2026
              </p>
            </div>
          </StaggerChildren>

          {/* Narrative */}
          <AnimateOnScroll variant="fade-up" delay={100}>
            <p className="mt-10 text-base text-theme-secondary leading-relaxed">
              The standout opportunity is <strong className="text-theme-primary font-semibold">Biologics Manufacturing Quality Systems</strong> — scoring a 9.05 and uniquely positioned to capture Novartis, J&amp;J, and Genentech hiring before any regional competitor moves. For immediate impact, the <strong className="text-theme-primary font-semibold">Healthcare Management Certificate</strong> is a true Quick Win: launch in 3–6 months using existing Business faculty, with vacancies at Duke Health and WakeMed already unfilled. Across bioscience programs, Wake Tech holds a critical advantage — the <strong className="text-theme-primary font-semibold">$25M Accelerate NC Life Sciences Manufacturing grant</strong> is already in hand, creating a funded runway for Industrial Machinery Maintenance and Biomanufacturing development with no new funding risk.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          C. PROGRAM CARDS
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20 border-t border-theme-subtle">
        <div className="max-w-[960px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Program Analysis</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-10"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              All 8 programs, scored and ranked.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={60} variant="fade-up">
            {programs.map((program) => (
              <ProgramCard key={program.rank} program={program} />
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          D. REGIONAL SNAPSHOT
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20 border-t border-theme-subtle">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Regional Intelligence</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-10"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Why the Research Triangle. Why now.
            </h2>
          </AnimateOnScroll>

          {/* Employers table */}
          <AnimateOnScroll variant="fade-up" delay={60}>
            <div className="card-cosmic rounded-2xl overflow-hidden mb-10">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-theme-subtle">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted">
                      Employer
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted w-28">
                      Employees
                    </th>
                    <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted w-48 hidden sm:table-cell">
                      Sector
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topEmployers.map((emp, i) => (
                    <tr
                      key={emp.name}
                      className={i < topEmployers.length - 1 ? 'border-b border-theme-subtle' : ''}
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-theme-primary">{emp.name}</span>
                        {emp.note && (
                          <span className="ml-2 text-[11px] text-theme-muted">({emp.note})</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-mono text-theme-secondary text-right">
                        {emp.employees}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-theme-muted text-right hidden sm:table-cell">
                        {emp.sector}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>

          {/* Key Trends */}
          <AnimateOnScroll variant="fade-up" delay={80}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-4">
              Key Trends
            </p>
            <ul className="space-y-3 mb-10">
              {keyTrends.map((trend) => (
                <li key={trend} className="flex items-start gap-3 text-sm text-theme-secondary leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  {trend}
                </li>
              ))}
            </ul>
          </AnimateOnScroll>

          {/* Active Grants */}
          <AnimateOnScroll variant="fade-up" delay={100}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-4">
              Active Grant Opportunities
            </p>
            <div className="flex flex-wrap gap-3">
              {activeGrants.map((grant) => (
                <div
                  key={grant.name}
                  className="inline-flex flex-col gap-0.5 px-4 py-2.5 rounded-xl bg-purple-500/8 border border-purple-500/15"
                >
                  <span className="text-sm font-semibold text-theme-primary">{grant.name}</span>
                  <span className="text-[11px] text-theme-muted font-mono">{grant.info}</span>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          E. RECOMMENDED NEXT STEPS
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20 border-t border-theme-subtle">
        <div className="max-w-[760px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Recommended Next Steps</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-8"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Start with validation on the top 3.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="flex flex-col gap-4">
            {/* Step 1 */}
            <div className="card-cosmic rounded-2xl p-6 flex gap-5 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-semibold text-base text-theme-primary">
                    Advance Biologics Manufacturing Quality Systems to Stage 2 Validation
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    $3,500 · Program Validation
                  </span>
                </div>
                <p className="mt-2 text-sm text-theme-secondary leading-relaxed">
                  Capture the Novartis partnership window before competitors. This is a first-mover opportunity
                  with a defined opening — Novartis flagship facility opens 2027–2028, and curriculum partnerships
                  are available now before employers build internal training programs.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card-cosmic rounded-2xl p-6 flex gap-5 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
                <span className="text-teal-600 dark:text-teal-400 font-mono font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-semibold text-base text-theme-primary">
                    Fast-track Healthcare Management Certificate
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    $1,500 · Included in this scan
                  </span>
                </div>
                <p className="mt-2 text-sm text-theme-secondary leading-relaxed">
                  Quick Win. Launch in 3–6 months using existing Business faculty. Healthcare management vacancies
                  at Duke Health and WakeMed are immediate — this program fills a gap with no proprietary equivalent
                  at the community college level.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card-cosmic rounded-2xl p-6 flex gap-5 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-semibold text-base text-theme-primary">
                    Submit Accelerate NC grant application for bioscience programs
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    No cost · $25M already awarded
                  </span>
                </div>
                <p className="mt-2 text-sm text-theme-secondary leading-relaxed">
                  $25M Accelerate NC Life Sciences Manufacturing grant is already in Wake Tech&apos;s hands.
                  Confirm allocation to Industrial Machinery Maintenance and Biomanufacturing programs —
                  this removes the primary funding barrier for both Strategic Build programs.
                </p>
              </div>
            </div>
          </StaggerChildren>

          {/* Footer note */}
          <AnimateOnScroll variant="fade-up" delay={120}>
            <div className="mt-8 p-5 rounded-xl border border-theme-subtle bg-theme-surface">
              <p className="text-sm text-theme-muted leading-relaxed">
                All 8 programs are detailed above. Stages 3–8 (curriculum design, pathway mapping, employer partnerships, and launch) are available through{' '}
                <strong className="text-theme-secondary font-semibold">Wavelength&apos;s Core Program Lifecycle</strong>.
              </p>
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
              See what your region&apos;s employers are hiring for.
            </h2>
            <p className="mt-5 text-base text-theme-secondary leading-relaxed max-w-xl mx-auto">
              This is a real scan for Wake Technical Community College. Your Program Opportunity Scan delivers
              7–10 scored, ranked program opportunities for your specific region — researched, written, and
              delivered within 7 days.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/discover">
                <button className="btn-cosmic btn-cosmic-primary text-sm py-3 px-7">
                  Order a Program Opportunity Scan →
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
