/**
 * Catalog Gap: Regulatory Scanner Agent
 *
 * Enhanced version of the pell-audit regulatory scanner.
 * For a given state, identifies ALL occupations that require
 * state-mandated training and/or licensing — returning structured
 * data so the gap-report-writer can size revenue for each one.
 *
 * Categories covered:
 *   Healthcare, Real Estate, Insurance, Childcare, Food Safety,
 *   Construction/Trades, Transportation, Security, Cosmetology,
 *   Substance Abuse Counseling, Massage Therapy, Pesticide/Water,
 *   and any other state-specific mandates.
 */

import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { searchWeb, fetchPage } from '@/lib/apis/web-research';
import type { MandatedProgram, RegulatoryScanOutput } from '../types';

// ── Main Agent ──

export async function scanRegulatoryMandates(
  state: string,
  city?: string,
): Promise<RegulatoryScanOutput> {
  const ts = () => new Date().toISOString();
  const location = city ? `${city}, ${state}` : state;
  console.log(
    `\n[${ts()}][Regulatory Scanner] Scanning mandates for ${location}`,
  );
  const startTime = Date.now();
  let searchCount = 0;

  // ── Step 1: Web research — state regulatory sources ──
  console.log(`[${ts()}][Regulatory Scanner] Gathering regulatory data...`);

  const searchQueries = [
    `${state} state licensing requirements mandatory training programs`,
    `${state} professional licensing board required education clock hours`,
    `${state} community college approved training provider licensing board`,
    `${state} occupational licensing mandated training hours statutes`,
    `${state} pre-licensing education requirements real estate insurance`,
    `${state} mandated certification healthcare CNA cosmetology pharmacy tech`,
    `${state} CDL commercial driver license training requirements`,
    `${state} food safety manager certification required restaurants`,
    `${state} childcare worker mandatory training hours regulations`,
    `${state} HVAC electrical plumbing journeyman license requirements`,
    `${state} security guard licensing training hours requirements`,
    `${state} massage therapy license required hours state board`,
    `${state} EMT paramedic training certification requirements state`,
    `${state} pesticide applicator certification training requirements`,
    `${state} substance abuse counselor certification state requirements`,
    `${state} occupational licensing reform total licensed occupations`,
  ];

  const snippets: string[] = [];
  const pageTexts: string[] = [];

  // Collect search snippets
  for (const query of searchQueries) {
    try {
      const result = await searchWeb(query);
      searchCount++;
      for (const r of result.results.slice(0, 3)) {
        snippets.push(`• [${r.title}] ${r.snippet} — ${r.url}`);
      }
    } catch {
      // Continue on search failure
    }
    await new Promise(r => setTimeout(r, 350));
  }

  // Fetch top government / licensing board pages for deeper content
  const govSnippets = snippets.filter(
    s =>
      s.includes('.gov') ||
      s.includes('licensing') ||
      s.includes('board') ||
      s.includes('commission'),
  );

  // Extract URLs from snippets (after ' — ')
  const govUrls = govSnippets
    .map(s => s.split(' — ').pop()?.trim())
    .filter((u): u is string => !!u && u.startsWith('http'))
    .slice(0, 6);

  for (const url of govUrls) {
    try {
      const page = await fetchPage(url, 8000);
      if (page.text.length > 300) {
        pageTexts.push(`SOURCE: ${url}\n${page.text.slice(0, 6000)}`);
      }
    } catch {
      // Skip
    }
    await new Promise(r => setTimeout(r, 300));
  }

  // ── Step 2: AI analysis — identify ALL mandated programs ──
  console.log(`[${ts()}][Regulatory Scanner] Analyzing regulatory mandates with AI...`);

  const researchContext = [
    '=== SEARCH RESULTS ===',
    ...snippets.slice(0, 40),
    '',
    '=== PAGE CONTENT ===',
    ...pageTexts.slice(0, 4),
  ].join('\n');

  const analysisPrompt = `You are a senior regulatory compliance analyst specializing in state workforce training mandates. Your expertise is identifying ALL training and licensing requirements that create guaranteed, law-mandated enrollment demand for community colleges and vocational schools.

STATE: ${state}
REGION: ${location}

RESEARCH DATA FROM ${state.toUpperCase()} REGULATORY SOURCES:
${researchContext.slice(0, 35000)}

TASK: Identify every occupation in ${state} that requires state-mandated pre-licensing training, certification training, or ongoing continuing education that a community college or vocational school could deliver as an approved provider.

Focus on programs where state law REQUIRES specific training hours before a person may work legally in that role. These are zero-market-risk programs — the demand is guaranteed by statute.

CATEGORIES TO RESEARCH FOR ${state}:
1. **Healthcare**: CNA / Nurse Aide, Medication Aide, EMT, Paramedic, Phlebotomy, Medical Assistant, Pharmacy Tech, Home Health Aide, Dialysis Tech, Surgical Tech
2. **Real Estate**: Pre-licensing education, continuing education
3. **Insurance**: Property/Casualty pre-licensing, Life/Health pre-licensing
4. **Childcare / Early Education**: Center-based and family childcare worker training hours
5. **Food Safety**: Food protection manager certification (ServSafe equivalent)
6. **Cosmetology / Personal Services**: Cosmetologist, Barber, Nail Tech, Esthetician, Electrologist
7. **Transportation**: CDL training, School Bus, Hazmat endorsement
8. **Security**: Unarmed/Armed security guard pre-licensing, Private investigator
9. **Trades / Construction**: HVAC, Electrical (Journeyman), Plumbing (Journeyman), Gas Fitter, Boiler Operator, Elevator Mechanic, Lead Abatement, Asbestos Abatement
10. **Environmental / Water**: Water/Wastewater Operator certification, Environmental Inspector
11. **Substance Abuse / Behavioral Health**: CADC / LADC, Peer Support Specialist
12. **Massage Therapy**: Licensed Massage Therapist
13. **Pesticide / Agriculture**: Commercial Pesticide Applicator, Structural Pest Control
14. **Fire & EMS**: Firefighter I/II, EMS licensing
15. **Other**: Notary Public training, Tax Preparer, Locksmith, Funeral Services, etc.

For EACH mandate found, provide ALL fields:
- occupation: The licensed/certified occupation name
- regulatoryBody: Which state agency or board governs this (full official name)
- statute: Specific statute or regulatory code citation (e.g., "${state} Gen. Stat. §XX-XX" or "${state} Admin. Code §XX.XXX"). BE SPECIFIC.
- trainingRequirement: Exact description of what's mandated (hours, topics, clinical, etc.)
- clockHours: Number of required clock hours for initial training/pre-licensing (integers only)
- renewalRequired: true/false — is periodic CE required for license renewal?
- renewalDetails: If renewalRequired is true, describe CE hours/frequency
- typicalProgramLength: How long this typically runs (e.g., "4 weeks full-time" or "10 weeks part-time")
- demandLevel: "high" | "medium" | "low" based on number of licensed practitioners and hiring demand
- estimatedRegionalDemand: Rough estimate of practitioners in ${location} or ${state} (use your knowledge of typical state workforce sizes)
- source: URL or citation from the research above, or best known regulatory URL

BE SPECIFIC TO ${state}. Cite actual ${state} statutes and regulatory bodies. If you know the specific requirement from your training data, include it even if not in the research above.

Return JSON:
{
  "mandatedPrograms": [
    {
      "occupation": "Certified Nurse Aide (CNA)",
      "regulatoryBody": "${state} [agency name]",
      "statute": "${state} [citation]",
      "trainingRequirement": "[X] hours required including [Y] hours clinical",
      "clockHours": 75,
      "renewalRequired": true,
      "renewalDetails": "12 hours CE annually",
      "typicalProgramLength": "4-6 weeks",
      "demandLevel": "high",
      "estimatedRegionalDemand": "~X,XXX active CNAs in ${state}",
      "source": "https://..."
    }
  ]
}

Find AT LEAST 15 mandated programs. Be comprehensive — these are guaranteed revenue opportunities for community colleges. Return ONLY valid JSON.`;

  const result = await callClaude(analysisPrompt, {
    maxTokens: 10000,
    temperature: 0.2,
  });

  let parsed: any;
  try {
    parsed = extractJSON(result.content);
  } catch (err) {
    console.error(
      `[${ts()}][Regulatory Scanner] Failed to parse mandates:`,
      err,
    );
    return {
      state,
      mandatedPrograms: [],
      searchesUsed: searchCount,
      scannedAt: new Date().toISOString(),
    };
  }

  const mandatedPrograms: MandatedProgram[] = (
    parsed.mandatedPrograms || []
  ).map((m: any) => ({
    occupation: m.occupation || 'Unknown',
    regulatoryBody: m.regulatoryBody || 'State Licensing Board',
    statute: m.statute || 'See state regulatory code',
    trainingRequirement: m.trainingRequirement || '',
    clockHours: typeof m.clockHours === 'number' ? m.clockHours : 0,
    renewalRequired: m.renewalRequired ?? false,
    renewalDetails: m.renewalDetails || '',
    typicalProgramLength: m.typicalProgramLength || '',
    demandLevel: (['high', 'medium', 'low'] as const).includes(m.demandLevel)
      ? m.demandLevel
      : 'medium',
    estimatedRegionalDemand: m.estimatedRegionalDemand || '',
    source: m.source || '',
  }));

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(
    `[${ts()}][Regulatory Scanner] Complete in ${duration}s — ${mandatedPrograms.length} mandated programs identified`,
  );

  return {
    state,
    mandatedPrograms,
    searchesUsed: searchCount,
    scannedAt: new Date().toISOString(),
  };
}
