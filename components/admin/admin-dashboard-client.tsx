"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BILLING_PLANS, formatInr } from "@/lib/billing";
import { BUSINESS_SECTORS, type BillingInterval, type SubscriptionTier } from "@/types";
import { cn, formatDate, toErrorMessage } from "@/lib/utils";

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

const planNameByTier = Object.fromEntries(
  BILLING_PLANS.map((plan) => [plan.tier, plan.name]),
) as Record<Exclude<SubscriptionTier, "none">, string>;

/* ─── Stat icon SVGs ─── */

function UsersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function LinksIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-5.193a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
    </svg>
  );
}

function SubsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ReviewsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function ClicksIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  );
}

export function AdminDashboardClient({ overview }: AdminDashboardClientProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isPending, setIsPending] = useState(false);
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

  async function runAction(action: () => Promise<void>) {
    setFeedback("");
    setIsPending(true);

    try {
      await action();
      router.refresh();
    } catch (error) {
      setFeedback(toErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  }

  function handleGrantPlan(userId: string) {
    const selection = planSelections[userId];

    void runAction(async () => {
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
    void runAction(async () => {
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

    void runAction(async () => {
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

    void runAction(async () => {
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

  const statCards = [
    { label: "Client Users", value: overview.stats.totalUsers, icon: <UsersIcon />, color: "text-[#6bd8cb]", glow: "shadow-[0_0_20px_-5px_rgba(107,216,203,0.2)]" },
    { label: "Managed Links", value: overview.stats.totalClients, icon: <LinksIcon />, color: "text-cyan-400", glow: "shadow-[0_0_20px_-5px_rgba(34,211,238,0.2)]" },
    { label: "Active Subscribers", value: overview.stats.activeSubscribers, icon: <SubsIcon />, color: "text-emerald-400", glow: "shadow-[0_0_20px_-5px_rgba(52,211,153,0.2)]" },
    { label: "Total Reviews", value: overview.stats.totalReviews, icon: <ReviewsIcon />, color: "text-violet-400", glow: "shadow-[0_0_20px_-5px_rgba(167,139,250,0.2)]" },
    { label: "Review Clicks", value: overview.stats.totalClicks, icon: <ClicksIcon />, color: "text-amber-400", glow: "shadow-[0_0_20px_-5px_rgba(251,191,36,0.2)]" },
    { label: "Estimated MRR", value: formatInr(overview.stats.estimatedMrrInr), icon: <RevenueIcon />, color: "text-rose-400", glow: "shadow-[0_0_20px_-5px_rgba(251,113,133,0.2)]" },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Hero section ─── */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0c1324] via-[#111b33] to-[#0d2a2a] p-8">
        <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-brand/[0.06] blur-[100px]" />
        <div className="absolute bottom-0 left-[20%] h-[200px] w-[400px] rounded-full bg-cyan-500/[0.04] blur-[80px]" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6bd8cb]">
              Admin Overview
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Platform Control Center
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
              Grant plans, manually add or remove client links,
              monitor review clicks, and track portfolio revenue — all from one panel.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-slate-400 backdrop-blur-sm">
            Client users use{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-[#6bd8cb]">/dashboard</code>
            {" "}· Admins use{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-[#6bd8cb]">/admin</code>
          </div>
        </div>
      </section>

      {/* ─── Feedback ─── */}
      {feedback ? (
        <div className="rounded-xl border border-[#6bd8cb]/20 bg-[#6bd8cb]/[0.06] px-4 py-3 text-sm text-slate-200 backdrop-blur-sm">
          {feedback}
        </div>
      ) : null}

      {/* ─── Stats grid ─── */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "group rounded-2xl border border-white/[0.06] bg-[#151b2d]/80 p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.1] hover:bg-[#191f31]",
              stat.glow,
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium tracking-wide text-slate-500">
                {stat.label}
              </p>
              <div className={cn("opacity-60 transition-opacity group-hover:opacity-100", stat.color)}>
                {stat.icon}
              </div>
            </div>
            <p className={cn("mt-2.5 text-2xl font-extrabold tracking-tight", stat.color)}>
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* ─── Client Plans + Manual Add ─── */}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Client Plans */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#151b2d]/80 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6bd8cb]">
                Client Plans
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">Grant or remove access</h2>
            </div>
            <div className="rounded-full border border-[#6bd8cb]/20 bg-[#6bd8cb]/[0.08] px-3.5 py-1.5 text-xs font-semibold text-[#6bd8cb]">
              Active ARR {formatInr(overview.stats.activeArrInr)}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {overview.users
              .filter((user) => user.role === "client")
              .map((user) => (
                <div
                  key={user.id}
                  className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.04]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6bd8cb] to-[#29a195] text-xs font-bold text-[#00302b]">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{user.name || user.email}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                          {user.subscriptionTier === "none"
                            ? "No plan"
                            : planNameByTier[user.subscriptionTier]}
                        </span>
                        <span className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                          user.subscriptionStatus === "active"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-slate-500/10 text-slate-400",
                        )}>
                          {user.subscriptionStatus}
                        </span>
                        <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                          {user.activeClientCount} links
                        </span>
                        <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
                          {user.totalClicks} clicks
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={planSelections[user.id]?.tier || "tier_1"}
                        onChange={(event) =>
                          setPlanSelection(user.id, "tier", event.target.value as Exclude<SubscriptionTier, "none">)
                        }
                        className="rounded-lg border border-white/[0.08] bg-[#0c1324] px-3 py-1.5 text-xs font-medium text-slate-200 outline-none transition focus:border-[#6bd8cb]/40 focus:shadow-[0_0_0_3px_rgba(107,216,203,0.1)]"
                      >
                        <option value="tier_1">Starter</option>
                        <option value="tier_2">Growth</option>
                        <option value="tier_3">Scale</option>
                      </select>
                      <select
                        value={planSelections[user.id]?.interval || "monthly"}
                        onChange={(event) =>
                          setPlanSelection(user.id, "interval", event.target.value as BillingInterval)
                        }
                        className="rounded-lg border border-white/[0.08] bg-[#0c1324] px-3 py-1.5 text-xs font-medium text-slate-200 outline-none transition focus:border-[#6bd8cb]/40 focus:shadow-[0_0_0_3px_rgba(107,216,203,0.1)]"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleGrantPlan(user.id)}
                        disabled={isPending}
                        className="rounded-lg bg-gradient-to-b from-[#6bd8cb] to-[#29a195] px-3.5 py-1.5 text-xs font-semibold text-[#00302b] shadow-[0_0_12px_-3px_rgba(107,216,203,0.4)] transition-all hover:shadow-[0_0_20px_-3px_rgba(107,216,203,0.5)] disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClearPlan(user.id)}
                        disabled={isPending}
                        className="rounded-lg border border-white/[0.08] px-3.5 py-1.5 text-xs font-semibold text-slate-400 transition-all hover:border-rose-500/30 hover:bg-rose-500/[0.06] hover:text-rose-400 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Manual Client Add */}
        <form
          onSubmit={handleCreateClient}
          className="rounded-2xl border border-white/[0.06] bg-[#151b2d]/80 p-6 backdrop-blur-sm"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6bd8cb]">
            Manual Client Add
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Create a client for any account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Use this when you need to manually add a review link for an existing client owner.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-400">Client owner email</span>
              <input
                type="email"
                value={draft.ownerEmail}
                onChange={(event) => updateDraft("ownerEmail", event.target.value)}
                placeholder="owner@business.com"
                required
                className="w-full rounded-xl border border-white/[0.08] bg-[#0c1324] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-[#6bd8cb]/40 focus:shadow-[0_0_0_3px_rgba(107,216,203,0.1)]"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-400">Business name</span>
              <input
                type="text"
                value={draft.businessName}
                onChange={(event) => updateDraft("businessName", event.target.value)}
                required
                className="w-full rounded-xl border border-white/[0.08] bg-[#0c1324] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-[#6bd8cb]/40 focus:shadow-[0_0_0_3px_rgba(107,216,203,0.1)]"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-400">City</span>
                <input
                  type="text"
                  value={draft.city}
                  onChange={(event) => updateDraft("city", event.target.value)}
                  required
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0c1324] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-[#6bd8cb]/40 focus:shadow-[0_0_0_3px_rgba(107,216,203,0.1)]"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-400">Sector</span>
                <select
                  value={draft.sector}
                  onChange={(event) => updateDraft("sector", event.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0c1324] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-[#6bd8cb]/40 focus:shadow-[0_0_0_3px_rgba(107,216,203,0.1)]"
                >
                  <option value="">Auto-detect</option>
                  {BUSINESS_SECTORS.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-400">Industry</span>
              <input
                type="text"
                value={draft.industry}
                onChange={(event) => updateDraft("industry", event.target.value)}
                placeholder="Girls hostel near coaching institutes"
                className="w-full rounded-xl border border-white/[0.08] bg-[#0c1324] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-[#6bd8cb]/40 focus:shadow-[0_0_0_3px_rgba(107,216,203,0.1)]"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-400">Expiry date</span>
              <input
                type="date"
                value={draft.expiresAt}
                onChange={(event) => updateDraft("expiresAt", event.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0c1324] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-[#6bd8cb]/40 focus:shadow-[0_0_0_3px_rgba(107,216,203,0.1)]"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-400">Google review link</span>
              <input
                type="url"
                value={draft.googleReviewLink}
                onChange={(event) => updateDraft("googleReviewLink", event.target.value)}
                placeholder="https://g.page/r/..."
                required
                className="w-full rounded-xl border border-white/[0.08] bg-[#0c1324] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-[#6bd8cb]/40 focus:shadow-[0_0_0_3px_rgba(107,216,203,0.1)]"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-400">Business description</span>
              <textarea
                value={draft.businessDescription}
                onChange={(event) => updateDraft("businessDescription", event.target.value)}
                placeholder="Optional context for the review generator."
                rows={3}
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0c1324] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-[#6bd8cb]/40 focus:shadow-[0_0_0_3px_rgba(107,216,203,0.1)]"
              />
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-gradient-to-b from-[#6bd8cb] to-[#29a195] px-5 py-2.5 text-sm font-semibold text-[#00302b] shadow-[0_0_16px_-4px_rgba(107,216,203,0.4)] transition-all hover:shadow-[0_0_24px_-4px_rgba(107,216,203,0.5)] disabled:opacity-50"
            >
              {isPending ? "Working..." : "Create client"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(defaultDraft)}
              disabled={isPending}
              className="rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-semibold text-slate-400 transition-all hover:border-white/[0.15] hover:text-slate-200 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      {/* ─── Client Links Table ─── */}
      <section className="rounded-2xl border border-white/[0.06] bg-[#151b2d]/80 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6bd8cb]">
              Client Links
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">Track performance by client</h2>
          </div>
          <p className="text-xs text-slate-500">
            {overview.clients.length} total links
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Reviews</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {overview.clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-t border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-white">{client.businessName}</p>
                    <p className="text-xs text-slate-500">{client.city}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-slate-300">{client.ownerName || client.ownerEmail}</p>
                    <p className="text-xs text-slate-500">{client.ownerEmail}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                      client.ownerPlan === "none"
                        ? "bg-slate-500/10 text-slate-400"
                        : "bg-[#6bd8cb]/10 text-[#6bd8cb]",
                    )}>
                      {client.ownerPlan}
                    </span>
                    <p className="mt-0.5 text-[10px] text-slate-500">{client.ownerSubscriptionStatus}</p>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-violet-400">{client.reviewCount}</td>
                  <td className="px-4 py-3.5 font-semibold text-cyan-400">{client.clickCount}</td>
                  <td className="px-4 py-3.5 text-slate-400">{formatDate(client.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      <Link
                        href={`/review/${client.slug}`}
                        target="_blank"
                        className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-white/[0.15] hover:text-white"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClient(client.id, client.businessName)}
                        className="rounded-lg border border-white/[0.04] px-3 py-1 text-xs font-semibold text-rose-400/70 transition hover:border-rose-500/30 hover:bg-rose-500/[0.06] hover:text-rose-400"
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
