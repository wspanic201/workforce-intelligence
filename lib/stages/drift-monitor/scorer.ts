import { callClaude } from '@/lib/ai/anthropic';
import type { EmployerSkill } from './types';

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
  curriculumSkills: string[]
): Promise<{ score: number; covered: string[]; gaps: string[]; stale: string[] }> {
  const { covered, gaps, stale } = await matchSkills(employerSkills, curriculumSkills);

  const top20Count = Math.min(employerSkills.length, 20);
  const coverage = top20Count > 0 ? covered.length / top20Count : 0;
  const score = Math.round((1 - coverage) * 100);

  return { score, covered, gaps, stale };
}
