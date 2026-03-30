"use client";
import { SiteNav } from "@/components/SiteNav";
import { useI18n } from "@/lib/i18n/context";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'IBM Plex Sans', Arial, sans-serif" }}>

      <SiteNav />

      {/* ── Zentrierter Inhalt mit Punktraster-Hintergrund ───────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 py-12"
        style={{
          backgroundColor: "#f0f4fb",
          backgroundImage: "radial-gradient(circle, rgba(21,65,148,0.11) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      >
        {children}
      </div>

      {/* ── Portal-Footer ─────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#fff", borderTop: "1px solid #e4e8ef" }}>
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{t("auth_footer_copy")}</p>
          <nav className="flex items-center gap-4">
            {[[t("auth_imprint"), "/impressum"], [t("auth_privacy"), "/datenschutz"], [t("auth_accessibility"), "#"]].map(([label, href]) => (
              <a key={label} href={href} style={{ fontSize: 11, color: "#aaa", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#154194")}
                onMouseLeave={e => (e.currentTarget.style.color = "#aaa")}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
