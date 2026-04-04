"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BUSINESS_SECTORS, type BillingInterval, type SubscriptionTier } from "@/types";
import { cn, formatDate, toErrorMessage } from "@/lib/utils";
import { formatInr } from "@/lib/billing";

type AdminDashboardClientProps = {
  overview: {
    stats: {
      totalUsers: number;
      totalClients: number;
      activeSubscribers: number;
      totalReviews: number;
      totalClicks: number;
      estimatedMrrInr: number;
      activeArrInr: number;
    };
    users: Array<{
      id: string;
      email: string;
      name: string;
      role: "client" | "admin";
      subscriptionTier: SubscriptionTier;
      subscriptionStatus: string;
      subscriptionInterval: BillingInterval;
      activeClientCount: number;
      totalReviews: number;
      totalClicks: number;
    }>;
    clients: Array<{
      id: string;
      slug: string;
      businessName: string;
      city: string;
      ownerId: string;
      ownerEmail: string;
      ownerName: string;
      ownerPlan: SubscriptionTier;
      ownerSubscriptionStatus: string;
      reviewCount: number;
      clickCount: number;
      createdAt: string;
    }>;
  };
};

type ClientDraft = {
  ownerEmail: string;
  businessName: string;
  city: string;
  sector: string;
  industry: string;
  businessDescription: string;
  expiresAt: string;
  googleReviewLink: string;
};

const defaultDraft: ClientDraft = {
  ownerEmail: "",
  businessName: "",
  city: "",
  sector: "",
  industry: "",
  businessDescription: "",
  expiresAt: "",
  googleReviewLink: "",
};

export function AdminDashboardClient({ overview }: AdminDashboardClientProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const [planSelections, setPlanSelections] = useState(() =>
    Object.fromEntries(
      overview.users.map((user) => [
        user.id,
        {
          tier: user.subscriptionTier === "none" ? "tier_1" : user.subscriptionTier,
          interval: user.subscriptionInterval,
        },
      ]),
    ) as Record<string, { tier: Exclude<SubscriptionTier, "none">; interval: BillingInterval }>,
  );
  const [draft, setDraft] = useState<ClientDraft>(defaultDraft);

  function setPlanSelection(
    userId: string,
    key: "tier" | "interval",
    value: Exclude<SubscriptionTier, "none"> | BillingInterval,
  ) {
    setPlanSelections((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        [key]: value,
      },
    }));
  }

  function updateDraft<K extends keyof ClientDraft>(key: K, value: ClientDraft[K]) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function runAction(action: () => Promise<void>) {
    setFeedback("");

    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (error) {
        setFeedback(toErrorMessage(error));
      }
    });
  }

  function handleGrantPlan(userId: string) {
    const selection = planSelections[userId];

    runAction(async () => {
      const response = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          tier: selection.tier,
          interval: selection.interval,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Could not update subscription.");
      }

      setFeedback("Client plan updated.");
    });
  }

  function handleClearPlan(userId: string) {
    runAction(async () => {
      const response = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          tier: "none",
          interval: "monthly",
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Could not clear subscription.");
      }

      setFeedback("Client plan removed.");
    });
  }

  function handleCreateClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    runAction(async () => {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Could not create client.");
      }

      setDraft(defaultDraft);
      setFeedback("Client created manually.");
    });
  }

  function handleDeleteClient(clientId: string, businessName: string) {
    if (!window.confirm(`Delete ${businessName} from the admin panel?`)) {
      return;
    }

    runAction(async () => {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Could not delete client.");
      }

      setFeedback("Client removed.");
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
              Admin Overview
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Separate client workspace from platform control.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This panel is for admin-only tasks: grant plans, manually add or remove client links,
              monitor review clicks, and track portfolio revenue.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Client users now belong in
            {" "}
            <code>/dashboard</code>
            {" "}
            and admins belong in
            {" "}
            <code>/admin</code>
            .
          </div>
        </div>
      </section>

      {feedback ? (
        <div className="rounded-xl border border-brand/20 bg-brand/[0.06] px-4 py-3 text-sm text-slate-700">
          {feedback}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {[
          { label: "Client users", value: overview.stats.totalUsers, color: "text-brand" },
          { label: "Managed links", value: overview.stats.totalClients, color: "text-cyan-600" },
          { label: "Active subscribers", value: overview.stats.activeSubscribers, color: "text-emerald-600" },
          { label: "Total reviews", value: overview.stats.totalReviews, color: "text-violet-600" },
          { label: "Review clicks", value: overview.stats.totalClicks, color: "text-amber-600" },
          { label: "Estimated MRR", value: formatInr(overview.stats.estimatedMrrInr), color: "text-rose-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-card">
            <p className="text-[11px] font-medium text-slate-500">{stat.label}</p>
            <p className={`mt-1.5 text-2xl font-extrabold tracking-tight ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
                Client plans
              </p>
              <h2 className="mt-2 text-xl font-bold text-ink">Grant or remove access</h2>
            </div>
            <Badge variant="brand">Active ARR {formatInr(overview.stats.activeArrInr)}</Badge>
          </div>

          <div className="mt-5 space-y-4">
            {overview.users
              .filter((user) => user.role === "client")
              .map((user) => (
                <div key={user.id} className="rounded-xl border border-slate-200/80 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{user.name || user.email}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="slate">Plan: {user.subscriptionTier}</Badge>
                        <Badge variant="teal">Status: {user.subscriptionStatus}</Badge>
                        <Badge variant="amber">{user.activeClientCount} links</Badge>
                        <Badge variant="brand">{user.totalClicks} clicks</Badge>
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
                      <select
                        value={planSelections[user.id]?.tier || "tier_1"}
                        onChange={(event) =>
                          setPlanSelection(user.id, "tier", event.target.value as Exclude<SubscriptionTier, "none">)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                      >
                        <option value="tier_1">Tier 1</option>
                        <option value="tier_2">Tier 2</option>
                        <option value="tier_3">Tier 3</option>
                      </select>
                      <select
                        value={planSelections[user.id]?.interval || "monthly"}
                        onChange={(event) =>
                          setPlanSelection(user.id, "interval", event.target.value as BillingInterval)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                      <Button size="sm" onClick={() => handleGrantPlan(user.id)} disabled={isPending}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleClearPlan(user.id)}
                        disabled={isPending}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <form
          onSubmit={handleCreateClient}
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
            Manual client add
          </p>
          <h2 className="mt-2 text-xl font-bold text-ink">Create a client for any account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Use this when you need to manually add a review link for an existing client owner.
          </p>

          <div className="mt-5 space-y-4">
            <Input
              label="Client owner email"
              value={draft.ownerEmail}
              onChange={(event) => updateDraft("ownerEmail", event.target.value)}
              placeholder="owner@business.com"
              required
            />
            <Input
              label="Business name"
              value={draft.businessName}
              onChange={(event) => updateDraft("businessName", event.target.value)}
              required
            />
            <Input
              label="City"
              value={draft.city}
              onChange={(event) => updateDraft("city", event.target.value)}
              required
            />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Sector</span>
              <select
                value={draft.sector}
                onChange={(event) => updateDraft("sector", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
              >
                <option value="">Auto-detect sector</option>
                {BUSINESS_SECTORS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Industry"
              value={draft.industry}
              onChange={(event) => updateDraft("industry", event.target.value)}
              placeholder="Girls hostel near coaching institutes"
            />
            <Input
              label="Expiry date"
              type="date"
              value={draft.expiresAt}
              onChange={(event) => updateDraft("expiresAt", event.target.value)}
            />
            <Input
              label="Google review link"
              value={draft.googleReviewLink}
              onChange={(event) => updateDraft("googleReviewLink", event.target.value)}
              placeholder="https://g.page/r/..."
              required
            />
            <Textarea
              label="Business description"
              value={draft.businessDescription}
              onChange={(event) => updateDraft("businessDescription", event.target.value)}
              placeholder="Optional context for the review generator."
            />
          </div>

          <div className="mt-5 flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Working..." : "Create client"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDraft(defaultDraft)}
              disabled={isPending}
            >
              Reset
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
              Client links
            </p>
            <h2 className="mt-2 text-xl font-bold text-ink">Track performance by client</h2>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-3 py-2 font-medium">Client</th>
                <th className="px-3 py-2 font-medium">Owner</th>
                <th className="px-3 py-2 font-medium">Plan</th>
                <th className="px-3 py-2 font-medium">Reviews</th>
                <th className="px-3 py-2 font-medium">Clicks</th>
                <th className="px-3 py-2 font-medium">Created</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {overview.clients.map((client) => (
                <tr key={client.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-3 py-3">
                    <p className="font-semibold text-ink">{client.businessName}</p>
                    <p className="text-xs text-slate-500">{client.city}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-slate-700">{client.ownerName || client.ownerEmail}</p>
                    <p className="text-xs text-slate-500">{client.ownerEmail}</p>
                  </td>
                  <td className="px-3 py-3">
                    <div className="space-y-1">
                      <Badge variant="slate">{client.ownerPlan}</Badge>
                      <div className="text-xs text-slate-500">{client.ownerSubscriptionStatus}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-semibold text-cyan-700">{client.reviewCount}</td>
                  <td className="px-3 py-3 font-semibold text-brand">{client.clickCount}</td>
                  <td className="px-3 py-3 text-slate-600">{formatDate(client.createdAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/review/${client.slug}`}
                        target="_blank"
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClient(client.id, client.businessName)}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                          "bg-rose-50 text-rose-700 hover:bg-rose-100",
                        )}
                        disabled={isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
