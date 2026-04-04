import { NextResponse } from "next/server";

function appendIfPresent(
  params: URLSearchParams,
  key: string,
  value: string | null | undefined,
) {
  if (value) {
    params.set(key, value);
  }
}

async function buildRedirectUrl(request: Request, bodyParams?: URLSearchParams) {
  const incomingUrl = new URL(request.url);
  const redirectUrl = new URL("/dashboard/billing/confirm", incomingUrl.origin);
  const allParams = new URLSearchParams(incomingUrl.search);

  if (bodyParams) {
    for (const [key, value] of bodyParams.entries()) {
      if (!allParams.has(key) && value) {
        allParams.set(key, value);
      }
    }
  }

  appendIfPresent(
    redirectUrl.searchParams,
    "subscription_id",
    allParams.get("subscription_id") || allParams.get("cf_subscription_id"),
  );
  appendIfPresent(
    redirectUrl.searchParams,
    "cf_subscription_id",
    allParams.get("cf_subscription_id"),
  );
  appendIfPresent(
    redirectUrl.searchParams,
    "cf_status",
    allParams.get("cf_status") || allParams.get("subscription_status"),
  );
  appendIfPresent(redirectUrl.searchParams, "cf_message", allParams.get("cf_message"));

  return redirectUrl;
}

export async function GET(request: Request) {
  const redirectUrl = await buildRedirectUrl(request);

  return NextResponse.redirect(redirectUrl);
}

export async function POST(request: Request) {
  let bodyParams = new URLSearchParams();
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    bodyParams = new URLSearchParams(await request.text());
  } else if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        bodyParams.set(key, value);
      }
    }
  }

  const redirectUrl = await buildRedirectUrl(request, bodyParams);

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
