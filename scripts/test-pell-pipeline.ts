/**
 * Test: Pell Readiness Check Pipeline
 * 
 * Run with: DOTENV_CONFIG_PATH=.env.local npx tsx --require dotenv/config scripts/test-pell-pipeline.ts
 */
import { runPellAudit } from '../lib/stages/pell-audit/orchestrator';
import { writeFileSync } from 'fs';

async function main() {
  // Verify env vars loaded
  const requiredKeys = ['ANTHROPIC_API_KEY', 'SERPAPI_KEY', 'BLS_API_KEY'];
  for (const key of requiredKeys) {
    if (!process.env[key]) {
      console.error(`ERROR: ${key} not set. Run with: DOTENV_CONFIG_PATH=.env.local npx tsx --require dotenv/config scripts/test-pell-pipeline.ts`);
      process.exit(1);
    }
  }

  console.log('Starting Pell Readiness Check for Pima Community College...');
  console.log('API keys verified: ANTHROPIC, SERPAPI, BLS');

  const result = await runPellAudit({
    collegeName: "Pima Community College",
    state: "Arizona",
    city: "Tucson",
  }, (event) => {
    console.log(`  Phase ${event.phase}: ${event.phaseName} — ${event.status} (${event.elapsed}s)`);
  });

  writeFileSync('/tmp/pell-test-output.json', JSON.stringify(result, null, 2));
  console.log('\nOutput written to /tmp/pell-test-output.json');

  if (result.report?.fullMarkdown) {
    writeFileSync('/tmp/pell-test-report.md', result.report.fullMarkdown);
    console.log('Report written to /tmp/pell-test-report.md');
  }

  console.log('\n=== RESULTS ===');
  console.log('Status:', result.status);
  console.log('Total programs found:', result.structuredData?.classification?.summary?.totalPrograms ?? 'N/A');
  console.log('Pell ready:', result.structuredData?.pellScoring?.institutionSummary?.pellReady ?? 'N/A');
  console.log('Likely ready:', result.structuredData?.pellScoring?.institutionSummary?.likelyReady ?? 'N/A');
  console.log('Gaps identified:', result.structuredData?.gapAnalysis?.gaps?.length ?? 'N/A');
  console.log('Duration:', result.metadata?.durationSeconds, 'seconds');
  console.log('Errors:', result.metadata?.errors?.length ?? 0);
  if (result.metadata?.errors?.length) {
    result.metadata.errors.forEach(e => console.log('  -', e));
  }
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
