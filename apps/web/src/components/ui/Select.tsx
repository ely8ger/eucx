"use client";

import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, placeholder, className, id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-semibold text-gov-text">
            {label}
            {props.required && <span className="ml-1 text-gov-error">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full h-10 rounded-sm border bg-gov-white",
              "text-sm text-gov-text px-3 pr-8",
              "appearance-none cursor-pointer",
              "transition-colors duration-150",
              error
                ? "border-gov-error focus:border-gov-error focus:ring-2 focus:ring-gov-error/20"
                : "border-gov-border focus:border-gov-blue focus:ring-2 focus:ring-gov-blue/20",
              "focus:outline-none",
              "disabled:bg-gov-bg disabled:text-gov-text-muted disabled:cursor-not-allowed",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>

          {/* Chevron Icon */}
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gov-text-muted">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {error && (
          <p className="text-xs text-gov-error flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-gov-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
