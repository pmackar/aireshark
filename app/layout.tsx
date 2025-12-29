import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hvac-pe-tracker.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "HVAC PE Tracker - Private Equity Acquisitions in HVAC",
    template: "%s | HVAC PE Tracker",
  },
  description:
    "Track private equity acquisitions and consolidation in the residential HVAC, plumbing, and electrical services industry. Monitor PE firms, acquired brands, and deal activity.",
  keywords: [
    "HVAC private equity",
    "HVAC acquisitions",
    "plumbing acquisitions",
    "home services M&A",
    "PE consolidation",
    "Apex Service Partners",
    "Wrench Group",
    "HVAC industry tracker",
  ],
  authors: [{ name: "HVAC PE Tracker" }],
  creator: "HVAC PE Tracker",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "HVAC PE Tracker",
    title: "HVAC PE Tracker - Private Equity Acquisitions in HVAC",
    description:
      "Track private equity acquisitions and consolidation in the residential HVAC industry.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HVAC PE Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC PE Tracker",
    description:
      "Track private equity acquisitions in the residential HVAC industry.",
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
      <body className="antialiased min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="text-xl font-bold text-gray-900">
                  HVAC PE Tracker
                </a>
              </div>
              <div className="flex items-center space-x-8">
                <a href="/firms" className="text-gray-600 hover:text-gray-900">
                  PE Firms
                </a>
                <a href="/brands" className="text-gray-600 hover:text-gray-900">
                  Brands
                </a>
                <a href="/admin" className="text-gray-600 hover:text-gray-900">
                  Admin
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-grow">{children}</main>
        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
            HVAC PE Tracker - Tracking private equity in residential heating and air
          </div>
        </footer>
      </body>
    </html>
  );
}
