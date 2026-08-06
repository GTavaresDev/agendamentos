"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { Card } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { getLastAppointmentForClient } from "@/lib/client-appointments";
import {
  ViewLoadingSkeleton,
  LoadingOverlayCard,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { paginateItems } from "@/lib/pagination";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";
import { useAppointments } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-appointments";
import { useClients } from "@/app/(agendamentos)/(left-nav-bar)/clientes/hooks/use-clients";
import { ClientProps } from "@core/domain/clients/client.entity";
import { ClientsTable } from "./clients-table";
import { CreateClientDialog } from "./create-client-dialog";
import { EditClientDialog } from "./edit-client-dialog";

export function ClientsView() {
  const searchParams = useSearchParams();
  const {
    clientList,
    isLoading,
    handleAddClient,
    handleReplaceClient,
    handleUpdateClient,
    handleDeleteClient,
  } = useClients();
  const { appointmentList, isLoading: appointmentsLoading } = useAppointments();
  const { currentUser, showToast } = useAppShell();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [modal, setModal] = useState(searchParams.get("novo") === "1");
  const [editingClient, setEditingClient] = useState<ClientProps | null>(null);
  const [page, setPage] = useState(1);

  useScrollLock(modal || !!editingClient);

  const filtered = useMemo(() => {
    return clientList.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.cpf && c.cpf.includes(search));
      const matchStatus = statusFilter === "Todos" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [clientList, search, statusFilter]);

  const pagedClients = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalClients = clientList.length;
  const activeClients = clientList.filter((c) => c.status === "Ativo").length;
  const clientsWithAppointments = useMemo(() => {
    return clientList.filter((c) => Boolean(c?.name) && getLastAppointmentForClient(appointmentList, c) !== null).length;
  }, [clientList, appointmentList]);
  const inactiveClients = clientList.filter((c) => c.status === "Inativo").length;

  if (!currentUser) return null;

  if (isLoading || appointmentsLoading) {
    return (
      <div className="relative min-h-[calc(100vh-84px)]">
        <ViewLoadingSkeleton view="clientes" />
        <LoadingOverlayCard label="Carregando dados..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] p-3.5 sm:p-6 lg:p-8">
      {/* 4 Metric Cards at Top */}
      <div className="mb-6 grid gap-2.5 sm:gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
            Total de Clientes
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold text-zinc-900 truncate">
            {totalClients}
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
            Clientes Ativos
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold text-zinc-900 truncate">
            {activeClients}
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
            Com Agendamentos
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold text-zinc-900 truncate">
            {clientsWithAppointments}
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
            Clientes Inativos
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold text-zinc-900 truncate">
            {inactiveClients}
          </div>
        </Card>
      </div>

      {/* Search and Action Button on the second row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou CPF..."
            className="pl-9 w-full"
          />
        </div>
        <Button onClick={() => setModal(true)} className="w-full sm:w-48 shrink-0 gap-2 justify-center">
          <Plus className="size-4" /> Adicionar cliente
        </Button>
      </div>

      <ClientsTable
        clients={filtered}
        filteredCount={filtered.length}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        appointmentList={appointmentList}
        page={page}
        onPageChange={setPage}
        onEdit={(client) => setEditingClient(client)}
        onToggleStatus={async (client) => {
          const newStatus = client.status === "Ativo" ? "Inativo" : "Ativo";
          await handleUpdateClient(client.id || "", newStatus);
          showToast(`Status de ${client.name} alterado no banco para ${newStatus}`);
        }}
        onDelete={async (client) => {
          await handleDeleteClient(client.id || "");
          showToast(`Cliente ${client.name} excluído do banco`);
        }}
      />

      {modal && (
        <CreateClientDialog
          onClose={() => setModal(false)}
          onAddClient={handleAddClient}
          showToast={showToast}
        />
      )}
      {editingClient && (
        <EditClientDialog
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onReplaceClient={(updated) => {
            handleReplaceClient(updated);
            setEditingClient(null);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
