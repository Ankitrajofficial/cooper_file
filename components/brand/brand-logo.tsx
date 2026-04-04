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
  return (
    <Link href={href} className={cn("group flex items-center gap-3", className)}>
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.2)] transition-transform duration-200 group-hover:scale-105">
        <Image
          src="/review-machine-logo.png"
          alt="Review Machine logo"
          width={compact ? 40 : 48}
          height={compact ? 40 : 48}
          className={cn(
            "object-cover",
            compact ? "h-10 w-10" : "h-11 w-11 sm:h-12 sm:w-12",
          )}
        />
      </div>
      <div>
        <p
          className={cn(
            "text-sm font-bold tracking-tight",
            theme === "dark" ? "text-ink" : "text-white",
          )}
        >
          Review Machine
        </p>
        {!compact ? (
          <p
            className={cn(
              "text-[11px] font-medium",
              theme === "dark" ? "text-slate-500" : "text-slate-400",
            )}
          >
            AI Review Funnels
          </p>
        ) : null}
      </div>
    </Link>
  );
}
