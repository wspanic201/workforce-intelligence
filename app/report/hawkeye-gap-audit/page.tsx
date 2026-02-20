import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, CheckCircle2, XCircle, AlertCircle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { PrintButton } from '@/components/ui/PrintButton';

export const metadata: Metadata = {
  title: 'Program Gap Audit — Hawkeye Community College | Wavelength Sample Report',
  description:
    'Sample Program Gap Audit for Hawkeye Community College, Waterloo Iowa. Portfolio health score 68/100 — 4 high-priority gaps, 5 missing program opportunities identified across a 47-program portfolio.',
  alternates: { canonical: 'https://withwavelength.com/report/hawkeye-gap-audit' },
  openGraph: {
    title: 'Program Gap Audit — Hawkeye Community College',
    description:
      '68/100 portfolio health score. 4 red-flag gaps, 5 missing programs, and a full credential stacking assessment for Cedar Valley, Iowa.',
    url: 'https://withwavelength.com/report/hawkeye-gap-audit',
    type: 'article',
  },
};

// ─── Helper components ────────────────────────────────────────────────────────

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

function SeverityBadge({ level }: { level: 'critical' | 'high' | 'medium' | 'low' }) {
  const map = {
    critical: { label: 'Critical', cls: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20' },
    high: { label: 'High', cls: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20' },
    medium: { label: 'Medium', cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' },
    low: { label: 'Low', cls: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20' },
  };
  const m = map[level];
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${m.cls}`}>{m.label}</span>;
}

function AlignmentDot({ level }: { level: 'strong' | 'moderate' | 'weak' | 'none' }) {
  const map = {
    strong: 'bg-teal-500',
    moderate: 'bg-amber-400',
    weak: 'bg-orange-500',
    none: 'bg-rose-500',
  };
  return <span className={`inline-block w-3 h-3 rounded-full ${map[level]} flex-shrink-0`} />;
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-teal-500" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-rose-500" />;
  return <Minus className="w-4 h-4 text-amber-400" />;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const healthCategories = [
  {
    name: 'Market Alignment',
    score: 61,
    color: 'amber',
    description: '18 of 47 programs show weak or declining employer demand signals in Cedar Valley',
  },
  {
    name: 'Curriculum Currency',
    score: 58,
    color: 'amber',
    description: 'IT, Advanced Manufacturing, and Business programs have measurable O*NET skill gaps vs. current job postings',
  },
  {
    name: 'Enrollment Health',
    score: 72,
    color: 'blue',
    description: 'Healthcare and Agriculture programs are strong; IT and Liberal Arts show multi-year decline',
  },
  {
    name: 'Completion Rates',
    score: 74,
    color: 'blue',
    description: 'Statewide average 68%; Hawkeye at 74% — exceeds benchmark, weakness in Part-Time cohort',
  },
  {
    name: 'Credential Stacking',
    score: 52,
    color: 'rose',
    description: 'Only 9 of 47 programs have a documented non-credit → credit pathway; 27 are credential dead-ends',
  },
  {
    name: 'Regulatory Compliance',
    score: 83,
    color: 'green',
    description: 'Nursing and allied health accreditation current; Manufacturing Technology SAC review overdue',
  },
];

const overallScore = 68;

const redFlagGaps = [
  {
    program: 'Information Technology — Computer Networking AAS',
    issueType: 'Curriculum Currency',
    severity: 'critical' as const,
    evidence: [
      'Program outcomes reference Cisco CCNA 2.0 (retired April 2020) — current industry standard is CCNA 3.0+ with automation focus',
      'No mention of cloud infrastructure (AWS, Azure) in published learning outcomes; 78% of John Deere and CUNA Mutual IT job postings require cloud skills',
      'Python and automation scripting absent from curriculum; O*NET task data for 15-1211 shows 43% of tasks now involve scripting/automation',
      'Last curriculum review logged 2019 — 5+ years without O*NET realignment',
    ],
    employerImpact: 'John Deere, CUNA Mutual Group, CBE Companies all list cloud and automation as required skills for entry-level IT roles. Graduates are arriving undertrained.',
    action: 'Immediate curriculum revision: add AWS Cloud Practitioner track, replace CCNA 2.0 references with CCNA 3.0, integrate Python fundamentals module. Estimated 3-month faculty development cycle.',
  },
  {
    program: 'Advanced Manufacturing Technology AAS',
    issueType: 'Enrollment Decline + Curriculum Gap',
    severity: 'high' as const,
    evidence: [
      'Enrollment declined 34% over 3 years (FY21: 89 students → FY24: 59 students)',
      'Completion rate 51% — 23 points below Hawkeye average (74%)',
      'Program does not include CNC automation, collaborative robotics (cobots), or Industry 4.0 sensors — all cited in Viking Pump and John Deere job postings',
      'Competing program at NIACC (Mason City) launched updated mechatronics curriculum in 2023; Hawkeye has not responded',
    ],
    employerImpact: 'Viking Pump (900+ employees, Cedar Falls) has expanded cobot deployment — current graduates lack operational skills. John Deere Waterloo works (3,000+ employees) lists "automation knowledge" in 64% of manufacturing technician postings.',
    action: 'Program redesign: partner with Viking Pump and John Deere for advisory input; add Fanuc cobot module; integrate Allen-Bradley PLC programming. Enrollment recovery target: +20% in 18 months with employer co-marketing.',
  },
  {
    program: 'Business Administration AAS',
    issueType: 'Market Misalignment',
    severity: 'high' as const,
    evidence: [
      'Program is generalist with no industry specialization tracks — Cedar Valley employer postings skew toward finance/insurance (CUNA Mutual, MetLife) and agribusiness',
      'No data analytics or Excel/Power BI certification integration despite 67% of "business analyst" postings in Black Hawk County requiring it',
      'Liberal Arts transfer pathway is dominant use case — only 31% of graduates enter directly into business employment (IPEDS outcome data)',
      'CUNA Mutual Group (1,600+ employees, Cedar Falls) reports difficulty sourcing entry-level analysts from Hawkeye — recruits from UNI instead',
    ],
    employerImpact: 'CUNA Mutual, MidWestOne Bank, and Veridian Credit Union all list Power BI, Excel advanced, and data fundamentals as requirements — competencies absent from current program.',
    action: 'Add optional concentration tracks: Financial Services Analytics and Agribusiness Operations. Integrate Power BI certification prep. Partner with CUNA Mutual on curriculum advisory board and sponsored internship cohort.',
  },
  {
    program: 'Welding Technology AAS',
    issueType: 'Compliance Gap + Accreditor Drift',
    severity: 'medium' as const,
    evidence: [
      'AWS SENSE Level I program standards updated March 2023 — Hawkeye curriculum last updated 2021; two-year lag on standards',
      'Certification pass rate dropped from 87% (FY21) to 71% (FY24) — below AWS SENSE benchmark of 75%',
      'No stainless/aluminum GTAW (TIG) modules despite Tyson Foods (2,800 employees) plant maintenance requiring food-grade stainless welding',
      'Equipment: 6 of 14 GMAW stations are pre-2015 Lincoln Electric — Lincoln has issued mandatory curriculum updates for newer wire feeds',
    ],
    employerImpact: 'Tyson Foods and Bertch Cabinet (500+ employees, Waterloo) both cite stainless TIG as preferred qualification. Current graduates primarily AWS-qualified for structural/carbon steel only.',
    action: 'Submit curriculum revision to AWS SENSE within 60 days. Add GTAW stainless module (16 lab hours). Pursue equipment refresh grant through Iowa Industrial New Jobs Training (260E) program.',
  },
];

const marketAlignmentGrid = [
  {
    program: 'Registered Nursing ADN',
    employers: ['UnityPoint Health', 'MercyOne', 'Allen Hospital'],
    demandLevel: 'strong' as const,
    openings: '340+',
    wageMedian: '$62,900',
    trend: 'up' as const,
    note: 'Critical regional shortage; program at capacity',
  },
  {
    program: 'Welding Technology',
    employers: ['Tyson Foods', 'Viking Pump', 'Bertch Cabinet'],
    demandLevel: 'moderate' as const,
    openings: '85',
    wageMedian: '$42,800',
    trend: 'flat' as const,
    note: 'Demand exists; curriculum misalignment reducing placement',
  },
  {
    program: 'Agriculture Business',
    employers: ['John Deere', 'Iowa Farm Bureau', 'Cooperative Grain'],
    demandLevel: 'strong' as const,
    openings: '120+',
    wageMedian: '$48,600',
    trend: 'up' as const,
    note: 'Flagship strength; regional differentiation',
  },
  {
    program: 'Computer Networking AAS',
    employers: ['John Deere', 'CUNA Mutual', 'CBE Companies'],
    demandLevel: 'weak' as const,
    openings: '60',
    wageMedian: '$55,200',
    trend: 'up' as const,
    note: 'Demand strong but graduates undertrained — curriculum gap',
  },
  {
    program: 'Advanced Manufacturing Tech',
    employers: ['Viking Pump', 'John Deere', 'Omega Cabinetry'],
    demandLevel: 'moderate' as const,
    openings: '95',
    wageMedian: '$46,100',
    trend: 'down' as const,
    note: 'Declining enrollment; Industry 4.0 gap widening',
  },
  {
    program: 'Business Administration AAS',
    employers: ['CUNA Mutual', 'MidWestOne Bank', 'Veridian CU'],
    demandLevel: 'weak' as const,
    openings: '180+',
    wageMedian: '$40,200',
    trend: 'flat' as const,
    note: 'High demand but program too generalist; graduates over-funneled to transfer',
  },
  {
    program: 'Early Childhood Education',
    employers: ['Waterloo Schools', 'Cedar Falls Schools', 'Daycare networks'],
    demandLevel: 'strong' as const,
    openings: '75',
    wageMedian: '$31,400',
    trend: 'up' as const,
    note: 'High social demand; wage ceiling limits long-term appeal',
  },
  {
    program: 'Physical Therapy Assistant',
    employers: ['UnityPoint Health', 'Genesis Health', 'PT clinics'],
    demandLevel: 'strong' as const,
    openings: '45',
    wageMedian: '$58,100',
    trend: 'up' as const,
    note: 'Accredited, high-placement — model program',
  },
  {
    program: 'Liberal Arts / General Studies',
    employers: ['(Transfer pathway)'],
    demandLevel: 'none' as const,
    openings: '—',
    wageMedian: '—',
    trend: 'down' as const,
    note: 'Transfer vehicle; limited direct employment value; review enrollment justification',
  },
  {
    program: 'HVAC/R Technology',
    employers: ['Waterloo HVAC contractors', 'John Deere facilities', 'UnityPoint facilities'],
    demandLevel: 'strong' as const,
    openings: '65',
    wageMedian: '$52,400',
    trend: 'up' as const,
    note: 'Undersupplied regionally; program at enrollment capacity',
  },
];

const missingPrograms = [
  {
    rank: 1,
    name: 'Certified Nursing Assistant (CNA) to LPN Bridge',
    demandScore: 9.4,
    competitiveLandscape: 'Undersaturated',
    estimatedEnrollment: '45–60/yr',
    wage: '$52,000–$62,000',
    rationale:
      'UnityPoint Health, MercyOne, and Allen Hospital collectively employ 6,800+ people in Black Hawk County. Hospital HR contacts confirm CNAs are their #1 bottleneck to LPN staffing. Hawkeye offers standalone CNA and LPN programs but NO bridge pathway — forcing CNAs to restart from scratch. DMACC (Des Moines) offers a 12-month bridge; Hawkeye is leaving this market to distance providers.',
    employers: ['UnityPoint Health', 'MercyOne', 'Allen Hospital', 'Iowa Veterans Home'],
    note: 'Cross-sells into Pell Readiness Check — likely Pell-eligible under Workforce Pell July 2026',
  },
  {
    rank: 2,
    name: 'Cybersecurity Operations Certificate',
    demandScore: 8.9,
    competitiveLandscape: 'White Space',
    estimatedEnrollment: '30–40/yr',
    wage: '$58,000–$78,000',
    rationale:
      'CUNA Mutual Group ($34B AUM, 1,600 employees) and CBE Companies (Cedar Falls BPO, 800+ employees) are the dominant financial/data employers in Cedar Valley. Both have publicly disclosed cybersecurity hiring challenges. No community college within 75 miles of Waterloo offers a dedicated cybersecurity operations certificate. CompTIA Security+ and CySA+ prep would fit an 18-week format. Iowa NIACC (Mason City) has no cyber program; Hawkeye has a window.',
    employers: ['CUNA Mutual Group', 'CBE Companies', 'John Deere Digital', 'MidWestOne Bank'],
    note: 'High-wage outcome; strong Pell eligibility candidate',
  },
  {
    rank: 3,
    name: 'Food Science & Quality Technology Certificate',
    demandScore: 8.2,
    competitiveLandscape: 'White Space',
    estimatedEnrollment: '25–35/yr',
    wage: '$42,000–$58,000',
    rationale:
      "Tyson Fresh Meats is Waterloo's #2 employer (2,800+ employees) and continuously hires quality technicians and food safety compliance staff. Bertch Cabinet, Target Distribution Center, and Croell Redi-Mix also need quality roles. Iowa State (Ames, 100 miles) is the only credentialed food science program — zero community-college level options in this corridor. A 30-credit certificate combining HACCP certification, food microbiology fundamentals, and regulatory compliance would fill a clear regional void.",
    employers: ['Tyson Fresh Meats', 'Target Regional DC', 'Croell Redi-Mix', 'Quaker Oats (Cedar Rapids)'],
    note: "Aligns with Iowa's food processing cluster — strong state grant eligibility",
  },
  {
    rank: 4,
    name: 'Industrial Maintenance & Mechatronics Certificate',
    demandScore: 8.1,
    competitiveLandscape: 'Competitive Advantage',
    estimatedEnrollment: '35–50/yr',
    wage: '$48,000–$65,000',
    rationale:
      "John Deere Waterloo Works (tractor assembly, 3,000+ employees) has expanded automation in final assembly. Viking Pump (900+ employees, Cedar Falls) added collaborative robots in 2023. Neither of these major employers has a community college partner for industrial maintenance with mechatronics focus. Hawkeye's existing Advanced Manufacturing AAS could spawn a stackable 16-week certificate targeting incumbent worker upskill — potentially employer-sponsored cohort model.",
    employers: ['John Deere Waterloo Works', 'Viking Pump', 'Omega Cabinetry', 'Bertch Cabinet'],
    note: 'Stackable from existing AAS; fastest path to launch; high employer co-investment potential',
  },
  {
    rank: 5,
    name: 'Medical Billing & Coding Certificate',
    demandScore: 7.7,
    competitiveLandscape: 'Moderate Competition',
    estimatedEnrollment: '40–55/yr',
    wage: '$38,000–$50,000',
    rationale:
      "UnityPoint Health's back-office billing operations (Waterloo campus) constantly hires coders and billers. The regional hospital system has 600+ billing staff across Iowa. While online providers (AAPC, Coursera) exist, they lack the academic credential employers prefer for internal promotions. A 12-month certificate with CPC exam prep and clinical rotation at UnityPoint would differentiate from online competitors on credential strength and employer relationships.",
    employers: ['UnityPoint Health', 'MercyOne', 'Allen Hospital', 'Iowa Physician Clinic'],
    note: 'Dovetails with RN ADN and PTA programs — creates healthcare pathway ecosystem',
  },
];

const credentialStacking = [
  {
    program: 'Registered Nursing ADN',
    hasNonCredit: true,
    pathway: 'CNA (non-credit) → ADN → RN-to-BSN transfer',
    pathwayQuality: 'strong' as const,
    gaps: 'Bridge from CNA to LPN missing (separate program gap)',
    recommendation: 'Formalize CNA → LPN → ADN as official pathway; partner with UnityPoint for tuition ladder',
  },
  {
    program: 'Welding Technology AAS',
    hasNonCredit: true,
    pathway: 'Welding Fundamentals (non-credit, 80 hrs) → AAS',
    pathwayQuality: 'moderate' as const,
    gaps: 'No advanced specialty certificates after AAS (structural, stainless, pipe)',
    recommendation: 'Add two post-AAS specialty certificates: Pipe Welding (16 wk) and Stainless/TIG (8 wk)',
  },
  {
    program: 'Computer Networking AAS',
    hasNonCredit: false,
    pathway: 'None — AAS is entry point; no non-credit on-ramp',
    pathwayQuality: 'none' as const,
    gaps: 'No CompTIA A+ or Network+ certificate to stack below AAS; no cloud certifications above',
    recommendation: 'Launch CompTIA A+ short course (8 wk) as feeder; add cloud concentration stackable certificate above AAS',
  },
  {
    program: 'Advanced Manufacturing Tech AAS',
    hasNonCredit: true,
    pathway: 'Manufacturing Safety Intro (non-credit) → AAS',
    pathwayQuality: 'moderate' as const,
    gaps: 'Non-credit intro is 8 hours — not meaningful; no industry certifications integrated',
    recommendation: 'Replace 8-hr intro with robust 40-hr Manufacturing Fundamentals certificate; integrate NIMS or Fanuc credentials into AAS',
  },
  {
    program: 'Business Administration AAS',
    hasNonCredit: false,
    pathway: 'None — direct AAS enrollment only',
    pathwayQuality: 'none' as const,
    gaps: 'No QuickBooks, Excel, or office fundamentals short courses feeding into AAS',
    recommendation: 'Create Digital Business Fundamentals certificate (12 wk); integrate Power BI and QuickBooks modules as AAS electives',
  },
  {
    program: 'Early Childhood Education AAS',
    hasNonCredit: true,
    pathway: 'Child Development Basics (non-credit) → AAS → Transfer to UNI ECE',
    pathwayQuality: 'strong' as const,
    gaps: 'Pathway strong but no Infant/Toddler specialization certificate',
    recommendation: 'Add stackable Infant & Toddler Care Certificate (endorsed by Iowa DHS) to address daycare licensing requirements',
  },
  {
    program: 'HVAC/R Technology',
    hasNonCredit: false,
    pathway: 'Direct AAS enrollment only',
    pathwayQuality: 'weak' as const,
    gaps: 'No EPA 608 short course entry point; no refrigeration specialization above AAS',
    recommendation: 'Add EPA 608 Certification Prep (4 wk) as non-credit entry; add Commercial Refrigeration certificate above AAS for food processing sector',
  },
];

const priorityActions = [
  {
    timeline: 'Quick Wins (0–3 Months)',
    color: 'teal',
    icon: '⚡',
    actions: [
      {
        title: 'Update Computer Networking AAS outcomes to reference CCNA 3.0 and add cloud learning objective',
        effort: 'Low',
        impact: 'High',
        owner: 'IT Dept Chair + Curriculum Committee',
      },
      {
        title: 'Submit AWS SENSE curriculum revision to bring Welding AAS into compliance',
        effort: 'Low',
        impact: 'High',
        owner: 'Welding Program Director',
      },
      {
        title: 'Add Power BI module to Business Administration AAS as required elective',
        effort: 'Low',
        impact: 'Medium',
        owner: 'Business Dept Chair',
      },
      {
        title: 'Contact CUNA Mutual HR to establish curriculum advisory relationship and internship pipeline',
        effort: 'Low',
        impact: 'High',
        owner: 'Dean of Business & Technology',
      },
      {
        title: 'Publish formal CNA → LPN bridge program page and begin enrollment tracking',
        effort: 'Medium',
        impact: 'High',
        owner: 'Health Sciences Dean',
      },
    ],
  },
  {
    timeline: 'Strategic Builds (3–12 Months)',
    color: 'blue',
    icon: '🔨',
    actions: [
      {
        title: 'Launch Cybersecurity Operations Certificate — first cohort target Fall 2026',
        effort: 'Medium',
        impact: 'High',
        owner: 'IT Dept + Workforce Development',
      },
      {
        title: 'Redesign Advanced Manufacturing AAS with Industry 4.0 focus — cobot module, PLC programming',
        effort: 'High',
        impact: 'High',
        owner: 'Manufacturing Dept Chair + John Deere/Viking Pump advisory',
      },
      {
        title: 'Launch Industrial Maintenance & Mechatronics Certificate as stackable credential from AAS',
        effort: 'Medium',
        impact: 'High',
        owner: 'Manufacturing + Workforce Development',
      },
      {
        title: 'Develop Food Science & Quality Technology Certificate — HACCP + food micro + regulatory',
        effort: 'Medium',
        impact: 'Medium',
        owner: 'Agriculture Dept + Tyson Foods advisory',
      },
      {
        title: 'Create CompTIA A+ and Network+ non-credit on-ramp to IT programs',
        effort: 'Low',
        impact: 'Medium',
        owner: 'IT Dept + Continuing Education',
      },
    ],
  },
  {
    timeline: 'Long-Term Investments (12+ Months)',
    color: 'purple',
    icon: '🔭',
    actions: [
      {
        title: 'Evaluate sunsetting Liberal Arts / General Studies AAS — redirect resources to transfer advising function',
        effort: 'High',
        impact: 'Medium',
        owner: 'Academic Affairs + Board',
      },
      {
        title: 'Build Medical Billing & Coding Certificate — accreditation, equipment, UnityPoint partnership',
        effort: 'High',
        impact: 'High',
        owner: 'Health Sciences + Workforce Development',
      },
      {
        title: 'Equipment refresh: Advanced Manufacturing lab (6 pre-2015 welding stations; 2 cobot platforms)',
        effort: 'High',
        impact: 'High',
        owner: 'Operations + Grant Development (Iowa 260E)',
      },
      {
        title: 'Conduct full credential stacking audit — document 47 programs against Iowa ICSPS pathway requirements',
        effort: 'Medium',
        impact: 'High',
        owner: 'Institutional Research + Curriculum Committee',
      },
    ],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HawkeyeGapAuditPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">

      {/* ═══════════ DISCLAIMER BANNER ═══════════ */}
      <div className="w-full bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
          ⚠️ Sample report for demonstration purposes only — data is illustrative and not derived from a live Hawkeye Community College engagement.
        </p>
      </div>

      {/* ═══════════ A. HERO ═══════════ */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-32 lg:pt-36 pb-16">
        <Stars count={120} />
        <Aurora className="opacity-60" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">Program Gap Audit · Sample Report</span>
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
              Cedar Valley Region · Black Hawk County, Iowa · Audit Date: February 2026
            </p>
          </AnimateOnScroll>

          {/* Stat Pills */}
          <AnimateOnScroll variant="fade-up" delay={260} duration={800}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                47 Programs Audited
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                14 Gaps Identified
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                4 High-Priority Flags
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                5 Missing Programs
              </span>
            </div>
          </AnimateOnScroll>

          {/* Print button */}
          <AnimateOnScroll variant="fade-up" delay={340} duration={800}>
            <div className="mt-6 flex justify-center">
              <PrintButton />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ B. PORTFOLIO HEALTH SCORE ═══════════ */}
      <section className="relative py-16 md:py-24 print:py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Portfolio Health Score</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                Overall Rating
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
            {/* Big Score */}
            <AnimateOnScroll variant="fade-up">
              <div className="card-cosmic rounded-2xl p-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-4">
                  Portfolio Health
                </p>
                <div
                  className="text-8xl font-bold font-mono mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  68
                </div>
                <p className="text-sm text-theme-muted">out of 100</p>
                <div className="mt-4">
                  <span className="inline-block px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-bold">
                    Needs Attention
                  </span>
                </div>
                <p className="mt-5 text-xs text-theme-tertiary leading-relaxed">
                  Below the regional community college benchmark of 75. Three categories require immediate intervention.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Category Breakdown */}
            <AnimateOnScroll variant="fade-up" delay={100}>
              <div className="card-cosmic rounded-2xl p-7">
                <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-6">
                  Score by Category
                </p>
                <div className="space-y-6">
                  {healthCategories.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-theme-primary">{cat.name}</span>
                        <span className="text-sm font-mono font-bold text-theme-secondary">{cat.score}/100</span>
                      </div>
                      <HealthBar score={cat.score} color={cat.color} />
                      <p className="mt-1.5 text-[11px] text-theme-muted leading-snug">{cat.description}</p>
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
              What This Audit Found
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={80}>
            <div className="space-y-5 text-theme-secondary leading-relaxed">
              <p>
                Hawkeye Community College operates a 47-program portfolio that reflects both genuine regional strengths and a catalog in need of targeted modernization. The institution's healthcare programs — Registered Nursing ADN, Physical Therapy Assistant, and Early Childhood Education — are performing well and aligned with the Cedar Valley's dominant employer sectors (UnityPoint Health, MercyOne, Allen Hospital collectively account for 6,800+ regional jobs). Agriculture Business is a legitimate regional differentiator, serving the Cedar Valley's persistent demand from John Deere, cooperative grain operations, and Iowa Farm Bureau.
              </p>
              <p>
                However, three categories scored below 65 — Curriculum Currency (58), Market Alignment (61), and Credential Stacking (52) — each pointing to structural issues that compound over time. The most urgent finding is a 5-year curriculum lag in the Computer Networking AAS: the program still references retired Cisco standards and lacks the cloud infrastructure and automation competencies that Hawkeye's largest IT employers (John Deere, CUNA Mutual, CBE Companies) now require at entry level. Advanced Manufacturing Technology has shed 34% of enrollment in three years without a visible institutional response, while competitors at NIACC have already launched updated mechatronics programs. Business Administration remains generalist in a market that has moved toward data-enabled business roles — CUNA Mutual, the area's dominant financial employer, is sourcing analysts from UNI rather than Hawkeye.
              </p>
              <p>
                Five market opportunities are completely absent from Hawkeye's catalog: a CNA-to-LPN bridge program despite the healthcare system's explicit staffing crisis; a cybersecurity operations certificate despite CUNA Mutual and CBE Companies' public hiring challenges; a food science/quality technology certificate in Tyson Fresh Meats' backyard; an industrial maintenance and mechatronics certificate despite John Deere and Viking Pump's cobot deployment; and a medical billing and coding certificate despite UnityPoint Health's continuous billing staff demand. Taken together, these five programs represent an estimated 175–230 additional annual enrollments Hawkeye is currently leaving to distance providers, proprietary schools, and competitor institutions.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Key Findings Strip */}
          <AnimateOnScroll variant="fade-up" delay={160}>
            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl p-5 bg-teal-500/5 border border-teal-500/15">
                <CheckCircle2 className="w-5 h-5 text-teal-500 mb-3" />
                <p className="text-sm font-bold text-theme-primary mb-1">Strengths</p>
                <p className="text-xs text-theme-secondary leading-relaxed">Healthcare, Agriculture, PTA, and HVAC programs are regionally aligned and performing above benchmark.</p>
              </div>
              <div className="rounded-xl p-5 bg-amber-500/5 border border-amber-500/15">
                <AlertCircle className="w-5 h-5 text-amber-500 mb-3" />
                <p className="text-sm font-bold text-theme-primary mb-1">Concerns</p>
                <p className="text-xs text-theme-secondary leading-relaxed">IT, Advanced Manufacturing, and Business have measurable curriculum gaps and market misalignment that are hurting placement rates.</p>
              </div>
              <div className="rounded-xl p-5 bg-rose-500/5 border border-rose-500/15">
                <AlertTriangle className="w-5 h-5 text-rose-500 mb-3" />
                <p className="text-sm font-bold text-theme-primary mb-1">Immediate Action</p>
                <p className="text-xs text-theme-secondary leading-relaxed">Computer Networking AAS curriculum is out of compliance with current industry standards — requires revision within 90 days.</p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ D. HIGH-PRIORITY GAPS ═══════════ */}
      <section className="relative py-16 md:py-24 print:py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Section D · High-Priority Gaps</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                Red Flag Programs
              </h2>
              <p className="mt-3 text-theme-secondary max-w-xl mx-auto text-sm">
                These four programs have issues serious enough to affect enrollment, graduate outcomes, or accreditation standing within 12–18 months if unaddressed.
              </p>
            </div>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="space-y-6">
            {redFlagGaps.map((gap, i) => (
              <div key={i} className="card-cosmic rounded-2xl p-7">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-1">
                      {gap.issueType}
                    </p>
                    <h3 className="font-heading font-bold text-lg text-theme-primary leading-snug">
                      {gap.program}
                    </h3>
                  </div>
                  <SeverityBadge level={gap.severity} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-3">
                      Evidence
                    </p>
                    <ul className="space-y-2">
                      {gap.evidence.map((ev, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-theme-secondary">
                          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                          {ev}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-2">
                        Employer Impact
                      </p>
                      <p className="text-sm text-theme-secondary leading-relaxed">{gap.employerImpact}</p>
                    </div>
                    <div className="rounded-xl p-4 bg-teal-500/5 border border-teal-500/15">
                      <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">
                        Recommended Action
                      </p>
                      <p className="text-sm text-theme-secondary leading-relaxed">{gap.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════ E. MARKET ALIGNMENT GRID ═══════════ */}
      <section className="relative py-16 md:py-24 bg-theme-surface/30 print:py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Section E · Market Alignment Analysis</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                Program ↔ Employer Demand Map
              </h2>
              <p className="mt-3 text-theme-secondary max-w-xl mx-auto text-sm">
                Ten representative programs assessed against Cedar Valley employer job postings, BLS occupational data, and IPEDS enrollment trends.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Legend */}
          <AnimateOnScroll variant="fade-up" delay={80}>
            <div className="flex flex-wrap gap-4 justify-center mb-8 text-xs text-theme-muted">
              {[
                { level: 'strong' as const, label: 'Strong Alignment' },
                { level: 'moderate' as const, label: 'Moderate Alignment' },
                { level: 'weak' as const, label: 'Weak Alignment' },
                { level: 'none' as const, label: 'Not Employment-Focused' },
              ].map(({ level, label }) => (
                <span key={level} className="flex items-center gap-1.5">
                  <AlignmentDot level={level} />
                  {label}
                </span>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Grid */}
          <AnimateOnScroll variant="fade-up" delay={120}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-theme-subtle">
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Program</th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Key Employers</th>
                    <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Alignment</th>
                    <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Openings</th>
                    <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Median Wage</th>
                    <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-widest text-theme-muted">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {marketAlignmentGrid.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-theme-subtle/50 hover:bg-theme-surface/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-theme-primary text-[13px]">{row.program}</p>
                        <p className="text-[11px] text-theme-muted mt-0.5 leading-snug">{row.note}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          {row.employers.map((e) => (
                            <span key={e} className="text-[11px] text-theme-secondary">{e}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">
                          <AlignmentDot level={row.demandLevel} />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[13px] text-theme-primary">{row.openings}</td>
                      <td className="py-3 px-4 text-right font-mono text-[13px] text-theme-primary">{row.wageMedian}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <TrendIcon trend={row.trend} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>

          {/* Regional Employer Context */}
          <AnimateOnScroll variant="fade-up" delay={160}>
            <div className="mt-10">
              <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-4 text-center">
                Cedar Valley Major Employers · Context Reference
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'John Deere Waterloo Works', sector: 'Manufacturing', employees: '3,000+' },
                  { name: 'Tyson Fresh Meats', sector: 'Food Processing', employees: '2,800+' },
                  { name: 'UnityPoint Health', sector: 'Healthcare', employees: '2,400+' },
                  { name: 'CUNA Mutual Group', sector: 'Financial Services', employees: '1,600+' },
                  { name: 'CBE Companies', sector: 'Business Process', employees: '800+' },
                  { name: 'Viking Pump', sector: 'Industrial Mfg', employees: '900+' },
                  { name: 'Bertch Cabinet', sector: 'Manufacturing', employees: '500+' },
                  { name: 'MercyOne Waterloo', sector: 'Healthcare', employees: '1,200+' },
                ].map((emp) => (
                  <div key={emp.name} className="rounded-lg p-3.5 bg-theme-surface/50 border border-theme-subtle">
                    <p className="text-[12px] font-bold text-theme-primary leading-snug">{emp.name}</p>
                    <p className="text-[11px] text-theme-muted mt-0.5">{emp.sector} · {emp.employees}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ F. MISSING PROGRAM OPPORTUNITIES ═══════════ */}
      <section className="relative py-16 md:py-24 print:py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Section F · Missing Programs</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                Market Demand You're Not Serving
              </h2>
              <p className="mt-3 text-theme-secondary max-w-xl mx-auto text-sm">
                Five programs with confirmed regional employer demand that Hawkeye does not currently offer. Estimated 175–230 additional annual enrollments available.
              </p>
            </div>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="space-y-6">
            {missingPrograms.map((prog) => (
              <div key={prog.rank} className="card-cosmic rounded-2xl p-7">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}
                    >
                      {prog.rank}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-0.5">
                        Missing Program
                      </p>
                      <h3 className="font-heading font-bold text-lg text-theme-primary leading-snug">
                        {prog.name}
                      </h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400">
                      Demand: {prog.demandScore}/10
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      prog.competitiveLandscape === 'White Space'
                        ? 'bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400'
                        : prog.competitiveLandscape === 'Undersaturated'
                        ? 'bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400'
                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400'
                    }`}>
                      {prog.competitiveLandscape}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-5">
                  <div className="rounded-lg p-3.5 bg-theme-surface/50 border border-theme-subtle text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-1">Est. Enrollment</p>
                    <p className="text-lg font-bold font-mono text-theme-primary">{prog.estimatedEnrollment}</p>
                  </div>
                  <div className="rounded-lg p-3.5 bg-theme-surface/50 border border-theme-subtle text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-1">Grad Wage Range</p>
                    <p className="text-sm font-bold font-mono text-teal-600 dark:text-teal-400">{prog.wage}</p>
                  </div>
                  <div className="rounded-lg p-3.5 bg-theme-surface/50 border border-theme-subtle text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-1">Market Position</p>
                    <p className="text-sm font-bold text-theme-primary">{prog.competitiveLandscape}</p>
                  </div>
                </div>

                <p className="text-sm text-theme-secondary leading-relaxed mb-4">{prog.rationale}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {prog.employers.map((emp) => (
                    <span key={emp} className="text-[11px] px-2.5 py-1 rounded-full bg-theme-surface border border-theme-subtle text-theme-secondary">
                      {emp}
                    </span>
                  ))}
                </div>

                {prog.note && (
                  <p className="text-xs italic text-purple-600 dark:text-purple-400 mt-2">💡 {prog.note}</p>
                )}
              </div>
            ))}
          </StaggerChildren>

          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="mt-8 rounded-xl p-5 bg-purple-500/5 border border-purple-500/15 text-center">
              <p className="text-sm text-theme-secondary">
                <span className="font-semibold text-theme-primary">Want a deeper analysis of these opportunities?</span>{' '}
                A{' '}
                <Link href="/opportunity-scan" className="text-purple-600 dark:text-purple-400 underline underline-offset-2 hover:text-purple-500">
                  Program Opportunity Scan ($1,500)
                </Link>{' '}
                delivers a full scored and ranked analysis of every program opportunity in your region — including demand modeling, competitive positioning, and launch roadmaps.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ G. CREDENTIAL STACKING ═══════════ */}
      <section className="relative py-16 md:py-24 bg-theme-surface/30 print:py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Section G · Credential Stacking Assessment</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                Non-Credit → Credit Pathway Analysis
              </h2>
              <p className="mt-3 text-theme-secondary max-w-xl mx-auto text-sm">
                Only 9 of 47 programs (19%) have a documented non-credit → credit pathway. 27 programs are credential dead-ends with no stackable structure.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Summary Stat Row */}
          <AnimateOnScroll variant="fade-up" delay={80}>
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              <div className="card-cosmic rounded-xl p-5 text-center">
                <p className="text-3xl font-bold font-mono text-teal-500 mb-1">9</p>
                <p className="text-xs text-theme-muted uppercase tracking-widest font-bold">Clear Pathways</p>
                <p className="text-xs text-theme-tertiary mt-1">Non-credit on-ramp exists</p>
              </div>
              <div className="card-cosmic rounded-xl p-5 text-center">
                <p className="text-3xl font-bold font-mono text-amber-500 mb-1">11</p>
                <p className="text-xs text-theme-muted uppercase tracking-widest font-bold">Partial Pathways</p>
                <p className="text-xs text-theme-tertiary mt-1">Entry exists but no upward stack</p>
              </div>
              <div className="card-cosmic rounded-xl p-5 text-center">
                <p className="text-3xl font-bold font-mono text-rose-500 mb-1">27</p>
                <p className="text-xs text-theme-muted uppercase tracking-widest font-bold">Dead Ends</p>
                <p className="text-xs text-theme-tertiary mt-1">No documented pathway above or below</p>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Stacking Table */}
          <StaggerChildren stagger={80} variant="fade-up" className="space-y-4">
            {credentialStacking.map((item, i) => (
              <div key={i} className="card-cosmic rounded-xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <AlignmentDot level={item.pathwayQuality} />
                    <h3 className="font-semibold text-theme-primary text-[15px]">{item.program}</h3>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    item.pathwayQuality === 'strong'
                      ? 'bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400'
                      : item.pathwayQuality === 'moderate'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400'
                      : item.pathwayQuality === 'weak'
                      ? 'bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400'
                  }`}>
                    {item.pathwayQuality === 'strong' ? 'Clear Pathway' : item.pathwayQuality === 'moderate' ? 'Partial Pathway' : item.pathwayQuality === 'weak' ? 'Partial Pathway' : 'Dead End'}
                  </span>
                </div>

                <p className="text-xs text-theme-secondary mb-2">
                  <span className="font-semibold text-theme-muted">Current pathway:</span> {item.pathway}
                </p>
                {item.gaps && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mb-2">
                    <span className="font-semibold">Gap:</span> {item.gaps}
                  </p>
                )}
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  <span className="font-semibold">Recommendation:</span> {item.recommendation}
                </p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════ H. PRIORITY MATRIX ═══════════ */}
      <section className="relative py-16 md:py-24 print:py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Section H · Recommended Actions</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                Priority Action Matrix
              </h2>
              <p className="mt-3 text-theme-secondary max-w-xl mx-auto text-sm">
                Organized by implementation timeline. Quick wins require minimal resources and can begin immediately.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            {priorityActions.map((tier) => (
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
                        <p className="text-[10px] text-theme-muted">Owner: {action.owner}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ I. METHODOLOGY ═══════════ */}
      <section className="relative py-16 md:py-20 bg-theme-surface/30 print:py-10">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline block text-center mb-3">Section I · Methodology</span>
            <h2
              className="font-heading font-bold text-theme-primary text-center mb-10"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              Data Sources & Audit Framework
            </h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 gap-6">
            <AnimateOnScroll variant="fade-up" delay={80}>
              <div className="card-cosmic rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-4">
                  Primary Data Sources
                </p>
                <ul className="space-y-3">
                  {[
                    { source: 'BLS OES', desc: 'Occupational Employment & Wage Statistics — SOC-level wage and employment data for Iowa and Cedar Valley MSA (Waterloo-Cedar Falls)' },
                    { source: 'O*NET 28.3', desc: 'Task-level occupational content aligned to each program; competency gap scoring vs. program outcomes' },
                    { source: 'Employer Job Postings', desc: 'Live postings from John Deere, Tyson, UnityPoint, CUNA Mutual, Viking Pump, CBE Companies — analyzed for required skills and credentials' },
                    { source: 'IPEDS', desc: 'Integrated Postsecondary Education Data System — enrollment, completion, and award data for Hawkeye and regional competitors' },
                    { source: 'Iowa ICSPS', desc: 'Iowa Community College Student Performance and Success — completion benchmarks, pathway tracking, credential outcomes' },
                    { source: 'Accreditor Records', desc: 'AWS SENSE, ACEN (nursing), CAPTE (PTA) — accreditation currency and standards compliance review' },
                  ].map((item) => (
                    <li key={item.source} className="flex items-start gap-3">
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 pt-0.5 flex-shrink-0 w-20">{item.source}</span>
                      <span className="text-[12px] text-theme-secondary leading-snug">{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fade-up" delay={160}>
              <div className="card-cosmic rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-4">
                  Audit Framework
                </p>
                <ul className="space-y-3">
                  {[
                    { step: 'Catalog Ingestion', desc: 'All published programs, learning outcomes, and credential types extracted and normalized to CIP code classification.' },
                    { step: 'Demand Mapping', desc: 'Each program matched to BLS SOC codes; regional employment, growth, and wage data pulled for the Waterloo-Cedar Falls MSA.' },
                    { step: 'O*NET Alignment', desc: 'Current O*NET task data compared against published program learning outcomes — gap score = % of top-20 tasks absent from outcomes.' },
                    { step: 'Posting Analysis', desc: 'Employer job postings for matched occupations analyzed for skill requirements not reflected in program outcomes.' },
                    { step: 'Enrollment Trend', desc: '3-year IPEDS enrollment by program — programs with >20% decline flagged for further review.' },
                    { step: 'Pathway Audit', desc: 'Each program reviewed for documented non-credit entry points and post-credential stacking options against Iowa ICSPS framework.' },
                    { step: 'Compliance Check', desc: 'Accreditor standards cross-referenced against curriculum review dates; compliance gaps flagged.' },
                  ].map((item) => (
                    <li key={item.step} className="flex items-start gap-3">
                      <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 pt-0.5 flex-shrink-0 w-24">{item.step}</span>
                      <span className="text-[12px] text-theme-secondary leading-snug">{item.desc}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 pt-4 border-t border-theme-subtle">
                  <p className="text-[11px] text-theme-muted italic leading-relaxed">
                    ⚠️ <strong>Disclaimer:</strong> Enrollment estimates and financial projections in Section F are illustrative and based on regional benchmarks. They should be validated against institutional data before informing budget decisions.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════ J. CTA ═══════════ */}
      <section className="relative py-20 md:py-28 print:hidden">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Get Your Audit</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              What would a Program Gap Audit reveal about your catalog?
            </h2>
            <p className="mt-4 text-theme-secondary text-lg leading-relaxed">
              Know exactly where your portfolio has fallen behind regional demand — and which gaps are worth filling first.
              Delivered in 48 hours. No fluff.
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
                  Order a Program Gap Audit
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
              Includes: catalog scan, market alignment analysis, curriculum currency review, credential stacking assessment, and prioritized action matrix.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

    </div>
  );
}
