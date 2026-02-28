import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Structural Scarcity Score | Wavelength',
  robots: { index: false, follow: false },
};

export default function StructuralScarcityScorePage() {
  return (
    <div className="min-h-screen bg-theme-page py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-wider text-theme-muted mb-3">Product Draft · Hidden</p>
        <h1 className="font-heading text-3xl font-bold text-theme-primary mb-4">Structural Scarcity Score</h1>
        <p className="text-theme-secondary mb-6">A simple benchmark that shows how severe talent scarcity is for each program cluster in your region.</p>

        <div className="rounded-xl border border-theme-subtle bg-white/[0.02] p-6 mb-6">
          <p className="text-sm text-theme-secondary mb-2"><strong className="text-theme-primary">Price:</strong> $1,500</p>
          <p className="text-sm text-theme-secondary"><strong className="text-theme-primary">Turnaround:</strong> 5 business days</p>
        </div>

        <h2 className="font-semibold text-theme-primary mb-3">What they get</h2>
        <ul className="space-y-2 mb-8">
          {[
            'Regional scarcity score by occupation cluster (0–100)',
            'Program-cluster heatmap (high scarcity / medium / low)',
            'Degree inflation pressure indicator by target roles',
            'Short memo: where to expand, hold, or sunset offerings',
            'Leadership one-pager for budget and portfolio decisions',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-theme-secondary">
              <Check className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />{item}
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          <Link href="/contact" className="btn-cosmic btn-cosmic-primary text-sm">Request This Product <ArrowRight className="ml-2 h-4 w-4" /></Link>
          <Link href="/labs/steal-this-idea" className="btn-cosmic btn-cosmic-ghost text-sm">Back to Draft Products</Link>
        </div>
      </div>
    </div>
  );
}
