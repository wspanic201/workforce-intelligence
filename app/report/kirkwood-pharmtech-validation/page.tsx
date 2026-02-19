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
    'Sample Program Validation report for Kirkwood Community College Pharmacy Technician Certificate. CONDITIONAL GO — 7.0/10 composite score with 7 specialist analyses.',
  alternates: { canonical: 'https://withwavelength.com/report/kirkwood-pharmtech-validation' },
  openGraph: {
    title: 'Program Validation — Kirkwood Community College Pharmacy Technician Certificate',
    description:
      'CONDITIONAL GO: 7.0/10 composite. Full 7-dimension validation with real BLS data, live job market analysis, and conditional recommendations.',
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

// ─── Data — sourced from live pipeline run 2026-02-19 ────────────────────────

const dimensions = [
  { name: 'Labor Market Demand', weight: 25, score: 6.5, status: 'CAUTION' },
  { name: 'Financial Viability', weight: 20, score: 7.0, status: 'PASS' },
  { name: 'Target Learner Demand', weight: 15, score: 7.2, status: 'PASS' },
  { name: 'Employer Demand & Partnerships', weight: 15, score: 7.5, status: 'STRONG' },
  { name: 'Competitive Landscape', weight: 10, score: 6.0, status: 'CAUTION' },
  { name: 'Institutional Fit & Capacity', weight: 10, score: 7.8, status: 'PASS' },
  { name: 'Regulatory & Compliance', weight: 5, score: 8.0, status: 'STRONG' },
];

const conditions = [
  {
    num: 1,
    title: 'Market Validation — Enrollment Intent Confirmation',
    deadline: '90-day deadline · CRITICAL',
    text: 'Conduct direct customer validation proving minimum 60 qualified prospects will commit to enrollment within 90 days of marketing launch at $4,800 tuition. Execute structured research including phone/online surveys with 75+ retail pharmacy workers, focus groups with 15–20 recent high school graduates exploring healthcare careers, and information sessions at Cedar Rapids and Iowa City public libraries. Success metric: minimum 60 interest forms or survey responses indicating "very likely" enrollment intent, converting to 15+ actual enrollments for Year 1 cohort (25% conversion rate).',
  },
  {
    num: 2,
    title: 'Clinical Site Partnerships — Guaranteed Rotation Capacity',
    deadline: '120-day deadline · CRITICAL',
    text: 'Secure signed MOUs with minimum six pharmacy clinical sites guaranteeing zero-cost placements for 36 students annually across diverse practice settings: two hospital inpatient pharmacies, two retail chains (CVS, Walgreens, Hy-Vee), one independent community pharmacy, and one specialty pharmacy. Each MOU must specify student capacity per rotation period, zero-cost agreement through Year 3, qualified preceptor availability, and preferential interview/hiring commitment for graduates. If fewer than six sites commit or capacity falls below 36 students annually, enrollment targets must be reduced to match confirmed capacity.',
  },
  {
    num: 3,
    title: 'Anchor Employer Partnerships — Sponsored Cohort Commitments',
    deadline: '120-day deadline · High Priority',
    text: 'Formalize partnerships with minimum two anchor employers committing to sponsor employees or guarantee graduate interviews. Targets: (1) UnityPoint Health Cedar Rapids — sponsor 4–6 incumbent pharmacy clerks/aides in Year 1–2 cohorts via tuition reimbursement; (2) One retail chain (Hy-Vee, Walgreens, or CVS) — guaranteed interviews for all graduates meeting minimum 3.0 GPA. Success metric: two signed agreements with aggregate commitment of 8 sponsored students or interview slots, de-risking 27–53% of Year 1 enrollment before open marketing begins.',
  },
];

const findings = [
  {
    num: 1,
    title: 'Live Employer Demand Confirmed: 10 Active Openings from Major Regional Employers',
    text: 'Google Jobs analysis (run February 19, 2026) identified 10 active pharmacy technician openings in the Cedar Rapids area from major employers: UnityPoint Health (3 openings), CVS Health entities (3 openings), Walgreens (2 openings), and specialty pharmacy operators (2 openings). This real-time data validates genuine employer hiring activity and provides a foundation for clinical partnership conversations. The employer demand dimension scored 7.5/10, reflecting strong multi-employer diversity with moderate concentration risk — UnityPoint Health accounts for 30% of identified postings.',
  },
  {
    num: 2,
    title: 'BLS Data: 487,920 Pharmacy Technicians Nationally, Median $36,920',
    text: 'Bureau of Labor Statistics data for SOC 29-2052 (Pharmacy Technicians, 2024) shows national employment of 487,920 with a median annual wage of $36,920. Iowa entry-level wages are estimated at $32,000–$36,000, advancing to $40,000–$60,000 with PTCB certification and specialty experience. This wage progression ($24,000–$28,000 for retail clerks to $32,000–$42,000 as certified pharmacy technicians) creates a compelling ROI narrative for the target learner segment — career changers and retail workers seeking healthcare entry points.',
  },
  {
    num: 3,
    title: 'Financial Model Sound — Break-Even at Month 22, 23.4% Three-Year ROI',
    text: 'Conservative financial projections show break-even in late Year 2 with 15 students per cohort. Net revenue over three years is estimated at $82,100 on $112,000 in startup costs (23.4% ROI). The primary risk is Year 1 enrollment: if the program enrolls 10 instead of 15 students, cumulative loss reaches $143,300 and break-even extends beyond Month 28. The model assumes zero-cost clinical placements — if sites charge $800–$1,200 per student (industry standard in capacity-constrained markets), annual costs increase $12,000–$18,000 and break-even extends 4–6 months.',
  },
  {
    num: 4,
    title: 'Competitive Market Requires Clear Differentiation — DMACC is Closest Competitor',
    text: 'DMACC operates 45 miles away in Ankeny with $3,500–$4,000 tuition (potentially 17–20% cheaper than Kirkwood\'s projected $4,800), multiple campus locations, and established brand recognition. Hawkeye Community College (Waterloo) and Indian Hills (Ottumwa) operate 90–110 miles away. Online programs Penn Foster ($1,079) and Ashworth College ($899–$1,200) provide self-paced alternatives at 75–80% lower cost. Kirkwood\'s defensible advantage is geographic proximity to Cedar Rapids, but it must be reinforced with deliberate differentiators: evening cohorts for incumbent workers, Spanish-language track, and named employer partnerships.',
  },
  {
    num: 5,
    title: 'Strong Regulatory Alignment — Perkins V + WIOA Eligibility Clear',
    text: 'The Pharmacy Technician Certificate aligns with CIP code 51.0805 and qualifies for Perkins V funding ($18,000–$28,000 annually), WIOA ETPL eligibility, and straightforward Iowa Board of Pharmacy registration (6–9 month timeline). PTCB certification exam pass rate is the key accreditation quality indicator. HLC compliance is managed as a non-substantive change. Regulatory dimension scored 8/10 — the strongest across all seven analyses. Grant funding availability meaningfully de-risks the Year 1 cash flow gap.',
  },
];

const dimensionDeepDives = [
  {
    name: 'Labor Market Demand',
    score: 6.5,
    weight: '25%',
    status: 'CAUTION',
    dotColor: 'bg-amber-500',
    rationale: 'Moderate demand with 10 current openings from major healthcare employers confirmed via live Google Jobs analysis. BLS data for SOC 29-2052 shows national employment of 487,920 and median wage of $36,920, with Iowa regional wages in the $32,000–$60,000 range. However, the pipeline flagged that some O*NET competency data returned anomalous technical skills (AWS, React) suggesting data retrieval issues — the analyst appropriately disregarded those entries and relied on standard pharmacy technician competency profiles. Score of 6.5 reflects genuine hiring activity tempered by wage compression and uncertainty around Cedar Rapids MSA-specific growth projections versus national trends.',
  },
  {
    name: 'Financial Viability',
    score: 7.0,
    weight: '20%',
    status: 'PASS',
    dotColor: 'bg-amber-500',
    rationale: 'Solid financial viability with manageable risk. Program breaks even in late Year 2 with conservative enrollment of 15 students per cohort. Perkins V funding ($18,000–$28,000 annually) and WIOA eligibility provide meaningful grant de-risking for the Year 1 cash gap. Healthcare workforce demand is strong across Iowa\'s healthcare corridor, and established Kirkwood clinical partnerships reduce site-acquisition costs. Primary risk is Year 1 enrollment — if it falls below 12 students, break-even extends 6–8 months. Lab equipment investment ($75,000–$125,000) is significant but one-time. Recommendation: phased launch with employer pre-commitments to de-risk enrollment before capital expenditure.',
  },
  {
    name: 'Target Learner Demand',
    score: 7.2,
    weight: '15%',
    status: 'PASS',
    dotColor: 'bg-amber-500',
    rationale: 'Moderate-to-strong learner demand based on: combined service area population of approximately 300,000 (Linn and Johnson counties) with demonstrated healthcare pathway interest; strong career-change motivation driven by stable employment and clear wage progression ($30,000–$40,000 entry from retail clerk wages); target demographics align well with community college mission (working adults, career changers, recent high school graduates); manageable barriers through hybrid delivery. Peer benchmarks from DMACC (18–22 per cohort), Hawkeye (15–18), and Scott Community College (14–20) validate realistic enrollment projections of 16 per cohort scaling to 36 annually by Year 3. Score held below 8.0 due to tuition cost barriers for lower-income segments, competition from incumbent employer-sponsored training (Walgreens/CVS), and need for sustained marketing investment.',
  },
  {
    name: 'Employer Demand & Partnerships',
    score: 7.5,
    weight: '15%',
    status: 'STRONG',
    dotColor: 'bg-teal-500',
    rationale: 'Strong multi-employer demand confirmed with live Google Jobs data: UnityPoint Health (3 openings), CVS Health entities (3 openings), Walgreens (2 openings), and specialty operators (2 openings) — 10 active openings total as of February 19, 2026. Employer mix spans hospital systems, retail pharmacy chains, and specialty settings, which reduces single-sector concentration risk. UnityPoint Health\'s 30% share of identified postings creates moderate dependency that is mitigated by retail chain breadth. Employer investment willingness is high: tuition reimbursement programs exist at UnityPoint and major retail chains, internship capacity is estimated at 30–40 placements annually, and guest instructor availability is strong. SerpAPI location fix applied this run — Cedar Rapids, Iowa query returned valid results vs. prior 400 error.',
  },
  {
    name: 'Competitive Landscape',
    score: 6.0,
    weight: '10%',
    status: 'CAUTION',
    dotColor: 'bg-amber-500',
    rationale: 'Moderate competition in Iowa market with several established programs. DMACC (Ankeny, 45 miles) is the primary in-state competitor with lower tuition ($3,500–$4,000 vs. projected $4,800), established ASHP accreditation, and multiple campus locations. Hawkeye Community College (Waterloo, 65 miles) and Indian Hills Community College (Ottumwa, 100+ miles) serve adjacent markets. Online programs Penn Foster ($1,079) and Ashworth College ($899–$1,200) compete aggressively on price for self-directed learners. Kirkwood\'s competitive advantages: geographic proximity as the only Cedar Rapids option, institutional employer relationships, evening/weekend scheduling potential, and Spanish-language track opportunity. Differentiation must be deliberate — geographic convenience alone is insufficient.',
  },
  {
    name: 'Institutional Fit & Capacity',
    score: 7.8,
    weight: '10%',
    status: 'PASS',
    dotColor: 'bg-teal-500',
    rationale: 'Kirkwood demonstrates strong institutional capacity for pharmacy technician program implementation. Existing Health Sciences division provides organizational knowledge from nursing, medical assisting, and phlebotomy programs. Clinical partnership infrastructure, student support systems, and employer relationships built over four decades provide structural advantages. Dedicated pharmacy lab setup requires capital investment ($75,000–$125,000), and recruiting licensed pharmacy technicians with teaching credentials is a moderate challenge in Iowa\'s competitive market. Iowa Board of Pharmacy registration requires a 6–9 month lead time — this must begin immediately if conditions are met. Hybrid delivery infrastructure is adequate. Score of 7.8 reflects strong foundation with manageable implementation hurdles.',
  },
  {
    name: 'Regulatory & Compliance',
    score: 8.0,
    weight: '5%',
    status: 'STRONG',
    dotColor: 'bg-teal-500',
    rationale: 'Strongest dimension in the validation. Clear pathways through Iowa Board of Pharmacy registration requirements, Perkins V eligibility under CIP 51.0805, WIOA ETPL eligibility given healthcare workforce demand, and PTCB certification pathway as the industry-standard credential. HLC compliance managed as a non-substantive change for CE certificate. Primary timeline risk is clinical site coordination — executed MOUs must precede Iowa Board registration to demonstrate placement capacity. Perkins V funding ($18,000–$28,000 annually) is highly probable given Kirkwood\'s track record with workforce certificates. ASHP programmatic accreditation is achievable within 18–24 months of launch.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KirkwoodPharmTechValidationPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* ===== DISCLAIMER BANNER ===== */}
      <div className="w-full bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 text-center">
        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
          📋 Sample Report for demonstration purposes — data sourced from live pipeline run February 19, 2026
        </p>
      </div>

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
                7.0 / 10 composite · 7 specialist analyses · Medium confidence
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
                7.0 Composite
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                10 Live Job Openings
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                $36,920 Median Wage
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
              This is a sample report created for demonstration purposes. All analyses reflect
              real Wavelength pipeline output from a live run on February 19, 2026. BLS and
              Google Jobs data are live at time of pipeline execution.
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
                  <span className={`text-lg font-bold font-mono w-12 text-right ${scoreColor(d.score)}`}>
                    {d.score}
                  </span>
                  <div className="w-28 flex justify-end">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${statusBadge(d.status)}`}
                    >
                      {d.status}
                    </span>
                  </div>
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
                      style={{ width: '70%' }}
                    />
                  </div>
                </div>
                <span className="text-xl font-bold font-mono w-12 text-right text-amber-600 dark:text-amber-400">
                  7.0
                </span>
                <div className="w-28 flex justify-end">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    CONDITIONAL GO
                  </span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Data sources callout */}
          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="mt-6 card-cosmic rounded-xl p-5 border-teal-500/30 bg-teal-500/5">
              <p className="text-sm text-theme-primary leading-relaxed">
                <span className="font-bold">📡 Live Data:</span> BLS SOC 29-2052 — 487,920 employed nationally, median $36,920 (2024).
                Google Jobs: 10 active Cedar Rapids openings — UnityPoint Health (3), CVS Health (3), Walgreens (2), specialty (2).
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
              Strategically sound. Operationally demanding.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="mt-8 space-y-6">
            <div className="card-cosmic rounded-2xl p-6">
              <p className="text-theme-secondary leading-relaxed">
                The Pharmacy Technician Certificate presents a strategically sound but operationally
                demanding opportunity for Kirkwood Community College. Live employer data confirms
                genuine hiring activity: 10 active postings from UnityPoint Health (3), CVS Health
                entities (3), Walgreens (2), and specialty pharmacies (2) as of February 19, 2026.
                The target population of approximately 8,500 potential learners — retail workers
                earning $24,000–$28,000 seeking entry into pharmacy at $32,000–$42,000, recent high
                school graduates exploring allied health, and career changers aged 25–45 — aligns
                squarely with Kirkwood&apos;s mission. Regulatory alignment scores 8/10: Perkins V
                (CIP 51.0805), WIOA ETPL eligibility, and Iowa Board of Pharmacy registration are
                all clear pathways. At a composite score of 7.0/10, this program is viable.
              </p>
            </div>
            <div className="card-cosmic rounded-2xl p-6">
              <p className="text-theme-secondary leading-relaxed">
                Financial projections show break-even at Month 22 with conservative enrollment
                of 15 students per cohort — $82,100 net revenue over three years on $112,000 in
                startup costs (23.4% ROI). Peer community college benchmarks validate these
                enrollment assumptions: DMACC runs 18–22 per cohort, Hawkeye 15–18, Scott Community
                College 14–20. Institutional fit scores 7.8/10, reflecting Kirkwood&apos;s established
                Health Sciences division, proven clinical partnership infrastructure from nursing and
                medical assisting programs, and four decades of employer relationships in the
                Cedar Rapids–Iowa City corridor. The program can succeed — the infrastructure exists.
              </p>
            </div>
            <div className="card-cosmic rounded-2xl p-6">
              <p className="text-theme-secondary leading-relaxed">
                However, three critical execution gaps create unacceptable risk without resolution.
                First, enrollment demand is entirely unvalidated — no primary research confirms
                willingness to pay $4,800. Second, clinical site capacity is assumed, not contracted
                — the financial model depends on zero-cost placements with no executed MOUs. Third,
                competitive differentiation is weak against DMACC ($3,500–$4,000 tuition), Hawkeye,
                and online programs at $899–$1,079. The three conditions attached to this CONDITIONAL
                GO exist specifically to close these gaps before committing capital.
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
              This program can proceed — with three non-negotiable conditions.
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

      {/* ===== F. TIGER TEAM PERSPECTIVES ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[960px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Tiger Team Synthesis</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Three independent lenses. One honest verdict.
            </h2>
            <p className="mt-3 text-theme-secondary text-lg">
              The tiger team stress-tested every assumption from the seven-agent analysis.
            </p>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="mt-10 space-y-8">
            {/* Card 1 — The strategic case */}
            <div className="card-cosmic rounded-2xl p-8">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <h3 className="font-heading font-bold text-theme-primary text-xl">The Strategic Case</h3>
                <span className="text-sm text-theme-muted">Why this program warrants CONDITIONAL GO</span>
                <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                  PROCEED · 7.0/10
                </span>
              </div>

              <div className="space-y-4 text-sm text-theme-secondary leading-relaxed">
                <div>
                  <p className="font-bold text-theme-primary mb-1">Documented Employer Hiring Activity</p>
                  <p>
                    Live Google Jobs data from February 19, 2026 confirms 10 active pharmacy technician
                    openings in Cedar Rapids from UnityPoint Health, CVS Health, Walgreens, and specialty
                    operators. This is not anecdotal employer enthusiasm — it is documented, current, and
                    multi-employer. The hiring activity spans hospital systems and retail chains, which
                    reduces the concentration risk inherent in programs tied to a single healthcare network.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-theme-primary mb-1">Regulatory and Funding Runway is Clear</p>
                  <p>
                    Perkins V eligibility under CIP 51.0805, WIOA ETPL qualification, and Iowa Board of
                    Pharmacy registration are well-defined pathways. The $18,000–$28,000 in annual Perkins
                    funding meaningfully bridges the Year 1 cash gap in the financial model. Kirkwood&apos;s
                    track record with workforce certificates strengthens the grant application case.
                  </p>
                </div>
                <div className="border-l-2 border-purple-500/30 pl-4 italic text-theme-tertiary">
                  <p className="font-bold text-theme-primary not-italic mb-1">The Bottom Line</p>
                  <p>
                    This is a program that can work. Kirkwood has the infrastructure, the employer
                    relationships, and the regulatory alignment. The question is not whether the program
                    is viable — it is whether leadership will do the validation work before spending
                    capital. If the three conditions are met, this becomes a strong GO. If they are
                    skipped, the financial model collapses on unvalidated assumptions.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 — The financial risk */}
            <div className="card-cosmic rounded-2xl p-8">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <h3 className="font-heading font-bold text-theme-primary text-xl">The Financial Risk</h3>
                <span className="text-sm text-theme-muted">Where the model breaks down</span>
                <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  YELLOW LIGHT · 7/10
                </span>
              </div>

              <div className="space-y-4 text-sm text-theme-secondary leading-relaxed">
                <div>
                  <p className="font-bold text-theme-primary mb-1">Numbers That Work at Steady State</p>
                  <p>
                    At 15 students per cohort and two cohorts annually by Year 3, the program generates
                    $82,100 net revenue at 23.4% ROI. Break-even arrives at Month 22. Perkins V grants
                    bridge the Year 1 gap. This is a financially sound program — at steady state and
                    with zero-cost clinical placements.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-theme-primary mb-1">The Single Point of Failure</p>
                  <p>
                    If enrollment lands at 10 instead of 15 students in Year 1, cumulative loss reaches
                    $143,300 and break-even extends past Month 28 — likely triggering board review. If
                    clinical sites charge $800–$1,200 per student (standard in saturated markets), annual
                    costs increase $12,000–$18,000. Both of these scenarios are plausible without
                    pre-launch validation.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-theme-primary mb-1">What Finance Needs Before Approving Capital</p>
                  <ul className="mt-1.5 list-disc list-inside space-y-1 text-theme-secondary">
                    <li>Written zero-cost confirmation from 6+ clinical sites</li>
                    <li>Perkins V application submitted and preliminary feedback received</li>
                    <li>Employer pre-commitments for minimum 8 sponsored Year 1 seats</li>
                    <li>Information session data showing 60+ qualified prospects in pipeline</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 3 — The market reality */}
            <div className="card-cosmic rounded-2xl p-8">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <h3 className="font-heading font-bold text-theme-primary text-xl">The Market Reality</h3>
                <span className="text-sm text-theme-muted">Competitive positioning in a crowded field</span>
                <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  CAUTIOUS · 6/10
                </span>
              </div>

              <div className="space-y-4 text-sm text-theme-secondary leading-relaxed">
                <div>
                  <p className="font-bold text-theme-primary mb-1">Geographic Advantage is Real</p>
                  <p>
                    DMACC (45 miles), Hawkeye (65 miles), and Indian Hills (100+ miles) all require
                    significant commutes for Cedar Rapids-area learners. Kirkwood&apos;s &ldquo;only local
                    option&rdquo; positioning is legitimate and powerful for the working-adult demographic
                    that skews toward this certificate. Geographic convenience is the primary defensible moat.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-theme-primary mb-1">Price Competition is Severe</p>
                  <p>
                    DMACC charges $3,500–$4,000 (vs. Kirkwood&apos;s projected $4,800 — 20% premium).
                    Penn Foster and Ashworth offer self-paced online options at $899–$1,079 (78–81% cheaper).
                    Kirkwood&apos;s value proposition must be brutally explicit: hands-on clinical experience
                    with named employer partners, PTCB pass rate guarantees, and local placement support
                    that online programs cannot replicate.
                  </p>
                </div>
                <div className="border-l-2 border-purple-500/30 pl-4 italic text-theme-tertiary">
                  <p className="font-bold text-theme-primary not-italic mb-1">The Marketing Imperative</p>
                  <p>
                    Employer partnership branding is the strongest enrollment driver in workforce education.
                    &ldquo;Train at Kirkwood, get hired at UnityPoint&rdquo; converts better than any
                    credential-first messaging. Build marketing around named employer partners and
                    clinical placement guarantees before launch — not after.
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
                  Enrollment Shortfall — Unvalidated Demand
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                  CRITICAL
                </span>
              </div>
              <div className="space-y-3 text-sm text-theme-secondary leading-relaxed">
                <p>
                  <span className="font-bold text-theme-primary">Impact:</span> If Year 1 enrollment
                  is 10 instead of 15 students, cumulative loss reaches $143,300 and break-even extends
                  past Month 28. Below 12 students, the program becomes a persistent drag on division
                  resources with no path to profitability at current cost structure.
                </p>
                <p>
                  <span className="font-bold text-theme-primary">Likelihood:</span> Medium. Zero primary
                  research has validated willingness to pay $4,800 among the target demographic. Competing
                  programs at DMACC and online providers ($899–$4,000) create real price sensitivity.
                  Employer-sponsored training at CVS and Walgreens captures some of the incumbent worker segment.
                </p>
                <div>
                  <span className="font-bold text-theme-primary">Mitigation:</span>
                  <ul className="mt-1.5 list-disc list-inside space-y-1 text-theme-secondary">
                    <li>Execute 90-day market validation sprint before capital commitment</li>
                    <li>Set minimum enrollment threshold (12 students) as launch/defer trigger</li>
                    <li>Secure 8+ employer-sponsored seats before open marketing begins</li>
                    <li>Develop evening cohort and Spanish-language track to reach underserved segments</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Risk 2 */}
            <div className="card-cosmic p-7 rounded-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h3 className="font-heading font-bold text-theme-primary text-lg">
                  Clinical Site Capacity Failure
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  HIGH
                </span>
              </div>
              <div className="space-y-3 text-sm text-theme-secondary leading-relaxed">
                <p>
                  <span className="font-bold text-theme-primary">Impact:</span> The entire financial
                  model assumes zero-cost clinical placements. If sites charge $800–$1,200 per student,
                  annual costs increase $12,000–$18,000 and break-even extends 4–6 months. If capacity
                  is capped at 8–10 students (competing demand from nursing and medical assisting
                  programs), the program becomes financially unviable.
                </p>
                <p>
                  <span className="font-bold text-theme-primary">Likelihood:</span> Medium-High.
                  No MOUs have been executed. Clinical sites serving competing programs at DMACC and
                  Hawkeye may already be capacity-constrained.
                </p>
                <div>
                  <span className="font-bold text-theme-primary">Mitigation:</span>
                  <ul className="mt-1.5 list-disc list-inside space-y-1 text-theme-secondary">
                    <li>Execute 120-day clinical site validation with signed MOUs from 6+ sites</li>
                    <li>Diversify across hospital, retail, long-term care, and specialty settings</li>
                    <li>Negotiate multi-year agreements locking in zero-cost terms through Year 3</li>
                    <li>Establish backup relationships with 2–3 additional sites beyond minimum</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Risk 3 */}
            <div className="card-cosmic p-7 rounded-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h3 className="font-heading font-bold text-theme-primary text-lg">
                  Competitive Erosion — Price and Brand
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                  MEDIUM
                </span>
              </div>
              <div className="space-y-3 text-sm text-theme-secondary leading-relaxed">
                <p>
                  <span className="font-bold text-theme-primary">Impact:</span> DMACC&apos;s lower
                  tuition ($3,500–$4,000), established ASHP accreditation, and regional brand
                  recognition could capture market share — particularly from price-sensitive learners
                  willing to commute. Online programs at $899–$1,079 compete for self-directed learners.
                </p>
                <p>
                  <span className="font-bold text-theme-primary">Likelihood:</span> Medium-Low if
                  Kirkwood executes on employer partnerships. High if program launches without named
                  employer co-marketing or clinical placement guarantees.
                </p>
                <div>
                  <span className="font-bold text-theme-primary">Mitigation:</span>
                  <ul className="mt-1.5 list-disc list-inside space-y-1 text-theme-secondary">
                    <li>Build marketing around named employer partners and guaranteed clinical placements</li>
                    <li>Develop evening/weekend scheduling as primary differentiator for working adults</li>
                    <li>Explore Spanish-language track to reach underserved market segment</li>
                    <li>Pursue ASHP accreditation candidacy in Year 1 to signal program quality</li>
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
                text: '7 specialist AI agents run in parallel — Labor Market, Financial Viability, Learner Demand, Employer Demand, Competitive Landscape, Institutional Fit, and Regulatory Compliance. Each agent analyzes independently using its own professional lens and real-time data.',
              },
              {
                title: 'Live Data Sources',
                text: 'Bureau of Labor Statistics API (SOC 29-2052, 2024 vintage), Google Jobs via SerpAPI (10 live postings captured February 19, 2026), O*NET competency profiles, Perkins V and WIOA eligibility frameworks, and Iowa Board of Pharmacy registration requirements.',
              },
              {
                title: 'Weighted Scoring',
                text: 'Evidence-based scoring across 7 dimensions with predetermined weights reflecting real-world decision priorities. Labor market demand carries 25% weight; regulatory carries 5%. Composite score is a weighted average — no single dimension dominates.',
              },
              {
                title: 'Tiger Team Synthesis',
                text: 'After 7 agents complete, a tiger team synthesizes all findings into the executive recommendation, identifies critical execution risks, and writes specific, measurable conditions for approval. This is the adversarial layer — it challenges optimistic assumptions.',
              },
              {
                title: 'Conservative Methodology',
                text: 'All estimates favor caution. Revenue projections use low-end enrollment assumptions (15 students vs. peer median of 18). Cost estimates include contingency buffers. Growth projections use BLS baseline, not optimistic scenarios. Community colleges operate on thin margins — the model must work at minimum viable enrollment.',
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
              7 agents · 204 seconds · BLS + Google Jobs live data · February 19, 2026
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
              This validation was produced by a live run of Wavelength&apos;s 7-stage Program Validator
              pipeline on February 19, 2026 — real BLS data, real employer job postings, real
              financial projections. Your Program Validation delivers the same depth, tailored to
              your institution, your region, and your program.
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
