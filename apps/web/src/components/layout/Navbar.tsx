"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard, TrendingUp, FileText, Briefcase,
  CheckSquare, User, Shield, ChevronDown, LogOut,
  Bell, CircleDot,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Übersicht",       Icon: LayoutDashboard },
  { href: "/trading",   label: "Handelssitzung",  Icon: TrendingUp      },
  { href: "/orders",    label: "Meine Aufträge",  Icon: FileText        },
  { href: "/portfolio", label: "Portfolio",        Icon: Briefcase       },
  { href: "/deals",     label: "Abschlüsse",      Icon: CheckSquare     },
  { href: "/personal",  label: "Mein Bereich",    Icon: User            },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50">
      {/* Topbar */}
      <div className="bg-[#003366] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between">
          <span className="text-white/50 text-xs hidden sm:block">
            Institutionelle Handelsplattform · BaFin-reguliert · Frankfurt am Main
          </span>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1.5">
              <CircleDot size={11} className="text-emerald-400 animate-pulse" />
              <span className="text-white/60 text-xs">Börse geöffnet</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <a href="/login" className="flex items-center gap-1 text-white/50 text-xs hover:text-white/80 transition-colors">
              <LogOut size={11} />
              Abmelden
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-[#154194] rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-wide">E</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-gray-900 text-base leading-none">EUCX</span>
            </div>
          </Link>

          <div className="w-px h-6 bg-gray-200 shrink-0" />

          {/* Nav */}
          <nav className="flex items-center overflow-x-auto flex-1">
            {NAV_LINKS.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 h-14 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                    active
                      ? "border-[#154194] text-[#154194]"
                      : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                  )}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button className="relative w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <Link href="/admin" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Shield size={15} />
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-7 h-7 rounded-full bg-[#154194] flex items-center justify-center">
                <span className="text-white text-xs font-semibold">A</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">Admin</span>
              <ChevronDown size={13} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
