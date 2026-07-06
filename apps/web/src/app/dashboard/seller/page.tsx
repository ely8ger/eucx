import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function SellerDashboardPage() {
  redirect("/dashboard/seller/auctions");
}
