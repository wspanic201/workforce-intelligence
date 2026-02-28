#!/usr/bin/env npx tsx
/**
 * Run a single Deep Research report.
 * 
 * Usage:
 *   npx tsx scripts/deep-research/run-single.ts \
 *     --type workforce_opportunity \
 *     --institution "Austin Community College" \
 *     --state Texas \
 *     --region "Austin Metro" \
 *     [--focus "Cybersecurity"] \
 *     [--mini] \
 *     [--max-tools 50]
 */

import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import { runResearchPipeline, type PipelineRunConfig } from '../../lib/ai/deep-research';
import type { ResearchType } from '../../lib/ai/deep-research';

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const type = (getArg('--type') || 'workforce_opportunity') as ResearchType;
const institution = getArg('--institution');
const state = getArg('--state');
const region = getArg('--region');
const focus = getArg('--focus');
const maxTools = getArg('--max-tools');
const mini = process.argv.includes('--mini');

if (!institution || !state) {
  console.error('Usage: npx tsx scripts/deep-research/run-single.ts --institution "Name" --state "State" [--type TYPE] [--region REGION] [--focus FOCUS] [--mini]');
  console.error('\nTypes: workforce_opportunity, federal_grant_finder, state_grant_finder, program_validation, market_landscape, competitor_analysis');
  process.exit(1);
}

const config: PipelineRunConfig = {
  type,
  institution,
  state,
  region,
  programFocus: focus,
  model: mini ? 'o4-mini-deep-research' : 'o3-deep-research',
  maxToolCalls: maxTools ? parseInt(maxTools) : undefined,
  codeInterpreter: type !== 'federal_grant_finder' && type !== 'state_grant_finder',
};

runResearchPipeline(config).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
