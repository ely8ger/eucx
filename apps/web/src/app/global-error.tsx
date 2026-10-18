"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error.message, error.digest);
  }, [error]);

  return (
    <html lang="de">
      <body style={{
        margin: 0,
        fontFamily: "'IBM Plex Sans', Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#fff",
      }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: "0 24px" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            backgroundColor: "#fef2f2",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <span style={{ fontSize: 24, color: "#ef4444" }}>!</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>
            Systemfehler
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 24px", lineHeight: 1.6 }}>
            Ein schwerwiegender Fehler ist aufgetreten.
            {error.digest && (
              <>
                <br />
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#9ca3af" }}>
                  ID: {error.digest}
                </span>
              </>
            )}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                padding: "10px 20px",
                backgroundColor: "#154194", color: "#fff",
                border: "none", borderRadius: 4,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
            >
              Erneut versuchen
            </button>
            <a
              href="/"
              style={{
                padding: "10px 20px",
                border: "1.5px solid #d1d5db", borderRadius: 4,
                fontSize: 14, color: "#374151", textDecoration: "none",
              }}
            >
              Startseite
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
