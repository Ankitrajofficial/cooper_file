import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { SiteHeader } from "@/components/site/site-header";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen pb-10">
      <SiteHeader compact />
      <main className="flex items-center justify-center px-4 py-10">
        <AuthForm mode="login" />
      </main>
    </div>
  );
}
