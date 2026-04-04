import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import {
  deleteClientForUser,
  getClientForUser,
  updateClientForUser,
} from "@/lib/services/client-service";
import { validateClientInput } from "@/lib/validators";

type RouteContext = {
  params: Promise<{
    clientId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const user = await requireApiUser();
    const { clientId } = await context.params;
    const client = await getClientForUser(user.userId, clientId);

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to fetch client.",
      },
      { status: 401 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser();
    const { clientId } = await context.params;
    const body = await request.json();
    const input = validateClientInput(body);
    const client = await updateClientForUser(user.userId, clientId, input);

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update client.";

    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 400 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const user = await requireApiUser();
    const { clientId } = await context.params;
    const client = await deleteClientForUser(user.userId, clientId);

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to delete client.",
      },
      { status: 401 },
    );
  }
}

