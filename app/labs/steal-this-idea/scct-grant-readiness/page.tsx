import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SCCT Grant Readiness Package | Wavelength',
  robots: { index: false, follow: false },
};

export default function ScctGrantReadinessPage() {
  return (
    <div className="min-h-screen bg-theme-page py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-wider text-theme-muted mb-3">Product Draft · Hidden</p>
        <h1 className="font-heading text-3xl font-bold text-theme-primary mb-4">SCCT Grant Readiness Package</h1>
        <p className="text-theme-secondary mb-6">A focused evidence pack for institutions pursuing DOL SCCT Round 6 funding.</p>

        <div className="rounded-xl border border-theme-subtle bg-white/[0.02] p-6 mb-6">
          <p className="text-sm text-theme-secondary mb-2"><strong className="text-theme-primary">Price:</strong> $3,500</p>
          <p className="text-sm text-theme-secondary"><strong className="text-theme-primary">Turnaround:</strong> 14 business days</p>
        </div>

        <h2 className="font-semibold text-theme-primary mb-3">What they get</h2>
        <ul className="space-y-2 mb-8">
          {[
            'SCCT-fit shortlist of 2–3 priority program tracks',
            'Labor market demand evidence pack (wage, openings, employer demand)',
            'Workforce Pell-readiness narrative and gap mitigation memo',
            'Data-integration readiness checklist (state/workforce systems)',
            'Application narrative outline with claims + source support',
            'Risk register: likely reviewer concerns + response strategy',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-theme-secondary">
              <Check className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />{item}
            </li>
          ))}
        </ul>

        <h2 className="font-semibold text-theme-primary mb-3">Why now</h2>
        <p className="text-sm text-theme-secondary mb-8">SCCT Round 6 is live with a hard deadline. Teams need a defensible package fast.</p>

        <div className="flex gap-3">
          <Link href="/contact" className="btn-cosmic btn-cosmic-primary text-sm">Request This Package <ArrowRight className="ml-2 h-4 w-4" /></Link>
          <Link href="/labs/steal-this-idea" className="btn-cosmic btn-cosmic-ghost text-sm">Back to Draft Products</Link>
        </div>
      </div>
    </div>
  );
}
