import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { createCashfreeSubscription } from "@/lib/services/cashfree-service";
import { markPendingSubscriptionForUser } from "@/lib/services/billing-service";
import { validateBillingSelection, validatePhone } from "@/lib/validators";
import { connectToDatabase } from "@/lib/db";
import { resolveAppOrigin } from "@/lib/request-origin";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const session = await requireApiUser();
    const appUrl = resolveAppOrigin(request);
    const body = (await request.json()) as {
      tier?: string;
      interval?: string;
      phone?: string;
    };
    const selection = validateBillingSelection(body);
    const phone = validatePhone(body.phone || "");

    await connectToDatabase();

    const user = (await User.findById(session.userId).lean()) as
      | {
          email: string;
          name?: string;
        }
      | null;

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const checkout = await createCashfreeSubscription({
      userId: session.userId,
      email: user.email,
      name: user.name?.trim() || user.email.split("@")[0] || "Review Machine User",
      phone,
      tier: selection.tier,
      interval: selection.interval,
      appUrl,
    });

    await markPendingSubscriptionForUser({
      userId: session.userId,
      tier: selection.tier,
      interval: selection.interval,
      phone,
      cashfreeSubscriptionId: checkout.subscription_id,
      cashfreeCfSubscriptionId: checkout.cf_subscription_id,
      cashfreeSubscriptionStatus: checkout.subscription_status,
    });

    return NextResponse.json({
      subscriptionId: checkout.subscription_id,
      subsSessionId: checkout.subscription_session_id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start checkout.";

    console.error("Billing checkout error:", error);

    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 400 },
    );
  }
}
