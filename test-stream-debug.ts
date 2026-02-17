/**
 * Debug: verify streaming events fire properly with a real agent-sized prompt
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';

async function main() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  console.log('Starting stream...');
  const start = Date.now();
  let chunks = 0;
  let chars = 0;
  
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 4000,
    temperature: 1.0,
    messages: [{
      role: 'user',
      content: 'Write a detailed 1500-word labor market analysis for Pharmacy Technician programs in Cedar Rapids, Iowa. Include wage data, employment projections, and competitive landscape.'
    }],
  });

  stream.on('text', (text: string) => {
    chunks++;
    chars += text.length;
    if (chunks % 50 === 0) {
      const elapsed = Math.round((Date.now() - start) / 1000);
      console.log(`  [${elapsed}s] ${chunks} chunks, ${chars} chars`);
    }
  });

  stream.on('error', (err: Error) => {
    console.error('Stream error:', err.message);
  });

  stream.on('end', () => {
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`\n✓ Stream complete: ${elapsed}s, ${chunks} chunks, ${chars} chars`);
  });

  try {
    const msg = await stream.finalMessage();
    console.log(`Tokens: ${msg.usage.input_tokens} in + ${msg.usage.output_tokens} out`);
    console.log(`Stop reason: ${msg.stop_reason}`);
  } catch (e) {
    console.error('finalMessage error:', e);
  }
}

main();
