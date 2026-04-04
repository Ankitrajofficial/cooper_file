"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
  children: ReactNode;
};

const styles = {
  primary:
    "bg-gradient-to-r from-brand to-cyan-600 text-white shadow-[0_16px_40px_-20px_rgba(13,148,136,0.75)] hover:-translate-y-0.5 hover:from-brand-dark hover:to-cyan-700 focus-visible:ring-brand/40",
  secondary:
    "bg-white/90 text-ink ring-1 ring-white/60 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] hover:-translate-y-0.5 hover:bg-white focus-visible:ring-slate-300",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100/80 focus-visible:ring-slate-300",
  danger: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-300",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", fullWidth, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
