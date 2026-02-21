/**
 * Catalog Gap: Catalog Scanner Agent
 *
 * Scrapes a college's website to build the list of programs/courses
 * they currently offer. Simplified version of the pell-audit catalog
 * scraper — we only need program names for the gap comparison.
 *
 * Returns: list of program names (with normalized names for matching)
 */

import { searchWeb, fetchPage, batchSearch } from '@/lib/apis/web-research';
import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import type { CatalogScanOutput, OfferedProgram } from '../types';

// ── Main Agent ──

export async function scanCatalog(
  collegeName: string,
  state: string,
  siteUrl?: string,
  city?: string,
): Promise<CatalogScanOutput> {
  const ts = () => new Date().toISOString();
  console.log(`\n[${ts()}][Catalog Scanner] Starting for ${collegeName}`);
  const startTime = Date.now();
  let searchCount = 0;

  // ── Step 1: Locate the institution's website ──
  let resolvedUrl = siteUrl;
  if (!resolvedUrl) {
    console.log(`[${ts()}][Catalog Scanner] No URL provided — searching for website...`);
    const findSite = await searchWeb(
      `${collegeName} ${state} official website`,
    );
    searchCount++;
    const firstResult = findSite.results[0]?.url;
    if (firstResult) {
      try {
        const parsed = new URL(firstResult);
        resolvedUrl = `${parsed.protocol}//${parsed.hostname}`;
      } catch {
        resolvedUrl = firstResult;
      }
    }
  }

  if (!resolvedUrl) {
    throw new Error(`Could not locate website for ${collegeName}`);
  }

  console.log(`[${ts()}][Catalog Scanner] Site URL: ${resolvedUrl}`);

  // Extract domain for site: searches
  let domain = '';
  try {
    domain = new URL(resolvedUrl).hostname;
  } catch {
    domain = resolvedUrl.replace(/https?:\/\//, '').split('/')[0];
  }

  // ── Step 2: Find program-listing pages ──
  console.log(`[${ts()}][Catalog Scanner] Searching for program pages...`);

  const searchQueries = [
    `site:${domain} programs certificates degrees`,
    `site:${domain} continuing education workforce training`,
    `site:${domain} noncredit certificate programs`,
    `site:${domain} career technical education catalog`,
    `${collegeName} all programs catalog ${new Date().getFullYear()}`,
    `${collegeName} workforce development certificate training`,
  ];

  const searchResults = await batchSearch(searchQueries, { delayMs: 400 });
  searchCount += searchQueries.length;

  // Collect unique URLs that look like program pages
  const programUrls = new Set<string>();
  for (const sr of searchResults) {
    for (const r of sr.results.slice(0, 5)) {
      if (r.url && r.url.includes(domain)) programUrls.add(r.url);
    }
  }

  // Append common catalog paths
  const commonPaths = [
    '/programs',
    '/academics/programs',
    '/academics',
    '/continuing-education',
    '/workforce',
    '/workforce-development',
    '/catalog',
    '/academic-catalog',
    '/ce',
    '/noncredit',
    '/certificates',
    '/degrees-certificates',
    '/career-training',
    '/professional-development',
  ];
  for (const p of commonPaths) programUrls.add(`${resolvedUrl}${p}`);

  console.log(
    `[${ts()}][Catalog Scanner] Found ${programUrls.size} candidate pages`,
  );

  // ── Step 3: Fetch pages (cap at 12) ──
  console.log(`[${ts()}][Catalog Scanner] Fetching program pages...`);
  const pageContents: Array<{ url: string; text: string }> = [];
  let fetchCount = 0;
  const MAX_PAGES = 12;

  for (const url of programUrls) {
    if (fetchCount >= MAX_PAGES) break;
    try {
      const page = await fetchPage(url, 10000);
      if (
        page.text.length > 200 &&
        (page.text.toLowerCase().includes('program') ||
          page.text.toLowerCase().includes('certificate') ||
          page.text.toLowerCase().includes('training') ||
          page.text.toLowerCase().includes('credential') ||
          page.text.toLowerCase().includes('degree'))
      ) {
        pageContents.push({ url: page.url, text: page.text });
        fetchCount++;
      }
    } catch {
      // Skip failed fetches silently
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(
    `[${ts()}][Catalog Scanner] Fetched ${pageContents.length} relevant pages`,
  );

  // ── Step 4: AI extraction ──
  console.log(`[${ts()}][Catalog Scanner] Extracting program names with AI...`);

  const combinedText = pageContents
    .map(p => `\n--- SOURCE: ${p.url} ---\n${p.text}`)
    .join('\n');

  const MAX_CONTEXT = 45000;
  const contextText =
    combinedText.length > MAX_CONTEXT
      ? combinedText.slice(0, MAX_CONTEXT) + '\n[...truncated]'
      : combinedText;

  const extractionPrompt = `You are a program catalog extraction specialist. Extract EVERY educational program, certificate, training course, and credential offered by ${collegeName}.

INSTITUTION: ${collegeName}${city ? `, ${city}` : ''}, ${state}

SCRAPED WEB CONTENT:
${contextText}

INSTRUCTIONS:
1. List EVERY distinct program, certificate, degree, course, or training offering you find — both credit and noncredit
2. Include short-term workforce training, continuing education, professional development
3. Do NOT invent programs not mentioned in the text
4. Be thorough — community colleges typically offer 40–200+ programs

Return JSON:
{
  "programs": [
    "CNA (Certified Nurse Aide) Training",
    "Cosmetology",
    "HVAC Technology",
    "Business Administration AAS",
    "Medical Billing and Coding Certificate",
    "ServSafe Food Safety Manager"
  ]
}

Return ONLY valid JSON. No markdown. List every program name exactly as found.`;

  const extraction = await callClaude(extractionPrompt, {
    maxTokens: 6000,
    temperature: 0.1,
  });

  console.log(
    `[${ts()}][Catalog Scanner] AI response: ${extraction.content.length} chars`,
  );

  let parsed: any;
  try {
    parsed = extractJSON(extraction.content);
  } catch {
    console.warn(`[${ts()}][Catalog Scanner] JSON parse failed, using empty list`);
    parsed = { programs: [] };
  }

  const rawNames: string[] = Array.isArray(parsed.programs)
    ? parsed.programs.filter((p: any) => typeof p === 'string' && p.trim().length > 0)
    : [];

  const programs: OfferedProgram[] = rawNames.map(name => ({
    name: name.trim(),
    normalizedName: normalizeProgramName(name),
  }));

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(
    `[${ts()}][Catalog Scanner] Complete: ${programs.length} programs found in ${duration}s`,
  );

  return {
    collegeName,
    siteUrl: resolvedUrl,
    programs,
    totalFound: programs.length,
    scrapedAt: new Date().toISOString(),
    searchesUsed: searchCount,
  };
}

// ── Helpers ──

export function normalizeProgramName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // strip parenthetical qualifiers
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
