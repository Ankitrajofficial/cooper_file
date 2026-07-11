import { NextResponse, after } from "next/server";
import {
  getPublicClientBySlug,
  incrementClientViewBySlug,
} from "@/lib/services/client-service";
import { warmReviewPools } from "@/lib/services/review-pool-service";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  const tracked = await incrementClientViewBySlug(slug, request);

  if (!tracked) {
    return NextResponse.json({ error: "Review link not found." }, { status: 404 });
  }

  // Warm the review pools in the background so the first star tap is instant.
  after(async () => {
    const payload = await getPublicClientBySlug(slug).catch(() => null);

    if (payload?.status === "active") {
      await warmReviewPools({
        clientId: payload.client.id,
        businessName: payload.client.businessName,
        city: payload.client.city,
        sector: payload.client.sector,
        industry: payload.client.industry,
        businessDescription: payload.client.businessDescription,
      }).catch(() => {});
    }
  });

  return NextResponse.json({ success: true });
}
