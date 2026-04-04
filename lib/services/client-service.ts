import mongoose from "mongoose";
import Client from "@/models/Client";
import Review from "@/models/Review";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import { detectIndustry, detectSector, slugify } from "@/lib/utils";
import { buildStarterReviews } from "@/lib/services/review-service";
import {
  assertCanCreateClientForUser,
  requireActiveSubscriptionForUser,
  resolveClientExpiryForUser,
} from "@/lib/services/billing-service";
import { hasActiveSubscription } from "@/lib/billing";
import {
  type BusinessSector,
  type ClientFormInput,
  type DashboardClient,
  type PublicClientAvailability,
} from "@/types";

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

function toDashboardClient(
  client: {
    _id: { toString(): string } | mongoose.Types.ObjectId | string;
    slug: string;
    businessName: string;
    city: string;
    sector?: BusinessSector;
    industry: string;
    businessDescription?: string;
    expiresAt?: Date | string | null;
    expiryMode?: "subscription" | "custom";
    googleReviewLink: string;
    clickCount: number;
    createdAt: Date | string;
  },
  reviewCount: number,
): DashboardClient {
  return {
    id: client._id.toString(),
    slug: client.slug,
    businessName: client.businessName,
    city: client.city,
    sector: client.sector || detectSector(client.businessName),
    industry: client.industry,
    businessDescription: client.businessDescription || "",
    expiresAt: client.expiresAt ? new Date(client.expiresAt).toISOString() : null,
    expiryMode: client.expiryMode || "subscription",
    isExpired: client.expiresAt ? new Date(client.expiresAt).getTime() <= Date.now() : false,
    googleReviewLink: client.googleReviewLink,
    clickCount: client.clickCount,
    reviewCount,
    createdAt: new Date(client.createdAt).toISOString(),
  };
}

export async function listClientsForUser(userId: string) {
  await connectToDatabase();

  const clients = await Client.find({ userId }).sort({ createdAt: -1 }).lean();
  const clientIds = clients.map((client) => client._id);

  const reviewCounts = await Review.aggregate<{
    _id: mongoose.Types.ObjectId;
    count: number;
  }>([
    {
      $match: {
        clientId: { $in: clientIds },
      },
    },
    {
      $group: {
        _id: "$clientId",
        count: { $sum: 1 },
      },
    },
  ]);

  const reviewCountMap = new Map(
    reviewCounts.map((entry) => [entry._id.toString(), entry.count]),
  );

  return (clients as Array<any>).map((client) =>
    toDashboardClient(client, reviewCountMap.get(client._id.toString()) ?? 0),
  );
}

export async function getClientForUser(userId: string, clientId: string) {
  await connectToDatabase();

  const client = await Client.findOne({ _id: clientId, userId }).lean();

  if (!client) {
    return null;
  }

  const clientRecord = client as any;
  const reviewCount = await Review.countDocuments({ clientId: clientRecord._id });

  return toDashboardClient(clientRecord, reviewCount);
}

export async function createClientForUser(userId: string, input: ClientFormInput) {
  await connectToDatabase();
  await assertCanCreateClientForUser(userId);

  const sector = (input.sector?.trim() as BusinessSector) || detectSector(input.businessName);
  const industry =
    input.industry?.trim() || detectIndustry(input.businessName, sector);
  const slug = await generateUniqueSlug(`${input.businessName}-${input.city}`);
  const { expiresAt, expiryMode } = await resolveClientExpiryForUser(
    userId,
    input.expiresAt,
  );
  const client = await Client.create({
    userId,
    slug,
    businessName: input.businessName,
    city: input.city,
    sector,
    industry,
    businessDescription: input.businessDescription?.trim() || "",
    expiresAt,
    expiryMode,
    googleReviewLink: input.googleReviewLink,
  });

  const starterReviews = buildStarterReviews({
      businessName: input.businessName,
      city: input.city,
      sector,
      industry,
      businessDescription: input.businessDescription?.trim() || "",
    }).map((review) => ({
      clientId: client._id,
      category: review.category,
      text: review.text,
  }));

  await Review.insertMany(starterReviews);

  return client;
}

export async function updateClientForUser(
  userId: string,
  clientId: string,
  input: ClientFormInput,
) {
  await connectToDatabase();
  await requireActiveSubscriptionForUser(userId);

  const sector = (input.sector?.trim() as BusinessSector) || detectSector(input.businessName);
  const industry =
    input.industry?.trim() || detectIndustry(input.businessName, sector);
  const { expiresAt, expiryMode } = await resolveClientExpiryForUser(
    userId,
    input.expiresAt,
  );

  return Client.findOneAndUpdate(
    { _id: clientId, userId },
    {
      businessName: input.businessName,
      city: input.city,
      sector,
      industry,
      businessDescription: input.businessDescription?.trim() || "",
      expiresAt,
      expiryMode,
      googleReviewLink: input.googleReviewLink,
    },
    { new: true },
  ).lean();
}

export async function deleteClientForUser(userId: string, clientId: string) {
  await connectToDatabase();

  const client = await Client.findOneAndDelete({ _id: clientId, userId }).lean();

  if (!client) {
    return null;
  }

  const clientRecord = client as any;

  await Review.deleteMany({ clientId: clientRecord._id });

  return clientRecord;
}

export async function getPublicClientBySlug(
  slug: string,
): Promise<PublicClientAvailability | null> {
  await connectToDatabase();

  const client = await Client.findOne({ slug }).lean();

  if (!client) {
    return null;
  }

  const clientRecord = client as any;
  const owner = (await User.findById(clientRecord.userId).lean()) as any;

  if (!owner || !hasActiveSubscription(owner)) {
    return {
      status: "expired",
      client: {
        businessName: clientRecord.businessName,
        city: clientRecord.city,
        sector:
          (clientRecord.sector as BusinessSector | undefined) ||
          detectSector(clientRecord.businessName),
        slug: clientRecord.slug,
      },
      reason: "subscription_inactive",
      expiredAt: owner?.subscriptionCurrentPeriodEnd
        ? new Date(owner.subscriptionCurrentPeriodEnd).toISOString()
        : null,
    };
  }

  if (clientRecord.expiresAt && new Date(clientRecord.expiresAt).getTime() <= Date.now()) {
    return {
      status: "expired",
      client: {
        businessName: clientRecord.businessName,
        city: clientRecord.city,
        sector:
          (clientRecord.sector as BusinessSector | undefined) ||
          detectSector(clientRecord.businessName),
        slug: clientRecord.slug,
      },
      reason: "link_expired",
      expiredAt: new Date(clientRecord.expiresAt).toISOString(),
    };
  }

  const reviews = await Review.find({ clientId: clientRecord._id })
    .sort({ category: 1, createdAt: 1 })
    .lean();

  return {
    status: "active",
    client: {
      id: clientRecord._id.toString(),
      businessName: clientRecord.businessName,
      city: clientRecord.city,
      sector:
        (clientRecord.sector as BusinessSector | undefined) || detectSector(clientRecord.businessName),
      industry: clientRecord.industry,
      businessDescription: clientRecord.businessDescription || "",
      expiresAt: clientRecord.expiresAt
        ? new Date(clientRecord.expiresAt).toISOString()
        : null,
      googleReviewLink: clientRecord.googleReviewLink,
      slug: clientRecord.slug,
      clickCount: clientRecord.clickCount,
    },
    reviews: (reviews as Array<any>).map((review) => ({
      id: review._id.toString(),
      category: review.category,
      text: review.text,
    })),
  };
}

export async function incrementClientClickBySlug(slug: string) {
  await connectToDatabase();

  await Client.findOneAndUpdate({ slug }, { $inc: { clickCount: 1 } });
}
