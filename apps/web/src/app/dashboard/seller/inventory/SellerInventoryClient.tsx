"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EucxHeader } from "@/components/layout/EucxHeader";

const A  = "#d97706";
const A2 = "#b45309";

interface Charge {
  id:                string;
  schmelzNr:         string | null;
  material:          string;
  spec:              string | null;
  quantity:          string;
  unit:              string;
  warehouseLocation: string | null;
  co2PerTonne:       string | null;
  countryOfOrigin:   string | null;
  productionSiteId:  string | null;
  incoterms:         string | null;
  status:            "AVAILABLE" | "RESERVED" | "SOLD" | "CANCELLED";
  certificate31:     string | null;
  createdAt:         string;
  lot?:              { id: string; commodity: string; phase: string } | null;
}

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE:  "#16a34a",
  RESERVED:   "#d97706",
  SOLD:       "#6b7280",
  CANCELLED:  "#dc2626",
};

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE:  "Verfügbar",
  RESERVED:   "Reserviert",
  SOLD:       "Verkauft",
  CANCELLED:  "Storniert",
};

export function SellerInventoryClient() {
  const router = useRouter();
  const [token,    setToken]    = useState("");
  const [charges,  setCharges]  = useState<Charge[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [showForm, setShowForm] = useState(false);

  // Formular-State
  const [fMaterial,   setFMaterial]   = useState("");
  const [fSpec,       setFSpec]       = useState("");
  const [fQty,        setFQty]        = useState("");
  const [fLager,      setFLager]      = useState("");
  const [fCo2,        setFCo2]        = useState("");
  const [fLand,       setFLand]       = useState("DE");
  const [fRegistryId, setFRegistryId] = useState("");
  const [fIncoterms,  setFIncoterms]  = useState("DAP");
  const [fSchmelzNr,  setFSchmelzNr]  = useState("");

  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    if (!tkn) router.replace("/login");
  }, [router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/seller/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const data = await r.json() as Charge[];
        setCharges(data);
      } else {
        setError("Fehler beim Laden der Chargen.");
      }
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  async function addCharge(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        material:          fMaterial,
        spec:              fSpec || undefined,
        quantity:          parseFloat(fQty),
        unit:              "TON",
        schmelzNr:         fSchmelzNr || undefined,
        warehouseLocation: fLager || undefined,
        co2PerTonne:       fCo2 ? parseFloat(fCo2) : undefined,
        countryOfOrigin:   fLand || undefined,
        productionSiteId:  fRegistryId || undefined,
        incoterms:         fIncoterms,
      };
      const r = await fetch("/api/seller/inventory", {
        method:  "POST",
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        setShowForm(false);
        setFMaterial(""); setFSpec(""); setFQty(""); setFLager("");
        setFCo2(""); setFRegistryId(""); setFSchmelzNr("");
        await load();
      } else {
        const d = await r.json() as { error?: string };
        setError(d.error ?? "Fehler beim Anlegen.");
      }
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCharge(id: string) {
    if (!confirm("Charge unwiderruflich löschen?")) return;
    const r = await fetch(`/api/seller/inventory/${id}`, {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok || r.status === 204) {
      setCharges((prev) => prev.filter((c) => c.id !== id));
    } else {
      const d = await r.json() as { error?: string };
      alert(d.error ?? "Löschen nicht möglich.");
    }
  }

  const available = charges.filter((c) => c.status === "AVAILABLE");
  const totalQty  = available.reduce((s, c) => s + parseFloat(c.quantity), 0);
  const co2Vals   = charges.filter((c) => c.co2PerTonne !== null).map((c) => parseFloat(c.co2PerTonne!));
  const avgCo2    = co2Vals.length > 0 ? co2Vals.reduce((s, v) => s + v, 0) / co2Vals.length : 0;
  const noCbam    = charges.filter((c) => !c.productionSiteId).length;

  return (
    <>
      <style>{`
        .inv { font-family:"IBM Plex Sans",sans-serif; min-height:100vh; background:#f8f9fa; color:#1a1a1a; }
        .inv-stripe { background:linear-gradient(90deg,#78350f,#92400e); border-bottom:1px solid #b45309; height:36px; padding:0 28px; display:flex; align-items:center; }
        .inv-stripe-inner { max-width:1100px; margin:0 auto; width:100%; display:flex; align-items:center; gap:12px; }
        .inv-badge { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#fde68a; background:rgba(255,255,255,.12); padding:3px 10px; }
        .inv-page { max-width:1100px; margin:0 auto; padding:28px 24px 80px; }
        .inv-hd { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:24px; flex-wrap:wrap; }
        .inv-title { font-size:20px; font-weight:700; color:#111827; }
        .inv-sub { font-size:12.5px; color:#6b7280; margin-top:2px; }
        .inv-btn { padding:10px 20px; background:${A}; color:#fff; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:background .15s; }
        .inv-btn:hover { background:${A2}; }
        .inv-btn:disabled { background:#d1d5db; cursor:not-allowed; }
        .inv-kpi { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
        @media(max-width:640px){.inv-kpi{grid-template-columns:1fr;}}
        .inv-kpi-card { background:#fff; border:1px solid #e5e7eb; border-top:3px solid ${A}; padding:16px 18px; }
        .inv-kpi-num { font-family:"IBM Plex Mono",monospace; font-size:26px; font-weight:700; }
        .inv-kpi-label { font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#9ca3af; margin-top:4px; font-weight:700; }
        .inv-form { background:#fff; border:1px solid #e5e7eb; border-top:3px solid ${A}; padding:24px 28px; margin-bottom:24px; }
        .inv-form-title { font-size:14px; font-weight:700; margin-bottom:20px; }
        .inv-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        @media(max-width:640px){.inv-form-grid{grid-template-columns:1fr;}}
        .inv-label { font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:5px; }
        .inv-input { width:100%; height:38px; border:1px solid #d1d5db; padding:0 10px; font-size:13.5px; outline:none; font-family:inherit; box-sizing:border-box; }
        .inv-input:focus { border-color:${A}; }
        .inv-select { width:100%; height:38px; border:1px solid #d1d5db; padding:0 10px; font-size:13.5px; outline:none; font-family:inherit; background:#fff; appearance:none; box-sizing:border-box; }
        .inv-select:focus { border-color:${A}; }
        .inv-form-actions { display:flex; gap:10px; margin-top:20px; }
        .inv-btn-cancel { padding:10px 18px; background:#fff; color:#374151; font-size:13px; border:1px solid #d1d5db; cursor:pointer; }
        .inv-cbam-hd { display:flex; align-items:center; gap:10px; margin:20px 0 12px; padding-bottom:8px; border-bottom:1px solid #e5e7eb; }
        .inv-cbam-badge { font-size:10px; font-weight:700; padding:2px 8px; background:#dbeafe; color:#1d4ed8; }
        .inv-table-wrap { overflow-x:auto; }
        .inv-table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e5e7eb; font-size:13px; }
        .inv-table th { padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#9ca3af; border-bottom:2px solid ${A}; white-space:nowrap; }
        .inv-table td { padding:13px 14px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
        .inv-table tr:last-child td { border-bottom:none; }
        .inv-table tr:hover td { background:#fffbf5; }
        .inv-status { display:inline-block; padding:3px 8px; font-size:10.5px; font-weight:700; color:#fff; }
        .inv-co2-val { font-family:"IBM Plex Mono",monospace; color:#16a34a; font-weight:700; }
        .inv-warn { display:inline-flex; align-items:center; gap:4px; font-size:10.5px; color:#dc2626; font-weight:600; }
        .inv-action { font-size:12px; font-weight:700; color:${A}; text-decoration:none; cursor:pointer; background:none; border:none; padding:0; }
        .inv-action:hover { text-decoration:underline; }
        .inv-del { font-size:12px; font-weight:700; color:#dc2626; cursor:pointer; background:none; border:none; padding:0; margin-left:10px; }
        .inv-del:hover { text-decoration:underline; }
        .inv-err { background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #dc2626; padding:12px 16px; margin-bottom:16px; font-size:13px; color:#dc2626; }
        .inv-empty { padding:40px; text-align:center; color:#9ca3af; font-size:13px; background:#fff; border:1px solid #e5e7eb; }
        .inv-loading { padding:40px; text-align:center; color:#9ca3af; font-size:13px; }
      `}</style>

      <div className="inv">
        <EucxHeader />
        <div className="inv-stripe">
          <div className="inv-stripe-inner">
            <span className="inv-badge">LAGERBESTAND</span>
            <span style={{ fontSize: 11, color: "rgba(253,230,138,.7)" }}>
              Chargen verwalten · CBAM-Tresor · Zertifikate hochladen
            </span>
          </div>
        </div>

        <div className="inv-page">
          <div className="inv-hd">
            <div>
              <div className="inv-title">Bestands- & Chargenverwaltung</div>
              <div className="inv-sub">Physische Ware, Schmelznummern und CBAM-Nachweise an einem Ort</div>
            </div>
            <button className="inv-btn" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "✕ Abbrechen" : "+ Neue Charge melden"}
            </button>
          </div>

          {error && <div className="inv-err">{error}</div>}

          {/* KPIs */}
          <div className="inv-kpi">
            <div className="inv-kpi-card">
              <div className="inv-kpi-num">{totalQty.toLocaleString("de-DE", { maximumFractionDigits: 2 })}</div>
              <div className="inv-kpi-label">Tonnen verfügbar</div>
            </div>
            <div className="inv-kpi-card">
              <div className="inv-kpi-num" style={{ color: "#16a34a" }}>
                {avgCo2.toLocaleString("de-DE", { maximumFractionDigits: 2 })} t
              </div>
              <div className="inv-kpi-label">Ø CO₂-Fußabdruck / Tonne</div>
            </div>
            <div className="inv-kpi-card">
              <div className="inv-kpi-num" style={{ color: noCbam > 0 ? "#dc2626" : "#16a34a" }}>
                {charges.length - noCbam} / {charges.length}
              </div>
              <div className="inv-kpi-label">Chargen mit CBAM-Nachweis</div>
            </div>
          </div>

          {/* Formular: Neue Charge */}
          {showForm && (
            <div className="inv-form">
              <div className="inv-form-title">Neue Charge erfassen</div>
              <form onSubmit={(e) => void addCharge(e)}>
                <div className="inv-form-grid">
                  <div>
                    <label className="inv-label">Material / Produkt *</label>
                    <input className="inv-input" placeholder="z.B. Betonstahl BST 500S" value={fMaterial} onChange={(e) => setFMaterial(e.target.value)} required />
                  </div>
                  <div>
                    <label className="inv-label">
                      Spezifikation
                      <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 6 }}>Norm + Abmessung</span>
                    </label>
                    <input className="inv-input" placeholder="z.B. EN 10080 — Ø12mm BST 500S" value={fSpec} onChange={(e) => setFSpec(e.target.value)} />
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                      EN 10080 = EU-Norm für Betonstahl · DIN 488 = Deutsche Norm · EN 10025 = Baustahl
                    </div>
                  </div>
                  <div>
                    <label className="inv-label">Menge (Tonnen) *</label>
                    <input className="inv-input" type="number" min="0.1" step="0.1" placeholder="250" value={fQty} onChange={(e) => setFQty(e.target.value)} required />
                  </div>
                  <div>
                    <label className="inv-label">
                      Schmelznummer
                      <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 6 }}>aus dem 3.1-Werkszeugnis</span>
                    </label>
                    <input className="inv-input" placeholder="z.B. 123456-A (steht im Werkszeugnis)" value={fSchmelzNr} onChange={(e) => setFSchmelzNr(e.target.value)} />
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                      Eindeutige Produktions-ID des Stahlwerks — nicht vom System generierbar
                    </div>
                  </div>
                  <div>
                    <label className="inv-label">Lager / Standort</label>
                    <input className="inv-input" placeholder="z.B. Lager Hamburg Nord" value={fLager} onChange={(e) => setFLager(e.target.value)} />
                  </div>
                  <div>
                    <label className="inv-label">Herkunftsland (ISO 3166-1)</label>
                    <select className="inv-select" value={fLand} onChange={(e) => setFLand(e.target.value)}>
                      {[
                        ["DE","Deutschland"],["AT","Österreich"],["PL","Polen"],["CZ","Tschechien"],
                        ["SK","Slowakei"],["HU","Ungarn"],["RO","Rumänien"],["HR","Kroatien"],
                        ["IT","Italien"],["FR","Frankreich"],["ES","Spanien"],["BE","Belgien"],
                        ["NL","Niederlande"],["LU","Luxemburg"],["SE","Schweden"],["FI","Finnland"],
                        ["TR","Türkei"],["UA","Ukraine"],["RU","Russland"],["BY","Weißrussland"],
                        ["CN","China"],["IN","Indien"],["KR","Südkorea"],["JP","Japan"],
                        ["BR","Brasilien"],["ZA","Südafrika"],["EG","Ägypten"],["DZ","Algerien"],
                      ].map(([c,n]) => (
                        <option key={c} value={c}>{c} — {n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="inv-cbam-hd">
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#154194" }}>CBAM-Tresor</span>
                  <span className="inv-cbam-badge">EU-Verordnung 2023/956</span>
                </div>
                <div className="inv-form-grid">
                  <div>
                    <label className="inv-label">CO₂-Emissionen (kg CO₂-Äq./t)</label>
                    <input className="inv-input" type="number" step="0.0001" placeholder="1850.0000" value={fCo2} onChange={(e) => setFCo2(e.target.value)} />
                  </div>
                  <div>
                    <label className="inv-label">CBAM-Registry-ID (Produktionsstätte)</label>
                    <input className="inv-input" placeholder="CBAM-DE-12345678" value={fRegistryId} onChange={(e) => setFRegistryId(e.target.value)} />
                  </div>
                  <div>
                    <label className="inv-label">Lieferbedingung (INCOTERMS® 2020)</label>
                    <select className="inv-select" value={fIncoterms} onChange={(e) => setFIncoterms(e.target.value)}>
                      {[
                        ["EXW","Ex Works — Ab Werk"],
                        ["FCA","Free Carrier — Frei Frachtführer"],
                        ["FAS","Free Alongside Ship — Frei Längsseite Schiff"],
                        ["FOB","Free On Board — Frei an Bord"],
                        ["CFR","Cost and Freight — Kosten und Fracht"],
                        ["CIF","Cost Insurance Freight — Kosten, Versicherung, Fracht"],
                        ["CPT","Carriage Paid To — Frachtfrei"],
                        ["CIP","Carriage Insurance Paid — Frachtfrei versichert"],
                        ["DAP","Delivered At Place — Geliefert benannter Ort"],
                        ["DPU","Delivered at Place Unloaded — Geliefert entladen"],
                        ["DDP","Delivered Duty Paid — Geliefert verzollt"],
                      ].map(([code, label]) => (
                        <option key={code} value={code}>{code} — {label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="inv-form-actions">
                  <button className="inv-btn" type="submit" disabled={saving}>
                    {saving ? "Speichern..." : "Charge speichern"}
                  </button>
                  <button className="inv-btn-cancel" type="button" onClick={() => setShowForm(false)}>Abbrechen</button>
                </div>
              </form>
            </div>
          )}

          {/* Tabelle */}
          {loading ? (
            <div className="inv-loading">Chargen werden geladen…</div>
          ) : charges.length === 0 ? (
            <div className="inv-empty">
              Noch keine Chargen erfasst. Klicken Sie auf „+ Neue Charge melden" um Ihre erste Lagercharge anzulegen.
            </div>
          ) : (
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Charge-ID</th>
                    <th>Material / Spezifikation</th>
                    <th>Menge</th>
                    <th>Lager</th>
                    <th>CBAM — CO₂/t</th>
                    <th>Herkunft</th>
                    <th>Incoterms</th>
                    <th>Status</th>
                    <th>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#374151" }}>
                          {c.id.slice(0, 14)}…
                        </div>
                        {c.schmelzNr && (
                          <div style={{ fontSize: 10.5, color: "#9ca3af" }}>{c.schmelzNr}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{c.material}</div>
                        {c.spec && <div style={{ fontSize: 11.5, color: "#6b7280" }}>{c.spec}</div>}
                      </td>
                      <td style={{ fontFamily: "'IBM Plex Mono',monospace" }}>
                        {parseFloat(c.quantity).toLocaleString("de-DE")} {c.unit}
                      </td>
                      <td style={{ fontSize: 12.5, color: "#374151" }}>{c.warehouseLocation || "—"}</td>
                      <td>
                        {c.co2PerTonne ? (
                          <div>
                            <span className="inv-co2-val">
                              {parseFloat(c.co2PerTonne).toLocaleString("de-DE", { maximumFractionDigits: 2 })}
                            </span>
                            <span style={{ fontSize: 10.5, color: "#6b7280" }}> kg/t</span>
                            {c.productionSiteId && (
                              <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'IBM Plex Mono',monospace" }}>
                                {c.productionSiteId}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inv-warn">⚠ Fehlt</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12.5 }}>{c.countryOfOrigin || "—"}</td>
                      <td style={{ fontSize: 12, fontFamily: "'IBM Plex Mono',monospace" }}>{c.incoterms || "—"}</td>
                      <td>
                        <span className="inv-status" style={{ background: STATUS_COLOR[c.status] ?? "#6b7280" }}>
                          {STATUS_LABEL[c.status] ?? c.status}
                        </span>
                        {c.lot && (
                          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>
                            {c.lot.commodity.slice(0, 20)}
                          </div>
                        )}
                      </td>
                      <td>
                        {c.certificate31 ? (
                          <button className="inv-action">3.1-Zeugnis</button>
                        ) : (
                          <button className="inv-action" style={{ color: "#9ca3af" }}>+ Hochladen</button>
                        )}
                        {c.status === "AVAILABLE" && (
                          <button className="inv-del" onClick={() => void deleteCharge(c.id)}>Löschen</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
