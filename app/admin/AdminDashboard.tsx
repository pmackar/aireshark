"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ScraperStatus {
  status: string;
  counts: {
    peFirms: number;
    brands: number;
    articles: number;
    acquisitions: number;
  };
  recentArticles: Array<{
    title: string;
    source: string;
    url: string;
    createdAt: string;
  }>;
  recentAcquisitions: Array<{
    peFirm: string;
    brand: string;
    date: string;
    amount: string | null;
    addedAt: string;
  }>;
  timestamp: string;
}

interface ScrapeResult {
  success: boolean;
  type: string;
  result: Record<string, unknown> | null;
  error?: string;
  timestamp: string;
}

interface AdminDashboardProps {
  userName?: string | null;
}

export default function AdminDashboard({ userName }: AdminDashboardProps) {
  const [status, setStatus] = useState<ScraperStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchStatus();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/user/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function fetchStatus() {
    try {
      const response = await fetch("/api/scrape/status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    } finally {
      setLoading(false);
    }
  }

  async function triggerScrape(type: string) {
    setScraping(true);
    setScrapeResult(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();
      setScrapeResult(data);

      // Refresh status after scraping
      if (data.success) {
        await fetchStatus();
      }
    } catch (error) {
      setScrapeResult({
        success: false,
        type,
        result: null,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setScraping(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          {userName && (
            <p className="text-sm text-gray-500 mt-1">Logged in as {userName}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      {status && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="PE Firms" value={status.counts.peFirms} />
          <StatCard label="Brands" value={status.counts.brands} />
          <StatCard label="Articles" value={status.counts.articles} />
          <StatCard label="Acquisitions" value={status.counts.acquisitions} />
        </div>
      )}

      {/* Scraper Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Scraper Controls
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Note: Scraping requires OpenAI API key to be configured. Google News
          requires Google API credentials. Gmail Alerts requires Gmail OAuth
          credentials.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => triggerScrape("news")}
            disabled={scraping}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scraping ? "Scraping..." : "Scrape News Sources"}
          </button>
          <button
            onClick={() => triggerScrape("google")}
            disabled={scraping}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scraping ? "Scraping..." : "Scrape Google News"}
          </button>
          <button
            onClick={() => triggerScrape("gmail")}
            disabled={scraping}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scraping ? "Scraping..." : "Scrape Gmail Alerts"}
          </button>
          <button
            onClick={() => triggerScrape("portfolio")}
            disabled={scraping}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scraping ? "Scraping..." : "Scrape PE Portfolios"}
          </button>
          <button
            onClick={() => triggerScrape("all")}
            disabled={scraping}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scraping ? "Scraping..." : "Run All Scrapers"}
          </button>
        </div>

        {/* Scrape Result */}
        {scrapeResult && (
          <div
            className={`mt-4 p-4 rounded ${
              scrapeResult.success
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <p className="font-medium">
              {scrapeResult.success ? "Scrape completed!" : "Scrape failed"}
            </p>
            {scrapeResult.error && (
              <p className="text-sm mt-1">Error: {scrapeResult.error}</p>
            )}
            {scrapeResult.result && (
              <pre className="text-xs mt-2 overflow-auto">
                {JSON.stringify(scrapeResult.result, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Recent Articles */}
      {status && status.recentArticles.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recently Added Articles
          </h2>
          <div className="space-y-3">
            {status.recentArticles.map((article, i) => (
              <div key={i} className="border-b pb-3 last:border-0">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {article.title}
                </a>
                <div className="text-sm text-gray-500">
                  {article.source} -{" "}
                  {new Date(article.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Acquisitions */}
      {status && status.recentAcquisitions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recently Added Acquisitions
          </h2>
          <div className="space-y-3">
            {status.recentAcquisitions.map((acq, i) => (
              <div key={i} className="border-b pb-3 last:border-0">
                <p className="font-medium">
                  {acq.peFirm} → {acq.brand}
                </p>
                <div className="text-sm text-gray-500">
                  {acq.amount || "Undisclosed"} -{" "}
                  {new Date(acq.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cron Schedule Info */}
      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Automated Scraping Schedule
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          When deployed to Vercel, the following cron jobs run automatically:
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <strong>Daily (6 AM UTC):</strong> RSS feeds, Gmail alerts, and news
            sources scraped for new articles
          </li>
          <li>
            <strong>Weekly (Monday 8 AM UTC):</strong> Platform monitoring and
            PE firm portfolio pages refreshed
          </li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  );
}
