/**
 * Test: Curriculum Drift Analysis Pipeline
 * 
 * Run with: DOTENV_CONFIG_PATH=.env.local npx tsx --require dotenv/config scripts/test-drift-pipeline.ts
 */
import { runDriftScan } from '../lib/stages/drift-monitor/orchestrator';
import type { DriftProgram } from '../lib/stages/drift-monitor/types';
import { writeFileSync } from 'fs';

async function main() {
  const requiredKeys = ['ANTHROPIC_API_KEY', 'SERPAPI_KEY'];
  for (const key of requiredKeys) {
    if (!process.env[key]) {
      console.error(`ERROR: ${key} not set. Run with: DOTENV_CONFIG_PATH=.env.local npx tsx --require dotenv/config scripts/test-drift-pipeline.ts`);
      process.exit(1);
    }
  }

  console.log('Starting Curriculum Drift Analysis for Bellevue University Cybersecurity...');
  console.log('API keys verified: ANTHROPIC, SERPAPI');
  console.log('O*NET key:', process.env.ONET_API_KEY ? 'SET' : 'NOT SET (O*NET features will be skipped)');

  const program: DriftProgram = {
    institutionName: "Bellevue University",
    programName: "Cybersecurity",
    occupationTitle: "Information Security Analyst",
    socCode: "15-1212",
    state: "Nebraska",
    collegeUrl: "https://www.bellevue.edu",
    curriculumDescription: "", // empty — triggers auto-scraping
  };

  const { result, employerSkills, reportHtml } = await runDriftScan(program);

  writeFileSync('/tmp/drift-test-output.json', JSON.stringify({ result, employerSkills }, null, 2));
  writeFileSync('/tmp/drift-test-report.html', reportHtml);
  console.log('\nOutput written to /tmp/drift-test-output.json');
  console.log('HTML report written to /tmp/drift-test-report.html');

  console.log('\n=== RESULTS ===');
  console.log('Drift Score:', result.driftScore, '/ 100');
  console.log('Drift Level:', result.driftLevel);
  console.log('Postings Analyzed:', result.postingsAnalyzed);
  console.log('Covered Skills:', result.coveredSkills.length, '—', result.coveredSkills.slice(0, 5).join(', '));
  console.log('Gap Skills:', result.gapSkills.length, '—', result.gapSkills.slice(0, 5).join(', '));
  console.log('Stale Skills:', result.staleSkills.length);
  console.log('O*NET used:', result.onetSkillsUsed || false);
  console.log('O*NET gaps:', result.onetGaps?.length || 0);
  console.log('Recommendations:', result.recommendations.length);
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
