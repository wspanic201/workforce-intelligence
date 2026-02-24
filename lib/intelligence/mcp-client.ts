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

  // Step 1: initialize
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

  const sessionId = res.headers.get('mcp-session-id') ?? '';
  if (!sessionId) return '';

  // Step 2: send initialized notification (required by MCP protocol before tool calls)
  await fetch(`${MCP_BASE_URL}/api/mcp`, {
    method: 'POST',
    headers: { ...headers, 'mcp-session-id': sessionId },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    }),
  }).catch(() => { /* notification failures are non-fatal */ });

  return sessionId;
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

  // Sequential calls — MCP sessions don't reliably support concurrent requests
  const wages = await callMCPTool(sessionId, 'get_wages', { socCode: socCode, stateCode: stateCode });
  const projections = await callMCPTool(sessionId, 'get_projections', { socCode: socCode, stateFips: stateFips });
  const skills = onetCode ? await callMCPTool(sessionId, 'get_skills', { onetCode: onetCode }) : '';
  const statePriority = await callMCPTool(sessionId, 'get_state_priority', { socCode: socCode, stateFips: stateFips });
  const employers = await callMCPTool(sessionId, 'get_employers', { stateFips: stateFips });
  const h1bDemand = await callMCPTool(sessionId, 'get_h1b_demand', { socCode: socCode });

  return { wages, projections, skills, statePriority, employers, h1bDemand };
}

export async function getProgramCompletions(
  cipCode: string,
  stateFips?: string,
): Promise<string> {
  const sessionId = await openMCPSession();
  if (!sessionId) return '';
  return callMCPTool(sessionId, 'get_completions', {
    cipCode: cipCode,
    ...(stateFips ? { stateFips: stateFips } : {}),
  });
}

export async function searchOccupations(query: string): Promise<string> {
  const sessionId = await openMCPSession();
  if (!sessionId) return '';
  return callMCPTool(sessionId, 'search_occupations', { query });
}

// ── State code helpers ────────────────────────────────────────────────────────

const STATE_ABBR: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO',
  Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
  Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI',
  'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT',
  Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
};

const STATE_FIPS: Record<string, string> = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06', CO: '08', CT: '09', DE: '10',
  FL: '12', GA: '13', HI: '15', ID: '16', IL: '17', IN: '18', IA: '19', KS: '20',
  KY: '21', LA: '22', ME: '23', MD: '24', MA: '25', MI: '26', MN: '27', MS: '28',
  MO: '29', MT: '30', NE: '31', NV: '32', NH: '33', NJ: '34', NM: '35', NY: '36',
  NC: '37', ND: '38', OH: '39', OK: '40', OR: '41', PA: '42', RI: '44', SC: '45',
  SD: '46', TN: '47', TX: '48', UT: '49', VT: '50', VA: '51', WA: '53',
  WV: '54', WI: '55', WY: '56',
};

function extractStateFromLocation(location: string): { abbr: string; fips: string } {
  if (!location) return { abbr: '', fips: '' };
  // Try state name match first (e.g. "Cedar Rapids, Iowa")
  for (const [name, abbr] of Object.entries(STATE_ABBR)) {
    if (location.includes(name)) {
      return { abbr, fips: STATE_FIPS[abbr] ?? '' };
    }
  }
  // Try abbreviation match (e.g. "TX" or ", IA")
  const abbrMatch = location.match(/\b([A-Z]{2})\b/);
  if (abbrMatch && STATE_FIPS[abbrMatch[1]]) {
    return { abbr: abbrMatch[1], fips: STATE_FIPS[abbrMatch[1]] };
  }
  return { abbr: '', fips: '' };
}

/**
 * Fetch all intel for a project — call this ONCE in the orchestrator,
 * attach result to project._mcpIntel, agents read it from there.
 */
export async function getProjectIntel(project: {
  soc_codes?: string | null;
  onet_codes?: string | null;
  geographic_area?: string | null;
}): Promise<OccupationIntel & { available: boolean }> {
  const soc = project.soc_codes?.trim() || '';
  const onet = project.onet_codes?.trim() || '';
  const location = project.geographic_area || '';
  const { abbr, fips } = extractStateFromLocation(location);

  if (!soc) {
    console.log('[MCP Client] No SOC code — skipping intel fetch');
    return { wages: '', projections: '', skills: '', statePriority: '', employers: '', h1bDemand: '', available: false };
  }

  console.log(`[MCP Client] Fetching intel for SOC ${soc} | State ${abbr} (FIPS ${fips})`);
  try {
    const intel = await getOccupationIntel(soc, abbr, fips, onet || undefined);
    const available = !!(intel.wages || intel.projections);
    console.log(`[MCP Client] ✓ Intel loaded — wages: ${!!intel.wages}, projections: ${!!intel.projections}, skills: ${!!intel.skills}, priority: ${!!intel.statePriority}`);
    return { ...intel, available };
  } catch (err) {
    console.warn('[MCP Client] Intel fetch failed (non-fatal):', (err as Error).message);
    return { wages: '', projections: '', skills: '', statePriority: '', employers: '', h1bDemand: '', available: false };
  }
}

/**
 * Format MCP intel as a prompt block for agent injection.
 * Returns empty string if no data available.
 */
export function formatIntelBlock(intel: OccupationIntel): string {
  if (!intel.wages && !intel.projections && !intel.statePriority) return '';

  const lines: string[] = [
    '═══════════════════════════════════════════════════════════',
    'VERIFIED INTELLIGENCE DATABASE (government sources — treat as confirmed baselines):',
    '═══════════════════════════════════════════════════════════',
  ];
  if (intel.wages) { lines.push('WAGE DATA (BLS OES):'); lines.push(intel.wages); lines.push(''); }
  if (intel.projections) { lines.push('EMPLOYMENT PROJECTIONS:'); lines.push(intel.projections); lines.push(''); }
  if (intel.statePriority) { lines.push('STATE PRIORITY / WIOA STATUS:'); lines.push(intel.statePriority); lines.push(''); }
  if (intel.skills) { lines.push('O*NET VERIFIED SKILLS:'); lines.push(intel.skills); lines.push(''); }
  if (intel.employers) { lines.push('REGIONAL EMPLOYERS (Census CBP):'); lines.push(intel.employers); lines.push(''); }
  lines.push('═══════════════════════════════════════════════════════════');
  return lines.join('\n');
}
