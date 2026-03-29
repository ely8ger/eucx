/**
 * /dashboard/contracts
 *
 * Vertragsarchiv — alle Kaufverträge des eingeloggten Users.
 * Server Component: Metadaten werden serverseitig geladen.
 * ContractsClient übernimmt Download-Logik und interaktive Elemente.
 */

import { ContractsClient } from "./ContractsClient";

export const dynamic = "force-dynamic";

export default function ContractsPage() {
  return <ContractsClient />;
}
