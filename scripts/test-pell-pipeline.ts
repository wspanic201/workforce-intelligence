import { config } from 'dotenv';
config({ path: '.env.local' });
import { runPellAudit } from '../lib/stages/pell-audit/orchestrator';
import { writeFileSync } from 'fs';

async function main() {
  console.log('Starting Pell Readiness Check for Pima Community College...');
  console.log('Time:', new Date().toISOString());
  
  const result = await runPellAudit(
    {
      collegeName: "Pima Community College",
      state: "Arizona",
      city: "Tucson",
    },
    (event) => {
      console.log(`[Phase ${event.phase}] ${event.status}: ${event.message} (${(event.elapsed/1000).toFixed(1)}s)`);
    }
  );
  
  writeFileSync('/tmp/pell-test-output.json', JSON.stringify(result, null, 2));
  console.log('\nOutput written to /tmp/pell-test-output.json');
  
  if (result.report?.fullMarkdown) {
    writeFileSync('/tmp/pell-test-report.md', result.report.fullMarkdown);
    console.log('Report written to /tmp/pell-test-report.md');
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('Status:', result.status);
  console.log('Total programs found:', result.structuredData?.classification?.summary?.totalPrograms);
  console.log('Pell ready:', result.structuredData?.pellScoring?.institutionSummary?.pellReady);
  console.log('Duration:', result.metadata?.durationSeconds, 'seconds');
  console.log('Errors:', result.metadata?.errors?.length || 0);
  if (result.metadata?.errors?.length) {
    result.metadata.errors.forEach((e: string) => console.log('  -', e));
  }
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
