/**
 * Phase 1: Catalog Scraper Agent
 * 
 * Scrapes an institution's website to build a comprehensive inventory
 * of their current programs — credit and noncredit. Uses a combination
 * of targeted web searches and direct page fetching to find program
 * listings, catalog pages, and workforce training offerings.
 * 
 * Output: A structured list of every program we can find, with as much
 * detail as available (hours, credentials, tuition, department).
 */

import { searchWeb, fetchPage, batchSearch } from '@/lib/apis/web-research';
import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import type { CatalogScrapeOutput, ScrapedProgram } from '../types';

// ── Main Agent ──

export async function scrapeCatalog(
  collegeName: string,
  state: string,
  collegeUrl?: string,
  city?: string
): Promise<CatalogScrapeOutput> {
  console.log(`\n[Catalog Scraper] Starting for ${collegeName}`);
  const startTime = Date.now();
  let searchCount = 0;
  const catalogUrls: string[] = [];

  // ── Step 1: Find the institution's website if not provided ──
  let siteUrl = collegeUrl;
  if (!siteUrl) {
    console.log('[Catalog Scraper] No URL provided, searching...');
    const findSite = await searchWeb(`${collegeName} ${state} official website`);
    searchCount++;
    siteUrl = findSite.results[0]?.url || null;
    if (siteUrl) {
      // Extract base domain
      try {
        const parsed = new URL(siteUrl);
        siteUrl = `${parsed.protocol}//${parsed.hostname}`;
      } catch {}
    }
  }

  if (!siteUrl) {
    throw new Error(`Could not find website for ${collegeName}`);
  }

  console.log(`[Catalog Scraper] Institution URL: ${siteUrl}`);

  // ── Step 2: Targeted searches for program pages ──
  console.log('[Catalog Scraper] Searching for program pages...');

  // Extract domain for site: searches
  let domain = '';
  try {
    domain = new URL(siteUrl).hostname;
  } catch {
    domain = siteUrl.replace(/https?:\/\//, '').split('/')[0];
  }

  const searchQueries = [
    `site:${domain} programs certificates degrees`,
    `site:${domain} continuing education workforce training`,
    `site:${domain} noncredit certificate programs`,
    `site:${domain} career technical education catalog`,
    `site:${domain} short-term training credentials`,
    `${collegeName} program catalog ${new Date().getFullYear()}`,
    `${collegeName} workforce development noncredit programs`,
    `${collegeName} continuing education certificate programs`,
  ];

  const searchResults = await batchSearch(searchQueries, { delayMs: 400 });
  searchCount += searchQueries.length;

  // Collect unique program-related URLs
  const programUrls = new Set<string>();
  for (const sr of searchResults) {
    for (const result of sr.results.slice(0, 5)) {
      if (result.url && result.url.includes(domain)) {
        programUrls.add(result.url);
      }
    }
  }

  // Also try common catalog paths
  const commonPaths = [
    '/programs', '/academics/programs', '/academics',
    '/continuing-education', '/workforce', '/workforce-development',
    '/catalog', '/academic-catalog', '/ce', '/noncredit',
    '/certificates', '/degrees-certificates',
    '/career-training', '/professional-development',
  ];

  for (const path of commonPaths) {
    programUrls.add(`${siteUrl}${path}`);
  }

  console.log(`[Catalog Scraper] Found ${programUrls.size} potential program pages to check`);

  // ── Step 3: Fetch program pages (cap at 15 to manage time) ──
  console.log('[Catalog Scraper] Fetching program pages...');
  
  const pageContents: Array<{ url: string; text: string }> = [];
  let fetchCount = 0;
  const maxPages = 15;

  for (const url of programUrls) {
    if (fetchCount >= maxPages) break;
    try {
      const page = await fetchPage(url, 12000);
      // Only keep pages that look like they have program info
      if (page.text.length > 200 && 
          (page.text.toLowerCase().includes('program') || 
           page.text.toLowerCase().includes('certificate') ||
           page.text.toLowerCase().includes('training') ||
           page.text.toLowerCase().includes('credential') ||
           page.text.toLowerCase().includes('degree'))) {
        pageContents.push({ url: page.url, text: page.text });
        catalogUrls.push(url);
        fetchCount++;
      }
    } catch (err) {
      // Skip failed fetches
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`[Catalog Scraper] Fetched ${pageContents.length} relevant program pages`);

  // ── Step 4: AI extraction — have Claude parse programs from page content ──
  console.log('[Catalog Scraper] Extracting programs with AI...');

  // Chunk pages to stay within context limits (~60K chars max)
  const combinedText = pageContents
    .map(p => `\n--- SOURCE: ${p.url} ---\n${p.text}`)
    .join('\n');

  // If too large, truncate to most relevant pages
  const maxContextChars = 55000;
  const contextText = combinedText.length > maxContextChars 
    ? combinedText.slice(0, maxContextChars) + '\n[...additional pages truncated]'
    : combinedText;

  const extractionPrompt = `You are a program catalog extraction specialist. Your job is to extract EVERY educational program, certificate, training course, and credential from the following web pages scraped from ${collegeName}'s website.

INSTITUTION: ${collegeName}
STATE: ${state}
${city ? `CITY: ${city}` : ''}

SCRAPED WEB PAGES:
${contextText}

EXTRACTION INSTRUCTIONS:
1. Extract EVERY distinct program, certificate, degree, training course, micro-credential, or workforce program mentioned
2. Include both CREDIT programs (degrees, certificates) and NONCREDIT programs (continuing education, workforce training, professional development)
3. For each program, extract as much detail as you can find:
   - Exact program name
   - Department or division
   - Credential type (AAS, Certificate, Diploma, Noncredit Certificate, Micro-credential, etc.)
   - Description (1-2 sentences)
   - Clock hours or credit hours if mentioned
   - Duration/weeks if mentioned
   - Tuition/cost if mentioned
   - Whether it's credit or noncredit
   - Source URL where you found it
   - Related occupation(s)
4. Do NOT invent programs that aren't mentioned in the text
5. If you can't determine a field, use null
6. Estimate clock hours from credit hours if needed (1 credit hour ≈ 45 clock hours for lecture, 60 for lab)

CRITICAL: Be thorough. Extract even briefly-mentioned programs. Community colleges often have 50-200+ programs. I need ALL of them.

Also extract basic institution info:
- Full official name
- City and state
- Type (community college, technical college, etc.)
- Accreditation if mentioned

Return JSON in this exact format:
{
  "institution": {
    "name": "Full Official Name",
    "url": "${siteUrl}",
    "city": "City",
    "state": "${state}",
    "type": "Community College",
    "accreditation": "HLC" or null
  },
  "programs": [
    {
      "name": "Program Name",
      "department": "Department or Division",
      "credentialType": "Certificate|AAS|Diploma|Noncredit Certificate|Micro-credential|etc.",
      "description": "Brief description",
      "estimatedHours": 600 or null,
      "estimatedWeeks": 16 or null,
      "tuition": "$2,500" or null,
      "isCredit": true,
      "url": "https://source-page.edu/...",
      "relatedOccupation": "Occupation title" or null
    }
  ]
}

Return ONLY valid JSON. No markdown, no explanations.`;

  const extraction = await callClaude(extractionPrompt, {
    maxTokens: 16000,  // Large colleges can have 100+ programs
    temperature: 0.1,  // Low temp for extraction accuracy
  });

  // Debug: log the response structure
  console.log(`[Catalog Scraper] AI response length: ${extraction.content.length} chars`);
  const hasPrograms = extraction.content.includes('"programs"');
  const hasBrackets = extraction.content.includes('"programs": [') || extraction.content.includes('"programs":[');
  console.log(`[Catalog Scraper] Contains "programs" key: ${hasPrograms}, array: ${hasBrackets}`);
  
  let parsed: any;
  try {
    parsed = extractJSON(extraction.content);
    // Verify we actually got programs
    if (!parsed.programs || !Array.isArray(parsed.programs) || parsed.programs.length === 0) {
      console.warn(`[Catalog Scraper] extractJSON returned object but programs array is ${JSON.stringify(parsed.programs)?.slice(0, 100)}`);
      throw new Error('No programs in parsed result — try recovery');
    }
  } catch (err) {
    console.warn('[Catalog Scraper] Standard extraction failed, trying recovery...');
    // Try multiple recovery strategies
    // Strategy 1: Strip code fences and try full parse
    try {
      const stripped = extraction.content
        .replace(/```(?:json)?\s*\n?/g, '')
        .replace(/\n?```/g, '')
        .trim();
      parsed = JSON.parse(stripped);
      if (parsed.programs?.length > 0) {
        console.log(`[Catalog Scraper] Recovery Strategy 1: ${parsed.programs.length} programs from stripped content`);
      } else {
        parsed = null;
      }
    } catch {}

    // Strategy 2: Find the first { that precedes "institution" or "programs"
    if (!parsed) {
      try {
        const instIdx = extraction.content.indexOf('"institution"');
        const progIdx = extraction.content.indexOf('"programs"');
        const targetIdx = Math.min(
          instIdx >= 0 ? instIdx : Infinity,
          progIdx >= 0 ? progIdx : Infinity
        );
        if (targetIdx < Infinity) {
          // Walk backward to find the opening {
          let startIdx = targetIdx;
          while (startIdx > 0 && extraction.content[startIdx] !== '{') startIdx--;
          
          let jsonStr = extraction.content.substring(startIdx);
          // Auto-close any open brackets/braces
          let braces = 0, brackets = 0, inStr = false, esc = false;
          for (const ch of jsonStr) {
            if (esc) { esc = false; continue; }
            if (ch === '\\') { esc = true; continue; }
            if (ch === '"') { inStr = !inStr; continue; }
            if (inStr) continue;
            if (ch === '{') braces++;
            if (ch === '}') braces--;
            if (ch === '[') brackets++;
            if (ch === ']') brackets--;
          }
          if (inStr) jsonStr += '"';
          jsonStr = jsonStr.replace(/,\s*$/, '');
          while (brackets > 0) { jsonStr += ']'; brackets--; }
          while (braces > 0) { jsonStr += '}'; braces--; }
          
          // Clean common JSON issues
          jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');
          
          parsed = JSON.parse(jsonStr);
          console.log(`[Catalog Scraper] Recovery Strategy 2: ${(parsed.programs || []).length} programs from auto-closed JSON`);
        }
      } catch (e) {
        console.warn('[Catalog Scraper] Strategy 2 failed:', (e as Error).message?.slice(0, 100));
      }
    }

    // Strategy 3: Extract individual program objects via regex
    if (!parsed || !(parsed.programs?.length > 0)) {
      try {
        const programPattern = /\{[^{}]*"name"\s*:\s*"[^"]+?"[^{}]*"credentialType"\s*:\s*"[^"]+?"[^{}]*\}/g;
        const matches = extraction.content.match(programPattern);
        if (matches && matches.length > 0) {
          const programs = matches.map(m => {
            try { return JSON.parse(m); } catch { return null; }
          }).filter(Boolean);
          if (programs.length > 0) {
            parsed = { programs, institution: {} };
            console.log(`[Catalog Scraper] Recovery Strategy 3: ${programs.length} programs from regex extraction`);
          }
        }
      } catch {}
    }

    if (!parsed) {
      // Last resort: save raw response for debugging
      const debugPath = `/tmp/pell-audit-raw-response-${Date.now()}.txt`;
      const { writeFileSync: wfs } = await import('fs');
      wfs(debugPath, extraction.content);
      console.error(`[Catalog Scraper] All recovery failed. Raw response saved to ${debugPath}`);
    }
    
    if (!parsed) {
      console.error('[Catalog Scraper] All parse attempts failed');
      return {
        institution: {
          name: collegeName,
          url: siteUrl,
          city: city || '',
          state,
          type: 'Community College',
          accreditation: null,
        },
        programs: [],
        catalogUrls,
        totalProgramsFound: 0,
        scrapedAt: new Date().toISOString(),
        searchesUsed: searchCount,
      };
    }
  }

  const programs: ScrapedProgram[] = (parsed.programs || []).map((p: any) => ({
    name: p.name || 'Unknown Program',
    department: p.department || 'Unknown',
    credentialType: p.credentialType || 'Unknown',
    description: p.description || '',
    estimatedHours: p.estimatedHours || null,
    estimatedWeeks: p.estimatedWeeks || null,
    tuition: p.tuition || null,
    isCredit: p.isCredit ?? true,
    url: p.url || siteUrl,
    relatedOccupation: p.relatedOccupation || null,
  }));

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Catalog Scraper] Complete: ${programs.length} programs found in ${duration}s`);

  return {
    institution: {
      name: parsed.institution?.name || collegeName,
      url: parsed.institution?.url || siteUrl,
      city: parsed.institution?.city || city || '',
      state: parsed.institution?.state || state,
      type: parsed.institution?.type || 'Community College',
      accreditation: parsed.institution?.accreditation || null,
    },
    programs,
    catalogUrls,
    totalProgramsFound: programs.length,
    scrapedAt: new Date().toISOString(),
    searchesUsed: searchCount,
  };
}
