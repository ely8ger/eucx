"use client";

import Link        from "next/link";
import { usePathname } from "next/navigation";
import { EucxHeader }  from "@/components/layout/EucxHeader";

const F    = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";

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
      <div style={{ display: "flex", minHeight: "calc(100vh - 56px)", background: "#f7f9fc", fontFamily: F }}>

        {/* Sidebar */}
        <nav style={{
          width: 232, flexShrink: 0,
          background: "#fff",
          borderRight: "1px solid #d4d8e0",
          display: "flex", flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          alignSelf: "flex-start",
        }}>
          {/* Zurück */}
          <Link
            href="/dashboard/profile"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "16px 20px",
              fontSize: 11.5, fontWeight: 500,
              color: "#7a8aa0",
              textDecoration: "none",
              borderBottom: "1px solid #e8eaf0",
              letterSpacing: "0.01em",
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = BLUE)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#7a8aa0")}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Zurück zum Profil
          </Link>

          {/* Label */}
          <div style={{
            padding: "14px 20px 6px",
            fontSize: 9, fontWeight: 700, letterSpacing: ".12em",
            textTransform: "uppercase", color: "#9ca3af",
          }}>
            Einstellungen
          </div>

          {/* Nav-Items */}
          {NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 20px",
                  textDecoration: "none",
                  borderLeft: `3px solid ${isActive ? BLUE : "transparent"}`,
                  background: isActive ? "#eff4ff" : "transparent",
                  transition: "background 0.1s, border-color 0.1s",
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "#f5f7fb"; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; } }}
              >
                <span style={{ color: isActive ? BLUE : "#7a8aa0", marginTop: 2, flexShrink: 0 }}>
                  {item.icon}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? BLUE : "#0d1b2a", lineHeight: 1.3 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{item.sub}</div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
          <BottomNav pathname={pathname} />
        </main>
      </div>
    </>
  );
}

const BLUE_TEXT = "#154194";
const MUTED     = "#7a8aa0";
const BORDER    = "#d4d8e0";
const TEXT      = "#0d1b2a";

function BottomNav({ pathname }: { pathname: string }) {
  const others = NAV.filter((item) => item.href !== pathname && !pathname.startsWith(item.href + "/"));
  if (others.length === 0) return null;

  return (
    <div style={{
      maxWidth: 700, margin: "0 auto",
      padding: "0 32px 48px",
      fontFamily: F,
    }}>
      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 28, marginTop: 8 }}>
        <p style={{
          margin: "0 0 12px", fontSize: 11, fontWeight: 700,
          color: MUTED, textTransform: "uppercase" as const, letterSpacing: ".08em",
        }}>
          Weitere Einstellungen
        </p>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${others.length}, 1fr)`, gap: 10 }}>
          {others.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block", padding: "16px 18px",
                background: "#fff", border: `1px solid ${BORDER}`,
                textDecoration: "none",
                transition: "border-color .15s, box-shadow .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = BLUE_TEXT;
                e.currentTarget.style.boxShadow   = "0 2px 8px rgba(21,65,148,.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.boxShadow   = "none";
              }}
            >
              <div style={{ color: BLUE_TEXT, marginBottom: 8 }}>{item.icon}</div>
              <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: F }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: 11.5, color: MUTED, fontFamily: F }}>{item.sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
