"use client";

import type { ReactElement, ReactNode } from "react";
import Link from "next/link";

import { useDb } from "@/lib/store/hooks";

import { AuthCard } from "./AuthCard";

const SWITCH = {
  login: { prompt: "New student?", href: "/signup", label: "Create an account" },
  signup: { prompt: "Already have an account?", href: "/login", label: "Log in" },
} as const;

/** Login / signup layout with admin-managed copy and the link to the other page. */
export function ContentAuthCard({
  page,
  children,
}: {
  page: "login" | "signup";
  children: ReactNode;
}): ReactElement {
  const copy = useDb().content.pages[page];
  const other = SWITCH[page];
  return (
    <AuthCard
      label={copy.label}
      title={copy.title}
      body={
        <>
          {copy.body} {other.prompt}{" "}
          <Link href={other.href} className="text-teal-700 underline">
            {other.label}
          </Link>
          .
        </>
      }
      aside={
        <>
          <p className="font-display text-h2 text-white">{copy.asideTitle}</p>
          <p>{copy.asideBody}</p>
        </>
      }
    >
      {children}
    </AuthCard>
  );
}
