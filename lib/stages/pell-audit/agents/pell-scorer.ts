/**
 * Phase 3: Pell Alignment Scorer Agent
 * 
 * Takes classified programs and scores each against the full set of
 * Workforce Pell eligibility criteria — both state-level (Step 1)
 * and federal-level (Step 2). Uses BLS wage data for the earnings test
 * and web research for employer demand signals.
 * 
 * This is the "meat" of the audit — the value that makes someone
 * say "I need to hire these people for the full Discovery."
 */

import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { getBLSData } from '@/lib/apis/bls';
import { searchWeb } from '@/lib/apis/web-research';
import type { ClassifiedProgram, PellScoredProgram, PellScoringOutput } from '../types';

// ── Helpers ──

interface WageLookup {
  soc: string;
  medianWage: number | null;
}

async function fetchWageData(programs: ClassifiedProgram[]): Promise<Map<string, WageLookup>> {
  const wageMap = new Map<string, WageLookup>();
  const uniqueSOCs = [...new Set(programs.map(p => p.primarySOC).filter(Boolean))] as string[];

  console.log(`[Pell Scorer] Fetching BLS wage data for ${uniqueSOCs.length} unique SOC codes...`);

  for (const soc of uniqueSOCs) {
    try {
      const data = await getBLSData(soc);
      wageMap.set(soc, {
        soc,
        medianWage: data?.median_wage || null,
      });
      if (data?.median_wage) {
        console.log(`[Pell Scorer] SOC ${soc}: median $${data.median_wage.toLocaleString()}`);
      }
    } catch (err) {
      console.warn(`[Pell Scorer] BLS lookup failed for ${soc}`);
      wageMap.set(soc, { soc, medianWage: null });
    }
    // Rate limit BLS calls
    await new Promise(r => setTimeout(r, 300));
  }

  return wageMap;
}

// ── Main Agent ──

export async function scorePellAlignment(
  programs: ClassifiedProgram[],
  institutionName: string,
  state: string
): Promise<PellScoringOutput> {
  console.log(`\n[Pell Scorer] Scoring ${programs.length} programs against Pell criteria`);
  const startTime = Date.now();

  // Only score programs that are Workforce Pell candidates or already-eligible
  // (no point scoring programs that are too short or too long)
  const scorablePrograms = programs.filter(p => 
    p.pellCategory === 'workforce-pell-candidate' || 
    p.pellCategory === 'already-eligible' ||
    p.pellCategory === 'unclear'
  );

  console.log(`[Pell Scorer] ${scorablePrograms.length} programs in scope for Pell scoring`);

  if (scorablePrograms.length === 0) {
    return {
      scoredPrograms: [],
      institutionSummary: { pellReady: 0, likelyReady: 0, needsWork: 0, notEligible: 0 },
    };
  }

  // Fetch BLS wage data for earnings test
  const wageData = await fetchWageData(scorablePrograms);

  // Check state WIOA in-demand list
  const wioaSearch = await searchWeb(`${state} WIOA in-demand occupations list ${new Date().getFullYear()}`);
  const wioaContext = wioaSearch.results.slice(0, 3).map(r => `${r.title}: ${r.snippet}`).join('\n');

  // Build scoring prompt
  const programDetails = scorablePrograms.map((p, i) => {
    const wage = p.primarySOC ? wageData.get(p.primarySOC) : null;
    return `[${i}] ${p.name}
     Category: ${p.pellCategory} | SOC: ${p.primarySOC || 'unknown'} | Occupation: ${p.occupationTitle || 'unknown'}
     Clock Hours: ${p.clockHourEstimate} | Weeks: ${p.weekEstimate}
     Credential: ${p.credentialType} | Stackable: ${p.credentialStackable ?? 'unknown'} | Portable: ${p.credentialPortable ?? 'unknown'}
     Tuition: ${p.tuition || 'unknown'} | Credit: ${p.isCredit ? 'Yes' : 'No'}
     BLS Median Wage: ${wage?.medianWage ? `$${wage.medianWage.toLocaleString()}/year` : 'not available'}
     Department: ${p.department}
     Notes: ${p.classificationNotes}`;
  }).join('\n\n');

  const scoringPrompt = `You are a Workforce Pell Grant compliance specialist. Score each program against the full eligibility criteria.

INSTITUTION: ${institutionName} (${state})

WORKFORCE PELL ELIGIBILITY CRITERIA:

STATE LEVEL (Step 1 — must ALL be met):
A. HIGH-SKILL/HIGH-WAGE/IN-DEMAND: Program prepares students for occupations classified as high-skill, high-wage, or in-demand per state WIOA definitions
B. EMPLOYER HIRING NEEDS: Program meets documented hiring requirements of employers in the sector
C. STACKABLE CREDENTIAL: Leads to a recognized postsecondary credential that is stackable and portable (unless only one credential exists for the occupation)
D. CREDIT TOWARD DEGREE: Short-term program credits count as academic credit toward a subsequent certificate or degree program

FEDERAL LEVEL (Step 2 — must ALL be met):
E. OFFERED ONE YEAR: Program has been offered at the institution for at least one year
F. 70% COMPLETION RATE: Program has ≥70% completion rate (within 150% of normal time)
G. 70% PLACEMENT RATE: Program has ≥70% job placement rate (measured 180 days post-completion)
H. EARNINGS > TUITION: Median value-added earnings of completers exceed published tuition + fees

STATE WIOA CONTEXT FOR ${state.toUpperCase()}:
${wioaContext || 'No specific WIOA data found — use national in-demand occupation lists as proxy.'}

PROGRAMS TO SCORE:
${programDetails}

For EACH program, score all 8 criteria (A-H). For each criterion, provide:
- status: "met", "likely-met", "uncertain", "likely-not-met", or "not-met"
- evidence: specific evidence supporting the rating (wage data, credential analysis, etc.)
- source: data source (BLS, O*NET, institutional catalog, WIOA list, etc.)

Also provide:
- stateScore: 0-100 (based on how well criteria A-D are met)
- federalScore: 0-100 (based on how well criteria E-H are met)
- overallPellReadiness: "ready", "likely-ready", "needs-work", or "not-eligible"
- recommendations: array of 1-3 specific, actionable steps to improve eligibility

IMPORTANT SCORING NOTES:
- For criterion E (offered one year): assume "likely-met" if the program appears established, "uncertain" if it seems new
- For criteria F and G (completion and placement rates): these are DATA requirements. Most colleges don't publish this granularly. Rate as "uncertain" unless you have evidence, but note that the INSTITUTION will need to track and report these
- For criterion H (earnings > tuition): use BLS median wage data vs. listed tuition. If median annual wage > tuition, this is likely met. Remember the formula: median_earnings - (1.5 × federal_poverty_level) > tuition
- Federal poverty level for 2026 ≈ $15,500 for a single individual

Return JSON:
{
  "scores": [
    {
      "index": 0,
      "programName": "Program Name",
      "stateCriteria": {
        "highSkillHighWage": { "status": "met", "evidence": "BLS median wage $48,000 exceeds state threshold", "source": "BLS OEWS" },
        "employerHiringNeeds": { "status": "likely-met", "evidence": "...", "source": "..." },
        "stackableCredential": { "status": "met", "evidence": "...", "source": "..." },
        "creditTowardDegree": { "status": "uncertain", "evidence": "...", "source": "..." }
      },
      "federalCriteria": {
        "offeredOneYear": { "status": "likely-met", "evidence": "...", "source": "..." },
        "completionRate70": { "status": "uncertain", "evidence": "...", "source": "..." },
        "placementRate70": { "status": "uncertain", "evidence": "...", "source": "..." },
        "earningsExceedTuition": { "status": "met", "evidence": "...", "source": "..." }
      },
      "stateScore": 80,
      "federalScore": 60,
      "overallPellReadiness": "likely-ready",
      "recommendations": [
        "Begin tracking completion and placement rates for Workforce Pell reporting requirements",
        "Formalize articulation agreement to ensure credits stack toward AAS degree"
      ]
    }
  ]
}

Return ONLY valid JSON. Score ALL ${scorablePrograms.length} programs.`;

  const result = await callClaude(scoringPrompt, {
    maxTokens: 8000,
    temperature: 0.2,
  });

  let parsed: any;
  try {
    parsed = extractJSON(result.content);
  } catch (err) {
    console.error('[Pell Scorer] Failed to parse scores:', err);
    return {
      scoredPrograms: [],
      institutionSummary: { pellReady: 0, likelyReady: 0, needsWork: 0, notEligible: 0 },
    };
  }

  const scores = parsed.scores || parsed || [];
  
  const scoredPrograms: PellScoredProgram[] = scorablePrograms.map((program, i) => {
    const score = scores.find((s: any) => s.index === i) || scores[i] || {};
    const wage = program.primarySOC ? wageData.get(program.primarySOC) : null;
    const tuitionNum = program.tuition ? parseFloat(program.tuition.replace(/[^0-9.]/g, '')) : null;
    
    return {
      programName: program.name,
      pellCategory: program.pellCategory,
      stateCriteria: score.stateCriteria || {
        highSkillHighWage: { criterion: 'High-Skill/High-Wage', status: 'uncertain', evidence: 'No data', source: 'N/A' },
        employerHiringNeeds: { criterion: 'Employer Hiring Needs', status: 'uncertain', evidence: 'No data', source: 'N/A' },
        stackableCredential: { criterion: 'Stackable Credential', status: 'uncertain', evidence: 'No data', source: 'N/A' },
        creditTowardDegree: { criterion: 'Credit Toward Degree', status: 'uncertain', evidence: 'No data', source: 'N/A' },
      },
      stateScore: score.stateScore || 0,
      federalCriteria: score.federalCriteria || {
        offeredOneYear: { criterion: 'Offered One Year', status: 'uncertain', evidence: 'No data', source: 'N/A' },
        completionRate70: { criterion: '70% Completion Rate', status: 'uncertain', evidence: 'No data', source: 'N/A' },
        placementRate70: { criterion: '70% Placement Rate', status: 'uncertain', evidence: 'No data', source: 'N/A' },
        earningsExceedTuition: { criterion: 'Earnings > Tuition', status: 'uncertain', evidence: 'No data', source: 'N/A' },
      },
      federalScore: score.federalScore || 0,
      overallPellReadiness: score.overallPellReadiness || 'needs-work',
      recommendations: score.recommendations || [],
      medianWage: wage?.medianWage || null,
      estimatedTuition: tuitionNum,
      earningsToTuitionRatio: (wage?.medianWage && tuitionNum && tuitionNum > 0) 
        ? Math.round((wage.medianWage / tuitionNum) * 10) / 10 
        : null,
    };
  });

  // Build summary
  const summary = {
    pellReady: scoredPrograms.filter(p => p.overallPellReadiness === 'ready').length,
    likelyReady: scoredPrograms.filter(p => p.overallPellReadiness === 'likely-ready').length,
    needsWork: scoredPrograms.filter(p => p.overallPellReadiness === 'needs-work').length,
    notEligible: scoredPrograms.filter(p => p.overallPellReadiness === 'not-eligible').length,
  };

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Pell Scorer] Complete in ${duration}s`);
  console.log(`[Pell Scorer] Results: ${summary.pellReady} ready, ${summary.likelyReady} likely ready, ${summary.needsWork} need work`);

  return { scoredPrograms, institutionSummary: summary };
}
