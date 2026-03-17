import type { Metadata } from "next";
import { KillSwitch }    from "@/components/admin/KillSwitch";

export const metadata: Metadata = { title: "Notfall-Konsole — EUCX Admin" };

export default function AdminEmergencyPage() {
  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-700">
        <strong>Achtung:</strong> Diese Konsole ermöglicht das sofortige Einfrieren des gesamten Handels.
        Alle Aktionen werden im Audit-Log gespeichert und sind nicht umkehrbar.
      </div>
      <KillSwitch />
    </div>
  );
}
