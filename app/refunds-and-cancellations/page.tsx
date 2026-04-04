import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/site/legal-page-shell";
import { legalConfig } from "@/lib/legal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Refunds and Cancellations | ${legalConfig.brandName}`,
  description:
    `Read the cancellation and refund policy for ${legalConfig.brandName} subscriptions and recurring billing.`,
};

export default function RefundsAndCancellationsPage() {
  return (
    <LegalPageShell
      title="Refunds and Cancellations"
      description={`This policy explains how subscription cancellations, renewals, and refund requests are handled for ${legalConfig.brandName}.`}
    >
      <LegalSection title="1. Subscription Billing">
        <p>
          {legalConfig.brandName} is offered as a recurring subscription service. Charges are billed
          in advance for the selected monthly or yearly billing period.
        </p>
      </LegalSection>

      <LegalSection title="2. Cancellation Policy">
        <p>
          You may cancel your subscription before the next billing date to stop future renewals.
          Cancellation does not normally reverse charges already processed for the current billing
          cycle.
        </p>
        <p>
          Unless otherwise stated, access remains available until the end of the paid billing period
          already completed.
        </p>
      </LegalSection>

      <LegalSection title="3. Refund Policy">
        <p>
          Subscription fees are generally non-refundable once a billing cycle has started, except
          where required by applicable law or where a charge was duplicated, unauthorized, or caused
          by a confirmed technical error on our side.
        </p>
        <p>
          Refund requests are reviewed case by case. Approval may depend on transaction records,
          service usage, subscription history, and the reason for the request.
        </p>
      </LegalSection>

      <LegalSection title="4. Situations Where Refunds May Be Considered">
        <ul className="list-disc space-y-2 pl-5">
          <li>duplicate billing for the same subscription period;</li>
          <li>an incorrect charge caused by a billing system error;</li>
          <li>an unauthorized transaction, subject to verification;</li>
          <li>any other case where a refund is required by applicable law.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Situations Where Refunds Are Usually Not Provided">
        <ul className="list-disc space-y-2 pl-5">
          <li>partial non-use of the service during an active subscription term;</li>
          <li>change of mind after the current billing cycle has started;</li>
          <li>issues caused by third-party services outside our reasonable control;</li>
          <li>failure to cancel before the next auto-renewal date.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Requesting a Refund">
        <p>
          To request a refund, contact us through the Contact Us page with your registered email
          address, transaction reference, billing date, and a short explanation of the issue.
        </p>
        <p>
          We aim to review valid requests within a reasonable period, although timelines may vary
          depending on payment partner processes and verification requirements.
        </p>
      </LegalSection>

      <LegalSection title="7. Chargebacks">
        <p>
          If you believe a charge is fraudulent, please contact us before initiating a chargeback
          whenever possible so we can investigate and attempt to resolve the issue promptly.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          For cancellation or refund queries, contact {legalConfig.legalEntity} using the details on
          the Contact Us page.
        </p>
        <p>Effective date: {formatDate(legalConfig.effectiveDate)}</p>
      </LegalSection>
    </LegalPageShell>
  );
}
