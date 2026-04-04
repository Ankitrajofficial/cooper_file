import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { LogoutButton } from "@/components/dashboard/logout-button";

export function DashboardShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-5">
            <BrandLogo theme="dark" compact />
            <div className="hidden sm:block">
              <Link
                href="/dashboard"
                className="text-lg font-bold tracking-tight text-ink"
              >
                Dashboard
              </Link>
              <p className="text-xs text-slate-500">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-brand to-brand-dark px-4 py-2 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(13,148,136,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(13,148,136,0.45)]"
            >
              <svg
                className="h-4 w-4"
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
              Add Client
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="border-b border-slate-200/80 px-4 py-2 sm:px-6 lg:hidden lg:px-8">
        <DashboardNav />
      </div>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:py-8">
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <DashboardNav />
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Quick tip
              </p>
              <h3 className="mt-2 text-sm font-semibold text-ink">
                Share one link per client
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Generate fresh review scripts, copy the public page URL, and
                send it directly to customers after their visit.
              </p>
            </div>
          </div>
        </aside>
        <section className="min-w-0">{children}</section>
      </main>
    </div>
  );
}
