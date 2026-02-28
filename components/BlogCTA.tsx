'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface ServiceCTA {
  label: string;
  description: string;
  href: string;
  price: string;
}

const SERVICE_MAP: Record<string, ServiceCTA> = {
  'market-research': {
    label: 'Program Finder',
    description: 'Find 8–12 high-demand program opportunities for your region — scored, ranked, and backed by real employer data.',
    href: '/discover',
    price: '$1,500',
  },
  compliance: {
    label: 'Program Gap Analysis',
    description: 'Find required programs you aren\'t offering yet — with revenue estimates and a prioritized launch roadmap.',
    href: '/compliance-gap',
    price: '$300',
  },
  funding: {
    label: 'Grant Finder',
    description: 'Find grants you qualify for and haven\'t applied to yet — researched, scored, and ranked by fit.',
    href: '/grants',
    price: '$750',
  },
  'program-strategy': {
    label: 'Feasibility Study',
    description: 'Know if a program will succeed before you invest. Full feasibility analysis with GO / NO-GO recommendation.',
    href: '/validate',
    price: '$3,000',
  },
  'curriculum': {
    label: 'Curriculum Drift Analysis',
    description: 'See where your programs have fallen behind the job market — with specific recommendations on what to update.',
    href: '/drift',
    price: '$500',
  },
  pell: {
    label: 'Free Pell Readiness Check',
    description: 'See which programs are Workforce Pell eligible right now — and what to fix on the ones that aren\'t.',
    href: '/pell',
    price: 'Free',
  },
};

// Map blog categories to service CTAs
const CATEGORY_SERVICE_MAP: Record<string, string> = {
  'Workforce Intelligence': 'market-research',
  'Program Strategy': 'program-strategy',
  'State Policy': 'compliance',
  'State Investment': 'funding',
  'Workforce Pell': 'pell',
  'Pell Readiness': 'pell',
  'Curriculum Strategy': 'curriculum',
  'Wavelength': 'market-research',
};

interface BlogCTAProps {
  category?: string;
}

export function BlogCTA({ category }: BlogCTAProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const serviceKey = category ? CATEGORY_SERVICE_MAP[category] || 'market-research' : 'market-research';
  const service = SERVICE_MAP[serviceKey];

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
        trackEvent('Newsletter Signup', { source: 'blog-cta' });
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="mt-12 space-y-6">
      {/* Newsletter signup */}
      <div className="card-cosmic rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-teal-500/20 flex items-center justify-center">
            <Mail className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-theme-primary text-lg">Get more like this</h3>
            <p className="text-theme-muted text-xs">Workforce intelligence insights, delivered occasionally.</p>
          </div>
        </div>

        {status === 'success' ? (
          <div className="flex items-center gap-2 text-teal-400 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@institution.edu"
              disabled={status === 'loading'}
              className="flex-1 px-4 py-3 rounded-xl bg-theme-surface border border-theme-base text-theme-primary placeholder:text-theme-muted text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-cosmic btn-cosmic-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? '...' : 'Subscribe'}
            </button>
          </form>
        )}

        {message && status === 'error' && (
          <p className="text-red-400 text-xs mt-2">{message}</p>
        )}
      </div>

      {/* Related service CTA */}
      <Link
        href={service.href}
        className="card-cosmic rounded-2xl p-8 block group hover:border-purple-500/20 transition-all"
        onClick={() => trackEvent('Blog CTA Click', { service: service.label })}
      >
        <p className="overline mb-2">Related Service</p>
        <h3 className="font-heading font-bold text-theme-primary text-lg mb-2 group-hover:text-gradient-cosmic transition-colors">
          {service.label}
          {service.price !== 'Free' && (
            <span className="text-theme-muted text-sm font-mono font-normal ml-2">{service.price}</span>
          )}
          {service.price === 'Free' && (
            <span className="text-teal-400 text-sm font-mono font-normal ml-2">Free</span>
          )}
        </h3>
        <p className="text-theme-secondary text-sm leading-relaxed mb-4">{service.description}</p>
        <span className="inline-flex items-center text-sm text-purple-400 font-medium group-hover:gap-2 transition-all">
          Learn more <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </div>
  );
}
