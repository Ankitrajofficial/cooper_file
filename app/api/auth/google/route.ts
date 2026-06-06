import { NextResponse } from "next/server";
import { createGoogleAuthorizationUrl } from "@/lib/google-auth";
import { resolveAppOrigin } from "@/lib/request-origin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const appUrl = resolveAppOrigin(request);

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${appUrl}/api/auth/supabase/callback`,
        },
      });

      if (error || !data.url) {
        throw new Error(error?.message || "Unable to start Supabase Google sign-in.");
      }

      return NextResponse.redirect(data.url);
    }

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
