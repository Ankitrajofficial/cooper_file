import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { type BusinessSector } from "@/types";

export function ExpiredReviewBoard({
  businessName,
  city,
  sector,
  reason,
  expiredAt,
}: {
  businessName: string;
  city: string;
  sector: BusinessSector;
  reason: "link_expired" | "subscription_inactive";
  expiredAt?: string | null;
}) {
  return (
    <div className="min-h-screen bg-paper pb-12">
      <SiteHeader compact />
      <div className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>{sector}</Badge>
            <Badge className="bg-amber-100 text-amber-800">{city}</Badge>
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Review link unavailable for {businessName}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {reason === "link_expired"
              ? "This review page has expired and is no longer accepting new visits."
              : "This review page is paused because the business subscription is not active right now."}
          </p>
          {expiredAt ? (
            <p className="mt-3 text-sm text-slate-500">
              Effective date: {new Date(expiredAt).toLocaleDateString("en-IN")}
            </p>
          ) : null}
          <div className="mt-8 rounded-3xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            If you reached this page from the business owner, ask them to renew or
            reactivate the review funnel and share the updated link.
          </div>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
