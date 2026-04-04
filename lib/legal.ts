export const legalConfig = {
  brandName: "Review Machine",
  legalEntity: "[add your legal business name]",
  websiteUrl:
    process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL
      : "[add your production website URL]",
  supportEmail: "[add your support email]",
  supportPhone: "[add your support phone number]",
  businessAddress: "[add your registered business address]",
  grievanceContact: "[add your grievance or compliance contact]",
  jurisdiction: "India",
  effectiveDate: "2026-04-05",
} as const;

export const legalPlaceholdersPresent = Object.values(legalConfig).some((value) =>
  value.includes("[add "),
);
