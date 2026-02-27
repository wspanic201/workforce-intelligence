/**
 * MCP Tool Registration — Barrel File
 *
 * Tools are organized into domain modules under ./tools/.
 * Each module exports a register(server) function.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerOccupationTools } from './tools/occupation-tools';
import { registerEmployerTools } from './tools/employer-tools';
import { registerEducationTools } from './tools/education-tools';
import { registerGeographicTools } from './tools/geographic-tools';

export function registerMcpTools(server: McpServer): void {
  registerOccupationTools(server);
  registerEmployerTools(server);
  registerEducationTools(server);
  registerGeographicTools(server);
}
