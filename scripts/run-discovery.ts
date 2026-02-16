import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
import { orchestrateDiscovery } from '../lib/agents/discovery/orchestrator';
import { generateDiscoveryReport } from '../lib/reports/discovery-report';
import { writeFileSync } from 'fs';

async function main() {
  const input = {
    projectId: crypto.randomUUID(),
    institutionName: process.argv[2] || 'Wayne County Community College District',
    geographicArea: process.argv[3] || 'Detroit, Michigan',
    currentPrograms: (process.argv[4] || '').split(',').filter(Boolean),
  };

  console.log(`\n🔍 Program Discovery Report`);
  console.log(`📍 Institution: ${input.institutionName}`);
  console.log(`🌎 Region: ${input.geographicArea}`);
  if (input.currentPrograms.length) {
    console.log(`📋 Current Programs: ${input.currentPrograms.join(', ')}`);
  }
  console.log(`\nProject ID: ${input.projectId}\n`);

  const startTime = Date.now();

  try {
    const result = await orchestrateDiscovery(input);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ DISCOVERY COMPLETE — ${elapsed}s total`);
    console.log(`📊 Status: ${result.status}`);
    console.log(`📋 Programs Found: ${result.programRecommendations?.length || 0}`);
    if (result.errors.length) {
      console.log(`⚠️  Errors: ${result.errors.join(', ')}`);
    }

    // Generate report
    if (result.programRecommendations?.length) {
      const report = generateDiscoveryReport(result);
      const outPath = `/Users/matt/Desktop/Discovery-Report-${input.geographicArea.replace(/[^a-zA-Z]/g, '-')}.md`;
      writeFileSync(outPath, report);
      console.log(`📄 Report: ${outPath}`);
    }

    console.log(`${'='.repeat(60)}\n`);

    // Print top 5 quick summary
    if (result.programRecommendations?.length) {
      console.log(`\n🏆 Top 5 Program Opportunities:\n`);
      result.programRecommendations.slice(0, 5).forEach((prog, i) => {
        console.log(`  ${i + 1}. ${prog.programName} (Score: ${prog.opportunityScore}/10)`);
        console.log(`     ${prog.rationale || ''}\n`);
      });
    }
  } catch (err: any) {
    console.error(`\n❌ DISCOVERY FAILED: ${err.message}`);
    console.error(err.stack);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
