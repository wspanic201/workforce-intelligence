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

export const metadata: Metadata = {
  title: "Workforce Intelligence - Program Validation for Community Colleges",
  description: "Comprehensive workforce program validation for community colleges — market analysis, financial projections, and strategic recommendations in 48 hours",
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
