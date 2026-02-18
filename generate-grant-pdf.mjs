import { readFileSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const mdContent = readFileSync('/Users/matt/Desktop/Grant-Intelligence-Kirkwood-Community-College-2026-02-18.md', 'utf8');
const bodyHtml = await marked(mdContent);

const MARGIN = { top: '0.5in', right: '0.6in', bottom: '0.5in', left: '0.6in' };

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

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11px;
    line-height: 1.6;
    color: var(--text);
    background: var(--bg);
  }

  /* ── COVER — uses negative margins to fill the Puppeteer page margins ── */
  .cover {
    margin: -0.5in -0.6in 0 -0.6in;
    width: calc(100% + 1.2in);
    height: calc(11.69in - 0.0in);
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
  .cover-domain { font-size: 11px; color: var(--text-muted); margin-bottom: 60px; position: relative; }
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
  .cover-meta { display: flex; gap: 40px; position: relative; }
  .cover-meta-item { text-align: center; }
  .cover-meta-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .cover-meta-value { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 600; color: white; }
  .cover-footer { position: absolute; bottom: 40px; font-size: 10px; color: var(--text-muted); text-align: center; }

  /* ── CONTENT ── */
  .content { padding: 20px 0 0 0; }

  h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px; font-weight: 700; color: white;
    margin: 32px 0 14px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--accent);
    page-break-after: avoid;
  }
  h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px; font-weight: 600; color: var(--accent);
    margin: 24px 0 10px 0;
    page-break-after: avoid;
  }
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px; font-weight: 600; color: var(--accent-blue);
    margin: 18px 0 8px 0;
    page-break-after: avoid;
  }
  h4 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px; font-weight: 600; color: var(--accent-purple);
    margin: 14px 0 6px 0;
    page-break-after: avoid;
  }

  p { margin: 6px 0; }
  strong { color: white; font-weight: 600; }
  em { color: var(--text-muted); }

  ul, ol { margin: 6px 0 6px 20px; }
  li { margin: 3px 0; }

  blockquote {
    border-left: 3px solid var(--accent);
    padding: 8px 14px; margin: 10px 0;
    background: rgba(0,255,136,0.05);
    border-radius: 0 6px 6px 0;
    font-style: italic; color: var(--text-muted);
  }

  table {
    width: 100%; border-collapse: collapse;
    margin: 10px 0; font-size: 10px;
    page-break-inside: auto;
  }
  th {
    background: var(--surface); color: var(--accent);
    font-weight: 600; text-align: left;
    padding: 6px 8px;
    border-bottom: 2px solid var(--accent);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;
  }
  td { padding: 5px 8px; border-bottom: 1px solid var(--border); }
  tr:nth-child(even) td { background: rgba(255,255,255,0.02); }

  code {
    background: var(--surface);
    padding: 2px 5px; border-radius: 3px;
    font-size: 10px; color: var(--accent);
  }

  hr { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

  a { color: var(--accent-blue); text-decoration: none; }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-logo">WAVELENGTH</div>
  <div class="cover-domain">withwavelength.com</div>
  <div class="cover-eyebrow">Grant Intelligence Report</div>
  <div class="cover-title">Federal Grant<br>Opportunity Scan</div>
  <div class="cover-sub">A comprehensive analysis of federal and foundation grant opportunities for Kirkwood Community College — 30 grants scanned, 9 prioritized, with full requirements analysis and strategic recommendations.</div>
  <div class="cover-meta">
    <div class="cover-meta-item">
      <div class="cover-meta-label">Institution</div>
      <div class="cover-meta-value">Kirkwood Community College</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Report Date</div>
      <div class="cover-meta-value">February 17, 2026</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">Classification</div>
      <div class="cover-meta-value">Internal Use</div>
    </div>
  </div>
  <div class="cover-footer">Prepared by Wavelength · 30 grants scanned · 50+ data sources</div>
</div>

<!-- CONTENT -->
<div class="content">
${bodyHtml}
</div>

<!-- ═══════════════════════════════════════════════════════════════
     UPSELL PAGE — GRANT APPLICATION SUPPORT
════════════════════════════════════════════════════════════════════ -->
<div style="page-break-before:always; width:210mm; min-height:250mm; display:flex; flex-direction:column; justify-content:center; align-items:center; background:linear-gradient(135deg,#0a0f1a 0%,#0d1a2e 50%,#0a0f1a 100%); padding:50px 60px; position:relative; overflow:hidden;">
  <div style="position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(circle at 25% 35%,rgba(0,255,136,0.06) 0%,transparent 50%),radial-gradient(circle at 75% 65%,rgba(59,130,246,0.05) 0%,transparent 50%);"></div>

  <div style="position:relative; text-align:center; max-width:520px; width:100%;">
    <div style="font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:700; color:#00ff88; letter-spacing:3px; text-transform:uppercase; margin-bottom:5px;">WAVELENGTH</div>
    <div style="font-size:10px; color:rgba(255,255,255,0.35); margin-bottom:40px; letter-spacing:1px;">withwavelength.com/grants</div>

    <div style="font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:600; color:#00ff88; letter-spacing:2px; text-transform:uppercase; margin-bottom:12px;">Ready to Pursue These Grants?</div>
    <div style="font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:700; color:white; line-height:1.25; margin-bottom:14px;">Wavelength offers full grant<br>application support.</div>
    <div style="font-size:11px; color:rgba(255,255,255,0.5); line-height:1.7; margin-bottom:36px;">This scan identified your best funding opportunities. When you&rsquo;re ready to pursue them, Wavelength can write, assemble, and submit competitive applications — or keep watch for new opportunities as they emerge.</div>

    <div style="display:flex; gap:18px; margin-bottom:34px;">
      <div style="flex:1; background:rgba(168,85,247,0.08); border:1px solid rgba(168,85,247,0.2); border-radius:10px; padding:20px; text-align:left;">
        <div style="font-family:'Space Grotesk',sans-serif; font-size:12px; font-weight:700; color:white; margin-bottom:3px;">Grant Application Package</div>
        <div style="font-size:10px; font-weight:600; color:rgba(168,85,247,0.9); margin-bottom:12px;">$3,500 – $7,500</div>
        <div style="font-size:9.5px; color:rgba(255,255,255,0.5); line-height:1.6; margin-bottom:12px;">Professional writing & full application assembly so your team can focus on running the college.</div>
        <ul style="list-style:none; padding:0; margin:0; font-size:9.5px; color:rgba(255,255,255,0.6); line-height:1.75;">
          <li>✦ Narrative drafting &amp; budget development</li>
          <li>✦ Letters of support coordination</li>
          <li>✦ Compliance review &amp; final assembly</li>
          <li>✦ Submission-ready package</li>
        </ul>
      </div>

      <div style="flex:1; background:rgba(0,255,136,0.05); border:1px solid rgba(0,255,136,0.15); border-radius:10px; padding:20px; text-align:left;">
        <div style="font-family:'Space Grotesk',sans-serif; font-size:12px; font-weight:700; color:white; margin-bottom:3px;">Grant Monitoring Retainer</div>
        <div style="font-size:10px; font-weight:600; color:rgba(0,255,136,0.8); margin-bottom:12px;">$1,500 – $3,000 / month</div>
        <div style="font-size:9.5px; color:rgba(255,255,255,0.5); line-height:1.6; margin-bottom:12px;">Never miss a deadline. Continuous scanning keeps your pipeline current all year long.</div>
        <ul style="list-style:none; padding:0; margin:0; font-size:9.5px; color:rgba(255,255,255,0.6); line-height:1.75;">
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

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox']
});

const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

await page.pdf({
  path: '/Users/matt/Desktop/Wavelength-Grant-Intelligence-Kirkwood.pdf',
  format: 'A4',
  printBackground: true,
  margin: MARGIN,
});

await browser.close();
console.log('🎉 PDF ready');
