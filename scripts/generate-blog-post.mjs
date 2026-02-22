#!/usr/bin/env node
/**
 * Wavelength Blog Post Generator
 * Run: node scripts/generate-blog-post.mjs
 *
 * Searches for recent workforce/labor/education news,
 * picks the best topic for Wavelength's audience,
 * writes a full SEO blog post, and deploys it.
 */

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const BLOG_DIR = join(ROOT, 'app/blog');
const SITE_URL = 'https://withwavelength.com';

// ── Step 1: Research recent news ──────────────────────────────────

async function researchTopics() {
  const serpApiKey = process.env.SERPAPI_KEY;
  if (!serpApiKey) throw new Error('SERPAPI_KEY not set');

  const queries = [
    'community college workforce program news this week',
    'BLS labor market report workforce education',
    'Workforce Pell Grant community college update',
    'labor shortage healthcare manufacturing 2026',
    'community college enrollment trends workforce',
    'DOL workforce development grant announcement',
  ];

  const allResults = [];

  for (const query of queries.slice(0, 3)) {
    try {
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&num=5&tbs=qdr:w&api_key=${serpApiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.organic_results) {
        allResults.push(...data.organic_results.slice(0, 3).map(r => ({
          title: r.title,
          snippet: r.snippet,
          url: r.link,
          query,
        })));
      }
    } catch (err) {
      console.warn(`Search failed for: ${query}`, err.message);
    }
  }

  return allResults;
}

// ── Step 2: Pick best topic + write post ─────────────────────────

async function generatePost(newsItems) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const today = new Date().toISOString().split('T')[0];
  const newsContext = newsItems.map(n => `- ${n.title}: ${n.snippet} (${n.url})`).join('\n');

  // Gather existing post slugs/titles to avoid duplicate topics
  // Include retired/removed posts so we never regenerate them
  const existingSlugs = [
    { slug: "dol-65-million-workforce-pell-grants-community-colleges-2026", title: "$65M DOL Workforce Pell Grants: What Community Colleges Need to Know (RETIRED)" },
  ];
  try {
    const entries = (await import('fs')).readdirSync(BLOG_DIR, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) {
        const pagePath = join(BLOG_DIR, e.name, 'page.tsx');
        if (existsSync(pagePath)) {
          const src = readFileSync(pagePath, 'utf8');
          const m = src.match(/title:\s*["'`](.+?)["'`]/);
          existingSlugs.push({ slug: e.name, title: m ? m[1] : e.name });
        }
      }
    }
  } catch (_) { /* ignore */ }

  console.log('Generating blog post...');

  const systemPrompt = `You are a workforce intelligence writer for Wavelength (withwavelength.com) — a platform that helps community colleges develop and maintain programs aligned to labor market demand.

Wavelength's products:
- Free Pell Readiness Check (/pell) — Workforce Pell Grant eligibility scan
- Compliance Gap Report (/compliance-gap) — $295, program portfolio gaps
- Market Scan (/discover) — $1,500, 7-10 vetted new program opportunities
- Program Validation (/validate) — validate a specific program concept
- Curriculum Drift Analysis (/drift) — quarterly curriculum alignment scans

Audience: VPs of Academic Affairs, Workforce Development Directors, Department Chairs, Dean-level leaders at community colleges.

Tone: Direct, data-driven, not stuffy higher ed. Think Stripe Docs meets HBR. Authoritative but accessible. Never fluffy.

Write long-form (1,500–2,500 word) SEO blog posts that lead with real data, explain implications for community college program strategy, and connect naturally to Wavelength's products.

IMPORTANT: Posts must be written as complete Next.js page.tsx files with:
- TypeScript metadata export (title, description, canonical, openGraph with article tags, twitter card)
- Schema.org Article + BreadcrumbList JSON-LD
- JSX using these exact Tailwind theme classes (these adapt to light/dark mode automatically):
  - Outer wrapper: <div className="overflow-x-hidden bg-theme-page">
  - Article wrapper: <article className="max-w-4xl mx-auto px-4 pt-36 lg:pt-40 pb-16">
  - Back link (before header): <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gradient-cosmic hover:opacity-80 transition-opacity mb-6">← Back to Blog</Link>
  - Accent bar: <div className="h-1 w-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-teal-500 mb-10" />
  - H1: className="font-bold leading-tight mb-5 text-theme-primary" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.8rem, 3.5vw, 2.8rem)"}}
  - H2: className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}
  - Body text: className="text-theme-secondary leading-relaxed mb-6"
  - Lists: className="list-disc list-outside pl-6 space-y-2 text-theme-secondary mb-6"
  - Stat grid: className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" with cards: className="bg-theme-surface border border-teal-500/20 rounded-xl p-5 text-center"
  - Callout box: className="bg-theme-surface border border-theme-subtle rounded-xl p-6 mb-8"
  - CTA section: className="bg-gradient-to-r from-violet-900/40 to-teal-900/40 border border-theme-subtle rounded-2xl p-8 mt-12 text-center"
  - Category badge: className="text-xs font-mono text-violet-400 border border-violet-400/30 px-3 py-1 rounded-full"
  - Date/read time: className="text-theme-muted text-sm"
  - Lead paragraph: className="text-theme-tertiary text-xl leading-relaxed"
  - Callout/secondary text: className="text-theme-tertiary leading-relaxed"
  - Footer/metadata text: className="text-theme-muted text-sm"
- Import Link from 'next/link'
- External links to .gov or authoritative sources (BLS, DOL, AACC, etc.) should use <a href="..." target="_blank" rel="noopener noreferrer" className="text-teal-400 underline underline-offset-2 hover:text-teal-300">...</a>`;

  const existingPostsList = existingSlugs.map(p => `- "${p.title}" (/${p.slug})`).join('\n');

  const userPrompt = `Today is ${today}. Here are recent workforce/labor/education news items from the past week:

${newsContext}

EXISTING BLOG POSTS (DO NOT write about topics already covered — pick something DIFFERENT):
${existingPostsList}

Pick the SINGLE most relevant topic for Wavelength's community college audience that is NOT already covered by an existing post. Choose based on:
1. Recency and newsworthiness
2. Direct relevance to community college program development or workforce alignment
3. Opportunity to upsell a Wavelength product naturally
4. MUST be a genuinely different topic from all existing posts above — no overlap in subject matter

Then write a complete Next.js page.tsx blog post file. The post should:
- Have a keyword-optimized slug (e.g., "bls-job-openings-community-college-programs-2026")
- Feature real data from the news item (cite actual stats, source names)
- Explain clear implications for community college program leaders
- Include at least one stat callout grid (3 cards)
- Include 1-2 Wavelength product CTAs woven in naturally
- Be 1,500–2,500 words

RESPOND WITH TWO PARTS:
1. First line: SLUG: [the-url-slug]
2. Then the complete page.tsx file content (starting with imports, no markdown code fences)`;

  let content = '';
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      content += chunk.delta.text;
      process.stdout.write('.');
    }
  }
  console.log('\n');

  return content;
}

// ── Step 3: Parse + write files ──────────────────────────────────

function parseAndSave(generatedContent) {
  const lines = generatedContent.split('\n');
  const slugLine = lines.find(l => l.startsWith('SLUG:'));
  if (!slugLine) throw new Error('No SLUG line found in generated content');

  const slug = slugLine.replace('SLUG:', '').trim();
  const pageContent = lines.slice(lines.indexOf(slugLine) + 1).join('\n').trim();

  // Create directory
  const dir = join(BLOG_DIR, slug);
  mkdirSync(dir, { recursive: true });

  // Write page.tsx
  const pagePath = join(dir, 'page.tsx');
  writeFileSync(pagePath, pageContent);
  console.log(`✅ Created: app/blog/${slug}/page.tsx`);

  return { slug, pageContent };
}

// ── Step 4: Update blog index ────────────────────────────────────

function updateBlogIndex(slug, pageContent) {
  // Extract title and description from metadata
  // Use backtick-delimited strings in output to avoid apostrophe/quote issues
  const titleMatch = pageContent.match(/title:\s*['"](.+?)\s*\|[^'"]*['"]/) || pageContent.match(/title:\s*['"`]([^'"`]+)['"`]/);
  const descMatch = pageContent.match(/description:\s*['"`]([\s\S]+?)['"`]\s*,/);
  let title = titleMatch ? titleMatch[1].trim() : slug;
  title = title.replace(/\s*\|\s*Wavelength$/, ''); // strip " | Wavelength" suffix
  const excerpt = descMatch ? descMatch[1].replace(/\s+/g, ' ').trim().slice(0, 200) : '';

  // Escape for JS template: backticks and ${
  const esc = (s) => s.replace(/`/g, '\\`').replace(/\$/g, '\\$');

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const newPostEntry = `  {
    slug: "${slug}",
    title: \`${esc(title)}\`,
    excerpt: \`${esc(excerpt)}\`,
    date: "${today}",
    readTime: "7 min read",
    category: "Workforce Intelligence",
    dot: "bg-teal-400",
    accent: "from-teal-500/20 to-blue-500/10",
    border: "border-teal-500/30",
    tag: "bg-teal-500/10 text-teal-300",
  },`;

  const blogIndexPath = join(BLOG_DIR, 'page.tsx');
  let indexContent = readFileSync(blogIndexPath, 'utf8');

  // Prepend to posts array
  indexContent = indexContent.replace(
    'const posts = [',
    `const posts = [\n${newPostEntry}`
  );

  writeFileSync(blogIndexPath, indexContent);
  console.log(`✅ Updated: app/blog/page.tsx`);
}

// ── Step 5: Update sitemap ───────────────────────────────────────

function updateSitemap(slug) {
  const sitemapPath = join(ROOT, 'app/sitemap.ts');
  let content = readFileSync(sitemapPath, 'utf8');

  const today = new Date().toISOString().split('T')[0];
  const newEntry = `    {
      url: \`\${siteUrl}/blog/${slug}\`,
      lastModified: new Date("${today}"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },`;

  // Insert before the closing bracket of the array
  content = content.replace(
    /(\s*\]\s*;\s*}\s*$)/,
    `\n${newEntry}\n$1`
  );

  writeFileSync(sitemapPath, content);
  console.log(`✅ Updated: app/sitemap.ts`);
}

// ── Step 6: Build + commit + push ───────────────────────────────

function buildAndDeploy(slug) {
  console.log('Building...');
  try {
    execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
    console.log('✅ Build successful');
  } catch (err) {
    console.error('❌ Build failed — not pushing');
    throw err;
  }

  console.log('Committing and pushing...');
  execSync(`git add app/blog/ app/sitemap.ts`, { cwd: ROOT });
  execSync(`git commit -m "Auto-publish blog post: ${slug}"`, { cwd: ROOT });
  execSync('git push', { cwd: ROOT });
  console.log(`✅ Deployed: ${SITE_URL}/blog/${slug}`);
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Researching recent workforce/labor news...');
  const newsItems = await researchTopics();
  console.log(`Found ${newsItems.length} news items`);

  console.log('✍️  Generating blog post...');
  const generated = await generatePost(newsItems);

  console.log('💾 Saving files...');
  const { slug, pageContent } = parseAndSave(generated);
  updateBlogIndex(slug, pageContent);
  updateSitemap(slug);

  buildAndDeploy(slug);

  console.log(`\n🎉 New post live: ${SITE_URL}/blog/${slug}`);
}

main().catch(err => {
  console.error('❌ Blog generation failed:', err);
  process.exit(1);
});
