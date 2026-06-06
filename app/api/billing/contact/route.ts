import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Billing contact updates are currently disabled." },
    { status: 410 },
  );
}
