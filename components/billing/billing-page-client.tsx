"use client";

import Script from "next/script";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    description: string;
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
  const isBusy = isSavingPhone || isStartingCheckout;

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

      <div className="space-y-6">
        {/* Header */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
                Billing & Access
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                Control link expiry, plan limits, and autopay.
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Cashfree powers the subscription flow. Once active, your account
                can create review links within the allowed tier limit.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-5">
              <p className="text-[11px] font-medium text-slate-500">Current plan</p>
              <p className="mt-1.5 text-xl font-bold text-ink">
                {activePlan?.name || "No active plan"}
              </p>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p>
                  Status:{" "}
                  <span className="font-semibold text-ink">{summary.status}</span>
                </p>
                <p>
                  Active links:{" "}
                  <span className="font-semibold text-ink">
                    {summary.activeClientCount}
                    {summary.clientLimit === null
                      ? " / Unlimited"
                      : ` / ${summary.clientLimit}`}
                  </span>
                </p>
                <p>
                  Period ends:{" "}
                  <span className="font-semibold text-ink">
                    {summary.currentPeriodEnd
                      ? new Date(summary.currentPeriodEnd).toLocaleDateString(
                          "en-IN",
                        )
                      : "Not active"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {!cashfreeConfigured ? (
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
              Cashfree billing is not configured. Add CASHFREE_APP_ID,
              CASHFREE_SECRET_KEY, and CASHFREE_ENVIRONMENT to .env.
            </div>
          </section>
        ) : null}

        {/* Phone + Plans */}
        <section className="grid gap-5 lg:grid-cols-[1fr_2fr]">
          {/* Phone */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
              Billing contact
            </p>
            <h2 className="mt-2 text-lg font-bold text-ink">
              Phone for Cashfree
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Required for subscription setup.
            </p>
            <div className="mt-4 space-y-3">
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
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
                  Subscription plans
                </p>
                <h2 className="mt-2 text-lg font-bold text-ink">
                  Choose your plan
                </h2>
              </div>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
                {[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setInterval(option.value as typeof interval)}
                    className={cn(
                      "rounded-md px-3.5 py-1.5 text-sm font-semibold transition-all",
                      interval === option.value
                        ? "bg-white text-ink shadow-sm"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {plans.map((plan) => {
                const price =
                  interval === "monthly"
                    ? plan.monthlyPriceInr
                    : plan.yearlyPriceInr;
                const isCurrent =
                  summary.tier === plan.tier &&
                  summary.interval === interval &&
                  summary.status === "active";

                return (
                  <article
                    key={plan.tier}
                    className={cn(
                      "card-hover rounded-xl border p-5 transition-all",
                      isCurrent
                        ? "border-brand/30 bg-brand/[0.04] shadow-glow"
                        : "border-slate-200/80 bg-slate-50/60",
                    )}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
                      {plan.name}
                    </p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-ink">
                      ₹{price}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {interval === "monthly"
                        ? "Billed every month"
                        : "Billed yearly · 2 months off"}
                    </p>
                    <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                      <p>
                        {plan.clientLimit === null
                          ? "Unlimited active review links"
                          : `${plan.clientLimit} active review ${
                              plan.clientLimit === 1 ? "link" : "links"
                            }`}
                      </p>
                      <p>{plan.description}</p>
                    </div>
                    <Button
                      className="mt-5 w-full"
                      size="sm"
                      variant={isCurrent ? "secondary" : "primary"}
                      disabled={isBusy || !cashfreeConfigured || !hasValidPhone}
                      onClick={() => startCheckout(plan.tier)}
                    >
                      {isCurrent
                        ? "Current plan"
                        : isStartingCheckout
                          ? "Opening checkout..."
                          : "Start autopay"}
                    </Button>
                  </article>
                );
              })}
            </div>

            {feedback ? (
              <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {feedback}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
