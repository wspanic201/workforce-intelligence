#!/usr/bin/env node
/**
 * BLS OES Faculty/Instructor Wage Benchmarks
 * Pulls May 2024 wages for all SOC 25-xxxx (Education, Training, Library) occupations
 * National + all 50 states + DC
 * 
 * API limits: 50 series/request, 500 requests/day with key
 * Estimated: ~364 API calls (within daily limit)
 * 
 * Usage: node scripts/ingest/bls-faculty-wages.mjs [--dry-run] [--state XX]
 */

import { supabase } from './env-helper.mjs';

const BLS_KEY = 'cf120997aa7e40559e4b1c9adac6286b';
const BLS_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';

// All postsecondary teacher + education/training SOC codes
const FACULTY_OCCUPATIONS = [
  // Postsecondary Teachers (the core faculty benchmarks)
  { soc: '251011', title: 'Business Teachers, Postsecondary' },
  { soc: '251021', title: 'Computer Science Teachers, Postsecondary' },
  { soc: '251022', title: 'Mathematical Science Teachers, Postsecondary' },
  { soc: '251032', title: 'Engineering Teachers, Postsecondary' },
  { soc: '251041', title: 'Agricultural Sciences Teachers, Postsecondary' },
  { soc: '251042', title: 'Biological Science Teachers, Postsecondary' },
  { soc: '251051', title: 'Atmospheric/Earth/Marine/Space Sciences Teachers, Postsecondary' },
  { soc: '251052', title: 'Chemistry Teachers, Postsecondary' },
  { soc: '251053', title: 'Environmental Science Teachers, Postsecondary' },
  { soc: '251054', title: 'Physics Teachers, Postsecondary' },
  { soc: '251061', title: 'Anthropology and Archeology Teachers, Postsecondary' },
  { soc: '251062', title: 'Area, Ethnic, and Cultural Studies Teachers, Postsecondary' },
  { soc: '251063', title: 'Economics Teachers, Postsecondary' },
  { soc: '251064', title: 'Geography Teachers, Postsecondary' },
  { soc: '251065', title: 'Political Science Teachers, Postsecondary' },
  { soc: '251066', title: 'Psychology Teachers, Postsecondary' },
  { soc: '251067', title: 'Sociology Teachers, Postsecondary' },
  { soc: '251069', title: 'Social Sciences Teachers, All Other, Postsecondary' },
  { soc: '251071', title: 'Health Specialties Teachers, Postsecondary' },
  { soc: '251072', title: 'Nursing Instructors and Teachers, Postsecondary' },
  { soc: '251081', title: 'Education Teachers, Postsecondary' },
  { soc: '251082', title: 'Library Science Teachers, Postsecondary' },
  { soc: '251111', title: 'Criminal Justice and Law Enforcement Teachers, Postsecondary' },
  { soc: '251112', title: 'Law Teachers, Postsecondary' },
  { soc: '251113', title: 'Social Work Teachers, Postsecondary' },
  { soc: '251121', title: 'Art, Drama, and Music Teachers, Postsecondary' },
  { soc: '251122', title: 'Communications Teachers, Postsecondary' },
  { soc: '251123', title: 'English Language and Literature Teachers, Postsecondary' },
  { soc: '251124', title: 'Foreign Language and Literature Teachers, Postsecondary' },
  { soc: '251125', title: 'History Teachers, Postsecondary' },
  { soc: '251126', title: 'Philosophy and Religion Teachers, Postsecondary' },
  { soc: '251191', title: 'Graduate Teaching Assistants' },
  { soc: '251194', title: 'Career/Technical Education Teachers, Postsecondary' },
  { soc: '251199', title: 'Postsecondary Teachers, All Other' },

  // K-12 and Adult Education (comparison benchmarks)
  { soc: '252021', title: 'Elementary School Teachers, Except Special Education' },
  { soc: '252022', title: 'Middle School Teachers, Except Special/CTE' },
  { soc: '252031', title: 'Secondary School Teachers, Except Special/CTE' },
  { soc: '252032', title: 'Career/Technical Education Teachers, Secondary School' },
  { soc: '253011', title: 'Adult Basic Education, GED, and ESL Teachers' },
  { soc: '253021', title: 'Self-Enrichment Teachers' },
  { soc: '253041', title: 'Tutors' },
  { soc: '253098', title: 'Substitute Teachers, Short-Term' },

  // Education Support & Administration
  { soc: '259031', title: 'Instructional Coordinators' },
  { soc: '259042', title: 'Teaching Assistants, Postsecondary' },
  { soc: '259043', title: 'Teaching Assistants, Except Postsecondary' },
  { soc: '259099', title: 'Education Instruction and Library Workers, All Other' },
  { soc: '119032', title: 'Education Administrators, Kindergarten through Secondary' },
  { soc: '119033', title: 'Education Administrators, Postsecondary' },
  { soc: '119039', title: 'Education Administrators, All Other' },
];

// BLS OES data types
const DATA_TYPES = {
  '01': 'employment',
  '04': 'mean_annual',
  '13': 'median_annual',
  '11': 'pct_10',
  '12': 'pct_25',
  '14': 'pct_75',
  '15': 'pct_90',
};

// All 50 states + DC
const STATE_FIPS = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE',
  '11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA',
  '20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN',
  '28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM',
  '36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI',
  '45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA',
  '54':'WV','55':'WI','56':'WY'
};

const STATE_NAMES = {
  'AL':'Alabama','AK':'Alaska','AZ':'Arizona','AR':'Arkansas','CA':'California',
  'CO':'Colorado','CT':'Connecticut','DE':'Delaware','DC':'District of Columbia',
  'FL':'Florida','GA':'Georgia','HI':'Hawaii','ID':'Idaho','IL':'Illinois',
  'IN':'Indiana','IA':'Iowa','KS':'Kansas','KY':'Kentucky','LA':'Louisiana',
  'ME':'Maine','MD':'Maryland','MA':'Massachusetts','MI':'Michigan','MN':'Minnesota',
  'MS':'Mississippi','MO':'Missouri','MT':'Montana','NE':'Nebraska','NV':'Nevada',
  'NH':'New Hampshire','NJ':'New Jersey','NM':'New Mexico','NY':'New York',
  'NC':'North Carolina','ND':'North Dakota','OH':'Ohio','OK':'Oklahoma','OR':'Oregon',
  'PA':'Pennsylvania','RI':'Rhode Island','SC':'South Carolina','SD':'South Dakota',
  'TN':'Tennessee','TX':'Texas','UT':'Utah','VT':'Vermont','VA':'Virginia',
  'WA':'Washington','WV':'West Virginia','WI':'Wisconsin','WY':'Wyoming'
};

// Build geo areas: national + all states
const GEO_AREAS = [
  { prefix: 'OEUN', area: '0000000', level: 'national', geoCode: 'US', geoName: 'United States' },
  ...Object.entries(STATE_FIPS).map(([fips, code]) => ({
    prefix: 'OEUS',
    area: `${fips}00000`,
    level: 'state',
    geoCode: code,
    geoName: STATE_NAMES[code],
  })),
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchBLS(seriesIds) {
  const res = await fetch(BLS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seriesid: seriesIds,
      registrationkey: BLS_KEY,
      startyear: '2024',
      endyear: '2024',
    }),
  });
  const json = await res.json();
  if (json.status !== 'REQUEST_SUCCEEDED') {
    throw new Error(json.message?.[0] || 'BLS API error');
  }
  return json.Results?.series || [];
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const stateFilter = args.find(a => a.startsWith('--state='))?.split('=')[1]?.toUpperCase();

  console.log('=== BLS OES Faculty/Instructor Wage Benchmarks ===');
  console.log(`Occupations: ${FACULTY_OCCUPATIONS.length}`);
  console.log(`Geo areas: ${stateFilter ? '1 state' : `${GEO_AREAS.length} (national + 50 states + DC)`}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  
  const geos = stateFilter 
    ? GEO_AREAS.filter(g => g.geoCode === stateFilter || g.geoCode === 'US')
    : GEO_AREAS;

  // Calculate API calls needed
  const seriesPerGeo = FACULTY_OCCUPATIONS.length * Object.keys(DATA_TYPES).length;
  const batchesPerGeo = Math.ceil(seriesPerGeo / 50);
  const totalCalls = batchesPerGeo * geos.length;
  console.log(`Series per geo: ${seriesPerGeo}, Batches per geo: ${batchesPerGeo}`);
  console.log(`Total API calls needed: ${totalCalls} (limit: 500/day)\n`);

  if (totalCalls > 490) {
    console.error('⚠️  Would exceed BLS daily API limit! Aborting.');
    process.exit(1);
  }

  let totalInserted = 0;
  let totalErrors = 0;
  let apiCalls = 0;

  for (const geo of geos) {
    process.stdout.write(`${geo.geoCode} (${geo.geoName})... `);

    // Build all series IDs
    const allSeries = [];
    for (const occ of FACULTY_OCCUPATIONS) {
      for (const [dt, dtName] of Object.entries(DATA_TYPES)) {
        allSeries.push({
          id: `${geo.prefix}${geo.area}000000${occ.soc}${dt}`,
          soc: occ.soc,
          title: occ.title,
          dataType: dtName,
        });
      }
    }

    // Batch into groups of 50
    const batches = [];
    for (let i = 0; i < allSeries.length; i += 50) {
      batches.push(allSeries.slice(i, i + 50));
    }

    const wageData = {};

    for (const batch of batches) {
      if (dryRun) { apiCalls++; continue; }

      try {
        const results = await fetchBLS(batch.map(s => s.id));
        apiCalls++;

        for (const series of results) {
          const matched = batch.find(s => s.id === series.seriesID);
          if (!matched) continue;

          const value = series.data?.[0]?.value;
          if (!value || value === '-' || value === '*' || value === '**') continue;

          if (!wageData[matched.soc]) {
            wageData[matched.soc] = { title: matched.title };
          }

          const numVal = parseFloat(value.replace(/,/g, ''));
          if (!isNaN(numVal)) {
            wageData[matched.soc][matched.dataType] = Math.round(numVal);
          }
        }
      } catch (err) {
        totalErrors++;
      }

      // Rate limit: ~1.2s between calls
      await sleep(1200);
    }

    if (dryRun) {
      console.log(`${batches.length} batches (dry run)`);
      continue;
    }

    // Build rows for Supabase
    const rows = Object.entries(wageData).map(([soc, data]) => ({
      soc_code: `${soc.slice(0, 2)}-${soc.slice(2)}`,
      occupation_title: data.title,
      geo_level: geo.level,
      geo_code: geo.geoCode,
      geo_name: geo.geoName,
      median_annual: data.median_annual || null,
      mean_annual: data.mean_annual || null,
      pct_10: data.pct_10 || null,
      pct_25: data.pct_25 || null,
      pct_75: data.pct_75 || null,
      pct_90: data.pct_90 || null,
      employment: data.employment || null,
      bls_release: 'May 2024',
      source_url: `https://www.bls.gov/oes/current/oes${soc.slice(0, 2)}0000.htm`,
      last_verified: new Date().toISOString(),
      verified_by: 'cassidy',
      notes: 'Faculty/instructor wage benchmark — BLS OES May 2024',
    }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('intel_wages')
        .upsert(rows, { onConflict: 'soc_code,geo_level,geo_code' });

      if (error) {
        console.log(`${rows.length} found, INSERT ERROR: ${error.message}`);
        totalErrors++;
      } else {
        totalInserted += rows.length;
        console.log(`${rows.length} occupations`);
      }
    } else {
      console.log('0 (all suppressed)');
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`API calls made: ${apiCalls}`);
  console.log(`Records ${dryRun ? 'estimated' : 'inserted/updated'}: ${totalInserted}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Source: BLS OES May 2024`);

  if (!dryRun && totalInserted > 0) {
    // Get total wage count
    const { count } = await supabase.from('intel_wages').select('*', { count: 'exact', head: true });
    
    await supabase.from('intel_data_freshness').update({
      records_loaded: count,
      last_refreshed_at: new Date().toISOString(),
      refreshed_by: 'bls-faculty-wages.mjs',
      coverage_notes: `${count} wage records: workforce occupations + faculty/instructor benchmarks across national + all 50 states + DC`,
    }).eq('table_name', 'intel_wages');
    
    console.log(`\nFreshness updated. Total wage records in DB: ${count}`);
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
