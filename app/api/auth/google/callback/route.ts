import { NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import {
  clearGoogleOauthCookies,
  exchangeGoogleCode,
  validateGoogleOauthState,
  verifyGoogleIdToken,
} from "@/lib/google-auth";
import { resolveAppOrigin } from "@/lib/request-origin";
import User from "@/models/User";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const appUrl = resolveAppOrigin(request);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  try {
    if (oauthError) {
      throw new Error("Google sign-in was cancelled or denied.");
    }

    if (!code) {
      throw new Error("Missing Google authorization code.");
    }

    const nonce = await validateGoogleOauthState(state);
    const idToken = await exchangeGoogleCode(code, appUrl);
    const profile = await verifyGoogleIdToken(idToken, nonce);

    await connectToDatabase();

    let user = await User.findOne({
      $or: [{ googleId: profile.sub }, { email: profile.email.toLowerCase() }],
    });

    if (!user) {
      user = await User.create({
        email: profile.email.toLowerCase(),
        googleId: profile.sub,
        name: profile.name || "",
        image: profile.picture || "",
        password: null,
      });
    } else {
      user.email = profile.email.toLowerCase();
      user.googleId = user.googleId || profile.sub;
      user.name = profile.name || user.name || "";
      user.image = profile.picture || user.image || "";
      await user.save();
    }

    await setAuthCookie({
      userId: user._id.toString(),
      email: user.email,
    });
    await clearGoogleOauthCookies();

    return NextResponse.redirect(new URL("/dashboard", appUrl));
  } catch (error) {
    await clearGoogleOauthCookies();

    const message =
      error instanceof Error ? error.message : "Google sign-in failed.";

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, appUrl),
    );
  }
}
