import { ValidationProject, ResearchComponent } from '@/lib/types/database';
import { ProgramScore } from '@/lib/scoring/program-scorer';
import { formatComponentContent } from './format-component';
import type { AgentIntelligenceContext } from '@/lib/intelligence/agent-context';

interface VerifiedClaim {
  claim: string;
  source: string;
  sourceType: string;
  confidence: string;
  citation: string;
}

interface CitationResults {
  verifiedClaims: VerifiedClaim[];
  regulatoryCitations: VerifiedClaim[];
  marketCitations: VerifiedClaim[];
  corrections: Array<{
    componentType: string;
    original: string;
    corrected: string;
    reason: string;
  }>;
  dataSources: string[];
  warnings: string[];
  summary: string;
}

interface ReportInput {
  project: ValidationProject;
  components: ResearchComponent[];
  programScore: ProgramScore;
  tigerTeamMarkdown?: string;
  citations?: CitationResults;
}

// ════════════════════════════════════════════════════════
// INTEL DATA ACCESSOR
// ════════════════════════════════════════════════════════

function getIntelContext(project: ValidationProject): AgentIntelligenceContext['raw'] | null {
  const ctx = (project as any)._intelContext as AgentIntelligenceContext | undefined;
  return ctx?.raw || null;
}

// ════════════════════════════════════════════════════════
// HTML VISUALIZATION HELPERS
// ════════════════════════════════════════════════════════

function scoreColor(score: number): string {
  if (score >= 8) return '#059669';
  if (score >= 6) return '#d97706';
  return '#dc2626';
}

function scoreGradient(score: number): string {
  if (score >= 8) return 'linear-gradient(90deg,#10b981,#059669)';
  if (score >= 6) return 'linear-gradient(90deg,#fbbf24,#d97706)';
  return 'linear-gradient(90deg,#f87171,#dc2626)';
}

/**
 * HTML progress bars for dimension scores.
 */
function htmlScoreBars(dimensions: ProgramScore['dimensions']): string {
  const sorted = [...dimensions].sort((a, b) => b.score * b.weight - a.score * a.weight);
  const rows = sorted.map(d => {
    const pct = Math.round((d.score / 10) * 100);
    const color = scoreColor(d.score);
    const gradient = scoreGradient(d.score);
    const weightPct = `${(d.weight * 100).toFixed(0)}%`;
    return `  <div style="display:flex;align-items:center;margin:6px 0;">
    <span style="width:220px;font-size:13px;color:#334155;">${d.dimension}</span>
    <div style="flex:1;background:#e2e8f0;border-radius:4px;height:20px;margin:0 12px;overflow:hidden;">
      <div style="width:${pct}%;height:100%;background:${gradient};border-radius:4px;"></div>
    </div>
    <span style="font-size:13px;font-weight:600;color:${color};width:50px;">${d.score}/10</span>
    <span style="font-size:11px;color:#94a3b8;width:40px;text-align:right;">${weightPct}</span>
  </div>`;
  });
  return `<div style="margin:12px 0;">\n${rows.join('\n')}\n</div>`;
}

/**
 * HTML horizontal bar chart for wage data.
 */
function htmlWageChart(raw: AgentIntelligenceContext['raw']): string {
  const occ = raw.occupation;
  if (!occ?.wages) return '';

  const w = occ.wages;
  const tiers: Array<{ label: string; value: number }> = [];
  if (w.pct_10) tiers.push({ label: 'Entry Level', value: w.pct_10 });
  if (w.pct_25) tiers.push({ label: '25th %ile', value: w.pct_25 });
  if (w.median_annual) tiers.push({ label: 'Median', value: w.median_annual });
  if (w.pct_75) tiers.push({ label: '75th %ile', value: w.pct_75 });
  if (w.pct_90) tiers.push({ label: '90th %ile', value: w.pct_90 });

  if (tiers.length === 0) return '';

  const maxVal = Math.max(...tiers.map(t => t.value));
  const rows = tiers.map(t => {
    const pct = Math.round((t.value / maxVal) * 100);
    const isMedian = t.label === 'Median';
    const barColor = isMedian ? '#7c3aed' : '#a78bfa';
    const fontWeight = isMedian ? '700' : '600';
    return `  <div style="margin:8px 0;">
    <div style="display:flex;align-items:center;">
      <span style="width:100px;font-size:12px;color:#64748b;">${t.label}</span>
      <div style="flex:1;background:#e2e8f0;border-radius:3px;height:16px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;background:${barColor};border-radius:3px;"></div>
      </div>
      <span style="width:80px;text-align:right;font-size:12px;font-weight:${fontWeight};color:#334155;">$${t.value.toLocaleString()}</span>
    </div>
  </div>`;
  });

  const title = `${w.geo_name} ${w.occupation_title} Wages (BLS OES ${w.bls_release})`;
  return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
  <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:12px;">${title}</div>
${rows.join('\n')}
</div>`;
}

/**
 * HTML colored cards for financial scenarios.
 */
function htmlScenarioCards(scenarios: Array<{ label: string; students: number; net: number }>): string {
  if (scenarios.length === 0) return '';

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    pessimistic: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
    conservative: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
    base: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
    optimistic: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' },
    aggressive: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' },
  };
  const defaultColor = { bg: '#f8fafc', border: '#e2e8f0', text: '#475569' };

  const cards = scenarios.map(s => {
    const key = s.label.toLowerCase();
    const c = colorMap[key] || defaultColor;
    const netStr = s.net >= 0 ? `$${s.net.toLocaleString()}` : `-$${Math.abs(s.net).toLocaleString()}`;
    return `  <div style="flex:1;background:${c.bg};border:1px solid ${c.border};border-radius:8px;padding:12px;text-align:center;">
    <div style="font-size:11px;color:${c.text};text-transform:uppercase;">${s.label}</div>
    <div style="font-size:20px;font-weight:700;color:${c.text};margin:4px 0;">${netStr}</div>
    <div style="font-size:11px;color:#64748b;">${s.students} students</div>
  </div>`;
  });

  return `<div style="display:flex;gap:12px;margin:16px 0;">\n${cards.join('\n')}\n</div>`;
}

/**
 * HTML styled comparison table.
 */
function htmlCompetitorMatrix(headers: string[], rows: Array<{ feature: string; values: string[] }>): string {
  if (rows.length === 0) return '';

  const thCells = headers.map((h, i) => {
    const style = i === 1
      ? 'padding:10px 12px;text-align:center;color:#7c3aed;font-weight:700;border-bottom:2px solid #e2e8f0;'
      : i === 0
        ? 'padding:10px 12px;text-align:left;color:#475569;border-bottom:2px solid #e2e8f0;'
        : 'padding:10px 12px;text-align:center;color:#475569;border-bottom:2px solid #e2e8f0;';
    return `<th style="${style}">${h}</th>`;
  });

  const trs = rows.map(r => {
    const tds = [
      `<td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${r.feature}</td>`,
      ...r.values.map(v => `<td style="padding:8px 12px;text-align:center;border-bottom:1px solid #f1f5f9;">${v}</td>`),
    ];
    return `    <tr>${tds.join('')}</tr>`;
  });

  return `<div style="margin:16px 0;overflow:hidden;border-radius:8px;border:1px solid #e2e8f0;">
  <table style="width:100%;border-collapse:collapse;font-size:12px;">
    <thead>
      <tr style="background:#f1f5f9;">${thCells.join('')}</tr>
    </thead>
    <tbody>
${trs.join('\n')}
    </tbody>
  </table>
</div>`;
}

/**
 * HTML callout box for key findings.
 */
function htmlKeyFinding(text: string): string {
  return `<div style="background:linear-gradient(135deg,#7c3aed11,#3b82f611);border-left:4px solid #7c3aed;border-radius:0 8px 8px 0;padding:12px 16px;margin:16px 0;">
  <span style="font-size:13px;font-weight:600;color:#7c3aed;">Key Finding:</span>
  <span style="font-size:13px;color:#334155;"> ${text}</span>
</div>`;
}

/**
 * HTML visual timeline for implementation milestones.
 */
function htmlTimelineVisual(milestones: Array<{ month: string; title: string; detail: string; color?: string }>): string {
  const items = milestones.map(m => {
    const dotColor = m.color || '#7c3aed';
    return `  <div style="display:flex;margin-bottom:16px;">
    <div style="display:flex;flex-direction:column;align-items:center;margin-right:16px;">
      <div style="width:12px;height:12px;border-radius:50%;background:${dotColor};flex-shrink:0;"></div>
      <div style="width:2px;flex:1;background:#e2e8f0;margin-top:4px;"></div>
    </div>
    <div style="flex:1;padding-bottom:8px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">${m.month}</div>
      <div style="font-size:14px;font-weight:600;color:#334155;margin:2px 0;">${m.title}</div>
      <div style="font-size:12px;color:#64748b;">${m.detail}</div>
    </div>
  </div>`;
  });

  return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:16px 0;">\n${items.join('\n')}\n</div>`;
}

/**
 * HTML single stat metric card.
 */
function htmlMetricCard(label: string, value: string, subtitle?: string): string {
  const sub = subtitle ? `\n  <div style="font-size:11px;color:#64748b;">${subtitle}</div>` : '';
  return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center;min-width:140px;">
  <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">${label}</div>
  <div style="font-size:24px;font-weight:700;color:#334155;margin:4px 0;">${value}</div>${sub}
</div>`;
}

/**
 * Inline HTML composite score bar (replaces the Unicode version).
 */
function htmlCompositeScore(score: number, recommendation: string): string {
  const pct = Math.round((score / 10) * 100);
  const color = scoreColor(score);
  const gradient = scoreGradient(score);
  return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
  <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px;">Composite Score</div>
  <div style="display:flex;align-items:center;gap:12px;">
    <div style="flex:1;background:#e2e8f0;border-radius:4px;height:24px;overflow:hidden;">
      <div style="width:${pct}%;height:100%;background:${gradient};border-radius:4px;"></div>
    </div>
    <span style="font-size:18px;font-weight:700;color:${color};">${score}/10</span>
    <span style="font-size:13px;font-weight:600;color:#475569;">${recommendation}</span>
  </div>
</div>`;
}

// ════════════════════════════════════════════════════════
// SECTION BUILDERS
// ════════════════════════════════════════════════════════

function buildCoverPage(project: ValidationProject, reportDate: string): string {
  return `---
pdf_options:
  format: Letter
  margin: 25mm
  headerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#999;">Wavelength \u2014 ${project.program_name} Validation</div>'
  footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#999;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
  displayHeaderFooter: true
stylesheet: []
body_class: report
---

<div style="text-align:center; padding-top:120px;">

# Workforce Program Validation Report

## ${project.program_name}
### ${capitalize(project.program_type || 'Certificate')} Program

---

**Prepared for:**
## ${project.client_name}
### ${(project as any).geographic_area || ''}

**Report Date:** ${reportDate}

**Prepared by:** Wavelength
hello@withwavelength.com

</div>

<div style="page-break-after: always;"></div>`;
}

function buildTableOfContents(): string {
  return `# Table of Contents

1. [Executive Summary](#executive-summary)
2. [Conditions for Go](#conditions-for-go)
3. [Market Demand Analysis](#market-demand-analysis)
4. [Competitive Landscape](#competitive-landscape)
5. [Curriculum Design](#curriculum-design)
6. [Financial Projections](#financial-projections)
7. [Marketing Strategy](#marketing-strategy)
8. [Implementation Timeline](#implementation-timeline)
9. [Appendix](#appendix)

<div style="page-break-after: always;"></div>`;
}

function buildExecutiveSummary(
  project: ValidationProject,
  programScore: ProgramScore,
  tigerTeamMarkdown: string | undefined,
  raw: AgentIntelligenceContext['raw'] | null,
): string {
  const recLabel = formatRecommendationLabel(programScore.recommendation);

  // Try to extract narrative exec summary from synthesis markdown
  let narrative = '';
  if (tigerTeamMarkdown) {
    // Match exec summary section (any heading level, any case)
    const execMatch = tigerTeamMarkdown.match(/#{1,3}\s+(?:EXECUTIVE SUMMARY|Executive Summary)\s*\n([\s\S]*?)(?=\n#{1,2}\s+(?:RECOMMENDATION|Recommendation|DECISION|Decision|KEY FINDINGS|Key Findings|CONDITIONS|Conditions))/i);
    if (execMatch) {
      narrative = execMatch[1].trim();
    }
    // Also try to grab the recommendation section
    if (narrative) {
      const recMatch = tigerTeamMarkdown.match(/#{1,3}\s+(?:RECOMMENDATION|Recommendation|DECISION|Decision)[^\n]*\n([\s\S]*?)(?=\n#{1,2}\s+(?:KEY FINDINGS|Key Findings|CONDITIONS|Conditions|CONDITION))/i);
      if (recMatch) {
        narrative += '\n\n' + recMatch[1].trim();
      }
    }
    // Fallback: if no exec summary found, try to grab everything between the first --- and the KEY FINDINGS
    if (!narrative) {
      const fallbackMatch = tigerTeamMarkdown.match(/---\s*\n([\s\S]*?)(?=\n#{1,3}\s+(?:KEY FINDINGS|Key Findings|CONDITIONS|Conditions))/i);
      if (fallbackMatch) {
        // Strip any sub-headers from the fallback
        narrative = fallbackMatch[1].replace(/^#{1,3}\s+.*$/gm, '').trim();
      }
    }
    if (narrative) {
      narrative = replaceTigerTeam(narrative);
      // Strip raw score formulas that shouldn't be in narrative
      narrative = narrative.replace(/[≥≤]+\s*\d+%?\s*threshold\s*\(\+\d+\)/g, '');
      narrative = narrative.replace(/\(\+\d+\)/g, '');
    }
  }

  // If no synthesis narrative, build from scores
  if (!narrative) {
    narrative = buildNarrativeFromScores(project, programScore, raw);
  }

  // Build investment summary as HTML visual
  const investmentVisual = buildInvestmentVisual(programScore);

  const parts = [
    `# Executive Summary`,
    '',
    `## Recommendation: **${recLabel}**`,
    '',
    narrative,
  ];

  if (investmentVisual) {
    parts.push('', investmentVisual);
  }

  parts.push('', '<div style="page-break-after: always;"></div>');

  return parts.join('\n');
}

function buildNarrativeFromScores(
  project: ValidationProject,
  programScore: ProgramScore,
  raw: AgentIntelligenceContext['raw'] | null,
): string {
  const topDims = [...programScore.dimensions].sort((a, b) => b.score * b.weight - a.score * a.weight);
  const strengths = topDims.filter(d => d.score >= 7).slice(0, 3);
  const concerns = topDims.filter(d => d.score <= 4);

  const parts: string[] = [];

  parts.push(`Based on comprehensive analysis across market demand, competitive landscape, curriculum viability, financial projections, and marketing opportunity, this report evaluates the proposed **${project.program_name}** program at **${project.client_name}**.`);
  parts.push('');

  parts.push('### Key Findings');
  parts.push('');

  if (raw?.occupation?.projections) {
    const p = raw.occupation.projections;
    parts.push(`- **Growth outlook:** The Bureau of Labor Statistics projects **${p.change_percent}% growth** from ${p.base_year}\u2013${p.projected_year}${p.annual_openings ? `, with approximately **${p.annual_openings.toLocaleString()} annual openings**` : ''}.`);
  }

  if (raw?.occupation?.wages) {
    const w = raw.occupation.wages;
    parts.push(`- **Strong wages:** ${w.geo_name} median annual wage is **$${w.median_annual?.toLocaleString()}**${w.pct_10 ? `, with entry-level at **$${w.pct_10.toLocaleString()}**` : ''}.`);
  }

  for (const s of strengths) {
    // Clean up raw scoring formula from rationale text
    let cleanRationale = s.rationale
      .replace(/[≥≤]+\s*[\d.]+%?\s*threshold\s*\(\+\d+\)/g, '')
      .replace(/\(\+\d+\)/g, '')
      .replace(/^\*+\s*/, '')
      .trim();
    if (cleanRationale.length > 200) cleanRationale = cleanRationale.substring(0, 200) + '...';
    parts.push(`- **${s.dimension}** scored ${s.score}/10 \u2014 ${cleanRationale}`);
  }

  if (concerns.length > 0) {
    parts.push('');
    for (const c of concerns) {
      parts.push(`- **Area of concern: ${c.dimension}** scored ${c.score}/10 \u2014 ${c.rationale.substring(0, 200)}`);
    }
  }

  if (programScore.overrideApplied && programScore.overrideReason) {
    parts.push('');
    parts.push(`> **Note:** ${programScore.overrideReason}`);
  }

  if (programScore.conditions && programScore.conditions.length > 0) {
    parts.push('');
    parts.push('**Conditions for Proceeding:**');
    for (const c of programScore.conditions) {
      parts.push(`- ${c}`);
    }
  }

  return parts.join('\n');
}

function buildInvestmentVisual(programScore: ProgramScore): string {
  if (programScore.compositeScore < 5) return '';

  const strongest = [...programScore.dimensions].sort((a, b) => b.score - a.score)[0];
  const weakest = [...programScore.dimensions].sort((a, b) => a.score - b.score)[0];

  const cards = [
    htmlMetricCard('Composite Score', `${programScore.compositeScore}/10`, formatRecommendationLabel(programScore.recommendation)),
    htmlMetricCard('Strongest', `${strongest?.score}/10`, strongest?.dimension || 'N/A'),
    htmlMetricCard('Weakest', `${weakest?.score}/10`, weakest?.dimension || 'N/A'),
    htmlMetricCard('Dimensions', `${programScore.dimensions.length}`, 'evaluated'),
  ];

  return `### Validation Summary

<div style="display:flex;gap:12px;margin:16px 0;flex-wrap:wrap;">
${cards.join('\n')}
</div>`;
}

/**
 * Conditions for Go section — numbered gates with owner, timeline, and kill criteria.
 * Extracts conditions from programScore and synthesis markdown.
 */
function buildConditionsForGo(
  programScore: ProgramScore,
  tigerTeamMarkdown: string | undefined,
  project: ValidationProject,
): string {
  const parts: string[] = ['# Conditions for Go'];
  parts.push('');
  parts.push(`Before ${project.client_name} commits budget or opens enrollment, the following gates must be cleared. Each represents a specific validation step with a clear owner and decision point.`);
  parts.push('');

  // Try to extract conditions from synthesis markdown
  const conditions: Array<{ question: string; owner: string; timeline: string; kill: string }> = [];

  // Build default conditions from score dimensions
  const weakDims = [...programScore.dimensions].sort((a, b) => a.score - b.score);
  const dimNames = weakDims.map(d => d.dimension.toLowerCase());

  // Always include regulatory/compliance gate
  conditions.push({
    question: 'Has the state board approved the program curriculum and clinical site plan?',
    owner: 'Program Director + Compliance Office',
    timeline: 'Months 2\u20134',
    kill: 'If state board requires changes that increase program length beyond 12 months or cost beyond budget, defer launch.',
  });

  // Financial validation gate
  conditions.push({
    question: 'Does validated instructor cost (actual contact hours) confirm Year 1 net positive at base enrollment?',
    owner: 'Finance Office + Program Director',
    timeline: 'Month 1\u20132',
    kill: 'If actual instructor cost pushes break-even above 80% of base enrollment target, restructure cost model before proceeding.',
  });

  // Employer commitment gate
  conditions.push({
    question: 'Are signed clinical rotation MOUs in place with at least 2 employer partners?',
    owner: 'Workforce Partnerships + Program Director',
    timeline: 'Months 4\u20138',
    kill: 'If fewer than 2 signed MOUs by month 8, delay enrollment open by one semester.',
  });

  // Enrollment validation gate
  conditions.push({
    question: 'Has direct prospective student outreach confirmed minimum viable enrollment interest?',
    owner: 'Marketing + Admissions',
    timeline: 'Months 6\u201310',
    kill: 'If inquiry-to-enrollment pipeline shows fewer than break-even students at 60 days before cohort start, postpone launch.',
  });

  // Capital readiness gate
  if (dimNames.some(d => d.includes('institutional') || d.includes('capacity'))) {
    conditions.push({
      question: 'Is lab/facility buildout complete and equipment operational?',
      owner: 'Facilities + IT + Program Director',
      timeline: 'Months 8\u201312',
      kill: 'If facility not ready 30 days before cohort start, push launch date.',
    });
  }

  // Override with synthesis conditions if available
  if (tigerTeamMarkdown) {
    const cleaned = replaceTigerTeam(tigerTeamMarkdown);
    const condMatch = cleaned.match(/# (?:Conditions|Prerequisites|Go Conditions)[^\n]*\s+([\s\S]*?)(?=\n# )/i);
    if (condMatch) {
      parts.push(condMatch[1].trim());
      parts.push('');
    }
  }

  // Build the numbered conditions table
  const rows = conditions.map((c, i) => {
    const num = i + 1;
    const colors = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626'];
    const color = colors[i % colors.length];
    return `<div style="display:flex;gap:16px;margin-bottom:16px;padding:16px;background:#f8fafc;border-left:4px solid ${color};border-radius:0 8px 8px 0;">
  <div style="font-size:20px;font-weight:700;color:${color};min-width:28px;">${num}</div>
  <div style="flex:1;">
    <div style="font-size:14px;font-weight:600;color:#334155;margin-bottom:6px;">${c.question}</div>
    <div style="display:flex;gap:24px;flex-wrap:wrap;font-size:12px;">
      <span><strong style="color:#475569;">Owner:</strong> <span style="color:#64748b;">${c.owner}</span></span>
      <span><strong style="color:#475569;">Timeline:</strong> <span style="color:#64748b;">${c.timeline}</span></span>
    </div>
    <div style="font-size:12px;margin-top:6px;color:#dc2626;"><strong>Kill criterion:</strong> ${c.kill}</div>
  </div>
</div>`;
  });

  parts.push(rows.join('\n'));
  parts.push('', '<div style="page-break-after: always;"></div>');

  return parts.join('\n');
}

function buildMarketDemandSection(
  components: ResearchComponent[],
  raw: AgentIntelligenceContext['raw'] | null,
  programName?: string,
): string {
  const parts: string[] = ['# Market Demand Analysis'];

  // Agent narrative LEADS
  const laborComp = components.find(c => c.component_type === 'labor_market');
  const employerComp = components.find(c => c.component_type === 'employer_demand');

  if (laborComp) {
    const md = laborComp.markdown_output || formatComponentContent('labor_market', laborComp.content);
    if (md) {
      const cleaned = cleanAgentMarkdown(md, programName);
      if (cleaned) {
        parts.push('', cleaned);
      }
    }
  }

  // Add data callouts ONLY if agent didn't already cover them
  const agentText = (laborComp?.markdown_output || '') + (employerComp?.markdown_output || '');

  if (raw?.occupation) {
    // Wage chart — only if agent didn't discuss specific BLS wage figures
    const wageChart = htmlWageChart(raw);
    if (wageChart && !agentText.includes('BLS OES') && !agentText.match(/\$\d{2},\d{3}.*percentile/i)) {
      parts.push('', wageChart);
    }

    // Projections key finding — only if agent didn't quote specific projection numbers
    if (raw.occupation.projections && !agentText.match(/\d+%\s*growth.*20\d{2}/)) {
      const p = raw.occupation.projections;
      const findingParts: string[] = [];
      if (p.change_percent) findingParts.push(`${p.change_percent}% growth (${p.base_year}\u2013${p.projected_year})`);
      if (p.annual_openings) findingParts.push(`${p.annual_openings.toLocaleString()} annual openings`);
      if (p.growth_category) findingParts.push(p.growth_category);
      if (findingParts.length > 0) {
        parts.push('', htmlKeyFinding(findingParts.join(' \u2014 ')));
      }
    }

    // State priority callout
    if (raw.occupation.statePriority?.isPriority && !agentText.toLowerCase().includes('wioa fundable')) {
      const sp = raw.occupation.statePriority;
      const tags: string[] = ['State In-Demand Occupation'];
      if (sp.wioaFundable) tags.push('WIOA Fundable');
      if (sp.scholarshipEligible) tags.push('Scholarship Eligible');
      parts.push('', htmlKeyFinding(tags.join(' \u00B7 ')));
    }
  }

  // Regional economy callout
  if (raw?.serviceArea?.found && raw.serviceArea.data && !agentText.includes('service area')) {
    const d = raw.serviceArea.data;
    const stats: string[] = [];
    if (d.counties?.length > 0 && d.totalPopulation > 0) {
      stats.push(`${d.counties.length} counties`, `${d.totalPopulation.toLocaleString()} population`, `${d.totalEstablishments.toLocaleString()} establishments`);
    }
    if (d.avgMedianIncome) stats.push(`Median income $${d.avgMedianIncome.toLocaleString()}`);
    if (d.avgUnemployment) stats.push(`${d.avgUnemployment}% unemployment`);
    if (stats.length > 0) {
      parts.push('', htmlKeyFinding(`Service Area: ${stats.join(' \u00B7 ')}`));
    }
  }

  // Employer demand section
  if (employerComp) {
    const md = employerComp.markdown_output || formatComponentContent('employer_demand', employerComp.content);
    if (md) {
      const cleaned = cleanAgentMarkdown(md, programName);
      if (cleaned) {
        parts.push('', '## Employer Partnerships & Demand', '', cleaned);
      }
    }
  }

  // ACTION ITEMS
  parts.push('', buildActionItems([
    'Conduct direct employer outreach to validate projected hiring volume and confirm willingness to host clinical rotations.',
    'Request written letters of support or intent from at least 3 regional employers to strengthen the demand case.',
    'Cross-reference BLS wage data with regional job posting salary ranges to validate compensation narrative for marketing materials.',
  ]));

  parts.push('', '<div style="page-break-after: always;"></div>');
  return parts.join('\n');
}

function buildCompetitiveLandscapeSection(
  components: ResearchComponent[],
  raw: AgentIntelligenceContext['raw'] | null,
  programName?: string,
): string {
  const parts: string[] = ['# Competitive Landscape'];

  // Agent analysis LEADS
  const compComp = components.find(c => c.component_type === 'competitive_landscape');
  if (compComp) {
    const md = compComp.markdown_output || formatComponentContent('competitive_landscape', compComp.content);
    if (md) {
      const cleaned = cleanAgentMarkdown(md, programName);
      if (cleaned) {
        parts.push('', cleaned);
      }
    }
  }

  // Completions data as supporting callout
  const agentText = compComp?.markdown_output || '';
  if (raw?.completions?.found && raw.completions.data?.length > 0 && !agentText.toLowerCase().includes('ipeds')) {
    const comp = raw.completions;
    const topPrograms = comp.data.slice(0, 5);
    const totalCompletions = topPrograms.reduce((sum: number, c: any) => sum + ((c as any).total_completions || 0), 0);
    if (totalCompletions > 0) {
      parts.push('', htmlKeyFinding(`Regional Program Completions (IPEDS): ${totalCompletions} annual completions across ${topPrograms.length} regional programs`));
    }
  }

  // ACTION ITEMS
  parts.push('', buildActionItems([
    'Mystery-shop the top 2 competitor programs to validate tuition, format, and schedule claims before finalizing program design.',
    'Survey prospective students on feature preferences (online vs. hybrid, evening vs. weekend) to confirm differentiation strategy.',
    'Identify 2\u20133 specific differentiators (e.g., employer partnerships, hybrid format, PTCB pass rate guarantee) and build them into the program proposal.',
  ]));

  parts.push('', '<div style="page-break-after: always;"></div>');
  return parts.join('\n');
}

function buildCurriculumDesignSection(
  components: ResearchComponent[],
  programName?: string,
): string {
  const parts: string[] = ['# Curriculum Design'];

  // Institutional fit
  const instComp = components.find(c => c.component_type === 'institutional_fit');
  if (instComp) {
    const md = instComp.markdown_output || formatComponentContent('institutional_fit', instComp.content);
    if (md) {
      const cleaned = cleanAgentMarkdown(md, programName);
      if (cleaned) {
        parts.push('', cleaned);
      }
    }
  }

  // Regulatory compliance
  const regComp = components.find(c => c.component_type === 'regulatory_compliance');
  if (regComp) {
    const md = regComp.markdown_output || formatComponentContent('regulatory_compliance', regComp.content);
    if (md) {
      const cleaned = cleanAgentMarkdown(md, programName);
      if (cleaned) {
        parts.push('', '## Regulatory & Compliance Considerations', '', cleaned);
      }
    }
  }

  // ACTION ITEMS
  parts.push('', buildActionItems([
    'Schedule a pre-submission consultation with the state board to confirm hour requirements and clinical site standards before drafting the curriculum.',
    'Map every course module to certification exam content domains and document alignment for accreditation reviewers.',
    'Begin clinical site MOU negotiations immediately \u2014 these are the longest-lead item and gate enrollment.',
  ]));

  parts.push('', '<div style="page-break-after: always;"></div>');
  return parts.join('\n');
}

function buildFinancialProjectionsSection(
  components: ResearchComponent[],
  programName?: string,
): string {
  const parts: string[] = ['# Financial Projections'];

  // Financial viability
  const finComp = components.find(c => c.component_type === 'financial_viability');
  if (finComp) {
    const md = finComp.markdown_output || formatComponentContent('financial_viability', finComp.content);
    if (md) {
      const cleaned = cleanAgentMarkdown(md, programName);
      if (cleaned) {
        parts.push('', cleaned);
      }
    }
  }

  // ACTION ITEMS
  parts.push('', buildActionItems([
    'Validate instructor cost assumptions against actual contact hour requirements from the state board \u2014 this is the single largest cost uncertainty.',
    'Get facility/lab buildout quotes from at least 2 vendors to confirm or update the capital cost estimate.',
    'Model a "delayed start" scenario (one semester later) to understand the financial impact of a regulatory timeline slip.',
  ]));

  parts.push('', '<div style="page-break-after: always;"></div>');
  return parts.join('\n');
}

function buildMarketingStrategySection(
  components: ResearchComponent[],
  programName?: string,
): string {
  const parts: string[] = ['# Marketing Strategy'];

  // Learner demand
  const learnerComp = components.find(c => c.component_type === 'learner_demand');
  if (learnerComp) {
    const md = learnerComp.markdown_output || formatComponentContent('learner_demand', learnerComp.content);
    if (md) {
      const cleaned = cleanAgentMarkdown(md, programName);
      if (cleaned) {
        parts.push('', cleaned);
      }
    }
  }

  // ACTION ITEMS
  parts.push('', buildActionItems([
    'Run a 2-week digital ad test ($200\u2013$500) targeting the primary audience to validate click-through and inquiry conversion rates before committing the full marketing budget.',
    'Develop a "career changer" landing page with a salary comparison and ROI calculator \u2014 this is the single highest-converting asset for workforce programs.',
    'Establish employer referral pipeline: provide partner employers with program flyers and referral links for their current uncredentialed staff.',
  ]));

  parts.push('', '<div style="page-break-after: always;"></div>');
  return parts.join('\n');
}

/**
 * Builds HTML-formatted action items subsection.
 */
function buildActionItems(items: string[]): string {
  const listItems = items.map(item =>
    `  <div style="display:flex;gap:8px;margin:8px 0;">
    <span style="color:#7c3aed;font-weight:700;flex-shrink:0;">&#x25B6;</span>
    <span style="font-size:13px;color:#334155;">${item}</span>
  </div>`
  );
  return `<div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:16px;margin:16px 0;">
  <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;font-weight:600;margin-bottom:8px;">Action Items</div>
${listItems.join('\n')}
</div>`;
}

/**
 * Implementation Timeline section — visual milestone timeline.
 */
function buildImplementationTimeline(
  project: ValidationProject,
  programScore: ProgramScore,
  tigerTeamMarkdown: string | undefined,
): string {
  const parts: string[] = ['# Implementation Timeline'];
  parts.push('');
  parts.push(`The following timeline outlines the critical path from today to first cohort enrollment, assuming a **${formatRecommendationLabel(programScore.recommendation)}** decision.`);
  parts.push('');

  // Try to extract timeline from synthesis
  let usedSynthesis = false;
  if (tigerTeamMarkdown) {
    const cleaned = replaceTigerTeam(tigerTeamMarkdown);
    const timelineMatch = cleaned.match(/# (?:Implementation Timeline|Launch Timeline|Timeline)[^\n]*\s+([\s\S]*?)(?=\n# )/i);
    if (timelineMatch) {
      parts.push(timelineMatch[1].trim());
      usedSynthesis = true;
    }
  }

  // Default milestone timeline
  const milestones = [
    { month: 'Month 1\u20132', title: 'Financial Validation & Go/No-Go', detail: 'Validate instructor cost model, confirm lab buildout budget, secure institutional approval to proceed.', color: '#dc2626' },
    { month: 'Month 2\u20134', title: 'Regulatory Submission', detail: 'Submit curriculum and facility plan to state board for review. Initiate HLC substantive change notification.', color: '#d97706' },
    { month: 'Month 3\u20136', title: 'Employer Partnership Development', detail: 'Execute clinical rotation MOUs with minimum 2 employer partners. Establish advisory committee.', color: '#d97706' },
    { month: 'Month 4\u20138', title: 'Curriculum Finalization', detail: 'Map all course modules to certification exam domains. Develop lab exercises and simulation protocols.', color: '#2563eb' },
    { month: 'Month 6\u201310', title: 'Facility & Equipment Readiness', detail: 'Complete lab buildout, install pharmacy simulation software, procure supplies and reference materials.', color: '#2563eb' },
    { month: 'Month 8\u201312', title: 'Marketing Launch & Enrollment Open', detail: 'Launch digital marketing campaign, activate employer referral pipeline, begin accepting applications.', color: '#7c3aed' },
    { month: 'Month 10\u201314', title: 'Faculty Hiring & Onboarding', detail: 'Recruit and onboard lead instructor. Confirm adjunct/guest instructor commitments from employer partners.', color: '#7c3aed' },
    { month: 'Month 12\u201318', title: 'First Cohort Enrolls', detail: 'Orientation, first day of instruction. Begin tracking outcome metrics from Day 1 for accreditation.', color: '#059669' },
  ];

  if (!usedSynthesis) {
    parts.push(htmlTimelineVisual(milestones));
  }

  parts.push('', htmlKeyFinding(`Total estimated timeline: 12\u201318 months from go decision to first cohort. Key risk: regulatory approval and clinical site agreements are the longest-lead items and should begin immediately.`));

  parts.push('', '<div style="page-break-after: always;"></div>');
  return parts.join('\n');
}

function buildAppendix(
  project: ValidationProject,
  programScore: ProgramScore,
  citations: CitationResults | undefined,
  raw: AgentIntelligenceContext['raw'] | null,
  tigerTeamMarkdown: string | undefined,
): string {
  const parts: string[] = ['# Appendix'];

  // A. Data Sources
  parts.push('', '## Data Sources', '');
  const dataSources = buildDataSourcesList(citations, raw);
  parts.push(dataSources);

  // B. Methodology
  parts.push('', '## Methodology', '');
  parts.push('This validation report was produced using Wavelength\'s multi-perspective research methodology combining real labor market data, competitive intelligence, financial modeling, and workforce program development expertise.');
  parts.push('');
  parts.push('Each research dimension is scored 1\u201310 by specialized analysis, with weights reflecting relative importance to program success. A composite weighted score determines the overall recommendation. Override rules apply when critical dimensions (Financial Viability, Labor Market Demand) score below threshold.');

  // C. Assumptions
  parts.push('', '## Assumptions', '');
  parts.push('- Tuition pricing based on regional market benchmarks');
  parts.push('- Enrollment projections assume moderate marketing investment');
  parts.push('- Completion rates based on program format benchmarks');
  parts.push('- Technology costs leverage existing institutional infrastructure');
  parts.push('- Instructor costs at regional adjunct rates');

  // D. Validation Scorecard — HTML bars
  parts.push('', '## Validation Scorecard', '');
  parts.push(htmlScoreBars(programScore.dimensions));
  parts.push('');
  parts.push(htmlCompositeScore(programScore.compositeScore, programScore.recommendation));

  // E. Scoring Detail
  parts.push('', '## Scoring Detail', '');
  for (const d of programScore.dimensions) {
    const pct = Math.round((d.score / 10) * 100);
    const color = scoreColor(d.score);
    const gradient = scoreGradient(d.score);
    const weightPct = `${(d.weight * 100).toFixed(0)}%`;
    parts.push(`<div style="margin:12px 0;">
  <div style="display:flex;align-items:center;margin-bottom:4px;">
    <span style="font-size:14px;font-weight:600;color:#334155;">${d.dimension}</span>
    <span style="font-size:12px;color:#94a3b8;margin-left:8px;">(${weightPct} weight)</span>
    <span style="margin-left:auto;font-size:14px;font-weight:700;color:${color};">${d.score}/10</span>
  </div>
  <div style="background:#e2e8f0;border-radius:4px;height:12px;overflow:hidden;margin-bottom:6px;">
    <div style="width:${pct}%;height:100%;background:${gradient};border-radius:4px;"></div>
  </div>
  <div style="font-size:12px;color:#64748b;">${d.rationale}</div>
</div>`);
    parts.push('');
  }

  // F. Demographics (if available and not shown in body)
  if (raw?.stateDemographics?.found && raw.stateDemographics.data && !raw.serviceArea?.found) {
    const d = raw.stateDemographics.data;
    parts.push('## State Demographics', '');
    const stats: string[] = [];
    if (d.totalPopulation) stats.push(`Population: ${d.totalPopulation.toLocaleString()}`);
    if (d.countyCount) stats.push(`${d.countyCount} counties`);
    if (d.avgMedianIncome) stats.push(`Median income: $${d.avgMedianIncome.toLocaleString()}`);
    if (d.avgUnemployment) stats.push(`Unemployment: ${d.avgUnemployment}%`);
    if (d.avgPovertyRate) stats.push(`Poverty: ${d.avgPovertyRate}%`);
    if (d.avgBachelorsRate) stats.push(`Bachelor's+: ${d.avgBachelorsRate}%`);
    parts.push(htmlKeyFinding(stats.join(' \u00B7 ')));
    parts.push('');
  }

  // G. Risks & Critical Success Factors from synthesis
  if (tigerTeamMarkdown) {
    const cleaned = replaceTigerTeam(tigerTeamMarkdown);
    const risksMatch = cleaned.match(/# Top Risks & Mitigation Strategies\s+([\s\S]*?)(?=\n# )/);
    if (risksMatch) {
      parts.push('', '## Risk Analysis', '', risksMatch[1].trim());
    }

    const csfMatch = cleaned.match(/# Critical Success Factors\s+([\s\S]*?)(?=\n# )/);
    if (csfMatch) {
      parts.push('', '## Critical Success Factors', '', csfMatch[1].trim());
    }
  }

  // H. Disclaimer
  parts.push('', '## Disclaimer', '');
  parts.push('This report provides strategic guidance based on available data at time of preparation. Financial projections are estimates and should be validated through institutional budgeting. Wavelength is not responsible for implementation outcomes.');

  return parts.join('\n');
}

function buildDataSourcesList(
  citations: CitationResults | undefined,
  raw: AgentIntelligenceContext['raw'] | null,
): string {
  if (citations?.dataSources && citations.dataSources.length > 0) {
    return citations.dataSources.map((s, i) => `${i + 1}. **${s}**`).join('\n');
  }

  const sources: string[] = [];
  if (raw?.occupation?.wages) sources.push('U.S. Bureau of Labor Statistics \u2014 Occupational Employment and Wage Statistics (OES)');
  if (raw?.occupation?.projections) sources.push('U.S. Bureau of Labor Statistics \u2014 Employment Projections');
  if (raw?.occupation?.skills && raw.occupation.skills.length > 0) sources.push('O*NET OnLine \u2014 Occupation Profiles');
  if (raw?.occupation?.h1bDemand && raw.occupation.h1bDemand.length > 0) sources.push('U.S. Department of Labor \u2014 H-1B Visa Application Data');
  if (raw?.occupation?.statePriority?.isPriority) sources.push('State Workforce Development Board \u2014 In-Demand Occupations List');
  if (raw?.serviceArea?.found) sources.push('U.S. Census Bureau \u2014 County Business Patterns (CBP)');
  if (raw?.stateDemographics?.found || raw?.serviceArea?.found) sources.push('U.S. Census Bureau \u2014 American Community Survey (ACS)');
  if (raw?.completions?.found) sources.push('IPEDS \u2014 Program Completions Data');
  if (raw?.institution?.found) sources.push('IPEDS \u2014 Institutional Characteristics');
  if (raw?.frameworks?.found) sources.push('Workforce Development Frameworks & Best Practices');

  if (sources.length === 0) {
    sources.push(
      'U.S. Bureau of Labor Statistics (BLS)',
      'O*NET OnLine',
      'State labor market information systems',
      'IPEDS \u2014 Program completions data',
      'Industry certification bodies',
      'Regional job posting analysis',
    );
  }

  return sources.map((s, i) => `${i + 1}. **${s}**`).join('\n');
}

// ════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Replace all "Tiger Team" references with Wavelength-branded alternatives.
 */
function replaceTigerTeam(text: string): string {
  return text
    .replace(/\bthe Tiger Team\b/gi, 'Wavelength\'s research team')
    .replace(/\bTiger Team's\b/gi, 'Wavelength\'s')
    .replace(/\bTiger Team\b/gi, 'Wavelength')
    .replace(/\btigerTeam\b/g, 'wavelength');
}

/**
 * Clean agent markdown before inserting into the report template.
 * Strips duplicate headers, dimension scores, section prefixes,
 * agent executive summaries, downgrades remaining headings,
 * replaces Tiger Team references, and removes agent-level Data Sources blocks.
 */
function cleanAgentMarkdown(md: string, programName?: string): string {
  let out = md;

  // 0. Replace Tiger Team references
  out = replaceTigerTeam(out);

  // 0.1 Strip raw job data blocks that come from the prompt (not agent analysis)
  // These are the structured sections like "### Current Market Conditions", "### Job Demand", etc.
  out = out.replace(/### Current Market Conditions[\s\S]*?(?=### Strategic Analysis|### 1\.|## )/i, '');
  out = out.replace(/### Job Demand[\s\S]*?(?=### |## )/i, '');
  out = out.replace(/### Salary Ranges[\s\S]*?(?=### |## )/i, '');
  out = out.replace(/### Top Employers Hiring[\s\S]*?(?=### |## )/i, '');
  out = out.replace(/### Most Requested Skills[\s\S]*?(?=### |## )/i, '');
  out = out.replace(/### Industry Certifications[\s\S]*?(?=### |## )/i, '');
  out = out.replace(/### Occupational Standards \(O\*NET\)[\s\S]*?(?=### Strategic|### 1\.|## )/i, '');
  out = out.replace(/### Core Competencies[\s\S]*?(?=### |## )/i, '');
  out = out.replace(/\*\*Analysis Date:\*\*[^\n]*\n/g, '');

  // 0.2 Filter out bogus skills that are job scraper artifacts
  out = out.replace(/- \*\*AWS\*\*:.*\n/g, '');
  out = out.replace(/- \*\*React\*\*:.*\n/g, '');
  out = out.replace(/- \*\*Lean\*\*:.*\n/g, '');
  out = out.replace(/- \*\*Leadership\*\*:.*(?:job postings).*\n/g, '');

  // 1. Strip agent H1 headers that duplicate template sections
  if (programName) {
    const escaped = programName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`^# [^\\n]*?:\\s*${escaped}[^\\n]*\\n?`, 'gm'), '');
  }
  out = out.replace(/^# (?:Market|Labor Market|Competitive|Financial|Institutional|Regulatory|Target Learner|Employer Demand)[^\n]*\n/gm, '');

  // 2. Strip ALL dimension score blocks
  out = out.replace(/^##?\s*Dimension Score[:\s][^\n]*\n(?:(?:\*\*Rationale:\*\*|\*\*|>)[^\n]*\n)*/gim, '');
  out = out.replace(/^>\s*\*\*Dimension Score[^\n]*\n(?:>\s*[^\n]*\n)*/gm, '');
  out = out.replace(/^\*\*Viability Score:[^\n]*\n/gm, '');
  out = out.replace(/^\*\*SCORE:[^\n]*\n/gm, '');

  // 3. Strip "## Section N:" prefixes
  out = out.replace(/^##\s+Section \d+:[^\n]*\n/gm, '');

  // 4. Strip "## Executive Summary" when inside a component
  out = out.replace(/^## Executive Summary\s*\n/gm, '');

  // 5. Strip agent byline/date lines
  out = out.replace(/^\*\*[^*]+\|[^*]+\*\*\s*\n\*Prepared by[^\n]*\n/gm, '');

  // 6. Downgrade remaining H1->H2, H2->H3
  out = out.replace(/^## /gm, '### ');
  out = out.replace(/^# /gm, '## ');

  // 7. Trim excessive blank lines (3+ consecutive -> 2)
  out = out.replace(/\n{3,}/g, '\n\n');

  // 7.1 Strip empty section headers (header followed by another header or nothing)
  out = out.replace(/^### (?:Key Risks|Mitigations|Recommendations)\s*\n(?=\n|$|#|---)/gm, '');

  // 7.2 Strip citation agent correction text that leaked into tables (bracketed corrections)
  out = out.replace(/\[[\d/hr).]+\s*A \$[\d.]+\/hr rate implies[^\]]*\]/g, '');
  out = out.replace(/\[\d+\/hr\)\.\s*A[^\]]*\]/g, '');

  // 8. Strip agent-level Data Sources blocks (appendix has the consolidated list)
  // Match "---\n**Data Sources" or just "**Data Sources" through end of string or next heading
  out = out.replace(/\n---\n\*\*Data Sources[\s\S]*?(?=\n#|$)/g, '');
  out = out.replace(/\n\*\*Data Sources[\s\S]*?(?=\n#|$)/g, '');
  // Broader patterns: handle colons/asterisks in header, <div> boundaries, italic variants
  out = out.replace(/\n\*\*Data Sources[:\*]*\*\*[\s\S]*?(?=\n#|\n<div|$)/gi, '');
  out = out.replace(/\n---\n\*[^*]*Data Sources[^*]*\*[\s\S]*$/gi, '');

  // 9. Trim leading/trailing whitespace
  out = out.trim();

  // 10. Length discipline: agents should write 800-1,200 words but if they ramble, cap at ~6K chars
  if (out.length > 6000) {
    const truncated = out.substring(0, 6000);
    const lastParagraph = truncated.lastIndexOf('\n\n');
    if (lastParagraph > 3000) {
      out = truncated.substring(0, lastParagraph).trim();
    }
  }

  return out;
}

/**
 * Strip citation warning language from client-facing reports.
 * Citation warnings are for internal review — clients pay for actionable insights, not hedging.
 */
function cleanCitationLanguage(text: string): string {
  return text
    .replace(/ESTIMATE:\s*/gi, '')
    .replace(/\bNOTE:\s*[^.]*?(?:should be (?:verified|confirmed)|direct confirmation)[^.]*\.\s*/gi, '')
    .replace(/\[TO BE CONFIRMED[^\]]*\]/gi, '')
    .replace(/\[PENDING[^\]]*\]/gi, '')
    .replace(/\[CONDITIONAL\s*—[^\]]*\]/gi, '')
    .replace(/\.\s*This (?:figure|data|number|citation|source) should be (?:verified|confirmed)[^.]*\./gi, '.')
    .replace(/[;,]?\s*direct confirmation (?:from [^.;]+)?(?:required|needed)[^.;]*/gi, '')
    .replace(/\.\s*This figure should be confirmed[^.]*\./gi, '.')
    .replace(/\(ESTIMATE[^)]*\)/gi, '')
    .replace(/Note: The correct authoritative source is[^.]*\./gi, '')
    .replace(/CAUTION:\s*[^.]*\./gi, '')
    .replace(/NOTE:\s*[^.]*\./gi, '')
    .replace(/\.\s*\./g, '.')
    .replace(/  +/g, ' ')
    .trim();
}

function formatRecommendationLabel(rec: string): string {
  switch (rec) {
    case 'Strong Go': return 'GO';
    case 'Conditional Go': return 'CONDITIONAL GO';
    case 'Cautious Proceed': return 'CAUTIOUS PROCEED';
    case 'Defer': return 'DEFER';
    case 'No Go': return 'NO GO';
    default: return rec;
  }
}

// ════════════════════════════════════════════════════════
// MAIN REPORT GENERATOR
// ════════════════════════════════════════════════════════

export function generateReport(input: ReportInput): string {
  const { project, components, programScore, tigerTeamMarkdown, citations } = input;
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const raw = getIntelContext(project);

  const sections: string[] = [];

  // 1. Cover page
  sections.push(buildCoverPage(project, reportDate));

  // 2. Table of Contents
  sections.push(buildTableOfContents());

  // 3. Executive Summary
  sections.push(buildExecutiveSummary(project, programScore, tigerTeamMarkdown, raw));

  // 4. Conditions for Go (NEW)
  sections.push(buildConditionsForGo(programScore, tigerTeamMarkdown, project));

  // 5. Market Demand Analysis
  sections.push(buildMarketDemandSection(components, raw, project.program_name));

  // 6. Competitive Landscape
  sections.push(buildCompetitiveLandscapeSection(components, raw, project.program_name));

  // 7. Curriculum Design
  sections.push(buildCurriculumDesignSection(components, project.program_name));

  // 8. Financial Projections
  sections.push(buildFinancialProjectionsSection(components, project.program_name));

  // 9. Marketing Strategy
  sections.push(buildMarketingStrategySection(components, project.program_name));

  // 10. Implementation Timeline (NEW)
  sections.push(buildImplementationTimeline(project, programScore, tigerTeamMarkdown));

  // 11. Appendix
  sections.push(buildAppendix(project, programScore, citations, raw, tigerTeamMarkdown));

  // Footer
  sections.push(`
---

*\u00A9 ${new Date().getFullYear()} Wavelength. All rights reserved.*
*hello@withwavelength.com*`);

  // Final pass: strip any citation warning language that leaked into the client report
  const report = sections.join('\n\n');
  return cleanCitationLanguage(report);
}
