/**
 * Admin login page — matches Wavelength brand
 */

import { WavelengthMark } from '@/components/cosmic/WavelengthLogo';

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams?.error;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      data-theme="light"
      style={{ backgroundColor: '#f8fafc' }}
    >
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <WavelengthMark className="w-8 h-8" />
              <span className="font-heading font-bold text-xl tracking-tight text-gradient-cosmic">
                Wavelength
              </span>
            </div>
            <p className="text-slate-400 text-sm">Admin Dashboard</p>
          </div>

          {/* Form */}
          <form action="/api/admin/login" method="POST" className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoFocus
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              className="w-full font-heading font-semibold py-3 rounded-xl text-white transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #14b8a6 100%)',
                boxShadow: '0 0 12px -4px rgba(124, 58, 237, 0.25), 0 4px 12px -4px rgba(59, 130, 246, 0.2)',
              }}
            >
              Sign In
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-4 text-center">
              <p className="text-red-500 text-sm">
                {error === 'invalid' ? 'Invalid password. Please try again.' :
                 error === 'config' ? 'Server configuration error.' :
                 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-slate-300 text-xs mt-6">
          Wavelength © 2026
        </p>
      </div>
    </div>
  );
}
