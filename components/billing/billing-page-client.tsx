"use client";

import Script from "next/script";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getBillingIntervalLabel,
  getClientLimitLabel,
  getReviewCapacityLabel,
} from "@/lib/billing";
import { cn, toErrorMessage } from "@/lib/utils";
import { type BillingSummary, type SubscriptionTier } from "@/types";

type BillingPageClientProps = {
  summary: BillingSummary;
  plans: Array<{
    tier: Exclude<SubscriptionTier, "none">;
    name: string;
    monthlyPriceInr: number;
    yearlyPriceInr: number;
    clientLimit: number | null;
    reviewsPerLink: number | null;
    description: string;
    highlights: string[];
  }>;
  cashfreeMode: "sandbox" | "production";
  cashfreeConfigured: boolean;
};

export function BillingPageClient({
  summary,
  plans,
  cashfreeMode,
  cashfreeConfigured,
}: BillingPageClientProps) {
  const [interval, setInterval] = useState(summary.interval || "monthly");
  const [phone, setPhone] = useState(summary.phone || "");
  const [feedback, setFeedback] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const hasValidPhone = /^\d{10}$/.test(phone.trim());
  const activePlan = plans.find((plan) => plan.tier === summary.tier) || null;
  const tierRanks: Record<Exclude<SubscriptionTier, "none">, number> = {
    tier_1: 1,
    tier_2: 2,
    tier_3: 3,
  };
  const hasPendingChange =
    summary.pendingTier !== "none" &&
    (summary.pendingTier !== summary.tier ||
      summary.pendingInterval !== summary.interval ||
      summary.status === "pending");
  const isBusy = isSavingPhone || isStartingCheckout;

  function getPlanActionLabel(plan: BillingPageClientProps["plans"][number], isCurrent: boolean) {
    if (isCurrent) {
      return "Current plan";
    }

    if (summary.tier !== "none") {
      if (tierRanks[plan.tier] > tierRanks[summary.tier as Exclude<SubscriptionTier, "none">]) {
        return `Upgrade to ${plan.name}`;
      }

      if (tierRanks[plan.tier] < tierRanks[summary.tier as Exclude<SubscriptionTier, "none">]) {
        return `Switch to ${plan.name}`;
      }
    }

    return "Start autopay";
  }

  async function savePhone() {
    setFeedback("");
    setIsSavingPhone(true);

    try {
      const response = await fetch("/api/billing/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save phone number.");
      }

      setFeedback("Billing phone number updated.");
    } catch (error) {
      setFeedback(toErrorMessage(error));
    } finally {
      setIsSavingPhone(false);
    }
  }

  async function startCheckout(tier: Exclude<SubscriptionTier, "none">) {
    setFeedback("");

    if (!cashfreeConfigured) {
      setFeedback("Cashfree keys are missing. Add them to .env before starting billing.");
      return;
    }

    if (!window.Cashfree) {
      setFeedback("Cashfree checkout is still loading. Try again in a moment.");
      return;
    }
    setIsStartingCheckout(true);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier,
          interval,
          phone,
        }),
      });
      const rawText = await response.text();
      const payload = (() => {
        try {
          return JSON.parse(rawText) as {
            error?: string;
            subsSessionId?: string;
          };
        } catch {
          return {};
        }
      })();

      if (!response.ok || !payload.subsSessionId) {
        throw new Error(
          payload.error ||
            rawText ||
            "Unable to start Cashfree checkout.",
        );
      }

      const cashfreeFactory = window.Cashfree;

      if (!cashfreeFactory) {
        throw new Error("Cashfree checkout is unavailable right now.");
      }

      const cashfree = cashfreeFactory({ mode: cashfreeMode });
      const result = await cashfree.subscriptionsCheckout({
        subsSessionId: payload.subsSessionId,
        redirectTarget: "_self",
      });

      if (result.error?.message) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      setFeedback(toErrorMessage(error));
      setIsStartingCheckout(false);
    }
  }

  return (
    <>
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="afterInteractive" />

      <div className="space-y-8">
        {/* ─── Header (Stitch surface-card-elevated) ─── */}
        <section className="surface-card-elevated overflow-hidden p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <span className="data-pulse" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
                  Billing & Access
                </p>
              </div>
              <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-[var(--on-surface)] sm:text-3xl">
                Control review-link limits,
                <span className="gradient-text"> capacity, and autopay.</span>
              </h1>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--on-surface-variant)]">
                Cashfree powers the subscription flow. Each plan controls how
                many active review links you can run and how many curated Google
                reviews each link can hold.
              </p>
            </div>

            {/* ─── Current plan (tonal layering) ─── */}
            <div className="rounded-2xl bg-[var(--surface-low)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">
                Current plan
              </p>
              <p className="mt-2 text-xl font-extrabold tracking-[-0.02em] text-[var(--on-surface)]">
                {summary.planName || activePlan?.name || "No active plan"}
              </p>
              <div className="mt-3 space-y-1.5 text-sm text-[var(--on-surface-variant)]">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    summary.status === "active" ? "status-active" : "bg-[var(--outline)]",
                  )} />
                  <span>
                    Status: <strong className="text-[var(--on-surface)]">{summary.status}</strong>
                  </span>
                </div>
                <p>
                  Billing cycle:{" "}
                  <strong className="text-[var(--on-surface)]">
                    {summary.tier === "none" ? "Not active" : getBillingIntervalLabel(summary.interval)}
                  </strong>
                </p>
                <p>
                  Plan capacity:{" "}
                  <strong className="text-[var(--on-surface)]">
                    {summary.activeClientCount}
                    {summary.tier === "none"
                      ? " / 0"
                      : ` / ${getClientLimitLabel(summary.clientLimit)}`}
                  </strong>
                </p>
                <p>
                  Review capacity:{" "}
                  <strong className="text-[var(--on-surface)]">
                    {summary.tier === "none"
                      ? "Not active"
                      : getReviewCapacityLabel(summary.reviewsPerLink)}
                  </strong>
                </p>
                <p>
                  Link expiry:{" "}
                  <strong className="text-[var(--on-surface)]">
                    {summary.currentPeriodEnd
                      ? new Date(summary.currentPeriodEnd).toLocaleDateString(
                          "en-IN",
                        )
                      : "Depends on active plan"}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Alerts ─── */}
        {hasPendingChange ? (
          <section className="flex items-center gap-3 rounded-xl bg-cyan-50 p-4 text-sm text-cyan-900">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100">
              <svg className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
              </svg>
            </div>
            <span>
              Your current access stays on{" "}
              <strong>{summary.planName || "your existing plan"}</strong>{" "}
              until Cashfree confirms the new checkout. Pending change:{" "}
              <strong>
                {plans.find((plan) => plan.tier === summary.pendingTier)?.name || summary.pendingTier}{" "}
                {getBillingIntervalLabel(summary.pendingInterval)}
              </strong>
              .
            </span>
          </section>
        ) : null}

        {summary.status === "cancelled" && summary.currentPeriodEnd ? (
          <section className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>
              Auto-renew is off. Your current plan and any subscription-based review links stay active
              until{" "}
              <strong>
                {new Date(summary.currentPeriodEnd).toLocaleDateString("en-IN")}
              </strong>
              . If you do not renew, those links will expire after that date.
            </span>
          </section>
        ) : null}

        {!cashfreeConfigured ? (
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
              Cashfree billing is not configured. Add CASHFREE_APP_ID,
              CASHFREE_SECRET_KEY, and CASHFREE_ENVIRONMENT to .env.
            </span>
          </section>
        ) : null}

        {/* ─── Phone + Plans ─── */}
        <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Phone */}
          <div className="surface-card-elevated p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand/10 to-brand/5">
                <svg className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
                Billing contact
              </p>
            </div>
            <h2 className="mt-3 text-lg font-bold text-[var(--on-surface)]">
              Phone for Cashfree
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-[var(--on-surface-variant)]">
              Required for subscription setup.
            </p>
            <div className="mt-5 space-y-3">
              <Input
                label="Phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="9876543210"
                inputMode="numeric"
                maxLength={10}
              />
              <Button size="sm" onClick={savePhone} disabled={isBusy}>
                {isSavingPhone ? "Saving..." : "Save phone"}
              </Button>
            </div>
          </div>

          {/* Plans */}
          <div className="surface-card-elevated p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
                  Subscription plans
                </p>
                <h2 className="mt-2 text-lg font-bold text-[var(--on-surface)]">
                  Choose your plan
                </h2>
              </div>
              <div className="inline-flex rounded-xl bg-[var(--surface-container)] p-1">
                {[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setInterval(option.value as typeof interval)}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
                      interval === option.value
                        ? "bg-[var(--surface-card)] text-[var(--on-surface)] shadow-[0_1px_3px_rgba(25,28,30,0.06)]"
                        : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]",
                    )}
                  >
                    {option.label}
                    {option.value === "yearly" && interval !== "yearly" && (
                      <span className="ml-1 text-[10px] font-bold text-brand">Save 17%</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {plans.map((plan, index) => {
                const price =
                  interval === "monthly"
                    ? plan.monthlyPriceInr
                    : plan.yearlyPriceInr;
                const isCurrent =
                  summary.tier === plan.tier &&
                  summary.interval === interval &&
                  summary.status === "active";
                const isPopular = plan.tier === "tier_2";

                return (
                  <article
                    key={plan.tier}
                    className={cn(
                      "card-hover relative overflow-hidden rounded-2xl p-5 transition-all duration-200 animate-fade-up",
                      isCurrent
                        ? "bg-gradient-to-br from-brand/[0.06] to-brand/[0.02] shadow-[0_0_0_1px_rgba(13,148,136,0.15),0_0_30px_-8px_rgba(13,148,136,0.15)]"
                        : "bg-[var(--surface-low)] ghost-border-interactive",
                    )}
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    {isPopular && (
                      <div className="absolute -right-8 top-4 rotate-45 bg-gradient-to-r from-brand to-[#0891b2] px-10 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Popular
                      </div>
                    )}
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
                      {plan.name}
                    </p>
                    <p className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-[var(--on-surface)]">
                      ₹{price}
                    </p>
                    <p className="mt-1 text-xs text-[var(--on-surface-variant)]">
                      {interval === "monthly"
                        ? "Billed every month"
                        : "Billed yearly · 2 months off"}
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
                        <svg className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {plan.clientLimit === null
                          ? "Unlimited active review links"
                          : `${plan.clientLimit} active review ${
                              plan.clientLimit === 1 ? "link" : "links"
                            }`}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
                        <svg className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {getReviewCapacityLabel(plan.reviewsPerLink)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
                        <svg className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {plan.description}
                      </div>
                    </div>
                    <Button
                      className="mt-5 w-full"
                      size="sm"
                      variant={isCurrent ? "secondary" : "primary"}
                      disabled={isBusy || !cashfreeConfigured || !hasValidPhone}
                      onClick={() => startCheckout(plan.tier)}
                    >
                      {isStartingCheckout
                        ? "Opening checkout..."
                        : getPlanActionLabel(plan, isCurrent)}
                    </Button>
                  </article>
                );
              })}
            </div>

            {feedback ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--surface-low)] px-4 py-3 text-sm text-[var(--on-surface-variant)]">
                <svg className="h-4 w-4 shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                {feedback}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
