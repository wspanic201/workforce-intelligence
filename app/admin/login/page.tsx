/**
 * Admin login page
 * Simple password authentication for /admin access
 */

import { redirect } from 'next/navigation';
import { verifyAdminSession, createAdminSession, verifyAdminPassword } from '@/lib/auth/admin';

export default async function AdminLoginPage() {
  // Check if already logged in
  const isAuthenticated = await verifyAdminSession();
  if (isAuthenticated) {
    redirect('/admin');
  }

  async function handleLogin(formData: FormData) {
    'use server';

    const password = formData.get('password') as string;

    if (!password) {
      return;
    }

    // Verify password
    if (!verifyAdminPassword(password)) {
      redirect('/admin/login?error=invalid');
    }

    // Create session
    await createAdminSession();

    // Redirect to admin dashboard
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Wavelength Admin
            </h1>
            <p className="text-gray-400 text-sm">
              Enter your password to continue
            </p>
          </div>

          {/* Login Form */}
          <form action={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoFocus
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Sign In
            </button>
          </form>

          {/* Error Message */}
          <div className="mt-4 text-center">
            <p className="text-red-400 text-sm" id="error-message">
              {/* JavaScript will populate this */}
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Wavelength © 2026
        </p>
      </div>

      {/* Client-side error handling */}
      <script dangerouslySetInnerHTML={{
        __html: `
          if (window.location.search.includes('error=invalid')) {
            document.getElementById('error-message').textContent = 'Invalid password. Please try again.';
          }
        `
      }} />
    </div>
  );
}
