"use client";

/**
 * /dashboard/seller — Seller Hub
 *
 * Zeigt alle offenen Lots, erlaubt Registrierung in COLLECTION-Phase,
 * verlinkt auf Auktionsseite in PROPOSAL/REDUCTION.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/NotificationBell";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────

interface LotRow {
  id:          string;
  commodity:   string;
  quantity:    string;
  unit:        string;
  phase:       "COLLECTION" | "PROPOSAL" | "REDUCTION" | "CONCLUSION";
  startPrice:  string | null;
  currentBest: string | null;
  auctionEnd:  string | null;
  createdAt:   string;
  isRegistered: boolean;
  _count: { bids: number; registrations: number };
}

interface KycInfo {
  verificationStatus: "GUEST" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  walletBalance:      string;
  role:               string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtEur = (v: string | null) =>
  v == null ? "—"
  : new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(v));

const PHASE_LABEL: Record<string, string> = {
  COLLECTION: "Registrierung",
  PROPOSAL:   "Angebote",
  REDUCTION:  "Reduktion",
  CONCLUSION: "Abgeschlossen",
};

const PHASE_COLOR: Record<string, string> = {
  COLLECTION: "#154194",
  PROPOSAL:   "#d97706",
  REDUCTION:  "#dc2626",
  CONCLUSION: "#6b7280",
};

// ── Component ──────────────────────────────────────────────────────────────────

export function SellerLotsClient() {
  const router = useRouter();
  const [token,        setToken]        = useState("");
  const [hydrated,     setHydrated]     = useState(false);
  const [lots,         setLots]         = useState<LotRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [kyc,          setKyc]          = useState<KycInfo | null>(null);
  const [registering,  setRegistering]  = useState<string | null>(null);
  const [filter,       setFilter]       = useState<"all" | "mine" | "active">("all");

  // ── Token + Auth-Redirect ──────────────────────────────────────────
  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    setHydrated(true);
    if (!tkn) router.replace("/login");
  }, [router]);

  // ── KYC-Status ────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setKyc({ verificationStatus: d.verificationStatus ?? "GUEST", walletBalance: d.walletBalance ?? "0", role: d.role ?? "" }); })
      .catch(() => {});
  }, [token]);

  // ── Lots laden ────────────────────────────────────────────────────
  const loadLots = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/auction/lots", { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return;
      const d = await r.json();
      setLots(d.lots ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadLots(); }, [loadLots]);

  // ── Registrierung ────────────────────────────────────────────────
  async function registerForLot(lotId: string) {
    if (!token || registering) return;
    setRegistering(lotId);
    try {
      const r = await fetch(`/api/auction/lots/${lotId}/register`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (r.ok) {
        toast.success("Registrierung erfolgreich", {
          style: { background: "#f0fdf4", border: "1px solid #16a34a", color: "#14532d" },
        });
        setLots((prev) => prev.map((l) => l.id === lotId ? { ...l, isRegistered: true } : l));
      } else {
        toast.error(d.error ?? "Registrierung fehlgeschlagen", {
          style: { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" },
        });
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setRegistering(null);
    }
  }

  // ── Filter ────────────────────────────────────────────────────────
  const displayed = lots.filter((l) => {
    if (filter === "mine")   return l.isRegistered;
    if (filter === "active") return l.phase === "PROPOSAL" || l.phase === "REDUCTION";
    return true;
  });

  const isVerified = kyc?.verificationStatus === "VERIFIED";

  return (
    <>
      <style>{`
        .sl-root { font-family:"IBM Plex Sans",Helvetica Neue,Arial,sans-serif; min-height:100vh; background:#f9fafb; color:#1a1a1a; }

        /* Header */
        .sl-hdr { background:#154194; height:56px; padding:0 28px; display:flex; align-items:center; justify-content:space-between; gap:12px; position:sticky; top:0; z-index:50; }
        .sl-logo { font-size:15px; font-weight:700; color:#fff; letter-spacing:.06em; }
        .sl-logo-sub { font-size:11px; font-weight:300; color:rgba(255,255,255,.6); margin-left:8px; }
        .sl-hdr-right { display:flex; align-items:center; gap:10px; }
        .sl-hdr-link { font-size:12px; color:rgba(255,255,255,.8); text-decoration:none; padding:5px 10px; border:1px solid rgba(255,255,255,.3); transition:background .15s; }
        .sl-hdr-link:hover { background:rgba(255,255,255,.15); }

        /* Page */
        .sl-page { max-width:1080px; margin:0 auto; padding:32px 24px 80px; }

        /* KYC Banner */
        .sl-kyc-warn { background:#fffbeb; border:1px solid #fcd34d; padding:14px 20px; margin-bottom:24px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
        .sl-kyc-warn-text { font-size:13px; color:#92400e; flex:1; }
        .sl-kyc-warn-link { padding:8px 16px; background:#154194; color:#fff; font-size:12px; font-weight:700; text-decoration:none; white-space:nowrap; transition:background .15s; }
        .sl-kyc-warn-link:hover { background:#1a52c2; }

        /* Heading */
        .sl-heading { font-size:22px; font-weight:700; color:#111827; margin-bottom:4px; }
        .sl-sub { font-size:13px; color:#6b7280; margin-bottom:24px; }

        /* Filters */
        .sl-filters { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
        .sl-ftab { padding:7px 16px; border:1px solid #d1d5db; background:#fff; font-size:12.5px; color:#374151; cursor:pointer; font-weight:500; transition:all .15s; }
        .sl-ftab.active { background:#154194; color:#fff; border-color:#154194; }
        .sl-ftab:hover:not(.active) { background:#f3f4f6; }

        /* Table */
        .sl-table-wrap { overflow-x:auto; }
        .sl-table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e5e7eb; font-size:13px; }
        .sl-table th { padding:11px 14px; text-align:left; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#9ca3af; border-bottom:2px solid #154194; background:#fff; white-space:nowrap; }
        .sl-table td { padding:14px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
        .sl-table tr:last-child td { border-bottom:none; }
        .sl-table tr:hover td { background:#fafafa; }

        /* Phase badge */
        .sl-phase { display:inline-block; padding:3px 9px; font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:#fff; }

        /* Action button */
        .sl-btn-reg { padding:7px 14px; background:#154194; color:#fff; font-size:12px; font-weight:700; border:none; cursor:pointer; white-space:nowrap; transition:background .15s,transform .1s; }
        .sl-btn-reg:hover:not(:disabled) { background:#1a52c2; }
        .sl-btn-reg:active:not(:disabled) { transform:scale(.97); }
        .sl-btn-reg:disabled { opacity:.4; cursor:not-allowed; }
        .sl-btn-goto { padding:7px 14px; background:#fff; color:#154194; font-size:12px; font-weight:700; border:1.5px solid #154194; text-decoration:none; display:inline-block; white-space:nowrap; transition:all .15s; }
        .sl-btn-goto:hover { background:#154194; color:#fff; }
        .sl-badge-reg { display:inline-flex; align-items:center; gap:5px; padding:5px 10px; background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; font-size:11.5px; font-weight:600; }

        /* Empty */
        .sl-empty { padding:60px 24px; text-align:center; color:#9ca3af; font-size:13px; background:#fff; border:1px solid #e5e7eb; }

        /* Loading */
        .sl-loading { color:#9ca3af; font-size:13px; padding:40px 24px; text-align:center; }
      `}</style>

      <div className="sl-root">
        {/* Header */}
        <header className="sl-hdr">
          <div>
            <span className="sl-logo">EUCX</span>
            <span className="sl-logo-sub">European Union Commodity Exchange</span>
          </div>
          <div className="sl-hdr-right">
            {token && <NotificationBell token={token} />}
            <a href="/dashboard/contracts" className="sl-hdr-link">Verträge</a>
            <a href="/dashboard/settings/verification" className="sl-hdr-link">KYC</a>
            <a href="/dashboard/settings/notifications" className="sl-hdr-link">Einstellungen</a>
          </div>
        </header>

        <div className="sl-page">

          {/* KYC-Warnung */}
          {kyc && !isVerified && (
            <div className="sl-kyc-warn">
              <div className="sl-kyc-warn-text">
                {kyc.verificationStatus === "GUEST" && "Identitätsprüfung noch nicht gestartet — Gebote sind erst nach KYC-Verifizierung möglich."}
                {kyc.verificationStatus === "PENDING_VERIFICATION" && "KYC-Dokumente eingereicht — Prüfung läuft (in der Regel unter 24h). Lots können Sie bereits einsehen."}
                {kyc.verificationStatus === "REJECTED" && "KYC abgelehnt — bitte kontaktieren Sie den Support oder laden Sie neue Dokumente hoch."}
                {kyc.verificationStatus === "SUSPENDED" && "Konto gesperrt — bitte kontaktieren Sie den Support."}
              </div>
              {(kyc.verificationStatus === "GUEST" || kyc.verificationStatus === "REJECTED") && (
                <a href="/dashboard/settings/verification" className="sl-kyc-warn-link">
                  Jetzt verifizieren →
                </a>
              )}
            </div>
          )}

          <div className="sl-heading">Verfügbare Ausschreibungen</div>
          <div className="sl-sub">Registrieren Sie sich für Auktionen in der Sammelphase und geben Sie Angebote ab.</div>

          {/* Filter-Tabs */}
          <div className="sl-filters">
            {(["all", "active", "mine"] as const).map((f) => (
              <button
                key={f}
                className={`sl-ftab${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all"    && `Alle (${lots.length})`}
                {f === "active" && `Aktiv (${lots.filter((l) => l.phase === "PROPOSAL" || l.phase === "REDUCTION").length})`}
                {f === "mine"   && `Meine Registrierungen (${lots.filter((l) => l.isRegistered).length})`}
              </button>
            ))}
            <button
              className="sl-ftab"
              onClick={loadLots}
              style={{ marginLeft: "auto", color: "#154194", borderColor: "#154194" }}
            >
              ↻ Aktualisieren
            </button>
          </div>

          {/* Tabelle */}
          {loading ? (
            <div className="sl-loading">Wird geladen…</div>
          ) : displayed.length === 0 ? (
            <div className="sl-empty">
              {filter === "mine"
                ? "Sie sind noch bei keiner Auktion registriert."
                : filter === "active"
                ? "Aktuell keine aktiven Auktionen."
                : "Keine offenen Ausschreibungen vorhanden."}
            </div>
          ) : (
            <div className="sl-table-wrap">
              <table className="sl-table">
                <thead>
                  <tr>
                    <th>Ware</th>
                    <th>Menge</th>
                    <th>Phase</th>
                    <th>Limit / Bestes</th>
                    <th>Auktionsende</th>
                    <th>Bieter</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((lot) => {
                    const canRegister   = lot.phase === "COLLECTION" && !lot.isRegistered && isVerified;
                    const canGoToAction = (lot.phase === "PROPOSAL" || lot.phase === "REDUCTION") && lot.isRegistered;
                    const phaseColor    = PHASE_COLOR[lot.phase] ?? "#6b7280";

                    return (
                      <tr key={lot.id}>
                        <td style={{ fontWeight: 600, color: "#111827" }}>{lot.commodity}</td>
                        <td style={{ color: "#374151" }}>
                          {Number(lot.quantity).toLocaleString("de-DE")} {lot.unit}
                        </td>
                        <td>
                          <span className="sl-phase" style={{ background: phaseColor }}>
                            {PHASE_LABEL[lot.phase]}
                          </span>
                        </td>
                        <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }}>
                          {lot.currentBest ? (
                            <><strong>{fmtEur(lot.currentBest)}</strong></>
                          ) : lot.startPrice ? (
                            <span style={{ color: "#6b7280" }}>{fmtEur(lot.startPrice)}</span>
                          ) : (
                            <span style={{ color: "#9ca3af" }}>—</span>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                          {lot.auctionEnd
                            ? new Date(lot.auctionEnd).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </td>
                        <td style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
                          {lot._count.bids}
                        </td>
                        <td>
                          {lot.isRegistered && (lot.phase === "COLLECTION") && (
                            <span className="sl-badge-reg">✓ Registriert</span>
                          )}
                          {canGoToAction && (
                            <a href={`/dashboard/seller/auction/${lot.id}`} className="sl-btn-goto">
                              Zur Auktion →
                            </a>
                          )}
                          {canRegister && (
                            <button
                              className="sl-btn-reg"
                              disabled={registering === lot.id}
                              onClick={() => registerForLot(lot.id)}
                            >
                              {registering === lot.id ? "…" : "Registrieren"}
                            </button>
                          )}
                          {!canRegister && !canGoToAction && !lot.isRegistered && lot.phase === "COLLECTION" && !isVerified && (
                            <span style={{ fontSize: 11.5, color: "#9ca3af" }}>KYC erforderlich</span>
                          )}
                          {(lot.phase === "PROPOSAL" || lot.phase === "REDUCTION") && !lot.isRegistered && (
                            <span style={{ fontSize: 11.5, color: "#9ca3af" }}>Nicht registriert</span>
                          )}
                          {lot.phase === "CONCLUSION" && lot.isRegistered && (
                            <a href={`/dashboard/seller/auction/${lot.id}`} className="sl-btn-goto" style={{ opacity: .7 }}>
                              Ergebnis →
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
