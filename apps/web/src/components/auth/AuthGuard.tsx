"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { refreshAccessToken, scheduleAutoLogout } from "@/store/authStore";

/**
 * AuthGuard — Token-Validierung + stiller Refresh beim Seitenaufruf.
 *
 * Problem: Nach Browser-Schließung ist sessionStorage leer, aber das (möglicherweise
 * abgelaufene) Access Token liegt noch im localStorage. Der Refresh Token im
 * HttpOnly Cookie ist bis zu 7 Tage gültig — wird aber ohne diesen Guard nie genutzt.
 *
 * Ablauf:
 *  1. Kein Token → /login
 *  2. Token gültig → Timer starten → Kinder rendern
 *  3. Token abgelaufen + Refresh Token vorhanden → /api/auth/refresh → neues Token → Timer → Kinder
 *  4. Token abgelaufen + Refresh schlägt fehl → /login
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    async function init() {
      const tkn = localStorage.getItem("accessToken") ?? "";

      if (!tkn) {
        setStatus("denied");
        router.replace("/login");
        return;
      }

      // JWT exp-Claim auslesen (ohne Bibliothek)
      let expMs = 0;
      try {
        const payload = JSON.parse(atob(tkn.split(".")[1] ?? "e30="));
        expMs = (payload.exp ?? 0) * 1000;
      } catch {
        setStatus("denied");
        router.replace("/login");
        return;
      }

      if (Date.now() < expMs) {
        // Token noch gültig → Timer starten
        scheduleAutoLogout(expMs);
        setStatus("ok");
        return;
      }

      // Token abgelaufen → stillen Refresh versuchen
      try {
        await refreshAccessToken();
        setStatus("ok");
      } catch {
        setStatus("denied");
        router.replace("/login");
      }
    }

    void init();
  }, [router]);

  if (status === "checking") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid #154194", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === "denied") return null;

  return <>{children}</>;
}
