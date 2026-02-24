import { NextRequest, NextResponse } from 'next/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { registerMcpTools } from './tools';

export const dynamic = 'force-dynamic';

type SessionContext = {
  server: McpServer;
  transport: WebStandardStreamableHTTPServerTransport;
  lastSeenAt: number;
};

const SESSION_TTL_MS = 60 * 60 * 1000;
const sessions = new Map<string, SessionContext>();

function createServer(): McpServer {
  const server = new McpServer({
    name: 'wavelength-workforce-intelligence',
    version: '1.0.0',
  });

  registerMcpTools(server);
  return server;
}

function isAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV === 'development') return true;

  const secret = process.env.WAVELENGTH_MCP_SECRET?.trim();
  // If no secret configured, allow all (open intelligence API — data is not sensitive)
  if (!secret) return true;

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.slice('Bearer '.length).trim();
  return token.length > 0 && token === secret;
}

function isInitializeMessage(body: unknown): boolean {
  if (Array.isArray(body)) {
    return body.some((message) => isInitializeRequest(message));
  }
  return isInitializeRequest(body);
}

async function closeSession(sessionId: string): Promise<void> {
  const existing = sessions.get(sessionId);
  if (!existing) return;

  sessions.delete(sessionId);
  await existing.server.close().catch(() => undefined);
}

async function cleanupExpiredSessions(): Promise<void> {
  const now = Date.now();
  const expired: string[] = [];

  for (const [sessionId, context] of sessions.entries()) {
    if (now - context.lastSeenAt > SESSION_TTL_MS) {
      expired.push(sessionId);
    }
  }

  await Promise.all(expired.map((sessionId) => closeSession(sessionId)));
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id, Last-Event-ID, Mcp-Protocol-Version');
  headers.set('Access-Control-Expose-Headers', 'Mcp-Session-Id, Mcp-Protocol-Version');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function unauthorizedResponse(): Response {
  return withCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
}

function jsonError(status: number, message: string): Response {
  return withCors(NextResponse.json({ error: message }, { status }));
}

export async function OPTIONS(): Promise<Response> {
  return withCors(new Response(null, { status: 204 }));
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!isAuthorized(request)) return unauthorizedResponse();

  await cleanupExpiredSessions();

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return jsonError(400, 'Invalid JSON body');
  }

  const sessionId = request.headers.get('mcp-session-id');

  if (sessionId) {
    const context = sessions.get(sessionId);
    if (!context) {
      return jsonError(404, 'Unknown MCP session');
    }

    context.lastSeenAt = Date.now();

    try {
      const response = await context.transport.handleRequest(request, { parsedBody });
      return withCors(response);
    } catch {
      return jsonError(500, 'Failed to process MCP request');
    }
  }

  if (!isInitializeMessage(parsedBody)) {
    return jsonError(400, 'Missing MCP session. Send initialize first to create a session.');
  }

  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    onsessioninitialized: (newSessionId) => {
      sessions.set(newSessionId, {
        server,
        transport,
        lastSeenAt: Date.now(),
      });
    },
    onsessionclosed: async (closedSessionId) => {
      await closeSession(closedSessionId);
    },
  });

  try {
    await server.connect(transport);
    const response = await transport.handleRequest(request, { parsedBody });
    return withCors(response);
  } catch {
    await server.close().catch(() => undefined);
    return jsonError(500, 'Failed to initialize MCP session');
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  if (!isAuthorized(request)) return unauthorizedResponse();

  await cleanupExpiredSessions();

  const sessionId = request.headers.get('mcp-session-id');
  if (!sessionId) {
    return jsonError(400, 'Missing MCP session ID');
  }

  const context = sessions.get(sessionId);
  if (!context) {
    return jsonError(404, 'Unknown MCP session');
  }

  context.lastSeenAt = Date.now();

  try {
    const response = await context.transport.handleRequest(request);
    return withCors(response);
  } catch {
    return jsonError(500, 'Failed to process MCP stream request');
  }
}

export async function DELETE(request: NextRequest): Promise<Response> {
  if (!isAuthorized(request)) return unauthorizedResponse();

  const sessionId = request.headers.get('mcp-session-id');
  if (!sessionId) {
    return jsonError(400, 'Missing MCP session ID');
  }

  const context = sessions.get(sessionId);
  if (!context) {
    return jsonError(404, 'Unknown MCP session');
  }

  try {
    const response = await context.transport.handleRequest(request);
    await closeSession(sessionId);
    return withCors(response);
  } catch {
    await closeSession(sessionId);
    return jsonError(500, 'Failed to close MCP session');
  }
}
