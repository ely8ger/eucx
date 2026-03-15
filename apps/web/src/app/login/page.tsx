"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json() as { data?: { accessToken: string }; message?: string };

      if (!res.ok) {
        setError(data.message ?? "Anmeldung fehlgeschlagen");
        return;
      }

      if (data.data?.accessToken) {
        document.cookie = `access_token=${data.data.accessToken}; path=/; max-age=900; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
        router.push("/trading");
      }
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cb-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 mb-3">
            <div className="w-1.5 h-8 bg-cb-yellow rounded-sm" />
            <div className="w-1.5 h-5 bg-cb-yellow-light rounded-sm opacity-80" />
            <div className="w-1.5 h-7 bg-cb-yellow rounded-sm opacity-90" />
          </div>
          <h1 className="text-2xl font-bold text-cb-petrol">EUCX</h1>
          <p className="text-sm text-cb-gray-500 mt-1">EU Commodity Exchange</p>
        </div>

        {/* Formular */}
        <div className="bg-cb-white border border-cb-gray-200 rounded shadow-sm p-6">
          <h2 className="text-lg font-semibold text-cb-petrol mb-5">Anmelden</h2>

          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
            <Input
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@unternehmen.de"
              required
              autoComplete="email"
            />
            <Input
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-cb-error bg-red-50 border border-red-200 rounded p-2">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Anmelden
            </Button>
          </form>

          <p className="text-center text-sm text-cb-gray-500 mt-4">
            Noch kein Konto?{" "}
            <a href="/register" className="text-cb-petrol font-medium hover:text-cb-yellow-dark">
              Jetzt registrieren
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-cb-gray-400 mt-6">
          © 2026 EUCX GmbH · eucx.eu
        </p>
      </div>
    </div>
  );
}
