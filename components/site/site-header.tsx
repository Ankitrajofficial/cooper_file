"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  authenticated?: boolean;
  compact?: boolean;
};

export function SiteHeader({
  authenticated = false,
  compact = false,
}: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#proof", label: "Proof" },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/70 px-4 py-2.5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo compact={compact} />

            {!compact && !authenticated ? (
              <nav className="hidden items-center gap-1 lg:flex">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-400 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            ) : null}

            <div className="flex items-center gap-2">
              {authenticated ? (
                <Link href="/dashboard">
                  <Button size="sm">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}

              {/* Mobile menu toggle */}
              {!compact && !authenticated ? (
                <button
                  type="button"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="ml-1 rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
                  aria-label="Toggle navigation"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    {mobileOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              ) : null}
            </div>
          </div>

          {/* Mobile nav */}
          {mobileOpen && !compact && !authenticated ? (
            <nav className="mt-3 flex flex-col gap-1 border-t border-white/[0.06] pt-3 lg:hidden">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
