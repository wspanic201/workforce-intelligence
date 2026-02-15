import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AICallOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function callClaude(
  prompt: string,
  options: AICallOptions = {}
): Promise<{ content: string; tokensUsed: number }> {
  const {
    model = 'claude-sonnet-4-5',
    maxTokens = 4000,
    temperature = 1.0,
  } = options;

  const startTime = Date.now();

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const duration = Date.now() - startTime;
    const textContent = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as any).text)
      .join('\n');

    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    console.log(`Claude API call completed in ${duration}ms, ${tokensUsed} tokens`);

    return {
      content: textContent,
      tokensUsed,
    };
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

export function extractJSON(content: string): any {
  // Try to extract JSON from markdown code blocks
  const jsonBlockMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
  if (jsonBlockMatch) {
    return JSON.parse(jsonBlockMatch[1]);
  }

  // Try to find JSON object in the content
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  // If no JSON found, try to parse the entire content
  try {
    return JSON.parse(content);
  } catch {
    throw new Error('No valid JSON found in response');
  }
}
