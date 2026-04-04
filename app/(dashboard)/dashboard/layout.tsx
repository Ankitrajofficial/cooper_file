import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireClientUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireClientUser();

  return <DashboardShell email={user.email}>{children}</DashboardShell>;
}
