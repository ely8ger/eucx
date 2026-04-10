"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, TrendingUp, FileText, Briefcase,
  CheckSquare, User, Shield, LogOut, Bell,
} from "lucide-react";
import { EucxLogo } from "@/components/logo/EucxLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";

const ROLE_LABEL: Record<string, string> = {
  BUYER:              "Käufer",
  SELLER:             "Verkäufer",
  ADMIN:              "Admin",
  SUPER_ADMIN:        "Super Admin",
  COMPLIANCE_OFFICER: "Compliance",
  BROKER:             "Broker",
  OBSERVER:           "Beobachter",
};

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [userInitial, setUserInitial] = useState("?");
  const [userLabel,   setUserLabel]   = useState("");

  useEffect(() => {
    try {
      const token =
        document.cookie.match(/access_token=([^;]+)/)?.[1] ??
        localStorage.getItem("accessToken") ?? "";
      if (!token) return;
      const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
      const email: string = payload.email ?? "";
      const role: string  = payload.role  ?? "";
      setUserInitial(email.slice(0, 1).toUpperCase() || "?");
      setUserLabel(ROLE_LABEL[role] ?? role);
    } catch { /* ignore */ }
  }, []);

  const NAV_LINKS = [
    { href: "/dashboard", label: t("app_nav_overview"),   Icon: LayoutDashboard },
    { href: "/trading",   label: t("app_nav_sessions"),   Icon: TrendingUp      },
    { href: "/orders",    label: t("app_nav_orders"),     Icon: FileText        },
    { href: "/portfolio", label: t("app_nav_portfolio"),  Icon: Briefcase       },
    { href: "/deals",     label: t("app_nav_deals"),      Icon: CheckSquare     },
    { href: "/personal",  label: t("app_nav_personal"),   Icon: User            },
  ];

  return (
    <header className="sticky top-0 z-50" style={{ fontFamily: "'IBM Plex Sans', Arial, sans-serif" }}>

      {/* Topbar - HSBC-Stil: dünne dunkle Info-Leiste */}
      <div style={{ backgroundColor: "#1a1a1a" }}>
        <div style={{ maxWidth: 1280, marginLeft: "auto", marginRight: "auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 36 }}>
          <span className="hidden sm:block text-white/40 text-xs tracking-wide">
            {t("topbar")}
          </span>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400" style={{ borderRadius: 0 }} />
              <span className="text-white/50 text-xs">{t("app_exchange_open")}</span>
            </div>
            <div style={{ width: 1, height: 12, backgroundColor: "rgba(255,255,255,.1)" }} />
            <LanguageSwitcher dark />
            <div style={{ width: 1, height: 12, backgroundColor: "rgba(255,255,255,.1)" }} />
            <a href="/login"
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: "rgba(255,255,255,.4)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.4)")}>
              <LogOut size={11} />
              {t("app_logout")}
            </a>
          </div>
        </div>
      </div>

      {/* Main Header - HSBC-Stil: weiß, Marken-Linie oben, Schatten unten */}
      <div style={{
        backgroundColor: "#ffffff",
        borderTop: "3px solid #154194",
        boxShadow: "0 1px 4px 0 rgba(0,0,0,.2)",
      }}>
        <div style={{ maxWidth: 1280, marginLeft: "auto", marginRight: "auto", padding: "0 40px", display: "flex", alignItems: "center", gap: 24, height: 56 }}>

          {/* Logo */}
          <Link href="/dashboard" style={{ textDecoration: "none", flexShrink: 0 }}>
            <EucxLogo size="sm" />
          </Link>

          <div style={{ width: 1, height: 20, backgroundColor: "#e8e8e8", flexShrink: 0 }} />

          {/* Nav Links - HSBC-Stil: aktiver Link mit blauer Unterlinie */}
          <nav className="flex items-center overflow-x-auto flex-1 gap-0">
            {NAV_LINKS.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 whitespace-nowrap transition-colors"
                  style={{
                    padding: "0 14px",
                    height: 56,
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#154194" : "#333333",
                    borderBottom: active ? "2px solid #154194" : "2px solid transparent",
                    textDecoration: "none",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#154194"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#333333"; }}
                >
                  <Icon size={13} />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button
              className="relative flex items-center justify-center transition-colors cursor-pointer"
              style={{ width: 34, height: 34, color: "#505050", backgroundColor: "transparent" }}
              aria-label="Benachrichtigungen"
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
              <Bell size={16} />
              <span className="absolute" style={{ top: 7, right: 7, width: 6, height: 6, backgroundColor: "#cc0000", borderRadius: "50%" }} />
            </button>

            <Link href="/admin"
              className="flex items-center justify-center transition-colors"
              style={{ width: 34, height: 34, color: "#505050", backgroundColor: "transparent" }}
              aria-label="Administration"
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
              <Shield size={15} />
            </Link>

            <div style={{ width: 1, height: 20, backgroundColor: "#e8e8e8" }} />

            {/* User Pill - HSBC-Stil: eckig, klar */}
            <button className="flex items-center gap-2 transition-colors cursor-pointer"
              style={{ padding: "6px 10px", backgroundColor: "transparent" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
              <div style={{ width: 28, height: 28, backgroundColor: "#154194", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 0, color: "#ffffff", fontSize: 12, fontWeight: 700 }}>
                {userInitial}
              </div>
              {userLabel && (
                <span className="hidden lg:block" style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{userLabel}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
