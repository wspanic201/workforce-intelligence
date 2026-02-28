'use client';

import { useState, FormEvent } from 'react';
import { trackEvent } from '@/lib/analytics';

export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer-newsletter' }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStatus('success');
        setMessage('Subscribed! Check your inbox.');
        setEmail('');
        trackEvent('Newsletter Signup', { source: 'footer' });
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }

    // Reset status after 3 seconds
    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 3000);
  };

  return (
    <div>
      <p className="text-sm text-theme-secondary mb-2">Stay in the loop.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.edu"
          disabled={status === 'loading'}
          className="flex-1 px-3 py-2 rounded-lg bg-theme-surface border border-theme-base text-theme-primary placeholder:text-theme-muted text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
      {message && (
        <p className={`text-xs mt-2 ${status === 'success' ? 'text-teal-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
