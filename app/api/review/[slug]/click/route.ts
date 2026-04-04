import { NextResponse } from "next/server";
import { incrementClientClickBySlug } from "@/lib/services/client-service";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(_: Request, context: RouteContext) {
  const { slug } = await context.params;

  await incrementClientClickBySlug(slug);

  return NextResponse.json({ success: true });
}

