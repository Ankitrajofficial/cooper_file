import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  compact?: boolean;
  href?: Route;
  theme?: "light" | "dark";
  className?: string;
};

export function BrandLogo({
  compact = false,
  href = "/",
  theme = "light",
  className,
}: BrandLogoProps) {
  const titleClassName =
    theme === "dark"
      ? "text-sm font-semibold uppercase tracking-[0.2em] text-brand"
      : "text-sm font-semibold uppercase tracking-[0.2em] text-brand-light";
  const subtitleClassName =
    theme === "dark" ? "text-xs text-slate-500" : "text-xs text-slate-300";

  return (
    <Link href={href} className={cn("flex items-center gap-3", className)}>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_14px_30px_-16px_rgba(15,23,42,0.55)]">
        <Image
          src="/review-machine-logo.png"
          alt="Review Machine logo"
          width={compact ? 52 : 64}
          height={compact ? 52 : 64}
          className="h-12 w-12 object-cover sm:h-14 sm:w-14"
          priority
        />
      </div>
      <div>
        <p className={titleClassName}>Review Machine</p>
        {!compact ? (
          <p className={subtitleClassName}>AI Review Funnel for local businesses</p>
        ) : null}
      </div>
    </Link>
  );
}
