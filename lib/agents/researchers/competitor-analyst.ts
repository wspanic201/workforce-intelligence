import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { searchWeb } from '@/lib/apis/web-research';
import { getCompetitorCompletions } from '@/lib/apis/ipeds';
import { socToCip } from '@/lib/mappings/soc-cip-crosswalk';

// ─── Competitor Pricing Types ─────────────────────────────────────────────────

export interface CompetitorPricingResult {
  comps: Array<{ institution: string; price: number; seatHours?: number; url: string }>;
  marketMedian: number;
  marketLow: number;
  marketHigh: number;
  source: string;
}

// ─── Competitor Pricing Lookup via Web Search ─────────────────────────────────

/**
 * Fetch real competitor program pricing via web search (SerpAPI).
 * Parses dollar amounts and seat hour counts from search snippets.
 * Used to ground the financial model tuition in market reality.
 */
export async function fetchCompetitorPricing(
  programName: string,
  location: string
): Promise<CompetitorPricingResult> {
  const state = location.includes('Iowa') ? 'Iowa' : location.split(',').pop()?.trim() ?? location;

  const queries = [
    `"${programName} program" cost tuition ${state} community college`,
    `${programName} certificate tuition price ${state} 2024 2025`,
    `${programName} certificate hours ${state}`,
  ];

  const allSnippets: string[] = [];
  const allUrls: string[] = [];

  for (const query of queries) {
    try {
      const result = await searchWeb(query, { num: 5 });
      for (const r of result.results) {
        if (r.snippet) allSnippets.push(`${r.title}: ${r.snippet}`);
        if (r.url) allUrls.push(r.url);
      }
    } catch (err) {
      console.warn(`[CompetitorPricing] Search failed for "${query}": ${err}`);
    }
  }

  // Parse dollar amounts from snippets
  const priceMatches: number[] = [];
  const dollarRegex = /\$[\d,]+(?:\.\d{2})?(?:\s*(?:–|-|to)\s*\$[\d,]+(?:\.\d{2})?)?/gi;
  const priceRangeRegex = /\$([\d,]+)\s*(?:–|-|to)\s*\$([\d,]+)/i;
  const singlePriceRegex = /\$([\d,]+)/;

  for (const snippet of allSnippets) {
    const rangeMatch = snippet.match(priceRangeRegex);
    if (rangeMatch) {
      const low = parseInt(rangeMatch[1].replace(/,/g, ''));
      const high = parseInt(rangeMatch[2].replace(/,/g, ''));
      // Filter to plausible program tuition range ($500–$15,000)
      if (low >= 500 && low <= 15_000) priceMatches.push(low);
      if (high >= 500 && high <= 15_000) priceMatches.push(high);
    } else {
      const singleMatch = snippet.match(singlePriceRegex);
      if (singleMatch) {
        const price = parseInt(singleMatch[1].replace(/,/g, ''));
        if (price >= 500 && price <= 15_000) priceMatches.push(price);
      }
    }
  }

  // Parse seat hour counts from snippets
  const hourMatches: number[] = [];
  const hourRegex = /(\d+)\s*(?:contact\s+)?(?:seat\s+)?hours?/gi;
  for (const snippet of allSnippets) {
    const match = hourRegex.exec(snippet);
    if (match) {
      const hrs = parseInt(match[1]);
      if (hrs >= 40 && hrs <= 1000) hourMatches.push(hrs);
    }
  }

  // Build comp data from unique prices
  const uniquePrices = [...new Set(priceMatches)].sort((a, b) => a - b);
  const comps: CompetitorPricingResult['comps'] = uniquePrices.slice(0, 5).map((price, i) => ({
    institution: `Market competitor ${i + 1}`,
    price,
    seatHours: hourMatches[i],
    url: allUrls[i] ?? '',
  }));

  const marketLow = uniquePrices.length > 0 ? uniquePrices[0] : 3_500;
  const marketHigh = uniquePrices.length > 0 ? uniquePrices[uniquePrices.length - 1] : 6_000;
  const marketMedian = uniquePrices.length > 0
    ? uniquePrices[Math.floor(uniquePrices.length / 2)]
    : Math.round((marketLow + marketHigh) / 2);

  return {
    comps,
    marketMedian,
    marketLow,
    marketHigh,
    source: `Web search: "${programName}" pricing in ${state} (${queries.length} queries, ${priceMatches.length} prices found)`,
  };
}

export interface CompetitorProgram {
  institution: string;
  program_name: string;
  format: string;
  duration: string;
  cost: string;
  enrollment?: string;
  unique_features: string[];
  website?: string;
}

export interface CompetitiveAnalysisData {
  score: number;
  scoreRationale: string;
  competitors: CompetitorProgram[];
  market_gaps: string[];
  differentiation_opportunities: string[];
  competitive_advantages: string[];
  threats: string[];
  recommendations: string[];
  cipCode?: string;
  cipTitle?: string;
  ipedsCompletions?: Array<{ institution: string; city: string; completions: number }>;
}

export async function runCompetitiveAnalysis(
  projectId: string,
  project: ValidationProject
): Promise<{ data: CompetitiveAnalysisData; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    // Look up CIP code from SOC code for IPEDS data
    const socCode = (project as any).soc_code || (project as any).soc_codes || null;
    const state = (project as any).state || '';
    let cipCode: string | null = null;
    let cipTitle: string | null = null;
    let competitorCompletions: Array<{ institution: string; city: string; completions: number }> = [];

    if (socCode) {
      const cipMappings = socToCip(socCode);
      if (cipMappings.length > 0) {
        cipCode = cipMappings[0].cipCode;
        cipTitle = cipMappings[0].cipTitle;
      }
    }

    if (cipCode && state) {
      try {
        competitorCompletions = await getCompetitorCompletions(cipCode, state);
      } catch (err) {
        console.warn(`[CompetitorAnalyst] IPEDS lookup failed for CIP ${cipCode} in ${state}:`, err);
      }
    }

    const ipedsSection = competitorCompletions.length > 0
      ? `\nIPEDS PROGRAM COMPLETIONS (actual graduates from competing institutions, CIP ${cipCode} - ${cipTitle}):\n${competitorCompletions.map(c => `- ${c.institution} (${c.city}): ${c.completions} completers`).join('\n')}\n`
      : '';

    // Get shared verified intelligence context
    const verifiedIntelBlock = (project as any)._intelContext?.promptBlock || '';

    const prompt = `You are a competitive landscape analyst for workforce education programs.

Analyze the competitive landscape for this program and return ONLY valid JSON.

PROGRAM: ${project.program_name}
TYPE: ${project.program_type || 'Not specified'}
AUDIENCE: ${project.target_audience || 'Not specified'}
CLIENT: ${project.client_name}
${project.constraints ? `CONSTRAINTS: ${project.constraints}` : ''}
${cipCode ? `CIP CODE: ${cipCode} (${cipTitle})` : ''}
${ipedsSection}
${verifiedIntelBlock}

Identify 3-5 competing programs, market gaps, and differentiation opportunities.

Build a competitive comparison. For each competitor, investigate:
- What do actual students say about the program? (Check Google reviews, Reddit, Indeed)
- What are their actual completion/placement rates? (Check IPEDS, program websites)
- What are their specific weaknesses that the client could exploit?

Don't just list competitors — tell the client how to beat them. End with a clear positioning recommendation: "You should position as [X] because [Y]."

SCORING: Rate the competitive landscape 1-10 for program viability.
8-10 = Few/weak competitors, strong differentiation potential
5-7 = Moderate competition, some differentiation possible
1-4 = Saturated market, difficult to differentiate

LENGTH: 800–1,000 words.

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation outside JSON. Keep values concise.

{
  "score": 7,
  "scoreRationale": "Brief explanation of competitive landscape score",
  "competitors": [
    {
      "institution": "College Name",
      "program_name": "Program Name",
      "format": "online or in-person or hybrid",
      "duration": "X months",
      "cost": "estimated cost",
      "unique_features": ["Feature 1"]
    }
  ],
  "market_gaps": ["Gap 1"],
  "differentiation_opportunities": ["Opp 1"],
  "competitive_advantages": ["Advantage 1"],
  "threats": ["Threat 1"],
  "recommendations": ["Recommendation 1"]
}`;

    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 12000,
    });

    const data = extractJSON(content) as CompetitiveAnalysisData;
    if (cipCode) {
      data.cipCode = cipCode;
      data.cipTitle = cipTitle ?? undefined;
    }
    if (competitorCompletions.length > 0) {
      data.ipedsCompletions = competitorCompletions;
    }
    const markdown = formatCompetitiveAnalysis(data, project);

    const duration = Date.now() - startTime;
    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'competitor-analyst',
      persona: 'research-director',
      prompt: prompt.substring(0, 5000),
      response: content.substring(0, 10000),
      tokens_used: tokensUsed,
      duration_ms: duration,
      status: 'success',
    });

    return { data, markdown };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Competitive analysis error:', error);

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'competitor-analyst',
      persona: 'research-director',
      duration_ms: duration,
      status: 'error',
      error_message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

function formatCompetitiveAnalysis(data: CompetitiveAnalysisData, project: ValidationProject): string {
  return `# Competitive Landscape: ${project.program_name}

## Executive Summary

This analysis examines ${data.competitors.length} competing programs and identifies opportunities for differentiation.

## Competitor Programs

${data.competitors.map((comp, i) => `
### ${i + 1}. ${comp.institution} - ${comp.program_name}

- **Format:** ${comp.format}
- **Duration:** ${comp.duration}
- **Cost:** ${comp.cost}
${comp.enrollment ? `- **Enrollment:** ${comp.enrollment}` : ''}
${comp.website ? `- **Website:** ${comp.website}` : ''}

**Unique Features:**
${comp.unique_features.map(f => `- ${f}`).join('\n')}
`).join('\n')}

## Market Gaps

The following needs are not being adequately addressed by current offerings:

${data.market_gaps.map(gap => `- ${gap}`).join('\n')}

## Differentiation Opportunities

${data.differentiation_opportunities.map((opp, i) => `${i + 1}. ${opp}`).join('\n')}

## Competitive Advantages

${data.competitive_advantages.map(adv => `- ${adv}`).join('\n')}

## Threats & Challenges

${data.threats.map(threat => `- ${threat}`).join('\n')}

## Strategic Recommendations

${data.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
*This analysis is based on publicly available information as of ${new Date().toLocaleDateString()}.*
`;
}
