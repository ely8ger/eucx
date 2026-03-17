/**
 * 404 — Seite nicht gefunden (Global)
 */
import type { Metadata } from "next";
import Link              from "next/link";

export const metadata: Metadata = {
  title:  "Seite nicht gefunden",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cb-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-cb-petrol/10 mb-4 select-none">404</div>
        <h1 className="text-2xl font-bold text-cb-petrol mb-2">Seite nicht gefunden</h1>
        <p className="text-cb-gray-500 mb-8">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-cb-petrol text-white rounded font-medium hover:bg-cb-petrol-dark transition-colors text-sm"
          >
            Zum Dashboard
          </Link>
          <Link
            href="/trading"
            className="px-5 py-2.5 border border-cb-gray-300 text-cb-gray-600 rounded font-medium hover:bg-cb-gray-50 transition-colors text-sm"
          >
            Zum Handel
          </Link>
        </div>
      </div>
    </div>
  );
}
