import {
  type BillingInterval,
  type BillingPlan,
  type SubscriptionStatus,
  type SubscriptionTier,
} from "@/types";

export const BILLING_PLANS: BillingPlan[] = [
  {
    tier: "tier_1",
    name: "Tier 1",
    monthlyPriceInr: 199,
    yearlyPriceInr: 1990,
    clientLimit: 1,
    reviewsPerLink: 200,
    description:
      "1 active review link with 200 curated Google review options built to help one business collect more ranking-focused reviews.",
    highlights: [
      "1 active review link",
      "200 curated reviews on each link",
      "Built for one business profile",
    ],
  },
  {
    tier: "tier_2",
    name: "Tier 2",
    monthlyPriceInr: 499,
    yearlyPriceInr: 4990,
    clientLimit: 5,
    reviewsPerLink: 500,
    description:
      "5 active review links with up to 500 curated Google review options on each link for growing multi-location businesses.",
    highlights: [
      "5 active review links",
      "500 curated reviews on each link",
      "Best for growing multi-location brands",
    ],
  },
  {
    tier: "tier_3",
    name: "Tier 3",
    monthlyPriceInr: 999,
    yearlyPriceInr: 9990,
    clientLimit: null,
    reviewsPerLink: null,
    description:
      "Unlimited active review links with unlimited curated Google review options per link for agencies and large portfolios.",
    highlights: [
      "Unlimited active review links",
      "Unlimited curated reviews on each link",
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
  tier: Exclude<SubscriptionTier, "none">,
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

export function hasActiveSubscription(user: SubscriptionLike) {
  const status = (user.subscriptionStatus || "inactive") as SubscriptionStatus;

  if (!isSubscriptionStatusActive(status)) {
    return false;
  }

  if (!user.subscriptionCurrentPeriodEnd) {
    return false;
  }

  return new Date(user.subscriptionCurrentPeriodEnd).getTime() > Date.now();
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

export function getReviewCapacityLabel(reviewsPerLink: number | null) {
  if (reviewsPerLink === null) {
    return "Unlimited curated reviews per link";
  }

  return `${reviewsPerLink} curated reviews per link`;
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
