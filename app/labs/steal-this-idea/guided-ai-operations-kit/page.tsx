import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Guided AI Operations Kit | Wavelength',
  robots: { index: false, follow: false },
};

export default function GuidedAiOperationsKitPage() {
  return (
    <div className="min-h-screen bg-theme-page py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-wider text-theme-muted mb-3">Product Draft · Hidden</p>
        <h1 className="font-heading text-3xl font-bold text-theme-primary mb-4">Guided AI Operations Kit</h1>
        <p className="text-theme-secondary mb-6">Move from AI interest to execution with role-based operating playbooks and governance templates.</p>

        <div className="rounded-xl border border-theme-subtle bg-white/[0.02] p-6 mb-6">
          <p className="text-sm text-theme-secondary mb-2"><strong className="text-theme-primary">Price:</strong> $1,800</p>
          <p className="text-sm text-theme-secondary"><strong className="text-theme-primary">Turnaround:</strong> 7 business days</p>
        </div>

        <h2 className="font-semibold text-theme-primary mb-3">What they get</h2>
        <ul className="space-y-2 mb-8">
          {[
            'Role playbooks: Dean, CE leader, grants lead',
            'AI governance starter templates (approval, review, risk)',
            'Weekly recommended action cadence (what to do next)',
            'Decision log template for AI-assisted program decisions',
            '90-day adoption checklist with owner assignments',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-theme-secondary">
              <Check className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />{item}
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          <Link href="/contact" className="btn-cosmic btn-cosmic-primary text-sm">Request This Kit <ArrowRight className="ml-2 h-4 w-4" /></Link>
          <Link href="/labs/steal-this-idea" className="btn-cosmic btn-cosmic-ghost text-sm">Back to Draft Products</Link>
        </div>
      </div>
    </div>
  );
}
