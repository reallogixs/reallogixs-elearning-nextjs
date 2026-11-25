"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import type { Role } from "@/types/domain";
import { PAGE, startLoading } from "@/lib/loadingBar";
import { LOGIN_PATH } from "@/lib/account/loginPath";
import { refreshAccount } from "@/lib/account/accountStore";
import { useCurrentUser } from "@/lib/account/useCurrentUser";
import { BrandMark } from "@/components/brand/BrandMark";
import { IconButton } from "@/components/ui/IconButton";
import { logout } from "@/server/actions/account";

import { PORTAL_TITLE } from "./navConfig";
import { PortalNav } from "./PortalNav";
import { UserAvatar } from "./UserAvatar";

interface PortalSidebarProps {
  role: Role;
  pending?: Promise<number>;
  onNavigate?: () => void;
  /** The mobile drawer shows the logo in its own title bar. */
  showBrand?: boolean;
}

export function PortalSidebar({
  role,
  pending,
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
        <PortalNav role={role} pending={pending} onNavigate={onNavigate} />
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
          onClick={async () => {
            startLoading(PAGE);
            await logout({});
            await refreshAccount();
            router.push(role === "student" ? "/" : LOGIN_PATH[role]);
            // Drops cached portal pages from this browser.
            router.refresh();
          }}
        >
          <LogOut className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}
