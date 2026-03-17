"use client";

/**
 * Error Boundary für alle (app)-Routen.
 * Fängt unerwartete Runtime-Fehler ab und zeigt eine Fallback-UI.
 */

import { useEffect } from "react";

interface Props {
  error:  Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: Props) {
  useEffect(() => {
    // Fehler kann hier an ein Monitoring-System (z.B. Sentry) gemeldet werden
    console.error("[AppError]", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-red-500">!</span>
        </div>
        <h2 className="text-xl font-bold text-cb-petrol mb-2">Unerwarteter Fehler</h2>
        <p className="text-cb-gray-500 text-sm mb-6">
          Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-cb-gray-400 mb-4">
            Fehler-ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-cb-petrol text-white rounded font-medium hover:bg-cb-petrol-dark transition-colors text-sm"
          >
            Erneut versuchen
          </button>
          <a
            href="/dashboard"
            className="px-5 py-2.5 border border-cb-gray-300 text-cb-gray-600 rounded font-medium hover:bg-cb-gray-50 transition-colors text-sm"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
