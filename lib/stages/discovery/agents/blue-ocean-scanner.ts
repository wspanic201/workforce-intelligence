/**
 * Phase 6: Blue Ocean Scanner
 * 
 * Receives ALL data from Phases 1-4 and specifically hunts for 
 * NON-OBVIOUS, surprising, but defensible program opportunities
 * that the conventional analysis missed.
 * 
 * Runs 15-20 searches across 6 creative strategies:
 *   1. Employer Pain Points — hard-to-fill roles, signing bonuses
 *   2. Supply Chain Decomposition — supporting roles nobody trains for
 *   3. Peer Institution Comparison — programs peers offer that we don't
 *   4. Economic Development Signals — new facilities, expansions
 *   5. BLS Orphan Occupations — high growth + zero local providers
 *   6. Skill Cluster Analysis — emerging skills without programs
 * 
 * Temperature is higher (0.5-0.6) to encourage creative thinking.
 */

import { searchWeb, fetchPage, batchSearch, deepSearch } from '@/lib/apis/web-research';
import { callClaude } from '@/lib/ai/anthropic';
import type { RegionalIntelligenceOutput } from './regional-intelligence';
import type { DemandSignalOutput } from './demand-signals';
import type { CompetitiveLandscapeOutput } from './competitive-landscape';
import type { OpportunityScorerOutput } from './opportunity-scorer';
import type { ServiceRegion } from '../orchestrator';
import { getCategoryConstraint, getCategorySearchTerms } from '../category-constraint';

// ── Types ──

export interface BlueOceanOpportunity {
  programTitle: string;
  discoveryMethod: 'employer_pain_point' | 'supply_chain' | 'peer_comparison' | 'economic_development' | 'orphan_occupation' | 'skill_cluster';
  description: string;
  targetOccupation: string;
  socCode: string;
  evidence: Array<{ point: string; source: string }>;
  whyNonObvious: string;
  whyDefensible: string;
  estimatedDemand: string;
  medianWage: string;
  competitivePosition: string;
  firstMoverAdvantage: string;
  scores: {
    demandEvidence: number;
    competitiveGap: number;
    revenueViability: number;
    wageOutcomes: number;
    launchSpeed: number;
    composite: number;
  };
  whatValidationWouldConfirm: string[];
}

export interface BlueOceanScannerOutput {
  hiddenOpportunities: BlueOceanOpportunity[];
  strategiesUsed: Array<{ strategy: string; searchCount: number; findingsCount: number }>;
  searchesExecuted: number;
  keyInsight: string;
}

// ── Strategy result containers ──

interface StrategyFindings {
  strategy: string;
  searchCount: number;
  rawFindings: string;
}

// ── Main Agent ──

export async function scanBlueOcean(
  regionalIntel: RegionalIntelligenceOutput,
  demandSignals: DemandSignalOutput,
  competitiveLandscape: CompetitiveLandscapeOutput,
  scoredOpportunities: OpportunityScorerOutput,
  serviceRegion?: ServiceRegion,
  category?: string
): Promise<BlueOceanScannerOutput> {
  const { institution, topEmployers, economicTrends } = regionalIntel;
  const allCities = serviceRegion
    ? [serviceRegion.primaryCity, ...serviceRegion.additionalCities]
    : [institution.city];
  const region = serviceRegion?.metroArea || `${institution.city}, ${institution.state}`;

  console.log(`[Phase 6: Blue Ocean Scanner] Starting creative opportunity scan for ${region}`);

  let totalSearchCount = 0;
  const strategyResults: StrategyFindings[] = [];

  // Build a summary of what conventional analysis already found (so we skip those)
  const conventionalPrograms = scoredOpportunities.scoredOpportunities
    .map(o => o.programTitle)
    .join(', ');

  const currentPrograms = institution.currentPrograms.join(', ') || 'Not fully cataloged';

  // ── Strategy 1: Employer Pain Points ──
  try {
    console.log('[Phase 6] Strategy 1: Employer Pain Points — hunting hard-to-fill roles...');
    const { findings, searches } = await strategyEmployerPainPoints(
      topEmployers, institution.state, allCities
    );
    totalSearchCount += searches;
    strategyResults.push({ strategy: 'Employer Pain Points', searchCount: searches, rawFindings: findings });
    console.log(`[Phase 6] Strategy 1 complete: ${searches} searches`);
  } catch (err) {
    console.warn(`[Phase 6] Strategy 1 failed: ${err}`);
    strategyResults.push({ strategy: 'Employer Pain Points', searchCount: 0, rawFindings: 'Strategy failed — no results' });
  }

  // ── Strategy 2: Supply Chain Decomposition ──
  try {
    console.log('[Phase 6] Strategy 2: Supply Chain Decomposition — finding hidden supporting roles...');
    const topIndustries = demandSignals.topIndustries.slice(0, 3).map(i => i.industry);
    const { findings, searches } = await strategySupplyChain(
      topIndustries, institution.state, allCities
    );
    totalSearchCount += searches;
    strategyResults.push({ strategy: 'Supply Chain Decomposition', searchCount: searches, rawFindings: findings });
    console.log(`[Phase 6] Strategy 2 complete: ${searches} searches`);
  } catch (err) {
    console.warn(`[Phase 6] Strategy 2 failed: ${err}`);
    strategyResults.push({ strategy: 'Supply Chain Decomposition', searchCount: 0, rawFindings: 'Strategy failed — no results' });
  }

  // ── Strategy 3: Peer Institution Comparison ──
  try {
    console.log('[Phase 6] Strategy 3: Peer Institution Comparison — finding programs peers offer that we don\'t...');
    const { findings, searches } = await strategyPeerComparison(
      institution.name, institution.state, institution.city, institution.serviceArea, currentPrograms
    );
    totalSearchCount += searches;
    strategyResults.push({ strategy: 'Peer Institution Comparison', searchCount: searches, rawFindings: findings });
    console.log(`[Phase 6] Strategy 3 complete: ${searches} searches`);
  } catch (err) {
    console.warn(`[Phase 6] Strategy 3 failed: ${err}`);
    strategyResults.push({ strategy: 'Peer Institution Comparison', searchCount: 0, rawFindings: 'Strategy failed — no results' });
  }

  // ── Strategy 4: Economic Development Signals ──
  try {
    console.log('[Phase 6] Strategy 4: Economic Development Signals — new facilities, expansions...');
    const { findings, searches } = await strategyEconomicDevelopment(
      allCities, institution.state, institution.serviceArea, region
    );
    totalSearchCount += searches;
    strategyResults.push({ strategy: 'Economic Development Signals', searchCount: searches, rawFindings: findings });
    console.log(`[Phase 6] Strategy 4 complete: ${searches} searches`);
  } catch (err) {
    console.warn(`[Phase 6] Strategy 4 failed: ${err}`);
    strategyResults.push({ strategy: 'Economic Development Signals', searchCount: 0, rawFindings: 'Strategy failed — no results' });
  }

  // ── Strategy 5: BLS Orphan Occupations ──
  try {
    console.log('[Phase 6] Strategy 5: BLS Orphan Occupations — high growth with zero local training...');
    const { findings, searches } = await strategyOrphanOccupations(
      institution.state, allCities
    );
    totalSearchCount += searches;
    strategyResults.push({ strategy: 'BLS Orphan Occupations', searchCount: searches, rawFindings: findings });
    console.log(`[Phase 6] Strategy 5 complete: ${searches} searches`);
  } catch (err) {
    console.warn(`[Phase 6] Strategy 5 failed: ${err}`);
    strategyResults.push({ strategy: 'BLS Orphan Occupations', searchCount: 0, rawFindings: 'Strategy failed — no results' });
  }

  // ── Strategy 6: Skill Cluster Analysis ──
  try {
    console.log('[Phase 6] Strategy 6: Skill Cluster Analysis — emerging skill clusters without programs...');
    const emergingSkills = extractEmergingSkills(demandSignals);
    const { findings, searches } = await strategySkillClusters(
      allCities, institution.state, emergingSkills, currentPrograms
    );
    totalSearchCount += searches;
    strategyResults.push({ strategy: 'Skill Cluster Analysis', searchCount: searches, rawFindings: findings });
    console.log(`[Phase 6] Strategy 6 complete: ${searches} searches`);
  } catch (err) {
    console.warn(`[Phase 6] Strategy 6 failed: ${err}`);
    strategyResults.push({ strategy: 'Skill Cluster Analysis', searchCount: 0, rawFindings: 'Strategy failed — no results' });
  }

  // ── Final Synthesis: Claude creative analysis ──
  console.log('[Phase 6] Synthesizing all findings into top hidden opportunities...');

  // Cap each strategy's findings to prevent prompt bloat (34K+ chars causes timeouts)
  const MAX_CHARS_PER_STRATEGY = 3000;
  const allFindings = strategyResults
    .map(s => {
      const findings = s.rawFindings.length > MAX_CHARS_PER_STRATEGY
        ? s.rawFindings.slice(0, MAX_CHARS_PER_STRATEGY) + '\n[...truncated for length]'
        : s.rawFindings;
      return `### ${s.strategy} (${s.searchCount} searches)\n${findings}`;
    })
    .join('\n\n');
  console.log(`[Phase 6] Synthesis prompt size: ${allFindings.length} chars (${strategyResults.length} strategies)`);

  const categoryConstraint = getCategoryConstraint(category);

  const synthesisResult = await callClaude(
    `${categoryConstraint}You are a workforce development VISIONARY — not a conventional analyst. Your job is to identify the 3-5 most compelling HIDDEN program opportunities that a conventional analysis would miss.

## CONTEXT
You are analyzing ${institution.name} serving the ${region} region (${allCities.join(', ')}) in ${institution.state}.${category ? `\n\n**This is a ${category} Category Deep Dive.** All hidden opportunities MUST be within the ${category} domain. Think creatively WITHIN the category — niche sub-specialties, emerging cross-functional roles, underserved niches WITHIN ${category}.` : ''}

## WHAT CONVENTIONAL ANALYSIS ALREADY FOUND (DO NOT REPEAT THESE):
${conventionalPrograms || 'None provided'}

## PROGRAMS THE COLLEGE ALREADY OFFERS (DO NOT RECOMMEND DUPLICATES):
${currentPrograms}

## RAW FINDINGS FROM 6 CREATIVE SEARCH STRATEGIES:
${allFindings}

## YOUR MISSION
From the raw findings above, identify the 3-5 most compelling hidden opportunities. These must be:

1. **Non-obvious** — A conventional workforce analyst wouldn't recommend these. They come from lateral thinking: supporting roles, supply chain gaps, employer pain points, emerging skill clusters.
2. **Defensible** — Every recommendation must be backed by SPECIFIC evidence from the search results above. No speculation.
3. **Actionable** — A community college could realistically launch these as certificate or short-term training programs.

Think like this: "What would a workforce development visionary recommend that a conventional analysis would miss?" Identify roles that SUPPORT major industries but are rarely offered as standalone training programs. Look for the training gaps BETWEEN traditional program categories.

## SCORING MATRIX
Score each 1-10:
- Demand Evidence (30%): How strong is the evidence of unmet demand?
- Competitive Gap (25%): How few competitors serve this need? White space = 10.
- Revenue Viability (20%): Can this program attract enough students at a viable price?
- Wage Outcomes (15%): Do graduates earn livable wages? $25+/hr = strong.
- Launch Speed (10%): How fast could a nimble college launch this? 

Composite = (demand × 0.30) + (gap × 0.25) + (revenue × 0.20) + (wages × 0.15) + (speed × 0.10)

Return ONLY valid JSON:
{
  "hiddenOpportunities": [
    {
      "programTitle": "Specific Program Name",
      "discoveryMethod": "employer_pain_point|supply_chain|peer_comparison|economic_development|orphan_occupation|skill_cluster",
      "description": "2-3 sentences on WHY this is non-obvious but defensible",
      "targetOccupation": "Specific Occupation",
      "socCode": "XX-XXXX",
      "evidence": [
        { "point": "Specific evidence from the search findings", "source": "Source" }
      ],
      "whyNonObvious": "What makes this surprising — why wouldn't a conventional analyst find it?",
      "whyDefensible": "What makes this backed by data, not speculation",
      "estimatedDemand": "Description of demand level",
      "medianWage": "$XX/hr or range",
      "competitivePosition": "white_space or undersaturated",
      "firstMoverAdvantage": "Why being first matters for THIS program",
      "scores": {
        "demandEvidence": 8,
        "competitiveGap": 9,
        "revenueViability": 7,
        "wageOutcomes": 7,
        "launchSpeed": 8,
        "composite": 7.9
      },
      "whatValidationWouldConfirm": [
        "Question that Stage 2 validation would answer",
        "Another question"
      ]
    }
  ],
  "keyInsight": "One paragraph: the BIG PICTURE insight about what the conventional analysis missed and why these hidden opportunities matter for this institution's competitive strategy."
}

CRITICAL:
- Do NOT include programs the college already offers
- Do NOT repeat programs already identified by conventional analysis
- Every evidence point MUST come from the search findings above — do NOT fabricate
- Think CREATIVELY but stay GROUNDED in data
- Prefer white_space opportunities where no local provider exists`,
    { maxTokens: 4000, temperature: 0.6 }
  );

  // Parse synthesis
  let synthesized: any = {};
  try {
    const jsonStr = synthesisResult.content.match(/\{[\s\S]*\}/)?.[0];
    if (jsonStr) {
      synthesized = JSON.parse(jsonStr);
    }
  } catch (e) {
    console.error('[Phase 6] Failed to parse synthesis output, attempting recovery...');
    try {
      const arrayMatch = synthesisResult.content.match(/"hiddenOpportunities"\s*:\s*(\[[\s\S]*?\])\s*[,}]/);
      if (arrayMatch) {
        synthesized = { hiddenOpportunities: JSON.parse(arrayMatch[1]) };
      }
    } catch {}
  }

  // Normalize opportunities
  const hiddenOpportunities: BlueOceanOpportunity[] = (synthesized.hiddenOpportunities || []).map((opp: any) => ({
    programTitle: opp.programTitle || 'Unknown Program',
    discoveryMethod: opp.discoveryMethod || 'skill_cluster',
    description: opp.description || '',
    targetOccupation: opp.targetOccupation || '',
    socCode: opp.socCode || '',
    evidence: opp.evidence || [],
    whyNonObvious: opp.whyNonObvious || '',
    whyDefensible: opp.whyDefensible || '',
    estimatedDemand: opp.estimatedDemand || 'Unknown',
    medianWage: opp.medianWage || 'Unknown',
    competitivePosition: opp.competitivePosition || 'white_space',
    firstMoverAdvantage: opp.firstMoverAdvantage || '',
    scores: {
      demandEvidence: opp.scores?.demandEvidence || 5,
      competitiveGap: opp.scores?.competitiveGap || 5,
      revenueViability: opp.scores?.revenueViability || 5,
      wageOutcomes: opp.scores?.wageOutcomes || 5,
      launchSpeed: opp.scores?.launchSpeed || 5,
      composite: opp.scores?.composite || calculateComposite(opp.scores),
    },
    whatValidationWouldConfirm: opp.whatValidationWouldConfirm || [],
  }));

  // Sort by composite score
  hiddenOpportunities.sort((a, b) => b.scores.composite - a.scores.composite);

  // Build strategies used summary
  const strategiesUsed = strategyResults.map(s => ({
    strategy: s.strategy,
    searchCount: s.searchCount,
    findingsCount: s.rawFindings === 'Strategy failed — no results' ? 0 :
      (s.rawFindings.match(/\n-/g) || []).length + 1,
  }));

  const keyInsight = synthesized.keyInsight || 'Blue Ocean analysis identified non-obvious program opportunities that complement the conventional findings.';

  console.log(`[Phase 6: Blue Ocean Scanner] Complete. ${hiddenOpportunities.length} hidden opportunities, ${totalSearchCount} searches across ${strategyResults.filter(s => s.searchCount > 0).length} strategies.`);

  return {
    hiddenOpportunities,
    strategiesUsed,
    searchesExecuted: totalSearchCount,
    keyInsight,
  };
}

// ── Strategy Implementations ──

async function strategyEmployerPainPoints(
  topEmployers: RegionalIntelligenceOutput['topEmployers'],
  state: string,
  cities: string[]
): Promise<{ findings: string; searches: number }> {
  const employers = topEmployers.slice(0, 5);
  const queries = employers.map(e =>
    `"${e.name}" careers hard to fill OR signing bonus OR urgent hire ${state}`
  );

  // Add a general hard-to-fill roles search for each city (capped)
  for (const city of cities.slice(0, 2)) {
    queries.push(`${city} ${state} hardest jobs to fill workforce shortage 2024 2025`);
  }

  const results = await batchSearch(queries, { delayMs: 500 });

  const findings = results.map((r, i) => {
    const snippets = r.results.slice(0, 5).map(s => `- ${s.title}: ${s.snippet}`).join('\n');
    return `**${queries[i]}**\n${snippets || '- No results found'}`;
  }).join('\n\n');

  return { findings, searches: queries.length };
}

async function strategySupplyChain(
  topIndustries: string[],
  state: string,
  cities: string[]
): Promise<{ findings: string; searches: number }> {
  const queries: string[] = [];

  for (const industry of topIndustries) {
    queries.push(`"${industry}" supply chain supporting roles workforce shortage ${state}`);
    queries.push(`"${industry}" niche certifications high demand ${state}`);
  }

  // Add industry-specific supporting role searches based on what the industries are
  const industryLower = topIndustries.map(i => i.toLowerCase()).join(' ');
  const primaryCity = cities[0];
  if (industryLower.includes('manufactur')) {
    queries.push(`industrial metrology calibration quality inspection technician shortage ${primaryCity} ${state}`);
  }
  if (industryLower.includes('health')) {
    queries.push(`sterile processing biomedical equipment technician health informatics shortage ${primaryCity} ${state}`);
  }
  if (industryLower.includes('tech') || industryLower.includes('it')) {
    queries.push(`data center technician fiber optics cloud infrastructure certification shortage ${primaryCity} ${state}`);
  }
  if (industryLower.includes('logist') || industryLower.includes('transport')) {
    queries.push(`supply chain automation warehouse robotics technician shortage ${primaryCity} ${state}`);
  }

  const results = await batchSearch(queries.slice(0, 4), { delayMs: 500 });

  const findings = results.map((r, i) => {
    const snippets = r.results.slice(0, 5).map(s => `- ${s.title}: ${s.snippet}`).join('\n');
    return `**${queries[i]}**\n${snippets || '- No results found'}`;
  }).join('\n\n');

  return { findings, searches: Math.min(queries.length, 4) };
}

async function strategyPeerComparison(
  collegeName: string,
  state: string,
  city: string,
  serviceArea: string,
  currentPrograms: string
): Promise<{ findings: string; searches: number }> {
  const year = new Date().getFullYear();
  const queries = [
    `community college ${state} unique workforce programs innovative`,
    `"community college" innovative program award ${year}`,
    `community college new certificate program ${state} ${year - 1} ${year}`,
  ];

  const results = await batchSearch(queries, { delayMs: 500 });

  // Try to fetch one promising result for deeper analysis
  let deepContent = '';
  const topResult = results.flatMap(r => r.results).find(r =>
    r.snippet.toLowerCase().includes('program') || r.snippet.toLowerCase().includes('certificate')
  );
  if (topResult) {
    try {
      const page = await fetchPage(topResult.url, 6000);
      deepContent = `\n\n**Deep dive (${topResult.url}):**\n${page.text.slice(0, 3000)}`;
    } catch {}
  }

  const findings = results.map((r, i) => {
    const snippets = r.results.slice(0, 5).map(s => `- ${s.title}: ${s.snippet}`).join('\n');
    return `**${queries[i]}**\n${snippets || '- No results found'}`;
  }).join('\n\n') + deepContent;

  return { findings, searches: queries.length + (deepContent ? 1 : 0) };
}

async function strategyEconomicDevelopment(
  cities: string[],
  state: string,
  serviceArea: string,
  metroArea: string
): Promise<{ findings: string; searches: number }> {
  const year = new Date().getFullYear();
  const queries = [
    // Search each city for new facilities
    ...cities.slice(0, 2).map(city => `${city} ${state} new facility opening construction ${year} ${year + 1}`),
    `${state} economic development project announcement ${year}`,
    `${metroArea} major employer expansion investment ${year}`,
  ].slice(0, 4);

  const results = await batchSearch(queries, { delayMs: 500 });

  const findings = results.map((r, i) => {
    const snippets = r.results.slice(0, 5).map(s => `- ${s.title}: ${s.snippet}`).join('\n');
    return `**${queries[i]}**\n${snippets || '- No results found'}`;
  }).join('\n\n');

  return { findings, searches: queries.length };
}

async function strategyOrphanOccupations(
  state: string,
  cities: string[]
): Promise<{ findings: string; searches: number }> {
  const year = new Date().getFullYear();
  const queries = [
    `fastest growing occupations ${year} ${year + 1} no training available`,
    `emerging occupations community college certificate ${state}`,
    `BLS fastest growing jobs associate degree certificate ${year}`,
  ];

  const results = await batchSearch(queries, { delayMs: 500 });

  const findings = results.map((r, i) => {
    const snippets = r.results.slice(0, 5).map(s => `- ${s.title}: ${s.snippet}`).join('\n');
    return `**${queries[i]}**\n${snippets || '- No results found'}`;
  }).join('\n\n');

  return { findings, searches: queries.length };
}

async function strategySkillClusters(
  cities: string[],
  state: string,
  emergingSkills: string[],
  currentPrograms: string
): Promise<{ findings: string; searches: number }> {
  // Build queries from emerging skills detected in Phase 2 — search across cities
  const queries: string[] = [];
  const primaryCity = cities[0];
  
  for (const skill of emergingSkills.slice(0, 2)) {
    queries.push(`${primaryCity} ${state} jobs requiring ${skill} certification`);
  }

  // Also search for skill clusters that don't fit traditional program categories
  queries.push(`${state} emerging technology skills gap workforce training needed ${new Date().getFullYear()}`);

  const results = await batchSearch(queries, { delayMs: 500 });

  const findings = results.map((r, i) => {
    const snippets = r.results.slice(0, 5).map(s => `- ${s.title}: ${s.snippet}`).join('\n');
    return `**${queries[i]}**\n${snippets || '- No results found'}`;
  }).join('\n\n');

  return { findings, searches: queries.length };
}

// ── Helpers ──

function extractEmergingSkills(demandSignals: DemandSignalOutput): string[] {
  const skills: string[] = [];

  // Extract trending certifications as skill proxies
  for (const cert of demandSignals.trendingCertifications) {
    skills.push(cert.certification);
  }

  // Extract from signal evidence — look for mentioned certifications or skills
  for (const signal of demandSignals.signals) {
    if (signal.dataPoints.trendingCerts) {
      skills.push(...signal.dataPoints.trendingCerts);
    }
  }

  // Deduplicate and return top emerging skills
  const unique = [...new Set(skills)];
  return unique.length > 0 ? unique.slice(0, 5) : ['automation', 'cybersecurity', 'data analytics'];
}

function calculateComposite(scores: any): number {
  if (!scores) return 5;
  return Math.round((
    (scores.demandEvidence || 5) * 0.30 +
    (scores.competitiveGap || 5) * 0.25 +
    (scores.revenueViability || 5) * 0.20 +
    (scores.wageOutcomes || 5) * 0.15 +
    (scores.launchSpeed || 5) * 0.10
  ) * 10) / 10;
}
