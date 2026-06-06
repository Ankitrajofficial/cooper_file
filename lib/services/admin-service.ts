import mongoose from "mongoose";
import Client from "@/models/Client";
import Review from "@/models/Review";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import { FREE_REVIEWS_PER_LINK } from "@/lib/free-tier";
import { getBillingPlan, hasSubscriptionAccess, normalizeSubscriptionStatus } from "@/lib/billing";
import { resolveUserRole } from "@/lib/auth";
import {
  activateFreeSubscriptionForUser,
  applySuccessfulSubscriptionForUser,
} from "@/lib/services/billing-service";
import { buildScriptedReviews } from "@/lib/services/review-service";
import { detectIndustry, detectSector, slugify } from "@/lib/utils";
import {
  type BillingInterval,
  type BusinessSector,
  type ClientFormInput,
  type PaidSubscriptionTier,
  type SubscriptionTier,
} from "@/types";

type AdminOverviewStats = {
  totalUsers: number;
  totalClients: number;
  activeSubscribers: number;
  totalReviews: number;
  totalClicks: number;
  estimatedMrrInr: number;
  activeArrInr: number;
};

type AdminUserSummary = {
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
};

type AdminClientSummary = {
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
};

export type AdminOverview = {
  stats: AdminOverviewStats;
  users: AdminUserSummary[];
  clients: AdminClientSummary[];
};

async function generateUniqueSlug(baseValue: string) {
  const baseSlug = slugify(baseValue) || "review-page";
  let slug = baseSlug;
  let counter = 1;

  while (await Client.exists({ slug })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

function toEndOfDay(value: string) {
  const date = new Date(`${value}T23:59:59.999`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Please enter a valid link expiry date.");
  }

  return date;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  await connectToDatabase();

  const [users, clients, reviewCounts] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }).lean(),
    Client.find({}).sort({ createdAt: -1 }).lean(),
    Review.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      {
        $group: {
          _id: "$clientId",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const reviewCountMap = new Map(
    reviewCounts.map((entry) => [entry._id.toString(), entry.count]),
  );

  const clientMetricsByOwner = new Map<
    string,
    { activeClientCount: number; totalClicks: number; totalReviews: number }
  >();

  const clientSummaries = (clients as Array<any>).map((client) => {
    const reviewCount = reviewCountMap.get(client._id.toString()) ?? 0;
    const ownerId = client.userId.toString();
    const ownerMetrics = clientMetricsByOwner.get(ownerId) || {
      activeClientCount: 0,
      totalClicks: 0,
      totalReviews: 0,
    };

    ownerMetrics.activeClientCount += 1;
    ownerMetrics.totalClicks += client.clickCount || 0;
    ownerMetrics.totalReviews += reviewCount;
    clientMetricsByOwner.set(ownerId, ownerMetrics);

    return {
      id: client._id.toString(),
      slug: client.slug,
      businessName: client.businessName,
      city: client.city,
      sector: (client.sector as BusinessSector | undefined) || detectSector(client.businessName),
      industry: client.industry || "General Business",
      businessDescription: client.businessDescription || "",
      expiresAt: client.expiresAt ? new Date(client.expiresAt).toISOString() : null,
      expiryMode: client.expiryMode || "subscription",
      ownerId,
      ownerEmail: "",
      ownerName: "",
      ownerPlan: "none" as SubscriptionTier,
      ownerPlanName: "No plan",
      ownerSubscriptionStatus: "inactive",
      ownerSubscriptionInterval: "monthly" as BillingInterval,
      reviewCount,
      clickCount: client.clickCount || 0,
      createdAt: new Date(client.createdAt).toISOString(),
    };
  });

  const usersById = new Map(
    (users as Array<any>).map((user) => [user._id.toString(), user]),
  );

  let estimatedMrrInr = 0;
  let activeArrInr = 0;
  let activeSubscribers = 0;

  const userSummaries = (users as Array<any>).map((user) => {
    const role = resolveUserRole(user);
    const normalizedStatus = normalizeSubscriptionStatus(user);
    const metrics = clientMetricsByOwner.get(user._id.toString()) || {
      activeClientCount: 0,
      totalClicks: 0,
      totalReviews: 0,
    };
    const plan = getBillingPlan((user.subscriptionTier || "none") as SubscriptionTier);
    const hasPaidAccess = role === "client" && plan && hasSubscriptionAccess({
      subscriptionStatus: normalizedStatus,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    });

    if (hasPaidAccess) {
      activeSubscribers += 1;

      if (user.subscriptionInterval === "yearly") {
        estimatedMrrInr += Math.round(plan.yearlyPriceInr / 12);
        activeArrInr += plan.yearlyPriceInr;
      } else {
        estimatedMrrInr += plan.monthlyPriceInr;
        activeArrInr += plan.monthlyPriceInr * 12;
      }
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name || "",
      role,
      subscriptionTier: (user.subscriptionTier || "none") as SubscriptionTier,
      subscriptionStatus: normalizedStatus,
      subscriptionInterval: (user.subscriptionInterval || "monthly") as BillingInterval,
      activeClientCount: metrics.activeClientCount,
      totalReviews: metrics.totalReviews,
      totalClicks: metrics.totalClicks,
    } satisfies AdminUserSummary;
  });

  const populatedClients = clientSummaries.map((client) => {
    const owner = usersById.get(client.ownerId);
    const ownerPlan = (owner?.subscriptionTier || "none") as SubscriptionTier;
    const plan = getBillingPlan(ownerPlan);

    return {
      ...client,
      ownerEmail: owner?.email || "Unknown",
      ownerName: owner?.name || "",
      ownerPlan,
      ownerPlanName: plan?.name || "No plan",
      ownerSubscriptionStatus: owner ? normalizeSubscriptionStatus(owner as any) : "inactive",
      ownerSubscriptionInterval: (owner?.subscriptionInterval || "monthly") as BillingInterval,
    } satisfies AdminClientSummary;
  });

  return {
    stats: {
      totalUsers: userSummaries.filter((user) => user.role === "client").length,
      totalClients: populatedClients.length,
      activeSubscribers,
      totalReviews: populatedClients.reduce((sum, client) => sum + client.reviewCount, 0),
      totalClicks: populatedClients.reduce((sum, client) => sum + client.clickCount, 0),
      estimatedMrrInr,
      activeArrInr,
    },
    users: userSummaries,
    clients: populatedClients,
  };
}

export async function setSubscriptionForUserAsAdmin(options: {
  userId: string;
  tier: SubscriptionTier;
  interval: BillingInterval;
}) {
  if (options.tier === "none") {
    await connectToDatabase();

    await User.findByIdAndUpdate(options.userId, {
      subscriptionTier: "none",
      subscriptionInterval: options.interval,
      subscriptionStatus: "inactive",
      subscriptionAutoRenew: false,
      subscriptionCurrentPeriodStart: null,
      subscriptionCurrentPeriodEnd: null,
      pendingSubscriptionTier: "none",
      pendingSubscriptionInterval: options.interval,
      cashfreeSubscriptionStatus: "ADMIN_REVOKED",
    });

    return;
  }

  if (options.tier === "free") {
    await activateFreeSubscriptionForUser(options.userId);
    return;
  }

  await applySuccessfulSubscriptionForUser({
    userId: options.userId,
    tier: options.tier as PaidSubscriptionTier,
    interval: options.interval,
    cashfreeSubscriptionStatus: "ADMIN_ACTIVE",
  });
}

export async function createClientForUserAsAdmin(options: {
  ownerEmail: string;
  input: ClientFormInput;
}) {
  await connectToDatabase();

  const ownerEmail = options.ownerEmail.trim().toLowerCase();
  const requestedExpiry = options.input.expiresAt
    ? toEndOfDay(options.input.expiresAt)
    : null;
  const fallbackPeriodEnd = new Date();

  fallbackPeriodEnd.setFullYear(fallbackPeriodEnd.getFullYear() + 1);

  let owner = (await User.findOne({ email: ownerEmail })) as any;

  if (!owner) {
    const now = new Date();

    await User.collection.insertOne({
      email: ownerEmail,
      password: null,
      name: ownerEmail.split("@")[0] || "Client",
      role: "client",
      image: "",
      phone: "",
      subscriptionTier: "free",
      subscriptionInterval: "monthly",
      subscriptionStatus: "active",
      subscriptionAutoRenew: false,
      subscriptionCurrentPeriodStart: now,
      subscriptionCurrentPeriodEnd: requestedExpiry || fallbackPeriodEnd,
      pendingSubscriptionTier: "none",
      pendingSubscriptionInterval: "monthly",
      lastPaymentAt: now,
      cashfreeCustomerId: "",
      cashfreeSubscriptionId: "",
      cashfreeCfSubscriptionId: "",
      cashfreeSubscriptionStatus: "FREE_ACTIVE",
      createdAt: now,
    });

    owner = (await User.findOne({ email: ownerEmail })) as any;
  }

  if (!owner) {
    throw new Error("Client owner could not be created.");
  }

  if (!owner.subscriptionCurrentPeriodEnd || !hasSubscriptionAccess(owner)) {
    owner.subscriptionTier = owner.subscriptionTier === "none" ? "free" : owner.subscriptionTier;
    owner.subscriptionInterval = owner.subscriptionInterval || "monthly";
    owner.subscriptionStatus = "active";
    owner.subscriptionAutoRenew = false;
    owner.subscriptionCurrentPeriodStart = new Date();
    owner.subscriptionCurrentPeriodEnd = requestedExpiry || fallbackPeriodEnd;
    owner.cashfreeSubscriptionStatus = "FREE_ACTIVE";
    await owner.save();
  }

  const sector = (options.input.sector?.trim() as BusinessSector) || detectSector(options.input.businessName);
  const industry =
    options.input.industry?.trim() || detectIndustry(options.input.businessName, sector);
  const slug = await generateUniqueSlug(`${options.input.businessName}-${options.input.city}`);
  const expiresAt = requestedExpiry || owner.subscriptionCurrentPeriodEnd || fallbackPeriodEnd;
  const expiryMode = options.input.expiresAt ? "custom" : "subscription";

  const client = await Client.create({
    userId: owner._id,
    slug,
    businessName: options.input.businessName,
    city: options.input.city,
    sector,
    industry,
    businessDescription: options.input.businessDescription?.trim() || "",
    expiresAt,
    expiryMode,
    googleReviewLink: options.input.googleReviewLink,
  });

  const scriptedReviews = buildScriptedReviews({
    businessName: options.input.businessName,
    city: options.input.city,
    sector,
    industry,
    businessDescription: options.input.businessDescription?.trim() || "",
  }, FREE_REVIEWS_PER_LINK).map((review) => ({
    clientId: client._id,
    category: review.category,
    text: review.text,
  }));

  await Review.insertMany(scriptedReviews);

  return client;
}

export async function deleteClientAsAdmin(clientId: string) {
  await connectToDatabase();

  const client = await Client.findByIdAndDelete(clientId).lean();

  if (!client) {
    return null;
  }

  await Review.deleteMany({ clientId: (client as any)._id });

  return client;
}

export async function deleteClientUserAsAdmin(userId: string) {
  await connectToDatabase();

  const user = (await User.findById(userId).lean()) as any;

  if (!user) {
    return null;
  }

  if (resolveUserRole(user) === "admin") {
    throw new Error("Admin users cannot be deleted from this panel.");
  }

  const clients = await Client.find({ userId }).select("_id").lean();
  const clientIds = clients.map((client) => client._id);

  if (clientIds.length) {
    await Review.deleteMany({ clientId: { $in: clientIds } });
    await Client.deleteMany({ _id: { $in: clientIds } });
  }

  await User.findByIdAndDelete(userId);

  return {
    deletedClients: clientIds.length,
  };
}
