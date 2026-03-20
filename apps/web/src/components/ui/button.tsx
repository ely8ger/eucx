"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  fullWidth?: boolean;
}

const VARIANTS: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { backgroundColor: "#154194", color: "#ffffff", border: "1px solid #154194" },
  secondary: { backgroundColor: "#ffffff", color: "#154194", border: "1px solid #154194" },
  outline:   { backgroundColor: "transparent", color: "#154194", border: "1px solid #154194" },
  ghost:     { backgroundColor: "transparent", color: "#154194", border: "1px solid transparent" },
  danger:    { backgroundColor: "#dc2626", color: "#ffffff", border: "1px solid #dc2626" },
};

const SIZES: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: 30, padding: "0 12px", fontSize: 12 },
  md: { height: 36, padding: "0 16px", fontSize: 13 },
  lg: { height: 44, padding: "0 20px", fontSize: 14 },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, fullWidth = false, disabled, style, children, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const isDisabled = disabled ?? loading;
    const v = VARIANTS[variant];
    const s = SIZES[size];

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          fontFamily: "'IBM Plex Sans', Arial, sans-serif",
          fontWeight: 600, cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.5 : 1,
          transition: "background-color .15s, color .15s",
          width: fullWidth ? "100%" : undefined,
          whiteSpace: "nowrap",
          ...v, ...s, ...style,
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            if (variant === "primary")   e.currentTarget.style.backgroundColor = "#0f3070";
            if (variant === "danger")    e.currentTarget.style.backgroundColor = "#b91c1c";
            if (variant === "secondary") e.currentTarget.style.backgroundColor = "#f0f4fb";
            if (variant === "outline")   e.currentTarget.style.backgroundColor = "#f0f4fb";
            if (variant === "ghost")     e.currentTarget.style.backgroundColor = "#f0f4fb";
          }
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = v.backgroundColor as string;
          }
          onMouseLeave?.(e);
        }}
        {...props}
      >
        {loading && (
          <svg style={{ animation: "spin .8s linear infinite", width: 14, height: 14, flexShrink: 0 }} fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: .25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path style={{ opacity: .75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
