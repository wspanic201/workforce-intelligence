/**
 * Re-run grant brief writer using cached scored grants.
 * Only re-runs Agents 2, 4, 5 (Past Awards, Requirements, Brief Writer).
 */
import { readFileSync, writeFileSync } from 'fs';
import { config } from 'dotenv';
config({ path: '.env.local' });

// Use dynamic import to work around ESM/tsx resolution
const { analyzePastAwards } = await import('./lib/stages/grant-finder/agents/past-award-analyzer.js');
const { analyzeRequirements } = await import('./lib/stages/grant-finder/agents/requirements-analyzer.js');
const { writeGrantBrief } = await import('./lib/stages/grant-finder/agents/grant-brief-writer.js');

const cached = JSON.parse(readFileSync('/Users/matt/.workforceos/grant-finder-kirkwood-community-college.json', 'utf8'));
const input = cached.input;
const scoredGrants = cached.output.grants;

console.log(`Loaded ${scoredGrants.length} scored grants from cache`);
console.log(`Priority: ${scoredGrants.filter(g => g.matchTier === 'priority').length}`);
console.log(`Strategic: ${scoredGrants.filter(g => g.matchTier === 'strategic').length}`);

// ── Agent 2: Past Award Analysis (re-run) ──
console.log('\n── Agent 2: Past Award Analysis ──');
const topGrants = scoredGrants
  .filter(g => g.matchTier === 'priority' || g.matchTier === 'strategic')
  .sort((a, b) => (b.scores?.composite || 0) - (a.scores?.composite || 0))
  .slice(0, 12);

let pastAwards = [];
try {
  const paResult = await analyzePastAwards(topGrants);
  pastAwards = paResult.awards;
  console.log(`Past awards: ${pastAwards.filter(a => a.pastRecipients?.length > 0).length} with data`);
} catch (e) {
  console.warn('Past awards failed, continuing without:', e.message);
}

// ── Agent 4: Requirements Analysis (re-run) ──
console.log('\n── Agent 4: Requirements Analysis ──');
let requirements = [];
try {
  const reqResult = await analyzeRequirements(topGrants, 8);
  requirements = reqResult.requirements;
  console.log(`Requirements analyzed: ${reqResult.grantsAnalyzed}`);
} catch (e) {
  console.warn('Requirements failed, continuing without:', e.message);
}

// ── Agent 5: Brief Writer (re-run with 32K tokens) ──
console.log('\n── Agent 5: Brief Writer ──');
const briefInput = {
  collegeName: input.college,
  state: input.state,
  city: input.city,
  programFocusAreas: Array.isArray(input.focusAreas) ? input.focusAreas : (input.focusAreas?.split?.(',') || ['manufacturing', 'healthcare', 'IT']),
  institutionProfile: {
    currentPrograms: Array.isArray(input.focusAreas) ? input.focusAreas : (input.focusAreas?.split?.(',') || ['manufacturing', 'healthcare', 'IT']),
    strategicPriorities: ['workforce development', 'industry partnerships', 'student success'],
    recentGrants: [],
    studentBodySize: 15000,
    region: `${input.city}, ${input.state}`,
  },
  scoredGrants,
  pastAwards,
  requirements,
};

const brief = await writeGrantBrief(briefInput);
console.log(`\n✅ Report: ${brief.wordCount} words, ~${brief.pageEstimate} pages`);

// Save markdown
const outPath = '/Users/matt/Desktop/Grant-Intelligence-Kirkwood-Community-College-2026-02-18.md';
writeFileSync(outPath, brief.fullMarkdown);
console.log(`Saved: ${outPath}`);

// Update cache
cached.output.report = brief;
writeFileSync('/Users/matt/.workforceos/grant-finder-kirkwood-community-college.json', JSON.stringify(cached, null, 2));
console.log('Cache updated');
