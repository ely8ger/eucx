"use client";

import { type InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

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
            className="text-sm font-semibold text-cb-gray-700"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-cb-error">*</span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-sm text-cb-gray-500 select-none pointer-events-none">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={clsx(
              // Basis
              "w-full h-10 rounded border bg-cb-white",
              "text-sm text-cb-gray-900",
              "transition-all duration-150",
              "placeholder:text-cb-gray-400",

              // Padding (angepasst für Prefix/Suffix)
              prefix ? "pl-8  pr-3" : "px-3",
              suffix ? "pr-8" : "",

              // Border-States
              error
                ? "border-cb-error focus:border-cb-error focus:ring-2 focus:ring-cb-error/20"
                : "border-cb-gray-300 focus:border-cb-yellow focus:ring-2 focus:ring-cb-yellow/20",

              "focus:outline-none",

              // Disabled
              "disabled:bg-cb-gray-100 disabled:text-cb-gray-400 disabled:cursor-not-allowed",

              className
            )}
            {...props}
          />

          {suffix && (
            <span className="absolute right-3 text-sm text-cb-gray-500 select-none pointer-events-none">
              {suffix}
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs text-cb-error flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-cb-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
