/**
 * Phase 2: Demand Signal Detection Agent
 * 
 * 15-20 searches to identify where employer demand outpaces workforce supply.
 * Cross-references job postings, BLS projections, employer-specific signals,
 * state grants, and trending certifications.
 */

import { searchWeb, searchJobs, batchSearch } from '@/lib/apis/web-research';
import { getBLSData } from '@/lib/apis/bls';
import { callClaude } from '@/lib/ai/anthropic';
import { withCache } from '@/lib/apis/cache';
import type { RegionalIntelligenceOutput, RegionalEmployer } from './regional-intelligence';
import type { ServiceRegion } from '../orchestrator';

// ── Types ──

export interface DemandSignal {
  occupation: string;
  socCode: string;
  signalType: 'job_postings' | 'bls_growth' | 'employer_expansion' | 'grant_funding' | 'certification_demand';
  strength: 'strong' | 'moderate' | 'emerging';
  evidence: string;
  source: string;
  dataPoints: {
    jobPostingCount?: number;
    medianWage?: number;
    employment?: number;
    growthProjection?: string;
    topEmployers?: string[];
    trendingCerts?: string[];
  };
}

export interface DemandSignalOutput {
  region: string;
  signals: DemandSignal[];
  grantOpportunities: Array<{
    name: string;
    industry: string;
    details: string;
    deadline?: string;
    source: string;
  }>;
  trendingCertifications: Array<{
    certification: string;
    industry: string;
    frequency: string;
    source: string;
  }>;
  topIndustries: Array<{
    industry: string;
    signalCount: number;
    averageStrength: string;
  }>;
  searchesExecuted: number;
}

// ── Main Agent ──

export async function detectDemandSignals(
  regionalIntel: RegionalIntelligenceOutput,
  serviceRegion?: ServiceRegion
): Promise<DemandSignalOutput> {
  const { institution, topEmployers } = regionalIntel;
  const region = `${institution.city}, ${institution.state}`;
  
  // Build list of cities to search across
  const allCities = serviceRegion 
    ? [serviceRegion.primaryCity, ...serviceRegion.additionalCities]
    : [institution.city];
  const metro = serviceRegion?.metroArea || `${institution.serviceArea} ${institution.state}`;

  console.log(`[Phase 2: Demand Signals] Starting for ${region}`);
  console.log(`[Phase 2] Searching across cities: ${allCities.join(', ')}`);

  const signals: DemandSignal[] = [];
  let searchCount = 0;

  // ── Step 1: Job posting analysis by top industries ──
  console.log('[Phase 2] Step 1: Job posting analysis...');

  // Identify top industries from employer list
  const industries = extractTopIndustries(topEmployers);
  
  // Search job postings for each major industry — fan out across cities
  // Use top 4 industries × each city, capped at 12 total queries
  const jobQueries: Array<{ query: string; location: string }> = [];
  for (const ind of industries.slice(0, 4)) {
    for (const city of allCities) {
      jobQueries.push({
        query: `${ind} jobs ${city} ${institution.state} certificate associate degree`,
        location: `${city}, ${institution.state}`,
      });
    }
  }
  const cappedJobQueries = jobQueries.slice(0, 12);

  for (const { query, location } of cappedJobQueries) {
    try {
      const jobResults = await searchJobs(query, location);
      searchCount++;

      if (jobResults.jobs.length > 0) {
        // Extract occupation insights from job data
        const jobInsight = await callClaude(
          `Analyze these ${jobResults.jobs.length} job postings from ${metro}. Identify the top 2-3 specific occupations (with SOC codes if possible) that appear most frequently and would be good fits for community college certificate or associate degree programs.

JOB POSTINGS:
${jobResults.jobs.slice(0, 10).map(j => `- ${j.title} at ${j.company} (${j.location})${j.salary ? ` - ${j.salary}` : ''}\n  ${j.description.slice(0, 200)}`).join('\n')}

Return ONLY valid JSON array:
[
  {
    "occupation": "Specific Occupation Title",
    "socCode": "XX-XXXX",
    "jobCount": ${jobResults.jobs.length},
    "topCompanies": ["Company 1", "Company 2"],
    "commonRequirements": "brief summary of common requirements",
    "salaryRange": "salary range if available"
  }
]`,
          { maxTokens: 1500, temperature: 0.2 }
        );

        try {
          const insights = JSON.parse(jobInsight.content.match(/\[[\s\S]*\]/)?.[0] || '[]');
          for (const insight of insights) {
            signals.push({
              occupation: insight.occupation,
              socCode: insight.socCode || '',
              signalType: 'job_postings',
              strength: jobResults.jobs.length >= 8 ? 'strong' : jobResults.jobs.length >= 4 ? 'moderate' : 'emerging',
              evidence: `${jobResults.jobs.length} active job postings found. ${insight.commonRequirements}`,
              source: `Google Jobs search: "${query}"`,
              dataPoints: {
                jobPostingCount: jobResults.jobs.length,
                topEmployers: insight.topCompanies,
              },
            });
          }
        } catch {}
      }

      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.warn(`[Phase 2] Job search failed for "${query}": ${err}`);
    }
  }

  // ── Step 2: BLS data for top occupations from signals ──
  console.log('[Phase 2] Step 2: BLS employment & wage data...');

  const uniqueSOCs = [...new Set(signals.map(s => s.socCode).filter(Boolean))];
  
  for (const socCode of uniqueSOCs.slice(0, 15)) {
    try {
      const blsData = await withCache(
        'bls_data', { socCode }, () => getBLSData(socCode), 168
      );

      if (blsData) {
        // Update existing signals with BLS data
        const matchingSignals = signals.filter(s => s.socCode === socCode);
        for (const sig of matchingSignals) {
          sig.dataPoints.medianWage = blsData.median_wage || undefined;
          sig.dataPoints.employment = blsData.employment_total || undefined;
        }

        // Add BLS-specific signal if strong indicators
        if (blsData.median_wage && blsData.median_wage > 40000) {
          const existing = signals.find(s => s.socCode === socCode && s.signalType === 'bls_growth');
          if (!existing) {
            signals.push({
              occupation: matchingSignals[0]?.occupation || socCode,
              socCode,
              signalType: 'bls_growth',
              strength: blsData.median_wage > 60000 ? 'strong' : 'moderate',
              evidence: `Median wage $${blsData.median_wage.toLocaleString()}, ${blsData.employment_total?.toLocaleString() || 'N/A'} employed nationally`,
              source: 'Bureau of Labor Statistics OEWS',
              dataPoints: {
                medianWage: blsData.median_wage,
                employment: blsData.employment_total || undefined,
              },
            });
          }
        }
      }
    } catch (err) {
      console.warn(`[Phase 2] BLS lookup failed for ${socCode}: ${err}`);
    }
  }

  // ── Step 3: Employer-specific expansion signals ──
  console.log('[Phase 2] Step 3: Employer expansion signals...');

  const topEmployerNames = topEmployers.slice(0, 8).map(e => e.name);
  const expansionQueries = topEmployerNames.slice(0, 5).map(name =>
    `"${name}" hiring expansion ${institution.state} 2024 2025 2026`
  );

  const expansionResults = await batchSearch(expansionQueries, { delayMs: 600 });
  searchCount += expansionQueries.length;

  for (let i = 0; i < expansionResults.length; i++) {
    const employer = topEmployerNames[i];
    const results = expansionResults[i];
    
    if (results.results.length > 0) {
      const snippets = results.results.slice(0, 5).map(r => `- ${r.title}: ${r.snippet}`).join('\n');
      
      // Only flag if there are actual expansion signals
      const hasExpansion = snippets.toLowerCase().match(/expan|hiring|new facility|new location|growing|investment|opening/);
      if (hasExpansion) {
        signals.push({
          occupation: `${employer} hiring needs`,
          socCode: '',
          signalType: 'employer_expansion',
          strength: 'moderate',
          evidence: snippets.slice(0, 300),
          source: results.results[0]?.url || 'web search',
          dataPoints: {
            topEmployers: [employer],
          },
        });
      }
    }
  }

  // ── Step 4: State/federal workforce grants ──
  console.log('[Phase 2] Step 4: Grant & funding opportunities...');

  const grantQueries = [
    `${institution.state} workforce development grants 2025 2026 community college`,
    `${metro} workforce training funding healthcare manufacturing technology`,
  ];

  const grantResults = await batchSearch(grantQueries, { delayMs: 500 });
  searchCount += grantQueries.length;

  const grantExtract = await callClaude(
    `Extract workforce development grant opportunities from these search results for ${institution.state}:

${grantResults.flatMap(r => r.results).map(r => `- ${r.title}: ${r.snippet} (${r.url})`).join('\n')}

Return ONLY valid JSON array of grant opportunities:
[
  {
    "name": "Grant/Initiative Name",
    "industry": "target industry",
    "details": "brief description and what it funds",
    "deadline": "deadline if mentioned, null otherwise",
    "source": "source URL"
  }
]

Only include clearly identified grants/funding. Do NOT fabricate.`,
    { maxTokens: 2000, temperature: 0.2 }
  );

  let grantOpportunities: DemandSignalOutput['grantOpportunities'] = [];
  try {
    grantOpportunities = JSON.parse(grantExtract.content.match(/\[[\s\S]*\]/)?.[0] || '[]');
  } catch {}

  // Add grant-related signals
  for (const grant of grantOpportunities) {
    signals.push({
      occupation: `${grant.industry} workforce`,
      socCode: '',
      signalType: 'grant_funding',
      strength: 'moderate',
      evidence: `${grant.name}: ${grant.details}`,
      source: grant.source,
      dataPoints: {},
    });
  }

  // ── Step 5: Trending certifications ──
  console.log('[Phase 2] Step 5: Trending certifications...');

  const certSearch = await searchWeb(
    `most in-demand certifications ${institution.state} community college workforce 2025 2026`
  );
  searchCount++;

  const certExtract = await callClaude(
    `Extract trending/in-demand certifications from these search results for ${institution.state}:

${certSearch.results.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}

Return ONLY valid JSON array:
[
  {
    "certification": "Certification Name",
    "industry": "Healthcare / IT / Manufacturing / etc.",
    "frequency": "how often it appears in searches or job postings",
    "source": "source"
  }
]`,
    { maxTokens: 1500, temperature: 0.2 }
  );

  let trendingCerts: DemandSignalOutput['trendingCertifications'] = [];
  try {
    trendingCerts = JSON.parse(certExtract.content.match(/\[[\s\S]*\]/)?.[0] || '[]');
  } catch {}

  // ── Aggregate by industry ──
  const industryMap = new Map<string, { count: number; strengths: string[] }>();
  for (const signal of signals) {
    // Infer industry from occupation or employer data
    const industry = inferIndustry(signal);
    if (!industryMap.has(industry)) {
      industryMap.set(industry, { count: 0, strengths: [] });
    }
    const entry = industryMap.get(industry)!;
    entry.count++;
    entry.strengths.push(signal.strength);
  }

  const topIndustries = Array.from(industryMap.entries())
    .map(([industry, data]) => ({
      industry,
      signalCount: data.count,
      averageStrength: data.strengths.filter(s => s === 'strong').length > data.count / 2 ? 'strong' : 'moderate',
    }))
    .sort((a, b) => b.signalCount - a.signalCount);

  console.log(`[Phase 2: Demand Signals] Complete. ${signals.length} signals detected, ${searchCount} searches.`);

  return {
    region: metro,
    signals,
    grantOpportunities,
    trendingCertifications: trendingCerts,
    topIndustries,
    searchesExecuted: searchCount,
  };
}

// ── Helpers ──

function extractTopIndustries(employers: RegionalEmployer[]): string[] {
  const industries = new Map<string, number>();
  for (const emp of employers) {
    const ind = emp.industry || 'Other';
    industries.set(ind, (industries.get(ind) || 0) + 1);
  }
  return Array.from(industries.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([industry]) => industry)
    .slice(0, 8);
}

function inferIndustry(signal: DemandSignal): string {
  const occ = signal.occupation.toLowerCase();
  if (occ.match(/nurs|health|medic|pharma|dental|therapy|clinical/)) return 'Healthcare';
  if (occ.match(/software|cyber|data|it |tech|computer|network/)) return 'Technology';
  if (occ.match(/manufactur|machin|weld|cnc|industrial/)) return 'Manufacturing';
  if (occ.match(/electric|hvac|plumb|construct|trade/)) return 'Skilled Trades';
  if (occ.match(/account|business|manage|financ/)) return 'Business';
  if (occ.match(/truck|logist|supply|warehouse/)) return 'Logistics';
  if (occ.match(/teach|educ|instruct/)) return 'Education';
  return 'Other';
}
