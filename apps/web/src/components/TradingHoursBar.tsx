"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTradingStatus, fmtCountdown } from "@/lib/tradingHours";

const SANS = "'IBM Plex Sans', Arial, sans-serif";
const MONO = "'IBM Plex Mono', monospace";
const BLUE = "#154194";

export default function TradingHoursBar() {
  const [status, setStatus] = useState(() => getTradingStatus());

  useEffect(() => {
    const id = setInterval(() => setStatus(getTradingStatus()), 1000);
    return () => clearInterval(id);
  }, []);

  const { isOpen, secondsLeft, opensAt, tzLabel } = status;

  const openStr  = `${String(10).padStart(2, "0")}:00`;
  const closeStr = `${String(13).padStart(2, "0")}:00`;

  const nextOpenLabel = (() => {
    const now = new Date();
    const diff = opensAt.getTime() - now.getTime();
    const daysDiff = Math.floor(diff / (1000 * 3600 * 24));
    if (daysDiff === 0) return "heute";
    if (daysDiff === 1) return "morgen";
    return opensAt.toLocaleDateString("de-DE", { weekday: "long", timeZone: "Europe/Berlin" });
  })();

  return (
    <div style={{
      backgroundColor: isOpen ? "#f0fdf4" : "#f5f7fa",
      borderBottom: isOpen ? "1px solid #bbf7d0" : "1px solid #e4e6ec",
      fontFamily: SANS,
    }}>
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 40px",
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}>

        {/* Left: Status + Zeiten */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>

          {/* Status-Pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 7, height: 7,
              borderRadius: "50%",
              backgroundColor: isOpen ? "#16a34a" : "#9ca3af",
              boxShadow: isOpen ? "0 0 0 3px rgba(22,163,74,.2)" : "none",
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: isOpen ? "#15803d" : "#6b7280",
            }}>
              {isOpen ? "Börse geöffnet" : "Börse geschlossen"}
            </span>
          </div>

          {/* Handelszeit */}
          <span style={{ fontSize: 11, color: "#6b7280", fontFamily: MONO }}>
            Mo–Fr &nbsp;{openStr}–{closeStr} {tzLabel}
          </span>

          {/* Countdown */}
          {isOpen ? (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Schließt in</span>
              <span style={{
                fontSize: 12, fontWeight: 700, fontFamily: MONO,
                color: secondsLeft < 1800 ? "#dc2626" : "#15803d",
                backgroundColor: secondsLeft < 1800 ? "#fef2f2" : "#f0fdf4",
                border: `1px solid ${secondsLeft < 1800 ? "#fecaca" : "#bbf7d0"}`,
                padding: "1px 8px",
                letterSpacing: "0.04em",
              }}>
                {fmtCountdown(secondsLeft)}
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>
                Öffnet {nextOpenLabel} um {openStr} {tzLabel} ·
              </span>
              <span style={{
                fontSize: 12, fontWeight: 700, fontFamily: MONO,
                color: "#374151",
                backgroundColor: "#f3f4f6",
                border: "1px solid #e5e7eb",
                padding: "1px 8px",
                letterSpacing: "0.04em",
              }}>
                {fmtCountdown(secondsLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Right: CTA nur wenn geöffnet */}
        {isOpen && (
          <Link href="/orders/new" style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            height: 26, padding: "0 12px",
            backgroundColor: BLUE, color: "#fff",
            fontSize: 11, fontWeight: 700, textDecoration: "none",
            letterSpacing: "0.04em",
          }}>
            + Auftrag erstellen
          </Link>
        )}
      </div>
    </div>
  );
}
