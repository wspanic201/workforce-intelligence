/**
 * Admin login page
 * Posts to /api/admin/login which sets cookie and redirects
 */

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams?.error;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Wavelength Admin
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your password to continue
            </p>
          </div>

          {/* Login Form - posts to API route */}
          <form action="/api/admin/login" method="POST" className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoFocus
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white"
            >
              Sign In
            </button>
          </form>

          {/* Error Message */}
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

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Wavelength © 2026
        </p>
      </div>
    </div>
  );
}
