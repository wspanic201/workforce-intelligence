import { ValidationProject, ResearchComponent } from '@/lib/types/database';
import { ProgramScore } from '@/lib/scoring/program-scorer';
import { formatComponentContent } from './format-component';

interface ReportInput {
  project: ValidationProject;
  components: ResearchComponent[];
  programScore: ProgramScore;
  tigerTeamMarkdown?: string;
}

export function generateReport(input: ReportInput): string {
  const { project, components, programScore, tigerTeamMarkdown } = input;
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getComponent = (type: string) =>
    components.find(c => c.component_type === type);

  const scoreEmoji = (score: number) => {
    if (score >= 8) return '🟢';
    if (score >= 5) return '🟡';
    return '🔴';
  };

  const recColor = (rec: string) => {
    switch (rec) {
      case 'Strong Go': return '✅ STRONG GO';
      case 'Conditional Go': return '⚠️ CONDITIONAL GO';
      case 'Cautious Proceed': return '🟡 CAUTIOUS PROCEED';
      case 'Defer': return '🟠 DEFER';
      case 'No Go': return '🔴 NO GO';
      default: return rec;
    }
  };

  // Build scorecard table
  const scorecardRows = programScore.dimensions
    .sort((a, b) => b.weight - a.weight)
    .map(d => {
      const bar = '█'.repeat(Math.round(d.score)) + '░'.repeat(10 - Math.round(d.score));
      return `| ${d.dimension} | ${(d.weight * 100).toFixed(0)}% | ${d.score}/10 | ${bar} | ${scoreEmoji(d.score)} |`;
    })
    .join('\n');

  // Section ordering
  const sectionOrder = [
    { type: 'labor_market', title: 'Section 1: Labor Market Analysis' },
    { type: 'competitive_landscape', title: 'Section 2: Competitive Landscape' },
    { type: 'learner_demand', title: 'Section 3: Target Learner Analysis' },
    { type: 'financial_viability', title: 'Section 4: Financial Model' },
    { type: 'institutional_fit', title: 'Section 5: Institutional Readiness' },
    { type: 'regulatory_compliance', title: 'Section 6: Regulatory & Compliance' },
    { type: 'employer_demand', title: 'Section 7: Employer Demand & Partnerships' },
  ];

  // Prefer tiger team synthesis (rich prose) over individual component markdown
  let sections: string;
  if (tigerTeamMarkdown) {
    // Tiger team produces comprehensive analysis — use it as primary content
    // Strip any leading title/header since we add our own structure
    sections = tigerTeamMarkdown
      .replace(/^#\s+.*\n/, '')
      .trim();
  } else {
    // Fallback: stitch together individual component outputs
    sections = sectionOrder
      .map(s => {
        const comp = getComponent(s.type);
        if (!comp) return '';
        const sectionContent = comp.markdown_output || formatComponentContent(s.type, comp.content);
        return `---\n\n${sectionContent}`;
      })
      .filter(Boolean)
      .join('\n\n');
  }

  // Build risk register from all component data
  const risks: string[] = [];
  for (const dim of programScore.dimensions) {
    if (dim.score <= 5) {
      risks.push(`**${dim.dimension}** (Score: ${dim.score}/10): ${dim.rationale}`);
    }
  }

  const report = `# Program Validation Report

---

## Cover Page

**Program:** ${project.program_name}
**Institution:** ${project.client_name}
**Program Type:** ${project.program_type || 'Not specified'}
**Report Date:** ${reportDate}
**Prepared by:** Workforce Intelligence

---

## Executive Summary

### Recommendation: ${recColor(programScore.recommendation)}

**Composite Score: ${programScore.compositeScore}/10**

${programScore.overrideApplied ? `> ⚠️ **Override Applied:** ${programScore.overrideReason}\n` : ''}
${programScore.conditions ? `**Conditions for Proceeding:**\n${programScore.conditions.map(c => `- ${c}`).join('\n')}\n` : ''}

This report presents a comprehensive 7-stage validation analysis for the proposed **${project.program_name}** program at **${project.client_name}**. The analysis evaluates labor market demand, competitive landscape, target learner demand, financial viability, institutional fit, regulatory compliance, and employer demand using a weighted scoring methodology.

**Key Findings:**
${programScore.dimensions
  .sort((a, b) => b.score * b.weight - a.score * a.weight)
  .slice(0, 3)
  .map(d => `- **${d.dimension}** scored ${d.score}/10 — ${d.rationale.substring(0, 120)}`)
  .join('\n')}

${programScore.dimensions.filter(d => d.score <= 4).length > 0 ? `
**Areas of Concern:**
${programScore.dimensions
  .filter(d => d.score <= 4)
  .map(d => `- **${d.dimension}** scored ${d.score}/10 — ${d.rationale.substring(0, 120)}`)
  .join('\n')}
` : ''}

---

## Validation Scorecard

| Dimension | Weight | Score | Visual | Status |
|-----------|--------|-------|--------|--------|
${scorecardRows}
| **COMPOSITE** | **100%** | **${programScore.compositeScore}/10** | | **${recColor(programScore.recommendation)}** |

---

${sections}

---

## Risk Register

${risks.length > 0 ? risks.map((r, i) => `${i + 1}. ${r}`).join('\n\n') : 'No critical risks identified. All dimensions scored above threshold.'}

---

## Recommendations & Next Steps

Based on the composite score of **${programScore.compositeScore}/10** and a recommendation of **${programScore.recommendation}**:

${programScore.recommendation === 'Strong Go' ? `
1. **Proceed to program development** — Begin curriculum design and faculty recruitment
2. **Form advisory committee** — Engage employers identified in this report
3. **Submit regulatory applications** — Start state approval and accreditor notification
4. **Develop marketing plan** — Target identified learner segments
5. **Secure startup funding** — Apply for identified grant opportunities
` : programScore.recommendation === 'Conditional Go' ? `
1. **Address conditions** — Resolve identified weaknesses before full commitment
2. **Conduct targeted research** — Gather additional data on weak dimensions
3. **Develop pilot approach** — Consider a smaller initial cohort to test assumptions
4. **Set decision checkpoint** — Revisit go/no-go in 60-90 days with new data
5. **Engage stakeholders** — Build support while addressing conditions
` : programScore.recommendation === 'Cautious Proceed' ? `
1. **Proceed with caution** — Develop program on a conservative timeline
2. **Mitigate risks** — Create specific action plans for dimensions scoring below 5
3. **Pilot first** — Launch with a small cohort before scaling
4. **Monitor closely** — Set quarterly review milestones
5. **Have an exit strategy** — Define criteria for discontinuation
` : `
1. **Do not proceed at this time** — The analysis does not support program launch
2. **Identify specific barriers** — Focus on the lowest-scoring dimensions
3. **Re-evaluate in 6-12 months** — Market conditions may change
4. **Consider alternatives** — Explore modified program concepts that address weaknesses
5. **Gather more data** — Commission targeted research on critical unknowns
`}

---

## Methodology & Data Sources

This validation report was produced using Workforce Intelligence's 7-stage Program Validator framework, which combines:

1. **Multi-Agent Analysis:** Seven specialized AI research agents each conducting focused analysis
2. **Weighted Scoring:** Evidence-based scoring across 7 dimensions with predetermined weights
3. **Override Rules:** Automatic safety checks that prevent launching programs with critical weaknesses
4. **Real Data Sources:** All findings grounded in publicly available labor market data, competitor research, and industry standards
5. **Conservative Methodology:** Estimates favor caution — community colleges operate on thin margins

**Scoring Methodology:**
- Each dimension scored 1-10 by specialized agent with rationale
- Weights reflect relative importance to CE program success
- Composite score = weighted average of all dimensions
- Override rules apply for critical dimension failures

**Data Sources Referenced:**
- U.S. Bureau of Labor Statistics (BLS)
- O*NET OnLine
- State labor market information systems
- College and university program catalogs
- Industry certification bodies
- Job market aggregators (Google Jobs via SerpAPI)
- Workforce development board data
- State regulatory agency guidelines

**Limitations:**
- This report provides strategic guidance based on available data and AI analysis
- Financial projections are estimates and should be validated with institutional budgeting
- Employer demand signals are inferred from public data unless direct engagement is noted
- Implementation success depends on execution quality and market conditions

---

## Appendix

### A. Scoring Detail

${programScore.dimensions.map(d => `**${d.dimension}** (${(d.weight * 100).toFixed(0)}% weight)
- Score: ${d.score}/10
- Rationale: ${d.rationale}
`).join('\n')}

### B. Report Metadata

- **Report Version:** 1.0
- **Framework Version:** 7-Stage Program Validator v2.0
- **Generated:** ${new Date().toISOString()}
- **Agents Used:** 7 (Labor Market, Competitive, Learner Demand, Financial, Institutional Fit, Regulatory, Employer Demand)

---

**Contact:**
Workforce Intelligence
hello@workforceintel.com

© ${new Date().getFullYear()} Workforce Intelligence. All rights reserved.
`;

  return report;
}
