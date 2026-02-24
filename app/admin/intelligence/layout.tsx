'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/admin/intelligence', label: 'Overview', exact: true },
  { href: '/admin/intelligence/wages', label: 'Wages' },
  { href: '/admin/intelligence/projections', label: 'Projections' },
  { href: '/admin/intelligence/skills', label: 'Skills' },
  { href: '/admin/intelligence/h1b', label: 'H-1B' },
  { href: '/admin/intelligence/demographics', label: 'Demographics' },
  { href: '/admin/intelligence/completions', label: 'Completions' },
  { href: '/admin/intelligence/statutes', label: 'Statutes' },
  { href: '/admin/intelligence/institutions', label: 'Institutions' },
  { href: '/admin/intelligence/credentials', label: 'Credentials' },
  { href: '/admin/intelligence/employers', label: 'Employers' },
  { href: '/admin/intelligence/frameworks', label: 'Frameworks' },
  { href: '/admin/intelligence/state-priorities', label: 'State Priorities' },
  { href: '/admin/intelligence/service-areas', label: 'Service Areas' },
  { href: '/admin/intelligence/sources', label: 'Sources' },
  { href: '/admin/intelligence/review', label: 'Review Queue' },
  { href: '/admin/intelligence/import', label: '📥 Import' },
];

export default function IntelligenceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Intelligence Hub</h1>
        <p className="text-sm text-slate-500">Verified data that powers every Wavelength report</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname?.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap
                  ${isActive
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-slate-800 hover:border-slate-300'
                  }
                `}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
