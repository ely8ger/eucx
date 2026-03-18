"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard, TrendingUp, FileText, Briefcase,
  CheckSquare, User, Shield, ChevronDown, LogOut,
  Bell,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Übersicht",      Icon: LayoutDashboard },
  { href: "/trading",   label: "Handelssitzung", Icon: TrendingUp      },
  { href: "/orders",    label: "Aufträge",        Icon: FileText        },
  { href: "/portfolio", label: "Portfolio",        Icon: Briefcase       },
  { href: "/deals",     label: "Abschlüsse",      Icon: CheckSquare     },
  { href: "/personal",  label: "Mein Bereich",    Icon: User            },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50">

      {/* Topbar — BaFin-Hinweis */}
      <div className="bg-[#1E293B] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-8 flex items-center justify-between">
          <span className="text-white/40 text-[11px] font-medium tracking-wide hidden sm:block">
            BaFin-reguliert · Institutionelle Handelsplattform · Frankfurt am Main
          </span>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-live" />
              <span className="text-white/50 text-[11px] font-medium">Börse geöffnet</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <a
              href="/login"
              className="flex items-center gap-1.5 text-white/40 text-[11px] font-medium hover:text-white/70 transition-colors duration-150 cursor-pointer"
            >
              <LogOut size={11} />
              Abmelden
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-slate-200" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-13 flex items-center gap-5" style={{ height: "52px" }}>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200"
              style={{ backgroundColor: "#2563EB" }}
            >
              <span className="text-white font-bold text-sm tracking-wider">E</span>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-bold text-slate-900 text-[15px] tracking-tight">EUCX</span>
              <span className="text-[9px] text-slate-400 font-medium tracking-widest uppercase">Exchange</span>
            </div>
          </Link>

          <div className="w-px h-5 bg-slate-200 shrink-0" />

          {/* Nav Links */}
          <nav className="flex items-center overflow-x-auto flex-1 gap-0.5">
            {NAV_LINKS.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon size={14} />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <button
              className="relative w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-150 cursor-pointer"
              aria-label="Benachrichtigungen"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            <Link
              href="/admin"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-150"
              aria-label="Administration"
            >
              <Shield size={15} />
            </Link>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* User Pill */}
            <button className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors duration-150 cursor-pointer">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: "#2563EB" }}
              >
                A
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden lg:block">Admin</span>
              <ChevronDown size={13} className="text-slate-400 hidden lg:block" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
