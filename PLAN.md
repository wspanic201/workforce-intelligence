# Agent Pipeline Refactor Plan

## Current Architecture Analysis

### Pipeline Flow
```
User Request → API → enqueueRunJob() → processNextRunJob()
  → orchestrateValidation() (1,300+ line monolith)
    → enrichProject()
    → getProjectIntel() via MCP HTTP loopback
    → 7 research agents (sequential)
    → citation agent
    → tiger team synthesis
    → report generation
    → PDF generation
```

### Key Files
| File | Lines | Role |
|------|-------|------|
| `lib/agents/orchestrator.ts` | ~1,300 | Monolith orchestrator — runs everything |
| `lib/ai/anthropic.ts` | ~430 | Claude API client (streaming + JSON extraction) |
| `lib/intelligence/mcp-client.ts` | ~250 | HTTP loopback MCP client |
| `app/api/mcp/tools.ts` | ~490 | MCP server tool definitions |
| `lib/intelligence/lookup.ts` | ~860 | Direct Supabase intelligence queries |
| `lib/agents/researchers/*.ts` | ~2,500 total | 10 research agent implementations |
| `lib/agents/tiger-team.ts` | ~386 | Multi-persona executive synthesis |
| `lib/stages/pipeline.ts` | ~243 | Full Discovery→Validation pipeline |

---

## Problems Identified

### 1. MCP HTTP Loopback: The Biggest Waste

**Current**: `mcp-client.ts` calls its own MCP server via `http://localhost:3000/api/mcp`:

```
Orchestrator
  → mcp-client.ts openMCPSession()     [HTTP POST /api/mcp — initialize]
  → mcp-client.ts callMCPTool()        [HTTP POST /api/mcp — get_wages]
  → mcp-client.ts callMCPTool()        [HTTP POST /api/mcp — get_projections]
  → mcp-client.ts callMCPTool()        [HTTP POST /api/mcp — get_skills]
  → mcp-client.ts callMCPTool()        [HTTP POST /api/mcp — get_state_priority]
  → mcp-client.ts callMCPTool()        [HTTP POST /api/mcp — get_employers]
  → mcp-client.ts callMCPTool()        [HTTP POST /api/mcp — get_h1b_demand]
```

That's **8 HTTP roundtrips** (initialize + notification + 6 tools) to query data that lives in the **same process**. Each request goes through:
Next.js route handler → MCP protocol decode → Supabase query → MCP format → HTTP response → SSE/JSON parse

Meanwhile, `lib/intelligence/lookup.ts` already has `getFullOccupationBrief()` which does all 6 queries in **parallel** with `Promise.all()` — no HTTP, no MCP protocol overhead.

**Impact**: Adds 2-5 seconds of unnecessary latency per pipeline run. Fragile (MCP session management, SSE parsing edge cases).

### 2. Agents Duplicate External API Calls

Market analyst fetches: SerpAPI jobs, O*NET, BLS wages, Brave jobs
Employer analyst also fetches: SerpAPI jobs, Brave jobs (same occupation, same location)

No shared data layer between agents running in the same pipeline. The MCP intel block provides some wage/projection data, but agents still independently call BLS, SerpAPI, etc.

### 3. Monolith Orchestrator with Copy-Pasted Retry Logic

Each stage (7 agents + citation + tiger team + report + PDF = 11 stages) has a nearly identical 40-60 line retry/checkpoint/telemetry block:

```typescript
// This pattern appears 5+ times:
let stageSucceeded = false;
while (!stageSucceeded) {
  const attempt = (stageAttempts.get(stageKey) || 0) + 1;
  stageAttempts.set(stageKey, attempt);
  await markStageStarted(projectId, stageKey, attempt);
  await logRunEvent({ ... });
  const stageStart = Date.now();
  try {
    // ... actual work ...
    await markStageCompleted(projectId, stageKey, payload, durationMs);
    await logRunEvent({ ... });
    stageSucceeded = true;
  } catch (e) {
    await markStageFailed(projectId, stageKey, errorMessage, durationMs);
    await logRunEvent({ ... });
    if (attempt < MAX_STAGE_ATTEMPTS) {
      await logRunEvent({ ... retry ... });
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      continue;
    }
    break;
  }
}
```

### 4. Claude API Called Without System Messages or Tool Use

`callClaude()` sends everything as a single user message:
```typescript
messages: [{ role: 'user', content: prompt }]
```

- No `system` parameter (persona instructions, data, and task all crammed into one message)
- No Claude tool_use (agents can't dynamically query for more data)
- Agents pre-fetch all possible data and stuff it into the prompt, even if Claude doesn't need it
- MCP intel injected as raw text blob via string concatenation

### 5. `orchestrateValidationInMemory()` Is a Near-Duplicate

The in-memory validation function (~200 lines) is a copy of `orchestrateValidation()` with Supabase writes made optional. Two paths to maintain for the same logic.

---

## Proposed Architecture

### Change 1: Replace MCP HTTP Loopback with Direct Lookup

**Replace** `mcp-client.ts` (the HTTP loopback client) with direct calls to `lookup.ts`.

```typescript
// lib/intelligence/project-intel.ts (NEW - replaces mcp-client.ts for internal use)

import { getFullOccupationBrief } from './lookup';

export async function getProjectIntel(project: {
  soc_codes?: string | null;
  geographic_area?: string | null;
}): Promise<ProjectIntel> {
  const soc = project.soc_codes?.trim() || '';
  const state = extractStateFromLocation(project.geographic_area || '');

  if (!soc) return EMPTY_INTEL;

  // Direct DB queries in parallel — no HTTP, no MCP protocol overhead
  const brief = await getFullOccupationBrief(soc, state.abbr);

  return {
    available: !!(brief.wages || brief.projections),
    wages: brief.wages,
    projections: brief.projections,
    skills: brief.skills,
    statePriority: brief.statePriority,
    h1bDemand: brief.h1bDemand,
    wageGap: brief.wageGap,
    citations: brief.citations,
  };
}
```

The MCP server (`app/api/mcp/`) stays unchanged — it's for **external** clients (Claude Desktop, third-party integrations). Internal agents just skip the HTTP layer.

### Change 2: Upgrade `callClaude()` to Support System Messages and Tool Use

```typescript
// lib/ai/anthropic.ts — enhanced API

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
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
  system?: string;                    // NEW: system message
  tools?: ClaudeTool[];               // NEW: tool definitions
  toolHandler?: (name: string, input: Record<string, any>) => Promise<string>;  // NEW
}

export async function callClaude(
  prompt: string | ClaudeMessage[],   // Accept string OR message array
  options: AICallOptions = {}
): Promise<{ content: string; tokensUsed: number }> {
  // If tools provided, use agentic loop:
  // 1. Send messages + tools to Claude
  // 2. If Claude returns tool_use, call toolHandler, append result
  // 3. Re-send to Claude until it produces a text response
  // Falls back to current streaming behavior when no tools provided
}
```

### Change 3: Give Agents Access to Intelligence Tools via Claude Tool Use

Instead of pre-fetching all data and injecting as text:

```typescript
// lib/agents/researchers/market-analyst.ts — refactored

export async function runMarketAnalysis(projectId: string, project: ValidationProject) {
  const persona = await loadPersona('market-analyst');

  // Define tools Claude can call during analysis
  const tools = buildIntelTools(project);  // get_wages, get_projections, etc.

  const { content, tokensUsed } = await callClaude(
    buildMarketPrompt(project),  // Much shorter — just the task, not all data
    {
      system: persona.systemPrompt,
      tools,
      toolHandler: async (name, input) => {
        // Route to lookup.ts directly
        return await executeIntelTool(name, input);
      },
      maxTokens: 4000,
    }
  );
  // ...
}
```

This lets Claude decide what data it needs, ask for it, and then synthesize. Prompts shrink dramatically.

### Change 4: Extract Stage Runner — Kill the Boilerplate

```typescript
// lib/pipeline/stage-runner.ts (NEW)

export interface StageConfig<T> {
  projectId: string;
  stageKey: string;
  label: string;
  pipelineRunId?: string | null;
  timeoutMs: number;
  run: () => Promise<T>;
  onComplete?: (result: T, durationMs: number) => Promise<Record<string, any>>;  // checkpoint payload
  optional?: boolean;  // if true, failure doesn't throw
}

export async function runStage<T>(config: StageConfig<T>): Promise<T | null> {
  // All retry, checkpoint, telemetry, logging logic — ONCE
}
```

Then the orchestrator becomes:

```typescript
// Each stage is ~5 lines instead of ~50
const marketResult = await runStage({
  projectId, stageKey: 'labor_market', label: 'Labor Market Analysis',
  pipelineRunId, timeoutMs: 360_000,
  run: () => runMarketAnalysis(projectId, project),
});
```

### Change 5: Shared Pipeline Context for External APIs

```typescript
// lib/pipeline/context.ts (NEW)

export interface PipelineContext {
  project: ValidationProject;
  intel: ProjectIntel;              // From lookup.ts (fetched once)
  jobsData: JobsSearchResult;       // SerpAPI/Brave (fetched once)
  onetData: OnetCompetencies;       // O*NET (fetched once)
  blsData: BLSData;                 // BLS (fetched once)
}

export async function buildPipelineContext(project: ValidationProject): Promise<PipelineContext> {
  const [intel, jobsData, onetData, blsData] = await Promise.all([
    getProjectIntel(project),
    fetchJobs(project),
    fetchONET(project),
    fetchBLS(project),
  ]);
  return { project, intel, jobsData, onetData, blsData };
}
```

Agents receive `PipelineContext` instead of fetching their own data.

### Change 6: Unify orchestrateValidation and orchestrateValidationInMemory

The DB-backed and in-memory paths should be a single function with a storage abstraction:

```typescript
interface PipelineStorage {
  saveComponent(projectId: string, data: ComponentData): Promise<void>;
  loadCheckpoints(projectId: string): Promise<Map<string, Checkpoint>>;
  updateStatus(projectId: string, status: string): Promise<void>;
  // ...
}

class SupabasePipelineStorage implements PipelineStorage { ... }
class InMemoryPipelineStorage implements PipelineStorage { ... }
```

---

## Implementation Order

### Phase 1: Direct Lookup (Biggest Win, Lowest Risk)
1. Create `lib/intelligence/project-intel.ts` using `lookup.ts` directly
2. Update orchestrator to use it instead of `mcp-client.ts`
3. Keep MCP server unchanged (external clients still use it)
4. **Result**: Eliminates 8 HTTP roundtrips, 2-5s latency saved per run

### Phase 2: Stage Runner Extraction
1. Create `lib/pipeline/stage-runner.ts`
2. Refactor orchestrator to use `runStage()` for all 11 stages
3. **Result**: Orchestrator drops from ~1,300 to ~400 lines

### Phase 3: Enhanced `callClaude()` with System Messages
1. Add `system` parameter support to `callClaude()`
2. Refactor agents to use `system` for persona/role instructions
3. **Result**: Cleaner prompt structure, better Claude outputs

### Phase 4: Shared Pipeline Context
1. Create `lib/pipeline/context.ts`
2. Pre-fetch SerpAPI/O*NET/BLS once, share across agents
3. Update agents to receive context instead of self-fetching
4. **Result**: Eliminates duplicate SerpAPI/O*NET calls across agents

### Phase 5: Claude Tool Use for Dynamic Data Access
1. Add tool_use support to `callClaude()`
2. Define intel tools that map to `lookup.ts`
3. Refactor 1-2 agents to use tool_use pattern
4. Gradually migrate remaining agents
5. **Result**: Shorter prompts, Claude queries data it actually needs, better outputs

### Phase 6: Unify Orchestration Paths
1. Create `PipelineStorage` interface
2. Implement Supabase and in-memory variants
3. Merge the two orchestration functions
4. **Result**: Single code path, easier maintenance
