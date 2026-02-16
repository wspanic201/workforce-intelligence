import { callClaude } from '@/lib/ai/anthropic';
import { ProgramGap } from './gap-analyzer';

export interface ProgramRecommendation {
  programName: string;
  credentialType: 'certificate' | 'associate' | 'bachelor' | 'stackable';
  targetOccupation: string;
  socCode: string;
  programLength: string; // e.g., "12 months", "2 years"
  estimatedCostTier: 'low' | 'medium' | 'high'; // Development cost
  coreComponents: string[]; // Key curriculum areas
  requiredResources: string[]; // Labs, equipment, partnerships
  potentialRevenue: string; // Annual estimate
  implementationComplexity: 1 | 2 | 3 | 4 | 5; // 1=easy, 5=very complex
  rationale: string;
}

/**
 * Program Mapper
 * Maps identified gaps to specific, actionable program recommendations.
 * Includes implementation details and resource requirements.
 */
export async function mapGapsToPrograms(
  institutionName: string,
  gaps: ProgramGap[]
): Promise<ProgramRecommendation[]> {
  console.log(`[Program Mapper] Mapping ${gaps.length} gaps to program recommendations`);

  // Process in batches to avoid token limits
  const batchSize = 10;
  const allRecommendations: ProgramRecommendation[] = [];

  for (let i = 0; i < gaps.length; i += batchSize) {
    const batch = gaps.slice(i, i + batchSize);
    const batchRecommendations = await mapBatch(institutionName, batch);
    allRecommendations.push(...batchRecommendations);
  }

  console.log(`[Program Mapper] Generated ${allRecommendations.length} program recommendations`);

  return allRecommendations;
}

async function mapBatch(
  institutionName: string,
  gaps: ProgramGap[]
): Promise<ProgramRecommendation[]> {
  const prompt = `You are a curriculum development expert helping ${institutionName} design new workforce programs.

For each occupation gap below, recommend a specific program the institution could launch.

GAPS TO ADDRESS:
${gaps.map((gap, i) => `
${i + 1}. ${gap.occupation} (SOC ${gap.socCode})
   - Gap Type: ${gap.gapType}
   - Demand Strength: ${gap.demandStrength}/10
   - Competition: ${gap.competitionLevel}
   - Context: ${gap.rationale}
`).join('\n')}

For EACH occupation, design a program with these details:

**Program Name**: Be specific (e.g., "Advanced Manufacturing Technology Certificate", not just "Manufacturing")
**Credential Type**: certificate, associate, bachelor, or stackable (cert → degree pathway)
**Program Length**: Specific duration (e.g., "12 months", "2 years", "6-month accelerated")
**Cost Tier**: low, medium, or high (development cost for institution)
**Core Components**: 4-6 key curriculum areas/courses
**Required Resources**: Labs, equipment, software, industry partnerships needed
**Potential Revenue**: Annual estimate (students × tuition)
**Implementation Complexity**: 1-5 (1=easy launch, 5=very complex)
**Rationale**: Why this specific program design addresses the gap (2-3 sentences)

Return ONLY a JSON array:
[
  {
    "programName": "Registered Nursing (ADN)",
    "credentialType": "associate",
    "targetOccupation": "Registered Nurses",
    "socCode": "29-1141",
    "programLength": "2 years",
    "estimatedCostTier": "high",
    "coreComponents": [
      "Anatomy & Physiology",
      "Pharmacology",
      "Clinical Rotations (Medical-Surgical)",
      "Maternal-Child Health",
      "Mental Health Nursing",
      "Leadership & Professional Practice"
    ],
    "requiredResources": [
      "Nursing simulation lab with high-fidelity mannequins",
      "Clinical partnerships with local hospitals",
      "NCLEX prep resources",
      "Full-time nursing faculty (MSN required)"
    ],
    "potentialRevenue": "$180,000 annually (30 students × $6,000 tuition)",
    "implementationComplexity": 5,
    "rationale": "ADN pathway addresses nursing shortage while being more accessible than BSN. Strong clinical partnerships are critical. High setup cost but excellent enrollment demand."
  }
]

IMPORTANT:
- Be realistic about resource requirements (don't minimize complexity)
- Consider what a community college can realistically launch
- Stackable credentials create enrollment funnels (cert → associate)
- Cost tier reflects setup investment, not tuition
- Revenue should be conservative but realistic`;

  const { content } = await callClaude(prompt, {
    maxTokens: 6000,
    temperature: 0.7,
  });

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((rec: any) => ({
        programName: rec.programName || 'Unnamed Program',
        credentialType: rec.credentialType || 'certificate',
        targetOccupation: rec.targetOccupation || '',
        socCode: rec.socCode || '',
        programLength: rec.programLength || 'Not specified',
        estimatedCostTier: rec.estimatedCostTier || 'medium',
        coreComponents: rec.coreComponents || [],
        requiredResources: rec.requiredResources || [],
        potentialRevenue: rec.potentialRevenue || 'To be determined',
        implementationComplexity: rec.implementationComplexity || 3,
        rationale: rec.rationale || '',
      }));
    } catch (e) {
      console.error('[Program Mapper] Failed to parse JSON:', e);
      return [];
    }
  }

  console.warn('[Program Mapper] No valid JSON found in response');
  return [];
}

/**
 * Helper: Validate program recommendations
 */
export function validateRecommendations(
  recommendations: ProgramRecommendation[]
): { valid: ProgramRecommendation[]; issues: string[] } {
  const valid: ProgramRecommendation[] = [];
  const issues: string[] = [];

  for (const rec of recommendations) {
    // Check required fields
    if (!rec.programName) {
      issues.push(`Missing program name for ${rec.targetOccupation}`);
      continue;
    }
    if (!rec.targetOccupation || !rec.socCode) {
      issues.push(`Missing occupation mapping for ${rec.programName}`);
      continue;
    }
    if (!rec.coreComponents || rec.coreComponents.length === 0) {
      issues.push(`No curriculum components for ${rec.programName}`);
      continue;
    }

    valid.push(rec);
  }

  return { valid, issues };
}
