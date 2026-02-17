/**
 * Test PDF generation
 * Run: npx tsx test-pdf.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { generatePDF } from './lib/pdf/generate-pdf';
import { readFileSync } from 'fs';

async function main() {
  // Load the Kirkwood Market Scan
  const markdown = readFileSync('/tmp/discovery-brief-kirkwood.md', 'utf8');

  console.log('📄 Generating PDF from Kirkwood Market Scan...');
  console.log(`   Input: ${(markdown.length / 1024).toFixed(1)} KB of markdown`);

  const startTime = Date.now();

  const result = await generatePDF(markdown, {
    title: 'Program Market Scan',
    subtitle: 'Workforce Opportunity Analysis',
    preparedFor: 'Kirkwood Community College',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    reportType: 'discovery',
    outputPath: '/tmp/kirkwood-discovery-brief.pdf',
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`✅ PDF generated: ${result.path}`);
  console.log(`   Pages: ${result.pageCount}`);
  console.log(`   Size: ${result.sizeKB} KB`);
  console.log(`   Time: ${elapsed}s`);
}

main().catch(console.error);
