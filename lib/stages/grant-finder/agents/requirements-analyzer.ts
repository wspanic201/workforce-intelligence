/**
 * Requirements Analyzer — Agent 4
 *
 * For the top 15 scored grants, fetches the full grant detail page
 * and uses Claude to extract precise application requirements:
 * - Required narrative sections
 * - Data/documentation needed
 * - Letters of support
 * - Budget requirements
 * - Match/cost-share
 * - Estimated application effort (light/medium/heavy)
 *
 * This gives grant writers an accurate picture of what each application
 * actually demands before committing resources.
 */

import { callClaude } from '@/lib/ai/anthropic';
import { fetchGrantDetails } from '@/lib/apis/grants-gov';
import type { ScoredGrant } from './grant-matcher';

// ── Types ──

export interface GrantRequirements {
  grantId: string;
  grantTitle: string;
  grantNumber: string;

  // Application components
  narrativeSections: string[];      // Required sections (e.g. 'Project Narrative', 'Evaluation Plan')
  dataRequirements: string[];       // Data/stats needed (e.g. 'current enrollment data', 'labor market analysis')
  lettersOfSupport: string[];       // Who must write letters (e.g. 'employers', 'government agencies')
  budgetRequirements: string;       // Budget format and restrictions
  matchRequirements: string;        // Cost-share/matching funds info

  // Effort estimate
  effortLevel: 'light' | 'medium' | 'heavy'; // <20h, 20-60h, 60+h
  estimatedHours: string;           // e.g. '30-45 hours'
  effortRationale: string;          // Why this effort level

  // Key dates
  applicationDeadline: string;
  anticipatedAwardDate?: string;

  // Source
  pageUrl: string;
  analysisNotes: string;
}

export interface RequirementsOutput {
  requirements: GrantRequirements[];
  grantsAnalyzed: number;
  grantsFailed: number;
}

// ── Main Agent ──

export async function analyzeRequirements(
  topGrants: ScoredGrant[],
  maxGrants = 15
): Promise<RequirementsOutput> {
  const grantsToAnalyze = topGrants.slice(0, maxGrants);
  console.log(`\n[Requirements Analyzer] Analyzing requirements for top ${grantsToAnalyze.length} grants`);
  const startTime = Date.now();

  const requirements: GrantRequirements[] = [];
  let grantsFailed = 0;

  for (let i = 0; i < grantsToAnalyze.length; i++) {
    const grant = grantsToAnalyze[i];
    console.log(`[Requirements Analyzer] [${i + 1}/${grantsToAnalyze.length}] ${grant.title || grant.id}`);

    try {
      const req = await analyzeOneGrant(grant);
      requirements.push(req);
      // Brief pause between grants to let Node GC reclaim memory (prevents OOM on 8GB machines)
      if (i < grantsToAnalyze.length - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    } catch (err) {
      console.warn(`[Requirements Analyzer] Failed for ${grant.id}: ${err instanceof Error ? err.message : String(err)}`);
      grantsFailed++;
      // Add a placeholder
      requirements.push({
        grantId: grant.id,
        grantTitle: grant.title,
        grantNumber: grant.number,
        narrativeSections: ['Project narrative', 'Evaluation plan', 'Budget narrative'],
        dataRequirements: ['Institutional data', 'Labor market analysis'],
        lettersOfSupport: ['Employer partners', 'Community stakeholders'],
        budgetRequirements: 'Standard federal budget format required. See FOA for details.',
        matchRequirements: 'See grant details for matching requirements.',
        effortLevel: 'medium',
        estimatedHours: '30-50 hours',
        effortRationale: 'Standard federal grant application. Exact requirements unavailable — estimated based on agency type.',
        applicationDeadline: grant.closeDate || 'See grants.gov for deadline',
        pageUrl: grant.pageUrl || `https://www.grants.gov/search-results-detail/${grant.id}`,
        analysisNotes: 'Requirements analysis unavailable — visit grants.gov for official details.',
      });
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Requirements Analyzer] Complete in ${elapsed}s — ${requirements.length} analyzed, ${grantsFailed} failed`);

  return {
    requirements,
    grantsAnalyzed: requirements.length,
    grantsFailed,
  };
}

// ── Single Grant Analysis ──

async function analyzeOneGrant(grant: ScoredGrant): Promise<GrantRequirements> {
  // Try to fetch fresh detail page if we don't have a good synopsis
  let pageContent = grant.synopsis || grant.description || grant.eligibilityDetails || '';

  if (pageContent.length < 200 && grant.id) {
    try {
      const freshDetails = await fetchGrantDetails(grant.id);
      if (freshDetails?.synopsis) {
        pageContent = [
          freshDetails.synopsis,
          freshDetails.eligibilityDetails || '',
          freshDetails.matchingFunds || '',
        ].join('\n\n');
      }
    } catch (err) {
      console.warn(`[Requirements Analyzer] Could not refresh details for ${grant.id}`);
    }
  }

  const today = new Date();
  const closeDate = grant.closeDate ? new Date(grant.closeDate) : null;
  const daysUntilDeadline = closeDate
    ? Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const prompt = `You are an expert grant writer analyzing application requirements for a community college grant team.

GRANT DETAILS:
Title: ${grant.title}
Number: ${grant.number}
Agency: ${grant.agency}
Deadline: ${grant.closeDate || 'unknown'} (${daysUntilDeadline !== null ? `${daysUntilDeadline} days from now` : 'unknown timeline'})
Award Amount: ${grant.awardFloor ? `$${grant.awardFloor.toLocaleString()}` : 'unknown'} – ${grant.awardCeiling ? `$${grant.awardCeiling.toLocaleString()}` : 'unknown'}
Cost Sharing: ${grant.costSharing ? 'Required' : 'Not required or unknown'}
Matching Funds: ${grant.matchingFunds || 'Not specified'}

GRANT CONTENT:
${pageContent.slice(0, 3000) || 'Full content not available — analyze based on agency type and grant title.'}

Analyze the application requirements and return a JSON object:
{
  "narrativeSections": ["List of required narrative sections, e.g. 'Project Narrative', 'Evaluation Plan', 'Budget Narrative'"],
  "dataRequirements": ["List of data/documentation the applicant must provide, e.g. 'current enrollment by CIP code', 'labor market demand data', 'industry partnership letters'"],
  "lettersOfSupport": ["Who must provide letters, e.g. 'at least 3 employer partners', 'local workforce development board', 'state agency'"],
  "budgetRequirements": "Describe budget format, restrictions, allowable costs, indirect rate cap if any",
  "matchRequirements": "Describe any cost-share or matching requirements (amount, percentage, in-kind vs cash)",
  "effortLevel": "light",
  "estimatedHours": "15-20 hours",
  "effortRationale": "1-2 sentences explaining why this effort level",
  "applicationDeadline": "${grant.closeDate || 'See grants.gov'}",
  "anticipatedAwardDate": "If mentioned, the expected award notification date",
  "analysisNotes": "Any important notes, caveats, or red flags for the grant writing team"
}

Effort level guidelines:
- "light" (<20 hours): Simple one-pager, formula grants, short narrative, minimal requirements
- "medium" (20-60 hours): Standard federal application, 3-5 narrative sections, some data requirements
- "heavy" (60+ hours): Complex multi-component application, extensive data, many partners required, full evaluation plan

Return only valid JSON. If information is not available in the content, make reasonable inferences based on the agency type and program area.`;

  const response = await callClaude(prompt, { temperature: 0.2, maxTokens: 2000 });
  const jsonStr = response.content.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonStr) {
    throw new Error('No JSON in Claude response for requirements analysis');
  }

  const parsed = JSON.parse(jsonStr);

  // Validate and normalize effort level
  const effortLevel: 'light' | 'medium' | 'heavy' =
    ['light', 'medium', 'heavy'].includes(parsed.effortLevel)
      ? parsed.effortLevel
      : 'medium';

  return {
    grantId: grant.id,
    grantTitle: grant.title,
    grantNumber: grant.number,
    narrativeSections: parsed.narrativeSections || [],
    dataRequirements: parsed.dataRequirements || [],
    lettersOfSupport: parsed.lettersOfSupport || [],
    budgetRequirements: parsed.budgetRequirements || 'Standard federal budget format.',
    matchRequirements: parsed.matchRequirements || 'No matching requirements specified.',
    effortLevel,
    estimatedHours: parsed.estimatedHours || '30-50 hours',
    effortRationale: parsed.effortRationale || '',
    applicationDeadline: parsed.applicationDeadline || grant.closeDate || 'See grants.gov',
    anticipatedAwardDate: parsed.anticipatedAwardDate,
    pageUrl: grant.pageUrl || `https://www.grants.gov/search-results-detail/${grant.id}`,
    analysisNotes: parsed.analysisNotes || '',
  };
}
