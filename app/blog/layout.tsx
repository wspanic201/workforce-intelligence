import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Wavelength Blog | Community College Program Intelligence",
    template: "%s | Wavelength",
  },
  description:
    "Guides and analysis for community college leaders navigating Workforce Pell, program development, and market intelligence. Data-driven insights from Wavelength.",
  metadataBase: new URL("https://withwavelength.com"),
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050510] text-[#e2e8f0]">
      {/* Blog Nav */}
      <nav className="sticky top-0 z-50 bg-[#050510]/90 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Wave<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-teal-400">length</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-white/50 hover:text-white text-sm transition-colors hidden sm:inline"
            >
              All Posts
            </Link>
            <Link
              href="/pell"
              className="text-white/50 hover:text-white text-sm transition-colors hidden sm:inline"
            >
              Pell Check
            </Link>
            <Link
              href="/discover"
              className="inline-flex items-center bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {children}

      {/* Blog Footer */}
      <footer className="border-t border-white/[0.06] bg-[#050510] py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Wavelength. Market intelligence for community college programs.
          </p>
          <div className="mt-3 flex justify-center gap-6 text-white/30 text-sm">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-white/60 transition-colors">Blog</Link>
            <Link href="/pell" className="hover:text-white/60 transition-colors">Pell Check</Link>
            <Link href="/discover" className="hover:text-white/60 transition-colors">Market Scan</Link>
            <Link href="/methodology" className="hover:text-white/60 transition-colors">Methodology</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
