"use client";

/**
 * /api/docs — Swagger UI via CDN iframe
 * Skill #5: API-First Documentation für Copper-Entwickler
 */
export default function ApiDocsPage() {
  const specUrl = "/api/docs/openapi.json";
  const swaggerUrl = `https://petstore.swagger.io/v2/swagger.json`; // placeholder
  void swaggerUrl;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-cb-petrol text-white px-6 py-4 flex items-center gap-3 shrink-0">
        <div className="font-bold text-xl tracking-tight">
          <span className="text-cb-yellow">EUCX</span> API Docs
        </div>
        <span className="text-sm text-white/60">
          OpenAPI 3.0 — für Copper-Entwickler
        </span>
        <a
          href={specUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-xs text-cb-yellow underline"
        >
          openapi.json ↗
        </a>
      </div>
      {/* Swagger UI via CDN */}
      <iframe
        src={`https://petstore.swagger.io/?url=${encodeURIComponent("https://eucx.eu" + specUrl)}`}
        className="flex-1 border-0"
        style={{ minHeight: "calc(100vh - 56px)" }}
        title="EUCX API Dokumentation"
      />
    </div>
  );
}
