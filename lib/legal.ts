export const legalConfig = {
  brandName: "Cooperfile",
  parentCompany: "AR Group",
  productAttribution: "Cooperfile is a product of AR Group.",
  legalEntity: "Ankit Raj",
  websiteUrl: "https://cooperfile.com",
  supportEmail: "support@cooperfile.com",
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
