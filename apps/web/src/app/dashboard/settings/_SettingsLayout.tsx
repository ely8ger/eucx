"use client";

import Link           from "next/link";
import { usePathname } from "next/navigation";
import { EucxHeader }  from "@/components/layout/EucxHeader";

const F = "'IBM Plex Sans', Arial, sans-serif";

const NAV = [
  {
    href:  "/dashboard/settings/security",
    label: "Sicherheit",
    sub:   "2FA, Passwort, Sitzungen",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5a5 5 0 00-5 5v3l-1.5 2h13L13 9.5v-3a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <EucxHeader />
      {children}
      <BottomNav pathname={pathname} />
      <PageFooter />
    </>
  );
}

const BLUE_TEXT = "#154194";
const MUTED     = "#7a8aa0";
const BORDER    = "#d4d8e0";
const TEXT      = "#0d1b2a";

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 32px 48px", fontFamily: F }}>
      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 28, marginTop: 8 }}>
        <p style={{
          margin: "0 0 12px", fontSize: 12, fontWeight: 700,
          color: MUTED, textTransform: "uppercase" as const, letterSpacing: ".06em",
        }}>
          Weitere Einstellungen
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "block", padding: "16px 18px",
                  background: "#fff",
                  border: `1px solid ${isActive ? BLUE_TEXT : BORDER}`,
                  boxShadow: isActive ? "0 2px 8px rgba(21,65,148,.1)" : "none",
                  textDecoration: "none",
                  transition: "border-color .15s, box-shadow .15s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = BLUE_TEXT;
                    e.currentTarget.style.boxShadow   = "0 2px 8px rgba(21,65,148,.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = BORDER;
                    e.currentTarget.style.boxShadow   = "none";
                  }
                }}
              >
                <div style={{ color: BLUE_TEXT, marginBottom: 8 }}>{item.icon}</div>
                <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: F }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 11.5, color: MUTED, fontFamily: F }}>{item.sub}</p>
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
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 32px 48px", fontFamily: F }}>
      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", marginBottom: 8 }}>
          {[
            { label: "Impressum",          href: "/impressum" },
            { label: "Datenschutz",        href: "/datenschutz" },
            { label: "AGB",                href: "/agb" },
            { label: "Compliance",         href: "/insights/regulatorik" },
            { label: "Passwort vergessen", href: "/login?reset=1" },
          ].map(({ label, href }) => (
            <a key={label} href={href}
              style={{ fontSize: 11, color: MUTED, textDecoration: "none" }}
              onMouseEnter={e => { e.currentTarget.style.color = BLUE_TEXT; e.currentTarget.style.fontWeight = "600"; }}
              onMouseLeave={e => { e.currentTarget.style.color = MUTED;     e.currentTarget.style.fontWeight = "400"; }}>
              {label}
            </a>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 11, color: "#aab0bb" }}>
          © 2026 EUCX GmbH · Frankfurt am Main · Reguliert durch die BaFin · MiFID II OTF-Zulassung
        </p>
      </div>
    </div>
  );
}
