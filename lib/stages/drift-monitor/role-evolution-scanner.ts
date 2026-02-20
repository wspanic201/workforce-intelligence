/**
 * Role Evolution Scanner — Tracks how job requirements change over time
 * 
 * Inspired by Burning Glass Institute research showing AI is causing employers 
 * to rapidly redesign roles — adding new skills and dropping old ones at a pace 
 * traditional curriculum review cycles can't match.
 * 
 * Usage:
 * 1. Pull job postings quarterly for target occupation
 * 2. Extract skill/tech mentions from descriptions
 * 3. Store historical snapshots (in database or JSON)
 * 4. Compare current quarter vs. previous quarters
 * 5. Flag significant changes (>15% shift in mention frequency)
 * 6. Include in Drift Analysis reports as "Role Evolution Risk Score"
 */

import { searchJobs } from '@/lib/apis/web-research';
import { callClaude } from '@/lib/ai/anthropic';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkillMention {
  skill: string;
  category: 'technical' | 'software' | 'certification' | 'soft_skill' | 'domain_knowledge';
  mentionCount: number;
  percentage: number; // % of postings that mention this skill
}

export interface QuarterlySnapshot {
  quarter: string; // e.g., "2026-Q1"
  occupationTitle: string;
  socCode?: string;
  location: string;
  totalPostings: number;
  skills: SkillMention[];
  capturedAt: string; // ISO timestamp
}

export interface RoleEvolutionAnalysis {
  currentQuarter: QuarterlySnapshot;
  previousQuarter?: QuarterlySnapshot;
  riskScore: number; // 1-10, where 10 = rapid evolution
  riskRationale: string;
  emergingSkills: Array<{ skill: string; growth: string }>; // Skills gaining traction
  decliningSkills: Array<{ skill: string; decline: string }>; // Skills losing relevance
  stableSkills: string[]; // Skills consistently required
  recommendations: string[];
}

// ─── Quarterly Snapshot Capture ──────────────────────────────────────────────

/**
 * Capture a quarterly snapshot of job posting skill requirements.
 * Run this on a cron schedule (e.g., first day of quarter).
 */
export async function captureQuarterlySnapshot(
  occupationTitle: string,
  location: string = 'United States',
  socCode?: string,
  options: { postingCount?: number } = {}
): Promise<QuarterlySnapshot> {
  console.log(`[RoleEvolution] Capturing snapshot for ${occupationTitle} (${location})`);

  const count = options.postingCount || 50;
  
  // Pull job postings
  const results = await searchJobs(
    `${occupationTitle} job requirements skills`,
    location
  );

  const postings = results.jobs.slice(0, count);
  
  if (postings.length === 0) {
    throw new Error(`No job postings found for ${occupationTitle} in ${location}`);
  }

  // Extract skills from postings using Claude
  const skillsPrompt = `You are analyzing job postings to extract required skills, technologies, and certifications.

OCCUPATION: ${occupationTitle}
LOCATION: ${location}
POSTINGS ANALYZED: ${postings.length}

JOB POSTING DESCRIPTIONS:
${postings.map((p, i) => `
[Posting ${i + 1}] ${p.title} at ${p.company}
${p.description}
---`).join('\n')}

TASK: Extract all mentioned skills, technologies, certifications, and knowledge areas. For each, count how many postings mention it.

Return ONLY valid JSON (no markdown):
{
  "skills": [
    {
      "skill": "Electronic Health Records (EHR)",
      "category": "software",
      "mentionCount": 34,
      "percentage": 68
    },
    {
      "skill": "Compounding Certification",
      "category": "certification",
      "mentionCount": 17,
      "percentage": 34
    }
  ]
}

Categories: technical | software | certification | soft_skill | domain_knowledge

Focus on:
- Specific software/systems (e.g., "Epic EHR", "Microsoft Excel", "Python")
- Certifications (e.g., "CompTIA Security+", "CPhT", "PTCB")
- Technical skills (e.g., "IV compounding", "aseptic technique", "network security")
- Domain knowledge (e.g., "pharmacology", "HIPAA compliance")

Percentage = (mentionCount / ${postings.length}) * 100

Return JSON only.`;

  const { content } = await callClaude(skillsPrompt, { maxTokens: 8000 });
  
  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*"skills"[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract skills JSON from Claude response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  
  // Build snapshot
  const quarter = getCurrentQuarter();
  const snapshot: QuarterlySnapshot = {
    quarter,
    occupationTitle,
    socCode,
    location,
    totalPostings: postings.length,
    skills: parsed.skills,
    capturedAt: new Date().toISOString(),
  };

  console.log(`[RoleEvolution] ✓ Captured ${snapshot.skills.length} skills from ${postings.length} postings`);
  
  return snapshot;
}

// ─── Compare Snapshots ────────────────────────────────────────────────────────

/**
 * Compare current snapshot to previous quarter(s) and identify trends.
 */
export async function analyzeRoleEvolution(
  currentSnapshot: QuarterlySnapshot,
  previousSnapshot?: QuarterlySnapshot
): Promise<RoleEvolutionAnalysis> {
  console.log(`[RoleEvolution] Analyzing evolution for ${currentSnapshot.occupationTitle}`);

  if (!previousSnapshot) {
    // No historical data yet — return baseline analysis
    return {
      currentQuarter: currentSnapshot,
      riskScore: 5,
      riskRationale: 'No historical data available yet. Baseline snapshot captured.',
      emergingSkills: [],
      decliningSkills: [],
      stableSkills: currentSnapshot.skills.map(s => s.skill),
      recommendations: [
        'Capture quarterly snapshots to begin tracking role evolution trends',
        'Re-run this analysis in 3 months to identify emerging skill requirements',
      ],
    };
  }

  // Build skill comparison maps
  const currentSkillMap = new Map(
    currentSnapshot.skills.map(s => [s.skill.toLowerCase(), s])
  );
  const previousSkillMap = new Map(
    previousSnapshot.skills.map(s => [s.skill.toLowerCase(), s])
  );

  const emergingSkills: Array<{ skill: string; growth: string }> = [];
  const decliningSkills: Array<{ skill: string; decline: string }> = [];
  const stableSkills: string[] = [];

  // Analyze each current skill
  for (const [skillKey, current] of currentSkillMap.entries()) {
    const previous = previousSkillMap.get(skillKey);

    if (!previous) {
      // New skill not seen in previous quarter
      emergingSkills.push({
        skill: current.skill,
        growth: `NEW — mentioned in ${current.percentage}% of postings`,
      });
    } else {
      const change = current.percentage - previous.percentage;
      const changePercent = ((change / previous.percentage) * 100).toFixed(0);

      if (Math.abs(change) < 10) {
        // Stable (< 10 percentage point change)
        stableSkills.push(current.skill);
      } else if (change > 0) {
        // Growing
        emergingSkills.push({
          skill: current.skill,
          growth: `+${change.toFixed(0)}pp (${previous.percentage}% → ${current.percentage}%, ${changePercent}% increase)`,
        });
      } else {
        // Declining
        decliningSkills.push({
          skill: current.skill,
          decline: `${change.toFixed(0)}pp (${previous.percentage}% → ${current.percentage}%, ${changePercent}% decrease)`,
        });
      }
    }
  }

  // Check for skills that disappeared entirely
  for (const [skillKey, previous] of previousSkillMap.entries()) {
    if (!currentSkillMap.has(skillKey)) {
      decliningSkills.push({
        skill: previous.skill,
        decline: `DROPPED — was ${previous.percentage}%, now 0%`,
      });
    }
  }

  // Calculate risk score
  // High risk = many emerging skills + many declining skills = rapid evolution
  const emergingCount = emergingSkills.length;
  const decliningCount = decliningSkills.length;
  const totalSkills = currentSnapshot.skills.length;
  const changeRate = (emergingCount + decliningCount) / totalSkills;

  let riskScore = 5; // Default moderate
  let riskRationale = '';

  if (changeRate > 0.4) {
    riskScore = 9;
    riskRationale = `High — ${emergingCount} emerging skills + ${decliningCount} declining skills = ${(changeRate * 100).toFixed(0)}% of skills changing quarter-over-quarter. Rapid role evolution detected.`;
  } else if (changeRate > 0.25) {
    riskScore = 7;
    riskRationale = `Moderate-High — ${(changeRate * 100).toFixed(0)}% of skills changing. Role requirements are shifting faster than typical curriculum cycles.`;
  } else if (changeRate > 0.15) {
    riskScore = 5;
    riskRationale = `Moderate — ${(changeRate * 100).toFixed(0)}% of skills changing. Normal evolution pace for most occupations.`;
  } else {
    riskScore = 3;
    riskRationale = `Low — Only ${(changeRate * 100).toFixed(0)}% of skills changing. Role requirements are stable.`;
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (emergingSkills.length > 0) {
    recommendations.push(
      `Add curriculum modules for emerging skills: ${emergingSkills.slice(0, 3).map(s => s.skill).join(', ')}`
    );
  }

  if (decliningSkills.length > 0) {
    recommendations.push(
      `Review declining skill coverage — may indicate shifting industry practices: ${decliningSkills.slice(0, 3).map(s => s.skill).join(', ')}`
    );
  }

  if (riskScore >= 7) {
    recommendations.push(
      'Schedule quarterly curriculum reviews (vs. annual) to keep pace with role evolution'
    );
  }

  recommendations.push(
    `Re-run this analysis in ${currentSnapshot.quarter === getCurrentQuarter() ? 'Q' + (parseInt(currentSnapshot.quarter.split('-Q')[1]) + 1) : 'next quarter'} to track continued evolution`
  );

  return {
    currentQuarter: currentSnapshot,
    previousQuarter,
    riskScore,
    riskRationale,
    emergingSkills,
    decliningSkills,
    stableSkills,
    recommendations,
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function getCurrentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  return `${year}-Q${quarter}`;
}

// ─── Database Storage (TODO) ──────────────────────────────────────────────────

/**
 * TODO: Add functions to store/retrieve snapshots from database
 * 
 * Table schema:
 * 
 * CREATE TABLE role_evolution_snapshots (
 *   id UUID PRIMARY KEY,
 *   quarter TEXT NOT NULL,
 *   occupation_title TEXT NOT NULL,
 *   soc_code TEXT,
 *   location TEXT NOT NULL,
 *   total_postings INT NOT NULL,
 *   skills JSONB NOT NULL,
 *   captured_at TIMESTAMPTZ NOT NULL,
 *   UNIQUE(quarter, occupation_title, location)
 * );
 * 
 * Usage:
 * - storeSnapshot(snapshot) → saves to DB
 * - getSnapshot(occupationTitle, quarter, location) → retrieves
 * - getLatestSnapshot(occupationTitle, location) → gets most recent
 * - getPreviousSnapshot(occupationTitle, location) → gets previous quarter
 */

export async function storeSnapshot(snapshot: QuarterlySnapshot): Promise<void> {
  // TODO: Implement database storage
  console.log(`[RoleEvolution] TODO: Store snapshot to database`);
}

export async function getSnapshot(
  occupationTitle: string,
  quarter: string,
  location: string
): Promise<QuarterlySnapshot | null> {
  // TODO: Implement database retrieval
  console.log(`[RoleEvolution] TODO: Retrieve snapshot from database`);
  return null;
}
