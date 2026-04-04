export const BUSINESS_SECTORS = [
  "Hotel",
  "Hostel",
  "Restaurant",
  "Cafe",
  "Doctor Clinic",
  "Education",
  "Fitness Gym",
  "Salon Spa",
  "Retail Shop",
  "Real Estate",
  "General Business",
] as const;

export type BusinessSector = (typeof BUSINESS_SECTORS)[number];

export const REVIEW_CATEGORIES = [
  "General",
  "Study Environment",
  "Safety",
  "Food",
  "Service Quality",
  "Staff & Support",
  "Cleanliness",
  "Comfort",
  "Treatment Experience",
  "Ambience",
  "Value",
] as const;

export type ReviewCategory = (typeof REVIEW_CATEGORIES)[number];

export const SUBSCRIPTION_TIERS = [
  "none",
  "tier_1",
  "tier_2",
  "tier_3",
] as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export const USER_ROLES = ["client", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const BILLING_INTERVALS = ["monthly", "yearly"] as const;

export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export const SUBSCRIPTION_STATUSES = [
  "inactive",
  "pending",
  "active",
  "past_due",
  "expired",
  "cancelled",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const CLIENT_EXPIRY_MODES = ["subscription", "custom"] as const;

export type ClientExpiryMode = (typeof CLIENT_EXPIRY_MODES)[number];

export type ClientFormInput = {
  businessName: string;
  city: string;
  sector?: BusinessSector | "";
  industry?: string;
  businessDescription?: string;
  expiresAt?: string;
  googleReviewLink: string;
};

export type ReviewSeed = {
  category: ReviewCategory;
  text: string;
};

export type DashboardClient = {
  id: string;
  slug: string;
  businessName: string;
  city: string;
  sector: BusinessSector;
  industry: string;
  businessDescription: string;
  expiresAt: string | null;
  expiryMode: ClientExpiryMode;
  isExpired: boolean;
  googleReviewLink: string;
  clickCount: number;
  reviewCount: number;
  createdAt: string;
};

export type PublicClientPayload = {
  id: string;
  businessName: string;
  city: string;
  sector: BusinessSector;
  industry: string;
  businessDescription: string;
  expiresAt: string | null;
  googleReviewLink: string;
  slug: string;
  clickCount: number;
};

export type PublicClientAvailability =
  | {
      status: "active";
      client: PublicClientPayload;
      reviews: Array<{
        id: string;
        category: ReviewCategory;
        text: string;
      }>;
    }
  | {
      status: "expired";
      client: Pick<PublicClientPayload, "businessName" | "city" | "sector" | "slug">;
      reason: "link_expired" | "subscription_inactive";
      expiredAt?: string | null;
    };

export type BillingPlan = {
  tier: Exclude<SubscriptionTier, "none">;
  name: string;
  monthlyPriceInr: number;
  yearlyPriceInr: number;
  clientLimit: number | null;
  reviewsPerLink: number | null;
  description: string;
  highlights: string[];
};

export type BillingSummary = {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  interval: BillingInterval;
  autoRenew: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  activeClientCount: number;
  clientLimit: number | null;
  canCreateClient: boolean;
  phone: string;
  pendingTier: SubscriptionTier;
  pendingInterval: BillingInterval;
  cashfreeSubscriptionId: string;
  cashfreeSubscriptionStatus: string;
  lastPaymentAt: string | null;
};
