import { ContractDetailClient } from "./ContractDetailClient";

export const metadata = { title: "Abwicklung | EUCX", robots: { index: false, follow: false } };
export const dynamic  = "force-dynamic";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const { contractId } = await params;
  return <ContractDetailClient contractId={contractId} />;
}
