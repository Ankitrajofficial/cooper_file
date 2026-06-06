"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BUSINESS_SECTORS, type BillingInterval, type BusinessSector, type SubscriptionTier } from "@/types";
import { cn, copyTextToClipboard, formatDate, toErrorMessage } from "@/lib/utils";

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
      sector: BusinessSector;
      industry: string;
      businessDescription: string;
      expiresAt: string | null;
      expiryMode: "subscription" | "custom";
      ownerId: string;
      ownerEmail: string;
      ownerName: string;
      ownerPlan: SubscriptionTier;
      ownerPlanName: string;
      ownerSubscriptionStatus: string;
      ownerSubscriptionInterval: BillingInterval;
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

export function AdminDashboardClient({ overview }: AdminDashboardClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(overview.users);
  const [feedback, setFeedback] = useState("");
  const [formFeedback, setFormFeedback] = useState("");
  const [createdClientLink, setCreatedClientLink] = useState("");
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [draft, setDraft] = useState<ClientDraft>(defaultDraft);

  useEffect(() => {
    setUsers(overview.users);
  }, [overview.users]);

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

  function handleDeleteUser(userId: string, label: string) {
    if (
      !window.confirm(
        `Delete ${label} and all review links/reviews owned by this user?`,
      )
    ) {
      return;
    }

    void runAction(async () => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as {
        error?: string;
        deletedClients?: number;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Could not delete user.");
      }

      setUsers((current) => current.filter((user) => user.id !== userId));
      setFeedback(
        `User deleted. Removed ${payload.deletedClients || 0} owned link${
          payload.deletedClients === 1 ? "" : "s"
        }.`,
      );
    });
  }

  function handleCreateClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormFeedback("");
    setCreatedClientLink("");

    if (!draft.ownerEmail.trim()) {
      setFormFeedback("Enter the client owner email. If the account does not exist, it will be created automatically.");
      return;
    }

    setIsPending(true);

    (async () => {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });
      const payload = (await response.json()) as {
        error?: string;
        client?: {
          publicReviewUrl?: string;
        };
      };

      if (!response.ok) {
        throw new Error(payload.error || "Could not create client.");
      }

      setDraft(defaultDraft);
      setCreatedClientLink(payload.client?.publicReviewUrl || "");
      setFormFeedback(
        "Client link created. New owner accounts can sign up or log in with this email.",
      );
      router.refresh();
    })()
      .catch((error) => {
        setFormFeedback(toErrorMessage(error));
      })
      .finally(() => {
        setIsPending(false);
      });
  }

  async function handleCopyClientLink(slug: string) {
    const publicReviewUrl = `${window.location.origin}/review/${slug}`;
    const copied = await copyTextToClipboard(publicReviewUrl);

    setFeedback(copied ? "Client review link copied." : "Could not copy the client review link.");
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
    { label: "Saved Scripts", value: overview.stats.totalReviews, icon: <ReviewsIcon />, color: "text-violet-400", glow: "shadow-[0_0_20px_-5px_rgba(167,139,250,0.2)]" },
    { label: "Review Clicks", value: overview.stats.totalClicks, icon: <ClicksIcon />, color: "text-amber-400", glow: "shadow-[0_0_20px_-5px_rgba(251,191,36,0.2)]" },
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
              Manually add or remove client links, monitor review clicks, and
              track portfolio activity from one panel.
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
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* ─── Client Users + Manual Add ─── */}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Client Users */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#151b2d]/80 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6bd8cb]">
                Client Users
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">Monitor client activity</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {users
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
                        <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                          {user.activeClientCount} links
                        </span>
                        <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
                          {user.totalClicks} clicks
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteUser(user.id, user.name || user.email)
                        }
                        disabled={isPending}
                        className="rounded-lg border border-rose-500/20 px-3.5 py-1.5 text-xs font-semibold text-rose-400 transition-all hover:border-rose-500/40 hover:bg-rose-500/[0.08] disabled:opacity-50"
                      >
                        Delete user
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
          {formFeedback ? (
            <div className="mt-4 rounded-xl border border-[#6bd8cb]/20 bg-[#6bd8cb]/[0.06] px-4 py-3 text-sm text-slate-200">
              {formFeedback}
              {createdClientLink ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-[#0c1324] p-2">
                  <code className="min-w-0 flex-1 truncate text-xs text-[#6bd8cb]">
                    {createdClientLink}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      void copyTextToClipboard(createdClientLink).then((copied) => {
                        setFormFeedback(
                          copied
                            ? "Client link copied. New owner accounts can sign up or log in with this email."
                            : "Client link created, but copy was blocked by the browser.",
                        );
                      });
                    }}
                    className="rounded-lg border border-white/[0.08] px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-white/[0.15] hover:text-white"
                  >
                    Copy link
                  </button>
                  <a
                    href={createdClientLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/[0.08] px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-white/[0.15] hover:text-white"
                  >
                    Open
                  </a>
                </div>
              ) : null}
            </div>
          ) : null}
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

        <div className="mt-5 space-y-4">
          {overview.clients.length ? (
            overview.clients.map((client) => {
              const publicReviewUrl =
                typeof window === "undefined"
                  ? `/review/${client.slug}`
                  : `${window.location.origin}/review/${client.slug}`;

              return (
                <article
                  key={client.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] transition hover:border-white/[0.1] hover:bg-white/[0.035]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedClientId((current) =>
                        current === client.id ? null : client.id,
                      )
                    }
                    className="grid w-full gap-3 p-4 text-left md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_120px_120px_32px] md:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-bold text-white">
                          {client.businessName}
                        </h3>
                        <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
                          {client.sector}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {client.city} · {client.industry}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-300">
                        {client.ownerName || client.ownerEmail}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {client.ownerEmail}
                      </p>
                    </div>

                    <div className="flex gap-3 text-sm font-semibold">
                      <span className="text-violet-400">{client.reviewCount} scripts</span>
                      <span className="text-cyan-400">{client.clickCount} clicks</span>
                    </div>

                    <svg
                      className={cn(
                        "h-4 w-4 text-slate-500 transition-transform",
                        expandedClientId === client.id && "rotate-180",
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {expandedClientId === client.id ? (
                    <div className="border-t border-white/[0.05] p-4">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl bg-[#0c1324] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Business</p>
                          <p className="mt-1 text-sm font-semibold text-slate-200">{client.businessName}</p>
                          <p className="text-xs text-slate-500">{client.city}</p>
                          {client.businessDescription ? (
                            <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">
                              {client.businessDescription}
                            </p>
                          ) : null}
                        </div>
                        <div className="rounded-xl bg-[#0c1324] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Owner</p>
                          <p className="mt-1 truncate text-sm font-semibold text-slate-200">
                            {client.ownerName || client.ownerEmail}
                          </p>
                          <p className="truncate text-xs text-slate-500">{client.ownerEmail}</p>
                        </div>
                        <div className="rounded-xl bg-[#0c1324] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Activity</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {client.reviewCount} saved scripts · {client.clickCount} customer clicks
                          </p>
                        </div>
                        <div className="rounded-xl bg-[#0c1324] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Dates</p>
                          <p className="mt-1 text-xs text-slate-300">Created {formatDate(client.createdAt)}</p>
                          <p className="text-xs text-slate-500">
                            Expires {client.expiresAt ? `${formatDate(client.expiresAt)} (${client.expiryMode})` : "no automatic expiry"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[#0c1324] p-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Client review link
                          </p>
                          <code className="mt-1 block truncate text-xs text-[#6bd8cb]">
                            {publicReviewUrl}
                          </code>
                        </div>
                        <Link
                          href={`/review/${client.slug}`}
                          target="_blank"
                          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/[0.15] hover:text-white"
                        >
                          Open link
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            void handleCopyClientLink(client.slug);
                          }}
                          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/[0.15] hover:text-white"
                        >
                          Copy link
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClient(client.id, client.businessName)}
                          className="rounded-lg border border-white/[0.04] px-3 py-1.5 text-xs font-semibold text-rose-400/70 transition hover:border-rose-500/30 hover:bg-rose-500/[0.06] hover:text-rose-400"
                          disabled={isPending}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })
          ) : (
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-6 text-sm text-slate-500">
              No client links yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
