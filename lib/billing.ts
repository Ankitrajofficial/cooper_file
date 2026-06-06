import {
  type BillingInterval,
  type BillingPlan,
  type PaidSubscriptionTier,
  type SubscriptionStatus,
  type SubscriptionTier,
} from "@/types";

export const BILLING_PLANS: BillingPlan[] = [
  {
    tier: "free",
    name: "Free",
    monthlyPriceInr: 0,
    yearlyPriceInr: 0,
    clientLimit: 1,
    reviewsPerLink: 10,
    description:
      "1 active review link with 10 starter review scripts each month for testing the review flow.",
    highlights: [
      "1 active review link",
      "10 starter review scripts per month",
      "Built for testing before upgrading",
    ],
  },
  {
    tier: "tier_1",
    name: "Starter",
    monthlyPriceInr: 199,
    yearlyPriceInr: 1990,
    clientLimit: 1,
    reviewsPerLink: 200,
    description:
      "1 active review link with 200 curated Google review scripts each month, or 2,400 on yearly billing, built to help one business collect more ranking-focused reviews.",
    highlights: [
      "1 active review link",
      "200 scripts per month or 2,400 per year",
      "Built for one business profile",
    ],
  },
  {
    tier: "tier_2",
    name: "Growth",
    monthlyPriceInr: 499,
    yearlyPriceInr: 4990,
    clientLimit: 5,
    reviewsPerLink: 500,
    description:
      "5 active review links with 500 curated Google review scripts each month, or 6,000 on yearly billing, for growing multi-location businesses.",
    highlights: [
      "5 active review links",
      "500 scripts per month or 6,000 per year",
      "Best for growing multi-location brands",
    ],
  },
  {
    tier: "tier_3",
    name: "Scale",
    monthlyPriceInr: 999,
    yearlyPriceInr: 9990,
    clientLimit: null,
    reviewsPerLink: null,
    description:
      "Unlimited active review links with unlimited curated Google review scripts for agencies and large portfolios.",
    highlights: [
      "Unlimited active review links",
      "Unlimited scripts on every billing cycle",
      "Built for agencies and large portfolios",
    ],
  },
];

export function getBillingPlan(tier: SubscriptionTier) {
  if (tier === "none") {
    return null;
  }

  return BILLING_PLANS.find((plan) => plan.tier === tier) ?? null;
}

export function getClientLimitForTier(tier: SubscriptionTier) {
  return getBillingPlan(tier)?.clientLimit ?? 0;
}

export function getPriceForPlan(
  tier: PaidSubscriptionTier,
  interval: BillingInterval,
) {
  const plan = getBillingPlan(tier);

  if (!plan) {
    throw new Error("Unknown billing plan.");
  }

  return interval === "monthly" ? plan.monthlyPriceInr : plan.yearlyPriceInr;
}

export function getBillingIntervalLabel(interval: BillingInterval) {
  return interval === "monthly" ? "Monthly" : "Yearly";
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function addBillingInterval(
  date: Date,
  interval: BillingInterval,
  steps = 1,
) {
  const nextDate = new Date(date);

  if (interval === "monthly") {
    nextDate.setMonth(nextDate.getMonth() + steps);
    return nextDate;
  }

  nextDate.setFullYear(nextDate.getFullYear() + steps);
  return nextDate;
}

export function isSubscriptionStatusActive(status: SubscriptionStatus) {
  return status === "active";
}

type SubscriptionLike = {
  subscriptionStatus?: SubscriptionStatus | string | null;
  subscriptionCurrentPeriodEnd?: Date | string | null;
};

function hasFutureBillingPeriod(user: SubscriptionLike) {
  if (!user.subscriptionCurrentPeriodEnd) {
    return false;
  }

  return new Date(user.subscriptionCurrentPeriodEnd).getTime() > Date.now();
}

export function hasActiveSubscription(user: SubscriptionLike) {
  const status = (user.subscriptionStatus || "inactive") as SubscriptionStatus;

  if (!isSubscriptionStatusActive(status)) {
    return false;
  }

  return hasFutureBillingPeriod(user);
}

export function hasSubscriptionAccess(user: SubscriptionLike) {
  const status = (user.subscriptionStatus || "inactive") as SubscriptionStatus;

  if (status !== "active" && status !== "cancelled") {
    return false;
  }

  return hasFutureBillingPeriod(user);
}

export function normalizeSubscriptionStatus(user: SubscriptionLike) {
  if (hasActiveSubscription(user)) {
    return "active" as const;
  }

  const status = (user.subscriptionStatus || "inactive") as SubscriptionStatus;

  if (status === "pending" || status === "cancelled" || status === "past_due") {
    return status;
  }

  if (user.subscriptionCurrentPeriodEnd) {
    const currentPeriodEnd = new Date(user.subscriptionCurrentPeriodEnd).getTime();

    if (currentPeriodEnd <= Date.now()) {
      return "expired" as const;
    }
  }

  return "inactive" as const;
}

export function canCreateClientForTier(
  tier: SubscriptionTier,
  activeClientCount: number,
) {
  const clientLimit = getClientLimitForTier(tier);

  if (!clientLimit) {
    return tier === "tier_3";
  }

  return activeClientCount < clientLimit;
}

export function getClientLimitLabel(clientLimit: number | null) {
  if (clientLimit === null) {
    return "Unlimited";
  }

  return clientLimit.toString();
}

export function getReviewCapacityForInterval(
  reviewsPerLink: number | null,
  interval: BillingInterval,
) {
  if (reviewsPerLink === null) {
    return null;
  }

  return interval === "yearly" ? reviewsPerLink * 12 : reviewsPerLink;
}

export function getReviewCapacityLabel(
  reviewsPerLink: number | null,
  interval: BillingInterval = "monthly",
) {
  if (reviewsPerLink === null) {
    return "Unlimited review scripts";
  }

  const reviewCapacity = getReviewCapacityForInterval(reviewsPerLink, interval);
  const periodLabel = interval === "yearly" ? "per year" : "per month";

  return `${reviewCapacity?.toLocaleString("en-IN")} review scripts ${periodLabel}`;
}

export function toDateInputValue(value?: string | Date | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}
