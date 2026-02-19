import { readFileSync, existsSync } from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE = '/Users/matt/.openclaw/workspace';
const OUTPUT = '/Users/matt/Library/Mobile Documents/com~apple~CloudDocs/Businesses/Encore';

const DOCS = [
  // Research & Architecture
  { src: 'encore-competitive-landscape.md', out: 'Encore-Competitive-Landscape.pdf', title: 'Competitive\nLandscape', sub: 'Market analysis, incumbent weaknesses, and positioning strategy for Encore CE Platform', id: 'Research' },
  { src: 'encore-legal-regulatory-landscape.md', out: 'Encore-Legal-Regulatory-Landscape.pdf', title: 'Legal &\nRegulatory Landscape', sub: 'FERPA, TCPA, Title IV, ADA, Iowa ICSPS compliance requirements and implementation guidance', id: 'Legal' },
  { src: 'encore-college-it-reality.md', out: 'Encore-College-IT-Reality.pdf', title: 'College IT\nReality Check', sub: 'Infrastructure constraints, security requirements, and integration realities at community colleges', id: 'Research' },
  { src: 'encore-stripe-connect-architecture.md', out: 'Encore-Stripe-Connect-Architecture.pdf', title: 'Stripe Connect\nArchitecture', sub: 'Payment processing architecture, revenue sharing, and financial flow design', id: 'Architecture' },
  { src: 'encore-retell-callflow.md', out: 'Encore-Retell-AI-Call-Flow.pdf', title: 'Retell AI\nCall Flow Design', sub: 'Voice AI integration for automated enrollment support and student services', id: 'Architecture' },
  { src: 'encore-multitenant-architecture.md', out: 'Encore-Multi-Tenant-Architecture.pdf', title: 'Multi-Tenant\nArchitecture', sub: 'Shared database with RLS, institution scoping, FERPA-compliant data isolation', id: 'Architecture' },
  { src: 'encore-banner-integration-reality-check.md', out: 'Encore-Banner-Integration-Reality-Check.pdf', title: 'Banner Integration\nReality Check', sub: 'Ellucian Banner API constraints, data sync patterns, and integration risk assessment', id: 'Research' },
  { src: 'encore-integration-stack.md', out: 'Encore-Integration-Stack.pdf', title: 'Integration\nStack', sub: 'Third-party integrations, API architecture, and service dependencies', id: 'Architecture' },

  // Platform Core
  { src: 'encore-aws-bootstrap.md', out: 'Encore-AWS-Bootstrap.pdf', title: 'AWS Infrastructure\nBootstrap Guide', sub: 'Two-account setup, Aurora Serverless v2, RDS Proxy, blue/green deploys, CI/CD, FERPA compliance', id: 'Infrastructure' },
  { src: 'encore-ce-data-model.md', out: 'Encore-CE-Data-Model.pdf', title: 'CE Data Model\nReference', sub: 'CEU standards, enrollment states, payment flows, Iowa-specific requirements, and 28-table Drizzle schema', id: 'Data Model' },
  { src: 'encore-pricing-model.md', out: 'Encore-Pricing-Model.pdf', title: 'Pricing Model\n& Revenue Strategy', sub: 'Flat annual SaaS tiers engineered around board approval thresholds, with founding customer strategy and ARR projections', id: 'Strategy' },
  { src: 'encore-agent-spec-guide.md', out: 'Encore-Agent-Spec-Guide.pdf', title: 'Agent Development\nSpec Guide', sub: 'AI-assisted development framework, A-series spec index, and implementation patterns for all platform modules', id: 'Spec Guide' },

  // UX & Product
  { src: 'ce-platform-ux-research.md', out: 'Encore-CE-Platform-UX-Research.pdf', title: 'CE Platform\nUX Research', sub: 'User journey mapping, persona research, and interface design principles for CE administrators and students', id: 'UX Research' },
  { src: 'encore-course-proposals.md', out: 'Encore-Course-Proposal-Workflow.pdf', title: 'Course Proposal\nWorkflow', sub: 'New program proposal, approval routing, curriculum review, and publication workflow', id: 'A-Series' },
  { src: 'encore-family-accounts.md', out: 'Encore-Family-Accounts-Dependent-Profiles.pdf', title: 'Family Accounts &\nDependent Profiles', sub: 'Parent/guardian account management, dependent enrollment, and youth program registration flows', id: 'A-Series' },
  { src: 'encore-waitlist-automation.md', out: 'Encore-Waitlist-Automation.pdf', title: 'Waitlist\nAutomation', sub: 'FIFO queue management, automated claim windows, cascade logic, and notification flows', id: 'A-Series' },
  { src: 'encore-certificate-system.md', out: 'Encore-Certificate-Management.pdf', title: 'Certificate\nManagement', sub: 'CEU certificate generation, digital delivery, QR verification, and transcript integration', id: 'A-Series' },
  { src: 'encore-instructor-classification.md', out: 'Encore-Instructor-Classification-Payroll.pdf', title: 'Instructor Classification\n& Payroll', sub: '1099 vs W-2 classification, pay processing, contract management, and 1099-NEC threshold tracking', id: 'A-Series' },
  { src: 'encore-room-scheduling.md', out: 'Encore-Facility-Room-Scheduling.pdf', title: 'Facility & Room\nScheduling', sub: 'CE-managed room booking, shared campus space requests, and 25Live/R25 integration planning', id: 'A-Series' },
  { src: 'encore-section-financials.md', out: 'Encore-Section-Financial-Management.pdf', title: 'Section Financial\nManagement', sub: 'Break-even analysis, cost tracking, revenue projections, and GL code integration', id: 'A-Series' },
  { src: 'encore-youth-programs.md', out: 'Encore-Youth-Program-Operations.pdf', title: 'Youth Program\nOperations', sub: 'Age verification, parental consent, guardian communication, and camp/workshop management', id: 'A-Series' },
  { src: 'encore-group-private-purchases.md', out: 'Encore-Group-Private-Purchases.pdf', title: 'Group & Private\nPurchases', sub: 'Bulk enrollment, employer-sponsored registrations, and cohort billing flows', id: 'A-Series' },
  { src: 'encore-materials-prerequisites.md', out: 'Encore-Materials-Prerequisites.pdf', title: 'Materials &\nPrerequisites', sub: 'Required materials management, prerequisite enforcement, and student readiness verification', id: 'A-Series' },
  { src: 'encore-handout-delivery.md', out: 'Encore-Handout-Materials-Delivery.pdf', title: 'Handout & Materials\nDelivery', sub: 'Digital and physical materials distribution, instructor uploads, and student access management', id: 'A-Series' },
  { src: 'encore-curriculum-materials.md', out: 'Encore-Content-Materials-Architecture.pdf', title: 'Content & Materials\nArchitecture', sub: 'Course content organization, media management, and learning resource delivery architecture', id: 'A-Series' },
  { src: 'encore-employer-portal.md', out: 'Encore-Employer-Portal-Billing.pdf', title: 'Employer Portal\n& Billing', sub: 'Corporate training management, employer-sponsored enrollment, and invoice/billing workflows', id: 'A-Series' },
  { src: 'encore-edge-cases.md', out: 'Encore-Edge-Cases-Special-Scenarios.pdf', title: 'Edge Cases &\nSpecial Scenarios', sub: 'Complex enrollment scenarios, exception handling, and platform boundary conditions', id: 'A-Series' },
  { src: 'encore-mis-reporting.md', out: 'Encore-MIS-Reporting-Data-Quality.pdf', title: 'MIS Reporting &\nData Quality', sub: 'Iowa ICSPS reporting, data validation, compliance exports, and audit trail requirements', id: 'A-Series' },
  { src: 'encore-automated-catalog.md', out: 'Encore-Automated-Course-Catalog.pdf', title: 'Automated Course\nCatalog', sub: 'Real-time catalog generation, ISR rendering, visibility rules, and embed widget architecture', id: 'A-Series' },
  { src: 'encore-offering-types.md', out: 'Encore-Offering-Type-Taxonomy.pdf', title: 'Offering Type\nTaxonomy', sub: 'Workshop, certificate, conference, contract training, self-paced, bundle, and community event models', id: 'A-Series' },
  { src: 'encore-wavelength-integration.md', out: 'Encore-Wavelength-Integration-Architecture.pdf', title: 'Wavelength\nIntegration Architecture', sub: 'Market intelligence pipeline integration, data boundaries, and Wavelength ↔ Encore touchpoints', id: 'G1' },

  // A26–A48 spec docs
  { src: 'encore-a26-surveys-ratings.md', out: 'Encore-A26-Course-Surveys-Ratings.pdf', title: 'Course Surveys &\nInstructor Feedback', sub: 'Post-course survey delivery, rating collection, instructor performance tracking, and data export', id: 'A26' },
  { src: 'encore-a27-waivers-consent.md', out: 'Encore-A27-Waivers-Consent.pdf', title: 'Waivers &\nConsent Management', sub: 'Digital waiver collection, version control, consent records, and liability documentation', id: 'A27' },
  { src: 'encore-a28-calendar-integration.md', out: 'Encore-A28-Calendar-Integration.pdf', title: 'Calendar\nIntegration', sub: 'Google Calendar, Outlook, and iCal sync for course schedules and student enrollment events', id: 'A28' },
  { src: 'encore-a29-reporting-analytics.md', out: 'Encore-A29-Reporting-Analytics.pdf', title: 'Reporting &\nAnalytics', sub: 'Enrollment dashboards, revenue reports, completion rates, and operational intelligence', id: 'A29' },
  { src: 'encore-a30-media-management.md', out: 'Encore-A30-Media-Management.pdf', title: 'Media Management &\nCourse Photos', sub: 'AI-assisted image selection, S3 storage, course page media, and CDN delivery', id: 'A30' },
  { src: 'encore-a31-section-change-management.md', out: 'Encore-A31-Section-Change-Management.pdf', title: 'Section Change\nManagement', sub: 'Cancellations, reschedules, instructor changes, and automated student notification flows', id: 'A31' },
  { src: 'encore-a32-grant-funding.md', out: 'Encore-A32-Grant-Funding.pdf', title: 'Grant Funding\nManagement', sub: '260E/260F job training contracts, WIOA tracking, grant-funded enrollment, and compliance reporting', id: 'A32' },
  { src: 'encore-a33-transcripts-verification.md', out: 'Encore-A33-Transcripts-Verification.pdf', title: 'Student Transcripts\n& Verification', sub: 'CEU transcripts, completion records, QR-verified certificates, and third-party verification API', id: 'A33' },
  { src: 'encore-a34-delivery-format.md', out: 'Encore-A34-Delivery-Format.pdf', title: 'Delivery Format &\nModality Management', sub: 'In-person, online synchronous, hybrid, and self-paced delivery type configuration and constraints', id: 'A34' },
  { src: 'encore-a35-course-template-configuration.md', out: 'Encore-A35-Course-Template-Configuration.pdf', title: 'Course Template &\nSection Configuration', sub: 'ICSPS categories, GL codes, CEU approvals, walk-in registration, and template inheritance model', id: 'A35' },
  { src: 'encore-a36-smart-scheduling.md', out: 'Encore-A36-Smart-Scheduling.pdf', title: 'Smart Scheduling &\nResource Management', sub: 'Instructor availability, recurring patterns, conflict detection, and room assignment automation', id: 'A36' },
  { src: 'encore-a37-promotional-codes.md', out: 'Encore-A37-Promotional-Codes.pdf', title: 'Promotional Codes &\nDiscount Management', sub: 'Promo code types, usage limits, stacking rules, employer discounts, and reporting', id: 'A37' },
  { src: 'encore-a38-marketing-landing-pages.md', out: 'Encore-A38-Marketing-Landing-Pages.pdf', title: 'Marketing &\nCourse Landing Pages', sub: 'SEO-optimized course pages, conversion tracking, UTM parameters, and analytics integration', id: 'A38' },
  { src: 'encore-a39-state-federal-reporting.md', out: 'Encore-A39-State-Federal-Reporting.pdf', title: 'State & Federal\nReporting Framework', sub: 'Iowa ICSPS noncredit reporting, IPEDS, WIOA outcomes, and automated compliance exports', id: 'A39' },
  { src: 'encore-a40-student-self-service.md', out: 'Encore-A40-Student-Self-Service.pdf', title: 'Student\nSelf-Service Portal', sub: 'Drop/transfer requests, schedule changes, profile management, and enrollment history', id: 'A40' },
  { src: 'encore-a41-articulation-agreements.md', out: 'Encore-A41-Articulation-Agreements.pdf', title: 'Articulation\nAgreement Management', sub: 'Noncredit-to-credit pathways, stackable credentials, and articulation tracking', id: 'A41' },
  { src: 'encore-a42-cbe-pla.md', out: 'Encore-A42-CBE-PLA.pdf', title: 'Competency-Based Ed &\nPrior Learning Assessment', sub: 'Multiple completion paths, portfolio review, external certification recognition, and CBE workflows', id: 'A42' },
  { src: 'encore-a43-learning-outcomes.md', out: 'Encore-A43-Learning-Outcomes.pdf', title: 'Learning Outcomes\nManagement', sub: 'Course-level outcomes, accreditation alignment, assessment mapping, and reporting', id: 'A43' },
  { src: 'encore-a44-audit-trail.md', out: 'Encore-A44-Audit-Trail.pdf', title: 'System-Wide\nAudit Trail', sub: 'Immutable change history, FERPA access logs, dispute resolution, and compliance evidence', id: 'A44' },
  { src: 'encore-a45-corporate-training.md', out: 'Encore-A45-Corporate-Training.pdf', title: 'Corporate & Contract\nTraining Management', sub: 'Employer cohort registration, nomination flows, attendance tracking, and invoice generation', id: 'A45' },
  { src: 'encore-a46-offering-type-taxonomy.md', out: 'Encore-A46-Offering-Type-Taxonomy.pdf', title: 'Offering Type\nTaxonomy', sub: '7 offering types: workshop, certificate, conference, contract training, self-paced, bundle, community event', id: 'A46' },
  { src: 'encore-a47-automated-course-catalog.md', out: 'Encore-A47-Automated-Course-Catalog.pdf', title: 'Automated Course\nCatalog', sub: 'Real-time catalog with ISR rendering, visibility rules, search/filter, and embed widget', id: 'A47' },
  { src: 'encore-a48-student-procured-materials.md', out: 'Encore-A48-Student-Procured-Materials.pdf', title: 'Student-Procured\nMaterials', sub: 'Required materials display, acknowledgment flow, section-level overrides, and pre-enrollment visibility', id: 'A48' },
  { src: 'encore-l1-tcpa-consent.md', out: 'Encore-L1-TCPA-Consent-Spec.pdf', title: 'TCPA Consent\nCapture Spec', sub: 'Exact consent language, opt-out handling, immutable consent log, pre-send gate, DNC compliance', id: 'L1' },
];

function buildHtml(title, sub, id, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11px; line-height: 1.65;
    color: #1a1a1a;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* === COVER — full bleed dark === */
  .cover {
    width: 210mm; min-height: 297mm;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%);
    display: flex; flex-direction: column;
    justify-content: center; align-items: flex-start;
    padding: 80px;
    page-break-after: always;
    position: relative; overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 15% 25%, rgba(20,184,166,0.18) 0%, transparent 50%),
      radial-gradient(ellipse at 85% 75%, rgba(59,130,246,0.12) 0%, transparent 50%);
  }
  .cover-eyebrow {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: 3px; text-transform: uppercase;
    color: #14b8a6; margin-bottom: 28px; position: relative;
  }
  .cover-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 42px; font-weight: 700; line-height: 1.1;
    color: #ffffff; margin-bottom: 20px;
    position: relative; white-space: pre-line;
  }
  .cover-subtitle {
    font-size: 14px; color: rgba(255,255,255,0.55);
    max-width: 520px; line-height: 1.6;
    margin-bottom: 56px; position: relative;
  }
  .cover-divider {
    width: 56px; height: 3px;
    background: linear-gradient(90deg, #14b8a6, #3b82f6);
    margin-bottom: 28px; position: relative;
  }
  .cover-meta {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 10px; color: rgba(255,255,255,0.35);
    letter-spacing: 1.5px; text-transform: uppercase;
    position: relative;
  }
  .cover-footer {
    position: absolute; bottom: 40px; left: 80px; right: 80px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .cover-footer-brand {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px; font-weight: 700; color: #14b8a6;
    letter-spacing: 2px; text-transform: uppercase;
  }
  .cover-footer-date {
    font-size: 10px; color: rgba(255,255,255,0.3);
    letter-spacing: 1px;
  }

  /* === CONTENT — white/light for printing === */
  .content {
    padding: 40px 52px;
    background: #ffffff;
  }

  h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 19px; font-weight: 700; color: #0f172a;
    margin: 32px 0 12px; padding-bottom: 8px;
    border-bottom: 2px solid #14b8a6;
    page-break-after: avoid;
  }
  h1:first-child { margin-top: 0; }

  h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px; font-weight: 600; color: #0f766e;
    margin: 24px 0 8px;
    page-break-after: avoid;
  }

  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px; font-weight: 600; color: #1d4ed8;
    margin: 18px 0 6px;
    page-break-after: avoid;
  }

  h4 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px; font-weight: 600; color: #7c3aed;
    margin: 14px 0 4px;
    page-break-after: avoid;
  }

  p { margin: 6px 0 10px; color: #1a1a1a; }

  strong { font-weight: 600; color: #0f172a; }
  em { color: #475569; font-style: italic; }

  ul, ol { margin: 8px 0 12px 20px; }
  li { margin: 3px 0; color: #1a1a1a; }
  li::marker { color: #14b8a6; }

  code {
    font-family: 'Courier New', monospace;
    font-size: 10px; background: #f1f5f9;
    color: #0f172a; padding: 1px 5px;
    border-radius: 3px; border: 1px solid #e2e8f0;
  }

  pre {
    background: #f8fafc; border: 1px solid #e2e8f0;
    border-left: 3px solid #14b8a6;
    border-radius: 4px; padding: 14px 16px;
    margin: 12px 0; overflow: hidden;
    page-break-inside: avoid;
  }
  pre code {
    background: none; border: none; padding: 0;
    font-size: 9.5px; line-height: 1.5; color: #1e293b;
  }

  table {
    width: 100%; border-collapse: collapse;
    margin: 12px 0; font-size: 10px;
    page-break-inside: avoid;
  }
  th {
    background: #0f172a; color: #ffffff;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600; text-align: left;
    padding: 8px 10px; font-size: 10px;
  }
  td {
    padding: 6px 10px; border-bottom: 1px solid #e2e8f0;
    color: #1a1a1a; vertical-align: top;
  }
  tr:nth-child(even) td { background: #f8fafc; }

  blockquote {
    border-left: 3px solid #14b8a6;
    padding: 10px 16px; margin: 12px 0;
    background: #f0fdf9; color: #134e4a;
    border-radius: 0 4px 4px 0;
  }

  hr {
    border: none; border-top: 1px solid #e2e8f0;
    margin: 20px 0;
  }

  a { color: #0d9488; text-decoration: none; }
</style>
</head>
<body>
  <div class="cover">
    <div class="cover-eyebrow">ENCORE CE PLATFORM</div>
    <div class="cover-title">${title}</div>
    <div class="cover-subtitle">${sub}</div>
    <div class="cover-divider"></div>
    <div class="cover-meta">${id} · FEBRUARY 2026</div>
    <div class="cover-footer">
      <div class="cover-footer-brand">ENCORE</div>
      <div class="cover-footer-date">CONFIDENTIAL · INTERNAL USE</div>
    </div>
  </div>
  <div class="content">
    ${bodyHtml}
  </div>
</body>
</html>`;
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let ok = 0, skip = 0, fail = 0;

  for (const doc of DOCS) {
    const srcPath = `${WORKSPACE}/${doc.src}`;
    const outPath = `${OUTPUT}/${doc.out}`;

    if (!existsSync(srcPath)) {
      console.log(`SKIP (no source): ${doc.src}`);
      skip++;
      continue;
    }

    try {
      const raw = readFileSync(srcPath, 'utf8');
      // Strip YAML frontmatter if present
      const md = raw.replace(/^---[\s\S]*?---\n/, '');
      const bodyHtml = await marked(md);
      const html = buildHtml(doc.title, doc.sub, doc.id, bodyHtml);

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.pdf({ path: outPath, format: 'A4', printBackground: true });
      await page.close();

      console.log(`✅ ${doc.out}`);
      ok++;
    } catch (err) {
      console.error(`❌ ${doc.out}: ${err.message}`);
      fail++;
    }
  }

  await browser.close();
  console.log(`\nDone: ${ok} generated, ${skip} skipped, ${fail} failed`);
}

main();
