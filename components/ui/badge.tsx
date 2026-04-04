import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "teal" | "amber" | "slate" | "brand";

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-gradient-to-b from-brand-light to-brand-light/80 text-brand-dark border border-brand/10",
  teal: "bg-gradient-to-b from-teal-50 to-teal-100/80 text-teal-800 border border-teal-200/50",
  amber:
    "bg-gradient-to-b from-amber-50 to-amber-100/80 text-amber-800 border border-amber-200/50",
  slate:
    "bg-gradient-to-b from-slate-50 to-slate-100/80 text-slate-700 border border-slate-200/50",
  brand:
    "bg-gradient-to-b from-brand/10 to-brand/5 text-brand-dark border border-brand/15",
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
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
