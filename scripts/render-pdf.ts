import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { readFileSync, copyFileSync } from 'fs';
import { generatePDF } from '../lib/pdf/generate-pdf';

async function main() {
  const mdPath = '/Users/matt/Desktop/Kirkwood-PharmTech-Validation-Report.md';
  const pdfPath = '/Users/matt/Library/Mobile Documents/com~apple~CloudDocs/Wavelength/Kirkwood-PharmTech-Validation-Report.pdf';
  const desktopPdf = '/Users/matt/Desktop/Kirkwood-PharmTech-Validation-Report.pdf';
  
  let markdown = readFileSync(mdPath, 'utf-8');
  
  // ── Clean markdown for PDF pipeline ──
  // The report-generator outputs markdown with its own cover page, TOC, and page breaks.
  // The PDF template (template.ts) generates its own branded cover + TOC.
  // We need to strip the markdown's versions to avoid duplication.
  
  // 1. Strip YAML frontmatter (md-to-pdf specific)
  markdown = markdown.replace(/^---[\s\S]*?---\n/, '');
  
  // 2. Strip the HTML cover page div (everything from first <div to the closing </div> + page break)
  markdown = markdown.replace(/<div style="text-align:center[^>]*>[\s\S]*?<\/div>\s*<div style="page-break-after:\s*always;?\s*"><\/div>/i, '');
  
  // 3. Strip the markdown Table of Contents section
  markdown = markdown.replace(/^# Table of Contents\n[\s\S]*?<div style="page-break-after:\s*always;?\s*"><\/div>/m, '');
  
  // 4. Strip ALL inline page break divs (CSS handles page breaks on h2 elements)
  markdown = markdown.replace(/<div style="page-break-after:\s*always;?\s*"><\/div>\s*/g, '');
  
  // 5. Downgrade H1 → H2 for main sections (PDF template TOC extracts h2 elements,
  //    and CSS puts page-break-before: always on h2)
  //    But keep ## (H2) as ### (H3) to preserve hierarchy
  markdown = markdown.replace(/^### /gm, '#### ');  // H3 → H4 first (avoid double-downgrade)
  markdown = markdown.replace(/^## /gm, '### ');     // H2 → H3
  markdown = markdown.replace(/^# /gm, '## ');       // H1 → H2
  
  // 6. Clean up excessive blank lines from stripping
  markdown = markdown.replace(/\n{4,}/g, '\n\n');
  markdown = markdown.trim();
  
  console.log('🖨️  Rendering PDF...');
  const result = await generatePDF(markdown, {
    title: 'Pharmacy Technician Certificate',
    subtitle: 'Program Validation Report',
    preparedFor: 'Kirkwood Community College',
    date: 'February 23, 2026',
    reportType: 'validation',
    outputPath: pdfPath,
  });
  
  console.log(`✅ PDF: ${result.path}`);
  console.log(`   Pages: ${result.pageCount} | Size: ${result.sizeKB}KB`);
  
  // Copy to desktop too
  copyFileSync(pdfPath, desktopPdf);
  console.log(`📋 Also copied to Desktop`);
}

main().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
