/**
 * Quick Grant Pipeline Debug — Tests each agent individually
 */
import 'dotenv/config';
import { scanGrants } from '../lib/stages/grant-finder/agents/grant-scanner';
import { callClaude } from '../lib/ai/anthropic';
import { searchWeb } from '../lib/apis/web-research';

async function main() {
  console.log('ENV CHECK:');
  console.log('  ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? `set (${process.env.ANTHROPIC_API_KEY.slice(0,12)}...)` : 'NOT SET');
  console.log('  SERPAPI_KEY:', process.env.SERPAPI_KEY ? `set (${process.env.SERPAPI_KEY.slice(0,8)}...)` : 'NOT SET');
  console.log('');

  // Test 1: Direct Claude call
  console.log('=== Test 1: Direct Claude Call ===');
  try {
    const r = await callClaude('Say hello in 3 words', { maxTokens: 50 });
    console.log('✅ Claude works:', r.content);
  } catch (e: any) {
    console.error('❌ Claude FAILED:', e.message);
    return;
  }

  // Test 2: Web search
  console.log('\n=== Test 2: Web Search ===');
  try {
    const r = await searchWeb('Valencia College Orlando Florida');
    console.log('✅ Web search works:', r.results.length, 'results');
  } catch (e: any) {
    console.error('❌ Web search FAILED:', e.message);
  }

  // Test 3: Grant scanner (Grants.gov API — no Claude)
  console.log('\n=== Test 3: Grant Scanner ===');
  let grants: any[] = [];
  try {
    const scan = await scanGrants({
      collegeName: 'Valencia College',
      state: 'Florida',
      city: 'Orlando',
      programFocusAreas: ['healthcare', 'IT/cybersecurity'],
    });
    grants = scan.grants;
    console.log('✅ Scanner found', grants.length, 'grants');
  } catch (e: any) {
    console.error('❌ Scanner FAILED:', e.message);
    return;
  }

  // Test 4: Score ONE grant (Agent 3 logic)
  if (grants.length > 0) {
    console.log('\n=== Test 4: Score One Grant (Agent 3 logic) ===');
    const grant = grants[0];
    console.log('Grant:', grant.title?.slice(0, 60));
    try {
      const prompt = `Score this grant for Valencia College (community college in Orlando, FL).
Grant: ${grant.title}
Agency: ${grant.agency}
Award: $${grant.awardFloor || '?'} - $${grant.awardCeiling || '?'}

Return JSON: {"score": 7, "rationale": "brief reason"}`;
      const r = await callClaude(prompt, { maxTokens: 200 });
      console.log('✅ Grant scoring works:', r.content.slice(0, 100));
    } catch (e: any) {
      console.error('❌ Grant scoring FAILED:', e.message);
    }
  }

  console.log('\n=== ALL TESTS COMPLETE ===');
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
