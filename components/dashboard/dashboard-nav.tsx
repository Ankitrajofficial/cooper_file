"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    description: "Stats and all client funnels",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/clients/new",
    label: "Create Link",
    description: "Create a new review link",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    href: "/dashboard/billing",
    label: "Billing",
    description: "Plans, expiry, and autopay",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden lg:block">
        <div className="surface-card overflow-hidden p-2">
          <p className="px-3 pb-2.5 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--on-surface-variant)]">
            Workspace
          </p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-br from-brand to-[#0891b2] text-white shadow-[0_2px_8px_-2px_rgba(13,148,136,0.4)]"
                      : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-low)] hover:text-[var(--on-surface)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-[var(--surface-container)] text-[var(--outline)] group-hover:bg-brand/10 group-hover:text-brand",
                    )}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p
                      className={cn(
                        "text-[11px] leading-snug",
                        isActive ? "text-white/70" : "text-[var(--outline)]",
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="ml-auto">
                      <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      <nav className="lg:hidden">
        <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-[var(--surface-container)] p-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-white text-[var(--on-surface)] shadow-[0_1px_3px_rgba(25,28,30,0.06)]"
                    : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
