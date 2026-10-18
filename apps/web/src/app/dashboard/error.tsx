"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[DashboardError]", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-red-400">!</span>
        </div>
        <h2 className="text-xl font-bold text-[#154194] mb-2">Unerwarteter Fehler</h2>
        <p className="text-gray-500 text-sm mb-6">
          Bitte versuchen Sie es erneut oder kehren Sie zur Dashboard-Übersicht zurück.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-gray-400 mb-4">Fehler-ID: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[#154194] text-white rounded font-medium text-sm hover:bg-[#0f3070] transition-colors"
          >
            Erneut versuchen
          </button>
          <a
            href="/dashboard"
            className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
