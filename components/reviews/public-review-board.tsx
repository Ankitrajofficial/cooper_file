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
    <div className="min-h-screen bg-paper pb-12">
      <SiteHeader compact />
      <div className="px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-panel">
            <div className="bg-grid-fade bg-[size:30px_30px] px-6 py-10 sm:px-10">
              <div className="max-w-4xl space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge>{client.sector}</Badge>
                  <Badge className="bg-teal-50 text-teal-800">{client.industry}</Badge>
                  <Badge className="bg-amber-100 text-amber-800">{client.city}</Badge>
                  {client.expiresAt ? (
                    <Badge className="bg-slate-100 text-slate-700">
                      Active until {new Date(client.expiresAt).toLocaleDateString("en-IN")}
                    </Badge>
                  ) : null}
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">
                    Review {client.businessName}
                  </h1>
                  <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
                    Pick any script below, copy it instantly, then we will open the
                    Google review form for you in a new tab. The scripts below are
                    rotated automatically so repeat visitors keep seeing fresh options.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
                    <p className="font-semibold text-ink">Step 1</p>
                    <p className="mt-1">Tap any review card that fits your experience.</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
                    <p className="font-semibold text-ink">Step 2</p>
                    <p className="mt-1">The review text will copy automatically.</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
                    <p className="font-semibold text-ink">Step 3</p>
                    <p className="mt-1">
                      Paste it on Google, adjust if needed, and submit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {groups.map((group) => (
            <section key={group.category} className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-ink">{group.category}</h2>
                  <p className="text-sm text-slate-500">
                    Natural copy-ready scripts for this topic.
                  </p>
                </div>
                <Badge className="bg-slate-100 text-slate-700">
                  {group.reviews.length} reviews
                </Badge>
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
