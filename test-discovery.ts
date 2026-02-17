/**
 * Test Discovery Pipeline
 * Run: npx tsx test-discovery.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { runDiscovery } from './lib/stages/discovery/orchestrator';
import { writeFileSync } from 'fs';

async function main() {
  console.log('Starting Discovery Pipeline Test...\n');

  // Test with Kirkwood Community College — Matt knows this one inside out
  // Using multi-region input: CR + Iowa City corridor
  const result = await runDiscovery(
    {
      collegeName: 'Kirkwood Community College',
      serviceRegion: {
        primaryCity: 'Cedar Rapids',
        additionalCities: ['Iowa City', 'Coralville', 'Marion'],
        metroArea: 'Cedar Rapids-Iowa City Corridor',
        counties: 'Linn, Johnson, Benton, Iowa, Jones, Cedar, Washington',
        state: 'Iowa',
      },
      focusAreas: 'Healthcare, Manufacturing, Technology, Skilled Trades',
      additionalContext: 'Kirkwood is the largest community college in Iowa. Strong existing healthcare and manufacturing programs. The service area spans two distinct metro areas: Cedar Rapids (aerospace/manufacturing) and Iowa City (university/healthcare). Looking for new workforce development opportunities.',
    },
    (event) => {
      // Progress callback
      const icon = event.status === 'complete' ? '✅' : event.status === 'error' ? '❌' : '⏳';
      console.log(`${icon} Phase ${event.phase}: ${event.phaseName} — ${event.message} [${event.elapsed}s]`);
    }
  );

  // Save results
  console.log('\n--- RESULTS ---');
  console.log(`Status: ${result.status}`);
  console.log(`Duration: ${result.metadata.durationSeconds}s`);
  console.log(`Total Searches: ${result.metadata.totalSearches}`);
  console.log(`Phase Timing:`, result.metadata.phaseTiming);

  if (result.metadata.errors.length > 0) {
    console.log(`\nErrors:`);
    result.metadata.errors.forEach(e => console.log(`  - ${e}`));
  }

  if (result.brief) {
    console.log(`\nBrief: ${result.brief.wordCount} words, ~${result.brief.pageEstimate} pages`);
    
    // Save brief to file
    writeFileSync('/tmp/discovery-brief-kirkwood.md', result.brief.markdown);
    console.log('Brief saved to /tmp/discovery-brief-kirkwood.md');
  }

  // Save full structured data
  writeFileSync('/tmp/discovery-data-kirkwood.json', JSON.stringify(result.structuredData, null, 2));
  console.log('Structured data saved to /tmp/discovery-data-kirkwood.json');

  // Quick summary of findings
  const opps = result.structuredData.scoredOpportunities?.scoredOpportunities || [];
  if (opps.length > 0) {
    console.log(`\n--- TOP OPPORTUNITIES ---`);
    opps.forEach((opp, i) => {
      console.log(`${i + 1}. ${opp.programTitle} (${opp.scores.composite}/10) — ${opp.tier.replace(/_/g, ' ')}`);
      console.log(`   ${opp.description.slice(0, 120)}...`);
    });
  }

  // Blue Ocean hidden opportunities
  const blueOcean = result.structuredData.blueOceanResults;
  if (blueOcean && blueOcean.hiddenOpportunities.length > 0) {
    console.log(`\n--- HIDDEN OPPORTUNITIES (Blue Ocean) ---`);
    console.log(`Key Insight: ${blueOcean.keyInsight.slice(0, 200)}...`);
    blueOcean.hiddenOpportunities.forEach((opp, i) => {
      console.log(`${i + 1}. ${opp.programTitle} (${opp.scores.composite}/10) — ${opp.discoveryMethod.replace(/_/g, ' ')}`);
      console.log(`   ${opp.whyNonObvious.slice(0, 120)}...`);
    });
    console.log(`\nStrategies used:`);
    blueOcean.strategiesUsed.forEach(s => {
      console.log(`  - ${s.strategy}: ${s.searchCount} searches, ${s.findingsCount} findings`);
    });
  }
}

main().catch(console.error);
