import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { updateBillingContactForUser } from "@/lib/services/billing-service";
import { validatePhone } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = (await request.json()) as { phone?: string };
    const phone = validatePhone(body.phone || "");

    await updateBillingContactForUser(user.userId, phone);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update billing contact.";

    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 400 },
    );
  }
}
