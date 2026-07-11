import { connectToDatabase } from "@/lib/db";
import ReviewOptionPool, {
  REVIEW_POOL_BUCKETS,
  type ReviewPoolBucket,
} from "@/models/ReviewOptionPool";
import {
  generateCustomerReviewBatch,
  generateCustomerReviewOptions,
  type CustomerReviewContext,
} from "@/lib/services/ai-service";
import type { BusinessSector } from "@/types";

// How many ready-to-serve options we keep per bucket, when we top up, and how
// long a pool stays "fresh" before we refill it in the background so the
// wording keeps rotating over time.
const POOL_TARGET = 12;
const POOL_MIN = 6;
const STALE_MS = 1000 * 60 * 30;
const REFILL_COOLDOWN_MS = 1000 * 30;

export type PublicReviewContext = {
  clientId: string;
  businessName: string;
  city: string;
  sector: BusinessSector;
  industry: string;
  businessDescription?: string;
};

function ratingToBucket(rating: number): ReviewPoolBucket {
  if (rating >= 4) {
    return "high";
  }

  if (rating === 3) {
    return "mid";
  }

  return "low";
}

// Representative rating used to generate a bucket's pool. Matches the tone
// branches in ai-service (>=4, ==3, <=2).
function bucketToRating(bucket: ReviewPoolBucket): number {
  if (bucket === "high") {
    return 5;
  }

  if (bucket === "mid") {
    return 3;
  }

  return 2;
}

function toGenerationContext(
  context: PublicReviewContext,
  rating: number,
): CustomerReviewContext {
  return {
    businessName: context.businessName,
    city: context.city,
    sector: context.sector,
    industry: context.industry,
    businessDescription: context.businessDescription,
    rating,
  };
}

function pickTwoDistinct(options: string[]): string[] {
  const unique = Array.from(new Set(options.map((text) => text.trim()))).filter(
    Boolean,
  );

  // Shuffle a copy so repeated taps rotate through the pool.
  for (let i = unique.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }

  return unique.slice(0, 2);
}

function isCooledDown(lastRefillAt?: Date | null) {
  if (!lastRefillAt) {
    return true;
  }

  return Date.now() - new Date(lastRefillAt).getTime() > REFILL_COOLDOWN_MS;
}

function isStale(updatedAt?: Date | null) {
  if (!updatedAt) {
    return true;
  }

  return Date.now() - new Date(updatedAt).getTime() > STALE_MS;
}

// Serve two options for a rating as fast as possible. Reads the pre-generated
// pool and returns instantly when it can; only falls back to a live AI call
// when the pool is empty (typically just the very first tap on a new link).
export async function serveReviewOptions(
  context: PublicReviewContext,
  rating: number,
): Promise<{ options: string[]; bucket: ReviewPoolBucket; shouldRefill: boolean }> {
  await connectToDatabase();

  const bucket = ratingToBucket(rating);
  const pool = (await ReviewOptionPool.findOne({
    clientId: context.clientId,
    bucket,
  }).lean()) as
    | { options?: string[]; updatedAt?: Date; lastRefillAt?: Date | null }
    | null;

  const options = pool?.options ?? [];
  const picked = pickTwoDistinct(options);

  if (picked.length >= 2) {
    const shouldRefill =
      isCooledDown(pool?.lastRefillAt) &&
      (options.length < POOL_MIN || isStale(pool?.updatedAt));

    return { options: picked, bucket, shouldRefill };
  }

  // Cold pool: generate the two options live this once, then let the caller
  // seed the pool in the background so the next taps are instant.
  const fresh = await generateCustomerReviewOptions(
    toGenerationContext(context, bucket === "high" ? rating : bucketToRating(bucket)),
  );

  return { options: fresh.slice(0, 2), bucket, shouldRefill: true };
}

// Regenerate one bucket's pool in a single AI call. Safe to call from a
// background task; failures are swallowed by callers.
export async function refillBucket(
  context: PublicReviewContext,
  bucket: ReviewPoolBucket,
): Promise<void> {
  await connectToDatabase();

  // Claim the refill slot first so overlapping requests don't all call the AI.
  const claimed = await ReviewOptionPool.findOneAndUpdate(
    {
      clientId: context.clientId,
      bucket,
      $or: [
        { lastRefillAt: null },
        { lastRefillAt: { $lt: new Date(Date.now() - REFILL_COOLDOWN_MS) } },
      ],
    },
    { $set: { lastRefillAt: new Date() }, $setOnInsert: { options: [] } },
    { upsert: true, new: true },
  ).lean();

  if (!claimed) {
    // Another task refilled within the cooldown window.
    return;
  }

  const batch = await generateCustomerReviewBatch(
    toGenerationContext(context, bucketToRating(bucket)),
    POOL_TARGET,
  );

  if (!batch.length) {
    return;
  }

  await ReviewOptionPool.findOneAndUpdate(
    { clientId: context.clientId, bucket },
    { $set: { options: batch, lastRefillAt: new Date() } },
    { upsert: true },
  );
}

// Ensure every bucket has a healthy, fresh pool. Called in the background when
// a public page is viewed, so the first tap already has options waiting.
export async function warmReviewPools(context: PublicReviewContext): Promise<void> {
  await connectToDatabase();

  const pools = (await ReviewOptionPool.find({
    clientId: context.clientId,
  }).lean()) as unknown as Array<{
    bucket: ReviewPoolBucket;
    options?: string[];
    updatedAt?: Date;
    lastRefillAt?: Date | null;
  }>;

  const byBucket = new Map(pools.map((pool) => [pool.bucket, pool]));

  for (const bucket of REVIEW_POOL_BUCKETS) {
    const pool = byBucket.get(bucket);
    const count = pool?.options?.length ?? 0;
    const needsRefill = count < POOL_MIN || isStale(pool?.updatedAt);

    if (needsRefill && isCooledDown(pool?.lastRefillAt)) {
      await refillBucket(context, bucket).catch(() => {});
    }
  }
}
