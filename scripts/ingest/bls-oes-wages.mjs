#!/usr/bin/env node
/**
 * BLS OES Wage Data Ingestion
 * Pulls May 2024 OES wages for ~200 key workforce occupations
 * National + Iowa state level
 * API: 50 series/request, 500 requests/day with key
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
const envPath = resolve(import.meta.dirname, '../../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const BLS_KEY = 'cf120997aa7e40559e4b1c9adac6286b';
const BLS_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';

// Key CE/workforce occupations — detailed SOC codes (6-digit, no dash)
// Format: { soc: '292052', title: 'Pharmacy Technicians' }
const OCCUPATIONS = [
  // Healthcare
  { soc: '292052', title: 'Pharmacy Technicians' },
  { soc: '311120', title: 'Home Health and Personal Care Aides' },
  { soc: '311131', title: 'Nursing Assistants' },
  { soc: '292042', title: 'Emergency Medical Technicians' },
  { soc: '292061', title: 'Licensed Practical Nurses' },
  { soc: '291141', title: 'Registered Nurses' },
  { soc: '312021', title: 'Physical Therapist Assistants' },
  { soc: '319091', title: 'Dental Assistants' },
  { soc: '292072', title: 'Medical Records Specialists' },
  { soc: '292010', title: 'Clinical Laboratory Technologists and Technicians' },
  { soc: '319092', title: 'Medical Assistants' },
  { soc: '292034', title: 'Radiologic Technologists and Technicians' },
  { soc: '292055', title: 'Surgical Technologists' },
  { soc: '291071', title: 'Physician Assistants' },
  { soc: '312011', title: 'Occupational Therapy Assistants' },
  { soc: '319094', title: 'Medical Transcriptionists' },
  { soc: '292081', title: 'Opticians, Dispensing' },
  { soc: '311121', title: 'Home Health Aides' },
  { soc: '292056', title: 'Veterinary Technologists and Technicians' },
  { soc: '399011', title: 'Childcare Workers' },

  // Skilled Trades
  { soc: '472111', title: 'Electricians' },
  { soc: '472152', title: 'Plumbers, Pipefitters, and Steamfitters' },
  { soc: '514121', title: 'Welders, Cutters, Solderers, and Brazers' },
  { soc: '499071', title: 'Maintenance and Repair Workers, General' },
  { soc: '472031', title: 'Carpenters' },
  { soc: '499021', title: 'Heating, AC, and Refrigeration Mechanics' },
  { soc: '493023', title: 'Automotive Service Technicians' },
  { soc: '472073', title: 'Operating Engineers and Other Construction Equipment Operators' },
  { soc: '518091', title: 'Chemical Plant and System Operators' },
  { soc: '499041', title: 'Industrial Machinery Mechanics' },
  { soc: '499043', title: 'Maintenance Workers, Machinery' },
  { soc: '499044', title: 'Millwrights' },
  { soc: '472061', title: 'Construction Laborers' },
  { soc: '474011', title: 'Construction and Building Inspectors' },

  // Transportation & Logistics
  { soc: '533032', title: 'Heavy and Tractor-Trailer Truck Drivers' },
  { soc: '533033', title: 'Light Truck Drivers' },
  { soc: '435071', title: 'Shipping, Receiving, and Inventory Clerks' },
  { soc: '537065', title: 'Stockers and Order Fillers' },
  { soc: '532011', title: 'Airline Pilots, Copilots, and Flight Engineers' },
  { soc: '534041', title: 'Subway and Streetcar Operators' },

  // Information Technology
  { soc: '151252', title: 'Software Developers' },
  { soc: '151231', title: 'Computer Network Support Specialists' },
  { soc: '151232', title: 'Computer User Support Specialists' },
  { soc: '151212', title: 'Information Security Analysts' },
  { soc: '151244', title: 'Network and Computer Systems Administrators' },
  { soc: '151256', title: 'Software Quality Assurance Analysts and Testers' },
  { soc: '151211', title: 'Computer Systems Analysts' },
  { soc: '151299', title: 'Computer Occupations, All Other' },
  { soc: '151251', title: 'Computer Programmers' },
  { soc: '151241', title: 'Computer Network Architects' },

  // Business & Office
  { soc: '434051', title: 'Customer Service Representatives' },
  { soc: '436014', title: 'Secretaries and Administrative Assistants' },
  { soc: '132011', title: 'Accountants and Auditors' },
  { soc: '131111', title: 'Management Analysts' },
  { soc: '132098', title: 'Financial and Investment Analysts' },
  { soc: '113021', title: 'Computer and Information Systems Managers' },
  { soc: '119013', title: 'Farmers, Ranchers, and Other Agricultural Managers' },
  { soc: '132020', title: 'Property Appraisers and Assessors' },
  { soc: '434171', title: 'Receptionists and Information Clerks' },
  { soc: '439061', title: 'Office Clerks, General' },

  // Manufacturing & Production
  { soc: '512092', title: 'Team Assemblers' },
  { soc: '519061', title: 'Inspectors, Testers, Sorters, Samplers, and Weighers' },
  { soc: '514041', title: 'Machinists' },
  { soc: '511011', title: 'First-Line Supervisors of Production Workers' },
  { soc: '519111', title: 'Packaging and Filling Machine Operators' },
  { soc: '514111', title: 'Tool and Die Makers' },
  { soc: '517042', title: 'Woodworking Machine Setters, Operators, and Tenders' },
  { soc: '519023', title: 'Mixing and Blending Machine Setters, Operators, and Tenders' },
  { soc: '173026', title: 'Industrial Engineering Technologists and Technicians' },

  // Education & Training
  { soc: '252011', title: 'Preschool Teachers, Except Special Education' },
  { soc: '252021', title: 'Elementary School Teachers' },
  { soc: '253041', title: 'Tutors' },
  { soc: '253098', title: 'Substitute Teachers' },
  { soc: '259031', title: 'Instructional Coordinators' },
  { soc: '211012', title: 'Educational, Guidance, and Career Counselors' },

  // Public Safety
  { soc: '333012', title: 'Correctional Officers and Jailers' },
  { soc: '332011', title: 'Firefighters' },
  { soc: '333051', title: 'Police and Sheriff\'s Patrol Officers' },
  { soc: '339032', title: 'Security Guards' },
  { soc: '292043', title: 'Paramedics' },

  // Hospitality & Food Service
  { soc: '353021', title: 'Combined Food Preparation and Serving Workers' },
  { soc: '353031', title: 'Waiters and Waitresses' },
  { soc: '351011', title: 'Chefs and Head Cooks' },
  { soc: '351012', title: 'First-Line Supervisors of Food Preparation Workers' },
  { soc: '372012', title: 'Maids and Housekeeping Cleaners' },
  { soc: '119081', title: 'Lodging Managers' },

  // Agriculture & Environment
  { soc: '452011', title: 'Agricultural Inspectors' },
  { soc: '452099', title: 'Agricultural Workers, All Other' },
  { soc: '194042', title: 'Environmental Science and Protection Technicians' },
  { soc: '172081', title: 'Environmental Engineers' },
  { soc: '192043', title: 'Hydrologists' },
  { soc: '454022', title: 'Logging Equipment Operators' },

  // Beauty & Personal Care
  { soc: '395012', title: 'Hairdressers, Hairstylists, and Cosmetologists' },
  { soc: '395092', title: 'Manicurists and Pedicurists' },
  { soc: '395094', title: 'Skincare Specialists' },
  { soc: '395011', title: 'Barbers' },
  { soc: '399032', title: 'Recreation Workers' },

  // Energy & Utilities
  { soc: '518013', title: 'Power Plant Operators' },
  { soc: '472231', title: 'Solar Photovoltaic Installers' },
  { soc: '499081', title: 'Wind Turbine Service Technicians' },
  { soc: '518012', title: 'Power Distributors and Dispatchers' },
  { soc: '499051', title: 'Electrical Power-Line Installers and Repairers' },

  // Animal Care (relevant for Groom Jobs!)
  { soc: '292056', title: 'Veterinary Technologists and Technicians' },
  { soc: '319096', title: 'Veterinary Assistants and Laboratory Animal Caretakers' },
  { soc: '399011', title: 'Childcare Workers' },
  { soc: '392021', title: 'Animal Caretakers' }, // includes groomers under this sometimes
  { soc: '392011', title: 'Animal Trainers' },

  // Miscellaneous high-demand
  { soc: '172112', title: 'Industrial Engineers' },
  { soc: '172141', title: 'Mechanical Engineers' },
  { soc: '172071', title: 'Electrical Engineers' },
  { soc: '172199', title: 'Engineers, All Other' },
  { soc: '173027', title: 'Mechanical Engineering Technologists and Technicians' },
  { soc: '271024', title: 'Graphic Designers' },
  { soc: '151254', title: 'Web Developers' },
  { soc: '439111', title: 'Statistical Assistants' },
  { soc: '232011', title: 'Paralegals and Legal Assistants' },
  { soc: '292032', title: 'Diagnostic Medical Sonographers' },
  { soc: '292035', title: 'Magnetic Resonance Imaging Technologists' },
  { soc: '312022', title: 'Physical Therapist Aides' },
  { soc: '291126', title: 'Respiratory Therapists' },
];

// Deduplicate by SOC
const uniqueOccs = [...new Map(OCCUPATIONS.map(o => [o.soc, o])).values()];
console.log(`📊 ${uniqueOccs.length} unique occupations to pull`);

// BLS OES data types (annual)
const DATA_TYPES = {
  '01': 'employment',
  '04': 'mean_annual',
  '13': 'median_annual',
  '11': 'pct_10',
  '12': 'pct_25',
  '14': 'pct_75',
  '15': 'pct_90',
};

// Geo areas: national + Iowa
// National: OEUN + 0000000 + 000000 + SOC + DT
// State:    OEUS + {fips}00000 + 000000 + SOC + DT (note: OEUS not OEUN for statewide)
const GEO_AREAS = [
  { prefix: 'OEUN', area: '0000000', industry: '000000', level: 'national', geoCode: 'US', geoName: 'United States' },
  { prefix: 'OEUS', area: '1900000', industry: '000000', level: 'state', geoCode: 'IA', geoName: 'Iowa' },
];

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
    console.error('BLS API error:', json.message);
    return [];
  }
  return json.Results?.series || [];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Starting BLS OES wage data ingestion...\n');
  
  let totalInserted = 0;
  let totalErrors = 0;

  for (const geo of GEO_AREAS) {
    console.log(`\n📍 Pulling wages for ${geo.geoName}...`);
    
    // Build all series IDs for this geo area
    // Format: {prefix}{7-char area}{6-char industry}{6-char SOC}{2-char datatype}
    const allSeries = [];
    for (const occ of uniqueOccs) {
      for (const dt of Object.keys(DATA_TYPES)) {
        allSeries.push({
          id: `${geo.prefix}${geo.area}${geo.industry}${occ.soc}${dt}`,
          soc: occ.soc,
          title: occ.title,
          dataType: DATA_TYPES[dt],
        });
      }
    }

    console.log(`  📡 ${allSeries.length} series to fetch (${Math.ceil(allSeries.length / 50)} API calls)`);

    // Batch into groups of 50
    const batches = [];
    for (let i = 0; i < allSeries.length; i += 50) {
      batches.push(allSeries.slice(i, i + 50));
    }

    // Collect results by SOC code
    const wageData = {}; // { soc: { employment, median_annual, etc. } }

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const seriesIds = batch.map(s => s.id);
      
      process.stdout.write(`  Batch ${i + 1}/${batches.length}...`);
      
      try {
        const results = await fetchBLS(seriesIds);
        
        for (const series of results) {
          const matched = batch.find(s => s.id === series.seriesID);
          if (!matched) continue;
          
          const value = series.data?.[0]?.value;
          if (!value || value === '-' || value === '*') continue;
          
          if (!wageData[matched.soc]) {
            wageData[matched.soc] = { title: matched.title };
          }
          
          const numVal = parseFloat(value.replace(/,/g, ''));
          if (!isNaN(numVal)) {
            wageData[matched.soc][matched.dataType] = Math.round(numVal);
          }
        }
        
        console.log(` ✓`);
      } catch (err) {
        console.log(` ✗ ${err.message}`);
        totalErrors++;
      }
      
      // Rate limiting: ~1 req/sec to be safe
      if (i < batches.length - 1) await sleep(1200);
    }

    // Insert into Supabase
    const rows = Object.entries(wageData).map(([soc, data]) => ({
      soc_code: `${soc.slice(0, 2)}-${soc.slice(2)}`, // Format as XX-XXXX
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
      source_url: 'https://www.bls.gov/oes/current/oes_nat.htm',
      last_verified: new Date().toISOString(),
      verified_by: 'cassidy',
      notes: 'BLS OES May 2024 via API v2',
    }));

    if (rows.length > 0) {
      for (let i = 0; i < rows.length; i += 100) {
        const chunk = rows.slice(i, i + 100);
        const { error } = await supabase
          .from('intel_wages')
          .upsert(chunk, { onConflict: 'soc_code,geo_level,geo_code' });
        
        if (error) {
          console.error(`\n  ✗ Upsert error: ${error.message}`);
          totalErrors++;
        } else {
          totalInserted += chunk.length;
        }
      }
      console.log(`  ✅ ${rows.length} occupations saved for ${geo.geoName}`);
    }
  }

  // Update freshness table
  const { error: freshErr } = await supabase
    .from('intel_data_freshness')
    .update({
      data_period: 'May 2024',
      data_release_date: '2025-03-01',
      next_expected_release: 'March 2026 (May 2025 data)',
      records_loaded: totalInserted,
      last_refreshed_at: new Date().toISOString(),
      refreshed_by: 'cassidy',
      refresh_method: 'api_bulk',
      citation_text: 'Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2024',
      citation_url: 'https://www.bls.gov/oes/current/oes_nat.htm',
      coverage_notes: `${uniqueOccs.length} key workforce occupations, national + Iowa`,
      known_limitations: 'Curated subset of ~800 total OES occupations; state data may have fewer occupations due to suppression',
    })
    .eq('table_name', 'intel_wages');

  if (freshErr) console.error('Freshness update error:', freshErr.message);

  console.log(`\n🎯 Done! ${totalInserted} wage records inserted, ${totalErrors} errors`);
}

main().catch(console.error);
