"use client";

/**
 * UserManagement — Vollständige Nutzerverwaltung mit Ampelsystem
 *
 * Ampel-Logik (kombiniert Account-Status + KYC-Status):
 *   🟢 Grün  — status=ACTIVE + verificationStatus=VERIFIED
 *   🟡 Gelb  — status=ACTIVE + verificationStatus=PENDING_VERIFICATION|GUEST
 *   🔴 Rot   — status=SUSPENDED | REJECTED | lockedUntil aktiv
 *   ⚪ Grau  — status=PENDING (noch nicht freigeschaltet)
 */

import { useState, useMemo }         from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn }                        from "@/lib/utils";
import { Card }                      from "@/components/ui/card";
import { Button }                    from "@/components/ui/button";
import { useToast }                  from "@/components/ui/toast";

// ─── Typen ────────────────────────────────────────────────────────────────────

type UserStatus        = "ACTIVE" | "SUSPENDED" | "PENDING" | "REJECTED";
type VerificationStatus = "GUEST" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED";

interface AdminUser {
  id:                 string;
  email:              string;
  role:               string;
  status:             UserStatus;
  verificationStatus: VerificationStatus;
  emailVerified:      boolean;
  failedLoginCount:   number;
  isLocked:           boolean;
  lockedUntil:        string | null;
  rejectionReason:    string | null;
  createdAt:          string;
  orgName:            string;
  orgCountry:         string;
  orgCity:            string;
  orgVerified:        boolean;
}

interface ApiResponse {
  counts: {
    total: number; active: number; pending: number;
    suspended: number; rejected: number; verified: number; locked: number;
  };
  users: AdminUser[];
}

// ─── Ampel-Logik ──────────────────────────────────────────────────────────────

type AmpelColor = "green" | "red" | "gray";

function getAmpel(user: AdminUser): AmpelColor {
  if (user.status === "SUSPENDED" || user.status === "REJECTED" || user.isLocked) return "red";
  if (user.status === "PENDING") return "gray";
  if (user.status === "ACTIVE" && user.verificationStatus === "VERIFIED") return "green";
  return "gray"; // ACTIVE aber KYC noch nicht VERIFIED → noch nicht handelsberechtigt
}

const AMPEL_STYLES: Record<AmpelColor, { dot: string; label: string; bg: string }> = {
  green: { dot: "#16a34a", label: "Aktiv & Verifiziert",        bg: "#f0fdf4" },
  red:   { dot: "#dc2626", label: "Gesperrt / Abgelehnt",       bg: "#fef2f2" },
  gray:  { dot: "#9ca3af", label: "Wartet auf Freischaltung",   bg: "#f9fafb" },
};

function AmpelDot({ color, size = 12 }: { color: AmpelColor; size?: number }) {
  const style = AMPEL_STYLES[color];
  return (
    <span style={{
      display:      "inline-block",
      width:        size, height: size,
      borderRadius: "50%",
      backgroundColor: style.dot,
      boxShadow:    color === "green"
        ? "0 0 0 3px rgba(22,163,74,.15)"
        : color === "red"
        ? "0 0 0 3px rgba(220,38,38,.15)"
        : "none",
      flexShrink: 0,
    }} />
  );
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE:    "Aktiv",
  PENDING:   "Ausstehend",
  SUSPENDED: "Gesperrt",
  REJECTED:  "Abgelehnt",
};

const KYC_LABEL: Record<VerificationStatus, string> = {
  GUEST:                "Neu",
  PENDING_VERIFICATION: "KYC eingereicht",
  VERIFIED:             "Verifiziert",
  REJECTED:             "KYC abgelehnt",
  SUSPENDED:            "KYC gesperrt",
};

const ROLE_LABEL: Record<string, string> = {
  BUYER:              "Käufer",
  SELLER:             "Verkäufer",
  BROKER:             "Broker",
  ADMIN:              "Admin",
  COMPLIANCE_OFFICER: "Compliance",
  SUPER_ADMIN:        "Super Admin",
};

function getToken(): string {
  if (typeof document === "undefined") return "";
  return (
    document.cookie.match(/access_token=([^;]+)/)?.[1] ??
    localStorage.getItem("accessToken") ?? ""
  );
}

// ─── Status-Dropdown ──────────────────────────────────────────────────────────

const ACCOUNT_OPTIONS: { value: UserStatus; label: string; color: string }[] = [
  { value: "ACTIVE",    label: "Aktiv",      color: "#16a34a" },
  { value: "PENDING",   label: "Ausstehend", color: "#9ca3af" },
  { value: "SUSPENDED", label: "Gesperrt",   color: "#dc2626" },
  { value: "REJECTED",  label: "Abgelehnt",  color: "#dc2626" },
];

const KYC_OPTIONS: { value: VerificationStatus; label: string; color: string }[] = [
  { value: "GUEST",                label: "Neu",            color: "#9ca3af" },
  { value: "PENDING_VERIFICATION", label: "KYC eingereicht", color: "#d97706" },
  { value: "VERIFIED",             label: "Verifiziert",    color: "#16a34a" },
  { value: "REJECTED",             label: "KYC abgelehnt",  color: "#dc2626" },
  { value: "SUSPENDED",            label: "KYC gesperrt",   color: "#dc2626" },
];

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchUsers(params: { q: string; status: string; role: string }): Promise<ApiResponse> {
  const sp = new URLSearchParams();
  if (params.q)      sp.set("q",      params.q);
  if (params.status) sp.set("status", params.status);
  if (params.role)   sp.set("role",   params.role);
  const res = await fetch(`/api/admin/users?${sp.toString()}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache:   "no-store",
  });
  if (!res.ok) throw new Error("Fehler beim Laden");
  return res.json() as Promise<ApiResponse>;
}

async function patchUser(id: string, data: { status?: string; verificationStatus?: string; note?: string }) {
  const res = await fetch(`/api/admin/users/${id}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body:    JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? "Fehler beim Speichern");
  }
  return res.json();
}

// ─── Hauptkomponente ───────────────────────────────────────────────────────────

export function UserManagement() {
  const qc    = useQueryClient();
  const toast = useToast();

  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("");
  const [filterRole,    setFilterRole]    = useState("");
  const [filterAmpel,   setFilterAmpel]   = useState<AmpelColor | "">("");
  const [selectedUser,  setSelectedUser]  = useState<AdminUser | null>(null);
  const [pendingStatus, setPendingStatus] = useState<{ status?: string; verificationStatus?: string } | null>(null);
  const [note,          setNote]          = useState("");

  const queryParams = useMemo(
    () => ({ q: search, status: filterStatus, role: filterRole }),
    [search, filterStatus, filterRole],
  );

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["admin-users", queryParams],
    queryFn:  () => fetchUsers(queryParams),
    refetchInterval: 60_000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof patchUser>[1] }) =>
      patchUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Status aktualisiert.");
      setPendingStatus(null);
      setNote("");
      // Selecteduser updaten
      setSelectedUser((prev) => prev ? { ...prev, ...(pendingStatus ?? {}) } as AdminUser : null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function applyChange() {
    if (!selectedUser || !pendingStatus) return;
    mutation.mutate({
      id:   selectedUser.id,
      data: { ...pendingStatus, note: note || undefined },
    });
  }

  // Ampel-Filter client-seitig
  const visibleUsers = useMemo(() => {
    const all = data?.users ?? [];
    if (!filterAmpel) return all;
    return all.filter((u) => getAmpel(u) === filterAmpel);
  }, [data?.users, filterAmpel]);

  const counts = data?.counts;

  return (
    <div className="flex flex-col gap-5">

      {/* ─── KPI-Leiste ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Gesamt",       value: counts?.total     ?? "—", color: "#154194" },
          { label: "Aktiv",        value: counts?.active    ?? "—", color: "#16a34a" },
          { label: "Ausstehend",   value: counts?.pending   ?? "—", color: "#d97706" },
          { label: "Verifiziert",  value: counts?.verified  ?? "—", color: "#154194" },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-xs text-cb-gray-500 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* ─── Filter-Leiste ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Suche */}
        <input
          type="search"
          placeholder="Name oder E-Mail suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-cb-gray-300 px-3 py-2 text-sm w-56 focus:outline-none focus:border-cb-petrol"
        />

        {/* Ampel-Filter */}
        <div className="flex gap-1.5">
          {(["", "green", "red", "gray"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilterAmpel(c)}
              title={c ? AMPEL_STYLES[c].label : "Alle"}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-all",
                filterAmpel === c
                  ? "bg-cb-petrol text-white border-cb-petrol"
                  : "bg-white text-cb-gray-600 border-cb-gray-300 hover:border-cb-petrol",
              )}
            >
              {c ? <AmpelDot color={c} size={9} /> : null}
              {c ? AMPEL_STYLES[c].label : "Alle"}
            </button>
          ))}
        </div>

        {/* Status-Dropdown */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-cb-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-cb-petrol"
        >
          <option value="">Alle Konten</option>
          {ACCOUNT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Rollen-Dropdown */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="border border-cb-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-cb-petrol"
        >
          <option value="">Alle Rollen</option>
          {Object.entries(ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>

        <span className="text-xs text-cb-gray-400 ml-auto">
          {visibleUsers.length} Nutzer
        </span>
      </div>

      {/* ─── Hauptbereich: Tabelle + Detail-Panel ─────────────────────────── */}
      <div className="flex gap-5">

        {/* Tabelle */}
        <div className="flex-1 min-w-0">
          {isLoading && (
            <p className="text-sm text-cb-gray-400 animate-pulse py-8 text-center">
              Lade Nutzerliste…
            </p>
          )}
          {!isLoading && visibleUsers.length === 0 && (
            <p className="text-sm text-cb-gray-400 py-8 text-center">Keine Nutzer gefunden.</p>
          )}
          {!isLoading && visibleUsers.length > 0 && (
            <div className="border border-cb-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cb-gray-50 border-b border-cb-gray-200 text-left">
                    <th className="px-3 py-3 w-10">Ampel</th>
                    <th className="px-3 py-3 font-semibold text-cb-gray-700">Organisation</th>
                    <th className="px-3 py-3 font-semibold text-cb-gray-700">E-Mail</th>
                    <th className="px-3 py-3 font-semibold text-cb-gray-700">Rolle</th>
                    <th className="px-3 py-3 font-semibold text-cb-gray-700">Konto</th>
                    <th className="px-3 py-3 font-semibold text-cb-gray-700">KYC</th>
                    <th className="px-3 py-3 font-semibold text-cb-gray-700">Registriert</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user, i) => {
                    const ampel = getAmpel(user);
                    const isSelected = selectedUser?.id === user.id;
                    return (
                      <tr
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user);
                          setPendingStatus(null);
                          setNote("");
                        }}
                        className={cn(
                          "border-b border-cb-gray-100 cursor-pointer transition-colors",
                          isSelected
                            ? "bg-cb-yellow/10"
                            : i % 2 === 0 ? "bg-white hover:bg-cb-gray-50" : "bg-cb-gray-50/40 hover:bg-cb-gray-50",
                        )}
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center">
                            <AmpelDot color={ampel} size={12} />
                          </div>
                        </td>
                        <td className="px-3 py-3 font-medium text-cb-petrol max-w-[160px] truncate">
                          {user.orgName}
                        </td>
                        <td className="px-3 py-3 text-cb-gray-600 max-w-[180px] truncate">
                          {user.email}
                          {!user.emailVerified && (
                            <span className="ml-1 text-xs text-orange-500">●</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-cb-gray-500 text-xs">
                          {ROLE_LABEL[user.role] ?? user.role}
                        </td>
                        <td className="px-3 py-3">
                          <span className={cn(
                            "inline-block px-2 py-0.5 text-xs font-medium",
                            user.status === "ACTIVE"    && "bg-green-100 text-green-700",
                            user.status === "PENDING"   && "bg-gray-100 text-gray-600",
                            user.status === "SUSPENDED" && "bg-red-100 text-red-700",
                            user.status === "REJECTED"  && "bg-red-100 text-red-700",
                          )}>
                            {STATUS_LABEL[user.status]}
                          </span>
                          {user.isLocked && (
                            <span className="ml-1 text-xs text-red-500" title="Login gesperrt">🔒</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className={cn(
                            "inline-block px-2 py-0.5 text-xs font-medium",
                            user.verificationStatus === "VERIFIED"             && "bg-green-100 text-green-700",
                            user.verificationStatus === "PENDING_VERIFICATION" && "bg-yellow-100 text-yellow-700",
                            user.verificationStatus === "GUEST"                && "bg-gray-100 text-gray-600",
                            user.verificationStatus === "REJECTED"             && "bg-red-100 text-red-700",
                            user.verificationStatus === "SUSPENDED"            && "bg-red-100 text-red-700",
                          )}>
                            {KYC_LABEL[user.verificationStatus]}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-cb-gray-400 text-xs whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString("de-DE")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── Detail & Ampel-Einstellung ───────────────────────────────── */}
        {selectedUser && (
          <div className="w-80 shrink-0">
            <Card className="p-5 flex flex-col gap-4 sticky top-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AmpelDot color={getAmpel(selectedUser)} size={14} />
                  <span className="font-semibold text-sm text-cb-petrol leading-tight">
                    {selectedUser.orgName}
                  </span>
                </div>
                <button
                  onClick={() => { setSelectedUser(null); setPendingStatus(null); }}
                  className="text-cb-gray-400 hover:text-cb-gray-700 text-xl leading-none shrink-0"
                >
                  ×
                </button>
              </div>

              {/* Ampel-Legende */}
              {(() => {
                const ampel = getAmpel(selectedUser);
                const style = AMPEL_STYLES[ampel];
                return (
                  <div style={{ background: style.bg, padding: "10px 12px", borderLeft: `4px solid ${style.dot}` }}>
                    <p className="text-xs font-semibold" style={{ color: style.dot }}>{style.label}</p>
                  </div>
                );
              })()}

              {/* Nutzer-Info */}
              <dl className="text-sm space-y-2">
                {[
                  ["E-Mail",        selectedUser.email],
                  ["Rolle",         ROLE_LABEL[selectedUser.role] ?? selectedUser.role],
                  ["Land / Stadt",  `${selectedUser.orgCountry} — ${selectedUser.orgCity}`],
                  ["E-Mail best.",  selectedUser.emailVerified ? "Ja" : "Nein"],
                  ["Fehlversuche",  String(selectedUser.failedLoginCount)],
                  ["Registriert",   new Date(selectedUser.createdAt).toLocaleDateString("de-DE")],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between gap-2 text-xs">
                    <dt className="text-cb-gray-500 shrink-0">{l}</dt>
                    <dd className="font-medium text-right">{v}</dd>
                  </div>
                ))}
              </dl>

              {selectedUser.rejectionReason && (
                <div className="bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  <strong>Ablehnungsgrund:</strong> {selectedUser.rejectionReason}
                </div>
              )}

              {/* ── Ampel einstellen ────────────────────────────────────── */}
              <div className="border-t border-cb-gray-100 pt-4 flex flex-col gap-3">
                <p className="text-xs font-semibold text-cb-gray-700 uppercase tracking-wide">
                  Status einstellen
                </p>

                {/* Konto-Status */}
                <div>
                  <label className="text-xs text-cb-gray-500 block mb-1">Konto-Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ACCOUNT_OPTIONS.map((opt) => {
                      const current = pendingStatus?.status ?? selectedUser.status;
                      const active  = current === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setPendingStatus((p) => ({ ...p, status: opt.value }))}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border transition-all",
                            active
                              ? "text-white border-transparent"
                              : "bg-white text-cb-gray-600 border-cb-gray-300 hover:border-cb-petrol",
                          )}
                          style={active ? { backgroundColor: opt.color, borderColor: opt.color } : {}}
                        >
                          <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: active ? "#fff" : opt.color, display: "inline-block" }} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* KYC-Status */}
                <div>
                  <label className="text-xs text-cb-gray-500 block mb-1">KYC-Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {KYC_OPTIONS.map((opt) => {
                      const current = pendingStatus?.verificationStatus ?? selectedUser.verificationStatus;
                      const active  = current === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setPendingStatus((p) => ({ ...p, verificationStatus: opt.value }))}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border transition-all",
                            active
                              ? "text-white border-transparent"
                              : "bg-white text-cb-gray-600 border-cb-gray-300 hover:border-cb-petrol",
                          )}
                          style={active ? { backgroundColor: opt.color, borderColor: opt.color } : {}}
                        >
                          <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: active ? "#fff" : opt.color, display: "inline-block" }} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notiz */}
                {pendingStatus && (
                  <div>
                    <label className="text-xs text-cb-gray-500 block mb-1">Interne Notiz (optional)</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Begründung für die Statusänderung…"
                      rows={2}
                      className="w-full border border-cb-gray-300 p-2 text-xs resize-none focus:outline-none focus:border-cb-petrol"
                    />
                  </div>
                )}

                <Button
                  onClick={applyChange}
                  disabled={!pendingStatus || mutation.isPending}
                  className={cn(
                    "w-full text-sm",
                    pendingStatus ? "bg-cb-petrol hover:bg-cb-petrol/90 text-white" : "bg-cb-gray-200 text-cb-gray-400 cursor-not-allowed",
                  )}
                >
                  {mutation.isPending ? "Wird gespeichert…" : "Änderungen speichern"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
