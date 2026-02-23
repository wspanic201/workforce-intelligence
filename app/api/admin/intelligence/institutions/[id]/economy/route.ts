import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Economy Profile API
 * Aggregates CBP employer data + demographics for an institution's service area counties.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Get service area counties
  const { data: areas, error: aErr } = await supabase
    .from('intel_service_areas')
    .select('county_fips, county_name, is_primary')
    .eq('institution_id', id);

  if (aErr || !areas?.length) {
    return NextResponse.json({ error: 'No service area defined', counties: 0 }, { status: 404 });
  }

  const countyFips = areas.map(a => a.county_fips);
  const countyNames = areas.map(a => a.county_name.replace(' County', ''));

  // 2. Get employer/industry data for those counties
  // CBP data uses county name in the 'city' field
  const { data: employers } = await supabase
    .from('intel_employers')
    .select('naics_code, estimated_employees, notes, city')
    .in('city', countyNames.map(n => n + ' County'))
    .eq('state', 'IA'); // TODO: make state dynamic

  // Aggregate by NAICS sector
  const NAICS_NAMES: Record<string, string> = {
    '11': 'Agriculture, Forestry, Fishing & Hunting',
    '21': 'Mining, Quarrying & Oil/Gas',
    '23': 'Construction',
    '31-33': 'Manufacturing',
    '42': 'Wholesale Trade',
    '44-45': 'Retail Trade',
    '48-49': 'Transportation & Warehousing',
    '51': 'Information',
    '52': 'Finance & Insurance',
    '54': 'Professional & Technical Services',
    '56': 'Administrative & Waste Services',
    '61': 'Educational Services',
    '62': 'Health Care & Social Assistance',
    '72': 'Accommodation & Food Services',
    '81': 'Other Services',
  };

  const industryAgg: Record<string, { employees: number; establishments: number; name: string }> = {};
  for (const e of (employers || [])) {
    const code = e.naics_code || 'unknown';
    if (!industryAgg[code]) industryAgg[code] = { employees: 0, establishments: 0, name: NAICS_NAMES[code] || code };
    industryAgg[code].employees += e.estimated_employees || 0;
    // Parse establishment count from notes
    const estMatch = e.notes?.match(/^(\d+)\s+establishments?/);
    if (estMatch) industryAgg[code].establishments += parseInt(estMatch[1]);
  }

  const industries = Object.entries(industryAgg)
    .map(([code, data]) => ({ naics_code: code, ...data }))
    .sort((a, b) => b.employees - a.employees);

  const totalEmployees = industries.reduce((s, i) => s + i.employees, 0);
  const totalEstablishments = industries.reduce((s, i) => s + i.establishments, 0);

  // 3. Get demographics for those counties
  const { data: demos } = await supabase
    .from('intel_county_demographics')
    .select('county_name, total_population, median_household_income, poverty_rate, bachelors_or_higher_pct, unemployment_rate')
    .in('county_fips', countyFips);

  const totalPopulation = (demos || []).reduce((s, d) => s + (d.total_population || 0), 0);
  const avgMedianIncome = demos?.length
    ? Math.round((demos || []).reduce((s, d) => s + (d.median_household_income || 0), 0) / demos.length)
    : null;
  const avgPovertyRate = demos?.length
    ? Math.round(((demos || []).reduce((s, d) => s + (d.poverty_rate || 0), 0) / demos.length) * 10) / 10
    : null;
  const avgBachelors = demos?.length
    ? Math.round(((demos || []).reduce((s, d) => s + (d.bachelors_or_higher_pct || 0), 0) / demos.length) * 10) / 10
    : null;
  const avgUnemployment = demos?.length
    ? Math.round(((demos || []).reduce((s, d) => s + (d.unemployment_rate || 0), 0) / demos.length) * 10) / 10
    : null;

  return NextResponse.json({
    service_area: {
      counties: areas.length,
      county_list: areas.map(a => ({ fips: a.county_fips, name: a.county_name, is_primary: a.is_primary })),
    },
    economy: {
      total_employees: totalEmployees,
      total_establishments: totalEstablishments,
      top_industries: industries.slice(0, 10),
      all_industries: industries,
    },
    demographics: {
      total_population: totalPopulation,
      avg_median_household_income: avgMedianIncome,
      avg_poverty_rate: avgPovertyRate,
      avg_bachelors_or_higher_pct: avgBachelors,
      avg_unemployment_rate: avgUnemployment,
      county_details: demos || [],
    },
    source: {
      employers: 'Census County Business Patterns 2022',
      demographics: 'Census ACS 2023 (5-year 2019-2023)',
    },
  });
}
