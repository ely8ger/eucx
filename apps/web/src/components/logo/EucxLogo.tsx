interface EucxLogoProps {
  variant?: "default" | "white" | "dark";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function EucxLogo({ variant = "default", size = "md", showTagline = false }: EucxLogoProps) {
  const primary   = variant === "white" ? "#ffffff" : "#154194";
  const textMain  = variant === "white" ? "#ffffff" : "#0d1b2a";
  const textSub   = variant === "white" ? "rgba(255,255,255,.55)" : "#7a8aa0";

  const scale = size === "sm" ? 0.75 : size === "lg" ? 1.35 : 1;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: Math.round(12 * scale) }}>

      {/* ── Mark: Stilisiertes Orderbuch / Exchange-Symbol ── */}
      <svg
        width={Math.round(36 * scale)}
        height={Math.round(36 * scale)}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Äußerer Rahmen - eckig (HSBC-Stil) */}
        <rect width="36" height="36" fill={primary} />

        {/* Orderbuch-Linien - Symbol für Preisfindung/Exchange */}
        {/* Linie 1: Kauf - breit */}
        <rect x="7" y="10" width="15" height="2.5" fill="white" opacity="0.9" />
        {/* Linie 2: Spread - mittel */}
        <rect x="7" y="16.75" width="22" height="2.5" fill="white" opacity="0.55" />
        {/* Linie 3: Verkauf - schmal */}
        <rect x="7" y="23.5" width="10" height="2.5" fill="white" opacity="0.9" />

        {/* Vertikale Akzentlinie rechts */}
        <rect x="27" y="8" width="2" height="20" fill="white" opacity="0.25" />
      </svg>

      {/* ── Wortmarke ── */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <div style={{
          fontFamily: "'IBM Plex Sans', Arial, sans-serif",
          fontWeight: 700,
          fontSize: Math.round(17 * scale),
          color: textMain,
          letterSpacing: "0.04em",
          lineHeight: 1,
        }}>
          EUCX
        </div>
        {showTagline ? (
          <div style={{
            fontFamily: "'IBM Plex Sans', Arial, sans-serif",
            fontWeight: 300,
            fontSize: Math.round(10 * scale),
            color: textSub,
            letterSpacing: "0.05em",
            marginTop: 4,
            lineHeight: 1,
          }}>
            European Union Commodity Exchange
          </div>
        ) : (
          <div style={{
            fontFamily: "'IBM Plex Sans', Arial, sans-serif",
            fontWeight: 400,
            fontSize: Math.round(9 * scale),
            color: textSub,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginTop: 3,
            lineHeight: 1,
          }}>
            European Union Commodity Exchange
          </div>
        )}
      </div>
    </div>
  );
}
