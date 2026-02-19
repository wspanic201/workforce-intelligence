import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';
import { marked } from 'marked';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ICLOUD = `${process.env.HOME}/Library/Mobile Documents/com~apple~CloudDocs/Businesses/Encore`;
const WORKSPACE = `/Users/matt/.openclaw/workspace`;

const docs = [
  {
    input: `${WORKSPACE}/encore-aws-bootstrap.md`,
    output: `${ICLOUD}/Encore-AWS-Bootstrap.pdf`,
    eyebrow: 'Encore CE Platform',
    title: 'AWS Infrastructure\nBootstrap Guide',
    subtitle: 'Two-account setup, Aurora Serverless v2, RDS Proxy, blue/green deploys, CI/CD, FERPA compliance',
    meta: 'COVERS: VPC · RDS · ECS Fargate · ALB · Secrets Manager · Bedrock · GitHub Actions\nVERSION 1.0 · FEBRUARY 2026',
  },
  {
    input: `${WORKSPACE}/encore-ce-data-model.md`,
    output: `${ICLOUD}/Encore-CE-Data-Model.pdf`,
    eyebrow: 'Encore CE Platform',
    title: 'CE Data Model\nReference',
    subtitle: 'CEU standards, enrollment states, payment flows, Iowa-specific requirements, and 28-table Drizzle schema',
    meta: 'COVERS: Enrollments · Payments · Completions · WIOA · Iowa 260E/260F · Employer Billing\nVERSION 1.0 · FEBRUARY 2026',
  },
  {
    input: `${WORKSPACE}/encore-pricing-model.md`,
    output: `${ICLOUD}/Encore-Pricing-Model.pdf`,
    eyebrow: 'Encore CE Platform',
    title: 'Pricing Model\n& Revenue Strategy',
    subtitle: 'Flat annual SaaS tiers engineered around board approval thresholds, with founding customer strategy and ARR projections',
    meta: 'COVERS: Spark $12K · Core $24K · Pro $42K · Enterprise Custom · ARR Projections\nVERSION 1.0 · FEBRUARY 2026',
  },
];

function buildHtml(doc, bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  .cover {
    height: 100vh;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 80px;
    box-sizing: border-box;
    page-break-after: always;
  }
  .cover-eyebrow {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    color: #14b8a6;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .cover-title {
    font-family: Georgia, serif;
    font-size: 44px;
    color: #f8fafc;
    line-height: 1.15;
    margin-bottom: 16px;
    max-width: 600px;
    white-space: pre-line;
  }
  .cover-subtitle {
    font-family: Georgia, serif;
    font-size: 18px;
    color: #94a3b8;
    font-style: italic;
    margin-bottom: 48px;
    max-width: 540px;
    line-height: 1.5;
  }
  .cover-meta {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    color: #475569;
    letter-spacing: 0.5px;
    white-space: pre-line;
    line-height: 1.8;
  }
  .cover-divider {
    width: 60px;
    height: 3px;
    background: #14b8a6;
    margin-bottom: 40px;
  }
  body {
    font-family: Georgia, serif;
    font-size: 13px;
    line-height: 1.75;
    color: #1e293b;
    max-width: 750px;
    margin: 0 auto;
    padding: 48px 60px;
    background: #ffffff;
  }
  h1 {
    font-size: 24px;
    color: #0f172a;
    border-bottom: 2px solid #14b8a6;
    padding-bottom: 10px;
    margin-top: 48px;
    margin-bottom: 20px;
    page-break-before: always;
  }
  h1:first-of-type { page-break-before: avoid; }
  h2 {
    font-size: 18px;
    color: #0f172a;
    margin-top: 36px;
    margin-bottom: 12px;
  }
  h3 {
    font-size: 14px;
    color: #1e40af;
    margin-top: 24px;
    margin-bottom: 8px;
    font-family: 'Courier New', monospace;
  }
  h4 {
    font-size: 13px;
    color: #334155;
    margin-top: 18px;
    margin-bottom: 6px;
  }
  p { margin-bottom: 12px; }
  ul, ol { margin: 10px 0 16px 24px; }
  li { margin-bottom: 5px; }
  blockquote {
    background: #f0f9ff;
    border-left: 4px solid #14b8a6;
    margin: 16px 0;
    padding: 12px 18px;
    border-radius: 0 8px 8px 0;
    color: #334155;
    font-style: italic;
  }
  code {
    font-family: 'Courier New', monospace;
    font-size: 11.5px;
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 3px;
    color: #0f172a;
  }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 16px 20px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 11px;
    line-height: 1.6;
    margin: 16px 0;
    page-break-inside: avoid;
  }
  pre code {
    background: none;
    padding: 0;
    color: #e2e8f0;
    font-size: 11px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 12px;
    page-break-inside: avoid;
  }
  th {
    background: #0f172a;
    color: #f8fafc;
    padding: 9px 12px;
    text-align: left;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    letter-spacing: 0.5px;
  }
  td {
    padding: 8px 12px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #f8fafc; }
  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 28px 0;
  }
  strong { color: #0f172a; }
  @media print {
    body { padding: 32px 48px; }
  }
</style>
</head>
<body>
<div class="cover">
  <div class="cover-eyebrow">${doc.eyebrow}</div>
  <div class="cover-title">${doc.title}</div>
  <div class="cover-subtitle">${doc.subtitle}</div>
  <div class="cover-divider"></div>
  <div class="cover-meta">${doc.meta}</div>
</div>
${bodyHtml}
</body>
</html>`;
}

const browser = await puppeteer.launch({
  headless: true,
  executablePath: chromePath,
  args: ['--no-sandbox'],
});

for (const doc of docs) {
  console.log(`📄 Generating: ${doc.output.split('/').pop()}...`);
  const md = readFileSync(doc.input, 'utf8');
  const bodyHtml = marked.parse(md);
  const html = buildHtml(doc, bodyHtml);

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: doc.output,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  await page.close();
  console.log(`✅ Saved: ${doc.output.split('/').pop()}`);
}

await browser.close();
console.log('\n🎯 All 3 PDFs generated.');
