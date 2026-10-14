"use client";

import { EucxHeader } from "@/components/layout/EucxHeader";

const B = "#154194";

export function WalletClient() {
  return (
    <div style={{ fontFamily: '"IBM Plex Sans", sans-serif', minHeight: "100vh", background: "#f8f9fa", color: "#1a1a1a" }}>
      <EucxHeader />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Handelskonto</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 32 }}>Finanzinformationen und Zahlungsabwicklung</p>

        <div style={{ background: "#fff", border: `1px solid ${B}`, borderTop: `4px solid ${B}`, padding: 28, marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Direkte Zahlungsabwicklung</p>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>
            EUCX verwahrt kein Kundenguthaben. Zahlungen erfolgen direkt zwischen Käufer und Verkäufer
            per Banküberweisung (Peer-to-Peer). EUCX erfasst ausschließlich die eigene Plattformgebühr
            in internen Büchern.
          </p>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#888", marginBottom: 16 }}>
            Zahlungsablauf
          </p>
          {[
            ["1", "Auktionsabschluss", "EUCX generiert Kaufvertrag und stellt Plattformgebühr in Rechnung."],
            ["2", "Banküberweisung", "Käufer überweist den Gesamtbetrag direkt an den Verkäufer gemäß Vertragsbedingungen."],
            ["3", "Zahlungsbestätigung", "Käufer bestätigt Zahlung im Dashboard — Verkäufer erhält Freigabe zur Lieferung."],
            ["4", "Lieferbestätigung", "Käufer bestätigt Wareneingang. Vertrag gilt als erfüllt."],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ display: "flex", gap: 16, marginBottom: 18 }}>
              <div style={{ width: 28, height: 28, background: B, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {num}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "4px 0 2px" }}>{title}</p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
