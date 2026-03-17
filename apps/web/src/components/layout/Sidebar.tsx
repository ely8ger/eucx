"use client";

import Link             from "next/link";
import { usePathname }  from "next/navigation";
import { clsx }         from "clsx";

interface SidebarItem {
  href:   string;
  label:  string;
  badge?: string;
  icon:   React.ReactNode;
}

// ── SVG Icons ─────────────────────────────────────────────────────────────
const IcoDash     = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>;
const IcoTrading  = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><polyline points="1,12 4,7 7,9 10,4 15,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 2h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoPortfolio= () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="5" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M5 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const IcoProducts = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1L15 4.5v7L8 15 1 11.5v-7L8 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M1 4.5L8 8M8 8L15 4.5M8 8V15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const IcoDeals    = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1.5 12L5.5 7.5l3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="13" cy="3" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>;
const IcoReports  = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.4"/><line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="5" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const IcoSettings = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const IcoAdmin    = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L14 4.5v4c0 3.5-2.5 6-6 7C2.5 14.5 0 12 0 8.5v-4L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const NAV_ITEMS: SidebarItem[] = [
  { href: "/dashboard",  label: "Übersicht",     icon: <IcoDash />      },
  { href: "/trading",    label: "Handelsraum",   icon: <IcoTrading />   },
  { href: "/portfolio",  label: "Portfolio",     icon: <IcoPortfolio /> },
  { href: "/products",   label: "Warenkatalog",  icon: <IcoProducts />  },
  { href: "/deals",      label: "Abschlüsse",    icon: <IcoDeals />, badge: "3" },
  { href: "/reports",    label: "Berichte",      icon: <IcoReports />   },
  { href: "/settings",   label: "Einstellungen", icon: <IcoSettings />  },
  { href: "/admin",      label: "Admin",         icon: <IcoAdmin />     },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-dm-surface border-r border-dm-border">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 py-3 px-2 space-y-px overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm",
                "text-sm font-medium transition-all duration-150 group relative",
                active
                  ? "bg-dm-gold text-[#060A14]"
                  : "text-dm-muted hover:bg-white/5 hover:text-dm-text"
              )}
            >
              {/* aktiver linker Balken */}
              {active && (
                <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#060A14]/30 rounded-full" />
              )}
              <span className={clsx(
                "shrink-0 transition-colors duration-150",
                active ? "text-[#060A14]" : "text-dm-muted-2 group-hover:text-dm-gold"
              )}>
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className={clsx(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                  active ? "bg-black/15 text-[#060A14]" : "bg-dm-gold/15 text-dm-gold"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-dm-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cb-success" />
          <span className="text-xs text-dm-muted">Systeme aktiv</span>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-dm-muted-2 font-medium">
          EUCX v1.0 · eucx.eu
        </p>
      </div>
    </aside>
  );
}
