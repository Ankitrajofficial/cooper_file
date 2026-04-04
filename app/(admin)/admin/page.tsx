import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { getAdminOverview } from "@/lib/services/admin-service";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const overview = await getAdminOverview();

  return <AdminDashboardClient overview={overview} />;
}
