"use client";

import { Clock3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";

export function SchedulingRulesCard() {
  const { currentUser, allowPastBooking, setAllowPastBooking, showToast } =
    useAppShell();

  const isAdmin =
    currentUser?.permissionLevel === 1 || currentUser?.role === "Administrador";

  return (
    <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white">
      <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Clock3 className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900">
              Regras de Agendamento
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Configure restrições e comportamentos para a criação de novos agendamentos
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-900">
                Agendamento em Horários Passados
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                  allowPastBooking
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                )}
              >
                {allowPastBooking ? "Permitido" : "Bloqueado"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-xl leading-relaxed">
              Permite criar agendamentos em horários passados do dia atual. Horários que já possuem agendamentos vinculados continuarão bloqueados.
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              role="switch"
              aria-checked={allowPastBooking}
              onClick={() => {
                const nextState = !allowPastBooking;
                setAllowPastBooking(nextState);
                showToast(
                  nextState
                    ? "Agendamentos retroativos permitidos."
                    : "Agendamentos retroativos bloqueados."
                );
              }}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none self-start sm:self-center",
                allowPastBooking ? "bg-zinc-950" : "bg-zinc-300"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  allowPastBooking ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
