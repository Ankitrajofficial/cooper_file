import { type User as SupabaseUser } from "@supabase/supabase-js";
import { addBillingInterval } from "@/lib/billing";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

function getSupabaseDisplayName(user: SupabaseUser) {
  const metadata = user.user_metadata || {};

  return (
    metadata.full_name ||
    metadata.name ||
    [metadata.first_name, metadata.last_name].filter(Boolean).join(" ") ||
    ""
  );
}

function getSupabaseAvatar(user: SupabaseUser) {
  const metadata = user.user_metadata || {};

  return metadata.avatar_url || metadata.picture || "";
}

export async function ensureUserForSupabaseUser(user: SupabaseUser) {
  await connectToDatabase();

  if (!user.email) {
    throw new Error("Supabase user is missing an email address.");
  }

  const email = user.email.toLowerCase();
  let appUser = await User.findOne({
    $or: [{ supabaseUserId: user.id }, { email }],
  });
  let created = false;

  if (!appUser) {
    const now = new Date();
    created = true;

    appUser = await User.create({
      email,
      supabaseUserId: user.id,
      name: getSupabaseDisplayName(user),
      image: getSupabaseAvatar(user),
      password: null,
      role: "client",
      subscriptionTier: "free",
      subscriptionInterval: "monthly",
      subscriptionStatus: "active",
      subscriptionAutoRenew: false,
      subscriptionCurrentPeriodStart: now,
      subscriptionCurrentPeriodEnd: addBillingInterval(now, "monthly"),
      cashfreeSubscriptionStatus: "FREE_ACTIVE",
    });
  } else {
    appUser.email = email;
    appUser.supabaseUserId = appUser.supabaseUserId || user.id;
    appUser.name = getSupabaseDisplayName(user) || appUser.name || "";
    appUser.image = getSupabaseAvatar(user) || appUser.image || "";
    appUser.password = appUser.password || null;

    if (!appUser.subscriptionTier || appUser.subscriptionTier === "none") {
      const now = new Date();

      appUser.subscriptionTier = "free";
      appUser.subscriptionInterval = "monthly";
      appUser.subscriptionStatus = "active";
      appUser.subscriptionAutoRenew = false;
      appUser.subscriptionCurrentPeriodStart = now;
      appUser.subscriptionCurrentPeriodEnd = addBillingInterval(now, "monthly");
      appUser.cashfreeSubscriptionStatus = "FREE_ACTIVE";
    }

    await appUser.save();
  }

  return {
    user: appUser,
    created,
  };
}
