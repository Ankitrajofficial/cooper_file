import crypto from "crypto";
import { getPriceForPlan } from "@/lib/billing";
import { type BillingInterval, type SubscriptionTier } from "@/types";

const CASHFREE_API_VERSION = "2025-01-01";

function getCashfreeBaseUrl() {
  const mode = process.env.CASHFREE_ENVIRONMENT || "sandbox";

  return mode === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

export function getCashfreeMode() {
  return process.env.CASHFREE_ENVIRONMENT === "production"
    ? "production"
    : "sandbox";
}

function getCashfreeHeaders() {
  const clientId = process.env.CASHFREE_APP_ID;
  const clientSecret = process.env.CASHFREE_SECRET_KEY;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Cashfree credentials. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY.");
  }

  return {
    "Content-Type": "application/json",
    "x-api-version": CASHFREE_API_VERSION,
    "x-client-id": clientId,
    "x-client-secret": clientSecret,
    "x-idempotency-key": crypto.randomUUID(),
  };
}

function normalizeAppBaseUrl(appUrl?: string) {
  if (appUrl) {
    return appUrl.replace(/\/$/, "");
  }

  const fallback = process.env.NEXT_PUBLIC_APP_URL;

  if (!fallback) {
    throw new Error(
      "Missing app URL. Set NEXT_PUBLIC_APP_URL or pass the current request origin.",
    );
  }

  return fallback.replace(/\/$/, "");
}

async function cashfreeRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${getCashfreeBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...getCashfreeHeaders(),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; code?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message || payload?.code || "Cashfree request failed.");
  }

  return payload as T;
}

export function isCashfreeConfigured() {
  return Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
}

export async function createCashfreeSubscription(options: {
  userId: string;
  email: string;
  name: string;
  phone: string;
  tier: Exclude<SubscriptionTier, "none">;
  interval: BillingInterval;
  appUrl?: string;
}) {
  const amount = getPriceForPlan(options.tier, options.interval);
  const subscriptionId = `subs_${options.userId.slice(-8)}_${options.tier}_${options.interval}_${Date.now()}`;
  const now = new Date();
  const sessionExpiry = new Date(now.getTime() + 30 * 60 * 1000);
  const firstChargeTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const expiryTime = new Date(now.getTime() + 10 * 365 * 24 * 60 * 60 * 1000);
  const intervalType = options.interval === "monthly" ? "MONTH" : "YEAR";

  return cashfreeRequest<{
    subscription_id: string;
    cf_subscription_id: string;
    subscription_session_id: string;
    subscription_status: string;
  }>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      subscription_id: subscriptionId,
      customer_details: {
        customer_name: options.name,
        customer_email: options.email,
        customer_phone: options.phone,
      },
      plan_details: {
        plan_name: `Review Machine ${options.tier} ${options.interval}`,
        plan_type: "PERIODIC",
        plan_amount: amount,
        plan_max_amount: amount,
        plan_max_cycles: options.interval === "monthly" ? 120 : 10,
        plan_intervals: 1,
        plan_currency: "INR",
        plan_interval_type: intervalType,
        plan_note: `Auto-renewing ${options.interval} subscription for ${options.tier}`,
      },
      authorization_details: {
        authorization_amount: 1,
        authorization_amount_refund: true,
        payment_methods: ["upi", "card", "enach"],
      },
      subscription_meta: {
        return_url: `${normalizeAppBaseUrl(options.appUrl)}/dashboard/billing/confirm?subscription_id=${subscriptionId}`,
        notification_channel: ["EMAIL"],
        session_id_expiry: sessionExpiry.toISOString(),
      },
      subscription_expiry_time: expiryTime.toISOString(),
      subscription_first_charge_time: firstChargeTime.toISOString(),
      subscription_tags: {
        user_id: options.userId,
        tier: options.tier,
        interval: options.interval,
      },
    }),
  });
}

export async function fetchCashfreeSubscription(subscriptionId: string) {
  return cashfreeRequest<{
    subscription_id: string;
    cf_subscription_id: string;
    subscription_status: string;
    subscription_tags?: Record<string, string>;
    subscription_expiry_time?: string;
    customer_details?: {
      customer_phone?: string;
      customer_email?: string;
      customer_name?: string;
    };
  }>(`/subscriptions/${subscriptionId}`, {
    method: "GET",
  });
}

export function verifyCashfreeWebhookSignature(options: {
  rawBody: string;
  timestamp: string;
  signature: string;
}) {
  const secret = process.env.CASHFREE_SECRET_KEY;

  if (!secret) {
    throw new Error("Missing CASHFREE_SECRET_KEY environment variable.");
  }

  const signedPayload = `${options.timestamp}${options.rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("base64");

  return expectedSignature === options.signature;
}
