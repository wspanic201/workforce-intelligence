import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { PROGRAM_VALIDATOR_SYSTEM_PROMPT } from '@/lib/prompts/program-validator';

export interface RegulatoryComplianceData {
  score: number;
  scoreRationale: string;
  stateApproval: {
    required: boolean;
    agency: string;
    process: string;
    estimatedTimeline: string;
    requirements: string[];
  };
  perkinsV: {
    aligned: boolean;
    eligibleCIP: string;
    fundingPotential: string;
    requirements: string[];
  };
  wioa: {
    aligned: boolean;
    etplEligible: boolean;
    targetPopulations: string[];
    fundingPotential: string;
  };
  industryCertifications: {
    certification: string;
    body: string;
    alignment: 'direct' | 'partial' | 'none';
    requirements: string;
  }[];
  accreditor: {
    body: string;
    expectations: string[];
    substantiveChange: boolean;
    timeline: string;
  };
  advisoryCommittee: {
    required: boolean;
    composition: string[];
    meetingFrequency: string;
  };
  articulationPotential: {
    receivingInstitutions: string[];
    creditTransferLikelihood: 'high' | 'moderate' | 'low';
    pathways: string[];
  };
  complianceTimeline: {
    milestone: string;
    estimatedDate: string;
    dependency: string;
  }[];
  dataSources: string[];
  markdownReport: string;
}

export async function runRegulatoryCompliance(
  projectId: string,
  project: ValidationProject
): Promise<{ data: RegulatoryComplianceData; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    console.log(`[Regulatory] Starting for "${project.program_name}"`);

    const prompt = `${PROGRAM_VALIDATOR_SYSTEM_PROMPT}

ROLE: You are conducting Stage 6 — Regulatory & Compliance Alignment Analysis.

PROGRAM DETAILS:
- Program Name: ${project.program_name}
- Program Type: ${project.program_type || 'Not specified'}
- Target Audience: ${project.target_audience || 'Not specified'}
- Institution: ${project.client_name}
- Geographic Area: ${(project as any).geographic_area || 'the specified region'}
${project.constraints ? `- Constraints: ${project.constraints}` : ''}
${(project as any).funding_sources ? `- Funding Sources: ${(project as any).funding_sources}` : ''}
${(project as any).stackable_credential ? `- Stackable Intent: Yes` : ''}

ANALYSIS REQUIRED:
1. State approval requirements (relevant state board of education)
2. Perkins V alignment — eligible CIP codes, funding potential
3. WIOA alignment — Eligible Training Provider List (ETPL) eligibility
4. Industry certification mapping — direct alignment with recognized credentials
5. Accreditor expectations (relevant regional accreditor)
6. Advisory committee requirements
7. Articulation potential with 4-year institutions
8. Complete compliance timeline from decision to launch

SCORING CRITERIA:
- Strong (8-10): Aligns with WIOA/Perkins, certification pathway clear, minimal regulatory hurdles
- Moderate (5-7): Some funding alignment, standard regulatory process
- Weak (1-4): No funding alignment, complex regulatory approval needed

OUTPUT FORMAT (JSON):
{
  "score": <1-10>,
  "scoreRationale": "Detailed explanation",
  "stateApproval": {
    "required": true,
    "agency": "Agency name",
    "process": "Description",
    "estimatedTimeline": "X months",
    "requirements": ["Req 1"]
  },
  "perkinsV": {
    "aligned": true,
    "eligibleCIP": "CIP code",
    "fundingPotential": "$X,XXX annually",
    "requirements": ["Req 1"]
  },
  "wioa": {
    "aligned": true,
    "etplEligible": true,
    "targetPopulations": ["Pop 1"],
    "fundingPotential": "Description"
  },
  "industryCertifications": [
    { "certification": "Name", "body": "Org", "alignment": "direct|partial|none", "requirements": "Reqs" }
  ],
  "accreditor": {
    "body": "HLC",
    "expectations": ["Expectation 1"],
    "substantiveChange": false,
    "timeline": "X months"
  },
  "advisoryCommittee": {
    "required": true,
    "composition": ["Member type 1"],
    "meetingFrequency": "Twice annually"
  },
  "articulationPotential": {
    "receivingInstitutions": ["Institution 1"],
    "creditTransferLikelihood": "high|moderate|low",
    "pathways": ["Pathway 1"]
  },
  "complianceTimeline": [
    { "milestone": "Milestone 1", "estimatedDate": "Month Year", "dependency": "Dependency" }
  ],
  "dataSources": ["Source 1"],
  "markdownReport": "Full markdown section"
}

Respond with valid JSON in \`\`\`json code blocks.`;

    const { content, tokensUsed } = await callClaude(prompt, { maxTokens: 4000 });
    const data = extractJSON(content) as RegulatoryComplianceData;

    if (!data.markdownReport) {
      data.markdownReport = formatRegulatory(data, project);
    }

    const markdown = data.markdownReport;
    const duration = Date.now() - startTime;

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'regulatory-analyst',
      persona: 'regulatory-compliance-analyst',
      prompt: prompt.substring(0, 5000),
      response: content.substring(0, 10000),
      tokens_used: tokensUsed,
      duration_ms: duration,
      status: 'success',
    });

    console.log(`[Regulatory] Completed in ${duration}ms, score: ${data.score}/10`);
    return { data, markdown };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Regulatory] Error:', error);

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'regulatory-analyst',
      persona: 'regulatory-compliance-analyst',
      duration_ms: duration,
      status: 'error',
      error_message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

function formatRegulatory(data: RegulatoryComplianceData, project: ValidationProject): string {
  return `# Regulatory & Compliance Analysis: ${project.program_name}

## Dimension Score: ${data.score}/10
**Rationale:** ${data.scoreRationale}

## State Approval
- **Required:** ${data.stateApproval.required ? 'Yes' : 'No'}
- **Agency:** ${data.stateApproval.agency}
- **Process:** ${data.stateApproval.process}
- **Timeline:** ${data.stateApproval.estimatedTimeline}

## Perkins V Alignment
- **Aligned:** ${data.perkinsV.aligned ? 'Yes' : 'No'}
- **CIP Code:** ${data.perkinsV.eligibleCIP}
- **Funding Potential:** ${data.perkinsV.fundingPotential}

## WIOA Alignment
- **Aligned:** ${data.wioa.aligned ? 'Yes' : 'No'}
- **ETPL Eligible:** ${data.wioa.etplEligible ? 'Yes' : 'No'}
- **Funding Potential:** ${data.wioa.fundingPotential}

## Industry Certifications
${data.industryCertifications.map(c => `- **${c.certification}** (${c.body}) — Alignment: ${c.alignment}`).join('\n')}

## Accreditor (${data.accreditor.body})
- **Substantive Change Required:** ${data.accreditor.substantiveChange ? 'Yes' : 'No'}
- **Timeline:** ${data.accreditor.timeline}

## Articulation Potential
- **Credit Transfer Likelihood:** ${data.articulationPotential.creditTransferLikelihood}
- **Receiving Institutions:** ${data.articulationPotential.receivingInstitutions.join(', ')}

## Compliance Timeline
${data.complianceTimeline.map(m => `- **${m.milestone}** — ${m.estimatedDate} (${m.dependency})`).join('\n')}

---
**Data Sources:** ${data.dataSources.join('; ')}
`;
}
