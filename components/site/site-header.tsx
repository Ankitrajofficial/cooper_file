import Link from "next/link";
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
  return (
    <header className="sticky top-0 z-30 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-full border border-white/15 bg-white/10 px-4 py-3 shadow-panel backdrop-blur-xl sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo compact={compact} />

          {!compact && !authenticated ? (
            <nav className="hidden items-center gap-7 lg:flex">
              <a
                href="#features"
                className="text-sm font-medium text-slate-300 transition hover:text-white"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-slate-300 transition hover:text-white"
              >
                How it works
              </a>
              <a
                href="#proof"
                className="text-sm font-medium text-slate-300 transition hover:text-white"
              >
                Proof
              </a>
              <a
                href="#preview"
                className="text-sm font-medium text-slate-300 transition hover:text-white"
              >
                Preview
              </a>
            </nav>
          ) : null}

          <div className="flex items-center gap-2">
            {authenticated ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 hover:text-white"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
