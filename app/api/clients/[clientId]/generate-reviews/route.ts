import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { requireActiveSubscriptionForUser } from "@/lib/services/billing-service";
import { generateReviewsForClient } from "@/lib/services/ai-service";
import { getClientForUser } from "@/lib/services/client-service";

type RouteContext = {
  params: Promise<{
    clientId: string;
  }>;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    const user = await requireApiUser();
    await requireActiveSubscriptionForUser(user.userId);
    const { clientId } = await context.params;
    const client = await getClientForUser(user.userId, clientId);

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    const count = await generateReviewsForClient({
      clientId: client.id,
      businessName: client.businessName,
      city: client.city,
      sector: client.sector,
      industry: client.industry,
      businessDescription: client.businessDescription,
      count: 40,
    });

    return NextResponse.json({
      success: true,
      message: `${count} review scripts generated.`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate reviews.";

    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 400 },
    );
  }
}
