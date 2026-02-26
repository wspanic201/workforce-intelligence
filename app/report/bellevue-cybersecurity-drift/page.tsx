import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, TrendingUp, CheckCircle2, AlertCircle, XCircle, Shield } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { PrintButton } from '@/components/ui/PrintButton';

export const metadata: Metadata = {
  title: 'Curriculum Drift Analysis — Bellevue University Cybersecurity BS | Wavelength Report',
  description:
    'Live Curriculum Drift Analysis for Bellevue University Cybersecurity BS. Drift score 50/100 — 10 competency gaps identified across 27 employer postings analyzed.',
  alternates: { canonical: 'https://withwavelength.com/report/bellevue-cybersecurity-drift' },
  openGraph: {
    title: 'Curriculum Drift Analysis — Bellevue University Cybersecurity BS',
    description:
      '50/100 drift score (moderate). 10 employer skill gaps identified from 27 live job postings.',
    url: 'https://withwavelength.com/report/bellevue-cybersecurity-drift',
    type: 'article',
  },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function driftLevelColor(level: string) {
  switch (level) {
    case 'aligned': return { text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500', border: 'border-teal-500/30', surface: 'bg-teal-500/5' };
    case 'minor': return { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500/30', surface: 'bg-blue-500/5' };
    case 'moderate': return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30', surface: 'bg-amber-500/5' };
    case 'significant': return { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500/30', surface: 'bg-orange-500/5' };
    case 'critical': return { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500/30', surface: 'bg-rose-500/5' };
    default: return { text: 'text-theme-secondary', bg: 'bg-theme-muted', border: 'border-theme-subtle', surface: 'bg-theme-surface/50' };
  }
}

// ─── Real Pipeline Data (February 20, 2026) ─────────────────────────────────
// Source: /tmp/drift-test-output.json — O*NET enriched, auto-scraped curriculum

const scanDate = 'February 20, 2026';
const driftScore = 50;
const driftLevel = 'moderate';
const postingsAnalyzed = 27;
const colors = driftLevelColor(driftLevel);

const employerSkills = [
  { skill: 'Security Monitoring', frequency: 12, covered: false },
  { skill: 'SIEM', frequency: 9, covered: false },
  { skill: 'Incident Response', frequency: 9, covered: true },
  { skill: 'Vulnerability Management', frequency: 8, covered: true },
  { skill: 'Risk Assessment', frequency: 7, covered: true },
  { skill: 'CISSP Certification', frequency: 6, covered: false },
  { skill: 'RMF (Risk Management Framework)', frequency: 6, covered: false },
  { skill: 'Security Policies and Procedures', frequency: 6, covered: true },
  { skill: 'Threat Hunting', frequency: 5, covered: false },
  { skill: 'Security+', frequency: 5, covered: false },
  { skill: 'Penetration Testing', frequency: 5, covered: true },
  { skill: 'Identity and Access Management', frequency: 5, covered: true },
  { skill: 'Security Clearance', frequency: 5, covered: false },
  { skill: 'Log Analysis', frequency: 5, covered: false },
  { skill: 'Detection Engineering', frequency: 4, covered: false },
  { skill: 'Cybersecurity Compliance', frequency: 4, covered: true },
  { skill: 'Microsoft Defender', frequency: 3, covered: false },
  { skill: 'Digital Forensics', frequency: 3, covered: true },
  { skill: 'Cloud Security', frequency: 3, covered: true },
  { skill: 'Security Control Assessment', frequency: 3, covered: true },
];

const coveredSkills = [
  'Incident Response', 'Vulnerability Management', 'Risk Assessment',
  'Security Policies and Procedures', 'Penetration Testing',
  'Identity and Access Management', 'Cloud Security',
  'Digital Forensics', 'Cybersecurity Compliance', 'Security Control Assessment',
];

const gapSkills = [
  'Security Monitoring', 'SIEM', 'CISSP Certification',
  'RMF (Risk Management Framework)', 'Threat Hunting',
  'Security+', 'Security Clearance', 'Log Analysis',
  'Detection Engineering', 'Microsoft Defender',
];

const staleSkills = [
  'Cybersecurity Principles', 'Information Systems Security', 'Python Programming',
  'Problem Solving', 'Control Structures', 'Firewalls',
  'Intrusion Detection Systems', 'Virtual Private Networks (VPNs)',
  'Security Models', 'Password Management', 'Smart Cards',
  'Biometric Authentication', 'Public Key Infrastructure (PKI)',
  'Vulnerability Analysis', 'Security Auditing', 'Database Security',
  'Relational Databases', 'NoSQL Databases', 'SQL',
  'Application Development', 'Operational Security', 'Regulatory Compliance',
  'Cryptography', 'Contingency Planning', 'Security Awareness Training',
  'Operating System Security', 'Mobile Device Security',
  'Virtualization', 'Cloud Computing Security',
  'Web Application Security', 'OWASP Top 10',
  'Threat Identification', 'Governance, Risk, and Compliance (GRC)',
];

const narrative = `The Cybersecurity program at Bellevue University maintains a solid foundation in core security concepts, with strong coverage of incident response, vulnerability management, and risk assessment—skills that employers consistently value. However, the program shows moderate drift (50/100) from current market demands, primarily in operational security tools and industry certifications. Employers are actively seeking candidates with hands-on experience in Security Information and Event Management (SIEM) platforms, security monitoring capabilities, and specific certifications like Security+ and CISSP. The 27 job postings analyzed reveal a clear shift toward defensive security operations roles that require proficiency with detection tools like Microsoft Defender, log analysis capabilities, and threat hunting skills—areas where the current curriculum appears to have gaps.

The drift is particularly notable in three areas: professional certifications, operational toolsets, and specialized frameworks. Many employers now list Security+ or CISSP as baseline requirements, and government-adjacent roles frequently require knowledge of the Risk Management Framework (RMF). While the program covers foundational topics like cybersecurity principles and Python programming, these appear less frequently in job postings compared to tool-specific skills, suggesting employers assume baseline knowledge but prioritize applied, operational capabilities. This doesn't indicate the current curriculum is obsolete, but rather that it needs strategic enhancements to reflect the field's evolution toward Security Operations Center (SOC) functions and compliance-driven security practices.`;

const recommendations = [
  {
    text: 'Integrate SIEM platform training into existing courses, using tools like Splunk, Azure Sentinel, or open-source alternatives (Security Onion) to provide hands-on log analysis and security monitoring experience that directly addresses the most significant skill gap.',
    source: 'Gap Analysis: Security Monitoring (44% of job postings, n=27) + SIEM (33% of postings) — SerpAPI job posting scan, Feb 20, 2026',
    priority: 'High',
  },
  {
    text: 'Establish a certification pathway by embedding Security+ exam preparation into curriculum and creating clear guidance for students on pursuing CISSP after graduation, potentially offering exam vouchers or boot camp sessions as program enhancements.',
    source: 'Gap Analysis: Security+ (19% of postings) + CISSP (22% of postings) — SerpAPI job posting scan, Feb 20, 2026',
    priority: 'High',
  },
  {
    text: 'Develop a dedicated security monitoring and detection module that covers threat hunting fundamentals, detection engineering concepts, and practical experience with endpoint detection tools like Microsoft Defender or CrowdStrike.',
    source: 'Gap Analysis: Threat Hunting (19% of postings) + Detection Engineering (15% of postings) + Microsoft Defender (11% of postings) — SerpAPI job posting scan, Feb 20, 2026',
    priority: 'Medium',
  },
  {
    text: 'Add Risk Management Framework (RMF) content to compliance-focused courses to prepare students for government and contractor roles, including hands-on experience with the Assessment and Authorization (A&A) process.',
    source: 'Gap Analysis: RMF (22% of job postings) — SerpAPI job posting scan, Feb 20, 2026; O*NET Knowledge Area: Security and Public Safety (SOC 15-1212)',
    priority: 'Medium',
  },
  {
    text: 'Reframe Python programming instruction to emphasize security automation use cases—such as log parsing, indicator of compromise (IOC) analysis, and security orchestration—rather than general programming, demonstrating direct relevance to security operations roles.',
    source: 'O*NET Technology: Python (SOC 15-1212); Job posting frequency analysis showing automation/scripting mentioned in 67% of postings',
    priority: 'Low',
  },
  {
    text: 'Create an employer advisory board review process to conduct annual curriculum validation with local cybersecurity employers, ensuring the program maintains awareness of emerging tools and evolving role requirements in real-time.',
    source: 'Best Practice: HLC accreditation standards for program review; Industry Advisory Committee requirements per NIST NICE Framework',
    priority: 'Low',
  },
];

// Auto-scraped curriculum data (9 courses from bellevue.edu)
const scrapedCourses = [
  'CYBR 260 – Introduction to Cybersecurity',
  'CYBR 330 – Information Systems Security',
  'CYBR 335 – Access Control and Identity Management',
  'CYBR 340 – Information Security Policy and Management',
  'CYBR 345 – Database Security',
  'CYBR 400 – Security Architecture and Design',
  'CYBR 410 – Offensive Security and Penetration Testing',
  'CYBR 420 – Digital Forensics and Cyber Investigations',
  'CYBR 430 – Security Operations and Incident Response',
];

// ─── SVG Arc Gauge Component ─────────────────────────────────────────────────

function DriftGauge({ score, level }: { score: number; level: string }) {
  const radius = 80;
  const stroke = 12;
  const cx = 100;
  const cy = 100;
  // Arc from 180° (left) to 0° (right) — semicircle
  const startAngle = Math.PI;
  const endAngle = 0;
  const range = startAngle - endAngle;
  const progress = score / 100;
  const progressAngle = startAngle - range * progress;

  const arcPath = (angle: number) => {
    const x = cx + radius * Math.cos(angle);
    const y = cy - radius * Math.sin(angle);
    return { x, y };
  };

  const start = arcPath(startAngle);
  const end = arcPath(endAngle);
  const progressEnd = arcPath(progressAngle);
  const largeArc = progress > 0.5 ? 1 : 0;

  const bgD = `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`;
  const fgD = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${progressEnd.x} ${progressEnd.y}`;

  const colorMap: Record<string, string> = {
    aligned: '#14b8a6',
    minor: '#3b82f6',
    moderate: '#f59e0b',
    significant: '#f97316',
    critical: '#ef4444',
  };
  const color = colorMap[level] || '#94a3b8';

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        <path d={bgD} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-theme-surface" strokeLinecap="round" />
        <path d={fgD} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
        <text x={cx} y={cy - 10} textAnchor="middle" className="fill-current text-theme-primary" fontSize="36" fontWeight="bold" fontFamily="var(--font-heading)">
          {score}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-current text-theme-muted" fontSize="12">
          / 100
        </text>
      </svg>
      <span className={`mt-1 text-sm font-bold uppercase tracking-wider ${driftLevelColor(level).text}`}>
        {level} drift
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BellevueCybersecurityDriftPage() {
  const maxFrequency = employerSkills[0]?.frequency ?? 1;

  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* ═══════════ A. HERO ═══════════ */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-32 lg:pt-36 pb-16">
        <Stars count={140} />
        <Aurora className="opacity-70" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">Curriculum Drift Analysis · Live Report</span>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="font-heading font-bold text-gradient-cosmic leading-[1.05] mx-auto max-w-4xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4rem)' }}
            >
              Bellevue University
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={180} duration={800}>
            <p className="mt-4 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed">
              Cybersecurity BS · Bellevue, Nebraska · Analysis Date: {scanDate}
            </p>
          </AnimateOnScroll>

          {/* Drift Score Gauge */}
          <AnimateOnScroll variant="fade-up" delay={260} duration={800}>
            <div className="mt-8 inline-block">
              <DriftGauge score={driftScore} level={driftLevel} />
            </div>
          </AnimateOnScroll>

          {/* Stat Pills */}
          <AnimateOnScroll variant="fade-up" delay={340} duration={800}>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                {postingsAnalyzed} Job Postings Analyzed
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                {coveredSkills.length} Skills Covered
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                {gapSkills.length} Gaps Identified
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                {staleSkills.length} Potentially Stale Skills
              </span>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={420} duration={800}>
            <div className="mt-6">
              <PrintButton />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ B. EMPLOYER SKILLS FREQUENCY ═══════════ */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Employer Skills Analysis</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              What employers are hiring for
            </h2>
            <p className="mt-3 text-theme-secondary text-sm max-w-2xl">
              Top 20 skills extracted from {postingsAnalyzed} Information Security Analyst job postings. Green = covered by curriculum. Red = gap.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="mt-10 card-cosmic rounded-2xl overflow-hidden">
              {employerSkills.map((s, i) => (
                <div
                  key={s.skill}
                  className={`flex items-center gap-4 px-5 py-3.5 ${
                    i < employerSkills.length - 1 ? 'border-b border-theme-subtle' : ''
                  }`}
                >
                  <div className="flex-shrink-0 w-5">
                    {s.covered ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${s.covered ? 'text-theme-primary' : 'text-rose-700 dark:text-rose-400'}`}>
                      {s.skill}
                    </p>
                  </div>
                  <div className="w-24 sm:w-40">
                    <div className="h-1.5 rounded-full bg-theme-surface overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.covered ? 'bg-teal-500' : 'bg-rose-500'}`}
                        style={{ width: `${(s.frequency / maxFrequency) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-mono w-10 text-right text-theme-muted">
                    {s.frequency}/{postingsAnalyzed}
                  </span>
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Coverage Summary */}
          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className={`mt-6 card-cosmic rounded-xl p-5 ${colors.border} ${colors.surface}`}>
              <p className="text-sm text-theme-primary leading-relaxed">
                <span className="font-bold">{driftLevel.charAt(0).toUpperCase() + driftLevel.slice(1)} Drift:</span>{' '}
                Only {coveredSkills.length} of {employerSkills.length} top employer skills ({Math.round((coveredSkills.length / employerSkills.length) * 100)}%) are covered by the curriculum.
                The highest-frequency gap is <span className="font-semibold">Security Monitoring</span> (found in {employerSkills[0].frequency} of {postingsAnalyzed} postings).
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ C. NARRATIVE ANALYSIS ═══════════ */}
      <section className="relative py-16 md:py-24 bg-theme-surface/30">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">AI-Generated Analysis</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              What the data tells us
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="mt-8 card-cosmic rounded-2xl p-7">
              {narrative.split('\n\n').map((para, i) => (
                <p key={i} className={`text-theme-secondary leading-relaxed ${i > 0 ? 'mt-5' : ''}`}>
                  {para}
                </p>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ D. SKILLS COMPARISON ═══════════ */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Skills Comparison</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                Covered, Missing, and Potentially Stale
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Covered */}
            <AnimateOnScroll variant="fade-up">
              <div className="card-cosmic rounded-xl p-6 border-teal-500/30 bg-teal-500/5 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-teal-500" />
                  <h3 className="font-heading font-bold text-lg text-theme-primary">Covered ({coveredSkills.length})</h3>
                </div>
                <p className="text-xs text-theme-muted mb-4">Employer-demanded skills present in the curriculum</p>
                <div className="flex flex-wrap gap-2">
                  {coveredSkills.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>

            {/* Gaps */}
            <AnimateOnScroll variant="fade-up" delay={80}>
              <div className="card-cosmic rounded-xl p-6 border-rose-500/30 bg-rose-500/5 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <h3 className="font-heading font-bold text-lg text-theme-primary">Gaps ({gapSkills.length})</h3>
                </div>
                <p className="text-xs text-theme-muted mb-4">Employer-demanded skills missing from curriculum</p>
                <div className="flex flex-wrap gap-2">
                  {gapSkills.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>

            {/* Stale */}
            <AnimateOnScroll variant="fade-up" delay={160}>
              <div className="card-cosmic rounded-xl p-6 border-amber-500/30 bg-amber-500/5 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-heading font-bold text-lg text-theme-primary">Potentially Stale ({staleSkills.length})</h3>
                </div>
                <p className="text-xs text-theme-muted mb-4">Curriculum skills not appearing in top employer demands</p>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                  {staleSkills.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════ E. AUTO-SCRAPED CURRICULUM ═══════════ */}
      <section className="relative py-16 md:py-24 bg-theme-surface/30">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Auto-Scraped Curriculum</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              What Bellevue University teaches
            </h2>
            <p className="mt-3 text-theme-secondary text-sm max-w-2xl">
              Courses automatically extracted from{' '}
              <a href="https://www.bellevue.edu/degrees/academic-catalog/course-listing/CYBR/" className="underline text-purple-600 dark:text-purple-400" target="_blank" rel="noopener noreferrer">
                bellevue.edu
              </a>{' '}
              — {scrapedCourses.length} cybersecurity courses identified.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="mt-8 card-cosmic rounded-2xl p-6">
              <div className="grid sm:grid-cols-2 gap-3">
                {scrapedCourses.map((course) => (
                  <div key={course} className="flex items-start gap-2.5 p-3 rounded-lg bg-theme-surface/50 border border-theme-subtle">
                    <Shield className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-theme-secondary">{course}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ F. RECOMMENDATIONS ═══════════ */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">AI-Generated Recommendations</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                What to fix — and how
              </h2>
              <p className="mt-3 text-theme-secondary max-w-2xl mx-auto text-sm">
                {recommendations.length} prioritized recommendations generated from employer skill gap analysis.
              </p>
            </div>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="space-y-5">
            {recommendations.map((rec, i) => (
              <div key={i} className="card-cosmic rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-400">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className="text-sm text-theme-secondary leading-relaxed">{rec.text}</p>
                      <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded ${
                        rec.priority === 'High' ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400' :
                        rec.priority === 'Medium' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                        'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-theme-muted mt-2 leading-relaxed">
                      <span className="font-semibold">Source:</span> {rec.source}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════ G. METHODOLOGY ═══════════ */}
      <section className="relative py-16 md:py-20 bg-theme-surface/30">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-10">
              <span className="overline">Methodology</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                How this report was generated
              </h2>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={80}>
            <div className="card-cosmic rounded-2xl p-7">
              <h3 className="font-heading font-bold text-lg text-theme-primary mb-4">Automated Pipeline</h3>
              <div className="space-y-4 text-sm text-theme-secondary leading-relaxed">
                <p>This report was generated by Wavelength&apos;s Curriculum Drift Analysis pipeline — a fully automated system that requires only an institution name, program name, and target occupation.</p>

                <ol className="list-decimal list-inside space-y-3 ml-2">
                  <li>
                    <span className="font-semibold text-theme-primary">Auto-Curriculum Scraping:</span>{' '}
                    The pipeline searched bellevue.edu for cybersecurity program pages, extracted {scrapedCourses.length} courses and 27 skills using AI-powered content analysis. No manual curriculum input required.
                  </li>
                  <li>
                    <span className="font-semibold text-theme-primary">Job Posting Analysis:</span>{' '}
                    {postingsAnalyzed} Information Security Analyst (SOC 15-1212) job postings were collected via SerpAPI and analyzed by Claude Sonnet to extract the top {employerSkills.length} employer-demanded skills with frequency counts.
                  </li>
                  <li>
                    <span className="font-semibold text-theme-primary">O*NET Baseline Enrichment:</span>{' '}
                    The O*NET Web Services API provided 5 essential skills, 5 knowledge areas, and 20 hot technologies for SOC 15-1212 (Information Security Analysts), used as an additional baseline for gap detection and validation.
                  </li>
                  <li>
                    <span className="font-semibold text-theme-primary">Skill Extraction:</span>{' '}
                    AI extracted 43 distinct curriculum skills from the scraped course descriptions, then matched them against employer demands and O*NET baselines to identify covered skills, gaps, and potentially stale topics.
                  </li>
                  <li>
                    <span className="font-semibold text-theme-primary">Drift Scoring:</span>{' '}
                    The drift score (0-100, higher = more drift) is calculated by AI analysis of skill coverage gaps weighted by employer demand frequency. A score of {driftScore} indicates {driftLevel} drift.
                  </li>
                  <li>
                    <span className="font-semibold text-theme-primary">Narrative & Recommendations:</span>{' '}
                    Claude Sonnet generated the analysis narrative and {recommendations.length} prioritized recommendations based on the complete gap analysis.
                  </li>
                </ol>

                <div className="mt-4 p-4 rounded-lg bg-teal-500/5 border border-teal-500/20">
                  <p className="text-xs text-teal-700 dark:text-teal-400">
                    <span className="font-bold">O*NET Enriched:</span> This scan includes O*NET baseline data (5 skills, 5 knowledge areas, 20 technologies) for SOC 15-1212 Information Security Analysts, providing federal occupational standards as an additional validation layer.
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={160}>
            <div className="card-cosmic rounded-2xl p-7 mt-8">
              <h3 className="font-heading font-bold text-lg text-theme-primary mb-4">Data Sources & Citations</h3>
              <div className="space-y-3 text-sm text-theme-secondary">
                <div>
                  <p className="font-semibold text-theme-primary">Job Posting Data</p>
                  <p className="text-[13px] text-theme-muted mt-1">
                    SerpAPI (Google Jobs) — 27 "Information Security Analyst" postings for Bellevue, Nebraska area — Collected February 20, 2026
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-theme-primary">Occupational Standards</p>
                  <p className="text-[13px] text-theme-muted mt-1">
                    O*NET Online 28.2 Database — SOC 15-1212.00 (Information Security Analysts) — 5 essential skills, 5 knowledge areas, 20 hot technologies — Accessed February 20, 2026 via O*NET Web Services API
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-theme-primary">Curriculum Data</p>
                  <p className="text-[13px] text-theme-muted mt-1">
                    Bellevue University Cybersecurity BS program pages (bellevue.edu) — Auto-scraped 9 courses, extracted 43 curriculum skills via AI analysis — Collected February 20, 2026
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-theme-primary">Analysis Engine</p>
                  <p className="text-[13px] text-theme-muted mt-1">
                    Claude Sonnet 4.5 (Anthropic) — Skill extraction, gap analysis, drift scoring, and narrative generation — February 20, 2026
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-theme-subtle">
                  <p className="text-[11px] text-theme-muted italic">
                    All data sources, skill frequencies, and recommendations in this report can be traced back to the citations listed above. Job posting data is point-in-time (February 20, 2026) and reflects current market demand at the time of analysis.
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ H. CTA ═══════════ */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-teal-500/10">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <h2
              className="font-heading font-bold text-gradient-cosmic"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
            >
              Get a Curriculum Drift Analysis for your program
            </h2>
            <p className="mt-4 text-theme-secondary text-lg max-w-2xl mx-auto leading-relaxed">
              Know exactly where your curriculum has drifted from employer demand — and what to fix first.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/drift"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Learn More About Curriculum Drift Analysis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-theme-subtle bg-theme-surface text-theme-primary font-semibold hover:border-purple-500/50 transition-all"
              >
                Schedule a Demo
              </Link>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={180}>
            <div className="mt-8 card-cosmic rounded-xl p-6 text-left">
              <p className="text-sm text-theme-secondary leading-relaxed">
                <span className="font-semibold text-theme-primary">Pricing:</span> Curriculum Drift Analysis is $500 per scan. Includes:
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-theme-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span>Full competency gap analysis with AI-powered skill extraction</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span>Auto-scraped curriculum analysis (no manual data entry)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span>Regional employer signal analysis from live job postings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span>O*NET baseline integration with hot technology tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span>Prioritized recommendations with quarterly monitoring updates</span>
                </li>
              </ul>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
