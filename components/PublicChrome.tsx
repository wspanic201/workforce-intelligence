'use client';

import { usePathname } from 'next/navigation';

/**
 * Wraps public-facing chrome (NavBar, footer) and hides it on /admin routes.
 */
export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return null;

  return <>{children}</>;
}
