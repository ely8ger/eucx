import type { Metadata } from "next";
import { GlobalOrdersTable } from "@/components/admin/GlobalOrdersTable";

export const metadata: Metadata = { title: "Live-Märkte — EUCX Admin" };

export default function AdminMarketsPage() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-cb-gray-500">
        Echtzeit-Übersicht aller aktiven Orders im Gesamtsystem. Anomalien (Großorders, Orderbook-Stuffing) werden automatisch markiert.
      </p>
      <GlobalOrdersTable />
    </div>
  );
}
