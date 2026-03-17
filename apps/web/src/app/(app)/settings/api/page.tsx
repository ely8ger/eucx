"use client";

/**
 * API-Key-Einstellungen — /settings/api
 */

import { ApiKeyManager } from "@/components/settings/ApiKeyManager";

export default function ApiSettingsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cb-petrol">API-Zugriff</h1>
        <p className="text-cb-gray-500 mt-1 text-sm">
          Verwalten Sie API-Keys für den programmatischen Zugriff auf EUCX-Dienste.
        </p>
      </div>

      {/* Docs-Hinweis */}
      <div className="bg-cb-petrol/5 border border-cb-petrol/20 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-cb-petrol mb-1">API-Dokumentation</h3>
        <p className="text-sm text-cb-gray-600">
          Die vollständige API-Referenz ist unter{" "}
          <a href="/api/docs" className="text-cb-petrol underline hover:text-cb-yellow-dark">
            /api/docs
          </a>{" "}
          verfügbar. Keys werden im HTTP-Header übergeben:{" "}
          <code className="text-xs bg-cb-gray-100 px-1.5 py-0.5 rounded font-mono">
            Authorization: ApiKey eucx_live_...
          </code>
        </p>
      </div>

      <div className="bg-cb-white border border-cb-gray-200 rounded-lg p-6">
        <ApiKeyManager />
      </div>
    </div>
  );
}
