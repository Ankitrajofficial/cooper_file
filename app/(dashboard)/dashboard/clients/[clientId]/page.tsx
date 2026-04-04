import { notFound } from "next/navigation";
import { ClientForm } from "@/components/clients/client-form";
import { requireClientUser } from "@/lib/auth";
import { getBillingSummaryForUser } from "@/lib/services/billing-service";
import { getClientForUser } from "@/lib/services/client-service";

type EditClientPageProps = {
  params: Promise<{
    clientId: string;
  }>;
};

export default async function EditClientPage({ params }: EditClientPageProps) {
  const user = await requireClientUser();
  const { clientId } = await params;
  const [billing, client] = await Promise.all([
    getBillingSummaryForUser(user.userId),
    getClientForUser(user.userId, clientId),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-ink">Edit client</h1>
        <p className="mt-2 text-slate-600">
          Update business details, review link, and AI review generation inputs.
        </p>
      </div>
      <ClientForm
        mode="edit"
        clientId={client.id}
        initialData={{
          businessName: client.businessName,
          city: client.city,
          sector: client.sector,
          industry: client.industry,
          businessDescription: client.businessDescription,
          expiresAt: client.expiresAt?.slice(0, 10) || "",
          googleReviewLink: client.googleReviewLink,
        }}
        maxExpiryDate={billing.currentPeriodEnd}
      />
    </div>
  );
}
