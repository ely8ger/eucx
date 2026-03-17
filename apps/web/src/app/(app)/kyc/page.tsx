"use client";

/**
 * KYC Onboarding-Seite — /kyc
 *
 * Zeigt KycWizard für nicht-verifizierte Nutzer.
 * Verifizierte Nutzer sehen eine Erfolgsanzeige.
 * Gesperrte/Abgelehnte Nutzer sehen eine Info-Meldung.
 */

import { useRouter }    from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { KycWizard }    from "@/components/kyc/KycWizard";

export default function KycPage() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  if (!user) {
    router.replace("/login");
    return null;
  }

  if (user.verificationStatus === "VERIFIED") {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-green-600">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-cb-petrol mb-2">Konto verifiziert</h1>
        <p className="text-cb-gray-500 mb-6">
          Ihr Konto wurde erfolgreich verifiziert. Sie haben vollen Zugriff auf alle EUCX-Funktionen.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2.5 bg-cb-petrol text-white rounded font-medium hover:bg-cb-petrol-dark transition-colors"
        >
          Zum Dashboard
        </button>
      </div>
    );
  }

  if (user.verificationStatus === "SUSPENDED" || user.verificationStatus === "REJECTED") {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-red-600">✗</span>
        </div>
        <h1 className="text-2xl font-bold text-cb-petrol mb-2">
          {user.verificationStatus === "REJECTED" ? "Verifizierung abgelehnt" : "Konto gesperrt"}
        </h1>
        <p className="text-cb-gray-500 mb-6">
          {user.verificationStatus === "REJECTED"
            ? "Ihr Verifizierungsantrag wurde abgelehnt. Bitte kontaktieren Sie den Support für weitere Informationen."
            : "Ihr Konto wurde vorübergehend gesperrt. Bitte kontaktieren Sie den Support."}
        </p>
        <a
          href="mailto:support@eucx.eu"
          className="px-6 py-2.5 bg-cb-petrol text-white rounded font-medium hover:bg-cb-petrol-dark transition-colors"
        >
          Support kontaktieren
        </a>
      </div>
    );
  }

  if (user.verificationStatus === "PENDING_VERIFICATION") {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-cb-yellow">⏳</span>
        </div>
        <h1 className="text-2xl font-bold text-cb-petrol mb-2">Verifizierung in Bearbeitung</h1>
        <p className="text-cb-gray-500 mb-6">
          Ihr Antrag wird aktuell geprüft. Wir benachrichtigen Sie per E-Mail sobald die Überprüfung abgeschlossen ist.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2.5 border border-cb-gray-300 text-cb-gray-600 rounded font-medium hover:bg-cb-gray-50 transition-colors"
        >
          Zum Dashboard
        </button>
      </div>
    );
  }

  // GUEST — zeige Wizard
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cb-petrol">Konto verifizieren</h1>
        <p className="text-cb-gray-500 mt-1 text-sm">
          Um am Handel teilzunehmen, müssen Sie Ihre Identität und Unternehmensdaten bestätigen.
        </p>
      </div>
      <KycWizard />
    </div>
  );
}
