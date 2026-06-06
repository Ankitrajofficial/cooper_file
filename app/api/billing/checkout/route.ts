import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Paid subscriptions are currently disabled." },
    { status: 410 },
  );
}
