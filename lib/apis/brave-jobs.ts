/**
 * Brave Search job data fetcher — replaces SerpAPI Google Jobs.
 * Runs 3 targeted searches, extracts employer signals from snippets,
 * returns ProcessedJobData-compatible shape.
 */

import { ProcessedJobData } from './serpapi';

interface BraveWebResult {
  title: string;
  url: string;
  description: string;
}

interface BraveResponse {
  web?: { results?: BraveWebResult[] };
}

const JOB_BOARDS = ['indeed.com', 'ziprecruiter.com', 'linkedin.com', 'glassdoor.com', 'careerbuilder.com', 'monster.com', 'simplyhired.com'];

// Known large employers by sector — used to cross-reference mentions
const EMPLOYER_PATTERNS = [
  // Healthcare systems
  'unitypoint', 'mercy', 'uihc', 'university of iowa', 'ui health', 'hy-vee', 'hyvee',
  'cvs', 'walgreens', 'walmart', "sam's club", 'target', 'kroger', 'costco',
  'medline', 'mckesson', 'cardinal health', 'ascension', 'allscripts',
  'john deere', 'rockwell', 'transamerica',
  // Generic but common
  'hospital', 'health', 'medical center', 'clinic', 'pharmacy', 'rx',
];

async function braveSearch(query: string, apiKey: string): Promise<BraveWebResult[]> {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10&freshness=pm`;
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const data: BraveResponse = await res.json();
    return data.web?.results || [];
  } catch {
    return [];
  }
}

function extractEmployerFromTitle(title: string): string | null {
  // "Pharmacy Technician at CVS Health" → "CVS Health"
  // "Pharmacy Tech - Hy-Vee Pharmacy" → "Hy-Vee Pharmacy"
  const atMatch = title.match(/ at ([A-Z][^-|]+?)(?:\s*[-|]|$)/);
  if (atMatch) return atMatch[1].trim();
  const dashMatch = title.match(/-\s*([A-Z][A-Za-z\s&]+(?:Health|Medical|Pharmacy|Hospital|Clinic|Care|CVS|Walgreens|Hy-Vee)[A-Za-z\s]*)/);
  if (dashMatch) return dashMatch[1].trim();
  return null;
}

function extractJobCount(text: string): number | null {
  const patterns = [
    /([\d,]+)\+?\s*(?:pharmacy technician|pharm tech)\s*(?:jobs?|positions?|openings?)/i,
    /([\d,]+)\s*(?:jobs?|positions?|openings?)\s*(?:available|found|near|in)/i,
    /(?:over|more than)\s*([\d,]+)\s*(?:jobs?|openings?)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseInt(m[1].replace(/,/g, ''));
  }
  return null;
}

function extractSalaryFromSnippet(text: string): { min: number; max: number } | null {
  // "$18.50 - $24.00 an hour" or "$38,000 - $52,000 a year"
  const hourly = text.match(/\$(\d+(?:\.\d+)?)\s*[-–]\s*\$(\d+(?:\.\d+)?)\s*(?:an?\s*)?hour/i);
  if (hourly) {
    return {
      min: Math.round(parseFloat(hourly[1]) * 2080),
      max: Math.round(parseFloat(hourly[2]) * 2080),
    };
  }
  const annual = text.match(/\$(\d[\d,]+)\s*[-–]\s*\$(\d[\d,]+)\s*(?:a\s*)?year/i);
  if (annual) {
    return {
      min: parseInt(annual[1].replace(/,/g, '')),
      max: parseInt(annual[2].replace(/,/g, '')),
    };
  }
  return null;
}

export async function searchJobsBraveEnhanced(
  occupation: string,
  location: string,
): Promise<ProcessedJobData | null> {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    console.warn('[Brave Jobs] No BRAVE_API_KEY configured');
    return null;
  }

  // Extract primary city + state from location string
  const locationShort = location
    .replace(/\s*\([^)]+\)/g, '')            // strip "(Linn and Johnson Counties)"
    .replace(/\s+(?:and|&)\s+[^,]+,/, ',')  // "Cedar Rapids and Iowa City, Iowa" → "Cedar Rapids, Iowa"
    .replace(/&[^,]+,/, ',')                  // fallback for "&" form
    .trim();

  // Also grab just the state name for broader searches
  const stateOnly = locationShort.split(',').pop()?.trim() || locationShort;

  const queries = [
    `"${occupation}" jobs "${locationShort}" indeed OR ziprecruiter OR linkedin`,
    `"${occupation}" hiring ${stateOnly} 2025 employer`,
    `${occupation} job openings ${stateOnly} healthcare hospital pharmacy`,
  ];

  console.log(`[Brave Jobs] Searching: "${occupation}" in "${locationShort}"`);

  const allResults = (
    await Promise.all(queries.map(q => braveSearch(q, apiKey)))
  ).flat();

  if (allResults.length === 0) {
    console.warn('[Brave Jobs] No results returned');
    return null;
  }

  // Extract employer names from job board result titles
  const employerCounts = new Map<string, number>();
  const salaries: Array<{ min: number; max: number }> = [];
  let totalJobCount = 0;

  for (const result of allResults) {
    const fullText = `${result.title} ${result.description}`;

    // Count from job board snippets
    const count = extractJobCount(fullText);
    if (count && count > totalJobCount) totalJobCount = count;

    // Extract salary
    const salary = extractSalaryFromSnippet(fullText);
    if (salary) salaries.push(salary);

    // Extract employer from job listing titles (e.g. "Pharmacy Tech at UnityPoint Health")
    if (JOB_BOARDS.some(b => result.url.includes(b))) {
      const employer = extractEmployerFromTitle(result.title);
      if (employer && employer.length > 2 && employer.length < 50) {
        employerCounts.set(employer, (employerCounts.get(employer) || 0) + 1);
      }
    }

    // Cross-reference known employer patterns in snippets
    for (const pattern of EMPLOYER_PATTERNS) {
      if (fullText.toLowerCase().includes(pattern)) {
        const key = pattern.charAt(0).toUpperCase() + pattern.slice(1);
        employerCounts.set(key, (employerCounts.get(key) || 0) + 1);
      }
    }
  }

  // Build top employers list
  const topEmployers = Array.from(employerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, openings]) => ({ name, openings }));

  // Salary aggregation
  const salaryMin = salaries.length > 0 ? Math.round(salaries.reduce((s, x) => s + x.min, 0) / salaries.length) : 36000;
  const salaryMax = salaries.length > 0 ? Math.round(salaries.reduce((s, x) => s + x.max, 0) / salaries.length) : 52000;
  const salaryMedian = Math.round((salaryMin + salaryMax) / 2);

  console.log(`[Brave Jobs] ✓ ${allResults.length} results | ~${totalJobCount} estimated postings | ${topEmployers.length} employers found`);

  return {
    count: totalJobCount || allResults.filter(r => JOB_BOARDS.some(b => r.url.includes(b))).length * 10,
    salaries: {
      min: salaryMin,
      max: salaryMax,
      median: salaryMedian,
      ranges: {
        entry: `$${Math.round(salaryMin / 1000)}K`,
        mid: `$${Math.round(salaryMedian / 1000)}K`,
        senior: `$${Math.round(salaryMax / 1000)}K`,
      },
    },
    topEmployers,
    requiredSkills: [],     // Brave snippets don't reliably yield structured skills
    certifications: [],     // Let O*NET + MCP handle this
  };
}
