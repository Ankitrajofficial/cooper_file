"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    description: "Stats and all client funnels",
  },
  {
    href: "/dashboard/clients/new",
    label: "Add Client",
    description: "Create a new review funnel",
  },
  {
    href: "/dashboard/billing",
    label: "Billing",
    description: "Plans, expiry, and autopay",
  },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden lg:block">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-4 shadow-panel backdrop-blur">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Workspace
          </p>
          <div className="mt-4 space-y-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-2xl px-4 py-3 transition",
                    isActive
                      ? "bg-brand text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      isActive ? "text-white/80" : "text-slate-500",
                    )}
                  >
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <nav className="lg:hidden">
        <div className="flex gap-3 overflow-x-auto rounded-2xl border border-white/70 bg-white/90 p-2 shadow-sm backdrop-blur">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-brand text-white"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
