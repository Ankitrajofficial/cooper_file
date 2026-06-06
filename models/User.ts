import { Schema, model, models, type InferSchemaType } from "mongoose";
import {
  BILLING_INTERVALS,
  SUBSCRIPTION_STATUSES,
  SUBSCRIPTION_TIERS,
  USER_ROLES,
} from "@/types";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    supabaseUserId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
      trim: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "client",
    },
    subscriptionTier: {
      type: String,
      enum: SUBSCRIPTION_TIERS,
      default: "none",
    },
    subscriptionInterval: {
      type: String,
      enum: BILLING_INTERVALS,
      default: "monthly",
    },
    subscriptionStatus: {
      type: String,
      enum: SUBSCRIPTION_STATUSES,
      default: "inactive",
    },
    subscriptionAutoRenew: {
      type: Boolean,
      default: false,
    },
    subscriptionCurrentPeriodStart: {
      type: Date,
      default: null,
    },
    subscriptionCurrentPeriodEnd: {
      type: Date,
      default: null,
    },
    pendingSubscriptionTier: {
      type: String,
      enum: SUBSCRIPTION_TIERS,
      default: "none",
    },
    pendingSubscriptionInterval: {
      type: String,
      enum: BILLING_INTERVALS,
      default: "monthly",
    },
    lastPaymentAt: {
      type: Date,
      default: null,
    },
    cashfreeCustomerId: {
      type: String,
      default: "",
      trim: true,
    },
    cashfreeSubscriptionId: {
      type: String,
      default: "",
      trim: true,
    },
    cashfreeCfSubscriptionId: {
      type: String,
      default: "",
      trim: true,
    },
    cashfreeSubscriptionStatus: {
      type: String,
      default: "",
      trim: true,
    },
    freeLinkQuotaMonth: {
      type: String,
      default: "",
      trim: true,
    },
    freeLinksCreatedThisMonth: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: string;
};

const User = models.User || model("User", userSchema);

export default User;
