import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { legalConfig, legalPlaceholdersPresent } from "@/lib/legal";
import { formatDate } from "@/lib/utils";

type LegalPageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function LegalPageShell({
  title,
  description,
  children,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="hero-gradient relative overflow-hidden pb-12">
        <div className="absolute inset-0 premium-grid opacity-30" />
        <div className="absolute left-[15%] top-[5%] h-[340px] w-[340px] rounded-full bg-brand/[0.08] blur-[90px]" />
        <div className="absolute right-[12%] top-[16%] h-[260px] w-[260px] rounded-full bg-cyan-500/[0.08] blur-[80px]" />

        <div className="relative z-10">
          <SiteHeader compact />

          <div className="mx-auto max-w-4xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
            >
              <span aria-hidden="true">←</span>
              Back to home
            </Link>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              {description}
            </p>
          </div>
        </div>
      </section>

      <main className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {legalPlaceholdersPresent ? (
            <section className="rounded-2xl border border-amber-200/80 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Replace the bracketed placeholders in
              {" "}
              <code>lib/legal.ts</code>
              {" "}
              before going live so the policies show your real business details.
            </section>
          ) : null}

          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] sm:p-10">
            <div className="mb-8 border-b border-slate-200/80 pb-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand">
                Legal Information
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Last updated: {formatDate(legalConfig.effectiveDate)}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">
                {legalConfig.productAttribution}
              </p>
            </div>

            <div className="space-y-8">{children}</div>
          </section>
        </div>
      </main>

      <SiteFooter showMarketingLinks={false} />
    </div>
  );
}

type LegalSectionProps = {
  title: string;
  children: ReactNode;
};

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-7 text-slate-600 sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}
