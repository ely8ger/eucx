"use client";

/**
 * authStore - Zustand Auth-State
 *
 * Enthält User-Profil, Token-Metadaten und Auth-Aktionen.
 * Persistiert im sessionStorage (Tab-sicher, kein XSS-Risiko durch localStorage).
 *
 * accessToken: nur in-memory (nicht persistiert) — HttpOnly Cookie liegt auf dem Server.
 * refreshToken: HttpOnly Cookie, nie JS-zugänglich.
 *
 * Token-Expiry-Wächter:
 *   scheduleAutoLogout() setzt einen setTimeout für tokenExpiresAt - 30s.
 *   Bei Ablauf wird refreshAccessToken() versucht, danach ggf. logout().
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
  accessToken:      string | null;   // in-memory only — NICHT persistiert
  tokenExpiresAt:   number | null;   // Unix-ms
  totpRequired:     boolean;
  pendingEmail:     string;
  isHydrated:       boolean;

  setAuth:          (user: AuthUser, expiresAt: number, token: string) => void;
  setTotpRequired:  (email: string) => void;
  logout:           () => void;
  isAuthenticated:  () => boolean;
  isTokenExpired:   () => boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:           null,
      accessToken:    null,
      tokenExpiresAt: null,
      totpRequired:   false,
      pendingEmail:   "",
      isHydrated:     false,

      setAuth: (user, expiresAt, token) => {
        set({ user, tokenExpiresAt: expiresAt, accessToken: token, totpRequired: false, pendingEmail: "" });
      },

      setTotpRequired: (email) => {
        set({ totpRequired: true, pendingEmail: email });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        set({ user: null, tokenExpiresAt: null, accessToken: null, totpRequired: false, pendingEmail: "" });
      },

      isAuthenticated: () => {
        const state = get();
        if (!state.user || !state.accessToken) return false;
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
      // accessToken bewusst nicht persistieren — lebt nur in-memory
      partialize: (state) => ({
        user:           state.user,
        tokenExpiresAt: state.tokenExpiresAt,
        isHydrated:     state.isHydrated,
      }),
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
 * Neuer Access Token wird in-memory gespeichert (nicht in localStorage/Cookie).
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

  const store = useAuthStore.getState();
  const user  = data.user ?? store.user;
  if (user) {
    store.setAuth(user, data.expiresAt, data.accessToken);
  }

  scheduleAutoLogout(data.expiresAt);
}
