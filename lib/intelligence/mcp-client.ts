/**
 * mcp-client.ts
 *
 * Lightweight client for querying the Wavelength MCP server.
 * Agents call this instead of hitting BLS/O*NET APIs directly.
 *
 * Returns formatted text strings — ready to drop into agent prompts.
 */

const MCP_BASE_URL = process.env.MCP_BASE_URL || 'http://localhost:3000';
const MCP_SECRET = process.env.WAVELENGTH_MCP_SECRET;

interface MCPToolResult {
  content?: Array<{ type: string; text: string }>;
  isError?: boolean;
}

async function callMCPTool(
  sessionId: string,
  toolName: string,
  args: Record<string, string | number | boolean>,
): Promise<string> {
  const body = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: { name: toolName, arguments: args },
  };

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'accept': 'application/json, text/event-stream',
    'mcp-session-id': sessionId,
  };
  if (MCP_SECRET) headers['authorization'] = `Bearer ${MCP_SECRET}`;

  const res = await fetch(`${MCP_BASE_URL}/api/mcp`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) return '';

  const ct = res.headers.get('content-type') ?? '';
  let data: { result?: MCPToolResult };

  if (ct.includes('text/event-stream')) {
    const text = await res.text();
    const line = text.split('\n').find(l => l.startsWith('data:'));
    if (!line) return '';
    data = JSON.parse(line.slice(5).trim());
  } else {
    data = await res.json();
  }

  const result = data?.result as MCPToolResult | undefined;
  if (!result || result.isError) return '';
  return result.content?.map(c => c.text).join('\n') ?? '';
}

async function openMCPSession(): Promise<string> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'accept': 'application/json, text/event-stream',
  };
  if (MCP_SECRET) headers['authorization'] = `Bearer ${MCP_SECRET}`;

  const res = await fetch(`${MCP_BASE_URL}/api/mcp`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'wavelength-agent', version: '1.0' },
      },
    }),
  });

  return res.headers.get('mcp-session-id') ?? '';
}

// ── Public query functions ────────────────────────────────────────────────────

export interface OccupationIntel {
  wages: string;
  projections: string;
  skills: string;
  statePriority: string;
  employers: string;
  h1bDemand: string;
}

/**
 * Fetch all relevant intel for a given occupation + state.
 * Returns formatted text blocks ready for agent prompts.
 */
export async function getOccupationIntel(
  socCode: string,
  stateCode: string,       // e.g. 'IA'
  stateFips: string,       // e.g. '19'
  onetCode?: string,
): Promise<OccupationIntel> {
  const sessionId = await openMCPSession();
  if (!sessionId) {
    return { wages: '', projections: '', skills: '', statePriority: '', employers: '', h1bDemand: '' };
  }

  const [wages, projections, skills, statePriority, employers, h1bDemand] = await Promise.all([
    callMCPTool(sessionId, 'get_wages', { soc_code: socCode, state_code: stateCode }),
    callMCPTool(sessionId, 'get_projections', { soc_code: socCode, state_fips: stateFips }),
    onetCode ? callMCPTool(sessionId, 'get_skills', { onet_code: onetCode }) : Promise.resolve(''),
    callMCPTool(sessionId, 'get_state_priority', { soc_code: socCode, state_fips: stateFips }),
    callMCPTool(sessionId, 'get_employers', { state_fips: stateFips }),
    callMCPTool(sessionId, 'get_h1b_demand', { soc_code: socCode }),
  ]);

  return { wages, projections, skills, statePriority, employers, h1bDemand };
}

export async function getProgramCompletions(
  cipCode: string,
  stateFips?: string,
): Promise<string> {
  const sessionId = await openMCPSession();
  if (!sessionId) return '';
  return callMCPTool(sessionId, 'get_completions', {
    cip_code: cipCode,
    ...(stateFips ? { state_fips: stateFips } : {}),
  });
}

export async function searchOccupations(query: string): Promise<string> {
  const sessionId = await openMCPSession();
  if (!sessionId) return '';
  return callMCPTool(sessionId, 'search_occupations', { query });
}
