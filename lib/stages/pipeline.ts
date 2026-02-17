/**
 * Full Pipeline Orchestrator: Discovery → Handoff → Validation
 * 
 * Runs the complete WorkforceOS pipeline:
 *   1. Discovery (6 phases, ~55-80 web searches, 7-15 min)
 *   2. Program selection (user picks or auto-select)
 *   3. Validation (7 agents + tiger team per program)
 * 
 * Supports both DB-backed validation (Supabase) and in-memory
 * validation (for testing without a database).
 */

import type { DiscoveryInput, DiscoveryOutput } from './discovery/orchestrator';
import type { ScoredOpportunity } from './discovery/agents/opportunity-scorer';
import type { BlueOceanOpportunity } from './discovery/agents/blue-ocean-scanner';
import type { DiscoveryContext } from './handoff';

import { runDiscovery } from './discovery/orchestrator';
import { discoveryToValidationProject, buildDiscoveryContext } from './handoff';
import { orchestrateValidationInMemory } from '../agents/orchestrator';

// ── Types ──

export interface PipelineInput {
  discoveryInput: DiscoveryInput;
  /** Pre-computed discovery output (skip re-running discovery) */
  discoveryOutput?: DiscoveryOutput;
  /** Indices into scoredOpportunities (0-based) */
  programsToValidate?: number[];
  /** Indices into hiddenOpportunities (0-based) */
  blueOceanToValidate?: number[];
  /** Validate all scored opportunities */
  validateAll?: boolean;
  /** Max number of validations to run (default 3) */
  maxValidations?: number;
}

export interface ValidationResult {
  programTitle: string;
  opportunity: ScoredOpportunity | BlueOceanOpportunity;
  validationResult: any;
  status: 'success' | 'error';
  error?: string;
}

export interface PipelineOutput {
  discovery: DiscoveryOutput;
  validations: ValidationResult[];
  metadata: {
    totalDuration: number;
    discoveryDuration: number;
    validationDurations: Record<string, number>;
    programsSelected: number;
    programsValidated: number;
    programsFailed: number;
  };
}

export type PipelineProgressCallback = (event: {
  stage: 'discovery' | 'selection' | 'validation';
  message: string;
  elapsed: number;
  detail?: string;
}) => void;

// ── Main Pipeline ──

export async function runPipeline(
  input: PipelineInput,
  onProgress?: PipelineProgressCallback
): Promise<PipelineOutput> {
  const pipelineStart = Date.now();
  const maxValidations = input.maxValidations ?? 3;
  const validationDurations: Record<string, number> = {};

  const progress = (stage: PipelineOutput['metadata'] extends infer T ? 'discovery' | 'selection' | 'validation' : never, message: string, detail?: string) => {
    const elapsed = Math.round((Date.now() - pipelineStart) / 1000);
    console.log(`[Pipeline] [${stage}] ${message}${detail ? ` — ${detail}` : ''} [${elapsed}s]`);
    onProgress?.({ stage, message, elapsed, detail });
  };

  console.log('═══════════════════════════════════════════════════');
  console.log('  WORKFORCEOS FULL PIPELINE');
  console.log(`  Discovery → Selection → Validation`);
  console.log('═══════════════════════════════════════════════════');

  // ── Stage 1: Discovery ──
  let discoveryOutput: DiscoveryOutput;
  let discoveryDuration: number;

  if (input.discoveryOutput) {
    progress('discovery', 'Using pre-computed Discovery output');
    discoveryOutput = input.discoveryOutput;
    discoveryDuration = 0;
  } else {
    progress('discovery', 'Starting Discovery pipeline');
    const discoveryStart = Date.now();

    discoveryOutput = await runDiscovery(input.discoveryInput, (event) => {
      progress('discovery', `Phase ${event.phase}/6 ${event.phaseName}`, `${event.status}: ${event.message}`);
    });

    discoveryDuration = Date.now() - discoveryStart;
    progress('discovery', `Discovery complete in ${Math.round(discoveryDuration / 1000)}s`, `Status: ${discoveryOutput.status}`);
  }

  // ── Stage 2: Program Selection ──
  progress('selection', 'Selecting programs for validation');

  const selectedOpportunities = selectPrograms(input, discoveryOutput, maxValidations);

  if (selectedOpportunities.length === 0) {
    console.warn('[Pipeline] No programs selected for validation');
    return {
      discovery: discoveryOutput,
      validations: [],
      metadata: {
        totalDuration: Date.now() - pipelineStart,
        discoveryDuration,
        validationDurations: {},
        programsSelected: 0,
        programsValidated: 0,
        programsFailed: 0,
      },
    };
  }

  progress('selection', `Selected ${selectedOpportunities.length} programs for validation`,
    selectedOpportunities.map(o => o.programTitle).join(', '));

  // ── Stage 3: Validation (sequential) ──
  const validations: ValidationResult[] = [];

  for (let i = 0; i < selectedOpportunities.length; i++) {
    const opportunity = selectedOpportunities[i];
    const label = `[${i + 1}/${selectedOpportunities.length}] ${opportunity.programTitle}`;

    progress('validation', `Starting ${label}`);
    const validationStart = Date.now();

    try {
      // Build project data from Discovery output
      const projectData = discoveryToValidationProject(opportunity, discoveryOutput);
      const discoveryContext = buildDiscoveryContext(opportunity, discoveryOutput);

      // Run in-memory validation (no Supabase required)
      const result = await orchestrateValidationInMemory(projectData, discoveryContext);

      const duration = Date.now() - validationStart;
      validationDurations[opportunity.programTitle] = duration;

      validations.push({
        programTitle: opportunity.programTitle,
        opportunity,
        validationResult: result,
        status: 'success',
      });

      progress('validation', `✓ Completed ${label}`, `${Math.round(duration / 1000)}s`);
    } catch (error) {
      const duration = Date.now() - validationStart;
      validationDurations[opportunity.programTitle] = duration;

      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[Pipeline] ✗ Validation failed for ${opportunity.programTitle}:`, errorMsg);

      validations.push({
        programTitle: opportunity.programTitle,
        opportunity,
        validationResult: null,
        status: 'error',
        error: errorMsg,
      });

      progress('validation', `✗ Failed ${label}`, errorMsg);
    }
  }

  // ── Final Output ──
  const totalDuration = Date.now() - pipelineStart;
  const successCount = validations.filter(v => v.status === 'success').length;
  const failCount = validations.filter(v => v.status === 'error').length;

  console.log('═══════════════════════════════════════════════════');
  console.log(`  PIPELINE COMPLETE`);
  console.log(`  Duration: ${Math.round(totalDuration / 1000)}s`);
  console.log(`  Discovery: ${discoveryOutput.status}`);
  console.log(`  Validations: ${successCount} success, ${failCount} failed`);
  console.log('═══════════════════════════════════════════════════');

  return {
    discovery: discoveryOutput,
    validations,
    metadata: {
      totalDuration,
      discoveryDuration,
      validationDurations,
      programsSelected: selectedOpportunities.length,
      programsValidated: successCount,
      programsFailed: failCount,
    },
  };
}

// ── Program Selection ──

function selectPrograms(
  input: PipelineInput,
  discoveryOutput: DiscoveryOutput,
  maxValidations: number
): Array<ScoredOpportunity | BlueOceanOpportunity> {
  const selected: Array<ScoredOpportunity | BlueOceanOpportunity> = [];
  const scoredOpps = discoveryOutput.structuredData.scoredOpportunities?.scoredOpportunities || [];
  const blueOceanOpps = discoveryOutput.structuredData.blueOceanResults?.hiddenOpportunities || [];

  if (input.validateAll) {
    // Validate all scored opportunities (up to max)
    for (const opp of scoredOpps) {
      if (selected.length >= maxValidations) break;
      selected.push(opp);
    }
  } else if (input.programsToValidate?.length || input.blueOceanToValidate?.length) {
    // Validate specific programs by index
    for (const idx of input.programsToValidate || []) {
      if (idx >= 0 && idx < scoredOpps.length && selected.length < maxValidations) {
        selected.push(scoredOpps[idx]);
      }
    }
    for (const idx of input.blueOceanToValidate || []) {
      if (idx >= 0 && idx < blueOceanOpps.length && selected.length < maxValidations) {
        selected.push(blueOceanOpps[idx]);
      }
    }
  } else {
    // Default: top 3 scored opportunities
    for (const opp of scoredOpps.slice(0, maxValidations)) {
      selected.push(opp);
    }
  }

  return selected;
}
