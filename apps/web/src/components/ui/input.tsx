"use client";

import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string;
  error?:   string;
  hint?:    string;
  prefix?:  string;   // z.B. "€" oder "t"
  suffix?:  string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-gov-text"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-gov-error">*</span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-sm text-gov-text-muted select-none pointer-events-none">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 rounded-sm border bg-gov-white",
              "text-sm text-gov-text",
              "transition-colors duration-150",
              "placeholder:text-gov-text-muted",
              prefix ? "pl-8  pr-3" : "px-3",
              suffix ? "pr-8" : "",
              error
                ? "border-gov-error focus:border-gov-error focus:ring-2 focus:ring-gov-error/20"
                : "border-gov-border focus:border-gov-blue focus:ring-2 focus:ring-gov-blue/20",
              "focus:outline-none",
              "disabled:bg-gov-bg disabled:text-gov-text-muted disabled:cursor-not-allowed",

              className
            )}
            {...props}
          />

          {suffix && (
            <span className="absolute right-3 text-sm text-gov-text-muted select-none pointer-events-none">
              {suffix}
            </span>
          )}
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

Input.displayName = "Input";
