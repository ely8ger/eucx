import type { Metadata } from "next";
import { UserManagement } from "@/components/admin/UserManagement";

export const metadata: Metadata = { title: "Nutzerverwaltung - EUCX Admin" };

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-cb-gray-500">
        Alle registrierten Nutzer auf einen Blick. Die Ampel zeigt den kombinierten Status aus
        Konto-Freischaltung und KYC-Verifizierung. Klicken Sie einen Nutzer an, um den Status direkt zu ändern.
      </p>
      <UserManagement />
    </div>
  );
}
