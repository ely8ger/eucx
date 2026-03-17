"use client";

/**
 * ApiKeyManager — API-Key-Verwaltung für /settings/api
 *
 * Features:
 * - Tabelle: Name, Prefix (maskiert als eucx_***a8f), Scopes, Status, Ablauf, Letzte Nutzung
 * - "Neuen Key erstellen" Modal → zeigt Full-Key einmalig nach Erstellung
 * - Widerruf mit Bestätigung
 * - max 10 aktive Keys (serverseitig enforced)
 */

import { useState }          from "react";
import { useQuery,
         useMutation,
         useQueryClient }    from "@tanstack/react-query";
import { Button }            from "@/components/ui/Button";

// ─── Typen ────────────────────────────────────────────────────────────────────

type ApiKeyScope = "market:read" | "trade:write" | "wallet:read" | "admin:read";

interface ApiKey {
  id:          string;
  prefix:      string;
  name:        string;
  scopes:      ApiKeyScope[];
  isActive:    boolean;
  expiresAt:   string | null;
  lastUsedAt:  string | null;
  ipWhitelist: string[];
  createdAt:   string;
}

interface CreateKeyResult extends ApiKey {
  fullKey: string;
}

const ALL_SCOPES: { value: ApiKeyScope; label: string }[] = [
  { value: "market:read",  label: "Marktdaten lesen"  },
  { value: "trade:write",  label: "Aufträge erteilen" },
  { value: "wallet:read",  label: "Wallet lesen"      },
  { value: "admin:read",   label: "Admin lesen"       },
];

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function maskKey(prefix: string): string {
  // eucx_live_k7mNpQ_<random32> → eucx_live_***pQ
  const last4 = prefix.slice(-4);
  return `eucx_***${last4}`;
}

function getAuthHeader(): string {
  const token = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? "";
  return `Bearer ${token}`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return "Noch nicht verwendet";
  return new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Create-Modal ─────────────────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void;
  onCreated: (key: CreateKeyResult) => void;
}

function CreateModal({ onClose, onCreated }: CreateModalProps) {
  const [name,      setName     ] = useState("");
  const [scopes,    setScopes   ] = useState<ApiKeyScope[]>(["market:read"]);
  const [expiresAt, setExpiresAt] = useState("");
  const [error,     setError    ] = useState("");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings/api-keys", {
        method:  "POST",
        headers: { Authorization: getAuthHeader(), "Content-Type": "application/json" },
        body:    JSON.stringify({
          name,
          scopes,
          expiresAt: expiresAt || undefined,
        }),
      });
      const data = await res.json() as { data?: CreateKeyResult; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Fehler beim Erstellen");
      return data.data!;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      onCreated(data);
    },
    onError: (e: Error) => setError(e.message),
  });

  function toggleScope(scope: ApiKeyScope) {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-cb-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-cb-petrol">Neuen API-Key erstellen</h2>
          <button onClick={onClose} className="text-cb-gray-400 hover:text-cb-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-cb-gray-700 mb-1">
              Bezeichnung <span className="text-cb-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. ERP-System SAP"
              maxLength={100}
              className="w-full h-10 px-3 border border-cb-gray-300 rounded text-sm focus:outline-none focus:border-cb-yellow focus:ring-2 focus:ring-cb-yellow/20"
            />
          </div>

          {/* Scopes */}
          <div>
            <label className="block text-sm font-medium text-cb-gray-700 mb-2">
              Berechtigungen <span className="text-cb-error">*</span>
            </label>
            <div className="space-y-2">
              {ALL_SCOPES.map((s) => (
                <label key={s.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={scopes.includes(s.value)}
                    onChange={() => toggleScope(s.value)}
                    className="w-4 h-4 accent-cb-petrol"
                  />
                  <span className="text-sm text-cb-gray-700 group-hover:text-cb-petrol">{s.label}</span>
                  <code className="text-xs text-cb-gray-400 font-mono">{s.value}</code>
                </label>
              ))}
            </div>
          </div>

          {/* Ablaufdatum */}
          <div>
            <label className="block text-sm font-medium text-cb-gray-700 mb-1">
              Ablaufdatum <span className="text-cb-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value ? new Date(e.target.value).toISOString() : "")}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full h-10 px-3 border border-cb-gray-300 rounded text-sm focus:outline-none focus:border-cb-yellow focus:ring-2 focus:ring-cb-yellow/20"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!name.trim() || scopes.length === 0}
            fullWidth
          >
            Key erstellen
          </Button>
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-cb-gray-300 rounded text-sm text-cb-gray-600 hover:bg-cb-gray-50 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Key-Revealed-Modal ───────────────────────────────────────────────────────

interface KeyRevealedModalProps {
  fullKey: string;
  keyName: string;
  onClose: () => void;
}

function KeyRevealedModal({ fullKey, keyName, onClose }: KeyRevealedModalProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(fullKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-cb-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-green-600 text-lg">✓</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-cb-petrol">API-Key erstellt</h2>
            <p className="text-sm text-cb-gray-500">{keyName}</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
          <p className="text-sm text-amber-800 font-medium">
            Wichtig: Kopieren Sie den Key jetzt. Er wird nicht erneut angezeigt.
          </p>
        </div>

        <div className="bg-cb-gray-900 rounded-lg p-4 mb-4 relative group">
          <code className="text-sm font-mono text-green-400 break-all leading-relaxed">
            {fullKey}
          </code>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => void copy()} fullWidth>
            {copied ? "Kopiert!" : "Key kopieren"}
          </Button>
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-cb-gray-300 rounded text-sm text-cb-gray-600 hover:bg-cb-gray-50 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export function ApiKeyManager() {
  const [showCreate,   setShowCreate  ] = useState(false);
  const [newKey,       setNewKey      ] = useState<CreateKeyResult | null>(null);
  const [revokeId,     setRevokeId    ] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["api-keys"],
    queryFn:  async () => {
      const res  = await fetch("/api/settings/api-keys", {
        headers: { Authorization: getAuthHeader() },
      });
      const json = await res.json() as { data?: ApiKey[]; error?: string };
      if (!res.ok) throw new Error(json.error);
      return json.data ?? [];
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/settings/api-keys/${id}`, {
        method:  "DELETE",
        headers: { Authorization: getAuthHeader() },
      });
      if (!res.ok) {
        const j = await res.json() as { error?: string };
        throw new Error(j.error ?? "Fehler beim Widerrufen");
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setRevokeId(null);
    },
  });

  const keys       = data ?? [];
  const activeCount = keys.filter((k) => k.isActive).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-cb-petrol">API-Keys</h2>
          <p className="text-sm text-cb-gray-500 mt-0.5">
            {activeCount} / 10 aktive Keys
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          disabled={activeCount >= 10}
          size="sm"
        >
          + Neuer Key
        </Button>
      </div>

      {/* Tabelle */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-cb-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-700">
          Fehler beim Laden der API-Keys.
        </div>
      )}

      {!isLoading && !isError && keys.length === 0 && (
        <div className="text-center py-12 border border-dashed border-cb-gray-200 rounded-lg">
          <p className="text-cb-gray-400 text-sm">Keine API-Keys vorhanden.</p>
          <p className="text-cb-gray-400 text-xs mt-1">
            Erstellen Sie einen Key, um externen Systemen Zugriff zu gewähren.
          </p>
        </div>
      )}

      {!isLoading && keys.length > 0 && (
        <div className="border border-cb-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cb-gray-50 border-b border-cb-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-cb-gray-500 uppercase tracking-wide">Bezeichnung</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-cb-gray-500 uppercase tracking-wide">Key</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-cb-gray-500 uppercase tracking-wide hidden md:table-cell">Berechtigungen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-cb-gray-500 uppercase tracking-wide hidden lg:table-cell">Letzte Nutzung</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-cb-gray-500 uppercase tracking-wide hidden lg:table-cell">Ablauf</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-cb-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cb-gray-100">
              {keys.map((key) => (
                <tr key={key.id} className={`hover:bg-cb-gray-50/50 transition-colors ${!key.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-cb-petrol">{key.name}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono bg-cb-gray-100 px-2 py-1 rounded text-cb-gray-700">
                      {maskKey(key.prefix)}
                    </code>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.map((s) => (
                        <span key={s} className="text-xs bg-cb-petrol/10 text-cb-petrol px-1.5 py-0.5 rounded font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cb-gray-500 text-xs hidden lg:table-cell">
                    {fmtDateTime(key.lastUsedAt)}
                  </td>
                  <td className="px-4 py-3 text-cb-gray-500 text-xs hidden lg:table-cell">
                    {key.expiresAt
                      ? <span className={new Date(key.expiresAt) < new Date() ? "text-cb-error" : ""}>{fmtDate(key.expiresAt)}</span>
                      : "Kein Ablauf"}
                  </td>
                  <td className="px-4 py-3">
                    {key.isActive
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Aktiv</span>
                      : <span className="text-xs bg-cb-gray-100 text-cb-gray-500 px-2 py-0.5 rounded-full font-medium">Widerrufen</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    {key.isActive && (
                      revokeId === key.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs text-cb-gray-500">Sicher?</span>
                          <button
                            onClick={() => revokeMutation.mutate(key.id)}
                            disabled={revokeMutation.isPending}
                            className="text-xs text-cb-error hover:underline font-medium"
                          >
                            Ja
                          </button>
                          <button
                            onClick={() => setRevokeId(null)}
                            className="text-xs text-cb-gray-400 hover:underline"
                          >
                            Nein
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRevokeId(key.id)}
                          className="text-xs text-cb-gray-400 hover:text-cb-error transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Widerrufen
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(key) => {
            setShowCreate(false);
            setNewKey(key);
          }}
        />
      )}

      {newKey && (
        <KeyRevealedModal
          fullKey={newKey.fullKey}
          keyName={newKey.name}
          onClose={() => setNewKey(null)}
        />
      )}
    </div>
  );
}
