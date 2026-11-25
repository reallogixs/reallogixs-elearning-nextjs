import "server-only";

import { redirect } from "next/navigation";

import type { Account } from "@/types/account";
import type { Role } from "@/types/domain";
import { LOGIN_PATH } from "@/lib/account/loginPath";
import { toAccount } from "@/server/queries/accounts";

import { currentUser } from "./session";

/** For portal layouts and pages: the signed-in account, or a redirect to where they belong. */
export async function requirePortal(role: Role): Promise<Account> {
  const user = await currentUser();
  if (!user) redirect(`${LOGIN_PATH[role]}?next=/${role}`);
  if (user.role !== role) redirect(`/${user.role}`);
  return toAccount(user);
}

/** For login pages: someone already signed in with this role goes straight to their portal. */
export async function redirectIfSignedIn(role: Role): Promise<void> {
  const user = await currentUser();
  if (user?.role === role) redirect(`/${role}`);
}
