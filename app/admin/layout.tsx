/**
 * Admin dashboard layout
 * Shared navigation and layout for all /admin routes
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyAdminSession, destroyAdminSession } from '@/lib/auth/admin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify authentication (redirect handled by middleware, but double-check)
  const isAuthenticated = await verifyAdminSession();
  
  // Skip layout for login page
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  async function handleLogout() {
    'use server';
    await destroyAdminSession();
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <Link href="/admin" className="flex items-center">
                <span className="text-xl font-bold text-gray-900">
                  Wavelength
                </span>
                <span className="ml-2 text-sm text-gray-500">Admin</span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                <NavLink href="/admin" exact>Dashboard</NavLink>
                <NavLink href="/admin/signal">The Signal</NavLink>
                <NavLink href="/admin/reports">Reports</NavLink>
                <NavLink href="/admin/chat">Chat</NavLink>
                <NavLink href="/admin/config">Config</NavLink>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                target="_blank"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                View Site
              </Link>
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </form>
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

// Navigation link component with active state
function NavLink({ href, exact = false, children }: { href: string; exact?: boolean; children: React.ReactNode }) {
  // Note: We'll need to use client-side logic for active state
  // For now, keeping it simple
  return (
    <Link
      href={href}
      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300"
    >
      {children}
    </Link>
  );
}
