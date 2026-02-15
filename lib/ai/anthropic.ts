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
  try {
    // Method 1: Try extracting from code fence
    const fenceMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (fenceMatch) {
      const jsonStr = fenceMatch[1].trim();
      return JSON.parse(jsonStr);
    }

    // Method 2: Try finding JSON object/array
    const objectMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (objectMatch) {
      return JSON.parse(objectMatch[1]);
    }

    // Method 3: Try parsing entire content
    return JSON.parse(content);
  } catch (error) {
    console.error('[JSON Extraction] Failed to parse AI response');
    console.error('[JSON Extraction] Content was:', content.substring(0, 500));
    
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in AI response: ${error.message}`);
    }
    
    throw new Error(`Failed to extract JSON from AI response: ${error}`);
  }
}

// Add validation helper
export function validateJSON<T>(data: any, schema: Record<string, string>): T {
  const errors: string[] = [];
  
  Object.keys(schema).forEach(key => {
    if (!(key in data)) {
      errors.push(`Missing required field: ${key}`);
    }
  });
  
  if (errors.length > 0) {
    throw new Error(`JSON validation failed: ${errors.join(', ')}`);
  }
  
  return data as T;
}
