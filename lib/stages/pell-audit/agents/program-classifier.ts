/**
 * Phase 2: Program Classifier Agent
 * 
 * Takes the raw scraped program list and classifies each one for
 * Workforce Pell eligibility. Estimates clock hours, identifies
 * credential types, maps to SOC codes, and categorizes each program
 * into Pell buckets.
 * 
 * Key classification:
 *   - already-eligible:   ≥600 hours / ≥15 weeks (traditional Pell)
 *   - workforce-pell-candidate: 150-599 hours / 8-15 weeks (NEW Pell)
 *   - too-short:          <150 hours / <8 weeks
 *   - too-long:           Degree programs (already Pell, different pathway)
 *   - unclear:            Insufficient data to classify
 */

import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import type { ScrapedProgram, ClassifiedProgram, ProgramClassificationOutput } from '../types';

// ── Main Agent ──

export async function classifyPrograms(
  programs: ScrapedProgram[],
  institutionName: string,
  state: string
): Promise<ProgramClassificationOutput> {
  console.log(`\n[Program Classifier] Classifying ${programs.length} programs`);
  const startTime = Date.now();

  if (programs.length === 0) {
    return {
      programs: [],
      summary: {
        totalPrograms: 0,
        alreadyPellEligible: 0,
        workforcePellCandidates: 0,
        tooShort: 0,
        tooLong: 0,
        unclear: 0,
      },
    };
  }

  // Build program list for the prompt (cap to avoid context overflow)
  const maxPrograms = 80;
  const programSubset = programs.slice(0, maxPrograms);
  const programList = programSubset.map((p, i) => 
    `[${i}] ${p.name}
     Credential: ${p.credentialType} | Hours: ${p.estimatedHours || 'unknown'} | Weeks: ${p.estimatedWeeks || 'unknown'}
     Credit: ${p.isCredit ? 'Yes' : 'No'} | Tuition: ${p.tuition || 'unknown'}
     Department: ${p.department}
     Occupation: ${p.relatedOccupation || 'unknown'}
     Description: ${p.description.slice(0, 200)}`
  ).join('\n\n');

  const classificationPrompt = `You are a workforce program classification specialist with deep knowledge of the Workforce Pell Grant Act (effective July 1, 2026) and community college program structures.

INSTITUTION: ${institutionName} (${state})

WORKFORCE PELL ELIGIBILITY WINDOWS:
- Traditional Pell: ≥600 clock hours AND ≥15 weeks
- NEW Workforce Pell: 150-599 clock hours AND 8-15 weeks
- NOT eligible: <150 clock hours OR <8 weeks (too short for any Pell)

CLOCK HOUR ESTIMATION RULES:
- 1 credit hour ≈ 45 clock hours (lecture) or 60 clock hours (lab)
- A typical 3-credit course = ~135 clock hours
- A 15-credit certificate ≈ 675 clock hours (traditional Pell eligible)
- A 9-credit certificate ≈ 405 clock hours (Workforce Pell candidate)
- Noncredit programs: estimate from weeks × hours/week (typically 15-25 hrs/wk)
- If a program says "8 weeks" with no hours, estimate 150-200 clock hours
- If a program says "16 weeks" with no hours, estimate ~480-600 clock hours
- AAS degrees = typically 60+ credits = 2,700+ clock hours (already traditional Pell)

SOC CODE MAPPING:
- Map each program to its best-match Standard Occupational Classification (SOC) code
- Use 6-digit format: "XX-XXXX" (e.g., "29-2052" for Pharmacy Technicians)
- If unsure, provide your best estimate with low confidence

PROGRAMS TO CLASSIFY:
${programList}

For EACH program, provide:
1. clockHourEstimate — your best estimate of total clock hours
2. weekEstimate — your best estimate of program duration in weeks
3. pellCategory — one of: "already-eligible", "workforce-pell-candidate", "too-short", "too-long", "unclear"
4. credentialStackable — could this credential stack into a higher credential? (true/false/null)
5. credentialPortable — is the credential industry-recognized and portable? (true/false/null)
6. primarySOC — best-match SOC code (e.g., "29-2052") or null
7. occupationTitle — human-readable occupation name or null
8. classificationConfidence — "high", "medium", or "low"
9. classificationNotes — brief explanation of your reasoning

Return JSON array in this exact format:
{
  "classifications": [
    {
      "index": 0,
      "clockHourEstimate": 405,
      "weekEstimate": 12,
      "pellCategory": "workforce-pell-candidate",
      "credentialStackable": true,
      "credentialPortable": true,
      "primarySOC": "29-2052",
      "occupationTitle": "Pharmacy Technician",
      "classificationConfidence": "high",
      "classificationNotes": "9-credit certificate at ~45 hrs/credit = 405 hours. Fits 150-599 Workforce Pell window. PTCB certification is portable and stackable to AAS."
    }
  ]
}

Return ONLY valid JSON. Classify ALL ${programSubset.length} programs.`;

  const result = await callClaude(classificationPrompt, {
    maxTokens: 8000,
    temperature: 0.1,
  });

  let parsed: any;
  try {
    parsed = extractJSON(result.content);
  } catch (err) {
    console.error('[Program Classifier] Failed to parse classifications:', err);
    // Return programs as unclear
    const fallbackPrograms: ClassifiedProgram[] = programSubset.map(p => ({
      ...p,
      clockHourEstimate: p.estimatedHours || 0,
      weekEstimate: p.estimatedWeeks || 0,
      pellCategory: 'unclear' as const,
      credentialStackable: null,
      credentialPortable: null,
      primarySOC: null,
      occupationTitle: p.relatedOccupation,
      classificationConfidence: 'low' as const,
      classificationNotes: 'Classification failed — insufficient data',
    }));
    return {
      programs: fallbackPrograms,
      summary: {
        totalPrograms: fallbackPrograms.length,
        alreadyPellEligible: 0,
        workforcePellCandidates: 0,
        tooShort: 0,
        tooLong: 0,
        unclear: fallbackPrograms.length,
      },
    };
  }

  // Merge classifications back into program data
  const classifications = parsed.classifications || parsed || [];
  const classifiedPrograms: ClassifiedProgram[] = programSubset.map((program, i) => {
    const cls = classifications.find((c: any) => c.index === i) || classifications[i] || {};
    
    return {
      ...program,
      clockHourEstimate: cls.clockHourEstimate || program.estimatedHours || 0,
      weekEstimate: cls.weekEstimate || program.estimatedWeeks || 0,
      pellCategory: cls.pellCategory || 'unclear',
      credentialStackable: cls.credentialStackable ?? null,
      credentialPortable: cls.credentialPortable ?? null,
      primarySOC: cls.primarySOC || null,
      occupationTitle: cls.occupationTitle || program.relatedOccupation,
      classificationConfidence: cls.classificationConfidence || 'low',
      classificationNotes: cls.classificationNotes || '',
    };
  });

  // Build summary
  const summary = {
    totalPrograms: classifiedPrograms.length,
    alreadyPellEligible: classifiedPrograms.filter(p => p.pellCategory === 'already-eligible').length,
    workforcePellCandidates: classifiedPrograms.filter(p => p.pellCategory === 'workforce-pell-candidate').length,
    tooShort: classifiedPrograms.filter(p => p.pellCategory === 'too-short').length,
    tooLong: classifiedPrograms.filter(p => p.pellCategory === 'too-long').length,
    unclear: classifiedPrograms.filter(p => p.pellCategory === 'unclear').length,
  };

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Program Classifier] Complete in ${duration}s`);
  console.log(`[Program Classifier] Results: ${summary.alreadyPellEligible} already-eligible, ${summary.workforcePellCandidates} Workforce Pell candidates, ${summary.tooShort} too short, ${summary.unclear} unclear`);

  return { programs: classifiedPrograms, summary };
}
