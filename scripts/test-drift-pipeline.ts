import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { runDriftScan } from '../lib/stages/drift-monitor/orchestrator';
import type { DriftProgram } from '../lib/stages/drift-monitor/types';

async function main() {
  console.log('Starting Curriculum Drift Analysis for Bellevue University Cybersecurity...');
  
  const program: DriftProgram = {
    institutionName: "Bellevue University",
    programName: "Cybersecurity",
    occupationTitle: "Information Security Analyst",
    socCode: "15-1212",
    state: "Nebraska",
    collegeUrl: "https://www.bellevue.edu",
    curriculumDescription: "", // empty — should trigger auto-scraping
  };
  
  const { result, employerSkills, reportHtml } = await runDriftScan(program);
  
  const fs = await import('fs');
  fs.writeFileSync('/tmp/drift-test-output.json', JSON.stringify({ result, employerSkills }, null, 2));
  fs.writeFileSync('/tmp/drift-test-report.html', reportHtml);
  console.log('Output written to /tmp/drift-test-output.json');
  console.log('Report written to /tmp/drift-test-report.html');
  
  console.log('Drift Score:', result.driftScore, '/ 100');
  console.log('Drift Level:', result.driftLevel);
  console.log('Postings Analyzed:', result.postingsAnalyzed);
  console.log('Covered Skills:', result.coveredSkills.length);
  console.log('Gap Skills:', result.gapSkills.length);
  console.log('O*NET used:', result.onetSkillsUsed || false);
  console.log('O*NET gaps:', result.onetGaps?.length || 0);
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
