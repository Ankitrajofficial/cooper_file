import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { FREE_REVIEWS_PER_LINK } from "@/lib/free-tier";
import { getClientForUser } from "@/lib/services/client-service";
import { generateReviewsForClient } from "@/lib/services/ai-service";

type RouteContext = {
  params: Promise<{
    clientId: string;
  }>;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    const user = await requireApiUser();
    const { clientId } = await context.params;
    const client = await getClientForUser(user.userId, clientId);

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    // Grok (xAI) only — generateReviewsForClient reads REVIEW_AI_PROVIDER and
    // handles the review delete/insert plus the client update internally. It
    // caps the count at 50, so the free-tier target is passed through as-is.
    const count = await generateReviewsForClient({
      clientId: client.id,
      businessName: client.businessName,
      city: client.city,
      sector: client.sector,
      industry: client.industry,
      businessDescription: client.businessDescription,
      count: FREE_REVIEWS_PER_LINK,
    });

    return NextResponse.json({
      success: true,
      count,
      message: `${count} AI review scripts generated.`,
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
