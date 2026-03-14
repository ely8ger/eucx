"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

interface SidebarItem {
  href:    string;
  label:   string;
  icon:    string;
  badge?:  string;
}

const sidebarItems: SidebarItem[] = [
  { href: "/trading",         label: "Handelsraum",    icon: "⚡" },
  { href: "/trading/history", label: "Handelshistorie", icon: "📋" },
  { href: "/products",        label: "Mein Angebot",   icon: "🏗️" },
  { href: "/deals",           label: "Abschlüsse",     icon: "✅", badge: "3" },
  { href: "/reports",         label: "Berichte",       icon: "📊" },
  { href: "/settings",        label: "Einstellungen",  icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-cb-white border-r border-cb-gray-200 flex flex-col h-full">

      {/* ─── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 p-3 space-y-0.5">
        {sidebarItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-2 rounded",
                "text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-cb-yellow text-cb-gray-900 shadow-sm"
                  : "text-cb-gray-700 hover:bg-cb-gray-100 hover:text-cb-petrol"
              )}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={clsx(
                  "text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center",
                  isActive
                    ? "bg-cb-gray-900 text-cb-yellow"
                    : "bg-cb-yellow text-cb-gray-900"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ─── Footer: Version ──────────────────────────────────────────── */}
      <div className="p-3 border-t border-cb-gray-200">
        <p className="text-xs text-cb-gray-400 text-center">
          EUCX v1.0 · eucx.eu
        </p>
      </div>
    </aside>
  );
}
