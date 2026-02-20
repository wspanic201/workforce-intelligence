import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';
import { PrintButton } from '@/components/ui/PrintButton';

export const metadata: Metadata = {
  title: 'Grant Intelligence Scan — Valencia College | Wavelength Sample Report',
  description:
    'Complete Grant Intelligence Scan for Valencia College. 24 grants identified, $9.8M+ in eligible funding, 52 programs scanned across healthcare, IT, hospitality, advanced manufacturing, and film/entertainment.',
  alternates: { canonical: 'https://withwavelength.com/report/valencia-grant-scan' },
  openGraph: {
    title: 'Grant Intelligence Scan — Valencia College',
    description:
      '24 federal, state, and foundation grants identified. $9.8M+ in eligible annual funding. 15 high-value unfunded opportunities mapped across the entire program portfolio.',
    url: 'https://withwavelength.com/report/valencia-grant-scan',
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
  totalGrants: 24,
  programsScanned: 52,
  totalEligibleFunding: '$9.8M+',
  unfundedPrograms: 15,
  currentlyCaptured: '$2.4M',
  uncaptured: '$7.4M+',
  breakdown: {
    federal: 12,
    state: 9,
    foundation: 3,
  },
};

const grants = [
  // FEDERAL
  {
    name: 'Perkins V — Career & Technical Education State Grants',
    type: 'Federal',
    funder: 'U.S. Department of Education',
    eligiblePrograms: 38,
    estimatedAnnual: '$520,000 - $780,000',
    currentStatus: 'Eligible & Funded',
    cipCodes: '15.xxxx (Engineering Tech), 47.xxxx (Mechanics & Repair), 51.xxxx (Health), 52.xxxx (Business), 50.xxxx (Film/Entertainment)',
    applicationCycle: 'Annual state allocation',
    matchRequired: '0%',
  },
  {
    name: 'WIOA Adult & Dislocated Worker Formula Grants',
    type: 'Federal',
    funder: 'U.S. Department of Labor / CareerSource Florida',
    eligiblePrograms: 42,
    estimatedAnnual: '$440,000 - $620,000',
    currentStatus: 'Eligible & Funded',
    cipCodes: 'ETPL-eligible programs (all workforce certificates & diplomas)',
    applicationCycle: 'Annual state allocation via CareerSource Florida',
    matchRequired: '0%',
  },
  {
    name: 'NSF ATE — Advanced Technological Education',
    type: 'Federal',
    funder: 'National Science Foundation',
    eligiblePrograms: 22,
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
    eligiblePrograms: 26,
    estimatedAnnual: '$600,000 - $1,400,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Registered Apprenticeship-eligible (manufacturing, healthcare, IT, hospitality, film/entertainment)',
    applicationCycle: 'Annual competitive (Spring)',
    matchRequired: '25% employer/industry cash or in-kind',
  },
  {
    name: 'DOL H-1B One Workforce Grant Program',
    type: 'Federal',
    funder: 'U.S. Department of Labor ETA',
    eligiblePrograms: 18,
    estimatedAnnual: '$1,500,000 - $3,500,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'High-demand technical fields (IT, cybersecurity, healthcare, advanced manufacturing)',
    applicationCycle: 'Biennial competitive (2026 expected)',
    matchRequired: '25% non-federal',
  },
  {
    name: 'TAACCCT — Trade Adjustment Assistance',
    type: 'Federal',
    funder: 'U.S. Department of Labor (if reauthorized)',
    eligiblePrograms: 28,
    estimatedAnnual: '$900,000 - $2,200,000',
    currentStatus: 'Not Currently Available',
    cipCodes: 'Manufacturing, logistics, healthcare, hospitality (workers displaced by trade)',
    applicationCycle: 'Pending Congressional reauthorization',
    matchRequired: '0%',
  },
  {
    name: 'NIST MEP — Manufacturing Extension Partnership',
    type: 'Federal',
    funder: 'National Institute of Standards and Technology',
    eligiblePrograms: 9,
    estimatedAnnual: '$140,000 - $280,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: '15.xxxx (Engineering Tech), 48.05xx (Precision Manufacturing)',
    applicationCycle: 'Annual via Florida MEP (FloridaMakes)',
    matchRequired: '50% industry',
  },
  {
    name: 'NSF IUSE — Improving Undergraduate STEM Education',
    type: 'Federal',
    funder: 'National Science Foundation',
    eligiblePrograms: 15,
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
    eligiblePrograms: 24,
    estimatedAnnual: '$500,000 - $1,200,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Regional priority sectors (advanced manufacturing, aerospace, IT, healthcare, hospitality)',
    applicationCycle: 'Rolling',
    matchRequired: '20% non-federal',
  },
  {
    name: 'DOL YouthBuild',
    type: 'Federal',
    funder: 'U.S. Department of Labor',
    eligiblePrograms: 6,
    estimatedAnnual: '$90,000 - $200,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Construction trades (HVAC, electrical, plumbing, carpentry)',
    applicationCycle: 'Annual competitive',
    matchRequired: '25% match (can be in-kind)',
  },
  {
    name: 'EPA Environmental Workforce Development',
    type: 'Federal',
    funder: 'U.S. Environmental Protection Agency',
    eligiblePrograms: 4,
    estimatedAnnual: '$70,000 - $140,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Environmental tech, water/wastewater tech, sustainability',
    applicationCycle: 'Annual',
    matchRequired: '20%',
  },
  {
    name: 'HHS HRSA — Allied Health Workforce',
    type: 'Federal',
    funder: 'U.S. Dept of Health & Human Services',
    eligiblePrograms: 17,
    estimatedAnnual: '$320,000 - $640,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: '51.xxxx (Allied Health — nursing assistants, medical assisting, dental, surgical tech, respiratory therapy)',
    applicationCycle: 'Varies by program',
    matchRequired: '0%',
  },
  // STATE (FLORIDA)
  {
    name: 'CareerSource Florida Workforce Training Grants',
    type: 'State',
    funder: 'CareerSource Florida',
    eligiblePrograms: 40,
    estimatedAnnual: '$380,000 - $560,000',
    currentStatus: 'Eligible & Funded',
    cipCodes: 'In-demand occupations (all workforce programs on FETPIP)',
    applicationCycle: 'Annual via regional CareerSource boards',
    matchRequired: '0% for training providers',
  },
  {
    name: 'Florida Job Growth Grant Fund',
    type: 'State',
    funder: 'Florida Department of Economic Opportunity',
    eligiblePrograms: 28,
    estimatedAnnual: '$420,000 - $820,000',
    currentStatus: 'Eligible & Funded',
    cipCodes: 'Workforce training projects in targeted industries (manufacturing, IT, healthcare, aviation/aerospace)',
    applicationCycle: 'Annual competitive',
    matchRequired: '50% match (can be in-kind)',
  },
  {
    name: 'Quick Response Training (QRT)',
    type: 'State',
    funder: 'CareerSource Florida',
    eligiblePrograms: 35,
    estimatedAnnual: '$280,000 - $480,000',
    currentStatus: 'Eligible & Funded',
    cipCodes: 'Customized training for new/expanding businesses (manufacturing, IT, healthcare, hospitality)',
    applicationCycle: 'Rolling',
    matchRequired: '0%',
  },
  {
    name: 'Florida Flex (Incumbent Worker Training)',
    type: 'State',
    funder: 'CareerSource Florida',
    eligiblePrograms: 32,
    estimatedAnnual: '$220,000 - $400,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Incumbent worker upskilling (advanced manufacturing, IT, healthcare)',
    applicationCycle: 'Rolling',
    matchRequired: '50% employer',
  },
  {
    name: 'Florida Advanced Manufacturing Competitive Grant',
    type: 'State',
    funder: 'Florida Department of Education',
    eligiblePrograms: 12,
    estimatedAnnual: '$180,000 - $360,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Advanced manufacturing programs (CNC, robotics, mechatronics, quality)',
    applicationCycle: 'Annual competitive',
    matchRequired: '25% match',
  },
  {
    name: 'Florida HECTOR (Healthcare Education Capital and Technology Opportunity Resource)',
    type: 'State',
    funder: 'Florida Department of Education',
    eligiblePrograms: 16,
    estimatedAnnual: '$250,000 - $500,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Healthcare program equipment and technology (nursing, allied health)',
    applicationCycle: 'Biennial competitive',
    matchRequired: '25% match',
  },
  {
    name: 'Florida College System Baccalaureate Articulation Incentive',
    type: 'State',
    funder: 'Florida Department of Education',
    eligiblePrograms: 8,
    estimatedAnnual: '$120,000 - $240,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Applied baccalaureate pathways (nursing, IT, hospitality management)',
    applicationCycle: 'Annual',
    matchRequired: '0%',
  },
  {
    name: 'Florida Cybersecurity Workforce Development',
    type: 'State',
    funder: 'Florida Digital Service / Florida Dept of Management Services',
    eligiblePrograms: 6,
    estimatedAnnual: '$140,000 - $280,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Cybersecurity certificates and degrees (11.10xx)',
    applicationCycle: 'Annual competitive',
    matchRequired: '0%',
  },
  {
    name: 'Florida Film & Entertainment Workforce Training',
    type: 'State',
    funder: 'Film Florida / Florida Office of Film & Entertainment',
    eligiblePrograms: 5,
    estimatedAnnual: '$80,000 - $160,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Film production, digital media, animation, post-production (50.06xx)',
    applicationCycle: 'By partnership agreement',
    matchRequired: 'Varies (studio partnerships)',
  },
  // FOUNDATION & INDUSTRY
  {
    name: 'Central Florida Foundation Workforce Development',
    type: 'Foundation',
    funder: 'Central Florida Foundation',
    eligiblePrograms: 22,
    estimatedAnnual: '$80,000 - $160,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Programs serving underrepresented populations (healthcare, skilled trades, IT)',
    applicationCycle: 'Quarterly',
    matchRequired: 'Varies',
  },
  {
    name: 'Lumina Foundation Workforce Pathways',
    type: 'Foundation',
    funder: 'Lumina Foundation',
    eligiblePrograms: 28,
    estimatedAnnual: '$200,000 - $500,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Stackable credential pathways (all sectors)',
    applicationCycle: 'Invitation only',
    matchRequired: 'Varies',
  },
  {
    name: 'Lockheed Martin STEM Education Grants',
    type: 'Industry',
    funder: 'Lockheed Martin',
    eligiblePrograms: 9,
    estimatedAnnual: '$60,000 - $120,000',
    currentStatus: 'Eligible & Unfunded',
    cipCodes: 'Aerospace, engineering tech, advanced manufacturing (15.xxxx)',
    applicationCycle: 'By partnership agreement',
    matchRequired: 'In-kind equipment/instruction',
  },
];

const eligibilityMatrix = {
  programs: [
    'Nursing (RN)',
    'Practical Nursing (LPN)',
    'Respiratory Therapy',
    'Radiologic Technology',
    'Surgical Technology',
    'Medical Assisting',
    'Dental Hygiene',
    'Health Information Technology',
    'Cybersecurity',
    'Network Systems Administration',
    'Software Development',
    'Database Management',
    'Cloud Computing',
    'Advanced Manufacturing Technology',
    'Mechatronics Engineering Technology',
    'CNC Machining Technology',
    'Welding Technology',
    'Quality Assurance Technology',
    'Hospitality Management',
    'Culinary Arts & Restaurant Management',
    'Film Production Technology',
    'Digital Media Production',
    'Animation & Visual Effects',
    'HVAC Technology',
    'Electrical Technology',
  ],
  grantsShort: [
    'Perkins V',
    'WIOA',
    'NSF ATE',
    'DOL Apprenticeship',
    'H-1B',
    'CareerSource FL',
    'Job Growth Grant',
    'QRT',
  ],
};

const matrixData: Record<string, Record<string, 'funded' | 'unfunded' | 'none'>> = {
  'Nursing (RN)': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'funded' },
  'Practical Nursing (LPN)': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'funded' },
  'Respiratory Therapy': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'unfunded' },
  'Radiologic Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'none', 'H-1B': 'unfunded', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'unfunded' },
  'Surgical Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'unfunded' },
  'Medical Assisting': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'funded' },
  'Dental Hygiene': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'none', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'unfunded', 'QRT': 'unfunded' },
  'Health Information Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'funded' },
  'Cybersecurity': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'funded' },
  'Network Systems Administration': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'funded' },
  'Software Development': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'funded' },
  'Database Management': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'none', 'H-1B': 'unfunded', 'CareerSource FL': 'funded', 'Job Growth Grant': 'unfunded', 'QRT': 'funded' },
  'Cloud Computing': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'funded' },
  'Advanced Manufacturing Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'funded' },
  'Mechatronics Engineering Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'unfunded', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'unfunded' },
  'CNC Machining Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'funded' },
  'Welding Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'unfunded', 'QRT': 'funded' },
  'Quality Assurance Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'none', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'unfunded', 'QRT': 'unfunded' },
  'Hospitality Management': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'funded' },
  'Culinary Arts & Restaurant Management': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'funded' },
  'Film Production Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'none', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'unfunded', 'QRT': 'unfunded' },
  'Digital Media Production': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'none', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'unfunded', 'QRT': 'unfunded' },
  'Animation & Visual Effects': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'none', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'unfunded', 'QRT': 'none' },
  'HVAC Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'none', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'funded', 'QRT': 'funded' },
  'Electrical Technology': { 'Perkins V': 'funded', 'WIOA': 'funded', 'NSF ATE': 'unfunded', 'DOL Apprenticeship': 'unfunded', 'H-1B': 'none', 'CareerSource FL': 'funded', 'Job Growth Grant': 'unfunded', 'QRT': 'funded' },
};

const unfundedOpportunities = [
  {
    rank: 1,
    program: 'Cybersecurity & Cloud Computing',
    grants: ['NSF ATE', 'DOL H-1B', 'DOL Apprenticeship', 'Florida Cybersecurity Workforce'],
    estimatedAnnual: '$1,400,000 - $2,900,000',
    complexity: 'Medium',
    nextDeadline: 'Oct 2026 (NSF ATE)',
    rationale: 'High-demand IT programs with strong regional employer need (Lockheed Martin, L3Harris Technologies, Siemens Energy, EA). NSF ATE has funded cybersecurity consortia at community colleges. H-1B One Workforce targets high-skill technical training. Florida Cybersecurity Workforce grants prioritize FCS institutions. Apprenticeship model is emerging in cybersecurity sector. Orlando is a major aerospace/defense tech hub requiring security clearances.',
  },
  {
    rank: 2,
    program: 'Healthcare (Nursing, Respiratory Therapy, Surgical Tech)',
    grants: ['DOL Apprenticeship', 'HHS HRSA Allied Health', 'DOL H-1B', 'Florida HECTOR'],
    estimatedAnnual: '$800,000 - $1,600,000',
    complexity: 'High',
    nextDeadline: 'Spring 2026 (DOL Apprenticeship)',
    rationale: 'AdventHealth and Orlando Health are major regional employers with persistent healthcare workforce shortages (combined 40,000+ employees). Nursing apprenticeship models are expanding nationally. HRSA Allied Health targets underserved populations — Valencia serves diverse Orlando metro. H-1B healthcare training cohorts are competitive but high-dollar. Florida HECTOR provides equipment/technology funding specifically for healthcare programs.',
  },
  {
    rank: 3,
    program: 'Advanced Manufacturing & Mechatronics',
    grants: ['NSF ATE', 'DOL Apprenticeship', 'NIST MEP', 'Florida Advanced Manufacturing', 'Lockheed Martin STEM'],
    estimatedAnnual: '$900,000 - $2,000,000',
    complexity: 'Medium',
    nextDeadline: 'Oct 2026 (NSF ATE)',
    rationale: 'Valencia has strong manufacturing infrastructure serving aerospace, defense, and precision manufacturing sectors. Lockheed Martin (10,000+ employees in Central Florida), Siemens Energy, and aerospace suppliers create regional demand. NSF ATE manufacturing grants are competitive but achievable with multi-employer consortia. Lockheed Martin has direct STEM education funding. MEP grants require 50% industry match but smaller award amounts are accessible.',
  },
  {
    rank: 4,
    program: 'Software Development & Database Management',
    grants: ['NSF ATE', 'DOL H-1B', 'EDA Workforce'],
    estimatedAnnual: '$600,000 - $1,300,000',
    complexity: 'Medium',
    nextDeadline: 'Oct 2026 (NSF ATE)',
    rationale: 'IT sector demand is strong regionally (EA/Electronic Arts, Lockheed Martin tech divisions, regional IT services, theme park technology operations). NSF ATE computing grants prioritize community colleges. H-1B targets high-skill tech training. EDA Workforce grants support regional economic development priorities — Orlando tech sector is growing.',
  },
  {
    rank: 5,
    program: 'Hospitality Management & Culinary Arts',
    grants: ['DOL Apprenticeship', 'EDA Workforce', 'Florida Flex'],
    estimatedAnnual: '$500,000 - $1,100,000',
    complexity: 'Low',
    nextDeadline: 'Spring 2026 (DOL Apprenticeship)',
    rationale: 'Quick win — Orlando is the most-visited destination in the U.S. with 75M+ annual visitors. Walt Disney World (77,000 employees), Universal Orlando (25,000+ employees), and hundreds of hotels/restaurants create massive demand. DOL Apprenticeship grants fund hospitality RA expansion. Florida Flex supports incumbent worker upskilling with 50% employer match — major resorts have budgets. Unique Valencia advantage: geographic proximity to largest hospitality employers in the nation.',
  },
  {
    rank: 6,
    program: 'Film Production & Digital Media',
    grants: ['Florida Film & Entertainment Workforce', 'EDA Workforce', 'Lumina Pathways'],
    estimatedAnnual: '$320,000 - $720,000',
    complexity: 'Medium',
    nextDeadline: 'By partnership (Film Florida)',
    rationale: 'Central Florida is a major film/entertainment production hub (Universal Studios production facilities, theme park entertainment design, regional commercial production). Film Florida has dedicated workforce training grants. EDA supports creative economy workforce development. Lumina supports stackable entertainment pathways. Niche opportunity with less competition than traditional workforce programs.',
  },
  {
    rank: 7,
    program: 'Health Information Technology',
    grants: ['DOL H-1B', 'CareerSource FL Expansion', 'Florida HECTOR'],
    estimatedAnnual: '$360,000 - $740,000',
    complexity: 'Medium',
    nextDeadline: 'Biannual (CareerSource)',
    rationale: 'Healthcare IT is high-demand hybrid field (AdventHealth, Orlando Health, hospital systems). Already CareerSource-eligible — opportunity is expanding employer partnerships and capturing competitive grants. H-1B health IT cohorts are competitive. Florida HECTOR supports healthcare technology equipment and curriculum development.',
  },
  {
    rank: 8,
    program: 'Welding & CNC Machining',
    grants: ['DOL Apprenticeship', 'Florida Advanced Manufacturing', 'Florida Flex'],
    estimatedAnnual: '$380,000 - $760,000',
    complexity: 'Low',
    nextDeadline: 'Spring 2026 (Apprenticeship)',
    rationale: 'Quick win — manufacturing trades are well-established at Valencia with employer partnerships in aerospace, defense, and precision manufacturing. DOL Apprenticeship grants fund RA expansion. Florida Advanced Manufacturing grants support equipment and curriculum development. Florida Flex provides incumbent worker training funding with employer match.',
  },
  {
    rank: 9,
    program: 'Medical Assisting',
    grants: ['DOL Apprenticeship', 'Florida Flex', 'Central Florida Foundation'],
    estimatedAnnual: '$180,000 - $400,000',
    complexity: 'Low',
    nextDeadline: 'Spring 2026 (Apprenticeship)',
    rationale: 'Allied health apprenticeship models are expanding. Medical assisting is high-turnover field with persistent demand. Florida Flex supports employer-sponsored upskilling with 50% match. Central Florida Foundation targets healthcare access for underserved populations. Quick win with existing employer partnerships.',
  },
  {
    rank: 10,
    program: 'Quality Assurance Technology',
    grants: ['NSF ATE', 'NIST MEP', 'Florida Advanced Manufacturing'],
    estimatedAnnual: '$220,000 - $460,000',
    complexity: 'Medium',
    nextDeadline: 'Oct 2026 (NSF ATE)',
    rationale: 'Manufacturing quality is critical across aerospace, defense, and precision manufacturing sectors (Lockheed Martin AS9100 requirements, Siemens quality standards). NSF ATE quality/precision manufacturing grants are competitive but achievable. MEP and Florida Advanced Manufacturing support incumbent worker upskilling and equipment purchases.',
  },
  {
    rank: 11,
    program: 'Respiratory Therapy & Radiologic Technology',
    grants: ['DOL Apprenticeship', 'HHS HRSA Allied Health', 'Florida HECTOR'],
    estimatedAnnual: '$320,000 - $640,000',
    complexity: 'High',
    nextDeadline: 'Spring 2026 (Apprenticeship)',
    rationale: 'Specialized allied health programs with strong employer partnerships (AdventHealth, Orlando Health). Apprenticeship models require significant employer buy-in but are expanding in allied health. HRSA Allied Health targets workforce pipeline development. Florida HECTOR provides equipment funding (radiologic equipment is capital-intensive). Complex application but high-dollar awards.',
  },
  {
    rank: 12,
    program: 'Practical Nursing (LPN)',
    grants: ['DOL Apprenticeship', 'HHS HRSA Allied Health', 'Florida HECTOR'],
    estimatedAnnual: '$340,000 - $680,000',
    complexity: 'High',
    nextDeadline: 'Spring 2026 (Apprenticeship)',
    rationale: 'Nursing apprenticeship models require significant employer partnerships but are expanding nationally. HRSA Allied Health targets LPN pipeline development. Florida HECTOR supports nursing program equipment and technology. Complex application but high-dollar awards. AdventHealth and Orlando Health have LPN workforce needs.',
  },
  {
    rank: 13,
    program: 'HVAC & Electrical Technology',
    grants: ['DOL Apprenticeship', 'DOL YouthBuild', 'Florida Flex'],
    estimatedAnnual: '$320,000 - $640,000',
    complexity: 'Low',
    nextDeadline: 'Spring 2026 (Apprenticeship)',
    rationale: 'Construction trades have clear apprenticeship pathways. YouthBuild targets underserved youth populations with construction training — aligns with Valencia urban mission. Florida Flex supports employer-sponsored training for theme park maintenance operations (Disney, Universal have massive facilities maintenance operations). Quick win.',
  },
  {
    rank: 14,
    program: 'Network Systems Administration',
    grants: ['NSF ATE', 'DOL Apprenticeship', 'Florida Cybersecurity Workforce'],
    estimatedAnnual: '$280,000 - $580,000',
    complexity: 'Medium',
    nextDeadline: 'Oct 2026 (NSF ATE)',
    rationale: 'IT infrastructure is critical across all major employers (theme parks, healthcare, aerospace/defense, EA gaming infrastructure). NSF ATE IT/networking grants are competitive. Apprenticeship model is emerging in IT operations. Florida Cybersecurity Workforce grants cover network security skills.',
  },
  {
    rank: 15,
    program: 'Environmental Technology / Water/Wastewater',
    grants: ['EPA Environmental Workforce', 'EDA Workforce Development'],
    estimatedAnnual: '$90,000 - $200,000',
    complexity: 'Medium',
    nextDeadline: 'Annual (EPA)',
    rationale: 'Niche opportunity — EPA Environmental Workforce targets underserved populations for environmental careers. EDA supports regional economic priorities. Smaller award amounts but less competition. Florida water management districts need skilled technicians.',
  },
];

const federalDeepDive = [
  {
    grant: 'Perkins V — Career & Technical Education State Grants',
    status: 'Currently Funded',
    floridaAllocation: '$48.7M statewide (FY2025)',
    valenciaEstimate: '$520K - $780K annually',
    eligiblePrograms: 38,
    cipCodes: ['15.xxxx (Engineering Technology)', '47.xxxx (Mechanics & Repair)', '51.xxxx (Health Professions)', '52.xxxx (Business)', '50.xxxx (Film/Entertainment)'],
    details: 'Formula grant allocated to Florida Department of Education, then distributed to eligible postsecondary institutions based on Pell-eligible CTE concentrators. Valencia receives annual allocation for approved CTE programs. Funds support equipment, curriculum development, faculty professional development, and student support services. Valencia\'s large enrollment (75K+ students) positions it for substantial allocation.',
  },
  {
    grant: 'WIOA Adult & Dislocated Worker Formula Grants',
    status: 'Currently Funded (via FETPIP)',
    floridaAllocation: '$128M Adult, $74M Dislocated Worker (PY2025)',
    valenciaEstimate: '$440K - $620K annually (student ITAs)',
    eligiblePrograms: 42,
    cipCodes: ['All workforce certificates and diplomas on Florida Eligible Training Provider List (FETPIP)'],
    details: 'Formula grant to states, distributed via regional CareerSource boards. Valencia programs on FETPIP receive funding when students use Individual Training Accounts (ITAs). Tuition paid directly by CareerSource boards for eligible jobseekers. Valencia serves multiple CareerSource regions (Central Florida, Brevard, Osceola, etc.).',
  },
  {
    grant: 'NSF ATE — Advanced Technological Education',
    status: 'Not Currently Funded (Eligible)',
    nationalCompetition: '~$70M annually, 40-60 awards',
    valenciaEstimate: '$300K - $900K (3-year project)',
    eligiblePrograms: 22,
    cipCodes: ['15.xxxx (Engineering Tech)', '11.xxxx (Computer/IT)', '41.xxxx (Science Tech)'],
    details: 'Competitive grant supporting technician education in STEM fields. Priorities: advanced manufacturing, cybersecurity, biotechnology, data science. Typical awards $300K-$900K over 3 years. Requires industry partnerships, curriculum innovation, and dissemination plan. Strong fit for Valencia manufacturing/IT/aerospace programs serving Lockheed Martin, Siemens, L3Harris employers.',
  },
  {
    grant: 'DOL Apprenticeship Building America',
    status: 'Not Currently Funded (Eligible)',
    nationalCompetition: '~$200M appropriation (varies)',
    valenciaEstimate: '$600K - $1.4M (multi-year)',
    eligiblePrograms: 26,
    cipCodes: ['Registered Apprenticeship-eligible (manufacturing, healthcare, IT, hospitality, film/entertainment, construction)'],
    details: 'Competitive grant expanding Registered Apprenticeship programs. Priorities: non-traditional sectors (IT, healthcare, hospitality), underrepresented populations, multi-employer consortia. Requires 25% match (can be in-kind employer commitment). Valencia\'s hospitality programs serving Disney/Universal create unique apprenticeship opportunities not available to most community colleges.',
  },
  {
    grant: 'DOL H-1B One Workforce Grant Program',
    status: 'Not Currently Funded (Eligible)',
    nationalCompetition: '~$150M per cycle (biennial)',
    valenciaEstimate: '$1.5M - $3.5M (4-year project)',
    eligiblePrograms: 18,
    cipCodes: ['High-demand technical fields (IT, cybersecurity, healthcare, advanced manufacturing, aerospace)'],
    details: 'Large competitive grants for H-1B visa occupation training (high-skill technical fields). Requires multi-partner consortia (employers, workforce boards, community colleges). 25% non-federal match required. High-dollar awards but very competitive. Best fit: cybersecurity (defense contractors), healthcare IT (hospital systems), advanced manufacturing (Lockheed Martin, Siemens) consortia. Valencia\'s Central Florida location provides access to unique employer partnerships.',
  },
];

const stateDeepDive = [
  {
    grant: 'CareerSource Florida Workforce Training Grants',
    status: 'Currently Funded',
    appropriation: 'Varies by regional workforce board',
    valenciaEstimate: '$380K - $560K annually',
    eligiblePrograms: 40,
    details: 'Formula funding distributed through regional CareerSource boards (CareerSource Central Florida, Brevard, Osceola, Seminole). Supports training for in-demand occupations. Valencia works with multiple workforce boards across service area. Funds individual training accounts (ITAs) and sector partnership initiatives. Largest source of state workforce funding.',
  },
  {
    grant: 'Florida Job Growth Grant Fund',
    status: 'Currently Funded',
    appropriation: '$40M annually (competitive)',
    valenciaEstimate: '$420K - $820K annually',
    eligiblePrograms: 28,
    details: 'Competitive grants for workforce training projects in targeted industries (manufacturing, IT, healthcare, aviation/aerospace). Requires 50% match (can be in-kind). Valencia has successfully received Job Growth grants for healthcare and advanced manufacturing programs. Strong employer partnerships (Lockheed Martin, AdventHealth, Universal) strengthen applications.',
  },
  {
    grant: 'Quick Response Training (QRT)',
    status: 'Currently Funded',
    appropriation: '$18M annually',
    valenciaEstimate: '$280K - $480K annually',
    eligiblePrograms: 35,
    details: 'Customized training grants for new or expanding businesses. Rolling application cycle. No institutional match required. Supports incumbent worker training and new hire onboarding. Valencia serves as training provider for QRT-funded employer projects. Theme parks (Disney, Universal), healthcare systems, and manufacturing employers frequently use QRT for customized training.',
  },
  {
    grant: 'Florida Flex (Incumbent Worker Training)',
    status: 'Not Currently Funded (Eligible)',
    appropriation: '$12M annually',
    valenciaEstimate: '$220K - $400K (if awarded)',
    eligiblePrograms: 32,
    details: 'Competitive grants for incumbent worker upskilling. Requires 50% employer match. Targets advanced manufacturing, IT, healthcare sectors. Major employers (Disney, Universal, Lockheed Martin, AdventHealth) have training budgets to support match requirements. Valencia has infrastructure to deliver customized training.',
  },
  {
    grant: 'Florida HECTOR — Healthcare Equipment & Technology',
    status: 'Not Currently Funded (Eligible)',
    appropriation: '$8M biennial (competitive)',
    valenciaEstimate: '$250K - $500K (if awarded)',
    eligiblePrograms: 16,
    details: 'Competitive grants for healthcare program equipment and technology. Biennial application cycle. Requires 25% match. Funds simulation labs, medical equipment, health IT infrastructure. Valencia\'s large healthcare program portfolio (nursing, respiratory therapy, radiologic tech, surgical tech) positions it well. Equipment purchases qualify — addresses capital-intensive healthcare training needs.',
  },
  {
    grant: 'Florida Cybersecurity Workforce Development',
    status: 'Not Currently Funded (Eligible)',
    appropriation: '$5M annually (competitive)',
    valenciaEstimate: '$140K - $280K (if awarded)',
    eligiblePrograms: 6,
    details: 'Competitive grants for cybersecurity certificate and degree programs. Priorities: National Centers of Academic Excellence in Cybersecurity (CAE-C) designation, industry certifications, employer partnerships. Valencia\'s cybersecurity programs serve defense contractors (Lockheed Martin, L3Harris) requiring security clearances — strong employer validation. No match required.',
  },
];

const timeline = [
  { month: 'Mar 2026', grants: ['DOL Apprenticeship Building America', 'DOL YouthBuild'], priority: 'High' },
  { month: 'Apr 2026', grants: ['Florida Flex', 'CareerSource FL (varies by board)'], priority: 'Medium' },
  { month: 'May 2026', grants: ['HHS HRSA Allied Health (varies by program)', 'Florida Job Growth Grant Fund'], priority: 'High' },
  { month: 'Jun 2026', grants: ['Central Florida Foundation (Quarterly)'], priority: 'Low' },
  { month: 'Aug 2026', grants: ['NSF IUSE', 'Florida Advanced Manufacturing Competitive Grant'], priority: 'Medium' },
  { month: 'Sep 2026', grants: ['Florida Cybersecurity Workforce Development'], priority: 'High' },
  { month: 'Oct 2026', grants: ['NSF ATE', 'Florida HECTOR (biennial)'], priority: 'High' },
  { month: 'Nov 2026', grants: ['EPA Environmental Workforce'], priority: 'Low' },
  { month: 'Rolling', grants: ['EDA Workforce Development', 'NIST MEP', 'Quick Response Training (QRT)', 'Lockheed Martin STEM'], priority: 'Medium' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ValenciaGrantScanPage() {
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
              Valencia College
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={200} duration={800}>
            <p className="mt-4 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed">
              Orlando, Florida · February 2026
            </p>
          </AnimateOnScroll>

          {/* Stat Pills */}
          <AnimateOnScroll variant="fade-up" delay={300} duration={800}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                52 Programs Scanned
              </span>
              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                24 Grants Identified
              </span>
              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-500/10 to-teal-500/10 text-transparent bg-clip-text border border-purple-500/20" style={{ color: '#7c3aed' }}>
                $9.8M+ Eligible Funding
              </span>
              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                15 Unfunded Opportunities
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
              24 grants identified across 52 programs
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
                <p className="text-xs text-theme-muted mt-2">Active grants (Perkins V, WIOA, CareerSource, Job Growth, QRT)</p>
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
                  <p className="text-xs text-theme-muted mb-1">State (Florida)</p>
                  <p className="text-2xl font-bold font-mono text-theme-primary">{portfolioSummary.breakdown.state}</p>
                  <p className="text-xs text-theme-tertiary mt-0.5">CareerSource, Job Growth, QRT, Florida Flex, HECTOR</p>
                </div>
                <div>
                  <p className="text-xs text-theme-muted mb-1">Foundation & Industry</p>
                  <p className="text-2xl font-bold font-mono text-theme-primary">{portfolioSummary.breakdown.foundation}</p>
                  <p className="text-xs text-theme-tertiary mt-0.5">Central FL Foundation, Lumina, Lockheed Martin</p>
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
                Valencia is successfully capturing approximately <span className="font-semibold text-theme-primary">$2.4M annually</span> in formula and competitive grants. <span className="font-semibold">Perkins V</span> ($520K-$780K) flows consistently to 38 CTE programs across healthcare, IT, manufacturing, hospitality, and film/entertainment. <span className="font-semibold">WIOA funding</span> ($440K-$620K) supports 42 FETPIP-eligible programs through student Individual Training Accounts. <span className="font-semibold">CareerSource Florida</span> grants ($380K-$560K) serve workforce training across multiple regional boards. <span className="font-semibold">Florida Job Growth Grant Fund</span> ($420K-$820K) and <span className="font-semibold">Quick Response Training</span> ($280K-$480K) support customized employer partnerships. These five funding streams provide a stable base for workforce program operations.
              </p>
            </div>

            <div className="card-cosmic rounded-2xl p-6 border-amber-500/30 bg-amber-500/5">
              <p className="font-heading font-bold text-lg text-theme-primary mb-3">What&apos;s Being Left on the Table</p>
              <p className="text-theme-secondary leading-relaxed">
                An estimated <span className="font-semibold text-amber-700 dark:text-amber-400">$7.4M+ in annual eligible funding</span> is not currently captured. The largest missed opportunities: <span className="font-semibold">NSF ATE</span> (Advanced Technological Education) could provide $300K-$900K for cybersecurity, manufacturing, and IT consortia serving defense contractors. <span className="font-semibold">DOL Apprenticeship Building America</span> grants ($600K-$1.4M) would expand registered apprenticeships in hospitality (Disney/Universal partnerships), healthcare (AdventHealth/Orlando Health), and IT sectors. <span className="font-semibold">DOL H-1B One Workforce</span> grants ($1.5M-$3.5M) target high-skill technical training in cybersecurity, healthcare IT, and advanced manufacturing — all Valencia strengths. <span className="font-semibold">Florida HECTOR</span> ($250K-$500K) provides healthcare equipment funding for capital-intensive programs. <span className="font-semibold">Florida Flex</span> incumbent worker grants ($220K-$400K) remain untapped despite major employer training budgets.
              </p>
            </div>

            <div className="card-cosmic rounded-2xl p-6">
              <p className="font-heading font-bold text-lg text-theme-primary mb-3">Biggest Opportunities</p>
              <div className="space-y-3 text-sm text-theme-secondary leading-relaxed">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-400">1</span>
                  <p><span className="font-semibold text-theme-primary">Cybersecurity & Cloud Computing</span> — NSF ATE + DOL H-1B + Apprenticeship + Florida Cybersecurity grants could bring $1.4M-$2.9M annually. Lockheed Martin, L3Harris Technologies, and Siemens Energy create strong defense contractor demand. NSF ATE cybersecurity consortia are competitive but achievable with multi-employer partnerships. Florida Cybersecurity Workforce grants prioritize Florida College System institutions.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-400">2</span>
                  <p><span className="font-semibold text-theme-primary">Healthcare Programs Portfolio</span> — DOL Apprenticeship + HHS HRSA Allied Health + H-1B + Florida HECTOR could bring $800K-$1.6M annually. AdventHealth and Orlando Health partnerships (combined 40,000+ employees) position Valencia for nursing and allied health apprenticeship expansion. HRSA targets underserved populations (Valencia urban Orlando mission alignment). Florida HECTOR addresses capital-intensive equipment needs.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-400">3</span>
                  <p><span className="font-semibold text-theme-primary">Hospitality Management & Culinary Arts</span> — DOL Apprenticeship + EDA Workforce + Florida Flex could bring $500K-$1.1M annually. <span className="font-semibold">Unique Valencia advantage:</span> Orlando is the most-visited U.S. destination (75M+ annual visitors) with Walt Disney World (77,000 employees) and Universal Orlando (25,000+ employees) — the largest hospitality employers in the nation. No other community college has this geographic positioning. Hospitality apprenticeship grants are quick wins with employer match budgets available.</p>
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
            <p className="mt-3 text-theme-secondary">25 programs × 8 major grants — the complete picture</p>
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
              Top 15 programs eligible but not receiving grant funding
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
                    <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-1">Florida / National Allocation</p>
                    <p className="text-sm font-mono text-theme-primary">{item.floridaAllocation || item.nationalCompetition}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-1">Valencia Estimate</p>
                    <p className="text-sm font-mono text-gradient-cosmic font-bold">{item.valenciaEstimate}</p>
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
              Florida-specific funding opportunities
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
                    <p className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-1">Valencia Estimate</p>
                    <p className="text-sm font-mono text-gradient-cosmic font-bold">{item.valenciaEstimate}</p>
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
                <li><span className="font-semibold">Florida Department of Education</span> — Perkins V, HECTOR, Advanced Manufacturing, Baccalaureate Articulation grants</li>
                <li><span className="font-semibold">CareerSource Florida</span> — WIOA allocations, workforce training grants, QRT, Florida Flex</li>
                <li><span className="font-semibold">Florida Department of Economic Opportunity</span> — Job Growth Grant Fund</li>
                <li><span className="font-semibold">Florida Digital Service</span> — Cybersecurity Workforce Development grants</li>
                <li><span className="font-semibold">IPEDS CIP Code Database</span> — Program classification for grant eligibility matching</li>
                <li><span className="font-semibold">Valencia College Catalog</span> — Current program offerings, CIP codes, credential types</li>
                <li><span className="font-semibold">Foundation Directories</span> — Central Florida Foundation, Lumina Foundation, regional workforce funders</li>
              </ul>
            </div>

            <div className="card-cosmic rounded-2xl p-6">
              <p className="font-heading font-bold text-lg text-theme-primary mb-3">Eligibility Determination Process</p>
              <ol className="space-y-2 text-sm text-theme-secondary leading-relaxed list-decimal list-inside">
                <li>Mapped all 52 Valencia workforce programs to IPEDS CIP codes (6-digit classification)</li>
                <li>Cross-referenced each grant&apos;s eligible CIP code ranges against Valencia program portfolio</li>
                <li>Verified credential type eligibility (certificate, diploma, associate degree) against grant requirements</li>
                <li>Assessed institutional eligibility (public community college, Florida location, accreditation status)</li>
                <li>Evaluated programmatic requirements (apprenticeship registration, FETPIP status, industry partnerships)</li>
                <li>Estimated funding amounts based on: (a) published award ranges, (b) Florida historical allocations, (c) peer institution awards</li>
                <li>Classified current funding status through Valencia grants office verification</li>
              </ol>
            </div>

            <div className="card-cosmic rounded-2xl p-6">
              <p className="font-heading font-bold text-lg text-theme-primary mb-3">Funding Estimates</p>
              <p className="text-sm text-theme-secondary leading-relaxed">
                Annual funding estimates represent <span className="font-semibold">potential eligible funding if programs successfully apply and receive awards</span>. Actual awards depend on: application quality, employer partnership strength, institutional match availability, federal/state appropriations, and competitive peer applications. Formula grants (Perkins V, WIOA) are based on published Florida allocations and historical Valencia share. Competitive grants (NSF, DOL) use typical award ranges and peer institution benchmarks. State grants reflect published appropriations and eligibility criteria. Foundation grants are based on published guidelines and award histories.
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
