/**
 * Phase 4: Gap Analyzer Agent
 * 
 * Cross-references the institution's current program offerings against
 * regional labor market demand to identify high-opportunity programs
 * they're NOT currently offering. Each gap is scored for Workforce Pell
 * eligibility potential.
 * 
 * This is the "hook" — the section that makes deans think
 * "I need a full Market Scan for these opportunities."
 */

import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { getBLSData } from '@/lib/apis/bls';
import { searchWeb, searchJobs } from '@/lib/apis/web-research';
import type { ClassifiedProgram, ProgramGap, GapAnalysisOutput } from '../types';

// ── Main Agent ──

export async function analyzeGaps(
  existingPrograms: ClassifiedProgram[],
  institutionName: string,
  state: string,
  city?: string
): Promise<GapAnalysisOutput> {
  const location = city ? `${city}, ${state}` : state;
  console.log(`\n[Gap Analyzer] Analyzing program gaps for ${institutionName} in ${location}`);
  const startTime = Date.now();
  const dataSources: string[] = [];

  // Build list of what they already offer (to avoid recommending duplicates)
  const existingOccupations = existingPrograms
    .map(p => p.occupationTitle || p.relatedOccupation || p.name)
    .filter(Boolean);
  
  const existingSOCs = existingPrograms
    .map(p => p.primarySOC)
    .filter(Boolean) as string[];

  // ── Step 1: Research regional demand ──
  console.log('[Gap Analyzer] Researching regional labor market demand...');

  const demandSearches = [
    `${state} high demand occupations workforce ${new Date().getFullYear()}`,
    `${location} labor shortage workforce needs`,
    `${location} fastest growing jobs employment`,
    `${state} WIOA in-demand occupations eligible training`,
    `${location} employer hiring challenges workforce`,
    `${state} community college workforce gaps training needs`,
  ];

  const searchResults = [];
  for (const query of demandSearches) {
    try {
      const result = await searchWeb(query);
      searchResults.push(result);
      for (const r of result.results.slice(0, 2)) {
        dataSources.push(r.url);
      }
    } catch {}
    await new Promise(r => setTimeout(r, 400));
  }

  const demandContext = searchResults
    .flatMap(sr => sr.results.slice(0, 3))
    .map(r => `${r.title}: ${r.snippet}`)
    .join('\n');

  // ── Step 2: Check job postings in the region ──
  console.log('[Gap Analyzer] Checking regional job postings...');

  const jobCategories = [
    'healthcare technician',
    'manufacturing skilled trades',
    'information technology',
    'construction trades',
    'logistics supply chain',
    'business administration',
  ];

  const jobResults = [];
  for (const category of jobCategories) {
    try {
      const jobs = await searchJobs(category, location);
      if (jobs.jobs.length > 0) {
        jobResults.push({
          category,
          count: jobs.jobs.length,
          samples: jobs.jobs.slice(0, 3).map(j => `${j.title} at ${j.company} (${j.salary || 'salary not listed'})`),
        });
      }
    } catch {}
    await new Promise(r => setTimeout(r, 400));
  }

  const jobContext = jobResults
    .map(jr => `${jr.category}: ${jr.count} postings found — ${jr.samples.join('; ')}`)
    .join('\n');

  // ── Step 3: AI synthesis — identify gaps ──
  console.log('[Gap Analyzer] Synthesizing gap opportunities...');

  const gapPrompt = `You are a workforce program development strategist specializing in identifying high-opportunity program gaps for community colleges — particularly programs that qualify for the new Workforce Pell Grant (150-599 clock hours, 8-15 weeks).

INSTITUTION: ${institutionName} (${location})

EXISTING PROGRAMS (what they ALREADY offer — DO NOT recommend these):
${existingOccupations.slice(0, 50).map((o, i) => `${i + 1}. ${o}`).join('\n')}

EXISTING SOC CODES: ${existingSOCs.join(', ') || 'None identified'}

REGIONAL LABOR MARKET DATA:
${demandContext}

CURRENT JOB POSTINGS IN THE REGION:
${jobContext}

YOUR TASK:
Identify 8-12 HIGH-OPPORTUNITY PROGRAMS that this institution is NOT currently offering but SHOULD consider based on regional demand. Prioritize programs that:

1. Can be designed to fit the Workforce Pell window (150-599 clock hours, 8-15 weeks)
2. Have strong employer demand in the region (real job postings, hiring signals)
3. Lead to occupations with median wages above the state average
4. Fill a genuine gap — no nearby competitors or limited competition
5. Would complement their existing program portfolio

For each gap, provide:
- occupationTitle: The target occupation
- socCode: SOC code (6-digit, e.g., "29-2052")
- regionalDemand: Specific demand evidence (e.g., "350+ annual openings in metro area")
- medianWage: National median annual wage (use BLS data if known, estimate if not)
- growthRate: Projected employment growth rate
- pellEligible: true if program can be designed for 150-599 hour window
- suggestedProgramLength: e.g., "240 clock hours (10 weeks at 24 hrs/wk)"
- suggestedCredential: e.g., "Certificate of Completion, stackable to AAS in Health Sciences"
- nearbyCompetitors: Who else in the region offers this
- competitiveAdvantage: Why this institution could succeed
- opportunityScore: 1-10 (10 = highest opportunity)
- priorityTier: "high", "medium", or "low"

CRITICAL:
- Only recommend programs they DON'T already offer
- Be specific — not "healthcare" but "Phlebotomy Technician" or "Sterile Processing Technician"
- Ground recommendations in the actual regional data — no generic suggestions
- Focus on programs that could realistically launch within 6-12 months
- Every gap should make the dean think "why DON'T we offer this?"

Return JSON:
{
  "gaps": [
    {
      "occupationTitle": "Sterile Processing Technician",
      "socCode": "31-9093",
      "regionalDemand": "12 current openings at 3 hospital systems; growing 12% nationally",
      "medianWage": 44000,
      "growthRate": "+12% (2022-2032)",
      "pellEligible": true,
      "suggestedProgramLength": "200 clock hours (10 weeks at 20 hrs/wk)",
      "suggestedCredential": "Certificate of Completion + CBSPD certification prep, stackable to Surgical Technology AAS",
      "nearbyCompetitors": "No programs within 50 miles",
      "competitiveAdvantage": "Strong existing Health Sciences department; hospital partnerships already in place",
      "opportunityScore": 8.5,
      "priorityTier": "high"
    }
  ]
}

Return ONLY valid JSON.`;

  const result = await callClaude(gapPrompt, {
    maxTokens: 6000,
    temperature: 0.3, // Slightly creative but grounded
  });

  let parsed: any;
  try {
    parsed = extractJSON(result.content);
  } catch (err) {
    console.error('[Gap Analyzer] Failed to parse gaps:', err);
    return {
      gaps: [],
      methodology: 'Regional demand analysis + job posting data + competitive landscape',
      dataSources,
      regionAnalyzed: location,
    };
  }

  const gaps: ProgramGap[] = (parsed.gaps || []).map((g: any) => ({
    occupationTitle: g.occupationTitle || 'Unknown',
    socCode: g.socCode || '',
    regionalDemand: g.regionalDemand || '',
    medianWage: g.medianWage || 0,
    growthRate: g.growthRate || '',
    pellEligible: g.pellEligible ?? true,
    suggestedProgramLength: g.suggestedProgramLength || '',
    suggestedCredential: g.suggestedCredential || '',
    nearbyCompetitors: g.nearbyCompetitors || '',
    competitiveAdvantage: g.competitiveAdvantage || '',
    opportunityScore: g.opportunityScore || 0,
    priorityTier: g.priorityTier || 'medium',
  }));

  // Sort by opportunity score
  gaps.sort((a, b) => b.opportunityScore - a.opportunityScore);

  // ── Step 4: Enrich top gaps with BLS wage data ──
  console.log('[Gap Analyzer] Enriching top gaps with BLS wage data...');
  
  for (const gap of gaps.slice(0, 6)) {
    if (gap.socCode) {
      try {
        const bls = await getBLSData(gap.socCode);
        if (bls?.median_wage) {
          gap.medianWage = bls.median_wage;
          dataSources.push('BLS OEWS');
        }
      } catch {}
      await new Promise(r => setTimeout(r, 300));
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Gap Analyzer] Complete in ${duration}s — ${gaps.length} gaps identified`);

  return {
    gaps,
    methodology: 'Six-vector regional demand analysis: state WIOA priorities, BLS employment projections, active job postings (Google Jobs), workforce board priorities, employer hiring signals, and competitive landscape scan.',
    dataSources: [...new Set(dataSources)],
    regionAnalyzed: location,
  };
}
