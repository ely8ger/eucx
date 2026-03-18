import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  bordered?: boolean;
  highlighted?: boolean;  // Blauer linker Rand (Gov-Akzent)
}

const paddingMap = {
  none: "",
  sm:   "p-3",
  md:   "p-5",
  lg:   "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      header,
      footer,
      padding = "md",
      bordered = true,
      highlighted = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-gov-bg-card rounded-sm",
          "shadow-sm",
          bordered && "border border-gov-border-light",
          highlighted && "border-l-4 border-l-gov-blue",
          className
        )}
        {...props}
      >
        {header && (
          <div className="px-5 py-3 border-b border-gov-border-light flex items-center justify-between">
            {header}
          </div>
        )}

        <div className={paddingMap[padding]}>{children}</div>

        {footer && (
          <div className="px-5 py-3 border-t border-gov-border-light bg-gov-bg rounded-b">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

// ─── Card.Title Subkomponente ──────────────────────────────────────────────
export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-base font-semibold text-gov-text", className)}>
      {children}
    </h3>
  );
}
