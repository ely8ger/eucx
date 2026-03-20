import * as React from "react"

const VARIANTS: Record<string, { color: string; bg: string }> = {
  default:     { color: "#ffffff", bg: "#0d1b2a" },
  secondary:   { color: "#0d1b2a", bg: "#f0f0f0" },
  destructive: { color: "#ffffff", bg: "#dc2626" },
  outline:     { color: "#0d1b2a", bg: "transparent" },
  success:     { color: "#166534", bg: "#f0fdf4" },
  warning:     { color: "#92400e", bg: "#fffbeb" },
  error:       { color: "#991b1b", bg: "#fff1f1" },
  info:        { color: "#154194", bg: "#eef2fb" },
  blue:        { color: "#154194", bg: "#eef2fb" },
  gray:        { color: "#505050", bg: "#f5f5f5" },
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof VARIANTS;
  dot?:     boolean;
}

function Badge({ style, variant = "default", dot, children, ...props }: BadgeProps) {
  const v = VARIANTS[variant] ?? VARIANTS.default!;
  return (
    <div
      style={{
        display: "inline-flex", alignItems: "center",
        fontSize: 11, fontWeight: 600,
        padding: "2px 8px",
        color: v.color, backgroundColor: v.bg,
        fontFamily: "'IBM Plex Sans', Arial, sans-serif",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span style={{ width: 6, height: 6, backgroundColor: "currentColor", display: "inline-block", marginRight: 5, flexShrink: 0 }} />
      )}
      {children}
    </div>
  )
}

export { Badge }
