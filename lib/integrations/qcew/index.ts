/**
 * BLS QCEW (Quarterly Census of Employment and Wages) Integration
 * 
 * Authoritative county-level employment data by industry.
 * Free, no API key required. CSV format.
 * 
 * URL pattern: https://data.bls.gov/cew/data/api/{year}/{qtr}/area/{fips}.csv
 * 
 * Data: establishment counts, employment levels, wages by NAICS industry
 * Coverage: All employers covered by unemployment insurance (~98% of jobs)
 * Lag: ~6 months (Q3 2025 data released Feb 2026)
 */

import { withCache } from '../../apis/cache';

// NAICS sector codes → human-readable names
const NAICS_SECTORS: Record<string, string> = {
  '10': 'All Industries',
  '11': 'Agriculture, Forestry, Fishing & Hunting',
  '21': 'Mining, Quarrying, Oil & Gas',
  '22': 'Utilities',
  '23': 'Construction',
  '31-33': 'Manufacturing',
  '42': 'Wholesale Trade',
  '44-45': 'Retail Trade',
  '48-49': 'Transportation & Warehousing',
  '51': 'Information',
  '52': 'Finance & Insurance',
  '53': 'Real Estate',
  '54': 'Professional, Scientific & Technical Services',
  '55': 'Management of Companies',
  '56': 'Administrative & Waste Services',
  '61': 'Educational Services',
  '62': 'Health Care & Social Assistance',
  '71': 'Arts, Entertainment & Recreation',
  '72': 'Accommodation & Food Services',
  '81': 'Other Services',
  '92': 'Public Administration',
};

// Key NAICS sub-industries worth surfacing
const NAICS_SUBSECTORS: Record<string, string> = {
  '311': 'Food Manufacturing',
  '312': 'Beverage & Tobacco',
  '321': 'Wood Products',
  '325': 'Chemicals',
  '326': 'Plastics & Rubber',
  '331': 'Primary Metals',
  '332': 'Fabricated Metal Products',
  '333': 'Machinery Manufacturing',
  '334': 'Computer & Electronic Products',
  '335': 'Electrical Equipment & Appliances',
  '336': 'Transportation Equipment',
  '337': 'Furniture',
  '339': 'Miscellaneous Manufacturing',
  '423': 'Merchant Wholesalers (Durable)',
  '424': 'Merchant Wholesalers (Nondurable)',
  '484': 'Truck Transportation',
  '493': 'Warehousing & Storage',
  '511': 'Publishing',
  '517': 'Telecommunications',
  '518': 'Data Processing & Hosting',
  '521': 'Monetary Authorities',
  '522': 'Credit Intermediation',
  '523': 'Securities & Investments',
  '524': 'Insurance Carriers',
  '541': 'Professional & Technical Services',
  '551': 'Management of Companies',
  '561': 'Administrative Services',
  '611': 'Educational Services',
  '621': 'Ambulatory Health Care',
  '622': 'Hospitals',
  '623': 'Nursing & Residential Care',
  '624': 'Social Assistance',
};

export interface IndustryEmployment {
  naicsCode: string;
  industryName: string;
  establishments: number;
  employment: number;
  avgWeeklyWage: number;
  avgAnnualWage: number;
  totalQuarterlyWages: number;
  yearOverYearChange: number | null;  // percentage
  locationQuotient: number | null;
}

export interface CountyEmploymentProfile {
  fips: string;
  year: number;
  quarter: number;
  totalEmployment: number;
  totalEstablishments: number;
  avgWeeklyWage: number;
  sectors: IndustryEmployment[];      // NAICS 2-digit sectors
  topSubsectors: IndustryEmployment[]; // NAICS 3-digit with 500+ employees
}

/**
 * Fetch QCEW data for a county by FIPS code.
 * Returns employment breakdown by NAICS industry.
 */
export async function fetchCountyEmployment(
  fips: string,
  year?: number,
  quarter?: number
): Promise<CountyEmploymentProfile | null> {
  // QCEW data has ~6 month lag. Try quarters going backwards from ~2 quarters ago.
  // Feb 2026 → Q3 2025 just released, try Q3→Q2→Q1 of prev year
  const now = new Date();
  const candidates: Array<[number, number]> = [];
  
  if (year && quarter) {
    candidates.push([year, quarter]);
  } else {
    // Generate candidates: start ~2 quarters back, try 4 options
    const monthsBack = [6, 9, 12, 3]; // most likely to least likely
    for (const mb of monthsBack) {
      const d = new Date(now.getFullYear(), now.getMonth() - mb, 1);
      const y = d.getFullYear();
      const q = Math.floor(d.getMonth() / 3) + 1;
      if (!candidates.some(([cy, cq]) => cy === y && cq === q)) {
        candidates.push([y, q]);
      }
    }
  }

  // Try each candidate until one works
  const csvText = await withCache<string>(
    'qcew_county',
    { fips, candidates: candidates.map(c => c.join('Q')).join(',') },
    async () => {
      for (const [y, q] of candidates) {
        const url = `https://data.bls.gov/cew/data/api/${y}/${q}/area/${fips}.csv`;
        console.log(`[QCEW] Trying ${url}`);
        const resp = await fetch(url);
        if (resp.ok) {
          console.log(`[QCEW] ✓ Got Q${q} ${y} data`);
          return resp.text();
        }
        console.log(`[QCEW] Q${q} ${y} → ${resp.status}`);
      }
      throw new Error(`QCEW: No data available for FIPS ${fips} (tried ${candidates.map(([y,q]) => `Q${q} ${y}`).join(', ')})`);
    },
    168 // 7 day cache
  );

  if (!csvText) return null;

  // Parse CSV
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  
  const rows = lines.slice(1).filter(l => l.trim()).map(line => {
    const values = line.split(',').map(v => v.replace(/"/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });

  // Filter for private sector (own_code=5)
  const privateRows = rows.filter(r => r.own_code === '5');

  // Get total private employment (industry_code=10, agglvl_code=71)
  const totalRow = rows.find(r => r.own_code === '0' && r.industry_code === '10' && r.agglvl_code === '70');

  // Get sector-level data (agglvl_code=74 for NAICS sectors under private ownership)
  const sectorRows = privateRows.filter(r => r.agglvl_code === '74');
  const sectors: IndustryEmployment[] = sectorRows
    .map(r => ({
      naicsCode: r.industry_code,
      industryName: NAICS_SECTORS[r.industry_code] || `NAICS ${r.industry_code}`,
      establishments: parseInt(r.qtrly_estabs) || 0,
      employment: parseInt(r.month3_emplvl) || 0,
      avgWeeklyWage: parseInt(r.avg_wkly_wage) || 0,
      avgAnnualWage: (parseInt(r.avg_wkly_wage) || 0) * 52,
      totalQuarterlyWages: parseInt(r.total_qtrly_wages) || 0,
      yearOverYearChange: r.oty_month3_emplvl_pct_chg ? parseFloat(r.oty_month3_emplvl_pct_chg) : null,
      locationQuotient: r.lq_month3_emplvl ? parseFloat(r.lq_month3_emplvl) : null,
    }))
    .filter(s => s.employment > 0)
    .sort((a, b) => b.employment - a.employment);

  // Get subsector-level data (agglvl_code=75 for 3-digit NAICS) with 500+ employees
  const subsectorRows = privateRows.filter(r => r.agglvl_code === '75');
  const topSubsectors: IndustryEmployment[] = subsectorRows
    .map(r => ({
      naicsCode: r.industry_code,
      industryName: NAICS_SUBSECTORS[r.industry_code] || `NAICS ${r.industry_code}`,
      establishments: parseInt(r.qtrly_estabs) || 0,
      employment: parseInt(r.month3_emplvl) || 0,
      avgWeeklyWage: parseInt(r.avg_wkly_wage) || 0,
      avgAnnualWage: (parseInt(r.avg_wkly_wage) || 0) * 52,
      totalQuarterlyWages: parseInt(r.total_qtrly_wages) || 0,
      yearOverYearChange: r.oty_month3_emplvl_pct_chg ? parseFloat(r.oty_month3_emplvl_pct_chg) : null,
      locationQuotient: r.lq_month3_emplvl ? parseFloat(r.lq_month3_emplvl) : null,
    }))
    .filter(s => s.employment >= 500)
    .sort((a, b) => b.employment - a.employment);

  const actualYear = parseInt(rows[0]?.year) || defaultYear;
  const actualQtr = parseInt(rows[0]?.qtr) || defaultQtr;

  return {
    fips,
    year: actualYear,
    quarter: actualQtr,
    totalEmployment: parseInt(totalRow?.month3_emplvl || '0'),
    totalEstablishments: parseInt(totalRow?.qtrly_estabs || '0'),
    avgWeeklyWage: parseInt(totalRow?.avg_wkly_wage || '0'),
    sectors,
    topSubsectors,
  };
}

/**
 * Fetch employment profiles for multiple counties and merge.
 * Returns combined employment data for a service region.
 */
export async function fetchRegionEmployment(
  countyFips: string[],
  year?: number,
  quarter?: number
): Promise<{
  counties: CountyEmploymentProfile[];
  combinedSectors: IndustryEmployment[];
  totalEmployment: number;
  totalEstablishments: number;
}> {
  const counties: CountyEmploymentProfile[] = [];
  
  for (const fips of countyFips) {
    const profile = await fetchCountyEmployment(fips, year, quarter);
    if (profile) counties.push(profile);
  }

  // Combine sectors across counties
  const sectorMap = new Map<string, IndustryEmployment>();
  for (const county of counties) {
    for (const sector of county.sectors) {
      const existing = sectorMap.get(sector.naicsCode);
      if (existing) {
        existing.establishments += sector.establishments;
        existing.employment += sector.employment;
        existing.totalQuarterlyWages += sector.totalQuarterlyWages;
        // Recalculate weighted average wage
        existing.avgWeeklyWage = Math.round(existing.totalQuarterlyWages / (existing.employment * 13));
        existing.avgAnnualWage = existing.avgWeeklyWage * 52;
      } else {
        sectorMap.set(sector.naicsCode, { ...sector });
      }
    }
  }

  const combinedSectors = Array.from(sectorMap.values()).sort((a, b) => b.employment - a.employment);

  return {
    counties,
    combinedSectors,
    totalEmployment: counties.reduce((sum, c) => sum + c.totalEmployment, 0),
    totalEstablishments: counties.reduce((sum, c) => sum + c.totalEstablishments, 0),
  };
}

/**
 * Format QCEW data as context for Claude prompts.
 * Provides authoritative employment data to replace web-scraped employer lists.
 */
export function formatQCEWForPrompt(profile: CountyEmploymentProfile): string {
  const lines: string[] = [
    `## BLS QCEW Data — Q${profile.quarter} ${profile.year} (Authoritative)`,
    `Total Employment: ${profile.totalEmployment.toLocaleString()} | Establishments: ${profile.totalEstablishments.toLocaleString()} | Avg Weekly Wage: $${profile.avgWeeklyWage.toLocaleString()}`,
    '',
    '### Employment by Industry Sector (Private, ranked by employment):',
  ];

  for (const s of profile.sectors) {
    const growth = s.yearOverYearChange !== null ? ` (${s.yearOverYearChange > 0 ? '+' : ''}${s.yearOverYearChange}% YoY)` : '';
    const lq = s.locationQuotient !== null && s.locationQuotient >= 1.2 ? ` ★ LQ ${s.locationQuotient.toFixed(2)}` : '';
    lines.push(`- ${s.industryName} [${s.naicsCode}]: ${s.employment.toLocaleString()} jobs, $${s.avgWeeklyWage.toLocaleString()}/wk${growth}${lq}`);
  }

  if (profile.topSubsectors.length > 0) {
    lines.push('');
    lines.push('### Top Sub-Industries (500+ employees):');
    for (const s of profile.topSubsectors.slice(0, 15)) {
      const growth = s.yearOverYearChange !== null ? ` (${s.yearOverYearChange > 0 ? '+' : ''}${s.yearOverYearChange}% YoY)` : '';
      const lq = s.locationQuotient !== null && s.locationQuotient >= 1.2 ? ` ★ HIGH CONCENTRATION` : '';
      lines.push(`- ${s.industryName} [${s.naicsCode}]: ${s.employment.toLocaleString()} jobs, $${(s.avgWeeklyWage * 52).toLocaleString()}/yr avg${growth}${lq}`);
    }
  }

  lines.push('');
  lines.push('Source: U.S. Bureau of Labor Statistics, Quarterly Census of Employment and Wages');

  return lines.join('\n');
}
