"use client";

import { useState, useEffect } from "react";
import { EucxHeader }          from "@/components/layout/EucxHeader";
import { KycStatusBadge }      from "@/components/KycStatusBadge";

const F      = "'IBM Plex Sans', Arial, sans-serif";
const BLUE   = "#154194";
const BLUE2  = "#0f3070";
const TEXT   = "#0d1b2a";
const MUTED  = "#7a8aa0";
const BORDER = "#d4d8e0";
const BG     = "#f7f9fc";
const GREEN  = "#16a34a";
const RED    = "#dc2626";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return document.cookie.match(/access_token=([^;]+)/)?.[1] ?? localStorage.getItem("accessToken") ?? "";
}

const COUNTRY_NAMES: Record<string, string> = {
  DE: "Deutschland", AT: "Österreich", CH: "Schweiz", PL: "Polen",
  FR: "Frankreich", IT: "Italien", ES: "Spanien", NL: "Niederlande",
  BE: "Belgien",   CZ: "Tschechien", SK: "Slowakei", HU: "Ungarn",
};

interface OrgData {
  id:                  string;
  name:                string;
  isVerified:          boolean;
  taxId:               string;
  lei:                 string | null;
  country:             string;
  city:                string;
  street:              string | null;
  postalCode:          string | null;
  phone:               string | null;
  hrb:                 string | null;
  legalForm:           string | null;
  foundedAt:           string | null;
  contactName:         string | null;
  contactPosition:     string | null;
  isGeschaeftsfuehrer: boolean | null;
}

interface MeData {
  email:              string;
  role:               string;
  verificationStatus: string;
  organization:       OrgData;
}

type Tab = "unternehmen" | "ansprechpartner";

// ── Sub-Navigation ─────────────────────────────────────────────────────────────

const PROFILE_TABS: { id: Tab; label: string }[] = [
  { id: "unternehmen",    label: "Unternehmen"    },
  { id: "ansprechpartner", label: "Ansprechpartner" },
];

const EXTERNAL_LINKS = [
  { label: "Sicherheit",         href: "/dashboard/settings/security"      },
  { label: "Benachrichtigungen", href: "/dashboard/settings/notifications"  },
  { label: "KYC-Verifikation",   href: "/dashboard/settings/verification"   },
];

// ── ReadonlyField ──────────────────────────────────────────────────────────────

function RoField({ label, value, note }: { label: string; value?: string | null; note?: string }) {
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, padding: "13px 0" }}>
      <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: MUTED, fontFamily: F, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 14, color: value ? TEXT : MUTED, fontFamily: F, fontStyle: value ? "normal" : "italic" }}>
        {value ?? "—"}
      </p>
      {note && <p style={{ margin: "3px 0 0", fontSize: 11, color: MUTED, fontFamily: F }}>{note}</p>}
    </div>
  );
}

// ── Hauptkomponente ────────────────────────────────────────────────────────────

export function ProfileClient() {
  const [me,  setMe]  = useState<MeData | null>(null);
  const [tab, setTab] = useState<Tab>("unternehmen");

  useEffect(() => {
    const tkn = getToken();
    if (!tkn) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${tkn}` } })
      .then((r) => r.json() as Promise<MeData>)
      .then((d) => setMe(d))
      .catch(() => {});
  }, []);

  const org = me?.organization;

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) : null;

  return (
    <>
      <EucxHeader />

      <div style={{ minHeight: "calc(100vh - 56px)", background: BG }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 80px", fontFamily: F }}>

        {/* Titel */}
        <div style={{ marginBottom: 24, borderLeft: `4px solid ${BLUE}`, paddingLeft: 16 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 300, color: TEXT }}>Profil</h1>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
            Unternehmens- und Kontaktdaten. Änderungen an Unternehmensdaten müssen beim Support angefragt werden.
          </p>
        </div>

        {/* Status-Banner */}
        {me && (
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>{org?.name}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{me.email}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                padding: "3px 12px", fontSize: 11, fontWeight: 700,
                background: me.role === "SELLER" ? "#fef3c7" : "#e8edf8",
                color: me.role === "SELLER" ? "#92400e" : BLUE,
              }}>
                {me.role === "SELLER" ? "Verkäufer" : "Käufer"}
              </span>
              <KycStatusBadge status={me.verificationStatus as "GUEST" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED"} />
            </div>
          </div>
        )}

        {/* Tab-Navigation + externe Links */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderBottom: "none", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex" }}>
            {PROFILE_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  height: 44, padding: "0 20px", border: "none", background: "none",
                  fontSize: 13, fontWeight: tab === t.id ? 700 : 400, fontFamily: F,
                  color: tab === t.id ? BLUE : MUTED,
                  borderBottom: `3px solid ${tab === t.id ? BLUE : "transparent"}`,
                  cursor: "pointer", transition: "color .15s, border-color .15s",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", padding: "0 12px", gap: 4 }}>
            {EXTERNAL_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={{
                  fontSize: 12, color: MUTED, textDecoration: "none", padding: "0 8px", height: 44,
                  display: "inline-flex", alignItems: "center", transition: "color .15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
              >
                {l.label} →
              </a>
            ))}
          </div>
        </div>

        {/* Tab-Content */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderTop: `3px solid ${BLUE}`, padding: "0 24px 24px" }}>

          {/* ── Unternehmen ──────────────────────────────────────────────── */}
          {tab === "unternehmen" && org && (
            <>
              <div style={{ padding: "16px 0 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".06em" }}>
                  Unternehmensdaten
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: org.isVerified ? GREEN : "#d97706" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: org.isVerified ? GREEN : "#d97706" }}>
                    {org.isVerified ? "Unternehmen verifiziert" : "Ausstehend"}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <div>
                  <RoField label="Unternehmensname"      value={org.name} />
                  <RoField label="Rechtsform"            value={org.legalForm} />
                  <RoField label="Gründungsdatum"        value={fmtDate(org.foundedAt)} />
                  <RoField label="Handelsregisternummer" value={org.hrb} />
                </div>
                <div>
                  <RoField label="USt-IdNr."    value={org.taxId} />
                  <RoField label="LEI"          value={org.lei} note="MiFID II — Legal Entity Identifier" />
                  <RoField label="Telefon"      value={org.phone} />
                  <RoField label="Land"         value={COUNTRY_NAMES[org.country] ?? org.country} />
                </div>
              </div>

              <RoField
                label="Anschrift"
                value={[org.street, [org.postalCode, org.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
              />

              <div style={{
                marginTop: 20, padding: "12px 14px",
                background: "#f8fafc", border: "1px solid #e5e7eb",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              }}>
                <p style={{ margin: 0, fontSize: 12, color: MUTED, fontFamily: F, lineHeight: 1.55 }}>
                  Unternehmensdaten sind nach der Registrierung aus Compliance-Gründen gesperrt.
                  Für Änderungen wenden Sie sich bitte an unseren Support.
                </p>
                <a
                  href="mailto:compliance@eucx.eu"
                  style={{
                    flexShrink: 0, fontSize: 12, fontWeight: 600, color: BLUE,
                    textDecoration: "none", whiteSpace: "nowrap",
                    padding: "6px 14px", border: `1px solid ${BLUE}`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  Support kontaktieren →
                </a>
              </div>
            </>
          )}

          {/* ── Ansprechpartner ──────────────────────────────────────────── */}
          {tab === "ansprechpartner" && org && (
            <>
              <div style={{ padding: "16px 0 4px" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".06em" }}>
                  Handelsberechtigter Ansprechpartner
                </p>
              </div>

              {/* Vollmacht-Status */}
              {org.isGeschaeftsfuehrer === false && (
                <div style={{
                  margin: "12px 0", padding: "12px 14px",
                  background: "#fffbeb", border: "1px solid #fde68a", borderLeft: "4px solid #d97706",
                }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#92400e", fontFamily: F }}>
                    Handlungsvollmacht erforderlich
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#78350f", fontFamily: F, lineHeight: 1.55 }}>
                    Da der eingetragene Ansprechpartner kein Geschäftsführer ist, muss im Rahmen der
                    KYC-Verifikation eine Handlungsvollmacht hochgeladen werden.
                  </p>
                  <a
                    href="/dashboard/settings/verification"
                    style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 600, color: "#92400e", textDecoration: "underline" }}
                  >
                    Zur KYC-Verifikation →
                  </a>
                </div>
              )}

              {org.isGeschaeftsfuehrer === true && (
                <div style={{
                  margin: "12px 0", padding: "10px 14px",
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <p style={{ margin: 0, fontSize: 12.5, color: GREEN, fontFamily: F, fontWeight: 600 }}>
                    Einzelvertretungsmacht bestätigt — keine Vollmacht erforderlich
                  </p>
                </div>
              )}

              <RoField label="Name"                  value={org.contactName} />
              <RoField label="Funktion / Position"   value={org.contactPosition} />
              <RoField label="Vertretungsberechtigung"
                value={
                  org.isGeschaeftsfuehrer === true  ? "Geschäftsführer / Einzelvertretungsmacht" :
                  org.isGeschaeftsfuehrer === false ? "Bevollmächtigter (Vollmacht erforderlich)" :
                  null
                }
              />
              <RoField label="E-Mail (Login)"        value={me?.email} note="Identisch mit dem Anmelde-E-Mail-Konto" />

              <div style={{
                marginTop: 20, padding: "12px 14px",
                background: "#f8fafc", border: "1px solid #e5e7eb",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              }}>
                <p style={{ margin: 0, fontSize: 12, color: MUTED, fontFamily: F, lineHeight: 1.55 }}>
                  Änderungen des Ansprechpartners (z.B. bei Personalwechsel) erfordern eine neue
                  Bevollmächtigung und werden durch unser Compliance-Team geprüft.
                </p>
                <a
                  href="mailto:compliance@eucx.eu"
                  style={{
                    flexShrink: 0, fontSize: 12, fontWeight: 600, color: BLUE,
                    textDecoration: "none", whiteSpace: "nowrap",
                    padding: "6px 14px", border: `1px solid ${BLUE}`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  Änderung anfragen →
                </a>
              </div>
            </>
          )}

        </div>

        {/* Schnellzugriff auf Einstellungen */}
        <div style={{ marginTop: 20 }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".06em", fontFamily: F }}>
            Weitere Einstellungen
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {([
              {
                label: "Sicherheit", sub: "2FA, Passwort, Sitzungen",
                href: "/dashboard/settings/security",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" style={{ color: BLUE }}>
                    <path d="M8 1.5L14 4.5v4c0 3.5-2.5 6-6 7C2.5 14.5 0 12 0 8.5v-4L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                label: "KYC-Verifikation", sub: "Dokumente & Freischaltung",
                href: "/dashboard/settings/verification",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" style={{ color: BLUE }}>
                    <rect x="2" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="12.5" cy="11.5" r="2.5" fill="#fff" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M11.5 11.5l.8.8 1.2-1.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                label: "Benachrichtigungen", sub: "E-Mail & Plattform-Alerts",
                href: "/dashboard/settings/notifications",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" style={{ color: BLUE }}>
                    <path d="M8 1.5a5 5 0 00-5 5v3l-1.5 2h13L13 9.5v-3a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    <path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                ),
              },
            ] as { label: string; sub: string; href: string; icon: React.ReactNode }[]).map((card) => (
              <a
                key={card.href}
                href={card.href}
                style={{
                  display: "block", padding: "16px 18px",
                  background: "#fff", border: `1px solid ${BORDER}`,
                  textDecoration: "none",
                  transition: "border-color .15s, box-shadow .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = "0 2px 8px rgba(21,65,148,.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ marginBottom: 8 }}>{card.icon}</div>
                <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: F }}>{card.label}</p>
                <p style={{ margin: 0, fontSize: 11.5, color: MUTED, fontFamily: F }}>{card.sub}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
          <p style={{ margin: 0, fontSize: 11, color: "#aab0bb", fontFamily: F }}>
            © 2026 EUCX GmbH · Frankfurt am Main · Reguliert durch die BaFin · MiFID II OTF-Zulassung
          </p>
        </footer>
      </div>
      </div>
    </>
  );
}
