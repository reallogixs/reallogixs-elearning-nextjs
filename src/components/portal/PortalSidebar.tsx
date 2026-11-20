"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import type { Role } from "@/types/domain";
import { authApi } from "@/lib/api";
import { useCurrentUser } from "@/lib/store/hooks";
import { BrandMark } from "@/components/brand/BrandMark";
import { IconButton } from "@/components/ui/IconButton";

import { PORTAL_TITLE } from "./navConfig";
import { PortalNav } from "./PortalNav";
import { UserAvatar } from "./UserAvatar";

interface PortalSidebarProps {
  role: Role;
  onNavigate?: () => void;
  /** The mobile drawer shows the logo in its own title bar. */
  showBrand?: boolean;
}

export function PortalSidebar({
  role,
  onNavigate,
  showBrand = true,
}: PortalSidebarProps): ReactElement {
  const user = useCurrentUser();
  const router = useRouter();
  return (
    <div className="flex h-full flex-col">
      {showBrand ? (
        <div className="flex h-16 items-center border-b border-line/80 px-5 lg:h-[72px]">
          <BrandMark tag={PORTAL_TITLE[role]} href={`/${role}`} />
        </div>
      ) : null}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <PortalNav role={role} onNavigate={onNavigate} />
      </div>
      <div className="m-3 flex items-center gap-3 rounded-md border border-line/80 bg-canvas p-3">
        <UserAvatar name={user?.name ?? ""} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-small font-semibold">{user?.name}</span>
          <span className="block truncate text-dash-meta font-normal text-ink-soft">
            {user?.email}
          </span>
        </span>
        <IconButton
          label="Log out"
          onClick={() => {
            authApi.logout();
            router.push("/");
          }}
        >
          <LogOut className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}
