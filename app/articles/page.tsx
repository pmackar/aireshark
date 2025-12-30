import Link from "next/link";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Articles",
  description: "Latest news and articles about HVAC industry acquisitions and private equity activity.",
};

type ArticleWithRelations = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedDate: Date | null;
  summary: string | null;
  articleType: string | null;
  platform: { name: string; slug: string } | null;
  privateEquityFirm: { name: string; slug: string } | null;
};

async function getArticles(): Promise<ArticleWithRelations[]> {
  try {
    return await prisma.article.findMany({
      include: {
        platform: {
          select: { name: true, slug: true },
        },
        privateEquityFirm: {
          select: { name: true, slug: true },
        },
      },
      orderBy: {
        publishedDate: "desc",
      },
      take: 100,
    });
  } catch {
    return [];
  }
}

function getArticleTypeLabel(type: string | null): string {
  switch (type) {
    case "acquisition":
      return "Acquisition";
    case "expansion":
      return "Expansion";
    case "leadership":
      return "Leadership";
    case "industry":
      return "Industry";
    default:
      return "News";
  }
}

function getArticleTypeColor(type: string | null): string {
  switch (type) {
    case "acquisition":
      return "bg-[#14b8a6]/10 text-[#14b8a6]";
    case "expansion":
      return "bg-blue-100 text-blue-700";
    case "leadership":
      return "bg-purple-100 text-purple-700";
    case "industry":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-black/5 text-[#6e6e73]";
  }
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-16 pb-12 md:pt-20 md:pb-16 mesh-gradient">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <p className="badge badge-accent mb-4">Intelligence</p>
          <h1 className="hero-headline mb-4">
            <span className="accent">Articles</span>
          </h1>
          <p className="text-[19px] text-[#6e6e73] max-w-[600px] mx-auto">
            Latest <span className="keyword">news</span> and updates from the HVAC industry
          </p>
        </div>
      </section>

      {/* Articles List */}
      <section className="py-16">
        <div className="max-w-[980px] mx-auto px-6">
          {articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article, index) => (
                <article
                  key={article.id}
                  className="glass-card p-6 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 0.03}s`, animationFillMode: "forwards" }}
                >
                  <div className="flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[17px] font-semibold text-[#1d1d1f] hover:text-[#14b8a6] transition-colors line-clamp-2"
                        >
                          {article.title}
                        </a>
                      </div>
                      <span className={`badge shrink-0 ${getArticleTypeColor(article.articleType)}`}>
                        {getArticleTypeLabel(article.articleType)}
                      </span>
                    </div>

                    {/* Summary */}
                    {article.summary && (
                      <p className="text-[15px] text-[#6e6e73] line-clamp-2">
                        {article.summary}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[#86868b]">
                      <span className="font-medium">{article.source}</span>
                      {article.publishedDate && (
                        <>
                          <span>•</span>
                          <span>
                            {new Date(article.publishedDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </>
                      )}
                      {article.platform && (
                        <>
                          <span>•</span>
                          <Link
                            href={`/firms/${article.platform.slug}`}
                            className="link-accent"
                          >
                            {article.platform.name}
                          </Link>
                        </>
                      )}
                      {article.privateEquityFirm && !article.platform && (
                        <>
                          <span>•</span>
                          <span className="text-[#14b8a6]">
                            {article.privateEquityFirm.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="glass-premium p-16 text-center max-w-lg mx-auto">
              <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-3">
                No Articles Yet
              </h2>
              <p className="text-[15px] text-[#6e6e73] mb-6">
                Articles will appear here as they are discovered by the scraper.
              </p>
              <p className="text-[13px] text-[#86868b]">
                Run the scraper from the Admin panel to fetch articles.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
