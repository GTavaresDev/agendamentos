"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Search, UserRound } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar.component";
import { ListPagination } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination.component";
import { paginateItems, TABLE_BODY_MIN_HEIGHT_CLASS } from "@/lib/pagination";
import { startClientImpersonationAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { fetchClientsAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/client-actions";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";
import type { ClientProps } from "@core/domain/clients/client.entity";
import { cn } from "@/lib/utils";

/**
 * "Ver como cliente": escolhe um cliente e abre o portal com a identidade dele.
 *
 * A lista aqui é só conveniência de busca — quem autoriza é a Server Action,
 * que confere o administrador e valida o cliente escolhido no banco. Esconder
 * o botão não é a barreira.
 */
export function ClientImpersonationCard() {
  const { currentUser, showToast } = useAppShell();
  const [clients, setClients] = useState<ClientProps[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const isAdmin =
    currentUser?.permissionLevel === 1 || currentUser?.role === "Administrador";

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    fetchClientsAction().then((list) => {
      if (!cancelled && list) setClients(list);
    });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    const digits = query.replace(/\D/g, "");

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        (digits.length > 0 && client.phone.replace(/\D/g, "").includes(digits)),
    );
  }, [clients, search]);

  const pagedClients = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page],
  );

  if (!isAdmin) return null;

  async function onEnterAsClient(clientId: string) {
    setPendingId(clientId);
    const result = await startClientImpersonationAction(clientId);

    if (result.success) {
      // Sessão do portal já gravada no servidor: basta ir para lá.
      window.location.assign("/cliente");
      return;
    }

    setPendingId(null);
    showToast(result.error || "Erro ao entrar como cliente.");
  }

  return (
    <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white">
      <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 p-5 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <Eye className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-zinc-900">
                Ver como cliente
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Entre temporariamente na experiência de um cliente para
                visualizar o portal exatamente como ele.
              </CardDescription>
            </div>
          </div>
          <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
            {clients.length} clientes cadastrados
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Buscar cliente por nome, e-mail ou telefone..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              // Busca nova recomeça na primeira página.
              setPage(1);
            }}
            className="pl-9 h-10 text-xs"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xs">
          <div className={cn("overflow-x-auto", TABLE_BODY_MIN_HEIGHT_CLASS)}>
            <table className="w-full text-left text-xs text-zinc-600">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">Cliente</th>
                  <th scope="col" className="px-4 py-3 text-left">E-mail</th>
                  <th scope="col" className="px-4 py-3 text-left">Status</th>
                  <th scope="col" className="px-4 py-3 text-left">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {pagedClients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-zinc-400">
                      Nenhum cliente encontrado para a busca.
                    </td>
                  </tr>
                ) : (
                  pagedClients.map((client) => {
                    const isActive = client.status !== "Inativo";

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-zinc-50/80 transition-colors"
                      >
                        <td className="px-4 py-3 text-left">
                          <div className="flex items-center gap-3">
                            <Avatar
                              initials={client.initials || "CL"}
                              className="size-8 bg-zinc-900 text-xs text-white shrink-0"
                            />
                            <span className="font-semibold text-zinc-900 truncate">
                              {client.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-left text-zinc-500 truncate max-w-[220px]">
                          {client.email}
                        </td>
                        <td className="px-4 py-3 text-left">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border",
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-zinc-100 text-zinc-600 border-zinc-200",
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                isActive ? "bg-emerald-500" : "bg-zinc-400",
                              )}
                            />
                            {client.status || "Ativo"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-left">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!isActive || pendingId !== null}
                            onClick={() => onEnterAsClient(client.id!)}
                            className="h-8 text-xs font-medium border-zinc-300 hover:bg-zinc-950 hover:text-white transition disabled:opacity-50"
                            title={
                              isActive
                                ? undefined
                                : "Cliente inativo não acessa o portal"
                            }
                          >
                            <UserRound className="mr-1.5 size-3.5" />
                            Entrar como cliente
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <ListPagination
            page={page}
            totalItems={filtered.length}
            onPageChange={setPage}
            label="clientes"
          />
        </div>
      </CardContent>
    </Card>
  );
}
