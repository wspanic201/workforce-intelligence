import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';
import { AnimateOnScroll, StaggerChildren } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Program Finder — Wake Technical Community College | Wavelength Sample Report',
  description:
    'Full Program Finder for Wake Technical Community College. 8 high-potential programs scored and ranked, plus 5 Blue Ocean opportunities — see the complete analysis.',
  alternates: { canonical: 'https://withwavelength.com/report/demo' },
  openGraph: {
    title: 'Program Finder — Wake Technical Community College',
    description:
      '8 scored program opportunities, 5 Blue Ocean discoveries, and a complete funding roadmap for Wake Technical Community College.',
    url: 'https://withwavelength.com/report/demo',
    type: 'article',
  },
};

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 9.0) return 'text-gradient-cosmic';
  if (score >= 8.0) return 'text-teal-600 dark:text-teal-400';
  if (score >= 7.0) return 'text-blue-600 dark:text-blue-400';
  return 'text-theme-secondary';
}

function ScoreDisplay({ score }: { score: number }) {
  if (score >= 9.0) {
    return (
      <span
        className="text-4xl font-bold font-mono"
        style={{
          background: 'linear-gradient(135deg, #a855f7, #6366f1, #14b8a6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {score}
      </span>
    );
  }
  return <span className={`text-4xl font-bold font-mono ${scoreColor(score)}`}>{score}</span>;
}

function categoryBadge(category: string) {
  const map: Record<string, { label: string; cls: string }> = {
    quick_win: { label: 'Quick Win', cls: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20' },
    strategic_build: { label: 'Strategic Build', cls: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20' },
    blue_ocean: { label: 'Blue Ocean', cls: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20' },
    emerging: { label: 'Emerging', cls: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20' },
  };
  const m = map[category] ?? { label: category, cls: 'bg-theme-surface text-theme-secondary border border-theme-subtle' };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m.cls}`}>{m.label}</span>;
}

function DimensionBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 10) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-theme-muted w-24 text-right flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-theme-surface overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #a855f7, #14b8a6)',
          }}
        />
      </div>
      <span className="text-xs font-mono font-semibold text-theme-primary w-6">{value}</span>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const mainPrograms = [
  {
    rank: 1,
    name: 'Healthcare Management Certificate',
    score: 8.7,
    category: 'quick_win',
    dimensions: { demand: 9, competition: 9, revenue: 8, wages: 9, speed: 8 },
    opportunity: 'Addresses critical gap in healthcare leadership pipeline serving Duke Health, WakeMed, and UNC Rex systems. Only one proprietary competitor in a region where healthcare is the dominant employment sector with 60,000+ employees across major systems. Stackable pathway to existing business programs positions Wake Tech as affordable alternative.',
    demandEvidence: [
      'Duke University and Duke Health Systems (43,108 employees) — largest employer in Durham County with consistent management hiring needs',
      'WakeMed Health & Hospitals (10,307 employees) with consistent hiring for clinical and support roles requiring management oversight',
      'UNC Rex Healthcare System (7,700 employees) with consistent hiring for medical and support staff management',
      'Only 1 provider (proprietary school) serving undersaturated market',
    ],
    competitiveLandscape: 'White Space',
    metrics: {
      openings: '200–300',
      wage: '$48–55/hr',
      growth: 'Growing healthcare sector requires management professionals',
      postings: 'Moderate to high across Duke, WakeMed, UNC Rex',
    },
    snapshot: {
      duration: '12–16 weeks certificate',
      format: 'Hybrid with evening options for working healthcare professionals',
      credentials: 'Healthcare Management Certificate → Business AAS → Advanced Healthcare Administration Certificate',
      audience: 'Current healthcare workers (nurses, technicians, administrative staff) seeking advancement into supervisory and management roles',
    },
    grants: [
      'Workforce Pell Grants — Federal Pell for approved short-term workforce programs (July 1, 2026)',
      'Short-Term Workforce Development (STWD) Grant — NC Community Colleges 2025–2026',
      'Build Your Future Grant — Workforce-focused program tuition coverage',
      'Accelerate NC Life Sciences Manufacturing — $25M Phase 2 award',
      'Industry-Driven Skills Training Fund — $30M from US Department of Labor',
    ],
    barriers: [
      'Duke and NC State hiring freezes in 2024 may temporarily dampen immediate hiring',
      'Need healthcare industry advisory board to ensure curriculum relevance',
      'Potential federal funding cuts to Duke could impact long-term demand',
    ],
    validation: [
      'What specific management competencies do Duke Health, WakeMed, and UNC Rex prioritize when promoting from clinical to management roles?',
      'Would these employers provide tuition reimbursement or guaranteed interview pathways for certificate completers?',
      'What is the actual annual turnover rate in healthcare management positions across the three major systems?',
      'Can existing Business faculty deliver healthcare-specific management content or would clinical partnerships be required?',
    ],
  },
  {
    rank: 2,
    name: 'Construction Management Certificate',
    score: 8.5,
    category: 'quick_win',
    dimensions: { demand: 9, competition: 9, revenue: 8, wages: 8, speed: 8 },
    opportunity: 'Rapid regional development in Research Triangle creates urgent demand for construction management professionals with only one proprietary competitor. Amazon\'s explosive growth (4,770+ employees), Novo Nordisk\'s $4.1B investment, and ongoing commercial development create immediate pipeline needs. Leverages existing Architectural Technology faculty and facilities.',
    demandEvidence: [
      'Only 1 provider serving undersaturated market despite rapid regional development creating strong demand',
      'Amazon RDU1 Fulfillment Center (4,770+ employees) — fastest growing employer, jumped from #21 in 2020 to #5, requiring ongoing facility expansion',
      'Novo Nordisk announced $4.1B investment and 1,000 new jobs in June 2024 requiring major construction management',
      'Construction trending certification with single mention in regional data',
    ],
    competitiveLandscape: 'White Space',
    metrics: {
      openings: '150–250',
      wage: '$42–50/hr',
      growth: 'Rapid regional development creates strong demand',
      postings: 'High based on major employer expansions',
    },
    snapshot: {
      duration: '16 weeks certificate',
      format: 'Hybrid with weekend options for working tradespeople',
      credentials: 'Construction Management Certificate → Architectural Technology AAS → Advanced Project Management Certificate',
      audience: 'Experienced construction tradespeople seeking advancement to supervisory/management roles and career changers',
    },
    grants: [
      'Workforce Pell Grants — Federal Pell for approved short-term workforce programs (July 1, 2026)',
      'Short-Term Workforce Development (STWD) Grant — NC Community Colleges 2025–2026',
      'Build Your Future Grant — Workforce-focused program tuition coverage',
      'Accelerate NC Life Sciences Manufacturing — $25M Phase 2 award',
      'Industry-Driven Skills Training Fund — $30M from US Department of Labor',
    ],
    barriers: [
      'Need industry advisory council from general contractors and developers',
      'May require additional faculty with construction management (not just architectural) background',
      'Licensing and bonding requirements vary by specialty',
    ],
    validation: [
      'What specific project management software and methodologies do major regional contractors require?',
      'Would general contractors provide apprenticeship or job shadowing opportunities for students?',
      'What is the typical career progression timeline from trades to management in the local market?',
      'Can the program qualify for Industry-Driven Skills Training Fund ($30M available) given employer demand?',
    ],
  },
  {
    rank: 3,
    name: 'Industrial Machinery Maintenance Certificate',
    score: 8.1,
    category: 'strategic_build',
    dimensions: { demand: 8, competition: 9, revenue: 7, wages: 7, speed: 6 },
    opportunity: 'Research Triangle\'s advanced manufacturing and biotech sectors require specialized machinery maintenance with only one competitor. Novo Nordisk\'s $4.1B pharmaceutical expansion and Lenovo\'s 5,100-employee manufacturing headquarters create immediate demand. Aligns with $25M Accelerate NC Life Sciences Manufacturing grant and existing Advanced Manufacturing workforce training.',
    demandEvidence: [
      'Only 1 provider serving undersaturated market for Research Triangle\'s advanced manufacturing and biotech sectors',
      'Novo Nordisk (2,500+ employees) announced $4.1B investment and 1,000 new jobs in June 2024 for pharmaceutical manufacturing',
      'Lenovo (5,100 employees) — North American headquarters in Morrisville with most of 5,000+ U.S. workers based in NC',
      '$25 million Accelerate NC Life Sciences Manufacturing Phase 2 award received September 2022',
    ],
    competitiveLandscape: 'White Space',
    metrics: {
      openings: '100–150',
      wage: '$24–28/hr',
      growth: 'Strong growth aligned with pharmaceutical and tech manufacturing expansion',
      postings: 'Moderate to high in advanced manufacturing sector',
    },
    snapshot: {
      duration: '24 weeks diploma program',
      format: 'In-person with lab-intensive training and employer partnerships',
      credentials: 'Industrial Maintenance Fundamentals (12 wk) → Industrial Machinery Maintenance Diploma (24 wk) → Advanced Automation & Robotics Certificate',
      audience: 'Career changers, veterans with mechanical backgrounds, incumbent workers from food/general manufacturing seeking upskilling',
    },
    grants: [
      'Workforce Pell Grants — Federal Pell for approved short-term workforce programs (July 1, 2026)',
      'Short-Term Workforce Development (STWD) Grant — NC Community Colleges 2025–2026',
      'Build Your Future Grant — Workforce-focused program tuition coverage',
      'Accelerate NC Life Sciences Manufacturing — $25M Phase 2 (direct industry match)',
      'Industry-Driven Skills Training Fund — $30M from US Department of Labor',
    ],
    barriers: [
      'Requires significant capital investment in industrial equipment and lab space',
      '6–9 month development timeline for specialized curriculum and industry partnerships',
      'Need to recruit faculty with pharmaceutical/biotech manufacturing maintenance experience',
      'Wolfspeed\'s 20% headcount reduction in 2024 signals semiconductor sector volatility',
    ],
    validation: [
      'Would Novo Nordisk commit to hiring pipeline or apprenticeship partnerships given their $4.1B investment?',
      'What specific machinery platforms (PLCs, robotics systems, pharmaceutical equipment) should curriculum prioritize?',
      'Can the program access Accelerate NC Life Sciences Manufacturing funding for equipment and curriculum development?',
      'What is Lenovo\'s actual maintenance workforce turnover and hiring projection for next 3 years?',
    ],
  },
  {
    rank: 4,
    name: 'Plumbing Technology Certificate',
    score: 8.0,
    category: 'quick_win',
    dimensions: { demand: 8, competition: 8, revenue: 7, wages: 7, speed: 9 },
    opportunity: 'Both existing providers are proprietary schools, creating opportunity for affordable community college alternative. Construction boom driven by Amazon expansion, Novo Nordisk\'s $4.1B investment, and regional development creates persistent demand. Can launch quickly using existing Construction and Maintenance workforce training infrastructure.',
    demandEvidence: [
      'Both existing providers are proprietary schools — community college option could provide more affordable pathway',
      'Plumbing trending certification with single mention indicating market demand',
      'Amazon RDU1 (4,770+ employees) and Novo Nordisk $4.1B investment drive commercial construction requiring plumbing trades',
      'Existing Construction and Maintenance workforce training infrastructure',
    ],
    competitiveLandscape: 'Competitive Advantage',
    metrics: {
      openings: '120–180',
      wage: '$22–26/hr',
      growth: 'Construction boom drives persistent demand',
      postings: 'Moderate across commercial and residential sectors',
    },
    snapshot: {
      duration: '16 weeks certificate',
      format: 'In-person with hands-on lab training and apprenticeship coordination',
      credentials: 'Plumbing Fundamentals (8 wk) → Plumbing Technology Certificate (16 wk) → Advanced Plumbing/Gas Fitting Certificate',
      audience: 'Career changers, incumbent construction workers seeking specialization, students priced out of proprietary options',
    },
    grants: [
      'Workforce Pell Grants — Federal Pell for approved short-term workforce programs (July 1, 2026)',
      'Short-Term Workforce Development (STWD) Grant — NC Community Colleges 2025–2026',
      'Build Your Future Grant — Workforce-focused program tuition coverage',
      'Accelerate NC Life Sciences Manufacturing — $25M Phase 2 award',
      'Industry-Driven Skills Training Fund — $30M from US Department of Labor',
    ],
    barriers: [
      'Need plumbing-specific lab equipment and facilities',
      'Must establish relationships with licensed plumbers for apprenticeship coordination',
      'NC licensing requirements may extend time-to-employment beyond certificate completion',
    ],
    validation: [
      'What is the actual cost differential between Wake Tech and proprietary competitors, and would this drive enrollment?',
      'Would major plumbing contractors provide apprenticeship slots and equipment donations?',
      'What are NC plumbing licensing requirements and exam pass rates for proprietary school graduates?',
      'Can existing Construction and Maintenance workforce training faculty teach plumbing or is specialized hiring needed?',
    ],
  },
  {
    rank: 5,
    name: 'Biomanufacturing Technician Certificate',
    score: 7.9,
    category: 'strategic_build',
    dimensions: { demand: 8, competition: 7, revenue: 8, wages: 7, speed: 7 },
    opportunity: 'Novo Nordisk\'s $4.1B investment and 1,000 new jobs in pharmaceutical manufacturing creates unprecedented demand for biomanufacturing technicians. Wake Tech already received $25M Accelerate NC Life Sciences Manufacturing grant, providing funding and infrastructure. Research Triangle\'s life sciences cluster creates sustainable long-term demand with premium wages.',
    demandEvidence: [
      'Novo Nordisk announced $4.1B investment and 1,000 new jobs in June 2024 manufacturing insulin and weight-loss drugs',
      '$25 million Accelerate NC Life Sciences Manufacturing Phase 2 award received September 2022',
      'Existing Biotechnology workforce training program provides foundation',
      'Research Triangle\'s advanced manufacturing and biotech sectors require specialized workforce',
    ],
    competitiveLandscape: 'Competitive Advantage',
    metrics: {
      openings: '150–200',
      wage: '$23–28/hr',
      growth: 'Exceptional growth with $4.1B local investment',
      postings: 'High and accelerating with Novo Nordisk hiring',
    },
    snapshot: {
      duration: '16–20 weeks certificate',
      format: 'In-person with lab-intensive training and employer partnerships',
      credentials: 'Biomanufacturing Fundamentals (8 wk) → Biomanufacturing Technician Certificate (16–20 wk) → Advanced Bioprocessing → Biotechnology AAS',
      audience: 'Career changers seeking pharmaceutical sector entry, incumbent manufacturing workers, recent STEM graduates',
    },
    grants: [
      'Workforce Pell Grants — Federal Pell for approved short-term workforce programs (July 1, 2026)',
      'Short-Term Workforce Development (STWD) Grant — NC Community Colleges 2025–2026',
      'Build Your Future Grant — Workforce-focused program tuition coverage',
      'Accelerate NC Life Sciences Manufacturing — $25M Phase 2 (direct industry match)',
      'Industry-Driven Skills Training Fund — $30M from US Department of Labor',
    ],
    barriers: [
      'May compete with existing Biotechnology workforce training program — need clear differentiation',
      'Requires specialized cleanroom facilities and biomanufacturing equipment',
      '6–9 month curriculum development timeline to align with pharmaceutical industry standards',
      'Multiple providers likely targeting same Novo Nordisk opportunity',
    ],
    validation: [
      'Would Novo Nordisk commit to direct hiring pipeline or apprenticeship partnerships?',
      'What specific biomanufacturing competencies and certifications does Novo Nordisk require for entry-level technicians?',
      'Can Accelerate NC funding cover program expansion costs or is it already allocated?',
      'What is the competitive landscape — how many other community colleges are developing similar programs?',
    ],
  },
  {
    rank: 6,
    name: 'Cybersecurity Fundamentals Certificate',
    score: 7.9,
    category: 'quick_win',
    dimensions: { demand: 8, competition: 7, revenue: 8, wages: 9, speed: 8 },
    opportunity: 'Research Triangle\'s tech sector and government contractors create critical regional need. Two existing providers focus on IT support rather than specialized cybersecurity. Cisco Systems (5,000+ employees) and Fidelity Investments (8,290 employees with 15% growth) drive demand. Fast launch using existing Information and Digital Technology workforce training.',
    demandEvidence: [
      'Critical regional need given Research Triangle\'s tech sector and government contractors — existing programs focus on IT support',
      'Cisco Systems (5,000+ employees) — fourth largest employer in Durham County in Research Triangle Park',
      'Fidelity Investments (8,290 employees) with 15% growth since 2022 driven by technology positions',
      'Existing Information and Digital Technology workforce training infrastructure',
    ],
    competitiveLandscape: 'Competitive Advantage',
    metrics: {
      openings: '100–150',
      wage: '$38–45/hr',
      growth: 'High growth in tech sector and government contracting',
      postings: 'High across technology and financial services sectors',
    },
    snapshot: {
      duration: '16 weeks certificate',
      format: 'Hybrid with online theory and in-person labs',
      credentials: 'Cybersecurity Fundamentals → Advanced Cybersecurity → IT/Cybersecurity AAS; CompTIA Security+, CySA+',
      audience: 'IT professionals seeking specialization, career changers from technical backgrounds, military veterans with security clearances',
    },
    grants: [
      'Workforce Pell Grants — Federal Pell for approved short-term workforce programs (July 1, 2026)',
      'Short-Term Workforce Development (STWD) Grant — NC Community Colleges 2025–2026',
      'Build Your Future Grant — Workforce-focused program tuition coverage',
      'Accelerate NC Life Sciences Manufacturing — $25M Phase 2 award',
      'Industry-Driven Skills Training Fund — $30M from US Department of Labor',
    ],
    barriers: [
      'Two existing providers create moderate competition',
      'Rapidly evolving field requires continuous curriculum updates',
      'May need specialized cybersecurity lab equipment and software licenses',
      'Industry certifications add cost and complexity for students',
    ],
    validation: [
      'Would Cisco and Fidelity provide curriculum input, guest instructors, or hiring commitments?',
      'What specific cybersecurity certifications do regional employers require for entry-level positions?',
      'How do existing two providers differentiate their programs, and where is the white space?',
      'Can existing IT faculty teach cybersecurity or is specialized hiring required?',
    ],
  },
  {
    rank: 7,
    name: 'CDL Training — Class A',
    score: 7.7,
    category: 'quick_win',
    dimensions: { demand: 9, competition: 6, revenue: 7, wages: 6, speed: 10 },
    opportunity: 'Persistent driver shortage despite three existing providers suggests capacity constraints. Amazon\'s explosive growth to 4,770+ employees and Food Lion\'s 9,037-employee distribution network create immediate local demand. Can leverage existing Transportation workforce training and qualify for multiple federal workforce grants.',
    demandEvidence: [
      'Multiple providers serve this market, but persistent driver shortage suggests capacity constraints',
      'Amazon RDU1 Fulfillment Center (4,770+ employees) — fastest growing employer requiring logistics drivers',
      'Food Lion (9,037 employees) — major retail employer with consistent hiring for distribution operations',
      'Existing Transportation workforce training infrastructure',
    ],
    competitiveLandscape: 'Capacity Expansion',
    metrics: {
      openings: '300–400',
      wage: '$20–24/hr',
      growth: 'Persistent shortage indicates ongoing demand',
      postings: 'High across logistics and distribution sectors',
    },
    snapshot: {
      duration: '6–8 weeks certificate',
      format: 'In-person with behind-the-wheel training',
      credentials: 'CDL Class A Certificate, Hazmat Endorsement, Tanker Endorsement, Doubles/Triples Endorsement',
      audience: 'Career changers seeking immediate employment, displaced workers, individuals seeking stable employment with Amazon and Food Lion',
    },
    grants: [
      'Workforce Pell Grants — Federal Pell for approved short-term workforce programs (July 1, 2026)',
      'Short-Term Workforce Development (STWD) Grant — NC Community Colleges 2025–2026',
      'Build Your Future Grant — Workforce-focused program tuition coverage',
      'Accelerate NC Life Sciences Manufacturing — $25M Phase 2 award',
      'Industry-Driven Skills Training Fund — $30M from US Department of Labor',
    ],
    barriers: [
      'Three existing providers create competitive market',
      'Requires commercial vehicles, driving range, and specialized insurance',
      'Federal CDL regulations require specific instructor qualifications',
      'Lower wage outcomes compared to other skilled trades may impact enrollment',
    ],
    validation: [
      'Would Amazon and Food Lion commit to direct hiring pipelines or tuition reimbursement?',
      'What is the actual unmet demand — how many qualified applicants do existing providers graduate annually vs. regional need?',
      'Can the program qualify for Workforce Pell Grants given short duration and employment outcomes?',
      'What is the equipment and insurance cost for launching CDL training, and are there leasing options?',
    ],
  },
  {
    rank: 8,
    name: 'Welding Technology Certificate',
    score: 6.8,
    category: 'strategic_build',
    dimensions: { demand: 7, competition: 6, revenue: 6, wages: 6, speed: 6 },
    opportunity: 'Multiple trending certification mentions signal strong demand. Two existing providers serve construction and general manufacturing, but Research Triangle\'s advanced manufacturing (Novo Nordisk $4.1B, Lenovo 5,100 employees) creates opportunity for specialized curriculum. Can differentiate with pharmaceutical/cleanroom welding and precision manufacturing focus.',
    demandEvidence: [
      'Welding trending certification with multiple mentions indicating strong market demand',
      'Two providers serve construction and manufacturing with demand remaining strong — specialization opportunity exists',
      'Novo Nordisk (2,500+ employees) $4.1B pharmaceutical manufacturing investment requiring specialized welding for cleanroom environments',
      'Lenovo (5,100 employees) North American headquarters requiring precision manufacturing welding',
    ],
    competitiveLandscape: 'Competitive Advantage',
    metrics: {
      openings: '100–150',
      wage: '$19–24/hr',
      growth: 'Strong with construction and advanced manufacturing demand',
      postings: 'Moderate to high across construction and manufacturing',
    },
    snapshot: {
      duration: '20–24 weeks certificate',
      format: 'In-person with intensive lab training',
      credentials: 'Welding Fundamentals (12 wk) → Welding Technology Certificate (20–24 wk) → Advanced Manufacturing Welding Specialization; AWS certifications',
      audience: 'Career changers, incumbent construction welders seeking upskilling to advanced manufacturing, students seeking differentiated pharmaceutical/tech focus',
    },
    grants: [
      'Workforce Pell Grants — Federal Pell for approved short-term workforce programs (July 1, 2026)',
      'Short-Term Workforce Development (STWD) Grant — NC Community Colleges 2025–2026',
      'Build Your Future Grant — Workforce-focused program tuition coverage',
      'Accelerate NC Life Sciences Manufacturing — $25M Phase 2 (direct industry match)',
      'Industry-Driven Skills Training Fund — $30M from US Department of Labor',
    ],
    barriers: [
      'Two existing providers create competitive market',
      'Requires significant welding equipment and ventilation infrastructure investment',
      'Advanced manufacturing specialization may require 6–9 months curriculum development',
      'Need industry partnerships to validate pharmaceutical/cleanroom welding curriculum',
      'Lower wage outcomes compared to other skilled trades may impact enrollment',
    ],
    validation: [
      'Would Novo Nordisk and Lenovo commit to hiring pipelines for graduates with pharmaceutical/cleanroom specialization?',
      'What specific welding processes and certifications do advanced manufacturers require vs. construction welding?',
      'How do existing two providers position their programs, and is advanced manufacturing specialization truly differentiated?',
      'What is the cost and timeline for establishing pharmaceutical-grade welding lab facilities?',
    ],
  },
];

const blueOceanPrograms = [
  {
    rank: 1,
    name: 'Biologics Manufacturing Quality Systems Certificate',
    score: 9.05,
    category: 'blue_ocean',
    discoveryMethod: 'Economic Development Signal',
    competitivePosition: 'White Space',
    dimensions: { demand: 10, competition: 9, revenue: 9, wages: 9, speed: 7 },
    opportunity: 'The Research Triangle is experiencing an unprecedented $10.8 billion life sciences boom with Novartis doubling investment to $2 billion (700 new jobs), Johnson & Johnson\'s $2 billion Wilson biologics campus, Genentech doubling Holly Springs investment ($100+ new jobs), and Fujifilm expansions. These facilities need specialized quality assurance/quality control technicians who understand biologics-specific GMP, regulatory compliance, and documentation — a distinct skill set from general biomanufacturing.',
    whyNonObvious: 'Wake Tech already offers general Biomanufacturing Technician training. The hidden opportunity is the specialized quality systems role — biologics manufacturing has exponentially more complex regulatory requirements (FDA biologics license applications, batch record review, deviation management) than small molecule manufacturing. These roles require understanding of both technical biology AND regulatory documentation systems.',
    whyDefensible: 'Over $10.8 billion in announced life sciences investment with multiple facilities opening 2027–2028 creates immediate demand. Quality systems roles are typically 15–20% of biologics manufacturing workforce but require specialized training that general biomanufacturing programs don\'t provide.',
    evidence: [
      'Novartis announced $771 million expansion bringing 700 new jobs in biologics and small molecule manufacturing',
      'Novartis more than doubling investment to $2 billion, increasing production volume and scale at Durham/Morrisville facilities',
      'Johnson & Johnson\'s $2 billion Wilson biologics campus part of $10.8 billion life sciences boom',
      'Genentech announcing plans to double investment in Holly Springs with additional 100 new jobs supporting 500+ high-wage positions',
      'Novartis building flagship manufacturing hub, encompassing more than 700,000 square feet — anticipated opening 2027–2028',
    ],
    firstMover: 'Biologics quality systems is distinct from general biomanufacturing (which Wake Tech offers) and from pharmaceutical quality (different regulatory pathway). First mover captures direct partnerships with Novartis, Genentech, J&J for curriculum development and guaranteed hiring pipelines before these companies build internal training programs.',
    metrics: {
      occupation: 'Biologics Quality Control Technician (19-4099)',
      demand: 'Very High — 170–195 specialized QC roles in 24 months',
      wage: '$28–38/hr',
    },
    validation: [
      'What percentage of Novartis\'s 700 new hires will be quality systems roles?',
      'Do these employers currently require 4-year degrees for QA/QC positions, or would they accept certificate + experience?',
      'What specific quality systems software/platforms (Trackwise, MasterControl, etc.) should curriculum include?',
      'Would employers provide equipment/software access for hands-on training?',
    ],
  },
  {
    rank: 2,
    name: 'Educational Facilities Operations Specialist Certificate',
    score: 8.55,
    category: 'blue_ocean',
    discoveryMethod: 'Employer Pain Point Analysis',
    competitivePosition: 'White Space',
    dimensions: { demand: 9, competition: 10, revenue: 8, wages: 7, speed: 8 },
    opportunity: 'Wake County Public School System is the largest employer in the region and is experiencing hiring freezes, spending restrictions, and critical staffing shortages requiring $1,200 sign-on bonuses for bus drivers and up to $10,000 retention bonuses for hard-to-fill positions. This certificate would train specialized facilities staff who can manage HVAC, electrical, plumbing, and safety systems specific to K-12 educational environments.',
    whyNonObvious: 'Conventional analysis identifies standalone trades (HVAC, electrical, plumbing) but misses the specialized niche of educational facility operations — which requires understanding school safety codes, energy efficiency mandates for public buildings, coordinated scheduling around academic calendars, and child safety protocols.',
    whyDefensible: 'WCPSS is offering retention bonuses up to $10,000 for hard-to-fill positions while simultaneously implementing hiring freezes — classic retention/recruitment crisis. As the state\'s largest school system and county\'s 3rd largest employer, their workforce needs represent substantial sustained demand.',
    evidence: [
      'Wake County Public School System implementing hiring freeze and spending restrictions, indicating severe budget pressure',
      'WCPSS offering $1,200 sign-on bonus for bus drivers and up to $10,000 for hard-to-fill positions',
      'Wake County Public School System is the 3rd largest employer in Wake County',
      'WCPSS is the largest public school system in the state needing passionate educators and support staff',
    ],
    firstMover: 'No community college in NC offers educational facilities-specific training. First mover captures direct partnership with WCPSS (guaranteed pipeline), positions for statewide replication as other districts face same pressures, and creates apprenticeship pathway before competitors recognize the gap.',
    metrics: {
      occupation: 'Educational Facilities Manager/Technician (47-1011)',
      demand: 'High and sustained — WCPSS alone operates 150+ facilities; add Durham, Chapel Hill-Carrboro for 200+ employer sites',
      wage: '$22–32/hr',
    },
    validation: [
      'How many facilities maintenance positions does WCPSS have unfilled currently?',
      'What is the average time-to-fill for educational facilities technician roles?',
      'Would WCPSS commit to guaranteed interviews/apprenticeships for certificate graduates?',
      'What specific certifications do educational facilities roles require beyond standard trades licenses?',
    ],
  },
  {
    rank: 3,
    name: 'State Government Workforce Transition Bridge Certificate',
    score: 8.0,
    category: 'blue_ocean',
    discoveryMethod: 'Employer Pain Point Analysis',
    competitivePosition: 'White Space',
    dimensions: { demand: 8, competition: 10, revenue: 7, wages: 6, speed: 9 },
    opportunity: 'The State of North Carolina (2nd largest regional employer) has chronic retention problems with veteran employees citing 1–2.5% raises and difficulty recruiting for temporary/hard-to-fill positions. This certificate would provide accelerated upskilling for state employees seeking lateral moves into higher-demand state roles (IT support, facilities management, procurement, grants management).',
    whyNonObvious: 'Government workforce development is typically handled internally through HR. The hidden insight is that state agencies need external talent pipelines for specialized administrative roles but can\'t compete on salary — so they need pre-trained candidates who understand state systems and can be productive immediately.',
    whyDefensible: 'The state is offering referral bonuses for hard-to-fill positions while veteran employees cite inadequate raises — classic retention/recruitment crisis. As the 2nd largest employer with "mass hire" needs, demand is structural not cyclical.',
    evidence: [
      'State of North Carolina implementing Employee Referral Bonus Pilot Program for hard-to-fill positions',
      'Veteran employees reporting pay raises limited to 1%–2.5%, indicating retention crisis',
      'State of NC Office of Human Resources preparing for mass hire and hard-to-recruit temporary positions',
      'State of North Carolina is the 2nd largest employer in Wake County',
      'Grants Consultant identified as one of Fastest-Growing Jobs of 2026',
    ],
    firstMover: 'No community college offers state government workforce transition training. First mover establishes direct partnership with NC Office of State Human Resources for curriculum validation, captures state tuition reimbursement programs, and positions for preferred vendor status. Could become statewide model.',
    metrics: {
      occupation: 'Government Administrative Specialist (43-9061)',
      demand: 'Sustained — State of NC employs 60,000+ in the Triangle; 2% annual turnover = 1,200 openings',
      wage: '$19–27/hr',
    },
    validation: [
      'Which specific state agencies have the highest vacancy rates in administrative positions?',
      'Would NC OSHR provide formal endorsement or preferred hiring status for certificate graduates?',
      'What state-specific systems (BEACON, NCAS, etc.) must curriculum include?',
      'Is there state funding available for workforce transition training for current state employees?',
      'What is the typical time-to-productivity for external hires in state administrative roles?',
    ],
  },
  {
    rank: 4,
    name: 'Healthcare Supply Chain Coordination Certificate',
    score: 7.85,
    category: 'blue_ocean',
    discoveryMethod: 'Supply Chain Decomposition',
    competitivePosition: 'Undersaturated',
    dimensions: { demand: 8, competition: 7, revenue: 8, wages: 8, speed: 8 },
    opportunity: 'Healthcare employers in NC reported significant workforce needs in supply chain roles, with ongoing concerns about PPE supply adequacy and supply chain resilience. Duke Health and WakeMed (1st and 2nd largest regional employers) are expanding, while the broader healthcare sector faces "significant demand — and a shortage of talent — for healthcare supply chain professionals at all levels."',
    whyNonObvious: 'Healthcare supply chain is invisible to conventional workforce analysis because it\'s seen as generic supply chain management. The hidden insight is that healthcare supply chain requires specialized knowledge — FDA medical device regulations, sterile processing coordination, clinical inventory management, vendor credentialing, and emergency supply protocols.',
    whyDefensible: 'Industry sources explicitly state "significant demand and shortage of talent at all levels." Duke Health and WakeMed are both expanding, and pandemic exposed supply chain vulnerabilities that healthcare systems are now addressing with dedicated staff.',
    evidence: [
      'Healthcare employers in NC reporting workforce needs with specific focus on supply chain during surveys',
      '"Significant demand — and a shortage of talent — for healthcare supply chain professionals at all levels"',
      'Healthcare workforce study discussing adequate supply of PPE indicating supply chain concerns',
      'Duke University and Duke Health Systems is the largest employer in Wake County',
      'WakeMed Health & Hospitals is the 2nd largest healthcare employer in Wake County',
    ],
    firstMover: 'Healthcare-specific supply chain training is rare at community college level. First mover captures partnerships with Duke Health and WakeMed for curriculum development and clinical site rotations, positioning as the regional pipeline before health systems build expensive internal training programs.',
    metrics: {
      occupation: 'Healthcare Supply Chain Specialist (13-1081)',
      demand: 'Moderate and sustained — 28,000 combined employees × 3% supply chain = 840 positions; 5% turnover = 42 annual openings plus expansion',
      wage: '$24–34/hr',
    },
    validation: [
      'How many supply chain positions do Duke Health and WakeMed currently have unfilled?',
      'What is the typical educational background of current healthcare supply chain staff?',
      'What specific healthcare supply chain software systems should curriculum include?',
      'Would major health systems provide internship/apprenticeship placements?',
      'What percentage of healthcare supply chain roles require clinical background?',
    ],
  },
  {
    rank: 5,
    name: 'Entertainment Venue Technical Operations Certificate',
    score: 7.35,
    category: 'blue_ocean',
    discoveryMethod: 'Economic Development Signal',
    competitivePosition: 'White Space',
    dimensions: { demand: 7, competition: 9, revenue: 6, wages: 7, speed: 7 },
    opportunity: 'The Triangle is experiencing unprecedented entertainment infrastructure expansion: new Raleigh amphitheater opening 2027, Lenovo Center sports/entertainment district development, The Exchange/Midtown 40-acre project, Seaboard Station expansion, and downtown Durham YMCA $46M expansion (2029). These venues need specialized technical staff combining audiovisual systems, stage rigging, lighting control, HVAC for large assembly spaces, and crowd management systems.',
    whyNonObvious: 'Conventional analysis focuses on construction trades for building these facilities, but misses the ongoing technical operations workforce needed once venues open. Entertainment venue technicians need a hybrid skill set — basic electrical/HVAC combined with specialized entertainment technology and venue-specific safety protocols.',
    whyDefensible: 'Multiple major entertainment venues opening 2026–2029 represents 5–7 new facilities requiring 8–15 technical staff each (40–105 new positions), plus existing venues with ongoing turnover. No local program specifically targets this niche.',
    evidence: [
      'Red Hat Amphitheater relocating and reopening in 2027 with exciting new amenities',
      'Lenovo Center sports and entertainment district identified as major 2026 development',
      'The Exchange, Midtown 40-acre project near North Hills with projected completion 2027',
      'Downtown Durham YMCA $46M expansion with construction beginning fall 2027, opening early 2029',
      'Seaboard Station opening Common Market location in early 2026 as part of broader entertainment district expansion',
    ],
    firstMover: 'No community college in NC offers entertainment venue technical operations training (distinct from general AV technology or theatrical production). First mover captures partnerships with venue operators (Red Hat Amphitheater, Lenovo Center, DPAC) for apprenticeships and establishes curriculum before venues resort to expensive out-of-state training.',
    metrics: {
      occupation: 'Entertainment Venue Technician (27-4011)',
      demand: 'Moderate but growing — 5–7 new venues opening within 36 months, each 8–15 staff = 40–105 positions; existing venues add 20–30 annual turnover',
      wage: '$22–35/hr',
    },
    validation: [
      'How many technical operations staff does a venue like Red Hat Amphitheater or DPAC employ?',
      'What is the typical turnover rate for entertainment venue technical positions?',
      'Would venue operators commit to apprenticeship partnerships or guaranteed interview programs?',
      'What specific technical certifications (Dante audio, ETC lighting control, etc.) should curriculum prioritize?',
      'Is there overlap with existing Wake Tech programs that could accelerate launch?',
    ],
  },
];

const employers = [
  { name: 'Duke University & Duke Health', sector: 'Healthcare / Higher Education', employees: '43,108' },
  { name: 'State of North Carolina', sector: 'Government', employees: '24,083' },
  { name: 'Wake County Public Schools', sector: 'Education', employees: '17,000' },
  { name: 'Walmart', sector: 'Retail', employees: '16,800' },
  { name: 'UNC Chapel Hill', sector: 'Higher Education', employees: '12,204' },
  { name: 'WakeMed Health & Hospitals', sector: 'Healthcare', employees: '10,307' },
  { name: 'Food Lion', sector: 'Retail / Grocery', employees: '9,037' },
  { name: 'NC State University', sector: 'Higher Education', employees: '9,019' },
  { name: 'Fidelity Investments', sector: 'Financial Services', employees: '8,290' },
  { name: 'UNC Rex Healthcare', sector: 'Healthcare', employees: '7,700' },
];

const competitors = [
  { name: 'Durham Technical Community College', type: 'Community College', programs: 'Healthcare, Biotechnology, Skilled & construction trades' },
  { name: 'Central Carolina Community College', type: 'Community College', programs: 'BioWork, Welding, Electrical (21 programs)' },
  { name: 'Alamance Community College', type: 'Community College', programs: 'Agribusiness, Business & Entrepreneurship (12 programs)' },
  { name: 'Nash Community College', type: 'Community College', programs: 'A+ Certification, BLET, Cisco Academy (40 programs)' },
  { name: 'Miller-Motte College', type: 'Proprietary School', programs: 'CDL Training, Welding, Early Childhood Education (32 programs)' },
  { name: 'The School of Skilled Trades', type: 'Proprietary School', programs: 'Plumbing (1 program)' },
  { name: 'NC State Technology Training Solutions', type: 'University CE', programs: 'Programs not cataloged' },
  { name: 'Hope Renovations', type: 'Career Center', programs: 'Construction pre-apprenticeship for underrepresented groups (2 programs)' },
];

const dataSources = [
  { title: 'Programs of Study | Wake Tech', url: 'https://www.waketech.edu/catalog/programs-study' },
  { title: 'Workforce Development Course Catalog', url: 'https://www.waketech.edu/programs-courses/non-credit/registration/catalog' },
  { title: 'Workforce Training', url: 'https://www.waketech.edu/programs-courses/non-credit/workforce-training' },
  { title: 'Reach and Rally Strategic Plan', url: 'https://www.waketech.edu/about-wake-tech/administrative-offices/institutional-effectiveness/reach-rally' },
  { title: 'Education and Talent in 2026: Wake Technical Community College', url: 'https://raleigh-wake.org/blog/education-and-talent-in-2026-wake-technical-community-college' },
  { title: 'Major Employers & Expanding Companies', url: 'https://raleigh-wake.org/business-advantages/data-and-demographics/major-employees-expanding-companies' },
  { title: 'Who are Raleigh\'s and Durham\'s largest employers?', url: 'https://www.newsobserver.com/news/business/article302221644.html' },
  { title: 'Who are NC\'s top 5 employers by county in 2025?', url: 'https://www.cbs17.com/news/north-carolina-news/interactive-map-who-are-north-carolinas-top-5-employers-by-county-in-2025/' },
  { title: 'Durham County', url: 'https://researchtriangle.org/counties/durham/' },
  { title: 'PY 2025 Local Area Workforce Development Plan', url: 'https://www.commerce.nc.gov/media/7592/open' },
  { title: 'NC Ranked No. 1 in Workforce Development', url: 'https://ncchamber.com/2026/01/07/nc-ranked-no-1-in-workforce-development-proof-our-strategy-is-working/' },
  { title: '2026 Strategic Plan Development | NC Commerce', url: 'https://www.commerce.nc.gov/data-tools-reports/economic-development-reports/strategic-economic-development-plan-north-carolina/2026-strategic-plan-development' },
];

const scoredMatrix = [
  { name: 'Biologics Manufacturing Quality Systems Certificate', score: 9.05, category: 'blue_ocean', inBrief: true },
  { name: 'Healthcare Management Certificate', score: 8.7, category: 'quick_win', inBrief: true },
  { name: 'Educational Facilities Operations Specialist Certificate', score: 8.55, category: 'blue_ocean', inBrief: true },
  { name: 'Construction Management Certificate', score: 8.5, category: 'quick_win', inBrief: true },
  { name: 'Industrial Machinery Maintenance Certificate', score: 8.1, category: 'strategic_build', inBrief: true },
  { name: 'Plumbing Technology Certificate', score: 8.0, category: 'quick_win', inBrief: true },
  { name: 'State Government Workforce Transition Bridge Certificate', score: 8.0, category: 'blue_ocean', inBrief: true },
  { name: 'Biomanufacturing Technician Certificate', score: 7.9, category: 'strategic_build', inBrief: true },
  { name: 'Cybersecurity Fundamentals Certificate', score: 7.9, category: 'quick_win', inBrief: true },
  { name: 'Healthcare Supply Chain Coordination Certificate', score: 7.85, category: 'blue_ocean', inBrief: true },
  { name: 'CDL Training — Class A', score: 7.7, category: 'quick_win', inBrief: true },
  { name: 'Entertainment Venue Technical Operations Certificate', score: 7.35, category: 'blue_ocean', inBrief: true },
  { name: 'Welding Technology Certificate', score: 6.8, category: 'strategic_build', inBrief: true },
  { name: 'Software Development Bootcamp', score: 6.2, category: 'emerging', inBrief: false },
  { name: 'Registered Nursing Bridge Program', score: 6.0, category: 'strategic_build', inBrief: false },
  { name: 'Electrical Technology Certificate', score: 5.8, category: 'emerging', inBrief: false },
  { name: 'Cosmetology / Personal Care Services', score: 5.2, category: 'emerging', inBrief: false },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoReportPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">

      {/* ═══════════ A. HERO ═══════════ */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-36 lg:pt-40 pb-16">
        <Stars count={120} />
        <Aurora className="opacity-60" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <AnimateOnScroll variant="fade-up" duration={800}>
            <span className="overline">Program Finder · Sample Report</span>
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
              Research Triangle, NC — Wake, Durham &amp; Orange Counties · February 2026
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={260} duration={800}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                8 Programs
              </span>
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(99,102,241,0.1), rgba(20,184,166,0.1))',
                  borderColor: 'rgba(168,85,247,0.2)',
                  color: '#7c3aed',
                }}
              >
                9.05 Top Score
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                5 Quick Wins
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                50+ Sources
              </span>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={340} duration={800}>
            <p className="mt-6 text-xs text-theme-muted max-w-xl mx-auto leading-relaxed">
              This is a real Program Finder conducted for Wake Technical Community College. All data and recommendations are based on actual labor market research, employer intelligence, and competitive analysis.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ B. EXECUTIVE SUMMARY ═══════════ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-[860px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Executive Summary</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              8 high-potential programs. 5 launchable in 3–6 months.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={80} variant="fade-up" className="grid sm:grid-cols-3 gap-4 mt-10">
            <div className="card-cosmic rounded-2xl p-6 text-center">
              <p className="text-3xl font-mono font-bold text-gradient-cosmic">$10.8B</p>
              <p className="mt-2 text-sm text-theme-secondary leading-snug">
                Life sciences investment wave in Research Triangle
              </p>
            </div>
            <div className="card-cosmic rounded-2xl p-6 text-center">
              <p className="text-5xl font-mono font-bold text-gradient-cosmic">5 of 8</p>
              <p className="mt-2 text-sm text-theme-secondary leading-snug">
                Programs classified as Quick Wins
              </p>
            </div>
            <div className="card-cosmic rounded-2xl p-6 text-center">
              <p className="text-3xl font-mono font-bold text-gradient-cosmic">#1</p>
              <p className="mt-2 text-sm text-theme-secondary leading-snug">
                North Carolina ranked #1 for workforce development — Site Selection 2026
              </p>
            </div>
          </StaggerChildren>

          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="mt-10 space-y-4 text-base text-theme-secondary leading-relaxed">
              <p>
                Wavelength conducted a comprehensive program discovery analysis for Wake Technical Community College across Wake, Durham, and Orange counties to identify high-potential credential opportunities aligned with regional workforce demand. The analysis integrated labor market data, competitor intelligence, enrollment trends, and employer signals to evaluate program viability across multiple dimensions including market demand, competitive positioning, institutional fit, and speed to launch.
              </p>
              <p>
                The analysis reveals <strong className="text-theme-primary">Healthcare Management Certificate</strong> as the highest-scoring opportunity with a composite rating of 8.7 out of 10, representing an immediate pathway to address critical workforce gaps in the region&apos;s healthcare sector. This program demonstrates exceptional demand signals, minimal competitive saturation, and strong alignment with Wake Technical&apos;s existing capabilities and infrastructure.
              </p>
              <p>
                Wavelength identified <strong className="text-theme-primary">8 high-potential program opportunities</strong>, with demand signals detected across 9 distinct workforce indicators. Notably, 5 of these qualify as Quick Wins — programs launchable within 3–6 months leveraging existing faculty, facilities, and curriculum frameworks. The Blue Ocean Analysis uncovered an additional standout: <strong className="text-theme-primary">Biologics Manufacturing Quality Systems Certificate</strong> at 9.05 — the highest-scoring program overall — representing a first-mover opportunity in the $10.8B life sciences boom.
              </p>
              <p>
                Wavelength recommends advancing to Stage 2 validation on the top 3–5 opportunities, beginning with Healthcare Management Certificate. Stage 2 should include employer advisory panels, detailed financial modeling, and curriculum design workshops to pressure-test assumptions and build institutional consensus for launch.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ C. REGIONAL INTELLIGENCE ═══════════ */}
      <section className="relative py-16 md:py-20 border-t border-theme-subtle">
        <div className="max-w-[960px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Regional Intelligence</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-10"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              The Research Triangle workforce landscape.
            </h2>
          </AnimateOnScroll>

          {/* Top Regional Employers */}
          <AnimateOnScroll variant="fade-up">
            <h3 className="font-heading font-semibold text-lg text-theme-primary mb-4">Top Regional Employers</h3>
            <div className="card-cosmic rounded-2xl overflow-hidden mb-10">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-theme-subtle">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted">Employer</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted">Sector</th>
                    <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted">Est. Employees</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.map((e, i) => (
                    <tr key={i} className={i < employers.length - 1 ? 'border-b border-theme-subtle' : ''}>
                      <td className="px-5 py-3 text-sm font-medium text-theme-primary">{e.name}</td>
                      <td className="px-4 py-3 text-sm text-theme-secondary">{e.sector}</td>
                      <td className="px-5 py-3 text-sm font-mono text-theme-primary text-right">{e.employees}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>

          {/* Key Economic Trends */}
          <AnimateOnScroll variant="fade-up">
            <h3 className="font-heading font-semibold text-lg text-theme-primary mb-4">Key Economic Trends</h3>
          </AnimateOnScroll>
          <StaggerChildren stagger={60} variant="fade-up" className="grid sm:grid-cols-2 gap-4 mb-10">
            {[
              { title: 'Life Sciences Investment Surge', body: 'North Carolina booked nearly $4 billion in life sciences investments in 2025, with companies from around the globe selecting the state for new sites and expanded operations.' },
              { title: 'Semiconductor Manufacturing Expansion', body: 'Major federal CHIPS Act investments including Wolfspeed\'s $750 million in proposed funding and $1 billion combined funding for first-of-its-kind CHIPS Manufacturing USA Institute.' },
              { title: 'Workforce Development #1 Ranking', body: 'North Carolina ranked #1 in the nation for workforce development by Site Selection magazine\'s 2026 rankings, validating the state\'s strategic approach.' },
              { title: 'Biomanufacturing Capacity Building', body: 'Novartis flagship facility (700 jobs by 2030), Biogen\'s $2 billion RTP investment, and Genentech doubling Holly Springs investment (100+ new jobs).' },
            ].map((t, i) => (
              <div key={i} className="card-cosmic p-5 rounded-xl">
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-theme-primary">{t.title}</p>
                    <p className="text-sm text-theme-secondary mt-1 leading-relaxed">{t.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>

          {/* Active Workforce Grants */}
          <AnimateOnScroll variant="fade-up">
            <h3 className="font-heading font-semibold text-lg text-theme-primary mb-4">Active Workforce Grants</h3>
            <div className="flex flex-col gap-3 mb-10">
              {[
                { name: 'Workforce Pell Grants', type: 'Federal', deadline: 'Available July 1, 2026' },
                { name: 'Short-Term Workforce Development (STWD) Grant', type: 'State — NC Community Colleges', deadline: '2025–2026' },
                { name: 'Build Your Future Grant', type: 'Institutional', deadline: 'Fall 2025 – Spring 2026' },
              ].map((g, i) => (
                <div key={i} className="card-cosmic rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm text-theme-primary">{g.name}</p>
                    <p className="text-xs text-theme-muted">{g.type}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    {g.deadline}
                  </span>
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Competitor Landscape */}
          <AnimateOnScroll variant="fade-up">
            <h3 className="font-heading font-semibold text-lg text-theme-primary mb-4">Competitor Landscape</h3>
            <div className="card-cosmic rounded-2xl overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-theme-subtle">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted">Institution</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted">Type</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted">Notable Programs</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((c, i) => (
                    <tr key={i} className={i < competitors.length - 1 ? 'border-b border-theme-subtle' : ''}>
                      <td className="px-5 py-3 text-sm font-medium text-theme-primary">{c.name}</td>
                      <td className="px-4 py-3 text-xs text-theme-muted">{c.type}</td>
                      <td className="px-5 py-3 text-sm text-theme-secondary">{c.programs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ D. CURRENT PROGRAM STRENGTHS ═══════════ */}
      <section className="relative py-12 md:py-16 border-t border-theme-subtle">
        <div className="max-w-[860px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Current Program Strengths</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
            >
              A strong foundation to build on.
            </h2>
            <p className="mt-4 text-base text-theme-secondary leading-relaxed">
              Wake Technical Community College maintains a robust existing catalog spanning AAS degrees, diplomas, certificates, and workforce training across 15+ sectors — from Accounting &amp; Finance to Architectural Technology, Air Conditioning &amp; Refrigeration, Biotechnology, Information &amp; Digital Technology, Construction &amp; Maintenance, Healthcare &amp; Wellness, Transportation, and more.
            </p>
            <div className="mt-5 p-5 rounded-xl border border-teal-500/15 bg-teal-500/5">
              <p className="text-sm text-theme-secondary leading-relaxed">
                <strong className="text-theme-primary font-semibold">This scan identified gaps beyond the existing portfolio</strong> — new programs that extend Wake Tech&apos;s reach into underserved demand areas. The 8 recommended programs and 5 Blue Ocean opportunities represent white space and competitive advantages that complement, not duplicate, current offerings.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ E. PROGRAM OPPORTUNITY CARDS ═══════════ */}
      <section className="relative py-16 md:py-20 border-t border-theme-subtle">
        <div className="max-w-[960px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Program Opportunities</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-10"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              8 scored and ranked programs.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={60} variant="fade-up">
            {mainPrograms.map((p) => (
              <div key={p.rank} className="card-cosmic rounded-2xl p-7 mb-6">
                {/* Header */}
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-sm">{p.rank}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-xl text-theme-primary leading-snug">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {categoryBadge(p.category)}
                      <span className="text-xs text-theme-muted">{p.competitiveLandscape}</span>
                    </div>
                  </div>
                  <ScoreDisplay score={p.score} />
                </div>

                {/* Dimension bars */}
                <div className="mt-5 space-y-2">
                  <DimensionBar label="Demand" value={p.dimensions.demand} />
                  <DimensionBar label="Competition" value={p.dimensions.competition} />
                  <DimensionBar label="Revenue" value={p.dimensions.revenue} />
                  <DimensionBar label="Wages" value={p.dimensions.wages} />
                  <DimensionBar label="Speed" value={p.dimensions.speed} />
                </div>

                {/* The Opportunity */}
                <div className="mt-6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-2">The Opportunity</p>
                  <p className="text-sm text-theme-secondary leading-relaxed">{p.opportunity}</p>
                </div>

                {/* Demand Evidence */}
                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-2">Demand Evidence</p>
                  <ul className="space-y-1.5">
                    {p.demandEvidence.map((e, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-theme-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Metrics */}
                <div className="mt-5 card-cosmic rounded-xl p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-3">Key Metrics</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] text-theme-muted uppercase">Annual Openings</p>
                      <p className="text-sm font-mono font-semibold text-theme-primary">{p.metrics.openings}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-theme-muted uppercase">Median Wage</p>
                      <p className="text-sm font-mono font-semibold text-theme-primary">{p.metrics.wage}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-theme-muted uppercase">10yr Growth</p>
                      <p className="text-xs text-theme-secondary">{p.metrics.growth}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-theme-muted uppercase">Job Postings</p>
                      <p className="text-xs text-theme-secondary">{p.metrics.postings}</p>
                    </div>
                  </div>
                </div>

                {/* Program Snapshot */}
                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-3">Program Snapshot</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-theme-muted uppercase">Duration</p>
                      <p className="text-sm text-theme-primary">{p.snapshot.duration}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-theme-muted uppercase">Delivery Format</p>
                      <p className="text-sm text-theme-primary">{p.snapshot.format}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-theme-muted uppercase">Stackable Credentials</p>
                      <p className="text-sm text-theme-primary">{p.snapshot.credentials}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-theme-muted uppercase">Target Audience</p>
                      <p className="text-sm text-theme-primary">{p.snapshot.audience}</p>
                    </div>
                  </div>
                </div>

                {/* Grant Alignment */}
                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-2">Grant Alignment</p>
                  <ul className="space-y-1">
                    {p.grants.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-theme-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Barriers & Risks (collapsible) */}
                <details className="mt-5">
                  <summary className="text-sm font-semibold text-theme-secondary cursor-pointer hover:text-theme-primary">
                    Barriers &amp; Risks ({p.barriers.length})
                  </summary>
                  <ul className="mt-2 space-y-1.5">
                    {p.barriers.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-theme-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </details>

                {/* Validation (collapsible) */}
                <details className="mt-3">
                  <summary className="text-sm font-semibold text-theme-secondary cursor-pointer hover:text-theme-primary">
                    What Validation Would Confirm ({p.validation.length})
                  </summary>
                  <ul className="mt-2 space-y-1.5">
                    {p.validation.map((v, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-theme-muted">
                        <span className="mt-0.5 flex-shrink-0">?</span>
                        {v}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════ F. BLUE OCEAN ANALYSIS ═══════════ */}
      <section className="relative py-16 md:py-20 border-t border-theme-subtle">
        <div className="max-w-[960px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Blue Ocean Analysis</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              5 non-obvious opportunities. First-mover advantages.
            </h2>
            <p className="mt-4 text-base text-theme-secondary leading-relaxed">
              The Blue Ocean Scanner goes beyond conventional workforce analysis. While Phases 1–4 identify the obvious opportunities every competitor will find, this analysis uses six creative research strategies to uncover non-obvious, surprising, but defensible program opportunities — the gaps between traditional program categories that represent significant first-mover advantages.
            </p>
            <p className="mt-3 text-sm text-theme-secondary leading-relaxed">
              <strong className="text-theme-primary">Key Insight:</strong> The conventional analysis identified direct-service technical roles but completely missed the <em>supporting infrastructure workforce</em> that enables major employers to operate. The hidden opportunities lie in employer-specific skill clusters, supply chain and quality systems roles, and emerging infrastructure operations. Wake Tech&apos;s competitive advantage lies in being first to recognize that the Research Triangle&apos;s workforce gaps aren&apos;t in production — they&apos;re in the specialized support roles that make production possible.
            </p>
          </AnimateOnScroll>

          {/* Strategy pills */}
          <AnimateOnScroll variant="fade-up" delay={100}>
            <div className="mt-6 flex flex-wrap gap-2 mb-10">
              {[
                'Employer Pain Points (7 searches → 34 findings)',
                'Supply Chain Decomposition (4 → 21)',
                'Peer Institution Comparison (4 → 16)',
                'Economic Development Signals (4 → 21)',
                'BLS Orphan Occupations (3 → 16)',
                'Skill Cluster Analysis (3 → 16)',
              ].map((s, i) => (
                <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                  {s}
                </span>
              ))}
            </div>
          </AnimateOnScroll>

          <StaggerChildren stagger={60} variant="fade-up">
            {blueOceanPrograms.map((p) => (
              <div key={p.rank} className="card-cosmic rounded-2xl p-7 mb-6">
                {/* Blue Ocean overline */}
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-3">◆ Blue Ocean</p>

                {/* Header */}
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-sm">{p.rank}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-xl text-theme-primary leading-snug">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {categoryBadge(p.category)}
                      <span className="text-xs text-theme-muted">{p.competitivePosition}</span>
                    </div>
                  </div>
                  <ScoreDisplay score={p.score} />
                </div>

                {/* Dimension bars */}
                <div className="mt-5 space-y-2">
                  <DimensionBar label="Demand" value={p.dimensions.demand} />
                  <DimensionBar label="Competition" value={p.dimensions.competition} />
                  <DimensionBar label="Revenue" value={p.dimensions.revenue} />
                  <DimensionBar label="Wages" value={p.dimensions.wages} />
                  <DimensionBar label="Speed" value={p.dimensions.speed} />
                </div>

                {/* Discovery Method */}
                <div className="mt-5 flex gap-4 flex-wrap">
                  <div>
                    <p className="text-[10px] text-theme-muted uppercase">Discovery Method</p>
                    <p className="text-sm font-semibold text-theme-primary">{p.discoveryMethod}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-theme-muted uppercase">Competitive Position</p>
                    <p className="text-sm font-semibold text-theme-primary">{p.competitivePosition}</p>
                  </div>
                </div>

                {/* The Opportunity */}
                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-2">The Opportunity</p>
                  <p className="text-sm text-theme-secondary leading-relaxed">{p.opportunity}</p>
                </div>

                {/* Why Non-Obvious */}
                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-2">Why This Is Non-Obvious</p>
                  <p className="text-sm text-theme-secondary leading-relaxed">{p.whyNonObvious}</p>
                </div>

                {/* First-Mover Advantage */}
                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-2">First-Mover Advantage</p>
                  <p className="text-sm text-theme-secondary leading-relaxed">{p.firstMover}</p>
                </div>

                {/* Evidence */}
                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-2">Evidence</p>
                  <ul className="space-y-1.5">
                    {p.evidence.map((e, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-theme-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Metrics */}
                <div className="mt-5 card-cosmic rounded-xl p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-3">Key Metrics</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-theme-muted uppercase">Target Occupation</p>
                      <p className="text-xs text-theme-primary">{p.metrics.occupation}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-theme-muted uppercase">Estimated Demand</p>
                      <p className="text-xs text-theme-secondary">{p.metrics.demand}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-theme-muted uppercase">Median Wage</p>
                      <p className="text-sm font-mono font-semibold text-theme-primary">{p.metrics.wage}</p>
                    </div>
                  </div>
                </div>

                {/* Validation (collapsible) */}
                <details className="mt-5">
                  <summary className="text-sm font-semibold text-theme-secondary cursor-pointer hover:text-theme-primary">
                    What Validation Would Confirm ({p.validation.length})
                  </summary>
                  <ul className="mt-2 space-y-1.5">
                    {p.validation.map((v, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-theme-muted">
                        <span className="mt-0.5 flex-shrink-0">?</span>
                        {v}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════ G. FUNDING ROADMAP ═══════════ */}
      <section className="relative py-16 md:py-20 border-t border-theme-subtle">
        <div className="max-w-[960px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Funding Roadmap</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-10"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Grant alignment across all 13 programs.
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up">
            <div className="card-cosmic rounded-2xl overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-theme-subtle">
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted">Program</th>
                      <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted w-16">Score</th>
                      <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted w-16">Grants</th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted">Grant Names</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ...mainPrograms.map(p => ({ name: p.name, score: p.score })),
                      ...blueOceanPrograms.map(p => ({ name: p.name, score: p.score })),
                    ].sort((a, b) => b.score - a.score).map((p, i, arr) => (
                      <tr key={i} className={i < arr.length - 1 ? 'border-b border-theme-subtle' : ''}>
                        <td className="px-5 py-3 text-sm font-medium text-theme-primary">{p.name}</td>
                        <td className={`px-3 py-3 text-sm font-mono font-bold text-right ${scoreColor(p.score)}`}>{p.score}</td>
                        <td className="px-3 py-3 text-sm font-mono text-center text-theme-secondary">5</td>
                        <td className="px-5 py-3 text-xs text-theme-muted">Workforce Pell; STWD; Build Your Future; Accelerate NC Life Sciences; Industry-Driven Skills Training</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Time-sensitive callout */}
          <AnimateOnScroll variant="fade-up">
            <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-6">
              <p className="text-sm text-theme-secondary leading-relaxed">
                <strong className="text-amber-700 dark:text-amber-400 font-semibold">⚠ Time-Sensitive:</strong>{' '}
                Workforce Pell Grants — Available beginning <strong className="text-theme-primary font-semibold">July 1, 2026</strong>. Programs must demonstrate 70% completion rate, 70% job placement within 180 days, and positive ROI.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Grant strategy */}
          <AnimateOnScroll variant="fade-up">
            <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-3">Recommended Grant Strategy</p>
            <ul className="space-y-2">
              {[
                'Prioritize programs with strong grant alignment — Healthcare programs align with healthcare credentialing grants',
                'Bundle applications — Multiple programs can be submitted under a single institutional grant application',
                'Leverage employer partnerships — Employer match commitments strengthen grant applications significantly',
                'Track state legislative cycles — NC workforce development appropriations often create new funding windows',
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-theme-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ H. RECOMMENDED NEXT STEPS ═══════════ */}
      <section className="relative py-16 md:py-20 border-t border-theme-subtle">
        <div className="max-w-[760px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Recommended Next Steps</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-8"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              How to act on these findings.
            </h2>
          </AnimateOnScroll>

          <StaggerChildren stagger={100} variant="fade-up" className="flex flex-col gap-4">
            {[
              {
                num: 1,
                title: 'Review findings with your leadership team',
                body: 'Share this Discovery Brief with your Dean, VP of Instruction, and program development leads. Focus discussion on the top 3 recommendations and how they align with institutional strategic priorities.',
              },
              {
                num: 2,
                title: 'Select 1–3 programs for deeper validation',
                body: 'We recommend: Healthcare Management Certificate (8.7 — quick win), Construction Management Certificate (8.5 — quick win), and Industrial Machinery Maintenance Certificate (8.1 — strategic build).',
              },
              {
                num: 3,
                title: 'Engage Wavelength Feasibility Study ($3,000)',
                body: 'Feasibility Study confirms employer demand, models enrollment and revenue, conducts detailed feasibility analysis, and delivers a go/no-go recommendation with full supporting data. This is the critical step before committing development resources.',
              },
              {
                num: 4,
                title: 'Fast-track Quick Wins',
                body: 'Healthcare Management Certificate and Construction Management Certificate are launchable within 3–6 months with minimal startup investment. These programs could generate revenue while longer-term strategic programs are being developed.',
              },
            ].map((step) => (
              <div key={step.num} className="card-cosmic rounded-2xl p-6 flex gap-5 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-sm">{step.num}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-base text-theme-primary">{step.title}</h3>
                  <p className="mt-2 text-sm text-theme-secondary leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════ I. APPENDIX ═══════════ */}
      <section className="relative py-16 md:py-20 border-t border-theme-subtle">
        <div className="max-w-[960px] mx-auto px-6">
          <AnimateOnScroll variant="fade-up">
            <span className="overline">Appendix</span>
            <h2
              className="font-heading font-bold text-theme-primary mt-4 mb-10"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}
            >
              Full scoring matrix &amp; methodology.
            </h2>
          </AnimateOnScroll>

          {/* Full scored matrix */}
          <AnimateOnScroll variant="fade-up">
            <h3 className="font-heading font-semibold text-lg text-theme-primary mb-4">Full Scored Opportunity Matrix</h3>
            <div className="card-cosmic rounded-2xl overflow-hidden mb-10">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-theme-subtle">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted">Program</th>
                    <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted w-16">Score</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted w-32">Category</th>
                    <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-theme-muted w-20">In Brief</th>
                  </tr>
                </thead>
                <tbody>
                  {scoredMatrix.map((p, i) => (
                    <tr key={i} className={i < scoredMatrix.length - 1 ? 'border-b border-theme-subtle' : ''}>
                      <td className="px-5 py-3 text-sm font-medium text-theme-primary">{p.name}</td>
                      <td className={`px-3 py-3 text-sm font-mono font-bold text-right ${scoreColor(p.score)}`}>{p.score}</td>
                      <td className="px-4 py-3">{categoryBadge(p.category)}</td>
                      <td className="px-3 py-3 text-center text-sm">
                        {p.inBrief ? (
                          <span className="text-teal-600 dark:text-teal-400">✓</span>
                        ) : (
                          <span className="text-theme-muted text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>

          {/* Methodology */}
          <AnimateOnScroll variant="fade-up">
            <h3 className="font-heading font-semibold text-lg text-theme-primary mb-4">Methodology</h3>
          </AnimateOnScroll>
          <StaggerChildren stagger={60} variant="fade-up" className="flex flex-col gap-3 mb-10">
            {[
              { num: 1, title: 'Regional Intelligence', body: 'Institutional profiling, employer mapping, economic trend analysis' },
              { num: 2, title: 'Demand Signal Detection', body: 'Job posting analysis, BLS employment data, employer expansion signals, grant opportunities' },
              { num: 3, title: 'Competitive Landscape', body: 'Provider mapping, program cataloging, white space identification' },
              { num: 4, title: 'Opportunity Scoring', body: 'Weighted composite: Demand 30%, Competition 25%, Revenue 20%, Wages 15%, Speed 10%' },
              { num: 5, title: 'Blue Ocean Scanner', body: '6 strategies: employer pain points, supply chain decomposition, peer comparison, economic development signals, orphan occupations, skill cluster analysis' },
            ].map((phase) => (
              <div key={phase.num} className="card-cosmic rounded-xl p-4 flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-xs">{phase.num}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-theme-primary">{phase.title}</p>
                  <p className="text-xs text-theme-secondary mt-0.5">{phase.body}</p>
                </div>
              </div>
            ))}
          </StaggerChildren>

          {/* Data Sources */}
          <AnimateOnScroll variant="fade-up">
            <h3 className="font-heading font-semibold text-lg text-theme-primary mb-4">Data Sources</h3>
            <div className="card-cosmic rounded-xl p-5 mb-10">
              <ul className="space-y-2">
                {dataSources.map((s, i) => (
                  <li key={i} className="text-sm">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </AnimateOnScroll>

          {/* Limitations */}
          <AnimateOnScroll variant="fade-up">
            <div className="card-cosmic rounded-xl p-5 mb-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted mb-2">Limitations</p>
              <ul className="space-y-1.5 text-sm text-theme-muted">
                <li>• This is a discovery-level scan, not a full program validation</li>
                <li>• Job posting data reflects current conditions and may change</li>
                <li>• Competitor program catalogs may be incomplete</li>
                <li>• Wage data is national/state level; local wages may vary</li>
                <li>• Full employer demand validation requires direct outreach (Stage 2)</li>
                <li>• Enrollment projections require demographic and market modeling (Stage 2)</li>
              </ul>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up">
            <p className="text-sm text-theme-muted text-center">
              49 research queries executed · 12 data sources consulted · ~25 pages
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ J. CTA ═══════════ */}
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
              See which programs your region is asking for.
            </h2>
            <p className="mt-5 text-base text-theme-secondary leading-relaxed max-w-xl mx-auto">
              This is a real scan conducted for Wake Technical Community College. Your Program Finder delivers 7–10 scored, ranked program opportunities — researched, written, and delivered within 7 business days.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/discover">
                <button className="btn-cosmic btn-cosmic-primary text-sm py-3 px-7">
                  Order a Program Finder →
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
