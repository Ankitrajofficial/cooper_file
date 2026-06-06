import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { FREE_REVIEWS_PER_LINK } from "@/lib/free-tier";
import Review from "@/models/Review";
import { getClientForUser } from "@/lib/services/client-service";
import { buildScriptedReviews } from "@/lib/services/review-service";

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

    const reviews = buildScriptedReviews({
      businessName: client.businessName,
      city: client.city,
      sector: client.sector,
      industry: client.industry,
      businessDescription: client.businessDescription,
    }, FREE_REVIEWS_PER_LINK);

    await Review.deleteMany({ clientId: client.id });
    await Review.insertMany(
      reviews.map((review) => ({
        clientId: client.id,
        category: review.category,
        text: review.text,
      })),
    );

    return NextResponse.json({
      success: true,
      count: reviews.length,
      message: `${reviews.length} backend review scripts generated.`,
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
