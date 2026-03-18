import type { Metadata } from "next";
import { KycApprovalCenter } from "@/components/admin/KycApprovalCenter";

export const metadata: Metadata = { title: "KYC-Verifizierung - EUCX Admin" };

export default function AdminKycPage() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-cb-gray-500">
        Überprüfen und genehmigen Sie Organisationen, die sich für die Teilnahme am Handel bewerben.
      </p>
      <KycApprovalCenter />
    </div>
  );
}
