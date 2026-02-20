import { scanJobPostings } from './scanner';
import { extractEmployerSkills, extractCurriculumSkills } from './extractor';
import { calculateDriftScore } from './scorer';
import { generateDriftNarrative, generateDriftReportHTML } from './reporter';
import { scrapeCurriculum } from './curriculum-scraper';
import { getDriftLevel } from './types';
import type { DriftProgram, DriftScanResult, EmployerSkill } from './types';

export async function runDriftScan(program: DriftProgram): Promise<{
  result: DriftScanResult;
  employerSkills: EmployerSkill[];
  reportHtml: string;
}> {
  console.log(`[DriftMonitor] Starting scan for: ${program.programName} (${program.occupationTitle})`);

  // Step 0: Auto-scrape curriculum if not provided
  let curriculumText = program.curriculumDescription;
  if (!curriculumText || curriculumText.trim().length < 50) {
    console.log('[DriftMonitor] Step 0: No curriculum provided — auto-scraping from college website...');
    const scraped = await scrapeCurriculum(
      program.programName,
      program.institutionName,
      program.state,
      program.collegeUrl,
    );
    if (scraped && (scraped.courses.length > 0 || scraped.skills.length > 0)) {
      curriculumText = [
        ...scraped.courses.map(c => `Course: ${c}`),
        ...scraped.skills.map(s => `Skill: ${s}`),
      ].join('\n');
      console.log(`[DriftMonitor] Auto-scraped ${scraped.courses.length} courses and ${scraped.skills.length} skills from ${scraped.sourceUrl}`);
    } else {
      console.warn('[DriftMonitor] Auto-scrape failed — drift analysis will have limited accuracy');
      curriculumText = program.curriculumDescription || program.programName;
    }
  }

  // Step 1: Scan job postings
  console.log('[DriftMonitor] Step 1: Scanning job postings...');
  const postings = await scanJobPostings(program.occupationTitle, program.socCode);
  console.log(`[DriftMonitor] Found ${postings.length} postings`);

  // Step 2: Extract employer skills from postings
  console.log('[DriftMonitor] Step 2: Extracting employer skills...');
  const employerSkills = await extractEmployerSkills(postings);
  console.log(`[DriftMonitor] Identified ${employerSkills.length} employer skills`);

  // Step 3: Extract curriculum skills
  console.log('[DriftMonitor] Step 3: Parsing curriculum skills...');
  const curriculumSkills = await extractCurriculumSkills(curriculumText);
  console.log(`[DriftMonitor] Identified ${curriculumSkills.length} curriculum skills`);

  // Step 4: Calculate drift score
  console.log('[DriftMonitor] Step 4: Calculating drift score...');
  const { score, covered, gaps, stale } = await calculateDriftScore(employerSkills, curriculumSkills);
  const driftLevel = getDriftLevel(score);
  console.log(`[DriftMonitor] Drift Score: ${score}/100 (${driftLevel})`);

  // Step 5: Generate narrative
  console.log('[DriftMonitor] Step 5: Generating analysis narrative...');
  const partialResult = {
    scannedAt: new Date().toISOString(),
    postingsAnalyzed: postings.length,
    employerSkills,
    coveredSkills: covered,
    gapSkills: gaps,
    staleSkills: stale,
    driftScore: score,
    driftLevel,
  };

  const { narrative, recommendations } = await generateDriftNarrative(program, partialResult);

  const result: DriftScanResult = {
    ...partialResult,
    narrative,
    recommendations,
  };

  // Step 6: Generate HTML report
  const reportHtml = generateDriftReportHTML(program, result, employerSkills);

  console.log('[DriftMonitor] ✅ Drift scan complete');
  return { result, employerSkills, reportHtml };
}
