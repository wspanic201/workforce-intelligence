import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Steal This Idea — Product Drafts | Wavelength',
  robots: { index: false, follow: false },
};

const PRODUCTS = [
  {
    name: 'Workforce Pell Fast-Track Sprint',
    price: '$2,500',
    href: '/labs/steal-this-idea/workforce-pell-fast-track',
    summary: 'Turn near-miss short-term programs into Pell-ready programs before July 2026.',
  },
  {
    name: 'SCCT Grant Readiness Package',
    price: '$3,500',
    href: '/labs/steal-this-idea/scct-grant-readiness',
    summary: 'Build a submission-ready evidence pack for the DOL SCCT Round 6 deadline.',
  },
  {
    name: 'Noncredit-to-Credit Pathway Accelerator',
    price: '$2,000',
    href: '/labs/steal-this-idea/pathway-accelerator',
    summary: 'Map stackable pathways with clear labor-market and student-outcome logic.',
  },
  {
    name: 'Structural Scarcity Score',
    price: '$1,500',
    href: '/labs/steal-this-idea/structural-scarcity-score',
    summary: 'One benchmark by region + program cluster to defend portfolio decisions under labor scarcity.',
  },
  {
    name: '30-Day Decision Cockpit Pilot',
    price: '$2,500',
    href: '/labs/steal-this-idea/decision-cockpit-pilot',
    summary: 'A fast pilot with demand shift signals, program-fit scoring, and before/after decision metrics.',
  },
  {
    name: 'Guided AI Operations Kit',
    price: '$1,800',
    href: '/labs/steal-this-idea/guided-ai-operations-kit',
    summary: 'Role-based playbooks, governance templates, and weekly actions so teams actually execute with AI.',
  },
];

export default function StealThisIdeaIndex() {
  return (
    <div className="min-h-screen bg-theme-page py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs uppercase tracking-wider text-theme-muted mb-3">Internal Drafts (Hidden)</p>
        <h1 className="font-heading text-3xl font-bold text-theme-primary mb-4">Steal This Idea — Launch-Ready Product Drafts</h1>
        <p className="text-theme-secondary mb-10">Not linked in nav. Ready for QA, pricing check, and launch sequencing.</p>

        <div className="grid gap-4">
          {PRODUCTS.map((p) => (
            <Link key={p.name} href={p.href} className="block rounded-xl border border-theme-subtle bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="font-semibold text-theme-primary">{p.name}</h2>
                <span className="text-sm font-mono text-theme-secondary">{p.price}</span>
              </div>
              <p className="text-sm text-theme-secondary">{p.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
