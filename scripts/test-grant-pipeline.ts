/**
 * Test: Grant Intelligence Scan Pipeline
 * 
 * Run with: DOTENV_CONFIG_PATH=.env.local npx tsx --require dotenv/config scripts/test-grant-pipeline.ts
 */
import { runGrantFinder } from '../lib/stages/grant-finder/orchestrator';
import { writeFileSync } from 'fs';

async function main() {
  const requiredKeys = ['ANTHROPIC_API_KEY', 'SERPAPI_KEY'];
  for (const key of requiredKeys) {
    if (!process.env[key]) {
      console.error(`ERROR: ${key} not set. Run with: DOTENV_CONFIG_PATH=.env.local npx tsx --require dotenv/config scripts/test-grant-pipeline.ts`);
      process.exit(1);
    }
  }

  console.log('Starting Grant Intelligence Scan for Valencia College...');
  console.log('API keys verified: ANTHROPIC, SERPAPI');

  const result = await runGrantFinder({
    collegeName: "Valencia College",
    state: "Florida",
    city: "Orlando",
    programFocusAreas: ["healthcare", "IT/cybersecurity", "hospitality", "advanced manufacturing"],
  });

  writeFileSync('/tmp/grant-test-output.json', JSON.stringify(result, null, 2));
  console.log('\nOutput written to /tmp/grant-test-output.json');

  if (result.report?.fullMarkdown) {
    writeFileSync('/tmp/grant-test-report.md', result.report.fullMarkdown);
    console.log('Report written to /tmp/grant-test-report.md');
  }

  console.log('\n=== RESULTS ===');
  console.log('Status:', result.status);
  console.log('Grants found:', result.grants?.length ?? 0);
  console.log('Priority:', result.grants?.filter((g: any) => g.matchTier === 'priority').length ?? 0);
  console.log('Strategic:', result.grants?.filter((g: any) => g.matchTier === 'strategic').length ?? 0);
  console.log('Duration:', result.metadata?.durationSeconds, 'seconds');
  console.log('Errors:', result.errors?.length ?? 0);
  if (result.errors?.length) {
    result.errors.forEach(e => console.log('  -', e));
  }
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
