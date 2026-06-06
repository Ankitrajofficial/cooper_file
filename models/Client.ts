import { Schema, model, models, type InferSchemaType } from "mongoose";
import { CLIENT_EXPIRY_MODES } from "@/types";

const clientSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    sector: {
      type: String,
      required: true,
      trim: true,
      default: "General Business",
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    businessDescription: {
      type: String,
      trim: true,
      default: "",
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    expiryMode: {
      type: String,
      enum: CLIENT_EXPIRY_MODES,
      default: "subscription",
    },
    googleReviewLink: {
      type: String,
      required: true,
      trim: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    lastClickedAt: {
      type: Date,
      default: null,
    },
    lastViewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  },
);

clientSchema.index({ userId: 1, createdAt: -1 });

export type ClientDocument = InferSchemaType<typeof clientSchema> & {
  _id: string;
};

const Client = models.Client || model("Client", clientSchema);

export default Client;
