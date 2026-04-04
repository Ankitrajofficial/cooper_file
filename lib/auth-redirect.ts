import { type UserRole } from "@/types";

export function getRoleHomePath(role: UserRole) {
  return role === "admin" ? "/admin" : "/dashboard";
}

function normalizeLocalPath(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  return trimmed;
}

export function resolveSafePostAuthRedirect(
  candidate: string | null | undefined,
  role: UserRole,
  fallbackPath = getRoleHomePath(role),
) {
  const normalizedCandidate = normalizeLocalPath(candidate);

  if (!normalizedCandidate) {
    return fallbackPath;
  }

  if (role === "admin") {
    return normalizedCandidate.startsWith("/admin") ? normalizedCandidate : fallbackPath;
  }

  return normalizedCandidate.startsWith("/admin") ? fallbackPath : normalizedCandidate;
}
