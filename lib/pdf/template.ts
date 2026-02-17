/**
 * HTML template with embedded CSS for WorkforceOS PDF reports.
 * Designed for Puppeteer PDF rendering — everything is inline, no external resources.
 * 
 * Design: Clean consulting aesthetic (McKinsey / Deloitte inspired).
 * Colors: Deep navy (#1a2332), teal accent (#0ea5e9), white background.
 * Fonts: System sans-serif stack.
 */

import type { PDFOptions } from './generate-pdf';

/** Extract h2 headings from HTML content for table of contents */
function extractTOC(html: string): { id: string; title: string }[] {
  const matches = [...html.matchAll(/<h2\s+id="([^"]*)">(.*?)<\/h2>/g)];
  return matches.map(m => ({
    id: m[1],
    title: m[2].replace(/<[^>]+>/g, ''), // strip any inline HTML
  }));
}

/** Build the complete HTML document with template */
export function wrapInTemplate(htmlContent: string, options: PDFOptions): string {
  const toc = extractTOC(htmlContent);
  const reportTypeLabel = options.reportType === 'discovery'
    ? 'Program Market Scan'
    : 'Program Validation Report';
  const date = options.date || new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const client = options.preparedFor || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${options.title}</title>
<style>
${getStyles(options)}
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
  <div class="cover-top-bar"></div>
  <div class="cover-content">
    <div class="cover-logo">
      <div class="logo-mark">W</div>
      <div class="logo-text">WorkforceOS</div>
    </div>
    <div class="cover-divider"></div>
    <h1 class="cover-title">${options.title}</h1>
    ${options.subtitle ? `<p class="cover-subtitle">${options.subtitle}</p>` : ''}
    ${client ? `<div class="cover-client">
      <p class="cover-label">Prepared for</p>
      <p class="cover-client-name">${client}</p>
    </div>` : ''}
    <div class="cover-meta">
      <p class="cover-date">${date}</p>
      <div class="cover-badge">
        <span class="badge-dot"></span>
        Prepared by WorkforceOS
      </div>
    </div>
  </div>
  <div class="cover-footer">
    <p>Confidential${client ? ` — ${client}` : ''}</p>
  </div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="toc-page">
  <h2 class="toc-heading">Contents</h2>
  <div class="toc-list">
    ${toc.map((item, i) => `
    <div class="toc-item">
      <span class="toc-number">${String(i + 1).padStart(2, '0')}</span>
      <a href="#${item.id}" class="toc-link">${item.title}</a>
      <span class="toc-dots"></span>
    </div>`).join('')}
  </div>
</div>

<!-- MAIN CONTENT -->
<div class="content">
${htmlContent}
</div>

</body>
</html>`;
}

/** All CSS styles, embedded inline */
function getStyles(options: PDFOptions): string {
  const client = options.preparedFor || '';
  const date = options.date || '';
  const reportTypeLabel = options.reportType === 'discovery'
    ? 'Market Scan'
    : 'Validation Report';

  return `
/* ── Reset & Base ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 11pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

body {
  font-family: 'Inter', -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  color: #1e293b;
  line-height: 1.6;
  background: white;
}

/* ── Page Setup ── */
@page {
  size: letter;
  margin: 1in 1in 1.2in 1in;
}

@page :first {
  margin: 0;
}

/* ── Running Headers & Footers (Puppeteer uses headerTemplate/footerTemplate instead) ── */

/* ── Cover Page ── */
.cover-page {
  page-break-after: always;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 0;
  margin: -1in; /* counteract page margins for first page */
  padding: 2in 1.5in;
  background: white;
}

.cover-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(90deg, #1a2332 0%, #0ea5e9 100%);
}

.cover-content {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.cover-logo {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 48px;
}

.logo-mark {
  width: 48px;
  height: 48px;
  background: #1a2332;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 24px;
  letter-spacing: -1px;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  color: #1a2332;
  letter-spacing: -0.5px;
}

.cover-divider {
  width: 80px;
  height: 3px;
  background: #0ea5e9;
  margin-bottom: 40px;
}

.cover-title {
  font-size: 36px;
  font-weight: 800;
  color: #1a2332;
  letter-spacing: -1px;
  line-height: 1.15;
  margin-bottom: 12px;
  max-width: 550px;
}

.cover-subtitle {
  font-size: 18px;
  color: #64748b;
  font-weight: 400;
  margin-bottom: 48px;
}

.cover-client {
  margin-bottom: 40px;
}

.cover-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.cover-client-name {
  font-size: 22px;
  font-weight: 600;
  color: #1a2332;
}

.cover-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.cover-date {
  font-size: 14px;
  color: #64748b;
}

.cover-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border: 1.5px solid #e2e8f0;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #0ea5e9;
  border-radius: 50%;
  display: inline-block;
}

.cover-footer {
  position: absolute;
  bottom: 40px;
  font-size: 10px;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

/* ── Table of Contents ── */
.toc-page {
  page-break-after: always;
  padding-top: 20px;
}

.toc-heading {
  font-size: 28px;
  font-weight: 800;
  color: #1a2332;
  margin-bottom: 32px;
  padding-bottom: 12px;
  border-bottom: 3px solid #0ea5e9;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.toc-item {
  display: flex;
  align-items: baseline;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}

.toc-number {
  font-size: 13px;
  font-weight: 700;
  color: #0ea5e9;
  width: 36px;
  flex-shrink: 0;
}

.toc-link {
  font-size: 14px;
  font-weight: 500;
  color: #1a2332;
  text-decoration: none;
  flex-shrink: 0;
}

.toc-dots {
  flex: 1;
  border-bottom: 1.5px dotted #cbd5e1;
  margin: 0 8px;
  min-width: 40px;
  position: relative;
  top: -4px;
}

/* ── Content ── */
.content {
  /* Main content area */
}

/* ── Typography ── */
h1 {
  font-size: 28px;
  font-weight: 800;
  color: #1a2332;
  margin: 0 0 20px 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a2332;
  margin: 0 0 18px 0;
  padding-bottom: 10px;
  border-bottom: 2.5px solid #0ea5e9;
  page-break-before: always;
  page-break-after: avoid;
  letter-spacing: -0.3px;
}

/* First h2 should not force a page break (already on new page after TOC) */
.content h2:first-child {
  page-break-before: avoid;
}

h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1a2332;
  margin: 24px 0 10px 0;
  page-break-after: avoid;
}

h4 {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin: 18px 0 8px 0;
}

h5, h6 {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin: 14px 0 6px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

p {
  margin: 0 0 12px 0;
  line-height: 1.65;
  font-size: 11pt;
  color: #334155;
}

strong {
  font-weight: 700;
  color: #1e293b;
}

em {
  font-style: italic;
  color: #64748b;
}

a {
  color: #0ea5e9;
  text-decoration: none;
}

code {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.9em;
  color: #1a2332;
}

pre {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 14px 18px;
  margin: 12px 0;
  overflow-x: auto;
  page-break-inside: avoid;
}

pre code {
  background: none;
  padding: 0;
  font-size: 9pt;
}

hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 28px 0;
}

/* ── Lists ── */
ul, ol {
  margin: 8px 0 16px 0;
  padding-left: 22px;
}

li {
  margin-bottom: 6px;
  font-size: 11pt;
  color: #334155;
  line-height: 1.55;
}

li::marker {
  color: #0ea5e9;
  font-weight: 700;
}

/* ── Tables ── */
.table-wrapper {
  margin: 16px 0;
  page-break-inside: avoid;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10pt;
}

thead {
  background: #1a2332;
}

th {
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  font-size: 10pt;
  color: white;
  letter-spacing: 0.2px;
  border: none;
}

td {
  padding: 9px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: top;
}

tbody tr:nth-child(even) {
  background: #f8fafc;
}

tbody tr:last-child td {
  border-bottom: none;
}

/* ── Score Badges ── */
.score-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 100px;
  font-weight: 700;
  font-size: 0.9em;
  letter-spacing: 0.2px;
  white-space: nowrap;
}

.score-green {
  background: #dcfce7;
  color: #166534;
}

.score-yellow {
  background: #fef9c3;
  color: #854d0e;
}

.score-red {
  background: #fee2e2;
  color: #991b1b;
}

/* ── Callout (Blockquotes) ── */
.callout {
  border-left: 4px solid #0ea5e9;
  background: #f0f9ff;
  padding: 16px 20px;
  margin: 16px 0;
  border-radius: 0 8px 8px 0;
  page-break-inside: avoid;
}

.callout p {
  margin: 0 0 6px 0;
  color: #1e40af;
  font-size: 10.5pt;
  line-height: 1.55;
}

.callout p:last-child {
  margin-bottom: 0;
}

/* ── Priority Stars ── */
/* Emoji rendering */


/* ── Print Optimizations ── */
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .cover-page {
    margin: 0;
    padding: 2in 1.5in;
  }

  h2 {
    page-break-before: always;
  }

  .content h2:first-child {
    page-break-before: avoid;
  }

  h3, h4 {
    page-break-after: avoid;
  }

  table, .table-wrapper, .callout, pre {
    page-break-inside: avoid;
  }

  li {
    page-break-inside: avoid;
  }

  img {
    max-width: 100%;
    page-break-inside: avoid;
  }
}
`;
}
