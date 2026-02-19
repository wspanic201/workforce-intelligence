import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { NavBar } from "@/components/cosmic/NavBar";
import { WavelengthMark } from "@/components/cosmic/WavelengthLogo";
import { ThemeProvider } from "@/components/ThemeProvider";

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
        <NavBar />

        <main>{children}</main>

        {/* Footer */}
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
                  Helping community colleges build the programs their communities actually need. Data-backed program development starts here.
                </p>
              </div>

              {/* Products */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-4">Products</p>
                <div className="space-y-2.5">
                  <Link href="/pell" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Pell Readiness Check
                    <span className="text-teal-400/60 text-[10px] ml-1.5">Free</span>
                  </Link>
                  <Link href="/compliance-gap" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Compliance Gap Report
                    <span className="text-blue-400/60 text-[10px] ml-1.5">$295</span>
                  </Link>
                  <Link href="/grants" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Grant Intelligence Scan
                    <span className="text-green-400/60 text-[10px] ml-1.5">$495</span>
                  </Link>
                  <Link href="/discover" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Market Scan
                    <span className="text-purple-400/60 text-[10px] ml-1.5">$1,500</span>
                  </Link>
                  <Link href="/validate" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Program Validation
                    <span className="text-emerald-400/60 text-[10px] ml-1.5">$2,000</span>
                  </Link>
                </div>
              </div>

              {/* Resources */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-4">Resources</p>
                <div className="space-y-2.5">
                  <Link href="/report/demo" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Sample Report
                  </Link>
                  <Link href="/blog" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Blog
                  </Link>
                  <Link href="/#how-it-works" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    How It Works
                  </Link>
                  <Link href="/#faq" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    FAQ
                  </Link>
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-4">Get in Touch</p>
                <div className="space-y-2.5">
                  <a href="mailto:hello@withwavelength.com" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    hello@withwavelength.com
                  </a>
                  <Link href="/pell" className="block text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                    Start Free →
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-theme-subtle">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs text-theme-muted">
                  © {new Date().getFullYear()} Wavelength. All rights reserved.
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-theme-muted">Built in Iowa 🌽 · Tuned to 📡</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
