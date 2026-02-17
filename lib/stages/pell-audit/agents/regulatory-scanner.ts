/**
 * Phase 4b: Regulatory Mandate Scanner
 * 
 * Scans state regulatory codes and licensing requirements to identify
 * mandated training programs that the institution doesn't currently offer.
 * These are guaranteed-demand programs — the students MUST take the training
 * by law. Zero market risk.
 * 
 * Examples: Real estate pre-licensing, childcare worker certification,
 * nurse aide training, food safety management, CDL training, security
 * guard licensing, insurance pre-licensing, etc.
 */

import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { searchWeb, fetchPage } from '@/lib/apis/web-research';
import type { ClassifiedProgram } from '../types';

// ── Types ──

export interface RegulatoryMandate {
  occupation: string;              // "Licensed Real Estate Agent"
  regulatoryBody: string;          // "NC Real Estate Commission"
  statute: string;                 // "NC G.S. §93A-4"
  trainingRequirement: string;     // "75 hours pre-licensing education"
  clockHours: number;              // 75
  renewalRequired: boolean;        // true = ongoing CE demand
  renewalDetails: string;          // "8 hours annually"
  estimatedRegionalDemand: string; // "~2,400 active agents in Wake County"
  pellEligible: boolean;           // Fits 150-599 hour window?
  currentlyOffered: boolean;       // Does the institution already offer this?
  revenueEstimate: string;         // "200 students × $500 = $100K/year"
  opportunityScore: number;        // 1-10
  source: string;                  // URL or citation
}

export interface RegulatoryScanOutput {
  state: string;
  mandates: RegulatoryMandate[];
  notOffered: RegulatoryMandate[];  // Filtered to gaps only
  summary: {
    totalMandatesFound: number;
    gapsIdentified: number;
    pellEligibleGaps: number;
    estimatedTotalDemand: string;
  };
  searchesUsed: number;
}

// ── Main Agent ──

export async function scanRegulatoryMandates(
  existingPrograms: ClassifiedProgram[],
  institutionName: string,
  state: string,
  city?: string
): Promise<RegulatoryScanOutput> {
  const location = city ? `${city}, ${state}` : state;
  console.log(`\n[Regulatory Scanner] Scanning ${state} regulatory mandates for ${institutionName}`);
  const startTime = Date.now();
  let searchCount = 0;

  // Build list of what they already offer
  const existingNames = existingPrograms
    .map(p => p.name.toLowerCase())
    .join(', ');

  // ── Step 1: Research state licensing requirements ──
  console.log('[Regulatory Scanner] Researching state licensing and certification requirements...');

  const searchQueries = [
    `${state} state licensing requirements mandatory training programs`,
    `${state} professional licensing board required education hours`,
    `${state} continuing education requirements occupational licensing`,
    `${state} community college approved training provider licensing`,
    `${state} workforce training certification requirements state code`,
    `${state} pre-licensing education requirements real estate insurance childcare`,
    `${state} mandated certification programs healthcare security food safety`,
    `${state} occupational licensing training hours requirements ${new Date().getFullYear()}`,
  ];

  const searchResults = [];
  const pageSources: string[] = [];

  for (const query of searchQueries) {
    try {
      const result = await searchWeb(query);
      searchResults.push(result);
      searchCount++;
      for (const r of result.results.slice(0, 2)) {
        pageSources.push(`${r.title}: ${r.snippet}`);
      }
    } catch {}
    await new Promise(r => setTimeout(r, 400));
  }

  // Fetch top result pages for deeper analysis
  const topUrls = searchResults
    .flatMap(sr => sr.results.slice(0, 2))
    .filter(r => r.url.includes('.gov') || r.url.includes('licensing') || r.url.includes('board'))
    .slice(0, 5);

  const pageTexts: string[] = [];
  for (const result of topUrls) {
    try {
      const page = await fetchPage(result.url, 8000);
      if (page.text.length > 300) {
        pageTexts.push(`SOURCE: ${result.url}\n${page.text}`);
      }
    } catch {}
    await new Promise(r => setTimeout(r, 300));
  }

  // ── Step 2: AI analysis — identify mandated programs ──
  console.log('[Regulatory Scanner] Analyzing regulatory mandates...');

  const regulatoryContext = [
    ...pageSources.slice(0, 20).map(s => `• ${s}`),
    '',
    ...pageTexts.slice(0, 3),
  ].join('\n');

  const analysisPrompt = `You are a regulatory compliance analyst specializing in state-mandated professional training programs. Your expertise is identifying training requirements that create GUARANTEED enrollment demand for community colleges.

STATE: ${state}
INSTITUTION: ${institutionName} (${location})

EXISTING PROGRAMS AT THIS INSTITUTION (do NOT flag these as gaps):
${existingNames || 'None identified from catalog'}

RESEARCH DATA FROM ${state.toUpperCase()} REGULATORY SOURCES:
${regulatoryContext.slice(0, 30000)}

TASK: Identify ALL state-mandated training, certification, and licensing programs in ${state} that community colleges can offer. Focus on programs where:
1. State law REQUIRES specific training hours for licensure or certification
2. The training can be delivered by a community college (approved provider)
3. There is measurable demand (number of licensed professionals in the region)

COMMON CATEGORIES TO CHECK (research what ${state} specifically requires):
- **Real Estate**: Pre-licensing education, continuing education
- **Insurance**: Pre-licensing for property/casualty, life/health
- **Childcare/Early Childhood**: Mandated training hours for childcare workers
- **Healthcare**: Nurse Aide (CNA), Medication Aide, Phlebotomy, EMT/Paramedic
- **Food Safety**: Food protection manager certification (ServSafe)
- **Construction**: Lead abatement, asbestos, OSHA certifications
- **Transportation**: CDL training, hazmat endorsement
- **Security**: Private security guard licensing, armed guard training
- **Cosmetology/Barbering**: State licensing requirements
- **HVAC/Electrical/Plumbing**: Journeyman/master licensing
- **Substance Abuse/Counseling**: State certification requirements
- **Notary Public**: Required training
- **Tax Preparation**: State-specific requirements
- **Massage Therapy**: State licensing hours
- **Pesticide Application**: Commercial applicator certification
- **Water/Wastewater**: Operator certification

For EACH mandate found, provide:
- occupation: The licensed occupation
- regulatoryBody: Which state agency/board governs this
- statute: Specific statute or code reference (e.g., "${state} G.S. §XX-XX" or "${state} Admin Code §XX")
- trainingRequirement: What's mandated (e.g., "75 hours pre-licensing education")
- clockHours: Number of required hours (initial training, not renewal)
- renewalRequired: true/false — is ongoing CE required?
- renewalDetails: Renewal requirements if applicable
- estimatedRegionalDemand: Estimate of licensed professionals in ${location} area
- pellEligible: true if initial training is 150-599 clock hours
- currentlyOffered: true if institution appears to offer this already (check against existing programs list)
- revenueEstimate: Conservative annual revenue estimate (students × tuition)
- opportunityScore: 1-10 (higher = bigger gap, more demand, easier to launch)
- source: Citation or URL

BE SPECIFIC to ${state}. Don't give generic national requirements — give the actual ${state} statutes and regulatory bodies.

Return JSON:
{
  "mandates": [
    {
      "occupation": "Licensed Real Estate Broker",
      "regulatoryBody": "NC Real Estate Commission",
      "statute": "NC G.S. §93A-4",
      "trainingRequirement": "75 hours pre-licensing education from approved school",
      "clockHours": 75,
      "renewalRequired": true,
      "renewalDetails": "8 hours CE annually including 4 hours of mandatory update course",
      "estimatedRegionalDemand": "~2,400 active agents in Wake County",
      "pellEligible": false,
      "currentlyOffered": false,
      "revenueEstimate": "150 students × $600 = $90,000/year",
      "opportunityScore": 7,
      "source": "https://www.ncrec.gov/licensing"
    }
  ]
}

Return ONLY valid JSON. Be thorough — find 12-20 mandated programs.`;

  const result = await callClaude(analysisPrompt, {
    maxTokens: 8000,
    temperature: 0.2,
  });

  let parsed: any;
  try {
    parsed = extractJSON(result.content);
  } catch (err) {
    console.error('[Regulatory Scanner] Failed to parse mandates:', err);
    return {
      state,
      mandates: [],
      notOffered: [],
      summary: { totalMandatesFound: 0, gapsIdentified: 0, pellEligibleGaps: 0, estimatedTotalDemand: 'N/A' },
      searchesUsed: searchCount,
    };
  }

  const mandates: RegulatoryMandate[] = (parsed.mandates || []).map((m: any) => ({
    occupation: m.occupation || 'Unknown',
    regulatoryBody: m.regulatoryBody || 'Unknown',
    statute: m.statute || 'Unknown',
    trainingRequirement: m.trainingRequirement || '',
    clockHours: m.clockHours || 0,
    renewalRequired: m.renewalRequired ?? false,
    renewalDetails: m.renewalDetails || '',
    estimatedRegionalDemand: m.estimatedRegionalDemand || '',
    pellEligible: m.pellEligible ?? false,
    currentlyOffered: m.currentlyOffered ?? false,
    revenueEstimate: m.revenueEstimate || '',
    opportunityScore: m.opportunityScore || 0,
    source: m.source || '',
  }));

  // Filter to gaps (not currently offered)
  const notOffered = mandates
    .filter(m => !m.currentlyOffered)
    .sort((a, b) => b.opportunityScore - a.opportunityScore);

  const pellEligibleGaps = notOffered.filter(m => m.pellEligible).length;

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Regulatory Scanner] Complete in ${duration}s — ${mandates.length} mandates found, ${notOffered.length} gaps`);

  return {
    state,
    mandates,
    notOffered,
    summary: {
      totalMandatesFound: mandates.length,
      gapsIdentified: notOffered.length,
      pellEligibleGaps,
      estimatedTotalDemand: `${notOffered.length} programs with mandated enrollment demand`,
    },
    searchesUsed: searchCount,
  };
}
