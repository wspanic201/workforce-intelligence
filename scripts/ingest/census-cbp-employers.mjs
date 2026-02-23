#!/usr/bin/env node
/**
 * Census County Business Patterns (CBP) 2022 Ingestion
 * Upgrades from 2021 → 2022 data
 * Pulls employer/establishment counts by NAICS industry by county
 * For all states with community colleges in our database
 */

import { supabase } from './env-helper.mjs';

const CBP_YEAR = '2022';
const CBP_BASE = `https://api.census.gov/data/${CBP_YEAR}/cbp`;

// 15 key NAICS codes for workforce development
const NAICS_CODES = [
  '11',  // Agriculture
  '21',  // Mining
  '23',  // Construction
  '31-33', // Manufacturing
  '42',  // Wholesale Trade
  '44-45', // Retail Trade
  '48-49', // Transportation & Warehousing
  '51',  // Information
  '52',  // Finance & Insurance
  '54',  // Professional, Scientific, Technical
  '56',  // Administrative & Waste Services
  '62',  // Health Care & Social Assistance
  '72',  // Accommodation & Food Services
  '81',  // Other Services
  '61',  // Educational Services
];

const STATE_FIPS = {
  'AL':'01','AK':'02','AZ':'04','AR':'05','CA':'06','CO':'08','CT':'09','DE':'10','DC':'11','FL':'12',
  'GA':'13','HI':'15','ID':'16','IL':'17','IN':'18','IA':'19','KS':'20','KY':'21','LA':'22','ME':'23',
  'MD':'24','MA':'25','MI':'26','MN':'27','MS':'28','MO':'29','MT':'30','NE':'31','NV':'32','NH':'33',
  'NJ':'34','NM':'35','NY':'36','NC':'37','ND':'38','OH':'39','OK':'40','OR':'41','PA':'42','RI':'44',
  'SC':'45','SD':'46','TN':'47','TX':'48','UT':'49','VT':'50','VA':'51','WA':'53','WV':'54','WI':'55','WY':'56',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log(`🏢 Starting Census CBP ${CBP_YEAR} employer data ingestion...\n`);

  // Get states with CCs
  const { data: statesData } = await supabase.from('intel_institutions').select('state').order('state');
  const states = [...new Set(statesData?.map(r => r.state) || [])];
  console.log(`📍 ${states.length} states to pull\n`);

  // Clear old 2021 data
  const { count: oldCount } = await supabase.from('intel_employers').select('id', { count: 'exact', head: true });
  console.log(`🗑️ Clearing ${oldCount} old employer records...`);
  await supabase.from('intel_employers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  let totalInserted = 0;
  let totalErrors = 0;

  for (let si = 0; si < states.length; si++) {
    const stateCode = states[si];
    const fips = STATE_FIPS[stateCode];
    if (!fips) { console.log(`  ⚠️ No FIPS for ${stateCode}`); continue; }

    process.stdout.write(`  [${si + 1}/${states.length}] ${stateCode}...`);

    try {
      // Pull each NAICS code separately (API doesn't support comma-separated)
      let allRows = [];
      let headers = null;
      for (const naics of NAICS_CODES) {
        const url = `${CBP_BASE}?get=NAME,NAICS2017,ESTAB,EMP&for=county:*&in=state:${fips}&NAICS2017=${naics}`;
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (!headers) headers = data[0];
          allRows.push(...data.slice(1));
        } catch { /* skip this NAICS for this state */ }
        await sleep(200); // rate limit within state
      }
      if (!headers || allRows.length === 0) { console.log(' no data'); continue; }
      const rows = allRows;

      const records = rows.map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);

        const countyName = (obj.NAME || '').replace(/, .*$/, '');
        const estab = parseInt(obj.ESTAB) || 0;
        const emp = parseInt(obj.EMP) || 0;

        return {
          employer_name: `${obj.NAICS2017} - ${countyName}`,
          state: stateCode,
          city: countyName,
          naics_code: obj.NAICS2017,
          industry: obj.NAICS2017,
          estimated_employees: emp,
          employee_count_source: 'census_cbp',
          employee_count_year: parseInt(CBP_YEAR),
          is_hiring: false,
          key_occupations: [],
          source_url: `https://data.census.gov/table/CBP${CBP_YEAR}.CB${CBP_YEAR.slice(2)}00CBP`,
          last_verified: new Date().toISOString(),
          verified_by: 'cassidy',
          notes: `${estab} establishments, ${emp} employees. Census CBP ${CBP_YEAR}, NAICS ${obj.NAICS2017}, County FIPS ${fips}${obj.county}`,
        };
      }).filter(r => r.estimated_employees > 0);

      // Insert in chunks
      for (let i = 0; i < records.length; i += 200) {
        const chunk = records.slice(i, i + 200);
        const { error } = await supabase.from('intel_employers').insert(chunk);
        if (error) {
          console.error(`\n  ✗ Insert error: ${error.message}`);
          totalErrors++;
        } else {
          totalInserted += chunk.length;
        }
      }

      console.log(` ${records.length} records ✓`);
    } catch (err) {
      console.log(` ✗ ${err.message}`);
      totalErrors++;
    }

    if (si < states.length - 1) await sleep(500);
  }

  // Update freshness
  await supabase.from('intel_data_freshness').update({
    data_period: CBP_YEAR,
    data_release_date: '2024-04-01',
    next_expected_release: 'Spring 2026 (2023 data)',
    records_loaded: totalInserted,
    last_refreshed_at: new Date().toISOString(),
    refreshed_by: 'cassidy',
    refresh_method: 'api_bulk',
    citation_text: `U.S. Census Bureau, County Business Patterns ${CBP_YEAR}, by NAICS industry code`,
    citation_url: `https://data.census.gov/table/CBP${CBP_YEAR}.CB${CBP_YEAR.slice(2)}00CBP`,
    coverage_notes: `All counties in ${states.length} states, 15 key NAICS industries`,
    known_limitations: 'Employer counts suppressed in small counties; uses establishment counts; some NAICS ranges (31-33, 44-45, 48-49) may need special handling',
  }).eq('table_name', 'intel_employers');

  console.log(`\n🎯 Done! ${totalInserted} employer records (${CBP_YEAR}), ${totalErrors} errors`);
}

main().catch(console.error);
