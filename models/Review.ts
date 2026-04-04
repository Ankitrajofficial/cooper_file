import { Schema, model, models, type InferSchemaType } from "mongoose";
import { REVIEW_CATEGORIES } from "@/types";

const reviewSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: REVIEW_CATEGORIES,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

reviewSchema.index({ clientId: 1, category: 1 });

export type ReviewDocument = InferSchemaType<typeof reviewSchema> & {
  _id: string;
};

const Review = models.Review || model("Review", reviewSchema);

export default Review;

