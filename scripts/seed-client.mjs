import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const email = process.env.SEED_CLIENT_EMAIL || "client@example.com";
const password = process.env.SEED_CLIENT_PASSWORD;
const mongoUri = process.env.MONGODB_URI;
const now = new Date();
const currentPeriodEnd = new Date(now);

currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

if (!mongoUri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

if (!password) {
  throw new Error("Missing SEED_CLIENT_PASSWORD environment variable.");
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
    name: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      default: "client",
    },
  },
  {
    strict: false,
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
      name: "Test Client",
      role: "client",
      subscriptionTier: "free",
      subscriptionInterval: "monthly",
      subscriptionStatus: "active",
      subscriptionAutoRenew: false,
      subscriptionCurrentPeriodStart: now,
      subscriptionCurrentPeriodEnd: currentPeriodEnd,
      pendingSubscriptionTier: "none",
      pendingSubscriptionInterval: "monthly",
      cashfreeSubscriptionStatus: "FREE_ACTIVE",
    },
    $setOnInsert: {
      email: email.trim().toLowerCase(),
      image: "",
      phone: "9876543210",
      lastPaymentAt: now,
      cashfreeCustomerId: "",
      cashfreeSubscriptionId: "",
      cashfreeCfSubscriptionId: "",
      createdAt: now,
    },
  },
  {
    upsert: true,
  },
);

await mongoose.disconnect();

console.log("Test client ready:");
console.log(`Email: ${email}`);
console.log(`Password: ${password}`);
