import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://workforce-intelligence-wine.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Workforce Intelligence — Workforce Program Validation for Community Colleges",
    template: "%s | Workforce Intelligence",
  },
  description:
    "Data-driven workforce program validation for community colleges. Get community college program analysis, financial projections, and noncredit to credit pathway recommendations in 48 hours.",
  keywords: [
    "workforce program validation",
    "community college program analysis",
    "noncredit to credit pathway",
    "workforce development ROI",
    "program viability analysis",
    "new program feasibility",
    "workforce training validation",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Workforce Intelligence",
    title: "Workforce Intelligence — Workforce Program Validation for Community Colleges",
    description:
      "Data-driven workforce program validation for community colleges. Market analysis, financial projections, and strategic recommendations in 48 hours.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Workforce Intelligence — Workforce Program Validation for Community Colleges",
    description:
      "Data-driven workforce program validation for community colleges. Market analysis, financial projections, and strategic recommendations in 48 hours.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              Workforce Intelligence
            </Link>
            <div className="flex gap-6">
              <Link href="/dashboard" className="text-sm font-medium hover:underline">
                Dashboard
              </Link>
              <Link href="/methodology" className="text-sm font-medium hover:underline">
                Methodology
              </Link>
              <Link href="/submit" className="text-sm font-medium hover:underline">
                Start Validation
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
