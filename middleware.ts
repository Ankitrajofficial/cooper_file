import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getRoleHomePath } from "@/lib/auth-redirect";

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
  const session = await getSessionPayload(request);
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = Boolean(session?.userId);
  const isAdmin = session?.role === "admin";
  const homePath = getRoleHomePath(isAdmin ? "admin" : "client");

  function buildAuthRedirect(path: "/login" | "/admin/login") {
    const redirectUrl = new URL(path, request.url);
    const nextPath = `${pathname}${search}`;

    if (nextPath && nextPath !== "/" && nextPath !== path) {
      redirectUrl.searchParams.set("next", nextPath);
    }

    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return buildAuthRedirect("/login");
  }

  if (pathname.startsWith("/dashboard") && isAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !isAuthenticated) {
    return buildAuthRedirect("/admin/login");
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if ((pathname === "/login" || pathname === "/signup" || pathname === "/admin/login") && isAuthenticated) {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/signup"],
};
