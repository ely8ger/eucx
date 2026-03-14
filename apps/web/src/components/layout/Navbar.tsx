"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";

const navLinks = [
  { href: "/trading",   label: "Handelsraum" },
  { href: "/products",  label: "Produkte" },
  { href: "/deals",     label: "Abschlüsse" },
  { href: "/reports",   label: "Berichte" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="h-14 bg-cb-petrol border-b border-cb-petrol-dark sticky top-0 z-50 shadow-md">
      <div className="max-w-screen-2xl mx-auto h-full px-4 flex items-center justify-between">

        {/* ─── Logo ────────────────────────────────────────────────────── */}
        <Link href="/trading" className="flex items-center gap-2 group">
          {/* Commerzbank-Ribbon-Imitiation */}
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-6 bg-cb-yellow rounded-sm" />
            <div className="w-1 h-4 bg-cb-yellow-light rounded-sm opacity-80" />
            <div className="w-1 h-5 bg-cb-yellow rounded-sm opacity-90" />
          </div>
          <div className="ml-1">
            <span className="text-cb-white font-bold text-lg tracking-tight">EUCX</span>
            <span className="hidden sm:inline text-cb-yellow text-xs ml-2 font-medium">
              European Steel Exchange
            </span>
          </div>
        </Link>

        {/* ─── Navigation ──────────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "px-3 py-1.5 rounded text-sm font-medium transition-all duration-150",
                pathname.startsWith(link.href)
                  ? "bg-cb-yellow text-cb-gray-900"
                  : "text-cb-gray-300 hover:text-cb-white hover:bg-white/10"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ─── Right Side: Status + User ───────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Handelsstatus-Indikator */}
          <Badge variant="success" dot className="hidden sm:inline-flex">
            Handel aktiv
          </Badge>

          {/* Trennlinie */}
          <div className="w-px h-6 bg-white/20" />

          {/* User-Avatar */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded bg-cb-yellow flex items-center justify-center">
              <span className="text-cb-gray-900 text-xs font-bold">ME</span>
            </div>
            <span className="hidden sm:block text-cb-gray-300 text-sm group-hover:text-cb-white transition-colors">
              Mein Konto
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
