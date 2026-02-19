import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';
import { marked } from 'marked';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ICLOUD = `${process.env.HOME}/Library/Mobile Documents/com~apple~CloudDocs/Businesses/Encore`;
const WORKSPACE = `/Users/matt/.openclaw/workspace`;

const docs = [
  {
    input: `${WORKSPACE}/encore-employer-portal.md`,
    output: `${ICLOUD}/Encore-Employer-Portal-Billing.pdf`,
    eyebrow: 'Encore CE Platform — A13',
    title: 'Employer Portal\n& Billing Architecture',
    subtitle: 'Individual sponsorship, reserved seat cohorts, private sections, 260E/260F contracts, and the employer portal',
    meta: 'COVERS: Employer Entity · Individual Sponsorship · Seat Blocks · Private Sections · Iowa 260E/260F · Employer Portal\nVERSION 1.0 · FEBRUARY 2026',
  },
  {
    input: `${WORKSPACE}/encore-course-proposals.md`,
    output: `${ICLOUD}/Encore-Course-Proposal-Workflow.pdf`,
    eyebrow: 'Encore CE Platform — A14',
    title: 'Course Proposal\nWorkflow',
    subtitle: 'Instructor course submission, CE staff review queue, proposal state machine, and Wavelength demand signal integration',
    meta: 'COVERS: Proposal State Machine · Staff Review Queue · Public Submission Form · Wavelength Integration\nVERSION 1.0 · FEBRUARY 2026',
  },
  {
    input: `${WORKSPACE}/encore-agent-spec-guide.md`,
    output: `${ICLOUD}/Encore-Agent-Spec-Guide.pdf`,
    eyebrow: 'Encore CE Platform',
    title: 'Agent Development\nSpec Guide',
    subtitle: '61-document master checklist and reference guide for AI-assisted development of the Encore platform',
    meta: 'COVERS: All Phases · 61 Documents · State Machines · Schema · API · Compliance · Infrastructure\nVERSION 1.4 · FEBRUARY 2026 — A13 & A14 ADDED',
  },
];

function buildHtml(doc, bodyHtml) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  .cover { height:100vh; background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%); display:flex; flex-direction:column; justify-content:center; align-items:flex-start; padding:80px; box-sizing:border-box; page-break-after:always; }
  .cover-eyebrow { font-family:'Courier New',monospace; font-size:11px; color:#14b8a6; letter-spacing:3px; text-transform:uppercase; margin-bottom:24px; }
  .cover-title { font-family:Georgia,serif; font-size:44px; color:#f8fafc; line-height:1.15; margin-bottom:16px; max-width:600px; white-space:pre-line; }
  .cover-subtitle { font-family:Georgia,serif; font-size:18px; color:#94a3b8; font-style:italic; margin-bottom:48px; max-width:540px; line-height:1.5; }
  .cover-meta { font-family:'Courier New',monospace; font-size:11px; color:#475569; letter-spacing:0.5px; white-space:pre-line; line-height:1.8; }
  .cover-divider { width:60px; height:3px; background:#14b8a6; margin-bottom:40px; }
  body { font-family:Georgia,serif; font-size:13px; line-height:1.75; color:#1e293b; max-width:750px; margin:0 auto; padding:48px 60px; background:#fff; }
  h1 { font-size:24px; color:#0f172a; border-bottom:2px solid #14b8a6; padding-bottom:10px; margin-top:48px; margin-bottom:20px; page-break-before:always; }
  h1:first-of-type { page-break-before:avoid; }
  h2 { font-size:18px; color:#0f172a; margin-top:36px; margin-bottom:12px; }
  h3 { font-size:14px; color:#1e40af; margin-top:24px; margin-bottom:8px; font-family:'Courier New',monospace; }
  h4 { font-size:13px; color:#334155; margin-top:18px; margin-bottom:6px; }
  p { margin-bottom:12px; }
  ul,ol { margin:10px 0 16px 24px; }
  li { margin-bottom:5px; }
  blockquote { background:#f0f9ff; border-left:4px solid #14b8a6; margin:16px 0; padding:12px 18px; border-radius:0 8px 8px 0; color:#334155; font-style:italic; }
  code { font-family:'Courier New',monospace; font-size:11px; background:#f1f5f9; padding:2px 5px; border-radius:3px; color:#0f172a; }
  pre { background:#0f172a; color:#e2e8f0; padding:14px 18px; border-radius:8px; font-size:10px; line-height:1.55; margin:14px 0; page-break-inside:avoid; overflow-wrap:break-word; white-space:pre-wrap; }
  pre code { background:none; padding:0; color:#e2e8f0; font-size:10px; }
  table { width:100%; border-collapse:collapse; margin:18px 0; font-size:11.5px; page-break-inside:avoid; }
  th { background:#0f172a; color:#f8fafc; padding:8px 11px; text-align:left; font-family:'Courier New',monospace; font-size:10.5px; }
  td { padding:7px 11px; border-bottom:1px solid #e2e8f0; vertical-align:top; }
  tr:nth-child(even) td { background:#f8fafc; }
  hr { border:none; border-top:1px solid #e2e8f0; margin:26px 0; }
  strong { color:#0f172a; }
</style></head><body>
<div class="cover">
  <div class="cover-eyebrow">${doc.eyebrow}</div>
  <div class="cover-title">${doc.title}</div>
  <div class="cover-subtitle">${doc.subtitle}</div>
  <div class="cover-divider"></div>
  <div class="cover-meta">${doc.meta}</div>
</div>
${bodyHtml}
</body></html>`;
}

const browser = await puppeteer.launch({ headless: true, executablePath: chromePath, args: ['--no-sandbox'] });

for (const doc of docs) {
  console.log(`📄 Generating: ${doc.output.split('/').pop()}...`);
  const md = readFileSync(doc.input, 'utf8');
  const bodyHtml = marked.parse(md);
  const html = buildHtml(doc, bodyHtml);
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: doc.output, format: 'Letter', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
  await page.close();
  console.log(`✅ ${doc.output.split('/').pop()}`);
}

await browser.close();
console.log('\n🎯 All done.');
