"use client";

/**
 * NotificationBell — Glocken-Icon mit rotem Badge + Dropdown
 *
 * Polling: alle 30s via /api/notifications?limit=10
 * Badge: rote Zahl für ungelesene Benachrichtigungen
 * Dropdown: letzte 10 Events mit Klick → als gelesen markieren
 *
 * Design: Gov-Blue #154194, inline CSS, kein Tailwind
 */

import { useState, useEffect, useRef, useCallback } from "react";

interface NotifItem {
  id:        string;
  type:      string;
  title:     string;
  message:   string;
  lotId:     string | null;
  isRead:    boolean;
  createdAt: string;
}

interface Props {
  token: string;
}

const TYPE_ICON: Record<string, string> = {
  OUTBID:       "▼",
  LEADING:      "▲",
  URGENCY_10M:  "⏱",
  URGENCY_5M:   "⚡",
  WON:          "✓",
  LOST:         "○",
  CLOSED_BUYER: "✓",
  DEPOSIT_WARN: "!",
};

const TYPE_COLOR: Record<string, string> = {
  OUTBID:       "#dc2626",
  LEADING:      "#16a34a",
  URGENCY_10M:  "#d97706",
  URGENCY_5M:   "#dc2626",
  WON:          "#16a34a",
  LOST:         "#6b7280",
  CLOSED_BUYER: "#154194",
  DEPOSIT_WARN: "#d97706",
};

export function NotificationBell({ token }: Props) {
  const [open,        setOpen]        = useState(false);
  const [items,       setItems]       = useState<NotifItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Notifications laden ──────────────────────────────────────────
  const load = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch("/api/notifications?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return;
      const d = await r.json() as { notifications: NotifItem[]; unreadCount: number };
      setItems(d.notifications);
      setUnreadCount(d.unreadCount);
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  // ── Klick außerhalb schließt Dropdown ────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Alle als gelesen markieren ───────────────────────────────────
  async function markAllRead() {
    if (!token || unreadCount === 0) return;
    await fetch("/api/notifications", {
      method:  "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ markAllRead: true }),
    }).catch(() => {});
    setUnreadCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  // ── Einzelne Notification als gelesen markieren ──────────────────
  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method:  "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ ids: [id] }),
    }).catch(() => {});
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      {/* Glocken-Button */}
      <button
        onClick={() => { setOpen((v) => !v); if (!open) load(); }}
        style={{
          background:   "transparent",
          border:       "none",
          cursor:       "pointer",
          padding:      "6px 8px",
          position:     "relative",
          display:      "flex",
          alignItems:   "center",
          color:        "#fff",
          fontSize:     20,
          lineHeight:   1,
        }}
        aria-label="Benachrichtigungen"
        title="Benachrichtigungen"
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position:       "absolute",
            top:            2,
            right:          2,
            background:     "#dc2626",
            color:          "#fff",
            borderRadius:   "50%",
            minWidth:       16,
            height:         16,
            fontSize:       10,
            fontWeight:     700,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            lineHeight:     1,
            padding:        "0 3px",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:     "absolute",
          right:        0,
          top:          "calc(100% + 6px)",
          width:        340,
          background:   "#fff",
          border:       "1px solid #e5e7eb",
          boxShadow:    "0 8px 24px rgba(0,0,0,0.12)",
          zIndex:       1000,
          fontFamily:   '"IBM Plex Sans", Helvetica Neue, Arial, sans-serif',
        }}>
          {/* Header */}
          <div style={{
            padding:        "12px 16px",
            borderBottom:   "2px solid #154194",
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
          }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a" }}>
              Benachrichtigungen
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: 8,
                  background: "#154194",
                  color:      "#fff",
                  fontSize:   10,
                  fontWeight: 700,
                  padding:    "1px 6px",
                  borderRadius: 2,
                }}>
                  {unreadCount} neu
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: "transparent",
                  border:     "none",
                  fontSize:   11,
                  color:      "#154194",
                  cursor:     "pointer",
                  fontWeight: 600,
                }}
              >
                Alle gelesen
              </button>
            )}
          </div>

          {/* Liste */}
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {items.length === 0 ? (
              <div style={{ padding: "28px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                Keine Benachrichtigungen
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  style={{
                    padding:       "10px 16px",
                    borderBottom:  "1px solid #f3f4f6",
                    background:    n.isRead ? "#fff" : "#f0f4ff",
                    cursor:        n.isRead ? "default" : "pointer",
                    display:       "flex",
                    gap:           10,
                    alignItems:    "flex-start",
                    transition:    "background 0.15s",
                  }}
                >
                  {/* Typ-Icon */}
                  <span style={{
                    fontSize:       15,
                    color:          TYPE_COLOR[n.type] ?? "#6b7280",
                    fontWeight:     700,
                    minWidth:       16,
                    lineHeight:     1.4,
                  }}>
                    {TYPE_ICON[n.type] ?? "•"}
                  </span>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize:    12.5,
                      fontWeight:  n.isRead ? 400 : 700,
                      color:       "#1a1a1a",
                      marginBottom: 2,
                      lineHeight:  1.3,
                    }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#6b7280", lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                  </div>

                  {/* Zeit */}
                  <span style={{ fontSize: 10.5, color: "#9ca3af", whiteSpace: "nowrap", marginTop: 1 }}>
                    {fmtTime(n.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding:      "10px 16px",
            borderTop:    "1px solid #e5e7eb",
            textAlign:    "center",
          }}>
            <a
              href="/dashboard/settings/notifications"
              style={{ fontSize: 11.5, color: "#154194", textDecoration: "none", fontWeight: 500 }}
            >
              Einstellungen →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
