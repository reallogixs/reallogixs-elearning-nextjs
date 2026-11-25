import { NextResponse } from "next/server";

import { currentUser } from "@/server/core/session";
import { toAccount } from "@/server/queries/accounts";

/** Lets static public pages show "My portal". Private, and never cached. */
export async function GET(): Promise<NextResponse> {
  const user = await currentUser().catch(() => null);
  const account = user ? await toAccount(user) : null;
  return NextResponse.json({ account }, { headers: { "Cache-Control": "private, no-store" } });
}
