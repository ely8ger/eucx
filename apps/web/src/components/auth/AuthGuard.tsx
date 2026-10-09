"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, refreshAccessToken, scheduleAutoLogout } from "@/store/authStore";

/**
 * AuthGuard - Token-Validierung + stiller Refresh beim Seitenaufruf.
 *
 * Ablauf:
 *  1. accessToken in-memory + nicht abgelaufen → Timer starten → Kinder rendern
 *  2. Kein accessToken (Reload/neuer Tab) → /api/auth/refresh via HttpOnly Cookie → ok
 *  3. Refresh schlägt fehl → /login
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    async function init() {
      const store = useAuthStore.getState();

      // Token im Speicher und noch gültig → direkt ok
      if (store.accessToken && !store.isTokenExpired()) {
        scheduleAutoLogout(store.tokenExpiresAt!);
        setStatus("ok");
        return;
      }

      // Kein Token oder abgelaufen → stiller Refresh (HttpOnly refresh_token Cookie)
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
