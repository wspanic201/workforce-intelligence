/**
 * Admin dashboard layout
 * Matches Wavelength brand — light admin variant with cosmic accents
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyAdminSession, destroyAdminSession } from '@/lib/auth/admin';
import { WavelengthMark } from '@/components/cosmic/WavelengthLogo';
import { AdminNav } from './AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await verifyAdminSession();

  // Login page gets its own layout
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  async function handleLogout() {
    'use server';
    await destroyAdminSession();
    redirect('/admin/login');
  }

  return (
    <div
      className="min-h-screen"
      data-theme="light"
      style={{
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        // Override cosmic dark theme vars for admin
        // @ts-ignore
        '--bg-page': '#f8fafc',
        '--text-primary': '#0f172a',
        '--text-secondary': '#334155',
        '--text-tertiary': '#64748b',
        '--text-muted': '#94a3b8',
        '--border-subtle': '#e2e8f0',
        '--nav-bg': 'rgba(255,255,255,0.95)',
      } as React.CSSProperties}
    >
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderColor: '#e2e8f0' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 sm:h-16">
            {/* Left: Logo + Nav */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-8">
              <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
                <WavelengthMark className="w-6 h-6 shrink-0" />
                <span className="font-heading font-bold text-base sm:text-lg tracking-tight text-gradient-cosmic truncate">
                  Wavelength
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">
                  Admin
                </span>
              </Link>

              <div className="sm:hidden">
                <form action={handleLogout}>
                  <button
                    type="submit"
                    className="text-xs text-slate-500 hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <AdminNav />

              {/* Right: Actions */}
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href="/"
                  target="_blank"
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                  View Site ↗
                </Link>
                <form action={handleLogout}>
                  <button
                    type="submit"
                    className="text-sm text-slate-500 hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
