import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { PrintButton } from '@/components/ui/PrintButton';

export const metadata: Metadata = {
  title: 'Program Validation — Kirkwood Community College | Wavelength Sample Report',
  description:
    'Sample Program Validation report for Kirkwood Community College Pharmacy Technician Certificate. CONDITIONAL GO — 6.0/10 composite score with 7 specialist analyses.',
  alternates: { canonical: 'https://withwavelength.com/report/kirkwood-pharmtech-validation' },
  openGraph: {
    title: 'Program Validation — Kirkwood Community College Pharmacy Technician Certificate',
    description:
      'CONDITIONAL GO: 6.0/10 composite. Full 7-dimension validation with specialist analyses, financial projections, and conditional recommendations.',
    url: 'https://withwavelength.com/report/kirkwood-pharmtech-validation',
    type: 'article',
  },
};

// ─── Score color helpers ──────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 7.5) return 'text-teal-600 dark:text-teal-400';
  if (score >= 5.0) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

function scoreBg(score: number) {
  if (score >= 7.5) return 'bg-teal-500';
  if (score >= 5.0) return 'bg-amber-500';
  return 'bg-rose-500';
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    'CRITICAL FLAG': 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
    CAUTION: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
    PASS: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20',
    STRONG: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20',
    'CONDITIONAL GO': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
  };
  return map[status] ?? 'bg-theme-surface text-theme-secondary border border-theme-subtle';
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const dimensions = [
  { name: 'Labor Market Demand', weight: 25, score: 3.0, status: 'CRITICAL FLAG' },
  { name: 'Financial Viability', weight: 20, score: 6.0, status: 'CAUTION' },
  { name: 'Target Learner Demand', weight: 15, score: 7.2, status: 'PASS' },
  { name: 'Employer Demand', weight: 15, score: 8.0, status: 'STRONG' },
  { name: 'Competitive Landscape', weight: 10, score: 6.0, status: 'CAUTION' },
  { name: 'Institutional Fit', weight: 10, score: 7.8, status: 'PASS' },
  { name: 'Regulatory & Compliance', weight: 5, score: 8.5, status: 'STRONG' },
];

const conditions = [
  {
    num: 1,
    title: 'Clinical Site Partnership Validation',
    deadline: '60-day deadline',
    text: 'Secure signed Memorandums of Understanding (MOUs) with a minimum of 6 clinical rotation sites within the Cedar Rapids–Iowa City corridor. Sites must include at least 2 hospital pharmacies, 2 retail pharmacies, and 1 long-term care facility. Without confirmed clinical placements, the program cannot meet ASHP accreditation requirements or deliver the required experiential hours. No capital expenditure should be approved until all 6 MOUs are executed.',
  },
  {
    num: 2,
    title: 'Grant Funding Secured ($40K minimum)',
    deadline: '$40,000 minimum',
    text: 'Submit application to the Iowa Workforce Development Apprenticeship Innovation Grant by the next funding cycle. The $40K minimum covers first-cohort equipment, supplies, and adjunct faculty costs that the tuition model alone cannot support at initial enrollment levels. Alternative funding sources include Iowa Skilled Worker and Job Creation Fund and potential employer-sponsored training agreements with UnityPoint Health and Hy-Vee pharmacy operations.',
  },
  {
    num: 3,
    title: 'Market Demand Validation',
    deadline: '30-day sprint',
    text: 'Conduct a structured employer demand survey targeting a minimum of 10 pharmacy employers within a 60-mile radius of Cedar Rapids. Survey must capture: current pharmacy technician vacancies, projected hiring over 24 months, willingness to host clinical rotations, and interest in tuition reimbursement partnerships. The current labor market data gap is the single largest risk factor in this validation — this sprint closes that gap.',
  },
  {
    num: 4,
    title: 'Competitive Intelligence Deep Dive',
    deadline: 'Before cohort planning',
    text: 'Initiate direct conversations with program directors at DMACC (Des Moines) and Hawkeye Community College (Waterloo) to understand their enrollment trends, clinical site networks, and capacity constraints. Competitive intelligence from public sources suggests moderate saturation, but direct intel is required to identify differentiation opportunities — particularly around evening/weekend scheduling, employer partnerships, and stackable credentials.',
  },
  {
    num: 5,
    title: 'Pilot Cohort First',
    deadline: 'One cohort before scaling',
    text: 'Launch with a single pilot cohort of 12–15 students before committing to recurring program infrastructure. Pilot cohort validates clinical site capacity, faculty workload, equipment adequacy, and actual (not projected) completion rates. Scaling to 2+ cohorts per year should only occur after pilot cohort data confirms the financial model assumptions. This protects institutional resources and limits downside exposure.',
  },
];

const findings = [
  {
    num: 1,
    title: 'Solid Employer Demand, Weak Labor Market Data',
    text: 'Employer interviews and job posting analysis confirm consistent pharmacy technician hiring across the Cedar Rapids–Iowa City corridor. UnityPoint Health, Mercy Medical Center, Hy-Vee, and CVS all report ongoing recruitment challenges. However, Bureau of Labor Statistics data for the Cedar Rapids MSA shows flat-to-declining growth projections for pharmacy technicians (SOC 29-2052), and Iowa Workforce Development regional data contains significant gaps. The disconnect between employer-reported demand and published labor market data is the primary driver of the low Labor Market Demand score (3.0/10). This doesn\'t necessarily mean demand is weak — it means we can\'t verify it with public data, which is a diligence problem.',
  },
  {
    num: 2,
    title: 'Financial Viability Hinges on Unvalidated Clinical Site Assumption',
    text: 'The 5-year financial model projects break-even by cohort 3 (month 18) with a steady-state margin of 22–28% by year 3. These projections assume zero cost for clinical rotation placements — a standard assumption for pharmacy technician programs, but one that has not been validated with local sites. If even 2 of 6 required clinical sites demand payment for preceptor time or administrative overhead, the margin drops to 8–12% and break-even extends to month 30+. The model is sound if the clinical site assumption holds. If it doesn\'t, the program becomes a marginal financial performer.',
  },
  {
    num: 3,
    title: 'Crowded Competitive Market Requires Clear Differentiation',
    text: 'Within a 90-mile radius, three institutions offer pharmacy technician programs: DMACC (Des Moines), Hawkeye Community College (Waterloo), and Indian Hills Community College (Ottumwa). Additionally, national online programs from Ashworth College and Penn Foster compete for the same learner demographic. Kirkwood\'s competitive advantage lies in geographic proximity (Cedar Rapids has no local provider), employer relationships, and potential evening/weekend scheduling. However, without deliberate differentiation in marketing and program design, enrollment could underperform projections.',
  },
  {
    num: 4,
    title: 'Strong Institutional Fit with Moderate Capacity Constraints',
    text: 'Kirkwood\'s existing Health Sciences division, established clinical partnerships, and workforce training infrastructure provide a strong foundation for a pharmacy technician program. The institution has experience launching similar allied health certificates and has administrative systems in place for clinical coordination. Capacity constraints are moderate: the program requires a dedicated pharmacy lab space (estimated $35K buildout), a licensed pharmacist as program director (CPhT or RPh), and adjunct faculty with pharmacy practice experience. These are manageable but represent real hiring and capital requirements.',
  },
  {
    num: 5,
    title: 'Regulatory Environment Clear but Accreditation Timeline Constraining',
    text: 'Iowa Board of Pharmacy requirements for pharmacy technician education are well-defined, and Kirkwood\'s institutional accreditation through HLC provides a solid foundation. ASHP/ACPE programmatic accreditation is achievable but requires 18–24 months from application to approval, meaning the first cohort would launch under "candidate" status. This is standard practice but creates a marketing challenge — prospective students may prefer ASHP-accredited programs. The regulatory path is clear; the timeline is the constraint.',
  },
];

const dimensionDeepDives = [
  {
    name: 'Labor Market Demand',
    score: 3.0,
    weight: '25%',
    status: 'CRITICAL FLAG',
    dotColor: 'bg-rose-500',
    rationale: 'Bureau of Labor Statistics projects 5% growth for pharmacy technicians nationally (2022–2032), roughly average for all occupations. However, Cedar Rapids MSA-specific data from Iowa Workforce Development shows flat employment projections and limited posted openings. The disconnect between national trends and local data creates a critical information gap. O*NET data confirms stable but not growing demand. The 3.0 score reflects not necessarily weak demand, but unacceptably weak evidence of demand. The override rule was triggered because any dimension scoring below 4.0 with 20%+ weight requires explicit conditions before program approval. Recommendation: conduct the 30-day employer demand sprint to generate primary data that either confirms or contradicts published statistics.',
  },
  {
    name: 'Financial Viability',
    score: 6.0,
    weight: '20%',
    status: 'CAUTION',
    dotColor: 'bg-amber-500',
    rationale: 'The tuition-based revenue model projects $2,800–3,200 per student for a 16-week certificate program. At 15 students per cohort and 2 cohorts per year, annual revenue reaches $84K–96K by year 2. Operating costs (faculty, supplies, lab maintenance, clinical coordination) are estimated at $65K–75K annually at steady state. The model works at scale but is fragile in year 1 when fixed costs are front-loaded against a single pilot cohort. The $40K grant funding condition exists specifically to bridge this gap. The zero-cost clinical site assumption is the model\'s single point of failure — if sites charge $2K–5K per rotation slot, the math changes materially.',
  },
  {
    name: 'Target Learner Demand',
    score: 7.2,
    weight: '15%',
    status: 'PASS',
    dotColor: 'bg-teal-500',
    rationale: 'Cedar Rapids lacks a local pharmacy technician program, forcing interested learners to commute to Waterloo (Hawkeye, 65 miles) or Des Moines (DMACC, 130 miles) or pursue online alternatives. Geographic search analysis shows consistent interest in "pharmacy technician program near me" and "pharmacy tech certification Iowa" from the Cedar Rapids–Iowa City area. Kirkwood\'s existing health sciences student pipeline and community awareness provide built-in enrollment channels. The 7.2 score reflects solid learner interest tempered by the availability of low-cost online alternatives that could capture price-sensitive learners.',
  },
  {
    name: 'Employer Demand',
    score: 8.0,
    weight: '15%',
    status: 'STRONG',
    dotColor: 'bg-teal-500',
    rationale: 'Direct employer signals are the strongest dimension in this validation. UnityPoint Health–St. Luke\'s Hospital, Mercy Medical Center, and the University of Iowa Hospitals (Iowa City) all maintain recurring pharmacy technician job postings. Retail pharmacy employers (Hy-Vee, CVS, Walgreens) have multiple Cedar Rapids locations with consistent technician turnover. Indeed and LinkedIn job posting analysis shows 15–25 active pharmacy technician postings within 30 miles of Cedar Rapids at any given time. Employer willingness to participate in clinical rotations and potential tuition reimbursement partnerships further strengthen this dimension.',
  },
  {
    name: 'Competitive Landscape',
    score: 6.0,
    weight: '10%',
    status: 'CAUTION',
    dotColor: 'bg-amber-500',
    rationale: 'The competitive environment is moderately crowded. DMACC and Hawkeye both offer established pharmacy technician programs with ASHP accreditation and clinical site networks. Indian Hills serves southern Iowa but could capture some eastern Iowa learners. Online programs (Ashworth, Penn Foster) offer lower price points ($800–1,500 vs. Kirkwood\'s projected $2,800–3,200). Kirkwood\'s advantages: only local option in Cedar Rapids, institutional reputation, potential employer partnerships, and evening/weekend scheduling flexibility. The 6.0 score reflects a viable competitive position that requires deliberate differentiation to succeed.',
  },
  {
    name: 'Institutional Fit',
    score: 7.8,
    weight: '10%',
    status: 'PASS',
    dotColor: 'bg-teal-500',
    rationale: 'Kirkwood\'s Health Sciences division has successfully launched and operates multiple allied health certificate programs (CNA, Medical Assistant, Phlebotomy). Administrative infrastructure for clinical coordination, student tracking, and employer partnerships exists and is proven. The pharmacy technician program fits naturally within this division and can leverage existing enrollment marketing, student support services, and clinical site relationships. Capacity constraints (dedicated lab space, specialized faculty) are real but manageable. The 7.8 score reflects strong institutional alignment with moderate resource requirements.',
  },
  {
    name: 'Regulatory & Compliance',
    score: 8.5,
    weight: '5%',
    status: 'STRONG',
    dotColor: 'bg-teal-500',
    rationale: 'Iowa Board of Pharmacy regulations for pharmacy technician education are well-documented and stable. Kirkwood\'s HLC institutional accreditation is current and in good standing. ASHP/ACPE programmatic accreditation requirements are clear, and Kirkwood\'s existing accreditation infrastructure can support the application process. Workforce Pell eligibility (effective July 1, 2026) is achievable if the program meets clock-hour and credential requirements — which the proposed program design satisfies. The 8.5 score reflects a clear regulatory path with a manageable but non-trivial accreditation timeline.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KirkwoodPharmTechValidationPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* ===== A. HERO ===== */}
      <section className="relative min-h-[55vh] flex items-center justify-center pt-36 lg:pt-40 pb-16">
        <Stars count={100} />
        <Aurora className="opacity-75" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">Program Validation · Sample Report</span>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="font-heading font-bold text-gradient-cosmic leading-[1.05] mx-auto max-w-3xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4rem)' }}
            >
              Kirkwood Community College
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200} duration={800}>
            <p className="mt-4 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed">
              Pharmacy Technician Certificate · Cedar Rapids, Iowa · February 2026
            </p>
          </AnimateOnScroll>

          {/* Verdict Banner */}
          <AnimateOnScroll variant="fade-up" delay={300} duration={800}>
            <div className="mt-8 inline-block bg-amber-500/10 border border-amber-500/30 rounded-2xl px-8 py-4">
              <p className="text-amber-700 dark:text-amber-400 font-heading font-bold text-2xl md:text-3xl">
                CONDITIONAL GO
              </p>
              <p className="text-sm text-theme-secondary mt-1">
                6.0 / 10 composite · 7 specialist analyses · Medium confidence
              </p>
            </div>
          </AnimateOnScroll>

          {/* Stat Pills */}
          <AnimateOnScroll variant="fade-up" delay={400} duration={800}>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                7 Analysts
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                6.0 Composite
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                8.0 Employer Demand
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                3.0 Labor Market ⚠
              </span>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={500} duration={800}>
            <div className="mt-6">
              <PrintButton />
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={600} duration={800}>
            <p className="mt-6 text-xs text-theme-muted max-w-lg mx-auto">
              This is a sample report created for demonstration purposes. All data, analyses, and
              recommendations are illustrative of Wavelength&apos;s Program Validation methodology.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== B. VALIDATION SCORECARD ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[800px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Validation Scorecard</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Seven dimensions. One verdict.
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="mt-10 card-cosmic rounded-2xl overflow-hidden">
              {dimensions.map((d, i) => (
                <div
                  key={d.name}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    i < dimensions.length - 1 ? 'border-b border-theme-subtle' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-theme-primary truncate">{d.name}</p>
                    <p className="text-xs text-theme-muted">{d.weight}% weight</p>
                  </div>
                  <div className="w-24 sm:w-32">
                    <div className="h-1.5 rounded-full bg-theme-surface overflow-hidden">
                      <div
                        className={`h-full rounded-full ${scoreBg(d.score)}`}
                        style={{ width: `${(d.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-lg font-bold font-mono w-10 text-right ${scoreColor(d.score)}`}>
                    {d.score}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${statusBadge(d.status)}`}
                  >
                    {d.status}
                  </span>
                </div>
              ))}

              {/* Composite row */}
              <div className="flex items-center gap-4 px-5 py-5 bg-amber-500/5 border-t-2 border-amber-500/30">
                <div className="flex-1">
                  <p className="text-base font-heading font-bold text-theme-primary">COMPOSITE</p>
                  <p className="text-xs text-theme-muted">100% weight</p>
                </div>
                <div className="w-24 sm:w-32">
                  <div className="h-1.5 rounded-full bg-theme-surface overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: '60%' }}
                    />
                  </div>
                </div>
                <span className="text-xl font-bold font-mono w-10 text-right text-amber-600 dark:text-amber-400">
                  6.0
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  CONDITIONAL GO
                </span>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Override callout */}
          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="mt-6 card-cosmic rounded-xl p-5 border-amber-500/30 bg-amber-500/5">
              <p className="text-sm text-theme-primary leading-relaxed">
                <span className="font-bold">⚠️ Override Applied:</span> Labor Market Demand scored
                3/10 — critical data gaps identified. Override applied: program requires market
                validation before capital commitment.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== C. EXECUTIVE SUMMARY ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[860px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Executive Summary</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Strategically sound. Operationally precarious.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="mt-8 space-y-6">
            <div className="card-cosmic rounded-2xl p-6">
              <p className="text-theme-secondary leading-relaxed">
                The Pharmacy Technician Certificate presents a strategically sound but operationally
                precarious opportunity for Kirkwood Community College. Cedar Rapids is the largest
                metro in Iowa without a local pharmacy technician training program, creating genuine
                geographic demand. Employer signals are strong: UnityPoint Health, Mercy Medical
                Center, Hy-Vee, and CVS all maintain active pharmacy technician job postings, and
                initial employer conversations indicate willingness to support clinical rotations and
                hiring pipelines. The program aligns with Kirkwood&apos;s existing Health Sciences
                division, leverages proven administrative infrastructure, and fits within the
                institution&apos;s workforce development mission. At a composite score of 6.0/10, this
                program is viable — but it is not a slam dunk.
              </p>
            </div>
            <div className="card-cosmic rounded-2xl p-6">
              <p className="text-theme-secondary leading-relaxed">
                However, critical execution risks threaten viability. The business model assumes
                zero-cost clinical placements at a minimum of 6 sites — an assumption that has not
                been validated with a single local pharmacy or hospital. If clinical sites demand
                compensation for preceptor time, the financial model degrades from a healthy 22–28%
                margin to a precarious 8–12% margin, pushing break-even from month 18 to month 30 or
                beyond. The competitive landscape is more crowded than initial assessment suggested:
                DMACC, Hawkeye, Indian Hills, and multiple national online programs all compete for the
                same learner demographic. Kirkwood&apos;s geographic advantage is real but insufficient
                without deliberate differentiation in scheduling, employer partnerships, and credential
                stacking.
              </p>
            </div>
            <div className="card-cosmic rounded-2xl p-6">
              <p className="text-theme-secondary leading-relaxed">
                The labor market data gap is alarming. While employers report hiring demand, published
                BLS and Iowa Workforce Development data for the Cedar Rapids MSA shows flat-to-declining
                pharmacy technician employment projections. This could mean the published data is
                lagging reality — or it could mean employer-reported demand is inflated by normal
                turnover rather than genuine growth. We don&apos;t know, and that&apos;s the problem.
                A program launch decision involving $35K+ in lab buildout, faculty recruitment, and
                ASHP accreditation fees deserves better evidence than &ldquo;employers say they&apos;re
                hiring.&rdquo; This isn&apos;t acceptable diligence for a program launch decision. The
                five conditions attached to this CONDITIONAL GO exist specifically to close these gaps
                before irreversible commitments are made.
              </p>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ===== D. CONDITIONS FOR APPROVAL ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[860px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Conditions for Approval</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              This program can proceed — with five non-negotiable conditions.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="mt-10 space-y-5">
            {conditions.map((c) => (
              <div key={c.num} className="card-cosmic p-5 rounded-xl">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-400">
                    {c.num}
                  </span>
                  <div className="flex-1">
                    <p className="font-heading font-bold text-theme-primary">{c.title}</p>
                    <p className="font-mono text-gradient-cosmic text-sm mt-0.5">{c.deadline}</p>
                    <p className="mt-3 text-sm text-theme-secondary leading-relaxed">{c.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== E. KEY FINDINGS ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Key Findings</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              What the analysis uncovered.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="mt-10 space-y-5">
            {findings.map((f) => (
              <div key={f.num} className="card-cosmic rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-400">
                    {f.num}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-theme-primary text-lg">{f.title}</h3>
                    <p className="mt-3 text-sm text-theme-secondary leading-relaxed">{f.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== F. SPECIALIST PERSPECTIVES ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[960px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Specialist Perspectives</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Three independent analysts. Three honest assessments.
            </h2>
            <p className="mt-3 text-theme-secondary text-lg">
              Each specialist runs independent analysis — no consensus bias.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="mt-10 space-y-8">
            {/* Card 1 — Marcus Chen */}
            <div className="card-cosmic rounded-2xl p-8">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <h3 className="font-heading font-bold text-theme-primary text-xl">Marcus Chen</h3>
                <span className="text-sm text-theme-muted">Product Manager</span>
                <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  CONDITIONAL PASS · 6.5/10
                </span>
              </div>

              <div className="space-y-4 text-sm text-theme-secondary leading-relaxed">
                <div>
                  <p className="font-bold text-theme-primary mb-1">What Works</p>
                  <p>
                    The geographic gap is real and defensible — Cedar Rapids genuinely lacks a local
                    pharmacy tech program, and that matters for a learner demographic that skews toward
                    working adults who can&apos;t commute 65+ miles. Kirkwood&apos;s Health Sciences
                    infrastructure is proven, and the employer signals I&apos;m seeing (UnityPoint, Mercy,
                    Hy-Vee) are credible. The program design — 16 weeks, stackable into a health sciences
                    pathway — fits the market. This is a program that makes strategic sense.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-theme-primary mb-1">What Concerns Me</p>
                  <p>
                    The labor market data gap is a problem I can&apos;t ignore. I&apos;ve seen programs
                    launch on employer enthusiasm alone, and when the actual enrollment numbers come in,
                    they&apos;re 40–60% below projections because the market was smaller than anecdotal
                    evidence suggested. The competitive landscape is also more crowded than I&apos;d like —
                    DMACC and Hawkeye are established, and online programs are eating into the
                    price-sensitive segment. The clinical site assumption is a single point of failure that
                    could unravel the entire financial model.
                  </p>
                </div>
                <div className="border-l-2 border-purple-500/30 pl-4 italic text-theme-tertiary">
                  <p className="font-bold text-theme-primary not-italic mb-1">My Recommendation</p>
                  <p>
                    Proceed with the pilot cohort approach, but do not commit capital to lab buildout
                    until the 30-day employer demand sprint and clinical site MOUs are complete. If
                    both conditions are met, this becomes a 7.5+ program. If either fails, downgrade
                    to NO-GO.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 — Marcus Reinholt */}
            <div className="card-cosmic rounded-2xl p-8">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <h3 className="font-heading font-bold text-theme-primary text-xl">Marcus Reinholt</h3>
                <span className="text-sm text-theme-muted">CFO</span>
                <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  YELLOW LIGHT · 5.5/10
                </span>
              </div>

              <div className="space-y-4 text-sm text-theme-secondary leading-relaxed">
                <div>
                  <p className="font-bold text-theme-primary mb-1">Numbers That Work</p>
                  <p>
                    At steady state (2 cohorts/year, 15 students each), the program generates $84K–96K
                    in annual tuition revenue against $65K–75K in operating costs. That&apos;s a 22–28%
                    margin — respectable for a certificate program and competitive with Kirkwood&apos;s
                    existing allied health portfolio. The stackable credential pathway creates upsell
                    potential that could add 15–20% revenue from continuing students. If everything
                    works as modeled, this is a solid program financially.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-theme-primary mb-1">Numbers That Terrify Me</p>
                  <p>
                    The $35K lab buildout is a sunk cost before the first student enrolls. Faculty
                    recruitment for a licensed pharmacist program director will cost $55K–65K annually —
                    and that position must be filled 6+ months before launch for ASHP accreditation
                    purposes. If clinical sites demand even modest compensation ($2K–5K per rotation
                    slot), the margin drops to 8–12% and break-even extends from month 18 to month 30+.
                    The year 1 cash flow is negative under every scenario — the question is how negative
                    and for how long.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-theme-primary mb-1">What I Need Before Approving</p>
                  <ul className="mt-2 space-y-1.5 list-none">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">☐</span>
                      Written confirmation from 4+ clinical sites that rotations are zero-cost
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">☐</span>
                      Grant funding commitment of $40K+ to bridge year 1 cash gap
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">☐</span>
                      Employer demand survey showing 10+ employers with active hiring needs
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">☐</span>
                      Competitive pricing analysis vs. DMACC, Hawkeye, and online alternatives
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">☐</span>
                      Pilot cohort agreement limiting institutional exposure to one cohort before scaling
                    </li>
                  </ul>
                </div>
                <div className="border-l-2 border-purple-500/30 pl-4 italic text-theme-tertiary">
                  <p className="font-bold text-theme-primary not-italic mb-1">My Recommendation</p>
                  <p>
                    I won&apos;t approve capital expenditure until the clinical site and grant funding
                    conditions are met. The financial model is viable but fragile — one broken assumption
                    turns this from a contributor into a drag on division resources. Pilot first, validate
                    assumptions, then scale. This is a yellow light, not a green one.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 — Valentina Rojas-Medina */}
            <div className="card-cosmic rounded-2xl p-8">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <h3 className="font-heading font-bold text-theme-primary text-xl">
                  Valentina Rojas-Medina
                </h3>
                <span className="text-sm text-theme-muted">CMO</span>
                <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                  CAUTIOUS OPTIMISM · 6.5/10
                </span>
              </div>

              <div className="space-y-4 text-sm text-theme-secondary leading-relaxed">
                <div>
                  <p className="font-bold text-theme-primary mb-1">What&apos;s Working</p>
                  <p>
                    The &ldquo;only local option&rdquo; positioning is powerful — it&apos;s the kind of
                    message that writes its own marketing. &ldquo;Why drive to Des Moines when you can
                    train in Cedar Rapids?&rdquo; Geographic convenience combined with Kirkwood&apos;s
                    brand equity in the corridor gives us a strong enrollment marketing foundation.
                    Employer partnerships (if secured) create co-marketing opportunities: &ldquo;Train
                    here, get hired there&rdquo; with named employers is the most effective enrollment
                    driver in workforce education. The health sciences pipeline gives us a warm audience
                    of students already considering allied health careers.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-theme-primary mb-1">What&apos;s Working Against Us</p>
                  <p>
                    Online programs are the invisible competitor. Penn Foster and Ashworth offer pharmacy
                    tech certificates for $800–1,500 — less than half our projected price point. Our
                    value proposition must be clear and aggressive: hands-on clinical experience, employer
                    connections, ASHP accreditation pathway, and local support services that online
                    programs can&apos;t match. Without that differentiation, we lose the price-sensitive
                    segment entirely. The ASHP &ldquo;candidate&rdquo; status in year 1 is also a
                    marketing headwind — prospective students may not understand the difference between
                    candidate and accredited status, and competitors will exploit that ambiguity.
                  </p>
                </div>
                <div className="border-l-2 border-purple-500/30 pl-4 italic text-theme-tertiary">
                  <p className="font-bold text-theme-primary not-italic mb-1">My Recommendation</p>
                  <p>
                    Invest in the employer partnership narrative before launch — it&apos;s our strongest
                    differentiator and our best enrollment driver. Build the marketing around named
                    employers and guaranteed clinical placements, not around the credential alone. If we
                    can secure 3+ employer co-marketing commitments, I&apos;m confident we hit enrollment
                    targets. Without them, I&apos;d budget for 60% of projected enrollment in year 1.
                  </p>
                </div>
              </div>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ===== G. TOP RISKS ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[860px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Risk Register</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Three critical risks — with mitigation strategies.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="mt-10 space-y-6">
            {/* Risk 1 */}
            <div className="card-cosmic p-7 rounded-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h3 className="font-heading font-bold text-theme-primary text-lg">
                  Clinical Site Capacity Failure
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                  CRITICAL
                </span>
              </div>
              <div className="space-y-3 text-sm text-theme-secondary leading-relaxed">
                <p>
                  <span className="font-bold text-theme-primary">Impact:</span> Program cannot launch
                  or maintain ASHP accreditation without minimum 6 clinical rotation sites. Loss of
                  clinical capacity mid-cohort would force program suspension and student displacement.
                </p>
                <p>
                  <span className="font-bold text-theme-primary">Likelihood:</span> Medium-High. Clinical
                  site availability has not been validated, and competing programs at DMACC and Hawkeye
                  may already consume available capacity at regional pharmacies.
                </p>
                <div>
                  <span className="font-bold text-theme-primary">Mitigation:</span>
                  <ul className="mt-1.5 list-disc list-inside space-y-1 text-theme-secondary">
                    <li>Execute 60-day clinical site validation sprint with MOUs from 6+ sites</li>
                    <li>Diversify site types: hospital, retail, long-term care, specialty pharmacy</li>
                    <li>Establish backup relationships with 2–3 additional sites beyond the minimum 6</li>
                    <li>Negotiate multi-year agreements to prevent year-over-year capacity loss</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Risk 2 */}
            <div className="card-cosmic p-7 rounded-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h3 className="font-heading font-bold text-theme-primary text-lg">
                  Market Saturation and Enrollment Shortfall
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  HIGH
                </span>
              </div>
              <div className="space-y-3 text-sm text-theme-secondary leading-relaxed">
                <p>
                  <span className="font-bold text-theme-primary">Impact:</span> Enrollment below 10
                  students per cohort breaks the financial model. Below 8, the program operates at a
                  loss and becomes a drag on division resources.
                </p>
                <p>
                  <span className="font-bold text-theme-primary">Likelihood:</span> Medium. Three
                  in-state competitors and multiple online programs create a crowded market. Published
                  labor market data does not support strong growth projections for the Cedar Rapids MSA.
                </p>
                <div>
                  <span className="font-bold text-theme-primary">Mitigation:</span>
                  <ul className="mt-1.5 list-disc list-inside space-y-1 text-theme-secondary">
                    <li>Complete 30-day employer demand validation to confirm market size</li>
                    <li>Secure employer co-marketing commitments with named hiring partners</li>
                    <li>Differentiate on scheduling (evening/weekend), employer partnerships, and local convenience</li>
                    <li>Set minimum enrollment threshold (10 students) as launch/cancel trigger</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Risk 3 */}
            <div className="card-cosmic p-7 rounded-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h3 className="font-heading font-bold text-theme-primary text-lg">
                  Faculty Recruitment and Retention Failure
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                  MEDIUM
                </span>
              </div>
              <div className="space-y-3 text-sm text-theme-secondary leading-relaxed">
                <p>
                  <span className="font-bold text-theme-primary">Impact:</span> ASHP accreditation
                  requires a licensed pharmacist as program director. Inability to recruit or retain
                  qualified faculty delays launch and jeopardizes accreditation.
                </p>
                <p>
                  <span className="font-bold text-theme-primary">Likelihood:</span> Medium-Low.
                  Pharmacist salaries in clinical/retail settings ($120K–140K) exceed typical community
                  college program director compensation ($55K–65K). Recruitment may require creative
                  compensation structures.
                </p>
                <div>
                  <span className="font-bold text-theme-primary">Mitigation:</span>
                  <ul className="mt-1.5 list-disc list-inside space-y-1 text-theme-secondary">
                    <li>Target recently retired pharmacists or those seeking career transition to education</li>
                    <li>Offer hybrid compensation: base salary + per-cohort stipends + benefits package</li>
                    <li>Explore shared faculty arrangements with University of Iowa College of Pharmacy</li>
                    <li>Build adjunct faculty pool from local practicing pharmacists for specialized topics</li>
                  </ul>
                </div>
              </div>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ===== H. DIMENSION DEEP-DIVES ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[860px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Dimension Analysis</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Full scoring rationale — all 7 dimensions.
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="mt-10 card-cosmic rounded-2xl overflow-hidden divide-y divide-theme-subtle">
              {dimensionDeepDives.map((d) => (
                <details key={d.name} className="group">
                  <summary className="flex items-center justify-between cursor-pointer py-4 px-5 hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${d.dotColor} flex-shrink-0`} />
                      <span className="font-semibold text-theme-primary text-sm">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-theme-muted">{d.weight}</span>
                      <span className={`font-mono font-bold text-sm ${scoreColor(d.score)}`}>
                        {d.score}
                      </span>
                    </div>
                  </summary>
                  <div className="px-5 pb-5 pt-1">
                    <p className="text-sm text-theme-secondary leading-relaxed">{d.rationale}</p>
                  </div>
                </details>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== I. METHODOLOGY ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[760px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Methodology</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              7-Stage Program Validator Framework
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={60} variant="fade-up" className="mt-10 space-y-4">
            {[
              {
                title: 'Multi-Agent Analysis',
                text: '7 specialist AI agents — each analyzing independently from a different professional lens (product, finance, marketing, labor economics, competitive strategy, regulatory, institutional fit).',
              },
              {
                title: 'Weighted Scoring',
                text: 'Evidence-based scoring across 7 dimensions with predetermined weights reflecting real-world decision priorities. Labor market demand carries 25% weight; regulatory carries 5%.',
              },
              {
                title: 'Override Rules',
                text: 'Automatic safety checks for critical failures. Any dimension scoring below 4.0 with 20%+ weight triggers a mandatory override — converting GO to CONDITIONAL GO with specific remediation requirements.',
              },
              {
                title: 'Real Data Sources',
                text: 'BLS Occupational Employment Statistics, O*NET occupational profiles, SerpAPI competitive intelligence, state labor market information (Iowa Workforce Development), competitor program catalogs, and employer job posting analysis.',
              },
              {
                title: 'Conservative Methodology',
                text: 'All estimates favor caution. Revenue projections use low-end enrollment assumptions. Cost estimates include contingency buffers. Growth projections use BLS baseline, not optimistic scenarios.',
              },
            ].map((phase) => (
              <div key={phase.title} className="card-cosmic p-4 rounded-xl">
                <p className="font-heading font-bold text-theme-primary text-sm">{phase.title}</p>
                <p className="mt-1.5 text-xs text-theme-secondary leading-relaxed">{phase.text}</p>
              </div>
            ))}
          </StaggerChildren>

          <AnimateOnScroll variant="fade-up" delay={300}>
            <p className="mt-8 text-center text-sm text-theme-muted font-mono">
              7 agents · 25% labor market weight · 7-day delivery
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== J. CTA ===== */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 md:py-28">
        <Stars count={80} />
        <Aurora className="opacity-60" />

        <div className="relative z-10 max-w-[700px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Validate Your Program</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Get a GO / NO-GO on your program idea.
            </h2>
            <p className="mt-4 text-theme-secondary text-lg leading-relaxed">
              This validation was conducted for Kirkwood Community College&apos;s Pharmacy Technician
              program. Your Program Validation delivers the same 7-specialist analysis, financial
              projections, and conditional recommendations — tailored to your institution, your
              region, and your program.
            </p>
            <p className="mt-4 font-mono text-gradient-cosmic font-bold text-lg">
              $3,500 · Delivered within 5 business days
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/validate">
                <button className="btn-cosmic btn-cosmic-primary text-sm py-3 px-7">
                  Order a Program Validation
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
