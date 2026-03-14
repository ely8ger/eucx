import { clsx } from "clsx";

type BadgeVariant = "yellow" | "petrol" | "success" | "error" | "warning" | "gray";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?:     boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  yellow:  "bg-cb-yellow/20  text-cb-yellow-dark  border-cb-yellow/40",
  petrol:  "bg-cb-petrol/10  text-cb-petrol       border-cb-petrol/30",
  success: "bg-green-50       text-cb-success      border-green-200",
  error:   "bg-red-50         text-cb-error        border-red-200",
  warning: "bg-orange-50     text-cb-warning       border-orange-200",
  gray:    "bg-cb-gray-100   text-cb-gray-600      border-cb-gray-200",
};

const dotColors: Record<BadgeVariant, string> = {
  yellow:  "bg-cb-yellow",
  petrol:  "bg-cb-petrol",
  success: "bg-cb-success",
  error:   "bg-cb-error",
  warning: "bg-cb-warning",
  gray:    "bg-cb-gray-400",
};

export function Badge({ variant = "gray", children, dot = false, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5",
        "px-2 py-0.5 rounded",
        "text-xs font-semibold",
        "border",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
