import Anthropic from '@anthropic-ai/sdk';

// Lazy initialization so env vars are available in CLI scripts (dotenv loads at runtime)
let _anthropic: Anthropic | null = null;
function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 10 * 60 * 1000, // 10 minutes (for 16k token depth agents)
      maxRetries: 2,
    });
  }
  return _anthropic;
}

export interface AICallOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function callClaude(
  prompt: string,
  options: AICallOptions = {}
): Promise<{ content: string; tokensUsed: number }> {
  // TEST MODE: Use cheaper model and lower tokens for testing workflow
  const isTestMode = process.env.TEST_MODE === 'true';
  const defaultModel = isTestMode 
    ? (process.env.TEST_MODEL || 'claude-3-5-haiku-20241022')  // Claude 3.5 Haiku
    : 'claude-3-5-sonnet-20241022';  // Claude 3.5 Sonnet
  const defaultMaxTokens = isTestMode
    ? parseInt(process.env.TEST_MAX_TOKENS || '4000')
    : 8000;
  
  let {
    model = defaultModel,
    maxTokens = defaultMaxTokens,
    temperature = 1.0,
  } = options;
  
  // Cap maxTokens for Haiku in TEST_MODE (max 8192)
  if (isTestMode && model.includes('haiku') && maxTokens > 8192) {
    console.log(`[TEST MODE] Capping maxTokens from ${maxTokens} to 8192 (Haiku limit)`);
    maxTokens = 8192;
  }
  
  if (isTestMode) {
    console.log(`[TEST MODE] Using ${model} with ${maxTokens} max tokens (cheap testing)`);
  }

  const startTime = Date.now();

  try {
    const response = await getAnthropicClient().messages.create({
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

function cleanJSON(str: string): string {
  // Remove trailing commas before } or ]
  let cleaned = str.replace(/,\s*([\]}])/g, '$1');
  // Remove comments
  cleaned = cleaned.replace(/\/\/[^\n]*/g, '');
  // Fix unescaped newlines in strings
  cleaned = cleaned.replace(/(?<=:\s*"[^"]*)\n([^"]*")/g, '\\n$1');
  // Remove control characters inside strings (except \n \r \t)
  cleaned = cleaned.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
  return cleaned;
}

function stripCodeFences(content: string): string {
  // Remove markdown code fences (```json ... ``` or ``` ... ```)
  return content.replace(/```(?:json)?\s*\n?/g, '').replace(/\n?```/g, '').trim();
}

function autoCloseBrackets(str: string): string {
  // Count open/close braces and brackets, auto-close truncated JSON
  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '[') brackets++;
    else if (ch === ']') brackets--;
  }

  // If we're inside a string, close it
  let result = str;
  if (inString) {
    result += '"';
  }

  // Remove any trailing comma
  result = result.replace(/,\s*$/, '');

  // Close open brackets/braces
  while (brackets > 0) { result += ']'; brackets--; }
  while (braces > 0) { result += '}'; braces--; }

  return result;
}

function findLargestJSON(content: string): any | null {
  // Try to find and parse the largest valid JSON substring
  const starts: number[] = [];
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') starts.push(i);
  }

  let best: any = null;
  let bestLen = 0;

  for (const start of starts) {
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < content.length; i++) {
      const ch = content[i];
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          const candidate = content.substring(start, i + 1);
          if (candidate.length > bestLen) {
            try {
              const parsed = JSON.parse(candidate);
              best = parsed;
              bestLen = candidate.length;
            } catch {
              try {
                const parsed = JSON.parse(cleanJSON(candidate));
                best = parsed;
                bestLen = candidate.length;
              } catch { /* skip */ }
            }
          }
          break;
        }
      }
    }
  }

  return best;
}

export function extractJSON(content: string): any {
  const attempts: Array<() => any> = [];

  // Method 1: Try extracting from code fence
  const fenceMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    const jsonStr = fenceMatch[1].trim();
    attempts.push(() => JSON.parse(jsonStr));
    attempts.push(() => JSON.parse(cleanJSON(jsonStr)));
  }

  // Method 2: Strip all code fences and try
  const stripped = stripCodeFences(content);
  attempts.push(() => JSON.parse(stripped));
  attempts.push(() => JSON.parse(cleanJSON(stripped)));

  // Method 3: Try finding JSON object/array
  const objectMatch = content.match(/(\{[\s\S]*\})/);
  if (objectMatch) {
    attempts.push(() => JSON.parse(objectMatch[1]));
    attempts.push(() => JSON.parse(cleanJSON(objectMatch[1])));
  }

  const arrayMatch = content.match(/(\[[\s\S]*\])/);
  if (arrayMatch) {
    attempts.push(() => JSON.parse(arrayMatch[1]));
    attempts.push(() => JSON.parse(cleanJSON(arrayMatch[1])));
  }

  // Method 4: Try parsing entire content
  attempts.push(() => JSON.parse(content));
  attempts.push(() => JSON.parse(cleanJSON(content)));

  // Method 5: Auto-close truncated JSON
  if (objectMatch) {
    attempts.push(() => JSON.parse(autoCloseBrackets(cleanJSON(objectMatch[1]))));
  }
  attempts.push(() => JSON.parse(autoCloseBrackets(cleanJSON(stripped))));

  for (const attempt of attempts) {
    try {
      return attempt();
    } catch {
      // Try next method
    }
  }

  // Method 6: Find the largest valid JSON substring
  console.warn('[JSON Extraction] Standard methods failed, trying largest valid JSON substring...');
  const largest = findLargestJSON(content);
  if (largest) {
    console.warn('[JSON Extraction] Recovered via largest valid JSON substring');
    return largest;
  }

  // Method 7: Regex fallback — extract key fields for score-based agents
  console.warn('[JSON Extraction] Attempting regex fallback for key fields...');
  const scoreMatch = content.match(/"score"\s*:\s*(\d+)/);
  const rationaleMatch = content.match(/"scoreRationale"\s*:\s*"([^"]+)"/);
  if (scoreMatch) {
    console.warn('[JSON Extraction] Recovered score via regex fallback');
    const fallback: any = {
      score: parseInt(scoreMatch[1]),
      scoreRationale: rationaleMatch ? rationaleMatch[1] : 'Score extracted from partial response',
      _partialParse: true,
    };
    return fallback;
  }

  console.error('[JSON Extraction] All parse attempts failed');
  console.error('[JSON Extraction] Content preview:', content.substring(0, 500));
  throw new Error(`Invalid JSON in AI response: could not parse after all attempts`);
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
