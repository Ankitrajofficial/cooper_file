"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: ReactNode;
};

const sizeStyles = {
  sm: "px-3.5 py-2 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-base gap-2.5",
};

const variantStyles = {
  primary:
    "bg-gradient-to-b from-brand to-brand-dark text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(13,148,136,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_20px_-4px_rgba(13,148,136,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(0,0,0,0.1)] focus-visible:ring-brand/30",
  secondary:
    "bg-white text-ink border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-slate-50 hover:border-slate-300/80 hover:shadow-[0_2px_8px_-2px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-slate-300/50",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:ring-slate-300/50",
  danger:
    "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(225,29,72,0.35)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(225,29,72,0.4)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-rose-300/50",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50",
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
