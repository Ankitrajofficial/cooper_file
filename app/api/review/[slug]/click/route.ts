import { NextResponse } from "next/server";
import { incrementClientClickBySlug } from "@/lib/services/client-service";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  const tracked = await incrementClientClickBySlug(slug, request);

  if (!tracked) {
    return NextResponse.json({ error: "Review link not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
