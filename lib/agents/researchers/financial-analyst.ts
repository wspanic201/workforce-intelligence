import { loadPersona } from '@/lib/confluence-labs/loader';
import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export interface FinancialProjectionsData {
  score: number;
  scoreRationale: string;
  startup_costs: {
    curriculum_development: number;
    equipment_labs: number;
    marketing_launch: number;
    faculty_training: number;
    accreditation_fees: number;
    other: number;
    total: number;
  };
  annual_operating_costs: {
    faculty_salaries: number;
    adjunct_instructors: number;
    equipment_maintenance: number;
    software_licenses: number;
    marketing: number;
    administrative_overhead: number;
    total: number;
  };
  revenue_projections: {
    year1: { enrollment: number; tuition_per_student: number; total_revenue: number };
    year2: { enrollment: number; tuition_per_student: number; total_revenue: number };
    year3: { enrollment: number; tuition_per_student: number; total_revenue: number };
  };
  break_even_analysis: {
    break_even_enrollment: number;
    break_even_timeline: string;
  };
  roi_analysis: {
    three_year_net: number;
    roi_percentage: string;
    assumptions: string[];
  };
  funding_sources: string[];
  risks: string[];
  recommendations: string[];
}

export async function runFinancialAnalysis(
  projectId: string,
  project: ValidationProject
): Promise<{ data: FinancialProjectionsData; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    const persona = await loadPersona('cfo');

    // Read shared MCP intel (fetched once by orchestrator)


    const mcpIntelBlock: string = (project as any)._mcpIntelBlock || '';


    const prompt = `${persona.fullContext}

═══════════════════════════════════════════════════════════
⚠️ MANDATORY: NO CLARIFYING QUESTIONS ALLOWED ⚠️
═══════════════════════════════════════════════════════════

You are a CFO consultant hired for $7,500 to deliver financial projections. You WILL NOT:
- Ask for more data
- Request clarifications
- Say you cannot estimate
- Provide options or ask what the client prefers

You WILL:
- Make reasonable estimates based on the baseline ranges provided below
- Deliver specific dollar amounts in all fields
- Use your expertise to fill gaps with industry-standard assumptions
- Return ONLY the JSON output requested (no preamble, no questions)

This is what the client paid for. Deliver it.

═══════════════════════════════════════════════════════════

TASK: Develop financial projections and ROI analysis for a workforce program.

PROGRAM DETAILS:
- Program Name: ${project.program_name}
- Program Type: ${project.program_type || 'Not specified'}
- Target Audience: ${project.target_audience || 'Not specified'}
- Client: ${project.client_name}
${project.constraints ? `- Constraints: ${project.constraints}` : ''}

**BASELINE COST RANGES (Community College Workforce Programs):**
- Curriculum development: $15,000-$35,000 (150-350 hours @ $100/hr)
- Equipment/lab setup: $10,000-$50,000 (depends on field—healthcare higher, business lower)
- Marketing launch: $8,000-$20,000 (6-month campaign)
- Faculty training: $3,000-$8,000 (onboarding + professional development)
- Accreditation fees: $2,000-$15,000 (if pursuing specialized accreditation)
- Faculty salaries: $55,000-$75,000 loaded for lead instructor
- Adjunct: $800-$1,200 per credit hour
- Program tuition: $3,000-$6,500 for 6-12 month certificate
- Typical enrollment: 12-20 students per cohort (conservative launch)

Use these as baselines and adjust based on program specifics. Provide SPECIFIC NUMBERS in all fields—no ranges, no "TBD", no requests for more data.

Provide a COMPREHENSIVE financial analysis of 2,500-3,500 words with detailed modeling.

## 1. DETAILED STARTUP COSTS (Line-Item Breakdown)

### Curriculum Development ($X,XXX)
- Course design and development (hours × rate)
- Learning management system setup
- Instructional materials creation (textbooks, handouts, online resources)
- Curriculum review and approval process
- Advisory committee formation costs

### Equipment & Lab Setup ($X,XXX)
- Specific equipment list with costs (e.g., pharmacy software licenses, counting trays, pill dispensers)
- Lab furniture and fixtures
- Safety equipment and supplies
- Technology (computers, printers, barcode scanners)
- Initial inventory of practice materials

### Marketing & Launch Campaign ($X,XXX)
- Website development/updates
- Digital advertising (Google Ads, Facebook, 6-month budget)
- Print materials (brochures, posters, program one-pagers)
- Open house events and information sessions
- Public relations and media outreach

### Faculty & Staff Training ($X,XXX)
- Instructor onboarding and professional development
- Clinical site coordinator training
- Staff time for program setup (hours × loaded rate)

### Accreditation & Regulatory Fees ($X,XXX)
- State board of pharmacy application and approval
- Professional association memberships
- Accreditation application fees (if pursuing ASHP/ACPE)
- Legal review and compliance costs

### Other Startup Costs ($X,XXX)
- Contingency (10-15% of total)
- Miscellaneous supplies and setup

**TOTAL STARTUP INVESTMENT:** $XXX,XXX

## 2. ANNUAL OPERATING COSTS (3-Year Projection)

### Faculty & Instructional Costs
**Year 1:** $XX,XXX
- Lead instructor (1.0 FTE @ $XX,XXX loaded)
- Adjunct instructors (X credit hours @ $XXX/credit hour)
- Clinical coordinator (0.25 FTE @ $XX,XXX loaded)
- Professional development ($X,XXX annually)

**Year 2:** $XX,XXX (adjustments for second cohort, wage increases)
**Year 3:** $XX,XXX

### Marketing & Recruitment
**Year 1:** $XX,XXX (launch campaign)
**Year 2:** $XX,XXX (ongoing marketing)
**Year 3:** $XX,XXX (reduced as word-of-mouth builds)
- Digital advertising budget
- Event participation (career fairs, health expo)
- Content marketing and social media
- Email marketing and CRM tools

### Equipment Maintenance & Supplies
**Year 1-3:** $X,XXX annually
- Software license renewals
- Equipment repairs and replacement
- Practice materials and consumables
- Technology refresh

### Administrative Overhead
**Year 1-3:** $XX,XXX annually
- Advising and student services (0.15 FTE)
- Registration and records management
- Facilities cost allocation
- General institutional overhead

**TOTAL OPERATING COSTS:**
- Year 1: $XXX,XXX
- Year 2: $XXX,XXX
- Year 3: $XXX,XXX

## 3. REVENUE PROJECTIONS (3-Year Model with Scenarios)

### BASE CASE SCENARIO (Conservative)

**Year 1:**
- Enrollment: XX students (X cohorts)
- Tuition per student: $X,XXX
- Tuition revenue: $XX,XXX
- Grant funding: $XX,XXX (Perkins V, WIOA)
- Total revenue: $XX,XXX

**Year 2:**
- Enrollment: XX students (enrollment growth based on demand)
- Tuition revenue: $XX,XXX
- Grant funding: $XX,XXX
- Total revenue: $XX,XXX

**Year 3:**
- Enrollment: XX students (steady state)
- Tuition revenue: $XX,XXX
- Grant funding: $XX,XXX
- Total revenue: $XX,XXX

### OPTIMISTIC SCENARIO (+20% Enrollment)
[Repeat structure with higher enrollment assumptions]

### PESSIMISTIC SCENARIO (-20% Enrollment)
[Repeat structure with lower enrollment assumptions]

## 4. BREAK-EVEN ANALYSIS

### Break-Even Enrollment per Cohort
- Fixed costs per cohort: $XX,XXX
- Variable cost per student: $X,XXX
- Tuition revenue per student: $X,XXX
- **Break-even enrollment:** XX students per cohort

### Break-Even Timeline
**Base case:** 
- Cumulative cash flow by month (show when positive)
- Break-even month: Month XX (late Year 2)

**Sensitivity analysis:**
- If Year 1 enrollment is 12 vs 15: Break-even extends to Month XX
- If startup costs increase 20%: Break-even extends to Month XX
- If clinical sites charge fees: Break-even extends to Month XX

### Monthly Cash Flow Model (36 months)
[Provide table showing cumulative position: Month 1: -$XX,XXX, Month 12: -$XX,XXX, etc.]

## 5. ROI ANALYSIS & FINANCIAL METRICS

### 3-Year Net Present Value
- Total investment (startup + 3-year operating): $XXX,XXX
- Total revenue (3 years): $XXX,XXX
- Net profit/loss after 3 years: $XX,XXX or ($XX,XXX)
- ROI: XX% over 3 years

### 5-Year Projection (if program continues)
- Year 4-5 enrollment assumptions
- Reduced marketing costs, stable operations
- 5-year cumulative net: $XXX,XXX
- 5-year ROI: XX%

### Assumptions & Sensitivities
List all key assumptions:
1. Enrollment ramp: Year 1 (XX), Year 2 (XX), Year 3 (XX)
2. Tuition held constant at $X,XXX (no increases)
3. Clinical sites provide placements at no cost
4. Grant funding secured: $XX,XXX annually
5. Instructor recruited at $XX,XXX loaded
6. [Additional assumptions]

**What-if scenarios:**
- What if enrollment misses by 20%? → ROI drops to XX%
- What if we can't secure grants? → Break-even extends XX months
- What if clinical sites charge $X,XXX per student? → Annual cost increases $XX,XXX

## 6. GRANT FUNDING & EXTERNAL REVENUE

### Specific Grant Opportunities
**Perkins V (Career and Technical Education):**
- Eligibility: Yes (workforce credential program)
- Estimated funding: $XX,XXX - $XX,XXX annually
- Application timeline: Due annually in [month]
- Success probability: Medium-High (based on institutional Perkins history)

**WIOA (Workforce Innovation and Opportunity Act):**
- Eligibility: Yes (eligible training provider list)
- Per-student funding: $X,XXX - $X,XXX (covers tuition + fees)
- Estimated students qualifying: XX-XX per year

**State Workforce Development Grants:**
[List specific state opportunities]

**Employer Partnership Funding:**
- Tuition reimbursement from healthcare employers (e.g., UnityPoint, Mercy)
- Contract training revenue (customized cohorts for single employer)
- Equipment donations (pharmacy software, practice supplies)

### Grant Strategy & Impact on ROI
- If $XX,XXX in grants secured: ROI improves from XX% to XX%
- Grant funding should cover XX% of startup costs
- Critical to apply for Perkins V in first year

## 7. STUDENT FINANCIAL ANALYSIS

### Total Cost of Attendance (Student Perspective)
- Tuition: $X,XXX
- Fees: $XXX
- Books & supplies: $XXX
- Clinical supplies (scrubs, name tag, supplies): $XXX
- **Total:** $X,XXX

### Financial Aid Availability
- Pell Grant eligible? Yes/No
- State grant programs: [List with amounts]
- Institutional scholarships: $XXX - $X,XXX available
- Employer tuition reimbursement: Common in healthcare

### Student ROI Calculation
- Total investment: $X,XXX (tuition + fees + books + opportunity cost)
- Starting wage: $XX,XXX annually ($XX/hour × 2,080 hours)
- Payback period: X.X years (assuming full-time employment)
- 10-year earnings boost: $XXX,XXX (vs. no credential)
- **Student ROI:** XXX% over 10 years

### Affordability Comparison
- Our program: $X,XXX
- Competitor A (DMACC): $X,XXX
- Competitor B (Hawkeye): $X,XXX
- Online programs: $X,XXX - $X,XXX
- **Our positioning:** [More/Less/Comparable] expensive, justified by [differentiators]

## 8. FINANCIAL RISKS & MITIGATION

### Risk 1: Enrollment Shortfall
**Impact:** If Year 1 enrolls 10 vs. 15 students, revenue drops $XX,XXX and cumulative loss reaches ($XXX,XXX)
**Mitigation:**
- Pre-launch employer partnerships guaranteeing X enrollments
- $XX,XXX contingency marketing budget for mid-year push
- Part-time cohort option to capture working adults if full-time undersells

### Risk 2: Clinical Site Costs
**Impact:** If sites charge $X,XXX per student, annual costs increase $XX,XXX and break-even extends XX months
**Mitigation:**
- Secure signed MOUs with zero-cost guarantee before launch
- Develop 10+ site relationships (redundancy if 2-3 drop out)
- Negotiate multi-year commitments

### Risk 3: Grant Funding Rejection
**Impact:** Loss of $XX,XXX revenue, ROI drops from XX% to XX%
**Mitigation:**
- Apply for multiple grants (Perkins, WIOA, state workforce)
- Employer partnerships to offset (contract training revenue)
- Modest tuition increase ($X,XXX → $X,XXX) if grants unavailable

### Risk 4: Instructor Recruitment/Retention Failure
**Impact:** Cannot launch or must suspend program if instructor leaves
**Mitigation:**
- Early recruitment (6+ months before launch)
- Competitive compensation ($XX,XXX at top of range)
- Adjunct pool backup (3 part-time instructors can cover if lead departs)
- Retention bonuses ($X,XXX after Year 2, $X,XXX after Year 3)

### Risk 5: Market Saturation / Competition
**Impact:** Enrollment stagnates at XX students vs. projected XX, revenue shortfall
**Mitigation:**
- Clear differentiation (evening options, Spanish-language, employer partnerships)
- Geographic exclusivity within XX-mile radius
- Pre-enrollment pipeline (high school CTE partnerships)

SCORING: Rate financial viability 1-10.
8-10 = Strong ROI, breaks even within 2 years, low risk
5-7 = Moderate viability, breaks even within 3 years, manageable risk
1-4 = Weak ROI, high startup costs relative to revenue, significant risk

OUTPUT FORMAT (JSON):
{
  "score": 6,
  "scoreRationale": "Brief explanation of financial viability score",
  "startup_costs": {
    "curriculum_development": 0,
    "equipment_labs": 0,
    "marketing_launch": 0,
    "faculty_training": 0,
    "accreditation_fees": 0,
    "other": 0,
    "total": 0
  },
  "annual_operating_costs": {
    "faculty_salaries": 0,
    "adjunct_instructors": 0,
    "equipment_maintenance": 0,
    "software_licenses": 0,
    "marketing": 0,
    "administrative_overhead": 0,
    "total": 0
  },
  "revenue_projections": {
    "year1": { "enrollment": 0, "tuition_per_student": 0, "total_revenue": 0 },
    "year2": { "enrollment": 0, "tuition_per_student": 0, "total_revenue": 0 },
    "year3": { "enrollment": 0, "tuition_per_student": 0, "total_revenue": 0 }
  },
  "break_even_analysis": {
    "break_even_enrollment": 0,
    "break_even_timeline": "X months/years"
  },
  "roi_analysis": {
    "three_year_net": 0,
    "roi_percentage": "X%",
    "assumptions": ["Assumption 1", "Assumption 2"]
  },
  "funding_sources": ["Source 1", "Source 2"],
  "risks": ["Risk 1", "Risk 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

CRITICAL REQUIREMENTS:
- Use realistic cost estimates for community college context
- Base tuition on typical community college rates for the region
- Consider both credit and noncredit pricing models
- Include conservative and optimistic enrollment scenarios
- Identify relevant grant opportunities (NSF, DOL, etc.)
- Be honest about financial viability

═══════════════════════════════════════════════════════════
FINAL INSTRUCTION: 
Your response must be ONLY the JSON object shown above, wrapped in \`\`\`json code blocks.
NO preamble, NO explanations, NO questions. Just the JSON.

If you ask ANY clarifying questions or say you cannot estimate, you have failed this engagement.
═══════════════════════════════════════════════════════════

Respond NOW with the JSON:`;

    const { content, tokensUsed } = await callClaude(mcpIntelBlock ? mcpIntelBlock + "\n\n" + prompt : prompt, {
      maxTokens: 4000,  // 4k ≈ 1,500 words — balanced depth vs API speed
    });

    const data = extractJSON(content) as FinancialProjectionsData;
    const markdown = formatFinancialAnalysis(data, project);

    const duration = Date.now() - startTime;
    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'financial-analyst',
      persona: 'cfo',
      prompt: prompt.substring(0, 5000),
      response: content.substring(0, 10000),
      tokens_used: tokensUsed,
      duration_ms: duration,
      status: 'success',
    });

    return { data, markdown };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Financial analysis error:', error);

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'financial-analyst',
      persona: 'cfo',
      duration_ms: duration,
      status: 'error',
      error_message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

function $(val: any): string {
  if (val == null) return 'N/A';
  if (typeof val === 'number') return val.toLocaleString();
  return String(val);
}
function $$(arr: any[]): any[] { return Array.isArray(arr) ? arr : []; }

function formatFinancialAnalysis(data: FinancialProjectionsData, project: ValidationProject): string {
  if (!data) return `# Financial Analysis: ${project.program_name}\n\nFinancial data unavailable.`;
  const sc = data.startup_costs || {} as any;
  const oc = data.annual_operating_costs || {} as any;
  const rp = data.revenue_projections || {} as any;
  const be = data.break_even_analysis || {} as any;
  const roi = data.roi_analysis || {} as any;

  return `# Financial Analysis: ${project.program_name}

## Startup Costs

| Category | Amount |
|----------|--------|
| Curriculum Development | $${$(sc.curriculum_development)} |
| Equipment & Labs | $${$(sc.equipment_labs)} |
| Marketing & Launch | $${$(sc.marketing_launch)} |
| Faculty Training | $${$(sc.faculty_training)} |
| Accreditation Fees | $${$(sc.accreditation_fees)} |
| Other | $${$(sc.other)} |
| **TOTAL** | **$${$(sc.total)}** |

## Annual Operating Costs

| Category | Amount |
|----------|--------|
| Faculty Salaries | $${$(oc.faculty_salaries)} |
| Adjunct Instructors | $${$(oc.adjunct_instructors)} |
| Equipment Maintenance | $${$(oc.equipment_maintenance)} |
| Software Licenses | $${$(oc.software_licenses)} |
| Marketing | $${$(oc.marketing)} |
| Administrative Overhead | $${$(oc.administrative_overhead)} |
| **TOTAL** | **$${$(oc.total)}** |

## Revenue Projections

| Year | Enrollment | Tuition/Student | Total Revenue |
|------|-----------|----------------|---------------|
| Year 1 | ${$(rp.year1?.enrollment)} | $${$(rp.year1?.tuition_per_student)} | $${$(rp.year1?.total_revenue)} |
| Year 2 | ${$(rp.year2?.enrollment)} | $${$(rp.year2?.tuition_per_student)} | $${$(rp.year2?.total_revenue)} |
| Year 3 | ${$(rp.year3?.enrollment)} | $${$(rp.year3?.tuition_per_student)} | $${$(rp.year3?.total_revenue)} |

## Break-Even Analysis

- **Break-Even Enrollment:** ${$(be.break_even_enrollment)} students
- **Break-Even Timeline:** ${$(be.break_even_timeline)}

## ROI Analysis

- **3-Year Net:** $${$(roi.three_year_net)}
- **ROI:** ${$(roi.roi_percentage)}

**Key Assumptions:**
${$$(roi.assumptions).map((a: string) => `- ${a}`).join('\n')}

## Potential Funding Sources

${$$(data.funding_sources).map((source: string) => `- ${source}`).join('\n')}

## Financial Risks

${$$(data.risks).map((risk: string) => `- ${risk}`).join('\n')}

## Financial Recommendations

${$$(data.recommendations).map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}

---
*These projections are estimates based on typical community college program economics.*
`;
}
