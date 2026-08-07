"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutClientAction } from "../_actions/portal-auth-actions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      title="Sair"
      aria-label="Sair"
      disabled={pending}
      onClick={() => startTransition(() => logoutClientAction())}
      className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:opacity-50"
    >
      <LogOut className="size-4" />
    </button>
  );
}
