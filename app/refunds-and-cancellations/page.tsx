import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/site/legal-page-shell";
import { legalConfig } from "@/lib/legal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Refunds and Cancellations | ${legalConfig.brandName}`,
  description:
    `Read the cancellation and refund policy for ${legalConfig.brandName}.`,
};

export default function RefundsAndCancellationsPage() {
  return (
    <LegalPageShell
      title="Refunds and Cancellations"
      description={`This policy explains account cancellation and refund handling for ${legalConfig.brandName}.`}
    >
      <LegalSection title="1. No Paid Subscription Billing Currently">
        <p>
          {legalConfig.brandName} is currently offered as a free review-link tool with free-tier
          usage limits. We do not currently collect recurring subscription charges through the
          product.
        </p>
      </LegalSection>

      <LegalSection title="2. Account Cancellation">
        <p>
          You may stop using the service at any time. You can also contact us through the Contact
          Us page to request account closure or data deletion, subject to applicable legal and
          operational retention requirements.
        </p>
        <p>
          Closing an account may remove access to review links, QR codes, generated scripts, and
          dashboard history associated with that account.
        </p>
      </LegalSection>

      <LegalSection title="3. Refund Policy">
        <p>
          Because paid subscription billing is currently disabled, there are usually no subscription
          fees to refund.
        </p>
        <p>
          If any manual, accidental, duplicate, or unauthorized payment is made to us, refund
          requests will be reviewed case by case. Approval may depend on transaction records,
          service usage, and the reason for the request.
        </p>
      </LegalSection>

      <LegalSection title="4. Situations Where Refunds May Be Considered">
        <ul className="list-disc space-y-2 pl-5">
          <li>duplicate or accidental payment made to us;</li>
          <li>an incorrect charge caused by a confirmed system error;</li>
          <li>an unauthorized transaction, subject to verification;</li>
          <li>any other case where a refund is required by applicable law.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Situations Where Refunds Are Usually Not Provided">
        <ul className="list-disc space-y-2 pl-5">
          <li>non-use of free features;</li>
          <li>requests where no payment was collected by us;</li>
          <li>issues caused by third-party services outside our reasonable control;</li>
          <li>requests that cannot be verified with transaction records.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Requesting a Refund">
        <p>
          To request a refund, contact us through the Contact Us page with your registered email
          address, transaction reference if available, payment date, and a short explanation of the
          issue.
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
