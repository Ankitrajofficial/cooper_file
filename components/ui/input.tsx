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
        <span className="text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <input
        id={id}
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-brand focus:shadow-[0_0_0_3px_rgba(13,148,136,0.1)] focus:ring-0",
          error &&
            "border-rose-300 focus:border-rose-500 focus:shadow-[0_0_0_3px_rgba(225,29,72,0.1)]",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-sm text-rose-600">{error}</span>
      ) : null}
      {!error && helperText ? (
        <span className="text-xs text-slate-500">{helperText}</span>
      ) : null}
    </label>
  ),
);

Input.displayName = "Input";
