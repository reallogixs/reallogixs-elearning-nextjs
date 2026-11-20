"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, RotateCcw } from "lucide-react";

import { authApi } from "@/lib/api";
import { resetDemoData } from "@/lib/store/db";
import { useDb, useSession } from "@/lib/store/hooks";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { PORTAL_HOME } from "@/components/site/navigation";

const DEMO_USER_IDS = ["usr_admin", "usr_t_sana", "usr_s_ali"] as const;

/**
 * DEMO ONLY: jump between portals without logging in, and reset the mock data.
 * Remove from the root layout when real auth lands.
 */
export function DemoSwitcher(): ReactElement {
  const [open, setOpen] = useState(false);
  const db = useDb();
  const session = useSession();
  const router = useRouter();
  const { notify } = useToast();

  const users = DEMO_USER_IDS.map((id) => db.users.find((user) => user.id === id)).filter(
    (user) => user !== undefined,
  );

  function go(userId: string | null): void {
    if (userId) {
      authApi.loginAs(userId);
      const user = users.find((candidate) => candidate.id === userId);
      router.push(user ? PORTAL_HOME[user.role] : "/");
    } else {
      authApi.logout();
      router.push("/");
    }
    setOpen(false);
  }

  return (
    <div data-print-hide>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="fixed right-4 bottom-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-pill bg-navy-900 px-4 text-small font-medium text-white shadow-card hover:bg-navy-800"
      >
        <FlaskConical aria-hidden="true" className="size-4 text-cyan-glow" />
        Demo
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Demo controls"
        description="Mock data lives in this browser. Switch roles to walk through the full flow."
        size="sm"
      >
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => go(user.id)}
              className="flex min-h-12 items-center justify-between rounded-md border border-line px-4 text-left hover:border-navy-600/45 hover:bg-mist"
            >
              <span>
                <span className="block font-medium">{user.name}</span>
                <span className="block text-small text-ink-soft capitalize">
                  {user.role} portal
                </span>
              </span>
              {session?.userId === user.id ? (
                <span className="font-mono text-label text-teal-700 uppercase">Active</span>
              ) : null}
            </button>
          ))}
          <button
            type="button"
            onClick={() => go(null)}
            className="flex min-h-12 items-center rounded-md border border-line px-4 text-left hover:bg-mist"
          >
            <span>
              <span className="block font-medium">Guest visitor</span>
              <span className="block text-small text-ink-soft">Signed out, public site</span>
            </span>
          </button>
        </div>
        <Button
          variant="danger"
          size="sm"
          className="mt-6"
          icon={<RotateCcw className="size-4" />}
          onClick={() => {
            resetDemoData();
            setOpen(false);
            notify("Demo data reset to the seed.");
            router.push("/");
          }}
        >
          Reset demo data
        </Button>
      </Modal>
    </div>
  );
}
