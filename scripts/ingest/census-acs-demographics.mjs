#!/usr/bin/env node
/**
 * Census ACS 5-Year Demographics Ingestion
 * Pulls county-level population, education, income, poverty
 * For all states that have community colleges in our intel_institutions table
 */

import { supabase } from './env-helper.mjs';

const ACS_BASE = 'https://api.census.gov/data/2022/acs/acs5';
const ACS_YEAR = '2022';

// Variables we need:
// B01003_001E = Total population
// B15003_022E = Bachelor's degree (25+)
// B15003_023E = Master's degree
// B15003_024E = Professional school degree
// B15003_025E = Doctorate degree
// B17001_002E = Income below poverty level
// B19013_001E = Median household income
// B23025_002E = In labor force (16+)
// B23025_005E = Unemployed (in labor force)
const VARS = 'NAME,B01003_001E,B15003_022E,B15003_023E,B15003_024E,B15003_025E,B17001_002E,B19013_001E,B23025_002E,B23025_005E';

// State FIPS codes (all 50 + DC)
const STATE_FIPS = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY',
};

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function parseNum(v) {
  if (!v || v === '-666666666' || v === '-999999999' || v === 'null') return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

async function fetchStateCounties(stateFips) {
  const url = `${ACS_BASE}?get=${VARS}&for=county:*&in=state:${stateFips}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  ✗ HTTP ${res.status} for state ${stateFips}`);
    return [];
  }
  const data = await res.json();
  // First row is header
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

async function main() {
  console.log('🏘️ Starting Census ACS 5-Year Demographics ingestion...\n');

  // Get states that have community colleges
  const { data: statesData } = await supabase
    .from('intel_institutions')
    .select('state')
    .order('state');
  
  const states = [...new Set(statesData?.map(r => r.state) || [])];
  console.log(`📍 ${states.length} states with community colleges\n`);

  // Reverse lookup: state code -> FIPS
  const stateToFips = {};
  for (const [fips, code] of Object.entries(STATE_FIPS)) {
    stateToFips[code] = fips;
  }

  let totalInserted = 0;
  let totalErrors = 0;

  for (let si = 0; si < states.length; si++) {
    const stateCode = states[si];
    const stateFips = stateToFips[stateCode];
    if (!stateFips) {
      console.log(`  ⚠️ No FIPS for ${stateCode}, skipping`);
      continue;
    }

    process.stdout.write(`  [${si + 1}/${states.length}] ${stateCode} (FIPS ${stateFips})...`);

    try {
      const counties = await fetchStateCounties(stateFips);

      const rows = counties.map(c => {
        const pop = parseNum(c.B01003_001E);
        const bach = parseNum(c.B15003_022E);
        const masters = parseNum(c.B15003_023E);
        const prof = parseNum(c.B15003_024E);
        const doc = parseNum(c.B15003_025E);
        const poverty = parseNum(c.B17001_002E);
        const income = parseNum(c.B19013_001E);
        const laborForce = parseNum(c.B23025_002E);
        const unemployed = parseNum(c.B23025_005E);

        const bachPlus = [bach, masters, prof, doc].filter(v => v !== null).reduce((a, b) => a + b, 0);
        const pctBach = pop && pop > 0 ? Math.round((bachPlus / pop) * 1000) / 10 : null;
        const povertyRate = pop && pop > 0 && poverty !== null ? Math.round((poverty / pop) * 1000) / 10 : null;
        const unempRate = laborForce && laborForce > 0 && unemployed !== null ? Math.round((unemployed / laborForce) * 1000) / 10 : null;

        return {
          state_fips: stateFips,
          county_fips: c.county,
          fips_code: `${stateFips}${c.county}`,
          county_name: (c.NAME || '').replace(`, ${stateCode === 'DC' ? 'District of Columbia' : ''}`, '').replace(/, .*$/, ''),
          state: stateCode,
          total_population: pop,
          pop_bachelors: bach,
          pop_masters: masters,
          pop_professional: prof,
          pop_doctorate: doc,
          pct_bachelors_plus: pctBach,
          median_household_income: income,
          persons_below_poverty: poverty,
          poverty_rate: povertyRate,
          labor_force_total: laborForce,
          unemployment_rate: unempRate,
          acs_year: ACS_YEAR,
          source: 'census_acs',
        };
      });

      // Upsert in chunks
      for (let i = 0; i < rows.length; i += 200) {
        const chunk = rows.slice(i, i + 200);
        const { error } = await supabase
          .from('intel_county_demographics')
          .upsert(chunk, { onConflict: 'fips_code,acs_year' });
        if (error) {
          console.error(`\n  ✗ Upsert error for ${stateCode}: ${error.message}`);
          totalErrors++;
        }
      }

      totalInserted += rows.length;
      console.log(` ${rows.length} counties ✓`);

    } catch (err) {
      console.log(` ✗ ${err.message}`);
      totalErrors++;
    }

    // Rate limit: ~2 req/sec
    if (si < states.length - 1) await sleep(500);
  }

  // Update freshness
  await supabase.from('intel_data_freshness').upsert({
    table_name: 'intel_county_demographics',
    dataset_label: 'County Demographics',
    source_name: 'U.S. Census Bureau, ACS 5-Year Estimates',
    source_url: 'https://data.census.gov/',
    data_period: '2018-2022 (5-Year)',
    data_release_date: '2023-12-07',
    next_expected_release: 'December 2024 (2019-2023 data)',
    records_loaded: totalInserted,
    last_refreshed_at: new Date().toISOString(),
    refreshed_by: 'cassidy',
    refresh_method: 'api_bulk',
    citation_text: 'U.S. Census Bureau, American Community Survey 5-Year Estimates, 2018-2022, Tables B01003, B15003, B17001, B19013, B23025',
    citation_url: 'https://data.census.gov/',
    coverage_notes: `All counties in ${states.length} states with community colleges`,
    known_limitations: '5-year estimates smooth out annual variation; education attainment is for population 25+; poverty is for all ages',
  }, { onConflict: 'table_name' });

  console.log(`\n🎯 Done! ${totalInserted} county records, ${totalErrors} errors`);
}

main().catch(console.error);
