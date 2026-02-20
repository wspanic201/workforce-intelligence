/**
 * Curriculum Auto-Scraper
 * 
 * Given a program name and institution, automatically finds and extracts
 * the curriculum/course listing from the college's website. Eliminates
 * the need for clients to manually paste their syllabus.
 * 
 * Falls back to the manually-provided curriculumDescription if scraping fails.
 */

import { searchWeb, fetchPage } from '@/lib/apis/web-research';
import { callClaude } from '@/lib/ai/anthropic';

export interface ScrapedCurriculum {
  courses: string[];           // List of course names/descriptions
  skills: string[];            // Extracted skills/topics
  totalHours?: number;         // Total program hours if found
  sourceUrl: string;           // Where we found the data
  scraped: boolean;            // true if auto-scraped, false if using manual input
}

export async function scrapeCurriculum(
  programName: string,
  institutionName: string,
  state?: string,
  collegeUrl?: string,
): Promise<ScrapedCurriculum | null> {
  console.log(`[CurriculumScraper] Searching for ${programName} curriculum at ${institutionName}`);

  // Build domain for targeted searches
  let domain = '';
  if (collegeUrl) {
    try {
      domain = new URL(collegeUrl).hostname;
    } catch {
      domain = collegeUrl.replace(/https?:\/\//, '').split('/')[0];
    }
  }

  // Search for the program's curriculum page
  const queries = [
    domain ? `site:${domain} "${programName}" curriculum courses` : null,
    domain ? `site:${domain} "${programName}" program requirements` : null,
    `"${institutionName}" "${programName}" curriculum courses requirements`,
    `"${institutionName}" "${programName}" program plan of study`,
    `"${institutionName}" "${programName}" certificate courses${state ? ` ${state}` : ''}`,
  ].filter(Boolean) as string[];

  const candidateUrls = new Set<string>();

  for (const query of queries.slice(0, 4)) {
    try {
      const results = await searchWeb(query, { num: 5 });
      for (const r of results.results.slice(0, 3)) {
        if (r.url) candidateUrls.add(r.url);
      }
    } catch {
      // Continue
    }
    await new Promise(r => setTimeout(r, 300));
  }

  if (candidateUrls.size === 0) {
    console.warn('[CurriculumScraper] No curriculum pages found');
    return null;
  }

  console.log(`[CurriculumScraper] Found ${candidateUrls.size} candidate pages`);

  // Fetch and score pages
  const pageContents: Array<{ url: string; text: string }> = [];
  let fetched = 0;

  for (const url of candidateUrls) {
    if (fetched >= 5) break;
    try {
      const page = await fetchPage(url, 10000);
      const lower = page.text.toLowerCase();
      // Score relevance — must mention the program AND courses/curriculum
      const mentionsProgram = lower.includes(programName.toLowerCase().split(' ')[0]);
      const mentionsCurriculum = lower.includes('course') || lower.includes('curriculum') ||
        lower.includes('credit') || lower.includes('hour') || lower.includes('requirement');
      if (page.text.length > 200 && mentionsProgram && mentionsCurriculum) {
        pageContents.push({ url: page.url, text: page.text });
        fetched++;
      }
    } catch {
      // Skip
    }
    await new Promise(r => setTimeout(r, 200));
  }

  if (pageContents.length === 0) {
    console.warn('[CurriculumScraper] No relevant curriculum pages found after fetching');
    return null;
  }

  // Use Claude to extract curriculum details
  const combinedText = pageContents
    .map(p => `--- SOURCE: ${p.url} ---\n${p.text}`)
    .join('\n\n')
    .slice(0, 20000);

  const prompt = `Extract the curriculum details for the "${programName}" program from these web pages scraped from ${institutionName}'s website.

WEB CONTENT:
${combinedText}

Extract:
1. Every course name and description in the program (e.g., "PHRM-110 Pharmacology Basics - Introduction to drug classifications...")
2. Key skills and competencies the program teaches
3. Total program hours or credits if mentioned

Return JSON:
{
  "courses": ["Course name - brief description", ...],
  "skills": ["Specific skill or topic taught", ...],
  "totalHours": 480 or null
}

RULES:
- Only extract courses actually IN this specific program, not the entire catalog
- Skills should be specific and canonical (e.g., "Aseptic Technique" not "pharmacy skills")
- If you can't find curriculum details, return empty arrays
- Return ONLY valid JSON`;

  const result = await callClaude(prompt, { maxTokens: 4000, temperature: 0.1 });

  try {
    const cleaned = result.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      courses: parsed.courses || [],
      skills: parsed.skills || [],
      totalHours: parsed.totalHours || undefined,
      sourceUrl: pageContents[0].url,
      scraped: true,
    };
  } catch {
    console.error('[CurriculumScraper] Failed to parse curriculum extraction');
    return null;
  }
}
