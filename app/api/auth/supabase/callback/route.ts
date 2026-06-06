import { NextResponse } from "next/server";
import {
  getPostLoginRedirectPath,
  resolveUserRole,
} from "@/lib/auth";
import { resolveSafePostAuthRedirect } from "@/lib/auth-redirect";
import { resolveAppOrigin } from "@/lib/request-origin";
import { sendWelcomeEmail } from "@/lib/services/email-service";
import { ensureUserForSupabaseUser } from "@/lib/services/user-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const appOrigin = resolveAppOrigin(request);

  try {
    if (!code) {
      throw new Error("Missing Supabase authorization code.");
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw new Error(error.message);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Supabase did not return a signed-in user.");
    }

    const { user: appUser, created } = await ensureUserForSupabaseUser(user);
    const role = resolveUserRole(appUser);

    if (created) {
      try {
        await sendWelcomeEmail(appUser.email);
      } catch {
        // Email should not block login.
      }
    }

    const targetPath = resolveSafePostAuthRedirect(
      next,
      role,
      getPostLoginRedirectPath(role),
    );

    return NextResponse.redirect(new URL(targetPath, appOrigin));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Supabase sign-in failed.";

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, appOrigin),
    );
  }
}
