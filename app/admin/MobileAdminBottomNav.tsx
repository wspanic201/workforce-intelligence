'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/admin', label: 'Home', icon: '🏠', exact: true },
  { href: '/admin/reports', label: 'Reports', icon: '📊' },
  { href: '/admin/signal', label: 'Signal', icon: '📧' },
  { href: '/admin/intelligence', label: 'Intel', icon: '🧠' },
  { href: '/admin/config', label: 'Config', icon: '⚙️' },
];

export function MobileAdminBottomNav() {
  const pathname = usePathname();

  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="grid grid-cols-5 gap-1 px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]">
        {ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-lg py-1.5 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
