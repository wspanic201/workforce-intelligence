'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/signal', label: 'The Signal' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/chat', label: 'Chat' },
  { href: '/admin/intelligence', label: 'Intelligence' },
  { href: '/admin/config', label: 'Config' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="hidden sm:flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              text-sm font-medium px-3 py-1.5 rounded-lg transition-colors
              ${isActive
                ? 'bg-purple-50 text-purple-700'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
