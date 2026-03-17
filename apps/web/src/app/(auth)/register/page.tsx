"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── SVG Logo-Mark ──────────────────────────────────────────────────────────────
const EucxMark = () => (
  <svg width="32" height="27" viewBox="0 0 36 30" fill="none" aria-hidden="true">
    <rect x="0" y="0"    width="36" height="6.5"  rx="3.25" fill="#FBB809" />
    <rect x="0" y="11.75" width="24" height="6.5" rx="3.25" fill="#FBB809" />
    <rect x="0" y="23.5" width="36" height="6.5"  rx="3.25" fill="#FBB809" />
  </svg>
);

// ── Dark Input ─────────────────────────────────────────────────────────────────
interface DarkInputProps {
  id?:           string;
  label:         string;
  name:          string;
  type?:         string;
  placeholder?:  string;
  hint?:         string;
  required?:     boolean;
  defaultValue?: string;
}

const DarkInput = ({ id, label, name, type = "text", placeholder, hint, required }: DarkInputProps) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id ?? name} className="text-xs font-semibold uppercase tracking-widest text-dm-muted">
      {label}{required && <span className="ml-1 text-dm-gold">*</span>}
    </label>
    <input
      id={id ?? name}
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      className={[
        "w-full h-12 rounded-sm border bg-dm-input",
        "text-sm text-dm-text placeholder:text-dm-muted-2",
        "transition-all duration-200 px-4",
        "focus:outline-none border-dm-border focus:border-dm-gold focus:ring-1 focus:ring-dm-gold/25",
      ].join(" ")}
    />
    {hint && <p className="text-xs text-dm-muted-2">{hint}</p>}
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:            fd.get("email"),
          password:         fd.get("password"),
          organizationName: fd.get("organizationName"),
          taxId:            fd.get("taxId"),
          country:          fd.get("country"),
          city:             fd.get("city"),
          role:             fd.get("role"),
        }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) { setError(data.message ?? "Fehler"); return; }
      setSuccess(true);
    } catch {
      setError("Verbindungsfehler.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-[420px] mx-auto text-center">
        <div className="bg-dm-surface border border-dm-border rounded-sm p-10 relative overflow-hidden"
          style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.6)" }}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-dm-gold" />
          <div className="w-14 h-14 mx-auto mb-5 rounded-sm border border-dm-border bg-dm-surface-2 flex items-center justify-center">
            <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
              <path d="M2 10L9 17L24 2" stroke="#FBB809" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-dm-text mb-2">Registrierung erfolgreich</h2>
          <p className="text-sm text-dm-muted mb-7">
            Ihr Konto wird geprüft. Sie erhalten eine E-Mail sobald es freigeschaltet ist.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 h-10 rounded-sm border border-dm-border text-sm font-medium text-dm-text hover:border-dm-gold hover:text-dm-gold transition-colors"
          >
            Zurück zur Anmeldung
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[520px] mx-auto">

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-4 mb-3">
          <EucxMark />
          <div>
            <h1 className="text-3xl font-bold text-dm-text tracking-tight leading-none">EUCX</h1>
            <div className="h-[2px] w-full bg-dm-gold mt-1 rounded-full" />
          </div>
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-dm-muted">
          European Union Commodity Exchange
        </p>
      </div>

      {/* Card */}
      <div
        className="bg-dm-surface rounded-sm border border-dm-border relative overflow-hidden"
        style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(251,184,9,0.06)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-dm-gold" />

        <div className="p-8 pt-9">
          <div className="mb-7">
            <h2 className="text-xl font-semibold text-dm-text">Konto registrieren</h2>
            <p className="text-sm text-dm-muted mt-1">Institutioneller Zugang zur Handelsplattform</p>
          </div>

          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-5">

            <DarkInput label="E-Mail-Adresse"    name="email"    type="email"    required placeholder="name@firma.de" />
            <DarkInput label="Passwort"          name="password" type="password" required
              hint="Mindestens 10 Zeichen, Großbuchstabe, Zahl, Sonderzeichen" />
            <DarkInput label="Unternehmensname"  name="organizationName" required placeholder="Muster Handels GmbH" />

            <div className="grid grid-cols-2 gap-4">
              <DarkInput label="Steuernummer / VAT-ID" name="taxId"  required placeholder="DE123456789" />
              <DarkInput label="Stadt"                 name="city"   required placeholder="Berlin" />
            </div>

            {/* Länder-Select */}
            <div className="flex flex-col gap-2">
              <label htmlFor="country" className="text-xs font-semibold uppercase tracking-widest text-dm-muted">
                Ländercode <span className="text-dm-gold">*</span>
              </label>
              <select name="country" id="country" required
                className={[
                  "w-full h-12 rounded-sm border bg-dm-input px-4",
                  "text-sm text-dm-text",
                  "border-dm-border focus:border-dm-gold focus:ring-1 focus:ring-dm-gold/25 focus:outline-none",
                  "transition-all duration-200",
                  // custom arrow via appearance-none not needed, native select is fine
                ].join(" ")}
              >
                <option value="DE">DE — Deutschland</option>
                <option value="AT">AT — Österreich</option>
                <option value="PL">PL — Polen</option>
                <option value="CZ">CZ — Tschechien</option>
                <option value="FR">FR — Frankreich</option>
                <option value="NL">NL — Niederlande</option>
                <option value="BE">BE — Belgien</option>
                <option value="IT">IT — Italien</option>
                <option value="ES">ES — Spanien</option>
              </select>
            </div>

            {/* Rolle */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-dm-muted">
                Rolle <span className="text-dm-gold">*</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "SELLER", label: "Verkäufer", desc: "Waren anbieten" },
                  { value: "BUYER",  label: "Käufer",    desc: "Waren kaufen"   },
                ].map((r) => (
                  <label key={r.value}
                    className={[
                      "flex items-start gap-3 p-4 rounded-sm border cursor-pointer",
                      "border-dm-border bg-dm-input",
                      "transition-all duration-150",
                      "hover:border-dm-gold/50",
                      "has-[:checked]:border-dm-gold has-[:checked]:bg-dm-gold/[0.06]",
                    ].join(" ")}
                  >
                    <input type="radio" name="role" value={r.value} required className="mt-0.5 accent-[#FBB809]" />
                    <div>
                      <p className="text-sm font-semibold text-dm-text">{r.label}</p>
                      <p className="text-xs text-dm-muted mt-0.5">{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-sm border border-dm-error/30 bg-dm-error/5 p-3">
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="text-dm-error shrink-0 mt-0.5">
                  <path d="M6 1L11 10H1L6 1Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="6" y1="5" x2="6" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="6" cy="9" r="0.6" fill="currentColor"/>
                </svg>
                <p className="text-sm text-dm-error">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={[
                "w-full h-12 rounded-sm font-semibold text-sm tracking-wide",
                "bg-dm-gold text-[#06090F]",
                "transition-all duration-200",
                "hover:bg-dm-gold-hover active:scale-[0.99]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dm-gold/50",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2.5",
              ].join(" ")}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Konto wird erstellt…
                </>
              ) : (
                <>
                  Konto erstellen
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-dm-muted mt-6">
            Bereits registriert?{" "}
            <a href="/login" className="text-dm-gold font-medium hover:text-dm-gold-hover transition-colors">
              Anmelden
            </a>
          </p>
        </div>
      </div>

      <p className="text-center text-[10px] uppercase tracking-widest text-dm-muted-2 mt-8 font-medium">
        © 2026 EUCX GmbH &nbsp;·&nbsp; eucx.eu &nbsp;·&nbsp; Frankfurt am Main
      </p>
    </div>
  );
}
