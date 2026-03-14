"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?:    ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  // Commerzbank Primär: Gelb + Dunkeltext (Signature-Look)
  primary:
    "bg-cb-yellow text-cb-gray-900 hover:bg-cb-yellow-hover active:bg-cb-yellow-dark " +
    "font-semibold border border-cb-yellow hover:border-cb-yellow-hover " +
    "shadow-sm",

  // Sekundär: Petrol-Blau (Commerzbank Dark)
  secondary:
    "bg-cb-petrol text-cb-white hover:bg-cb-petrol-dark active:bg-cb-navy " +
    "font-semibold border border-cb-petrol",

  // Outline: gelber Rand, transparenter Hintergrund
  outline:
    "bg-transparent text-cb-petrol hover:bg-cb-gray-100 active:bg-cb-gray-200 " +
    "font-semibold border-2 border-cb-petrol",

  // Ghost: kein Rahmen, nur Hover-Effekt
  ghost:
    "bg-transparent text-cb-petrol hover:bg-cb-yellow hover:text-cb-gray-900 " +
    "font-medium border border-transparent",

  // Danger: Rot für kritische Aktionen
  danger:
    "bg-cb-error text-cb-white hover:bg-red-700 active:bg-red-800 " +
    "font-semibold border border-cb-error",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:  "h-8  px-3 text-sm  gap-1.5",
  md:  "h-10 px-4 text-sm  gap-2",
  lg:  "h-12 px-6 text-base gap-2.5",
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
        className={clsx(
          // Basis
          "inline-flex items-center justify-center",
          "rounded transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-yellow focus-visible:ring-offset-1",
          "select-none cursor-pointer",
          "whitespace-nowrap",

          // Variant
          variantStyles[variant],

          // Size
          sizeStyles[size],

          // Full-width
          fullWidth && "w-full",

          // Disabled
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
