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
    <div className="min-h-screen bg-[#0c1324]">
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[15%] top-[5%] h-[500px] w-[500px] rounded-full bg-brand/[0.04] blur-[120px]" />
        <div className="absolute right-[10%] top-[30%] h-[400px] w-[400px] rounded-full bg-cyan-500/[0.03] blur-[100px]" />
        <div className="absolute bottom-[10%] left-[40%] h-[350px] w-[350px] rounded-full bg-violet-500/[0.03] blur-[100px]" />
      </div>

      {/* Glassmorphism header */}
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0c1324]/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-5">
            <BrandLogo theme="light" compact />
            <div className="hidden sm:block">
              <p className="text-lg font-bold tracking-tight text-white">
                Admin Panel
              </p>
              <p className="text-xs text-slate-400">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-brand/20 bg-brand/[0.08] px-3.5 py-1.5 text-xs font-semibold text-brand-muted">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
              </span>
              Full control access
            </div>
            <LogoutButton redirectTo="/login" />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
