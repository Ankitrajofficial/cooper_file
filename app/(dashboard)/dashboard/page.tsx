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
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-panel backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              Dashboard Overview
            </p>
            <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
              Manage every review funnel from one place.
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Create clients, refresh AI-generated reviews, and share public links
              that help customers leave polished Google reviews faster.
            </p>
          </div>
          {billing.canCreateClient ? (
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Add new client
            </Link>
          ) : (
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Activate billing
            </Link>
          )}
        </div>
      </section>

      {billing.status !== "active" ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50/90 p-5 text-sm text-amber-900 shadow-sm">
          Your subscription is {billing.status}. Activate a billing plan to create
          or renew public review links.
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Clients</p>
          <p className="mt-2 text-3xl font-bold text-ink">{clients.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Review scripts</p>
          <p className="mt-2 text-3xl font-bold text-ink">{totalReviews}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Outbound clicks</p>
          <p className="mt-2 text-3xl font-bold text-ink">{totalClicks}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Plan capacity</p>
          <p className="mt-2 text-3xl font-bold text-ink">
            {billing.activeClientCount}/{getClientLimitLabel(billing.clientLimit)}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-ink">Client dashboard</h2>
            <p className="mt-2 text-slate-600">
              Manage clients, generate categorized reviews, and share their public
              review page.
            </p>
          </div>
          <Link
            href={billing.canCreateClient ? "/dashboard/clients/new" : "/dashboard/billing"}
            className="inline-flex items-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
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
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-ink">No clients yet</h2>
            <p className="mt-3 text-slate-600">
              Create your first client to generate a unique public review page.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
