import Link from "next/link";
import { ClientCard } from "@/components/dashboard/client-card";
import { requireClientUser } from "@/lib/auth";
import { getClientLimitLabel } from "@/lib/billing";
import { getBillingSummaryForUser } from "@/lib/services/billing-service";
import { listClientsForUser } from "@/lib/services/client-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireClientUser();
  const billing = await getBillingSummaryForUser(user.userId);
  const clients = await listClientsForUser(user.userId);
  const totalReviews = clients.reduce((sum, client) => sum + client.reviewCount, 0);
  const totalClicks = clients.reduce((sum, client) => sum + client.clickCount, 0);
  const planCapacityLabel =
    billing.clientLimit === 0
      ? "Billing needed"
      : `${billing.activeClientCount}/${getClientLimitLabel(billing.clientLimit)}`;

  return (
    <div className="space-y-8">
      {/* ─── Hero header (Stitch tonal card elevated) ─── */}
      <section className="surface-card-elevated overflow-hidden p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="data-pulse" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
                Dashboard Overview
              </p>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-[var(--on-surface)] sm:text-3xl">
              Manage your review funnel
              <span className="gradient-text"> from one place.</span>
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-[var(--on-surface-variant)]">
              Choose a plan, create your review links, refresh curated reviews,
              and share public pages that help customers leave Google reviews faster.
            </p>
          </div>
          {billing.canCreateClient ? (
            <Link
              href="/dashboard/clients/new"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand to-[#0891b2] px-5 py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(13,148,136,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(13,148,136,0.45)]"
            >
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90"
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
              Create Link
            </Link>
          ) : (
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand to-[#0891b2] px-5 py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(13,148,136,0.35)] transition-all duration-200 hover:-translate-y-0.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Activate billing
            </Link>
          )}
        </div>
      </section>

      {/* ─── Alerts ─── */}
      {!billing.hasSubscriptionAccess ? (
        <section className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <svg
              className="h-4 w-4 text-amber-500"
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
          </div>
          <span>
            Your subscription is <strong>{billing.status}</strong>. Activate a
            billing plan to create or renew public review links.
          </span>
        </section>
      ) : null}

      {billing.status === "cancelled" && billing.currentPeriodEnd ? (
        <section className="flex items-center gap-3 rounded-xl bg-cyan-50 p-4 text-sm text-cyan-900">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100">
            <svg className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>
            Auto-renew is off, but your plan is still usable until{" "}
            <strong>
              {new Date(billing.currentPeriodEnd).toLocaleDateString("en-IN")}
            </strong>
            . Subscription-based review links will expire after that if you do not renew.
          </span>
        </section>
      ) : null}

      {/* ─── Stats (Stitch tonal stat cards) ─── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Clients",
            value: clients.length,
            color: "text-brand",
            bg: "stat-bg-brand",
            icon: (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            ),
          },
          {
            label: "Review scripts",
            value: totalReviews,
            color: "text-cyan-600",
            bg: "stat-bg-cyan",
            icon: (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            ),
          },
          {
            label: "Outbound clicks",
            value: totalClicks,
            color: "text-violet-600",
            bg: "stat-bg-violet",
            icon: (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
              </svg>
            ),
          },
          {
            label: "Current plan",
            value: billing.planName || "No plan",
            color: "text-amber-600",
            bg: "stat-bg-amber",
            note: planCapacityLabel,
            icon: (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            ),
          },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`card-hover surface-card overflow-hidden p-5 animate-fade-up`}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">
                {stat.label}
              </p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
            </div>
            <p className={`mt-2 text-3xl font-extrabold tracking-[-0.02em] ${stat.color}`}>
              {stat.value}
            </p>
            {"note" in stat && stat.note ? (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="h-1.5 flex-1 rounded-full bg-[var(--surface-container)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-[#0891b2]"
                    style={{
                      width: `${Math.min(
                        (billing.activeClientCount / Math.max(billing.clientLimit || 1, 1)) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-xs font-medium text-[var(--on-surface-variant)]">{stat.note}</p>
              </div>
            ) : null}
          </div>
        ))}
      </section>

      {/* ─── Client list ─── */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-[-0.01em] text-[var(--on-surface)]">
              Link dashboard
            </h2>
            <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
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
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand to-[#0891b2] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(13,148,136,0.35)] transition-all duration-200 hover:-translate-y-0.5"
          >
            {billing.canCreateClient ? (
              <>
                <svg className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Link
              </>
            ) : (
              "Manage billing"
            )}
          </Link>
        </div>

        {clients.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {clients.map((client, index) => (
              <div key={client.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.06}s` }}>
                <ClientCard client={client} />
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-card-elevated p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/10 to-[#0891b2]/10">
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
            <h2 className="mt-5 text-lg font-bold text-[var(--on-surface)]">
              No links yet
            </h2>
            <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
              Create your first link to generate a unique public review page.
            </p>
            <Link
              href="/dashboard/clients/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand to-[#0891b2] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(13,148,136,0.35)] transition-all hover:-translate-y-0.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Get started
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
