import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "teal" | "amber" | "slate" | "brand";

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-gradient-to-br from-brand/12 to-brand/6 text-brand-dark",
  teal: "bg-gradient-to-br from-teal-50 to-teal-100/80 text-teal-800",
  amber:
    "bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-800",
  slate:
    "bg-gradient-to-br from-slate-50 to-slate-100/80 text-slate-700",
  brand:
    "bg-gradient-to-br from-brand/10 to-brand/5 text-brand-dark",
};

export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ghost-border",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
