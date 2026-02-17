import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { PROGRAM_VALIDATOR_SYSTEM_PROMPT } from '@/lib/prompts/program-validator';
import { searchGoogleJobs } from '@/lib/apis/serpapi';
import { withCache } from '@/lib/apis/cache';

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

    // Fetch real Google Jobs data to identify actual employers hiring
    const targetOccupation = (project as any).target_occupation || 
      project.program_name.replace(/\s*(certificate|diploma|degree|program|associate|bachelor|training|course)/gi, '').trim();
    const location = (project as any).geographic_area || 'United States';
    
    let jobsData = null;
    let employerList: Array<{ name: string; openings: number }> = [];
    
    try {
      jobsData = await withCache(
        'employer_jobs',
        { occupation: targetOccupation, location },
        () => searchGoogleJobs(targetOccupation, location),
        168 // 7 days
      );
      
      if (jobsData && jobsData.topEmployers.length > 0) {
        employerList = jobsData.topEmployers.slice(0, 10);
        console.log(`[Employer Demand] Found ${jobsData.count} jobs, top employer: ${employerList[0]?.name} (${employerList[0]?.openings} openings)`);
      }
    } catch (err) {
      console.warn('[Employer Demand] Google Jobs failed:', err);
    }

    const prompt = `${PROGRAM_VALIDATOR_SYSTEM_PROMPT}

ROLE: You are conducting Stage 7 — Employer Demand & Partnership Potential Analysis.

PROGRAM DETAILS:
- Program Name: ${project.program_name}
- Program Type: ${project.program_type || 'Not specified'}
- Target Audience: ${project.target_audience || 'Not specified'}
- Institution: ${project.client_name}
- Geographic Area: ${location}
- Target Occupation: ${targetOccupation}
${project.constraints ? `- Constraints: ${project.constraints}` : ''}
${(project as any).employer_interest ? `- Known Employer Interest: ${(project as any).employer_interest}` : ''}

${employerList.length > 0 ? `
═══════════════════════════════════════════════════════════
REAL DATA FROM GOOGLE JOBS (${new Date().toLocaleDateString()}):
═══════════════════════════════════════════════════════════

Current Job Openings: ${jobsData!.count}

Top Employers Currently Hiring:
${employerList.map((e, i) => `${i + 1}. ${e.name} — ${e.openings} active openings`).join('\n')}

NOTE: Use this real employer data as the foundation for your analysis.
Identify which employers are actively hiring, their sectors (hospital,
retail pharmacy, specialty clinic, etc.), and estimated annual demand.
═══════════════════════════════════════════════════════════
` : `
NOTE: Live employer data unavailable. Use your knowledge of the
occupation and region to identify top employers by sector.
`}

ANALYSIS REQUIRED:
1. Employer demand signals (top 3-5)
2. Top employers in the region for this field (3-5)
3. Employer investment willingness assessment
4. Contract training potential
5. Key partnership opportunities
6. Skills employers want most

SCORING: 8-10 = strong multi-employer demand; 5-7 = moderate; 1-4 = weak/concentrated

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation outside JSON. Keep all string values concise (1-2 sentences max). Do NOT include a markdownReport field.

{
  "score": <1-10>,
  "scoreRationale": "Brief explanation",
  "demandSignals": [
    { "signal": "Description", "source": "Source", "strength": "strong" }
  ],
  "employerConcentration": {
    "topEmployers": [
      { "name": "Company", "estimatedDemand": "X positions/year", "sector": "Industry" }
    ],
    "concentrationRisk": "low",
    "analysis": "Brief description"
  },
  "investmentWillingness": {
    "tuitionReimbursement": "Brief assessment",
    "contractTrainingPotential": "Brief assessment",
    "equipmentDonation": "Brief assessment",
    "guestInstructors": "Brief assessment",
    "internshipPlacements": "Brief assessment"
  },
  "contractTraining": {
    "potential": "high",
    "estimatedRevenue": "estimated annually",
    "targetCompanies": ["Company 1"],
    "approach": "Brief strategy"
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
    "credentialValue": "Brief assessment"
  },
  "dataSources": ["Source 1"]
}`;

    const { content, tokensUsed } = await callClaude(prompt, { maxTokens: 16000 });
    const data = extractJSON(content) as EmployerDemandData;

    if (!data.markdownReport) {
      data.markdownReport = formatEmployerDemand(data, project);
    }

    const markdown = data.markdownReport || formatEmployerDemand(data, project);
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
