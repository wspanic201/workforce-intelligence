#!/usr/bin/env node
/**
 * Seed Iowa Community College Service Areas
 * Iowa has 16 community colleges with legally defined merged areas (county-based)
 * Source: Iowa Dept of Education / Iowa Code Chapter 260C
 */

import { supabase } from './env-helper.mjs';

// Iowa county FIPS codes (state FIPS 19)
const IOWA_COUNTIES = {
  'Adair': '19001', 'Adams': '19003', 'Allamakee': '19005', 'Appanoose': '19007',
  'Audubon': '19009', 'Benton': '19011', 'Black Hawk': '19013', 'Boone': '19015',
  'Bremer': '19017', 'Buchanan': '19019', 'Buena Vista': '19021', 'Butler': '19023',
  'Calhoun': '19025', 'Carroll': '19027', 'Cass': '19029', 'Cedar': '19031',
  'Cerro Gordo': '19033', 'Cherokee': '19035', 'Chickasaw': '19037', 'Clarke': '19039',
  'Clay': '19041', 'Clayton': '19043', 'Clinton': '19045', 'Crawford': '19047',
  'Dallas': '19049', 'Davis': '19051', 'Decatur': '19053', 'Delaware': '19055',
  'Des Moines': '19057', 'Dickinson': '19059', 'Dubuque': '19061', 'Emmet': '19063',
  'Fayette': '19065', 'Floyd': '19067', 'Franklin': '19069', 'Fremont': '19071',
  'Greene': '19073', 'Grundy': '19075', 'Guthrie': '19077', 'Hamilton': '19079',
  'Hancock': '19081', 'Hardin': '19083', 'Harrison': '19085', 'Henry': '19087',
  'Howard': '19089', 'Humboldt': '19091', 'Ida': '19093', 'Iowa': '19095',
  'Jackson': '19097', 'Jasper': '19099', 'Jefferson': '19101', 'Johnson': '19103',
  'Jones': '19105', 'Keokuk': '19107', 'Kossuth': '19109', 'Lee': '19111',
  'Linn': '19113', 'Louisa': '19115', 'Lucas': '19117', 'Lyon': '19119',
  'Madison': '19121', 'Mahaska': '19123', 'Marion': '19125', 'Marshall': '19127',
  'Mills': '19129', 'Mitchell': '19131', 'Monona': '19133', 'Monroe': '19135',
  'Montgomery': '19137', 'Muscatine': '19139', 'O\'Brien': '19141', 'Osceola': '19143',
  'Page': '19145', 'Palo Alto': '19147', 'Plymouth': '19149', 'Pocahontas': '19151',
  'Polk': '19153', 'Pottawattamie': '19155', 'Poweshiek': '19157', 'Ringgold': '19159',
  'Sac': '19161', 'Scott': '19163', 'Shelby': '19165', 'Sioux': '19167',
  'Story': '19169', 'Tama': '19171', 'Taylor': '19173', 'Union': '19175',
  'Van Buren': '19177', 'Wapello': '19179', 'Warren': '19181', 'Washington': '19183',
  'Wayne': '19185', 'Webster': '19187', 'Winnebago': '19189', 'Winneshiek': '19191',
  'Woodbury': '19193', 'Worth': '19195', 'Wright': '19197',
};

// Iowa's 16 CC merged areas — counties assigned to each
// Source: Iowa Code Chapter 260C, Iowa DE merged area map
const IOWA_CC_AREAS = {
  'Northeast Iowa Community College': {
    short: 'NICC',
    primary: 'Winneshiek',
    counties: ['Allamakee', 'Chickasaw', 'Clayton', 'Delaware', 'Dubuque', 'Fayette', 'Howard', 'Winneshiek'],
  },
  'North Iowa Area Community College': {
    short: 'NIACC',
    primary: 'Cerro Gordo',
    counties: ['Cerro Gordo', 'Emmet', 'Franklin', 'Hancock', 'Kossuth', 'Mitchell', 'Winnebago', 'Worth', 'Floyd'],
  },
  'Iowa Lakes Community College': {
    short: 'Iowa Lakes',
    primary: 'Dickinson',
    counties: ['Buena Vista', 'Clay', 'Dickinson', 'Emmet', 'Kossuth', 'O\'Brien', 'Osceola', 'Palo Alto'],
  },
  'Northwest Iowa Community College': {
    short: 'NCC',
    primary: 'Lyon',
    counties: ['Cherokee', 'Lyon', 'O\'Brien', 'Osceola', 'Plymouth', 'Sioux'],
  },
  'Iowa Central Community College': {
    short: 'Iowa Central',
    primary: 'Webster',
    counties: ['Boone', 'Calhoun', 'Hamilton', 'Hardin', 'Humboldt', 'Pocahontas', 'Story', 'Webster', 'Wright'],
  },
  'Iowa Valley Community College District': {
    short: 'IVCCD',
    primary: 'Marshall',
    counties: ['Grundy', 'Hardin', 'Marshall', 'Poweshiek', 'Tama'],
  },
  'Hawkeye Community College': {
    short: 'Hawkeye',
    primary: 'Black Hawk',
    counties: ['Black Hawk', 'Bremer', 'Buchanan', 'Butler', 'Grundy'],
  },
  'Eastern Iowa Community Colleges': {
    short: 'EICC',
    primary: 'Scott',
    counties: ['Cedar', 'Clinton', 'Jackson', 'Muscatine', 'Scott'],
  },
  'Kirkwood Community College': {
    short: 'Kirkwood',
    primary: 'Linn',
    counties: ['Benton', 'Cedar', 'Iowa', 'Johnson', 'Jones', 'Linn', 'Washington'],
  },
  'Des Moines Area Community College': {
    short: 'DMACC',
    primary: 'Polk',
    counties: ['Adair', 'Audubon', 'Boone', 'Carroll', 'Cass', 'Dallas', 'Greene', 'Guthrie', 'Hamilton', 'Hardin', 'Jasper', 'Madison', 'Mahaska', 'Marion', 'Marshall', 'Polk', 'Poweshiek', 'Shelby', 'Story', 'Warren'],
  },
  'Western Iowa Tech Community College': {
    short: 'WITCC',
    primary: 'Woodbury',
    counties: ['Cherokee', 'Crawford', 'Harrison', 'Ida', 'Monona', 'Plymouth', 'Woodbury'],
  },
  'Iowa Western Community College': {
    short: 'IWCC',
    primary: 'Pottawattamie',
    counties: ['Cass', 'Fremont', 'Harrison', 'Mills', 'Montgomery', 'Page', 'Pottawattamie', 'Shelby'],
  },
  'Southwestern Community College': {
    short: 'SWCC',
    primary: 'Union',
    counties: ['Adams', 'Clarke', 'Decatur', 'Ringgold', 'Taylor', 'Union'],
  },
  'Indian Hills Community College': {
    short: 'Indian Hills',
    primary: 'Wapello',
    counties: ['Appanoose', 'Davis', 'Jefferson', 'Keokuk', 'Lucas', 'Mahaska', 'Monroe', 'Van Buren', 'Wapello', 'Wayne'],
  },
  'Southeastern Community College': {
    short: 'SCC',
    primary: 'Des Moines',
    counties: ['Des Moines', 'Henry', 'Lee', 'Louisa'],
  },
  'Heartland Community College Area': {
    short: 'Heartland (merged area only)',
    primary: 'Sac',
    counties: ['Buena Vista', 'Calhoun', 'Ida', 'Sac'],
  },
};

async function main() {
  console.log('=== Seeding Iowa CC Service Areas ===\n');

  // Get Iowa institutions from DB
  const { data: institutions } = await supabase
    .from('intel_institutions')
    .select('id, name, short_name')
    .eq('state', 'IA');

  if (!institutions?.length) {
    console.error('No Iowa institutions found in DB!');
    process.exit(1);
  }

  console.log(`Found ${institutions.length} Iowa institutions in DB`);

  // Clear existing Iowa service areas
  const iowaInstIds = institutions.map(i => i.id);
  for (const id of iowaInstIds) {
    await supabase.from('intel_service_areas').delete().eq('institution_id', id);
  }

  let totalMapped = 0;
  let matchedInst = 0;

  for (const [ccName, area] of Object.entries(IOWA_CC_AREAS)) {
    // Find matching institution
    const inst = institutions.find(i => 
      i.name?.toLowerCase().includes(ccName.toLowerCase().split(' ')[0]) ||
      i.short_name?.toLowerCase().includes(area.short.toLowerCase()) ||
      i.name?.toLowerCase().includes(area.short.toLowerCase())
    );

    if (!inst) {
      // Try harder matching
      const words = ccName.toLowerCase().split(' ');
      const inst2 = institutions.find(i => {
        const name = (i.name || '').toLowerCase();
        return words.filter(w => w.length > 3).every(w => name.includes(w));
      });
      
      if (!inst2) {
        console.log(`⚠️  No match for: ${ccName} (${area.short})`);
        continue;
      }
    }

    const matchedInstitution = inst || institutions.find(i => {
      const name = (i.name || '').toLowerCase();
      return ccName.toLowerCase().split(' ').filter(w => w.length > 3).every(w => name.includes(w));
    });

    if (!matchedInstitution) {
      console.log(`⚠️  No match for: ${ccName}`);
      continue;
    }

    matchedInst++;
    const rows = area.counties.map(county => ({
      institution_id: matchedInstitution.id,
      county_fips: IOWA_COUNTIES[county],
      county_name: county + ' County',
      state: 'IA',
      is_primary: county === area.primary,
      source: 'official_designation',
      notes: `Iowa merged area — ${area.short}`,
    })).filter(r => r.county_fips); // Skip if FIPS not found

    if (rows.length > 0) {
      const { error } = await supabase.from('intel_service_areas').insert(rows);
      if (error) {
        console.log(`✗ ${ccName}: ${error.message}`);
      } else {
        console.log(`✓ ${matchedInstitution.short_name || matchedInstitution.name} → ${rows.length} counties`);
        totalMapped += rows.length;
      }
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Institutions matched: ${matchedInst}`);
  console.log(`County mappings created: ${totalMapped}`);

  // Update freshness
  await supabase.from('intel_data_freshness').upsert({
    table_name: 'intel_service_areas',
    dataset_label: 'Institution Service Area Mappings',
    source_name: 'Iowa Code Chapter 260C / State CC Merged Area Maps',
    source_url: 'https://educateiowa.gov/community-colleges',
    data_period: 'Current (legally defined)',
    last_refreshed_at: new Date().toISOString(),
    refreshed_by: 'seed-iowa-service-areas.mjs',
    records_loaded: totalMapped,
    refresh_method: 'manual_curation',
    citation_text: 'Iowa Department of Education, Community College Merged Area Boundaries, Iowa Code Chapter 260C.',
    coverage_notes: `Iowa 16 community colleges mapped to ${totalMapped} county assignments. Other states pending.`,
    known_limitations: 'Iowa only. Some counties are shared between merged areas (overlap by law). Other states need separate research.',
    is_stale: false,
  }, { onConflict: 'table_name' });

  console.log('Freshness updated ✓');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
