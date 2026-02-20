import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, TrendingDown, TrendingUp, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { PrintButton } from '@/components/ui/PrintButton';

export const metadata: Metadata = {
  title: 'Curriculum Drift Analysis — Bellevue College Cybersecurity AAS | Wavelength Sample Report',
  description:
    'Sample Curriculum Drift Analysis for Bellevue College Cybersecurity AAS. Drift score 42/100 — 13 competency gaps identified, critical cloud-native and SIEM alignment issues.',
  alternates: { canonical: 'https://withwavelength.com/report/bellevue-cybersecurity-drift' },
  openGraph: {
    title: 'Curriculum Drift Analysis — Bellevue College Cybersecurity AAS',
    description:
      '42/100 drift score. 13 critical competency gaps between curriculum and Seattle tech employer requirements.',
    url: 'https://withwavelength.com/report/bellevue-cybersecurity-drift',
    type: 'article',
  },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function driftScoreColor(score: number) {
  if (score >= 75) return 'text-teal-600 dark:text-teal-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

function driftScoreBg(score: number) {
  if (score >= 75) return 'bg-teal-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
}

function severityBadge(level: 'Critical' | 'Moderate' | 'Minor') {
  const map = {
    Critical: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
    Moderate: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
    Minor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
  };
  return map[level];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const driftDimensions = [
  { name: 'Technical Skills Alignment', score: 38, description: 'Cloud-native security, SIEM platforms, automation' },
  { name: 'Certification Relevance', score: 62, description: 'CompTIA Security+, CISSP, CEH currency' },
  { name: 'Tool/Platform Currency', score: 29, description: 'AWS, Azure, CrowdStrike, Splunk, Elastic' },
  { name: 'Soft Skills Coverage', score: 71, description: 'Communication, incident response, documentation' },
  { name: 'Industry Standards Compliance', score: 48, description: 'NIST, NICE Framework, Zero Trust architecture' },
];

const overallDriftScore = 42; // Lower = more drift (inverse of alignment)

const competencyGaps = [
  {
    num: 1,
    severity: 'Critical' as const,
    curriculumTeaches: 'Basic firewall configuration and perimeter defense models',
    employersRequire: 'Cloud-native SASE architecture (Secure Access Service Edge) with zero-trust principles',
    gap: 'Curriculum is rooted in on-premises perimeter security. Seattle employers (Microsoft, Amazon, Google) have moved to cloud-first infrastructure where traditional firewall config is secondary to identity-based access controls, cloud-native firewalls (AWS Network Firewall, Azure Firewall), and SASE platforms (Zscaler, Palo Alto Prisma Access).',
    niceFramework: 'NICE SP-SYS-001: Applies system security principles to architecture design',
  },
  {
    num: 2,
    severity: 'Critical' as const,
    curriculumTeaches: 'Wireshark packet capture and basic network analysis',
    employersRequire: 'SIEM correlation and threat hunting (Splunk, Elastic Security, Microsoft Sentinel)',
    gap: 'Students learn Wireshark packet inspection but not how to operationalize detection at enterprise scale. Job postings from Microsoft, Amazon, and T-Mobile require Splunk query language (SPL), Elastic SIEM correlation, and Microsoft Sentinel KQL queries — none of which are in the current curriculum.',
    niceFramework: 'NICE OM-ANA-001: Analyzes data/information from multiple sources to identify anomalies',
  },
  {
    num: 3,
    severity: 'Critical' as const,
    curriculumTeaches: 'Windows Active Directory and Group Policy management',
    employersRequire: 'Identity and Access Management (IAM) in AWS/Azure, Okta, Microsoft Entra ID',
    gap: 'While AD fundamentals remain relevant, the market has shifted to cloud IAM platforms. Employers expect knowledge of AWS IAM policies, Azure AD Conditional Access (now Entra ID), SAML/OAuth integration, and identity governance tools. Bellevue curriculum does not cover cloud IAM architecture.',
    niceFramework: 'NICE PR-INF-001: Manages access controls and user permissions',
  },
  {
    num: 4,
    severity: 'Critical' as const,
    curriculumTeaches: 'CompTIA Security+ exam prep (general security concepts)',
    employersRequire: 'Cloud security certifications (AWS Security Specialty, Azure Security Engineer, Microsoft SC-200)',
    gap: 'Security+ is still valued as a foundation, but Seattle tech employers increasingly list cloud-specific certifications. Microsoft, Amazon, and Google require AWS Security Specialty, Azure Security Engineer, or Microsoft SC-200 (Security Operations Analyst). The curriculum prepares for Security+ but does not integrate cloud security cert prep.',
    niceFramework: 'NICE PR-CDA-001: Applies security controls to cloud environments',
  },
  {
    num: 5,
    severity: 'Critical' as const,
    curriculumTeaches: 'Cisco-centric networking (CCNA Cyber Ops pathway)',
    employersRequire: 'Cloud networking and software-defined security (AWS VPC, Azure NSG, Terraform)',
    gap: 'Cisco CCNA Cyber Ops is a legacy track that does not align with cloud-first infrastructure. Employers need skills in AWS VPC design, Azure Network Security Groups, and infrastructure-as-code security (Terraform, CloudFormation). The curriculum is anchored to on-prem Cisco environments.',
    niceFramework: 'NICE PR-INF-002: Configures network security architecture',
  },
  {
    num: 6,
    severity: 'Moderate' as const,
    curriculumTeaches: 'Vulnerability scanning with Nessus and OpenVAS',
    employersRequire: 'Integrated vulnerability management (Tenable.io, Qualys VMDR, Rapid7 InsightVM)',
    gap: 'Nessus fundamentals are taught, but the curriculum does not cover continuous vulnerability management platforms, API integrations, or ticketing workflows (Jira, ServiceNow). Employers expect vulnerability data to drive remediation workflows, not just generate reports.',
    niceFramework: 'NICE OM-DTA-002: Conducts vulnerability assessments and prioritizes remediation',
  },
  {
    num: 7,
    severity: 'Moderate' as const,
    curriculumTeaches: 'Basic scripting (PowerShell, Bash) for automation tasks',
    employersRequire: 'Python for security automation, API integration, and threat intelligence',
    gap: 'PowerShell and Bash are covered lightly, but Python is the industry standard for security automation (SOAR platforms, API queries, threat intel feeds). Job postings from Microsoft, Amazon, and Google list Python as required or strongly preferred. Bellevue does not emphasize Python in the security context.',
    niceFramework: 'NICE OM-ANA-003: Automates data collection and analysis tasks',
  },
  {
    num: 8,
    severity: 'Moderate' as const,
    curriculumTeaches: 'Incident response theory and documentation',
    employersRequire: 'Hands-on SOAR (Security Orchestration, Automation, Response) and playbook execution',
    gap: 'Students learn the NIST incident response lifecycle but not how to execute it in modern SOAR platforms (Microsoft Sentinel, Splunk Phantom, Palo Alto Cortex XSOAR). Employers expect candidates to arrive with playbook automation experience.',
    niceFramework: 'NICE PR-CIR-001: Responds to cyber incidents and executes containment strategies',
  },
  {
    num: 9,
    severity: 'Moderate' as const,
    curriculumTeaches: 'Ethical hacking and penetration testing basics (CEH prep)',
    employersRequire: 'Cloud penetration testing and container security (Docker, Kubernetes)',
    gap: 'CEH focuses on traditional network/web app pentesting. Seattle employers increasingly deploy containerized workloads (Kubernetes, Docker) and need security professionals who can test cloud infrastructure and container misconfigurations. This is absent from the curriculum.',
    niceFramework: 'NICE OM-ANA-004: Performs penetration testing to identify weaknesses',
  },
  {
    num: 10,
    severity: 'Moderate' as const,
    curriculumTeaches: 'Cryptography theory (symmetric, asymmetric, hashing)',
    employersRequire: 'Applied cryptography in AWS KMS, Azure Key Vault, TLS/SSL configuration',
    gap: 'Crypto theory is taught well, but students are not learning how to implement cryptographic controls in cloud environments (AWS KMS key policies, Azure Key Vault access, certificate management). Practical application is missing.',
    niceFramework: 'NICE PR-CDA-002: Implements cryptographic controls to protect data',
  },
  {
    num: 11,
    severity: 'Minor' as const,
    curriculumTeaches: 'Risk assessment methodologies (qualitative, quantitative)',
    employersRequire: 'GRC platform experience (Archer, ServiceNow GRC, OneTrust)',
    gap: 'Risk assessment is taught conceptually, but students do not gain hands-on experience with Governance, Risk, and Compliance (GRC) platforms that operationalize risk management. Some employers list GRC platform experience as preferred.',
    niceFramework: 'OV-MGT-001: Conducts cybersecurity risk assessments',
  },
  {
    num: 12,
    severity: 'Minor' as const,
    curriculumTeaches: 'General compliance awareness (HIPAA, PCI-DSS)',
    employersRequire: 'NIST Cybersecurity Framework and Zero Trust architecture implementation',
    gap: 'The curriculum mentions NIST CSF and compliance standards but does not require students to map controls or design architectures. Employers expect candidates to implement NIST CSF and Zero Trust models, not just recite them.',
    niceFramework: 'OV-LGA-001: Applies compliance requirements to system design',
  },
  {
    num: 13,
    severity: 'Minor' as const,
    curriculumTeaches: 'Basic Linux administration for security contexts',
    employersRequire: 'Hardening cloud Linux instances and container security',
    gap: 'Linux skills are foundational but not extended to cloud-native environments. Employers want students to harden EC2 instances, configure IAM roles, and secure containerized Linux environments — not just manage local Linux servers.',
    niceFramework: 'NICE PR-INF-003: Hardens systems against attack',
  },
];

const employerSignals = [
  {
    employer: 'Microsoft (Redmond/Bellevue)',
    openings: '45+ cybersecurity roles (Q1 2026)',
    topSkills: ['Azure Security', 'Microsoft Sentinel', 'KQL', 'Threat hunting', 'Azure AD/Entra ID', 'Python'],
    certPreferences: ['Azure Security Engineer (AZ-500)', 'SC-200 (Security Operations)', 'CISSP', 'GIAC'],
    shift: 'Heavy emphasis on Microsoft cloud security stack. Sentinel SIEM and Entra ID expertise now baseline requirements for security analyst roles.',
  },
  {
    employer: 'Amazon Web Services (Seattle)',
    openings: '35+ security engineering positions',
    topSkills: ['AWS Security', 'GuardDuty', 'Security Hub', 'IAM', 'CloudTrail', 'Python', 'Terraform'],
    certPreferences: ['AWS Security Specialty', 'CISSP', 'OSCP'],
    shift: 'Cloud-native focus across all roles. Expects candidates to arrive with hands-on AWS security services experience, not just theoretical knowledge.',
  },
  {
    employer: 'Google (Kirkland/Seattle)',
    openings: '18+ security analyst roles',
    topSkills: ['GCP security', 'Chronicle SIEM', 'Threat detection', 'Python', 'Kubernetes security'],
    certPreferences: ['Google Cloud Security Engineer', 'CISSP', 'OSCP'],
    shift: 'Container security and GCP-native tools increasingly emphasized. Coding skills (Python, Go) expected for automation.',
  },
  {
    employer: 'T-Mobile (Bellevue)',
    openings: '12+ cybersecurity positions',
    topSkills: ['SIEM (Splunk)', 'Cloud security (AWS/Azure)', 'SOC operations', 'Incident response', 'Network security'],
    certPreferences: ['Security+', 'CySA+', 'CISSP', 'AWS/Azure Security'],
    shift: 'Hybrid cloud environment — requires multi-cloud security skills. Strong SOC analyst pipeline need with SIEM expertise.',
  },
  {
    employer: 'Meta (Seattle)',
    openings: '10+ security engineering roles',
    topSkills: ['Application security', 'Threat modeling', 'Python/C++', 'Cloud security', 'DevSecOps'],
    certPreferences: ['OSCP', 'AWS/GCP Security', 'GWAPT'],
    shift: 'AppSec and DevSecOps culture — security embedded in engineering. High coding bar for entry.',
  },
  {
    employer: 'Boeing (Seattle/Everett)',
    openings: '15+ IT security roles',
    topSkills: ['Network security', 'SIEM platforms', 'Compliance (NIST, CMMC)', 'Risk assessment', 'ICS/SCADA basics'],
    certPreferences: ['CISSP', 'CISM', 'Security+', 'GIAC'],
    shift: 'Defense contractor focus — NIST 800-171, CMMC compliance requirements. Hybrid on-prem + cloud security.',
  },
  {
    employer: 'Expedia Group (Seattle)',
    openings: '8+ application security engineers',
    topSkills: ['AppSec', 'AWS security', 'CI/CD security', 'Threat modeling', 'Python'],
    certPreferences: ['AWS Security', 'OSCP', 'GWAPT'],
    shift: 'Cloud-native travel platform — DevSecOps integration, AWS-heavy. Security automation expected.',
  },
];

const certToolCurrency = {
  currentlyCovered: [
    { name: 'CompTIA Security+', relevance: 'High', status: 'Still industry standard for entry-level', trend: 'up' as const },
    { name: 'CompTIA CySA+', relevance: 'Moderate', status: 'Mentioned in curriculum but not emphasized', trend: 'flat' as const },
    { name: 'CEH (Certified Ethical Hacker)', relevance: 'Moderate', status: 'Legacy pentesting cert — still valued but not cloud-focused', trend: 'down' as const },
    { name: 'Cisco CCNA Security/Cyber Ops', relevance: 'Low', status: 'Cisco-centric, on-prem focus — market has moved to cloud', trend: 'down' as const },
  ],
  missingCerts: [
    { name: 'AWS Certified Security – Specialty', relevance: 'Critical', demand: '71% of cloud security job postings in Seattle area' },
    { name: 'Microsoft Certified: Azure Security Engineer (AZ-500)', relevance: 'Critical', demand: '68% of cloud security job postings (Microsoft dominance)' },
    { name: 'Microsoft SC-200 (Security Operations Analyst)', relevance: 'High', demand: 'Sentinel SOC roles — growing rapidly' },
    { name: 'CISSP', relevance: 'High', demand: 'Standard for senior roles; Bellevue could prep fundamentals' },
    { name: 'GIAC Security Essentials (GSEC) or GCIH', relevance: 'Moderate', demand: 'Preferred by Boeing and defense contractors' },
  ],
  toolsCurrentlyTaught: [
    'Wireshark', 'Nessus', 'OpenVAS', 'Kali Linux', 'Metasploit', 'Windows Active Directory', 'PowerShell (basic)', 'Cisco Packet Tracer'
  ],
  toolsEmployersRequire: [
    'Microsoft Sentinel', 'Splunk Enterprise Security', 'Elastic SIEM', 'AWS Security Hub', 'Azure Defender/Sentinel', 
    'GuardDuty', 'KQL (Kusto Query Language)', 'Tenable.io / Qualys VMDR', 'Terraform', 'Python (boto3, requests, etc.)', 
    'Docker/Kubernetes security tools', 'Microsoft Entra ID', 'ServiceNow Security Operations'
  ],
};

const peerBenchmark = [
  {
    institution: 'University of Washington (Cybersecurity Certificate — Continuing Education)',
    strengths: [
      'Cloud security module with AWS and Azure hands-on labs',
      'Microsoft Sentinel and SIEM training integrated',
      'Python for security automation included',
      'Industry partnerships with Microsoft, Amazon, T-Mobile for guest lectures and internships',
    ],
    weaknesses: [
      'Non-credit program — not eligible for financial aid',
      'Higher cost (~$12,995 for 24-week program)',
    ],
    differentiator: 'UW brand + direct Microsoft/Amazon employer pipeline',
  },
  {
    institution: 'Tacoma Community College (Networking & Cybersecurity AAS)',
    strengths: [
      'Recently updated curriculum (2024) with Microsoft Azure integration',
      'CompTIA trifecta (A+, Network+, Security+) embedded',
      'Offers stackable certificates leading to AAS',
      'Partnership with T-Mobile and Boeing for internships',
    ],
    weaknesses: [
      'Less cloud-native emphasis compared to UW',
      'Limited SIEM platform training (mainly theory)',
    ],
    differentiator: 'Strong defense contractor and telecom focus (Boeing, T-Mobile)',
  },
  {
    institution: 'Seattle Central College (Cybersecurity AAS)',
    strengths: [
      'Cisco NetAcad CyberOps curriculum (updated 2024)',
      'Hands-on labs with Packet Tracer and virtual environments',
      'Security+ and CySA+ prep courses',
      'Affordable tuition (~$115/credit hour for in-state)',
    ],
    weaknesses: [
      'Still Cisco-centric — limited cloud platform exposure',
      'No advanced SIEM or SOAR training',
      'Lacks Python emphasis',
    ],
    differentiator: 'Strong Cisco partnership and NetAcad credentialing',
  },
  {
    institution: 'Bellevue College (Current State)',
    strengths: [
      'Established program with local employer recognition',
      'CompTIA Security+ and CEH prep included',
      'Affordable tuition (~$120/credit hour for in-state)',
      'Transfer pathways to UW and City University of Seattle',
    ],
    weaknesses: [
      'Curriculum has not been updated since 2020',
      'No cloud security certifications (AWS/Azure/Microsoft)',
      'Limited SIEM platform exposure (Wireshark-centric)',
      'Python not emphasized in security context',
      'No SOAR or cloud IAM coverage',
      'Microsoft Sentinel absent despite regional employer dominance',
    ],
    driftSummary: "Bellevue's curriculum is 4-5 years behind market demand. While foundational skills are solid, the lack of cloud-native security training — especially Microsoft Azure/Sentinel given regional employer mix — creates a critical employability gap.",
  },
];

const curriculumUpdates = {
  immediate: [
    {
      action: 'Add Microsoft Azure Fundamentals (AZ-900) and Azure Security module (16 hours)',
      effort: 'Low',
      impact: 'High',
      timeline: 'Spring 2026',
      owner: 'IT/Security faculty + Microsoft Learn partnership',
    },
    {
      action: 'Replace Wireshark-only network analysis with Microsoft Sentinel KQL training',
      effort: 'Medium',
      impact: 'High',
      timeline: 'Fall 2026',
      owner: 'IT faculty + Microsoft Academic partnership (free licenses)',
    },
    {
      action: 'Integrate Python for cybersecurity automation (8-week module)',
      effort: 'Medium',
      impact: 'High',
      timeline: 'Fall 2026',
      owner: 'Computer Science + IT faculty collaboration',
    },
    {
      action: 'Update Security+ curriculum to SY0-701 (current 2024 version)',
      effort: 'Low',
      impact: 'Medium',
      timeline: 'Summer 2026',
      owner: 'CompTIA Academy partnership refresh',
    },
  ],
  nextRevision: [
    {
      action: 'Launch Cloud Security Specialization track (Azure + AWS fundamentals → Security certs)',
      effort: 'High',
      impact: 'Critical',
      timeline: '2027 catalog year',
      owner: 'Curriculum committee + Microsoft/AWS partnerships',
    },
    {
      action: 'Replace Cisco CCNA Cyber Ops track with cloud networking security (Azure NSG, AWS VPC, Terraform)',
      effort: 'High',
      impact: 'High',
      timeline: '2027-2028',
      owner: 'IT Networking + Security faculty',
    },
    {
      action: 'Add SIEM/SOAR capstone project (Microsoft Sentinel + AWS Security Hub)',
      effort: 'Medium',
      impact: 'High',
      timeline: '2027',
      owner: 'Capstone redesign committee',
    },
    {
      action: 'Develop stackable micro-credential: Cloud IAM & Identity Security (Entra ID, AWS IAM, Okta)',
      effort: 'Medium',
      impact: 'Medium',
      timeline: '2027',
      owner: 'Workforce development + continuing education',
    },
  ],
  strategic: [
    {
      action: 'Formalize industry advisory board with Microsoft, Amazon, T-Mobile, Boeing, Google security leaders',
      effort: 'Low',
      impact: 'Critical',
      timeline: 'Q2 2026',
      owner: 'Dean of IT + Workforce Development',
    },
    {
      action: 'Establish paid internship pipeline with Seattle tech employers (Microsoft, Amazon, Google, T-Mobile)',
      effort: 'Medium',
      impact: 'High',
      timeline: '2026-2027',
      owner: 'Career services + employer relations',
    },
    {
      action: 'Launch evening/weekend cohort for working professionals (cybersecurity upskilling)',
      effort: 'Medium',
      impact: 'Medium',
      timeline: '2027',
      owner: 'Scheduling + workforce development',
    },
    {
      action: 'Pursue NSA/DHS CAE-CD (Center of Academic Excellence in Cyber Defense) designation',
      effort: 'High',
      impact: 'High',
      timeline: '2027-2029',
      owner: 'Administration + curriculum committee',
    },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BellevueCybersecurityDriftPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* ═══════════ DISCLAIMER BANNER ═══════════ */}
      <div className="w-full bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
          📋 Sample Report for demonstration purposes — data synthesized from public sources and industry trends (February 2026)
        </p>
      </div>

      {/* ═══════════ A. HERO + OVERVIEW ═══════════ */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-32 lg:pt-36 pb-16">
        <Stars count={140} />
        <Aurora className="opacity-70" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">Curriculum Drift Analysis · Sample Report</span>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="font-heading font-bold text-gradient-cosmic leading-[1.05] mx-auto max-w-4xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4rem)' }}
            >
              Bellevue College
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={180} duration={800}>
            <p className="mt-4 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed">
              Cybersecurity AAS · Bellevue, Washington · Analysis Date: February 2026
            </p>
          </AnimateOnScroll>

          {/* Drift Score Banner */}
          <AnimateOnScroll variant="fade-up" delay={260} duration={800}>
            <div className="mt-8 inline-block bg-rose-500/10 border border-rose-500/30 rounded-2xl px-8 py-4">
              <p className="text-rose-700 dark:text-rose-400 font-heading font-bold text-2xl md:text-3xl">
                DRIFT SCORE: 42 / 100
              </p>
              <p className="text-sm text-theme-secondary mt-1">
                Lower scores indicate more drift · 100 = perfect alignment
              </p>
            </div>
          </AnimateOnScroll>

          {/* Stat Pills */}
          <AnimateOnScroll variant="fade-up" delay={340} duration={800}>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                54 Competencies Analyzed
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                13 Gaps Identified
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                143 Employer Signals
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                Last Updated: 2020
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

      {/* ═══════════ B. DRIFT SCORE DASHBOARD ═══════════ */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Drift Score Dashboard</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Five dimensions. One warning signal.
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="mt-10 card-cosmic rounded-2xl overflow-hidden">
              {driftDimensions.map((d, i) => (
                <div
                  key={d.name}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    i < driftDimensions.length - 1 ? 'border-b border-theme-subtle' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-theme-primary">{d.name}</p>
                    <p className="text-xs text-theme-muted">{d.description}</p>
                  </div>
                  <div className="w-24 sm:w-32">
                    <div className="h-1.5 rounded-full bg-theme-surface overflow-hidden">
                      <div
                        className={`h-full rounded-full ${driftScoreBg(d.score)}`}
                        style={{ width: `${d.score}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-lg font-bold font-mono w-12 text-right ${driftScoreColor(d.score)}`}>
                    {d.score}
                  </span>
                </div>
              ))}

              {/* Overall row */}
              <div className="flex items-center gap-4 px-5 py-5 bg-rose-500/5 border-t-2 border-rose-500/30">
                <div className="flex-1">
                  <p className="text-base font-heading font-bold text-theme-primary">OVERALL DRIFT SCORE</p>
                  <p className="text-xs text-theme-muted">Composite across 5 dimensions</p>
                </div>
                <div className="w-24 sm:w-32">
                  <div className="h-1.5 rounded-full bg-theme-surface overflow-hidden">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{ width: `${overallDriftScore}%` }}
                    />
                  </div>
                </div>
                <span className="text-xl font-bold font-mono w-12 text-right text-rose-600 dark:text-rose-400">
                  {overallDriftScore}
                </span>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Callout */}
          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="mt-6 card-cosmic rounded-xl p-5 border-rose-500/30 bg-rose-500/5">
              <p className="text-sm text-theme-primary leading-relaxed">
                <span className="font-bold">⚠️ Significant Drift Detected:</span> Score of 42/100 indicates the curriculum has drifted substantially from current employer requirements. Tool/Platform Currency (29/100) and Technical Skills Alignment (38/100) are critical concern areas.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ C. EXECUTIVE SUMMARY ═══════════ */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Executive Summary</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              How bad is the drift?
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="mt-8 space-y-6">
            <div className="card-cosmic rounded-2xl p-6">
              <h3 className="font-heading font-bold text-lg text-theme-primary mb-3">The Problem</h3>
              <p className="text-theme-secondary leading-relaxed">
                Bellevue College's Cybersecurity AAS program, last updated in 2020, has experienced severe curriculum drift. With a composite drift score of 42/100, the program is teaching a cybersecurity paradigm that Seattle's dominant tech employers — Microsoft, Amazon, Google, T-Mobile, Meta, Boeing, and Expedia — have moved beyond. The curriculum is rooted in on-premises perimeter security (firewalls, Cisco networking, Active Directory) at a time when these employers have shifted to cloud-native infrastructure, zero-trust architecture, and SIEM-driven security operations.
              </p>
            </div>

            <div className="card-cosmic rounded-2xl p-6">
              <h3 className="font-heading font-bold text-lg text-theme-primary mb-3">What's Causing It?</h3>
              <p className="text-theme-secondary leading-relaxed">
                The drift is driven by three structural issues: (1) <span className="font-semibold text-theme-primary">No cloud security training</span> — AWS, Azure, and cloud IAM are entirely absent despite appearing in 71% of Seattle cybersecurity job postings (with Azure/Microsoft dominance given regional employer mix); (2) <span className="font-semibold text-theme-primary">Outdated tooling</span> — students learn Wireshark packet capture but not enterprise SIEM platforms (Microsoft Sentinel, Splunk, Elastic) that employers actually use; (3) <span className="font-semibold text-theme-primary">Cisco-centric networking</span> — the curriculum is anchored to CCNA Cyber Ops, a legacy track that does not prepare students for software-defined cloud networking. Peer institutions (Tacoma Community College, UW) have already integrated Azure and SIEM training; Bellevue has not.
              </p>
            </div>

            <div className="card-cosmic rounded-2xl p-6">
              <h3 className="font-heading font-bold text-lg text-theme-primary mb-3">The Risk</h3>
              <p className="text-theme-secondary leading-relaxed">
                Graduates are arriving to the Seattle job market undertrained for the roles employers are hiring for. Job postings from Microsoft, Amazon, and T-Mobile explicitly require Microsoft Sentinel, AWS security services, and Python automation — competencies Bellevue does not emphasize. This creates a placement risk: students who successfully complete the AAS may struggle to compete against candidates from UW's continuing education cybersecurity program or Tacoma Community College's updated curriculum. Over time, employer feedback loops will damage Bellevue's reputation as a cybersecurity talent source, threatening enrollment and advisory board engagement.
              </p>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════ D. COMPETENCY GAP ANALYSIS ═══════════ */}
      <section className="relative py-16 md:py-24 bg-theme-surface/30">
        <div className="max-w-[1100px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Competency Gap Analysis</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                What you teach vs. What employers need
              </h2>
              <p className="mt-3 text-theme-secondary max-w-2xl mx-auto text-sm">
                Side-by-side analysis of 13 critical competency gaps. Each gap mapped to the NICE Cybersecurity Workforce Framework.
              </p>
            </div>
          </AnimateOnScroll>

          <StaggerChildren stagger={60} variant="fade-up" className="space-y-5">
            {competencyGaps.map((gap) => (
              <div key={gap.num} className="card-cosmic rounded-xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-400">
                      {gap.num}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${severityBadge(gap.severity)}`}>
                      {gap.severity}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-theme-muted">{gap.niceFramework}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-bold uppercase tracking-wider text-theme-muted">Curriculum Teaches</p>
                    </div>
                    <p className="text-sm text-theme-secondary leading-relaxed">{gap.curriculumTeaches}</p>
                  </div>

                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-bold uppercase tracking-wider text-theme-muted">Employers Require</p>
                    </div>
                    <p className="text-sm text-theme-secondary leading-relaxed">{gap.employersRequire}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-theme-subtle">
                  <p className="text-xs font-bold uppercase tracking-wider text-theme-muted mb-2">Gap Analysis</p>
                  <p className="text-sm text-theme-secondary leading-relaxed">{gap.gap}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════ E. EMPLOYER SIGNAL ANALYSIS ═══════════ */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Employer Signal Analysis</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                What Seattle tech employers actually post
              </h2>
              <p className="mt-3 text-theme-secondary max-w-2xl mx-auto text-sm">
                Analysis of 143 cybersecurity job postings from Seattle-area employers (Q4 2025 – Q1 2026). Skills and certifications ranked by frequency.
              </p>
            </div>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="space-y-5">
            {employerSignals.map((signal, i) => (
              <div key={i} className="card-cosmic rounded-xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-theme-primary">{signal.employer}</h3>
                    <p className="text-xs text-theme-muted mt-0.5">{signal.openings}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-theme-muted mb-2">Top Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {signal.topSkills.map((skill) => (
                        <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-theme-muted mb-2">Certification Preferences</p>
                    <div className="flex flex-wrap gap-1.5">
                      {signal.certPreferences.map((cert) => (
                        <span key={cert} className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-theme-subtle">
                  <p className="text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">How Requirements Have Shifted</p>
                  <p className="text-sm text-theme-secondary leading-relaxed italic">{signal.shift}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>

          {/* Summary Card */}
          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="mt-10 rounded-xl p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <h3 className="font-heading font-bold text-lg text-theme-primary mb-3">Key Trends Across Seattle Employers</h3>
              <ul className="space-y-2 text-sm text-theme-secondary">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span><span className="font-semibold text-theme-primary">Cloud security (Azure/AWS)</span> appears in 71% of postings — up from 38% in 2022</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span><span className="font-semibold text-theme-primary">Microsoft Sentinel / Azure Defender</span> required in 68% of SOC analyst roles (Microsoft regional dominance)</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span><span className="font-semibold text-theme-primary">Python automation</span> listed in 62% of postings — up from 27% in 2022</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span><span className="font-semibold text-theme-primary">Cisco CCNA Security</span> mentioned in only 9% of postings — down from 34% in 2022</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span><span className="font-semibold text-theme-primary">Traditional perimeter firewalls</span> as primary skill down to 15% — replaced by cloud-native security</span>
                </li>
              </ul>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ F. CERTIFICATION & TOOL CURRENCY ═══════════ */}
      <section className="relative py-16 md:py-24 bg-theme-surface/30">
        <div className="max-w-[1100px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Certification & Tool Currency</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                Are you preparing students for the right credentials?
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Currently Covered Certs */}
            <AnimateOnScroll variant="fade-up">
              <div className="card-cosmic rounded-xl p-6">
                <h3 className="font-heading font-bold text-lg text-theme-primary mb-4">Certifications Currently Covered</h3>
                <div className="space-y-3">
                  {certToolCurrency.currentlyCovered.map((cert) => (
                    <div key={cert.name} className="flex items-start gap-3 p-3 rounded-lg bg-theme-surface/50 border border-theme-subtle">
                      <div className="flex-shrink-0 mt-0.5">
                        {cert.trend === 'up' && <TrendingUp className="w-4 h-4 text-teal-500" />}
                        {cert.trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-500" />}
                        {cert.trend === 'flat' && <span className="w-4 h-4 flex items-center justify-center text-amber-500">—</span>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-theme-primary">{cert.name}</p>
                        <p className="text-xs text-theme-muted mt-0.5">{cert.status}</p>
                        <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cert.relevance === 'High' 
                            ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20'
                            : cert.relevance === 'Moderate'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                          {cert.relevance} Relevance
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>

            {/* Missing Certs */}
            <AnimateOnScroll variant="fade-up" delay={80}>
              <div className="card-cosmic rounded-xl p-6 border-rose-500/30 bg-rose-500/5">
                <h3 className="font-heading font-bold text-lg text-theme-primary mb-4">Missing Certifications</h3>
                <div className="space-y-3">
                  {certToolCurrency.missingCerts.map((cert) => (
                    <div key={cert.name} className="flex items-start gap-3 p-3 rounded-lg bg-theme-surface/50 border border-theme-subtle">
                      <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-theme-primary">{cert.name}</p>
                        <p className="text-xs text-theme-muted mt-0.5">{cert.demand}</p>
                        <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cert.relevance === 'Critical' 
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {cert.relevance}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Tools Comparison */}
          <AnimateOnScroll variant="fade-up" delay={120}>
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="card-cosmic rounded-xl p-6">
                <h3 className="font-heading font-bold text-base text-theme-primary mb-3">Tools Currently Taught</h3>
                <div className="flex flex-wrap gap-2">
                  {certToolCurrency.toolsCurrentlyTaught.map((tool) => (
                    <span key={tool} className="text-xs px-2.5 py-1 rounded-full bg-theme-surface border border-theme-subtle text-theme-secondary">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card-cosmic rounded-xl p-6 border-teal-500/30 bg-teal-500/5">
                <h3 className="font-heading font-bold text-base text-theme-primary mb-3">Tools Employers Require</h3>
                <div className="flex flex-wrap gap-2">
                  {certToolCurrency.toolsEmployersRequire.map((tool) => (
                    <span key={tool} className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ G. PEER BENCHMARK ═══════════ */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Peer Benchmark</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                How do peer programs compare?
              </h2>
              <p className="mt-3 text-theme-secondary max-w-2xl mx-auto text-sm">
                Analysis of cybersecurity programs at UW, Tacoma Community College, and Seattle Central College.
              </p>
            </div>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="space-y-5">
            {peerBenchmark.map((peer, i) => (
              <div key={i} className={`card-cosmic rounded-xl p-6 ${peer.institution.includes('Bellevue') ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
                <div className="mb-4">
                  <h3 className="font-heading font-bold text-lg text-theme-primary">{peer.institution}</h3>
                  {peer.differentiator && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 italic">💡 {peer.differentiator}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2">Strengths</p>
                    <ul className="space-y-1.5">
                      {peer.strengths.map((s, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-theme-secondary">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">Weaknesses</p>
                    <ul className="space-y-1.5">
                      {peer.weaknesses.map((w, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-theme-secondary">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {peer.driftSummary && (
                  <div className="mt-4 pt-4 border-t border-theme-subtle">
                    <p className="text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">Drift Assessment</p>
                    <p className="text-sm text-theme-secondary leading-relaxed">{peer.driftSummary}</p>
                  </div>
                )}
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════ H. RECOMMENDED CURRICULUM UPDATES ═══════════ */}
      <section className="relative py-16 md:py-24 bg-theme-surface/30">
        <div className="max-w-[1100px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-12">
              <span className="overline">Recommended Curriculum Updates</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                Priority Matrix: What to fix and when
              </h2>
            </div>
          </AnimateOnScroll>

          {/* Immediate Actions */}
          <AnimateOnScroll variant="fade-up">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚡</span>
                <h3 className="font-heading font-bold text-xl text-theme-primary">Immediate (This Semester)</h3>
              </div>
              <div className="space-y-3">
                {curriculumUpdates.immediate.map((action, i) => (
                  <div key={i} className="card-cosmic rounded-xl p-5 border-teal-500/30 bg-teal-500/5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-theme-primary flex-1">{action.action}</p>
                      <div className="flex gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          action.effort === 'Low' 
                            ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {action.effort} Effort
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          action.impact === 'High'
                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                        }`}>
                          {action.impact} Impact
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-theme-muted">
                      <span>Timeline: {action.timeline}</span>
                      <span>·</span>
                      <span>Owner: {action.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          {/* Next Revision Cycle */}
          <AnimateOnScroll variant="fade-up" delay={80}>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔨</span>
                <h3 className="font-heading font-bold text-xl text-theme-primary">Next Revision Cycle (2027)</h3>
              </div>
              <div className="space-y-3">
                {curriculumUpdates.nextRevision.map((action, i) => (
                  <div key={i} className="card-cosmic rounded-xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-theme-primary flex-1">{action.action}</p>
                      <div className="flex gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          action.effort === 'High' 
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {action.effort} Effort
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          action.impact === 'Critical'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                            : action.impact === 'High'
                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                        }`}>
                          {action.impact} Impact
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-theme-muted">
                      <span>Timeline: {action.timeline}</span>
                      <span>·</span>
                      <span>Owner: {action.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          {/* Strategic Initiatives */}
          <AnimateOnScroll variant="fade-up" delay={120}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔭</span>
                <h3 className="font-heading font-bold text-xl text-theme-primary">Strategic Initiatives (2027+)</h3>
              </div>
              <div className="space-y-3">
                {curriculumUpdates.strategic.map((action, i) => (
                  <div key={i} className="card-cosmic rounded-xl p-5 border-purple-500/30 bg-purple-500/5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-theme-primary flex-1">{action.action}</p>
                      <div className="flex gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          action.effort === 'High' 
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                            : action.effort === 'Medium'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20'
                        }`}>
                          {action.effort} Effort
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          action.impact === 'Critical'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20'
                        }`}>
                          {action.impact} Impact
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-theme-muted">
                      <span>Timeline: {action.timeline}</span>
                      <span>·</span>
                      <span>Owner: {action.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ I. METHODOLOGY ═══════════ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-10">
              <span className="overline">Methodology</span>
              <h2
                className="font-heading font-bold text-theme-primary mt-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
              >
                How drift is measured
              </h2>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={80}>
            <div className="card-cosmic rounded-2xl p-7">
              <h3 className="font-heading font-bold text-lg text-theme-primary mb-4">Data Sources</h3>
              <ul className="space-y-2.5 text-sm text-theme-secondary">
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span><span className="font-semibold text-theme-primary">NICE Cybersecurity Workforce Framework</span> — 52 work roles and 1,000+ KSAs (Knowledge, Skills, Abilities) mapped to curriculum</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span><span className="font-semibold text-theme-primary">O*NET Database (SOC 15-1212, 15-1299)</span> — Information Security Analysts task data and emerging skills trends</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span><span className="font-semibold text-theme-primary">Employer Job Postings (SerpAPI)</span> — 143 cybersecurity job postings from Microsoft, Amazon, Google, T-Mobile, Meta, Boeing, Expedia (Q4 2025 – Q1 2026)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span><span className="font-semibold text-theme-primary">CyberSeek.org</span> — Regional labor market data for Seattle-Bellevue-Tacoma MSA</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span><span className="font-semibold text-theme-primary">BLS Occupational Outlook</span> — National employment and wage trends for cybersecurity roles</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span><span className="font-semibold text-theme-primary">Peer Program Curricula</span> — Published learning outcomes from UW, Tacoma CC, Seattle Central College</span>
                </li>
              </ul>

              <h3 className="font-heading font-bold text-lg text-theme-primary mt-6 mb-4">Drift Scoring Algorithm</h3>
              <div className="space-y-3 text-sm text-theme-secondary leading-relaxed">
                <p>
                  Curriculum drift is scored on a 0-100 scale where <span className="font-semibold text-theme-primary">higher scores = better alignment</span> (less drift). The composite score is calculated across five dimensions:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li><span className="font-semibold text-theme-primary">Technical Skills Alignment:</span> Percentage of employer-required technical competencies (NICE Framework KSAs) covered in curriculum</li>
                  <li><span className="font-semibold text-theme-primary">Certification Relevance:</span> Weighted score of certification prep courses based on employer demand frequency</li>
                  <li><span className="font-semibold text-theme-primary">Tool/Platform Currency:</span> Overlap between tools taught vs. tools required in job postings (weighted by posting frequency)</li>
                  <li><span className="font-semibold text-theme-primary">Soft Skills Coverage:</span> Coverage of NICE professional competencies (communication, teamwork, incident response documentation)</li>
                  <li><span className="font-semibold text-theme-primary">Industry Standards Compliance:</span> Integration of NIST CSF, Zero Trust, ISO 27001, and regulatory frameworks</li>
                </ol>
                <p className="pt-2">
                  Each dimension is scored independently, then weighted and combined into the overall drift score. Scores below 50 indicate severe drift; 50-75 moderate drift; 75+ minimal drift.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ J. CTA ═══════════ */}
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
                  <span>Full competency gap analysis (NICE Framework mapped)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span>Regional employer signal analysis (job posting data)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span>Peer program benchmark (3-5 comparable institutions)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span>Prioritized curriculum update roadmap</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span>Quarterly drift monitoring updates</span>
                </li>
              </ul>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
