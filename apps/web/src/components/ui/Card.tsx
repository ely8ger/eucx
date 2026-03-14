import { type HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?:        React.ReactNode;
  footer?:        React.ReactNode;
  padding?:       "none" | "sm" | "md" | "lg";
  bordered?:      boolean;
  highlighted?:   boolean;  // Gelber linker Rand (Commerzbank-typisch)
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
        className={clsx(
          "bg-cb-white rounded",
          "shadow-sm",
          bordered && "border border-cb-gray-200",
          highlighted && "border-l-4 border-l-cb-yellow",
          className
        )}
        {...props}
      >
        {header && (
          <div className="px-5 py-3 border-b border-cb-gray-200 flex items-center justify-between">
            {header}
          </div>
        )}

        <div className={paddingMap[padding]}>{children}</div>

        {footer && (
          <div className="px-5 py-3 border-t border-cb-gray-200 bg-cb-gray-50 rounded-b">
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
    <h3 className={clsx("text-base font-semibold text-cb-petrol", className)}>
      {children}
    </h3>
  );
}
