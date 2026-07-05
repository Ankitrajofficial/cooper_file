import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { SiteHeader } from "@/components/site/site-header";
import { getCookieSession, getPostLoginRedirectPath } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  // Must match middleware's JWT-cookie source of truth, not the Supabase
  // session — otherwise a Supabase-session-without-JWT loops here forever.
  const session = await getCookieSession();

  if (session) {
    redirect(getPostLoginRedirectPath(session.role));
  }

  return (
    <div className="hero-gradient relative min-h-screen overflow-x-hidden">
      <div className="absolute inset-0 premium-grid opacity-20" />
      <div className="absolute left-[20%] top-[15%] h-[400px] w-[400px] rounded-full bg-brand/[0.06] blur-[100px]" />
      <div className="absolute right-[15%] bottom-[20%] h-[300px] w-[300px] rounded-full bg-cyan-500/[0.05] blur-[80px]" />

      <SiteHeader compact showGetStartedButton={false} />
      <main className="relative flex items-center justify-center px-4 pb-16 pt-8">
        <AuthForm mode="signup" />
      </main>
    </div>
  );
}
