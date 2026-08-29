import { NextResponse } from "next/server";
import { db }           from "@/lib/db/client";

const TEST_EMAILS = [
  "buyer@eucx-test.de",
  "seller1@eucx-test.de",
  "seller2@eucx-test.de",
  "seller3@eucx-test.de",
];

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Nur in Dev/Test verfügbar" }, { status: 403 });
  }
  await db.user.updateMany({
    where: { email: { in: TEST_EMAILS } },
    data:  { failedLoginCount: 0, lockedUntil: null },
  });
  return NextResponse.json({ ok: true });
}
