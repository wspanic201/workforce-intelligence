import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { PROGRAM_VALIDATOR_SYSTEM_PROMPT } from '@/lib/prompts/program-validator';

export interface EmployerDemandData {
  score: number;
  scoreRationale: string;
  demandSignals: {
    signal: string;
    source: string;
    strength: 'strong' | 'moderate' | 'weak';
  }[];
  employerConcentration: {
    topEmployers: { name: string; estimatedDemand: string; sector: string }[];
    concentrationRisk: 'low' | 'moderate' | 'high';
    analysis: string;
  };
  investmentWillingness: {
    tuitionReimbursement: string;
    contractTrainingPotential: string;
    equipmentDonation: string;
    guestInstructors: string;
    internshipPlacements: string;
  };
  contractTraining: {
    potential: 'high' | 'moderate' | 'low';
    estimatedRevenue: string;
    targetCompanies: string[];
    approach: string;
  };
  partnershipEcosystem: {
    workforceDevelopmentBoards: string[];
    industryAssociations: string[];
    economicDevelopment: string[];
    existingRelationships: string[];
  };
  programDesignFeedback: {
    skillsEmployersWant: string[];
    preferredFormat: string;
    preferredSchedule: string;
    credentialValue: string;
  };
  dataSources: string[];
  markdownReport: string;
}

export async function runEmployerDemand(
  projectId: string,
  project: ValidationProject
): Promise<{ data: EmployerDemandData; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    console.log(`[Employer Demand] Starting for "${project.program_name}"`);

    const prompt = `${PROGRAM_VALIDATOR_SYSTEM_PROMPT}

ROLE: You are conducting Stage 7 — Employer Demand & Partnership Potential Analysis.

PROGRAM DETAILS:
- Program Name: ${project.program_name}
- Program Type: ${project.program_type || 'Not specified'}
- Target Audience: ${project.target_audience || 'Not specified'}
- Institution: ${project.client_name}
- Geographic Area: ${(project as any).geographic_area || 'Iowa'}
${project.constraints ? `- Constraints: ${project.constraints}` : ''}
${(project as any).employer_interest ? `- Known Employer Interest: ${(project as any).employer_interest}` : ''}

ANALYSIS REQUIRED:
1. Direct employer demand signals (job postings, growth announcements, industry reports)
2. Employer concentration analysis — is demand distributed or concentrated in few employers?
3. Employer willingness to invest (tuition reimbursement, contract training, equipment, internships)
4. Contract training potential and estimated revenue
5. Partnership ecosystem (workforce boards, industry associations, economic development)
6. Employer feedback on program design (skills, format, schedule, credential preferences)

SCORING CRITERIA:
- Strong (8-10): 3+ employers expressed interest, distributed demand, strong partnership potential, contract training likely
- Moderate (5-7): General interest inferred from data, some partnership potential
- Weak (1-4): No direct engagement, concentrated demand, weak partnership ecosystem

OUTPUT FORMAT (JSON):
{
  "score": <1-10>,
  "scoreRationale": "Detailed explanation",
  "demandSignals": [
    { "signal": "Description", "source": "Source", "strength": "strong|moderate|weak" }
  ],
  "employerConcentration": {
    "topEmployers": [
      { "name": "Company", "estimatedDemand": "X positions/year", "sector": "Industry" }
    ],
    "concentrationRisk": "low|moderate|high",
    "analysis": "Description"
  },
  "investmentWillingness": {
    "tuitionReimbursement": "Assessment",
    "contractTrainingPotential": "Assessment",
    "equipmentDonation": "Assessment",
    "guestInstructors": "Assessment",
    "internshipPlacements": "Assessment"
  },
  "contractTraining": {
    "potential": "high|moderate|low",
    "estimatedRevenue": "$X,XXX annually",
    "targetCompanies": ["Company 1"],
    "approach": "Strategy"
  },
  "partnershipEcosystem": {
    "workforceDevelopmentBoards": ["Board 1"],
    "industryAssociations": ["Assoc 1"],
    "economicDevelopment": ["Org 1"],
    "existingRelationships": ["Relationship 1"]
  },
  "programDesignFeedback": {
    "skillsEmployersWant": ["Skill 1"],
    "preferredFormat": "Format",
    "preferredSchedule": "Schedule",
    "credentialValue": "Assessment"
  },
  "dataSources": ["Source 1"],
  "markdownReport": "Full markdown section"
}

Respond with valid JSON in \`\`\`json code blocks.`;

    const { content, tokensUsed } = await callClaude(prompt, { maxTokens: 4000 });
    const data = extractJSON(content) as EmployerDemandData;

    if (!data.markdownReport) {
      data.markdownReport = formatEmployerDemand(data, project);
    }

    const markdown = data.markdownReport;
    const duration = Date.now() - startTime;

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'employer-analyst',
      persona: 'employer-demand-analyst',
      prompt: prompt.substring(0, 5000),
      response: content.substring(0, 10000),
      tokens_used: tokensUsed,
      duration_ms: duration,
      status: 'success',
    });

    console.log(`[Employer Demand] Completed in ${duration}ms, score: ${data.score}/10`);
    return { data, markdown };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Employer Demand] Error:', error);

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'employer-analyst',
      persona: 'employer-demand-analyst',
      duration_ms: duration,
      status: 'error',
      error_message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

function formatEmployerDemand(data: EmployerDemandData, project: ValidationProject): string {
  return `# Employer Demand & Partnerships: ${project.program_name}

## Dimension Score: ${data.score}/10
**Rationale:** ${data.scoreRationale}

## Demand Signals
${data.demandSignals.map(s => `- **${s.strength.toUpperCase()}:** ${s.signal} *(${s.source})*`).join('\n')}

## Employer Concentration
- **Concentration Risk:** ${data.employerConcentration.concentrationRisk}
- **Analysis:** ${data.employerConcentration.analysis}

**Top Employers:**
${data.employerConcentration.topEmployers.map(e => `- **${e.name}** (${e.sector}) — ${e.estimatedDemand}`).join('\n')}

## Employer Investment Willingness
- **Tuition Reimbursement:** ${data.investmentWillingness.tuitionReimbursement}
- **Contract Training:** ${data.investmentWillingness.contractTrainingPotential}
- **Equipment Donation:** ${data.investmentWillingness.equipmentDonation}
- **Guest Instructors:** ${data.investmentWillingness.guestInstructors}
- **Internship Placements:** ${data.investmentWillingness.internshipPlacements}

## Contract Training Potential
- **Potential:** ${data.contractTraining.potential}
- **Estimated Revenue:** ${data.contractTraining.estimatedRevenue}
- **Target Companies:** ${data.contractTraining.targetCompanies.join(', ')}

## Partnership Ecosystem
- **Workforce Boards:** ${data.partnershipEcosystem.workforceDevelopmentBoards.join(', ')}
- **Industry Associations:** ${data.partnershipEcosystem.industryAssociations.join(', ')}
- **Economic Development:** ${data.partnershipEcosystem.economicDevelopment.join(', ')}

## Employer Program Design Preferences
- **Skills Wanted:** ${data.programDesignFeedback.skillsEmployersWant.join(', ')}
- **Preferred Format:** ${data.programDesignFeedback.preferredFormat}
- **Preferred Schedule:** ${data.programDesignFeedback.preferredSchedule}
- **Credential Value:** ${data.programDesignFeedback.credentialValue}

---
**Data Sources:** ${data.dataSources.join('; ')}
`;
}
