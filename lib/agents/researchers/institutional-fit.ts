import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { PROGRAM_VALIDATOR_SYSTEM_PROMPT } from '@/lib/prompts/program-validator';

export interface InstitutionalFitData {
  score: number;
  scoreRationale: string;
  faculty: {
    availability: 'available' | 'recruitable' | 'scarce';
    qualificationsNeeded: string[];
    estimatedFTE: number;
    recruitmentStrategy: string;
  };
  facilities: {
    adequacy: 'adequate' | 'minor_investment' | 'major_investment';
    existingResources: string[];
    gapsIdentified: string[];
    estimatedInvestment: string;
  };
  technology: {
    readiness: 'ready' | 'upgrades_needed' | 'significant_gaps';
    existingPlatforms: string[];
    additionalNeeds: string[];
  };
  supportServices: {
    advising: string;
    careerServices: string;
    tutoring: string;
    gaps: string[];
  };
  strategicAlignment: {
    missionFit: 'strong' | 'moderate' | 'weak';
    strategicPlanAlignment: string;
    portfolioFit: 'complement' | 'overlap' | 'cannibalize';
    stackablePathways: string[];
  };
  accreditation: {
    approvalRequired: boolean;
    approvalType: string;
    estimatedTimeline: string;
    requirements: string[];
  };
  organizationalCapacity: {
    assessment: string;
    constraints: string[];
    readinessLevel: 'high' | 'moderate' | 'low';
  };
  dataSources: string[];
  markdownReport: string;
  // Program competencies — what graduates can do on day one
  graduate_competencies?: string[];
  learning_outcomes?: string[];
}

export async function runInstitutionalFit(
  projectId: string,
  project: ValidationProject
): Promise<{ data: InstitutionalFitData; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    console.log(`[Institutional Fit] Starting for "${project.program_name}"`);

    // Get shared verified intelligence context
    const verifiedIntelBlock = (project as any)._intelContext?.promptBlock || '';

    const prompt = `${PROGRAM_VALIDATOR_SYSTEM_PROMPT}

ROLE: You are conducting Stage 5 — Institutional Fit & Capacity Assessment.

PROGRAM DETAILS:
- Program Name: ${project.program_name}
- Program Type: ${project.program_type || 'Not specified'}
- Target Audience: ${project.target_audience || 'Not specified'}
- Institution: ${project.client_name}
${project.constraints ? `- Constraints: ${project.constraints}` : ''}
${(project as any).institutional_capacity ? `- Known Capacity: ${(project as any).institutional_capacity}` : ''}
${(project as any).delivery_format ? `- Delivery Format: ${(project as any).delivery_format}` : ''}
${(project as any).strategic_context ? `- Strategic Context: ${(project as any).strategic_context}` : ''}

${verifiedIntelBlock ? `VERIFIED BASELINE DATA (confirmed from government sources — treat as established fact):
${verifiedIntelBlock}` : ''}

Your job is NOT to restate data or produce tables. The baseline data is confirmed.
Your job is analysis:
- Can Kirkwood execute this program with current infrastructure and staffing?
- What operational gaps must close for Year 1 success?
- What are the make-or-break execution risks in faculty, facilities, support, and governance?
- What should graduates be able to DO on day one, and what does that imply for delivery?

OUTPUT FORMAT (JSON):
{
  "score": <1-10>,
  "scoreRationale": "600-900 word narrative analysis in paragraph form",
  "faculty": {
    "availability": "available|recruitable|scarce",
    "qualificationsNeeded": ["Qual 1"],
    "estimatedFTE": <number>,
    "recruitmentStrategy": "Strategy"
  },
  "facilities": {
    "adequacy": "adequate|minor_investment|major_investment",
    "existingResources": ["Resource 1"],
    "gapsIdentified": ["Gap 1"],
    "estimatedInvestment": "$X,XXX"
  },
  "technology": {
    "readiness": "ready|upgrades_needed|significant_gaps",
    "existingPlatforms": ["Platform 1"],
    "additionalNeeds": ["Need 1"]
  },
  "supportServices": {
    "advising": "Assessment",
    "careerServices": "Assessment",
    "tutoring": "Assessment",
    "gaps": ["Gap 1"]
  },
  "strategicAlignment": {
    "missionFit": "strong|moderate|weak",
    "strategicPlanAlignment": "Description",
    "portfolioFit": "complement|overlap|cannibalize",
    "stackablePathways": ["Pathway 1"]
  },
  "accreditation": {
    "approvalRequired": true,
    "approvalType": "Type",
    "estimatedTimeline": "X months",
    "requirements": ["Req 1"]
  },
  "organizationalCapacity": {
    "assessment": "Overall assessment",
    "constraints": ["Constraint 1"],
    "readinessLevel": "high|moderate|low"
  },
  "dataSources": ["Source 1"],
  "graduate_competencies": [
    "What a graduate can DO on day one — specific and measurable job performance capability",
    "Example: Accurately process 50+ prescription orders per shift using standard pharmacy software"
  ],
  "learning_outcomes": [
    "Academic outcome 1 — measurable",
    "Academic outcome 2"
  ]
}

OUTPUT RULES:
- 600-900 words in scoreRationale
- NO markdown tables
- NO bullet-point list of repeated statistics
- YES direct references to baseline evidence and operational implications
- Keep supporting fields concise and decision-oriented
- REQUIRED: Include graduate_competencies as specific day-one performance capabilities

IMPORTANT: Return ONLY valid JSON. No markdown outside JSON. Keep string values concise. Do NOT include a markdownReport field.`;

    const { content, tokensUsed } = await callClaude(prompt, { maxTokens: 5000 });
    const data = extractJSON(content) as InstitutionalFitData;

    if (!data.markdownReport) {
      data.markdownReport = formatInstitutionalFit(data, project);
    }

    const markdown = data.markdownReport;
    const duration = Date.now() - startTime;

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'institutional-fit',
      persona: 'institutional-fit-analyst',
      prompt: prompt.substring(0, 5000),
      response: content.substring(0, 10000),
      tokens_used: tokensUsed,
      duration_ms: duration,
      status: 'success',
    });

    console.log(`[Institutional Fit] Completed in ${duration}ms, score: ${data.score}/10`);
    return { data, markdown };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Institutional Fit] Error:', error);

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'institutional-fit',
      persona: 'institutional-fit-analyst',
      duration_ms: duration,
      status: 'error',
      error_message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

function formatInstitutionalFit(data: InstitutionalFitData, project: ValidationProject): string {
  return `# Institutional Fit & Capacity: ${project.program_name}

## Dimension Score: ${data.score}/10
**Rationale:** ${data.scoreRationale}

## Faculty Assessment
- **Availability:** ${data.faculty.availability}
- **Estimated FTE:** ${data.faculty.estimatedFTE}
- **Qualifications Needed:** ${data.faculty.qualificationsNeeded.join(', ')}
- **Recruitment Strategy:** ${data.faculty.recruitmentStrategy}

## Facilities & Equipment
- **Adequacy:** ${data.facilities.adequacy}
- **Existing Resources:** ${data.facilities.existingResources.join(', ')}
- **Gaps:** ${data.facilities.gapsIdentified.join(', ')}
- **Estimated Investment:** ${data.facilities.estimatedInvestment}

## Technology Infrastructure
- **Readiness:** ${data.technology.readiness}
- **Existing:** ${data.technology.existingPlatforms.join(', ')}
- **Needs:** ${data.technology.additionalNeeds.join(', ')}

## Support Services
- **Advising:** ${data.supportServices.advising}
- **Career Services:** ${data.supportServices.careerServices}
- **Tutoring:** ${data.supportServices.tutoring}
${data.supportServices.gaps.length > 0 ? `- **Gaps:** ${data.supportServices.gaps.join(', ')}` : ''}

## Strategic Alignment
- **Mission Fit:** ${data.strategicAlignment.missionFit}
- **Strategic Plan:** ${data.strategicAlignment.strategicPlanAlignment}
- **Portfolio Fit:** ${data.strategicAlignment.portfolioFit}
- **Stackable Pathways:** ${data.strategicAlignment.stackablePathways.join(', ')}

## Accreditation
- **Approval Required:** ${data.accreditation.approvalRequired ? 'Yes' : 'No'}
- **Type:** ${data.accreditation.approvalType}
- **Timeline:** ${data.accreditation.estimatedTimeline}
- **Requirements:** ${data.accreditation.requirements.join('; ')}

## Organizational Capacity
- **Readiness:** ${data.organizationalCapacity.readinessLevel}
- **Assessment:** ${data.organizationalCapacity.assessment}
- **Constraints:** ${data.organizationalCapacity.constraints.join('; ')}

---
**Data Sources:** ${data.dataSources.join('; ')}
`;
}
