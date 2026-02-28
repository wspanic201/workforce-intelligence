'use client';

import { useState, FormEvent } from 'react';
import { ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface InlineLeadCaptureProps {
  page: string;
}

export function InlineLeadCapture({ page }: InlineLeadCaptureProps) {
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
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
        body: JSON.stringify({
          email,
          institution,
          source: `inline-lead-capture-${page}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage('Check your inbox — checklist on the way.');
        trackEvent('Lead Magnet Download', { source: `inline-${page}` });
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="card-cosmic rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-teal-400 mx-auto mb-3" />
        <h3 className="font-heading font-bold text-theme-primary text-lg mb-2">Checklist sent!</h3>
        <p className="text-theme-secondary text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="card-cosmic rounded-2xl p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
          <FileText className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-theme-primary text-lg leading-snug">
            Not ready to order? Get our free checklist.
          </h3>
          <p className="text-theme-secondary text-sm mt-1 leading-relaxed">
            5 Signs Your Program Portfolio Has Gaps — a quick self-assessment for your institution.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@institution.edu"
          disabled={status === 'loading'}
          className="w-full px-4 py-3 rounded-xl bg-theme-surface border border-theme-base text-theme-primary placeholder:text-theme-muted text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors disabled:opacity-60"
        />
        <input
          type="text"
          required
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="Institution name"
          disabled={status === 'loading'}
          className="w-full px-4 py-3 rounded-xl bg-theme-surface border border-theme-base text-theme-primary placeholder:text-theme-muted text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-cosmic btn-cosmic-primary w-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Sending...' : 'Send Me the Checklist'}
          {status !== 'loading' && <ArrowRight className="ml-2 h-4 w-4" />}
        </button>
      </form>

      {message && status === 'error' && (
        <p className="text-red-400 text-xs mt-2">{message}</p>
      )}
    </div>
  );
}
