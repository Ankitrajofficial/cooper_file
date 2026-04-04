import Link from "next/link";
import { ClientCard } from "@/components/dashboard/client-card";
import { requireUser } from "@/lib/auth";
import { getClientLimitLabel } from "@/lib/billing";
import { getBillingSummaryForUser } from "@/lib/services/billing-service";
import { listClientsForUser } from "@/lib/services/client-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const billing = await getBillingSummaryForUser(user.userId);
  const clients = await listClientsForUser(user.userId);
  const totalReviews = clients.reduce((sum, client) => sum + client.reviewCount, 0);
  const totalClicks = clients.reduce((sum, client) => sum + client.clickCount, 0);

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
              Dashboard Overview
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Manage every review funnel from one place.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Create clients, refresh AI-generated reviews, and share public
              links that help customers leave polished Google reviews faster.
            </p>
          </div>
          {billing.canCreateClient ? (
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-brand to-brand-dark px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(13,148,136,0.35)] transition-all hover:-translate-y-0.5"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add new client
            </Link>
          ) : (
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center rounded-xl bg-gradient-to-b from-brand to-brand-dark px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(13,148,136,0.35)] transition-all hover:-translate-y-0.5"
            >
              Activate billing
            </Link>
          )}
        </div>
      </section>

      {billing.status !== "active" ? (
        <section className="rounded-xl border border-amber-200/80 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 shrink-0 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            Your subscription is {billing.status}. Activate a billing plan to
            create or renew public review links.
          </div>
        </section>
      ) : null}

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Clients", value: clients.length, color: "text-brand" },
          { label: "Review scripts", value: totalReviews, color: "text-cyan-600" },
          { label: "Outbound clicks", value: totalClicks, color: "text-violet-600" },
          {
            label: "Plan capacity",
            value: `${billing.activeClientCount}/${getClientLimitLabel(billing.clientLimit)}`,
            color: "text-amber-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-card"
          >
            <p className="text-[11px] font-medium text-slate-500">{stat.label}</p>
            <p className={`mt-1.5 text-2xl font-extrabold tracking-tight ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Client list */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink">Client dashboard</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage clients, generate categorized reviews, and share their
              public review page.
            </p>
          </div>
          <Link
            href={
              billing.canCreateClient
                ? "/dashboard/clients/new"
                : "/dashboard/billing"
            }
            className="inline-flex items-center rounded-xl bg-gradient-to-b from-brand to-brand-dark px-4 py-2 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(13,148,136,0.35)] transition-all hover:-translate-y-0.5"
          >
            {billing.canCreateClient ? "Add new client" : "Manage billing"}
          </Link>
        </div>

        {clients.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-ink">
              No clients yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Create your first client to generate a unique public review page.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
