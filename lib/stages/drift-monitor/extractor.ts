import { callClaude } from '@/lib/ai/anthropic';
import type { RawPosting } from './scanner';
import type { EmployerSkill } from './types';

export async function extractEmployerSkills(postings: RawPosting[]): Promise<EmployerSkill[]> {
  // Concatenate posting descriptions (limit to avoid token explosion)
  const combinedText = postings
    .slice(0, 25)
    .map(p => `JOB: ${p.title} at ${p.company}\n${p.description}`)
    .join('\n\n---\n\n')
    .slice(0, 15000); // cap at 15k chars

  const prompt = `You are analyzing job postings to identify the most important skills and requirements employers are looking for.

JOB POSTINGS:
${combinedText}

Analyze ALL postings above and extract the top 20 most commonly required skills, certifications, technologies, and competencies.

Return a JSON array of objects:
[
  { "skill": "skill name (concise, 2-5 words max)", "frequency": 8, "examples": ["exact phrase from posting 1", "exact phrase from posting 2"] },
  ...
]

Rules:
- skill: canonical, clean name (e.g. "Electronic Health Records" not "experience with EHR systems")
- frequency: count of how many postings mention this skill
- examples: 1-3 actual phrases from the postings showing how this skill is mentioned
- Sort by frequency descending
- Include hard skills, soft skills, certifications, tools, and education requirements
- Only return valid JSON, no markdown wrapping`;

  const result = await callClaude(prompt, { maxTokens: 3000, temperature: 0.3 });

  try {
    const cleaned = result.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as EmployerSkill[];
  } catch {
    console.error('[DriftExtractor] Failed to parse skills JSON');
    return [];
  }
}

export async function extractCurriculumSkills(curriculumDescription: string): Promise<string[]> {
  const prompt = `Extract a clean list of skills, competencies, and topics covered in this curriculum description.

CURRICULUM:
${curriculumDescription}

Return a JSON array of strings — each a specific skill or topic taught:
["skill 1", "skill 2", ...]

Rules:
- Be specific and canonical (same format as job posting skills)
- Only return valid JSON, no markdown`;

  const result = await callClaude(prompt, { maxTokens: 1000, temperature: 0.2 });

  try {
    const cleaned = result.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as string[];
  } catch {
    return [];
  }
}
