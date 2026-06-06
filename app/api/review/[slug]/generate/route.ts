import { NextResponse } from "next/server";
import { getPublicClientBySlug } from "@/lib/services/client-service";
import { buildRatingReviewOptions } from "@/lib/services/review-service";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function parseRating(value: unknown) {
  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Please choose a star rating from 1 to 5.");
  }

  return rating;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = (await request.json()) as { rating?: unknown };
    const rating = parseRating(body.rating);
    const payload = await getPublicClientBySlug(slug);

    if (!payload) {
      return NextResponse.json(
        { error: "Review link not found." },
        { status: 404 },
      );
    }

    if (payload.status === "expired") {
      return NextResponse.json(
        { error: "This review link is not active right now." },
        { status: 410 },
      );
    }

    const reviews = buildRatingReviewOptions({
      businessName: payload.client.businessName,
      city: payload.client.city,
      sector: payload.client.sector,
      industry: payload.client.industry,
      businessDescription: payload.client.businessDescription,
      rating,
    });

    return NextResponse.json(
      { reviews },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate review options.";

    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }
}
