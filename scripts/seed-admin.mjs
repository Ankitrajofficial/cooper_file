import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
const password = process.env.SEED_ADMIN_PASSWORD;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

if (!password) {
  throw new Error("Missing SEED_ADMIN_PASSWORD environment variable.");
}

const userSchema = new mongoose.Schema(
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
      default: "client",
    },
    subscriptionTier: {
      type: String,
      default: "none",
    },
    subscriptionInterval: {
      type: String,
      default: "monthly",
    },
    subscriptionStatus: {
      type: String,
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
      default: "none",
    },
    pendingSubscriptionInterval: {
      type: String,
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
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const hashedPassword = await bcrypt.hash(password, 12);

await mongoose.connect(mongoUri, {
  bufferCommands: false,
});

await User.collection.updateOne(
  { email: email.trim().toLowerCase() },
  {
    $set: {
      password: hashedPassword,
      name: "Test Admin",
      role: "admin",
    },
    $setOnInsert: {
      email: email.trim().toLowerCase(),
      image: "",
      phone: "",
      subscriptionTier: "none",
      subscriptionInterval: "monthly",
      subscriptionStatus: "inactive",
      subscriptionAutoRenew: false,
      subscriptionCurrentPeriodStart: null,
      subscriptionCurrentPeriodEnd: null,
      pendingSubscriptionTier: "none",
      pendingSubscriptionInterval: "monthly",
      lastPaymentAt: null,
      cashfreeCustomerId: "",
      cashfreeSubscriptionId: "",
      cashfreeCfSubscriptionId: "",
      cashfreeSubscriptionStatus: "",
      createdAt: new Date(),
    },
  },
  {
    upsert: true,
  },
);

await mongoose.disconnect();

console.log("Test admin ready:");
console.log(`Email: ${email}`);
console.log(`Password: ${password}`);
