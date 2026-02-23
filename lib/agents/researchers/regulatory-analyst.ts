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

${verifiedRegulatorySection ? `═══ VERIFIED BASELINE DATA (BLS, O*NET, Census, IPEDS — confirmed government sources, cite directly) ═══
${verifiedRegulatorySection}
═══ END VERIFIED BASELINE ═══

This data confirms what exists. Your job is to explain what it means right now — find current job postings, recent employer news, industry reports, regulatory updates, and competitor moves that bring the baseline to life. The intel above is your floor. External research is what makes this worth reading.` : ''}

CRITICAL INSTRUCTION — LICENSURE VS. CONTINUING EDUCATION:
For licensed occupations, you MUST distinguish between:
1. **Initial Licensure Programs** — Full training to obtain a new license (e.g., 1600-hour cosmetology program)
2. **Continuing Education/Re-Licensure** — Short courses to maintain an existing license (e.g., 6-hour CEU for license renewal)

These are fundamentally different programs with different:
- Scope (hundreds vs. single-digit hours)
- Tuition ($8,000+ vs. $150)
- Target market (new entrants vs. licensed professionals)
- Financial models (high tuition/low volume vs. low cost/high volume)

Determine which type applies to this program and structure your analysis accordingly.

DATA SOURCE REQUIREMENTS - CRITICAL:
- ALL licensure data MUST come from OFFICIAL GOVERNMENT SOURCES ONLY:
  - ✅ ALLOWED: .gov domains ONLY (state licensing boards, state legislature websites)
  - ✅ ALLOWED: Official state administrative code websites (e.g., legis.iowa.gov/docs/iac/)
  - ❌ FORBIDDEN: Third-party training providers (.com, .org, .edu)
  - ❌ FORBIDDEN: Cosmetology schools, CE provider websites
  - ❌ FORBIDDEN: Wikipedia, blogs, general education sites
  - ❌ FORBIDDEN: Any site that is NOT an official state government website

VERIFICATION PROTOCOL:
1. Search for "[state] [occupation] license requirements site:.gov"
2. Locate the official state licensing board page (.gov)
3. Find the specific statute/administrative code citation
4. Fetch and READ the actual statute text from legis.[state].gov or equivalent
5. Quote the EXACT hour requirement from the statute
6. Cite the statute number (e.g., "Iowa Code §157.10" or "Iowa Admin Code 645-60.18")
7. If you CANNOT find a .gov source with the exact requirement, return "Unable to locate official requirement from state government source" instead of guessing

EXAMPLE (Iowa Cosmetology):
- Correct source: dial.iowa.gov (Iowa Department of Inspections, Appeals & Licensing)
- Correct source: legis.iowa.gov (Iowa Legislature official code)
- WRONG source: rocketcert.com (training provider)
- WRONG source: rossbeautyacademy.com (school)

DO NOT GUESS. DO NOT ESTIMATE. DO NOT USE NON-.GOV SOURCES FOR LICENSURE REQUIREMENTS.

${govSources.length > 0 ? `
OFFICIAL .GOV SOURCES FOUND (use these first):
${govSources.map((url, i) => `${i + 1}. ${url}`).join('\n')}

You MUST verify licensure requirements using these .gov sources before responding.
If these sources don't contain the information, search for additional .gov sources.
DO NOT use any non-.gov websites for licensure hour requirements.
` : ''}

ANALYSIS REQUIRED:
1. Program type classification (initial licensure vs. continuing ed vs. non-licensed)
2. If licensed occupation:
   a. Initial licensure requirements (hours, exams, state board approval, state law reference)
   b. Continuing education requirements (renewal cycle, required hours, state law reference)
3. State approval requirements
4. Perkins V alignment — eligible CIP codes, funding potential
5. WIOA alignment — ETPL eligibility
6. Industry certification mapping (top 2-3 certifications)
7. Accreditor expectations
8. Key compliance milestones (top 3-5)

SCORING: 8-10 = strong alignment, minimal hurdles; 5-7 = moderate; 1-4 = weak alignment, complex approval

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation outside JSON. Keep all string values concise (1-2 sentences max). Do NOT include a markdownReport field.

{
  "score": <1-10>,
  "scoreRationale": "Brief explanation",
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

Don't just list requirements. Create a clear regulatory roadmap: what approvals are needed, in what order, with realistic timelines. If there are regulatory risks or recent policy changes that affect this program, highlight them.

LENGTH: 600–800 words.

NOTE: For licensure fields, only populate initialLicensure OR continuingEducation based on what this program actually is. Include stateLawReference with specific statute/rule citations.`;

    const { content, tokensUsed } = await callClaude(prompt, { maxTokens: 12000 });
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
