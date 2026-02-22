/**
 * Signal Newsletter Content Generator
 * Takes an array of news items and uses Claude to generate structured
 * newsletter content for "The Signal by Wavelength".
 */

import { callClaude, extractJSON } from '@/lib/ai/anthropic';

export interface NewsItem {
  title: string;
  url: string;
  snippet: string;
  date?: string;
}

export interface LaborMarketSignal {
  headline: string;
  body: string;
}

export interface WorkforceNewsItem {
  headline: string;
  summary: string;
  url: string;
}

export interface IndustrySpotlight {
  sector: string;
  headline: string;
  body: string;
}

export interface SignalContent {
  laborMarketSignal: LaborMarketSignal;
  workforceNews: WorkforceNewsItem[];
  industrySpotlight: IndustrySpotlight;
  edition: string; // e.g. "February 18, 2026"
}

export async function generateSignalContent(
  newsItems: NewsItem[]
): Promise<SignalContent> {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Chicago',
  });

  const newsBlock = newsItems
    .map(
      (item, i) =>
        `[${i + 1}] ${item.title}\nURL: ${item.url}\nDate: ${item.date || 'recent'}\nSummary: ${item.snippet}`
    )
    .join('\n\n');

  const prompt = `You are the editor of "The Signal by Wavelength" — a workforce intelligence newsletter for community college continuing education (CE) directors and workforce development teams.

Today's date: ${today}

Your audience:
- Community college CE directors managing workforce programs
- Workforce development teams that train adult learners
- People who care about: labor market trends, employer demand, grant funding, program development, regional economic shifts
- Increasingly concerned about: AI's impact on workforce training, employer AI adoption requirements, new technology skills gaps, automation displacing/creating jobs

Tone: Smart, direct, practitioner-level. NOT academic. Like a trusted colleague who reads everything so you don't have to. Short sentences. Real insights. No fluff.

Here are the news items you have available to work with:

${newsBlock}

Using these news items, generate the newsletter content in the following JSON structure. Be specific and grounded in the actual news — don't make things up. Where a URL is relevant, use the URL from the source material above.

Return ONLY valid JSON in this exact structure:

{
  "laborMarketSignal": {
    "headline": "One sharp, specific headline about the most important labor market data point or trend (max 12 words)",
    "body": "2-3 sentences explaining the signal and WHY it matters to CE directors. Be specific about numbers if available. What should they DO with this information?"
  },
  "workforceNews": [
    {
      "headline": "News headline (close to the original, max 15 words)",
      "summary": "1-2 sentences of context. What does this mean for workforce programs? Be direct.",
      "url": "source URL from the news items above"
    },
    {
      "headline": "...",
      "summary": "...",
      "url": "..."
    },
    {
      "headline": "...",
      "summary": "...",
      "url": "..."
    }
  ],
  "industrySpotlight": {
    "sector": "Sector name (e.g. 'Healthcare', 'Advanced Manufacturing', 'Logistics')",
    "headline": "One strong headline about this sector's workforce story right now (max 12 words)",
    "body": "3-4 sentences. Pick the sector with the most interesting workforce story from the news. Explain what's happening, what's driving it, and specifically why CE teams at community colleges should be paying attention. Include any program, certification, or training angle. Stories about employers requiring AI proficiency, new AI tools changing job requirements, or companies tying promotions to tech adoption are ESPECIALLY relevant — these directly impact what CE programs should be offering."
  },
  "edition": "${today}"
}`;

  console.log('[Signal] Generating newsletter content with Claude...');
  
  // Use direct API call (non-streaming) to avoid streaming stall issues
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  let content: string;
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      temperature: 1.0,
      messages: [{ role: 'user', content: prompt }],
    });
    content = response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (apiError) {
    console.error('[Signal] Anthropic API error:', apiError);
    throw apiError;
  }

  console.log('[Signal] Raw Claude response length:', content.length);
  console.log('[Signal] First 500 chars:', content.substring(0, 500));

  const parsed = extractJSON(content) as SignalContent;

  console.log('[Signal] Parsed object keys:', Object.keys(parsed));
  console.log('[Signal] laborMarketSignal:', parsed.laborMarketSignal ? 'present' : 'MISSING');

  // Validate structure
  if (!parsed.laborMarketSignal?.headline || !parsed.laborMarketSignal?.body) {
    console.error('[Signal] Full parsed object:', JSON.stringify(parsed, null, 2));
    console.error('[Signal] Full Claude response:', content);
    throw new Error('[Signal] Missing laborMarketSignal in Claude response');
  }
  if (!Array.isArray(parsed.workforceNews) || parsed.workforceNews.length < 2) {
    throw new Error('[Signal] Missing or insufficient workforceNews in Claude response');
  }
  if (!parsed.industrySpotlight?.sector || !parsed.industrySpotlight?.body) {
    throw new Error('[Signal] Missing industrySpotlight in Claude response');
  }

  // Ensure edition is set
  parsed.edition = parsed.edition || today;

  console.log(`[Signal] Content generated: "${parsed.laborMarketSignal.headline}"`);
  return parsed;
}
