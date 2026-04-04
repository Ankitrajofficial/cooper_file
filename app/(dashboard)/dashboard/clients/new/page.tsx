import { ClientForm } from "@/components/clients/client-form";
import { requireClientUser } from "@/lib/auth";
import { getBillingSummaryForUser } from "@/lib/services/billing-service";

export default async function NewClientPage() {
  const user = await requireClientUser();
  const billing = await getBillingSummaryForUser(user.userId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-ink">Create link</h1>
        <p className="mt-2 text-slate-600">
          Save a business profile and instantly create a shareable public review link.
        </p>
      </div>
      <ClientForm mode="create" maxExpiryDate={billing.currentPeriodEnd} />
    </div>
  );
}
