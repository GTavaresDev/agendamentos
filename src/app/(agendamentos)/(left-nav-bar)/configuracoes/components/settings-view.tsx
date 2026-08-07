"use client";

import { Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";
import { SchedulingRulesCard } from "./scheduling-rules-card";
import { PermissionsCard } from "./permissions-card";
import { ImpersonationCard } from "./impersonation-card";

export function SettingsView() {
  const { currentUser } = useAppShell();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <ImpersonationCard />

      <SchedulingRulesCard />

      <PermissionsCard />

      {/* Sobre a Plataforma */}
      <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <Building2 className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-zinc-900">
                Informações do Sistema
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Detalhes da plataforma Agendamentos e status do servidor
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
              <span className="text-xs text-zinc-400 block font-medium">Plataforma</span>
              <span className="text-sm font-semibold text-zinc-900 mt-1 block">Agendamentos</span>
              <span className="text-[11px] text-zinc-500 mt-0.5 block">Saúde, Bem Estar e Estética</span>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
              <span className="text-xs text-zinc-400 block font-medium">Status do Servidor</span>
              <span className="text-sm font-semibold text-emerald-600 mt-1 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Operacional
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5 block">Todos os serviços ativos</span>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
              <span className="text-xs text-zinc-400 block font-medium">Perfil Atual</span>
              <span className="text-sm font-semibold text-zinc-900 mt-1 block">
                {currentUser?.role || "Usuário"}
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5 block">
                {currentUser?.email}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
