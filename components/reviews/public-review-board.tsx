import { ReviewCard } from "@/components/reviews/review-card";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { type PublicClientPayload, type ReviewCategory } from "@/types";

type ReviewGroup = {
  category: ReviewCategory;
  reviews: Array<{
    id: string;
    text: string;
  }>;
};

export function PublicReviewBoard({
  client,
  groups,
}: {
  client: PublicClientPayload;
  groups: ReviewGroup[];
}) {
  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="hero-gradient relative">
        <div className="absolute inset-0 premium-grid opacity-20" />
        <SiteHeader compact />
        <div className="relative px-4 pb-12 pt-4 sm:px-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">{client.sector}</Badge>
              <Badge variant="teal">{client.industry}</Badge>
              <Badge variant="amber">{client.city}</Badge>
              {client.expiresAt ? (
                <Badge variant="slate">
                  Active until{" "}
                  {new Date(client.expiresAt).toLocaleDateString("en-IN")}
                </Badge>
              ) : null}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Review {client.businessName}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-400">
                Pick any script below, copy it instantly, then we&apos;ll open
                the Google review form for you in a new tab. Scripts rotate
                automatically so repeat visitors see fresh options.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { step: "1", text: "Tap any review card that fits your experience" },
                { step: "2", text: "The review text will copy automatically" },
                { step: "3", text: "Paste it on Google, adjust if needed, and submit" },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-4 backdrop-blur-sm"
                >
                  <p className="text-[11px] font-bold text-brand-muted">
                    Step {item.step}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-10">
          {groups.map((group) => (
            <section key={group.category} className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-ink">{group.category}</h2>
                  <p className="text-sm text-slate-500">
                    Natural copy-ready scripts for this topic.
                  </p>
                </div>
                <Badge variant="slate">{group.reviews.length} reviews</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    reviewId={review.id}
                    slug={client.slug}
                    text={review.text}
                    googleReviewLink={client.googleReviewLink}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
