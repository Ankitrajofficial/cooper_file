import Link from "next/link";
import { requireClientUser } from "@/lib/auth";
import { fetchCashfreeSubscription } from "@/lib/services/cashfree-service";
import {
  applySuccessfulSubscriptionForUser,
  getBillingSummaryForUser,
  updateBillingContactForUser,
} from "@/lib/services/billing-service";
import { type BillingInterval, type SubscriptionTier } from "@/types";

type BillingConfirmPageProps = {
  searchParams: Promise<{
    subscription_id?: string;
  }>;
};

export default async function BillingConfirmPage({
  searchParams,
}: BillingConfirmPageProps) {
  const user = await requireClientUser();
  const { subscription_id: subscriptionId = "" } = await searchParams;

  if (!subscriptionId) {
    return (
      <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel backdrop-blur">
        <h1 className="text-3xl font-bold text-ink">Billing confirmation</h1>
        <p className="mt-3 text-slate-600">
          No subscription reference was found. Start billing from the billing page.
        </p>
        <Link
          href="/dashboard/billing"
          className="mt-6 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Go to billing
        </Link>
      </div>
    );
  }

  try {
    const subscription = await fetchCashfreeSubscription(subscriptionId);
    const summary = await getBillingSummaryForUser(user.userId);
    const tier =
      (subscription.subscription_tags?.tier as SubscriptionTier | undefined) ||
      (summary.pendingTier !== "none" ? summary.pendingTier : summary.tier);
    const interval =
      (subscription.subscription_tags?.interval as BillingInterval | undefined) ||
      summary.pendingInterval ||
      summary.interval;

    if (
      subscription.customer_details?.customer_phone &&
      subscription.customer_details.customer_phone !== summary.phone
    ) {
      await updateBillingContactForUser(
        user.userId,
        subscription.customer_details.customer_phone,
      );
    }

    if (subscription.subscription_status === "ACTIVE" && tier !== "none") {
      const period = await applySuccessfulSubscriptionForUser({
        userId: user.userId,
        tier: tier as Exclude<SubscriptionTier, "none">,
        interval,
        cashfreeSubscriptionId: subscription.subscription_id,
        cashfreeCfSubscriptionId: subscription.cf_subscription_id,
        cashfreeSubscriptionStatus: subscription.subscription_status,
        preserveCurrentPeriod: true,
      });

      return (
        <div className="rounded-[2rem] border border-emerald-200 bg-white/90 p-8 shadow-panel backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Billing confirmed
          </p>
          <h1 className="mt-3 text-3xl font-bold text-ink">
            Your subscription is active.
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            You can now create review links under your selected tier. Auto-renew is
            enabled through Cashfree.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Tier</p>
              <p className="mt-1 text-xl font-bold text-ink">{tier}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Interval</p>
              <p className="mt-1 text-xl font-bold text-ink">{interval}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Current access until</p>
              <p className="mt-1 text-xl font-bold text-ink">
                {new Date(period.currentPeriodEnd).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Go to dashboard
            </Link>
            <Link
              href="/dashboard/clients/new"
              className="inline-flex rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Create review link
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-[2rem] border border-amber-200 bg-white/90 p-8 shadow-panel backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
          Billing pending
        </p>
        <h1 className="mt-3 text-3xl font-bold text-ink">
          Cashfree is still processing your subscription.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Current Cashfree status: {subscription.subscription_status}. Refresh this page
          in a moment or check the billing page again.
        </p>
        <Link
          href="/dashboard/billing"
          className="mt-6 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Back to billing
        </Link>
      </div>
    );
  } catch (error) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-white/90 p-8 shadow-panel backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
          Billing error
        </p>
        <h1 className="mt-3 text-3xl font-bold text-ink">
          We could not verify the subscription.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          {error instanceof Error ? error.message : "Unknown billing error."}
        </p>
        <Link
          href="/dashboard/billing"
          className="mt-6 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Back to billing
        </Link>
      </div>
    );
  }
}
