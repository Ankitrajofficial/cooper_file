import { NextResponse } from "next/server";
import { requireApiAdminUser } from "@/lib/auth";
import { deleteClientAsAdmin } from "@/lib/services/admin-service";

type RouteContext = {
  params: Promise<{
    clientId: string;
  }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    await requireApiAdminUser();
    const { clientId } = await context.params;
    const client = await deleteClientAsAdmin(clientId);

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete client.";

    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 400 },
    );
  }
}
