import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/site/legal-page-shell";
import { legalConfig } from "@/lib/legal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Terms and Conditions | ${legalConfig.brandName}`,
  description:
    `Read the terms and conditions governing use of ${legalConfig.brandName} and its subscription services.`,
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPageShell
      title="Terms and Conditions"
      description={`These terms govern your access to ${legalConfig.brandName}, including account usage, subscription billing, and acceptable use of the platform.`}
    >
      <LegalSection title="1. Acceptance of Terms">
        <p>
          By accessing or using {legalConfig.brandName}, you agree to be bound by these Terms and
          Conditions, our Privacy Policy, and our Refunds and Cancellations Policy.
        </p>
        <p>
          If you do not agree with any part of these terms, please do not use the service.
        </p>
      </LegalSection>

      <LegalSection title="2. Service Overview">
        <p>
          {legalConfig.brandName} is a software service that helps businesses create AI-assisted
          review funnels, manage review links, and organize client-facing review experiences.
        </p>
        <p>
          We may update, improve, suspend, or remove parts of the service from time to time to
          maintain performance, security, or compliance.
        </p>
      </LegalSection>

      <LegalSection title="3. Eligibility and Accounts">
        <p>
          You agree to provide accurate registration and billing information and to keep your login
          credentials secure.
        </p>
        <p>
          You are responsible for all activity carried out through your account, including activity
          by team members, contractors, or other authorized users.
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable Use">
        <p>You agree not to use the service to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>violate any law, regulation, or third-party right;</li>
          <li>upload deceptive, abusive, harmful, or infringing content;</li>
          <li>attempt unauthorized access, reverse engineer, or disrupt the platform;</li>
          <li>generate or distribute fraudulent, misleading, or spam-like review content.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Billing, Subscriptions, and Auto-Renewal">
        <p>
          Paid plans are billed in advance on a recurring monthly or yearly basis, depending on the
          plan you select.
        </p>
        <p>
          By starting a paid subscription, you authorize recurring charges through our payment
          partner until you cancel before the next renewal date.
        </p>
        <p>
          Subscription status, renewal timing, and payment handling may depend on third-party
          payment infrastructure and successful authorization.
        </p>
      </LegalSection>

      <LegalSection title="6. Third-Party Services">
        <p>
          Certain functionality may rely on third-party services, including payment processors,
          authentication providers, cloud infrastructure, AI providers, and external review
          platforms.
        </p>
        <p>
          Your use of those services may also be subject to their respective terms and privacy
          policies.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual Property">
        <p>
          The platform, branding, software, interface design, and related content are owned by or
          licensed to {legalConfig.legalEntity} and are protected by applicable intellectual
          property laws.
        </p>
        <p>
          We grant you a limited, non-exclusive, revocable right to use the service for your
          internal business purposes while your account remains active and compliant.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimer of Warranties">
        <p>
          The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not guarantee
          uninterrupted access, error-free operation, or any specific business result, ranking
          outcome, or review conversion rate.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, {legalConfig.legalEntity} will not be liable for
          indirect, incidental, special, consequential, or punitive damages, or for loss of data,
          revenue, profits, goodwill, or business opportunities arising from your use of the
          service.
        </p>
      </LegalSection>

      <LegalSection title="10. Suspension and Termination">
        <p>
          We may suspend or terminate access if we reasonably believe your account is being used in
          violation of these terms, poses security risk, or creates legal exposure for the service
          or other users.
        </p>
        <p>
          You may stop using the service at any time. Cancellation of a subscription will generally
          apply from the next billing cycle unless otherwise required by law.
        </p>
      </LegalSection>

      <LegalSection title="11. Governing Law">
        <p>
          These terms are governed by the laws of {legalConfig.jurisdiction}. Any disputes shall be
          subject to the courts having jurisdiction over {legalConfig.jurisdiction}, unless
          otherwise required by applicable law.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          For questions about these terms, contact us using the details on the Contact Us page.
        </p>
        <p>Effective date: {formatDate(legalConfig.effectiveDate)}</p>
      </LegalSection>
    </LegalPageShell>
  );
}
