"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /dashboard — Legacy-Route
 *
 * Liest die Rolle aus dem JWT und leitet sofort auf die
 * rollenspezifische Seite weiter. Middleware macht dasselbe,
 * diese Seite ist ein clientseitiger Fallback.
 */
export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Rolle aus JWT lesen (cookie oder localStorage)
    let role = "";
    try {
      const token =
        document.cookie.match(/access_token=([^;]+)/)?.[1] ??
        localStorage.getItem("accessToken") ?? "";
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
        role = payload.role ?? "";
      }
    } catch { /* ignore */ }

    if (role === "SELLER") {
      router.replace("/dashboard/seller");
    } else if (["ADMIN", "COMPLIANCE_OFFICER", "SUPER_ADMIN"].includes(role)) {
      router.replace("/admin");
    } else {
      // BUYER und alle anderen
      router.replace("/dashboard/buyer");
    }
  }, [router]);

  return null;
}
