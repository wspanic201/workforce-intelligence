/**
 * Admin Chat Interface
 * Talk to Cassidy directly from the admin dashboard
 * Context-aware assistant for platform management
 */

'use client';

import { useState, useRef, useEffect } from 'react';

export default function AdminChatPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hey Matt! I\'m here to help you manage Wavelength. What do you need?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Call admin chat API
      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            location: 'admin_dashboard',
            page: 'chat',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();

      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'Sorry, I couldn\'t process that request.',
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-t-xl border border-b-0 border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-heading font-bold text-slate-900">Chat with Cassidy</h1>
        <p className="text-slate-500 mt-1 text-sm">Your AI assistant for platform management</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white border-x border-slate-200 px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-50 text-slate-900 border border-slate-200'
              }`}
            >
              <div className={`text-xs font-semibold mb-1 ${message.role === 'user' ? 'text-purple-200' : 'text-slate-400'}`}>
                {message.role === 'user' ? 'You' : 'Cassidy'}
              </div>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-4 py-3">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="bg-white rounded-b-xl border border-slate-200 shadow-sm p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything... (e.g., 'Send the newsletter', 'Show me reports from this week')"
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #14b8a6 100%)' }}
          >
            Send
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Tip: I can help you send newsletters, generate reports, check system status, and more.
        </p>
      </form>

      {/* Quick Commands */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Quick commands</p>
        <div className="flex flex-wrap gap-2">
          {[
            'Preview newsletter',
            'System status',
            'Recent reports',
            'Check API keys',
          ].map((cmd) => (
            <button
              key={cmd}
              onClick={() => setInput(cmd)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 text-slate-600 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
