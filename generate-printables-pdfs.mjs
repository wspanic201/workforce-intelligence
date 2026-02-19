import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = path.join(process.env.HOME, 'Desktop/Printables-Factory/pdfs');
const INPUT_DIR = path.join(process.env.HOME, 'Desktop/Printables-Factory/output');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const folders = fs.readdirSync(INPUT_DIR).filter(f => {
  const htmlPath = path.join(INPUT_DIR, f, 'printable.html');
  return fs.existsSync(htmlPath);
});

console.log(`Found ${folders.length} printables to convert...\n`);

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

let success = 0;
let failed = 0;

for (const folder of folders) {
  const htmlPath = path.join(INPUT_DIR, folder, 'printable.html');
  // Clean up folder name for PDF filename
  const pdfName = folder
    .replace(/^\d+-/, '')           // remove leading number-
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-') + '.pdf';
  const pdfPath = path.join(OUTPUT_DIR, pdfName);

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
    console.log(`✅ ${pdfName} (${size} KB)`);
    success++;
  } catch (err) {
    console.error(`❌ ${folder}: ${err.message}`);
    failed++;
  }
}

await browser.close();
console.log(`\nDone: ${success} succeeded, ${failed} failed`);
console.log(`PDFs saved to: ${OUTPUT_DIR}`);
