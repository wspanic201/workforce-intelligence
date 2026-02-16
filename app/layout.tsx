import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Workforce Intelligence — Program Validation for Community Colleges",
  description:
    "Comprehensive workforce program validation — market analysis, financial projections, and strategic recommendations in 48 hours.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jakarta.variable} font-body antialiased text-slate-900`}
      >
        {/* Navigation */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/80">
          <nav className="mx-auto max-w-[1200px] px-6">
            <div className="flex h-[72px] items-center justify-between">
              <Link
                href="/"
                className="font-heading text-lg font-medium tracking-tight text-[#1F2023] hover:text-black transition-colors"
              >
                Workforce Intelligence
              </Link>
              <div className="hidden md:flex items-center gap-8">
                <Link
                  href="/methodology"
                  className="text-sm font-medium text-[#4C4C4C] hover:text-[#1F2023] transition-colors"
                >
                  Methodology
                </Link>
                <Link
                  href="#pricing"
                  className="text-sm font-medium text-[#4C4C4C] hover:text-[#1F2023] transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="#sample-report"
                  className="text-sm font-medium text-[#4C4C4C] hover:text-[#1F2023] transition-colors"
                >
                  Sample Report
                </Link>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <a href="mailto:hello@workforceintel.com">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-[#E0E0E0] text-[#1F2023] hover:bg-gray-50 font-medium px-5"
                  >
                    Contact Us
                  </Button>
                </a>
                <Link href="/submit">
                  <Button
                    size="sm"
                    className="rounded-full bg-[#1F2023] hover:bg-black text-white font-medium px-5"
                  >
                    Start Validation
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
        </header>

        <main>{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div>
                <p className="font-heading font-bold text-slate-900">
                  Workforce Intelligence
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Enterprise program validation for community colleges
                </p>
              </div>
              <div className="flex gap-8 text-sm text-slate-500">
                <Link href="/methodology" className="hover:text-slate-900 transition-colors">
                  Methodology
                </Link>
                <Link href="#pricing" className="hover:text-slate-900 transition-colors">
                  Pricing
                </Link>
                <Link href="/submit" className="hover:text-slate-900 transition-colors">
                  Start Validation
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-200">
              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} Workforce Intelligence. Built by Confluence Labs.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
