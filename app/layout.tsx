import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aireshark.com";

export const metadata: Metadata = {
  title: {
    default: "aireshark - Intelligence for Consolidated HVAC",
    template: "%s | aireshark",
  },
  description:
    "Track private equity acquisitions and consolidation in the residential HVAC industry. Real-time intelligence on PE firms, acquired brands, and market activity.",
  keywords: [
    "HVAC private equity",
    "HVAC acquisitions",
    "home services M&A",
    "PE consolidation tracker",
    "HVAC industry intelligence",
    "private equity tracker",
  ],
  authors: [{ name: "aireshark" }],
  creator: "aireshark",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "aireshark",
    title: "aireshark - Intelligence for Consolidated HVAC",
    description:
      "Real-time intelligence on private equity activity in the HVAC industry.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "aireshark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "aireshark",
    description:
      "Private equity intelligence for the HVAC industry.",
    images: ["/og-image.png"],
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="nav-blur sticky top-0 z-50 border-b border-black/[0.04]">
          <div className="max-w-[980px] mx-auto px-6 relative">
            <div className="flex justify-between items-center h-12">
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-100"
              >
                <Image
                  src="/logo.png"
                  alt="aireshark"
                  width={36}
                  height={36}
                  className="object-contain"
                />
                <span className="text-[21px] font-semibold tracking-tight text-[#1d1d1f]">
                  aireshark
                </span>
              </Link>
              <MobileNav />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="border-t border-black/[0.04] bg-gradient-to-b from-white to-[#f5f5f7]">
          <div className="max-w-[980px] mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="aireshark"
                  width={24}
                  height={24}
                  className="object-contain opacity-70"
                />
                <p className="text-xs text-[#86868b]">
                  <span className="keyword">aireshark</span> — Private equity intelligence for HVAC
                </p>
              </div>
              <div className="flex items-center gap-8">
                <Link
                  href="/firms"
                  className="text-xs text-[#86868b] hover:text-[#14b8a6] transition-colors"
                >
                  Platforms
                </Link>
                <Link
                  href="/brands"
                  className="text-xs text-[#86868b] hover:text-[#14b8a6] transition-colors"
                >
                  Brands
                </Link>
                <Link
                  href="/articles"
                  className="text-xs text-[#86868b] hover:text-[#14b8a6] transition-colors"
                >
                  Articles
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
