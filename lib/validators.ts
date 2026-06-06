import {
  BILLING_INTERVALS,
  BUSINESS_SECTORS,
  SUBSCRIPTION_TIERS,
  type PaidSubscriptionTier,
} from "@/types";
import { normalizeExternalUrl } from "@/lib/utils";
import { type ClientFormInput } from "@/types";

export function validateEmail(email: string) {
  const value = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error("Please enter a valid email address.");
  }

  return value;
}

export function validatePassword(password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  return password;
}

export function validatePhone(phone: string) {
  const value = phone.trim();

  if (!/^\d{10}$/.test(value)) {
    throw new Error("Please enter a valid 10-digit phone number.");
  }

  return value;
}

export function validateClientInput(input: ClientFormInput): ClientFormInput {
  const businessName = input.businessName.trim();
  const city = input.city.trim();
  const sector = input.sector?.trim() ?? "";
  const industry = input.industry?.trim() ?? "";
  const businessDescription = input.businessDescription?.trim() ?? "";
  const expiresAt = input.expiresAt?.trim() ?? "";
  const googleReviewLink = normalizeExternalUrl(input.googleReviewLink);

  if (!businessName) {
    throw new Error("Business name is required.");
  }

  if (!city) {
    throw new Error("City is required.");
  }

  if (!googleReviewLink) {
    throw new Error("Google review link is required.");
  }

  try {
    new URL(googleReviewLink);
  } catch {
    throw new Error("Please enter a valid Google review link.");
  }

  if (sector && !BUSINESS_SECTORS.includes(sector as (typeof BUSINESS_SECTORS)[number])) {
    throw new Error("Please choose a valid business sector.");
  }

  if (businessDescription.length > 600) {
    throw new Error("Business description must be 600 characters or fewer.");
  }

  if (expiresAt) {
    const parsedDate = new Date(expiresAt);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Please enter a valid link expiry date.");
    }
  }

  return {
    businessName,
    city,
    sector: sector as ClientFormInput["sector"],
    industry,
    businessDescription,
    expiresAt,
    googleReviewLink,
  };
}

export function validateBillingSelection(input: {
  tier?: string;
  interval?: string;
}) {
  if (
    !SUBSCRIPTION_TIERS.includes((input.tier || "") as any) ||
    input.tier === "none" ||
    input.tier === "free"
  ) {
    throw new Error("Please choose a valid paid subscription tier.");
  }

  if (!BILLING_INTERVALS.includes((input.interval || "") as any)) {
    throw new Error("Please choose a valid billing interval.");
  }

  return {
    tier: input.tier as PaidSubscriptionTier,
    interval: input.interval as (typeof BILLING_INTERVALS)[number],
  };
}
