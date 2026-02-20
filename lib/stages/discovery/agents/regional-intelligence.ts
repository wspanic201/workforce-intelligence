/**
 * Phase 1: Regional Intelligence Agent
 * 
 * Builds a foundational picture of the college and its region through
 * 10-15 web searches. Catalogs current programs, identifies strategic
 * priorities, maps top employers, and surfaces economic trends.
 * 
 * This is the RESEARCH phase — no AI synthesis yet, just data gathering.
 */

import { searchWeb, fetchPage, deepSearch, batchSearch } from '@/lib/apis/web-research';
import { callClaude } from '@/lib/ai/anthropic';
import { getRegionalDemographics, formatDemographicsForAgent } from '@/lib/apis/census';
import type { RegionalDemographics } from '@/lib/apis/census';
import type { ServiceRegion } from '../orchestrator';
import { getCategoryConstraint, getCategorySearchTerms } from '../category-constraint';

// ── Types ──

export interface InstitutionProfile {
  name: string;
  city: string;
  state: string;
  website: string | null;
  serviceArea: string;
  currentPrograms: string[];          // existing CTE/workforce programs
  strategicPriorities: string[];      // from strategic plan
  recentNews: string[];               // press releases, announcements
  demographics: {
    population: string | null;
    medianIncome: string | null;
    educationalAttainment: string | null;
  };
}

export interface RegionalEmployer {
  name: string;
  industry: string;
  estimatedLocalEmployment: string;
  hiringSignals: string;
  source: string;
}

export interface EconomicTrend {
  trend: string;
  details: string;
  source: string;
  relevance: 'high' | 'medium' | 'low';
}

export interface RegionalIntelligenceOutput {
  institution: InstitutionProfile;
  topEmployers: RegionalEmployer[];
  economicTrends: EconomicTrend[];
  workforcePriorities: string[];       // from workforce board, state plans
  majorEconomicEvents: string[];       // plant openings, federal investments, etc.
  censusDemographics: RegionalDemographics | null;  // real ACS data when available
  censusSummary: string | null;         // formatted for agent context
  dataSources: Array<{ url: string; title: string; description: string }>;
  searchesExecuted: number;
}

// ── Main Agent ──

export async function gatherRegionalIntelligence(
  collegeName: string,
  region: ServiceRegion,
  focusAreas?: string,
  category?: string
): Promise<RegionalIntelligenceOutput> {
  const collegeCity = region.primaryCity;
  const collegeState = region.state;
  const serviceAreaCounties = region.counties;
  const allCities = [region.primaryCity, ...region.additionalCities];

  console.log(`[Phase 1: Regional Intelligence] Starting for ${collegeName}`);
  console.log(`[Phase 1] Region: ${region.metroArea} — Cities: ${allCities.join(', ')}`);
  
  const dataSources: Array<{ url: string; title: string; description: string }> = [];
  let searchCount = 0;

  // ── Step 1: Find and catalog the college ──
  console.log('[Phase 1] Step 1: Researching institution...');
  
  const collegeSearch = await searchWeb(`${collegeName} ${collegeCity} ${collegeState} programs`);
  searchCount++;
  
  const collegeWebsite = collegeSearch.results[0]?.url || null;
  let collegePageText = '';
  if (collegeWebsite) {
    const page = await fetchPage(collegeWebsite, 12000);
    collegePageText = page.text;
    dataSources.push({ url: collegeWebsite, title: page.title, description: 'College homepage' });
  }

  // Search for current programs / course catalog
  const categoryTerms = getCategorySearchTerms(category);
  const programSearchQuery = category
    ? `${collegeName} ${categoryTerms} programs certificates continuing education`
    : `${collegeName} programs certificates workforce training catalog`;
  const programSearch = await searchWeb(programSearchQuery);
  searchCount++;
  const programPages: string[] = [];
  for (const r of programSearch.results.slice(0, 2)) {
    try {
      const page = await fetchPage(r.url, 10000);
      programPages.push(page.text);
      dataSources.push({ url: r.url, title: r.title, description: 'Program catalog page' });
    } catch {}
  }

  // Search for strategic plan
  const stratPlanSearch = await searchWeb(`${collegeName} strategic plan 2025 2026 priorities`);
  searchCount++;
  let stratPlanText = '';
  for (const r of stratPlanSearch.results.slice(0, 2)) {
    if (r.url.includes('.pdf')) continue; // skip PDFs for now
    try {
      const page = await fetchPage(r.url, 8000);
      stratPlanText += page.text + '\n';
      dataSources.push({ url: r.url, title: r.title, description: 'Strategic plan / priorities' });
    } catch {}
  }

  // Search for recent news
  const newsSearch = await searchWeb(`"${collegeName}" new program launch expansion 2025 2026`);
  searchCount++;

  // ── Step 2: Use Claude to extract structured data from raw web content ──
  console.log('[Phase 1] Extracting institution profile from web data...');
  
  const categoryConstraintPrompt = getCategoryConstraint(category);
  const institutionExtract = await callClaude(
    `${categoryConstraintPrompt}You are analyzing web content about ${collegeName} in ${collegeCity}, ${collegeState}.

Extract the following from the web data below. If something isn't available, say "Not found in available data."

1. CURRENT PROGRAMS: List all ${category ? `${category}-related` : 'continuing education, workforce training, CTE, and certificate'} programs you can identify. Be thorough.
2. STRATEGIC PRIORITIES: Any stated goals, focus areas, or strategic themes${category ? ` relevant to ${category}` : ''}.
3. RECENT NEWS: Any notable announcements, new programs, expansions, partnerships${category ? ` in the ${category} space` : ''}.

COLLEGE HOMEPAGE CONTENT:
${collegePageText.slice(0, 4000)}

PROGRAM CATALOG PAGES:
${programPages.join('\n---\n').slice(0, 6000)}

STRATEGIC PLAN / PRIORITIES:
${stratPlanText.slice(0, 4000)}

RECENT NEWS SNIPPETS:
${newsSearch.results.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}

Return ONLY valid JSON:
{
  "currentPrograms": ["Program 1", "Program 2", ...],
  "strategicPriorities": ["Priority 1", "Priority 2", ...],
  "recentNews": ["News item 1", "News item 2", ...]
}`,
    { maxTokens: 3000, temperature: 0.2 }
  );

  let institutionData = { currentPrograms: [] as string[], strategicPriorities: [] as string[], recentNews: [] as string[] };
  try {
    const parsed = JSON.parse(institutionExtract.content.match(/\{[\s\S]*\}/)?.[0] || '{}');
    institutionData = {
      currentPrograms: parsed.currentPrograms || [],
      strategicPriorities: parsed.strategicPriorities || [],
      recentNews: parsed.recentNews || [],
    };
  } catch (e) {
    console.warn('[Phase 1] Failed to parse institution data, continuing with defaults');
  }

  // ── Step 3: Regional demographics (Census ACS) ──
  console.log('[Phase 1] Step 3: Fetching Census demographics...');
  
  let censusDemographics: RegionalDemographics | null = null;
  let censusSummary: string | null = null;
  let demographics = { population: null as string | null, medianIncome: null as string | null, educationalAttainment: null as string | null };

  try {
    censusDemographics = await getRegionalDemographics(allCities, collegeState);
    if (censusDemographics) {
      censusSummary = formatDemographicsForAgent(censusDemographics);
      const a = censusDemographics.aggregate;
      const edu = a.educationalAttainment;
      demographics = {
        population: a.totalPopulation.toLocaleString(),
        medianIncome: `$${a.weightedMedianIncome.toLocaleString()}`,
        educationalAttainment: `${edu.bachelorsDegree + edu.graduateOrProfessional}% bachelor's or higher, ${edu.someCollegeNoDegree + edu.associatesDegree}% some college/associate's, ${edu.highSchoolOrGed}% high school/GED`,
      };
      dataSources.push({
        url: 'https://data.census.gov',
        title: 'U.S. Census Bureau ACS 5-Year Estimates (2022)',
        description: `Population, income, education, employment for ${censusDemographics.counties.map(c => c.countyName).join(', ')}`,
      });
      console.log(`[Phase 1] Census data: ${a.totalPopulation.toLocaleString()} pop, $${a.weightedMedianIncome.toLocaleString()} median income, ${a.potentialCCStudentPool.toLocaleString()} addressable market`);
    }
  } catch (err) {
    console.warn('[Phase 1] Census API error, falling back to web search:', err);
  }

  // Fallback: web search demographics if Census failed
  if (!censusDemographics) {
    console.log('[Phase 1] Falling back to web search for demographics...');
    const demoSearch = await searchWeb(
      `${serviceAreaCounties} ${collegeState} population demographics median income educational attainment`
    );
    searchCount++;

    const demoExtract = await callClaude(
      `Extract demographic data for ${serviceAreaCounties}, ${collegeState} from these search results:

${demoSearch.results.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}

Return ONLY valid JSON:
{
  "population": "estimated population number or range",
  "medianIncome": "median household income",
  "educationalAttainment": "brief note on education levels"
}

If data isn't clear, provide best available estimate with "approximately" qualifier.`,
      { maxTokens: 500, temperature: 0.2 }
    );

    try {
      demographics = JSON.parse(demoExtract.content.match(/\{[\s\S]*\}/)?.[0] || '{}');
    } catch {}
  }

  // ── Step 4: Top employers ──
  console.log('[Phase 1] Step 4: Identifying top employers...');

  // Fan employer searches across all cities in the service region
  const employerQueries = category
    ? [
        `${serviceAreaCounties} ${collegeState} ${categoryTerms} employers companies`,
        ...allCities.map(city => `${city} ${collegeState} ${categoryTerms} companies hiring`),
      ]
    : [
        `${serviceAreaCounties} ${collegeState} largest employers`,
        ...allCities.map(city => `${city} ${collegeState} top employers major companies`),
      ];
  // Cap at 5 queries to manage API costs
  const cappedEmployerQueries = employerQueries.slice(0, 5);

  const employerResults = await batchSearch(cappedEmployerQueries, { delayMs: 500 });
  searchCount += cappedEmployerQueries.length;

  // Fetch top employer list pages
  const employerPageTexts: string[] = [];
  const allEmployerResults = employerResults.flatMap(r => r.results).slice(0, 4);
  for (const r of allEmployerResults) {
    try {
      const page = await fetchPage(r.url, 8000);
      employerPageTexts.push(`SOURCE: ${r.url}\n${page.text}`);
      dataSources.push({ url: r.url, title: r.title, description: 'Employer listing' });
    } catch {}
  }

  const employerExtract = await callClaude(
    `${categoryConstraintPrompt}You are identifying the top 15-20 employers in the ${serviceAreaCounties}, ${collegeState} region${category ? ` that are relevant to the "${category}" workforce category` : ''}.

Extract employer information from these web pages. For each employer, provide name, industry, and estimated local employment size.${category ? `\n\nFocus on employers whose workforce needs align with ${category} — companies that hire people with business, management, finance, HR, marketing, accounting, or professional development credentials.` : ''}

WEB CONTENT:
${employerPageTexts.join('\n\n---\n\n').slice(0, 12000)}

SEARCH SNIPPETS:
${employerResults.flatMap(r => r.results).map(r => `- ${r.title}: ${r.snippet}`).join('\n').slice(0, 3000)}

Return ONLY valid JSON — an array of the top 15-20 employers:
[
  {
    "name": "Company Name",
    "industry": "Healthcare / Manufacturing / etc.",
    "estimatedLocalEmployment": "2,500+" or "500-1,000",
    "hiringSignals": "brief note on recent hiring, growth, or relevance",
    "source": "source URL or 'regional employer list'"
  }
]

IMPORTANT:
- Only include employers actually in or near the service area
- Prioritize employers that would hire community college graduates
- Include mix of industries (healthcare, manufacturing, tech, government, education, etc.)
- Do NOT fabricate employer names — only include those found in the web content`,
    { maxTokens: 4000, temperature: 0.3 }
  );

  let topEmployers: RegionalEmployer[] = [];
  try {
    topEmployers = JSON.parse(employerExtract.content.match(/\[[\s\S]*\]/)?.[0] || '[]');
  } catch {
    console.warn('[Phase 1] Failed to parse employer data');
  }

  // ── Step 5: Economic development & workforce priorities ──
  console.log('[Phase 1] Step 5: Economic development research...');

  const econQueries = [
    `${collegeState} workforce development strategic plan priorities 2025 2026`,
    `${serviceAreaCounties} ${collegeState} economic development plan`,
    ...allCities.slice(0, 2).map(city => `${city} ${collegeState} economic development new business investment expansion`),
  ];

  const econResults = await batchSearch(econQueries, { delayMs: 500 });
  searchCount += econQueries.length;

  const econPages: string[] = [];
  for (const r of econResults.flatMap(r => r.results).slice(0, 3)) {
    if (r.url.includes('.pdf')) continue;
    try {
      const page = await fetchPage(r.url, 8000);
      econPages.push(`SOURCE: ${r.url}\n${page.text}`);
      dataSources.push({ url: r.url, title: r.title, description: 'Economic development' });
    } catch {}
  }

  // Major economic events
  const eventSearch = await searchWeb(
    `${region.metroArea} ${collegeState} new plant opening expansion investment CHIPS Act 2024 2025 2026`
  );
  searchCount++;

  const econExtract = await callClaude(
    `Analyze the economic development landscape for ${serviceAreaCounties}, ${collegeState}.

Extract:
1. WORKFORCE PRIORITIES: State or regional workforce board priority industries/skills
2. ECONOMIC TRENDS: Key economic trends affecting workforce demand
3. MAJOR EVENTS: Plant openings/closings, corporate relocations, federal investments, infrastructure projects

WEB CONTENT:
${econPages.join('\n\n---\n\n').slice(0, 10000)}

EVENT SEARCH RESULTS:
${eventSearch.results.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}

Return ONLY valid JSON:
{
  "workforcePriorities": ["Priority 1 with detail", "Priority 2 with detail", ...],
  "economicTrends": [
    {
      "trend": "Brief trend name",
      "details": "1-2 sentence explanation with specifics",
      "source": "source name or URL",
      "relevance": "high" | "medium" | "low"
    }
  ],
  "majorEconomicEvents": ["Event 1 with date and details", "Event 2", ...]
}`,
    { maxTokens: 3000, temperature: 0.3 }
  );

  let econData = { workforcePriorities: [] as string[], economicTrends: [] as EconomicTrend[], majorEconomicEvents: [] as string[] };
  try {
    econData = JSON.parse(econExtract.content.match(/\{[\s\S]*\}/)?.[0] || '{}');
  } catch {
    console.warn('[Phase 1] Failed to parse economic data');
  }

  // ── Assemble output ──
  console.log(`[Phase 1: Regional Intelligence] Complete. ${searchCount} searches executed.`);

  return {
    institution: {
      name: collegeName,
      city: region.metroArea,  // Use full metro area label for display
      state: collegeState,
      website: collegeWebsite,
      serviceArea: serviceAreaCounties,
      currentPrograms: institutionData.currentPrograms,
      strategicPriorities: institutionData.strategicPriorities,
      recentNews: institutionData.recentNews,
      demographics,
    },
    topEmployers,
    economicTrends: econData.economicTrends || [],
    workforcePriorities: econData.workforcePriorities || [],
    majorEconomicEvents: econData.majorEconomicEvents || [],
    censusDemographics,
    censusSummary,
    dataSources,
    searchesExecuted: searchCount,
  };
}
