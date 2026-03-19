"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { LOCALES } from "@/lib/i18n/translations";

const F    = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) ?? { code: "de", label: "Deutsch", flag: "🇩🇪" };

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const textColor  = dark ? "rgba(255,255,255,.55)" : "#555";
  const hoverBg    = dark ? "rgba(255,255,255,.08)"  : "#f0f4ff";
  const dropdownBg = "#fff";

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          padding: "4px 8px", fontSize: 12, color: textColor,
          fontFamily: F, letterSpacing: "0.02em",
          borderRadius: 2,
          transition: "background 150ms",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverBg; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
        aria-label="Sprache wechseln"
        aria-expanded={open}
      >
        <span style={{ fontSize: 14 }}>{current.flag}</span>
        <span style={{ fontWeight: 500 }}>{current.code.toUpperCase()}</span>
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
          <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          backgroundColor: dropdownBg,
          border: "1px solid #e0e4ed",
          boxShadow: "0 6px 20px rgba(0,0,0,.12)",
          minWidth: 150, zIndex: 200,
        }}>
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "9px 16px",
                background: l.code === locale ? "#f0f4ff" : "none",
                border: "none", cursor: "pointer",
                fontSize: 13, color: l.code === locale ? BLUE : "#333",
                fontFamily: F, fontWeight: l.code === locale ? 600 : 400,
                textAlign: "left",
                transition: "background 120ms",
              }}
              onMouseEnter={(e) => {
                if (l.code !== locale) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f7f9fc";
              }}
              onMouseLeave={(e) => {
                if (l.code !== locale) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              }}
            >
              <span style={{ fontSize: 16 }}>{l.flag}</span>
              <span>{l.label}</span>
              {l.code === locale && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: "auto", color: BLUE }}>
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
