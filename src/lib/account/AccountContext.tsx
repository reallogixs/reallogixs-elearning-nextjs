"use client";

import { createContext, useContext, type ReactElement, type ReactNode } from "react";

import type { Account } from "@/types/account";

import { useFetchedAccount } from "./accountStore";

const AccountContext = createContext<Account | null>(null);

/** Portals get the account from the server, so it is there on first paint. */
export function AccountProvider({
  account,
  children,
}: {
  account: Account;
  children: ReactNode;
}): ReactElement {
  return <AccountContext value={account}>{children}</AccountContext>;
}

/** The signed-in account. On public pages it arrives just after load. */
export function useAccount(): Account | null {
  const provided = useContext(AccountContext);
  const fetched = useFetchedAccount();
  return provided ?? fetched;
}
