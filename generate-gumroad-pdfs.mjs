import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_DIR = path.join(process.env.HOME, 'Desktop/Gumroad-Products');
const OUTPUT_DIR = path.join(BASE_DIR, 'pdfs');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Find all HTML files in product folders
const htmlFiles = [];
const productFolders = fs.readdirSync(BASE_DIR).filter(f => {
  return fs.statSync(path.join(BASE_DIR, f)).isDirectory() && /^\d+/.test(f);
});

for (const folder of productFolders) {
  const folderPath = path.join(BASE_DIR, folder);
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.html'));
  // Create matching output subfolder
  const outFolder = path.join(OUTPUT_DIR, folder);
  fs.mkdirSync(outFolder, { recursive: true });
  for (const file of files) {
    htmlFiles.push({
      htmlPath: path.join(folderPath, file),
      pdfPath: path.join(outFolder, file.replace('.html', '.pdf')),
      name: file.replace('.html', ''),
      folder,
    });
  }
}

console.log(`Found ${htmlFiles.length} files across ${productFolders.length} product folders\n`);

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

let success = 0;
let failed = 0;
let currentFolder = '';

for (const { htmlPath, pdfPath, name, folder } of htmlFiles) {
  if (folder !== currentFolder) {
    currentFolder = folder;
    console.log(`\n📁 ${folder}`);
  }
  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    await page.close();
    const size = Math.round(fs.statSync(pdfPath).size / 1024);
    console.log(`  ✅ ${name}.pdf (${size} KB)`);
    success++;
  } catch (err) {
    console.error(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

await browser.close();
console.log(`\nDone: ${success} succeeded, ${failed} failed`);
console.log(`PDFs saved to: ${OUTPUT_DIR}`);
