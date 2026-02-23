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
// INTEL DATA → UNICODE VISUALIZATION HELPERS
// ════════════════════════════════════════════════════════

function getIntelContext(project: ValidationProject): AgentIntelligenceContext['raw'] | null {
  const ctx = (project as any)._intelContext as AgentIntelligenceContext | undefined;
  return ctx?.raw || null;
}

/**
 * Unicode horizontal bar chart for wage data.
 * Replaces the old formatWagesTable().
 */
function formatWageChart(raw: AgentIntelligenceContext['raw']): string {
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
  const barWidth = 24;
  const lines = tiers.map(t => {
    const filled = Math.round((t.value / maxVal) * barWidth);
    const empty = barWidth - filled;
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
    const label = t.label.padEnd(12);
    const val = `$${t.value.toLocaleString()}`;
    const marker = t.label === 'Median' ? `  \u2190 ${w.geo_name} median` : '';
    return `${label} ${val.padStart(8)}  ${bar}${marker}`;
  });

  return `\`\`\`
${lines.join('\n')}
\`\`\`
*Source: BLS OES ${w.bls_release} \u2014 ${w.occupation_title} (SOC ${w.soc_code}), ${w.geo_name}*`;
}

/**
 * Single-line trend indicator for employment projections.
 * Replaces the old formatProjectionsTable().
 */
function formatProjectionsBadge(raw: AgentIntelligenceContext['raw']): string {
  const occ = raw.occupation;
  if (!occ?.projections) return '';

  const p = occ.projections;
  const emoji = (p.change_percent ?? 0) >= 10 ? '\uD83D\uDCC8' : (p.change_percent ?? 0) >= 5 ? '\u2197\uFE0F' : '\u27A1\uFE0F';
  const parts: string[] = [`${emoji} **${p.change_percent}% growth** (${p.base_year}\u2013${p.projected_year})`];
  if (p.annual_openings) parts.push(`**${p.annual_openings.toLocaleString()} annual openings**`);
  if (p.growth_category) parts.push(p.growth_category);

  return `> ${parts.join(' \u00B7 ')}`;
}

/**
 * Horizontal bar chart for employer hiring distribution.
 */
function formatEmployerBars(employers: Array<{ name: string; openings: number }>): string {
  if (!employers || employers.length === 0) return '';

  const total = employers.reduce((sum, e) => sum + e.openings, 0);
  const maxOpenings = Math.max(...employers.map(e => e.openings));
  const barWidth = 12;

  const lines = employers.map(e => {
    const filled = Math.round((e.openings / maxOpenings) * barWidth);
    const bar = '\u2588'.repeat(filled);
    const pct = total > 0 ? Math.round((e.openings / total) * 100) : 0;
    const name = e.name.padEnd(20);
    return `${name} ${bar.padEnd(barWidth)}  ${e.openings} opening${e.openings > 1 ? 's' : ''} (${pct}%)`;
  });

  return `\`\`\`
${lines.join('\n')}
\`\`\``;
}

/**
 * Visual score bars for the appendix scorecard.
 * Replaces the old scorecard table.
 */
function formatScoreVisualization(dimensions: ProgramScore['dimensions']): string {
  const sorted = [...dimensions].sort((a, b) => b.score * b.weight - a.score * a.weight);
  const barWidth = 10;

  const lines = sorted.map(d => {
    const filled = Math.round((d.score / 10) * barWidth);
    const empty = barWidth - filled;
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
    const status = d.score >= 8 ? '\u25CF' : d.score >= 5 ? '\u25CB' : '\u25CB';
    const label = d.dimension.padEnd(24);
    const weightPct = `${(d.weight * 100).toFixed(0)}%`.padStart(4);
    return `${label} ${bar}  ${d.score}/10  ${weightPct}  ${status}`;
  });

  return `\`\`\`
${lines.join('\n')}
\`\`\``;
}

/**
 * Financial scenario comparison as visual bars.
 */
function formatScenarioBars(scenarios: Array<{ label: string; students: number; net: number }>): string {
  if (scenarios.length === 0) return '';
  const maxNet = Math.max(...scenarios.map(s => Math.abs(s.net)));
  const barWidth = 10;

  const lines = scenarios.map(s => {
    const filled = maxNet > 0 ? Math.round((Math.max(0, s.net) / maxNet) * barWidth) : 0;
    const empty = barWidth - filled;
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
    const label = `${s.label} (${s.students} students)`.padEnd(30);
    const netStr = s.net >= 0 ? `$${s.net.toLocaleString()} net` : `-$${Math.abs(s.net).toLocaleString()} net`;
    return `${label} ${bar}  ${netStr}`;
  });

  return `\`\`\`
${lines.join('\n')}
\`\`\``;
}

/**
 * Compact regional economy callout (inline stats, not a table).
 */
function formatRegionalCallout(raw: AgentIntelligenceContext['raw']): string {
  const sa = raw.serviceArea;
  if (!sa?.found || !sa.data) return '';

  const d = sa.data;
  const parts: string[] = [];

  if (d.counties?.length > 0 && d.totalPopulation > 0) {
    parts.push(`> \uD83C\uDFD9\uFE0F **Service Area:** ${d.counties.length} counties \u00B7 ${d.totalPopulation.toLocaleString()} population \u00B7 ${d.totalEstablishments.toLocaleString()} establishments \u00B7 ${d.totalEmployees.toLocaleString()} employees`);
  } else if (d.counties?.length > 0) {
    parts.push(`> \uD83C\uDFD9\uFE0F **Service Area:** ${d.counties.length} counties \u00B7 ${d.totalEstablishments.toLocaleString()} establishments \u00B7 ${d.totalEmployees.toLocaleString()} employees`);
  }

  const econ: string[] = [];
  if (d.avgMedianIncome) econ.push(`Median income $${d.avgMedianIncome.toLocaleString()}`);
  if (d.avgUnemployment) econ.push(`${d.avgUnemployment}% unemployment`);
  if (d.avgPovertyRate) econ.push(`${d.avgPovertyRate}% poverty rate`);
  if (d.avgBachelorsRate) econ.push(`${d.avgBachelorsRate}% bachelor's+`);
  if (econ.length > 0) {
    parts.push(`> ${econ.join(' \u00B7 ')}`);
  }

  if (d.topIndustries?.length > 0) {
    const topThree = d.topIndustries.slice(0, 3).map((ind: any) => {
      const pct = d.totalEmployees > 0 ? Math.round((ind.employees / d.totalEmployees) * 100) : 0;
      return `${ind.name} (${pct}%)`;
    });
    parts.push(`> **Top industries:** ${topThree.join(', ')}`);
  }

  return parts.join('\n');
}

/**
 * State priority status as inline callout.
 */
function formatStatePriorityCallout(raw: AgentIntelligenceContext['raw']): string {
  if (!raw.occupation?.statePriority?.isPriority) return '';
  const sp = raw.occupation.statePriority;
  const tags: string[] = ['State In-Demand Occupation'];
  if (sp.wioaFundable) tags.push('WIOA Fundable');
  if (sp.scholarshipEligible) tags.push('Scholarship Eligible');
  return `> \u2705 **${tags.join(' \u00B7 ')}**`;
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
2. [Market Demand Analysis](#market-demand-analysis)
3. [Competitive Landscape](#competitive-landscape)
4. [Curriculum Design](#curriculum-design)
5. [Financial Projections](#financial-projections)
6. [Marketing Strategy](#marketing-strategy)
7. [Appendix](#appendix)

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
    const execMatch = tigerTeamMarkdown.match(/# Executive Summary\s+([\s\S]*?)(?=\n# )/);
    if (execMatch) {
      narrative = execMatch[1].trim();
    } else {
      const recMatch = tigerTeamMarkdown.match(/# Recommendation\s+([\s\S]*?)(?=\n# )/);
      if (recMatch) {
        narrative = recMatch[1].trim();
      }
    }
    // Replace Tiger Team references in narrative
    if (narrative) {
      narrative = replaceTigerTeam(narrative);
    }
  }

  // If no synthesis narrative, build from scores
  if (!narrative) {
    narrative = buildNarrativeFromScores(project, programScore, raw);
  }

  // Build investment summary as visual instead of table
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
    parts.push(`- **${s.dimension}** scored ${s.score}/10 \u2014 ${s.rationale.substring(0, 200)}`);
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

  const barWidth = 10;
  const filled = Math.round((programScore.compositeScore / 10) * barWidth);
  const empty = barWidth - filled;
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);

  return `### Validation Summary

\`\`\`
Composite Score    ${bar}  ${programScore.compositeScore}/10  ${formatRecommendationLabel(programScore.recommendation)}
Strongest          ${strongest?.dimension || 'N/A'} (${strongest?.score}/10)
Weakest            ${weakest?.dimension || 'N/A'} (${weakest?.score}/10)
Dimensions         ${programScore.dimensions.length} evaluated
\`\`\``;
}

function buildMarketDemandSection(
  components: ResearchComponent[],
  raw: AgentIntelligenceContext['raw'] | null,
  programName?: string,
): string {
  const parts: string[] = ['# Market Demand Analysis'];

  // Agent narrative LEADS — find both labor market and employer demand components
  const laborComp = components.find(c => c.component_type === 'labor_market');
  const employerComp = components.find(c => c.component_type === 'employer_demand');

  // Lead with agent narrative
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
    const wageChart = formatWageChart(raw);
    if (wageChart && !agentText.includes('BLS OES') && !agentText.match(/\$\d{2},\d{3}.*percentile/i)) {
      parts.push('', '> \uD83D\uDCCA **Wage Distribution**', '', wageChart);
    }

    // Projections badge — only if agent didn't quote specific projection numbers
    const badge = formatProjectionsBadge(raw);
    if (badge && !agentText.match(/\d+%\s*growth.*20\d{2}/)) {
      parts.push('', badge);
    }

    // State priority callout
    const priorityCallout = formatStatePriorityCallout(raw);
    if (priorityCallout && !agentText.toLowerCase().includes('wioa fundable')) {
      parts.push('', priorityCallout);
    }
  }

  // Regional economy callout — only if not covered
  if (raw?.serviceArea?.found && raw.serviceArea.data && !agentText.includes('service area')) {
    const regionalCallout = formatRegionalCallout(raw);
    if (regionalCallout) {
      parts.push('', regionalCallout);
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

  // Completions data as supporting callout — only if agent didn't cover it
  const agentText = compComp?.markdown_output || '';
  if (raw?.completions?.found && raw.completions.data?.length > 0 && !agentText.toLowerCase().includes('ipeds')) {
    const comp = raw.completions;
    const topPrograms = comp.data.slice(0, 5);
    const totalCompletions = topPrograms.reduce((sum: number, c: any) => sum + ((c as any).total_completions || 0), 0);
    if (totalCompletions > 0) {
      parts.push('', `> \uD83C\uDF93 **Regional Program Completions (IPEDS):** ${totalCompletions} annual completions across ${topPrograms.length} regional programs`);
    }
  }

  parts.push('', '<div style="page-break-after: always;"></div>');
  return parts.join('\n');
}

function buildCurriculumDesignSection(
  components: ResearchComponent[],
  programName?: string,
): string {
  const parts: string[] = ['# Curriculum Design'];

  // Institutional fit — agent narrative leads
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

  // Regulatory compliance — agent narrative leads
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

  parts.push('', '<div style="page-break-after: always;"></div>');
  return parts.join('\n');
}

function buildFinancialProjectionsSection(
  components: ResearchComponent[],
  programName?: string,
): string {
  const parts: string[] = ['# Financial Projections'];

  // Financial viability — agent narrative leads (this section is already good)
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

  parts.push('', '<div style="page-break-after: always;"></div>');
  return parts.join('\n');
}

function buildMarketingStrategySection(
  components: ResearchComponent[],
  programName?: string,
): string {
  const parts: string[] = ['# Marketing Strategy'];

  // Learner demand — agent narrative leads
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

  // D. Validation Scorecard — visual bars instead of table
  parts.push('', '## Validation Scorecard', '');
  parts.push(formatScoreVisualization(programScore.dimensions));

  const compositeBarWidth = 10;
  const compositeFilled = Math.round((programScore.compositeScore / 10) * compositeBarWidth);
  const compositeEmpty = compositeBarWidth - compositeFilled;
  const compositeBar = '\u2588'.repeat(compositeFilled) + '\u2591'.repeat(compositeEmpty);
  parts.push('');
  parts.push(`**COMPOSITE: ${compositeBar} ${programScore.compositeScore}/10 \u2014 ${programScore.recommendation}**`);

  // E. Scoring Detail
  parts.push('', '## Scoring Detail', '');
  for (const d of programScore.dimensions) {
    const barW = 10;
    const f = Math.round((d.score / 10) * barW);
    const e = barW - f;
    const bar = '\u2588'.repeat(f) + '\u2591'.repeat(e);
    parts.push(`**${d.dimension}** (${(d.weight * 100).toFixed(0)}% weight) \u2014 ${bar} ${d.score}/10`);
    parts.push(`${d.rationale}`);
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
    parts.push(`> ${stats.join(' \u00B7 ')}`);
    parts.push('');
  }

  // G. Risks & Critical Success Factors from synthesis (if available)
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
 * and replaces Tiger Team references.
 */
function cleanAgentMarkdown(md: string, programName?: string): string {
  let out = md;

  // 0. Replace Tiger Team references
  out = replaceTigerTeam(out);

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

  // 8. Trim leading/trailing whitespace
  out = out.trim();

  return out;
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

  // 3. Executive Summary (narrative prose, Wavelength-branded)
  sections.push(buildExecutiveSummary(project, programScore, tigerTeamMarkdown, raw));

  // 4. Market Demand Analysis (agent narrative leads, data supports)
  sections.push(buildMarketDemandSection(components, raw, project.program_name));

  // 5. Competitive Landscape (agent narrative leads)
  sections.push(buildCompetitiveLandscapeSection(components, raw, project.program_name));

  // 6. Curriculum Design (institutional fit + regulatory)
  sections.push(buildCurriculumDesignSection(components, project.program_name));

  // 7. Financial Projections
  sections.push(buildFinancialProjectionsSection(components, project.program_name));

  // 8. Marketing Strategy (learner demand)
  sections.push(buildMarketingStrategySection(components, project.program_name));

  // 9. Appendix (data sources, methodology, visual scorecard, assumptions)
  sections.push(buildAppendix(project, programScore, citations, raw, tigerTeamMarkdown));

  // Footer
  sections.push(`
---

*\u00A9 ${new Date().getFullYear()} Wavelength. All rights reserved.*
*hello@withwavelength.com*`);

  return sections.join('\n\n');
}
