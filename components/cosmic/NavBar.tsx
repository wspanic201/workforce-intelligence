'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WavelengthMark } from './WavelengthLogo';

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
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
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#report-preview"
              className="text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              Sample Report
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="#pricing">
              <button className="btn-cosmic btn-cosmic-primary text-sm py-2 px-6">
                Get Started
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
            <Link
              href="#how-it-works"
              className="block text-base font-medium text-white/80 hover:text-white py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="block text-base font-medium text-white/80 hover:text-white py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="#report-preview"
              className="block text-base font-medium text-white/80 hover:text-white py-2 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sample Report
            </Link>
            <div className="pt-3">
              <Link href="#pricing" onClick={() => setMobileOpen(false)}>
                <button className="btn-cosmic btn-cosmic-primary text-sm py-3 px-6 w-full">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
