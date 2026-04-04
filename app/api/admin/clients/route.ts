import { NextResponse } from "next/server";
import { requireApiAdminUser } from "@/lib/auth";
import { createClientForUserAsAdmin } from "@/lib/services/admin-service";
import { validateClientInput } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    await requireApiAdminUser();
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

    return NextResponse.json(
      {
        client: {
          id: client._id.toString(),
          slug: client.slug,
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
