/**
 * Wavelength — Grant Intelligence Scan PDF Generator
 * Converts grant report markdown to branded dark-theme PDF
 *
 * Usage: node generate-grant-pdf.mjs <report.md> [output.pdf]
 */

import { readFileSync, existsSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';

// ── Config ────────────────────────────────────────────────────────────────────

const CHROME_PATH =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ── Input / Output ────────────────────────────────────────────────────────────

const inputPath = process.argv[2];
if (!inputPath || !existsSync(inputPath)) {
  console.error('Usage: node generate-grant-pdf.mjs <report.md> [output.pdf]');
  process.exit(1);
}

const mdContent = readFileSync(inputPath, 'utf8').replace(/^---[\s\S]*?---\n/, '');

// ── Parse metadata from markdown ──────────────────────────────────────────────

const institutionMatch = mdContent.match(/^#\s*Grant Intelligence Report:\s*(.+)/m);
const dateMatch = mdContent.match(/Prepared:\s*([^\n|*]+)/i);
const grantCountMatch = mdContent.match(/(\d+)\s*opportunities?\s*reviewed/i);

const institution = (institutionMatch?.[1] || 'Community College').trim();
const reportDate = (dateMatch?.[1] || new Date().toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
})).trim();
const grantCount = grantCountMatch?.[1] || '30';

function slugify(s) { return s.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, ''); }

const defaultOut = `/Users/matt/Desktop/Wavelength-Grant-Intelligence-${slugify(institution)}.pdf`;
const outputPath = process.argv[3] || defaultOut;

// ── Convert markdown ──────────────────────────────────────────────────────────

const bodyHtml = await marked(mdContent);

// ── HTML Template ─────────────────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --bg: #0a0f1a;
    --surface: #111827;
    --border: #1e293b;
    --text: rgba(255,255,255,0.87);
    --text-muted: rgba(255,255,255,0.6);
    --accent: #00ff88;
    --accent-blue: #3b82f6;
    --accent-purple: #a855f7;
  }

  /* ── Full bleed on ALL pages — dark bg extends to edges ── */
  @page {
    size: A4;
    margin: 0;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11px;
    line-height: 1.6;
    color: var(--text);
    background: var(--bg);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── COVER PAGE — true full bleed ── */
  .cover {
    width: 210mm;
    min-height: 297mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #0a0f1a 0%, #1a1040 50%, #0a0f1a 100%);
    padding: 60px;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }

  .cover::before {
    content: '';
    position: absolute;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background:
      radial-gradient(circle at 30% 40%, rgba(0,255,136,0.08) 0%, transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(59,130,246,0.06) 0%, transparent 50%);
  }

  .cover-logo {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 18px; font-weight: 700;
    color: var(--accent);
    letter-spacing: 3px; text-transform: uppercase;
    margin-bottom: 8px; position: relative;
  }
  .cover-domain {
    font-size: 11px; color: var(--text-muted);
    margin-bottom: 60px; position: relative;
  }
  .cover-eyebrow {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px; font-weight: 500;
    color: var(--accent);
    letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 16px; position: relative;
  }
  .cover-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 36px; font-weight: 700;
    color: white; text-align: center; line-height: 1.2;
    margin-bottom: 24px; position: relative;
  }
  .cover-sub {
    font-size: 14px; color: var(--text-muted);
    text-align: center; max-width: 480px; line-height: 1.7;
    margin-bottom: 50px; position: relative;
  }
  .cover-meta {
    display: flex; gap: 40px; position: relative;
  }
  .cover-meta-item { text-align: center; }
  .cover-meta-label {
    font-size: 10px; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;
  }
  .cover-meta-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px; font-weight: 600; color: white;
  }
  .cover-footer {
    position: absolute; bottom: 40px;
    font-size: 10px; color: var(--text-muted); text-align: center;
  }

  /* ── CONTENT ── */
  .content {
    padding: 50px 55px;
    max-width: 210mm;
  }

  h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px; font-weight: 700; color: white;
    margin: 36px 0 14px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--accent);
    page-break-after: avoid;
  }
  h1:first-child { margin-top: 0; }

  h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px; font-weight: 600; color: var(--accent);
    margin: 28px 0 10px 0;
    page-break-after: avoid;
  }
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px; font-weight: 600; color: var(--accent-blue);
    margin: 20px 0 8px 0;
    page-break-after: avoid;
  }
  h4 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px; font-weight: 600; color: var(--accent-purple);
    margin: 16px 0 6px 0;
    page-break-after: avoid;
  }

  p { margin: 8px 0; }
  strong { color: white; font-weight: 600; }
  em { color: var(--text-muted); }

  ul, ol { margin: 8px 0 8px 20px; }
  li { margin: 4px 0; }

  blockquote {
    border-left: 3px solid var(--accent);
    padding: 10px 16px; margin: 12px 0;
    background: rgba(0,255,136,0.05);
    border-radius: 0 6px 6px 0;
    font-style: italic; color: var(--text-muted);
  }

  table {
    width: 100%; border-collapse: collapse;
    margin: 12px 0; font-size: 10px;
    page-break-inside: auto;
  }
  th {
    background: var(--surface); color: var(--accent);
    font-weight: 600; text-align: left;
    padding: 8px 10px;
    border-bottom: 2px solid var(--accent);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;
  }
  td {
    padding: 7px 10px; border-bottom: 1px solid var(--border);
  }
  tr:nth-child(even) td { background: rgba(255,255,255,0.02); }

  code {
    background: var(--surface);
    padding: 2px 5px; border-radius: 3px;
    font-size: 10px; color: var(--accent);
  }

  hr { border: none; border-top: 1px solid var(--border); margin: 24px 0; }

  a { color: var(--accent-blue); text-decoration: none; }

  /* ── Print helpers ── */
  h1, h2, h3, h4 { page-break-after: avoid; }
  li, p, blockquote { orphans: 3; widows: 3; }
  ul, ol { page-break-before: avoid; }

  /* ── Upsell page ── */
  .upsell-page {
    page-break-before: always;
    width: 210mm;
    min-height: 250mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #0a0f1a 0%, #0d1a2e 50%, #0a0f1a 100%);
    padding: 50px 60px;
    position: relative;
    overflow: hidden;
  }
  .upsell-page::before {
    content: '';
    position: absolute;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background:
      radial-gradient(circle at 25% 35%, rgba(0,255,136,0.06) 0%, transparent 50%),
      radial-gradient(circle at 75% 65%, rgba(59,130,246,0.05) 0%, transparent 50%);
  }
  .upsell-inner {
    position: relative; text-align: center;
    max-width: 520px; width: 100%;
  }
  .upsell-cards {
    display: flex; gap: 18px; margin-bottom: 34px;
  }
  .upsell-card {
    flex: 1; border-radius: 10px; padding: 20px; text-align: left;
  }
  .upsell-card-purple {
    background: rgba(168,85,247,0.08);
    border: 1px solid rgba(168,85,247,0.2);
  }
  .upsell-card-green {
    background: rgba(0,255,136,0.05);
    border: 1px solid rgba(0,255,136,0.15);
  }
  .upsell-card h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px; font-weight: 700; color: white;
    margin: 0 0 3px 0; border: none; padding: 0;
  }
  .upsell-card .price-purple {
    font-size: 10px; font-weight: 600;
    color: rgba(168,85,247,0.9); margin-bottom: 12px;
  }
  .upsell-card .price-green {
    font-size: 10px; font-weight: 600;
    color: rgba(0,255,136,0.8); margin-bottom: 12px;
  }
  .upsell-card .desc {
    font-size: 9.5px; color: rgba(255,255,255,0.5);
    line-height: 1.6; margin-bottom: 12px;
  }
  .upsell-card ul {
    list-style: none; padding: 0; margin: 0;
    font-size: 9.5px; color: rgba(255,255,255,0.6); line-height: 1.75;
  }
</style>
</head>
<body>

<!-- ═══════════════ COVER ═══════════════ -->
<div class="cover">
  <div class="cover-logo">WAVELENGTH</div>
  <div class="cover-domain">withwavelength.com</div>
  <div class="cover-eyebrow">Grant Intelligence Report</div>
  <div class="cover-title">Federal Grant<br>Opportunity Scan</div>
  <div class="cover-sub">A comprehensive analysis of federal and foundation grant opportunities for ${institution} — ${grantCount} grants scanned, scored, and ranked with full requirements analysis and strategic recommendations.</div>
  <div class="cover-meta">
    <div class="cover-meta-item">
      <div class="cover-meta-label">Institution</div>
      <div class="cover-meta-value">${institution}</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Report Date</div>
      <div class="cover-meta-value">${reportDate}</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Classification</div>
      <div class="cover-meta-value">Internal Use</div>
    </div>
  </div>
  <div class="cover-footer">Prepared by Wavelength · ${grantCount} grants scanned · 50+ data sources</div>
</div>

<!-- ═══════════════ CONTENT ═══════════════ -->
<div class="content">
${bodyHtml}
</div>

<!-- ═══════════════ UPSELL ═══════════════ -->
<div class="upsell-page">
  <div class="upsell-inner">
    <div style="font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:700; color:#00ff88; letter-spacing:3px; text-transform:uppercase; margin-bottom:5px;">WAVELENGTH</div>
    <div style="font-size:10px; color:rgba(255,255,255,0.35); margin-bottom:40px; letter-spacing:1px;">withwavelength.com/grants</div>

    <div style="font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:600; color:#00ff88; letter-spacing:2px; text-transform:uppercase; margin-bottom:12px;">Ready to Pursue These Grants?</div>
    <div style="font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:700; color:white; line-height:1.25; margin-bottom:14px;">Wavelength offers full grant<br>application support.</div>
    <div style="font-size:11px; color:rgba(255,255,255,0.5); line-height:1.7; margin-bottom:36px;">This scan identified your best funding opportunities. When you&rsquo;re ready to pursue them, Wavelength can write, assemble, and submit competitive applications — or keep watch for new opportunities as they emerge.</div>

    <div class="upsell-cards">
      <div class="upsell-card upsell-card-purple">
        <h3>Grant Application Package</h3>
        <div class="price-purple">$3,500 – $7,500</div>
        <div class="desc">Professional writing &amp; full application assembly so your team can focus on running the college.</div>
        <ul>
          <li>✦ Narrative drafting &amp; budget development</li>
          <li>✦ Letters of support coordination</li>
          <li>✦ Compliance review &amp; final assembly</li>
          <li>✦ Submission-ready package</li>
        </ul>
      </div>

      <div class="upsell-card upsell-card-green">
        <h3>Grant Monitoring Retainer</h3>
        <div class="price-green">$1,500 – $3,000 / month</div>
        <div class="desc">Never miss a deadline. Continuous scanning keeps your pipeline current all year long.</div>
        <ul>
          <li>✦ Continuous opportunity scanning</li>
          <li>✦ Deadline tracking &amp; calendar alerts</li>
          <li>✦ Quarterly strategy sessions</li>
          <li>✦ Priority alerts for high-fit grants</li>
        </ul>
      </div>
    </div>

    <div style="border-top:1px solid rgba(255,255,255,0.07); padding-top:24px;">
      <div style="font-size:9.5px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Get in Touch</div>
      <div style="font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:600; color:#00ff88; margin-bottom:5px;">hello@withwavelength.com</div>
      <div style="font-size:10px; color:rgba(255,255,255,0.35);">withwavelength.com/grants</div>
    </div>
  </div>
</div>

</body>
</html>`;

// ── Render PDF ────────────────────────────────────────────────────────────────

console.log(`📄 Source: ${inputPath}`);
console.log(`🏷  Institution: ${institution}`);
console.log(`📊 Grants: ${grantCount}`);
console.log('🖨  Launching Chrome...');

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

// NO Puppeteer margin — margins handled by @page CSS rules
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
});

await browser.close();

console.log(`\n🎉 PDF ready: ${outputPath}\n`);
