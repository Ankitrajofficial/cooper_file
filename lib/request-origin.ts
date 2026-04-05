function normalizeOrigin(value: string) {
  return value.replace(/\/$/, "");
}

export function resolveAppOrigin(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost =
    request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (forwardedProto && forwardedHost) {
    return normalizeOrigin(`${forwardedProto}://${forwardedHost}`);
  }

  const requestOrigin = new URL(request.url).origin;

  if (requestOrigin) {
    return normalizeOrigin(requestOrigin);
  }

  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredOrigin) {
    return normalizeOrigin(configuredOrigin);
  }

  return "http://localhost:3000";
}
