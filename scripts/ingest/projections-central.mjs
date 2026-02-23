#!/usr/bin/env node
/**
 * Ingest state-level employment projections from Projections Central
 * Source: https://projectionscentral.org (BLS/State Labor Market Projections Partnership)
 * Data: Long-term 2022-2032 occupation projections for all 50 states + DC
 * 
 * Usage: node scripts/ingest/projections-central.mjs [--dry-run] [--state XX]
 */

import { supabase } from './env-helper.mjs';

const API_BASE = 'https://public.projectionscentral.org/Projections/LongTermRestJson';
const ITEMS_PER_PAGE = 100; // API max is 100

// All 50 states + DC with FIPS codes
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

// Classify growth rate
function classifyGrowth(pctChange) {
  if (pctChange == null) return null;
  const pct = parseFloat(pctChange);
  if (pct >= 14) return 'much_faster';     // 2x+ average
  if (pct >= 8) return 'faster';
  if (pct >= 3) return 'average';           // ~5.3% is national average 2022-2032
  if (pct >= 0) return 'slower';
  return 'declining';
}

async function fetchStatePage(fips, page = 0) {
  const url = `${API_BASE}/${fips}?page=${page}&items_per_page=${ITEMS_PER_PAGE}`;
  const resp = await fetch(url);
  const text = await resp.text();
  if (!text.startsWith('{')) return { rows: [], pager: { total_items: 0, total_pages: 0 } };
  return JSON.parse(text);
}

async function fetchAllForState(fips) {
  const allRows = [];
  let page = 0;
  while (true) {
    const data = await fetchStatePage(fips, page);
    if (!data.rows || data.rows.length === 0) break;
    allRows.push(...data.rows);
    if (page >= data.pager.total_pages - 1) break;
    page++;
    // Brief pause between pages
    await new Promise(r => setTimeout(r, 100));
  }
  return allRows;
}

function transformRow(row, stateCode) {
  const baseYear = parseInt(row.BaseYear) || 2022;
  const projYear = parseInt(row.ProjYear) || 2032;
  
  return {
    soc_code: row.OccCode || null,
    occupation_title: row.Title,
    base_year: baseYear,
    projected_year: projYear,
    employment_base: parseInt(row.Base) || null,
    employment_projected: parseInt(row.Projected) || null,
    change_number: parseInt(row.Change) || null,
    change_percent: row.PercentChange ? parseFloat(row.PercentChange) : null,
    annual_openings: parseInt(row.AvgAnnualOpenings) || null,
    median_annual_wage: null,  // Projections Central doesn't include wages
    typical_education: null,
    typical_experience: null,
    typical_training: null,
    growth_category: classifyGrowth(row.PercentChange),
    geo_level: 'state',
    geo_code: stateCode,
    source: 'projections_central'
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const stateFilter = args.find(a => a.startsWith('--state='))?.split('=')[1]?.toUpperCase();
  
  console.log('=== Projections Central State Employment Projections Ingestion ===');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  if (stateFilter) console.log(`Filtering to state: ${stateFilter}`);
  console.log('');

  // Delete existing projections_central data first (clean replace)
  if (!dryRun) {
    console.log('Purging existing projections_central data...');
    const { error: delErr, count } = await supabase
      .from('intel_occupation_projections')
      .delete()
      .eq('source', 'projections_central')
      .select('*', { count: 'exact', head: true });
    
    // Alternative: just delete and move on
    const { error: delErr2 } = await supabase
      .from('intel_occupation_projections')
      .delete()
      .eq('source', 'projections_central');
    if (delErr2) {
      console.error('Delete failed:', delErr2.message);
      process.exit(1);
    }
    console.log('Purged existing records.\n');
  }

  let totalInserted = 0;
  let totalSkipped = 0;
  let statesProcessed = 0;

  const entries = Object.entries(STATE_FIPS).sort((a, b) => a[1].localeCompare(b[1]));
  
  for (const [fips, stateCode] of entries) {
    if (stateFilter && stateCode !== stateFilter) continue;
    
    const stateName = STATE_NAMES[stateCode];
    process.stdout.write(`${stateCode} (${stateName})... `);
    
    try {
      const rows = await fetchAllForState(fips);
      if (rows.length === 0) {
        console.log('NO DATA');
        continue;
      }
      
      const records = rows
        .map(r => transformRow(r, stateCode))
        .filter(r => r.soc_code); // Skip entries without SOC codes
      
      const skipped = rows.length - records.length;
      
      if (!dryRun && records.length > 0) {
        // Insert in batches of 500
        for (let i = 0; i < records.length; i += 500) {
          const batch = records.slice(i, i + 500);
          const { error } = await supabase
            .from('intel_occupation_projections')
            .upsert(batch, { onConflict: 'soc_code,base_year,geo_level,geo_code' });
          if (error) {
            console.error(`\n  ERROR inserting batch ${i}: ${error.message}`);
            // Continue with next batch
          }
        }
      }
      
      totalInserted += records.length;
      totalSkipped += skipped;
      statesProcessed++;
      console.log(`${records.length} records${skipped > 0 ? ` (${skipped} skipped, no SOC)` : ''}`);
      
      // Polite rate limiting
      await new Promise(r => setTimeout(r, 200));
      
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`States processed: ${statesProcessed}`);
  console.log(`Records ${dryRun ? 'found' : 'inserted'}: ${totalInserted}`);
  console.log(`Skipped (no SOC): ${totalSkipped}`);
  console.log(`Source: Projections Central (BLS/State Partnership)`);
  console.log(`Data period: 2022-2032`);
  console.log(`Source URL: https://projectionscentral.org`);

  // Update data freshness
  if (!dryRun) {
    console.log('\nUpdating intel_data_freshness...');
    const { error: freshErr } = await supabase
      .from('intel_data_freshness')
      .upsert({
        table_name: 'intel_occupation_projections',
        source_name: 'Projections Central (BLS/State Partnership)',
        source_url: 'https://projectionscentral.org',
        data_period: '2022-2032',
        last_refreshed: new Date().toISOString(),
        refreshed_by: 'projections-central.mjs',
        record_count: totalInserted,
        notes: `State-level long-term employment projections for ${statesProcessed} states/territories. SOC-coded occupations with base/projected employment, change %, and annual openings.`,
        citation_template: 'Bureau of Labor Statistics & State Labor Market Information Agencies, "Long-Term Occupational Projections 2022-2032," via Projections Central (projectionscentral.org), accessed {date}.'
      }, { onConflict: 'table_name' });
    if (freshErr) console.error('Freshness update error:', freshErr.message);
    else console.log('Freshness updated ✓');
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
