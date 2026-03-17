import type { Metadata } from "next";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

export const metadata: Metadata = { title: "Admin Analytics — EUCX" };

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-cb-gray-500">
        Handelsvolumen und Plattform-Gebühren der letzten 30 Tage.
      </p>
      <AnalyticsCharts />
    </div>
  );
}
