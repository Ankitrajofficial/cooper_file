import { BrandLogo } from "@/components/brand/brand-logo";
import { LogoutButton } from "@/components/dashboard/logout-button";

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-5">
            <BrandLogo theme="dark" compact />
            <div className="hidden sm:block">
              <p className="text-lg font-bold tracking-tight text-ink">Admin Panel</p>
              <p className="text-xs text-slate-500">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand-dark">
              Full control access
            </div>
            <LogoutButton redirectTo="/admin/login" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
