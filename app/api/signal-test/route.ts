import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Step 1: Test news fetch
    console.log('[Test] Step 1: Fetching news...');
    const { fetchNewsWithFallback } = await import('@/lib/signal/news-sources');
    const newsResult = await fetchNewsWithFallback();
    console.log('[Test] News fetched:', newsResult.source, newsResult.items.length, 'items');

    if (newsResult.items.length < 3) {
      return NextResponse.json({ 
        error: 'Not enough news', 
        source: newsResult.source, 
        count: newsResult.items.length 
      });
    }

    // Step 2: Test Claude call
    console.log('[Test] Step 2: Calling Claude...');
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ 
        role: 'user', 
        content: 'Return ONLY this JSON: {"test": true, "message": "Signal works"}' 
      }],
    });
    
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log('[Test] Claude response:', text.substring(0, 200));

    return NextResponse.json({
      success: true,
      newsSource: newsResult.source,
      newsCount: newsResult.items.length,
      claudeResponse: text.substring(0, 200),
      model: response.model,
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('[Test] Error:', msg);
    return NextResponse.json({ error: msg, stack: stack?.substring(0, 500) }, { status: 500 });
  }
}
