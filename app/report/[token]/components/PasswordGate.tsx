'use client';

import { useState, useRef } from 'react';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Aurora } from '@/components/cosmic/Aurora';

interface PasswordGateProps {
  token: string;
  institutionName?: string;
  onUnlock: () => void;
}

export function PasswordGate({ token, institutionName, onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/report/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        onUnlock();
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
        inputRef.current?.focus();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center relative overflow-hidden">
      <Aurora />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="card-cosmic rounded-2xl p-8 text-center">

          {/* Lock icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-500/15 border border-violet-500/30 mb-6">
            <Lock className="w-6 h-6 text-violet-400" />
          </div>

          {/* Institution name */}
          {institutionName && (
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">
              {institutionName}
            </p>
          )}

          <h1 className="text-xl font-bold text-white mb-2">
            Password Protected Report
          </h1>
          <p className="text-sm text-white/50 mb-8 leading-relaxed">
            This Discovery Brief is password-protected. Enter your access password to view the report.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter password"
                autoFocus
                className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none transition-all text-center tracking-widest ${
                  error
                    ? 'border-red-500/50 focus:border-red-500/70 bg-red-500/[0.04]'
                    : 'border-white/10 focus:border-violet-500/50 focus:bg-white/[0.07]'
                }`}
              />
              {error && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="btn-cosmic btn-cosmic-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  View Report
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-xs text-white/25">
            Password provided by Wavelength when your report was delivered.
          </p>
        </div>
      </div>
    </div>
  );
}
