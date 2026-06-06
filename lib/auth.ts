import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";
import { getRoleHomePath } from "@/lib/auth-redirect";
import { ensureUserForSupabaseUser } from "@/lib/services/user-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type UserRole } from "@/types";

const AUTH_COOKIE = "review_funnel_session";
const SESSION_TTL = 60 * 60 * 24 * 7;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }

  return new TextEncoder().encode(secret);
}

export type SessionUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export async function signSession(payload: SessionUser) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL}s`)
    .sign(getJwtSecret());
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  const email = String(payload.email || "");

  return {
    userId: String(payload.userId || ""),
    email,
    role: payload.role === "admin" || isAdminEmail(email) ? "admin" : "client",
  } satisfies SessionUser;
}

export async function setAuthCookie(session: SessionUser) {
  const token = await signSession(session);
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const { user: appUser } = await ensureUserForSupabaseUser(user);
        const role = resolveUserRole(appUser);

        return {
          userId: appUser._id.toString(),
          email: appUser.email,
          role,
        } satisfies SessionUser;
      }
    } catch {
      // Fall back to the legacy JWT session when Supabase is not available.
    }
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isAdminEmail(email: string) {
  const configuredEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => normalizeEmail(value))
    .filter(Boolean);

  return configuredEmails.includes(normalizeEmail(email));
}

export function resolveUserRole(user: { email: string; role?: string | null }): UserRole {
  if (user.role === "admin" || isAdminEmail(user.email)) {
    return "admin";
  }

  return "client";
}

export function getPostLoginRedirectPath(role: UserRole) {
  return getRoleHomePath(role);
}

export async function requireUser() {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  return session;
}

export async function requireClientUser() {
  const session = await requireUser();

  if (session.role === "admin") {
    redirect("/admin");
  }

  return session;
}

export async function requireAdminUser() {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}

export async function requireApiUser() {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  if (session.role !== "client") {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireApiAdminUser() {
  const session = await getSession();

  if (!session?.userId || session.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return session;
}
