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
    <div className="min-h-screen bg-[var(--surface-base)]">
      {/* ─── Glassmorphism header ─── */}
      <header className="sticky top-0 z-20 border-b border-[rgba(188,201,198,0.15)] bg-white/80 px-4 backdrop-blur-xl backdrop-saturate-[1.3] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-5">
            <BrandLogo theme="dark" compact />
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
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard/clients/new"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand to-[#0891b2] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(13,148,136,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(13,148,136,0.45),inset_0_1px_0_rgba(255,255,255,0.15)]"
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

      {/* Mobile nav */}
      <div className="border-b border-[rgba(188,201,198,0.12)] px-4 py-2 sm:px-6 lg:hidden lg:px-8">
        <DashboardNav />
      </div>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-8">
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-5">
            <DashboardNav />

            {/* ─── Quick Tip (Stitch tonal card) ─── */}
            <div className="surface-card p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand/10 to-brand/5">
                  <svg className="h-3.5 w-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--on-surface-variant)]">
                  Quick tip
                </p>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-[var(--on-surface)]">
                Share one link per client
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-[var(--on-surface-variant)]">
                Generate fresh review scripts, copy the public page URL, and
                send it directly to customers after their visit.
              </p>
            </div>

            {/* ─── Keyboard shortcut hint ─── */}
            <div className="rounded-xl bg-[var(--surface-low)] p-4">
              <p className="text-[11px] font-medium text-[var(--on-surface-variant)]">
                Pro tip: Use the AI review generator to create natural-sounding,
                SEO-optimized review scripts tailored to each business.
              </p>
            </div>
          </div>
        </aside>
        <section className="min-w-0">{children}</section>
      </main>
    </div>
  );
}
