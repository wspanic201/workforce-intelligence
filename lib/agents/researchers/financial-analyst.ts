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

    const prompt = `${persona.fullContext}

TASK: Develop financial projections and ROI analysis for a workforce program.

PROGRAM DETAILS:
- Program Name: ${project.program_name}
- Program Type: ${project.program_type || 'Not specified'}
- Target Audience: ${project.target_audience || 'Not specified'}
- Client: ${project.client_name}
${project.constraints ? `- Constraints: ${project.constraints}` : ''}

FINANCIAL ANALYSIS REQUIRED:
1. Startup costs (curriculum, equipment, marketing, training, accreditation)
2. Annual operating costs (faculty, facilities, maintenance, overhead)
3. Revenue projections (years 1-3, with enrollment assumptions)
4. Break-even analysis
5. 3-year ROI projection
6. Potential funding sources (grants, partnerships)
7. Financial risks

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

Respond with valid JSON wrapped in \`\`\`json code blocks.`;

    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 8000,
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
