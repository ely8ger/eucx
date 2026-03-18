import { cn } from "@/lib/utils";

type BadgeVariant = "blue" | "info" | "success" | "error" | "warning" | "gray";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  blue:    "bg-gov-blue-light  text-gov-blue        border-gov-blue/30",
  info:    "bg-gov-info/10     text-gov-info        border-gov-info/30",
  success: "bg-green-50        text-gov-success     border-green-200",
  error:   "bg-red-50          text-gov-error       border-red-200",
  warning: "bg-orange-50       text-gov-warning     border-orange-200",
  gray:    "bg-gov-bg          text-gov-text-2      border-gov-border",
};

const dotColors: Record<BadgeVariant, string> = {
  blue:    "bg-gov-blue",
  info:    "bg-gov-info",
  success: "bg-gov-success",
  error:   "bg-gov-error",
  warning: "bg-gov-warning",
  gray:    "bg-gov-text-muted",
};

export function Badge({ variant = "gray", children, dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2 py-0.5 rounded-sm",
        "text-xs font-semibold",
        "border",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
