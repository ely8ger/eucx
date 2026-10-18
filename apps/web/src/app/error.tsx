"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[RootError]", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-red-400">!</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Unerwarteter Fehler</h2>
        <p className="text-gray-500 text-sm mb-6">
          Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
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
            href="/"
            className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
}
