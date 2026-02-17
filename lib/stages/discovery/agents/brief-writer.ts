/**
 * Phase 5: Discovery Brief Writer
 * 
 * Takes all structured data from Phases 1-4 and produces the polished
 * Discovery Brief in the exact format Matt specified. No new research —
 * pure synthesis and formatting.
 * 
 * Output: 12-20 page consulting-grade brief ready for a Dean or VP.
 */

import { callClaude } from '@/lib/ai/anthropic';
import type { RegionalIntelligenceOutput } from './regional-intelligence';
import type { DemandSignalOutput } from './demand-signals';
import type { CompetitiveLandscapeOutput } from './competitive-landscape';
import type { OpportunityScorerOutput, ScoredOpportunity } from './opportunity-scorer';
import type { BlueOceanScannerOutput, BlueOceanOpportunity } from './blue-ocean-scanner';

export interface DiscoveryBrief {
  markdown: string;        // Full formatted brief
  wordCount: number;
  pageEstimate: number;    // ~400 words per page
  programCount: number;
  generatedAt: string;
}

// ── Main Agent ──

export async function writeDiscoveryBrief(
  regionalIntel: RegionalIntelligenceOutput,
  demandSignals: DemandSignalOutput,
  competitiveLandscape: CompetitiveLandscapeOutput,
  scoredOpportunities: OpportunityScorerOutput,
  blueOceanResults?: BlueOceanScannerOutput | null
): Promise<DiscoveryBrief> {
  const { institution, topEmployers, economicTrends } = regionalIntel;
  const opps = scoredOpportunities.scoredOpportunities;
  const grants = demandSignals.grantOpportunities || [];

  console.log(`[Phase 5: Brief Writer] Generating Discovery Brief for ${institution.name}`);

  // ── Build grant alignment map (program → matching grants) ──
  const grantMap = buildGrantAlignmentMap(opps, grants, blueOceanResults?.hiddenOpportunities || []);

  // ── Build the brief in sections ──
  const sections: string[] = [];

  // Header
  sections.push(buildHeader(institution));

  // Executive Summary (use Claude for the narrative)
  const execSummary = await writeExecutiveSummary(institution, opps, demandSignals, competitiveLandscape);
  sections.push(execSummary);

  // Regional Snapshot
  sections.push(buildRegionalSnapshot(institution, topEmployers, economicTrends, demandSignals));

  // Competitive Position
  sections.push(buildCompetitivePosition(institution, competitiveLandscape));

  // Program Opportunities (1 page each) — now with grant alignment
  for (const opp of opps) {
    sections.push(buildProgramSection(opp, grantMap.get(opp.programTitle)));
  }

  // Blue Ocean Hidden Opportunities
  if (blueOceanResults && blueOceanResults.hiddenOpportunities.length > 0) {
    sections.push(buildBlueOceanSection(blueOceanResults));
  }

  // Funding Roadmap (grant alignment summary)
  if (grants.length > 0) {
    sections.push(buildFundingRoadmap(opps, blueOceanResults?.hiddenOpportunities || [], grants, grantMap));
  }

  // Recommended Next Steps
  sections.push(buildNextSteps(institution, opps));

  // Appendix
  sections.push(buildAppendix(
    scoredOpportunities.fullCandidateMatrix,
    regionalIntel.dataSources,
    demandSignals.searchesExecuted + competitiveLandscape.searchesExecuted + regionalIntel.searchesExecuted
  ));

  const markdown = sections.join('\n\n---\n\n');
  const wordCount = markdown.split(/\s+/).length;

  console.log(`[Phase 5: Brief Writer] Complete. ${wordCount} words, ~${Math.ceil(wordCount / 400)} pages, ${opps.length} programs.`);

  return {
    markdown,
    wordCount,
    pageEstimate: Math.ceil(wordCount / 400),
    programCount: opps.length,
    generatedAt: new Date().toISOString(),
  };
}

// ── Section Builders ──

function buildHeader(institution: RegionalIntelligenceOutput['institution']): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `# PROGRAM DISCOVERY BRIEF

**Prepared for:** ${institution.name}  
**Service Region:** ${institution.serviceArea}, ${institution.state}  
**Date:** ${date}  
**Prepared by:** WorkforceOS`;
}

async function writeExecutiveSummary(
  institution: RegionalIntelligenceOutput['institution'],
  opps: ScoredOpportunity[],
  demandSignals: DemandSignalOutput,
  competitiveLandscape: CompetitiveLandscapeOutput
): Promise<string> {
  const quickWins = opps.filter(o => o.tier === 'quick_win');
  const topOpp = opps[0];

  const { content } = await callClaude(
    `Write a compelling executive summary (3-4 paragraphs) for a Program Discovery Brief.

CRITICAL BRANDING RULE: You are writing as "WorkforceOS". Use "WorkforceOS" when referring to the company that conducted this analysis. Do NOT use any other company name (e.g., Gray Associates, Hanover Research, EAB, etc.). Do NOT invent or substitute any third-party brand names.

FACTS TO WEAVE IN:
- Institution: ${institution.name} in ${institution.serviceArea}, ${institution.state}
- We identified ${opps.length} high-potential program opportunities
- ${competitiveLandscape.whiteSpaceCount} opportunities are in complete white space (no local competitor)
- ${quickWins.length} are Quick Wins launchable in 3-6 months
- Top opportunity: ${topOpp?.programTitle} (score: ${topOpp?.scores.composite}/10)
- Total demand signals detected: ${demandSignals.signals.length}
- Top industries: ${demandSignals.topIndustries.slice(0, 3).map(i => i.industry).join(', ')}

TONE: Confident consulting language. Lead with the most compelling finding. Authoritative, specific, no hedging.

FORMAT: 
Paragraph 1: Methodology and scope — reference "WorkforceOS" as the analysis platform (2-3 sentences)
Paragraph 2: The single most important finding — lead with the strongest opportunity
Paragraph 3: Summary numbers and what they mean
Paragraph 4: Clear call to action recommending Stage 2 validation on top programs

Do NOT use bullet points. Write in flowing paragraphs. Use specific numbers.
Return ONLY the executive summary text, no JSON.`,
    { maxTokens: 2000, temperature: 0.6 }
  );

  return `## EXECUTIVE SUMMARY\n\n${content}`;
}

function buildRegionalSnapshot(
  institution: RegionalIntelligenceOutput['institution'],
  topEmployers: RegionalIntelligenceOutput['topEmployers'],
  trends: RegionalIntelligenceOutput['economicTrends'],
  demandSignals: DemandSignalOutput
): string {
  const employerTable = topEmployers.slice(0, 10).map(e =>
    `| ${e.name} | ${e.industry} | ${e.estimatedLocalEmployment} |`
  ).join('\n');

  const trendBullets = trends.slice(0, 5).map(t =>
    `- **${t.trend}**: ${t.details} *(${t.source})*`
  ).join('\n');

  const grantBullets = demandSignals.grantOpportunities.slice(0, 3).map(g =>
    `- **${g.name}** (${g.industry}): ${g.details}${g.deadline ? ` — Deadline: ${g.deadline}` : ''}`
  ).join('\n');

  return `## REGIONAL SNAPSHOT

### Service Area Overview

**Region:** ${institution.serviceArea}, ${institution.state}  
**Population:** ${institution.demographics.population || 'Data unavailable'}  
**Median Household Income:** ${institution.demographics.medianIncome || 'Data unavailable'}  
**Educational Attainment:** ${institution.demographics.educationalAttainment || 'Data unavailable'}

### Top Regional Employers

| Employer | Industry | Est. Local Employment |
|----------|----------|-----------------------|
${employerTable}

### Key Economic Trends

${trendBullets || '- Economic trend data being compiled'}

${grantBullets ? `### Active Workforce Grants & Initiatives\n\n${grantBullets}` : ''}`;
}

function buildCompetitivePosition(
  institution: RegionalIntelligenceOutput['institution'],
  landscape: CompetitiveLandscapeOutput
): string {
  const providerList = landscape.providers.slice(0, 8).map(p => {
    const progCount = p.programs.length;
    const progSample = p.programs.slice(0, 3).join(', ');
    return `- **${p.name}** (${p.type.replace(/_/g, ' ')}, ${p.distance}): ${progCount > 0 ? `${progCount} programs including ${progSample}` : 'Programs not cataloged'}`;
  }).join('\n');

  const whiteSpaceList = landscape.gaps
    .filter(g => g.gapCategory === 'white_space')
    .slice(0, 5)
    .map(g => `- **${g.occupation}**: ${g.opportunity}`)
    .join('\n');

  return `## YOUR COMPETITIVE POSITION

### Current Program Strengths

${institution.currentPrograms.length > 0 
  ? institution.currentPrograms.map(p => `- ${p}`).join('\n')
  : '*Current program inventory being compiled. Full catalog review recommended.*'}

### Competitor Landscape

${providerList || '*No significant competitors identified within 50 miles.*'}

### Identified White Space

${whiteSpaceList || '*Detailed gap analysis available in program opportunity sections below.*'}

**${institution.name}'s unique positioning:** With ${landscape.whiteSpaceCount} white-space opportunities identified and ${institution.strategicPriorities.length > 0 ? `strategic alignment with priorities in ${institution.strategicPriorities.slice(0, 2).join(' and ')}` : 'strong regional employer relationships'}, the college is well-positioned to capture significant market share in underserved workforce areas.`;
}

function buildProgramSection(opp: ScoredOpportunity, matchedGrants?: GrantMatch[]): string {
  const stars = '⭐'.repeat(Math.min(Math.round(opp.scores.composite / 2), 5));
  
  const demandBullets = opp.demandEvidence.map(d =>
    `- ${d.point} *(${d.source})*`
  ).join('\n');

  const validationQuestions = opp.whatValidationWouldConfirm.map(q =>
    `- ${q}`
  ).join('\n');

  const barrierBullets = opp.barriers.map(b => `- ${b}`).join('\n');

  const grantSection = matchedGrants && matchedGrants.length > 0
    ? `### 💰 Grant Alignment

${matchedGrants.map(g => `- **${g.grantName}** (${g.industry}): ${g.details}${g.deadline ? ` — *Deadline: ${g.deadline}*` : ''}${g.estimatedAward ? ` — *Est. Award: ${g.estimatedAward}*` : ''}\n  *Relevance: ${g.relevance}*`).join('\n')}`
    : '';

  return `## ${opp.programTitle}

**Priority:** ${stars} (${opp.scores.composite}/10) | **Category:** ${opp.tier.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

### The Opportunity

${opp.description}

### Demand Evidence

${demandBullets || '- Demand evidence compiled from regional analysis'}

### Competitive Landscape

**${opp.competitivePosition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}**

### Key Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Regional Annual Openings | ${opp.keyMetrics.regionalAnnualOpenings || 'TBD in validation'} | BLS / Job Postings |
| Median Hourly Wage | ${opp.keyMetrics.medianHourlyWage || 'TBD'} | BLS OEWS |
| Projected Growth (10yr) | ${opp.keyMetrics.projectedGrowth || 'TBD'} | BLS Projections |
| Active Job Postings | ${opp.keyMetrics.activeJobPostings || 'TBD'} | Google Jobs |

### Program Snapshot

- **Estimated Duration:** ${opp.programSnapshot.estimatedDuration || 'To be determined'}
- **Delivery Format:** ${opp.programSnapshot.deliveryFormat || 'To be determined'}
- **Stackable Credentials:** ${opp.programSnapshot.stackableCredentials?.join(', ') || 'To be identified in validation'}
- **Target Audience:** ${opp.programSnapshot.targetAudience || 'To be defined'}

${grantSection}

### Barriers & Risks

${barrierBullets || '- Standard implementation considerations apply'}

### What Validation Would Confirm

${validationQuestions || '- Full employer demand analysis recommended'}`;
}

function buildNextSteps(
  institution: RegionalIntelligenceOutput['institution'],
  opps: ScoredOpportunity[]
): string {
  const topPrograms = opps.slice(0, 3);
  const quickWins = opps.filter(o => o.tier === 'quick_win').slice(0, 2);
  const timeSensitive = opps.find(o => 
    o.barriers?.some(b => b.toLowerCase().includes('deadline') || b.toLowerCase().includes('grant'))
  );

  return `## RECOMMENDED NEXT STEPS

**1. Review findings with your leadership team**  
Share this Discovery Brief with your Dean, VP of Instruction, and program development leads. Focus discussion on the top 3 recommendations and how they align with institutional strategic priorities.

**2. Select 1-3 programs for deeper validation**  
We recommend the following for immediate Program Validation:

${topPrograms.map((p, i) => `   ${i + 1}. **${p.programTitle}** (${p.scores.composite}/10 — ${p.tier.replace(/_/g, ' ')})`).join('\n')}

**3. Engage WorkforceOS Program Validation**  
Program Validation will confirm employer demand, model enrollment and revenue, conduct detailed feasibility analysis, and deliver a go/no-go recommendation with full supporting data. This is the critical step before committing development resources.

${quickWins.length > 0 ? `**4. Consider fast-tracking Quick Wins**  
${quickWins.map(q => `**${q.programTitle}**`).join(' and ')} ${quickWins.length === 1 ? 'is' : 'are'} launchable within 3-6 months with minimal startup investment. ${quickWins.length === 1 ? 'This program' : 'These programs'} could generate revenue while longer-term strategic programs are being developed.` : ''}

${timeSensitive ? `**⚠️ Time-Sensitive:** Review ${timeSensitive.programTitle} as a priority — there may be grant funding or competitive considerations that make timing critical.` : ''}`;
}

function buildBlueOceanSection(blueOcean: BlueOceanScannerOutput): string {
  const discoveryMethodLabels: Record<string, string> = {
    employer_pain_point: 'Employer Pain Point Analysis',
    supply_chain: 'Supply Chain Decomposition',
    peer_comparison: 'Peer Institution Comparison',
    economic_development: 'Economic Development Signal',
    orphan_occupation: 'BLS Orphan Occupation',
    skill_cluster: 'Skill Cluster Analysis',
  };

  const opportunitySections = blueOcean.hiddenOpportunities.map(opp => {
    const stars = '⭐'.repeat(Math.min(Math.round(opp.scores.composite / 2), 5));
    const methodLabel = discoveryMethodLabels[opp.discoveryMethod] || opp.discoveryMethod;

    const evidenceBullets = opp.evidence.map(e =>
      `- ${e.point} *(${e.source})*`
    ).join('\n');

    const validationBullets = opp.whatValidationWouldConfirm.map(q =>
      `- ${q}`
    ).join('\n');

    return `### ${opp.programTitle}

**Score:** ${stars} (${opp.scores.composite}/10) | **Discovery Method:** ${methodLabel} | **Position:** ${opp.competitivePosition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

**The Opportunity:** ${opp.description}

**Why This Is Non-Obvious:** ${opp.whyNonObvious}

**Why It's Defensible:** ${opp.whyDefensible}

**Evidence:**
${evidenceBullets || '- Evidence compiled from blue ocean analysis'}

**First-Mover Advantage:** ${opp.firstMoverAdvantage}

| Metric | Value |
|--------|-------|
| Target Occupation | ${opp.targetOccupation} (${opp.socCode || 'SOC TBD'}) |
| Estimated Demand | ${opp.estimatedDemand} |
| Median Wage | ${opp.medianWage} |
| Demand Evidence | ${opp.scores.demandEvidence}/10 |
| Competitive Gap | ${opp.scores.competitiveGap}/10 |
| Revenue Viability | ${opp.scores.revenueViability}/10 |
| Wage Outcomes | ${opp.scores.wageOutcomes}/10 |
| Launch Speed | ${opp.scores.launchSpeed}/10 |

**What Validation Would Confirm:**
${validationBullets || '- Full validation recommended in Stage 2'}`;
  }).join('\n\n---\n\n');

  const strategySummary = blueOcean.strategiesUsed
    .map(s => `- **${s.strategy}:** ${s.searchCount} searches → ${s.findingsCount} findings`)
    .join('\n');

  return `## HIDDEN OPPORTUNITIES — Blue Ocean Analysis

> **Methodology:** The Blue Ocean Scanner goes beyond conventional workforce analysis. While Phases 1-4 identify the obvious opportunities every competitor will find, this analysis uses six creative research strategies to uncover non-obvious, surprising, but defensible program opportunities. These are the gaps between traditional program categories — the training needs that don't show up in standard analyses but represent significant first-mover advantages.

**Key Insight:** ${blueOcean.keyInsight}

### Strategies Employed

${strategySummary}

---

${opportunitySections}`;
}

// ── Grant Alignment ──

interface GrantMatch {
  grantName: string;
  industry: string;
  details: string;
  deadline?: string;
  estimatedAward?: string;
  relevance: string;
  source?: string;
}

/**
 * Maps each program opportunity to relevant grants from the Discovery data.
 * Uses keyword matching between program sector/occupation and grant industry/details.
 */
function buildGrantAlignmentMap(
  opportunities: ScoredOpportunity[],
  grants: DemandSignalOutput['grantOpportunities'],
  blueOceanOpps: Array<{ programTitle: string; targetOccupation: string; description: string }>
): Map<string, GrantMatch[]> {
  const grantMap = new Map<string, GrantMatch[]>();

  // Build keyword sets for each grant
  const grantKeywords = grants.map(g => ({
    grant: g,
    keywords: `${g.name} ${g.industry} ${g.details}`.toLowerCase(),
  }));

  // General grants that apply to most workforce programs
  const generalGrantKeywords = ['workforce', 'community college', 'training', 'credential', 'career', 'education'];

  // Match each opportunity to grants
  const allOpps = [
    ...opportunities.map(o => ({
      title: o.programTitle,
      occupation: o.targetOccupation,
      description: o.description,
      sector: inferSectorFromOccupation(o.targetOccupation),
    })),
    ...blueOceanOpps.map(o => ({
      title: o.programTitle,
      occupation: o.targetOccupation,
      description: o.description,
      sector: inferSectorFromOccupation(o.targetOccupation),
    })),
  ];

  for (const opp of allOpps) {
    const matches: GrantMatch[] = [];
    const oppKeywords = `${opp.title} ${opp.occupation} ${opp.description} ${opp.sector}`.toLowerCase();

    for (const { grant, keywords } of grantKeywords) {
      // Check for sector/industry overlap
      const sectorMatch = opp.sector.toLowerCase().split(/\s+/).some(word =>
        word.length > 3 && keywords.includes(word)
      );
      
      // Check for occupation keyword overlap
      const occWords = opp.occupation.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const occMatch = occWords.some(word => keywords.includes(word));

      // Check if it's a general workforce grant
      const isGeneral = generalGrantKeywords.some(kw => keywords.includes(kw));

      if (sectorMatch || occMatch || isGeneral) {
        const relevance = sectorMatch && occMatch
          ? 'Strong match — grant targets this industry and occupation directly'
          : sectorMatch
          ? `Industry match — grant supports ${grant.industry} workforce development`
          : occMatch
          ? 'Occupation match — grant covers training for this type of role'
          : 'General workforce — grant supports community college program development broadly';

        matches.push({
          grantName: grant.name,
          industry: grant.industry,
          details: grant.details,
          deadline: grant.deadline || undefined,
          relevance,
          source: grant.source,
        });
      }
    }

    if (matches.length > 0) {
      grantMap.set(opp.title, matches);
    }
  }

  return grantMap;
}

function inferSectorFromOccupation(occupation: string): string {
  const occ = occupation.toLowerCase();
  if (occ.match(/nurs|health|medic|pharma|dental|therapy|clinical|sterile|surgical/)) return 'Healthcare';
  if (occ.match(/software|cyber|data|it |tech|computer|network|avionics/)) return 'Technology';
  if (occ.match(/manufactur|machin|weld|cnc|industrial|automation/)) return 'Manufacturing';
  if (occ.match(/electric|hvac|plumb|construct|trade/)) return 'Construction';
  if (occ.match(/truck|logist|supply|warehouse|cdl|driver/)) return 'Transportation';
  if (occ.match(/account|business|manage|financ|market|analyst/)) return 'Business';
  return 'Workforce Development';
}

function buildFundingRoadmap(
  opportunities: ScoredOpportunity[],
  blueOceanOpps: Array<{ programTitle: string; scores: { composite: number } }>,
  grants: DemandSignalOutput['grantOpportunities'],
  grantMap: Map<string, GrantMatch[]>
): string {
  // Build a matrix of programs × grants
  const allPrograms = [
    ...opportunities.map(o => ({ title: o.programTitle, score: o.scores.composite, type: 'Conventional' })),
    ...blueOceanOpps.map(o => ({ title: o.programTitle, score: o.scores.composite, type: 'Blue Ocean' })),
  ];

  const programsWithGrants = allPrograms.filter(p => grantMap.has(p.title));
  const programsWithoutGrants = allPrograms.filter(p => !grantMap.has(p.title));

  if (programsWithGrants.length === 0) {
    return ''; // No grant matches, skip section
  }

  const grantRows = programsWithGrants.map(p => {
    const matches = grantMap.get(p.title) || [];
    const grantNames = matches.map(m => m.grantName).join('; ');
    return `| ${p.title} | ${p.score}/10 | ${matches.length} | ${grantNames} |`;
  }).join('\n');

  const deadlineAlerts = grants
    .filter(g => g.deadline)
    .map(g => `- **${g.name}** — Deadline: ${g.deadline}`)
    .join('\n');

  return `## FUNDING ROADMAP — Grant Alignment

> Programs aligned with available workforce development grants can significantly reduce launch costs and accelerate development timelines. The following analysis maps each recommended program to identified funding opportunities.

### Program-to-Grant Matrix

| Program | Score | Matching Grants | Grant Names |
|---------|-------|-----------------|-------------|
${grantRows}

${programsWithoutGrants.length > 0 ? `### Programs Without Current Grant Alignment

${programsWithoutGrants.map(p => `- **${p.title}** (${p.score}/10) — No directly matching grants identified. Consider Perkins V, state workforce development funds, or employer-sponsored training partnerships.`).join('\n')}` : ''}

${deadlineAlerts ? `### ⚠️ Time-Sensitive Grant Deadlines

${deadlineAlerts}` : ''}

### Recommended Grant Strategy

1. **Prioritize programs with strong grant alignment** — Healthcare programs (Medical/Health Services Management, Dental Hygiene, Sterile Processing) align with healthcare credentialing grants
2. **Bundle applications** — Multiple programs can be submitted under a single institutional grant application
3. **Leverage employer partnerships** — Employer match commitments strengthen grant applications significantly
4. **Track state legislative cycles** — Iowa workforce development appropriations often create new funding windows

*Note: Grant details are based on publicly available information at time of analysis. Confirm eligibility, deadlines, and award amounts directly with funding agencies before applying.*`;
}

function buildAppendix(
  fullMatrix: OpportunityScorerOutput['fullCandidateMatrix'],
  dataSources: RegionalIntelligenceOutput['dataSources'],
  totalSearches: number
): string {
  const matrixRows = fullMatrix.map(c =>
    `| ${c.programTitle} | ${c.compositeScore}/10 | ${c.tier.replace(/_/g, ' ')} | ${c.included ? '✓' : '—'} |`
  ).join('\n');

  const sourceList = dataSources.slice(0, 20).map(s =>
    `- ${s.title}: ${s.url}`
  ).join('\n');

  return `## APPENDIX

### Full Scored Opportunity Matrix

| Program | Composite Score | Category | In Brief |
|---------|----------------|----------|----------|
${matrixRows}

### Data Sources

${sourceList}

### Methodology Notes

This Program Discovery Brief was generated using WorkforceOS multi-phase analysis:

1. **Regional Intelligence** — Institutional profiling, employer mapping, economic trend analysis
2. **Demand Signal Detection** — Job posting analysis, BLS employment data, employer expansion signals, grant opportunities
3. **Competitive Landscape** — Provider mapping, program cataloging, white space identification
4. **Opportunity Scoring** — Weighted composite scoring (Demand 30%, Competition 25%, Revenue 20%, Wages 15%, Speed 10%)
5. **Blue Ocean Scanner** — Creative opportunity hunting across 6 strategies: employer pain points, supply chain decomposition, peer comparison, economic development signals, orphan occupations, and skill cluster analysis

**Total research queries executed:** ${totalSearches}  
**Data sources consulted:** ${dataSources.length}  
**Analysis model:** Claude Sonnet 4.5 (Anthropic)

### Limitations

- This is a **discovery-level scan**, not a full program validation
- Job posting data reflects current conditions and may change
- Competitor program catalogs may be incomplete (not all programs are listed online)
- Wage data is national/state level; local wages may vary
- Full employer demand validation requires direct outreach (Stage 2)
- Enrollment projections require demographic and market modeling (Stage 2)`;
}
