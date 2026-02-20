import { config } from 'dotenv';
config({ path: '.env.local' });
import { runComplianceGap } from '../lib/stages/compliance-gap/orchestrator';

async function main() {
  console.log('Starting Program Gap Audit for Hawkeye Community College...');
  const result = await runComplianceGap({
    collegeName: "Hawkeye Community College",
    state: "Iowa",
    city: "Waterloo",
  });
  
  const fs = await import('fs');
  fs.writeFileSync('/tmp/gap-test-output.json', JSON.stringify(result, null, 2));
  console.log('Output written to /tmp/gap-test-output.json');
  
  if (result.report) {
    fs.writeFileSync('/tmp/gap-test-report.md', result.report);
    console.log('Report written to /tmp/gap-test-report.md');
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('Status:', result.metadata.errors.length === 0 ? 'SUCCESS' : 'ERRORS');
  console.log('Programs mandated:', result.stats.totalMandated);
  console.log('Currently offered:', result.stats.currentlyOffered);
  console.log('Gaps:', result.stats.gaps);
  console.log('High-priority gaps:', result.stats.highPriorityGaps);
  console.log('Est. annual revenue:', '$' + result.stats.estimatedAnnualRevenue.toLocaleString());
  console.log('Duration:', result.metadata.durationSeconds + 's');
  if (result.metadata.errors.length > 0) {
    console.log('Errors:', result.metadata.errors);
  }
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
