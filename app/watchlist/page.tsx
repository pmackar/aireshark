import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/auth";
import { getUserWatchlist, getWatchlistCounts, getEntityFromWatchlistItem } from "@/lib/watchlist";
import WatchlistItemCard from "./WatchlistItemCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Watchlist | aireshark",
  description: "Track PE firms, platforms, and brands you're monitoring",
};

export default async function WatchlistPage() {
  const user = await getUserFromSession();

  if (!user) {
    redirect("/login?redirect=/watchlist");
  }

  const [items, counts] = await Promise.all([
    getUserWatchlist(user.id),
    getWatchlistCounts(user.id),
  ]);

  type WatchlistItem = Awaited<ReturnType<typeof getUserWatchlist>>[number];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-16 pb-12 mesh-gradient">
        <div className="max-w-[980px] mx-auto px-6">
          <p className="badge badge-accent mb-4">Personal Tracking</p>
          <h1 className="hero-headline mb-4">
            Your <span className="accent">Watchlist</span>
          </h1>
          <p className="text-[17px] text-[#6e6e73] max-w-[600px]">
            Track PE firms, platforms, and brands you&apos;re monitoring for acquisitions and market moves.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total" value={counts.total} />
            <StatCard label="Firms" value={counts.firms} />
            <StatCard label="Platforms" value={counts.platforms} />
            <StatCard label="Brands" value={counts.brands} />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-[980px] mx-auto px-6">
          {items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item: WatchlistItem, index: number) => {
                const entity = getEntityFromWatchlistItem(item);
                if (!entity) return null;

                return (
                  <WatchlistItemCard
                    key={item.id}
                    item={item}
                    entity={entity}
                    index={index}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card p-5 text-center">
      <p className="text-[2rem] font-bold keyword">{value}</p>
      <p className="text-[13px] text-[#86868b]">{label}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass-premium p-16 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-500/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </div>
      <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-3">No items in your watchlist</h2>
      <p className="text-[15px] text-[#6e6e73] mb-6">
        Start tracking PE firms, platforms, and brands by clicking the star icon on their detail pages.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/firms" className="btn-secondary">
          Browse Platforms
        </Link>
        <Link href="/brands" className="btn-secondary">
          Browse Brands
        </Link>
      </div>
    </div>
  );
}
