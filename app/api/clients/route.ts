import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import {
  createClientForUser,
  listClientsForUser,
} from "@/lib/services/client-service";
import { validateClientInput } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireApiUser();
    const clients = await listClientsForUser(user.userId);

    return NextResponse.json({ clients });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const input = validateClientInput(body);
    const client = await createClientForUser(user.userId, input);

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

