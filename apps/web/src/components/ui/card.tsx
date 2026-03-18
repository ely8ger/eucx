import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?:      React.ReactNode;
  footer?:      React.ReactNode;
  padding?:     "sm" | "md" | "lg" | "none";
  highlighted?: boolean;
}

const paddingMap = { sm: "p-4", md: "p-6", lg: "p-8", none: "p-0" };

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, header, footer, children, padding, highlighted, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-white text-slate-950 shadow-sm",
        highlighted ? "border-blue-400 ring-1 ring-blue-400" : "border-slate-200",
        className
      )}
      {...props}
    >
      {header && (
        <div className="flex flex-col space-y-1.5 px-6 py-4 border-b border-slate-200">
          {header}
        </div>
      )}
      {header ? (
        <div className={paddingMap[padding ?? "md"]}>{children}</div>
      ) : padding ? (
        <div className={paddingMap[padding]}>{children}</div>
      ) : children}
      {footer && (
        <div className="px-6 py-4 border-t border-slate-200">{footer}</div>
      )}
    </div>
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
