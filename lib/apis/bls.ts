/**
 * BLS (Bureau of Labor Statistics) API integration
 * Using Official API v2: https://www.bls.gov/developers/
 * 
 * For wage and employment data, we use OEWS (Occupational Employment and Wage Statistics) series.
 */

export interface BLSWageData {
  employment_total: number | null;
  median_wage: number | null;
  mean_wage: number | null;
  wage_percentiles: {
    p10: number | null;
    p25: number | null;
    p75: number | null;
    p90: number | null;
  };
  employment_per_1000: number | null;
  year: number;
  source: string;
}

/**
 * OES Data Type Codes (last 2 digits of series ID)
 */
const OES_DATA_TYPES = {
  EMPLOYMENT: '01',
  HOURLY_MEAN_WAGE: '03',
  ANNUAL_MEAN_WAGE: '04',
  HOURLY_10TH_PERCENTILE: '07',
  HOURLY_25TH_PERCENTILE: '08',
  HOURLY_MEDIAN: '10',
  HOURLY_75TH_PERCENTILE: '11',
  ANNUAL_MEDIAN: '12',
  ANNUAL_75TH_PERCENTILE: '13',
  ANNUAL_90TH_PERCENTILE: '14',
} as const;

/**
 * Build OES Series ID
 * 
 * Format: OE{seasonal}{areaType}{area:7}{industry:6}{occupation:6}{datatype:2}
 * Example: OEUN0000000000000292052012 (national, pharmacy tech, annual median wage)
 * 
 * - OE = survey prefix
 * - U = unadjusted (seasonal code)
 * - N = national / M = metro / S = state
 * - 0000000 = national area code
 * - 000000 = all industries
 * - 292052 = SOC code without dash
 * - 12 = annual median wage
 */
function buildOESSeriesId(params: {
  socCode: string;       // e.g. "29-2052"
  dataType: string;      // e.g. "12" for annual median
  areaCode?: string;     // 7-digit BLS area code, defaults to national
}): string {
  const survey = 'OE';
  const seasonal = 'U';  // Unadjusted
  const areaType = params.areaCode && params.areaCode !== '0000000' ? 'M' : 'N'; // Metro or National
  const area = (params.areaCode || '0000000').padStart(7, '0');
  const industry = '000000';  // All industries
  const occupation = params.socCode.replace(/[-.]/g, '').slice(0, 6);  // "29-2052.00" → "292052"
  const dataType = params.dataType.padStart(2, '0');

  return `${survey}${seasonal}${areaType}${area}${industry}${occupation}${dataType}`;
}

/**
 * Fetch wage and employment data from BLS API v2.
 * @param socCode e.g. "29-2052" or "29-2052.00"
 * @param year Optional year (defaults to 2023-2024 range for latest OES data)
 */
export async function getBLSData(socCode: string, year?: number): Promise<BLSWageData | null> {
  const apiKey = process.env.BLS_API_KEY;
  if (!apiKey) {
    console.warn('[BLS API] No BLS_API_KEY configured');
    return null;
  }

  try {
    // Build series IDs for all wage/employment data points
    const seriesIds = [
      buildOESSeriesId({ socCode, dataType: OES_DATA_TYPES.EMPLOYMENT }),
      buildOESSeriesId({ socCode, dataType: OES_DATA_TYPES.ANNUAL_MEDIAN }),
      buildOESSeriesId({ socCode, dataType: OES_DATA_TYPES.ANNUAL_MEAN_WAGE }),
      buildOESSeriesId({ socCode, dataType: OES_DATA_TYPES.HOURLY_10TH_PERCENTILE }),
      buildOESSeriesId({ socCode, dataType: OES_DATA_TYPES.HOURLY_25TH_PERCENTILE }),
      buildOESSeriesId({ socCode, dataType: OES_DATA_TYPES.ANNUAL_75TH_PERCENTILE }),
      buildOESSeriesId({ socCode, dataType: OES_DATA_TYPES.ANNUAL_90TH_PERCENTILE }),
    ];

    // OES data is released annually in May for the prior year
    // Default to 2023-2024 range to get latest available
    const startYear = year || 2023;
    const endYear = year || 2024;

    const requestBody = {
      seriesid: seriesIds,
      registrationkey: apiKey,
      startyear: startYear.toString(),
      endyear: endYear.toString(),
    };

    console.log(`[BLS API] Fetching data for SOC ${socCode}...`);

    const response = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`[BLS API] HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.status !== 'REQUEST_SUCCEEDED') {
      console.warn(`[BLS API] Request failed: ${data.message?.[0] || 'Unknown error'}`);
      return null;
    }

    // Extract latest values from each series
    const results: Record<string, number | null> = {};
    
    for (const series of data.Results?.series || []) {
      const seriesId = series.seriesID;
      const dataTypeCode = seriesId.slice(-2);  // Last 2 digits
      
      // Get latest data point (sorted newest first)
      const latestData = series.data?.[0];
      
      if (latestData?.value && latestData.value !== '-' && latestData.value !== '*') {
        const value = parseFloat(latestData.value.replace(/,/g, ''));
        
        // Map data type code to our result fields
        if (dataTypeCode === OES_DATA_TYPES.EMPLOYMENT) {
          results.employment = value;
        } else if (dataTypeCode === OES_DATA_TYPES.ANNUAL_MEDIAN) {
          results.median_wage = value;
        } else if (dataTypeCode === OES_DATA_TYPES.ANNUAL_MEAN_WAGE) {
          results.mean_wage = value;
        } else if (dataTypeCode === OES_DATA_TYPES.HOURLY_10TH_PERCENTILE) {
          results.p10_hourly = value;
        } else if (dataTypeCode === OES_DATA_TYPES.HOURLY_25TH_PERCENTILE) {
          results.p25_hourly = value;
        } else if (dataTypeCode === OES_DATA_TYPES.ANNUAL_75TH_PERCENTILE) {
          results.p75_annual = value;
        } else if (dataTypeCode === OES_DATA_TYPES.ANNUAL_90TH_PERCENTILE) {
          results.p90_annual = value;
        }
      }
    }

    // Convert hourly percentiles to annual (×2,080 hours)
    const toAnnual = (hourly: number | null) => (hourly ? Math.round(hourly * 2080) : null);

    const yearValue = parseInt(data.Results?.series?.[0]?.data?.[0]?.year || new Date().getFullYear().toString());

    console.log(`[BLS API] Retrieved ${Object.keys(results).length} data points for ${socCode} (${yearValue})`);

    return {
      employment_total: results.employment || null,
      employment_per_1000: null,  // Not requested in this query
      median_wage: results.median_wage || null,
      mean_wage: results.mean_wage || null,
      wage_percentiles: {
        p10: toAnnual(results.p10_hourly || null),
        p25: toAnnual(results.p25_hourly || null),
        p75: results.p75_annual || null,
        p90: results.p90_annual || null,
      },
      year: yearValue,
      source: 'BLS Occupational Employment and Wage Statistics (OEWS)',
    };
  } catch (err) {
    console.warn('[BLS API] Error:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Get state-level wage data for a specific occupation.
 * @param socCode e.g. "29-2052"
 * @param stateFips e.g. "19" for Iowa
 */
export async function getBLSStateData(
  socCode: string,
  stateFips: string,
  year?: number
): Promise<BLSWageData | null> {
  const apiKey = process.env.BLS_API_KEY;
  if (!apiKey) {
    console.warn('[BLS API] No BLS_API_KEY configured');
    return null;
  }

  try {
    // State area code: 00{FIPS}000 (e.g., 0019000 for Iowa)
    const stateAreaCode = `00${stateFips.padStart(2, '0')}000`;

    const seriesIds = [
      buildOESSeriesId({ socCode, dataType: OES_DATA_TYPES.EMPLOYMENT, areaCode: stateAreaCode }),
      buildOESSeriesId({ socCode, dataType: OES_DATA_TYPES.ANNUAL_MEDIAN, areaCode: stateAreaCode }),
      buildOESSeriesId({ socCode, dataType: OES_DATA_TYPES.ANNUAL_MEAN_WAGE, areaCode: stateAreaCode }),
    ];

    const startYear = year || 2023;
    const endYear = year || 2024;

    const requestBody = {
      seriesid: seriesIds,
      registrationkey: apiKey,
      startyear: startYear.toString(),
      endyear: endYear.toString(),
    };

    const response = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`[BLS API] HTTP ${response.status} for state ${stateFips}`);
      return null;
    }

    const data = await response.json();

    if (data.status !== 'REQUEST_SUCCEEDED') {
      console.warn(`[BLS API] State request failed: ${data.message?.[0] || 'Unknown error'}`);
      return null;
    }

    const results: Record<string, number | null> = {};
    
    for (const series of data.Results?.series || []) {
      const dataTypeCode = series.seriesID.slice(-2);
      const latestData = series.data?.[0];
      
      if (latestData?.value && latestData.value !== '-') {
        const value = parseFloat(latestData.value.replace(/,/g, ''));
        
        if (dataTypeCode === OES_DATA_TYPES.EMPLOYMENT) {
          results.employment = value;
        } else if (dataTypeCode === OES_DATA_TYPES.ANNUAL_MEDIAN) {
          results.median_wage = value;
        } else if (dataTypeCode === OES_DATA_TYPES.ANNUAL_MEAN_WAGE) {
          results.mean_wage = value;
        }
      }
    }

    const yearValue = parseInt(data.Results?.series?.[0]?.data?.[0]?.year || new Date().getFullYear().toString());

    return {
      employment_total: results.employment || null,
      employment_per_1000: null,
      median_wage: results.median_wage || null,
      mean_wage: results.mean_wage || null,
      wage_percentiles: { p10: null, p25: null, p75: null, p90: null },
      year: yearValue,
      source: `BLS OEWS - State FIPS ${stateFips}`,
    };
  } catch (err) {
    console.warn('[BLS API] State data error:', err instanceof Error ? err.message : err);
    return null;
  }
}
