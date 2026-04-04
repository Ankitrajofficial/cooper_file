import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();

  return <AdminShell email={user.email}>{children}</AdminShell>;
}
