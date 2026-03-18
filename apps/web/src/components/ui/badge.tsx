import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-slate-900 text-slate-50",
        secondary:   "border-transparent bg-slate-100 text-slate-900",
        destructive: "border-transparent bg-red-500 text-white",
        outline:     "text-slate-950",
        success:     "border-transparent bg-emerald-100 text-emerald-800",
        warning:     "border-transparent bg-amber-100 text-amber-800",
        error:       "border-transparent bg-red-100 text-red-800",
        info:        "border-transparent bg-blue-100 text-blue-800",
        blue:        "border-transparent bg-blue-100 text-blue-800",
        gray:        "border-transparent bg-gray-100 text-gray-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current inline-block" />}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
