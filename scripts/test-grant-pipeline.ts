import { config } from 'dotenv';
config({ path: '.env.local' });
import { runGrantFinder } from '../lib/stages/grant-finder/orchestrator';

async function main() {
  console.log('Starting Grant Intelligence Scan for Valencia College...');
  const result = await runGrantFinder({
    collegeName: "Valencia College",
    state: "Florida",
    city: "Orlando",
    programFocusAreas: ["healthcare", "IT/cybersecurity", "hospitality", "advanced manufacturing"],
  });
  
  const fs = await import('fs');
  fs.writeFileSync('/tmp/grant-test-output.json', JSON.stringify(result, null, 2));
  console.log('Output written to /tmp/grant-test-output.json');
  
  if (result.report?.fullMarkdown) {
    fs.writeFileSync('/tmp/grant-test-report.md', result.report.fullMarkdown);
    console.log('Report written to /tmp/grant-test-report.md');
  }
  
  console.log('Status:', result.status);
  console.log('Grants found:', result.grants?.length);
  console.log('Priority grants:', result.grants?.filter((g: any) => g.matchTier === 'priority').length);
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
