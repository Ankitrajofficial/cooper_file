import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getRoleHomePath } from "@/lib/auth-redirect";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseMiddlewareUser } from "@/lib/supabase/middleware";

const AUTH_COOKIE = "review_funnel_session";

async function getSessionPayload(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const email = String(payload.email || "");
    const configuredAdminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    return {
      userId: String(payload.userId || ""),
      role:
        payload.role === "admin" ||
        configuredAdminEmails.includes(email.trim().toLowerCase())
          ? "admin"
          : "client",
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();
  let session = await getSessionPayload(request);

  if (isSupabaseConfigured()) {
    try {
      const result = await getSupabaseMiddlewareUser(request);
      response = result.response;

      if (result.user?.email) {
        const configuredAdminEmails = (process.env.ADMIN_EMAILS || "")
          .split(",")
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean);

        session = {
          userId: result.user.id,
          role: configuredAdminEmails.includes(result.user.email.toLowerCase())
            ? "admin"
            : "client",
        };
      }
    } catch {
      // Keep the legacy JWT session path available when Supabase is not ready.
    }
  }

  const { pathname, search } = request.nextUrl;
  const isAuthenticated = Boolean(session?.userId);
  const isAdmin = session?.role === "admin";
  const homePath = getRoleHomePath(isAdmin ? "admin" : "client");

  function withSupabaseCookies(targetResponse: NextResponse) {
    response.cookies.getAll().forEach((cookie) => {
      targetResponse.cookies.set(cookie);
    });

    return targetResponse;
  }

  function buildAuthRedirect(path: "/login") {
    const redirectUrl = new URL(path, request.url);
    const nextPath = `${pathname}${search}`;

    if (nextPath && nextPath !== "/" && nextPath !== path) {
      redirectUrl.searchParams.set("next", nextPath);
    }

    return withSupabaseCookies(NextResponse.redirect(redirectUrl));
  }

  if (pathname === "/admin/login") {
    return withSupabaseCookies(NextResponse.redirect(new URL("/login", request.url)));
  }

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return buildAuthRedirect("/login");
  }

  if (pathname.startsWith("/dashboard") && isAdmin) {
    return withSupabaseCookies(NextResponse.redirect(new URL("/admin", request.url)));
  }

  if (pathname.startsWith("/admin") && !isAuthenticated) {
    return buildAuthRedirect("/login");
  }

  if (pathname.startsWith("/admin") && !isAdmin) {
    return withSupabaseCookies(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  if ((pathname === "/login" || pathname === "/signup") && isAuthenticated) {
    return withSupabaseCookies(NextResponse.redirect(new URL(homePath, request.url)));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/signup"],
};
