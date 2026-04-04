import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/site/legal-page-shell";
import { legalConfig } from "@/lib/legal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy Policy | Review Machine",
  description:
    "Read how Review Machine collects, uses, stores, and protects personal and business information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      description="This policy explains what information we collect, why we collect it, and how we use and protect it when you use Review Machine."
    >
      <LegalSection title="1. Information We Collect">
        <p>We may collect the following categories of information:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>account information such as name, email address, and login details;</li>
          <li>billing and payment contact information required for subscription setup;</li>
          <li>business profile data, client records, review links, and related workspace content;</li>
          <li>usage, analytics, device, and session information needed to operate and secure the service.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How We Use Information">
        <p>We use personal and business information to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>create and maintain your account;</li>
          <li>deliver subscriptions, billing, and support;</li>
          <li>operate review funnels and related AI-assisted features;</li>
          <li>monitor service performance, prevent misuse, and improve the platform;</li>
          <li>comply with legal, tax, accounting, and security obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Sharing of Information">
        <p>
          We do not sell your personal information. We may share information with trusted service
          providers that help us run the platform, such as payment processors, hosting providers,
          analytics providers, authentication partners, and AI infrastructure providers.
        </p>
        <p>
          We may also disclose information where required by law, to enforce our terms, or to
          protect users, the platform, or the public.
        </p>
      </LegalSection>

      <LegalSection title="4. Payments">
        <p>
          Subscription payments are processed by third-party payment partners. We do not store full
          card details on our own systems unless expressly stated otherwise by an integrated payment
          provider.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies and Session Data">
        <p>
          We may use cookies, tokens, and similar technologies to keep you signed in, secure
          sessions, remember preferences, and understand product usage.
        </p>
      </LegalSection>

      <LegalSection title="6. Data Retention">
        <p>
          We retain information for as long as reasonably necessary to provide the service, comply
          with legal obligations, resolve disputes, and enforce agreements. Retention periods may
          vary depending on the type of data and your subscription status.
        </p>
      </LegalSection>

      <LegalSection title="7. Data Security">
        <p>
          We take reasonable technical and organizational steps to protect information against
          unauthorized access, loss, misuse, or alteration. No method of storage or transmission is
          completely secure, and absolute security cannot be guaranteed.
        </p>
      </LegalSection>

      <LegalSection title="8. Your Choices and Rights">
        <p>
          Subject to applicable law, you may request access to, correction of, or deletion of your
          personal information. You may also contact us to update billing details or request account
          closure.
        </p>
      </LegalSection>

      <LegalSection title="9. Children&apos;s Privacy">
        <p>
          The service is intended for business and professional use and is not directed toward
          children. We do not knowingly collect personal information from children.
        </p>
      </LegalSection>

      <LegalSection title="10. Policy Updates">
        <p>
          We may revise this policy from time to time. Updated versions become effective when posted
          on this page unless a later date is stated.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          For privacy-related questions or requests, contact {legalConfig.legalEntity} through the
          details provided on the Contact Us page.
        </p>
        <p>Effective date: {formatDate(legalConfig.effectiveDate)}</p>
      </LegalSection>
    </LegalPageShell>
  );
}
