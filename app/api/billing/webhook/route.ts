import { NextResponse } from "next/server";
import {
  applySuccessfulSubscriptionForUser,
  findUserByCashfreeSubscription,
  rememberProcessedBillingEvent,
  updateSubscriptionHealthForUser,
  updateSubscriptionStateByCashfreeId,
} from "@/lib/services/billing-service";
import { verifyCashfreeWebhookSignature } from "@/lib/services/cashfree-service";
import { type BillingInterval, type SubscriptionTier } from "@/types";

function getNestedValue<T = unknown>(source: Record<string, any>, path: string[]) {
  let current: any = source;

  for (const key of path) {
    current = current?.[key];
  }

  return current as T;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature") || "";
  const timestamp = request.headers.get("x-webhook-timestamp") || "";

  try {
    if (!signature || !timestamp) {
      return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
    }

    const isValid = verifyCashfreeWebhookSignature({
      rawBody,
      signature,
      timestamp,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as Record<string, any>;
    const eventType = String(payload.type || "UNKNOWN");
    const data = (payload.data || {}) as Record<string, any>;
    const subscriptionDetails = (data.subscription_details || {}) as Record<string, any>;
    const subscriptionId =
      String(
        data.subscription_id ||
          subscriptionDetails.subscription_id ||
          "",
      ) || "";
    const cfSubscriptionId =
      String(
        data.cf_subscription_id ||
          subscriptionDetails.cf_subscription_id ||
          "",
      ) || "";
    const paymentId = String(data.cf_payment_id || data.payment_id || payload.event_time || "");
    const eventKey = `${eventType}:${subscriptionId}:${paymentId}`;
    const firstTime = await rememberProcessedBillingEvent(eventKey, eventType, payload);

    if (!firstTime) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const user = await findUserByCashfreeSubscription({
      cashfreeSubscriptionId: subscriptionId,
      cashfreeCfSubscriptionId: cfSubscriptionId,
    });

    if (!user) {
      return NextResponse.json({ received: true });
    }

    if (eventType === "SUBSCRIPTION_PAYMENT_SUCCESS") {
      const tier =
        ((user.pendingSubscriptionTier || user.subscriptionTier) as SubscriptionTier) === "none"
          ? "tier_1"
          : (user.pendingSubscriptionTier || user.subscriptionTier);
      const interval = (user.pendingSubscriptionInterval ||
        user.subscriptionInterval ||
        "monthly") as BillingInterval;

      await applySuccessfulSubscriptionForUser({
        userId: user._id.toString(),
        tier: tier as Exclude<SubscriptionTier, "none">,
        interval,
        cashfreeSubscriptionId: subscriptionId,
        cashfreeCfSubscriptionId: cfSubscriptionId,
        cashfreeSubscriptionStatus: "ACTIVE",
      });

      return NextResponse.json({ received: true });
    }

    if (eventType === "SUBSCRIPTION_STATUS_CHANGED") {
      const remoteStatus = String(
        subscriptionDetails.subscription_status || data.subscription_status || "INITIALIZED",
      );

      await updateSubscriptionStateByCashfreeId({
        cashfreeSubscriptionId: subscriptionId,
        cashfreeCfSubscriptionId: cfSubscriptionId,
        status: remoteStatus,
      });

      if (["CANCELLED", "CUSTOMER_CANCELLED", "EXPIRED", "LINK_EXPIRED"].includes(remoteStatus)) {
        await updateSubscriptionHealthForUser({
          userId: user._id.toString(),
          subscriptionStatus:
            remoteStatus === "EXPIRED" || remoteStatus === "LINK_EXPIRED"
              ? "expired"
              : "cancelled",
          cashfreeSubscriptionStatus: remoteStatus,
        });
      }

      return NextResponse.json({ received: true });
    }

    if (["SUBSCRIPTION_PAYMENT_FAILED", "SUBSCRIPTION_PAYMENT_CANCELLED"].includes(eventType)) {
      await updateSubscriptionHealthForUser({
        userId: user._id.toString(),
        subscriptionStatus: "past_due",
        cashfreeSubscriptionStatus: eventType,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handling failed.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
