#!/usr/bin/env npx tsx
/**
 * WorkforceOS CLI
 * 
 * Client-facing command-line tool for running the WorkforceOS pipeline.
 * 
 * Usage:
 *   npx tsx cli.ts discover                    # Interactive discovery
 *   npx tsx cli.ts discover --college "Kirkwood Community College" \
 *     --city "Cedar Rapids" --state "Iowa"      # Flag-based
 *   npx tsx cli.ts validate                     # Validate from cached discovery
 *   npx tsx cli.ts pipeline                     # Full discovery → validation
 *   npx tsx cli.ts report                       # Regenerate report from cache
 * 
 * Options:
 *   --test           Run in TEST_MODE (Haiku, lower tokens, ~$0.50/run)
 *   --output <dir>   Output directory (default: ~/Desktop)
 *   --json           Also save structured JSON data
 *   --no-blue-ocean  Skip Blue Ocean Scanner (faster, cheaper)
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as readline from 'readline';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// ── Types ──

interface CLIFlags {
  command: string;
  college?: string;
  city?: string;
  state?: string;
  counties?: string;
  cities?: string;
  metro?: string;
  focus?: string;
  context?: string;
  category?: string;
  test: boolean;
  output: string;
  json: boolean;
  blueOcean: boolean;
  top?: number;
  program?: string;
  programs?: number[];
  blueOceanPrograms?: number[];
  cache?: string;
  help: boolean;
}

// ── Constants ──

const VERSION = '0.1.0';
const CACHE_DIR = join(homedir(), '.workforceos');
const DEFAULT_OUTPUT = join(homedir(), 'Desktop');

const BANNER = `
╔══════════════════════════════════════════════════╗
║                                                  ║
║   ██╗    ██╗ ██████╗ ███████╗                    ║
║   ██║    ██║██╔═══██╗██╔════╝                    ║
║   ██║ █╗ ██║██║   ██║███████╗                    ║
║   ██║███╗██║██║   ██║╚════██║                    ║
║   ╚███╔███╔╝╚██████╔╝███████║                    ║
║    ╚══╝╚══╝  ╚═════╝ ╚══════╝                    ║
║                                                  ║
║   WorkforceOS — Program Intelligence Platform    ║
║   v${VERSION}                                         ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`;

const HELP = `
${BANNER}
Commands:
  discover     Run Discovery analysis for an institution
  validate     Run Validation on discovered programs
  pipeline     Run full Discovery → Validation pipeline
  pell-audit   Run Workforce Pell Readiness Audit (lead magnet)
  grant-finder Find, score, and rank federal grants for your college
  report       List/regenerate reports from cached data

Discovery Options:
  --college    Institution name (e.g., "Kirkwood Community College")
  --city       Primary city (e.g., "Cedar Rapids")
  --state      State (e.g., "Iowa")
  --counties   Service area counties (comma-separated)
  --cities     Additional cities (comma-separated, e.g., "Iowa City,Coralville")
  --metro      Metro area label (e.g., "Cedar Rapids-Iowa City Corridor")
  --focus      Focus areas (e.g., "Healthcare, Manufacturing, Technology")
  --category   Category Deep Dive — constrain ALL phases to one category
               (e.g., "Business & Professional Development", "Healthcare")
  --context    Additional context about the institution
  --url        Institution website URL (for pell-audit)

Pell Audit Options:
  --college    Institution name
  --state      State (required)
  --city       City (helps scope regional data)
  --url        Institution website URL (optional — we'll find it)
  --context    Additional context

Validation Options:
  --top <n>    Validate top N programs from discovery (default: 1)
  --program    Validate a specific program by name
  --programs   Specific scored program indices (comma-separated, 0-based)
  --bo         Specific blue ocean indices (comma-separated, 0-based)
  --cache      Path to cached discovery JSON

General Options:
  --test       Run in TEST_MODE (cheaper: Haiku model, lower tokens)
  --output     Output directory (default: ~/Desktop)
  --json       Also save structured JSON data
  --no-blue-ocean  Skip Blue Ocean Scanner phase
  --help       Show this help

Examples:
  npx tsx cli.ts discover
  npx tsx cli.ts discover --college "Kirkwood" --city "Cedar Rapids" --state "Iowa"
  npx tsx cli.ts pell-audit --college "Wake Tech" --city "Raleigh" --state "North Carolina"
  npx tsx cli.ts compliance-gap --college "Wake Tech" --state "North Carolina"
  npx tsx cli.ts grant-finder --college "Kirkwood Community College" --state "Iowa" --city "Cedar Rapids" --focus "manufacturing,healthcare,IT"
  npx tsx cli.ts validate --top 3
  npx tsx cli.ts pipeline --college "Kirkwood" --city "Cedar Rapids" --state "Iowa" --top 2
  npx tsx cli.ts report
`;

// ── Argument Parsing ──

function parseArgs(): CLIFlags {
  const args = process.argv.slice(2);
  const flags: CLIFlags = {
    command: args[0] || '',
    test: false,
    output: DEFAULT_OUTPUT,
    json: false,
    blueOcean: true,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--college': flags.college = next; i++; break;
      case '--city': flags.city = next; i++; break;
      case '--state': flags.state = next; i++; break;
      case '--counties': flags.counties = next; i++; break;
      case '--cities': flags.cities = next; i++; break;
      case '--metro': flags.metro = next; i++; break;
      case '--focus': flags.focus = next; i++; break;
      case '--category': flags.category = next; i++; break;
      case '--context': flags.context = next; i++; break;
      case '--url': (flags as any).url = next; i++; break;
      case '--test': flags.test = true; break;
      case '--output': flags.output = next; i++; break;
      case '--json': flags.json = true; break;
      case '--no-blue-ocean': flags.blueOcean = false; break;
      case '--top': flags.top = parseInt(next); i++; break;
      case '--program': flags.program = next; i++; break;
      case '--programs': flags.programs = next.split(',').map(Number); i++; break;
      case '--bo': flags.blueOceanPrograms = next.split(',').map(Number); i++; break;
      case '--cache': flags.cache = next; i++; break;
      case '--help': case '-h': flags.help = true; break;
    }
  }

  return flags;
}

// ── Interactive Prompts ──

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string, defaultValue?: string): Promise<string> {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  return new Promise((resolve) => {
    rl.question(`  ${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

function askNumber(question: string, defaultValue: number): Promise<number> {
  return new Promise((resolve) => {
    rl.question(`  ${question} (${defaultValue}): `, (answer) => {
      const num = parseInt(answer.trim());
      resolve(isNaN(num) ? defaultValue : num);
    });
  });
}

function askConfirm(question: string, defaultYes = true): Promise<boolean> {
  const hint = defaultYes ? 'Y/n' : 'y/N';
  return new Promise((resolve) => {
    rl.question(`  ${question} (${hint}): `, (answer) => {
      const a = answer.trim().toLowerCase();
      if (a === '') resolve(defaultYes);
      else resolve(a === 'y' || a === 'yes');
    });
  });
}

// ── Utilities ──

function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
}

function cacheKey(college: string): string {
  return college.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function saveCacheData(key: string, data: any) {
  ensureCacheDir();
  const path = join(CACHE_DIR, `${key}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2));
  return path;
}

function loadCacheData(keyOrPath: string): any | null {
  // Try as direct path first
  if (existsSync(keyOrPath)) {
    try { return JSON.parse(readFileSync(keyOrPath, 'utf8')); } catch { return null; }
  }
  // Try as cache key
  const path = join(CACHE_DIR, `${keyOrPath}.json`);
  if (existsSync(path)) {
    try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
  }
  return null;
}

function listCacheFiles(): string[] {
  if (!existsSync(CACHE_DIR)) return [];
  const { readdirSync } = require('fs');
  return readdirSync(CACHE_DIR)
    .filter((f: string) => f.endsWith('.json'))
    .map((f: string) => f.replace('.json', ''));
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-');
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
}

function log(msg: string) { console.log(`  ${msg}`); }
function header(msg: string) { console.log(`\n  ── ${msg} ──\n`); }
function success(msg: string) { console.log(`  ✅ ${msg}`); }
function warn(msg: string) { console.log(`  ⚠️  ${msg}`); }
function fail(msg: string) { console.log(`  ❌ ${msg}`); }

// ── Commands ──

async function runDiscover(flags: CLIFlags) {
  header('DISCOVERY — What should we build?');

  // Gather institution info (interactive or from flags)
  const college = flags.college || await ask('Institution name', 'Kirkwood Community College');
  const city = flags.city || await ask('Primary city');
  const state = flags.state || await ask('State');
  const additionalCities = flags.cities
    ? flags.cities.split(',').map(c => c.trim())
    : (await ask('Additional cities (comma-separated, or Enter to skip)')).split(',').map(c => c.trim()).filter(Boolean);
  const counties = flags.counties || await ask('Service area counties (comma-separated)');
  const metro = flags.metro || (additionalCities.length > 0
    ? await ask('Metro area label', `${city}-${additionalCities[0]} Corridor`)
    : `${city}, ${state}`);
  const focus = flags.focus || await ask('Focus areas (e.g., Healthcare, Manufacturing)', 'All sectors');
  const context = flags.context || await ask('Additional context (or Enter to skip)');

  // Confirm
  console.log('');
  log('┌─────────────────────────────────────────────');
  log(`│ Institution:  ${college}`);
  log(`│ Primary City: ${city}, ${state}`);
  if (additionalCities.length > 0) log(`│ Additional:   ${additionalCities.join(', ')}`);
  log(`│ Metro Area:   ${metro}`);
  log(`│ Counties:     ${counties || '(not specified)'}`);
  log(`│ Focus Areas:  ${focus}`);
  if (flags.category) log(`│ 📌 CATEGORY:  ${flags.category}`);
  if (context) log(`│ Context:      ${context.slice(0, 80)}${context.length > 80 ? '...' : ''}`);
  log(`│ Blue Ocean:   ${flags.blueOcean ? 'Enabled' : 'Disabled'}`);
  log(`│ Mode:         ${flags.test ? 'TEST ($0.50)' : 'PRODUCTION (~$5-8)'}`);
  log('└─────────────────────────────────────────────');
  console.log('');

  const confirmed = await askConfirm('Run Discovery?');
  if (!confirmed) {
    log('Cancelled.');
    return null;
  }

  // Set test mode if requested
  if (flags.test) {
    process.env.TEST_MODE = 'true';
    log('🧪 TEST MODE — using Haiku model with lower token limits');
  }

  console.log('');
  log('Starting Discovery pipeline...');
  console.log('');

  const { runDiscovery } = await import('./lib/stages/discovery/orchestrator');

  const startTime = Date.now();
  const result = await runDiscovery(
    {
      collegeName: college,
      serviceRegion: {
        primaryCity: city,
        additionalCities,
        metroArea: metro,
        counties,
        state,
      },
      focusAreas: focus !== 'All sectors' ? focus : undefined,
      additionalContext: context || undefined,
      category: flags.category || undefined,
    },
    (event) => {
      const icon = event.status === 'complete' ? '✅' : event.status === 'error' ? '❌' : '⏳';
      log(`${icon} Phase ${event.phase}/6: ${event.phaseName} — ${event.message} [${event.elapsed}s]`);
    }
  );

  const duration = Math.round((Date.now() - startTime) / 1000);

  // Save results
  console.log('');
  header('RESULTS');

  const key = cacheKey(college);
  const cachePath = saveCacheData(key, {
    input: { college, city, state, additionalCities, metro, counties, focus, context },
    output: result,
    timestamp: new Date().toISOString(),
  });

  const opps = result.structuredData.scoredOpportunities?.scoredOpportunities || [];
  const blueOcean = result.structuredData.blueOceanResults?.hiddenOpportunities || [];

  log(`Status:     ${result.status}`);
  log(`Duration:   ${formatDuration(duration)}`);
  log(`Searches:   ${result.metadata.totalSearches}`);
  log(`Programs:   ${opps.length} scored + ${blueOcean.length} blue ocean`);
  log(`Words:      ${result.brief?.wordCount || 0}`);
  log(`Pages:      ~${result.brief?.pageEstimate || 0}`);

  if (opps.length > 0) {
    console.log('');
    log('TOP OPPORTUNITIES:');
    opps.forEach((opp, i) => {
      const tier = opp.tier.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      log(`  ${i + 1}. ${opp.programTitle} (${opp.scores.composite}/10) — ${tier}`);
    });
  }

  if (blueOcean.length > 0) {
    console.log('');
    log('HIDDEN OPPORTUNITIES (Blue Ocean):');
    blueOcean.forEach((opp, i) => {
      const method = opp.discoveryMethod.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      log(`  B${i + 1}. ${opp.programTitle} (${opp.scores.composite}/10) — ${method}`);
    });
  }

  // Save report
  if (result.brief) {
    const reportName = `${sanitizeFilename(college)}-Discovery-Brief-${timestamp()}.md`;
    const reportPath = join(flags.output, reportName);
    writeFileSync(reportPath, result.brief.markdown);
    success(`Report saved: ${reportPath}`);
  }

  if (flags.json) {
    const jsonName = `${sanitizeFilename(college)}-Discovery-Data-${timestamp()}.json`;
    const jsonPath = join(flags.output, jsonName);
    writeFileSync(jsonPath, JSON.stringify(result.structuredData, null, 2));
    success(`JSON data saved: ${jsonPath}`);
  }

  success(`Cache saved: ${cachePath}`);

  return { result, key };
}

async function runValidate(flags: CLIFlags) {
  header('VALIDATION — Should we build it?');

  // Load discovery data
  let cacheData: any = null;
  let key = '';

  if (flags.cache) {
    cacheData = loadCacheData(flags.cache);
    if (!cacheData) {
      fail(`Cache file not found: ${flags.cache}`);
      return;
    }
    key = flags.cache;
  } else {
    // List available caches
    const caches = listCacheFiles();
    if (caches.length === 0) {
      fail('No cached Discovery data found. Run "discover" first.');
      return;
    }

    log('Available Discovery caches:');
    caches.forEach((c, i) => log(`  ${i + 1}. ${c}`));
    console.log('');

    const choice = await askNumber('Select cache (number)', 1);
    key = caches[choice - 1];
    if (!key) {
      fail('Invalid selection.');
      return;
    }
    cacheData = loadCacheData(key);
  }

  if (!cacheData?.output) {
    fail('Cache data is invalid or incomplete.');
    return;
  }

  const discoveryOutput = cacheData.output;
  const college = cacheData.input?.college || 'Unknown Institution';
  const scoredOpps = discoveryOutput.structuredData?.scoredOpportunities?.scoredOpportunities || [];
  const blueOceanOpps = discoveryOutput.structuredData?.blueOceanResults?.hiddenOpportunities || [];

  if (scoredOpps.length === 0 && blueOceanOpps.length === 0) {
    fail('No programs found in Discovery data.');
    return;
  }

  // Show available programs
  log(`Institution: ${college}`);
  console.log('');
  log('SCORED OPPORTUNITIES:');
  scoredOpps.forEach((opp: any, i: number) => {
    log(`  ${i}. ${opp.programTitle} (${opp.scores.composite}/10)`);
  });
  if (blueOceanOpps.length > 0) {
    console.log('');
    log('BLUE OCEAN OPPORTUNITIES:');
    blueOceanOpps.forEach((opp: any, i: number) => {
      log(`  B${i}. ${opp.programTitle} (${opp.scores.composite}/10)`);
    });
  }
  console.log('');

  // Select programs to validate
  let programIndices: number[] = flags.programs || [];
  let boIndices: number[] = flags.blueOceanPrograms || [];

  if (flags.program) {
    // Search by name
    const searchLower = flags.program.toLowerCase();
    const scoredMatch = scoredOpps.findIndex((o: any) => o.programTitle.toLowerCase().includes(searchLower));
    const boMatch = blueOceanOpps.findIndex((o: any) => o.programTitle.toLowerCase().includes(searchLower));
    if (scoredMatch >= 0) programIndices = [scoredMatch];
    else if (boMatch >= 0) boIndices = [boMatch];
    else {
      fail(`No program matching "${flags.program}" found.`);
      return;
    }
  } else if (flags.top) {
    programIndices = Array.from({ length: Math.min(flags.top, scoredOpps.length) }, (_, i) => i);
  } else if (programIndices.length === 0 && boIndices.length === 0) {
    // Interactive selection
    const input = await ask('Programs to validate (e.g., "0,1" or "B0" or "top 3")');
    const inputLower = input.toLowerCase();

    if (inputLower.startsWith('top')) {
      const n = parseInt(inputLower.replace('top', '').trim()) || 3;
      programIndices = Array.from({ length: Math.min(n, scoredOpps.length) }, (_, i) => i);
    } else {
      const parts = input.split(',').map(s => s.trim());
      for (const part of parts) {
        if (part.toLowerCase().startsWith('b')) {
          boIndices.push(parseInt(part.slice(1)));
        } else {
          programIndices.push(parseInt(part));
        }
      }
    }
  }

  const totalValidations = programIndices.length + boIndices.length;
  if (totalValidations === 0) {
    fail('No programs selected.');
    return;
  }

  // Show selection
  log('Selected for validation:');
  for (const idx of programIndices) {
    if (scoredOpps[idx]) log(`  → ${scoredOpps[idx].programTitle}`);
  }
  for (const idx of boIndices) {
    if (blueOceanOpps[idx]) log(`  → ${blueOceanOpps[idx].programTitle} (Blue Ocean)`);
  }

  const estTime = totalValidations * 8;
  const estCost = flags.test ? totalValidations * 0.5 : totalValidations * 5;
  console.log('');
  log(`Estimated time: ~${formatDuration(estTime * 60)}`);
  log(`Estimated cost: ~$${estCost.toFixed(2)} ${flags.test ? '(TEST MODE)' : '(production)'}`);
  console.log('');

  const confirmed = await askConfirm('Run Validation?');
  if (!confirmed) {
    log('Cancelled.');
    return;
  }

  if (flags.test) {
    process.env.TEST_MODE = 'true';
    log('🧪 TEST MODE — using Haiku model');
  }

  console.log('');
  log('Starting Validation pipeline...');
  console.log('');

  const { runPipeline } = await import('./lib/stages/pipeline');

  const result = await runPipeline({
    discoveryInput: {
      collegeName: college,
      serviceRegion: cacheData.input ? {
        primaryCity: cacheData.input.city,
        additionalCities: cacheData.input.additionalCities || [],
        metroArea: cacheData.input.metro || '',
        counties: cacheData.input.counties || '',
        state: cacheData.input.state || '',
      } : undefined,
    },
    discoveryOutput,
    programsToValidate: programIndices,
    blueOceanToValidate: boIndices,
    maxValidations: totalValidations,
  }, (event) => {
    log(`[${event.stage}] ${event.message} [${event.elapsed}s]`);
  });

  // Results
  console.log('');
  header('VALIDATION RESULTS');

  log(`Duration:    ${formatDuration(Math.round(result.metadata.totalDuration / 1000))}`);
  log(`Validated:   ${result.metadata.programsValidated}/${result.metadata.programsSelected}`);
  log(`Failed:      ${result.metadata.programsFailed}`);
  console.log('');

  for (const v of result.validations) {
    if (v.status === 'success' && v.validationResult?.programScore) {
      const score = v.validationResult.programScore;
      const emoji = score.compositeScore >= 7 ? '🟢' : score.compositeScore >= 5 ? '🟡' : '🔴';
      log(`${emoji} ${v.programTitle}: ${score.compositeScore}/10 — ${score.recommendation}`);
    } else if (v.status === 'error') {
      fail(`${v.programTitle}: ${v.error}`);
    }
  }

  // Save validation reports
  for (const v of result.validations) {
    if (v.status === 'success' && v.validationResult?.report) {
      const reportName = `${sanitizeFilename(college)}-${sanitizeFilename(v.programTitle)}-Validation-${timestamp()}.md`;
      const reportPath = join(flags.output, reportName);
      writeFileSync(reportPath, v.validationResult.report);
      success(`Report: ${reportPath}`);
    }
  }

  if (flags.json) {
    const jsonName = `${sanitizeFilename(college)}-Validation-Results-${timestamp()}.json`;
    const jsonPath = join(flags.output, jsonName);
    writeFileSync(jsonPath, JSON.stringify(result, null, 2));
    success(`JSON: ${jsonPath}`);
  }

  // Update cache with validation results
  cacheData.validations = cacheData.validations || [];
  cacheData.validations.push({
    timestamp: new Date().toISOString(),
    results: result.validations.map(v => ({
      program: v.programTitle,
      status: v.status,
      score: v.validationResult?.programScore?.compositeScore,
      recommendation: v.validationResult?.programScore?.recommendation,
    })),
  });
  saveCacheData(key, cacheData);
}

async function runFullPipeline(flags: CLIFlags) {
  header('FULL PIPELINE — Discovery → Validation');

  // Run discovery first
  const discoveryResult = await runDiscover(flags);
  if (!discoveryResult) return;

  const { result: discovery, key } = discoveryResult;

  if (discovery.status === 'error') {
    fail('Discovery failed. Cannot proceed to Validation.');
    return;
  }

  const scoredOpps = discovery.structuredData.scoredOpportunities?.scoredOpportunities || [];
  if (scoredOpps.length === 0) {
    warn('No opportunities found. Skipping Validation.');
    return;
  }

  console.log('');
  header('PROCEEDING TO VALIDATION');

  const top = flags.top || await askNumber('How many top programs to validate?', 1);

  // Reuse the validate flow with the fresh cache
  flags.cache = key;
  flags.top = top;
  await runValidate(flags);
}

async function showReports(flags: CLIFlags) {
  header('CACHED DISCOVERY DATA');

  const caches = listCacheFiles();
  if (caches.length === 0) {
    log('No cached data found. Run "discover" to get started.');
    return;
  }

  for (const key of caches) {
    const data = loadCacheData(key);
    if (!data) continue;

    const college = data.input?.college || key;
    const ts = data.timestamp ? new Date(data.timestamp).toLocaleDateString() : 'unknown';
    const opps = data.output?.structuredData?.scoredOpportunities?.scoredOpportunities?.length || 0;
    const bo = data.output?.structuredData?.blueOceanResults?.hiddenOpportunities?.length || 0;
    const validationCount = data.validations?.length || 0;

    log(`📋 ${college}`);
    log(`   Date: ${ts} | Programs: ${opps} scored + ${bo} blue ocean | Validations: ${validationCount}`);
    log(`   Cache: ~/.workforceos/${key}.json`);
    console.log('');
  }

  const action = await ask('Action: [v]alidate, [r]egenerate brief, [d]elete, or Enter to quit');
  
  switch (action.toLowerCase()) {
    case 'v':
    case 'validate':
      await runValidate(flags);
      break;
    case 'r':
    case 'regenerate': {
      const cacheChoice = await askNumber('Which cache? (number)', 1);
      const key = caches[cacheChoice - 1];
      if (key) {
        const data = loadCacheData(key);
        if (data?.output?.brief?.markdown) {
          const college = data.input?.college || key;
          const reportName = `${sanitizeFilename(college)}-Discovery-Brief-${timestamp()}.md`;
          const reportPath = join(flags.output, reportName);
          writeFileSync(reportPath, data.output.brief.markdown);
          success(`Report regenerated: ${reportPath}`);
        } else {
          fail('No brief found in cache.');
        }
      }
      break;
    }
    case 'd':
    case 'delete': {
      const cacheChoice = await askNumber('Which cache? (number)', 1);
      const key = caches[cacheChoice - 1];
      if (key) {
        const confirmed = await askConfirm(`Delete ${key}?`, false);
        if (confirmed) {
          const { unlinkSync } = require('fs');
          unlinkSync(join(CACHE_DIR, `${key}.json`));
          success(`Deleted ${key}`);
        }
      }
      break;
    }
  }
}

// ── Pell Audit Command ──

async function runPellAudit(flags: CLIFlags) {
  header('WORKFORCE PELL READINESS AUDIT');
  log('Scrapes an institution\'s website, catalogs programs, and scores');
  log('each against Workforce Pell eligibility criteria (effective July 1, 2026).');
  console.log('');

  const college = flags.college || await ask('Institution name');
  const state = flags.state || await ask('State');
  const city = flags.city || await ask('City (helps scope regional data)');
  const url = (flags as any).url || await ask('Institution website URL (or Enter to auto-find)');
  const context = flags.context || await ask('Additional context (or Enter to skip)');

  if (!college || !state) {
    fail('Institution name and state are required.');
    return;
  }

  // Confirm
  console.log('');
  log('┌─────────────────────────────────────────────');
  log(`│ Institution:  ${college}`);
  log(`│ Location:     ${city ? `${city}, ` : ''}${state}`);
  log(`│ Website:      ${url || '(auto-detect)'}`);
  if (context) log(`│ Context:      ${context.slice(0, 80)}`);
  log(`│ Mode:         ${flags.test ? 'TEST' : 'PRODUCTION (~$2-4)'}`);
  log('└─────────────────────────────────────────────');
  console.log('');

  const confirmed = await askConfirm('Run Pell Audit?');
  if (!confirmed) {
    log('Cancelled.');
    return;
  }

  if (flags.test) {
    process.env.TEST_MODE = 'true';
    log('🧪 TEST MODE — using Haiku model with lower token limits');
  }

  console.log('');
  log('Starting Pell Audit pipeline...');
  console.log('');

  const { runPellAudit: runAudit } = await import('./lib/stages/pell-audit/orchestrator');

  const startTime = Date.now();
  const result = await runAudit(
    {
      collegeName: college,
      collegeUrl: url || undefined,
      state,
      city: city || undefined,
      additionalContext: context || undefined,
    },
    (event) => {
      const icon = event.status === 'complete' ? '✅' : event.status === 'error' ? '❌' : '⏳';
      log(`${icon} Phase ${event.phase}/5: ${event.phaseName} — ${event.message} [${event.elapsed}s]`);
    }
  );

  const duration = Math.round((Date.now() - startTime) / 1000);

  // Save results
  console.log('');
  header('RESULTS');

  if (result.status === 'error') {
    fail('Pell Audit failed. Check errors above.');
    return;
  }

  // Save report
  if (result.report) {
    const sanitized = sanitizeFilename(college);
    const reportPath = join(flags.output, `Pell-Audit-${sanitized}-${timestamp()}.md`);
    writeFileSync(reportPath, result.report.fullMarkdown);
    success(`Report saved: ${reportPath}`);

    if (flags.json) {
      const jsonPath = join(flags.output, `Pell-Audit-${sanitized}-${timestamp()}.json`);
      writeFileSync(jsonPath, JSON.stringify(result, null, 2));
      success(`JSON data saved: ${jsonPath}`);
    }

    // Cache for later use
    const key = `pell-${cacheKey(college)}`;
    saveCacheData(key, {
      input: { college, state, city, url, context },
      output: result,
      timestamp: new Date().toISOString(),
    });
    success(`Cached: ~/.workforceos/${key}.json`);
  }

  // Summary
  console.log('');
  log('┌─────────────────────────────────────────────');
  log(`│ Status:              ${result.status.toUpperCase()}`);
  log(`│ Duration:            ${formatDuration(duration)}`);
  log(`│ Programs Found:      ${result.report?.metadata.totalPrograms || 0}`);
  log(`│ Pell-Ready/Likely:   ${result.report?.metadata.pellReadyCount || 0}`);
  log(`│ Gap Opportunities:   ${result.report?.metadata.gapsIdentified || 0}`);
  log(`│ Data Sources:        ${result.report?.metadata.dataSources || 0}`);
  log(`│ Errors:              ${result.metadata.errors.length}`);
  log('└─────────────────────────────────────────────');

  if (result.metadata.errors.length > 0) {
    console.log('');
    warn('Errors during run:');
    for (const err of result.metadata.errors) {
      log(`  - ${err}`);
    }
  }

  console.log('');
  success(`Pell Audit complete in ${formatDuration(duration)}`);
}

// ── Grant Finder Command ──

async function runGrantFinder(flags: CLIFlags) {
  header('GRANT FINDER — Federal & Foundation Grants for Your College');
  log('Searches Grants.gov and the web for grant opportunities,');
  log('scores each for fit, researches past awards, and writes a');
  log('comprehensive Grant Intelligence Report.');
  console.log('');

  const college = flags.college || await ask('Institution name');
  const state = flags.state || await ask('State');
  const city = flags.city || await ask('City');
  const focusInput = flags.focus || await ask('Program focus areas (comma-separated, or Enter to skip)');
  const focusAreas = focusInput
    ? focusInput.split(',').map((f: string) => f.trim()).filter(Boolean)
    : [];

  if (!college || !state) {
    fail('Institution name and state are required.');
    return;
  }

  // Confirm
  console.log('');
  log('┌─────────────────────────────────────────────');
  log(`│ Institution:  ${college}`);
  log(`│ Location:     ${city ? `${city}, ` : ''}${state}`);
  log(`│ Focus Areas:  ${focusAreas.length > 0 ? focusAreas.join(', ') : '(all workforce areas)'}`);
  log(`│ Mode:         ${flags.test ? 'TEST' : 'PRODUCTION (~$3-6)'}`);
  log('└─────────────────────────────────────────────');
  console.log('');

  const confirmed = await askConfirm('Run Grant Finder?');
  if (!confirmed) {
    log('Cancelled.');
    return;
  }

  if (flags.test) {
    process.env.TEST_MODE = 'true';
    log('🧪 TEST MODE — using Haiku model with lower token limits');
  }

  console.log('');
  log('Starting Grant Finder pipeline...');
  log('This takes 5-10 minutes. Grab a coffee ☕');
  console.log('');

  const { runGrantFinder: runFinder } = await import('./lib/stages/grant-finder/orchestrator');

  const startTime = Date.now();
  const result = await runFinder(
    {
      collegeName: college,
      state,
      city: city || undefined,
      programFocusAreas: focusAreas.length > 0 ? focusAreas : undefined,
    },
    (event) => {
      const icon = event.status === 'complete' ? '✅' : event.status === 'error' ? '❌' : '⏳';
      log(`${icon} Agent ${event.agent}/5: ${event.agentName} — ${event.message} [${event.elapsed}s]`);
    }
  );

  const duration = Math.round((Date.now() - startTime) / 1000);

  // Save results
  console.log('');
  header('RESULTS');

  if (!result.report && result.status === 'error') {
    fail('Grant Finder failed. Check errors above.');
    if (result.errors.length > 0) {
      for (const err of result.errors) warn(`  - ${err}`);
    }
    return;
  }

  // Save report
  const sanitized = sanitizeFilename(college);

  if (result.report) {
    const reportPath = join(flags.output, `Grant-Intelligence-${sanitized}-${timestamp()}.md`);
    writeFileSync(reportPath, result.report.fullMarkdown);
    success(`Report saved: ${reportPath}`);
  }

  if (flags.json && result.grants) {
    const jsonPath = join(flags.output, `Grant-Intelligence-${sanitized}-${timestamp()}.json`);
    writeFileSync(jsonPath, JSON.stringify(result, null, 2));
    success(`JSON data saved: ${jsonPath}`);
  }

  // Cache
  const key = `grant-finder-${cacheKey(college)}`;
  saveCacheData(key, {
    input: { college, state, city, focusAreas },
    output: result,
    timestamp: new Date().toISOString(),
  });
  success(`Cached: ~/.workforceos/${key}.json`);

  // Summary
  console.log('');
  log('┌─────────────────────────────────────────────');
  log(`│ Status:                ${result.status.toUpperCase()}`);
  log(`│ Duration:              ${formatDuration(duration)}`);
  log(`│ Grants Reviewed:       ${result.metadata.grantsFound}`);
  log(`│ Priority Grants:       ${result.report?.metadata.priorityGrantCount ?? 0}`);
  log(`│ Strategic Grants:      ${result.report?.metadata.strategicGrantCount ?? 0}`);
  log(`│ Monitor List:          ${result.report?.metadata.monitorGrantCount ?? 0}`);
  if (result.report) {
    log(`│ Report Length:         ${result.report.wordCount} words (~${result.report.pageEstimate} pages)`);
    log(`│ Top Grant:             ${result.report.metadata.topGrantTitle}`);
  }
  log(`│ Errors:                ${result.errors.length}`);
  log('└─────────────────────────────────────────────');

  if (result.errors.length > 0) {
    console.log('');
    warn('Errors during run:');
    for (const err of result.errors) {
      log(`  - ${err}`);
    }
  }

  // Show top grants
  if (result.grants && result.grants.length > 0) {
    console.log('');
    log('TOP GRANT OPPORTUNITIES:');
    result.grants.slice(0, 8).forEach((grant: any, i: number) => {
      const tierIcon = grant.matchTier === 'priority' ? '🟢' : grant.matchTier === 'strategic' ? '🔵' : grant.matchTier === 'monitor' ? '🟡' : '⚪';
      const award = grant.awardCeiling ? ` — up to $${(grant.awardCeiling / 1000).toFixed(0)}K` : '';
      log(`  ${tierIcon} ${i + 1}. ${grant.title || grant.id} (${grant.scores?.composite?.toFixed(1) || '?'}/10)${award}`);
    });
  }

  console.log('');
  success(`Grant Finder complete in ${formatDuration(duration)}`);
}

// ── State-Mandated Program Gap Command ──

async function runComplianceGap(flags: CLIFlags) {
  header('COMPLIANCE GAP REPORT');
  log('Scans state regulatory codes for ALL mandated training programs,');
  log('cross-references against the college\'s current offerings, and');
  log('sizes the revenue opportunity for every compliance gap.');
  console.log('');

  const college = flags.college || await ask('Institution name');
  const state = flags.state || await ask('State');
  const city = flags.city || await ask('City (helps scope regional demand)');
  const url = (flags as any).url || await ask('Institution website URL (or Enter to auto-find)');

  if (!college || !state) {
    fail('Institution name and state are required.');
    return;
  }

  // Confirm
  console.log('');
  log('┌─────────────────────────────────────────────');
  log(`│ Institution:  ${college}`);
  log(`│ Location:     ${city ? `${city}, ` : ''}${state}`);
  log(`│ Website:      ${url || '(auto-detect)'}`);
  log(`│ Mode:         ${flags.test ? 'TEST' : 'PRODUCTION (~$2-5)'}`);
  log('└─────────────────────────────────────────────');
  console.log('');

  const confirmed = await askConfirm('Run State-Mandated Program Gap Analysis?');
  if (!confirmed) {
    log('Cancelled.');
    return;
  }

  if (flags.test) {
    process.env.TEST_MODE = 'true';
    log('🧪 TEST MODE — using Haiku model with lower token limits');
  }

  console.log('');
  log('Starting State-Mandated Program Gap pipeline...');
  console.log('');

  const { runComplianceGap: runGap } = await import('./lib/stages/compliance-gap/orchestrator');

  const startTime = Date.now();
  const result = await runGap(
    {
      collegeName: college,
      state,
      city: city || undefined,
      siteUrl: url || undefined,
    },
    (event) => {
      const icon = event.status === 'complete' ? '✅' : event.status === 'error' ? '❌' : '⏳';
      log(`${icon} Agent ${event.agent}/3: ${event.agentName} — ${event.message} [${event.elapsed}s]`);
    }
  );

  const duration = Math.round((Date.now() - startTime) / 1000);

  // Save results
  console.log('');
  header('RESULTS');

  if (!result.report) {
    fail('State-Mandated Program Gap Analysis failed. Check errors above.');
    if (result.metadata.errors.length > 0) {
      for (const err of result.metadata.errors) warn(`  - ${err}`);
    }
    return;
  }

  // Save report
  const sanitized = sanitizeFilename(college);
  const reportPath = join(flags.output, `Compliance-Gap-${sanitized}-${timestamp()}.md`);
  writeFileSync(reportPath, result.report);
  success(`Report saved: ${reportPath}`);

  if (flags.json) {
    const jsonPath = join(flags.output, `Compliance-Gap-${sanitized}-${timestamp()}.json`);
    writeFileSync(jsonPath, JSON.stringify(result, null, 2));
    success(`JSON data saved: ${jsonPath}`);
  }

  // Cache
  const key = `compliance-gap-${cacheKey(college)}`;
  saveCacheData(key, {
    input: { college, state, city, url },
    output: result,
    timestamp: new Date().toISOString(),
  });
  success(`Cached: ~/.workforceos/${key}.json`);

  // Summary
  console.log('');
  log('┌─────────────────────────────────────────────');
  log(`│ Status:                ${result.metadata.errors.length === 0 ? 'SUCCESS' : 'PARTIAL'}`);
  log(`│ Duration:              ${formatDuration(duration)}`);
  log(`│ Mandated Programs:     ${result.stats.totalMandated}`);
  log(`│ Already Offered:       ${result.stats.currentlyOffered}`);
  log(`│ State-Mandated Program Gaps:       ${result.stats.gaps}`);
  log(`│ High-Priority Gaps:    ${result.stats.highPriorityGaps}`);
  log(`│ Est. Revenue Gap:      $${result.stats.estimatedAnnualRevenue.toLocaleString()}/yr`);
  log(`│ Errors:                ${result.metadata.errors.length}`);
  log('└─────────────────────────────────────────────');

  if (result.metadata.errors.length > 0) {
    console.log('');
    warn('Errors during run:');
    for (const err of result.metadata.errors) {
      log(`  - ${err}`);
    }
  }

  if (result.gaps.length > 0) {
    console.log('');
    log('TOP COMPLIANCE GAPS:');
    result.gaps.slice(0, 5).forEach((gap, i) => {
      const tier = gap.priorityTier === 'high' ? '🔴' : gap.priorityTier === 'medium' ? '🟡' : '🟢';
      log(`  ${tier} ${i + 1}. ${gap.mandatedProgram.occupation} — $${Math.round(gap.estimatedAnnualRevenue / 1000)}K/yr`);
    });
  }

  console.log('');
  success(`State-Mandated Program Gap Analysis complete in ${formatDuration(duration)}`);
}

// ── Main ──

async function main() {
  const flags = parseArgs();

  if (flags.help || !flags.command) {
    console.log(HELP);
    process.exit(0);
  }

  console.log(BANNER);

  try {
    switch (flags.command) {
      case 'discover':
      case 'discovery':
      case 'd':
        await runDiscover(flags);
        break;

      case 'validate':
      case 'validation':
      case 'v':
        await runValidate(flags);
        break;

      case 'pipeline':
      case 'pipe':
      case 'p':
        await runFullPipeline(flags);
        break;

      case 'report':
      case 'reports':
      case 'r':
        await showReports(flags);
        break;

      case 'pell-audit':
      case 'pell':
      case 'audit':
        await runPellAudit(flags);
        break;

      case 'compliance-gap':
      case 'compliance':
      case 'gap':
        await runComplianceGap(flags);
        break;

      case 'grant-finder':
      case 'grants':
      case 'grant':
        await runGrantFinder(flags);
        break;

      default:
        fail(`Unknown command: ${flags.command}`);
        console.log('Run with --help for usage.');
    }
  } catch (error) {
    console.error('');
    fail(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
