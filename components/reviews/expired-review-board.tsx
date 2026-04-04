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
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="hero-gradient relative">
        <div className="absolute inset-0 premium-grid opacity-20" />
        <SiteHeader compact />
      </div>

      <div className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-8 shadow-panel">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{sector}</Badge>
            <Badge variant="amber">{city}</Badge>
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Review link unavailable for {businessName}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            {reason === "link_expired"
              ? "This review page has expired and is no longer accepting new visits."
              : "This review page is paused because the business subscription is not active right now."}
          </p>
          {expiredAt ? (
            <p className="mt-2 text-sm text-slate-500">
              Effective date:{" "}
              {new Date(expiredAt).toLocaleDateString("en-IN")}
            </p>
          ) : null}
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
            If you reached this page from the business owner, ask them to renew
            or reactivate the review funnel and share the updated link.
          </div>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-xl bg-gradient-to-b from-brand to-brand-dark px-5 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(13,148,136,0.35)] transition-all hover:-translate-y-0.5"
          >
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
