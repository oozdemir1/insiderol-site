import { createClient } from "@/lib/server";
import { MessageSquareText } from "lucide-react";
import EmptyStateCard from "@/components/EmptyStateCard";

const LATEST_COUNT = 3;

export default async function LatestReviews() {
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("company_reviews")
    .select(
      "id, review, overall_rating, companies(name, slug), roles(name)"
    )
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false })
    .limit(LATEST_COUNT);

  const items = (reviews || []).filter(
    (review: any) => review.companies && review.roles
  );

  return (
    <section className="py-28 px-8 bg-[var(--section-light-2)] text-[var(--text-dark)]">
      <div className="w-full">
        <div className="mb-12 max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-dark)]">
            Son Yorumlar
          </h2>
          <p className="text-[var(--muted-dark)] text-lg mt-4">
            {items.length > 0
              ? "Çalışanların anonim şirket deneyimleri"
              : "Henüz paylaşılan bir yorum yok"}
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyStateCard
            tone="dark"
            icon={MessageSquareText}
            title="İlk yorumu sen paylaş"
            body="Çalıştığın ya da çalışmış olduğun bir şirketteki deneyimini anonim olarak paylaş, senden sonra gelenlere yol göster."
            ctaLabel="Yorum Paylaş"
            ctaHref="/share?tab=Yorum"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
            {items.map((review: any) => (
              <a
                key={review.id}
                href={`/companies/${review.companies.slug}?tab=yorum`}
                className="w-full border border-white/10 bg-[var(--card-green)] rounded-3xl p-8 hover:bg-[var(--card-green-hover)] transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {review.companies.name}
                    </h3>
                    <p className="text-sm text-white/70 mt-1">
                      {review.roles.name}
                    </p>
                  </div>
                  {review.overall_rating != null && (
                    <div className="text-white/80 text-sm">
                      ★ {Number(review.overall_rating).toFixed(1)}
                    </div>
                  )}
                </div>
                <p className="text-white/80 leading-8 mt-6 line-clamp-3">
                  {review.review}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
