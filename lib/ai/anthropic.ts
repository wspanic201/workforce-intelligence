import Anthropic from '@anthropic-ai/sdk';

let runtimeModelOverride: string | null = null;

/**
 * Process-local runtime model override for orchestration runs.
 * Note: this is process-scoped; orchestrator clears it in finally blocks.
 */
export function setRuntimeModelOverride(model: string | null) {
  runtimeModelOverride = model;
}

export function getRuntimeModelOverride(): string | null {
  return runtimeModelOverride;
}

// Lazy initialization so env vars are available in CLI scripts (dotenv loads at runtime)
// Always create a fresh client to pick up config changes during hot reload
function getAnthropicClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxRetries: 0, // No retries — fail fast, let orchestrator handle errors
  });
}

export interface ClaudeTool {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

export interface AICallOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  /** System message — use for persona instructions and role context */
  system?: string;
  /** Tool definitions for Claude tool_use */
  tools?: ClaudeTool[];
  /**
   * Handler called when Claude requests a tool call.
   * Return the tool result as a string.
   */
  toolHandler?: (name: string, input: Record<string, any>) => Promise<string>;
  /**
   * Max agentic loop iterations when tools are provided.
   * Prevents runaway tool_use cycles. Default: 10.
   */
  maxToolRounds?: number;
}

// ── Streaming + Hard Timeout ────────────────────────────────────────
// Instead of a blocking create() call that hangs silently, we use
// streaming so tokens arrive incrementally. Two kill-switches:
//   1. STALL timeout — if no new token arrives in STALL_MS, abort.
//   2. OVERALL timeout — hard cap on total wall-clock time.
// If we got partial content before the stall, we return it (better
// than nothing). On total failure we throw so orchestrator can skip.

const STALL_TIMEOUT_MS = 45_000;   // 45s with no token = stalled
const OVERALL_TIMEOUT_MS = 10 * 60_000; // 10 min hard cap per call

export async function callClaude(
  prompt: string,
  options: AICallOptions = {}
): Promise<{ content: string; tokensUsed: number }> {
  // TEST MODE: Use cheaper model and lower tokens for testing workflow
  const isTestMode = process.env.TEST_MODE === 'true';
  const defaultModel = isTestMode
    ? (process.env.TEST_MODEL || 'claude-3-5-haiku-20241022')
    : (runtimeModelOverride || process.env.VALIDATION_MODEL || 'claude-sonnet-4-6');
  const defaultMaxTokens = isTestMode
    ? parseInt(process.env.TEST_MAX_TOKENS || '4000')
    : 8000;

  let {
    model = defaultModel,
    maxTokens = defaultMaxTokens,
    temperature = 1.0,
    system,
    tools,
    toolHandler,
    maxToolRounds = 10,
  } = options;

  // Cap maxTokens for Haiku in TEST_MODE (max 8192)
  if (isTestMode && model.includes('haiku') && maxTokens > 8192) {
    console.log(`[TEST MODE] Capping maxTokens from ${maxTokens} to 8192 (Haiku limit)`);
    maxTokens = 8192;
  }

  if (isTestMode) {
    console.log(`[TEST MODE] Using ${model} with ${maxTokens} max tokens (cheap testing)`);
  }

  // If tools are provided and we have a handler, use the agentic tool loop
  if (tools?.length && toolHandler) {
    return callClaudeWithTools(prompt, model, maxTokens, temperature, system, tools, toolHandler, maxToolRounds);
  }

  const startTime = Date.now();

  // Retry wrapper: try once, if stall/timeout retry once, then fail
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await streamWithTimeout({
        prompt, model, maxTokens, temperature, system,
      });

      const duration = Date.now() - startTime;
      console.log(`[Claude API] ✓ Completed in ${Math.round(duration / 1000)}s, ${result.tokensUsed} tokens (attempt ${attempt})`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errMsg = error instanceof Error ? error.message : String(error);

      if (attempt === 1 && (errMsg.includes('stalled') || errMsg.includes('timed out'))) {
        console.warn(`[Claude API] ⚠ Attempt 1 failed after ${Math.round(duration / 1000)}s: ${errMsg} — retrying...`);
        continue; // retry once
      }

      // Check if we got partial content from the error
      if (error instanceof PartialContentError && error.partialContent.length > 200) {
        console.warn(`[Claude API] ⚠ Returning partial content (${error.partialContent.length} chars) after ${errMsg}`);
        return {
          content: error.partialContent,
          tokensUsed: error.tokensUsed || 0,
        };
      }

      console.error(`[Claude API] ✗ Failed after ${Math.round(duration / 1000)}s (model: ${model}, maxTokens: ${maxTokens}): ${errMsg}`);
      throw error;
    }
  }

  // Should never reach here, but TypeScript needs it
  throw new Error('callClaude: exhausted retries');
}

/**
 * Agentic tool_use loop: sends messages to Claude, handles tool_use responses,
 * feeds results back, and continues until Claude produces a final text response.
 */
async function callClaudeWithTools(
  prompt: string,
  model: string,
  maxTokens: number,
  temperature: number,
  system: string | undefined,
  tools: ClaudeTool[],
  toolHandler: (name: string, input: Record<string, any>) => Promise<string>,
  maxRounds: number,
): Promise<{ content: string; tokensUsed: number }> {
  const startTime = Date.now();
  let totalTokens = 0;
  const messages: Array<{ role: string; content: any }> = [
    { role: 'user', content: prompt },
  ];

  for (let round = 0; round < maxRounds; round++) {
    const result = await streamWithTimeout({
      prompt,
      model,
      maxTokens,
      temperature,
      system,
      messages,
      tools,
    });

    totalTokens += result.tokensUsed;

    // If Claude didn't request tool use, we're done
    if (result.stopReason !== 'tool_use') {
      const duration = Date.now() - startTime;
      console.log(`[Claude API] ✓ Tool loop completed in ${Math.round(duration / 1000)}s, ${totalTokens} tokens, ${round + 1} round(s)`);
      return { content: result.content, tokensUsed: totalTokens };
    }

    // Extract tool_use blocks from the response
    const toolUseBlocks = (result.contentBlocks || []).filter(
      (block: any) => block.type === 'tool_use'
    );

    if (toolUseBlocks.length === 0) {
      // stop_reason said tool_use but no tool_use blocks — treat as final
      return { content: result.content, tokensUsed: totalTokens };
    }

    // Add Claude's response (with tool_use blocks) to messages
    messages.push({ role: 'assistant', content: result.contentBlocks });

    // Execute each tool call and build tool_result blocks
    const toolResults: any[] = [];
    for (const block of toolUseBlocks) {
      console.log(`[Claude API] Tool call: ${block.name}(${JSON.stringify(block.input).substring(0, 200)})`);
      try {
        const toolResult = await toolHandler(block.name, block.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: toolResult,
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`[Claude API] Tool ${block.name} failed: ${errMsg}`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: `Error: ${errMsg}`,
          is_error: true,
        });
      }
    }

    // Add tool results to messages
    messages.push({ role: 'user', content: toolResults });
  }

  // If we hit max rounds, return whatever text we have
  console.warn(`[Claude API] Tool loop hit max rounds (${maxRounds}), returning last text`);
  return { content: '', tokensUsed: totalTokens };
}

class PartialContentError extends Error {
  constructor(
    message: string,
    public partialContent: string,
    public tokensUsed: number
  ) {
    super(message);
    this.name = 'PartialContentError';
  }
}

interface StreamOptions {
  prompt: string;
  model: string;
  maxTokens: number;
  temperature: number;
  system?: string;
  messages?: Array<{ role: string; content: any }>;
  tools?: ClaudeTool[];
}

/**
 * Low-level streaming call with stall/timeout detection.
 * Returns the full message response (including tool_use blocks).
 */
async function streamWithTimeout(opts: StreamOptions): Promise<{
  content: string;
  tokensUsed: number;
  stopReason: string;
  contentBlocks: any[];
}> {
  const client = getAnthropicClient();
  const chunks: string[] = [];
  let inputTokens = 0;
  let outputTokens = 0;

  return new Promise((resolve, reject) => {
    let stallTimer: ReturnType<typeof setTimeout> | null = null;
    let overallTimer: ReturnType<typeof setTimeout> | null = null;
    let settled = false;
    let stream: any = null;

    function cleanup() {
      if (stallTimer) clearTimeout(stallTimer);
      if (overallTimer) clearTimeout(overallTimer);
      try { stream?.abort?.(); } catch {}
    }

    function finish(err?: Error, finalMsg?: any) {
      if (settled) return;
      settled = true;
      cleanup();
      if (err) {
        reject(err);
      } else {
        const textContent = chunks.join('');
        const contentBlocks = finalMsg?.content || [{ type: 'text', text: textContent }];
        resolve({
          content: textContent,
          tokensUsed: inputTokens + outputTokens,
          stopReason: finalMsg?.stop_reason || 'end_turn',
          contentBlocks,
        });
      }
    }

    function resetStallTimer() {
      if (stallTimer) clearTimeout(stallTimer);
      stallTimer = setTimeout(() => {
        const partial = chunks.join('');
        if (partial.length > 200) {
          finish(new PartialContentError(
            `Stream stalled (no token for ${STALL_TIMEOUT_MS / 1000}s)`,
            partial,
            inputTokens + outputTokens
          ));
        } else {
          finish(new Error(`Stream stalled after ${STALL_TIMEOUT_MS / 1000}s with only ${partial.length} chars`));
        }
      }, STALL_TIMEOUT_MS);
    }

    // Hard overall timeout
    overallTimer = setTimeout(() => {
      const partial = chunks.join('');
      if (partial.length > 200) {
        finish(new PartialContentError(
          `Overall timeout (${OVERALL_TIMEOUT_MS / 1000}s)`,
          partial,
          inputTokens + outputTokens
        ));
      } else {
        finish(new Error(`Overall timeout after ${OVERALL_TIMEOUT_MS / 1000}s with only ${partial.length} chars`));
      }
    }, OVERALL_TIMEOUT_MS);

    // Build messages
    const messages = opts.messages || [{ role: 'user', content: opts.prompt }];

    // Start streaming
    resetStallTimer();
    const promptLen = typeof opts.prompt === 'string' ? opts.prompt.length : JSON.stringify(messages).length;
    console.log(`[Stream] Starting (model=${opts.model}, maxTokens=${opts.maxTokens}, promptLen=${promptLen}${opts.system ? ', hasSystem=true' : ''}${opts.tools?.length ? `, tools=${opts.tools.length}` : ''})...`);

    (async () => {
      try {
        const streamParams: any = {
          model: opts.model,
          max_tokens: opts.maxTokens,
          temperature: opts.temperature,
          messages,
        };
        if (opts.system) streamParams.system = opts.system;
        if (opts.tools?.length) streamParams.tools = opts.tools;

        stream = client.messages.stream(streamParams);

        let chunkCount = 0;
        stream.on('text', (text: string) => {
          chunks.push(text);
          chunkCount++;
          if (chunkCount === 1) console.log(`[Stream] First token received`);
          if (chunkCount % 200 === 0) console.log(`[Stream] ${chunkCount} chunks, ${chunks.join('').length} chars`);
          resetStallTimer();
        });

        // Also reset stall timer on non-text events (tool_use blocks don't emit text events)
        stream.on('contentBlock', () => resetStallTimer());

        stream.on('message', (msg: any) => {
          if (msg.usage) {
            inputTokens = msg.usage.input_tokens || 0;
            outputTokens = msg.usage.output_tokens || 0;
          }
        });

        stream.on('error', (err: Error) => {
          console.error(`[Stream] Error: ${err.message}`);
          finish(chunks.length > 0
            ? new PartialContentError(`Stream error: ${err.message}`, chunks.join(''), inputTokens + outputTokens)
            : err
          );
        });

        stream.on('end', () => {
          console.log(`[Stream] Complete (${chunkCount} chunks)`);
          stream.finalMessage().then((msg: any) => {
            if (msg?.usage) {
              inputTokens = msg.usage.input_tokens || 0;
              outputTokens = msg.usage.output_tokens || 0;
            }
            finish(undefined, msg);
          }).catch(() => finish());
        });
      } catch (err) {
        console.error(`[Stream] Setup error: ${err}`);
        finish(err instanceof Error ? err : new Error(String(err)));
      }
    })();
  });
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
