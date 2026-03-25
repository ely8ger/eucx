"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, X } from "lucide-react";
import { EucxLogo } from "@/components/logo/EucxLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";

const BLUE = "#154194";
const SANS = "'IBM Plex Sans', Arial, sans-serif";

interface Props {
  /** highlight this href in the nav */
  activeHref?: string;
  /** prefix anchor-links with "/" so they work from sub-pages */
  rootPage?: boolean;
}

export function SiteNav({ activeHref, rootPage = false }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [mobileInsights, setMobileInsights] = useState(false);

  const prefix = rootPage ? "" : "/";

  const NAV: { label: string; href: string }[] = [
    { label: t("nav_katalog"),    href: "/katalog" },
    { label: t("nav_markets"),    href: `${prefix}#marktbereiche` },
    { label: t("nav_how"),        href: `${prefix}#wie-es-funktioniert` },
    { label: t("nav_regulation"), href: `${prefix}#regulierung` },
    { label: t("nav_join"),       href: `${prefix}#teilnehmer` },
  ];

  return (
    <>
      {/* ── Mobile Overlay ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          backgroundColor: "#0b1e36",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 280ms ease",
          display: "flex", flexDirection: "column",
          padding: "28px 28px 36px", fontFamily: SANS,
        }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <Link href="/" onClick={() => setOpen(false)} style={{ textDecoration: "none" }}>
            <EucxLogo variant="dark" size="sm" />
          </Link>
          <button onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,.6)", cursor: "pointer", padding: 4 }}>
            <X size={22} />
          </button>
        </div>

        {NAV.map(({ label, href }) => (
          <a key={href} href={href} onClick={() => setOpen(false)}
            style={{
              fontSize: 17, color: "rgba(255,255,255,.8)", textDecoration: "none",
              padding: "15px 0", borderBottom: "1px solid rgba(255,255,255,.07)", display: "block",
              fontWeight: 400, letterSpacing: "0.01em",
            }}>
            {label}
          </a>
        ))}
        <Link href="/marktpreise" onClick={() => setOpen(false)}
          style={{
            fontSize: 17, color: "rgba(255,255,255,.8)", textDecoration: "none",
            padding: "15px 0", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex",
            alignItems: "center", gap: 8,
          }}>
          <span style={{ width: 7, height: 7, backgroundColor: "#22c55e", borderRadius: "50%", flexShrink: 0 }} />
          {t("nav_marktpreise")}
        </Link>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <button
            onClick={() => setMobileInsights(v => !v)}
            style={{
              width: "100%", background: "none", border: "none", cursor: "pointer",
              fontSize: 17, color: "rgba(255,255,255,.8)",
              padding: "15px 0", display: "flex", alignItems: "center", justifyContent: "space-between",
              fontFamily: SANS, fontWeight: 400,
            }}>
            Marktwissen & Insights
            <span style={{ fontSize: 12, transition: "transform 200ms ease", transform: mobileInsights ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
          </button>
          {mobileInsights && (
            <div style={{ paddingBottom: 8, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { label: "Marktpreise LIVE",    href: "/marktpreise" },
                { label: "Marktanalysen",       href: "/insights/analysen" },
                { label: "Rohstoff-Lexikon",    href: "/insights/lexikon" },
                { label: "Händler-Akademie",    href: "/insights/akademie" },
                { label: "EU-Regulatorik",      href: "/insights/regulatorik" },
              ].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  style={{
                    fontSize: 14, color: "rgba(255,255,255,.6)", textDecoration: "none",
                    padding: "10px 0", borderTop: "1px solid rgba(255,255,255,.04)", display: "block",
                  }}>
                  → {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/login" onClick={() => setOpen(false)}
            style={{
              textAlign: "center", fontSize: 14, fontWeight: 600,
              color: BLUE, backgroundColor: "#fff", padding: "13px 0", textDecoration: "none",
            }}>
            {t("nav_login")}
          </Link>
          <Link href="/register" onClick={() => setOpen(false)}
            style={{
              textAlign: "center", fontSize: 14, fontWeight: 700,
              color: "#fff", backgroundColor: BLUE, padding: "13px 0", textDecoration: "none",
            }}>
            {t("nav_register")} →
          </Link>
          <div style={{ paddingTop: 10, display: "flex", justifyContent: "center" }}>
            <LanguageSwitcher dark />
          </div>
        </div>
      </div>

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <div className="r-topbar" style={{
        backgroundColor: "#0d1117", height: 42,
        display: "flex", alignItems: "center", fontFamily: SANS,
      }}>
        <div style={{
          maxWidth: 1240, margin: "0 auto", padding: "0 32px",
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.38)", letterSpacing: "0.02em" }}>
            {t("topbar")}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {[
                { icon: <Lock size={10} />, label: t("topbar_tls") },
                { icon: <ShieldCheck size={10} />, label: t("topbar_dsgvo") },
              ].map(({ icon, label }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,.28)" }}>
                  {icon} {label}
                </span>
              ))}
            </div>
            <LanguageSwitcher dark />
          </div>
        </div>
      </div>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        backgroundColor: "#fff",
        borderTop: `3px solid ${BLUE}`,
        boxShadow: "0 1px 0 #e8e8e8, 0 2px 8px rgba(0,0,0,.06)",
        position: "sticky", top: 0, zIndex: 100,
        fontFamily: SANS,
      }}>
        <div style={{
          maxWidth: 1240, margin: "0 auto", padding: "0 32px",
          height: 68, display: "flex", alignItems: "center", gap: 0,
        }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0, marginRight: 40 }}>
            <EucxLogo size="md" />
          </Link>

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "stretch", flex: 1, gap: 0 }}
            className="hidden-mobile">
            {NAV.map(({ label, href }) => {
              const isActive = activeHref === href;
              return (
                <a key={href} href={href}
                  style={{
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    color: isActive ? BLUE : "#3a3a3a",
                    padding: "0 18px", height: 68,
                    display: "flex", alignItems: "center",
                    borderBottom: isActive ? `2px solid ${BLUE}` : "2px solid transparent",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "color .15s, border-color .15s",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = BLUE;
                      e.currentTarget.style.borderBottomColor = "rgba(21,65,148,.3)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = "#3a3a3a";
                      e.currentTarget.style.borderBottomColor = "transparent";
                    }
                  }}>
                  {label}
                </a>
              );
            })}

            {/* Insights Dropdown */}
            <div
              style={{ position: "relative", display: "flex", alignItems: "stretch" }}
              onMouseEnter={() => setDropdown("insights")}
              onMouseLeave={() => setDropdown(null)}>
              <Link href="/insights"
                style={{
                  fontSize: 13,
                  fontWeight: activeHref === "/insights" ? 600 : 400,
                  color: (activeHref === "/insights" || dropdown === "insights") ? BLUE : "#3a3a3a",
                  padding: "0 18px", height: 68,
                  display: "flex", alignItems: "center", gap: 5,
                  borderBottom: activeHref === "/insights" ? `2px solid ${BLUE}` : dropdown === "insights" ? `2px solid rgba(21,65,148,.25)` : "2px solid transparent",
                  textDecoration: "none", whiteSpace: "nowrap",
                  transition: "color .15s",
                }}>
                Marktwissen
                <span style={{ fontSize: 9, marginTop: 1 }}>▾</span>
              </Link>
              {dropdown === "insights" && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, zIndex: 300,
                  backgroundColor: "#fff", border: "1px solid #e8e8e8",
                  boxShadow: "0 8px 32px rgba(0,0,0,.12)",
                  minWidth: 300, padding: "8px 0",
                }}>

                  {/* Marktpreise — top item with live dot */}
                  <Link href="/marktpreise" className="dd-item"
                    style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 18px 10px", textDecoration: "none", borderBottom: "1px solid #f0f0f0", marginBottom: 4 }}>
                    <div className="dd-bar" style={{ width: 3, height: 36, backgroundColor: "#154194", flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                        <p className="dd-title" style={{ fontSize: 13, fontWeight: 700, color: "#0d1b2a", margin: 0 }}>{t("nav_marktpreise")}</p>
                        <span style={{
                          width: 7, height: 7, backgroundColor: "#22c55e", borderRadius: "50%", flexShrink: 0,
                          boxShadow: "0 0 0 2px rgba(34,197,94,.25)",
                          animation: "pulse 2s infinite",
                        }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", letterSpacing: "0.08em" }}>LIVE</span>
                      </div>
                      <p style={{ fontSize: 11, color: "#888", margin: 0 }}>Echtzeit-Kurse & Tagespreise</p>
                    </div>
                  </Link>

                  {/* Other sections */}
                  {[
                    { label: "Marktanalysen",    sub: "Wöchentliche Preisberichte",  href: "/insights/analysen",     color: "#166534" },
                    { label: "Rohstoff-Lexikon", sub: "Definitionen & Normen",       href: "/insights/lexikon",      color: "#154194" },
                    { label: "Händler-Akademie", sub: "Leitfäden & Best Practices",  href: "/insights/akademie",     color: "#92400e" },
                    { label: "EU-Regulatorik",   sub: "MiFID II, OTF, CBAM & mehr",  href: "/insights/regulatorik",  color: "#44403c" },
                  ].map(item => (
                    <Link key={item.href} href={item.href} className="dd-item"
                      style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "9px 18px", textDecoration: "none" }}>
                      <div className="dd-bar" style={{ width: 3, height: 34, backgroundColor: item.color, flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p className="dd-title" style={{ fontSize: 13, fontWeight: 600, color: "#0d1b2a", margin: "0 0 2px" }}>{item.label}</p>
                        <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{item.sub}</p>
                      </div>
                    </Link>
                  ))}

                  <div style={{ borderTop: "1px solid #f0f0f0", margin: "6px 0 0", padding: "8px 18px 4px" }}>
                    <Link href="/insights" style={{ fontSize: 11, color: BLUE, fontWeight: 600, textDecoration: "none" }}>Alle Inhalte →</Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Spacer */}
          <div style={{ flex: 1 }} className="hidden-mobile" />

          {/* Divider */}
          <div style={{ width: 1, height: 24, backgroundColor: "#e8e8e8", margin: "0 20px", flexShrink: 0 }} className="hidden-mobile" />

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Link href="/login"
              style={{
                fontSize: 13, color: "#3a3a3a", fontWeight: 500,
                textDecoration: "none", padding: "8px 14px",
                whiteSpace: "nowrap",
              }}
              className="hidden-mobile"
              onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
              onMouseLeave={e => (e.currentTarget.style.color = "#3a3a3a")}>
              {t("nav_login")}
            </Link>
            <Link href="/register"
              style={{
                fontSize: 13, fontWeight: 700, color: "#fff",
                backgroundColor: BLUE, padding: "9px 20px",
                textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap",
              }}
              className="hidden-mobile"
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f3070")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BLUE)}>
              {t("nav_register")} <ArrowRight size={12} />
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Menu öffnen"
              className="show-mobile"
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column", gap: 5, padding: 4,
              }}>
              <span style={{ display: "block", width: 22, height: 2, backgroundColor: BLUE }} />
              <span style={{ display: "block", width: 22, height: 2, backgroundColor: BLUE }} />
              <span style={{ display: "block", width: 16, height: 2, backgroundColor: BLUE }} />
            </button>
          </div>

        </div>
      </header>

      <style>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
        }
        @media (min-width: 901px) {
          .show-mobile { display: none !important; }
        }
        .dd-item {
          transition: background-color 200ms ease;
        }
        .dd-item:hover {
          background-color: rgba(21,65,148,0.05);
        }
        .dd-item .dd-bar {
          transition: opacity 200ms ease, box-shadow 200ms ease;
          opacity: 0.65;
        }
        .dd-item:hover .dd-bar {
          opacity: 1;
          box-shadow: 2px 0 6px rgba(21,65,148,0.3);
        }
        .dd-item .dd-title {
          transition: color 200ms ease;
        }
        .dd-item:hover .dd-title {
          color: #154194 !important;
        }
      `}</style>
    </>
  );
}
