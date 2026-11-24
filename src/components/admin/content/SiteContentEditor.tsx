"use client";

import { useState, type ReactElement } from "react";

import { useDb, useHydrated } from "@/lib/store/hooks";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { Skeleton } from "@/components/ui/Skeleton";

import { EnrolmentContentTab } from "./EnrolmentContentTab";
import { FooterContentTab } from "./FooterContentTab";
import { HomeContentTab } from "./HomeContentTab";
import { PagesContentTab } from "./PagesContentTab";

type Tab = "home" | "pages" | "enrolment" | "footer";

const TABS: { value: Tab; label: string }[] = [
  { value: "home", label: "Home page" },
  { value: "pages", label: "Other pages" },
  { value: "enrolment", label: "Enrolment" },
  { value: "footer", label: "Footer & contact" },
];

const PREVIEW: Record<Tab, string> = {
  home: "/",
  pages: "/courses",
  enrolment: "/track",
  footer: "/",
};

/** Every piece of public copy, grouped by where it appears. */
export function SiteContentEditor(): ReactElement {
  const { content } = useDb();
  const hydrated = useHydrated();
  const [tab, setTab] = useState<Tab>("home");
  // Forms copy their initial value, so wait for saved data before mounting them.
  if (!hydrated) return <Skeleton className="h-96" />;

  return (
    <>
      <PageHeader
        title="Site content"
        description="Edit the public site's copy. Changes go live as soon as you save each section."
        actions={
          <Button href={PREVIEW[tab]} target="_blank" variant="secondary" size="sm" arrow>
            Preview
          </Button>
        }
      />
      <div className="overflow-x-auto pb-1">
        <ChipGroup
          variant="segmented"
          label="Content area"
          options={TABS}
          value={tab}
          onChange={setTab}
        />
      </div>
      {tab === "home" ? <HomeContentTab content={content} /> : null}
      {tab === "pages" ? <PagesContentTab content={content} /> : null}
      {tab === "enrolment" ? <EnrolmentContentTab content={content} /> : null}
      {tab === "footer" ? <FooterContentTab content={content} /> : null}
    </>
  );
}
