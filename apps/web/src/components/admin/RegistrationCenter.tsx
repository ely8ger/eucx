"use client";

/**
 * RegistrationCenter — Admin-Ansicht für Registrierungsanfragen
 *
 * Tabs: Offen (PENDING) | Geprüft (ACTIVE) | Abgelehnt (REJECTED)
 * Aktionen: Freischalten (APPROVE) | Ablehnen (REJECT + Pflichtbegründung)
 * Nach jeder Aktion: E-Mail an Nutzer, optimistisches Update
 */

import { useState, useCallback }      from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn }                         from "@/lib/utils";
import { Card, CardTitle }            from "@/components/ui/card";
import { Button }                     from "@/components/ui/button";
import { Badge }                      from "@/components/ui/badge";
import { EmptyState }                 from "@/components/portfolio/EmptyState";
import { useToast }                   from "@/components/ui/toast";

// ─── Typen ────────────────────────────────────────────────────────────────────

type RegStatus = "PENDING" | "ACTIVE" | "REJECTED";

interface RegistrationUser {
  id:              string;
  email:           string;
  role:            string;
  status:          RegStatus;
  emailVerified:   boolean;
  rejectionReason: string | null;
  createdAt:       string;
  orgName:         string;
  orgTaxId:        string;
  orgCountry:      string;
  orgCity:         string;
}

interface ApiResponse {
  offen:     number;
  geprueft:  number;
  abgelehnt: number;
  users:     RegistrationUser[];
}

// ─── Auth-Helper ──────────────────────────────────────────────────────────────

function getToken(): string {
  if (typeof document === "undefined") return "";
  return (
    document.cookie.match(/access_token=([^;]+)/)?.[1] ??
    localStorage.getItem("accessToken") ?? ""
  );
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchRegistrations(): Promise<ApiResponse> {
  const res = await fetch("/api/admin/registrations", {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache:   "no-store",
  });
  if (!res.ok) throw new Error("Fehler beim Laden");
  return res.json() as Promise<ApiResponse>;
}

async function patchRegistration(id: string, action: "APPROVE" | "REJECT", reason?: string) {
  const res = await fetch(`/api/admin/registrations/${id}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body:    JSON.stringify({ action, reason }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? "Aktion fehlgeschlagen");
  }
  return res.json();
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  BUYER:  "Käufer",
  SELLER: "Verkäufer",
  BROKER: "Broker",
};

function statusBadge(status: RegStatus) {
  if (status === "PENDING")  return <Badge variant="warning">Offen</Badge>;
  if (status === "ACTIVE")   return <Badge variant="success">Geprüft</Badge>;
  return                            <Badge variant="error">Abgelehnt</Badge>;
}

// ─── Hauptkomponente ───────────────────────────────────────────────────────────

type Tab = "PENDING" | "ACTIVE" | "REJECTED";

export function RegistrationCenter() {
  const qc    = useQueryClient();
  const toast = useToast();
  const [activeTab,      setActiveTab]      = useState<Tab>("PENDING");
  const [selectedUser,   setSelectedUser]   = useState<RegistrationUser | null>(null);
  const [rejectReason,   setRejectReason]   = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["admin-registrations"],
    queryFn:  fetchRegistrations,
    refetchInterval: 30_000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "APPROVE" | "REJECT"; reason?: string }) =>
      patchRegistration(id, action, reason),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-registrations"] });
      toast.success(vars.action === "APPROVE" ? "Registrierung genehmigt." : "Registrierung abgelehnt.");
      setSelectedUser(null);
      setShowRejectForm(false);
      setRejectReason("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleApprove = useCallback((user: RegistrationUser) => {
    mutation.mutate({ id: user.id, action: "APPROVE" });
  }, [mutation]);

  const handleReject = useCallback((user: RegistrationUser) => {
    if (!rejectReason.trim()) {
      toast.error("Bitte geben Sie eine Begründung ein.");
      return;
    }
    mutation.mutate({ id: user.id, action: "REJECT", reason: rejectReason });
  }, [mutation, rejectReason, toast]);

  const visibleUsers = (data?.users ?? []).filter((u) => u.status === activeTab);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "PENDING",  label: "Offen",     count: data?.offen     ?? 0 },
    { key: "ACTIVE",   label: "Geprüft",   count: data?.geprueft  ?? 0 },
    { key: "REJECTED", label: "Abgelehnt", count: data?.abgelehnt ?? 0 },
  ];

  return (
    <div className="flex gap-5">
      {/* ─── Linke Seite: Tabelle ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Tabs */}
        <div className="flex gap-0.5 border-b border-cb-gray-200 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedUser(null); setShowRejectForm(false); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px",
                activeTab === tab.key
                  ? "border-cb-yellow text-cb-petrol"
                  : "border-transparent text-cb-gray-500 hover:text-cb-petrol hover:border-cb-gray-300",
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                  tab.key === "PENDING" ? "bg-orange-100 text-orange-700" : "bg-cb-gray-100 text-cb-gray-500",
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tabelle */}
        {isLoading && (
          <p className="text-sm text-cb-gray-400 animate-pulse">Lade Registrierungen…</p>
        )}
        {error && (
          <p className="text-sm text-red-600">Fehler beim Laden. Bitte Seite neu laden.</p>
        )}
        {!isLoading && visibleUsers.length === 0 && (
          <EmptyState
            title={activeTab === "PENDING" ? "Keine ausstehenden Anfragen" : "Keine Einträge"}
            description={activeTab === "PENDING" ? "Aktuell gibt es keine neuen Registrierungsanfragen." : ""}
          />
        )}
        {!isLoading && visibleUsers.length > 0 && (
          <div className="border border-cb-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cb-gray-50 border-b border-cb-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-cb-gray-700">Organisation</th>
                  <th className="text-left px-4 py-3 font-semibold text-cb-gray-700">E-Mail</th>
                  <th className="text-left px-4 py-3 font-semibold text-cb-gray-700">Rolle</th>
                  <th className="text-left px-4 py-3 font-semibold text-cb-gray-700">Land</th>
                  <th className="text-left px-4 py-3 font-semibold text-cb-gray-700">Datum</th>
                  <th className="text-left px-4 py-3 font-semibold text-cb-gray-700">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user, i) => (
                  <tr
                    key={user.id}
                    onClick={() => { setSelectedUser(user); setShowRejectForm(false); setRejectReason(""); }}
                    className={cn(
                      "border-b border-cb-gray-100 cursor-pointer transition-colors",
                      i % 2 === 0 ? "bg-white" : "bg-cb-gray-50/40",
                      selectedUser?.id === user.id ? "bg-cb-yellow/10 border-cb-yellow" : "hover:bg-cb-gray-50",
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-cb-petrol">{user.orgName}</td>
                    <td className="px-4 py-3 text-cb-gray-600">{user.email}</td>
                    <td className="px-4 py-3">{ROLE_LABEL[user.role] ?? user.role}</td>
                    <td className="px-4 py-3 uppercase text-xs tracking-wider">{user.orgCountry}</td>
                    <td className="px-4 py-3 text-cb-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-4 py-3">{statusBadge(user.status)}</td>
                    <td className="px-4 py-3 text-right">
                      {user.status === "PENDING" && (
                        <span className="text-xs text-cb-gray-400">Details →</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Rechte Seite: Detail-Panel ───────────────────────────────────── */}
      {selectedUser && (
        <div className="w-80 shrink-0">
          <Card className="p-5 flex flex-col gap-4 sticky top-4">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{selectedUser.orgName}</CardTitle>
              <button
                onClick={() => { setSelectedUser(null); setShowRejectForm(false); }}
                className="text-cb-gray-400 hover:text-cb-gray-700 text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Details */}
            <dl className="text-sm space-y-2">
              {[
                ["E-Mail",       selectedUser.email],
                ["Rolle",        ROLE_LABEL[selectedUser.role] ?? selectedUser.role],
                ["Steuer-ID",    selectedUser.orgTaxId],
                ["Stadt",        selectedUser.orgCity],
                ["Land",         selectedUser.orgCountry.toUpperCase()],
                ["Registriert",  new Date(selectedUser.createdAt).toLocaleString("de-DE")],
                ["E-Mail bestätigt", selectedUser.emailVerified ? "Ja" : "Nein — noch ausstehend"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-cb-gray-500 shrink-0">{label}</dt>
                  <dd className="font-medium text-right">{value}</dd>
                </div>
              ))}
            </dl>

            {selectedUser.rejectionReason && (
              <div className="bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <p className="font-semibold mb-1">Ablehnungsgrund:</p>
                <p>{selectedUser.rejectionReason}</p>
              </div>
            )}

            {/* Aktionen — nur für PENDING */}
            {selectedUser.status === "PENDING" && (
              <div className="flex flex-col gap-2 pt-2 border-t border-cb-gray-100">
                {!showRejectForm ? (
                  <>
                    <Button
                      onClick={() => handleApprove(selectedUser)}
                      disabled={mutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {mutation.isPending ? "Wird gespeichert…" : "✓ Freischalten"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectForm(true)}
                      disabled={mutation.isPending}
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    >
                      ✕ Ablehnen
                    </Button>
                  </>
                ) : (
                  <>
                    <label className="text-xs font-semibold text-cb-gray-700">
                      Begründung <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="z.B. Handelsregisternummer nicht verifizierbar"
                      rows={3}
                      className="w-full border border-cb-gray-300 p-2 text-sm resize-none focus:outline-none focus:border-cb-petrol"
                    />
                    <Button
                      onClick={() => handleReject(selectedUser)}
                      disabled={mutation.isPending || !rejectReason.trim()}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      {mutation.isPending ? "Wird gespeichert…" : "Ablehnung bestätigen"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
                      disabled={mutation.isPending}
                      className="w-full"
                    >
                      Abbrechen
                    </Button>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
