"use client";

/**
 * Registrierungs-Seite — Behörden-Antragsformular-Stil
 * Pattern: ELSTER / BundID Registrierungsformular
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GovInputProps {
  id?:           string;
  label:         string;
  name:          string;
  type?:         string;
  placeholder?:  string;
  hint?:         string;
  required?:     boolean;
}

const GovInput = ({ id, label, name, type = "text", placeholder, hint, required }: GovInputProps) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id ?? name} className="text-sm font-semibold text-gov-text">
      {label}
      {required && <span className="text-gov-error ml-1" aria-hidden="true">*</span>}
    </label>
    <input
      id={id ?? name}
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      className={[
        "w-full h-11 rounded-sm border border-gov-border bg-white",
        "text-sm text-gov-text placeholder:text-gov-text-muted",
        "px-3 transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue",
      ].join(" ")}
    />
    {hint && <p className="text-xs text-gov-text-muted">{hint}</p>}
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
      if (!res.ok) { setError(data.message ?? "Fehler bei der Registrierung."); return; }
      setSuccess(true);
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-[520px] mx-auto">
        <div className="bg-gov-white border border-gov-border rounded-sm shadow-sm overflow-hidden">
          <div className="bg-gov-success/10 border-b border-gov-success/20 px-8 py-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gov-success flex items-center justify-center shrink-0">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path d="M1.5 7L6.5 12L16.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gov-text">Registrierung eingereicht</h2>
          </div>
          <div className="px-8 py-7">
            <p className="text-sm text-gov-text-2 mb-6">
              Ihr Antrag auf Zugang zur EUCX-Handelsplattform wurde erfolgreich übermittelt.
              Sie erhalten eine Bestätigungs-E-Mail, sobald Ihr Konto durch unsere Compliance-Abteilung freigegeben wurde.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="h-10 px-5 rounded-sm border border-gov-border text-sm font-medium text-gov-text hover:bg-gov-bg transition-colors"
            >
              Zurück zur Anmeldung
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[560px] mx-auto">

      <div className="bg-gov-white border border-gov-border rounded-sm shadow-sm overflow-hidden">

        {/* Blauer Kopfbereich */}
        <div className="bg-gov-blue px-8 py-6">
          <h1 className="text-xl font-bold text-white">Zugang beantragen</h1>
          <p className="text-white/70 text-sm mt-1">
            Institutioneller Zugang zur EUCX-Handelsplattform
          </p>
        </div>

        {/* Pflichtfeld-Hinweis */}
        <div className="bg-gov-bg border-b border-gov-border px-8 py-3">
          <p className="text-xs text-gov-text-muted">
            Mit <span className="text-gov-error font-medium">*</span> markierte Felder sind Pflichtfelder.
          </p>
        </div>

        <div className="px-8 py-7">
          <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
            <div className="space-y-5">

              {/* Abschnitt: Zugangsdaten */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gov-text-muted mb-4 pb-2 border-b border-gov-border-light">
                  Zugangsdaten
                </h2>
                <div className="space-y-4">
                  <GovInput label="E-Mail-Adresse"  name="email"    type="email"    required placeholder="name@firma.de" />
                  <GovInput label="Passwort"         name="password" type="password" required
                    hint="Mindestens 10 Zeichen, Großbuchstabe, Zahl und Sonderzeichen erforderlich." />
                </div>
              </div>

              {/* Abschnitt: Unternehmensdaten */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gov-text-muted mb-4 pb-2 border-b border-gov-border-light">
                  Unternehmensdaten
                </h2>
                <div className="space-y-4">
                  <GovInput label="Unternehmensname"     name="organizationName" required placeholder="Muster Handels GmbH" />
                  <div className="grid grid-cols-2 gap-4">
                    <GovInput label="Steuernummer / VAT-ID" name="taxId" required placeholder="DE123456789" />
                    <GovInput label="Stadt"                  name="city"  required placeholder="Berlin" />
                  </div>

                  {/* Ländercode */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="country" className="text-sm font-semibold text-gov-text">
                      Land <span className="text-gov-error" aria-hidden="true">*</span>
                    </label>
                    <select name="country" id="country" required
                      className={[
                        "w-full h-11 rounded-sm border border-gov-border bg-white px-3",
                        "text-sm text-gov-text",
                        "focus:outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue",
                        "transition-colors duration-150",
                      ].join(" ")}
                    >
                      <option value="DE">Deutschland</option>
                      <option value="AT">Österreich</option>
                      <option value="PL">Polen</option>
                      <option value="CZ">Tschechien</option>
                      <option value="FR">Frankreich</option>
                      <option value="NL">Niederlande</option>
                      <option value="BE">Belgien</option>
                      <option value="IT">Italien</option>
                      <option value="ES">Spanien</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Abschnitt: Marktteilnehmer-Rolle */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gov-text-muted mb-4 pb-2 border-b border-gov-border-light">
                  Marktteilnehmer-Rolle
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "SELLER", label: "Verkäufer",    desc: "Waren anbieten und verkaufen"  },
                    { value: "BUYER",  label: "Käufer",       desc: "Waren suchen und kaufen"       },
                  ].map((r) => (
                    <label key={r.value}
                      className={[
                        "flex items-start gap-3 p-4 rounded-sm border cursor-pointer",
                        "border-gov-border bg-gov-bg",
                        "transition-colors duration-150",
                        "hover:border-gov-blue/40 hover:bg-gov-blue-light",
                        "has-[:checked]:border-gov-blue has-[:checked]:bg-gov-blue-light",
                      ].join(" ")}
                    >
                      <input type="radio" name="role" value={r.value} required className="mt-0.5 accent-[#154194]" />
                      <div>
                        <p className="text-sm font-semibold text-gov-text">{r.label}</p>
                        <p className="text-xs text-gov-text-muted mt-0.5">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fehler-Meldung */}
              {error && (
                <div role="alert" className="flex items-start gap-3 rounded-sm border border-gov-error/30 bg-red-50 p-4">
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none" className="text-gov-error shrink-0 mt-0.5">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                    <line x1="7" y1="4" x2="7" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="7" cy="10" r="0.7" fill="currentColor"/>
                  </svg>
                  <p className="text-sm text-gov-error">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={[
                  "w-full h-11 rounded-sm font-semibold text-sm",
                  "bg-gov-blue text-white",
                  "hover:bg-gov-blue-dark transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gov-blue/40",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2",
                ].join(" ")}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Antrag wird eingereicht…
                  </>
                ) : "Zugang beantragen"}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-gov-border-light flex items-center justify-between">
            <p className="text-sm text-gov-text-2">Bereits registriert?</p>
            <a href="/login"
              className="text-sm font-semibold text-gov-blue-mid hover:text-gov-blue-dark transition-colors flex items-center gap-1.5">
              Zur Anmeldung
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
