import { NextResponse, after } from "next/server";
import { getPublicClientBySlug } from "@/lib/services/client-service";
import {
  refillBucket,
  serveReviewOptions,
} from "@/lib/services/review-pool-service";

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

    // Serve instantly from the pre-generated pool; only the very first tap on a
    // fresh link pays for a live AI call.
    const reviewContext = {
      clientId: payload.client.id,
      businessName: payload.client.businessName,
      city: payload.client.city,
      sector: payload.client.sector,
      industry: payload.client.industry,
      businessDescription: payload.client.businessDescription,
    };

    const { options, bucket, shouldRefill } = await serveReviewOptions(
      reviewContext,
      rating,
    );

    // Top the pool back up after the response is sent, so it never blocks the
    // customer and the next taps stay instant with fresh wording.
    if (shouldRefill) {
      after(() => refillBucket(reviewContext, bucket).catch(() => {}));
    }

    return NextResponse.json(
      { reviews: options },
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
