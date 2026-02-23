#!/usr/bin/env node
/**
 * Seed intel_frameworks with curated workforce development frameworks,
 * competency models, and best practices.
 * 
 * Each entry includes rich content agents can reference in reports.
 */

import { supabase } from './env-helper.mjs';

const FRAMEWORKS = [
  // ════════════════════════════════════════════════
  // CBE FRAMEWORKS
  // ════════════════════════════════════════════════
  {
    framework_name: 'C-BEN Quality Framework for Competency-Based Education',
    short_name: 'C-BEN Quality Framework',
    version: '2.0',
    framework_type: 'cbe_framework',
    category: 'higher_ed',
    organization: 'Competency-Based Education Network (C-BEN)',
    organization_type: 'nonprofit',
    summary: `The C-BEN Quality Framework is the gold standard for designing and evaluating competency-based education programs. It defines quality across 8 elements that cover the full lifecycle of CBE program design and delivery. Unlike traditional credit-hour programs, CBE measures learning by demonstrated mastery of competencies rather than time spent in a classroom. The framework emphasizes that quality CBE requires intentional design across curriculum, assessment, learning experiences, and institutional support structures. It is used by accreditors, institutions, and program designers to ensure CBE programs meet rigorous quality standards while remaining flexible enough for adult learners and workforce needs. Community colleges implementing CBE should use this as their primary design reference.`,
    key_principles: [
      'Competencies are derived from explicit and transparent learning objectives aligned to employer/industry needs',
      'Assessment is secure, reliable, valid, and distinguishes between competent and not-yet-competent',
      'Learning experiences are mapped to competencies and provide multiple pathways to mastery',
      'Students receive timely, actionable feedback from qualified assessors',
      'Faculty/staff roles are redesigned to separate content expertise from assessment from coaching',
      'Technology infrastructure supports personalized learning paths and competency tracking',
      'Credit/credential is awarded based solely on demonstrated mastery, not seat time',
      'Institutional culture, policies, and financial models are aligned to support CBE delivery'
    ],
    implementation_steps: [
      'Conduct employer/industry needs analysis to define competency domains',
      'Map competencies to specific, measurable learning outcomes',
      'Design authentic assessments that require demonstration of real-world application',
      'Build modular learning resources aligned to each competency',
      'Train faculty as subject matter experts, coaches, and assessors (often separate roles)',
      'Implement competency-tracking technology (LMS/SIS integration)',
      'Develop prior learning assessment (PLA) processes to award credit for existing competencies',
      'Create continuous improvement loop with employer advisory input'
    ],
    quality_indicators: [
      'Competencies are publicly published and employer-validated',
      'Inter-rater reliability on assessments exceeds 85%',
      'Students can articulate what they need to demonstrate for each competency',
      'Completion rates are tracked by competency, not just program level',
      'Employer satisfaction surveys show graduates are "job-ready"'
    ],
    common_pitfalls: [
      'Converting existing courses to CBE by simply relabeling learning objectives as "competencies"',
      'Underinvesting in assessment design — assessments must be rigorous and authentic',
      'Ignoring the financial model change: CBE breaks the credit-hour revenue model',
      'Not securing accreditor approval before launching (can jeopardize institutional accreditation)',
      'Treating CBE as an add-on instead of a fundamental redesign of the learning model'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['certificate', 'degree', 'noncredit', 'micro-credential'],
    institution_types: ['community_college', 'technical_college', '4yr_public'],
    source_url: 'https://www.c-ben.org/the-quality-framework/',
    source_document: 'Quality Framework for Competency-Based Education Programs',
    publication_year: 2017,
    last_updated_year: 2023,
    when_to_use: 'Use when recommending CBE program structure, evaluating CBE readiness, or designing competency-based credentials. Reference specific elements when a program involves prior learning assessment or flexible pacing.',
    citation_text: 'Competency-Based Education Network (C-BEN), "Quality Framework for Competency-Based Education Programs," Version 2.0.',
    tags: ['cbe', 'competency-based', 'quality', 'assessment', 'program-design'],
    related_frameworks: ['Lumina Degree Qualifications Profile', 'CAEL Standards for PLA'],
  },

  {
    framework_name: 'Lumina Foundation Degree Qualifications Profile',
    short_name: 'Lumina DQP',
    version: '2.0',
    framework_type: 'credential_framework',
    category: 'higher_ed',
    organization: 'Lumina Foundation',
    organization_type: 'nonprofit',
    summary: `The Degree Qualifications Profile (DQP) defines what students should know and be able to do at each degree level (associate, bachelor's, master's). Unlike traditional program standards that focus on inputs (courses, credit hours), the DQP focuses on demonstrated proficiencies. It provides a common reference point for what degrees mean, enabling better credential transparency and transferability. For community colleges, the DQP is particularly valuable for designing associate degrees that stack cleanly into bachelor's programs and for articulating the value of sub-baccalaureate credentials to employers. The framework organizes proficiencies into 5 broad categories that apply across disciplines.`,
    key_principles: [
      'Specialized Knowledge: Deep understanding in a specific field of study',
      'Broad and Integrative Knowledge: Ability to connect learning across disciplines',
      'Intellectual Skills: Analytic inquiry, use of information resources, engaging diverse perspectives, ethical reasoning, quantitative fluency, communicative fluency',
      'Applied and Collaborative Learning: Real-world application in team-based settings',
      'Civic and Global Learning: Understanding of civic issues and global systems',
      'Each proficiency has distinct expectations at associate, bachelor, and master levels',
      'Proficiencies are demonstrated through performance, not just knowledge recall'
    ],
    implementation_steps: [
      'Map existing program learning outcomes to DQP proficiency categories',
      'Identify gaps where current programs lack explicit proficiency development',
      'Design signature assignments that require demonstration of proficiencies',
      'Create rubrics aligned to DQP descriptors for each degree level',
      'Use DQP mapping to strengthen transfer articulation agreements',
      'Align co-curricular experiences (internships, service learning) to DQP proficiencies'
    ],
    quality_indicators: [
      'Program learning outcomes map to all 5 DQP categories',
      'Signature assignments explicitly assess proficiency demonstration',
      'Transfer partners recognize DQP alignment as evidence of quality',
      'Students can articulate their proficiencies in portfolio/interview formats'
    ],
    common_pitfalls: [
      'Treating DQP as a checklist rather than a design framework',
      'Mapping to DQP post-hoc without actually changing curriculum',
      'Ignoring the "applied and collaborative" category (easiest to skip, hardest to assess)'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['degree', 'certificate'],
    institution_types: ['community_college', 'technical_college', '4yr_public', '4yr_private'],
    source_url: 'https://www.luminafoundation.org/resources/dqp',
    source_document: 'The Degree Qualifications Profile',
    publication_year: 2014,
    last_updated_year: 2014,
    when_to_use: 'Use when designing degree programs, evaluating credential stacking/transferability, or articulating the value of an associate degree. Particularly relevant for programs seeking transfer articulation.',
    citation_text: 'Lumina Foundation, "The Degree Qualifications Profile," 2nd Edition, 2014.',
    tags: ['credentials', 'degree-design', 'proficiency', 'transfer', 'stacking'],
    related_frameworks: ['C-BEN Quality Framework', 'Credential Engine Transparency Framework'],
  },

  // ════════════════════════════════════════════════
  // COMPETENCY MODELS
  // ════════════════════════════════════════════════
  {
    framework_name: 'DOL Competency Model Clearinghouse',
    short_name: 'DOL Competency Models',
    version: '2024',
    framework_type: 'competency_model',
    category: 'workforce_development',
    organization: 'U.S. Department of Labor (ETA)',
    organization_type: 'federal',
    summary: `The DOL Competency Model Clearinghouse provides industry-validated competency models for major sectors of the U.S. economy. Each model uses a building-blocks pyramid structure with tiers ranging from foundational personal effectiveness competencies up to industry-specific and occupation-specific technical competencies. These models are the authoritative source for defining what workers need to know and be able to do, and they directly inform WIOA-funded training program design. Community colleges should use these models as the starting point for curriculum development, particularly for noncredit workforce programs where industry alignment is critical. Over 30 industry models are available, each developed with input from industry SMEs, trade associations, and labor market analysts.`,
    key_principles: [
      'Tier 1 — Personal Effectiveness: Interpersonal skills, integrity, professionalism, initiative, dependability, adaptability, lifelong learning',
      'Tier 2 — Academic Competencies: Reading, writing, math, science, communication, critical thinking, active learning',
      'Tier 3 — Workplace Competencies: Teamwork, creative thinking, problem solving, planning, business fundamentals, technology use, safety',
      'Tier 4 — Industry-Wide Technical Competencies: Sector-specific knowledge common across all jobs in the industry',
      'Tier 5 — Industry-Sector Technical Competencies: Specialized knowledge for a sector within the industry',
      'Tier 6-9 — Occupation-Specific: Management, occupation-specific requirements, mapped to O*NET',
      'Models are living documents updated as industries evolve',
      'Competencies are linked to O*NET knowledge, skills, and abilities'
    ],
    implementation_steps: [
      'Identify the relevant industry competency model for the target occupation',
      'Map competencies to curriculum learning outcomes',
      'Identify which tiers are addressed by prerequisite programs vs. the target program',
      'Design assessments that verify competency at each applicable tier',
      'Validate curriculum mapping with local employer advisory board',
      'Use competency model gaps to identify need for supplemental training modules'
    ],
    quality_indicators: [
      'Program explicitly references competency model tiers in course descriptions',
      'Advisory board confirms alignment between curriculum and industry needs',
      'Graduate performance maps to Tier 4-5+ competencies in employer evaluations',
      'Stackable credentials are designed to progressively address higher tiers'
    ],
    common_pitfalls: [
      'Only addressing technical tiers (4-5) while ignoring foundational tiers (1-3) that employers also value',
      'Using a national model without localizing it with regional employer input',
      'Not updating curriculum when competency models are revised'
    ],
    applicable_sectors: ['healthcare', 'manufacturing', 'IT', 'construction', 'transportation', 'energy', 'hospitality', 'agriculture', 'retail', 'finance'],
    applicable_program_types: ['certificate', 'noncredit', 'apprenticeship', 'degree'],
    institution_types: ['community_college', 'technical_college'],
    source_url: 'https://www.careeronestop.org/CompetencyModel/',
    source_document: 'Competency Model Clearinghouse — Industry Competency Models',
    publication_year: 2010,
    last_updated_year: 2024,
    when_to_use: 'Use when designing any workforce training program, validating curriculum alignment with industry needs, or justifying program content to WIOA funders. Start here for noncredit program design.',
    citation_text: 'U.S. Department of Labor, Employment and Training Administration, "Competency Model Clearinghouse," CareerOneStop, accessed 2026.',
    tags: ['competency-model', 'industry-alignment', 'workforce', 'DOL', 'curriculum-design'],
    related_frameworks: ['O*NET Content Model', 'WIOA Training Design Requirements'],
  },

  {
    framework_name: 'NICE Cybersecurity Workforce Framework',
    short_name: 'NICE Framework',
    version: 'SP 800-181r1',
    framework_type: 'competency_model',
    category: 'industry_specific',
    organization: 'National Institute of Standards and Technology (NIST)',
    organization_type: 'federal',
    summary: `The NICE (National Initiative for Cybersecurity Education) Framework establishes a common taxonomy for describing cybersecurity work. It organizes cybersecurity work into 7 categories, 33 specialty areas, and detailed work roles with associated knowledge, skills, abilities, and tasks. This is the definitive framework for designing cybersecurity education programs and is increasingly referenced by employers, federal agencies (required for government cybersecurity positions), and accreditors. Community colleges building cybersecurity programs should map their curriculum directly to NICE work roles to demonstrate employer alignment and qualify graduates for federal positions.`,
    key_principles: [
      'Seven Categories: Securely Provision, Operate and Maintain, Oversee and Govern, Protect and Defend, Analyze, Collect and Operate, Investigate',
      'Work Roles define specific cybersecurity job functions with unique KSA requirements',
      'Tasks describe the specific work activities for each role',
      'Knowledge, Skills, and Abilities (KSAs) are granular and assessable',
      'Competency Areas group related KSAs for workforce development purposes',
      'Framework is occupation-agnostic — focuses on work, not job titles',
      'Aligned with NIST standards and federal cybersecurity requirements'
    ],
    implementation_steps: [
      'Identify target NICE work roles based on regional employer demand',
      'Map existing curriculum to NICE KSAs — identify coverage and gaps',
      'Design lab/simulation experiences that address task-level requirements',
      'Align certification prep (CompTIA Sec+, CySA+, etc.) with relevant work roles',
      'Create competency maps showing student progression through NICE categories',
      'Partner with employers to validate work role selections and prioritize KSAs'
    ],
    quality_indicators: [
      'Curriculum maps to specific NICE work roles (not just broad categories)',
      'Graduates can identify which NICE work roles they are prepared for',
      'Industry certifications align with NICE KSA requirements',
      'Program produces graduates eligible for federal cybersecurity positions'
    ],
    common_pitfalls: [
      'Trying to cover all 33 specialty areas in a single program — focus on 3-5 roles',
      'Teaching tools instead of concepts (tools change, NICE competencies persist)',
      'Ignoring the "Oversee and Govern" category (governance/policy roles are high-demand)'
    ],
    applicable_sectors: ['IT', 'government', 'finance', 'healthcare'],
    applicable_program_types: ['certificate', 'degree', 'noncredit', 'micro-credential'],
    institution_types: ['community_college', 'technical_college', '4yr_public'],
    source_url: 'https://niccs.cisa.gov/workforce-development/nice-framework',
    source_document: 'NIST SP 800-181 Rev. 1 — Workforce Framework for Cybersecurity',
    publication_year: 2020,
    last_updated_year: 2024,
    when_to_use: 'Use when designing cybersecurity programs, evaluating existing cybersecurity curriculum, or advising on certification alignment. Required reference for any program targeting federal cybersecurity workforce.',
    citation_text: 'National Institute of Standards and Technology, "NIST SP 800-181 Rev. 1: Workforce Framework for Cybersecurity (NICE Framework)," 2020.',
    tags: ['cybersecurity', 'NICE', 'NIST', 'workforce-framework', 'IT-security'],
    related_frameworks: ['DOL Competency Model Clearinghouse', 'CompTIA Certification Framework'],
  },

  // ════════════════════════════════════════════════
  // PROGRAM DESIGN
  // ════════════════════════════════════════════════
  {
    framework_name: 'DACUM Occupational Analysis Process',
    short_name: 'DACUM',
    version: null,
    framework_type: 'program_design',
    category: 'workforce_development',
    organization: 'Ohio State University / Various',
    organization_type: 'nonprofit',
    summary: `DACUM (Developing a Curriculum) is a structured occupational analysis process used to define the duties, tasks, knowledge, skills, and traits required for an occupation. A facilitated 2-day workshop brings together 8-12 expert workers (not managers or educators) who systematically decompose their occupation into duty areas, tasks within each duty, and the knowledge/skills/tools/traits needed for competent performance. The output is a DACUM chart — a single-page visual map of the entire occupation that becomes the blueprint for curriculum development. DACUM is considered the fastest, most cost-effective method for occupational analysis and is the preferred method for many community college CTE programs. It directly produces content that can be mapped to learning outcomes, course objectives, and assessments.`,
    key_principles: [
      'Expert workers are the best source of information about their occupation (not supervisors or textbooks)',
      'Any occupation can be described in terms of duties and tasks performed by successful workers',
      'All tasks have a defined beginning and end, and result in a meaningful product, service, or decision',
      'Knowledge, skills, tools, and worker traits can be identified for each task',
      'A skilled facilitator guides the group through structured brainstorming and consensus-building',
      'The DACUM chart provides a complete, validated occupational profile in 2 days',
      'Verification with additional expert workers and employers strengthens validity'
    ],
    implementation_steps: [
      'Recruit 8-12 expert workers who are currently performing the target occupation',
      'Conduct a 2-day facilitated DACUM workshop with a certified facilitator',
      'Produce the DACUM chart: duties (8-12 areas) → tasks (6-20 per duty) → KSAs per task',
      'Verify the chart with additional workers and employers in the region',
      'Map duties/tasks to course learning outcomes',
      'Design curriculum modules aligned to duty areas',
      'Create performance-based assessments that measure task competency',
      'Review and update the DACUM chart every 3-5 years or when the occupation changes significantly'
    ],
    quality_indicators: [
      'DACUM chart is verified by at least 20 additional workers',
      'Every course learning outcome traces back to a specific task on the DACUM chart',
      'Advisory board reviews DACUM chart annually for relevance',
      'Task statements use observable, measurable verbs (install, configure, diagnose, NOT "understand")'
    ],
    common_pitfalls: [
      'Including supervisors or educators on the panel instead of front-line workers',
      'Not having a trained DACUM facilitator (process requires specific facilitation skills)',
      'Creating a DACUM chart but never updating it as the occupation evolves',
      'Writing task statements that are too broad (should be completable in 2 hours to 2 days)'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['certificate', 'noncredit', 'apprenticeship', 'degree'],
    institution_types: ['community_college', 'technical_college'],
    source_url: 'https://www.dacum.org/',
    source_document: 'DACUM Research Chart for Occupational Analysis',
    publication_year: 1966,
    last_updated_year: 2020,
    when_to_use: 'Use when designing a new CTE/workforce program from scratch. DACUM should be the first step before writing any curriculum. Also use when validating/updating existing programs against current industry practice.',
    citation_text: 'Norton, R.E., "DACUM Handbook," Ohio State University Center on Education and Training for Employment.',
    tags: ['occupational-analysis', 'curriculum-design', 'CTE', 'DACUM-chart', 'expert-worker'],
    related_frameworks: ['DOL Competency Model Clearinghouse'],
  },

  {
    framework_name: 'Guided Pathways Framework',
    short_name: 'Guided Pathways',
    version: null,
    framework_type: 'program_design',
    category: 'higher_ed',
    organization: 'Community College Research Center (CCRC) / AACC',
    organization_type: 'nonprofit',
    summary: `Guided Pathways is a whole-college redesign framework that replaces the "cafeteria model" of course selection with structured program maps that clearly show students what to take and in what order. Research shows community college students are far more likely to complete when they have clear, structured paths from enrollment to credential to career or transfer. The framework has four pillars: clarify paths, help students choose, help students stay on path, and ensure learning. It is the most widely adopted institutional reform model in U.S. community colleges, with over 250 colleges actively implementing. For CE/workforce programs, Guided Pathways principles inform how noncredit programs stack into credit pathways, how certificates ladder into degrees, and how students transition between programs.`,
    key_principles: [
      'Clarify the Path: Create clear, educationally coherent program maps for every credential',
      'Help Students Choose a Path: Provide structured exploration experiences early, not open-ended advising',
      'Help Students Stay on Path: Monitor progress with intrusive advising, early alerts, and milestone tracking',
      'Ensure Students Are Learning: Align program outcomes with career/transfer requirements, assess at scale',
      'Programs are organized into broad meta-majors or "areas of interest" (not 100+ disconnected programs)',
      'Math and English courses are contextualized to the student\'s program of study',
      'Transfer and career outcomes are built into every program map',
      'Noncredit and credit are integrated into a single pathway where possible'
    ],
    implementation_steps: [
      'Map every program from entry to completion with clear semester-by-semester sequences',
      'Organize programs into meta-majors/areas of interest (typically 6-8 clusters)',
      'Redesign onboarding to include career exploration before program selection',
      'Implement milestone tracking (credits earned, GPA thresholds, key course completion)',
      'Create early alert systems for students falling off-path',
      'Redesign advising: assign advisors by meta-major, not randomly',
      'Align noncredit workforce programs as on-ramps to credit pathways',
      'Build transfer maps with 4-year partners for every associate degree',
      'Establish program-level learning outcomes assessment processes'
    ],
    quality_indicators: [
      'Every program has a published program map with clear course sequences',
      'Students in first semester can name their intended program and career goal',
      'Momentum metrics improve: 15 credits in first year, gateway math/English in year 1',
      'Credential completion rates increase across demographics',
      'Equity gaps in completion narrow (disaggregated by race, income, age)'
    ],
    common_pitfalls: [
      'Treating it as an advising project instead of whole-college redesign',
      'Creating program maps but not actually restricting course scheduling to support them',
      'Ignoring noncredit students in the pathways model',
      'Not investing in technology for milestone tracking and early alerts',
      'Implementing pathways for traditional students but excluding adult learners and part-time students'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['degree', 'certificate', 'noncredit'],
    institution_types: ['community_college', 'technical_college'],
    source_url: 'https://www.pathwaysresources.org/',
    source_document: 'Redesigning America\'s Community Colleges: A Clearer Path to Student Success (Bailey, Jaggars, Jenkins)',
    publication_year: 2015,
    last_updated_year: 2023,
    when_to_use: 'Use when advising on institutional program structure, credential stacking, noncredit-to-credit pathways, or student success strategies. Essential context for any program feasibility study at a community college.',
    citation_text: 'Bailey, T., Jaggars, S.S., & Jenkins, D., "Redesigning America\'s Community Colleges: A Clearer Path to Student Success," Harvard University Press, 2015.',
    tags: ['guided-pathways', 'student-success', 'program-maps', 'completion', 'equity'],
    related_frameworks: ['Lumina Degree Qualifications Profile', 'AACC Pathways Project'],
  },

  {
    framework_name: 'Stackable Credentials Design Framework',
    short_name: 'Stackable Credentials',
    version: null,
    framework_type: 'program_design',
    category: 'continuing_education',
    organization: 'U.S. Department of Labor / CLASP',
    organization_type: 'federal',
    summary: `Stackable credentials are a sequence of credentials that can be accumulated over time to build qualifications along a career pathway. Unlike standalone certificates, stackable credentials are intentionally designed so that each credential has standalone labor market value AND serves as a stepping stone to the next level. This framework defines the design principles for creating effective stackable credential pathways, from short-term industry certifications through associate and bachelor's degrees. For CE/noncredit programs, this is the blueprint for designing training that doesn't dead-end — each noncredit certificate should articulate into a credit pathway, and each credit certificate should stack into a degree. The framework addresses the critical "last mile" problem: how to bridge noncredit workforce training into the credit system for continued advancement.`,
    key_principles: [
      'Each credential in the stack has independent labor market value (not just a "stepping stone")',
      'Credentials are designed as a coherent sequence with intentional articulation between levels',
      'Entry-level credentials provide quick workforce entry (typically 8-16 weeks)',
      'Mid-level credentials deepen expertise and expand career options (1-2 semesters)',
      'Advanced credentials (degrees) provide management/leadership preparation',
      'Prior learning assessment (PLA) reduces duplication between noncredit and credit',
      'Industry certifications are embedded within academic credentials where possible',
      'Pathways are transparent: students can see the full ladder at entry',
      'Off-ramps and on-ramps allow students to work at each level and return for more education'
    ],
    implementation_steps: [
      'Map career pathways in target industry from entry to management level',
      'Identify the credentials valued by employers at each career stage',
      'Design short-term entry credential (noncredit or credit certificate, 8-16 weeks)',
      'Build articulation from entry credential to next level (PLA, credit equivalency)',
      'Embed industry certifications within academic programs where possible',
      'Create transparent pathway maps showing all levels and articulation points',
      'Partner with employers to validate that each credential level leads to employment/promotion',
      'Track student progression through the stack (not just completion of individual credentials)',
      'Establish reverse transfer processes for students who complete higher credentials'
    ],
    quality_indicators: [
      'Graduates of entry-level credential achieve measurable wage gains',
      'At least 25% of entry-credential completers return for the next level within 3 years',
      'No credential in the stack requires repeating content from a lower credential',
      'Employer advisory board validates the stack against actual career progression',
      'PLA processes are documented and consistently applied'
    ],
    common_pitfalls: [
      'Creating certificates that have no standalone labor market value ("bridge to nowhere")',
      'Building noncredit programs with no articulation pathway into credit',
      'Requiring students to retake content they mastered in a lower credential',
      'Not tracking movement between credential levels (measuring only individual completions)',
      'Designing the stack in isolation from employers who actually hire at each level'
    ],
    applicable_sectors: ['healthcare', 'manufacturing', 'IT', 'construction', 'transportation'],
    applicable_program_types: ['certificate', 'noncredit', 'degree', 'micro-credential', 'apprenticeship'],
    institution_types: ['community_college', 'technical_college'],
    source_url: 'https://www.clasp.org/issues/postsecondary-education-workforce-development/stackable-credentials/',
    source_document: 'Stackable Credentials: Awards for the Future',
    publication_year: 2013,
    last_updated_year: 2022,
    when_to_use: 'Use when designing any credential pathway, evaluating noncredit-to-credit articulation, or advising on workforce program structure. Essential for Pathway Builder product and any feasibility study.',
    citation_text: 'CLASP, "Stackable Credentials: Awards for the Future," Center for Law and Social Policy, with U.S. DOL support.',
    tags: ['stackable', 'credentials', 'pathways', 'articulation', 'noncredit-to-credit', 'career-ladder'],
    related_frameworks: ['Guided Pathways Framework', 'C-BEN Quality Framework'],
  },

  // ════════════════════════════════════════════════
  // EMPLOYER PARTNERSHIPS
  // ════════════════════════════════════════════════
  {
    framework_name: 'Sector Partnership Framework',
    short_name: 'Sector Partnerships',
    version: 'National Model',
    framework_type: 'employer_partnership',
    category: 'workforce_development',
    organization: 'National Governors Association / National Skills Coalition',
    organization_type: 'nonprofit',
    summary: `Sector partnerships are industry-led regional collaborations where employers from the same industry work together with education, workforce, and community partners to address shared workforce challenges. Unlike traditional advisory boards (which are institution-led and advisory), sector partnerships are employer-led and action-oriented. They are the preferred model under WIOA for aligning workforce training with employer needs. Community colleges typically serve as a key partner (not the convener) in sector partnerships, providing training solutions for the needs the partnership identifies. This framework defines the structure, governance, and operational model for effective sector partnerships.`,
    key_principles: [
      'Employer-LED, not institution-led: Industry champions drive the agenda',
      'Industry-focused: Single industry or occupation cluster, not cross-sector',
      'Regional in scope: Aligned with labor market geography, not political boundaries',
      'Action-oriented: Produces measurable outcomes, not just meeting minutes',
      'Multi-partner: Includes employers, education, workforce boards, economic development, community orgs',
      'Data-informed: Uses labor market data to identify priorities and measure impact',
      'Sustainable: Has dedicated staff/backbone support, not volunteer-dependent',
      'Addresses systemic issues: Not just "we need 50 welders" but the root causes of talent gaps'
    ],
    implementation_steps: [
      'Identify target industry based on regional employment data and employer interest',
      'Recruit 8-15 employer champions from the target industry (HR leaders + C-suite)',
      'Designate a backbone organization to provide administrative support (often the workforce board)',
      'Conduct facilitated sessions to identify shared workforce challenges (skills gaps, retention, pipeline)',
      'Prioritize 2-3 actionable strategies the partnership can tackle together',
      'Community college designs training solutions aligned to partnership priorities',
      'Implement with shared accountability: employers commit to interviews/hiring, college commits to outcomes',
      'Measure and report: placements, wages, employer satisfaction, credential completion',
      'Revisit priorities annually as industry conditions change'
    ],
    quality_indicators: [
      'At least 8 employers actively participate (not just lend their name)',
      'Partnership meets regularly (monthly or quarterly) with documented agendas',
      'Employers co-design curriculum and validate assessments',
      'Completers are hired by partnership employers within 90 days at 70%+ rate',
      'Partnership survives leadership changes at individual employers (institutional, not personal)'
    ],
    common_pitfalls: [
      'College tries to "own" the partnership instead of supporting employer leadership',
      'Partnership becomes a talking shop without action items or accountability',
      'Focusing only on large employers — small/mid-size businesses often have the most urgent needs',
      'Not investing in backbone staffing (someone has to schedule, facilitate, follow up)',
      'Mixing too many industries — a healthcare + manufacturing partnership serves neither well'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['noncredit', 'certificate', 'apprenticeship'],
    institution_types: ['community_college', 'technical_college'],
    source_url: 'https://www.nationalskillscoalition.org/sector-partnerships/',
    source_document: 'Sector Partnership Policy Toolkit',
    publication_year: 2018,
    last_updated_year: 2023,
    when_to_use: 'Use when advising on employer engagement strategy, WIOA-funded program design, or any recommendation involving employer partnerships. Reference when a feasibility study identifies employer demand but lacks a partnership structure.',
    citation_text: 'National Skills Coalition, "Sector Partnership Policy Toolkit," with National Governors Association.',
    tags: ['employer-partnership', 'sector-strategy', 'WIOA', 'workforce-board', 'industry-led'],
    related_frameworks: ['WIOA Training Design Requirements', 'DOL Competency Model Clearinghouse'],
  },

  {
    framework_name: 'Work-Based Learning Continuum',
    short_name: 'Work-Based Learning',
    version: null,
    framework_type: 'employer_partnership',
    category: 'workforce_development',
    organization: 'U.S. Department of Labor / Advance CTE',
    organization_type: 'federal',
    summary: `The Work-Based Learning (WBL) Continuum defines a progression of employer-connected learning experiences from career awareness through career training. It provides a structured framework for designing authentic work experiences that complement classroom learning. For community colleges, WBL is critical because employers increasingly value candidates with practical experience, and many accreditors and program standards require clinical, practicum, or internship hours. The continuum ranges from low-intensity (career fairs, guest speakers) to high-intensity (registered apprenticeships, clinical rotations) and helps institutions select the right WBL strategy for each program based on industry norms, student readiness, and employer capacity.`,
    key_principles: [
      'Career Awareness: Exposure activities — career fairs, employer panels, facility tours, job shadowing (hours)',
      'Career Exploration: Structured exploration — informational interviews, mentoring, career research projects (days)',
      'Career Preparation: Applied learning — service learning, project-based learning with employer sponsors (weeks)',
      'Career Training: Immersive experience — internships, co-ops, practica, clinical rotations (months)',
      'Career Launch: Employment pathway — registered apprenticeship, pre-apprenticeship, on-the-job training (ongoing)',
      'Intensity increases as students progress through the continuum',
      'Employer role shifts from presenter → mentor → supervisor → employer',
      'Student role shifts from observer → participant → contributor → employee',
      'Assessment becomes increasingly performance-based and employer-evaluated'
    ],
    implementation_steps: [
      'Assess each program to determine appropriate WBL level(s) based on industry norms',
      'Start with lower-intensity WBL for programs without existing employer connections',
      'Develop employer WBL partnership agreements with clear expectations and liability coverage',
      'Train site supervisors on learning objectives, assessment, and student support',
      'Integrate WBL into the curriculum (not an add-on) with credit/credential recognition',
      'Create reflection and portfolio processes so students articulate WBL learning',
      'Build employer capacity gradually — start with job shadows before proposing internships',
      'Track outcomes: employer satisfaction, student learning gains, employment rates'
    ],
    quality_indicators: [
      'Every CTE/workforce program includes at least one WBL experience',
      'WBL is assessed against specific learning outcomes (not just "hours completed")',
      'Employer supervisors are trained and evaluate students using program rubrics',
      'Students produce a portfolio or capstone demonstrating WBL learning',
      'WBL experiences lead to employment offers for at least 40% of participants'
    ],
    common_pitfalls: [
      'Treating internships as free labor instead of structured learning experiences',
      'Not having learning agreements that protect students, employers, and the institution',
      'Jumping to high-intensity WBL without building employer relationships first',
      'Only offering WBL to traditional-age students (adult learners need flexible WBL models)',
      'Not giving academic credit for WBL experiences, reducing student motivation'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['certificate', 'degree', 'noncredit', 'apprenticeship'],
    institution_types: ['community_college', 'technical_college'],
    source_url: 'https://cte.careertech.org/sites/default/files/files/resources/Work-based_Learning_Definitions.pdf',
    source_document: 'Work-Based Learning Definitions and Continuum',
    publication_year: 2018,
    last_updated_year: 2022,
    when_to_use: 'Use when designing experiential learning components, advising on clinical/practicum requirements, or recommending employer engagement strategies for a program. Critical for healthcare and trades programs.',
    citation_text: 'Advance CTE and Association for Career and Technical Education, "Work-Based Learning Definitions Framework," 2018.',
    tags: ['work-based-learning', 'internship', 'apprenticeship', 'employer-engagement', 'experiential'],
    related_frameworks: ['Sector Partnership Framework', 'Registered Apprenticeship Standards'],
  },

  // ════════════════════════════════════════════════
  // QUALITY STANDARDS
  // ════════════════════════════════════════════════
  {
    framework_name: 'Quality Matters Higher Education Rubric',
    short_name: 'Quality Matters',
    version: '7th Edition',
    framework_type: 'quality_standard',
    category: 'higher_ed',
    organization: 'Quality Matters (QM)',
    organization_type: 'nonprofit',
    summary: `Quality Matters (QM) is the most widely adopted quality assurance framework for online and hybrid course design. The QM Rubric contains 8 general standards and 42 specific review standards used to evaluate course design quality. Unlike accreditation (which evaluates entire programs/institutions), QM focuses specifically on course-level design quality — whether a course is well-organized, has clear objectives, uses appropriate assessments, and supports learner engagement. For community colleges expanding online and hybrid delivery (which is most of them post-COVID), QM certification demonstrates quality to students, accreditors, and transfer partners. The framework is particularly relevant for continuing education programs moving to online delivery for the first time.`,
    key_principles: [
      'Standard 1 — Course Overview and Introduction: Clear navigation, getting started instructions, and netiquette',
      'Standard 2 — Learning Objectives: Measurable, clearly stated, and aligned to assessments',
      'Standard 3 — Assessment and Measurement: Aligned to objectives, varied, and appropriately weighted',
      'Standard 4 — Instructional Materials: Current, relevant, and appropriately cited/sourced',
      'Standard 5 — Learning Activities and Learner Interaction: Active learning, peer interaction, instructor presence',
      'Standard 6 — Course Technology: Supports learning objectives, accessible, with clear instructions',
      'Standard 7 — Learner Support: Links to academic support, technical help, and student services',
      'Standard 8 — Accessibility and Usability: WCAG 2.0 AA compliant, navigable, readable',
      'Alignment is the core principle: objectives → assessments → activities → materials must form a coherent chain'
    ],
    implementation_steps: [
      'Train instructors/designers in QM Rubric standards (QM offers certification courses)',
      'Conduct internal reviews of courses using the QM Rubric before external submission',
      'Address all essential standards (13 critical standards must be met for QM certification)',
      'Submit courses for official QM peer review (3-person review team)',
      'Revise courses based on peer review feedback',
      'Maintain QM certification through periodic re-review (every 5 years)',
      'Use QM principles for all course design, even courses not submitted for official review'
    ],
    quality_indicators: [
      'Course objectives use measurable verbs aligned to Bloom\'s taxonomy',
      'Every assessment directly measures at least one stated objective',
      'Course navigation is consistent and intuitive (3-click rule)',
      'All content is WCAG 2.0 AA accessible',
      'Students report high satisfaction with course organization and clarity'
    ],
    common_pitfalls: [
      'Focusing on QM certification as a checkbox instead of genuine quality improvement',
      'Applying QM standards only to fully online courses, ignoring hybrid and HyFlex',
      'Not training adjunct faculty (who teach the majority of CE courses) in QM principles',
      'Over-designing courses with excessive content instead of focused learning paths'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['degree', 'certificate', 'noncredit', 'micro-credential'],
    institution_types: ['community_college', 'technical_college', '4yr_public', '4yr_private'],
    source_url: 'https://www.qualitymatters.org/qa-resources/rubric-standards/higher-ed-rubric',
    source_document: 'Quality Matters Higher Education Rubric, 7th Edition',
    publication_year: 2023,
    last_updated_year: 2023,
    when_to_use: 'Use when advising on online/hybrid course design, evaluating course quality, or recommending quality standards for new programs delivered online. Relevant for any Curriculum Drift Analysis involving delivery modality.',
    citation_text: 'Quality Matters, "Higher Education Rubric," 7th Edition, 2023.',
    tags: ['quality', 'online-learning', 'course-design', 'accessibility', 'QM'],
    related_frameworks: ['ACUE Effective Teaching Practices'],
  },

  {
    framework_name: 'ACUE Effective Teaching Practices Framework',
    short_name: 'ACUE Framework',
    version: null,
    framework_type: 'quality_standard',
    category: 'higher_ed',
    organization: 'Association of College and University Educators (ACUE)',
    organization_type: 'nonprofit',
    summary: `The ACUE Effective Teaching Practices Framework defines evidence-based teaching practices organized into five units that collectively improve student learning outcomes. Unlike QM (which focuses on course design), ACUE focuses on teaching practice — what instructors actually do in the classroom. Research shows that ACUE-credentialed instructors see measurable improvements in student pass rates, persistence, and completion. For community colleges, ACUE is particularly valuable for developing adjunct faculty (who receive minimal professional development) and for building a culture of teaching excellence. The framework is endorsed by the American Council on Education (ACE) and multiple accreditors.`,
    key_principles: [
      'Unit 1 — Designing an Effective Course: Backward design, constructive alignment, inclusive syllabus',
      'Unit 2 — Establishing a Productive Learning Environment: Belonging, growth mindset, inclusive pedagogy',
      'Unit 3 — Using Active Learning Techniques: Think-pair-share, case studies, problem-based learning, collaborative work',
      'Unit 4 — Promoting Higher-Order Thinking: Scaffolding complexity, metacognition, transfer',
      'Unit 5 — Utilizing Assessment to Inform Teaching: Formative assessment, feedback loops, transparent grading',
      'All practices are evidence-based with published research supporting effectiveness',
      'Framework emphasizes equity-minded teaching as a through-line, not a separate topic',
      'Micro-credentialed: Instructors earn credentials by implementing practices and reflecting on outcomes'
    ],
    implementation_steps: [
      'Enroll faculty cohorts in ACUE course (25-week facilitated online program)',
      'Faculty implement one new practice per module in their own courses',
      'Peer observation and reflection are built into the credential process',
      'Faculty submit artifacts (syllabi, activities, assessment examples) demonstrating implementation',
      'Measure impact on student outcomes (DFW rates, persistence) at course level',
      'Recognize ACUE credential in tenure/promotion processes',
      'Build ongoing faculty learning communities to sustain practices after credentialing'
    ],
    quality_indicators: [
      'DFW rates decrease in sections taught by ACUE-credentialed faculty',
      'Student course evaluations show higher ratings for engagement and organization',
      'Equity gaps in course outcomes narrow for ACUE-credentialed faculty',
      'Faculty report sustained use of practices 2+ years after credentialing'
    ],
    common_pitfalls: [
      'Mandating ACUE without faculty buy-in (voluntary cohorts outperform mandated ones)',
      'Not tracking outcome data to demonstrate ROI to administration',
      'Credentialing faculty but not changing the institutional incentive structure',
      'Ignoring adjunct faculty who teach 60-70% of community college sections'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['degree', 'certificate', 'noncredit'],
    institution_types: ['community_college', 'technical_college', '4yr_public', '4yr_private'],
    source_url: 'https://acue.org/effective-teaching-framework/',
    source_document: 'ACUE Effective Teaching Practices Framework',
    publication_year: 2018,
    last_updated_year: 2024,
    when_to_use: 'Use when advising on faculty development, addressing course-level quality or high DFW rates, or recommending strategies for improving student outcomes. Relevant for Curriculum Drift Analysis.',
    citation_text: 'Association of College and University Educators (ACUE), "Effective Teaching Practices Framework," endorsed by ACE.',
    tags: ['teaching', 'faculty-development', 'student-success', 'evidence-based', 'equity'],
    related_frameworks: ['Quality Matters Higher Education Rubric'],
  },

  // ════════════════════════════════════════════════
  // WORKFORCE TRAINING DESIGN
  // ════════════════════════════════════════════════
  {
    framework_name: 'WIOA Training Design Requirements',
    short_name: 'WIOA Training Requirements',
    version: 'WIOA 2014 (Reauthorization Pending)',
    framework_type: 'training_design',
    category: 'workforce_development',
    organization: 'U.S. Department of Labor',
    organization_type: 'federal',
    summary: `The Workforce Innovation and Opportunity Act (WIOA) establishes requirements for federally-funded workforce training programs. Any program seeking WIOA funding (Individual Training Accounts, On-the-Job Training, incumbent worker training) must meet specific criteria around demand-driven design, performance accountability, and eligible training provider standards. Understanding WIOA requirements is critical for community colleges because WIOA funding is the largest source of public workforce training dollars, and being listed on the state's Eligible Training Provider List (ETPL) is often required for students to use WIOA funds at your institution. This framework outlines what WIOA requires and how to design programs that meet those requirements.`,
    key_principles: [
      'Demand-Driven: Training must lead to employment in in-demand occupations (state WIOA list)',
      'Industry-Recognized Credentials: Programs should lead to recognized credentials, not just certificates of completion',
      'Performance Accountability: Programs are measured on completion, employment, median earnings, and credential attainment (WIOA primary indicators)',
      'Eligible Training Provider List (ETPL): Providers must apply and maintain performance to remain eligible',
      'Career Pathways: Programs should be part of a career pathway, not standalone dead-end training',
      'Integrated Education and Training (IET): Combine occupational training with basic skills instruction for low-skilled adults',
      'Accessibility: Programs must serve priority populations (low-income, public assistance, basic skills deficient)',
      'Employer Engagement: Training must be developed with employer input and lead to actual employment'
    ],
    implementation_steps: [
      'Verify target occupation is on the state\'s in-demand occupation list',
      'Apply to the state ETPL (process varies by state — typically through the workforce board)',
      'Design program to lead to an industry-recognized credential (not just institutional certificate)',
      'Establish employer partnerships that commit to interviewing/hiring completers',
      'Build data collection processes for WIOA performance reporting (completion, employment, wages)',
      'If serving basic skills-deficient adults, design IET model (occupational + academic integration)',
      'Create a career pathway showing how the program connects to further education/advancement',
      'Report performance data annually to maintain ETPL eligibility'
    ],
    quality_indicators: [
      'Program is listed on state ETPL and in good standing',
      'WIOA primary indicators exceed state negotiated levels',
      'Program leads to at least one industry-recognized credential',
      'At least 70% of completers are employed within 6 months in a related occupation',
      'Median earnings of completers exceed minimum wage by at least 30%'
    ],
    common_pitfalls: [
      'Designing programs for occupations NOT on the state in-demand list (WIOA can\'t fund it)',
      'Awarding institutional certificates that employers don\'t recognize as credentials',
      'Not tracking employment outcomes — losing ETPL status for poor/missing data',
      'Treating WIOA as supplemental rather than designing programs to be WIOA-eligible from the start',
      'Ignoring the IET requirement for programs serving adults below 8th grade reading level'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['noncredit', 'certificate', 'apprenticeship'],
    institution_types: ['community_college', 'technical_college'],
    source_url: 'https://www.dol.gov/agencies/eta/wioa',
    source_document: 'Workforce Innovation and Opportunity Act of 2014 (P.L. 113-128)',
    publication_year: 2014,
    last_updated_year: 2024,
    when_to_use: 'Use for any program targeting workforce funding, designing noncredit training, or evaluating ETPL eligibility. Reference WIOA requirements in every feasibility study for workforce programs.',
    citation_text: 'Workforce Innovation and Opportunity Act of 2014, Pub. L. 113-128, U.S. Department of Labor, Employment and Training Administration.',
    tags: ['WIOA', 'workforce-funding', 'ETPL', 'performance', 'demand-driven', 'IET'],
    related_frameworks: ['Sector Partnership Framework', 'DOL Competency Model Clearinghouse'],
  },

  {
    framework_name: 'Registered Apprenticeship Standards',
    short_name: 'Registered Apprenticeship',
    version: 'CFR Title 29 Part 29/30',
    framework_type: 'training_design',
    category: 'apprenticeship',
    organization: 'U.S. Department of Labor / Office of Apprenticeship',
    organization_type: 'federal',
    summary: `Registered Apprenticeship (RA) is the only federally-regulated earn-and-learn training model in the U.S. A registered apprenticeship combines paid on-the-job training with related technical instruction (RTI), typically provided by a community college. Apprentices earn progressive wage increases as they develop skills, and completers receive a nationally-recognized, portable credential. Community colleges are the primary providers of RTI for registered apprenticeships, and expanding RA programs into non-traditional sectors (healthcare, IT, advanced manufacturing) is a major DOL priority. Programs must meet federal standards for employer sponsorship, structured OJT, RTI hours, progressive wages, and safety.`,
    key_principles: [
      'Employer-Sponsored: An employer (or employer consortium) must sponsor the apprenticeship',
      'Structured On-the-Job Training (OJT): Minimum 2,000 hours typically (can be competency-based)',
      'Related Technical Instruction (RTI): Minimum 144 hours/year of classroom/online instruction',
      'Progressive Wages: Apprentice wages increase as competencies are demonstrated',
      'Mentorship: Each apprentice is assigned a qualified journeyworker mentor',
      'National Credential: Completers receive a Certificate of Completion of Apprenticeship (portable, nationally recognized)',
      'Diversity & Inclusion: Equal opportunity requirements (CFR Part 30)',
      'Competency-Based or Time-Based: Programs can be structured either way (or hybrid)',
      'Registration: Must be registered with DOL Office of Apprenticeship or recognized State Apprenticeship Agency'
    ],
    implementation_steps: [
      'Identify employer sponsor(s) willing to hire apprentices and provide OJT',
      'Define the occupation and apprenticeable skills (DOL maintains a list of approved occupations)',
      'Design structured OJT plan with progressive skill development milestones',
      'Design RTI curriculum aligned to OJT progression (community college partnership)',
      'Establish progressive wage scale (entry to journeyworker rate)',
      'Develop apprenticeship standards document (DOL provides templates)',
      'Register the program with federal OA or state agency',
      'Recruit apprentices and execute apprenticeship agreements',
      'Track hours, competencies, and wage progression in DOL RAPIDS system',
      'Award credential upon completion of all OJT and RTI requirements'
    ],
    quality_indicators: [
      'Program is registered with DOL or recognized state agency',
      'Completion rate exceeds 50% (national average is ~55%)',
      'Completers achieve journeyworker wage level',
      'RTI is delivered by accredited education provider',
      'Employer sponsors report apprentices meet or exceed performance expectations'
    ],
    common_pitfalls: [
      'Trying to register without an employer sponsor (college can\'t sponsor alone)',
      'Setting RTI hours too high relative to OJT (apprentices are primarily employees)',
      'Not establishing the progressive wage scale upfront (DOL requirement)',
      'Confusing "apprenticeship-style" programs with Registered Apprenticeship (only RA carries federal credential)',
      'Not addressing diversity requirements (Part 30) — can result in deregistration'
    ],
    applicable_sectors: ['construction', 'manufacturing', 'healthcare', 'IT', 'transportation', 'energy'],
    applicable_program_types: ['apprenticeship'],
    institution_types: ['community_college', 'technical_college'],
    source_url: 'https://www.apprenticeship.gov/',
    source_document: 'Code of Federal Regulations, Title 29, Parts 29 and 30',
    publication_year: 2008,
    last_updated_year: 2023,
    when_to_use: 'Use when advising on apprenticeship program development, evaluating earn-and-learn models, or designing programs in trades and emerging apprenticeship fields (healthcare, IT). Essential for workforce programs in construction and manufacturing.',
    citation_text: 'U.S. Department of Labor, Office of Apprenticeship, "Registered Apprenticeship Standards," 29 CFR Parts 29 and 30.',
    tags: ['apprenticeship', 'earn-and-learn', 'OJT', 'RTI', 'DOL', 'credential'],
    related_frameworks: ['WIOA Training Design Requirements', 'DOL Competency Model Clearinghouse'],
  },

  // ════════════════════════════════════════════════
  // ADULT LEARNING
  // ════════════════════════════════════════════════
  {
    framework_name: 'CAEL Standards for Assessing Learning',
    short_name: 'CAEL PLA Standards',
    version: '2nd Edition',
    framework_type: 'adult_learning',
    category: 'continuing_education',
    organization: 'Council for Adult and Experiential Learning (CAEL)',
    organization_type: 'nonprofit',
    summary: `CAEL's 10 Standards for Assessing Learning (formerly the "Ten Standards for Quality Assurance in Assessing Learning for Credit") are the authoritative framework for Prior Learning Assessment (PLA) in higher education. PLA allows adult learners to earn credit for knowledge and skills acquired through work experience, military service, independent study, or other non-classroom learning. CAEL's standards ensure that PLA is rigorous, fair, and academically equivalent to classroom learning. For community colleges serving adult learners, robust PLA processes are critical for reducing time-to-completion and eliminating redundant coursework — especially when noncredit students transition to credit programs.`,
    key_principles: [
      'Credit is awarded for demonstrated learning, not experience alone (learning ≠ experience)',
      'Assessment methods are reliable, valid, and appropriate for the learning being assessed',
      'Academic standards for PLA credit are the same as for classroom-based credit',
      'Credit is appropriate to the institution\'s mission and the student\'s program',
      'Assessors are qualified subject matter experts',
      'PLA credit is transcript-worthy and transferable where possible',
      'PLA processes are administratively practical and cost-effective',
      'PLA fees are reasonable and not a barrier to access',
      'Students receive adequate support and guidance through the PLA process',
      'PLA policies are publicly accessible and consistently applied'
    ],
    implementation_steps: [
      'Develop institutional PLA policy aligned to CAEL standards',
      'Define which programs/courses are eligible for PLA credit',
      'Create multiple PLA assessment pathways: portfolio, challenge exam, CLEP/DSST, ACE-evaluated training, military transcripts',
      'Train faculty assessors in evaluating experiential learning against course outcomes',
      'Set reasonable fee structures (per credit or per assessment, not per course)',
      'Build PLA advising into new student onboarding for adult learners',
      'Track PLA credit awards and student outcomes (completion rates for PLA vs non-PLA students)',
      'Review and update PLA policies annually'
    ],
    quality_indicators: [
      'At least 3 PLA pathways are available to students',
      'PLA students complete credentials at higher rates than non-PLA students (research consistently shows this)',
      'Faculty assessors are trained and calibrated for consistent evaluation',
      'PLA credit appears on transcripts identically to other credit',
      'Average time-to-credential is reduced for students using PLA'
    ],
    common_pitfalls: [
      'Making PLA so bureaucratic that few students complete the process',
      'Setting PLA fees higher than tuition for the equivalent course (creates perverse incentive)',
      'Limiting PLA to general education courses only — workforce programs benefit most',
      'Not marketing PLA to adult students (many don\'t know it exists)',
      'Accepting military transcripts but not evaluating corporate training or noncredit programs'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['degree', 'certificate'],
    institution_types: ['community_college', 'technical_college', '4yr_public'],
    source_url: 'https://www.cael.org/ten-standards-for-quality',
    source_document: 'Assessing Learning Standards: Ten Standards for Quality Assurance, 2nd Edition',
    publication_year: 2018,
    last_updated_year: 2022,
    when_to_use: 'Use when advising on noncredit-to-credit articulation, adult learner recruitment, or PLA policy development. Critical for any stackable credential pathway that bridges workforce training into academic programs.',
    citation_text: 'Council for Adult and Experiential Learning (CAEL), "Assessing Learning: Ten Standards for Quality Assurance," 2nd Edition.',
    tags: ['PLA', 'prior-learning', 'adult-learners', 'credit-for-experience', 'assessment'],
    related_frameworks: ['Stackable Credentials Design Framework', 'C-BEN Quality Framework'],
  },

  {
    framework_name: 'Knowles Adult Learning Theory (Andragogy)',
    short_name: 'Andragogy',
    version: null,
    framework_type: 'adult_learning',
    category: 'continuing_education',
    organization: 'Malcolm Knowles / Adult Education Field',
    organization_type: 'academic',
    summary: `Andragogy — the theory of adult learning — provides the foundational principles for designing effective continuing education and workforce training programs. Unlike pedagogy (which assumes teacher-directed learning appropriate for children), andragogy recognizes that adults learn differently: they need to know why they're learning something, they bring extensive experience, they are self-directed, and they learn best when content is immediately applicable. These principles directly inform instructional design decisions for CE programs, from scheduling and delivery format to assessment methods and content organization. Every CE program should be designed with these principles, yet many community college programs default to pedagogical approaches designed for 18-year-olds.`,
    key_principles: [
      'Need to Know: Adults need to understand WHY they are learning something before engaging',
      'Self-Concept: Adults are self-directed and resist being told what to do; they want input into learning goals',
      'Role of Experience: Adults bring rich, diverse experience that is a resource for learning (and a source of bias)',
      'Readiness to Learn: Adults are most ready to learn things they need to know for their current life situation',
      'Orientation to Learning: Adults are life/task-centered, not subject-centered; they want to apply learning immediately',
      'Motivation: Adults are primarily motivated by internal factors (self-esteem, quality of life, job satisfaction) not grades',
      'Adults learn best in collaborative, respectful environments that value their experience',
      'Time is precious for adults — every minute of instruction must earn its place'
    ],
    implementation_steps: [
      'Start every course/module by explaining the real-world application ("you\'ll use this when...")',
      'Use diagnostic assessments to identify what adults already know (don\'t re-teach mastered content)',
      'Incorporate learner experience as a learning resource (discussion, case studies from their workplaces)',
      'Offer choices in how and when learning occurs (flexible scheduling, modular content, self-paced options)',
      'Design problem-centered rather than content-centered instruction',
      'Use authentic assessments that mirror actual job tasks',
      'Provide immediate, actionable feedback (not just grades)',
      'Respect time constraints: offer compressed, intensive formats when possible'
    ],
    quality_indicators: [
      'Course evaluations show adults report content is "immediately applicable" to their work/life',
      'Dropout rates are lower in programs designed with andragogical principles',
      'Adult students report feeling respected and valued in the learning environment',
      'Assessment methods reflect real-world application, not academic exercises'
    ],
    common_pitfalls: [
      'Lecturing for 3 hours to adult students who work full-time (attention and retention plummet)',
      'Requiring academic writing formats when the learning goal is workplace competency',
      'Not acknowledging that some adults have negative prior school experiences',
      'Designing rigid, sequential programs when adults need flexible entry/exit points',
      'Using grades as the primary motivator (adults are motivated by competence and advancement)'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['noncredit', 'certificate', 'degree', 'micro-credential'],
    institution_types: ['community_college', 'technical_college'],
    source_url: 'https://www.instructionaldesign.org/theories/andragogy/',
    source_document: 'The Adult Learner: The Definitive Classic in Adult Education and Human Resource Development (Knowles, Holton, Swanson)',
    publication_year: 1973,
    last_updated_year: 2020,
    when_to_use: 'Use when designing ANY continuing education or workforce training program. These principles should be referenced in every program design recommendation, particularly for noncredit and short-term training.',
    citation_text: 'Knowles, M.S., Holton, E.F., & Swanson, R.A., "The Adult Learner," 9th Edition, Routledge, 2020.',
    tags: ['adult-learning', 'andragogy', 'instructional-design', 'continuing-education'],
    related_frameworks: ['ACUE Effective Teaching Practices', 'Quality Matters Higher Education Rubric'],
  },

  // ════════════════════════════════════════════════
  // CREDENTIAL FRAMEWORKS
  // ════════════════════════════════════════════════
  {
    framework_name: 'Credential Transparency Description Language',
    short_name: 'CTDL / Credential Engine',
    version: null,
    framework_type: 'credential_framework',
    category: 'workforce_development',
    organization: 'Credential Engine',
    organization_type: 'nonprofit',
    summary: `Credential Engine's Credential Transparency Description Language (CTDL) is an open-source data standard for describing credentials in a machine-readable format. The Credential Registry (built on CTDL) contains descriptions of over 1 million credentials from thousands of organizations. For community colleges, Credential Engine provides the infrastructure for making credentials transparent and discoverable — students and employers can see exactly what a credential requires, what competencies it represents, and how it connects to other credentials and careers. This is increasingly important as the credential landscape becomes more complex (micro-credentials, digital badges, industry certifications alongside traditional degrees).`,
    key_principles: [
      'All credentials should be described in a transparent, consistent, machine-readable format',
      'CTDL describes: what the credential is, who offers it, what you learn, what it qualifies you for',
      'Credentials connect to competency frameworks, quality assurance, and labor market outcomes',
      'The Credential Registry is a centralized, open-access database of credential descriptions',
      'Transparency enables comparison: students can compare credentials across institutions',
      'Credential descriptions include learning and employment outcomes, costs, and time to complete',
      'Interoperability: CTDL connects to Open Badges, Comprehensive Learner Records, and LMI data'
    ],
    implementation_steps: [
      'Inventory all credentials offered by the institution (credit, noncredit, co-curricular)',
      'Create CTDL-compliant descriptions for each credential',
      'Publish descriptions to the Credential Registry (free, self-service)',
      'Map credentials to competency frameworks (DOL, NICE, etc.) where applicable',
      'Include outcome data (employment rates, earnings) where available',
      'Connect credentials to career pathway maps',
      'Update registry entries as programs change'
    ],
    quality_indicators: [
      'All credentials are published in the Credential Registry',
      'Credential descriptions include competency alignment, cost, and time-to-complete',
      'Students can find and compare the institution\'s credentials via the Registry',
      'Credential descriptions are updated within 30 days of program changes'
    ],
    common_pitfalls: [
      'Treating credential registration as a one-time task instead of ongoing maintenance',
      'Only registering degree programs (noncredit and micro-credentials need transparency too)',
      'Not including outcome data in credential descriptions'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['degree', 'certificate', 'noncredit', 'micro-credential'],
    institution_types: ['community_college', 'technical_college', '4yr_public', '4yr_private'],
    source_url: 'https://credentialengine.org/',
    source_document: 'Credential Transparency Description Language (CTDL)',
    publication_year: 2016,
    last_updated_year: 2024,
    when_to_use: 'Use when advising on credential design, micro-credential strategy, or transparency/marketing of programs. Reference when programs need to demonstrate quality or comparability.',
    citation_text: 'Credential Engine, "Credential Transparency Description Language (CTDL)," credentialengine.org.',
    tags: ['credentials', 'transparency', 'micro-credentials', 'open-badges', 'registry'],
    related_frameworks: ['Lumina Degree Qualifications Profile', 'Stackable Credentials Design Framework'],
  },

  // ════════════════════════════════════════════════
  // ADDITIONAL CRITICAL FRAMEWORKS
  // ════════════════════════════════════════════════
  {
    framework_name: 'Aspen Prize Criteria for Community College Excellence',
    short_name: 'Aspen Prize Criteria',
    version: null,
    framework_type: 'quality_standard',
    category: 'higher_ed',
    organization: 'Aspen Institute College Excellence Program',
    organization_type: 'nonprofit',
    summary: `The Aspen Prize for Community College Excellence is the nation's preeminent recognition for community colleges. The prize criteria define what excellence looks like across four dimensions: completion, labor market outcomes, equity, and learning. These criteria serve as a de facto quality framework that ambitious community colleges use to benchmark themselves. For Wavelength, the Aspen criteria are valuable because they define the outcomes that institutional leaders care about most — and any new program should be designed to improve performance on these dimensions.`,
    key_principles: [
      'Completion: Strong and improving rates of credential completion and transfer',
      'Labor Market Outcomes: Graduates achieve meaningful employment and earnings gains',
      'Equity: Outcomes are strong across racial, ethnic, and socioeconomic groups — gaps are closing',
      'Learning: Students develop the skills and knowledge needed for success',
      'Improvement trajectory matters as much as current performance',
      'Both retention (staying enrolled) and momentum (accumulating credits) are tracked',
      'Transfer outcomes (bachelor\'s completion at receiving institution) are valued equally to direct employment'
    ],
    implementation_steps: [
      'Benchmark current performance against Aspen metrics',
      'Identify largest equity gaps in completion and earnings by demographic',
      'Design programs that explicitly target underperforming populations',
      'Track labor market outcomes (employment, earnings) not just completion',
      'Set improvement targets for 3-year and 5-year horizons',
      'Use disaggregated data in all program review processes'
    ],
    quality_indicators: [
      'Completion rates exceed national median for community colleges (~40%)',
      'Graduates earn at least $5,000 more annually than non-completers',
      'Completion gaps between white and non-white students are less than 10 percentage points',
      'Year-over-year improvement in at least 2 of 4 dimensions'
    ],
    common_pitfalls: [
      'Focusing only on completion rates without tracking post-completion outcomes',
      'Celebrating overall improvements that mask widening equity gaps',
      'Not tracking transfer students after they leave for a 4-year institution'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['degree', 'certificate'],
    institution_types: ['community_college'],
    source_url: 'https://highered.aspeninstitute.org/aspen-prize/',
    source_document: 'Aspen Prize for Community College Excellence — Selection Criteria',
    publication_year: 2011,
    last_updated_year: 2024,
    when_to_use: 'Use when evaluating institutional performance, benchmarking programs against excellence criteria, or making the case for new programs that improve completion, equity, or earnings outcomes.',
    citation_text: 'Aspen Institute College Excellence Program, "Aspen Prize for Community College Excellence," aspeninstitute.org.',
    tags: ['excellence', 'benchmarking', 'completion', 'equity', 'outcomes'],
    related_frameworks: ['Guided Pathways Framework'],
  },

  {
    framework_name: 'Integrated Education and Training (IET) Model',
    short_name: 'IET Model',
    version: 'WIOA Section 203',
    framework_type: 'training_design',
    category: 'workforce_development',
    organization: 'U.S. Department of Education / OCTAE',
    organization_type: 'federal',
    summary: `Integrated Education and Training (IET) is a WIOA-mandated service delivery model that simultaneously provides adult education (basic skills, ESL, GED prep), workforce preparation, and workforce training in a single, coherent program. Unlike sequential models (where students must complete basic skills before starting occupational training), IET contextualizes academic instruction within the occupational content. For example, a CNA program for ESL students would teach medical terminology, anatomy-related reading, and healthcare math within the context of nursing assistant duties. IET is required for WIOA Title II programs and is increasingly recognized as the most effective model for serving adults with basic skills deficiencies who need to enter the workforce quickly.`,
    key_principles: [
      'Three components delivered concurrently: Adult education, workforce preparation, workforce training',
      'Contextualized instruction: Academic content is taught through occupational lens',
      'Single set of learning objectives: Not three separate classes duct-taped together',
      'Results in an industry-recognized credential, not just basic skills improvement',
      'Team teaching model: Adult education instructor + occupational instructor collaborate',
      'Students are co-enrolled in both adult education and occupational training',
      'Designed for adults functioning below 8th grade reading/math level or ESL learners',
      'Must connect to a career pathway with advancement opportunities'
    ],
    implementation_steps: [
      'Identify high-demand occupations that are accessible to basic skills-deficient adults',
      'Partner adult education faculty with CTE/workforce faculty to co-design curriculum',
      'Develop contextualized basic skills materials using occupational content (not generic worksheets)',
      'Create a single schedule where students attend both components (not separate day/evening classes)',
      'Design assessments that measure both academic gains and occupational competency',
      'Track WIOA performance indicators: measurable skill gains + credential attainment + employment',
      'Build bridge programs for students needing additional basic skills support before IET entry',
      'Create alumni pathways for IET completers to continue education'
    ],
    quality_indicators: [
      'Students achieve measurable skill gains (TABE/CASAS) while earning occupational credentials',
      'Credential completion rate exceeds traditional sequential model by 20%+',
      'Employment rate within 6 months exceeds 60% for IET completers',
      'ESL students demonstrate workplace-level English proficiency at completion'
    ],
    common_pitfalls: [
      'Calling a program "IET" when academic and occupational components are actually separate classes',
      'Using generic academic materials instead of contextualized content',
      'Not having a dedicated program coordinator who bridges both departments',
      'Setting academic entry requirements too high (defeats the purpose of IET)',
      'Not tracking both academic and occupational outcomes (WIOA requires both)'
    ],
    applicable_sectors: ['healthcare', 'manufacturing', 'construction', 'hospitality', 'transportation'],
    applicable_program_types: ['noncredit', 'certificate'],
    institution_types: ['community_college', 'technical_college'],
    source_url: 'https://lincs.ed.gov/state-resources/federal-initiatives/iet',
    source_document: 'WIOA Section 203: Integrated Education and Training',
    publication_year: 2014,
    last_updated_year: 2023,
    when_to_use: 'Use when designing programs for basic skills-deficient or ESL populations, recommending WIOA Title II program improvements, or advising on workforce training for underserved communities.',
    citation_text: 'U.S. Department of Education, Office of Career, Technical, and Adult Education (OCTAE), "Integrated Education and Training (IET) under WIOA," 2023.',
    tags: ['IET', 'adult-education', 'ESL', 'basic-skills', 'WIOA', 'contextualized'],
    related_frameworks: ['WIOA Training Design Requirements', 'Knowles Adult Learning Theory'],
  },

  {
    framework_name: 'Advisory Committee Best Practices',
    short_name: 'Advisory Committee Guide',
    version: null,
    framework_type: 'employer_partnership',
    category: 'continuing_education',
    organization: 'Various / ACTE / State CTE Directors',
    organization_type: 'consortium',
    summary: `Program advisory committees are the primary mechanism through which community colleges maintain industry alignment for CTE and workforce programs. An effective advisory committee goes far beyond meeting twice a year to rubber-stamp curriculum — it actively shapes program content, validates equipment and technology choices, provides work-based learning opportunities, and serves as a pipeline for employer partnerships. Most accreditors and state CTE systems require active advisory committees, but the quality varies enormously. This framework captures best practices from high-performing advisory committees that actually drive program quality and relevance.`,
    key_principles: [
      'Composition: 8-15 members representing diverse employers (large/small, urban/rural), recent graduates, and industry experts',
      'Meeting frequency: Minimum 2x/year, with working subcommittees meeting more often',
      'Employer-majority: At least 51% of members should be from industry, not the college',
      'Action-oriented agendas: Every meeting produces at least one actionable recommendation',
      'Curriculum review: Advisory reviews program outcomes, course content, and equipment annually',
      'Labor market alignment: Advisory validates that program targets match hiring needs',
      'Work-based learning: Members provide internship, job shadow, and apprenticeship opportunities',
      'Recruitment pipeline: Advisory members serve as program ambassadors to potential students and employers',
      'Documentation: Minutes, recommendations, and actions taken are documented for accreditation'
    ],
    implementation_steps: [
      'Recruit advisory members who represent the actual employers who hire your graduates',
      'Develop an annual calendar with specific agenda topics for each meeting',
      'Share program data at every meeting: enrollment, completion, placement, wages',
      'Present curriculum updates and ask for specific feedback (not just approval)',
      'Assign action items with owners and deadlines (track in shared document)',
      'Invite advisory members to campus for student presentations, capstone reviews, mock interviews',
      'Survey advisory members annually on satisfaction and engagement',
      'Rotate membership to maintain fresh perspectives (3-year terms with staggered replacement)'
    ],
    quality_indicators: [
      'Advisory meets 2+ times/year with 60%+ attendance',
      'At least one curriculum change per year results from advisory input',
      'Advisory members provide 3+ work-based learning placements per year',
      'Program completers are employed by advisory member companies within 6 months',
      'Advisory recommendations and college responses are documented in meeting minutes'
    ],
    common_pitfalls: [
      'Stacking the committee with college employees or retirees instead of active industry professionals',
      'Only meeting once a year for accreditation compliance',
      'Not sharing outcome data — advisors can\'t give good advice without data',
      'Ignoring advisory recommendations (fastest way to lose engaged members)',
      'Not having a dedicated staff member to manage logistics (scheduling is the #1 barrier)'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['certificate', 'degree', 'noncredit', 'apprenticeship'],
    institution_types: ['community_college', 'technical_college'],
    source_url: 'https://www.acteonline.org/',
    source_document: 'Advisory Committee Best Practices (compiled from ACTE, state CTE directors, and accreditor standards)',
    publication_year: 2015,
    last_updated_year: 2023,
    when_to_use: 'Use when advising on employer engagement, program review processes, or accreditation preparation. Include advisory committee recommendations in every program design deliverable.',
    citation_text: 'Association for Career and Technical Education (ACTE) and state CTE director consortium, "Advisory Committee Best Practices."',
    tags: ['advisory-committee', 'employer-engagement', 'accreditation', 'program-review', 'CTE'],
    related_frameworks: ['Sector Partnership Framework', 'Work-Based Learning Continuum'],
  },

  {
    framework_name: 'Micro-Credential Design Principles',
    short_name: 'Micro-Credential Design',
    version: null,
    framework_type: 'credential_framework',
    category: 'continuing_education',
    organization: 'UPCEA / AACRAO / Quality Matters',
    organization_type: 'consortium',
    summary: `Micro-credentials (also called digital badges, micro-certifications, or nano-degrees) are short, focused credentials that verify specific competencies. They are the fastest-growing credential type in higher education and workforce development. This framework synthesizes best practices from multiple organizations for designing micro-credentials that have actual labor market value — not just participation badges. For community colleges, micro-credentials offer a way to quickly respond to employer needs, provide upskilling for incumbent workers, and create low-risk entry points that can stack into larger credentials.`,
    key_principles: [
      'Competency-focused: Each micro-credential verifies a specific, assessable competency (not just participation)',
      'Employer-validated: The competency being credentialed is valued by employers (not just academically interesting)',
      'Assessed: Earners must demonstrate the competency through authentic assessment (not just complete a course)',
      'Portable: Issued as digital badges with metadata that is machine-readable and shareable (Open Badges standard)',
      'Stackable: Micro-credentials should be designable as building blocks toward larger credentials',
      'Transparent: Criteria for earning are publicly available and consistent',
      'Time-bound and affordable: Typically 1-40 hours of learning, $50-$500',
      'Quality-assured: Subject to the same quality review as other institutional credentials'
    ],
    implementation_steps: [
      'Identify high-demand competencies from employer partners and labor market data',
      'Define specific, measurable criteria for earning each micro-credential',
      'Design authentic assessments (not quizzes) that verify the competency',
      'Build the learning experience (can be workshop, online module, project-based)',
      'Set up digital badge infrastructure (Credly/Acclaim, Badgr, or institutional system)',
      'Publish criteria on Credential Engine Registry for discoverability',
      'Market to both traditional students (as supplements) and incumbent workers (as upskilling)',
      'Track outcomes: who earns them, employer recognition, stacking behavior'
    ],
    quality_indicators: [
      'Each micro-credential has a clear, public competency statement and assessment rubric',
      'Employers recognize the micro-credential in hiring/promotion decisions',
      'At least 30% of earners stack micro-credentials into a larger credential',
      'Digital badges include competency metadata in Open Badges format',
      'Earners report the micro-credential was worth the time and cost investment'
    ],
    common_pitfalls: [
      'Creating "attendance badges" that verify nothing except showing up',
      'Not validating employer demand before designing micro-credentials',
      'Over-designing: 100 micro-credentials nobody earns vs. 10 that everyone wants',
      'Not making stacking pathways clear (micro-credentials become credential litter)',
      'Pricing too low to be sustainable or too high for the value delivered'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['micro-credential', 'noncredit'],
    institution_types: ['community_college', 'technical_college', '4yr_public'],
    source_url: 'https://upcea.edu/micro-credentials/',
    source_document: 'UPCEA Hallmarks of Excellence in Online Leadership — Micro-Credentials',
    publication_year: 2020,
    last_updated_year: 2024,
    when_to_use: 'Use when advising on micro-credential strategy, upskilling programs for incumbent workers, or quick-response training for emerging industry needs. Relevant for any CE program looking at digital badges.',
    citation_text: 'UPCEA, AACRAO, and Quality Matters, "Micro-Credential Design Principles and Best Practices."',
    tags: ['micro-credentials', 'digital-badges', 'upskilling', 'short-term', 'incumbent-worker'],
    related_frameworks: ['Credential Transparency Description Language', 'Stackable Credentials Design Framework', 'C-BEN Quality Framework'],
  },

  {
    framework_name: 'Perkins V Comprehensive Local Needs Assessment',
    short_name: 'Perkins V CLNA',
    version: 'Perkins V (2018)',
    framework_type: 'assessment',
    category: 'k12_cte',
    organization: 'U.S. Department of Education',
    organization_type: 'federal',
    summary: `The Perkins V Comprehensive Local Needs Assessment (CLNA) is a required analysis that secondary and postsecondary CTE providers must complete to receive federal Perkins funding. The CLNA examines six elements: student performance, labor market alignment, program size/scope/quality, progress toward equity, educator preparation, and work-based learning. For community colleges, the CLNA is both a compliance requirement and a powerful tool for data-driven program improvement. Programs identified as underperforming in the CLNA must have improvement plans, and new programs must demonstrate alignment with CLNA findings to receive Perkins support.`,
    key_principles: [
      'Element 1 — Student Performance: Analyze disaggregated performance on Perkins core indicators (concentration, completion, placement, non-traditional)',
      'Element 2 — Labor Market Alignment: Programs must align with in-demand, high-skill, high-wage occupations',
      'Element 3 — Size, Scope, Quality: Programs must be of sufficient size, scope, and quality to be effective',
      'Element 4 — Progress Toward Equity: Identify and address performance gaps for special populations',
      'Element 5 — Educator Recruitment, Retention, Training: CTE instructors have industry experience and professional development',
      'Element 6 — Work-Based Learning: Access to work-based learning is available to all CTE students',
      'CLNA must be completed every 2 years with stakeholder input',
      'Findings drive the local application for Perkins funds (spend must align with CLNA results)'
    ],
    implementation_steps: [
      'Assemble CLNA team: CTE faculty, counselors, workforce partners, employer representatives, students',
      'Collect and disaggregate performance data for all CTE programs',
      'Analyze labor market data to validate program alignment with in-demand occupations',
      'Evaluate each program for size (enrollment), scope (breadth), and quality (outcomes)',
      'Identify performance gaps for special populations (gender, race, disability, economically disadvantaged)',
      'Survey CTE instructors on professional development needs and industry currency',
      'Assess availability and quality of work-based learning opportunities across programs',
      'Prioritize findings and develop action plans with measurable goals',
      'Align Perkins spending with CLNA priorities'
    ],
    quality_indicators: [
      'CLNA findings directly inform Perkins spending decisions',
      'Programs not meeting performance targets have documented improvement plans',
      'Labor market data is current (within 2 years) and specific to the service area',
      'Special population performance gaps are narrowing year-over-year',
      'Stakeholder input includes actual employers, not just advisory committee members'
    ],
    common_pitfalls: [
      'Treating CLNA as a compliance exercise instead of a genuine improvement tool',
      'Using national labor market data instead of regional/local data',
      'Not disaggregating data by special populations (hides equity gaps)',
      'Completing CLNA without meaningful employer or student input',
      'Not connecting CLNA findings to resource allocation decisions'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['certificate', 'degree'],
    institution_types: ['community_college', 'technical_college'],
    source_url: 'https://perkins.ed.gov/',
    source_document: 'Strengthening Career and Technical Education for the 21st Century Act (Perkins V), P.L. 115-224',
    publication_year: 2018,
    last_updated_year: 2023,
    when_to_use: 'Use when advising on CTE program review, Perkins funding strategy, or new program development at institutions receiving Perkins funds. CLNA findings should be referenced in program feasibility studies.',
    citation_text: 'U.S. Department of Education, "Strengthening Career and Technical Education for the 21st Century Act (Perkins V)," P.L. 115-224, 2018.',
    tags: ['Perkins', 'CTE', 'needs-assessment', 'funding', 'equity', 'program-review'],
    related_frameworks: ['WIOA Training Design Requirements', 'Aspen Prize Criteria'],
  },

  {
    framework_name: 'Noncredit-to-Credit Articulation Best Practices',
    short_name: 'Noncredit-to-Credit Articulation',
    version: null,
    framework_type: 'program_design',
    category: 'continuing_education',
    organization: 'AACC / NCCET / State CE Associations',
    organization_type: 'consortium',
    summary: `Noncredit-to-credit articulation is the process of awarding academic credit for learning achieved in noncredit continuing education programs. This is one of the most critical — and most poorly executed — processes in community college operations. When done well, it creates seamless pathways for adult learners to advance from workforce training into degree programs without repeating content. When done poorly (or not at all), it creates a "two-door problem" where noncredit and credit exist as separate silos. This framework captures the operational best practices for building and maintaining effective noncredit-to-credit articulation.`,
    key_principles: [
      'Learning outcomes, not courses, are the unit of articulation (map noncredit outcomes to credit competencies)',
      'Articulation agreements must be formal, documented, and approved through institutional governance',
      'Faculty from both noncredit and credit must participate in developing articulation pathways',
      'Assessment standards for noncredit programs must meet the same rigor as credit programs',
      'Articulated credit appears on the academic transcript (not just an internal note)',
      'Students are informed of articulation options at noncredit enrollment (not after completion)',
      'Articulation pathways are reviewed and updated regularly (at least every 3 years)',
      'Financial aid implications are clearly communicated (noncredit typically not aid-eligible; credit is)',
      'Institutional data systems must be able to track students across noncredit and credit enrollment'
    ],
    implementation_steps: [
      'Inventory all noncredit programs and identify those with potential credit equivalency',
      'Map noncredit program learning outcomes to credit course learning outcomes',
      'Identify gaps: what additional learning is needed for full credit equivalency',
      'Develop articulation agreements through shared governance (credit faculty must approve)',
      'Create bridge modules for any gaps between noncredit and credit requirements',
      'Build tracking system to follow students from noncredit into credit enrollment',
      'Train noncredit advisors to discuss credit pathway options at enrollment',
      'Market articulation pathways to current noncredit students and employers',
      'Report on articulation volume and success rates annually',
      'Include articulation review in regular program review cycles'
    ],
    quality_indicators: [
      'At least 50% of noncredit workforce programs have formal articulation to credit',
      'At least 15% of noncredit completers use articulation to enroll in credit programs',
      'Students who articulate complete credit credentials at comparable rates to direct-entry credit students',
      'Articulation is documented in the college catalog and on the noncredit program webpage',
      'Data system can track a student from noncredit enrollment through credit completion'
    ],
    common_pitfalls: [
      'Credit faculty refusing to articulate because they don\'t trust noncredit quality (build trust through co-design)',
      'Creating articulation agreements that nobody uses because students don\'t know about them',
      'Not investing in a data system that crosses the noncredit/credit divide',
      'Articulating entire courses 1:1 instead of mapping competencies (too rigid)',
      'Letting articulation agreements go stale — industry and curriculum both change'
    ],
    applicable_sectors: ['all'],
    applicable_program_types: ['noncredit', 'certificate'],
    institution_types: ['community_college', 'technical_college'],
    source_url: 'https://www.aacc.nche.edu/',
    source_document: 'AACC / NCCET Noncredit-to-Credit Articulation Best Practices',
    publication_year: 2019,
    last_updated_year: 2023,
    when_to_use: 'Use in every context involving noncredit program design. Articulation should be designed INTO the program from the start, not added as an afterthought. Essential for Pathway Builder product.',
    citation_text: 'American Association of Community Colleges (AACC), "Noncredit-to-Credit Articulation Best Practices."',
    tags: ['articulation', 'noncredit-to-credit', 'pathways', 'adult-learners', 'stackable'],
    related_frameworks: ['Stackable Credentials Design Framework', 'CAEL Standards for PLA', 'Guided Pathways Framework'],
  },
];

async function main() {
  console.log(`=== Seeding ${FRAMEWORKS.length} frameworks ===\n`);

  // Clear existing
  const { error: delErr } = await supabase.from('intel_frameworks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) console.error('Delete error:', delErr.message);

  let inserted = 0;
  for (const fw of FRAMEWORKS) {
    const { error } = await supabase.from('intel_frameworks').insert(fw);
    if (error) {
      console.error(`✗ ${fw.short_name}: ${error.message}`);
    } else {
      console.log(`✓ ${fw.short_name}`);
      inserted++;
    }
  }

  console.log(`\n=== ${inserted}/${FRAMEWORKS.length} frameworks seeded ===`);

  // Update freshness
  const { error: freshErr } = await supabase.from('intel_data_freshness').upsert({
    table_name: 'intel_frameworks',
    dataset_label: 'Frameworks & Best Practices Library',
    source_name: 'Curated from DOL, C-BEN, Lumina, CAEL, NIST, QM, ACUE, AACC, NGA, WIOA, Aspen',
    source_url: 'https://www.careeronestop.org/CompetencyModel/',
    data_period: 'Current (multi-year sources)',
    last_refreshed_at: new Date().toISOString(),
    refreshed_by: 'seed-frameworks.mjs',
    records_loaded: inserted,
    refresh_method: 'manual_curation',
    citation_text: 'Wavelength Verified Intelligence Layer — Curated Frameworks Library',
    citation_url: 'https://withwavelength.com',
    coverage_notes: `${inserted} frameworks across CBE, competency models, program design, employer partnerships, quality standards, training design, adult learning, and credential frameworks.`,
    known_limitations: 'Curated summaries, not full-text documents. Framework content is synthesized for agent reference. Source documents should be consulted for implementation details.',
    is_stale: false,
  }, { onConflict: 'table_name' });

  if (freshErr) console.error('Freshness error:', freshErr.message);
  else console.log('Freshness updated ✓');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
