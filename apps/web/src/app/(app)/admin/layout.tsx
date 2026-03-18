"use client";

/**
 * Admin-Layout — Zweite Navigationsebene für /admin/*
 *
 * Client-seitiger RBAC-Guard: liest Rolle aus JWT-Cookie.
 * (Echte Sicherheit liegt in der Next.js Middleware.)
 *
 * Gibt eine horizontale Tab-Navigation über den Admin-Seiten aus.
 */

import { useEffect, useState }  from "react";
import { useRouter, usePathname } from "next/navigation";
import Link                      from "next/link";
import { cn }                    from "@/lib/utils";
import { Badge }                 from "@/components/ui/badge";

const ADMIN_ROLES = ["ADMIN", "COMPLIANCE", "SUPER_ADMIN"];

interface JwtBasic {
  role?: string;
  email?: string;
}

function parseTokenRole(): JwtBasic | null {
  try {
    if (typeof document === "undefined") return null;
    const token =
      document.cookie.match(/access_token=([^;]+)/)?.[1] ??
      localStorage.getItem("access_token");
    if (!token) return null;
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload)) as JwtBasic;
  } catch {
    return null;
  }
}

const NAV_ITEMS = [
  { href: "/admin",           label: "Analytics",     icon: "▤", exact: true  },
  { href: "/admin/kyc",       label: "KYC",           icon: "✓", exact: false },
  { href: "/admin/markets",   label: "Live-Märkte",   icon: "⚡", exact: false },
  { href: "/admin/emergency", label: "Notfall",       icon: "⚠", exact: false, danger: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [role,  setRole ] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const jwt = parseTokenRole();
    if (!jwt?.role || !ADMIN_ROLES.includes(jwt.role)) {
      router.replace("/dashboard?error=forbidden");
      return;
    }
    setRole(jwt.role);
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cb-gray-400 text-sm animate-pulse">Berechtigungen werden geprüft…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 max-w-screen-2xl">
      {/* Admin-Header-Banner */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-cb-petrol">Admin Control Tower</h1>
          <Badge variant="error">
            {role === "SUPER_ADMIN" ? "Super Admin" : role === "COMPLIANCE" ? "Compliance" : "Admin"}
          </Badge>
        </div>
      </div>

      {/* Tab-Navigation */}
      <div className="flex gap-0.5 border-b border-cb-gray-200 mb-5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px",
                isActive
                  ? item.danger
                    ? "border-red-500 text-red-600"
                    : "border-cb-yellow text-cb-petrol"
                  : "border-transparent text-cb-gray-500 hover:text-cb-petrol hover:border-cb-gray-300",
              )}
            >
              <span className={cn("text-base", item.danger && isActive && "text-red-500")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
