export const legalConfig = {
  brandName: "Review Engine",
  legalEntity: "Ankit Raj",
  websiteUrl: "Website URL will be updated soon",
  supportEmail: "Email will be updated soon",
  supportPhone: "+91-6283464174",
  businessAddress: "MSME Registered Business, India",
  grievanceContact: "Ankit Raj · +91-6283464174",
  msmeStatus: "MSME Registered",
  udyamNo: "UDYAM-PB-11-0045976",
  jurisdiction: "India",
  effectiveDate: "2026-04-05",
} as const;

export const legalPlaceholdersPresent = Object.values(legalConfig).some((value) =>
  value.includes("[add "),
);
