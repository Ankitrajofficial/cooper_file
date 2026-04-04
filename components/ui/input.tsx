import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-sm font-medium text-[var(--on-surface-variant)]">{label}</span>
      ) : null}
      <input
        id={id}
        ref={ref}
        className={cn(
          "w-full rounded-xl border-0 bg-[var(--surface-highest,#e0e3e5)] px-4 py-3 text-sm text-[var(--on-surface)] shadow-none outline-none transition-all duration-200 placeholder:text-[var(--outline)] hover:bg-[var(--surface-container)] focus:bg-[var(--surface-card)] focus:shadow-[0_0_0_2px_rgba(0,131,120,0.3)] focus:ring-0",
          error &&
            "bg-rose-50 focus:shadow-[0_0_0_2px_rgba(225,29,72,0.2)]",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-sm text-rose-600">{error}</span>
      ) : null}
      {!error && helperText ? (
        <span className="text-xs text-[var(--on-surface-variant)]">{helperText}</span>
      ) : null}
    </label>
  ),
);

Input.displayName = "Input";
