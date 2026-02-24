import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { PROGRAM_VALIDATOR_SYSTEM_PROMPT } from '@/lib/prompts/program-validator';
import { searchWeb } from '@/lib/apis/web-research';
// Intelligence context is injected by orchestrator via (project as any)._intelContext

export interface RegulatoryComplianceData {
  score: number;
  scoreRationale: string;
  programType: 'initial_licensure' | 'continuing_education' | 'non_licensed' | 'unclear';
  programTypeRationale: string;
  licensure: {
    isLicensedOccupation: boolean;
    initialLicensure?: {
      requiredHours: number;
      stateBoard: string;
      examRequired: boolean;
      examName?: string;
      practicalHoursRequired: boolean;
      tuitionRange: string;
      stateLawReference: string; // Must cite specific statute/rule
    };
    continuingEducation?: {
      renewalCycle: string; // e.g., "every 2 years"
      requiredHours: number;
      approvedTopics: string[];
      typicalCost: string;
      stateLawReference: string; // Must cite specific statute/rule
    };
  };
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

/**
 * Extract state from geographic area.
 */
function extractState(project: any): string | null {
  const geo = (project.geographic_area || '').toLowerCase();
  
  const stateMap: Record<string, string> = {
    'iowa': 'Iowa',
    'minnesota': 'Minnesota',
    'illinois': 'Illinois',
    'wisconsin': 'Wisconsin',
    'missouri': 'Missouri',
    'nebraska': 'Nebraska',
    'kansas': 'Kansas',
    'california': 'California',
    'texas': 'Texas',
    'florida': 'Florida',
    'new york': 'New York',
    // Add more as needed
  };

  for (const [key, value] of Object.entries(stateMap)) {
    if (geo.includes(key)) return value;
  }

  return null;
}

/**
 * Extract occupation from program name.
 */
function extractOccupation(programName: string): string {
  // Strip common program qualifiers
  return programName
    .replace(/\s*(certificate|diploma|degree|program|associate|bachelor|training|course|license|renewal|continuing education)\s*/gi, '')
    .trim();
}

/**
 * Search for official .gov sources for licensure requirements.
 * This pre-filters results to government websites only.
 */
async function findOfficialGovernmentSources(
  occupation: string,
  state: string
): Promise<string[]> {
  const queries = [
    `${occupation} license requirements ${state} site:.gov`,
    `${occupation} continuing education ${state} site:.gov`,
    `${state} ${occupation} renewal requirements site:.gov`,
  ];

  const urls: string[] = [];

  for (const query of queries) {
    try {
      const results = await searchWeb(query);
      // Filter to .gov domains only
      const govUrls = results.results
        .filter(r => r.url.includes('.gov'))
        .map(r => r.url)
        .slice(0, 3);
      urls.push(...govUrls);
    } catch (err) {
      console.warn(`[Regulatory] .gov search failed for: ${query}`);
    }
  }

  // Deduplicate
  return Array.from(new Set(urls));
}

export async function runRegulatoryCompliance(
  projectId: string,
  project: ValidationProject
): Promise<{ data: RegulatoryComplianceData; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    console.log(`[Regulatory] Starting for "${project.program_name}"`);

    // Pre-search for official .gov sources
    const state = extractState(project as any);
    const occupation = extractOccupation(project.program_name);
    
    let govSources: string[] = [];
    if (state && occupation) {
      console.log(`[Regulatory] Pre-searching for .gov sources: ${occupation} in ${state}`);
      govSources = await findOfficialGovernmentSources(occupation, state);
      console.log(`[Regulatory] Found ${govSources.length} official .gov sources`);
    }

    // Get shared intelligence context
    const sharedContext = (project as any)._intelContext;
    const verifiedRegulatorySection = sharedContext?.promptBlock || '';
    if (sharedContext) {
      console.log(`[Regulatory] Using shared intelligence context (${sharedContext.tablesUsed.length} sources)`);
    }

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

${verifiedRegulatorySection ? `VERIFIED BASELINE DATA (confirmed from government sources — treat as established fact):
${verifiedRegulatorySection}` : ''}
${govSources.length > 0 ? `OFFICIAL .GOV SOURCES FOUND:
${govSources.map((url, i) => `${i + 1}. ${url}`).join('\n')}` : ''}

Your job is NOT to generate tables or restate statistics. The baseline data is confirmed.
Your job is analysis:
- What is required by law versus optional quality standards?
- What is mandatory under Iowa law/state rules versus accreditation expectations?
- What is the minimum viable compliance path and what is the recommended path?
- Which constraints are true blockers versus manageable sequencing work?

CRITICAL SOURCE RULE:
- For licensure hour and renewal requirements, use official state government sources only (.gov and official state code sites).
- If official source evidence is missing, state that explicitly instead of guessing.

OUTPUT FORMAT:
- 600-900 words in scoreRationale as narrative analysis
- NO markdown tables
- NO bullet-point list of repeated statistics
- YES direct references to governing authorities and citations
- Keep supporting fields concise and action-oriented

SCORING: 8-10 strong alignment/minimal hurdles; 5-7 moderate; 1-4 complex/high-risk pathway.

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation outside JSON. Do NOT include a markdownReport field.

{
  "score": <1-10>,
  "scoreRationale": "600-900 word narrative compliance analysis",
  "programType": "initial_licensure|continuing_education|non_licensed|unclear",
  "programTypeRationale": "1-2 sentence explanation of classification",
  "licensure": {
    "isLicensedOccupation": true|false,
    "initialLicensure": {
      "requiredHours": 1600,
      "stateBoard": "State Board name",
      "examRequired": true,
      "examName": "Exam name",
      "practicalHoursRequired": true,
      "tuitionRange": "$8,000-$12,000",
      "stateLawReference": "Iowa Code §147.2 or Iowa Admin Code 645-XX.X"
    },
    "continuingEducation": {
      "renewalCycle": "every 2 years",
      "requiredHours": 6,
      "approvedTopics": ["Topic 1", "Topic 2"],
      "typicalCost": "$150-200 per renewal",
      "stateLawReference": "Iowa Code §147.10 or Iowa Admin Code 645-XX.X"
    }
  },
  "stateApproval": {
    "required": true,
    "agency": "Agency name",
    "process": "Brief description",
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
    "fundingPotential": "Brief description"
  },
  "industryCertifications": [
    { "certification": "Name", "body": "Org", "alignment": "direct", "requirements": "Brief reqs" }
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
    "creditTransferLikelihood": "high",
    "pathways": ["Pathway 1"]
  },
  "complianceTimeline": [
    { "milestone": "Milestone 1", "estimatedDate": "Month Year", "dependency": "Dependency" }
  ],
  "dataSources": ["Source 1 - must be .gov or official state source"]
}

For licensure fields, populate initialLicensure or continuingEducation based on actual program type and include specific statute/rule citations in stateLawReference.`;

    const { content, tokensUsed } = await callClaude(prompt, { maxTokens: 5000 });
    const data = extractJSON(content) as RegulatoryComplianceData;

    if (!data.markdownReport) {
      data.markdownReport = formatRegulatory(data, project);
    }

    const markdown = data.markdownReport || formatRegulatory(data, project);
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
  let licensureSection = '';
  
  if (data.licensure.isLicensedOccupation) {
    licensureSection = `\n## Program Type Classification
**Type:** ${data.programType.replace(/_/g, ' ').toUpperCase()}
**Rationale:** ${data.programTypeRationale}

`;
    
    if (data.licensure.initialLicensure) {
      licensureSection += `### Initial Licensure Requirements
- **Required Hours:** ${data.licensure.initialLicensure.requiredHours}
- **State Board:** ${data.licensure.initialLicensure.stateBoard}
- **Exam Required:** ${data.licensure.initialLicensure.examRequired ? `Yes — ${data.licensure.initialLicensure.examName}` : 'No'}
- **Practical Hours:** ${data.licensure.initialLicensure.practicalHoursRequired ? 'Yes' : 'No'}
- **Typical Tuition:** ${data.licensure.initialLicensure.tuitionRange}
- **State Law:** ${data.licensure.initialLicensure.stateLawReference}

`;
    }
    
    if (data.licensure.continuingEducation) {
      licensureSection += `### Continuing Education Requirements (Re-Licensure)
- **Renewal Cycle:** ${data.licensure.continuingEducation.renewalCycle}
- **Required Hours:** ${data.licensure.continuingEducation.requiredHours} hours
- **Approved Topics:** ${data.licensure.continuingEducation.approvedTopics.join(', ')}
- **Typical Cost:** ${data.licensure.continuingEducation.typicalCost}
- **State Law:** ${data.licensure.continuingEducation.stateLawReference}

`;
    }
  }

  return `# Regulatory & Compliance Analysis: ${project.program_name}

## Dimension Score: ${data.score}/10
**Rationale:** ${data.scoreRationale}
${licensureSection}
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
