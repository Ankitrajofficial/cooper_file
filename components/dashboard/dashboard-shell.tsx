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
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/70 bg-white/85 px-5 py-4 shadow-panel backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <BrandLogo theme="dark" />
              <div>
                <Link href="/dashboard" className="block text-2xl font-bold text-ink">
                  Client command center
                </Link>
                <p className="mt-1 text-sm text-slate-500">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/clients/new"
                className="inline-flex items-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Add Client
              </Link>
              <LogoutButton />
            </div>
          </div>
          <div className="mt-4 lg:hidden">
            <DashboardNav />
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-8">
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-4">
            <DashboardNav />
            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-panel backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Tips
              </p>
              <h3 className="mt-3 text-lg font-semibold text-ink">
                Share one link per client
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Generate fresh review scripts, copy the public page URL, and send it
                directly to students or guests after their stay.
              </p>
            </div>
          </div>
        </aside>
        <section className="min-w-0">{children}</section>
      </main>
    </div>
  );
}
