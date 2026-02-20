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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
              {/* Brand */}
              <div className="sm:col-span-2 lg:col-span-1">
                <p className="font-heading font-bold text-theme-primary inline-flex items-center gap-2">
                  <WavelengthMark className="w-5 h-5" />
                  Wavelength
                </p>
                <p className="text-sm text-theme-muted mt-2 leading-relaxed max-w-xs">
                  Workforce program intelligence for community colleges. From opportunity discovery through program launch.
                </p>
              </div>

              {/* Services */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-4">Services</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-theme-muted mb-2 mt-3">Core Program Intelligence Services</p>
                <div className="space-y-2.5 mb-4">
                  <Link href="/discover" className="flex items-center justify-between text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    <span>Program Opportunity Scan</span>
                    <span className="text-purple-400/70 text-[10px] font-mono">$1,500</span>
                  </Link>
                  <Link href="/validate" className="flex items-center justify-between text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    <span>Program Validation</span>
                    <span className="text-purple-400/70 text-[10px] font-mono">$3,500</span>
                  </Link>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-theme-muted mb-2">Add-Ons</p>
                <div className="space-y-2.5">
                  <Link href="/pell" className="flex items-center justify-between text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    <span>Pell Readiness Check</span>
                    <span className="text-teal-400/70 text-[10px] font-mono">Free</span>
                  </Link>
                  <Link href="/compliance-gap" className="flex items-center justify-between text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    <span>Program Gap Audit</span>
                    <span className="text-teal-400/70 text-[10px] font-mono">$295</span>
                  </Link>
                  <Link href="/grants" className="flex items-center justify-between text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    <span>Grant Intelligence Scan</span>
                    <span className="text-teal-400/70 text-[10px] font-mono">$495</span>
                  </Link>
                  <Link href="/drift" className="flex items-center justify-between text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    <span>Curriculum Drift Analysis</span>
                    <span className="text-teal-400/70 text-[10px] font-mono">$495/yr</span>
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
                    Contact Us
                  </Link>
                </div>
              </div>

              {/* Get in Touch */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-4">Get in Touch</p>
                <div className="mb-5">
                  <FooterNewsletter />
                </div>
                <div className="space-y-2.5">
                  <Link href="/pell" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Start Free →
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
