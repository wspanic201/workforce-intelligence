import { DiscoveryResult } from '../agents/discovery/orchestrator';
import { ScoredProgram } from '../agents/discovery/quick-scorer';

/**
 * Discovery Report Generator
 * Generates a professional markdown report from discovery scan results
 */
export function generateDiscoveryReport(result: DiscoveryResult): string {
  const sections: string[] = [];

  // Header
  sections.push(generateHeader(result));

  // Executive Summary
  sections.push(result.executiveSummary);

  // Market Landscape
  if (result.regionalScan) {
    sections.push(generateMarketLandscape(result));
  }

  // Program Opportunities (main section)
  if (result.programRecommendations.length > 0) {
    sections.push(generateProgramOpportunities(result));
  }

  // Gap Analysis
  if (result.gapAnalysis) {
    sections.push(generateGapAnalysis(result));
  }

  // Recommended Next Steps
  sections.push(generateNextSteps(result));

  // Methodology
  sections.push(generateMethodology());

  // Footer
  if (result.errors.length > 0) {
    sections.push(generateErrorNotice(result.errors));
  }

  return sections.join('\n\n---\n\n');
}

function generateHeader(result: DiscoveryResult): string {
  const date = new Date(result.completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `# Program Discovery Report

**Generated:** ${date}  
**Status:** ${result.status === 'success' ? '✓ Complete' : result.status === 'partial' ? '⚠ Partial Results' : '✗ Error'}`;
}

function generateMarketLandscape(result: DiscoveryResult): string {
  const scan = result.regionalScan!;
  const topOccupations = scan.topOccupations.slice(0, 15);

  return `# Market Landscape

## Regional Overview

${scan.marketOverview}

## Industry Trends

${scan.industryTrends.map(trend => `- ${trend}`).join('\n')}

## Top Employment Opportunities

The following ${topOccupations.length} occupations represent the strongest labor demand in ${scan.region}:

| Rank | Occupation | SOC Code | Demand | Median Wage | Job Openings |
|------|-----------|----------|---------|-------------|--------------|
${topOccupations.map((occ, i) => 
  `| ${i + 1} | ${occ.occupation} | ${occ.socCode} | ${formatDemand(occ.demandScore)} | ${formatWage(occ.medianWage)} | ${formatJobCount(occ.jobPostingVolume)} |`
).join('\n')}

*Data sources: Bureau of Labor Statistics, Brave Search job posting analysis*`;
}

function generateProgramOpportunities(result: DiscoveryResult): string {
  const programs = result.programRecommendations;
  const highPriority = programs.filter(p => p.recommendation === 'High Priority');
  const strongOpp = programs.filter(p => p.recommendation === 'Strong Opportunity');
  const consider = programs.filter(p => p.recommendation === 'Consider');

  return `# Program Opportunities

We identified **${programs.length} program opportunities** ranked by opportunity score. Each program has been evaluated on demand strength, competition gap, salary ROI, and institutional fit.

${highPriority.length > 0 ? `
## High Priority Programs (8.0+ Opportunity Score)

These programs represent the strongest opportunities and should be prioritized for full validation.

${highPriority.map((prog, i) => formatProgramDetail(prog, i + 1)).join('\n\n')}
` : ''}

${strongOpp.length > 0 ? `
## Strong Opportunity Programs (6.5-7.9 Score)

These programs show solid potential and merit consideration.

${strongOpp.map((prog, i) => formatProgramSummary(prog, i + 1)).join('\n\n')}
` : ''}

${consider.length > 0 ? `
## Additional Opportunities (5.0-6.4 Score)

${consider.map((prog, i) => formatProgramOneLiner(prog, i + 1)).join('\n')}
` : ''}`;
}

function formatProgramDetail(prog: ScoredProgram, rank: number): string {
  return `### ${rank}. ${prog.programName}

**Opportunity Score:** ${prog.opportunityScore}/10 — **${prog.recommendation}**

**Target Occupation:** ${prog.targetOccupation} (SOC ${prog.socCode})  
**Credential:** ${formatCredentialType(prog.credentialType)}, ${prog.programLength}  
**Implementation:** ${formatComplexity(prog.implementationComplexity)} complexity, ${prog.estimatedCostTier} cost tier  
**Potential Revenue:** ${prog.potentialRevenue}

#### Score Breakdown

| Dimension | Score | What This Means |
|-----------|-------|-----------------|
| **Demand Strength** | ${prog.scoreBreakdown.demandStrength}/10 | ${interpretDemandScore(prog.scoreBreakdown.demandStrength)} |
| **Competition Gap** | ${prog.scoreBreakdown.competitionGap}/10 | ${interpretCompetitionScore(prog.scoreBreakdown.competitionGap)} |
| **Salary ROI** | ${prog.scoreBreakdown.salaryROI}/10 | ${interpretSalaryScore(prog.scoreBreakdown.salaryROI)} |
| **Institutional Fit** | ${prog.scoreBreakdown.institutionalFit}/10 | ${interpretFitScore(prog.scoreBreakdown.institutionalFit)} |

#### Why This Program?

${prog.rationale}

#### Key Strengths

${prog.keyInsights.map(insight => `- ${insight}`).join('\n')}

#### Risks to Monitor

${prog.risks.map(risk => `- ${risk}`).join('\n')}

#### Curriculum Overview

**Core Components:**
${prog.coreComponents.map(comp => `- ${comp}`).join('\n')}

**Required Resources:**
${prog.requiredResources.map(res => `- ${res}`).join('\n')}`;
}

function formatProgramSummary(prog: ScoredProgram, rank: number): string {
  return `### ${rank}. ${prog.programName} (${prog.opportunityScore}/10)

**Target:** ${prog.targetOccupation} | **Credential:** ${formatCredentialType(prog.credentialType)} | **Timeline:** ${prog.programLength}

**Key Insight:** ${prog.keyInsights[0] || 'Strong opportunity'}

**Primary Risk:** ${prog.risks[0] || 'Standard implementation challenges'}`;
}

function formatProgramOneLiner(prog: ScoredProgram, rank: number): string {
  return `${rank}. **${prog.programName}** (${prog.opportunityScore}/10) — ${prog.targetOccupation}, ${prog.credentialType}`;
}

function generateGapAnalysis(result: DiscoveryResult): string {
  const gaps = result.gapAnalysis!;

  return `# Gap Analysis

## What's Missing vs. What's Saturated

**Total Opportunity Gaps Identified:** ${gaps.totalGapsIdentified}

### High-Opportunity Gaps

Programs where strong demand exists but the institution has no current offering:

${gaps.highOpportunityGaps.slice(0, 10).map(gap => 
  `- **${gap.occupation}** (${gap.socCode}) — Opportunity Score: ${gap.opportunityScore}/10
  - ${gap.rationale}`
).join('\n\n')}

${gaps.saturatedAreas.length > 0 ? `
### Saturated Markets (Avoid)

These areas already have strong coverage and high competition:

${gaps.saturatedAreas.map(sat => `- ${sat}`).join('\n')}
` : ''}`;
}

function generateNextSteps(result: DiscoveryResult): string {
  const topPrograms = result.programRecommendations.slice(0, 3);
  
  return `# Recommended Next Steps

## Immediate Actions (Next 30 Days)

1. **Review & Prioritize**
   - Leadership review of top 5 program recommendations
   - Identify 2-3 programs that align with strategic priorities
   - Consider institutional capacity and resource availability

2. **Order Full Validations**
   - Select top 2-3 programs for comprehensive validation
   - Full validation includes: detailed market research, competitive analysis, financial modeling, curriculum design, and implementation roadmap
   - Investment: $2,500-$7,500 per program validation

3. **Begin Stakeholder Conversations**
   - Share discovery report with academic leadership and board
   - Schedule exploratory conversations with potential industry partners
   - Assess internal faculty capacity and interest

## Medium-Term (60-90 Days)

4. **Feasibility Planning**
   - For high-priority programs, begin resource assessment
   - Explore accreditation requirements and timelines
   - Develop preliminary budget estimates

5. **Market Monitoring**
   - Track job posting trends for target occupations
   - Monitor competitor program launches
   - Stay informed on industry changes

## Programs Recommended for Full Validation

Based on this discovery scan, we recommend ordering full validation reports for:

${topPrograms.map((prog, i) => 
  `${i + 1}. **${prog.programName}** (${prog.opportunityScore}/10) — ${prog.recommendation}`
).join('\n')}

These programs represent your strongest opportunities and warrant deeper analysis before launch decisions.`;
}

function generateMethodology(): string {
  return `# Methodology

This Program Discovery Report uses a proprietary multi-lens analysis framework:

## 1. Regional Labor Market Scan
- **BLS Employment Data**: National and state-level employment statistics, wage data, and occupational projections
- **Job Posting Analysis**: Real-time job market demand from aggregated job boards
- **Industry Trend Analysis**: Sector growth patterns and emerging occupations

## 2. Gap Identification
- **Supply-Demand Mapping**: Comparison of regional labor needs vs. current institutional offerings
- **Competition Assessment**: Analysis of existing programs in the market (local colleges, online providers)
- **Opportunity Scoring**: Quantitative ranking based on unmet demand and market positioning

## 3. Program Design
- **Curriculum Mapping**: Occupation-to-program alignment using O*NET standards
- **Resource Planning**: Identification of required labs, equipment, partnerships, and faculty
- **Implementation Assessment**: Complexity scoring and development cost estimation

## 4. Opportunity Scoring
Each program receives a composite score (1-10) based on:
- **Demand Strength (30%)**: Labor market demand, growth trends, hiring volume
- **Competition Gap (25%)**: Market saturation, competitive positioning
- **Salary ROI (25%)**: Graduate earning potential vs. program cost
- **Institutional Fit (20%)**: Implementation feasibility, resource alignment

## Data Sources
- U.S. Bureau of Labor Statistics (BLS) — Employment and wage data
- Brave Search API — Job posting volume and market trends
- O*NET OnLine — Occupational standards and competency frameworks
- Research analysis — Institutional capacity assessment

## Limitations
- This is a **discovery-level scan**, not a full program validation
- Data reflects current market conditions (may change over time)
- Implementation costs are estimates; actual costs vary by institution
- Full validation recommended before program launch decisions`;
}

function generateErrorNotice(errors: string[]): string {
  return `## Analysis Notes

The following issues were encountered during analysis:

${errors.map(err => `- ${err}`).join('\n')}

These issues did not prevent report generation but may affect completeness of certain sections.`;
}

// Helper functions

function formatDemand(score: number): string {
  if (score >= 8) return '🔥 Very High';
  if (score >= 6) return '📈 High';
  if (score >= 4) return '➡️ Moderate';
  return '📉 Low';
}

function formatWage(wage: number | null): string {
  return wage ? `$${wage.toLocaleString()}` : 'N/A';
}

function formatJobCount(count: number | null): string {
  return count ? count.toLocaleString() : 'N/A';
}

function formatCredentialType(type: string): string {
  const types: Record<string, string> = {
    certificate: 'Certificate',
    associate: 'Associate Degree',
    bachelor: 'Bachelor Degree',
    stackable: 'Stackable Credential',
  };
  return types[type] || type;
}

function formatComplexity(level: number): string {
  const labels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
  return labels[level - 1] || 'Unknown';
}

function interpretDemandScore(score: number): string {
  if (score >= 8) return 'Exceptional labor market demand';
  if (score >= 6) return 'Strong and sustained demand';
  if (score >= 4) return 'Moderate demand, stable market';
  return 'Limited demand, high risk';
}

function interpretCompetitionScore(score: number): string {
  if (score >= 8) return 'Few competitors, open market';
  if (score >= 6) return 'Moderate competition, room to differentiate';
  if (score >= 4) return 'Competitive market, strong positioning needed';
  return 'Saturated market, difficult entry';
}

function interpretSalaryScore(score: number): string {
  if (score >= 8) return 'Excellent ROI for students';
  if (score >= 6) return 'Solid career outcomes';
  if (score >= 4) return 'Adequate salary potential';
  return 'Limited earning potential';
}

function interpretFitScore(score: number): string {
  if (score >= 8) return 'Excellent institutional alignment, ready to launch';
  if (score >= 6) return 'Good fit, manageable resource requirements';
  if (score >= 4) return 'Moderate fit, significant resource investment needed';
  return 'Poor fit, high implementation barriers';
}
