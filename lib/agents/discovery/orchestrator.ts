import { getSupabaseServerClient } from '@/lib/supabase/client';
import { scanRegionalLaborMarket, RegionalScanResult } from './regional-scanner';
import { analyzeMarketGaps, GapAnalysisResult } from './gap-analyzer';
import { mapGapsToPrograms, validateRecommendations } from './program-mapper';
import { scoreProgramRecommendations, ScoredProgram } from './quick-scorer';

export interface DiscoveryInput {
  projectId: string;
  institutionName: string;
  geographicArea: string;
  currentPrograms?: string[];
}

export interface DiscoveryResult {
  projectId: string;
  status: 'success' | 'partial' | 'error';
  regionalScan: RegionalScanResult | null;
  gapAnalysis: GapAnalysisResult | null;
  programRecommendations: ScoredProgram[];
  executiveSummary: string;
  completionDate: string;
  errors: string[];
}

/**
 * Discovery Orchestrator
 * Coordinates the 4 discovery agents in sequence:
 * 1. Regional Scanner → labor market data
 * 2. Gap Analyzer → identify unmet needs
 * 3. Program Mapper → design specific programs
 * 4. Quick Scorer → rank opportunities
 */
export async function orchestrateDiscovery(
  input: DiscoveryInput
): Promise<DiscoveryResult> {
  const supabase = getSupabaseServerClient();
  const errors: string[] = [];

  console.log(`[Discovery Orchestrator] Starting discovery for ${input.institutionName}`);
  console.log(`[Discovery Orchestrator] Region: ${input.geographicArea}`);
  console.log(`[Discovery Orchestrator] Current programs: ${input.currentPrograms?.length || 0}`);

  // Update project status
  await updateProjectStatus(input.projectId, 'scanning', supabase);

  let regionalScan: RegionalScanResult | null = null;
  let gapAnalysis: GapAnalysisResult | null = null;
  let scoredPrograms: ScoredProgram[] = [];

  try {
    // STAGE 1: Regional Labor Market Scanner
    console.log('[Discovery Orchestrator] Stage 1/4: Regional Scanner');
    try {
      regionalScan = await scanRegionalLaborMarket(input.geographicArea);
      console.log(`[Discovery Orchestrator] ✓ Identified ${regionalScan.topOccupations.length} high-demand occupations`);
    } catch (error) {
      const msg = `Regional scanner failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`[Discovery Orchestrator] ✗ ${msg}`);
      errors.push(msg);
      throw new Error('Cannot proceed without regional labor market data');
    }

    // STAGE 2: Gap Analyzer
    console.log('[Discovery Orchestrator] Stage 2/4: Gap Analyzer');
    await updateProjectStatus(input.projectId, 'analyzing_gaps', supabase);

    try {
      gapAnalysis = await analyzeMarketGaps(
        input.institutionName,
        regionalScan,
        input.currentPrograms || []
      );
      console.log(`[Discovery Orchestrator] ✓ Found ${gapAnalysis.totalGapsIdentified} opportunity gaps`);
    } catch (error) {
      const msg = `Gap analyzer failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`[Discovery Orchestrator] ✗ ${msg}`);
      errors.push(msg);
      throw new Error('Cannot proceed without gap analysis');
    }

    // STAGE 3: Program Mapper
    console.log('[Discovery Orchestrator] Stage 3/4: Program Mapper');
    await updateProjectStatus(input.projectId, 'mapping_programs', supabase);

    let rawRecommendations: import('./program-mapper').ProgramRecommendation[] = [];
    try {
      // Map top 15 gaps to programs
      const topGaps = [
        ...gapAnalysis.highOpportunityGaps,
        ...gapAnalysis.moderateOpportunityGaps,
      ].slice(0, 15);

      rawRecommendations = await mapGapsToPrograms(input.institutionName, topGaps);
      
      const validation = validateRecommendations(rawRecommendations);
      if (validation.issues.length > 0) {
        console.warn('[Discovery Orchestrator] Program mapping issues:', validation.issues);
        errors.push(...validation.issues);
      }

      console.log(`[Discovery Orchestrator] ✓ Mapped ${validation.valid.length} program recommendations`);
      rawRecommendations = validation.valid;
    } catch (error) {
      const msg = `Program mapper failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`[Discovery Orchestrator] ✗ ${msg}`);
      errors.push(msg);
      // Continue with empty recommendations rather than failing completely
    }

    // STAGE 4: Quick Scorer
    console.log('[Discovery Orchestrator] Stage 4/4: Quick Scorer');
    await updateProjectStatus(input.projectId, 'scoring', supabase);

    try {
      if (rawRecommendations.length > 0) {
        scoredPrograms = await scoreProgramRecommendations(
          input.institutionName,
          input.geographicArea,
          rawRecommendations
        );
        console.log(`[Discovery Orchestrator] ✓ Scored ${scoredPrograms.length} programs`);
      } else {
        console.warn('[Discovery Orchestrator] No programs to score (mapping stage failed)');
        errors.push('No programs generated for scoring');
      }
    } catch (error) {
      const msg = `Quick scorer failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`[Discovery Orchestrator] ✗ ${msg}`);
      errors.push(msg);
      // Continue with unscored recommendations
    }

    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(
      input,
      regionalScan,
      gapAnalysis,
      scoredPrograms
    );

    // Determine final status
    const status = errors.length === 0 ? 'success' : 'partial';

    console.log(`[Discovery Orchestrator] Discovery complete: ${status}`);
    if (errors.length > 0) {
      console.log(`[Discovery Orchestrator] Errors encountered: ${errors.length}`);
    }

    await updateProjectStatus(input.projectId, 'completed', supabase);

    return {
      projectId: input.projectId,
      status,
      regionalScan,
      gapAnalysis,
      programRecommendations: scoredPrograms,
      executiveSummary,
      completionDate: new Date().toISOString(),
      errors,
    };
  } catch (error) {
    console.error('[Discovery Orchestrator] Fatal error:', error);
    await updateProjectStatus(input.projectId, 'error', supabase);

    return {
      projectId: input.projectId,
      status: 'error',
      regionalScan,
      gapAnalysis,
      programRecommendations: scoredPrograms,
      executiveSummary: 'Discovery scan failed. See errors for details.',
      completionDate: new Date().toISOString(),
      errors: [
        ...errors,
        error instanceof Error ? error.message : String(error),
      ],
    };
  }
}

function generateExecutiveSummary(
  input: DiscoveryInput,
  regionalScan: RegionalScanResult | null,
  gapAnalysis: GapAnalysisResult | null,
  scoredPrograms: ScoredProgram[]
): string {
  const topPrograms = scoredPrograms.slice(0, 5);
  
  return `# Program Discovery Report - Executive Summary

**Institution:** ${input.institutionName}  
**Region:** ${input.geographicArea}  
**Analysis Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## Key Findings

**Labor Market Scan:** Analyzed ${regionalScan?.topOccupations.length || 0} high-demand occupations in ${input.geographicArea}.

**Opportunity Gaps:** Identified ${gapAnalysis?.totalGapsIdentified || 0} program opportunities where demand exists but institutional offerings are limited.

**Top ${topPrograms.length} Recommendations:**

${topPrograms.map((prog, i) => `${i + 1}. **${prog.programName}** (${prog.opportunityScore}/10) - ${prog.recommendation}
   - ${prog.keyInsights[0] || 'Strong market opportunity'}`).join('\n\n')}

## Market Overview

${regionalScan?.marketOverview || 'Market data unavailable'}

## Recommended Next Steps

1. **Review Top 5 Programs** - These represent the strongest opportunities based on demand, competition, and institutional fit
2. **Select 2-3 for Full Validation** - Order detailed program validation reports for your top picks
3. **Begin Feasibility Planning** - For high-priority programs, start exploring resource requirements and partnerships
4. **Monitor Market Trends** - Revisit this analysis quarterly as labor markets shift

---

*This discovery report uses proprietary multi-lens analysis to identify program opportunities. Full validation recommended before launch decisions.*`;
}

async function updateProjectStatus(
  projectId: string,
  status: string,
  supabase: any
): Promise<void> {
  await supabase
    .from('discovery_projects')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);
}
