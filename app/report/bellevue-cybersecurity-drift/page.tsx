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
    'Live Curriculum Drift Analysis for Bellevue University Cybersecurity BS. Drift score 65/100 — 13 competency gaps identified across 27 employer postings analyzed.',
  alternates: { canonical: 'https://withwavelength.com/report/bellevue-cybersecurity-drift' },
  openGraph: {
    title: 'Curriculum Drift Analysis — Bellevue University Cybersecurity BS',
    description:
      '65/100 drift score (significant). 13 employer skill gaps identified from 27 live job postings.',
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

const scanDate = 'February 20, 2026';
const driftScore = 65;
const driftLevel = 'significant';
const postingsAnalyzed = 27;
const colors = driftLevelColor(driftLevel);

const employerSkills = [
  { skill: 'Security Monitoring', frequency: 15, covered: false },
  { skill: 'Incident Response', frequency: 12, covered: true },
  { skill: 'SIEM', frequency: 10, covered: false },
  { skill: 'Vulnerability Management', frequency: 10, covered: true },
  { skill: 'Risk Assessment', frequency: 9, covered: true },
  { skill: 'CISSP Certification', frequency: 8, covered: false },
  { skill: 'Security Policies and Procedures', frequency: 8, covered: true },
  { skill: 'Threat Hunting', frequency: 7, covered: false },
  { skill: 'Security+', frequency: 7, covered: false },
  { skill: 'RMF (Risk Management Framework)', frequency: 6, covered: false },
  { skill: 'Identity and Access Management', frequency: 6, covered: true },
  { skill: 'Penetration Testing', frequency: 6, covered: true },
  { skill: 'Security Clearance', frequency: 6, covered: false },
  { skill: 'Log Analysis', frequency: 6, covered: false },
  { skill: 'Cybersecurity Tools Administration', frequency: 5, covered: false },
  { skill: 'Detection Engineering', frequency: 5, covered: false },
  { skill: 'Security Control Assessment', frequency: 5, covered: true },
  { skill: 'Microsoft Defender', frequency: 4, covered: false },
  { skill: 'NERC CIP', frequency: 3, covered: false },
  { skill: 'Cloud Security', frequency: 3, covered: false },
];

const coveredSkills = [
  'Incident Response', 'Vulnerability Management', 'Risk Assessment',
  'Security Policies and Procedures', 'Identity and Access Management',
  'Penetration Testing', 'Security Control Assessment',
];

const gapSkills = [
  'Security Monitoring', 'SIEM', 'CISSP Certification', 'Threat Hunting',
  'Security+', 'RMF (Risk Management Framework)', 'Security Clearance',
  'Log Analysis', 'Cybersecurity Tools Administration', 'Detection Engineering',
  'Microsoft Defender', 'NERC CIP', 'Cloud Security',
];

const staleSkills = [
  'Cybersecurity Principles', 'Information Systems Security', 'Python Programming',
  'Problem Solving', 'Control Structures', 'Firewalls',
  'Intrusion Detection Systems', 'Virtual Private Networks (VPNs)',
  'Access Control Models', 'Password Management', 'Smart Cards',
  'Biometric Authentication', 'Public Key Infrastructure (PKI)',
  'Vulnerability Analysis', 'Security Auditing', 'Compliance',
  'Database Security', 'Relational Databases', 'NoSQL Databases', 'SQL',
  'Application Development', 'Operational Security', 'Regulatory Compliance',
  'Ethics', 'Cryptography', 'Contingency Planning',
  'Operating System Security', 'Server Security', 'Desktop Security',
  'Virtualization Security', 'Mobile Device Security',
  'Web Application Security', 'Secure Development', 'OWASP Top 10',
  'Digital Forensics', 'Computer Forensics', 'Cyber Investigations',
  'Evidence Acquisition', 'Threat Identification',
  'Governance Risk and Compliance',
];

const narrative = `The Cybersecurity program at Bellevue University demonstrates solid alignment with core security concepts, but faces a significant gap in preparing students for the operational realities of today's Security Operations Centers (SOCs) and enterprise security teams. While the program successfully teaches foundational competencies like incident response, vulnerability management, and penetration testing, employers are consistently seeking candidates with hands-on experience in security monitoring platforms, threat detection tools, and industry-recognized certifications that signal job-readiness. The 65/100 drift score reflects this divide between strong conceptual coverage and missing practical toolsets—particularly Security Information and Event Management (SIEM) platforms, log analysis capabilities, and threat hunting techniques that have become standard expectations for entry-level security analyst roles.

The employer demand pattern reveals two specific challenges. First, there's a clear certification gap: Security+ and CISSP appear frequently in job postings as screening requirements, yet aren't formally integrated into the curriculum pathway. Second, the "Potentially Stale Skills" category requires nuanced interpretation—topics like Python Programming and Cybersecurity Principles aren't obsolete, but may be taught too abstractly. Employers assume these foundations but prioritize candidates who can immediately apply them using current security tools and frameworks like RMF (Risk Management Framework). The frequent mention of security clearance requirements also suggests many local employers are government contractors, creating an opportunity to better prepare students for that career pathway. This isn't a curriculum crisis, but it does indicate the program has drifted from an implementation-focused job market while maintaining strong theoretical grounding.`;

const recommendations = [
  'Integrate Security+ certification preparation directly into the curriculum as a capstone requirement or embed exam objectives across multiple courses, providing students a marketable credential upon graduation that addresses the most frequent employer screening requirement.',
  'Establish hands-on labs with industry-standard SIEM platforms (Splunk, IBM QRadar, or Microsoft Sentinel) and require students to complete practical exercises in log analysis, correlation rule creation, and threat detection—skills that can be demonstrated in interviews and on resumes.',
  'Redesign the Python Programming component to focus specifically on security automation use cases: parsing security logs, automating threat intelligence gathering, and writing detection scripts rather than general programming concepts.',
  'Create a dedicated "Security Operations" course covering threat hunting methodologies, detection engineering principles, and security monitoring workflows that mirrors the day-to-day responsibilities described in SOC analyst job postings.',
  'Develop partnerships with local government contractors and defense organizations to provide students information about security clearance processes, eligibility requirements, and sponsorship opportunities, given the frequency of clearance requirements in the regional job market.',
  'Add Risk Management Framework (RMF) training aligned with NIST SP 800-37 into existing security policy and compliance courses, as this federal standard appears consistently in employer requirements and represents a teachable, structured methodology students can immediately apply.',
];

// Auto-scraped curriculum data
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
  'CYBR 440 – Web Application Security',
  'CYBR 490 – Cybersecurity Capstone',
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
      {/* ═══════════ LIVE DATA BANNER ═══════════ */}
      <div className="w-full bg-teal-500/10 border-b border-teal-500/20 py-2.5 px-4 text-center">
        <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
          🔴 Live Report — Real data from {postingsAnalyzed} job postings and auto-scraped curriculum · Analyzed {scanDate}
        </p>
      </div>

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
                <span className="font-bold">⚠️ {driftLevel.charAt(0).toUpperCase() + driftLevel.slice(1)} Drift:</span>{' '}
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
                  <p className="text-sm text-theme-secondary leading-relaxed">{rec}</p>
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
                    The pipeline searched bellevue.edu for cybersecurity program pages, extracted {scrapedCourses.length} courses and 26 skills using AI-powered content analysis. No manual curriculum input required.
                  </li>
                  <li>
                    <span className="font-semibold text-theme-primary">Job Posting Analysis:</span>{' '}
                    {postingsAnalyzed} Information Security Analyst (SOC 15-1212) job postings were collected via SerpAPI and analyzed by Claude Sonnet to extract the top {employerSkills.length} employer-demanded skills with frequency counts.
                  </li>
                  <li>
                    <span className="font-semibold text-theme-primary">Skill Extraction:</span>{' '}
                    AI extracted 48 distinct curriculum skills from the scraped course descriptions, then matched them against employer demands to identify covered skills, gaps, and potentially stale topics.
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

                <div className="mt-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <span className="font-bold">Note:</span> O*NET baseline enrichment was unavailable during this scan (API authentication issue). Future scans will include O*NET essential skills, knowledge areas, and hot technologies as an additional baseline for gap detection.
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
                <span className="font-semibold text-theme-primary">Pricing:</span> Curriculum Drift Analysis starts at $1,200/year per program. Includes:
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
