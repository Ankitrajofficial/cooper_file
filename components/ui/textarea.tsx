import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-sm font-medium text-[var(--on-surface-variant)]">{label}</span>
      ) : null}
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-xl border-0 bg-[var(--surface-highest,#e0e3e5)] px-4 py-3 text-sm text-[var(--on-surface)] shadow-none outline-none transition-all duration-200 placeholder:text-[var(--outline)] hover:bg-[var(--surface-container)] focus:bg-[var(--surface-card)] focus:shadow-[0_0_0_2px_rgba(0,131,120,0.3)] focus:ring-0",
          className,
        )}
        {...props}
      />
    </label>
  ),
);

Textarea.displayName = "Textarea";
