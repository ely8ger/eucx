"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      <div className="min-h-screen bg-cb-gray-50 flex items-center justify-center p-4">
        <div className="bg-cb-white border border-cb-gray-200 rounded shadow-sm p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-cb-petrol mb-2">Registrierung erfolgreich</h2>
          <p className="text-cb-gray-500 text-sm mb-5">
            Ihr Konto wird geprüft. Sie erhalten eine E-Mail sobald es freigeschaltet ist.
          </p>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Zurück zur Anmeldung
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cb-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-8 bg-cb-yellow rounded-sm" />
            <div className="w-1.5 h-5 bg-cb-yellow-light rounded-sm opacity-80" />
            <div className="w-1.5 h-7 bg-cb-yellow rounded-sm opacity-90" />
          </div>
          <h1 className="text-2xl font-bold text-cb-petrol">EUCX</h1>
          <p className="text-sm text-cb-gray-500">European Steel Exchange</p>
        </div>

        <div className="bg-cb-white border border-cb-gray-200 rounded shadow-sm p-6">
          <h2 className="text-lg font-semibold text-cb-petrol mb-5">Konto registrieren</h2>

          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input label="E-Mail" name="email" type="email" required placeholder="name@firma.de" />
              </div>
              <div className="col-span-2">
                <Input label="Passwort" name="password" type="password" required
                  hint="Min. 10 Zeichen, Großbuchstabe, Zahl, Sonderzeichen" />
              </div>
              <div className="col-span-2">
                <Input label="Unternehmensname" name="organizationName" required placeholder="Stahlwerk GmbH" />
              </div>
              <Input label="Steuernummer / VAT-ID" name="taxId" required placeholder="DE123456789" />
              <div>
                <label className="block text-sm font-semibold text-cb-gray-700 mb-1.5">
                  Ländercode <span className="text-cb-error">*</span>
                </label>
                <select name="country" required
                  className="w-full h-10 rounded border border-cb-gray-300 px-3 text-sm focus:border-cb-yellow focus:ring-2 focus:ring-cb-yellow/20 focus:outline-none bg-white">
                  <option value="DE">DE — Deutschland</option>
                  <option value="PL">PL — Polen</option>
                  <option value="AT">AT — Österreich</option>
                  <option value="CZ">CZ — Tschechien</option>
                  <option value="FR">FR — Frankreich</option>
                </select>
              </div>
              <Input label="Stadt" name="city" required placeholder="Berlin" />
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-cb-gray-700 mb-1.5">
                  Rolle <span className="text-cb-error">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "SELLER", label: "Verkäufer", desc: "Stahl anbieten" },
                    { value: "BUYER",  label: "Käufer",    desc: "Stahl kaufen" },
                  ].map((r) => (
                    <label key={r.value}
                      className="flex items-start gap-2 p-3 border border-cb-gray-200 rounded cursor-pointer hover:border-cb-yellow has-[:checked]:border-cb-yellow has-[:checked]:bg-cb-yellow/5">
                      <input type="radio" name="role" value={r.value} required className="mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-cb-petrol">{r.label}</p>
                        <p className="text-xs text-cb-gray-500">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-cb-error bg-red-50 border border-red-200 rounded p-2">{error}</p>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Konto erstellen
            </Button>
          </form>

          <p className="text-center text-sm text-cb-gray-500 mt-4">
            Bereits registriert?{" "}
            <a href="/login" className="text-cb-petrol font-medium hover:text-cb-yellow-dark">Anmelden</a>
          </p>
        </div>
      </div>
    </div>
  );
}
