import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { NavBar } from "@/components/cosmic/NavBar";
import { WavelengthMark } from "@/components/cosmic/WavelengthLogo";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FooterNewsletter } from "@/components/FooterNewsletter";
import { PublicChrome } from "@/components/PublicChrome";

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
  title: "Wavelength — Workforce Program Intelligence for Community Colleges",
  description:
    "Wavelength is the workforce program intelligence platform for community colleges. Find, validate, fund, and maintain the right programs — backed by live labor market data.",
  metadataBase: new URL("https://withwavelength.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Wavelength — Workforce Program Intelligence",
    description:
      "Wavelength is the workforce program intelligence platform for community colleges. Find, validate, fund, and maintain the right programs — backed by live labor market data.",
    type: "website",
    url: "https://withwavelength.com",
    siteName: "Wavelength",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wavelength — Workforce Program Intelligence",
    description:
      "Wavelength is the workforce program intelligence platform for community colleges. Find, validate, fund, and maintain the right programs — backed by live labor market data.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme init — runs before React hydrates to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('wl-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
        style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
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

        <ThemeProvider>
        <PublicChrome>
          <NavBar />
        </PublicChrome>

        <main>{children}</main>

        {/* Footer */}
        <PublicChrome>
        <footer className="border-t border-theme-subtle bg-theme-page">
          <div className="mx-auto max-w-[1200px] px-6 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
              {/* Brand */}
              <div className="sm:col-span-2 lg:col-span-2">
                <p className="font-heading font-bold text-theme-primary inline-flex items-center gap-2">
                  <WavelengthMark className="w-5 h-5" />
                  Wavelength
                </p>
                <p className="text-sm text-theme-muted mt-2 leading-relaxed max-w-xs">
                  Workforce program intelligence for community colleges. From opportunity discovery through program launch.
                </p>
                <div className="mt-5">
                  <FooterNewsletter />
                </div>
              </div>

              {/* Market Research */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-4">Market Research</p>
                <div className="space-y-2.5">
                  <Link href="/discover" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Program Finder
                  </Link>
                  <Link href="/category" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Category Deep Dive
                  </Link>
                </div>
              </div>

              {/* Program Analysis */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-4">Program Analysis</p>
                <div className="space-y-2.5">
                  <Link href="/validate" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Feasibility Report
                  </Link>
                  <Link href="/compliance-gap" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Program Gap Analysis
                  </Link>
                  <Link href="/drift" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Curriculum Drift Analysis
                  </Link>
                </div>
              </div>

              {/* Funding & Grants */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-4">Funding & Grants</p>
                <div className="space-y-2.5">
                  <Link href="/grants" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Grant Finder
                  </Link>
                  <Link href="/pell" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Pell Readiness Check
                  </Link>
                </div>
              </div>

              {/* Resources */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-4">Resources</p>
                <div className="space-y-2.5">
                  <Link href="/samples" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Sample Reports
                  </Link>
                  <Link href="/blog" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Blog
                  </Link>
                  <Link href="/signal" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    The Signal Newsletter
                  </Link>
                  <Link href="/contact" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Contact
                  </Link>
                  <Link href="/pricing" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Pricing
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-theme-subtle">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <p className="text-xs text-theme-muted">
                    © {new Date().getFullYear()} Wavelength. All rights reserved.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-theme-muted">
                    <Link href="/privacy" className="hover:text-theme-primary transition-colors">
                      Privacy Policy
                    </Link>
                    <span>·</span>
                    <Link href="/terms" className="hover:text-theme-primary transition-colors">
                      Terms of Service
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-theme-muted">Built in Iowa 🌽 · Tuned to 📡</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
        </PublicChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
