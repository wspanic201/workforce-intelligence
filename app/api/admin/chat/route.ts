/**
 * Admin chat API endpoint
 * Processes chat messages from the admin dashboard
 * Can execute commands and provide context-aware assistance
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { callClaude } from '@/lib/ai/anthropic';

export async function POST(request: NextRequest) {
  // Verify admin session
  const isAuthenticated = await verifyAdminSession(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Build system context
    const systemContext = `You are Cassidy, Matt's AI assistant for managing the Wavelength platform.

You're chatting with Matt through the admin dashboard. You can help with:
- Newsletter management (preview, send, check status)
- Report generation and management
- System monitoring and health checks
- Configuration and API key management
- General platform questions

Current location: ${context?.location || 'admin_dashboard'}
Current page: ${context?.page || 'unknown'}

Keep responses concise and actionable. If Matt asks you to do something (like "send the newsletter"), explain what action you would take and any risks, but note that for now this chat is informational only - he needs to use the actual controls in the dashboard.

In the future, this chat will have the ability to execute commands directly.`;

    // Call Claude with the message
    const { content: response } = await callClaude(
      `${systemContext}\n\nUser message: ${message}`,
      {
        model: 'claude-sonnet-4-5',
        maxTokens: 2000,
        temperature: 0.8,
      }
    );

    return NextResponse.json({ response });

  } catch (error) {
    console.error('[Admin Chat] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
