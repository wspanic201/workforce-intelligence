'use client';

import { Printer } from 'lucide-react';

export function PrintButton({ label = 'Download PDF' }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-theme-base bg-theme-surface text-theme-secondary text-sm font-medium hover:border-theme-strong hover:text-theme-primary transition-colors print:hidden"
    >
      <Printer className="h-4 w-4" />
      {label}
    </button>
  );
}
