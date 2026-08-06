"use client";

import { useMemo, useState } from "react";
import { UserRound, Search, ShieldAlert, LogOut } from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";
import { useUsers } from "@/app/(agendamentos)/(left-nav-bar)/usuarios/hooks/use-users";

export function ImpersonationCard() {
  const { currentUser, handleStartImpersonation, handleStopImpersonation } =
    useAppShell();
  const { userList } = useUsers();

  const [userSearch, setUserSearch] = useState("");
  const [impersonatingLoading, setImpersonatingLoading] = useState(false);

  const availableUsers = useMemo(() => {
    if (!currentUser) return [];
    return userList.filter((u) => u.id !== currentUser.id);
  }, [userList, currentUser]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return availableUsers;
    const q = userSearch.toLowerCase();
    return availableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.status && u.status.toLowerCase().includes(q))
    );
  }, [availableUsers, userSearch]);

  async function onStartImpersonation(targetUserId: string) {
    setImpersonatingLoading(true);
    try {
      await handleStartImpersonation(targetUserId);
    } finally {
      setImpersonatingLoading(false);
    }
  }

  async function onStopImpersonation() {
    setImpersonatingLoading(true);
    try {
      await handleStopImpersonation();
    } finally {
      setImpersonatingLoading(false);
    }
  }

  return (
    <>
      {/* Impersonation Active Banner */}
      {currentUser?.impersonating && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900 shrink-0">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-950">
                Você está no Modo de Visualização (Impersonação)
              </p>
              <p className="text-xs text-amber-800">
                Visualizando o sistema como{" "}
                <span className="font-semibold">{currentUser.name}</span>.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={impersonatingLoading}
            onClick={onStopImpersonation}
            className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100 hover:text-amber-950 text-xs font-semibold shrink-0"
          >
            <LogOut className="mr-1.5 size-3.5" />
            Sair do Modo de Visualização
          </Button>
        </div>
      )}

      {/* Virar um Usuário (Impersonação) */}
      <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 p-5 sm:p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
                <UserRound className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-zinc-900">
                  Virar um Usuário (Modo Visualização)
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Acesse o sistema com a visão exata e as permissões de qualquer usuário cadastrado na equipe
                </CardDescription>
              </div>
            </div>
            <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
              {availableUsers.length} usuários cadastrados
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Buscar por nome, e-mail, cargo ou status..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-9 h-10 text-xs"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xs">
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left">Usuário</th>
                    <th scope="col" className="px-4 py-3 text-left">Cargo / Função</th>
                    <th scope="col" className="px-4 py-3 text-left">E-mail</th>
                    <th scope="col" className="px-4 py-3 text-left">Status</th>
                    <th scope="col" className="px-4 py-3 text-left">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400">
                        Nenhum usuário encontrado para a busca.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isUserActive = u.status === "Ativo";
                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-zinc-50/80 transition-colors"
                        >
                          <td className="px-4 py-3 text-left">
                            <div className="flex items-center gap-3">
                              <Avatar
                                initials={u.initials || "US"}
                                className="size-8 bg-zinc-900 text-xs text-white shrink-0"
                              />
                              <span className="font-semibold text-zinc-900 truncate">
                                {u.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-left">
                            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-left text-zinc-500 truncate max-w-[200px]">
                            {u.email}
                          </td>
                          <td className="px-4 py-3 text-left">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border",
                                isUserActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-zinc-100 text-zinc-600 border-zinc-200"
                              )}
                            >
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  isUserActive ? "bg-emerald-500" : "bg-zinc-400"
                                )}
                              />
                              {u.status || "Ativo"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-left">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={impersonatingLoading}
                              onClick={() => onStartImpersonation(u.id)}
                              className="h-8 text-xs font-medium border-zinc-300 hover:bg-zinc-950 hover:text-white transition disabled:opacity-50"
                              title={!isUserActive ? "Usuário inativo (Modo de inspeção)" : undefined}
                            >
                              Ver como
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
