/**
 * Test the full Discovery → Validation pipeline
 * 
 * Run: npx tsx test-pipeline.ts
 * 
 * Tests the handoff mapping without running full validation
 * (validation requires API keys and takes 30+ minutes).
 * Use --full to run the complete pipeline.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { discoveryToValidationProject, buildDiscoveryContext } from './lib/stages/handoff';
import type { DiscoveryOutput } from './lib/stages/discovery/orchestrator';

const CACHE_PATH = '/tmp/discovery-data-kirkwood.json';
const HANDOFF_OUTPUT_PATH = '/tmp/handoff-test.json';

async function main() {
  const fullMode = process.argv.includes('--full');

  console.log('═══════════════════════════════════════════════════');
  console.log('  TESTING DISCOVERY → VALIDATION HANDOFF');
  console.log(`  Mode: ${fullMode ? 'FULL PIPELINE' : 'HANDOFF ONLY (dry run)'}`);
  console.log('═══════════════════════════════════════════════════\n');

  // ── Load or run Discovery ──
  let discoveryData: DiscoveryOutput['structuredData'];

  if (existsSync(CACHE_PATH)) {
    try {
      discoveryData = JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
      console.log(`✓ Loaded cached Discovery data from ${CACHE_PATH}`);
    } catch {
      console.log('✗ Cache file corrupted, running Discovery...');
      discoveryData = await runDiscoveryFresh();
    }
  } else {
    console.log(`No cached data at ${CACHE_PATH}, running Discovery...`);
    discoveryData = await runDiscoveryFresh();
  }

  // Build a DiscoveryOutput wrapper
  const discoveryOutput: DiscoveryOutput = {
    status: 'success',
    brief: null,
    structuredData: discoveryData,
    metadata: {
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: 0,
      totalSearches: 0,
      phaseTiming: {},
      errors: [],
    },
  };

  // ── Test handoff for top scored opportunity ──
  const scoredOpps = discoveryData.scoredOpportunities?.scoredOpportunities || [];
  const blueOceanOpps = discoveryData.blueOceanResults?.hiddenOpportunities || [];

  console.log(`\nFound ${scoredOpps.length} scored opportunities, ${blueOceanOpps.length} blue ocean opportunities\n`);

  if (scoredOpps.length > 0) {
    const topOpp = scoredOpps[0];
    console.log(`── Mapping top scored opportunity: "${topOpp.programTitle}" ──`);
    console.log(`   Occupation: ${topOpp.targetOccupation}`);
    console.log(`   SOC: ${topOpp.socCode}`);
    console.log(`   Tier: ${topOpp.tier}`);
    console.log(`   Composite Score: ${topOpp.scores?.composite}/10\n`);

    const project = discoveryToValidationProject(topOpp, discoveryOutput);
    console.log('Validation Project:');
    console.log(JSON.stringify(project, null, 2));

    const context = buildDiscoveryContext(topOpp, discoveryOutput);
    console.log('\nDiscovery Context for Validation:');
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'string') {
        const preview = value.length > 100 ? value.slice(0, 100) + '...' : value;
        console.log(`  ${key}: ${preview}`);
      } else if (Array.isArray(value)) {
        console.log(`  ${key}: [${value.length} items]`);
      }
    }

    // Save full context for review
    writeFileSync(HANDOFF_OUTPUT_PATH, JSON.stringify({ project, context }, null, 2));
    console.log(`\n✓ Full handoff data saved to ${HANDOFF_OUTPUT_PATH}`);
  }

  // ── Test Blue Ocean handoff ──
  if (blueOceanOpps.length > 0) {
    const topBO = blueOceanOpps[0];
    console.log(`\n── Mapping top Blue Ocean: "${topBO.programTitle}" ──`);
    console.log(`   Occupation: ${topBO.targetOccupation}`);
    console.log(`   Discovery Method: ${topBO.discoveryMethod}`);
    console.log(`   Composite Score: ${topBO.scores?.composite}/10\n`);

    const project = discoveryToValidationProject(topBO, discoveryOutput);
    console.log('Blue Ocean Validation Project:');
    console.log(JSON.stringify(project, null, 2));

    const context = buildDiscoveryContext(topBO, discoveryOutput);
    console.log(`\n  allEvidence: [${context.allEvidence.length} items]`);
    if (context.allEvidence.length > 0) {
      console.log(`    Example: "${context.allEvidence[0].point}" (${context.allEvidence[0].source})`);
    }
  }

  // ── Test all opportunities ──
  console.log('\n── All Opportunity Mappings ──\n');

  for (let i = 0; i < Math.min(scoredOpps.length, 8); i++) {
    const opp = scoredOpps[i];
    const project = discoveryToValidationProject(opp, discoveryOutput);
    console.log(`  ${i + 1}. "${opp.programTitle}" → sector="${project.sector}", level="${project.level}", soc="${project.soc_code}"`);
  }

  for (let i = 0; i < Math.min(blueOceanOpps.length, 5); i++) {
    const opp = blueOceanOpps[i];
    const project = discoveryToValidationProject(opp, discoveryOutput);
    console.log(`  BO${i + 1}. "${opp.programTitle}" → sector="${project.sector}", level="${project.level}", soc="${project.soc_code}"`);
  }

  // ── Full pipeline mode ──
  if (fullMode) {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  RUNNING FULL PIPELINE (this will take 30+ min)');
    console.log('═══════════════════════════════════════════════════\n');

    const { runPipeline } = await import('./lib/stages/pipeline');

    const result = await runPipeline({
      discoveryInput: {
        collegeName: 'Kirkwood Community College',
        serviceRegion: {
          primaryCity: 'Cedar Rapids',
          additionalCities: ['Iowa City', 'Coralville', 'Marion'],
          metroArea: 'Cedar Rapids-Iowa City Corridor',
          counties: 'Linn, Johnson, Benton, Iowa, Jones, Cedar, Washington',
          state: 'Iowa',
        },
      },
      discoveryOutput,
      programsToValidate: [0], // Just the top opportunity
      maxValidations: 1,
    }, (event) => {
      console.log(`  [${event.stage}] ${event.message} [${event.elapsed}s]`);
    });

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  PIPELINE RESULTS');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Discovery: ${result.discovery.status}`);
    console.log(`  Validations: ${result.validations.length}`);
    for (const v of result.validations) {
      console.log(`    - ${v.programTitle}: ${v.status}${v.error ? ` (${v.error})` : ''}`);
      if (v.status === 'success' && v.validationResult?.programScore) {
        const score = v.validationResult.programScore;
        console.log(`      Score: ${score.compositeScore}/10 — ${score.recommendation}`);
      }
    }
    console.log(`  Total duration: ${Math.round(result.metadata.totalDuration / 1000)}s`);

    // Save full results
    const resultsPath = '/tmp/pipeline-results.json';
    writeFileSync(resultsPath, JSON.stringify(result, null, 2));
    console.log(`\n✓ Full results saved to ${resultsPath}`);
  }

  console.log('\n✓ Test complete');
}

async function runDiscoveryFresh(): Promise<DiscoveryOutput['structuredData']> {
  const { runDiscovery } = await import('./lib/stages/discovery/orchestrator');

  const result = await runDiscovery({
    collegeName: 'Kirkwood Community College',
    serviceRegion: {
      primaryCity: 'Cedar Rapids',
      additionalCities: ['Iowa City', 'Coralville', 'Marion'],
      metroArea: 'Cedar Rapids-Iowa City Corridor',
      counties: 'Linn, Johnson, Benton, Iowa, Jones, Cedar, Washington',
      state: 'Iowa',
    },
  });

  // Cache for next run
  writeFileSync(CACHE_PATH, JSON.stringify(result.structuredData, null, 2));
  console.log(`✓ Cached Discovery data to ${CACHE_PATH}`);

  return result.structuredData;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
