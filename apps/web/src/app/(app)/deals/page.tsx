"use client";

export const dynamic = "force-dynamic";

const DEALS = [
  { id: "D-2026-0092", date: "18.03.2026 09:41", session: "M-2026-041", buyer: "Stahlhandel Berger GmbH", seller: "ArcelorMittal DE",     commodity: "Betonstahl Ø16 · B500B",  qty: "80 t",  price: "710 EUR/t",   total: "56.800 EUR",  status: "BESTÄTIGT"     as const },
  { id: "D-2026-0089", date: "17.03.2026 10:12", session: "M-2026-038", buyer: "Bauwerk AG",              seller: "Salzgitter AG",          commodity: "Träger HEA 200 · S355",   qty: "60 t",  price: "760 EUR/t",   total: "45.600 EUR",  status: "IN_ABWICKLUNG" as const },
  { id: "D-2026-0085", date: "15.03.2026 08:55", session: "M-2026-035", buyer: "Metallcenter GmbH",       seller: "Thyssen Röhren AG",      commodity: "Nahtlosrohr Ø76×6,3 mm",  qty: "28 t",  price: "1.240 EUR/t", total: "34.720 EUR",  status: "ABGESCHLOSSEN" as const },
  { id: "D-2026-0081", date: "14.03.2026 11:07", session: "M-2026-031", buyer: "Rheinzink GmbH",          seller: "Norddeutsche Affinerie", commodity: "Zink-Draht 99,99 %",      qty: "15 t",  price: "2.890 EUR/t", total: "43.350 EUR",  status: "ABGESCHLOSSEN" as const },
  { id: "D-2026-0074", date: "12.03.2026 14:22", session: "M-2026-027", buyer: "Kupferwerk Leipzig",      seller: "Aurubis AG",             commodity: "Cu-Kathoden Grade A",      qty: "10 t",  price: "8.410 EUR/t", total: "84.100 EUR",  status: "IN_ABWICKLUNG" as const },
  { id: "D-2026-0070", date: "10.03.2026 09:00", session: "M-2026-025", buyer: "Aluminiumwerk Norf",      seller: "Hydro Aluminium",        commodity: "Al-Walzbarren 1050A",      qty: "40 t",  price: "2.210 EUR/t", total: "88.400 EUR",  status: "ABGESCHLOSSEN" as const },
];

const STATUS_MAP = {
  BESTÄTIGT:      { label: "Bestätigt",      color: "#154194", bg: "#eef2fb" },
  IN_ABWICKLUNG:  { label: "In Abwicklung",  color: "#92400e", bg: "#fffbeb" },
  ABGESCHLOSSEN:  { label: "Abgeschlossen",  color: "#166534", bg: "#f0fdf4" },
};

const F = "'IBM Plex Sans', Arial, sans-serif";

export default function DealsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: F }}>

      {/* ── Seitenkopf ──────────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: "#0d1b2a", margin: 0 }}>Abschlüsse</h1>
        <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
          Alle bestätigten Handelstransaktionen — Ausführungsstatus &amp; Gegenpartei
        </p>
      </div>

      {/* ── KPI-Zeile ───────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, backgroundColor: "#e0e0e0" }}>
        {[
          { label: "Gesamt heute",  value: "€ 352.970", sub: "6 Abschlüsse"           },
          { label: "In Abwicklung", value: "2",          sub: "warten auf Bestätigung" },
          { label: "Abgeschlossen", value: "4",          sub: "vollständig erfüllt"    },
          { label: "Ø Losgröße",    value: "38,8 t",     sub: "Metalle"                },
        ].map((k) => (
          <div key={k.label} style={{ backgroundColor: "#fff", padding: "18px 24px" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", margin: 0, fontWeight: 500 }}>{k.label}</p>
            <p style={{ fontSize: 28, fontWeight: 300, color: "#0d1b2a", marginTop: 8, lineHeight: 1 }}>{k.value}</p>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Tabelle ─────────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: 0 }}>Transaktionsübersicht</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                {["Abschluss-Nr.", "Datum / Zeit", "Sitzung", "Käufer", "Verkäufer", "Ware", "Menge", "Preis", "Gesamtwert", "Status"].map((h, i) => (
                  <th key={i} style={{
                    padding: "10px 16px", fontSize: 11, fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.08em", color: "#888",
                    textAlign: i >= 6 && i <= 8 ? "right" : "left", whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEALS.map((d) => {
                const s = STATUS_MAP[d.status];
                return (
                  <tr key={d.id} style={{ borderBottom: "1px solid #f7f7f7" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#154194", whiteSpace: "nowrap" }}>{d.id}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#505050", whiteSpace: "nowrap" }}>{d.date}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#505050" }}>{d.session}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#0d1b2a" }}>{d.buyer}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#0d1b2a" }}>{d.seller}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#0d1b2a" }}>{d.commodity}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#505050" }}>{d.qty}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#505050" }}>{d.price}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: "#0d1b2a", whiteSpace: "nowrap" }}>{d.total}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color: s.color, backgroundColor: s.bg, padding: "2px 8px", whiteSpace: "nowrap" }}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
