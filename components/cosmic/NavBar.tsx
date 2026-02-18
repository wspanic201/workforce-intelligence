'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { WavelengthMark } from './WavelengthLogo';

const PRODUCTS = [
  { label: 'Pell Readiness Check', href: '/pell', tag: 'Free', tagColor: 'text-teal-400 bg-teal-500/10' },
  { label: 'Compliance Gap Report', href: '/compliance-gap', tag: '$295', tagColor: 'text-blue-400 bg-blue-500/10' },
  { label: 'Grant Intelligence Scan', href: '/grants', tag: '$495', tagColor: 'text-green-400 bg-green-500/10' },
  { label: 'Market Scan', href: '/discover', tag: '$1,500', tagColor: 'text-purple-400 bg-purple-500/10' },
  { label: 'Program Validation', href: '/validate', tag: '$2,000', tagColor: 'text-emerald-400 bg-emerald-500/10' },
];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductsOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? 'bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-[1200px] px-6">
        <div className="flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="font-heading text-lg font-bold tracking-tight text-white hover:text-white/80 transition-colors"
          >
            <span className="inline-flex items-center gap-2" title="~∿ tuned in ∿~">
              <WavelengthMark className="w-6 h-6" />
              <span className="text-gradient-cosmic">Wavelength</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {/* Products dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                className="text-sm font-medium text-white/50 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                Products
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {productsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-xl bg-[#0a0f1a]/98 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/40 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {PRODUCTS.map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      onClick={() => setProductsOpen(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/[0.05] transition-colors group"
                    >
                      <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                        {p.label}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.tagColor}`}>
                        {p.tag}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/report/demo"
              className="text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              Sample Report
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              Blog
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/pell">
              <button className="btn-cosmic btn-cosmic-primary text-sm py-2 px-6">
                Get Started Free
              </button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-[2px] bg-white transition-all duration-300 ${
                mobileOpen ? 'rotate-45 translate-y-[7px]' : ''
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-white transition-all duration-300 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-white transition-all duration-300 ${
                mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''
              }`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-6 space-y-1 border-t border-white/[0.08] pt-4">
            {/* Products section */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-2 pt-2 pb-1">
              Products
            </p>
            {PRODUCTS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="flex items-center justify-between text-base font-medium text-white/80 hover:text-white py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <span>{p.label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.tagColor}`}>
                  {p.tag}
                </span>
              </Link>
            ))}

            <div className="border-t border-white/[0.06] my-3" />

            <Link
              href="/#how-it-works"
              className="block text-base font-medium text-white/80 hover:text-white py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/report/demo"
              className="block text-base font-medium text-white/80 hover:text-white py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sample Report
            </Link>
            <Link
              href="/blog"
              className="block text-base font-medium text-white/80 hover:text-white py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Blog
            </Link>

            <div className="pt-3">
              <Link href="/pell" onClick={() => setMobileOpen(false)}>
                <button className="btn-cosmic btn-cosmic-primary text-sm py-3 px-6 w-full">
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
