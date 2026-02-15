import { loadPersona } from '@/lib/confluence-labs/loader';
import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export interface FinancialProjectionsData {
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

OUTPUT FORMAT (JSON):
{
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
      maxTokens: 4000,
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

function formatFinancialAnalysis(data: FinancialProjectionsData, project: ValidationProject): string {
  return `# Financial Analysis: ${project.program_name}

## Startup Costs

| Category | Amount |
|----------|--------|
| Curriculum Development | $${data.startup_costs.curriculum_development.toLocaleString()} |
| Equipment & Labs | $${data.startup_costs.equipment_labs.toLocaleString()} |
| Marketing & Launch | $${data.startup_costs.marketing_launch.toLocaleString()} |
| Faculty Training | $${data.startup_costs.faculty_training.toLocaleString()} |
| Accreditation Fees | $${data.startup_costs.accreditation_fees.toLocaleString()} |
| Other | $${data.startup_costs.other.toLocaleString()} |
| **TOTAL** | **$${data.startup_costs.total.toLocaleString()}** |

## Annual Operating Costs

| Category | Amount |
|----------|--------|
| Faculty Salaries | $${data.annual_operating_costs.faculty_salaries.toLocaleString()} |
| Adjunct Instructors | $${data.annual_operating_costs.adjunct_instructors.toLocaleString()} |
| Equipment Maintenance | $${data.annual_operating_costs.equipment_maintenance.toLocaleString()} |
| Software Licenses | $${data.annual_operating_costs.software_licenses.toLocaleString()} |
| Marketing | $${data.annual_operating_costs.marketing.toLocaleString()} |
| Administrative Overhead | $${data.annual_operating_costs.administrative_overhead.toLocaleString()} |
| **TOTAL** | **$${data.annual_operating_costs.total.toLocaleString()}** |

## Revenue Projections

| Year | Enrollment | Tuition/Student | Total Revenue |
|------|-----------|----------------|---------------|
| Year 1 | ${data.revenue_projections.year1.enrollment} | $${data.revenue_projections.year1.tuition_per_student.toLocaleString()} | $${data.revenue_projections.year1.total_revenue.toLocaleString()} |
| Year 2 | ${data.revenue_projections.year2.enrollment} | $${data.revenue_projections.year2.tuition_per_student.toLocaleString()} | $${data.revenue_projections.year2.total_revenue.toLocaleString()} |
| Year 3 | ${data.revenue_projections.year3.enrollment} | $${data.revenue_projections.year3.tuition_per_student.toLocaleString()} | $${data.revenue_projections.year3.total_revenue.toLocaleString()} |

## Break-Even Analysis

- **Break-Even Enrollment:** ${data.break_even_analysis.break_even_enrollment} students
- **Break-Even Timeline:** ${data.break_even_analysis.break_even_timeline}

## ROI Analysis

- **3-Year Net:** $${data.roi_analysis.three_year_net.toLocaleString()}
- **ROI:** ${data.roi_analysis.roi_percentage}

**Key Assumptions:**
${data.roi_analysis.assumptions.map(a => `- ${a}`).join('\n')}

## Potential Funding Sources

${data.funding_sources.map(source => `- ${source}`).join('\n')}

## Financial Risks

${data.risks.map(risk => `- ${risk}`).join('\n')}

## Financial Recommendations

${data.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
*These projections are estimates based on typical community college program economics.*
`;
}
