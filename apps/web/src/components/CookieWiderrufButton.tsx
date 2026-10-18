"use client";

export function CookieWiderrufButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("eucx:open-cookie-banner"))}
      style={{
        color: "#154194", background: "none", border: "none", cursor: "pointer",
        textDecoration: "underline", fontSize: "inherit", padding: 0, fontFamily: "inherit",
      }}
    >
      direkt hier widerrufen
    </button>
  );
}
