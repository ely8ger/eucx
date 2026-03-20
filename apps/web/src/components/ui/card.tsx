import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?:      React.ReactNode;
  footer?:      React.ReactNode;
  padding?:     "sm" | "md" | "lg" | "none";
  highlighted?: boolean;
}

const paddingMap = { sm: "16px", md: "24px", lg: "32px", none: "0" };

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ style, header, footer, children, padding, highlighted, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        backgroundColor: "#ffffff",
        border: highlighted ? "1px solid #154194" : "1px solid #e8e8e8",
        boxShadow: "0 1px 3px rgba(0,0,0,.08)",
        fontFamily: "'IBM Plex Sans', Arial, sans-serif",
        ...style,
      }}
      {...props}
    >
      {header && (
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
          {header}
        </div>
      )}
      <div style={{ padding: paddingMap[padding ?? "md"] }}>
        {children}
      </div>
      {footer && (
        <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0" }}>
          {footer}
        </div>
      )}
    </div>
  )
)
Card.displayName = "Card"

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div ref={ref} style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", ...style }} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div ref={ref} style={{ padding: "14px 20px", ...style }} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div ref={ref} style={{ fontSize: 12, color: "#888", ...style }} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div ref={ref} style={{ padding: "20px", ...style }} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div ref={ref} style={{ display: "flex", alignItems: "center", padding: "12px 20px", borderTop: "1px solid #f0f0f0", ...style }} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
