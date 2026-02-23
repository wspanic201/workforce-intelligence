#!/usr/bin/env node
/**
 * H-1B LCA Disclosure Data Ingestion
 * Source: DOL OFLC disclosure xlsx (downloaded manually)
 * Aggregates by SOC code + state → demand signals
 *
 * Usage: node scripts/ingest/h1b-lca.mjs [path-to-xlsx]
 * Default: ~/Downloads/LCA_Disclosure_Data_FY2025_Q4.xlsx
 */

import { supabase } from './env-helper.mjs';
import XLSX from 'xlsx';
import { resolve } from 'path';
import { homedir } from 'os';

const DEFAULT_PATH = resolve(homedir(), 'Downloads/LCA_Disclosure_Data_FY2025_Q4.xlsx');
const filePath = process.argv[2] || DEFAULT_PATH;
const FISCAL_YEAR = 'FY2025';

console.log(`📄 Loading H-1B LCA file: ${filePath}`);
console.log(`   This may take a minute for large files...\n`);

// Read xlsx
const workbook = XLSX.readFile(filePath, { type: 'file', dense: false });
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

console.log(`📊 ${rows.length.toLocaleString()} LCA records loaded\n`);

// Show column names from first row to understand the schema
if (rows.length > 0) {
  const cols = Object.keys(rows[0]);
  console.log(`Columns (${cols.length}): ${cols.slice(0, 10).join(', ')}...`);
  
  // Find the right column names (they change between releases)
  const socCol = cols.find(c => /SOC_CODE|SOC_CD/i.test(c)) || 'SOC_CODE';
  const socTitleCol = cols.find(c => /SOC_TITLE|JOB_TITLE/i.test(c)) || 'SOC_TITLE';
  const stateCol = cols.find(c => /WORKSITE_STATE|WORK.*STATE/i.test(c)) || 'WORKSITE_STATE';
  const statusCol = cols.find(c => /CASE_STATUS/i.test(c)) || 'CASE_STATUS';
  const prevWageCol = cols.find(c => /PREVAILING_WAGE$/i.test(c)) || 'PREVAILING_WAGE';
  const wageCol = cols.find(c => /WAGE_RATE_OF_PAY_FROM/i.test(c)) || 'WAGE_RATE_OF_PAY_FROM';
  const employerCol = cols.find(c => /EMPLOYER_NAME/i.test(c)) || 'EMPLOYER_NAME';
  const metroCol = cols.find(c => /WORKSITE.*COUNTY|WORKSITE.*MSA/i.test(c));
  
  console.log(`\nDetected columns:`);
  console.log(`  SOC: ${socCol}`);
  console.log(`  Title: ${socTitleCol}`);
  console.log(`  State: ${stateCol}`);
  console.log(`  Status: ${statusCol}`);
  console.log(`  Prevailing Wage: ${prevWageCol}`);
  console.log(`  Offered Wage: ${wageCol}`);
  console.log(`  Employer: ${employerCol}`);
  console.log(`  Metro: ${metroCol || '(not found)'}\n`);

  // Aggregate by SOC + State
  const agg = {};

  for (const row of rows) {
    const soc = (row[socCol] || '').toString().trim();
    const state = (row[stateCol] || '').toString().trim();
    const status = (row[statusCol] || '').toString().trim().toUpperCase();
    const socTitle = (row[socTitleCol] || '').toString().trim();
    const employer = (row[employerCol] || '').toString().trim();
    const metro = metroCol ? (row[metroCol] || '').toString().trim() : null;

    if (!soc || !state || soc.length < 5) continue;

    // Normalize SOC: "15-1252.00" → "15-1252"
    const normSoc = soc.replace(/\.00$/, '');
    const key = `${normSoc}|${state}`;

    if (!agg[key]) {
      agg[key] = {
        soc_code: normSoc,
        soc_title: socTitle,
        state,
        total: 0,
        certified: 0,
        denied: 0,
        withdrawn: 0,
        prevWages: [],
        offeredWages: [],
        employers: {},
        metros: {},
      };
    }

    const entry = agg[key];
    entry.total++;

    if (status.includes('CERTIFIED')) entry.certified++;
    else if (status.includes('DENIED')) entry.denied++;
    else if (status.includes('WITHDRAWN')) entry.withdrawn++;

    // Collect wages (convert to annual if needed)
    const pw = parseFloat((row[prevWageCol] || '').toString().replace(/[,$]/g, ''));
    const ow = parseFloat((row[wageCol] || '').toString().replace(/[,$]/g, ''));
    if (!isNaN(pw) && pw > 0) entry.prevWages.push(pw < 1000 ? pw * 2080 : pw); // hourly → annual
    if (!isNaN(ow) && ow > 0) entry.offeredWages.push(ow < 1000 ? ow * 2080 : ow);

    // Count employers
    if (employer) entry.employers[employer] = (entry.employers[employer] || 0) + 1;
    if (metro) entry.metros[metro] = (entry.metros[metro] || 0) + 1;
  }

  const entries = Object.values(agg);
  console.log(`📈 ${entries.length.toLocaleString()} SOC × State combinations\n`);

  // Filter to meaningful entries (at least 3 applications)
  const meaningful = entries.filter(e => e.total >= 3);
  console.log(`📈 ${meaningful.length.toLocaleString()} with 3+ applications\n`);

  // Build insert rows
  const dbRows = meaningful.map(e => {
    const median = (arr) => {
      if (arr.length === 0) return null;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return Math.round(sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2);
    };

    const topN = (obj, n) => Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .slice(0, n)
      .map(([k]) => k);

    return {
      soc_code: e.soc_code,
      soc_title: e.soc_title || null,
      state: e.state,
      fiscal_year: FISCAL_YEAR,
      applications_total: e.total,
      applications_certified: e.certified,
      applications_denied: e.denied,
      applications_withdrawn: e.withdrawn,
      median_prevailing_wage: median(e.prevWages),
      median_offered_wage: median(e.offeredWages),
      top_employers: topN(e.employers, 5),
      top_metro_areas: topN(e.metros, 5),
      source: 'dol_lca',
    };
  });

  // Also create national aggregates
  const natAgg = {};
  for (const e of entries) {
    if (!natAgg[e.soc_code]) {
      natAgg[e.soc_code] = {
        soc_code: e.soc_code,
        soc_title: e.soc_title,
        total: 0, certified: 0, denied: 0, withdrawn: 0,
        prevWages: [], offeredWages: [],
        employers: {}, metros: {},
      };
    }
    const n = natAgg[e.soc_code];
    n.total += e.total;
    n.certified += e.certified;
    n.denied += e.denied;
    n.withdrawn += e.withdrawn;
    n.prevWages.push(...e.prevWages);
    n.offeredWages.push(...e.offeredWages);
    for (const [k, v] of Object.entries(e.employers)) n.employers[k] = (n.employers[k] || 0) + v;
    for (const [k, v] of Object.entries(e.metros)) n.metros[k] = (n.metros[k] || 0) + v;
  }

  const natRows = Object.values(natAgg)
    .filter(e => e.total >= 5)
    .map(e => {
      const median = (arr) => {
        if (arr.length === 0) return null;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return Math.round(sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2);
      };
      const topN = (obj, n) => Object.entries(obj)
        .sort(([, a], [, b]) => b - a)
        .slice(0, n)
        .map(([k]) => k);

      return {
        soc_code: e.soc_code,
        soc_title: e.soc_title || null,
        state: 'US',
        fiscal_year: FISCAL_YEAR,
        applications_total: e.total,
        applications_certified: e.certified,
        applications_denied: e.denied,
        applications_withdrawn: e.withdrawn,
        median_prevailing_wage: median(e.prevWages),
        median_offered_wage: median(e.offeredWages),
        top_employers: topN(e.employers, 5),
        top_metro_areas: topN(e.metros, 5),
        source: 'dol_lca',
      };
    });

  const allRows = [...dbRows, ...natRows];
  console.log(`📤 Inserting ${allRows.length.toLocaleString()} records (${dbRows.length} state + ${natRows.length} national)...\n`);

  let inserted = 0;
  for (let i = 0; i < allRows.length; i += 200) {
    const chunk = allRows.slice(i, i + 200);
    const { error } = await supabase
      .from('intel_h1b_demand')
      .upsert(chunk, { onConflict: 'soc_code,state,fiscal_year' });
    if (error) {
      console.error(`  ✗ Batch error: ${error.message}`);
    } else {
      inserted += chunk.length;
    }
  }

  // Update freshness
  await supabase.from('intel_data_freshness').update({
    data_period: `${FISCAL_YEAR} Q4`,
    data_release_date: '2025-02-11',
    next_expected_release: 'May 2025 (FY2025 Q1 new cycle)',
    records_loaded: inserted,
    last_refreshed_at: new Date().toISOString(),
    refreshed_by: 'matt',
    refresh_method: 'manual_import',
    citation_text: `U.S. Department of Labor, OFLC LCA Disclosure Data, ${FISCAL_YEAR} Q4`,
    citation_url: 'https://www.dol.gov/agencies/eta/foreign-labor/performance',
    coverage_notes: `${rows.length.toLocaleString()} individual LCA applications aggregated to ${allRows.length} SOC × state demand signals`,
    known_limitations: 'LCA applications ≠ actual H-1B visas granted; includes renewals and amendments; aggregated to 3+ applications per SOC/state',
    is_stale: false,
    stale_reason: null,
  }).eq('table_name', 'intel_h1b_demand');

  // Show top demand signals
  console.log(`\n🎯 Done! ${inserted.toLocaleString()} H-1B demand records inserted\n`);
  console.log('Top 10 occupations by H-1B demand (national):');
  natRows
    .sort((a, b) => b.applications_total - a.applications_total)
    .slice(0, 10)
    .forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.soc_title || r.soc_code} — ${r.applications_total.toLocaleString()} applications (median offered: $${(r.median_offered_wage || 0).toLocaleString()})`);
    });
}
