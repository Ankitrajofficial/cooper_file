import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell, LegalSection } from "@/components/site/legal-page-shell";
import { legalConfig } from "@/lib/legal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Contact Us | ${legalConfig.brandName}`,
  description:
    `Find support, account, and compliance contact details for ${legalConfig.brandName}.`,
};

export default function ContactUsPage() {
  return (
    <LegalPageShell
      title="Contact Us"
      description={`Use this page for support, account, cancellation, grievance, and legal communication related to ${legalConfig.brandName}.`}
    >
      <LegalSection title="1. Support and Account Contact">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5">
          <p>
            <span className="font-semibold text-slate-900">Product:</span>{" "}
            {legalConfig.brandName}, a product of {legalConfig.parentCompany}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Business name:</span>{" "}
            {legalConfig.legalEntity}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Website:</span>{" "}
            {legalConfig.websiteUrl}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Support email:</span>{" "}
            {legalConfig.supportEmail}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Support phone:</span>{" "}
            {legalConfig.supportPhone}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Registered address:</span>{" "}
            {legalConfig.businessAddress}
          </p>
          <p>
            <span className="font-semibold text-slate-900">MSME status:</span>{" "}
            {legalConfig.msmeStatus}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Udyam number:</span>{" "}
            {legalConfig.udyamNo}
          </p>
        </div>
      </LegalSection>

      <LegalSection title="2. Grievance and Compliance Contact">
        <p>
          For complaints, compliance notices, or policy-related requests, contact:
          {" "}
          {legalConfig.grievanceContact}
        </p>
      </LegalSection>

      <LegalSection title="3. What to Include in Your Message">
        <ul className="list-disc space-y-2 pl-5">
          <li>your full name and registered email address;</li>
          <li>account, link, or transaction reference, if relevant;</li>
          <li>a short description of the issue or request;</li>
          <li>supporting screenshots or timeline details where useful.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Related Policies">
        <p>
          You can also review our
          {" "}
          <Link href="/terms-and-conditions" className="font-medium text-brand hover:underline">
            Terms and Conditions
          </Link>
          ,
          {" "}
          <Link href="/privacy-policy" className="font-medium text-brand hover:underline">
            Privacy Policy
          </Link>
          ,
          {" "}
          <Link
            href="/refunds-and-cancellations"
            className="font-medium text-brand hover:underline"
          >
            Refunds and Cancellations
          </Link>
          , and
          {" "}
          <Link
            href="/shipping-and-delivery"
            className="font-medium text-brand hover:underline"
          >
            Shipping and Delivery
          </Link>
          .
        </p>
        <p>Effective date: {formatDate(legalConfig.effectiveDate)}</p>
      </LegalSection>
    </LegalPageShell>
  );
}
