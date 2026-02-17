import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { NavBar } from "@/components/cosmic/NavBar";
import { WavelengthMark } from "@/components/cosmic/WavelengthLogo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Wavelength — Workforce Pell Readiness & Market Intelligence for Community Colleges",
  description:
    "Is your institution Workforce Pell ready? Get a free Pell Readiness Check, Compliance Gap Report, or full Market Scan — data-driven program intelligence for community colleges.",
  metadataBase: new URL("https://withwavelength.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Wavelength — Workforce Pell Readiness & Market Intelligence",
    description:
      "Data-driven program intelligence for community colleges. Free Pell Readiness Check, Compliance Gap Report, Market Scan.",
    type: "website",
    url: "https://withwavelength.com",
    siteName: "Wavelength",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wavelength — Workforce Pell Readiness & Market Intelligence",
    description:
      "Data-driven program intelligence for community colleges. Free Pell Readiness Check.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#050510] text-[#e2e8f0]`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Wavelength",
              url: "https://withwavelength.com",
              description: "Market intelligence for community college programs.",
              contactPoint: {
                "@type": "ContactPoint",
                email: "hello@withwavelength.com",
                contactType: "customer support",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Wavelength",
              url: "https://withwavelength.com",
              description: "Market intelligence for community college programs.",
            }),
          }}
        />

        <NavBar />

        <main>{children}</main>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] bg-[#050510]">
          <div className="mx-auto max-w-[1200px] px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div>
                <p className="font-heading font-bold text-white inline-flex items-center gap-2">
                  <WavelengthMark className="w-5 h-5" />
                  Wavelength
                </p>
                <p className="text-sm text-white/40 mt-1">
                  Tuned to your market. Backed by data.
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
                  href="#products"
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
                  © {new Date().getFullYear()} Wavelength. All rights reserved.
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white/20">Built in Iowa 🌽 · Tuned to 📡</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
