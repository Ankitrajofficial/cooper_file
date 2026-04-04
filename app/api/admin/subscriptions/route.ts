import { NextResponse } from "next/server";
import { requireApiAdminUser } from "@/lib/auth";
import { setSubscriptionForUserAsAdmin } from "@/lib/services/admin-service";
import { BILLING_INTERVALS, SUBSCRIPTION_TIERS } from "@/types";

export async function POST(request: Request) {
  try {
    await requireApiAdminUser();
    const body = (await request.json()) as {
      userId?: string;
      tier?: string;
      interval?: string;
    };

    if (!body.userId?.trim()) {
      throw new Error("User is required.");
    }

    if (!SUBSCRIPTION_TIERS.includes((body.tier || "") as any)) {
      throw new Error("Choose a valid subscription tier.");
    }

    if (!BILLING_INTERVALS.includes((body.interval || "") as any)) {
      throw new Error("Choose a valid billing interval.");
    }

    await setSubscriptionForUserAsAdmin({
      userId: body.userId,
      tier: body.tier as any,
      interval: body.interval as any,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update subscription.";

    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 400 },
    );
  }
}
