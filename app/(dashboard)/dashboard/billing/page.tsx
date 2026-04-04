import { BillingPageClient } from "@/components/billing/billing-page-client";
import { requireClientUser } from "@/lib/auth";
import { BILLING_PLANS } from "@/lib/billing";
import { getCashfreeMode, isCashfreeConfigured } from "@/lib/services/cashfree-service";
import { getBillingSummaryForUser } from "@/lib/services/billing-service";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await requireClientUser();
  const summary = await getBillingSummaryForUser(user.userId);

  return (
    <BillingPageClient
      summary={summary}
      plans={BILLING_PLANS}
      cashfreeMode={getCashfreeMode()}
      cashfreeConfigured={isCashfreeConfigured()}
    />
  );
}
