'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimateOnScroll } from '@/components/motion';

const FAQ_ITEMS = [
  {
    q: 'How is this different from Lightcast or O*NET data I already have?',
    a: "Those are static datasets. Drift Monitor uses live job postings — what employers are hiring for right now in your specific occupation — and runs the comparison automatically. You don't need an analyst to do anything.",
  },
  {
    q: 'How do I submit my curriculum?',
    a: "Just a paragraph or bulleted list describing what your program teaches. We handle the analysis. You don't need to export syllabi or upload documents.",
  },
  {
    q: 'How often does it run?',
    a: "Quarterly. You'll receive an email report each time. If your score increases significantly, you'll get an alert outside the normal cycle.",
  },
  {
    q: 'Can this help with accreditation?',
    a: 'Yes. Drift Monitor reports are formatted to document employer alignment — a common requirement for HLC, SACSCOC, and program-specific accreditors. Many institutions use them as supporting evidence in self-studies.',
  },
  {
    q: 'Can this be funded through grants?',
    a: 'Yes. Curriculum alignment tools are eligible under Perkins V, WIOA Title I, and most state workforce development grants. We provide documentation to support your grant reporting.',
  },
  {
    q: "Is this related to Wavelength's Discovery or Market Scan products?",
    a: "No — Drift Monitor is a standalone product. Discovery and Market Scan help you find and validate programs to build. Drift Monitor helps you keep existing programs current. Different buyers, different use cases, same mission.",
  },
];

export function DriftFAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <AnimateOnScroll key={i} variant="fade-up" delay={i * 60}>
          <div className="card-cosmic rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left gap-4"
            >
              <span className="font-heading font-semibold text-white text-sm md:text-base">
                {item.q}
              </span>
              {open === i
                ? <ChevronUp className="h-4 w-4 text-white/70 flex-shrink-0" />
                : <ChevronDown className="h-4 w-4 text-white/70 flex-shrink-0" />
              }
            </button>
            {open === i && (
              <div className="px-5 pb-5">
                <p className="text-white/70 text-sm leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        </AnimateOnScroll>
      ))}
    </div>
  );
}
