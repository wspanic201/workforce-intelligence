'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { WavelengthMark } from './WavelengthLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

const CATEGORIES = [
  {
    label: 'Market Research',
    services: [
      { label: 'Program Opportunity Scan', tagline: 'Full regional market intelligence', href: '/discover', price: '$1,500' },
      { label: 'Category Deep Dive',       tagline: 'Focused scan for one program area', href: '/category', price: '$795' },
    ],
  },
  {
    label: 'Program Analysis',
    services: [
      { label: 'Program Validation',       tagline: 'Feasibility analysis with GO/NO-GO', href: '/validate', price: '$3,500' },
      { label: 'Program Gap Audit',         tagline: 'Catalog vs. state mandate comparison', href: '/compliance-gap', price: '$295' },
      { label: 'Curriculum Drift Analysis', tagline: 'Annual content alignment review', href: '/drift', price: '$495' },
    ],
  },
  {
    label: 'Funding & Grants',
    services: [
      { label: 'Grant Finder',  tagline: 'Federal grant scoring and prioritization', href: '/grants', price: '$495' },
      { label: 'Pell Readiness Check',      tagline: 'Workforce Pell eligibility scoring', href: '/pell', price: 'Free' },
    ],
  },
];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen ? 'backdrop-blur-xl border-b border-theme-subtle' : 'bg-transparent'
      }`}
      style={scrolled || mobileOpen ? { backgroundColor: 'var(--nav-bg)' } : undefined}
    >
      <nav className="mx-auto max-w-[1200px] px-6">
        <div className="flex h-[72px] items-center justify-between">

          {/* Logo */}
          <Link href="/" className="font-heading text-lg font-bold tracking-tight text-theme-primary hover:text-theme-secondary transition-colors">
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

            {/* Services dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className="text-sm font-medium text-theme-tertiary hover:text-theme-primary transition-colors inline-flex items-center gap-1"
              >
                Services
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 rounded-xl bg-theme-nav backdrop-blur-xl border border-theme-subtle shadow-2xl shadow-black/40 py-2 animate-in fade-in slide-in-from-top-2 duration-200">

                  {/* All Services → Pricing */}
                  <Link
                    href="/pricing"
                    onClick={() => setServicesOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 mx-2 rounded-lg hover:bg-white/[0.05] transition-colors group"
                  >
                    <span className="text-sm font-semibold text-gradient-cosmic">All Services & Pricing</span>
                    <svg className="w-3.5 h-3.5 text-theme-muted group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  {/* Categories with services */}
                  {CATEGORIES.map((cat) => (
                    <div key={cat.label}>
                      <div className="mx-3 my-2 border-t border-theme-subtle" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted px-4 pt-1 pb-1">{cat.label}</p>
                      {cat.services.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setServicesOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 mx-2 rounded-lg hover:bg-white/[0.05] transition-colors group"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-theme-secondary group-hover:text-theme-primary transition-colors">{item.label}</span>
                            <span className="text-[11px] text-theme-muted">{item.tagline}</span>
                          </div>
                          <span className={`text-xs font-mono font-semibold ml-3 flex-shrink-0 ${item.price === 'Free' ? 'text-teal-500' : 'text-purple-600'}`}>{item.price}</span>
                        </Link>
                      ))}
                    </div>
                  ))}

                </div>
              )}
            </div>

            <Link href="/samples" className="text-sm font-medium text-theme-tertiary hover:text-theme-primary transition-colors">
              Sample Reports
            </Link>
            <Link href="/signal" className="text-sm font-medium text-theme-tertiary hover:text-theme-primary transition-colors inline-flex items-center gap-1.5">
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
            <span className={`w-6 h-[2px] bg-theme-text transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`w-6 h-[2px] bg-theme-text transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-[2px] bg-theme-text transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-6 space-y-1 border-t border-theme-subtle pt-4 overflow-y-auto max-h-[calc(100vh-4rem)]">

            <Link href="/pricing" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-base font-semibold text-gradient-cosmic py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors">
              All Services & Pricing →
            </Link>

            {CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <div className="border-t border-theme-subtle my-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted px-2 pt-1 pb-0.5">{cat.label}</p>
                {cat.services.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-white/[0.05] transition-colors">
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-theme-secondary">{item.label}</span>
                      <span className="text-xs text-theme-muted">{item.tagline}</span>
                    </div>
                    <span className={`text-sm font-mono font-semibold ml-3 flex-shrink-0 ${item.price === 'Free' ? 'text-teal-500' : 'text-purple-600'}`}>{item.price}</span>
                  </Link>
                ))}
              </div>
            ))}

            <div className="border-t border-theme-subtle my-3" />
            <Link href="/samples" onClick={() => setMobileOpen(false)}
              className="block text-base font-medium text-theme-secondary hover:text-theme-primary py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors">
              Sample Reports
            </Link>
            <Link href="/signal" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-base font-medium text-teal-400 hover:text-teal-300 py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              The Signal
            </Link>

            <div className="pt-3 flex flex-col gap-3">
              <div className="flex justify-center"><ThemeToggle /></div>
              <Link href="/pell" onClick={() => setMobileOpen(false)}>
                <button className="btn-cosmic btn-cosmic-primary text-sm py-3 px-6 w-full">Get Started Free</button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
