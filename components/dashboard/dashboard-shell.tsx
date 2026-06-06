import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LogoutButton } from "@/components/dashboard/logout-button";

export function DashboardShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--surface-base)]">
      <header className="sticky top-0 z-20 w-full max-w-full overflow-x-clip border-b border-[rgba(188,201,198,0.15)] bg-white/80 px-4 backdrop-blur-xl backdrop-saturate-[1.3] sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 py-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
            <BrandLogo theme="dark" compact className="min-w-0" />
            <div className="hidden sm:block">
              <Link
                href="/dashboard"
                className="text-lg font-bold tracking-tight text-[var(--on-surface)]"
              >
                Client Dashboard
              </Link>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="data-pulse" />
                <p className="text-xs text-[var(--on-surface-variant)]">{email}</p>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap sm:gap-2.5">
            <Link
              href="/dashboard/clients/new"
              className="group inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-br from-brand to-[#0891b2] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(13,148,136,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(13,148,136,0.45),inset_0_1px_0_rgba(255,255,255,0.15)]"
            >
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Create Link
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
