"use client";

/**
 * EUCX Gov-Header
 * Layout-Pattern: foerderdatenbank.de / Bundeswebsite Design System (BWDS)
 * Zweistufiger Aufbau: Utility-Bar (oben) + Haupt-Navigation (unten)
 */

import Link            from "next/link";
import { usePathname } from "next/navigation";
import { clsx }        from "clsx";

const NAV_LINKS = [
  { href: "/dashboard", label: "Übersicht"    },
  { href: "/trading",   label: "Handelsraum"  },
  { href: "/products",  label: "Warenkatalog" },
  { href: "/portfolio", label: "Portfolio"    },
  { href: "/deals",     label: "Abschlüsse"   },
  { href: "/reports",   label: "Berichte"     },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 shadow-sm">

      {/* ── Utility-Bar (dunkelblau) ──────────────────────────────────────── */}
      <div className="bg-gov-blue-header border-b border-white/10">
        <div className="max-w-screen-xl mx-auto px-6 h-10 flex items-center justify-between">

          {/* Linke Seite: Behörden-Wordmark */}
          <div className="flex items-center gap-3">
            {/* Bundesadler-Platzhalter (BWDS: stilisiertes Wappenschild) */}
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
              <path d="M9 1L17 4.5v7c0 4-3 7.5-8 8.5C4 19 1 15.5 1 11.5v-7L9 1Z"
                fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
              <path d="M6 10.5l2 2 4-4" stroke="rgba(255,255,255,0.8)" strokeWidth="1.3"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs text-white/70 font-medium tracking-wide hidden sm:block">
              Institutionelle Handelsplattform der EU
            </span>
          </div>

          {/* Rechte Seite: Status + User */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-white/70">Börse geöffnet</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-xs text-white/70 hover:text-white cursor-pointer transition-colors">
              Mein Konto
            </span>
            <a href="/login"
              className="text-xs text-white/70 hover:text-white transition-colors">
              Abmelden
            </a>
          </div>
        </div>
      </div>

      {/* ── Haupt-Header (weiß) ───────────────────────────────────────────── */}
      <div className="bg-gov-white border-b border-gov-border">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center gap-8">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 bg-gov-blue flex items-center justify-center rounded-sm">
              <span className="text-white font-bold text-lg tracking-tight">E</span>
            </div>
            <div>
              <p className="text-gov-blue font-bold text-lg leading-none tracking-tight">EUCX</p>
              <p className="text-gov-text-muted text-[10px] leading-none mt-0.5 tracking-wide hidden sm:block">
                EU Commodity Exchange
              </p>
            </div>
          </Link>

          {/* Trennlinie */}
          <div className="w-px h-8 bg-gov-border shrink-0" />

          {/* Navigation */}
          <nav className="flex items-center gap-0 overflow-x-auto">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "px-4 h-16 flex items-center text-sm font-medium whitespace-nowrap",
                    "border-b-2 transition-colors duration-150",
                    active
                      ? "border-gov-blue text-gov-blue"
                      : "border-transparent text-gov-text-2 hover:text-gov-blue hover:border-gov-blue/40"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto shrink-0">
            <Link href="/admin"
              className="text-xs text-gov-text-muted hover:text-gov-blue transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
