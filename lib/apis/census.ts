/**
 * Census ACS 5-Year API Client
 * 
 * Pulls real demographic data for workforce analysis:
 * - Population, median age
 * - Median household income, poverty rate
 * - Employment rate, labor force participation
 * - Educational attainment (key for community colleges)
 * - Age distribution (working-age population)
 * 
 * Uses county-level ACS 5-Year estimates (most stable).
 * Supports multi-county aggregation for service regions.
 */

// ── State FIPS lookup ──

const STATE_FIPS: Record<string, string> = {
  'Alabama': '01', 'Alaska': '02', 'Arizona': '04', 'Arkansas': '05',
  'California': '06', 'Colorado': '08', 'Connecticut': '09', 'Delaware': '10',
  'District of Columbia': '11', 'Florida': '12', 'Georgia': '13', 'Hawaii': '15',
  'Idaho': '16', 'Illinois': '17', 'Indiana': '18', 'Iowa': '19',
  'Kansas': '20', 'Kentucky': '21', 'Louisiana': '22', 'Maine': '23',
  'Maryland': '24', 'Massachusetts': '25', 'Michigan': '26', 'Minnesota': '27',
  'Mississippi': '28', 'Missouri': '29', 'Montana': '30', 'Nebraska': '31',
  'Nevada': '32', 'New Hampshire': '33', 'New Jersey': '34', 'New Mexico': '35',
  'New York': '36', 'North Carolina': '37', 'North Dakota': '38', 'Ohio': '39',
  'Oklahoma': '40', 'Oregon': '41', 'Pennsylvania': '42', 'Rhode Island': '44',
  'South Carolina': '45', 'South Dakota': '46', 'Tennessee': '47', 'Texas': '48',
  'Utah': '49', 'Vermont': '50', 'Virginia': '51', 'Washington': '53',
  'West Virginia': '54', 'Wisconsin': '55', 'Wyoming': '56',
};

// ── Types ──

export interface CensusCountyData {
  countyFips: string;
  stateFips: string;
  countyName: string;
  population: number;
  medianAge: number;
  medianHouseholdIncome: number;
  povertyRate: number;
  employmentRate: number;
  laborForceParticipation: number;
  educationalAttainment: {
    lessThanHighSchool: number;    // % of 25+ population
    highSchoolOrGed: number;
    someCollegeNoDegree: number;
    associatesDegree: number;
    bachelorsDegree: number;
    graduateOrProfessional: number;
  };
  ageDistribution: {
    under18: number;
    age18to24: number;             // prime CC enrollment age
    age25to34: number;             // adult learners
    age35to54: number;             // career changers
    age55plus: number;
  };
  totalLaborForce: number;
  totalEmployed: number;
}

export interface RegionalDemographics {
  counties: CensusCountyData[];
  aggregate: {
    totalPopulation: number;
    weightedMedianIncome: number;
    weightedMedianAge: number;
    overallEmploymentRate: number;
    overallLaborForceParticipation: number;
    overallPovertyRate: number;
    educationalAttainment: CensusCountyData['educationalAttainment'];
    ageDistribution: CensusCountyData['ageDistribution'];
    potentialCCStudentPool: number;  // 18-54 without bachelor's — rough addressable market
  };
  source: string;
  dataYear: string;
}

// ── API Fetcher ──

async function fetchACS(
  variables: string[],
  stateFips: string,
  countyFips: string
): Promise<string[] | null> {
  const apiKey = process.env.CENSUS_API_KEY;
  if (!apiKey) {
    console.warn('[Census] No CENSUS_API_KEY set — skipping');
    return null;
  }

  const varStr = variables.join(',');
  const url = `https://api.census.gov/data/2022/acs/acs5?get=${varStr}&for=county:${countyFips}&in=state:${stateFips}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[Census] API error: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    if (!data || data.length < 2) return null;
    return data[1]; // First row is headers, second is data
  } catch (err) {
    console.error('[Census] Fetch error:', err);
    return null;
  }
}

// ── County FIPS Lookup via Nominatim + Census Coordinate Geocoder ──

async function geocodeCity(city: string, state: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const params = new URLSearchParams({ city, state, country: 'US', format: 'json', limit: '1' });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': 'Wavelength/1.0 (hello@withwavelength.com)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.[0]) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch (err) {
    console.error(`[Census] Nominatim geocode failed for "${city}, ${state}":`, err);
    return null;
  }
}

export async function lookupCountyFips(
  city: string,
  state: string
): Promise<{ stateFips: string; countyFips: string; countyName: string } | null> {
  // Step 1: Geocode city → lat/lng via Nominatim (free, no API key)
  const coords = await geocodeCity(city, state);
  if (!coords) {
    console.warn(`[Census] Could not geocode "${city}, ${state}"`);
    return null;
  }

  // Step 2: lat/lng → county FIPS via Census coordinate geocoder
  try {
    const url = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${coords.lon}&y=${coords.lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const county = data?.result?.geographies?.['Counties']?.[0];
    if (!county) {
      console.warn(`[Census] No county found at coordinates for "${city}, ${state}"`);
      return null;
    }

    return {
      stateFips: county.STATE,
      countyFips: county.COUNTY,
      countyName: county.NAME || `County ${county.COUNTY}`,
    };
  } catch (err) {
    console.error('[Census] Coordinate geocoder error:', err);
    return null;
  }
}

// ── Fetch County Demographics ──

async function fetchCountyDemographics(
  stateFips: string,
  countyFips: string,
  countyName: string
): Promise<CensusCountyData | null> {
  // ACS variable groups:
  // Population & Age
  const popVars = [
    'B01003_001E',  // Total population
    'B01002_001E',  // Median age
  ];

  // Income & Poverty
  const incomeVars = [
    'B19013_001E',  // Median household income
    'B17001_001E',  // Total for poverty status
    'B17001_002E',  // Below poverty level
  ];

  // Employment
  const employVars = [
    'B23025_001E',  // Total 16+ population
    'B23025_002E',  // In labor force
    'B23025_004E',  // Employed (civilian)
    'B23025_005E',  // Unemployed
  ];

  // Educational attainment (25+)
  const eduVars = [
    'B15003_001E',  // Total 25+
    'B15003_002E',  // No schooling
    'B15003_003E',  // Nursery
    'B15003_004E',  // Kindergarten
    'B15003_005E',  // 1st grade
    'B15003_006E',  // 2nd grade
    'B15003_007E',  // 3rd grade
    'B15003_008E',  // 4th grade
    'B15003_009E',  // 5th grade
    'B15003_010E',  // 6th grade
    'B15003_011E',  // 7th grade
    'B15003_012E',  // 8th grade
    'B15003_013E',  // 9th grade
    'B15003_014E',  // 10th grade
    'B15003_015E',  // 11th grade
    'B15003_016E',  // 12th grade no diploma
    'B15003_017E',  // High school diploma
    'B15003_018E',  // GED
    'B15003_019E',  // Some college < 1 year
    'B15003_020E',  // Some college 1+ years no degree
    'B15003_021E',  // Associate's
    'B15003_022E',  // Bachelor's
    'B15003_023E',  // Master's
    'B15003_024E',  // Professional degree
    'B15003_025E',  // Doctorate
  ];

  // Age distribution
  const ageVars = [
    'B01001_001E',  // Total
    'B01001_003E',  // Male under 5
    'B01001_004E',  // Male 5-9
    'B01001_005E',  // Male 10-14
    'B01001_006E',  // Male 15-17
    'B01001_007E',  // Male 18-19
    'B01001_008E',  // Male 20
    'B01001_009E',  // Male 21
    'B01001_010E',  // Male 22-24
    'B01001_011E',  // Male 25-29
    'B01001_012E',  // Male 30-34
    'B01001_013E',  // Male 35-39
    'B01001_014E',  // Male 40-44
    'B01001_015E',  // Male 45-49
    'B01001_016E',  // Male 50-54
    'B01001_017E',  // Male 55-59
    'B01001_018E',  // Male 60-61
    'B01001_019E',  // Male 62-64
    'B01001_020E',  // Male 65-66
    'B01001_021E',  // Male 67-69
    'B01001_022E',  // Male 70-74
    'B01001_023E',  // Male 75-79
    'B01001_024E',  // Male 80-84
    'B01001_025E',  // Male 85+
    'B01001_027E',  // Female under 5
    'B01001_028E',  // Female 5-9
    'B01001_029E',  // Female 10-14
    'B01001_030E',  // Female 15-17
    'B01001_031E',  // Female 18-19
    'B01001_032E',  // Female 20
    'B01001_033E',  // Female 21
    'B01001_034E',  // Female 22-24
    'B01001_035E',  // Female 25-29
    'B01001_036E',  // Female 30-34
    'B01001_037E',  // Female 35-39
    'B01001_038E',  // Female 40-44
    'B01001_039E',  // Female 45-49
    'B01001_040E',  // Female 50-54
    'B01001_041E',  // Female 55-59
    'B01001_042E',  // Female 60-61
    'B01001_043E',  // Female 62-64
    'B01001_044E',  // Female 65-66
    'B01001_045E',  // Female 67-69
    'B01001_046E',  // Female 70-74
    'B01001_047E',  // Female 75-79
    'B01001_048E',  // Female 80-84
    'B01001_049E',  // Female 85+
  ];

  // Batch into two API calls (Census limits ~50 vars per call)
  const batch1Vars = [...popVars, ...incomeVars, ...employVars, ...eduVars];
  const batch2Vars = ageVars;

  const [batch1, batch2] = await Promise.all([
    fetchACS(batch1Vars, stateFips, countyFips),
    fetchACS(batch2Vars, stateFips, countyFips),
  ]);

  if (!batch1) return null;

  // Parse batch 1
  let idx = 0;
  const pop = parseInt(batch1[idx++]) || 0;
  const medAge = parseFloat(batch1[idx++]) || 0;
  const medIncome = parseInt(batch1[idx++]) || 0;
  const povertyTotal = parseInt(batch1[idx++]) || 1;
  const povertyBelow = parseInt(batch1[idx++]) || 0;
  const pop16plus = parseInt(batch1[idx++]) || 1;
  const inLaborForce = parseInt(batch1[idx++]) || 0;
  const employed = parseInt(batch1[idx++]) || 0;
  const _unemployed = parseInt(batch1[idx++]) || 0;

  // Educational attainment
  const eduTotal = parseInt(batch1[idx++]) || 1;
  // Sum up less than HS (vars 002-016)
  let lessThanHS = 0;
  for (let i = 0; i < 15; i++) lessThanHS += parseInt(batch1[idx++]) || 0;
  const hsOrGed = (parseInt(batch1[idx++]) || 0) + (parseInt(batch1[idx++]) || 0); // 017 + 018
  const someCollege = (parseInt(batch1[idx++]) || 0) + (parseInt(batch1[idx++]) || 0); // 019 + 020
  const associates = parseInt(batch1[idx++]) || 0;
  const bachelors = parseInt(batch1[idx++]) || 0;
  const masters = parseInt(batch1[idx++]) || 0;
  const professional = parseInt(batch1[idx++]) || 0;
  const doctorate = parseInt(batch1[idx++]) || 0;

  // Parse batch 2: age distribution
  let under18 = 0, age18to24 = 0, age25to34 = 0, age35to54 = 0, age55plus = 0;
  
  if (batch2) {
    let ai = 0;
    const _ageTotal = parseInt(batch2[ai++]) || 0;
    
    // Process male ages (indices 1-23) and female ages (indices 24-46)
    for (let gender = 0; gender < 2; gender++) {
      const base = gender === 0 ? 0 : 23;
      // Under 5, 5-9, 10-14, 15-17
      under18 += (parseInt(batch2[ai++]) || 0); // under 5
      under18 += (parseInt(batch2[ai++]) || 0); // 5-9
      under18 += (parseInt(batch2[ai++]) || 0); // 10-14
      under18 += (parseInt(batch2[ai++]) || 0); // 15-17
      // 18-19, 20, 21, 22-24
      age18to24 += (parseInt(batch2[ai++]) || 0); // 18-19
      age18to24 += (parseInt(batch2[ai++]) || 0); // 20
      age18to24 += (parseInt(batch2[ai++]) || 0); // 21
      age18to24 += (parseInt(batch2[ai++]) || 0); // 22-24
      // 25-29, 30-34
      age25to34 += (parseInt(batch2[ai++]) || 0); // 25-29
      age25to34 += (parseInt(batch2[ai++]) || 0); // 30-34
      // 35-39, 40-44, 45-49, 50-54
      age35to54 += (parseInt(batch2[ai++]) || 0); // 35-39
      age35to54 += (parseInt(batch2[ai++]) || 0); // 40-44
      age35to54 += (parseInt(batch2[ai++]) || 0); // 45-49
      age35to54 += (parseInt(batch2[ai++]) || 0); // 50-54
      // 55-59, 60-61, 62-64, 65-66, 67-69, 70-74, 75-79, 80-84, 85+
      age55plus += (parseInt(batch2[ai++]) || 0); // 55-59
      age55plus += (parseInt(batch2[ai++]) || 0); // 60-61
      age55plus += (parseInt(batch2[ai++]) || 0); // 62-64
      age55plus += (parseInt(batch2[ai++]) || 0); // 65-66
      age55plus += (parseInt(batch2[ai++]) || 0); // 67-69
      age55plus += (parseInt(batch2[ai++]) || 0); // 70-74
      age55plus += (parseInt(batch2[ai++]) || 0); // 75-79
      age55plus += (parseInt(batch2[ai++]) || 0); // 80-84
      age55plus += (parseInt(batch2[ai++]) || 0); // 85+
    }
  }

  const pctOf = (n: number, total: number) => total > 0 ? Math.round((n / total) * 1000) / 10 : 0;

  return {
    countyFips,
    stateFips,
    countyName,
    population: pop,
    medianAge: medAge,
    medianHouseholdIncome: medIncome,
    povertyRate: pctOf(povertyBelow, povertyTotal),
    employmentRate: pctOf(employed, inLaborForce),
    laborForceParticipation: pctOf(inLaborForce, pop16plus),
    educationalAttainment: {
      lessThanHighSchool: pctOf(lessThanHS, eduTotal),
      highSchoolOrGed: pctOf(hsOrGed, eduTotal),
      someCollegeNoDegree: pctOf(someCollege, eduTotal),
      associatesDegree: pctOf(associates, eduTotal),
      bachelorsDegree: pctOf(bachelors, eduTotal),
      graduateOrProfessional: pctOf(masters + professional + doctorate, eduTotal),
    },
    ageDistribution: {
      under18: pctOf(under18, pop),
      age18to24: pctOf(age18to24, pop),
      age25to34: pctOf(age25to34, pop),
      age35to54: pctOf(age35to54, pop),
      age55plus: pctOf(age55plus, pop),
    },
    totalLaborForce: inLaborForce,
    totalEmployed: employed,
  };
}

// ── Main Public Function ──

/**
 * Fetch real Census demographics for a service region.
 * Resolves cities → county FIPS codes, pulls ACS data, aggregates.
 */
export async function getRegionalDemographics(
  cities: string[],
  state: string
): Promise<RegionalDemographics | null> {
  const stateFips = STATE_FIPS[state];
  if (!stateFips) {
    console.error(`[Census] Unknown state: "${state}"`);
    return null;
  }

  if (!process.env.CENSUS_API_KEY) {
    console.warn('[Census] No CENSUS_API_KEY — skipping demographics');
    return null;
  }

  console.log(`[Census] Fetching demographics for ${cities.join(', ')}, ${state}`);

  // Resolve each city to a county FIPS (dedup counties)
  const seenCounties = new Set<string>();
  const countyLookups: { stateFips: string; countyFips: string; countyName: string }[] = [];

  for (const city of cities) {
    const lookup = await lookupCountyFips(city, state);
    if (lookup && !seenCounties.has(lookup.countyFips)) {
      seenCounties.add(lookup.countyFips);
      countyLookups.push(lookup);
      console.log(`[Census] ${city} → ${lookup.countyName} (FIPS: ${lookup.stateFips}${lookup.countyFips})`);
    }
    // Nominatim usage policy: max 1 request/second
    await new Promise(r => setTimeout(r, 1100));
  }

  if (countyLookups.length === 0) {
    console.warn('[Census] Could not resolve any cities to counties');
    return null;
  }

  // Fetch demographics for each county
  const counties: CensusCountyData[] = [];
  for (const { stateFips: sf, countyFips: cf, countyName: cn } of countyLookups) {
    const data = await fetchCountyDemographics(sf, cf, cn);
    if (data) counties.push(data);
  }

  if (counties.length === 0) {
    console.warn('[Census] No county data returned from API');
    return null;
  }

  // Aggregate across counties
  const totalPop = counties.reduce((s, c) => s + c.population, 0);
  const totalLF = counties.reduce((s, c) => s + c.totalLaborForce, 0);
  const totalEmp = counties.reduce((s, c) => s + c.totalEmployed, 0);

  // Population-weighted averages
  const wAvg = (field: keyof CensusCountyData) =>
    totalPop > 0
      ? Math.round(counties.reduce((s, c) => s + (c[field] as number) * c.population, 0) / totalPop)
      : 0;

  // Aggregate percentages (population-weighted)
  const wPct = (getter: (c: CensusCountyData) => number) =>
    totalPop > 0
      ? Math.round(counties.reduce((s, c) => s + getter(c) * c.population, 0) / totalPop * 10) / 10
      : 0;

  const aggEdu = {
    lessThanHighSchool: wPct(c => c.educationalAttainment.lessThanHighSchool),
    highSchoolOrGed: wPct(c => c.educationalAttainment.highSchoolOrGed),
    someCollegeNoDegree: wPct(c => c.educationalAttainment.someCollegeNoDegree),
    associatesDegree: wPct(c => c.educationalAttainment.associatesDegree),
    bachelorsDegree: wPct(c => c.educationalAttainment.bachelorsDegree),
    graduateOrProfessional: wPct(c => c.educationalAttainment.graduateOrProfessional),
  };

  const aggAge = {
    under18: wPct(c => c.ageDistribution.under18),
    age18to24: wPct(c => c.ageDistribution.age18to24),
    age25to34: wPct(c => c.ageDistribution.age25to34),
    age35to54: wPct(c => c.ageDistribution.age35to54),
    age55plus: wPct(c => c.ageDistribution.age55plus),
  };

  // Potential CC student pool: 18-54 without a bachelor's or higher
  const withoutBachelors = aggEdu.lessThanHighSchool + aggEdu.highSchoolOrGed + aggEdu.someCollegeNoDegree + aggEdu.associatesDegree;
  const workingAgePct = aggAge.age18to24 + aggAge.age25to34 + aggAge.age35to54;
  const potentialPool = Math.round(totalPop * (workingAgePct / 100) * (withoutBachelors / 100));

  // Poverty rate: population-weighted
  const aggPoverty = wPct(c => c.povertyRate);

  console.log(`[Census] Complete — ${counties.length} counties, ${totalPop.toLocaleString()} total population`);

  return {
    counties,
    aggregate: {
      totalPopulation: totalPop,
      weightedMedianIncome: wAvg('medianHouseholdIncome'),
      weightedMedianAge: Math.round(counties.reduce((s, c) => s + c.medianAge * c.population, 0) / totalPop * 10) / 10,
      overallEmploymentRate: totalLF > 0 ? Math.round((totalEmp / totalLF) * 1000) / 10 : 0,
      overallLaborForceParticipation: wPct(c => c.laborForceParticipation),
      overallPovertyRate: aggPoverty,
      educationalAttainment: aggEdu,
      ageDistribution: aggAge,
      potentialCCStudentPool: potentialPool,
    },
    source: 'U.S. Census Bureau, American Community Survey 5-Year Estimates (2022)',
    dataYear: '2022',
  };
}

/**
 * Format Census demographics into a readable string for agent context injection.
 */
export function formatDemographicsForAgent(demo: RegionalDemographics): string {
  const a = demo.aggregate;
  const edu = a.educationalAttainment;
  const age = a.ageDistribution;

  let out = `## Regional Demographics (Source: ${demo.source})\n\n`;
  out += `**Service Area:** ${demo.counties.map(c => c.countyName).join(', ')}\n`;
  out += `**Total Population:** ${a.totalPopulation.toLocaleString()}\n`;
  out += `**Median Age:** ${a.weightedMedianAge}\n`;
  out += `**Median Household Income:** $${a.weightedMedianIncome.toLocaleString()}\n`;
  out += `**Poverty Rate:** ${a.overallPovertyRate}%\n`;
  out += `**Employment Rate:** ${a.overallEmploymentRate}%\n`;
  out += `**Labor Force Participation:** ${a.overallLaborForceParticipation}%\n\n`;

  out += `### Educational Attainment (25+ population)\n`;
  out += `- Less than high school: ${edu.lessThanHighSchool}%\n`;
  out += `- High school or GED: ${edu.highSchoolOrGed}%\n`;
  out += `- Some college, no degree: ${edu.someCollegeNoDegree}%\n`;
  out += `- Associate's degree: ${edu.associatesDegree}%\n`;
  out += `- Bachelor's degree: ${edu.bachelorsDegree}%\n`;
  out += `- Graduate/professional: ${edu.graduateOrProfessional}%\n`;
  out += `- **Without bachelor's or higher: ${(edu.lessThanHighSchool + edu.highSchoolOrGed + edu.someCollegeNoDegree + edu.associatesDegree).toFixed(1)}%**\n\n`;

  out += `### Age Distribution\n`;
  out += `- Under 18: ${age.under18}%\n`;
  out += `- 18–24 (prime enrollment): ${age.age18to24}%\n`;
  out += `- 25–34 (adult learners): ${age.age25to34}%\n`;
  out += `- 35–54 (career changers): ${age.age35to54}%\n`;
  out += `- 55+: ${age.age55plus}%\n\n`;

  out += `**Estimated Addressable Market (18–54 without bachelor's):** ~${a.potentialCCStudentPool.toLocaleString()} people\n`;

  if (demo.counties.length > 1) {
    out += `\n### By County\n`;
    for (const c of demo.counties) {
      out += `- **${c.countyName}:** Pop ${c.population.toLocaleString()}, Median income $${c.medianHouseholdIncome.toLocaleString()}, ${c.employmentRate}% employed\n`;
    }
  }

  return out;
}
