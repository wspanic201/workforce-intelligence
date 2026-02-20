import { callClaude } from '@/lib/ai/anthropic';
import type { EmployerSkill } from './types';
import type { OnetOccupationProfile } from '@/lib/apis/onet';

// Fuzzy skill matching — "Electronic Health Records" matches "EHR"
async function matchSkills(
  employerSkills: EmployerSkill[],
  curriculumSkills: string[]
): Promise<{ covered: string[]; gaps: string[]; stale: string[] }> {

  const top20Employer = employerSkills.slice(0, 20).map(s => s.skill);

  const prompt = `Compare these two skill lists and identify matches, gaps, and stale skills.

EMPLOYER SKILLS (what the job market wants):
${top20Employer.join('\n')}

CURRICULUM SKILLS (what the program teaches):
${curriculumSkills.join('\n')}

Return JSON with:
{
  "covered": ["employer skills that ARE covered in curriculum (exact employer skill names)"],
  "gaps": ["employer skills that are NOT in curriculum (exact employer skill names)"],
  "stale": ["curriculum skills that don't appear in employer requirements"]
}

Be generous with matching — "EHR" matches "Electronic Health Records", "Python programming" matches "Python". Focus on semantic equivalence, not exact string match.
Only return valid JSON.`;

  const result = await callClaude(prompt, { maxTokens: 2000, temperature: 0.2 });

  try {
    const cleaned = result.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Fallback: basic string matching
    const covered = top20Employer.filter(es =>
      curriculumSkills.some(cs =>
        cs.toLowerCase().includes(es.toLowerCase()) ||
        es.toLowerCase().includes(cs.toLowerCase())
      )
    );
    const gaps = top20Employer.filter(s => !covered.includes(s));
    const stale = curriculumSkills.filter(cs =>
      !top20Employer.some(es =>
        es.toLowerCase().includes(cs.toLowerCase()) ||
        cs.toLowerCase().includes(es.toLowerCase())
      )
    );
    return { covered, gaps, stale };
  }
}

export async function calculateDriftScore(
  employerSkills: EmployerSkill[],
  curriculumSkills: string[],
  onetProfile?: OnetOccupationProfile
): Promise<{ score: number; covered: string[]; gaps: string[]; stale: string[]; onetGaps?: string[] }> {
  const { covered, gaps, stale } = await matchSkills(employerSkills, curriculumSkills);

  const top20Count = Math.min(employerSkills.length, 20);
  const coverage = top20Count > 0 ? covered.length / top20Count : 0;
  let score = Math.round((1 - coverage) * 100);

  let onetGaps: string[] | undefined;

  if (onetProfile) {
    // Collect essential O*NET skills/knowledge (importance >= 60)
    const essentialOnet = [
      ...onetProfile.skills.filter(s => s.importance >= 60).map(s => s.name),
      ...onetProfile.knowledge.filter(k => k.importance >= 60).map(k => k.name),
    ];

    if (essentialOnet.length > 0) {
      // Match O*NET essentials against curriculum
      const onetMatchResult = await matchOnetAgainstCurriculum(essentialOnet, curriculumSkills);
      onetGaps = onetMatchResult.missing;

      // Boost drift score based on missing essential O*NET skills
      if (onetGaps.length > 0) {
        const onetMissRate = onetGaps.length / essentialOnet.length;
        // Blend: 70% employer-based score + 30% O*NET gap penalty
        score = Math.round(score * 0.7 + onetMissRate * 100 * 0.3);
        score = Math.min(100, score);
      }
    }
  }

  return { score, covered, gaps, stale, onetGaps };
}

async function matchOnetAgainstCurriculum(
  onetSkills: string[],
  curriculumSkills: string[]
): Promise<{ covered: string[]; missing: string[] }> {
  const prompt = `Compare these O*NET occupation skills against a curriculum's skill list.

O*NET ESSENTIAL SKILLS/KNOWLEDGE:
${onetSkills.join('\n')}

CURRICULUM SKILLS:
${curriculumSkills.join('\n')}

Return JSON:
{
  "covered": ["O*NET skills that ARE covered in curriculum"],
  "missing": ["O*NET skills that are NOT in curriculum"]
}

Be generous with matching — semantic equivalence counts. Only return valid JSON.`;

  const result = await callClaude(prompt, { maxTokens: 1500, temperature: 0.2 });

  try {
    const cleaned = result.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Fallback: basic string matching
    const covered = onetSkills.filter(os =>
      curriculumSkills.some(cs =>
        cs.toLowerCase().includes(os.toLowerCase()) ||
        os.toLowerCase().includes(cs.toLowerCase())
      )
    );
    return { covered, missing: onetSkills.filter(s => !covered.includes(s)) };
  }
}
