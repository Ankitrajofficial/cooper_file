import Client from "@/models/Client";
import User from "@/models/User";
import BillingEvent from "@/models/BillingEvent";
import { connectToDatabase } from "@/lib/db";
import {
  FREE_MONTHLY_LINK_LIMIT,
  FREE_REVIEWS_PER_LINK,
  UNLIMITED_MONTHLY_LINKS,
  getCurrentMonthBounds,
  getCurrentMonthKey,
} from "@/lib/free-tier";
import {
  addBillingInterval,
  canCreateClientForTier,
  getBillingPlan,
  getClientLimitForTier,
  hasActiveSubscription,
  hasSubscriptionAccess,
  normalizeSubscriptionStatus,
} from "@/lib/billing";
import {
  type BillingInterval,
  type BillingSummary,
  type ClientExpiryMode,
  type PaidSubscriptionTier,
  type SubscriptionTier,
} from "@/types";

function toEndOfDay(value: string) {
  const date = new Date(`${value}T23:59:59.999`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Please enter a valid link expiry date.");
  }

  return date;
}

function getRenewalBounds(
  currentPeriodEnd: Date | string | null | undefined,
  interval: BillingInterval,
) {
  const now = new Date();
  const currentEnd =
    currentPeriodEnd && !Number.isNaN(new Date(currentPeriodEnd).getTime())
      ? new Date(currentPeriodEnd)
      : null;
  const nextPeriodStart =
    currentEnd && currentEnd.getTime() > now.getTime() ? currentEnd : now;

  return {
    currentPeriodStart: nextPeriodStart,
    currentPeriodEnd: addBillingInterval(nextPeriodStart, interval),
  };
}

export async function getBillingSummaryForUser(userId: string): Promise<BillingSummary> {
  await connectToDatabase();

  const user = (await User.findById(userId).lean()) as any;

  if (!user) {
    throw new Error("User not found.");
  }

  const normalizedStatus = normalizeSubscriptionStatus(user);
  const activePlan = getBillingPlan((user.subscriptionTier || "none") as SubscriptionTier);
  const hasSubscriptionAccessNow = hasSubscriptionAccess(user);

  if (user.subscriptionStatus !== normalizedStatus) {
    await User.findByIdAndUpdate(userId, { subscriptionStatus: normalizedStatus });
    user.subscriptionStatus = normalizedStatus;
  }

  const now = new Date();
  const activeClientCount = await Client.countDocuments({
    userId,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  });
  const clientLimit = getClientLimitForTier(user.subscriptionTier || "none");
  const canCreateClient =
    hasSubscriptionAccessNow &&
    canCreateClientForTier(user.subscriptionTier || "none", activeClientCount);

  return {
    tier: user.subscriptionTier || "none",
    planName: activePlan?.name || null,
    status: normalizedStatus,
    hasSubscriptionAccess: hasSubscriptionAccessNow,
    interval: user.subscriptionInterval || "monthly",
    autoRenew: Boolean(user.subscriptionAutoRenew),
    currentPeriodStart: user.subscriptionCurrentPeriodStart
      ? new Date(user.subscriptionCurrentPeriodStart).toISOString()
      : null,
    currentPeriodEnd: user.subscriptionCurrentPeriodEnd
      ? new Date(user.subscriptionCurrentPeriodEnd).toISOString()
      : null,
    activeClientCount,
    clientLimit,
    reviewsPerLink: activePlan?.reviewsPerLink ?? null,
    canCreateClient,
    phone: user.phone || "",
    pendingTier: user.pendingSubscriptionTier || "none",
    pendingInterval: user.pendingSubscriptionInterval || "monthly",
    cashfreeSubscriptionId: user.cashfreeSubscriptionId || "",
    cashfreeSubscriptionStatus: user.cashfreeSubscriptionStatus || "",
    lastPaymentAt: user.lastPaymentAt ? new Date(user.lastPaymentAt).toISOString() : null,
  };
}

export async function updateBillingContactForUser(userId: string, phone: string) {
  await connectToDatabase();

  await User.findByIdAndUpdate(userId, { phone });
}

export async function activateFreeSubscriptionForUser(userId: string) {
  await connectToDatabase();

  const now = new Date();
  const currentPeriodEnd = addBillingInterval(now, "monthly");

  await User.findByIdAndUpdate(userId, {
    subscriptionTier: "free",
    subscriptionInterval: "monthly",
    subscriptionStatus: "active",
    subscriptionAutoRenew: false,
    subscriptionCurrentPeriodStart: now,
    subscriptionCurrentPeriodEnd: currentPeriodEnd,
    pendingSubscriptionTier: "none",
    pendingSubscriptionInterval: "monthly",
    cashfreeSubscriptionStatus: "FREE_ACTIVE",
  });

  await Client.updateMany(
    { userId, expiryMode: "subscription" },
    { expiresAt: currentPeriodEnd },
  );

  return {
    currentPeriodStart: now,
    currentPeriodEnd,
  };
}

export async function requireActiveSubscriptionForUser(userId: string) {
  await connectToDatabase();

  const user = (await User.findById(userId).lean()) as any;

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
}

export async function assertCanCreateClientForUser(userId: string) {
  await connectToDatabase();

  const user = await User.exists({ _id: userId });

  if (!user) {
    throw new Error("User not found.");
  }

  const usage = await getFreeTierUsageForUser(userId);

  if (!usage.canCreateLink) {
    throw new Error(
      `Free tier allows ${FREE_MONTHLY_LINK_LIMIT} review links per month. You can create another link next month.`,
    );
  }

  await User.findByIdAndUpdate(userId, {
    freeLinkQuotaMonth: getCurrentMonthKey(),
    freeLinksCreatedThisMonth: usage.linksCreatedThisMonth + 1,
  });

  return {
    canCreateClient: usage.canCreateLink,
  };
}

export async function getFreeTierUsageForUser(userId: string) {
  await connectToDatabase();

  const { monthStart, nextMonthStart } = getCurrentMonthBounds();
  const monthKey = getCurrentMonthKey();
  const [user, existingLinksCreatedThisMonth] = await Promise.all([
    User.findById(userId).lean(),
    Client.countDocuments({
      userId,
      createdAt: {
        $gte: monthStart,
        $lt: nextMonthStart,
      },
    }),
  ]);

  const recordedLinksCreatedThisMonth =
    (user as any)?.freeLinkQuotaMonth === monthKey
      ? Number((user as any).freeLinksCreatedThisMonth || 0)
      : 0;
  const linksCreatedThisMonth = Math.max(
    recordedLinksCreatedThisMonth,
    existingLinksCreatedThisMonth,
  );

  return {
    linksCreatedThisMonth,
    monthlyLinkLimit: UNLIMITED_MONTHLY_LINKS
      ? (null as number | null)
      : FREE_MONTHLY_LINK_LIMIT,
    reviewsPerLink: FREE_REVIEWS_PER_LINK,
    canCreateLink:
      UNLIMITED_MONTHLY_LINKS || linksCreatedThisMonth < FREE_MONTHLY_LINK_LIMIT,
    monthStart: monthStart.toISOString(),
    nextMonthStart: nextMonthStart.toISOString(),
  };
}

export async function resolveClientExpiryForUser(
  userId: string,
  requestedExpiry?: string,
): Promise<{ expiresAt: Date | null; expiryMode: ClientExpiryMode }> {
  await requireActiveSubscriptionForUser(userId);

  if (!requestedExpiry) {
    return {
      expiresAt: null,
      expiryMode: "subscription",
    };
  }

  const expiresAt = toEndOfDay(requestedExpiry);

  if (expiresAt.getTime() <= Date.now()) {
    throw new Error("Link expiry date must be in the future.");
  }

  return {
    expiresAt,
    expiryMode: "custom",
  };
}

export async function applySuccessfulSubscriptionForUser(options: {
  userId: string;
  tier: PaidSubscriptionTier;
  interval: BillingInterval;
  cashfreeSubscriptionId?: string;
  cashfreeCfSubscriptionId?: string;
  cashfreeSubscriptionStatus?: string;
  preserveCurrentPeriod?: boolean;
}) {
  await connectToDatabase();

  const user = (await User.findById(options.userId)) as any;

  if (!user) {
    throw new Error("User not found.");
  }

  const bounds = options.preserveCurrentPeriod && hasActiveSubscription(user)
    ? {
        currentPeriodStart: user.subscriptionCurrentPeriodStart || new Date(),
        currentPeriodEnd: user.subscriptionCurrentPeriodEnd || addBillingInterval(new Date(), options.interval),
      }
    : getRenewalBounds(user.subscriptionCurrentPeriodEnd, options.interval);

  user.subscriptionTier = options.tier;
  user.subscriptionInterval = options.interval;
  user.subscriptionStatus = "active";
  user.subscriptionAutoRenew = true;
  user.subscriptionCurrentPeriodStart = bounds.currentPeriodStart;
  user.subscriptionCurrentPeriodEnd = bounds.currentPeriodEnd;
  user.pendingSubscriptionTier = "none";
  user.pendingSubscriptionInterval = options.interval;
  user.lastPaymentAt = new Date();

  if (options.cashfreeSubscriptionId) {
    user.cashfreeSubscriptionId = options.cashfreeSubscriptionId;
  }

  if (options.cashfreeCfSubscriptionId) {
    user.cashfreeCfSubscriptionId = options.cashfreeCfSubscriptionId;
  }

  if (options.cashfreeSubscriptionStatus) {
    user.cashfreeSubscriptionStatus = options.cashfreeSubscriptionStatus;
  }

  await user.save();

  await Client.updateMany(
    { userId: options.userId, expiryMode: "subscription" },
    { expiresAt: bounds.currentPeriodEnd },
  );

  return {
    currentPeriodStart: bounds.currentPeriodStart,
    currentPeriodEnd: bounds.currentPeriodEnd,
  };
}

export async function markPendingSubscriptionForUser(options: {
  userId: string;
  tier: PaidSubscriptionTier;
  interval: BillingInterval;
  phone: string;
  cashfreeSubscriptionId?: string;
  cashfreeCfSubscriptionId?: string;
  cashfreeSubscriptionStatus?: string;
}) {
  await connectToDatabase();

  const user = (await User.findById(options.userId).lean()) as any;

  if (!user) {
    throw new Error("User not found.");
  }

  await User.findByIdAndUpdate(options.userId, {
    phone: options.phone,
    pendingSubscriptionTier: options.tier,
    pendingSubscriptionInterval: options.interval,
    subscriptionStatus: hasSubscriptionAccess(user) ? user.subscriptionStatus : "pending",
    cashfreeSubscriptionId: options.cashfreeSubscriptionId || "",
    cashfreeCfSubscriptionId: options.cashfreeCfSubscriptionId || "",
    cashfreeSubscriptionStatus: options.cashfreeSubscriptionStatus || "",
  });
}

export async function updateSubscriptionStateByCashfreeId(options: {
  cashfreeSubscriptionId: string;
  cashfreeCfSubscriptionId?: string;
  status: string;
}) {
  await connectToDatabase();

  const user = await User.findOneAndUpdate(
    {
      $or: [
        { cashfreeSubscriptionId: options.cashfreeSubscriptionId },
        {
          cashfreeCfSubscriptionId: options.cashfreeCfSubscriptionId || "__missing__",
        },
      ],
    },
    {
      cashfreeSubscriptionStatus: options.status,
      subscriptionStatus:
        options.status === "ACTIVE"
          ? "active"
          : options.status === "CANCELLED"
            ? "cancelled"
            : "past_due",
    },
    { new: true },
  );

  return user;
}

export async function findUserByCashfreeSubscription(options: {
  cashfreeSubscriptionId?: string;
  cashfreeCfSubscriptionId?: string;
}) {
  await connectToDatabase();

  if (!options.cashfreeSubscriptionId && !options.cashfreeCfSubscriptionId) {
    return null;
  }

  return User.findOne({
    $or: [
      ...(options.cashfreeSubscriptionId
        ? [{ cashfreeSubscriptionId: options.cashfreeSubscriptionId }]
        : []),
      ...(options.cashfreeCfSubscriptionId
        ? [{ cashfreeCfSubscriptionId: options.cashfreeCfSubscriptionId }]
        : []),
    ],
  });
}

export async function updateSubscriptionHealthForUser(options: {
  userId: string;
  subscriptionStatus: "past_due" | "cancelled" | "expired";
  cashfreeSubscriptionStatus: string;
}) {
  await connectToDatabase();

  await User.findByIdAndUpdate(options.userId, {
    subscriptionStatus: options.subscriptionStatus,
    cashfreeSubscriptionStatus: options.cashfreeSubscriptionStatus,
  });
}

export async function rememberProcessedBillingEvent(
  eventKey: string,
  eventType: string,
  payload: unknown,
) {
  await connectToDatabase();

  const existing = await BillingEvent.findOne({ eventKey }).lean();

  if (existing) {
    return false;
  }

  await BillingEvent.create({
    eventKey,
    eventType,
    payload,
  });

  return true;
}
