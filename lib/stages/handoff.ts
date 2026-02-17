/**
 * Discovery → Validation Handoff
 * 
 * Maps Discovery pipeline output to Validation pipeline input.
 * Two core functions:
 *   1. discoveryToValidationProject() — maps an opportunity to a Validation project shape
 *   2. buildDiscoveryContext() — extracts relevant Discovery data for each Validation agent
 * 
 * Design principles:
 *   - Each context field is a pre-formatted text string (not raw JSON)
 *   - Each field targets ~500 tokens max to avoid bloating agent prompts
 *   - Discovery context is additive — agents still do their own research
 */

import type { DiscoveryOutput } from './discovery/orchestrator';
import type { ScoredOpportunity } from './discovery/agents/opportunity-scorer';
import type { BlueOceanOpportunity } from './discovery/agents/blue-ocean-scanner';
import type { InstitutionProfile } from './discovery/agents/regional-intelligence';

// ── Types ──

/** Context extracted from Discovery for each Validation agent */
export interface DiscoveryContext {
  // For all agents
  collegeName: string;
  region: string;
  serviceArea: string;

  // For market analyst
  demandSignals: string;
  blsData: string;
  jobPostings: string;

  // For competitive analyst
  competitors: string;
  competitivePosition: string;
  gaps: string;

  // For employer analyst
  topEmployers: string;
  employerExpansions: string;

  // For financial analyst
  grantOpportunities: string;
  revenueEstimates: string;

  // For institutional fit
  currentPrograms: string;
  strategicPriorities: string;

  // For regulatory analyst
  certifications: string;

  // For learner demand
  demographics: string;
  wageOutcomes: string;

  // Raw evidence for tiger team
  allEvidence: Array<{ point: string; source: string }>;
}

/** Validation project shape (mirrors validation_projects table) */
export interface ValidationProjectData {
  title: string;
  description: string;
  occupation: string;
  soc_code: string;
  region: string;
  sector: string;
  level: string;
  // Extra fields from Discovery
  program_name: string;
  client_name: string;
  program_type: string;
  target_audience: string;
  geographic_area: string;
  target_occupation: string;
  soc_codes: string;
  industry_sector: string;
  program_level: string;
}

// ── Opportunity type guard ──

function isScoredOpportunity(opp: ScoredOpportunity | BlueOceanOpportunity): opp is ScoredOpportunity {
  return 'rank' in opp && 'tier' in opp && 'keyMetrics' in opp;
}

// ── Main Functions ──

/**
 * Maps a Discovery opportunity to a Validation project shape.
 * Works with both ScoredOpportunity and BlueOceanOpportunity.
 */
export function discoveryToValidationProject(
  opportunity: ScoredOpportunity | BlueOceanOpportunity,
  discoveryOutput: DiscoveryOutput
): ValidationProjectData {
  const regionalIntel = discoveryOutput.structuredData.regionalIntelligence;
  const institution = regionalIntel?.institution;

  const region = institution?.serviceArea || 'United States';
  const collegeName = institution?.name || 'Unknown Institution';
  const state = institution?.state || '';

  const sector = inferSector(opportunity);
  const level = inferLevel(opportunity);

  return {
    title: opportunity.programTitle,
    description: opportunity.description,
    occupation: opportunity.targetOccupation,
    soc_code: opportunity.socCode || '',
    region: `${region}, ${state}`.replace(/,\s*$/, ''),
    sector,
    level,
    // Map to ValidationProject fields used by existing agents
    program_name: opportunity.programTitle,
    client_name: collegeName,
    program_type: level,
    target_audience: isScoredOpportunity(opportunity)
      ? opportunity.programSnapshot?.targetAudience || 'Adult learners and career changers'
      : 'Adult learners seeking new career pathways',
    geographic_area: `${region}, ${state}`.replace(/,\s*$/, ''),
    target_occupation: opportunity.targetOccupation,
    soc_codes: opportunity.socCode || '',
    industry_sector: sector,
    program_level: level,
  };
}

/**
 * Extracts relevant Discovery data for each Validation agent.
 * Each field is a pre-formatted text string ready for prompt injection.
 * Fields are kept concise (~500 tokens max each).
 */
export function buildDiscoveryContext(
  opportunity: ScoredOpportunity | BlueOceanOpportunity,
  discoveryOutput: DiscoveryOutput
): DiscoveryContext {
  const { structuredData } = discoveryOutput;
  const regionalIntel = structuredData.regionalIntelligence;
  const demandSignals = structuredData.demandSignals;
  const competitive = structuredData.competitiveLandscape;
  const scored = structuredData.scoredOpportunities;

  const institution = regionalIntel?.institution;
  const collegeName = institution?.name || 'Unknown Institution';
  const region = institution?.serviceArea || 'Unknown Region';
  const state = institution?.state || '';

  // Collect all evidence from the opportunity
  const allEvidence: Array<{ point: string; source: string }> = [];

  if (isScoredOpportunity(opportunity)) {
    for (const e of opportunity.demandEvidence || []) {
      allEvidence.push({ point: e.point, source: e.source });
    }
  } else {
    for (const e of (opportunity as BlueOceanOpportunity).evidence || []) {
      allEvidence.push({ point: e.point, source: e.source });
    }
  }

  return {
    // ── For all agents ──
    collegeName,
    region: `${region}, ${state}`.replace(/,\s*$/, ''),
    serviceArea: institution?.serviceArea || region,

    // ── For market analyst ──
    demandSignals: formatDemandSignals(opportunity, demandSignals),
    blsData: formatBLSData(opportunity, demandSignals),
    jobPostings: formatJobPostings(opportunity, demandSignals),

    // ── For competitive analyst ──
    competitors: formatCompetitors(opportunity, competitive),
    competitivePosition: formatCompetitivePosition(opportunity),
    gaps: formatCompetitiveGaps(opportunity, competitive),

    // ── For employer analyst ──
    topEmployers: formatTopEmployers(opportunity, regionalIntel),
    employerExpansions: formatExpansionSignals(regionalIntel),

    // ── For financial analyst ──
    grantOpportunities: formatGrants(demandSignals),
    revenueEstimates: formatRevenueEstimates(opportunity),

    // ── For institutional fit ──
    currentPrograms: formatCurrentPrograms(institution),
    strategicPriorities: formatStrategicPriorities(institution),

    // ── For regulatory analyst ──
    certifications: formatCertifications(demandSignals),

    // ── For learner demand ──
    demographics: formatDemographics(institution),
    wageOutcomes: formatWageOutcomes(opportunity),

    // ── Raw evidence for tiger team ──
    allEvidence,
  };
}

// ── Formatting Helpers ──
// Each returns a concise text string, ~500 tokens max

function formatDemandSignals(
  opportunity: ScoredOpportunity | BlueOceanOpportunity,
  demandSignals: DiscoveryOutput['structuredData']['demandSignals']
): string {
  const lines: string[] = [];
  const targetOcc = opportunity.targetOccupation.toLowerCase();
  const socCode = opportunity.socCode;

  // Pull relevant signals for this occupation
  const relevantSignals = (demandSignals?.signals || []).filter(s => {
    const occMatch = s.occupation.toLowerCase().includes(targetOcc) ||
      targetOcc.includes(s.occupation.toLowerCase());
    const socMatch = socCode && s.socCode && s.socCode === socCode;
    return occMatch || socMatch;
  });

  if (relevantSignals.length > 0) {
    for (const signal of relevantSignals.slice(0, 5)) {
      lines.push(`- ${signal.occupation} (${signal.signalType}, ${signal.strength}): ${truncate(signal.evidence, 150)}`);
    }
  }

  // Also include opportunity-level evidence
  if (isScoredOpportunity(opportunity)) {
    for (const e of (opportunity.demandEvidence || []).slice(0, 3)) {
      lines.push(`- ${truncate(e.point, 120)} (${e.source})`);
    }
  } else {
    for (const e of ((opportunity as BlueOceanOpportunity).evidence || []).slice(0, 3)) {
      lines.push(`- ${truncate(e.point, 120)} (${e.source})`);
    }
  }

  return lines.length > 0
    ? lines.join('\n')
    : 'No specific demand signals identified during Discovery.';
}

function formatBLSData(
  opportunity: ScoredOpportunity | BlueOceanOpportunity,
  demandSignals: DiscoveryOutput['structuredData']['demandSignals']
): string {
  const lines: string[] = [];

  // BLS data from demand signals
  const blsSignals = (demandSignals?.signals || []).filter(s =>
    s.signalType === 'bls_growth' && (
      s.socCode === opportunity.socCode ||
      s.occupation.toLowerCase().includes(opportunity.targetOccupation.toLowerCase())
    )
  );

  for (const sig of blsSignals.slice(0, 3)) {
    const dp = sig.dataPoints;
    if (dp.medianWage) lines.push(`- Median wage: $${dp.medianWage.toLocaleString()}/year`);
    if (dp.employment) lines.push(`- National employment: ${dp.employment.toLocaleString()}`);
    if (dp.growthProjection) lines.push(`- Growth projection: ${dp.growthProjection}`);
  }

  // Key metrics from scored opportunity
  if (isScoredOpportunity(opportunity) && opportunity.keyMetrics) {
    const km = opportunity.keyMetrics;
    if (km.medianHourlyWage) lines.push(`- Median hourly wage: ${km.medianHourlyWage}`);
    if (km.projectedGrowth) lines.push(`- Projected growth: ${km.projectedGrowth}`);
    if (km.regionalAnnualOpenings) lines.push(`- Regional annual openings: ${km.regionalAnnualOpenings}`);
  } else {
    const bo = opportunity as BlueOceanOpportunity;
    if (bo.medianWage) lines.push(`- Median wage: ${bo.medianWage}`);
    if (bo.estimatedDemand) lines.push(`- Estimated demand: ${bo.estimatedDemand}`);
  }

  return lines.length > 0
    ? lines.join('\n')
    : 'No BLS data gathered during Discovery for this occupation.';
}

function formatJobPostings(
  opportunity: ScoredOpportunity | BlueOceanOpportunity,
  demandSignals: DiscoveryOutput['structuredData']['demandSignals']
): string {
  const lines: string[] = [];

  const jobSignals = (demandSignals?.signals || []).filter(s =>
    s.signalType === 'job_postings' && (
      s.socCode === opportunity.socCode ||
      s.occupation.toLowerCase().includes(opportunity.targetOccupation.toLowerCase())
    )
  );

  for (const sig of jobSignals.slice(0, 3)) {
    const dp = sig.dataPoints;
    if (dp.jobPostingCount) lines.push(`- Active job postings: ${dp.jobPostingCount}`);
    if (dp.topEmployers?.length) lines.push(`- Top hiring employers: ${dp.topEmployers.slice(0, 5).join(', ')}`);
    lines.push(`- Evidence: ${truncate(sig.evidence, 150)}`);
  }

  if (isScoredOpportunity(opportunity) && opportunity.keyMetrics?.activeJobPostings) {
    lines.push(`- Active postings (scored): ${opportunity.keyMetrics.activeJobPostings}`);
  }

  return lines.length > 0
    ? lines.join('\n')
    : 'No job posting data gathered during Discovery for this occupation.';
}

function formatCompetitors(
  opportunity: ScoredOpportunity | BlueOceanOpportunity,
  competitive: DiscoveryOutput['structuredData']['competitiveLandscape']
): string {
  if (!competitive?.providers?.length) {
    return 'No competitor data gathered during Discovery.';
  }

  const lines: string[] = [];
  for (const provider of competitive.providers.slice(0, 8)) {
    const programs = provider.programs.slice(0, 3).join(', ');
    lines.push(`- ${provider.name} (${provider.type}, ${provider.distance}): ${programs || 'programs unlisted'}`);
  }
  return lines.join('\n');
}

function formatCompetitivePosition(
  opportunity: ScoredOpportunity | BlueOceanOpportunity
): string {
  if (isScoredOpportunity(opportunity)) {
    return opportunity.competitivePosition || 'Not assessed';
  }
  return (opportunity as BlueOceanOpportunity).competitivePosition || 'Not assessed';
}

function formatCompetitiveGaps(
  opportunity: ScoredOpportunity | BlueOceanOpportunity,
  competitive: DiscoveryOutput['structuredData']['competitiveLandscape']
): string {
  if (!competitive?.gaps?.length) {
    return 'No gap analysis available from Discovery.';
  }

  const targetOcc = opportunity.targetOccupation.toLowerCase();
  const socCode = opportunity.socCode;

  // Find gaps relevant to this opportunity
  const relevantGaps = competitive.gaps.filter(g => {
    const occMatch = g.occupation.toLowerCase().includes(targetOcc) ||
      targetOcc.includes(g.occupation.toLowerCase());
    const socMatch = socCode && g.socCode === socCode;
    return occMatch || socMatch;
  });

  const gapsToShow = relevantGaps.length > 0 ? relevantGaps : competitive.gaps.slice(0, 5);

  const lines: string[] = [];
  for (const gap of gapsToShow.slice(0, 5)) {
    lines.push(`- ${gap.occupation} (${gap.gapCategory}): ${gap.providerCount} providers — ${truncate(gap.opportunity, 100)}`);
  }
  return lines.join('\n');
}

function formatTopEmployers(
  opportunity: ScoredOpportunity | BlueOceanOpportunity,
  regionalIntel: DiscoveryOutput['structuredData']['regionalIntelligence']
): string {
  if (!regionalIntel?.topEmployers?.length) {
    return 'No employer data gathered during Discovery.';
  }

  const lines: string[] = [];
  for (const emp of regionalIntel.topEmployers.slice(0, 10)) {
    lines.push(`- ${emp.name} (${emp.industry}): ~${emp.estimatedLocalEmployment} local employees — ${truncate(emp.hiringSignals, 80)}`);
  }
  return lines.join('\n');
}

function formatExpansionSignals(
  regionalIntel: DiscoveryOutput['structuredData']['regionalIntelligence']
): string {
  if (!regionalIntel) return 'No expansion signals from Discovery.';

  const lines: string[] = [];

  // Major economic events are expansion signals
  for (const event of (regionalIntel.majorEconomicEvents || []).slice(0, 5)) {
    lines.push(`- ${truncate(event, 120)}`);
  }

  // Economic trends with high relevance
  for (const trend of (regionalIntel.economicTrends || []).filter(t => t.relevance === 'high').slice(0, 3)) {
    lines.push(`- ${trend.trend}: ${truncate(trend.details, 100)}`);
  }

  return lines.length > 0
    ? lines.join('\n')
    : 'No specific expansion signals identified during Discovery.';
}

function formatGrants(
  demandSignals: DiscoveryOutput['structuredData']['demandSignals']
): string {
  if (!demandSignals?.grantOpportunities?.length) {
    return 'No grant opportunities identified during Discovery.';
  }

  const lines: string[] = [];
  for (const grant of demandSignals.grantOpportunities.slice(0, 5)) {
    lines.push(`- ${grant.name} (${grant.industry}): ${truncate(grant.details, 100)}`);
  }
  return lines.join('\n');
}

function formatRevenueEstimates(
  opportunity: ScoredOpportunity | BlueOceanOpportunity
): string {
  const lines: string[] = [];

  if (isScoredOpportunity(opportunity)) {
    lines.push(`- Revenue viability score: ${opportunity.scores.revenueViability}/10`);
    if (opportunity.programSnapshot?.estimatedDuration) {
      lines.push(`- Estimated duration: ${opportunity.programSnapshot.estimatedDuration}`);
    }
    if (opportunity.programSnapshot?.deliveryFormat) {
      lines.push(`- Delivery format: ${opportunity.programSnapshot.deliveryFormat}`);
    }
    if (opportunity.barriers?.length) {
      lines.push(`- Known barriers: ${opportunity.barriers.slice(0, 3).join('; ')}`);
    }
  } else {
    const bo = opportunity as BlueOceanOpportunity;
    lines.push(`- Revenue viability score: ${bo.scores.revenueViability}/10`);
    if (bo.estimatedDemand) lines.push(`- Estimated demand: ${bo.estimatedDemand}`);
    if (bo.firstMoverAdvantage) lines.push(`- First-mover advantage: ${truncate(bo.firstMoverAdvantage, 100)}`);
  }

  return lines.length > 0
    ? lines.join('\n')
    : 'No revenue estimates from Discovery.';
}

function formatCurrentPrograms(
  institution: InstitutionProfile | null | undefined
): string {
  if (!institution?.currentPrograms?.length) {
    return 'Current program catalog not available from Discovery.';
  }

  const programs = institution.currentPrograms.slice(0, 20);
  return programs.join(', ') + (institution.currentPrograms.length > 20
    ? ` (and ${institution.currentPrograms.length - 20} more)`
    : '');
}

function formatStrategicPriorities(
  institution: InstitutionProfile | null | undefined
): string {
  if (!institution?.strategicPriorities?.length) {
    return 'Strategic priorities not identified during Discovery.';
  }

  return institution.strategicPriorities.slice(0, 5).map(p => `- ${p}`).join('\n');
}

function formatCertifications(
  demandSignals: DiscoveryOutput['structuredData']['demandSignals']
): string {
  if (!demandSignals?.trendingCertifications?.length) {
    return 'No trending certifications identified during Discovery.';
  }

  const lines: string[] = [];
  for (const cert of demandSignals.trendingCertifications.slice(0, 8)) {
    lines.push(`- ${cert.certification} (${cert.industry}): ${cert.frequency}`);
  }
  return lines.join('\n');
}

function formatDemographics(
  institution: InstitutionProfile | null | undefined
): string {
  if (!institution?.demographics) {
    return 'Regional demographics not available from Discovery.';
  }

  const d = institution.demographics;
  const lines: string[] = [];
  if (d.population) lines.push(`- Population: ${d.population}`);
  if (d.medianIncome) lines.push(`- Median income: ${d.medianIncome}`);
  if (d.educationalAttainment) lines.push(`- Educational attainment: ${d.educationalAttainment}`);

  return lines.length > 0
    ? lines.join('\n')
    : 'Regional demographics not available from Discovery.';
}

function formatWageOutcomes(
  opportunity: ScoredOpportunity | BlueOceanOpportunity
): string {
  const lines: string[] = [];

  if (isScoredOpportunity(opportunity)) {
    lines.push(`- Wage outcomes score: ${opportunity.scores.wageOutcomes}/10`);
    if (opportunity.keyMetrics?.medianHourlyWage) {
      lines.push(`- Median hourly wage: ${opportunity.keyMetrics.medianHourlyWage}`);
    }
  } else {
    const bo = opportunity as BlueOceanOpportunity;
    lines.push(`- Wage outcomes score: ${bo.scores.wageOutcomes}/10`);
    if (bo.medianWage) lines.push(`- Median wage: ${bo.medianWage}`);
  }

  return lines.length > 0
    ? lines.join('\n')
    : 'No wage data from Discovery.';
}

// ── Inference Helpers ──

function inferSector(opportunity: ScoredOpportunity | BlueOceanOpportunity): string {
  const occ = (opportunity.targetOccupation || '').toLowerCase();
  const title = (opportunity.programTitle || '').toLowerCase();
  const combined = `${occ} ${title}`;

  if (/health|medical|nurs|pharm|dental|clinical|surgical|therapy|sterile|biomedical/.test(combined)) return 'Healthcare';
  if (/tech|software|data|cyber|cloud|network|devops|comput|program|web|ai|machine learn/.test(combined)) return 'Information Technology';
  if (/weld|electr|hvac|plumb|machin|mechanic|manufactur|cnc|industrial|maint/.test(combined)) return 'Skilled Trades';
  if (/business|account|financ|market|manage|admin|human resource/.test(combined)) return 'Business';
  if (/teach|educat|instruct|train/.test(combined)) return 'Education';
  if (/logist|transport|supply chain|warehouse|truck|cdl/.test(combined)) return 'Transportation & Logistics';
  if (/agri|farm|food|culinary/.test(combined)) return 'Agriculture & Food';
  if (/construct|build|architect|cad/.test(combined)) return 'Construction';
  if (/energy|solar|wind|electr.*util/.test(combined)) return 'Energy';

  // Fallback: try SOC code prefix
  const soc = opportunity.socCode || '';
  if (soc.startsWith('29-') || soc.startsWith('31-')) return 'Healthcare';
  if (soc.startsWith('15-')) return 'Information Technology';
  if (soc.startsWith('47-') || soc.startsWith('49-') || soc.startsWith('51-')) return 'Skilled Trades';
  if (soc.startsWith('11-') || soc.startsWith('13-')) return 'Business';
  if (soc.startsWith('25-')) return 'Education';
  if (soc.startsWith('53-')) return 'Transportation & Logistics';

  return 'Other';
}

function inferLevel(opportunity: ScoredOpportunity | BlueOceanOpportunity): string {
  if (isScoredOpportunity(opportunity) && opportunity.programSnapshot?.estimatedDuration) {
    const dur = opportunity.programSnapshot.estimatedDuration.toLowerCase();
    if (/\d+\s*week|\d+\s*month|short.?term|boot.?camp/.test(dur)) {
      const months = parseMonths(dur);
      if (months <= 6) return 'certificate';
      if (months <= 18) return 'diploma';
      return 'associate';
    }
  }

  const title = opportunity.programTitle.toLowerCase();
  if (/certificate|cert\b/.test(title)) return 'certificate';
  if (/diploma/.test(title)) return 'diploma';
  if (/associate|aas|a\.a\.s|a\.s\./.test(title)) return 'associate';
  if (/bachelor|b\.s\.|b\.a\./.test(title)) return 'bachelor';

  // Default to certificate for community college workforce programs
  return 'certificate';
}

function parseMonths(duration: string): number {
  const weekMatch = duration.match(/(\d+)\s*week/i);
  if (weekMatch) return Math.ceil(parseInt(weekMatch[1]) / 4);

  const monthMatch = duration.match(/(\d+)\s*month/i);
  if (monthMatch) return parseInt(monthMatch[1]);

  const yearMatch = duration.match(/(\d+)\s*year/i);
  if (yearMatch) return parseInt(yearMatch[1]) * 12;

  return 6; // default
}

function truncate(text: string, maxLen: number): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}
