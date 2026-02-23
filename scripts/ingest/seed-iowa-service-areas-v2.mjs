#!/usr/bin/env node
/**
 * Seed Iowa CC Service Areas — v2 with explicit institution ID mapping
 */
import { supabase } from './env-helper.mjs';

const FIPS = {
  'Adair':'19001','Adams':'19003','Allamakee':'19005','Appanoose':'19007','Audubon':'19009',
  'Benton':'19011','Black Hawk':'19013','Boone':'19015','Bremer':'19017','Buchanan':'19019',
  'Buena Vista':'19021','Butler':'19023','Calhoun':'19025','Carroll':'19027','Cass':'19029',
  'Cedar':'19031','Cerro Gordo':'19033','Cherokee':'19035','Chickasaw':'19037','Clarke':'19039',
  'Clay':'19041','Clayton':'19043','Clinton':'19045','Crawford':'19047','Dallas':'19049',
  'Davis':'19051','Decatur':'19053','Delaware':'19055','Des Moines':'19057','Dickinson':'19059',
  'Dubuque':'19061','Emmet':'19063','Fayette':'19065','Floyd':'19067','Franklin':'19069',
  'Fremont':'19071','Greene':'19073','Grundy':'19075','Guthrie':'19077','Hamilton':'19079',
  'Hancock':'19081','Hardin':'19083','Harrison':'19085','Henry':'19087','Howard':'19089',
  'Humboldt':'19091','Ida':'19093','Iowa':'19095','Jackson':'19097','Jasper':'19099',
  'Jefferson':'19101','Johnson':'19103','Jones':'19105','Keokuk':'19107','Kossuth':'19109',
  'Lee':'19111','Linn':'19113','Louisa':'19115','Lucas':'19117','Lyon':'19119',
  'Madison':'19121','Mahaska':'19123','Marion':'19125','Marshall':'19127','Mills':'19129',
  'Mitchell':'19131','Monona':'19133','Monroe':'19135','Montgomery':'19137','Muscatine':'19139',
  "O'Brien":'19141','Osceola':'19143','Page':'19145','Palo Alto':'19147','Plymouth':'19149',
  'Pocahontas':'19151','Polk':'19153','Pottawattamie':'19155','Poweshiek':'19157','Ringgold':'19159',
  'Sac':'19161','Scott':'19163','Shelby':'19165','Sioux':'19167','Story':'19169',
  'Tama':'19171','Taylor':'19173','Union':'19175','Van Buren':'19177','Wapello':'19179',
  'Warren':'19181','Washington':'19183','Wayne':'19185','Webster':'19187','Winnebago':'19189',
  'Winneshiek':'19191','Woodbury':'19193','Worth':'19195','Wright':'19197',
};

// Explicit ID → counties mapping (from DB query above)
const MAPPINGS = [
  {
    id: '2a72575c-ebfc-4a9c-b7f7-a7d902f81b94', // Northeast Iowa CC (NICC)
    name: 'NICC',
    primary: 'Winneshiek',
    counties: ['Allamakee','Chickasaw','Clayton','Delaware','Dubuque','Fayette','Howard','Winneshiek'],
  },
  {
    id: 'c6a7e164-7e68-4e25-8ed7-f30f117e0481', // North Iowa Area CC (NIACC)
    name: 'NIACC',
    primary: 'Cerro Gordo',
    counties: ['Cerro Gordo','Emmet','Floyd','Franklin','Hancock','Kossuth','Mitchell','Winnebago','Worth'],
  },
  {
    id: '467a6697-7fd4-4aaa-9d12-755560f98db0', // Iowa Lakes CC
    name: 'Iowa Lakes',
    primary: 'Dickinson',
    counties: ['Buena Vista','Clay','Dickinson','Emmet','Kossuth',"O'Brien",'Osceola','Palo Alto'],
  },
  {
    id: '2b8af136-3d27-4ea1-a00c-b40aafc549ab', // Northwest Iowa CC (NCC)
    name: 'NCC',
    primary: 'Sioux',
    counties: ['Cherokee','Lyon',"O'Brien",'Osceola','Plymouth','Sioux'],
  },
  {
    id: '17d0b8c1-d20b-45a7-9441-fe8bb15d284c', // Iowa Central CC
    name: 'Iowa Central',
    primary: 'Webster',
    counties: ['Boone','Calhoun','Hamilton','Hardin','Humboldt','Pocahontas','Story','Webster','Wright'],
  },
  {
    // Iowa Valley = Ellsworth (01f99ece) + Marshalltown (43727f22) — use Marshalltown as the district
    id: '43727f22-fea5-490f-9a95-457d7b8694db', // Marshalltown CC (Iowa Valley)
    name: 'IVCCD/Marshalltown',
    primary: 'Marshall',
    counties: ['Grundy','Hardin','Marshall','Poweshiek','Tama'],
  },
  {
    id: '01f99ece-50db-4aeb-b9ed-929531a741ff', // Ellsworth CC (Iowa Valley)
    name: 'IVCCD/Ellsworth',
    primary: 'Hamilton',
    counties: ['Hamilton','Hardin','Humboldt','Wright'], // Ellsworth campus area
  },
  {
    id: 'bc7c682f-9c8b-4116-a7f2-7ac22a7aef1a', // Hawkeye CC
    name: 'Hawkeye',
    primary: 'Black Hawk',
    counties: ['Black Hawk','Bremer','Buchanan','Butler','Grundy'],
  },
  {
    id: '66021453-49f4-4504-9e6b-d14157b168e2', // Eastern Iowa CC District
    name: 'EICC',
    primary: 'Scott',
    counties: ['Cedar','Clinton','Jackson','Muscatine','Scott'],
  },
  {
    id: '7897c91a-426b-483f-b7f6-c421ebe92319', // Kirkwood CC
    name: 'Kirkwood',
    primary: 'Linn',
    counties: ['Benton','Cedar','Iowa','Johnson','Jones','Linn','Washington'],
  },
  {
    id: 'ce35bfc1-0e23-4adc-a81f-67513e731d84', // DMACC
    name: 'DMACC',
    primary: 'Polk',
    counties: ['Adair','Audubon','Boone','Carroll','Cass','Dallas','Greene','Guthrie','Hamilton',
               'Hardin','Jasper','Madison','Mahaska','Marion','Marshall','Polk','Poweshiek',
               'Shelby','Story','Warren'],
  },
  {
    id: '6e577e47-f989-4564-ad44-61c6225f3d01', // Western Iowa Tech CC (WITCC)
    name: 'WITCC',
    primary: 'Woodbury',
    counties: ['Cherokee','Crawford','Harrison','Ida','Monona','Plymouth','Woodbury'],
  },
  {
    id: '0c409685-5799-47b2-8bc7-fe7cbd494e49', // Iowa Western CC
    name: 'Iowa Western',
    primary: 'Pottawattamie',
    counties: ['Cass','Fremont','Harrison','Mills','Montgomery','Page','Pottawattamie','Shelby'],
  },
  {
    id: '508fbd6e-05bd-492e-a0a4-f778fcce436e', // Southwestern CC
    name: 'SWCC',
    primary: 'Union',
    counties: ['Adams','Clarke','Decatur','Ringgold','Taylor','Union'],
  },
  {
    id: '72b24f3c-80bb-4e8f-ba38-edbb691c6914', // Indian Hills CC
    name: 'Indian Hills',
    primary: 'Wapello',
    counties: ['Appanoose','Davis','Jefferson','Keokuk','Lucas','Mahaska','Monroe','Van Buren','Wapello','Wayne'],
  },
  {
    id: '49d9c903-d0e6-411b-8964-412cede6646d', // Southeastern CC
    name: 'SCC',
    primary: 'Des Moines',
    counties: ['Des Moines','Henry','Lee','Louisa'],
  },
];

async function main() {
  console.log('=== Seeding Iowa CC Service Areas (v2 — explicit IDs) ===\n');

  let totalMapped = 0;

  for (const m of MAPPINGS) {
    const rows = m.counties.map(county => ({
      institution_id: m.id,
      county_fips: FIPS[county],
      county_name: county + ' County',
      state: 'IA',
      is_primary: county === m.primary,
      source: 'official_designation',
      notes: `Iowa merged area — ${m.name}`,
    })).filter(r => r.county_fips);

    const { error } = await supabase.from('intel_service_areas').upsert(rows, {
      onConflict: 'institution_id,county_fips'
    });

    if (error) {
      console.log(`✗ ${m.name}: ${error.message}`);
    } else {
      console.log(`✓ ${m.name} → ${rows.length} counties`);
      totalMapped += rows.length;
    }
  }

  console.log(`\n=== ${totalMapped} county mappings across ${MAPPINGS.length} institutions ===`);
  
  // Update freshness
  await supabase.from('intel_data_freshness').upsert({
    table_name: 'intel_service_areas',
    dataset_label: 'Institution Service Area Mappings',
    source_name: 'Iowa Code Chapter 260C / State CC Merged Area Maps',
    source_url: 'https://educateiowa.gov/community-colleges',
    data_period: 'Current (legally defined)',
    last_refreshed_at: new Date().toISOString(),
    refreshed_by: 'seed-iowa-service-areas-v2.mjs',
    records_loaded: totalMapped,
    refresh_method: 'manual_curation',
    citation_text: 'Iowa Department of Education, Community College Merged Area Boundaries, Iowa Code Chapter 260C.',
    coverage_notes: `Iowa: ${MAPPINGS.length} institutions mapped to ${totalMapped} county assignments.`,
    known_limitations: 'Iowa only. Some counties appear in multiple merged areas (overlap by law). Other states pending.',
    is_stale: false,
  }, { onConflict: 'table_name' });
  console.log('Freshness updated ✓');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
