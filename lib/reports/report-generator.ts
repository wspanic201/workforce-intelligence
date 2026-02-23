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
// INTEL DATA → MARKDOWN TABLE HELPERS
// ════════════════════════════════════════════════════════

function getIntelContext(project: ValidationProject): AgentIntelligenceContext['raw'] | null {
  const ctx = (project as any)._intelContext as AgentIntelligenceContext | undefined;
  return ctx?.raw || null;
}

function formatWagesTable(raw: AgentIntelligenceContext['raw']): string {
  const occ = raw.occupation;
  if (!occ?.wages) return '';

  const w = occ.wages;
  const rows = [
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Occupation | ${w.occupation_title} (SOC ${w.soc_code}) |`,
    w.employment ? `| Employment | ${w.employment.toLocaleString()} |` : null,
    w.median_annual ? `| Median Annual Wage | $${w.median_annual.toLocaleString()} |` : null,
    w.mean_annual ? `| Mean Annual Wage | $${w.mean_annual.toLocaleString()} |` : null,
    w.pct_10 ? `| Entry-Level (10th percentile) | $${w.pct_10.toLocaleString()} |` : null,
    w.pct_25 ? `| 25th Percentile | $${w.pct_25.toLocaleString()} |` : null,
    w.pct_75 ? `| 75th Percentile | $${w.pct_75.toLocaleString()} |` : null,
    w.pct_90 ? `| Experienced (90th percentile) | $${w.pct_90.toLocaleString()} |` : null,
  ].filter(Boolean);

  return `**${w.occupation_title} (SOC ${w.soc_code})** — ${w.geo_name} (BLS OES ${w.bls_release})\n\n${rows.join('\n')}\n`;
}

function formatProjectionsTable(raw: AgentIntelligenceContext['raw']): string {
  const occ = raw.occupation;
  if (!occ?.projections) return '';

  const p = occ.projections;
  const rows = [
    `| Metric | Value |`,
    `|--------|-------|`,
    p.employment_base ? `| ${p.base_year} Employment | ${p.employment_base.toLocaleString()} |` : null,
    p.employment_projected ? `| Projected ${p.projected_year} Employment | ${p.employment_projected.toLocaleString()} |` : null,
    `| Growth Rate (${p.base_year}–${p.projected_year}) | ${p.change_percent}% |`,
    p.change_number ? `| Net Change | ${p.change_number.toLocaleString()} |` : null,
    p.annual_openings ? `| Annual Job Openings | ~${p.annual_openings.toLocaleString()} |` : null,
    p.growth_category ? `| Growth Category | ${p.growth_category} |` : null,
  ].filter(Boolean);

  return rows.join('\n') + '\n';
}

function formatSkillsList(raw: AgentIntelligenceContext['raw']): string {
  const occ = raw.occupation;
  if (!occ?.skills || occ.skills.length === 0) return '';

  const skills = occ.skills.filter((s: any) => s.skill_type === 'skill').slice(0, 5);
  const knowledge = occ.skills.filter((s: any) => s.skill_type === 'knowledge').slice(0, 5);
  const tech = occ.skills.filter((s: any) => s.skill_type === 'technology').slice(0, 5);

  const parts: string[] = [];
  if (knowledge.length > 0) {
    parts.push(...knowledge.map((s: any, i: number) => `${i + 1}. **${s.skill_name}**${s.category ? ` — ${s.category}` : ''}`));
  }
  if (skills.length > 0 && parts.length === 0) {
    parts.push(...skills.map((s: any, i: number) => `${i + 1}. **${s.skill_name}**${s.category ? ` — ${s.category}` : ''}`));
  }
  if (tech.length > 0) {
    parts.push('', '**Technology Requirements:**', ...tech.map((s: any) => `- ${s.skill_name}`));
  }

  return parts.join('\n') + '\n';
}

function formatRegionalEconomyTable(raw: AgentIntelligenceContext['raw']): string {
  const sa = raw.serviceArea;
  if (!sa?.found || !sa.data) return '';

  const d = sa.data;
  const parts: string[] = [];

  if (d.counties?.length > 0) {
    if (d.totalPopulation > 0) {
      parts.push(`The service area encompasses **${d.counties.length} counties** with a combined population of **${d.totalPopulation.toLocaleString()}**.`);
    } else {
      parts.push(`The service area encompasses **${d.counties.length} counties**.`);
    }
    parts.push('');
  }

  const econRows = [
    `| Metric | Value |`,
    `|--------|-------|`,
    d.totalPopulation > 0 ? `| Population | ${d.totalPopulation.toLocaleString()} |` : null,
    `| Total Establishments | ${d.totalEstablishments.toLocaleString()} |`,
    `| Total Employees | ${d.totalEmployees.toLocaleString()} |`,
    d.avgMedianIncome ? `| Avg. Median Household Income | $${d.avgMedianIncome.toLocaleString()} |` : null,
    d.avgUnemployment ? `| Avg. Unemployment Rate | ${d.avgUnemployment}% |` : null,
    d.avgPovertyRate ? `| Avg. Poverty Rate | ${d.avgPovertyRate}% |` : null,
    d.avgBachelorsRate ? `| Bachelor's Degree or Higher | ${d.avgBachelorsRate}% |` : null,
  ].filter(Boolean);

  parts.push(econRows.join('\n'));

  if (d.topIndustries?.length > 0) {
    parts.push('');
    parts.push('**Top Industries by Employment:**');
    parts.push('');
    parts.push('| Industry | Employees | Share |');
    parts.push('|----------|-----------|-------|');
    for (const ind of d.topIndustries.slice(0, 6)) {
      const pct = d.totalEmployees > 0 ? Math.round((ind.employees / d.totalEmployees) * 100) : 0;
      parts.push(`| ${ind.name} | ${ind.employees.toLocaleString()} | ${pct}% |`);
    }
  }

  return parts.join('\n') + '\n';
}

function formatCompletionsTable(raw: AgentIntelligenceContext['raw']): string {
  const comp = raw.completions;
  if (!comp?.found || !comp.data || comp.data.length === 0) return '';

  const parts: string[] = [
    '| CIP Code | Program | Completions |',
    '|----------|---------|-------------|',
  ];

  for (const c of comp.data.slice(0, 10)) {
    parts.push(`| ${(c as any).cip_code} | ${(c as any).program_name || '—'} | ${(c as any).total_completions} |`);
  }

  return parts.join('\n') + '\n';
}

function formatDemographicsTable(raw: AgentIntelligenceContext['raw']): string {
  const demos = raw.stateDemographics;
  if (!demos?.found || !demos.data) return '';

  const d = demos.data;
  const rows = [
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total Population | ${d.totalPopulation.toLocaleString()} |`,
    `| Counties | ${d.countyCount} |`,
    `| Avg. Median Household Income | $${d.avgMedianIncome.toLocaleString()} |`,
    `| Avg. Poverty Rate | ${d.avgPovertyRate}% |`,
    `| Bachelor's Degree+ | ${d.avgBachelorsRate}% |`,
    `| Avg. Unemployment | ${d.avgUnemployment}% |`,
  ];

  return rows.join('\n') + '\n';
}

// ════════════════════════════════════════════════════════
// SECTION BUILDERS
// ════════════════════════════════════════════════════════

function buildCoverPage(project: ValidationProject, reportDate: string): string {
  return `---
pdf_options:
  format: Letter
  margin: 25mm
  headerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#999;">Wavelength — ${project.program_name} Validation</div>'
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

  // Try to extract narrative exec summary from tiger team
  let narrative = '';
  if (tigerTeamMarkdown) {
    // Tiger team has an "Executive Summary" section — extract it
    const execMatch = tigerTeamMarkdown.match(/# Executive Summary\s+([\s\S]*?)(?=\n# )/);
    if (execMatch) {
      narrative = execMatch[1].trim();
    } else {
      // Fallback: use tiger team recommendation + key findings sections
      const recMatch = tigerTeamMarkdown.match(/# Recommendation\s+([\s\S]*?)(?=\n# )/);
      if (recMatch) {
        narrative = recMatch[1].trim();
      }
    }
  }

  // If no tiger team narrative, build from scores
  if (!narrative) {
    narrative = buildNarrativeFromScores(project, programScore, raw);
  }

  // Build investment summary table from financial component or intel data
  const investmentTable = buildInvestmentSummaryTable(programScore);

  const parts = [
    `# Executive Summary`,
    '',
    `## Recommendation: **${recLabel}**`,
    '',
    narrative,
  ];

  if (investmentTable) {
    parts.push('', '### Investment Summary', '', investmentTable);
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

  // Opening
  parts.push(`Based on comprehensive analysis across market demand, competitive landscape, curriculum viability, financial projections, and marketing opportunity, this report evaluates the proposed **${project.program_name}** program at **${project.client_name}**.`);
  parts.push('');

  // Key findings
  parts.push('### Key Findings');
  parts.push('');

  // Wage data from intel
  if (raw?.occupation?.projections) {
    const p = raw.occupation.projections;
    parts.push(`- **Growth outlook:** The Bureau of Labor Statistics projects **${p.change_percent}% growth** from ${p.base_year}–${p.projected_year}${p.annual_openings ? `, with approximately **${p.annual_openings.toLocaleString()} annual openings**` : ''}.`);
  }

  if (raw?.occupation?.wages) {
    const w = raw.occupation.wages;
    parts.push(`- **Strong wages:** ${w.geo_name} median annual wage is **$${w.median_annual?.toLocaleString()}**${w.pct_10 ? `, with entry-level at **$${w.pct_10.toLocaleString()}**` : ''}.`);
  }

  // Strength narratives from scoring
  for (const s of strengths) {
    parts.push(`- **${s.dimension}** scored ${s.score}/10 — ${s.rationale.substring(0, 200)}`);
  }

  if (concerns.length > 0) {
    parts.push('');
    for (const c of concerns) {
      parts.push(`- **Area of concern: ${c.dimension}** scored ${c.score}/10 — ${c.rationale.substring(0, 200)}`);
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

function buildInvestmentSummaryTable(programScore: ProgramScore): string {
  // This is a summary — detailed financials appear in the Financial Projections section
  // We only add this if the composite score supports a go/conditional recommendation
  if (programScore.compositeScore < 5) return '';

  return `| Item | Detail |
|------|--------|
| Composite Validation Score | ${programScore.compositeScore}/10 |
| Recommendation | ${formatRecommendationLabel(programScore.recommendation)} |
| Dimensions Evaluated | ${programScore.dimensions.length} |
| Strongest Dimension | ${[...programScore.dimensions].sort((a, b) => b.score - a.score)[0]?.dimension || 'N/A'} (${[...programScore.dimensions].sort((a, b) => b.score - a.score)[0]?.score}/10) |
| Weakest Dimension | ${[...programScore.dimensions].sort((a, b) => a.score - b.score)[0]?.dimension || 'N/A'} (${[...programScore.dimensions].sort((a, b) => a.score - b.score)[0]?.score}/10) |`;
}

function buildMarketDemandSection(
  components: ResearchComponent[],
  raw: AgentIntelligenceContext['raw'] | null,
  programName?: string,
): string {
  const parts: string[] = ['# Market Demand Analysis'];

  // National labor market overview from intel
  if (raw?.occupation) {
    parts.push('', '## National Labor Market Overview');

    const wagesTable = formatWagesTable(raw);
    if (wagesTable) {
      parts.push('', '### Bureau of Labor Statistics — Wage Data', '', wagesTable);
    }

    const projectionsTable = formatProjectionsTable(raw);
    if (projectionsTable) {
      parts.push('', '### Employment Projections', '', projectionsTable);
    }

    // H-1B demand signals
    if (raw.occupation.h1bDemand && raw.occupation.h1bDemand.length > 0) {
      const h = raw.occupation.h1bDemand[0] as any;
      parts.push('', '### H-1B Visa Demand Signals', '');
      parts.push(`| Metric | Value |`);
      parts.push(`|--------|-------|`);
      if (h.total_applications) parts.push(`| Total Applications | ${h.total_applications.toLocaleString()} |`);
      if (h.total_certified) parts.push(`| Certified | ${h.total_certified.toLocaleString()} |`);
      if (h.avg_wage) parts.push(`| Avg. Wage on Applications | $${h.avg_wage.toLocaleString()} |`);
      if (h.unique_employers) parts.push(`| Unique Employers Filing | ${h.unique_employers} |`);
      parts.push('');
    }

    // State priority status
    if (raw.occupation.statePriority?.isPriority) {
      const sp = raw.occupation.statePriority;
      parts.push(`> **State Priority Status:** This occupation is on the state in-demand list. WIOA Fundable: ${sp.wioaFundable ? 'Yes' : 'No'}. Scholarship Eligible: ${sp.scholarshipEligible ? 'Yes' : 'No'}.`);
      parts.push('');
    }
  }

  // Regional market data from service area
  if (raw?.serviceArea?.found && raw.serviceArea.data) {
    parts.push('## Regional Market Data');
    parts.push('');
    parts.push(formatRegionalEconomyTable(raw));
  }

  // Skills analysis from O*NET
  if (raw?.occupation?.skills && raw.occupation.skills.length > 0) {
    parts.push('', '## Skills Analysis (O*NET)', '');
    parts.push(formatSkillsList(raw));
  }

  // Agent analysis — labor market component markdown
  const laborComp = components.find(c => c.component_type === 'labor_market');
  if (laborComp) {
    const md = laborComp.markdown_output || formatComponentContent('labor_market', laborComp.content);
    if (md) {
      const cleaned = cleanAgentMarkdown(md, programName);
      if (cleaned) {
        parts.push('', '## Employer Demand Signals', '', cleaned);
}
    }
  }

  // Employer demand component
  const employerComp = components.find(c => c.component_type === 'employer_demand');
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

  // Completions data from intel
  if (raw?.completions?.found && raw.completions.data?.length > 0) {
    parts.push('', '## Regional Program Completions (IPEDS)', '');
    parts.push(formatCompletionsTable(raw));
  }

  // Agent analysis — competitive landscape component
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

  parts.push('', '<div style="page-break-after: always;"></div>');
  return parts.join('\n');
}

function buildCurriculumDesignSection(
  components: ResearchComponent[],
  programName?: string,
): string {
  const parts: string[] = ['# Curriculum Design'];

  // Institutional fit component
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

  // Regulatory compliance component
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

  // Financial viability component
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

  // Learner demand component
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

  // A. Data Sources — clean list
  parts.push('', '## Data Sources', '');
  const dataSources = buildDataSourcesList(citations, raw);
  parts.push(dataSources);

  // B. Methodology
  parts.push('', '## Methodology', '');
  parts.push('This validation report was produced using Wavelength\'s multi-perspective research methodology combining real labor market data, competitive intelligence, financial modeling, and workforce program development expertise.');
  parts.push('');
  parts.push('Each research dimension is scored 1–10 by specialized analysis, with weights reflecting relative importance to program success. A composite weighted score determines the overall recommendation. Override rules apply when critical dimensions (Financial Viability, Labor Market Demand) score below threshold.');

  // C. Assumptions
  parts.push('', '## Assumptions', '');
  parts.push('- Tuition pricing based on regional market benchmarks');
  parts.push('- Enrollment projections assume moderate marketing investment');
  parts.push('- Completion rates based on program format benchmarks');
  parts.push('- Technology costs leverage existing institutional infrastructure');
  parts.push('- Instructor costs at regional adjunct rates');

  // D. Validation Scorecard (moved from main body)
  parts.push('', '## Validation Scorecard', '');
  parts.push('| Dimension | Weight | Score | Status |');
  parts.push('|-----------|--------|-------|--------|');
  const sortedDims = [...programScore.dimensions].sort((a, b) => b.weight - a.weight);
  for (const d of sortedDims) {
    const status = d.score >= 8 ? 'Strong' : d.score >= 5 ? 'Adequate' : 'Concern';
    parts.push(`| ${d.dimension} | ${(d.weight * 100).toFixed(0)}% | ${d.score}/10 | ${status} |`);
  }
  parts.push(`| **COMPOSITE** | **100%** | **${programScore.compositeScore}/10** | **${programScore.recommendation}** |`);

  // E. Scoring Detail
  parts.push('', '## Scoring Detail', '');
  for (const d of programScore.dimensions) {
    parts.push(`**${d.dimension}** (${(d.weight * 100).toFixed(0)}% weight)`);
    parts.push(`- Score: ${d.score}/10`);
    parts.push(`- Rationale: ${d.rationale}`);
    parts.push('');
  }

  // F. Demographics (if available and not shown in body)
  if (raw?.stateDemographics?.found && raw.stateDemographics.data && !raw.serviceArea?.found) {
    parts.push('## State Demographics', '');
    parts.push(formatDemographicsTable(raw));
  }

  // G. Recommendations from tiger team (if available)
  if (tigerTeamMarkdown) {
    // Extract specific sections useful for appendix
    const risksMatch = tigerTeamMarkdown.match(/# Top Risks & Mitigation Strategies\s+([\s\S]*?)(?=\n# )/);
    if (risksMatch) {
      parts.push('', '## Risk Analysis', '', risksMatch[1].trim());
    }

    const csfMatch = tigerTeamMarkdown.match(/# Critical Success Factors\s+([\s\S]*?)(?=\n# )/);
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
  // Prefer clean dataSources from citation agent
  if (citations?.dataSources && citations.dataSources.length > 0) {
    return citations.dataSources.map((s, i) => `${i + 1}. **${s}**`).join('\n');
  }

  // Build from intel context tables
  const sources: string[] = [];
  if (raw?.occupation?.wages) sources.push('U.S. Bureau of Labor Statistics — Occupational Employment and Wage Statistics (OES)');
  if (raw?.occupation?.projections) sources.push('U.S. Bureau of Labor Statistics — Employment Projections');
  if (raw?.occupation?.skills && raw.occupation.skills.length > 0) sources.push('O*NET OnLine — Occupation Profiles');
  if (raw?.occupation?.h1bDemand && raw.occupation.h1bDemand.length > 0) sources.push('U.S. Department of Labor — H-1B Visa Application Data');
  if (raw?.occupation?.statePriority?.isPriority) sources.push('State Workforce Development Board — In-Demand Occupations List');
  if (raw?.serviceArea?.found) sources.push('U.S. Census Bureau — County Business Patterns (CBP)');
  if (raw?.stateDemographics?.found || raw?.serviceArea?.found) sources.push('U.S. Census Bureau — American Community Survey (ACS)');
  if (raw?.completions?.found) sources.push('IPEDS — Program Completions Data');
  if (raw?.institution?.found) sources.push('IPEDS — Institutional Characteristics');
  if (raw?.frameworks?.found) sources.push('Workforce Development Frameworks & Best Practices');

  // Always include these generic sources
  if (sources.length === 0) {
    sources.push(
      'U.S. Bureau of Labor Statistics (BLS)',
      'O*NET OnLine',
      'State labor market information systems',
      'IPEDS — Program completions data',
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
 * Clean agent markdown before inserting into the report template.
 * Strips duplicate headers, dimension scores, section prefixes,
 * agent executive summaries, and downgrades remaining headings.
 */
function cleanAgentMarkdown(md: string, programName?: string): string {
  let out = md;

  // 1. Strip agent H1 headers that duplicate template sections
  //    e.g. "# Market Analysis: Pharmacy Technician Certificate"
  //    e.g. "# Competitive Landscape: Pharmacy Technician Certificate"
  //    e.g. "# Financial Analysis: Pharmacy Technician Certificate"
  //    Also catch standalone agent H1s like "# Labor Market Analysis"
  if (programName) {
    const escaped = programName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Strip "# Anything: <Program Name>" lines (and optional trailing line with bold/date)
    out = out.replace(new RegExp(`^# [^\\n]*?:\\s*${escaped}[^\\n]*\\n?`, 'gm'), '');
  }
  // Strip common agent H1 patterns that match template section names
  out = out.replace(/^# (?:Market|Labor Market|Competitive|Financial|Institutional|Regulatory|Target Learner|Employer Demand)[^\n]*\n/gm, '');

  // 2. Strip ALL dimension score blocks — both H2 and blockquote styles
  //    "## Dimension Score: 8/10" + optional following rationale line(s)
  out = out.replace(/^##?\s*Dimension Score[:\s][^\n]*\n(?:(?:\*\*Rationale:\*\*|\*\*|>)[^\n]*\n)*/gim, '');
  //    "> **Dimension Score: 8/10** 🟢" + following ">" lines
  out = out.replace(/^>\s*\*\*Dimension Score[^\n]*\n(?:>\s*[^\n]*\n)*/gm, '');
  //    Also catch "**Viability Score: 10/10**" style at start of line
  out = out.replace(/^\*\*Viability Score:[^\n]*\n/gm, '');
  //    And standalone score lines like "**SCORE: 7/10 | RATIONALE:**..."
  out = out.replace(/^\*\*SCORE:[^\n]*\n/gm, '');

  // 3. Strip "## Section N:" prefixes
  out = out.replace(/^##\s+Section \d+:[^\n]*\n/gm, '');

  // 4. Strip "## Executive Summary" when inside a component
  out = out.replace(/^## Executive Summary\s*\n/gm, '');

  // 5. Strip agent byline/date lines that appear right after H1s
  //    e.g. "**Kirkwood Community College | Cedar Rapids & Iowa City, Iowa**"
  //    e.g. "*Prepared by Tomás Reyes, Market Analyst | Analysis Date: February 2026*"
  out = out.replace(/^\*\*[^*]+\|[^*]+\*\*\s*\n\*Prepared by[^\n]*\n/gm, '');

  // 6. Downgrade remaining H1→H2, H2→H3 so agents don't compete with template H1s
  //    Process H2 first (to avoid double-downgrading)
  out = out.replace(/^## /gm, '### ');
  out = out.replace(/^# /gm, '## ');

  // 7. Trim excessive blank lines (3+ consecutive → 2)
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

function extractTigerTeamRecommendations(tigerTeamMarkdown: string): string {
  // Extract the Recommendation section for the exec summary area
  const recMatch = tigerTeamMarkdown.match(/# Recommendation\s+([\s\S]*?)(?=\n# )/);
  if (recMatch) return recMatch[1].trim();
  return '';
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

  // ── Build report sections ──
  const sections: string[] = [];

  // 1. Cover page
  sections.push(buildCoverPage(project, reportDate));

  // 2. Table of Contents
  sections.push(buildTableOfContents());

  // 3. Executive Summary (narrative prose)
  sections.push(buildExecutiveSummary(project, programScore, tigerTeamMarkdown, raw));

  // 4. Market Demand Analysis (with BLS data tables)
  sections.push(buildMarketDemandSection(components, raw, project.program_name));

  // 5. Competitive Landscape (with comparison table)
  sections.push(buildCompetitiveLandscapeSection(components, raw, project.program_name));

  // 6. Curriculum Design (institutional fit + regulatory)
  sections.push(buildCurriculumDesignSection(components, project.program_name));

  // 7. Financial Projections
  sections.push(buildFinancialProjectionsSection(components, project.program_name));

  // 8. Marketing Strategy (learner demand)
  sections.push(buildMarketingStrategySection(components, project.program_name));

  // 9. Appendix (data sources, methodology, scorecard, assumptions)
  sections.push(buildAppendix(project, programScore, citations, raw, tigerTeamMarkdown));

  // ── Footer ──
  sections.push(`
---

*© ${new Date().getFullYear()} Wavelength. All rights reserved.*
*hello@withwavelength.com*`);

  return sections.join('\n\n');
}
