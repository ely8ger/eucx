"use client";

/**
 * authStore - Zustand Auth-State
 *
 * Enthält User-Profil, Token-Metadaten und Auth-Aktionen.
 * Persistiert im sessionStorage (Tab-sicher, kein XSS-Risiko durch localStorage).
 *
 * Token selbst bleibt im Cookie (HttpOnly für refresh, js-lesbar für access).
 * Store speichert nur die dekodierten User-Metadaten.
 *
 * Token-Expiry-Wächter:
 *   scheduleAutoLogout() setzt einen setTimeout für tokenExpiresAt - 30s.
 *   Bei Ablauf wird logout() aufgerufen → Cookie gelöscht → Redirect /login.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Typen ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id:                 string;
  email:              string;
  role:               string;
  orgId:              string;
  orgName:            string;
  verificationStatus?: string;  // GUEST | PENDING_VERIFICATION | VERIFIED | REJECTED | SUSPENDED
}

interface AuthState {
  user:             AuthUser | null;
  tokenExpiresAt:   number | null;   // Unix-ms
  totpRequired:     boolean;         // Server verlangt 2FA-Code bei diesem Login
  pendingEmail:     string;          // Für 2FA-Step: E-Mail des halbfertigen Logins
  isHydrated:       boolean;

  // Aktionen
  setAuth:          (user: AuthUser, expiresAt: number) => void;
  setTotpRequired:  (email: string) => void;
  logout:           () => void;
  isAuthenticated:  () => boolean;
  isTokenExpired:   () => boolean;
}

// ─── Cookie-Hilfsfunktionen ───────────────────────────────────────────────────

function clearAuthCookies(): void {
  if (typeof document === "undefined") return;
  document.cookie = "access_token=; path=/; max-age=0";
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:           null,
      tokenExpiresAt: null,
      totpRequired:   false,
      pendingEmail:   "",
      isHydrated:     false,

      setAuth: (user, expiresAt) => {
        set({ user, tokenExpiresAt: expiresAt, totpRequired: false, pendingEmail: "" });
      },

      setTotpRequired: (email) => {
        set({ totpRequired: true, pendingEmail: email });
      },

      logout: () => {
        clearAuthCookies();
        set({ user: null, tokenExpiresAt: null, totpRequired: false, pendingEmail: "" });
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },

      isAuthenticated: () => {
        const state = get();
        if (!state.user) return false;
        if (state.isTokenExpired()) return false;
        return true;
      },

      isTokenExpired: () => {
        const { tokenExpiresAt } = get();
        if (!tokenExpiresAt) return true;
        return Date.now() >= tokenExpiresAt;
      },
    }),
    {
      name:    "eucx-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    }
  )
);

// ─── Token-Refresh-Timer (Singleton) ─────────────────────────────────────────

let _logoutTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Setzt einen Auto-Logout-Timer 30 Sekunden vor Ablauf des Access Tokens.
 * Wird nach jedem erfolgreichen Login aufgerufen.
 */
export function scheduleAutoLogout(expiresAtMs: number): void {
  if (typeof window === "undefined") return;

  if (_logoutTimer) clearTimeout(_logoutTimer);

  const msUntilLogout = expiresAtMs - Date.now() - 30_000;
  if (msUntilLogout <= 0) {
    useAuthStore.getState().logout();
    return;
  }

  _logoutTimer = setTimeout(() => {
    // Versuche Token zu refreshen bevor wir ausloggen
    void refreshAccessToken().catch(() => {
      useAuthStore.getState().logout();
    });
  }, msUntilLogout);
}

/**
 * Erneuert den Access Token via /api/auth/refresh.
 * Refresh-Token liegt im HttpOnly Cookie - wird automatisch mitgesendet.
 */
export async function refreshAccessToken(): Promise<void> {
  const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });

  if (!res.ok) {
    useAuthStore.getState().logout();
    throw new Error("Token-Refresh fehlgeschlagen");
  }

  const data = await res.json() as {
    accessToken: string;
    expiresAt:   number;
    user?:       AuthUser;
  };

  // Neues Token ins Cookie schreiben
  document.cookie = `access_token=${data.accessToken}; path=/; max-age=900; samesite=lax${
    typeof window !== "undefined" && window.location.protocol === "https:" ? "; secure" : ""
  }`;

  if (data.user) {
    useAuthStore.getState().setAuth(data.user, data.expiresAt);
  }

  scheduleAutoLogout(data.expiresAt);
}
