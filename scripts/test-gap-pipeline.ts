/**
 * Test: Program Gap Audit Pipeline
 * 
 * Run with: DOTENV_CONFIG_PATH=.env.local npx tsx --require dotenv/config scripts/test-gap-pipeline.ts
 */
import { runComplianceGap } from '../lib/stages/compliance-gap/orchestrator';
import { writeFileSync } from 'fs';

async function main() {
  const requiredKeys = ['ANTHROPIC_API_KEY', 'SERPAPI_KEY'];
  for (const key of requiredKeys) {
    if (!process.env[key]) {
      console.error(`ERROR: ${key} not set. Run with: DOTENV_CONFIG_PATH=.env.local npx tsx --require dotenv/config scripts/test-gap-pipeline.ts`);
      process.exit(1);
    }
  }

  console.log('Starting Program Gap Audit for Hawkeye Community College...');
  console.log('API keys verified: ANTHROPIC, SERPAPI');

  const result = await runComplianceGap({
    collegeName: "Hawkeye Community College",
    state: "Iowa",
    city: "Waterloo",
  });

  writeFileSync('/tmp/gap-test-output.json', JSON.stringify(result, null, 2));
  console.log('\nOutput written to /tmp/gap-test-output.json');

  if (result.report) {
    writeFileSync('/tmp/gap-test-report.md', result.report);
    console.log('Report written to /tmp/gap-test-report.md');
  }

  console.log('\n=== RESULTS ===');
  console.log('Status:', result.metadata?.errors?.length ? 'partial' : 'success');
  console.log('Mandated programs:', result.stats?.totalMandated);
  console.log('Currently offered:', result.stats?.currentlyOffered);
  console.log('Gaps:', result.stats?.gaps);
  console.log('Year 1 revenue:', '$' + (result.stats?.estimatedAnnualRevenue ?? 0).toLocaleString());
  console.log('High priority gaps:', result.stats?.highPriorityGaps);
  console.log('Duration:', result.metadata?.durationSeconds, 'seconds');
  console.log('Errors:', result.metadata?.errors?.length ?? 0);
  if (result.metadata?.errors?.length) {
    result.metadata.errors.forEach((e: string) => console.log('  -', e));
  }
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
