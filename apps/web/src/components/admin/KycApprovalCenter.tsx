"use client";

/**
 * KycApprovalCenter — KYC-Verifizierungszentrum
 *
 * Tabelle aller Organisationen + Detail-Slide-Over mit:
 *   - Dokumentenvorschau (PDF via iframe, Bilder via img)
 *   - Approve-Button (grün)
 *   - Reject-Button (rot) mit Pflicht-Begründungsfeld
 *   - Optimistic Update + Rollback
 */

import { useState, useCallback }      from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn }                         from "@/lib/utils";
import { Card, CardTitle }            from "@/components/ui/Card";
import { Button }                     from "@/components/ui/Button";
import { Badge }                      from "@/components/ui/Badge";
import { EmptyState }                 from "@/components/portfolio/EmptyState";
import { useToast }                   from "@/components/ui/Toast";

// ─── Typen ────────────────────────────────────────────────────────────────────

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

interface OrgDocument {
  type:  string;    // "ID_CARD" | "TAX_CERTIFICATE" | "REGISTRATION"
  url:   string;    // presigned URL oder öffentliche URL
  name:  string;
}

interface KycOrg {
  id:                 string;
  name:               string;
  taxId:              string;
  country:            string;
  city:               string;
  verificationStatus: VerificationStatus;
  createdAt:          string;
  rejectionReason:    string | null;
  documents:          OrgDocument[];
  userCount:          number;
}

// ─── Auth-Helper ──────────────────────────────────────────────────────────────

function getToken(): string {
  if (typeof document === "undefined") return "";
  return (
    document.cookie.match(/access_token=([^;]+)/)?.[1] ??
    localStorage.getItem("access_token") ?? ""
  );
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchKyc(): Promise<{ organizations: KycOrg[] }> {
  const res = await fetch("/api/admin/kyc", {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache:   "no-store",
  });
  if (!res.ok) throw new Error("KYC-Daten konnten nicht geladen werden");
  return res.json() as Promise<{ organizations: KycOrg[] }>;
}

async function patchKyc(id: string, action: "APPROVE" | "REJECT", reason?: string) {
  const res = await fetch(`/api/admin/kyc/${encodeURIComponent(id)}`, {
    method:  "PATCH",
    headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    body:    JSON.stringify({ action, reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? "Fehler bei der Bearbeitung");
  }
}

// ─── Status-Badge ─────────────────────────────────────────────────────────────

function KycStatusBadge({ status }: { status: VerificationStatus }) {
  const map: Record<VerificationStatus, { variant: Parameters<typeof Badge>[0]["variant"]; label: string }> = {
    PENDING:  { variant: "warning", label: "Ausstehend" },
    APPROVED: { variant: "success", label: "Genehmigt"  },
    REJECTED: { variant: "error",   label: "Abgelehnt"  },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}

// ─── Dokument-Vorschau ────────────────────────────────────────────────────────

function DocumentPreview({ doc }: { doc: OrgDocument }) {
  const isPdf = doc.url.toLowerCase().endsWith(".pdf") || doc.type === "PDF";

  return (
    <div className="border border-cb-gray-200 rounded overflow-hidden">
      <div className="bg-cb-gray-50 px-3 py-2 text-xs text-cb-gray-500 font-medium border-b border-cb-gray-200 flex items-center justify-between">
        <span>{doc.name}</span>
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cb-petrol hover:underline"
        >
          Öffnen ↗
        </a>
      </div>
      {isPdf ? (
        <iframe
          src={doc.url}
          title={doc.name}
          className="w-full h-64"
          sandbox="allow-same-origin allow-scripts"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={doc.url}
          alt={doc.name}
          className="w-full object-contain max-h-64 bg-cb-gray-100"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}
    </div>
  );
}

// ─── Detail-Slide-Over ────────────────────────────────────────────────────────

function KycDetailPanel({
  org,
  onClose,
  onAction,
  isPending,
}: {
  org:       KycOrg;
  onClose:   () => void;
  onAction:  (id: string, action: "APPROVE" | "REJECT", reason?: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");
  const [step,   setStep  ] = useState<"view" | "reject">("view");

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="w-[520px] bg-cb-white h-full overflow-y-auto shadow-2xl border-l border-cb-gray-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-cb-gray-200 flex items-center justify-between bg-cb-gray-50 sticky top-0 z-10">
          <div>
            <h2 className="text-base font-semibold text-cb-petrol">{org.name}</h2>
            <p className="text-xs text-cb-gray-500">{org.city}, {org.country} · Tax-ID: {org.taxId}</p>
          </div>
          <button onClick={onClose} className="text-cb-gray-400 hover:text-cb-gray-700 text-xl font-light">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-cb-gray-50 rounded p-3 border border-cb-gray-100">
              <p className="text-xs text-cb-gray-500 mb-0.5">Status</p>
              <KycStatusBadge status={org.verificationStatus} />
            </div>
            <div className="bg-cb-gray-50 rounded p-3 border border-cb-gray-100">
              <p className="text-xs text-cb-gray-500 mb-0.5">Nutzer</p>
              <p className="font-semibold text-cb-petrol">{org.userCount}</p>
            </div>
            <div className="bg-cb-gray-50 rounded p-3 border border-cb-gray-100 col-span-2">
              <p className="text-xs text-cb-gray-500 mb-0.5">Eingereicht</p>
              <p className="font-mono text-sm">
                {new Date(org.createdAt).toLocaleString("de-DE")}
              </p>
            </div>
          </div>

          {/* Dokumente */}
          <div>
            <h3 className="text-sm font-semibold text-cb-gray-600 mb-3">
              Dokumente ({org.documents.length})
            </h3>
            {org.documents.length === 0 ? (
              <p className="text-sm text-cb-gray-400 italic">Keine Dokumente hochgeladen</p>
            ) : (
              <div className="space-y-3">
                {org.documents.map((doc, i) => (
                  <DocumentPreview key={i} doc={doc} />
                ))}
              </div>
            )}
          </div>

          {/* Ablehnung Begründung (wenn bereits abgelehnt) */}
          {org.verificationStatus === "REJECTED" && org.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-xs font-semibold text-red-700 mb-1">Ablehnungsgrund</p>
              <p className="text-sm text-red-600">{org.rejectionReason}</p>
            </div>
          )}

          {/* Ablehnungsformular */}
          {step === "reject" && (
            <div className="bg-red-50 border border-red-200 rounded p-4 space-y-3">
              <p className="text-sm font-semibold text-red-700">Begründung (Pflichtfeld)</p>
              <textarea
                className="w-full border border-red-200 rounded p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                rows={4}
                placeholder="Warum wird die Verifizierung abgelehnt? (wird an die Organisation kommuniziert)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  loading={isPending}
                  disabled={reason.trim().length < 10}
                  onClick={() => onAction(org.id, "REJECT", reason)}
                >
                  Endgültig ablehnen
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStep("view"); setReason(""); }}
                  disabled={isPending}
                >
                  Zurück
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Aktions-Buttons */}
        {org.verificationStatus === "PENDING" && step === "view" && (
          <div className="px-6 py-4 border-t border-cb-gray-200 bg-cb-gray-50 flex gap-3 sticky bottom-0">
            <Button
              variant="secondary"
              size="md"
              loading={isPending}
              className="flex-1 bg-cb-success hover:bg-green-700 border-cb-success"
              onClick={() => onAction(org.id, "APPROVE")}
            >
              Genehmigen
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1"
              onClick={() => setStep("reject")}
              disabled={isPending}
            >
              Ablehnen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export function KycApprovalCenter() {
  const toast                     = useToast();
  const queryClient               = useQueryClient();
  const [selected, setSelected]   = useState<KycOrg | null>(null);
  const [filter,   setFilter  ]   = useState<"ALL" | VerificationStatus>("PENDING");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "kyc"],
    queryFn:  fetchKyc,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "APPROVE" | "REJECT"; reason?: string }) =>
      patchKyc(id, action, reason),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
      setSelected(null);
      toast.success(
        vars.action === "APPROVE" ? "Organisation genehmigt" : "Organisation abgelehnt",
        vars.action === "APPROVE"
          ? "Der Zugang zur Plattform wurde freigeschaltet."
          : "Die Organisation wurde über die Ablehnung informiert.",
      );
    },
    onError: (err) => toast.error("Fehler", err instanceof Error ? err.message : "Unbekannter Fehler"),
  });

  const handleAction = useCallback(
    (id: string, action: "APPROVE" | "REJECT", reason?: string) => {
      mutation.mutate({ id, action, reason });
    },
    [mutation],
  );

  const filtered = (data?.organizations ?? []).filter(
    (o) => filter === "ALL" || o.verificationStatus === filter,
  );

  const pendingCount = data?.organizations.filter((o) => o.verificationStatus === "PENDING").length ?? 0;

  const header = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <CardTitle>KYC-Verifizierungszentrum</CardTitle>
        {pendingCount > 0 && (
          <Badge variant="warning" dot>{pendingCount} ausstehend</Badge>
        )}
      </div>

      {/* Filter-Tabs */}
      <div className="flex gap-1 bg-cb-gray-100 rounded p-0.5">
        {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded transition-all",
              filter === f
                ? "bg-cb-white text-cb-petrol shadow-sm"
                : "text-cb-gray-500 hover:text-cb-gray-700",
            )}
          >
            {f === "PENDING" ? "Ausstehend" : f === "APPROVED" ? "Genehmigt" : f === "REJECTED" ? "Abgelehnt" : "Alle"}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Card header={header} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-cb-gray-200 bg-cb-gray-50">
                {["Organisation", "Land / Stadt", "Tax-ID", "Nutzer", "Eingereicht", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-cb-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-cb-gray-100">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-cb-gray-100 rounded animate-pulse" style={{ width: `${50 + j * 8}%` }} />
                    </td>
                  ))}
                </tr>
              ))}

              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7}>
                  <EmptyState icon="✓" title="Keine Einträge" description="Keine Organisationen in diesem Status." size="sm" />
                </td></tr>
              )}

              {!isLoading && filtered.map((org) => (
                <tr
                  key={org.id}
                  className={cn(
                    "border-b border-cb-gray-100 hover:bg-cb-gray-50 cursor-pointer transition-colors",
                    org.verificationStatus === "PENDING" && "bg-orange-50/40",
                  )}
                  onClick={() => setSelected(org)}
                >
                  <td className="px-4 py-3 font-medium text-cb-petrol">{org.name}</td>
                  <td className="px-4 py-3 text-sm text-cb-gray-600">{org.country} · {org.city}</td>
                  <td className="px-4 py-3 font-mono text-xs text-cb-gray-500">{org.taxId}</td>
                  <td className="px-4 py-3 text-sm text-center">{org.userCount}</td>
                  <td className="px-4 py-3 text-xs text-cb-gray-500 font-mono whitespace-nowrap">
                    {new Date(org.createdAt).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-4 py-3"><KycStatusBadge status={org.verificationStatus} /></td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-cb-petrol">Details →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <KycDetailPanel
          org={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
          isPending={mutation.isPending}
        />
      )}
    </>
  );
}
