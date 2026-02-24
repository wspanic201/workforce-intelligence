/* eslint-disable no-console */

type JsonRpcRequest = {
  jsonrpc: '2.0';
  id?: number | string;
  method: string;
  params?: Record<string, unknown>;
};

type JsonRpcResponse = {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
};

type ToolCall = {
  name: string;
  arguments: Record<string, unknown>;
};

const baseUrl = process.env.MCP_URL ?? 'http://localhost:3000/api/mcp';
const authToken = process.env.WAVELENGTH_MCP_SECRET ?? '';
const REQUEST_TIMEOUT_MS = 10000;

async function fetchWithTimeout(input: string, init: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

function getHeaders(sessionId?: string): HeadersInit {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'mcp-protocol-version': '2025-03-26',
  };

  if (authToken) {
    headers.authorization = `Bearer ${authToken}`;
  }

  if (sessionId) {
    headers['mcp-session-id'] = sessionId;
  }

  return headers;
}

async function postMessage(message: JsonRpcRequest, sessionId?: string): Promise<{ response: JsonRpcResponse; sessionId?: string }> {
  const httpResponse = await fetchWithTimeout(baseUrl, {
    method: 'POST',
    headers: getHeaders(sessionId),
    body: JSON.stringify(message),
  });

  const body = (await httpResponse.json()) as JsonRpcResponse;

  if (!httpResponse.ok) {
    const detail = body.error?.message ?? JSON.stringify(body);
    throw new Error(`HTTP ${httpResponse.status}: ${detail}`);
  }

  if (body.error) {
    throw new Error(`MCP error ${body.error.code}: ${body.error.message}`);
  }

  return {
    response: body,
    sessionId: httpResponse.headers.get('mcp-session-id') ?? sessionId ?? undefined,
  };
}

async function postNotification(method: string, params: Record<string, unknown>, sessionId: string): Promise<void> {
  const httpResponse = await fetchWithTimeout(baseUrl, {
    method: 'POST',
    headers: getHeaders(sessionId),
    body: JSON.stringify({ jsonrpc: '2.0', method, params }),
  });

  if (!httpResponse.ok) {
    const text = await httpResponse.text();
    throw new Error(`Notification ${method} failed: HTTP ${httpResponse.status} ${text}`);
  }
}

function extractText(result: Record<string, unknown> | undefined): string {
  const content = result?.content;
  if (!Array.isArray(content) || content.length === 0) return 'No tool content.';

  const textBlocks = content
    .filter((part): part is { type: string; text?: string } => typeof part === 'object' && part !== null)
    .map((part) => (part.type === 'text' ? part.text ?? '' : ''))
    .filter(Boolean);

  return textBlocks.join('\n').trim() || 'No text response.';
}

async function callTool(tool: ToolCall, sessionId: string): Promise<string> {
  const { response } = await postMessage(
    {
      jsonrpc: '2.0',
      id: `tool-${tool.name}`,
      method: 'tools/call',
      params: {
        name: tool.name,
        arguments: tool.arguments,
      },
    },
    sessionId,
  );

  return extractText(response.result);
}

async function terminateSession(sessionId: string): Promise<void> {
  await fetchWithTimeout(baseUrl, {
    method: 'DELETE',
    headers: getHeaders(sessionId),
  }).catch(() => undefined);
}

async function run(): Promise<void> {
  const startedAt = Date.now();
  console.log(`Testing MCP endpoint: ${baseUrl}`);

  const init = await postMessage({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: {
        name: 'wavelength-mcp-test',
        version: '1.0.0',
      },
    },
  });

  const sessionId = init.sessionId;
  if (!sessionId) {
    throw new Error('Initialize succeeded but no mcp-session-id header was returned.');
  }

  await postNotification('notifications/initialized', {}, sessionId);

  const listTools = await postMessage(
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {},
    },
    sessionId,
  );

  const tools = (listTools.response.result?.tools ?? []) as Array<{ name?: string }>;
  const toolNames = tools.map((tool) => tool.name).filter((name): name is string => typeof name === 'string');

  console.log(`initialize: ok (session ${sessionId})`);
  console.log(`tools/list: ok (${toolNames.length} tools)`);

  const requiredTools: ToolCall[] = [
    { name: 'get_wages', arguments: { socCode: '29-2052', stateCode: 'IA' } },
    { name: 'get_projections', arguments: { socCode: '29-2052', stateFips: 'IA' } },
    { name: 'get_skills', arguments: { onetCode: '29-2052.00' } },
    { name: 'get_employers', arguments: { stateFips: 'IA', naicsPrefix: '62' } },
    { name: 'get_completions', arguments: { cipCode: '51.0805', stateFips: 'IA' } },
    { name: 'get_state_priority', arguments: { socCode: '29-2052', stateFips: 'IA' } },
    { name: 'get_demographics', arguments: { fips: '19113' } },
    { name: 'get_h1b_demand', arguments: { socCode: '15-1252' } },
    { name: 'get_frameworks', arguments: {} },
    { name: 'get_institution', arguments: { unitid: '153603' } },
    { name: 'search_occupations', arguments: { keyword: 'nurse' } },
  ];

  for (const tool of requiredTools) {
    if (!toolNames.includes(tool.name)) {
      throw new Error(`Missing tool in tools/list: ${tool.name}`);
    }

    const output = await callTool(tool, sessionId);
    console.log(`\n[${tool.name}]`);
    console.log(output.split('\n').slice(0, 6).join('\n'));
  }

  await terminateSession(sessionId);

  const elapsed = Date.now() - startedAt;
  console.log(`\nAll MCP checks passed in ${elapsed}ms.`);
}

run().catch((error) => {
  console.error('MCP test failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
