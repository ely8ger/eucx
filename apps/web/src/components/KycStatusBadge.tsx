"use client";

/**
 * KycStatusBadge — globaler Header-Badge für Verifizierungsstatus
 *
 * GUEST / REJECTED       → Grau  "Nicht verifiziert" + Link
 * PENDING_VERIFICATION   → Gelb  "Dokumente in Prüfung"
 * VERIFIED               → Grün  "Verifizierter Händler ✓"
 * SUSPENDED              → Rot   "Konto gesperrt"
 */

import Link from "next/link";

type VerificationStatus =
  | "GUEST"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED";

interface Props {
  status: VerificationStatus;
  isYoungCompany?: boolean;
  walletBalance?: string;    // "1234.56"
  depositRequired?: string;  // "384.00"
}

const CONFIG: Record<VerificationStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  GUEST:                { label: "Nicht verifiziert",    color: "#6b7280", bg: "#f3f4f6", border: "#d1d5db", icon: "○" },
  PENDING_VERIFICATION: { label: "Dokumente in Prüfung", color: "#92400e", bg: "#fef3c7", border: "#fcd34d", icon: "◐" },
  VERIFIED:             { label: "Verifizierter Händler", color: "#14532d", bg: "#f0fdf4", border: "#86efac", icon: "✓" },
  REJECTED:             { label: "Verifizierung abgelehnt", color: "#7f1d1d", bg: "#fef2f2", border: "#fca5a5", icon: "✗" },
  SUSPENDED:            { label: "Konto gesperrt",       color: "#7f1d1d", bg: "#fef2f2", border: "#fca5a5", icon: "⊘" },
};

export function KycStatusBadge({ status, isYoungCompany, walletBalance, depositRequired }: Props) {
  const cfg = CONFIG[status];

  const badge = (
    <span
      style={{
        display:      "inline-flex",
        alignItems:   "center",
        gap:          6,
        padding:      "5px 12px",
        fontSize:     12,
        fontWeight:   700,
        fontFamily:   "'IBM Plex Sans', Arial, sans-serif",
        letterSpacing: "0.04em",
        color:        cfg.color,
        background:   cfg.bg,
        border:       `1px solid ${cfg.border}`,
        cursor:       status === "GUEST" || status === "REJECTED" ? "pointer" : "default",
        transition:   "opacity 0.15s",
      }}
    >
      <span style={{ fontSize: 14 }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {status === "GUEST" || status === "REJECTED" ? (
        <Link href="/dashboard/settings/verification" style={{ textDecoration: "none" }}>
          {badge}
        </Link>
      ) : (
        badge
      )}

      {/* 5%-Depot-Hinweis für junge Unternehmen */}
      {isYoungCompany && status === "VERIFIED" && depositRequired && (
        <div
          style={{
            padding:    "6px 12px",
            fontSize:   11,
            fontFamily: "'IBM Plex Sans', Arial, sans-serif",
            color:      "#92400e",
            background: "#fffbeb",
            border:     "1px solid #fcd34d",
          }}
        >
          Junges Unternehmen — 5% Sicherheitsleistung erforderlich.{" "}
          Depot: <strong>{walletBalance ? `${Number(walletBalance).toLocaleString("de-DE")} €` : "0 €"}</strong>
          {depositRequired && Number(depositRequired) > 0 && (
            <>{" "}· Noch fehlend: <strong style={{ color: "#dc2626" }}>{Number(depositRequired).toLocaleString("de-DE")} €</strong></>
          )}
        </div>
      )}
    </div>
  );
}
