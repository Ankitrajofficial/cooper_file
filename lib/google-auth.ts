import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify } from "jose";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS_URL = new URL("https://www.googleapis.com/oauth2/v3/certs");
const OAUTH_STATE_COOKIE = "google_oauth_state";
const OAUTH_NONCE_COOKIE = "google_oauth_nonce";
const COOKIE_TTL = 60 * 10;

type GoogleIdTokenClaims = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  nonce?: string;
};

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Google OAuth configuration. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    );
  }

  return {
    clientId,
    clientSecret,
  };
}

export function getGoogleCallbackUrl(appUrl: string) {
  return `${appUrl}/api/auth/google/callback`;
}

function createOauthSecret() {
  return crypto.randomUUID().replaceAll("-", "");
}

export async function setGoogleOauthCookies(state: string, nonce: string) {
  const cookieStore = await cookies();

  for (const [name, value] of [
    [OAUTH_STATE_COOKIE, state],
    [OAUTH_NONCE_COOKIE, nonce],
  ] as const) {
    cookieStore.set(name, value, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_TTL,
    });
  }
}

export async function clearGoogleOauthCookies() {
  const cookieStore = await cookies();

  for (const name of [OAUTH_STATE_COOKIE, OAUTH_NONCE_COOKIE]) {
    cookieStore.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }
}

export async function createGoogleAuthorizationUrl(appUrl: string) {
  const { clientId } = getGoogleConfig();
  const state = createOauthSecret();
  const nonce = createOauthSecret();

  await setGoogleOauthCookies(state, nonce);

  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", getGoogleCallbackUrl(appUrl));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "select_account");

  return url.toString();
}

export async function validateGoogleOauthState(receivedState: string | null) {
  const cookieStore = await cookies();
  const storedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  const storedNonce = cookieStore.get(OAUTH_NONCE_COOKIE)?.value;

  if (!receivedState || !storedState || receivedState !== storedState || !storedNonce) {
    throw new Error("Google sign-in session expired. Please try again.");
  }

  return storedNonce;
}

export async function exchangeGoogleCode(code: string, appUrl: string) {
  const { clientId, clientSecret } = getGoogleConfig();

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleCallbackUrl(appUrl),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Google token exchange failed.");
  }

  const payload = (await response.json()) as {
    id_token?: string;
  };

  if (!payload.id_token) {
    throw new Error("Google did not return an ID token.");
  }

  return payload.id_token;
}

export async function verifyGoogleIdToken(idToken: string, nonce: string) {
  const { clientId } = getGoogleConfig();
  const JWKS = createRemoteJWKSet(GOOGLE_JWKS_URL);
  const { payload } = await jwtVerify(idToken, JWKS, {
    audience: clientId,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });

  const claims = payload as unknown as GoogleIdTokenClaims;

  if (claims.nonce !== nonce) {
    throw new Error("Google sign-in nonce validation failed.");
  }

  if (!claims.email || !claims.sub) {
    throw new Error("Google account data is incomplete.");
  }

  if (!claims.email_verified) {
    throw new Error("Please use a Google account with a verified email address.");
  }

  return claims;
}
