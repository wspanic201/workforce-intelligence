'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { WavelengthMark } from './WavelengthLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

const PRODUCT_CATEGORIES = [
  {
    category: 'Market Research',
    items: [
      { label: 'Program Opportunity Scan', href: '/discover', tag: '$1,500', tagColor: 'text-purple-400 bg-purple-500/10' },
    ],
  },
  {
    category: 'Program Analysis',
    items: [
      { label: 'Pell Readiness Check', href: '/pell', tag: 'Free', tagColor: 'text-teal-400 bg-teal-500/10' },
      { label: 'Program Gap Audit', href: '/compliance-gap', tag: '$295', tagColor: 'text-blue-400 bg-blue-500/10' },
    ],
  },
  {
    category: 'Program Development',
    items: [
      { label: 'Program Validation', href: '/validate', tag: '$2,000', tagColor: 'text-emerald-400 bg-emerald-500/10' },
    ],
  },
  {
    category: 'Grant Alignment',
    items: [
      { label: 'Grant Intelligence Scan', href: '/grants', tag: '$495', tagColor: 'text-green-400 bg-green-500/10' },
    ],
  },
  {
    category: 'Program Health',
    items: [
      { label: 'Curriculum Drift Analysis', href: '/drift', tag: 'New', tagColor: 'text-orange-400 bg-orange-500/10' },
    ],
  },
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
          ? 'backdrop-blur-xl border-b border-theme-subtle'
          : 'bg-transparent'
      }`}
      style={scrolled || mobileOpen ? { backgroundColor: 'var(--nav-bg)' } : undefined}
    >
      <nav className="mx-auto max-w-[1200px] px-6">
        <div className="flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="font-heading text-lg font-bold tracking-tight text-theme-primary hover:text-theme-secondary transition-colors"
          >
            <span className="inline-flex items-center gap-2" title="~∿ tuned in ∿~">
              <WavelengthMark className="w-6 h-6" />
              <span className="inline-flex flex-col items-start leading-none">
                <span className="text-gradient-cosmic">Wavelength</span>
                <span className="text-[9px] font-mono text-theme-muted tracking-widest uppercase hidden lg:block">Workforce Program Intelligence</span>
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {/* Products dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                className="text-sm font-medium text-theme-tertiary hover:text-theme-primary transition-colors inline-flex items-center gap-1"
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
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 rounded-xl bg-theme-nav backdrop-blur-xl border border-theme-subtle shadow-2xl shadow-black/40 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {PRODUCT_CATEGORIES.map((cat, catIdx) => (
                    <div key={cat.category}>
                      {catIdx > 0 && (
                        <div className="mx-2 my-1 border-t border-theme-subtle" />
                      )}
                      <Link
                        href={`/${cat.category.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => setProductsOpen(false)}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-theme-muted hover:text-theme-tertiary transition-colors px-4 pt-3 pb-1 w-full"
                      >
                        {cat.category}
                        <svg className="w-2.5 h-2.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      {cat.items.map((p) => (
                        <Link
                          key={p.href}
                          href={p.href}
                          onClick={() => setProductsOpen(false)}
                          className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/[0.05] transition-colors group mx-2"
                        >
                          <span className="text-sm text-theme-secondary group-hover:text-theme-primary transition-colors">
                            {p.label}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.tagColor}`}>
                            {p.tag}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-theme-tertiary hover:text-theme-primary transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/report/demo"
              className="text-sm font-medium text-theme-tertiary hover:text-theme-primary transition-colors"
            >
              Sample Report
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-theme-tertiary hover:text-theme-primary transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/signal"
              className="text-sm font-medium text-theme-tertiary hover:text-theme-primary transition-colors inline-flex items-center gap-1.5"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              The Signal
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
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
              className={`w-6 h-[2px] bg-theme-text transition-all duration-300 ${
                mobileOpen ? 'rotate-45 translate-y-[7px]' : ''
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-theme-text transition-all duration-300 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-theme-text transition-all duration-300 ${
                mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''
              }`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-6 space-y-1 border-t border-theme-subtle pt-4">
            {/* Products section — categorized */}
            {PRODUCT_CATEGORIES.map((cat, catIdx) => (
              <div key={cat.category}>
                {catIdx > 0 && (
                  <div className="border-t border-theme-subtle my-2" />
                )}
                <Link
                  href={`/${cat.category.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-theme-muted hover:text-theme-tertiary transition-colors px-2 pt-2 pb-1 w-full"
                >
                  {cat.category}
                  <svg className="w-2.5 h-2.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                {cat.items.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="flex items-center justify-between text-base font-medium text-theme-secondary hover:text-theme-primary py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{p.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.tagColor}`}>
                      {p.tag}
                    </span>
                  </Link>
                ))}
              </div>
            ))}

            <div className="border-t border-theme-subtle my-3" />

            <Link
              href="/#how-it-works"
              className="block text-base font-medium text-theme-secondary hover:text-theme-primary py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/report/demo"
              className="block text-base font-medium text-theme-secondary hover:text-theme-primary py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sample Report
            </Link>
            <Link
              href="/blog"
              className="block text-base font-medium text-theme-secondary hover:text-theme-primary py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/signal"
              className="flex items-center gap-2 text-base font-medium text-teal-400 hover:text-teal-300 py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              The Signal — Free Newsletter
            </Link>

            <div className="pt-3 flex flex-col gap-3">
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
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
