import { readFileSync, writeFileSync } from 'fs';
import { config } from 'dotenv';
config({ path: '.env.local' });

// Dynamically import the brief writer
const { writeGrantBrief } = await import('./lib/stages/grant-finder/agents/grant-brief-writer.ts');

// Load cached run data
const cache = JSON.parse(readFileSync('/Users/matt/.workforceos/grant-finder-kirkwood-community-college.json', 'utf8'));

const { matchOutput, requirementsOutput } = cache;

console.log('Re-running Grant Brief Writer with 16K token limit...');
console.log(`  Scored grants: ${matchOutput.scoredGrants.length}`);
console.log(`  Requirements analyzed: ${requirementsOutput.requirements.length}`);

const startTime = Date.now();
const briefOutput = await writeGrantBrief(
  'Kirkwood Community College',
  'Iowa',
  'Cedar Rapids',
  ['manufacturing', 'healthcare', 'IT'],
  matchOutput,
  requirementsOutput
);

const elapsed = Math.round((Date.now() - startTime) / 1000);
console.log(`\n✅ Brief complete in ${elapsed}s`);
console.log(`  Words: ${briefOutput.wordCount}`);
console.log(`  Pages: ~${briefOutput.pageCount}`);

writeFileSync('/Users/matt/Desktop/Grant-Intelligence-Kirkwood-Community-College-2026-02-18.md', briefOutput.markdown);
console.log('\n✅ Report saved to Desktop');
