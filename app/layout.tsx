import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { NavBar } from "@/components/cosmic/NavBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "[BRAND] — Program Intelligence for Community Colleges",
  description:
    "Program intelligence for the full lifecycle. Discover, validate, and launch the programs your region actually needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jakarta.variable} font-sans antialiased bg-[#050510] text-[#e2e8f0]`}
      >
        <NavBar />

        <main>{children}</main>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] bg-[#050510]">
          <div className="mx-auto max-w-[1200px] px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div>
                <p className="font-heading font-bold text-white">
                  [BRAND]
                </p>
                <p className="text-sm text-white/40 mt-1">
                  Program intelligence for community colleges
                </p>
              </div>
              <div className="flex gap-8 text-sm text-white/40">
                <Link
                  href="#how-it-works"
                  className="hover:text-white/70 transition-colors"
                >
                  How It Works
                </Link>
                <Link
                  href="#pricing"
                  className="hover:text-white/70 transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="#report-preview"
                  className="hover:text-white/70 transition-colors"
                >
                  Sample Report
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/[0.06]">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs text-white/20">
                  © {new Date().getFullYear()} [BRAND]. All rights reserved.
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white/20">Built in Iowa 🌽</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
