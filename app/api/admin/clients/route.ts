import { NextResponse } from "next/server";
import { requireApiAdminUser } from "@/lib/auth";
import { sendLinkCreatedEmail } from "@/lib/services/email-service";
import { createClientForUserAsAdmin } from "@/lib/services/admin-service";
import { validateClientInput } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    await requireApiAdminUser();
    const origin = new URL(request.url).origin;
    const body = (await request.json()) as Record<string, unknown> & {
      ownerEmail?: string;
    };

    if (!body.ownerEmail || typeof body.ownerEmail !== "string") {
      throw new Error("Owner email is required.");
    }

    const input = validateClientInput(body as any);
    const client = await createClientForUserAsAdmin({
      ownerEmail: body.ownerEmail,
      input,
    });
    const publicReviewUrl = `${origin}/review/${client.slug}`;

    try {
      await sendLinkCreatedEmail({
        email: body.ownerEmail,
        businessName: client.businessName,
        publicReviewUrl,
      });
    } catch {
      // Email should not block admin link creation.
    }

    return NextResponse.json(
      {
        client: {
          id: client._id.toString(),
          slug: client.slug,
          publicReviewUrl,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create client.";

    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 400 },
    );
  }
}
