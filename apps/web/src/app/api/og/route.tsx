/**
 * GET /api/og?symbol=...&price=...&change=...&unit=...&high=...&low=...&vol=...&p=...
 *
 * Dynamische OG-Image-Generierung (1200×630) via next/og (Satori Engine).
 *
 * Parameter:
 *   symbol  - Produktname (URL-encoded)
 *   price   - Letzter Schlusskurs
 *   change  - 24h-Änderung in % (z.B. "1.20" oder "-0.80")
 *   unit    - Preiseinheit (default: "€/t")
 *   high    - 24h-Hoch
 *   low     - 24h-Tief
 *   vol     - 24h-Volumen in Tonnen
 *   p       - Sparkline-Daten (komma-getrennte Schlusskurse, max. 48 Werte)
 *
 * Cache: public, 15min (via next.config.ts headers)
 */
import { ImageResponse }               from "next/og";
import type { NextRequest }            from "next/server";
import { decodeSparklineData, computeSparklinePath } from "@/lib/seo/sparkline";

export const runtime = "edge";

// ── Formatierung ──────────────────────────────────────────────────────────────

function fmtPrice(raw: string | null): string {
  if (!raw || raw === "-") return "-";
  const n = parseFloat(raw);
  if (isNaN(n)) return "-";
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function fmtVol(raw: string | null): string {
  if (!raw) return "-";
  const n = parseFloat(raw);
  if (isNaN(n)) return "-";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} Mio. t`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)} Tsd. t`;
  return `${n.toFixed(0)} t`;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const symbol     = sp.get("symbol")  ?? "EUCX";
  const priceRaw   = sp.get("price")   ?? null;
  const changeRaw  = sp.get("change")  ?? "0.00";
  const unit       = sp.get("unit")    ?? "€/t";
  const highRaw    = sp.get("high")    ?? null;
  const lowRaw     = sp.get("low")     ?? null;
  const volRaw     = sp.get("vol")     ?? null;
  const sparkRaw   = sp.get("p")       ?? "";

  const changeNum   = parseFloat(changeRaw);
  const isPositive  = changeNum >= 0;
  const lineColor   = isPositive ? "#22c55e" : "#ef4444";
  const fillColor   = isPositive ? "rgba(34,197,94,0.15)"  : "rgba(239,68,68,0.15)";
  const changeSign  = isPositive ? "+" : "";
  const changeLabel = `${changeSign}${changeNum.toFixed(2)}%`;

  // Sparkline berechnen
  const sparkPrices = sparkRaw ? decodeSparklineData(sparkRaw) : [];
  const spark = computeSparklinePath(sparkPrices, 380, 80, 6);

  const W = 1200;
  const H = 630;

  return new ImageResponse(
    (
      <div
        style={{
          width:           W,
          height:          H,
          display:         "flex",
          flexDirection:   "column",
          backgroundColor: "#001F3F",
          padding:         "0",
          fontFamily:      "system-ui, -apple-system, sans-serif",
          position:        "relative",
          overflow:        "hidden",
        }}
      >
        {/* Oberer Farbstreifen */}
        <div style={{
          position:   "absolute",
          top:        0,
          left:       0,
          right:      0,
          height:     "4px",
          background: "linear-gradient(90deg, #FBB809 0%, #F59E0B 60%, #001F3F 100%)",
        }} />

        {/* Subtiler Hintergrund-Gradient */}
        <div style={{
          position:   "absolute",
          top:        0,
          right:      0,
          width:      "600px",
          height:     "630px",
          background: "radial-gradient(ellipse at top right, rgba(0,61,107,0.8) 0%, transparent 70%)",
        }} />

        {/* Content-Bereich */}
        <div style={{
          display:       "flex",
          flexDirection: "column",
          flex:          1,
          padding:       "48px 64px",
          position:      "relative",
          zIndex:        1,
        }}>

          {/* ── Header: Logo + Verifizierungszeichen ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "28px" }}>
                <div style={{ width: "5px", height: "28px", backgroundColor: "#FBB809", borderRadius: "2px" }} />
                <div style={{ width: "5px", height: "18px", backgroundColor: "#FCD34D", borderRadius: "2px", opacity: 0.8 }} />
                <div style={{ width: "5px", height: "24px", backgroundColor: "#FBB809", borderRadius: "2px", opacity: 0.9 }} />
              </div>
              <span style={{ color: "#FBB809", fontSize: "20px", fontWeight: 700 }}>EUCX</span>
              <span style={{ color: "#2D5070", fontSize: "13px", marginLeft: "2px" }}>
                European Union Commodity Exchange
              </span>
            </div>
            {/* "Verified Source" Badge */}
            <div style={{
              display:         "flex",
              alignItems:      "center",
              gap:             "6px",
              backgroundColor: "rgba(251,184,9,0.12)",
              border:          "1px solid rgba(251,184,9,0.3)",
              borderRadius:    "20px",
              padding:         "5px 12px",
            }}>
              <div style={{
                width:           "8px",
                height:          "8px",
                borderRadius:    "50%",
                backgroundColor: "#FBB809",
              }} />
              <span style={{ color: "#FBB809", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px" }}>
                VERIFIED MARKET DATA
              </span>
            </div>
          </div>

          {/* ── Hauptbereich: Links Preis, Rechts Sparkline ── */}
          <div style={{
            display:    "flex",
            flex:       1,
            gap:        "48px",
            marginTop:  "36px",
            alignItems: "flex-start",
          }}>

            {/* Linke Spalte: Produktname + Preis */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              {/* Label */}
              <div style={{
                color:         "#4B8AB0",
                fontSize:      "13px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom:  "8px",
              }}>
                Echtzeit Spot-Preis · LME-Benchmark
              </div>

              {/* Produktname */}
              <div style={{
                color:      "#E2EAF2",
                fontSize:   "32px",
                fontWeight: 700,
                lineHeight: 1.2,
                maxWidth:   "550px",
              }}>
                {decodeURIComponent(symbol)}
              </div>

              {/* Preis */}
              <div style={{
                display:    "flex",
                alignItems: "baseline",
                gap:        "12px",
                marginTop:  "20px",
              }}>
                <span style={{
                  color:         "#FFFFFF",
                  fontSize:      "68px",
                  fontWeight:    800,
                  letterSpacing: "-2px",
                  lineHeight:    1,
                }}>
                  {fmtPrice(priceRaw)}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ color: "#4B8AB0", fontSize: "18px" }}>{unit}</span>
                  <span style={{ color: lineColor, fontSize: "22px", fontWeight: 700 }}>
                    {changeLabel}
                  </span>
                </div>
              </div>

              {/* 24h Statistiken */}
              {(highRaw ?? lowRaw ?? volRaw) && (
                <div style={{
                  display:   "flex",
                  gap:       "24px",
                  marginTop: "20px",
                }}>
                  {highRaw && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ color: "#4B8AB0", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>24h Hoch</span>
                      <span style={{ color: "#22c55e", fontSize: "15px", fontWeight: 600 }}>{fmtPrice(highRaw)}</span>
                    </div>
                  )}
                  {lowRaw && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ color: "#4B8AB0", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>24h Tief</span>
                      <span style={{ color: "#ef4444", fontSize: "15px", fontWeight: 600 }}>{fmtPrice(lowRaw)}</span>
                    </div>
                  )}
                  {volRaw && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ color: "#4B8AB0", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>24h Volumen</span>
                      <span style={{ color: "#94A3B8", fontSize: "15px", fontWeight: 600 }}>{fmtVol(volRaw)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rechte Spalte: Sparkline-Chart */}
            {spark && (
              <div style={{
                display:       "flex",
                flexDirection: "column",
                alignItems:    "flex-end",
                width:         "400px",
                flexShrink:    0,
              }}>
                <span style={{
                  color:         "#2D5070",
                  fontSize:      "11px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom:  "8px",
                }}>
                  24h Chart
                </span>
                {/* SVG Sparkline */}
                <svg
                  width="380"
                  height="80"
                  viewBox="0 0 380 80"
                  style={{ overflow: "visible" }}
                >
                  {/* Gradient-Definition */}
                  <defs>
                    <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={lineColor} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={lineColor} stopOpacity="0"   />
                    </linearGradient>
                  </defs>
                  {/* Hintergrund-Fill */}
                  <polygon
                    points={spark.fillPath}
                    fill={fillColor}
                  />
                  {/* Haupt-Linie */}
                  <polyline
                    points={spark.points}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Letzter Datenpunkt: Pulsierender Dot */}
                  {(() => {
                    const lastPt = spark.points.split(" ").pop() ?? "";
                    const [lx, ly] = lastPt.split(",").map(Number);
                    return (
                      <>
                        <circle cx={lx} cy={ly} r="5" fill={lineColor} opacity="0.3" />
                        <circle cx={lx} cy={ly} r="3" fill={lineColor} />
                      </>
                    );
                  })()}
                </svg>

                {/* Preis-Range unter Chart */}
                <div style={{
                  display:        "flex",
                  justifyContent: "space-between",
                  width:          "380px",
                  marginTop:      "4px",
                }}>
                  <span style={{ color: "#2D5070", fontSize: "11px" }}>{fmtPrice(String(spark.min))}</span>
                  <span style={{ color: "#2D5070", fontSize: "11px" }}>{fmtPrice(String(spark.max))}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            paddingTop:     "20px",
            borderTop:      "1px solid #0D2D4A",
            marginTop:      "auto",
          }}>
            <span style={{ color: "#2D5070", fontSize: "13px" }}>
              eucx.eu · Institutioneller B2B-Rohstoffhandel EU
            </span>
            <span style={{ color: "#2D5070", fontSize: "12px" }}>
              {new Date().toLocaleString("de-DE", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
                timeZone: "Europe/Berlin",
              })} CET
            </span>
          </div>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
