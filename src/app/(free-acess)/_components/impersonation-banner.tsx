"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { stopClientImpersonationAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { cn } from "@/lib/utils";

/**
 * Faixa do modo de visualização, no rodapé da sidebar do portal — mesmo lugar
 * e mesmo desenho do sistema interno (shell-layout).
 *
 * Só aparece quando a equipe está vendo a conta de um cliente: quem monta a
 * casca passa a sessão, e ela só traz `impersonatorName` na visualização.
 */
export function ImpersonationBanner({
  clientName,
  className,
}: {
  clientName: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 shadow-sm",
        className,
      )}
    >
      <span className="truncate font-medium">
        Visualizando como <span className="font-semibold">{clientName}</span>
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => stopClientImpersonationAction())}
        title="Sair da visualização"
        aria-label="Sair da visualização"
        className="ml-1 shrink-0 rounded p-1 font-semibold text-amber-800 transition hover:bg-amber-100 hover:text-amber-950 disabled:opacity-50"
      >
        <LogOut className="size-3.5" />
      </button>
    </div>
  );
}
