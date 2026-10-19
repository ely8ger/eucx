"use client";

import Link           from "next/link";
import { usePathname } from "next/navigation";
import { EucxHeader }  from "@/components/layout/EucxHeader";

const F    = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";
const MUTED  = "#7a8aa0";
const BORDER = "#d4d8e0";
const TEXT   = "#0d1b2a";
const BG     = "#f7f9fc";

const NAV = [
  {
    href:  "/dashboard/settings/security",
    label: "Sicherheit",
    sub:   "2FA, Passwort, Sitzungen",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L4 7v5c0 5.5 3.8 9.5 8 10.5 4.2-1 8-5 8-10.5V7L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href:  "/dashboard/settings/verification",
    label: "KYC-Verifikation",
    sub:   "Dokumente & Freischaltung",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="12.5" cy="11.5" r="2.5" fill="#fff" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M11.5 11.5l.8.8 1.2-1.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href:  "/dashboard/settings/notifications",
    label: "Benachrichtigungen",
    sub:   "E-Mail & Plattform-Alerts",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5a5 5 0 00-5 5v3l-1.5 2h13L13 9.5v-3a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <EucxHeader />
      <div style={{ flex: 1 }}>
        {children}
      </div>
      <BottomNav pathname={pathname} />
      <PageFooter />
    </div>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <div style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, fontFamily: F }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 32px" }}>
        <p style={{
          margin: 0,
          padding: "18px 0 12px",
          fontSize: 10,
          fontWeight: 700,
          color: MUTED,
          textTransform: "uppercase" as const,
          letterSpacing: ".09em",
        }}>
          Kontoeinstellungen
        </p>
        <div style={{ display: "flex", borderTop: `1px solid ${BORDER}` }}>
          {NAV.map((item, i) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 0",
                  paddingRight: i < NAV.length - 1 ? 16 : 0,
                  borderRight: i < NAV.length - 1 ? `1px solid ${BORDER}` : "none",
                  marginRight: i < NAV.length - 1 ? 16 : 0,
                  textDecoration: "none",
                  borderTop: `2px solid ${isActive ? BLUE : "transparent"}`,
                  marginTop: -1,
                  transition: "border-color .15s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.borderTopColor = "#8ba8d4";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.borderTopColor = "transparent";
                }}
              >
                <div style={{
                  width: 30, height: 30, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isActive ? "#edf2fc" : BG,
                  color: isActive ? BLUE : MUTED,
                  border: `1px solid ${isActive ? "#c8d9f4" : BORDER}`,
                }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: isActive ? 700 : 600, color: isActive ? BLUE : TEXT, fontFamily: F }}>{item.label}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 10.5, color: MUTED, fontFamily: F }}>{item.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PageFooter() {
  return (
    <div style={{ background: "#0b1e36", fontFamily: F }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 32px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px 0", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.5)", letterSpacing: ".06em", textTransform: "uppercase" as const }}>
            EUCX — European Union Commodity Exchange
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", letterSpacing: ".04em" }}>
            MiFID II · OTF-Zugelassen · BaFin-reguliert
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
          {[
            { label: "Impressum",          href: "/impressum" },
            { label: "Datenschutz",        href: "/datenschutz" },
            { label: "AGB",                href: "/agb" },
            { label: "Compliance",         href: "/insights/regulatorik" },
            { label: "Passwort vergessen", href: "/login?reset=1" },
          ].map(({ label, href }) => (
            <a key={label} href={href}
              style={{ fontSize: 11, color: "rgba(255,255,255,.4)", textDecoration: "none", transition: "color .15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,.85)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.4)"; }}>
              {label}
            </a>
          ))}
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 10, color: "rgba(255,255,255,.25)" }}>
          © 2026 EUCX GmbH · Frankfurt am Main
        </p>
      </div>
    </div>
  );
}
