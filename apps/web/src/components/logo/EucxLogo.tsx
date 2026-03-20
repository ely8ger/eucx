interface EucxLogoProps {
  variant?: "default" | "white" | "dark";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function EucxLogo({ variant = "default", size = "md", showTagline = false }: EucxLogoProps) {
  const primary  = variant === "white" ? "#ffffff" : "#154194";
  const textMain = (variant === "white" || variant === "dark") ? "#ffffff" : "#0d1b2a";
  const textSub  = (variant === "white" || variant === "dark") ? "rgba(255,255,255,.55)" : "#7a8aa0";

  const scale = size === "sm" ? 0.75 : size === "lg" ? 1.35 : 1;
  const px    = (n: number) => Math.round(n * scale);

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: px(12), flexShrink: 0 }}>

      {/* ── Mark: Stilisiertes Orderbuch / Exchange-Symbol ── */}
      <svg
        width={px(36)}
        height={px(36)}
        viewBox="0 0 36 36"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ display: "block", flexShrink: 0, overflow: "visible" }}
      >
        {/* Äußerer Rahmen */}
        <rect width="36" height="36" style={{ fill: primary }} />

        {/* Orderbuch-Linien */}
        <rect x="7" y="10"   width="15" height="2.5" style={{ fill: "#ffffff", opacity: 0.9 }} />
        <rect x="7" y="16.75" width="22" height="2.5" style={{ fill: "#ffffff", opacity: 0.55 }} />
        <rect x="7" y="23.5" width="10" height="2.5" style={{ fill: "#ffffff", opacity: 0.9 }} />

        {/* Vertikale Akzentlinie */}
        <rect x="27" y="8" width="2" height="20" style={{ fill: "#ffffff", opacity: 0.25 }} />
      </svg>

      {/* ── Wortmarke ── */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <div style={{
          fontFamily: "'IBM Plex Sans', Arial, sans-serif",
          fontWeight: 700,
          fontSize: px(17),
          color: textMain,
          letterSpacing: "0.04em",
          lineHeight: 1,
        }}>
          EUCX
        </div>
        <div style={{
          fontFamily: "'IBM Plex Sans', Arial, sans-serif",
          fontWeight: showTagline ? 300 : 400,
          fontSize: showTagline ? px(10) : px(9),
          color: textSub,
          letterSpacing: showTagline ? "0.05em" : "0.12em",
          textTransform: showTagline ? undefined : "uppercase" as const,
          marginTop: showTagline ? 4 : 3,
          lineHeight: 1,
        }}>
          European Union Commodity Exchange
        </div>
      </div>
    </div>
  );
}
