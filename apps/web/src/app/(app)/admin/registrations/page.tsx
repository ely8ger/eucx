import type { Metadata } from "next";
import { RegistrationCenter } from "@/components/admin/RegistrationCenter";

export const metadata: Metadata = { title: "Registrierungsanfragen - EUCX Admin" };

export default function AdminRegistrationsPage() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-cb-gray-500">
        Prüfen und genehmigen Sie Registrierungsanfragen neuer Nutzer. Ausstehende Anfragen werden zuerst angezeigt.
      </p>
      <RegistrationCenter />
    </div>
  );
}
