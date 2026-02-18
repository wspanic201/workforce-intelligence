/**
 * Wavelength — Market Scan PDF Generator
 * Converts discovery report markdown to a beautifully branded PDF
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';
import path from 'path';

// ── Config ────────────────────────────────────────────────────────────────────

const CHROME_PATH =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Load source ───────────────────────────────────────────────────────────────

const inputPath = process.argv[2];
if (!inputPath || !existsSync(inputPath)) {
  console.error('Usage: node generate-wavelength-pdf.mjs <report.md>');
  process.exit(1);
}

const raw = readFileSync(inputPath, 'utf8');
// Strip YAML front matter if present
const mdContent = raw.replace(/^---[\s\S]*?---\n/, '');

// ── Parse metadata from first h1/h2 lines ─────────────────────────────────────

const institutionMatch = mdContent.match(/(?:Prepared for|Institution):\s*\*{0,2}([^\n*]+)\*{0,2}/i);
const regionMatch = mdContent.match(/(?:Region|Geographic Area):\s*\*{0,2}([^\n*]+)\*{0,2}/i);
const dateMatch = mdContent.match(/(?:Generated|Report Date):\s*([^\n]+)/i);

const institution = (institutionMatch?.[1] || 'Community College').trim().replace(/\*+/g, '');
const region = (regionMatch?.[1] || '').trim().replace(/\*+/g, '');
const reportDate = (dateMatch?.[1] || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })).trim().replace(/\*+/g, '').trim();

// ── Convert markdown ──────────────────────────────────────────────────────────

const bodyHtml = await marked(mdContent);

// ── Wavelength Brand HTML ─────────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Market Scan — ${institution}</title>
<style>

/* ── Reset ──────────────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Fonts ──────────────────────────────────────────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Serif+Display&display=swap');

/* ── Variables ──────────────────────────────────────────────────────────────── */
:root {
  --ink:      #0f172a;
  --ink-2:    #334155;
  --ink-3:    #64748b;
  --ink-4:    #94a3b8;
  --wave:     #4f46e5;   /* Wavelength indigo */
  --wave-2:   #6366f1;
  --wave-3:   #818cf8;
  --accent:   #06b6d4;   /* Cyan spark */
  --bg:       #ffffff;
  --bg-2:     #f8fafc;
  --bg-3:     #f1f5f9;
  --border:   #e2e8f0;
  --green:    #10b981;
  --amber:    #f59e0b;
  --red:      #ef4444;
  --radius:   6px;
  --font:     'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --serif:    'DM Serif Display', Georgia, serif;
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
@page {
  size: letter;
  margin: 36px 40px;
}
@page:first {
  margin: 0;
}

html, body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font);
  font-size: 10.5pt;
  line-height: 1.65;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Cover Page ─────────────────────────────────────────────────────────────── */
.cover {
  width: 100%;
  height: 100vh;
  min-height: 11in;
  background: linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;
  page-break-after: always;
  position: relative;
  overflow: hidden;
}

/* Decorative wave rings */
.cover::before {
  content: '';
  position: absolute;
  top: -120px;
  right: -120px;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  border: 60px solid rgba(99, 102, 241, 0.15);
}
.cover::after {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  border: 40px solid rgba(99, 102, 241, 0.2);
}

.cover-top {
  padding: 48px 60px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 10;
}

.logo-mark {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* SVG wave icon */
.logo-icon svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: white;
  stroke-width: 2;
  stroke-linecap: round;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.3px;
}

.logo-domain {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  margin-left: 2px;
}

.cover-body {
  padding: 0 60px 0 60px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 10;
}

.cover-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--wave-3);
  margin-bottom: 20px;
}

.cover-title {
  font-family: var(--serif);
  font-size: 46px;
  line-height: 1.12;
  color: white;
  margin-bottom: 16px;
  max-width: 540px;
}

.cover-title span {
  color: var(--accent);
}

.cover-sub {
  font-size: 16px;
  color: rgba(255,255,255,0.55);
  margin-bottom: 48px;
  max-width: 420px;
  line-height: 1.5;
}

.cover-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  overflow: hidden;
  max-width: 560px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(10px);
}

.cover-meta-item {
  padding: 18px 22px;
  border-right: 1px solid rgba(255,255,255,0.08);
}
.cover-meta-item:last-child { border-right: none; }

.cover-meta-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-bottom: 5px;
}

.cover-meta-value {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.9);
  line-height: 1.3;
}

.cover-footer {
  padding: 28px 60px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 10;
}

.cover-footer-note {
  font-size: 9.5px;
  color: rgba(255,255,255,0.3);
  max-width: 400px;
  line-height: 1.5;
}

.cover-badge {
  background: rgba(99,102,241,0.25);
  border: 1px solid rgba(99,102,241,0.4);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 10px;
  font-weight: 600;
  color: var(--wave-3);
  letter-spacing: 0.5px;
}

/* ── Running Header/Footer (all non-cover pages) ────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 56px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.page-header-logo {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  color: var(--wave);
}

.page-header-info {
  font-size: 9px;
  color: var(--ink-4);
  text-align: right;
  line-height: 1.4;
}

/* ── Content area ────────────────────────────────────────────────────────────── */
.content {
  padding: 36px 56px 48px;
}

/* ── Typography ─────────────────────────────────────────────────────────────── */
.content h1 {
  font-family: var(--serif);
  font-size: 28px;
  font-weight: 400;
  color: var(--ink);
  margin-top: 48px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--wave);
  page-break-after: avoid;
  line-height: 1.2;
}

.content h1:first-child { margin-top: 0; }

.content h2 {
  font-size: 17px;
  font-weight: 700;
  color: var(--wave);
  margin-top: 32px;
  margin-bottom: 12px;
  page-break-after: avoid;
  letter-spacing: -0.2px;
}

.content h3 {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-2);
  margin-top: 22px;
  margin-bottom: 8px;
  page-break-after: avoid;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.content h4 {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-2);
  margin-top: 16px;
  margin-bottom: 6px;
  page-break-after: avoid;
}

.content p {
  margin-bottom: 12px;
  color: var(--ink-2);
}

.content strong {
  color: var(--ink);
  font-weight: 600;
}

.content em {
  color: var(--ink-3);
}

/* ── Lists ──────────────────────────────────────────────────────────────────── */
.content ul, .content ol {
  margin: 8px 0 14px 20px;
}

.content li {
  margin-bottom: 5px;
  color: var(--ink-2);
}

.content li strong { color: var(--ink); }

/* ── Tables ─────────────────────────────────────────────────────────────────── */
.content table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0 24px;
  font-size: 10px;
  page-break-inside: avoid;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
}

.content th {
  background: var(--wave);
  color: white;
  font-weight: 600;
  font-size: 9.5px;
  letter-spacing: 0.3px;
  padding: 9px 12px;
  text-align: left;
}

.content td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--ink-2);
  vertical-align: top;
}

.content tr:last-child td { border-bottom: none; }
.content tr:nth-child(even) td { background: var(--bg-2); }

/* ── Horizontal rule = section divider ───────────────────────────────────────── */
.content hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 32px 0;
}

/* ── Code blocks ────────────────────────────────────────────────────────────── */
.content code {
  background: var(--bg-3);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9.5px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--wave);
}

/* ── Blockquote callouts ─────────────────────────────────────────────────────── */
.content blockquote {
  margin: 16px 0;
  padding: 14px 18px;
  border-left: 3px solid var(--accent);
  background: rgba(6, 182, 212, 0.06);
  border-radius: 0 var(--radius) var(--radius) 0;
  color: var(--ink-2);
  font-style: normal;
}

/* ── Score callout pills ─────────────────────────────────────────────────────── */
.score-high   { color: var(--green);  font-weight: 700; }
.score-medium { color: var(--amber);  font-weight: 700; }
.score-low    { color: var(--red);    font-weight: 700; }

/* ── Page footer ─────────────────────────────────────────────────────────────── */
.page-footer {
  padding: 12px 56px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 8.5px;
  color: var(--ink-4);
}

/* ── Print overrides ─────────────────────────────────────────────────────────── */
@media print {
  .cover { height: 11in; page-break-after: always; }
  .no-break { page-break-inside: avoid; }
}

</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════════════════════════
     COVER PAGE
══════════════════════════════════════════════════════════════════════════════ -->
<div class="cover">
  <div class="cover-top">
    <div class="logo-mark">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24">
          <path d="M2 12 Q6 6 10 12 Q14 18 18 12 Q22 6 24 12"/>
        </svg>
      </div>
      <div>
        <div class="logo-text">Wavelength</div>
        <div class="logo-domain">withwavelength.com</div>
      </div>
    </div>
  </div>

  <div class="cover-body">
    <div class="cover-eyebrow">Market Scan Report</div>
    <h1 class="cover-title">Program Opportunities<br>for <span>${institution}</span></h1>
    <p class="cover-sub">A comprehensive analysis of regional workforce demand, competitive gaps, and program opportunities in the ${region || 'region'}.</p>

    <div class="cover-meta-grid">
      <div class="cover-meta-item">
        <div class="cover-meta-label">Institution</div>
        <div class="cover-meta-value">${institution}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Region</div>
        <div class="cover-meta-value">${region || 'Iowa'}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Report Date</div>
        <div class="cover-meta-value">${reportDate}</div>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <div class="cover-footer-note">
      This report is prepared by Wavelength and is intended exclusively for the named institution. 
      Data sourced from BLS, O*NET, regional employer activity, and proprietary research methodology. 
      Confident in the signal. Honest about uncertainty.
    </div>
    <div class="cover-badge">Confidential</div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════════
     REPORT CONTENT
══════════════════════════════════════════════════════════════════════════════ -->
<div class="page-header">
  <div class="page-header-logo">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round">
      <path d="M2 12 Q6 6 10 12 Q14 18 18 12 Q22 6 24 12"/>
    </svg>
    Wavelength
  </div>
  <div class="page-header-info">
    Market Scan: ${institution}<br>
    ${reportDate} · withwavelength.com
  </div>
</div>

<div class="content">
${bodyHtml}
</div>

<!-- ═══════════════════════════════════════════════════════════════
     UPSELL PAGE — NEXT STEPS
════════════════════════════════════════════════════════════════════ -->
<div style="page-break-before:always; width:100%; min-height:250mm; display:flex; flex-direction:column; justify-content:center; align-items:center; background:linear-gradient(135deg,#0a0f1a 0%,#0d1a2e 50%,#0a0f1a 100%); padding:50px 60px; position:relative; overflow:hidden;">
  <div style="position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(circle at 25% 35%,rgba(79,70,229,0.07) 0%,transparent 50%),radial-gradient(circle at 75% 65%,rgba(0,255,136,0.05) 0%,transparent 50%);"></div>

  <div style="position:relative; text-align:center; max-width:560px; width:100%;">
    <div style="font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:700; color:#4f46e5; letter-spacing:3px; text-transform:uppercase; margin-bottom:5px;">WAVELENGTH</div>
    <div style="font-size:10px; color:rgba(255,255,255,0.35); margin-bottom:40px; letter-spacing:1px;">withwavelength.com</div>

    <div style="font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:600; color:#00ff88; letter-spacing:2px; text-transform:uppercase; margin-bottom:12px;">This Market Scan Identified Your Opportunities</div>
    <div style="font-family:'Space Grotesk',sans-serif; font-size:25px; font-weight:700; color:white; line-height:1.25; margin-bottom:14px;">Ready to validate demand<br>and build curricula?</div>
    <div style="font-size:11px; color:rgba(255,255,255,0.5); line-height:1.7; margin-bottom:36px;">The Market Scan gives you the roadmap. Wavelength offers the full toolkit to take top opportunities from intelligence to launch — including compliance review, grant funding, and program validation.</div>

    <div style="display:flex; gap:14px; margin-bottom:34px; flex-wrap:wrap; justify-content:center;">
      <div style="flex:1; min-width:140px; background:rgba(59,130,246,0.07); border:1px solid rgba(59,130,246,0.2); border-radius:10px; padding:18px 16px; text-align:left;">
        <div style="font-family:'Space Grotesk',sans-serif; font-size:11px; font-weight:700; color:white; margin-bottom:3px;">Compliance Gap Report</div>
        <div style="font-size:10px; font-weight:600; color:rgba(96,165,250,0.9); margin-bottom:10px;">$295</div>
        <div style="font-size:9.5px; color:rgba(255,255,255,0.5); line-height:1.6;">Identify regulatory risks before you build. Full compliance analysis for your top programs.</div>
      </div>

      <div style="flex:1; min-width:140px; background:rgba(0,255,136,0.05); border:1px solid rgba(0,255,136,0.15); border-radius:10px; padding:18px 16px; text-align:left;">
        <div style="font-family:'Space Grotesk',sans-serif; font-size:11px; font-weight:700; color:white; margin-bottom:3px;">Grant Intelligence Scan</div>
        <div style="font-size:10px; font-weight:600; color:rgba(0,255,136,0.8); margin-bottom:10px;">$495</div>
        <div style="font-size:9.5px; color:rgba(255,255,255,0.5); line-height:1.6;">30+ federal &amp; foundation grants scanned, scored, and ranked. Find funding before you build.</div>
      </div>

      <div style="flex:1; min-width:140px; background:rgba(168,85,247,0.07); border:1px solid rgba(168,85,247,0.18); border-radius:10px; padding:18px 16px; text-align:left;">
        <div style="font-family:'Space Grotesk',sans-serif; font-size:11px; font-weight:700; color:white; margin-bottom:3px;">Program Validation</div>
        <div style="font-size:10px; font-weight:600; color:rgba(168,85,247,0.9); margin-bottom:10px;">$2,000</div>
        <div style="font-size:9.5px; color:rgba(255,255,255,0.5); line-height:1.6;">Deep-dive feasibility with financial projections, employer verification, and GO / NO-GO recommendation.</div>
      </div>
    </div>

    <div style="border-top:1px solid rgba(255,255,255,0.07); padding-top:24px;">
      <div style="font-size:9.5px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Continue the Work</div>
      <div style="font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:600; color:#00ff88; margin-bottom:5px;">hello@withwavelength.com</div>
      <div style="font-size:10px; color:rgba(255,255,255,0.35);">withwavelength.com</div>
    </div>
  </div>
</div>

<div class="page-footer">
  <span>© ${new Date().getFullYear()} Wavelength · withwavelength.com</span>
  <span>Prepared exclusively for ${institution}</span>
  <span>hello@signal.withwavelength.com</span>
</div>

</body>
</html>`;

// ── Save HTML ─────────────────────────────────────────────────────────────────

const baseName = `Wavelength-MarketScan-${slugify(institution)}`;
const htmlPath = `/tmp/${baseName}.html`;
const pdfPath = `/Users/matt/Desktop/${baseName}.pdf`;

writeFileSync(htmlPath, html, 'utf8');
console.log(`✅ HTML written: ${htmlPath}`);

// ── Launch Puppeteer ──────────────────────────────────────────────────────────

console.log('🖨  Launching Chrome for PDF rendering...');

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

await page.pdf({
  path: pdfPath,
  format: 'Letter',
  printBackground: true,
  displayHeaderFooter: false,
});

await browser.close();

console.log(`\n🎉 PDF ready: ${pdfPath}\n`);
