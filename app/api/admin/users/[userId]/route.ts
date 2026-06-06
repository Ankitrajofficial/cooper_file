import { NextResponse } from "next/server";
import { requireApiAdminUser } from "@/lib/auth";
import { deleteClientUserAsAdmin } from "@/lib/services/admin-service";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    await requireApiAdminUser();
    const { userId } = await context.params;
    const result = await deleteClientUserAsAdmin(userId);

    if (!result) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete user.";

    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 400 },
    );
  }
}
