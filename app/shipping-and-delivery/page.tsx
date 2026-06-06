import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/site/legal-page-shell";
import { legalConfig } from "@/lib/legal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Shipping and Delivery | ${legalConfig.brandName}`,
  description:
    `Read how delivery and access works for ${legalConfig.brandName} digital services.`,
};

export default function ShippingAndDeliveryPage() {
  return (
    <LegalPageShell
      title="Shipping and Delivery"
      description={`${legalConfig.brandName} is a digital service. This page explains how account access and feature delivery work.`}
    >
      <LegalSection title="1. Nature of Delivery">
        <p>
          {legalConfig.brandName} is a cloud-based software product. We do not ship physical goods.
          All service delivery happens digitally through your account dashboard and related service
          workflows.
        </p>
      </LegalSection>

      <LegalSection title="2. Access Timeline">
        <p>
          In most cases, account access begins shortly after sign-up, authentication, and account
          setup are completed.
        </p>
        <p>
          In some situations, activation may be delayed while account verification, system setup, or
          security checks are being completed.
        </p>
      </LegalSection>

      <LegalSection title="3. Delivery Method">
        <p>
          Access is delivered through your registered account on {legalConfig.websiteUrl}. Once
          active, eligible users can use the dashboard, create review links, download QR codes, and
          use free-tier features available in the product.
        </p>
      </LegalSection>

      <LegalSection title="4. Service Availability">
        <p>
          We aim to keep the platform available on a continuous basis, but service availability may
          occasionally be affected by maintenance, upgrades, infrastructure issues, third-party
          outages, or events beyond reasonable control.
        </p>
      </LegalSection>

      <LegalSection title="5. Failed or Delayed Delivery">
        <p>
          If account access is not activated within a reasonable time after sign-up, please contact
          us with your registered email so we can investigate.
        </p>
      </LegalSection>

      <LegalSection title="6. Contact">
        <p>
          For delivery or activation issues, contact {legalConfig.legalEntity} using the details on
          the Contact Us page.
        </p>
        <p>Effective date: {formatDate(legalConfig.effectiveDate)}</p>
      </LegalSection>
    </LegalPageShell>
  );
}
