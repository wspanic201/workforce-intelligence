import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';
import { join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Dynamic import after env is loaded
const { runDriftScan } = await import('../lib/stages/drift-monitor/orchestrator.ts');

// Test with a real program — Pharmacy Tech at Kirkwood Community College
const testProgram = {
  institutionName: 'Kirkwood Community College',
  programName: 'Pharmacy Technician Certificate',
  occupationTitle: 'Pharmacy Technician',
  socCode: '29-2052',
  curriculumDescription: `
- Pharmacy law and ethics
- Drug classifications and pharmacology basics
- Prescription processing and dispensing
- Compounding sterile and non-sterile preparations
- Medication safety and error prevention
- Inventory management and ordering
- Insurance billing and third-party processing
- ICD-10 coding basics
- PTCB exam preparation
- Customer service and communication
- Basic computer skills for pharmacy management software
  `.trim(),
  lastCurriculumUpdate: '2023-08-01',
  contactEmail: 'test@kirkwood.edu',
};

console.log('🔍 Running drift scan for:', testProgram.programName);
console.log('─'.repeat(60));

try {
  const { result, reportHtml } = await runDriftScan(testProgram);

  console.log('\n📊 DRIFT SCAN RESULTS');
  console.log('─'.repeat(60));
  console.log(`Drift Score: ${result.driftScore}/100 (${result.driftLevel.toUpperCase()})`);
  console.log(`Postings analyzed: ${result.postingsAnalyzed}`);
  console.log(`\nGAPS (${result.gapSkills.length} skills missing):`);
  result.gapSkills.forEach(s => console.log(`  ✗ ${s}`));
  console.log(`\nCOVERED (${result.coveredSkills.length} skills matched):`);
  result.coveredSkills.forEach(s => console.log(`  ✓ ${s}`));
  console.log('\nNARRATIVE:');
  console.log(result.narrative.slice(0, 500) + '...');
  console.log('\nRECOMMENDATIONS:');
  result.recommendations.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));

  // Save HTML report
  const htmlPath = join(process.env.HOME, 'Desktop/drift-test-report.html');
  writeFileSync(htmlPath, reportHtml);
  console.log(`\n✅ HTML report saved: ${htmlPath}`);

} catch (err) {
  console.error('❌ Drift scan failed:', err);
  process.exit(1);
}
