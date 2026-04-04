import { NextResponse } from "next/server";
import { createGoogleAuthorizationUrl } from "@/lib/google-auth";

export async function GET(request: Request) {
  try {
    const appUrl = new URL(request.url).origin;
    const url = await createGoogleAuthorizationUrl(appUrl);
    return NextResponse.redirect(url);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start Google sign-in.";

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, request.url),
    );
  }
}
