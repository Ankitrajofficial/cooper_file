import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell, LegalSection } from "@/components/site/legal-page-shell";
import { legalConfig } from "@/lib/legal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Legal Center | ${legalConfig.brandName}`,
  description: `Review legal, privacy, refund, delivery, and contact policies for ${legalConfig.brandName}.`,
};

const policyLinks = [
  {
    href: "/terms-and-conditions",
    label: "Terms and Conditions",
    description: "Account usage, acceptable use, free-tier limits, and service terms.",
  },
  {
    href: "/privacy-policy",
    label: "Privacy Policy",
    description: "How account, business, usage, and support information is handled.",
  },
  {
    href: "/refunds-and-cancellations",
    label: "Refunds and Cancellations",
    description: "Account cancellation and refund handling for the current free product.",
  },
  {
    href: "/shipping-and-delivery",
    label: "Shipping and Delivery",
    description: "How digital access, dashboard features, and review links are delivered.",
  },
  {
    href: "/contact-us",
    label: "Contact Us",
    description: "Support, grievance, compliance, and legal communication details.",
  },
] as const;

export default function LegalCenterPage() {
  return (
    <LegalPageShell
      title="Legal Center"
      description={`Review the legal and policy pages for ${legalConfig.brandName}, a product of ${legalConfig.parentCompany}.`}
    >
      <LegalSection title="1. Product and Business Information">
        <p>{legalConfig.productAttribution}</p>
        <p>
          Legal entity: {legalConfig.legalEntity}. Website: {legalConfig.websiteUrl}.
        </p>
      </LegalSection>

      <LegalSection title="2. Policies">
        <div className="grid gap-3 sm:grid-cols-2">
          {policyLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 transition hover:border-brand/30 hover:bg-white"
            >
              <span className="text-sm font-bold text-slate-950">{link.label}</span>
              <span className="mt-1 block text-sm leading-6 text-slate-500">
                {link.description}
              </span>
            </Link>
          ))}
        </div>
      </LegalSection>

      <LegalSection title="3. Current Free Tier">
        <p>
          {legalConfig.brandName} currently allows free users to create 2 review links per month
          and generate up to 100 review scripts per link.
        </p>
        <p>Effective date: {formatDate(legalConfig.effectiveDate)}</p>
      </LegalSection>
    </LegalPageShell>
  );
}
