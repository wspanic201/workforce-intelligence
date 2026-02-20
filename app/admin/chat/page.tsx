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
      <div className="bg-white rounded-t-lg shadow p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Chat with Cassidy</h1>
        <p className="text-gray-600 mt-1">Your AI assistant for platform management</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white shadow px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {message.role === 'user' ? 'You' : 'Cassidy'}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="bg-white rounded-b-lg shadow p-4 border-t border-gray-200">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything... (e.g., 'Send the newsletter', 'Show me reports from this week')"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Tip: I can help you send newsletters, generate reports, check system status, and more.
        </p>
      </form>

      {/* Quick Commands */}
      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Quick commands:</p>
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
              className="text-xs bg-white border border-gray-300 rounded px-3 py-1 hover:bg-gray-100"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
