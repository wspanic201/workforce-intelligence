/**
 * Quick test: verify streaming + timeout works correctly
 * Run: npx tsx test-streaming.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { callClaude } from './lib/ai/anthropic';

async function main() {
  console.log('=== Streaming + Timeout Test ===\n');
  
  // Test 1: Short response — should complete fast
  console.log('Test 1: Short prompt (should complete in <10s)...');
  const start1 = Date.now();
  try {
    const result = await callClaude('Reply with exactly: "Streaming works!" Nothing else.', {
      maxTokens: 100,
    });
    const dur = Math.round((Date.now() - start1) / 1000);
    console.log(`  ✓ Got: "${result.content.trim()}" (${dur}s, ${result.tokensUsed} tokens)\n`);
  } catch (e) {
    console.error(`  ✗ Failed: ${e}\n`);
  }

  // Test 2: Medium response — simulates an agent generating a few paragraphs
  console.log('Test 2: Medium prompt (~500 tokens output)...');
  const start2 = Date.now();
  try {
    const result = await callClaude(
      'Write a 3-paragraph analysis of community college workforce development programs. Be specific and factual.',
      { maxTokens: 2000 }
    );
    const dur = Math.round((Date.now() - start2) / 1000);
    console.log(`  ✓ ${result.content.length} chars (${dur}s, ${result.tokensUsed} tokens)\n`);
  } catch (e) {
    console.error(`  ✗ Failed: ${e}\n`);
  }

  console.log('=== All tests done ===');
}

main().catch(console.error);
