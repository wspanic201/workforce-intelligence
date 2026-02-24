# Wavelength MCP Server

The Wavelength workforce intelligence MCP endpoint is available at:

- Local development: `http://localhost:3000/api/mcp`
- Production: `https://withwavelength.com/api/mcp`

## Authentication

In production, requests must include:

- `Authorization: Bearer <WAVELENGTH_MCP_SECRET>`

Authentication is skipped when `NODE_ENV=development`.

## Available Tools

- `get_wages`
- `get_projections`
- `get_skills`
- `get_employers`
- `get_completions`
- `get_state_priority`
- `get_demographics`
- `get_h1b_demand`
- `get_frameworks`
- `get_institution`
- `search_occupations`

## Claude Desktop / Other MCP Clients

Use Streamable HTTP transport pointing at the MCP URL above. Ensure headers include:

- `Content-Type: application/json`
- `Mcp-Protocol-Version: 2025-03-26` (or a supported MCP version)
- `Authorization: Bearer <WAVELENGTH_MCP_SECRET>` (production)

The server supports `initialize`, `tools/list`, and `tools/call` over HTTP POST, plus session lifecycle over `DELETE`.

## Local Verification

1. Start Next.js locally:
   - `npm run dev`
2. In a second shell, run:
   - `npx tsx scripts/test-mcp.ts`

You can override target URL with:

- `MCP_URL=http://localhost:3000/api/mcp npx tsx scripts/test-mcp.ts`
