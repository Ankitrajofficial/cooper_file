"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedProps> & {
    href?: undefined;
  };

type ButtonAsLink = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SharedProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const sizeStyles = {
  sm: "px-3.5 py-2 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-base gap-2.5",
};

const variantStyles = {
  primary:
    "bg-gradient-to-br from-brand to-[#0891b2] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(13,148,136,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_20px_-4px_rgba(13,148,136,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(0,0,0,0.1)] focus-visible:ring-brand/30",
  secondary:
    "bg-[var(--surface-card)] text-[var(--on-surface)] ghost-border shadow-ambient hover:bg-[var(--surface-low)] hover:shadow-ambient-hover hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[var(--outline-variant)]/50",
  ghost:
    "bg-transparent text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)] focus-visible:ring-[var(--outline-variant)]/50",
  danger:
    "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(225,29,72,0.35),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(225,29,72,0.4)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-rose-300/50",
};

const baseStyles =
  "inline-flex transform-gpu items-center justify-center rounded-xl font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";

export const Button = forwardRef<HTMLButtonElement & HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const {
      className,
      variant = "primary",
      size = "md",
      fullWidth,
      children,
      ...rest
    } = props;

    const classes = cn(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      fullWidth && "w-full",
      className,
    );

    // When an href is provided, render the link itself styled as a button.
    // Nesting a <button> inside an <a>/<Link> is invalid HTML and breaks
    // navigation on a native click in Chromium-based browsers.
    if (typeof props.href === "string") {
      const { href, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
        href: string;
      };
      const isInternal = href.startsWith("/") && !href.startsWith("//");

      if (isInternal) {
        return (
          <Link ref={ref} href={href as Route} className={classes} {...anchorProps}>
            {children}
          </Link>
        );
      }

      return (
        <a ref={ref} href={href} className={classes} {...anchorProps}>
          {children}
        </a>
      );
    }

    const { type = "button", ...buttonProps } =
      rest as ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button ref={ref} type={type} className={classes} {...buttonProps}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
