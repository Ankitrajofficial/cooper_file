import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Subscription plan management is currently disabled." },
    { status: 410 },
  );
}
