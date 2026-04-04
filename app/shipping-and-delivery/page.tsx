import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/site/legal-page-shell";
import { legalConfig } from "@/lib/legal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping and Delivery | Review Machine",
  description:
    "Read how delivery and access works for Review Machine digital subscription services.",
};

export default function ShippingAndDeliveryPage() {
  return (
    <LegalPageShell
      title="Shipping and Delivery"
      description="Review Machine is a digital service. This page explains how subscription access and feature delivery work after payment."
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
          In most cases, subscription access or activation begins shortly after successful payment
          authorization and confirmation from our payment partner.
        </p>
        <p>
          In some situations, activation may be delayed while payment status, subscription setup, or
          account verification is being completed.
        </p>
      </LegalSection>

      <LegalSection title="3. Delivery Method">
        <p>
          Access is delivered through your registered account on {legalConfig.websiteUrl}. Once
          active, eligible users can use the dashboard, create review links, and access subscription
          features associated with their selected plan.
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
          If payment has been completed but access is not activated within a reasonable time, please
          contact us with your payment reference and registered email so we can investigate.
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
