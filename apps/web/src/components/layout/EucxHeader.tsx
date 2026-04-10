"use client";

import { useState, useEffect } from "react";
import { usePathname }         from "next/navigation";
import { Shield, LogOut }      from "lucide-react";
import { EucxLogo }            from "@/components/logo/EucxLogo";
import { LanguageSwitcher }    from "@/components/LanguageSwitcher";
import { NotificationBell }    from "@/components/NotificationBell";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BLUE   = "#154194";
const BLUE2  = "#0f3070";
const ACTIVE = "#002D72";
const F      = "'IBM Plex Sans', Arial, sans-serif";
const DARK   = "#0d1b2a";
const MUTED  = "#6b7280";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  label:        string;
  href:         string;
  activePrefix?: string;
  disabled?:    boolean;
}

interface MeUser {
  email:              string;
  role:               string;
  verificationStatus?: string;
  walletBalance?:     string;
  walletReserved?:    string;
  organization?:      { name?: string; isVerified?: boolean };
}

interface BreadcrumbConfig {
  area:      string;
  areaHref:  string;
  page:      string;
  pageHref:  string;
  detail?:   string;
}

// ─── Navigation Contexts ──────────────────────────────────────────────────────
//
// Regel: Der Header definiert den BEREICH (5 Punkte), die Breadcrumb den PFAD.
// Egal wie tief man in einer Unterseite ist — die 5 Hauptpunkte bleiben stabil.
//
const NAV: Record<string, NavItem[]> = {
  buyer: [
    { label: "Übersicht",      href: "/dashboard/buyer",         activePrefix: "/dashboard/buyer" },
    { label: "Handelssitzung", href: "/dashboard/buyer",         activePrefix: "/dashboard/buyer/auction" },
    { label: "Aufträge",       href: "/dashboard/contracts",     activePrefix: "/dashboard/contracts" },
    { label: "Portfolio",      href: "#", disabled: true },
    { label: "Abschlüsse",     href: "#", disabled: true },
  ],
  seller: [
    { label: "Verkaufs-Dashboard", href: "/dashboard/seller",         activePrefix: "/dashboard/seller" },
    { label: "Meine Angebote",     href: "/dashboard/seller",         activePrefix: "/dashboard/seller" },
    { label: "Aktive Gebote",      href: "/dashboard/seller",         activePrefix: "/dashboard/seller/auction" },
    { label: "Lieferungen",        href: "#", disabled: true },
    { label: "Abrechnung",         href: "/dashboard/contracts",      activePrefix: "/dashboard/contracts" },
  ],
  settings: [
    { label: "Profil",             href: "#", disabled: true },
    { label: "Verträge",           href: "/dashboard/contracts",             activePrefix: "/dashboard/contracts" },
    { label: "KYC-Verifikation",   href: "/dashboard/settings/verification", activePrefix: "/dashboard/settings/verification" },
    { label: "Sicherheit",         href: "/dashboard/settings/security",     activePrefix: "/dashboard/settings/security" },
    { label: "Benachrichtigungen", href: "/dashboard/settings/notifications",activePrefix: "/dashboard/settings/notifications" },
  ],
  admin: [
    { label: "Analytik",          href: "/admin",                  activePrefix: "/admin" },
    { label: "Registrierungen",   href: "/admin/registrations",    activePrefix: "/admin/registrations" },
    { label: "KYC-Prüfung",       href: "/admin/kyc",              activePrefix: "/admin/kyc" },
    { label: "Nutzerverwaltung",  href: "/admin/users",            activePrefix: "/admin/users" },
    { label: "Notfall-System",    href: "/admin/emergency",        activePrefix: "/admin/emergency" },
  ],
};

// ─── Hierarchical Page Map ────────────────────────────────────────────────────
//
// Vollständige Domainstruktur für Breadcrumb-Auflösung.
// Käufer-Portal | Verkäufer-Portal | Konto & Compliance | Administration
//
const BREADCRUMB_MAP: Array<{
  match:     (path: string) => boolean;
  config:    (path: string) => BreadcrumbConfig;
}> = [
  // ── Käufer-Portal ──────────────────────────────────────────────────────────
  {
    match:  (p) => p === "/dashboard/buyer",
    config: ()  => ({ area: "Käufer-Portal", areaHref: "/dashboard/buyer", page: "Übersicht", pageHref: "/dashboard/buyer" }),
  },
  {
    match:  (p) => p.startsWith("/dashboard/buyer/auction/"),
    config: (p) => {
      const id = p.split("/").pop() ?? "";
      return { area: "Käufer-Portal", areaHref: "/dashboard/buyer", page: "Handelssitzung", pageHref: "/dashboard/buyer", detail: `Los ${id.slice(0, 8).toUpperCase()}` };
    },
  },
  {
    match:  (p) => p.startsWith("/dashboard/buyer/auction"),
    config: ()  => ({ area: "Käufer-Portal", areaHref: "/dashboard/buyer", page: "Handelssitzung", pageHref: "/dashboard/buyer" }),
  },
  // ── Verkäufer-Portal ───────────────────────────────────────────────────────
  {
    match:  (p) => p === "/dashboard/seller",
    config: ()  => ({ area: "Verkäufer-Portal", areaHref: "/dashboard/seller", page: "Verkaufs-Dashboard", pageHref: "/dashboard/seller" }),
  },
  {
    match:  (p) => p.startsWith("/dashboard/seller/auction/"),
    config: (p) => {
      const id = p.split("/").pop() ?? "";
      return { area: "Verkäufer-Portal", areaHref: "/dashboard/seller", page: "Aktive Gebote", pageHref: "/dashboard/seller", detail: `Los ${id.slice(0, 8).toUpperCase()}` };
    },
  },
  {
    match:  (p) => p.startsWith("/dashboard/seller/auction"),
    config: ()  => ({ area: "Verkäufer-Portal", areaHref: "/dashboard/seller", page: "Aktive Gebote", pageHref: "/dashboard/seller" }),
  },
  // ── Konto & Compliance ─────────────────────────────────────────────────────
  {
    match:  (p) => p.startsWith("/dashboard/contracts"),
    config: ()  => ({ area: "Konto & Compliance", areaHref: "/dashboard/contracts", page: "Verträge", pageHref: "/dashboard/contracts" }),
  },
  {
    match:  (p) => p === "/dashboard/settings/verification",
    config: ()  => ({ area: "Konto & Compliance", areaHref: "/dashboard/contracts", page: "KYC-Verifikation", pageHref: "/dashboard/settings/verification" }),
  },
  {
    match:  (p) => p === "/dashboard/settings/security",
    config: ()  => ({ area: "Konto & Compliance", areaHref: "/dashboard/contracts", page: "Sicherheit", pageHref: "/dashboard/settings/security" }),
  },
  {
    match:  (p) => p === "/dashboard/settings/notifications",
    config: ()  => ({ area: "Konto & Compliance", areaHref: "/dashboard/contracts", page: "Benachrichtigungen", pageHref: "/dashboard/settings/notifications" }),
  },
  // ── Administration ─────────────────────────────────────────────────────────
  {
    match:  (p) => p === "/admin",
    config: ()  => ({ area: "Administration", areaHref: "/admin", page: "Analytik", pageHref: "/admin" }),
  },
  {
    match:  (p) => p.startsWith("/admin/registrations"),
    config: ()  => ({ area: "Administration", areaHref: "/admin", page: "Registrierungen", pageHref: "/admin/registrations" }),
  },
  {
    match:  (p) => p.startsWith("/admin/kyc"),
    config: ()  => ({ area: "Administration", areaHref: "/admin", page: "KYC-Prüfung", pageHref: "/admin/kyc" }),
  },
  {
    match:  (p) => p.startsWith("/admin/users"),
    config: ()  => ({ area: "Administration", areaHref: "/admin", page: "Nutzerverwaltung", pageHref: "/admin/users" }),
  },
  {
    match:  (p) => p.startsWith("/admin/emergency"),
    config: ()  => ({ area: "Administration", areaHref: "/admin", page: "Notfall-System", pageHref: "/admin/emergency" }),
  },
  {
    match:  (p) => p.startsWith("/admin/markets"),
    config: ()  => ({ area: "Administration", areaHref: "/admin", page: "Marktüberwachung", pageHref: "/admin/markets" }),
  },
];

function resolveBreadcrumb(path: string): BreadcrumbConfig | null {
  for (const entry of BREADCRUMB_MAP) {
    if (entry.match(path)) return entry.config(path);
  }
  return null;
}

// ─── Context resolver ─────────────────────────────────────────────────────────
function resolveContext(path: string): "buyer" | "seller" | "settings" | "admin" | null {
  if (path.startsWith("/dashboard/buyer"))     return "buyer";
  if (path.startsWith("/dashboard/seller"))    return "seller";
  if (path.startsWith("/dashboard/settings"))  return "settings";
  if (path.startsWith("/dashboard/contracts")) return "settings";
  if (path.startsWith("/admin"))               return "admin";
  return null;
}

// ─── Token helper ─────────────────────────────────────────────────────────────
function getToken(): string {
  if (typeof window === "undefined") return "";
  return (
    document.cookie.match(/access_token=([^;]+)/)?.[1] ??
    localStorage.getItem("accessToken") ?? ""
  );
}

async function handleLogout() {
  try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
  localStorage.removeItem("accessToken");
  window.location.href = "/login";
}

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  BUYER:       { label: "Käufer",     color: "#154194", bg: "#e8edf8" },
  SELLER:      { label: "Verkäufer",  color: "#92400e", bg: "#fef3c7" },
  ADMIN:       { label: "Admin",      color: "#065f46", bg: "#d1fae5" },
  COMPLIANCE:  { label: "Compliance", color: "#6b21a8", bg: "#f3e8ff" },
  SUPER_ADMIN: { label: "Super Admin",color: "#991b1b", bg: "#fee2e2" },
};

const KYC_META: Record<string, { label: string; color: string }> = {
  GUEST:                { label: "Nicht verifiziert", color: "#9ca3af" },
  PENDING_VERIFICATION: { label: "Prüfung läuft",    color: "#d97706" },
  VERIFIED:             { label: "Verifiziert",       color: "#059669" },
  REJECTED:             { label: "Abgelehnt",         color: "#dc2626" },
  SUSPENDED:            { label: "Gesperrt",          color: "#dc2626" },
};

const fmtEur = (v: string) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(v));

// ─── NavLink ──────────────────────────────────────────────────────────────────
function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const [hovered, setHovered] = useState(false);

  if (item.disabled) {
    return (
      <span style={{
        padding: "0 14px", height: 56,
        display: "inline-flex", alignItems: "center",
        fontSize: 13, fontWeight: 400, fontFamily: F,
        color: "#c4ccd6", cursor: "default", userSelect: "none",
        borderBottom: "3px solid transparent", whiteSpace: "nowrap",
      }}>
        {item.label}
      </span>
    );
  }

  return (
    <a
      href={item.href}
      style={{
        padding: "0 14px", height: 56,
        display: "inline-flex", alignItems: "center",
        fontSize: 13, fontFamily: F,
        fontWeight: active ? 600 : 400,
        color: active ? ACTIVE : (hovered ? BLUE : MUTED),
        textDecoration: "none",
        borderBottom: `3px solid ${(active || hovered) ? (active ? ACTIVE : BLUE) : "transparent"}`,
        transition: "color .15s, border-color .15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {item.label}
    </a>
  );
}

// ─── Breadcrumb Bar ───────────────────────────────────────────────────────────
function BreadcrumbBar({ pathname }: { pathname: string }) {
  const crumb = resolveBreadcrumb(pathname);
  if (!crumb) return null;

  return (
    <div style={{
      background: "#f5f7fb",
      borderBottom: "1px solid #e4e8ef",
      padding: "0 28px",
      height: 32,
      display: "flex", alignItems: "center",
      fontFamily: F,
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto", width: "100%",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        {/* Area */}
        <a
          href={crumb.areaHref}
          style={{ fontSize: 11, color: MUTED, textDecoration: "none", transition: "color .15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
          onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
        >
          {crumb.area}
        </a>

        <svg width="5" height="8" viewBox="0 0 5 8" fill="none" style={{ flexShrink: 0 }}>
          <path d="M1 1l3 3-3 3" stroke="#c8cfd8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        {/* Page */}
        {crumb.detail ? (
          <>
            <a
              href={crumb.pageHref}
              style={{ fontSize: 11, color: MUTED, textDecoration: "none", transition: "color .15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
            >
              {crumb.page}
            </a>
            <svg width="5" height="8" viewBox="0 0 5 8" fill="none" style={{ flexShrink: 0 }}>
              <path d="M1 1l3 3-3 3" stroke="#c8cfd8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: ACTIVE }}>{crumb.detail}</span>
          </>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 600, color: ACTIVE }}>{crumb.page}</span>
        )}
      </div>
    </div>
  );
}

// ─── User Avatar ──────────────────────────────────────────────────────────────
function UserAvatar({ me }: { me: MeUser | null }) {
  const [open, setOpen] = useState(false);

  const initial  = me?.email?.slice(0, 1).toUpperCase() ?? "?";
  const orgName  = me?.organization?.name ?? me?.email ?? "Benutzer";
  const roleMeta = ROLE_META[me?.role ?? ""] ?? { label: me?.role ?? "", color: MUTED, bg: "#f3f4f6" };
  const kycMeta  = KYC_META[me?.verificationStatus ?? ""] ?? { label: "Unbekannt", color: MUTED };

  // Links je nach Rolle
  const dashboardLink = me?.role === "SELLER"
    ? { label: "Verkaufs-Dashboard", href: "/dashboard/seller" }
    : { label: "Meine Ausschreibungen", href: "/dashboard/buyer" };

  const navLinks = [
    dashboardLink,
    { label: "Meine Verträge",          href: "/dashboard/contracts" },
    { label: "KYC-Verifikation",        href: "/dashboard/settings/verification" },
    { label: "Benachrichtigungen",      href: "/dashboard/settings/notifications" },
    { label: "Sicherheitseinstellungen",href: "/dashboard/settings/security" },
  ];

  return (
    <div style={{ position: "relative" }}>
      {/* Avatar-Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "none", border: "none", cursor: "pointer", padding: "4px 6px",
          fontFamily: F, transition: "background .15s", userSelect: "none",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#f5f7fb")}
        onMouseLeave={e => (e.currentTarget.style.background = "none")}
      >
        <div style={{
          width: 32, height: 32,
          background: open ? BLUE2 : BLUE,
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>
          {initial}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap" }}>
          {roleMeta.label}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Overlay zum Schließen */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 190 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: "absolute", top: 40, right: 0,
            background: "#fff", border: "1px solid #e0e4ea",
            boxShadow: "0 8px 28px rgba(0,0,0,.14)",
            minWidth: 240, zIndex: 200, fontFamily: F,
          }}>
            {/* Kopf: Organisation + Email + Rollen-Badge */}
            <div style={{ padding: "16px 18px", borderBottom: "1px solid #f0f2f5" }}>
              <p style={{
                margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: DARK,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220,
              }}>
                {orgName}
              </p>
              <p style={{
                margin: "0 0 10px", fontSize: 11, color: MUTED,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220,
              }}>
                {me?.email}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                {/* Rollen-Badge */}
                <span style={{
                  padding: "3px 10px", fontSize: 11, fontWeight: 700,
                  background: roleMeta.bg, color: roleMeta.color,
                  letterSpacing: "0.04em",
                }}>
                  {roleMeta.label}
                </span>
                {/* KYC-Status */}
                <span style={{ fontSize: 11, color: kycMeta.color, fontWeight: 600 }}>
                  · {kycMeta.label}
                </span>
              </div>
            </div>

            {/* Wallet (nur wenn vorhanden) */}
            {me?.walletBalance !== undefined && (
              <div style={{
                padding: "10px 18px", borderBottom: "1px solid #f0f2f5",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 11, color: MUTED }}>Guthaben</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: DARK, fontVariantNumeric: "tabular-nums" }}>
                  {fmtEur(me.walletBalance ?? "0")}
                </span>
              </div>
            )}

            {/* Nav-Links */}
            <div style={{ padding: "8px 0" }}>
              {navLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block", padding: "8px 18px",
                    fontSize: 13, color: DARK, textDecoration: "none",
                    transition: "background .12s, color .12s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#f5f7fb"; e.currentTarget.style.color = BLUE; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = DARK; }}
                >
                  {label}
                </a>
              ))}
            </div>

            {/* Abmelden */}
            <div style={{ borderTop: "1px solid #f0f2f5", padding: "8px 0" }}>
              <button
                onClick={() => { setOpen(false); void handleLogout(); }}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "8px 18px", fontSize: 13, fontFamily: F,
                  background: "none", border: "none", cursor: "pointer",
                  color: "#dc2626", transition: "background .12s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                Abmelden
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function EucxHeader() {
  const pathname = usePathname();
  const [token,         setToken]         = useState("");
  const [me,            setMe]            = useState<MeUser | null>(null);
  const [logoutHovered, setLogoutHovered] = useState(false);
  const [shieldHovered, setShieldHovered] = useState(false);

  useEffect(() => {
    const tkn = getToken();
    setToken(tkn);
    if (!tkn) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${tkn}` } })
      .then((r) => r.json() as Promise<MeUser>)
      .then((d) => setMe(d))
      .catch(() => {});
  }, []);

  const context  = resolveContext(pathname);
  const navItems: NavItem[] = context ? (NAV[context] ?? []) : [];

  function isActive(item: NavItem): boolean {
    if (item.disabled || item.href === "#") return false;
    if (item.activePrefix) {
      // Übersicht and Verkaufs-Dashboard are active only on exact match
      if (
        (item.href === "/dashboard/buyer"  && item.activePrefix === "/dashboard/buyer") ||
        (item.href === "/dashboard/seller" && item.activePrefix === "/dashboard/seller")
      ) {
        return pathname === item.href;
      }
      return pathname.startsWith(item.activePrefix);
    }
    return pathname === item.href;
  }

  return (
    <>
      {/* ── Sticky block: TopBar + MainBar ────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, fontFamily: F }}>

        {/* TopBar — regulatorische Info + Utility-Leiste */}
        <div style={{ backgroundColor: "#1a1a1a", height: 36 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", height: "100%" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: "0.03em" }}>
              BaFin-regulierte Handelsplattform · Frankfurt am Main · MiFID II OTF
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, background: "#34d399", display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>Börse geöffnet</span>
              </div>
              <div style={{ width: 1, height: 12, background: "rgba(255,255,255,.1)" }} />
              <LanguageSwitcher dark />
              <div style={{ width: 1, height: 12, background: "rgba(255,255,255,.1)" }} />
              <button
                onClick={() => void handleLogout()}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  fontSize: 11, fontFamily: F,
                  color: logoutHovered ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.4)",
                  transition: "color .15s",
                }}
                onMouseEnter={() => setLogoutHovered(true)}
                onMouseLeave={() => setLogoutHovered(false)}
              >
                <LogOut size={11} />
                Abmelden
              </button>
            </div>
          </div>
        </div>

        {/* MainBar — Logo | Dynamische Nav | Profil-Icons */}
        <div style={{
          backgroundColor: "#fff",
          borderTop: `3px solid ${BLUE}`,
          boxShadow: "0 1px 4px rgba(0,0,0,.14)",
          height: 56,
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", height: "100%" }}>

            {/* Logo — fixe Position links, statisch */}
            <a href="/" style={{ textDecoration: "none", flexShrink: 0, marginRight: 24 }}>
              <EucxLogo size="sm" />
            </a>
            <div style={{ width: 1, height: 20, background: "#e0e4ea", flexShrink: 0, marginRight: 4 }} />

            {/* Dynamische Nav — Mitte, kontextabhängig */}
            <nav style={{ flex: 1, display: "flex", alignItems: "center", height: 56, overflowX: "auto", overflowY: "hidden", scrollbarWidth: "none" }}>
              {navItems.map((item) => (
                <NavLink key={item.label} item={item} active={isActive(item)} />
              ))}
            </nav>

            {/* Profil-Icons — fixe Position rechts, statisch */}
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, marginLeft: 16 }}>
              {token && <NotificationBell token={token} />}
              <a
                href="/dashboard/settings/security"
                title="Sicherheitseinstellungen"
                style={{
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  color: shieldHovered ? BLUE : "#9ca3af",
                  transition: "color .15s", textDecoration: "none",
                }}
                onMouseEnter={() => setShieldHovered(true)}
                onMouseLeave={() => setShieldHovered(false)}
              >
                <Shield size={17} strokeWidth={1.75} />
              </a>
              <div style={{ width: 1, height: 20, background: "#e0e4ea" }} />
              <UserAvatar me={me} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb — scrollt mit der Seite, zeigt den exakten Pfad ─────── */}
      <BreadcrumbBar pathname={pathname} />
    </>
  );
}
