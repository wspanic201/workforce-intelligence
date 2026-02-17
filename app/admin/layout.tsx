'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Auth context
const AuthContext = createContext<{
  authenticated: boolean;
  logout: () => void;
}>({ authenticated: false, logout: () => {} });

export function useAdmin() {
  return useContext(AuthContext);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/admin/auth')
      .then(r => r.json())
      .then(d => setAuthenticated(d.authenticated))
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
    } else {
      setError('Wrong password');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAuthenticated(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <form onSubmit={handleLogin} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm space-y-4">
          <div className="text-center">
            <h1 className="font-heading text-xl font-bold text-slate-900">Wavelength Admin</h1>
            <p className="text-sm text-slate-500 mt-1">Enter admin password</p>
          </div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </div>
    );
  }

  const nav = [
    { label: 'Orders', href: '/admin' },
    { label: 'New Order', href: '/admin/intake' },
  ];

  return (
    <AuthContext.Provider value={{ authenticated, logout: handleLogout }}>
      <div className="min-h-screen bg-slate-50">
        {/* Admin nav bar */}
        <header className="bg-slate-900 text-white">
          <div className="mx-auto max-w-7xl px-6 flex h-14 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="font-heading font-bold text-sm tracking-wide">
                WOS ADMIN
              </Link>
              <nav className="flex gap-1">
                {nav.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      pathname === item.href
                        ? 'bg-white/15 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
                ← Public Site
              </Link>
              <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-slate-300">
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          {children}
        </div>
      </div>
    </AuthContext.Provider>
  );
}
