"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gov-blue text-gov-white hover:bg-gov-blue-dark " +
    "font-semibold border border-gov-blue hover:border-gov-blue-dark shadow-sm",

  secondary:
    "bg-gov-white text-gov-blue hover:bg-gov-bg " +
    "font-semibold border border-gov-blue",

  outline:
    "bg-transparent text-gov-blue hover:bg-gov-blue-light " +
    "font-semibold border border-gov-blue",

  ghost:
    "bg-transparent text-gov-blue hover:bg-gov-blue-light " +
    "font-medium border border-transparent",

  danger:
    "bg-gov-error text-gov-white hover:bg-red-700 " +
    "font-semibold border border-gov-error",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8  px-3 text-sm  gap-1.5",
  md: "h-10 px-4 text-sm  gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled ?? loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center",
          "rounded-sm transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gov-blue focus-visible:ring-offset-1",
          "select-none cursor-pointer whitespace-nowrap",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
