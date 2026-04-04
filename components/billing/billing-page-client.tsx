"use client";

import Script from "next/script";
import { useMemo, useState, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();
  const hasValidPhone = /^\d{10}$/.test(phone.trim());
  const activePlan = useMemo(
    () => plans.find((plan) => plan.tier === summary.tier) || null,
    [plans, summary.tier],
  );

  async function savePhone() {
    setFeedback("");

    startTransition(() => {
      void (async () => {
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
        }
      })();
    });
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

    startTransition(() => {
      void (async () => {
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
          const payload = (await response.json()) as {
            error?: string;
            subsSessionId?: string;
          };

          if (!response.ok || !payload.subsSessionId) {
            throw new Error(payload.error || "Unable to start Cashfree checkout.");
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
        }
      })();
    });
  }

  return (
    <>
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="afterInteractive" />

      <div className="space-y-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-panel backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                Billing & Access
              </p>
              <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                Control link expiry, plan limits, and autopay in one place.
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Cashfree powers the subscription flow. Once a subscription is active,
                your account can create review links within the allowed tier limit,
                and each link can inherit or override the billing period expiry date.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Current plan</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                {activePlan?.name || "No active plan"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Status: <span className="font-semibold text-slate-700">{summary.status}</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Active links:{" "}
                <span className="font-semibold text-slate-700">
                  {summary.activeClientCount}
                  {summary.clientLimit === null ? " / Unlimited" : ` / ${summary.clientLimit}`}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Billing period ends:{" "}
                <span className="font-semibold text-slate-700">
                  {summary.currentPeriodEnd
                    ? new Date(summary.currentPeriodEnd).toLocaleDateString("en-IN")
                    : "Not active"}
                </span>
              </p>
            </div>
          </div>
        </section>

        {!cashfreeConfigured ? (
          <section className="rounded-[2rem] border border-amber-200 bg-amber-50/90 p-5 text-sm leading-6 text-amber-900 shadow-sm">
            Cashfree billing is not configured yet. Add `CASHFREE_APP_ID`,
            `CASHFREE_SECRET_KEY`, and `CASHFREE_ENVIRONMENT` in `.env`, then
            open the app on `http://localhost:3000` for local testing.
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-panel backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              Billing contact
            </p>
            <h2 className="mt-3 text-2xl font-bold text-ink">
              Phone number for Cashfree checkout
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Cashfree subscription setup requires a valid phone number for the customer.
            </p>
            <div className="mt-5 space-y-4">
              <Input
                label="Phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="9876543210"
                inputMode="numeric"
                maxLength={10}
              />
              <Button onClick={savePhone} disabled={isPending}>
                Save billing phone
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-panel backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                  Subscription plans
                </p>
                <h2 className="mt-3 text-2xl font-bold text-ink">
                  Choose the revenue model you want to enforce
                </h2>
              </div>
              <div className="inline-flex rounded-2xl bg-slate-100 p-1">
                {[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setInterval(option.value as typeof interval)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-semibold transition",
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

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {plans.map((plan) => {
                const price =
                  interval === "monthly" ? plan.monthlyPriceInr : plan.yearlyPriceInr;
                const isCurrent =
                  summary.tier === plan.tier &&
                  summary.interval === interval &&
                  summary.status === "active";

                return (
                  <article
                    key={plan.tier}
                    className={cn(
                      "rounded-[1.75rem] border p-5 transition",
                      isCurrent
                        ? "border-brand bg-brand/[0.06] shadow-[0_24px_50px_-32px_rgba(15,118,110,0.45)]"
                        : "border-slate-200 bg-slate-50/80",
                    )}
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                      {plan.name}
                    </p>
                    <p className="mt-3 text-4xl font-black tracking-[-0.04em] text-ink">
                      Rs. {price}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {interval === "monthly"
                        ? "Billed every month"
                        : "Billed yearly with 2 months off"}
                    </p>
                    <div className="mt-5 space-y-2 text-sm text-slate-600">
                      <p>
                        {plan.clientLimit === null
                          ? "Unlimited active review links"
                          : `${plan.clientLimit} active review ${
                              plan.clientLimit === 1 ? "link" : "links"
                            }`}
                      </p>
                      <p>{plan.description}</p>
                      <p>Auto-renew powered by Cashfree subscriptions</p>
                    </div>
                    <Button
                      className="mt-6 w-full"
                      variant={isCurrent ? "secondary" : "primary"}
                      disabled={isPending || !cashfreeConfigured || !hasValidPhone}
                      onClick={() => startCheckout(plan.tier)}
                    >
                      {isCurrent ? "Current plan" : "Start autopay"}
                    </Button>
                  </article>
                );
              })}
            </div>

            {feedback ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {feedback}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
