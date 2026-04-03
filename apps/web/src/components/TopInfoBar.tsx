"use client";

import { LogOut } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const F = "'IBM Plex Sans', Arial, sans-serif";

async function handleLogout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch { /* ignore */ }
  localStorage.removeItem("accessToken");
  window.location.href = "/login";
}

export function TopInfoBar() {
  return (
    <div style={{ backgroundColor: "#1a1a1a", fontFamily: F, position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{
        maxWidth: 1280, marginLeft: "auto", marginRight: "auto",
        padding: "0 28px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 36,
      }}>
        {/* Left: regulatory info */}
        <span style={{ color: "rgba(255,255,255,.4)", fontSize: 11, letterSpacing: "0.03em" }}>
          BaFin-regulierte Handelsplattform · Frankfurt am Main · MiFID II OTF
        </span>

        {/* Right: status + lang + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>
          {/* Market status */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, background: "#34d399", display: "inline-block", flexShrink: 0 }} />
            <span style={{ color: "rgba(255,255,255,.5)", fontSize: 11 }}>Börse geöffnet</span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 12, background: "rgba(255,255,255,.1)" }} />

          <LanguageSwitcher dark />

          {/* Divider */}
          <div style={{ width: 1, height: 12, background: "rgba(255,255,255,.1)" }} />

          {/* Logout */}
          <button
            onClick={() => void handleLogout()}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,.4)", fontSize: 11, fontFamily: F, padding: 0,
              transition: "color .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.4)")}
          >
            <LogOut size={11} />
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
