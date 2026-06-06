import Link from "next/link";
import { ClientCard } from "@/components/dashboard/client-card";
import { requireClientUser } from "@/lib/auth";
import { getFreeTierUsageForUser } from "@/lib/services/billing-service";
import { listClientsForUser } from "@/lib/services/client-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireClientUser();
  const clients = await listClientsForUser(user.userId);
  const totalClicks = clients.reduce((sum, client) => sum + client.clickCount, 0);
  const totalViews = clients.reduce((sum, client) => sum + client.viewCount, 0);
  const activeLinks = clients.filter((client) => !client.isExpired).length;
  const quota = await getFreeTierUsageForUser(user.userId);

  return (
    <div className="space-y-4">
      <section>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--on-surface)]">
            Review links
          </h1>
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--on-surface-variant)]">
            <span>{quota.linksCreatedThisMonth}/{quota.monthlyLinkLimit} links this month</span>
            <span>{activeLinks} active</span>
            <span>{quota.reviewsPerLink} scripts per link</span>
            <span>{totalViews} link opens</span>
            <span>{totalClicks} Google clicks</span>
          </p>
        </div>
      </section>

      <section>
        {clients.length ? (
          <div className="space-y-2.5">
            {clients.map((client, index) => (
              <div
                key={client.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <ClientCard client={client} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-ambient">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10">
              <svg
                className="h-6 w-6 text-brand"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-bold text-[var(--on-surface)]">
              No links yet
            </h2>
            <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
              Create a review link and download its QR code.
            </p>
            <Link
              href="/dashboard/clients/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand to-[#0891b2] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_-2px_rgba(13,148,136,0.35)] transition-all hover:-translate-y-0.5"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create first link
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
