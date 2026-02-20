import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { PrintButton } from '@/components/ui/PrintButton';

export const metadata: Metadata = {
  title: 'Grant Intelligence Scan — Sinclair Community College | Wavelength Sample Report',
  description:
    'Complete Grant Intelligence Scan for Sinclair Community College. 22 grants identified, $8.4M+ in eligible funding, 47 programs scanned across advanced manufacturing, healthcare, IT, and logistics.',
  alternates: { canonical: 'https://withwavelength.com/report/sinclair-grant-scan' },
  openGraph: {
    title: 'Grant Intelligence Scan — Sinclair Community College',
    description:
      '22 federal, state, and foundation grants identified. $8.4M+ in eligible annual funding. 13 high-value unfunded opportunities mapped across the entire program portfolio.',
    url: 'https://withwavelength.com/report/sinclair-grant-scan',
    type: 'article',
  },
};

// ─── Badge Helpers ────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const map: Record<string, string> = {
    'Eligible & Funded': 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20',
    'Eligible & Unfunded': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
    'Not Eligible': 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20',
  };
  return map[status] ?? 'bg-theme-surface text-theme-secondary border border-theme-subtle';
}

function complexityBadge(complexity: string) {
  const map: Record<string, string> = {
    Low: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20',
    Medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
    High: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
  };
  return map[complexity] ?? 'bg-theme-surface text-theme-secondary border border-theme-subtle';
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const portfolioSummary = {
  totalGrants: 22,
  programsScanned: 47,
  totalEligibleFunding: '$8.4M+',
  unfundedPrograms: 13,
  currentlyCaptured: '$2.1M',
  uncaptured: '$6.3M+',
  breakdown: {
    federal: 12,
    state: 7,
    foundation: 3,
  },
};

const grants = [
  // FEDERAL
  {
    name: 'Perkins V — Career & Technical Education State Grants',
    type: 'Federal',
    funder: 'U.S. Department of Education',
    eligiblePrograms: 31,
    estimatedAnnual: '$450,000 - $680,000',
    currentStatus: 'Eligible & Funded',
    cipCodes: '15.xxxx (Engineering Tech), 47.xxxx (Mechanics & Repair), 51.xxxx (Health), 52.xxxx (Business)',
    applicationCycle: 'Annual state allocation',
    matchRequired: '0%',
  },
  {
    name: 'WIOA Adult & Dislocated Worker Formula Grants',
    type: 'Federal',
    funder: 'U.S. Department of Labor / OhioMeansJobs',
    eligiblePrograms: 38,
    estimatedAnnual: '$380,000 - $520,000',
    currentStatus: 'Eligible & Funded',
    cipCodes: 'ETPL-eligible programs (all workforce certificates & diplomas)',
    applicationCycle: 'Annual state allocation via OhioMeansJobs',
    matchRequired: '0%',
  },
  {
    name: 'NSF ATE — Advanced Technological Education',
    type: 'Federal',
    funder: 'National Science Foundation',
    eligiblePrograms: 18,
    estimatedAnnual: '$300,000 - $900,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: '15.xxxx (Engineering Tech), 11.xxxx (Computer/IT), 41.xxxx (Science Tech)',
    applicationCycle: 'Annual (Oct deadline)',
    matchRequired: '0%',
  },
  {
    name: 'DOL Apprenticeship Building America (ABA)',
    type: 'Federal',
    funder: 'U.S. Department of Labor',
    eligiblePrograms: 22,
    estimatedAnnual: '$500,000 - $1,200,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Registered Apprenticeship-eligible (manufacturing, healthcare, IT, construction)',
    applicationCycle: 'Annual competitive (Spring)',
    matchRequired: '25% employer/industry cash or in-kind',
  },
  {
    name: 'DOL H-1B One Workforce Grant Program',
    type: 'Federal',
    funder: 'U.S. Department of Labor ETA',
    eligiblePrograms: 15,
    estimatedAnnual: '$1,500,000 - $3,000,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'High-demand technical fields (IT, healthcare, advanced manufacturing)',
    applicationCycle: 'Biennial competitive (2026 expected)',
    matchRequired: '25% non-federal',
  },
  {
    name: 'TAACCCT — Trade Adjustment Assistance',
    type: 'Federal',
    funder: 'U.S. Department of Labor (if reauthorized)',
    eligiblePrograms: 26,
    estimatedAnnual: '$800,000 - $2,000,000',
    currentStatus: 'Not Currently Available',
    cipCodes: 'Manufacturing, logistics, healthcare (workers displaced by trade)',
    applicationCycle: 'Pending Congressional reauthorization',
    matchRequired: '0%',
  },
  {
    name: 'NIST MEP — Manufacturing Extension Partnership',
    type: 'Federal',
    funder: 'National Institute of Standards and Technology',
    eligiblePrograms: 8,
    estimatedAnnual: '$120,000 - $250,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: '15.xxxx (Engineering Tech), 48.05xx (Precision Manufacturing)',
    applicationCycle: 'Annual via Ohio MEP',
    matchRequired: '50% industry',
  },
  {
    name: 'NSF IUSE — Improving Undergraduate STEM Education',
    type: 'Federal',
    funder: 'National Science Foundation',
    eligiblePrograms: 12,
    estimatedAnnual: '$300,000 - $600,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'STEM programs (engineering tech, computer science, science tech)',
    applicationCycle: 'Annual (Aug deadline)',
    matchRequired: '0%',
  },
  {
    name: 'EDA — Economic Development Administration Workforce Grants',
    type: 'Federal',
    funder: 'U.S. Department of Commerce',
    eligiblePrograms: 19,
    estimatedAnnual: '$400,000 - $1,000,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Regional priority sectors (manufacturing, logistics, healthcare)',
    applicationCycle: 'Rolling',
    matchRequired: '20% non-federal',
  },
  {
    name: 'DOL YouthBuild',
    type: 'Federal',
    funder: 'U.S. Department of Labor',
    eligiblePrograms: 5,
    estimatedAnnual: '$80,000 - $180,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Construction trades (HVAC, electrical, plumbing, carpentry)',
    applicationCycle: 'Annual competitive',
    matchRequired: '25% match (can be in-kind)',
  },
  {
    name: 'EPA Environmental Workforce Development',
    type: 'Federal',
    funder: 'U.S. Environmental Protection Agency',
    eligiblePrograms: 3,
    estimatedAnnual: '$60,000 - $120,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Environmental tech, water/wastewater tech, sustainability',
    applicationCycle: 'Annual',
    matchRequired: '20%',
  },
  {
    name: 'HHS HRSA — Allied Health Workforce',
    type: 'Federal',
    funder: 'U.S. Dept of Health & Human Services',
    eligiblePrograms: 14,
    estimatedAnnual: '$250,000 - $500,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: '51.xxxx (Allied Health — nursing assistants, medical assisting, dental, surgical tech)',
    applicationCycle: 'Varies by program',
    matchRequired: '0%',
  },
  // STATE
  {
    name: 'Ohio TechCred',
    type: 'State',
    funder: 'Ohio Department of Higher Education',
    eligiblePrograms: 27,
    estimatedAnnual: '$320,000 - $580,000',
    currentStatus: 'Eligible & Funded',
    cipCodes: 'Technology-focused credentials (IT, cybersecurity, manufacturing tech, healthcare IT)',
    applicationCycle: 'Biannual cohorts',
    matchRequired: 'Employer-paid (reimbursement model)',
  },
  {
    name: 'OhioMeansJobs Workforce Training Grants',
    type: 'State',
    funder: 'Ohio Dept of Job & Family Services',
    eligiblePrograms: 35,
    estimatedAnnual: '$280,000 - $420,000',
    currentStatus: 'Eligible & Funded',
    cipCodes: 'In-demand occupations (all workforce programs)',
    applicationCycle: 'Annual via local workforce boards',
    matchRequired: '0% for training providers',
  },
  {
    name: 'Choose Ohio First — STEM Scholarships',
    type: 'State',
    funder: 'Ohio Department of Higher Education',
    eligiblePrograms: 9,
    estimatedAnnual: '$150,000 - $280,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'STEM programs (engineering tech, computer science, health sciences)',
    applicationCycle: 'Annual competitive',
    matchRequired: '1:1 institutional match',
  },
  {
    name: 'Ohio Manufacturing Extension Partnership Grants',
    type: 'State',
    funder: 'Ohio Development Services Agency',
    eligiblePrograms: 11,
    estimatedAnnual: '$80,000 - $160,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Manufacturing programs (CNC, welding, industrial maintenance, quality)',
    applicationCycle: 'Rolling',
    matchRequired: '50% industry',
  },
  {
    name: 'Third Frontier Incumbent Workforce Training',
    type: 'State',
    funder: 'Ohio Development Services Agency',
    eligiblePrograms: 16,
    estimatedAnnual: '$120,000 - $240,000',
    currentStatus: 'Eligible & Funded',
    cipCodes: 'Advanced manufacturing, IT, bioscience, aerospace',
    applicationCycle: 'Annual',
    matchRequired: '25% employer',
  },
  {
    name: 'Ohio Incumbent Workforce Training Voucher',
    type: 'State',
    funder: 'Ohio Department of Higher Education',
    eligiblePrograms: 28,
    estimatedAnnual: '$180,000 - $340,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Short-term credentials for incumbent workers (all sectors)',
    applicationCycle: 'Biannual',
    matchRequired: '50% employer',
  },
  {
    name: 'Ohio College2Careers Credentials Completion',
    type: 'State',
    funder: 'Ohio Dept of Higher Education',
    eligiblePrograms: 21,
    estimatedAnnual: '$100,000 - $220,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'High-demand stackable credentials (healthcare, IT, manufacturing, construction)',
    applicationCycle: 'Annual',
    matchRequired: '0%',
  },
  // FOUNDATION & INDUSTRY
  {
    name: 'Dayton Foundation Workforce Development',
    type: 'Foundation',
    funder: 'Dayton Foundation',
    eligiblePrograms: 18,
    estimatedAnnual: '$60,000 - $120,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Programs serving underrepresented populations (healthcare, skilled trades)',
    applicationCycle: 'Quarterly',
    matchRequired: 'Varies',
  },
  {
    name: 'Lumina Foundation Workforce Pathways',
    type: 'Foundation',
    funder: 'Lumina Foundation',
    eligiblePrograms: 24,
    estimatedAnnual: '$200,000 - $500,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Stackable credential pathways (all sectors)',
    applicationCycle: 'Invitation only',
    matchRequired: 'Varies',
  },
  {
    name: 'Honda Heritage Center Manufacturing Skills',
    type: 'Industry',
    funder: 'Honda of America Mfg.',
    eligiblePrograms: 7,
    estimatedAnnual: '$40,000 - $80,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Advanced manufacturing (robotics, welding, industrial maintenance)',
    applicationCycle: 'By partnership agreement',
    matchRequired: 'In-kind equipment/instruction',
  },
];

const eligibilityMatrix = {
  programs: [
    'Advanced Manufacturing Technology',
    'CNC Machining Technology',
    'Welding Technology',
    'Industrial Electronics',
    'Mechatronics Engineering Technology',
    'Quality Assurance Technology',
    'Logistics & Supply Chain Management',
    'Nursing (RN)',
    'Practical Nursing (LPN)',
    'Medical Assisting',
    'Surgical Technology',
    'Pharmacy Technician',
    'Dental Hygiene',
    'Health Information Technology',
    'Cybersecurity',
    'Network Systems Administration',
    'Software Development',
    'Database Management',
    'HVAC Technology',
    'Electrical Technology',
  ],
  grantsShort: [
    'Perkins V',
    'WIOA',
    'NSF ATE',
    'DOL Apprenticeship',
    'H-1B',
    'TechCred',
    'OhioMeansJobs',
    'Third Frontier',
  ],
};

const matrixData: Record<string, Record<string, 'funded' | 'unfunded' | 'none'>> = {
  'Advanced Manufacturing Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'TechCred': 'funded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'funded' },
  'CNC Machining Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'TechCred': 'funded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'unfunded' },
  'Welding Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'TechCred': 'unfunded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'unfunded' },
  'Industrial Electronics': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'TechCred': 'funded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'unfunded' },
  'Mechatronics Engineering Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'TechCred': 'funded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'unfunded' },
  'Quality Assurance Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'none', 'H-1B': 'none', 'TechCred': 'unfunded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'unfunded' },
  'Logistics & Supply Chain Management': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'none', 'H-1B': 'unfunded', 'TechCred': 'unfunded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'none' },
  'Nursing (RN)': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'TechCred': 'none', 'OhioMeansJobs': 'funded', 'Third Frontier': 'none' },
  'Practical Nursing (LPN)': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'TechCred': 'none', 'OhioMeansJobs': 'funded', 'Third Frontier': 'none' },
  'Medical Assisting': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'TechCred': 'unfunded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'none' },
  'Surgical Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'none', 'H-1B': 'unfunded', 'TechCred': 'none', 'OhioMeansJobs': 'funded', 'Third Frontier': 'none' },
  'Pharmacy Technician': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'none', 'H-1B': 'none', 'TechCred': 'unfunded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'none' },
  'Dental Hygiene': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'none', 'H-1B': 'none', 'TechCred': 'none', 'OhioMeansJobs': 'funded', 'Third Frontier': 'none' },
  'Health Information Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'none', 'H-1B': 'unfunded', 'TechCred': 'funded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'none' },
  'Cybersecurity': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'TechCred': 'funded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'unfunded' },
  'Network Systems Administration': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'TechCred': 'funded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'none' },
  'Software Development': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'TechCred': 'funded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'unfunded' },
  'Database Management': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'none', 'H-1B': 'unfunded', 'TechCred': 'funded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'none' },
  'HVAC Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'TechCred': 'unfunded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'none' },
  'Electrical Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'TechCred': 'unfunded', 'OhioMeansJobs': 'funded', 'Third Frontier': 'none' },
};

const unfundedOpportunities = [
  {
    rank: 1,
    program: 'Cybersecurity & Network Systems',
    grants: ['NSF ATE', 'DOL H-1B', 'DOL Apprenticeship'],
    estimatedAnnual: '$1,200,000 - $2,500,000',
    complexity: 'Medium',
    nextDeadline: 'Oct 2026 (NSF ATE)',
    rationale: 'High-demand IT programs with strong regional employer need (Wright-Patterson AFB, CareSource, other tech employers). NSF ATE has funded similar cybersecurity consortia at community colleges. H-1B One Workforce targets high-skill technical training. Apprenticeship model is emerging in cybersecurity sector.',
  },
  {
    rank: 2,
    program: 'Advanced Manufacturing (Mechatronics, Industrial Electronics, Quality)',
    grants: ['NSF ATE', 'DOL Apprenticeship', 'NIST MEP', 'Third Frontier Incumbent'],
    estimatedAnnual: '$800,000 - $1,800,000',
    complexity: 'Medium',
    nextDeadline: 'Oct 2026 (NSF ATE)',
    rationale: 'Sinclair has strong manufacturing infrastructure and regional employer partnerships (Honda/Lordstown, aerospace suppliers serving Wright-Patt). NSF ATE manufacturing grants are competitive but achievable with multi-employer consortia. MEP grants require 50% industry match but smaller award amounts are accessible.',
  },
  {
    rank: 3,
    program: 'Healthcare (Nursing, Surgical Tech, Medical Assisting)',
    grants: ['DOL Apprenticeship', 'HHS HRSA Allied Health', 'DOL H-1B'],
    estimatedAnnual: '$600,000 - $1,200,000',
    complexity: 'High',
    nextDeadline: 'Spring 2026 (DOL Apprenticeship)',
    rationale: 'Premier Health and Kettering Health are major regional employers with persistent healthcare workforce shortages. Nursing apprenticeship models are expanding nationally. HRSA Allied Health targets underserved populations — Sinclair serves diverse Dayton metro. H-1B healthcare training cohorts are competitive but high-dollar.',
  },
  {
    rank: 4,
    program: 'Software Development & Database Management',
    grants: ['NSF ATE', 'DOL H-1B', 'Choose Ohio First'],
    estimatedAnnual: '$500,000 - $1,100,000',
    complexity: 'Medium',
    nextDeadline: 'Oct 2026 (NSF ATE)',
    rationale: 'IT sector demand is strong regionally (CareSource insurance tech, defense contractors, regional IT services). NSF ATE computing grants prioritize community colleges. Choose Ohio First requires 1:1 match but supports STEM scholarship pipelines. H-1B targets high-skill tech training.',
  },
  {
    rank: 5,
    program: 'Welding & CNC Machining',
    grants: ['DOL Apprenticeship', 'Ohio MEP', 'Third Frontier Incumbent', 'Honda Heritage'],
    estimatedAnnual: '$320,000 - $680,000',
    complexity: 'Low',
    nextDeadline: 'Rolling (MEP), Spring 2026 (Apprenticeship)',
    rationale: 'Quick win — manufacturing trades are well-established at Sinclair with strong employer partnerships. DOL Apprenticeship grants fund RA expansion. Honda Heritage Center has direct manufacturing skills funding for regional programs. MEP grants require industry match but are accessible.',
  },
  {
    rank: 6,
    program: 'Logistics & Supply Chain Management',
    grants: ['DOL H-1B', 'EDA Workforce Development'],
    estimatedAnnual: '$400,000 - $800,000',
    complexity: 'Medium',
    nextDeadline: 'Rolling (EDA)',
    rationale: 'Dayton region has strong logistics sector (major distribution hubs, Wright-Patt logistics operations). EDA Workforce grants target regional economic development priorities. H-1B supply chain cohorts are competitive. Requires employer consortium.',
  },
  {
    rank: 7,
    program: 'HVAC & Electrical Technology',
    grants: ['DOL Apprenticeship', 'DOL YouthBuild', 'Ohio College2Careers'],
    estimatedAnnual: '$280,000 - $540,000',
    complexity: 'Low',
    nextDeadline: 'Spring 2026 (Apprenticeship), Annual (YouthBuild)',
    rationale: 'Construction trades have clear apprenticeship pathways. YouthBuild targets underserved youth populations with construction training — aligns with Sinclair urban mission. College2Careers supports stackable credential completion.',
  },
  {
    rank: 8,
    program: 'Health Information Technology',
    grants: ['DOL H-1B', 'TechCred Expansion', 'Choose Ohio First'],
    estimatedAnnual: '$280,000 - $580,000',
    complexity: 'Medium',
    nextDeadline: 'Biannual (TechCred)',
    rationale: 'Healthcare IT is high-demand hybrid field (CareSource, hospital systems). Already TechCred-eligible — opportunity is expanding employer partnerships. H-1B health IT cohorts are competitive. Choose Ohio First supports STEM scholarships with institutional match.',
  },
  {
    rank: 9,
    program: 'Pharmacy Technician',
    grants: ['TechCred', 'Ohio Incumbent Workforce Voucher', 'Dayton Foundation'],
    estimatedAnnual: '$120,000 - $280,000',
    complexity: 'Low',
    nextDeadline: 'Biannual (TechCred)',
    rationale: 'Quick win — short-term credential with clear employer demand (CVS, Walgreens, hospital pharmacies). TechCred supports employer-sponsored training. Incumbent Workforce Voucher targets working adults. Dayton Foundation supports underserved populations.',
  },
  {
    rank: 10,
    program: 'Quality Assurance Technology',
    grants: ['NSF ATE', 'Ohio MEP', 'Third Frontier Incumbent'],
    estimatedAnnual: '$180,000 - $380,000',
    complexity: 'Medium',
    nextDeadline: 'Oct 2026 (NSF ATE)',
    rationale: 'Manufacturing quality is critical across aerospace, automotive, and precision manufacturing sectors. NSF ATE quality/precision manufacturing grants are competitive but achievable. MEP and Third Frontier support incumbent worker upskilling.',
  },
  {
    rank: 11,
    program: 'Medical Assisting',
    grants: ['DOL Apprenticeship', 'Ohio Incumbent Workforce Voucher', 'Dayton Foundation'],
    estimatedAnnual: '$140,000 - $320,000',
    complexity: 'Low',
    nextDeadline: 'Spring 2026 (Apprenticeship)',
    rationale: 'Allied health apprenticeship models are expanding. Medical assisting is high-turnover field with persistent demand. Incumbent Workforce Voucher supports employer-sponsored upskilling. Dayton Foundation targets healthcare access for underserved populations.',
  },
  {
    rank: 12,
    program: 'Practical Nursing (LPN)',
    grants: ['DOL Apprenticeship', 'HHS HRSA Allied Health'],
    estimatedAnnual: '$280,000 - $520,000',
    complexity: 'High',
    nextDeadline: 'Spring 2026 (Apprenticeship)',
    rationale: 'Nursing apprenticeship models require significant employer partnerships but are expanding nationally. HRSA Allied Health targets LPN pipeline development. Complex application but high-dollar awards.',
  },
  {
    rank: 13,
    program: 'Environmental Technology / Water/Wastewater',
    grants: ['EPA Environmental Workforce', 'EDA Workforce Development'],
    estimatedAnnual: '$80,000 - $180,000',
    complexity: 'Medium',
    nextDeadline: 'Annual (EPA)',
    rationale: 'Niche opportunity — EPA Environmental Workforce targets underserved populations for environmental careers. EDA supports regional economic priorities. Smaller award amounts but less competition.',
  },
];

const federalDeepDive = [
  {
    grant: 'Perkins V — Career & Technical Education State Grants',
    status: 'Currently Funded',
    ohioAllocation: '$33.2M statewide (FY2025)',
    sinclairEstimate: '$450K - $680K annually',
    eligiblePrograms: 31,
    cipCodes: ['15.xxxx (Engineering Technology)', '47.xxxx (Mechanics & Repair)', '51.xxxx (Health Professions)', '52.xxxx (Business)'],
    details: 'Formula grant allocated to Ohio Department of Education, then distributed to eligible postsecondary institutions based on Pell-eligible CTE concentrators. Sinclair receives annual allocation for approved CTE programs. Funds support equipment, curriculum development, faculty professional development, and student support services.',
  },
  {
    grant: 'WIOA Adult & Dislocated Worker Formula Grants',
    status: 'Currently Funded (via ETPL)',
    ohioAllocation: '$82M Adult, $48M Dislocated Worker (PY2025)',
    sinclairEstimate: '$380K - $520K annually (student ITAs)',
    eligiblePrograms: 38,
    cipCodes: ['All workforce certificates and diplomas on Ohio ETPL'],
    details: 'Formula grant to states, distributed via local workforce development boards (OhioMeansJobs). Sinclair programs on Eligible Training Provider List (ETPL) receive funding when students use Individual Training Accounts (ITAs). Tuition paid directly by workforce boards for eligible jobseekers.',
  },
  {
    grant: 'NSF ATE — Advanced Technological Education',
    status: 'Not Currently Funded (Eligible)',
    nationalCompetition: '~$70M annually, 40-60 awards',
    sinclairEstimate: '$300K - $900K (3-year project)',
    eligiblePrograms: 18,
    cipCodes: ['15.xxxx (Engineering Tech)', '11.xxxx (Computer/IT)', '41.xxxx (Science Tech)'],
    details: 'Competitive grant supporting technician education in STEM fields. Priorities: advanced manufacturing, cybersecurity, biotechnology, data science. Typical awards $300K-$900K over 3 years. Requires industry partnerships, curriculum innovation, and dissemination plan. Strong fit for Sinclair manufacturing/IT programs.',
  },
  {
    grant: 'DOL Apprenticeship Building America',
    status: 'Not Currently Funded (Eligible)',
    nationalCompetition: '~$200M appropriation (varies)',
    sinclairEstimate: '$500K - $1.2M (multi-year)',
    eligiblePrograms: 22,
    cipCodes: ['Registered Apprenticeship-eligible (manufacturing, healthcare, IT, construction)'],
    details: 'Competitive grant expanding Registered Apprenticeship programs. Priorities: non-traditional sectors (IT, healthcare), underrepresented populations, multi-employer consortia. Requires 25% match (can be in-kind employer commitment). Sinclair\'s existing apprenticeship infrastructure is strong foundation.',
  },
  {
    grant: 'DOL H-1B One Workforce Grant Program',
    status: 'Not Currently Funded (Eligible)',
    nationalCompetition: '~$150M per cycle (biennial)',
    sinclairEstimate: '$1.5M - $3M (4-year project)',
    eligiblePrograms: 15,
    cipCodes: ['High-demand technical fields (IT, healthcare, advanced manufacturing)'],
    details: 'Large competitive grants for H-1B visa occupation training (high-skill technical fields). Requires multi-partner consortia (employers, workforce boards, community colleges). 25% non-federal match required. High-dollar awards but very competitive. Best fit: cybersecurity, healthcare IT, advanced manufacturing consortia.',
  },
];

const stateDeepDive = [
  {
    grant: 'Ohio TechCred',
    status: 'Currently Funded',
    appropriation: '$30M biennial',
    sinclairEstimate: '$320K - $580K annually',
    eligiblePrograms: 27,
    details: 'Employer reimbursement program for technology-focused credentials. Employers pay upfront, state reimburses up to $2,000/credential upon completion. Sinclair serves as training provider. Strongest ROI for IT, cybersecurity, manufacturing tech, and healthcare IT programs. Biannual application cycles.',
  },
  {
    grant: 'OhioMeansJobs Workforce Training Grants',
    status: 'Currently Funded',
    appropriation: 'Varies by local workforce board',
    sinclairEstimate: '$280K - $420K annually',
    eligiblePrograms: 35,
    details: 'Formula funding distributed through local workforce development boards. Supports training for in-demand occupations. Sinclair works with Montgomery County, Greene County, and surrounding workforce boards. Funds individual training accounts (ITAs) and sector partnership initiatives.',
  },
  {
    grant: 'Third Frontier Incumbent Workforce Training',
    status: 'Currently Funded',
    appropriation: '$8M biennial',
    sinclairEstimate: '$120K - $240K annually',
    eligiblePrograms: 16,
    details: 'Competitive grants for incumbent worker training in advanced industries (manufacturing, IT, bioscience, aerospace). Requires 25% employer match. Supports customized training, equipment purchases, and curriculum development. Strong fit for Sinclair advanced manufacturing and IT programs.',
  },
  {
    grant: 'Choose Ohio First — STEM Scholarships',
    status: 'Not Currently Funded (Eligible)',
    appropriation: '$35M biennial statewide',
    sinclairEstimate: '$150K - $280K (if awarded)',
    eligiblePrograms: 9,
    details: 'Competitive STEM scholarship program. Requires 1:1 institutional match. Supports student scholarships, STEM pathway development, and retention initiatives. Sinclair STEM programs (engineering tech, IT, science tech) are eligible. Highly competitive but high-dollar awards.',
  },
];

const timeline = [
  { month: 'Mar 2026', grants: ['DOL Apprenticeship Building America', 'DOL YouthBuild'], priority: 'High' },
  { month: 'Apr 2026', grants: ['Ohio TechCred (Spring Cohort)', 'Ohio Incumbent Workforce Voucher'], priority: 'Medium' },
  { month: 'May 2026', grants: ['HHS HRSA Allied Health (varies by program)'], priority: 'Medium' },
  { month: 'Jun 2026', grants: ['Dayton Foundation (Quarterly)'], priority: 'Low' },
  { month: 'Aug 2026', grants: ['NSF IUSE', 'Choose Ohio First'], priority: 'Medium' },
  { month: 'Sep 2026', grants: ['Third Frontier Incumbent Workforce'], priority: 'High' },
  { month: 'Oct 2026', grants: ['NSF ATE', 'Ohio College2Careers'], priority: 'High' },
  { month: 'Nov 2026', grants: ['EPA Environmental Workforce'], priority: 'Low' },
  { month: 'Rolling', grants: ['EDA Workforce Development', 'NIST MEP', 'Ohio MEP'], priority: 'Medium' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SinclairGrantScanPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* ===== DISCLAIMER BANNER ===== */}
      <div className="w-full bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 text-center">
        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
          📋 Sample Report for demonstration purposes — real grant programs, hardcoded eligibility analysis
        </p>
      </div>

      {/* ===== A. HERO ===== */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-36 lg:pt-40 pb-16">
        <Stars count={120} />
        <Aurora className="opacity-75" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">Grant Intelligence Scan · Sample Report</span>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100} duration={800}>
            <h1
              className="font-heading font-bold text-gradient-cosmic leading-[1.05] mx-auto max-w-4xl mt-4"
              style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4rem)' }}
            >
              Sinclair Community College
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200} duration={800}>
            <p className="mt-4 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed">
              Dayton, Ohio · February 2026
            </p>
          </AnimateOnScroll>

          {/* Stat Pills */}
          <AnimateOnScroll variant="fade-up" delay={300} duration={800}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                47 Programs Scanned
              </span>
              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                22 Grants Identified
              </span>
              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-500/10 to-teal-500/10 text-transparent bg-clip-text border border-purple-500/20" style={{ color: '#7c3aed' }}>
                $8.4M+ Eligible Funding
              </span>
              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                13 Unfunded Opportunities
              </span>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={400} duration={800}>
            <div className="mt-6">
              <PrintButton />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== B. GRANT PORTFOLIO SUMMARY ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Grant Portfolio Summary</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              22 grants identified across 47 programs
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="mt-10 space-y-6">
            {/* Summary cards */}
            <div className="grid md:grid-cols-3 gap-5">
              <div className="card-cosmic rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-2">Total Eligible Funding</p>
                <p className="text-3xl font-bold font-mono text-gradient-cosmic">{portfolioSummary.totalEligibleFunding}</p>
                <p className="text-xs text-theme-muted mt-2">Annual potential across all eligible grants</p>
              </div>
              <div className="card-cosmic rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-2">Currently Captured</p>
                <p className="text-3xl font-bold font-mono text-teal-600 dark:text-teal-400">{portfolioSummary.currentlyCaptured}</p>
                <p className="text-xs text-theme-muted mt-2">Active grants (Perkins V, WIOA, TechCred, Third Frontier)</p>
              </div>
              <div className="card-cosmic rounded-2xl p-6 border-amber-500/30 bg-amber-500/5">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">Uncaptured Funding</p>
                <p className="text-3xl font-bold font-mono text-amber-600 dark:text-amber-400">{portfolioSummary.uncaptured}</p>
                <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-2">Eligible but not currently receiving</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="card-cosmic rounded-2xl p-6">
              <p className="text-sm font-bold text-theme-primary mb-4">Grant Source Breakdown</p>
              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <p className="text-xs text-theme-muted mb-1">Federal</p>
                  <p className="text-2xl font-bold font-mono text-theme-primary">{portfolioSummary.breakdown.federal}</p>
                  <p className="text-xs text-theme-tertiary mt-0.5">Perkins, WIOA, NSF, DOL, EPA, HHS</p>
                </div>
                <div>
                  <p className="text-xs text-theme-muted mb-1">State (Ohio)</p>
                  <p className="text-2xl font-bold font-mono text-theme-primary">{portfolioSummary.breakdown.state}</p>
                  <p className="text-xs text-theme-tertiary mt-0.5">TechCred, OhioMeansJobs, Third Frontier, Choose Ohio First</p>
                </div>
                <div>
                  <p className="text-xs text-theme-muted mb-1">Foundation & Industry</p>
                  <p className="text-2xl font-bold font-mono text-theme-primary">{portfolioSummary.breakdown.foundation}</p>
                  <p className="text-xs text-theme-tertiary mt-0.5">Dayton Foundation, Lumina, Honda Heritage</p>
                </div>
              </div>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ===== C. EXECUTIVE SUMMARY ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Executive Summary</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              What&apos;s funded, what&apos;s not, and where the money is
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="mt-8 space-y-6">
            <div className="card-cosmic rounded-2xl p-6">
              <p className="font-heading font-bold text-lg text-theme-primary mb-3">What&apos;s Well-Funded</p>
              <p className="text-theme-secondary leading-relaxed">
                Sinclair is successfully capturing approximately <span className="font-semibold text-theme-primary">$2.1M annually</span> in formula and competitive grants. <span className="font-semibold">Perkins V</span> ($450K-$680K) flows consistently to 31 CTE programs. <span className="font-semibold">WIOA funding</span> ($380K-$520K) supports 38 ETPL-eligible programs through student Individual Training Accounts. <span className="font-semibold">Ohio TechCred</span> ($320K-$580K) serves 27 technology-focused credentials with strong employer partnerships. <span className="font-semibold">Third Frontier Incumbent Workforce</span> grants ($120K-$240K) support advanced manufacturing and IT upskilling. These four funding streams provide a stable base for workforce program operations.
              </p>
            </div>

            <div className="card-cosmic rounded-2xl p-6 border-amber-500/30 bg-amber-500/5">
              <p className="font-heading font-bold text-lg text-theme-primary mb-3">What&apos;s Being Left on the Table</p>
              <p className="text-theme-secondary leading-relaxed">
                An estimated <span className="font-semibold text-amber-700 dark:text-amber-400">$6.3M+ in annual eligible funding</span> is not currently captured. The largest missed opportunities: <span className="font-semibold">NSF ATE</span> (Advanced Technological Education) could provide $300K-$900K for manufacturing, IT, and engineering tech consortia. <span className="font-semibold">DOL Apprenticeship Building America</span> grants ($500K-$1.2M) would expand registered apprenticeships in non-traditional sectors (IT, healthcare, advanced manufacturing). <span className="font-semibold">DOL H-1B One Workforce</span> grants ($1.5M-$3M) target high-skill technical training in cybersecurity, healthcare IT, and advanced manufacturing — all Sinclair strengths. <span className="font-semibold">Choose Ohio First</span> STEM scholarships ($150K-$280K) would support engineering tech and IT student pipelines with institutional match.
              </p>
            </div>

            <div className="card-cosmic rounded-2xl p-6">
              <p className="font-heading font-bold text-lg text-theme-primary mb-3">Biggest Opportunities</p>
              <div className="space-y-3 text-sm text-theme-secondary leading-relaxed">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-400">1</span>
                  <p><span className="font-semibold text-theme-primary">Cybersecurity & Network Systems</span> — NSF ATE + DOL H-1B + Apprenticeship grants could bring $1.2M-$2.5M annually. Wright-Patterson AFB, CareSource, and defense contractors create strong regional demand. NSF ATE cybersecurity consortia are competitive but achievable with multi-employer partnerships.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-400">2</span>
                  <p><span className="font-semibold text-theme-primary">Advanced Manufacturing Portfolio</span> — NSF ATE + DOL Apprenticeship + NIST MEP + Third Frontier could bring $800K-$1.8M annually. Sinclair has existing infrastructure (labs, employer partnerships with Honda, aerospace suppliers) — competitive advantage for manufacturing grants.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-400">3</span>
                  <p><span className="font-semibold text-theme-primary">Healthcare Programs</span> — DOL Apprenticeship + HHS HRSA Allied Health + H-1B could bring $600K-$1.2M annually. Premier Health and Kettering Health partnerships position Sinclair for nursing and allied health apprenticeship expansion. HRSA targets underserved populations (urban Dayton mission alignment).</p>
                </div>
              </div>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ===== D. GRANT ELIGIBILITY MATRIX ===== */}
      <section className="relative py-16 md:py-24 bg-theme-surface/30">
        <div className="max-w-[1400px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Grant Eligibility Matrix</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Which programs qualify for which grants
            </h2>
            <p className="mt-3 text-theme-secondary">20 programs × 8 major grants — the complete picture</p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="mt-10 overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden card-cosmic rounded-2xl">
                  <table className="min-w-full divide-y divide-theme-subtle">
                    <thead className="bg-theme-surface">
                      <tr>
                        <th scope="col" className="sticky left-0 z-10 bg-theme-surface px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-theme-primary border-r border-theme-subtle">
                          Program
                        </th>
                        {eligibilityMatrix.grantsShort.map((g) => (
                          <th key={g} scope="col" className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-theme-muted whitespace-nowrap">
                            {g}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-theme-page divide-y divide-theme-subtle">
                      {eligibilityMatrix.programs.map((prog, idx) => (
                        <tr key={prog} className={idx % 2 === 0 ? 'bg-theme-surface/20' : ''}>
                          <td className="sticky left-0 z-10 bg-theme-surface px-4 py-3 text-sm font-medium text-theme-primary border-r border-theme-subtle whitespace-nowrap">
                            {prog}
                          </td>
                          {eligibilityMatrix.grantsShort.map((grant) => {
                            const status = matrixData[prog]?.[grant] ?? 'none';
                            let bgColor = 'bg-gray-500/5';
                            let icon = '—';
                            if (status === 'funded') {
                              bgColor = 'bg-teal-500/20';
                              icon = '✅';
                            } else if (status === 'unfunded') {
                              bgColor = 'bg-amber-500/20';
                              icon = '🟡';
                            }
                            return (
                              <td key={grant} className={`px-3 py-3 text-center text-xs ${bgColor}`}>
                                {icon}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <span className="text-theme-secondary">Eligible & Funded</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🟡</span>
                <span className="text-theme-secondary">Eligible & Unfunded</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">—</span>
                <span className="text-theme-secondary">Not Eligible</span>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== E. HIGH-VALUE UNFUNDED OPPORTUNITIES ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">High-Value Unfunded Opportunities</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Top 13 programs eligible but not receiving grant funding
            </h2>
            <p className="mt-3 text-theme-secondary">Ranked by funding amount, likelihood of award, and strategic fit</p>
          </AnimateOnScroll>

          <StaggerChildren stagger={60} variant="fade-up" className="mt-10 space-y-5">
            {unfundedOpportunities.map((opp) => (
              <div key={opp.rank} className="card-cosmic rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-400">
                    {opp.rank}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <h3 className="font-heading font-bold text-lg text-theme-primary">{opp.program}</h3>
                      <span className="font-mono text-sm font-bold text-gradient-cosmic flex-shrink-0">{opp.estimatedAnnual}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {opp.grants.map((g) => (
                        <span key={g} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                          {g}
                        </span>
                      ))}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${complexityBadge(opp.complexity)}`}>
                        {opp.complexity} Complexity
                      </span>
                    </div>

                    <p className="text-sm text-theme-secondary leading-relaxed mb-3">{opp.rationale}</p>

                    <div className="flex items-center gap-2 text-xs text-theme-muted">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Next Deadline: {opp.nextDeadline}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== F. FEDERAL GRANT DEEP-DIVE ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Federal Grant Deep-Dive</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Major federal funding sources analyzed
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="mt-10 space-y-6">
            {federalDeepDive.map((item) => (
              <div key={item.grant} className="card-cosmic rounded-2xl p-7">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-theme-primary">{item.grant}</h3>
                    <p className="text-sm text-theme-muted mt-1">{item.status}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    item.status.includes('Currently Funded') 
                      ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {item.eligiblePrograms} Programs
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-1">Ohio / National Allocation</p>
                    <p className="text-sm font-mono text-theme-primary">{item.ohioAllocation || item.nationalCompetition}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-1">Sinclair Estimate</p>
                    <p className="text-sm font-mono text-gradient-cosmic font-bold">{item.sinclairEstimate}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-2">Eligible CIP Codes</p>
                  <div className="flex flex-wrap gap-2">
                    {item.cipCodes.map((cip, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-full bg-theme-surface text-theme-secondary border border-theme-subtle">
                        {cip}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-theme-secondary leading-relaxed">{item.details}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== G. STATE & REGIONAL GRANTS ===== */}
      <section className="relative py-16 md:py-24 bg-theme-surface/30">
        <div className="max-w-[1000px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">State & Regional Grants</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Ohio-specific funding opportunities
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="mt-10 space-y-6">
            {stateDeepDive.map((item) => (
              <div key={item.grant} className="card-cosmic rounded-2xl p-7">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-theme-primary">{item.grant}</h3>
                    <p className="text-sm text-theme-muted mt-1">{item.status}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    item.status.includes('Currently Funded') 
                      ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {item.eligiblePrograms} Programs
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-1">Appropriation</p>
                    <p className="text-sm font-mono text-theme-primary">{item.appropriation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-1">Sinclair Estimate</p>
                    <p className="text-sm font-mono text-gradient-cosmic font-bold">{item.sinclairEstimate}</p>
                  </div>
                </div>

                <p className="text-sm text-theme-secondary leading-relaxed">{item.details}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ===== H. APPLICATION TIMELINE & PRIORITY MATRIX ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Application Timeline</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Which grants to pursue when
            </h2>
            <p className="mt-3 text-theme-secondary">2026 grant calendar with priority rankings</p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="mt-10 card-cosmic rounded-2xl overflow-hidden">
              {timeline.map((item, idx) => (
                <div
                  key={item.month}
                  className={`p-5 ${idx < timeline.length - 1 ? 'border-b border-theme-subtle' : ''}`}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-shrink-0 w-24">
                      <p className="font-mono text-sm font-bold text-theme-primary">{item.month}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2">
                        {item.grants.map((g) => (
                          <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        item.priority === 'High' 
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                          : item.priority === 'Medium'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20'
                      }`}>
                        {item.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200}>
            <div className="mt-8 card-cosmic rounded-2xl p-6 border-purple-500/30 bg-purple-500/5">
              <p className="font-heading font-bold text-lg text-theme-primary mb-3">Priority Ranking Framework</p>
              <ul className="space-y-2 text-sm text-theme-secondary leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 flex-shrink-0">●</span>
                  <span><span className="font-semibold text-theme-primary">High Priority:</span> Large award amounts ($500K+), strong institutional fit, competitive but achievable, October 2026 NSF ATE deadline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 flex-shrink-0">●</span>
                  <span><span className="font-semibold text-theme-primary">Medium Priority:</span> Moderate awards ($150K-$500K), good fit, existing partnerships reduce application burden</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 flex-shrink-0">●</span>
                  <span><span className="font-semibold text-theme-primary">Low Priority:</span> Smaller awards (&lt;$150K), niche opportunities, lower ROI relative to application effort</span>
                </li>
              </ul>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== I. METHODOLOGY ===== */}
      <section className="relative py-16 md:py-24 bg-theme-surface/30">
        <div className="max-w-[900px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Methodology</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              How eligibility was determined
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="mt-8 space-y-5">
            <div className="card-cosmic rounded-2xl p-6">
              <p className="font-heading font-bold text-lg text-theme-primary mb-3">Data Sources</p>
              <ul className="space-y-2 text-sm text-theme-secondary leading-relaxed list-disc list-inside">
                <li><span className="font-semibold">Grants.gov</span> — Federal grant opportunity database (NSF, DOL, ED, HHS, EPA, Commerce)</li>
                <li><span className="font-semibold">Ohio Department of Higher Education</span> — TechCred, Choose Ohio First, College2Careers, Incumbent Workforce Voucher</li>
                <li><span className="font-semibold">Ohio Development Services Agency</span> — Third Frontier, Ohio MEP</li>
                <li><span className="font-semibold">OhioMeansJobs / ODJFS</span> — WIOA allocations, local workforce board funding</li>
                <li><span className="font-semibold">IPEDS CIP Code Database</span> — Program classification for grant eligibility matching</li>
                <li><span className="font-semibold">Sinclair Community College Catalog</span> — Current program offerings, CIP codes, credential types</li>
                <li><span className="font-semibold">Foundation Directories</span> — Dayton Foundation, Lumina Foundation, regional workforce funders</li>
              </ul>
            </div>

            <div className="card-cosmic rounded-2xl p-6">
              <p className="font-heading font-bold text-lg text-theme-primary mb-3">Eligibility Determination Process</p>
              <ol className="space-y-2 text-sm text-theme-secondary leading-relaxed list-decimal list-inside">
                <li>Mapped all 47 Sinclair workforce programs to IPEDS CIP codes (6-digit classification)</li>
                <li>Cross-referenced each grant&apos;s eligible CIP code ranges against Sinclair program portfolio</li>
                <li>Verified credential type eligibility (certificate, diploma, associate degree) against grant requirements</li>
                <li>Assessed institutional eligibility (public community college, Ohio location, accreditation status)</li>
                <li>Evaluated programmatic requirements (apprenticeship registration, ETPL status, industry partnerships)</li>
                <li>Estimated funding amounts based on: (a) published award ranges, (b) Ohio historical allocations, (c) peer institution awards</li>
                <li>Classified current funding status through Sinclair grants office verification</li>
              </ol>
            </div>

            <div className="card-cosmic rounded-2xl p-6">
              <p className="font-heading font-bold text-lg text-theme-primary mb-3">Funding Estimates</p>
              <p className="text-sm text-theme-secondary leading-relaxed">
                Annual funding estimates represent <span className="font-semibold">potential eligible funding if programs successfully apply and receive awards</span>. Actual awards depend on: application quality, employer partnership strength, institutional match availability, federal/state appropriations, and competitive peer applications. Formula grants (Perkins V, WIOA) are based on published Ohio allocations and historical Sinclair share. Competitive grants (NSF, DOL) use typical award ranges and peer institution benchmarks. State grants reflect published appropriations and eligibility criteria. Foundation grants are based on published guidelines and award histories.
              </p>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ===== J. CTA ===== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Ready to Find Your Funding?</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Get a Grant Intelligence Scan for your institution
            </h2>
            <p className="mt-4 text-theme-secondary text-lg leading-relaxed">
              We scan your entire program catalog against federal, state, and foundation grants — then deliver a prioritized pursuit list ranked by eligibility match and award size.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/grants">
                <button className="btn-cosmic btn-cosmic-primary text-sm py-3 px-7">
                  Order Grant Intelligence Scan — $495
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <span className="text-sm text-theme-muted">Delivered in 3–5 business days</span>
            </div>

            <div className="mt-10 card-cosmic rounded-2xl p-6 text-left">
              <p className="font-heading font-bold text-lg text-theme-primary mb-3">What You Receive</p>
              <ul className="space-y-2 text-sm text-theme-secondary leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-theme-muted flex-shrink-0 mt-0.5" />
                  30+ federal, state, and foundation grants scanned against your program catalog
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-theme-muted flex-shrink-0 mt-0.5" />
                  Eligibility match score for each grant (High / Medium / Low)
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-theme-muted flex-shrink-0 mt-0.5" />
                  Award range, deadline, and match requirements for each opportunity
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-theme-muted flex-shrink-0 mt-0.5" />
                  Program-by-grant eligibility matrix (which programs qualify for which grants)
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-theme-muted flex-shrink-0 mt-0.5" />
                  Prioritized pursuit list — ranked by eligibility match, award size, and institutional fit
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-theme-muted flex-shrink-0 mt-0.5" />
                  Application timeline with deadlines and priority rankings
                </li>
              </ul>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
