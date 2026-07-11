import { Schema, model, models, type InferSchemaType } from "mongoose";

// Pre-generated, ready-to-serve customer review options grouped by rating
// bucket, so a public star tap can return instantly instead of waiting on a
// live AI call. Buckets mirror the tone branches in ai-service:
//   high -> 4-5 stars, mid -> 3 stars, low -> 1-2 stars.
export const REVIEW_POOL_BUCKETS = ["high", "mid", "low"] as const;

export type ReviewPoolBucket = (typeof REVIEW_POOL_BUCKETS)[number];

const reviewOptionPoolSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    bucket: {
      type: String,
      enum: REVIEW_POOL_BUCKETS,
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    // Set whenever a background refill starts, used to avoid refill stampedes.
    lastRefillAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

reviewOptionPoolSchema.index({ clientId: 1, bucket: 1 }, { unique: true });

export type ReviewOptionPoolDocument = InferSchemaType<
  typeof reviewOptionPoolSchema
> & {
  _id: string;
};

const ReviewOptionPool =
  models.ReviewOptionPool || model("ReviewOptionPool", reviewOptionPoolSchema);

export default ReviewOptionPool;
