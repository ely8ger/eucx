import type { Metadata } from "next";
export const metadata: Metadata = { title: "EUCX" };
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-cb-petrol mb-2">Wird entwickelt</h1>
      <p className="text-cb-gray-500">Diese Seite ist in Bearbeitung.</p>
    </div>
  );
}
