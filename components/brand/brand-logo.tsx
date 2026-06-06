import type { Route } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
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
      <BrandMark compact={compact} className="transition-transform duration-200 group-hover:scale-105" />
      <div>
        <p
          className={cn(
            "text-sm font-bold tracking-tight",
            theme === "dark" ? "text-ink" : "text-white",
          )}
        >
          Cooperfile
        </p>
        {!compact ? (
          <p
            className={cn(
              "text-[11px] font-medium",
              theme === "dark" ? "text-slate-500" : "text-slate-400",
            )}
          >
            Review automation
          </p>
        ) : null}
      </div>
    </Link>
  );
}
