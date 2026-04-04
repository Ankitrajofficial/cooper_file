import { ClientForm } from "@/components/clients/client-form";
import { requireUser } from "@/lib/auth";
import { getBillingSummaryForUser } from "@/lib/services/billing-service";

export default async function NewClientPage() {
  const user = await requireUser();
  const billing = await getBillingSummaryForUser(user.userId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-ink">Add client</h1>
        <p className="mt-2 text-slate-600">
          Save a business profile and instantly create a slug-based public review page.
        </p>
      </div>
      <ClientForm mode="create" maxExpiryDate={billing.currentPeriodEnd} />
    </div>
  );
}
