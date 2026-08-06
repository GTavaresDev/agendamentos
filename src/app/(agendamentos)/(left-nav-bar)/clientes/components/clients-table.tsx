"use client";

import { useState } from "react";
import { ChevronDown, MoreVertical, Pencil, Power, Trash2, UserCheck } from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { ListPagination } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination";
import { cn } from "@/lib/utils";
import { TABLE_BODY_MIN_HEIGHT_CLASS, TABLE_ROW_MIN_HEIGHT_CLASS } from "@/lib/pagination";
import {
  formatAppointmentRelativeLabel,
  getLastAppointmentForClient,
} from "@/lib/client-appointments";
import { ClientProps } from "@core/domain/clients/client.entity";
import { AppointmentProps } from "@core/domain/appointments/appointment.entity";

export function ClientsTable({
  clients,
  filteredCount,
  statusFilter = "Todos",
  onStatusFilterChange,
  appointmentList,
  page,
  onPageChange,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  clients: ClientProps[];
  filteredCount: number;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  appointmentList: AppointmentProps[];
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (client: ClientProps) => void;
  onToggleStatus: (client: ClientProps) => Promise<void>;
  onDelete: (client: ClientProps) => Promise<void>;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <Card className="overflow-visible">
      <CardHeader className="border-b border-zinc-100 bg-zinc-50/70 p-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <UserCheck className="size-4" /> Base de Clientes
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {onStatusFilterChange && (
              <div className="relative shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value)}
                  className="h-8 max-w-[140px] truncate appearance-none rounded-lg border border-zinc-200 bg-white pl-2.5 pr-7 text-xs font-medium text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400"
                >
                  <option value="Todos">Status: Todos</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
              </div>
            )}
            <Badge variant="outline" className="h-8 px-2.5 text-xs font-normal">
              {filteredCount} {filteredCount === 1 ? "cliente" : "clientes"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <div className="hidden h-11 grid-cols-[1.4fr_1.1fr_1fr_.7fr_.9fr_36px] items-center gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid">
        <span>Cliente</span>
        <span>Contato</span>
        <span>CPF / Data Nasc.</span>
        <span>Status</span>
        <span>Último agendamento</span>
        <span />
      </div>
      <div className="max-h-[340px] overflow-y-auto divide-y divide-zinc-100 min-h-[260px]">        {clients.map((client) => {
          const lastAppointment = getLastAppointmentForClient(
            appointmentList,
            client,
          );
          let lastAppointmentLabel = "Sem registro";
          if (lastAppointment) {
            lastAppointmentLabel =
              formatAppointmentRelativeLabel(lastAppointment);
          }

          const actionMenuNode = (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenuId(openMenuId === client.id ? null : client.id || null)
                }
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-black transition-colors"
              >
                <MoreVertical className="size-4" />
              </button>
              {openMenuId === client.id && (
                <div className="absolute right-0 top-8 z-[60] w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      onEdit(client);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <Pencil className="size-4 shrink-0 text-zinc-500" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await onToggleStatus(client);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <Power className="size-4 shrink-0 text-zinc-500" /> Status
                  </button>
                  <div className="my-1 h-px bg-zinc-100" />
                  <button
                    type="button"
                    onClick={async () => {
                      await onDelete(client);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="size-4 shrink-0 text-red-500" /> Excluir
                  </button>
                </div>
              )}
            </div>
          );

          return (
            <div
              key={client.id || client.email}
              className="group relative flex flex-col gap-1.5 p-3 sm:p-3.5 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors lg:grid lg:grid-cols-[1.4fr_1.1fr_1fr_.7fr_.9fr_36px] lg:items-center lg:py-2.5 lg:px-5 lg:border-b-0 lg:gap-4"
            >
              {/* Line 1 for Mobile (< lg): Avatar + Name on left, Status + Menu on right */}
              <div className="flex items-center justify-between gap-2 lg:hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    initials={client.initials || "CL"}
                    className="size-8 bg-zinc-900 text-white shrink-0 text-xs font-semibold"
                  />
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {client.name}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    variant={client.status === "Ativo" ? "success" : "secondary"}
                    className="text-[11px] px-2 py-0.5"
                  >
                    <span className="mr-1 size-1.5 rounded-full bg-current" />
                    {client.status}
                  </Badge>
                  {actionMenuNode}
                </div>
              </div>

              {/* Line 2 for Mobile (< lg): Email, Phone, Last Appointment indented under name */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-0 overflow-hidden whitespace-nowrap pl-[42px] lg:hidden">
                <span className="truncate text-zinc-600">{client.email}</span>
                {client.phone && (
                  <>
                    <span className="text-zinc-300 shrink-0">•</span>
                    <span className="shrink-0">{client.phone}</span>
                  </>
                )}
                <span className="text-zinc-300 shrink-0">•</span>
                <span className="shrink-0 text-zinc-400">Último: {lastAppointmentLabel}</span>
              </div>

              {/* Desktop Client Info */}
              <div className="hidden lg:flex min-w-0 items-center gap-3">
                <Avatar
                  initials={client.initials || "CL"}
                  className="bg-zinc-900 text-white ring-0"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {client.name}
                  </p>
                </div>
              </div>

              {/* Desktop Contact */}
              <div className="hidden lg:block">
                <p className="truncate text-xs font-medium text-zinc-700">
                  {client.email}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">{client.phone}</p>
              </div>

              {/* Desktop CPF */}
              <div className="hidden lg:block text-xs text-zinc-600">
                <p className="font-medium text-zinc-800">{client.cpf || "Sem CPF"}</p>
                <p className="text-[11px] text-zinc-400">{client.birthDate || "Sem data nasc."}</p>
              </div>

              {/* Desktop Status */}
              <div className="hidden lg:block">
                <Badge
                  variant={client.status === "Ativo" ? "success" : "secondary"}
                >
                  <span className="mr-1.5 size-1.5 rounded-full bg-current" />
                  {client.status}
                </Badge>
              </div>

              {/* Desktop Last Appointment */}
              <div className="hidden lg:block text-xs font-medium text-zinc-500">
                {lastAppointmentLabel}
              </div>

              {/* Desktop Actions Menu */}
              <div className="hidden lg:flex relative justify-end">
                {actionMenuNode}
              </div>
            </div>
          );
        })}
        {filteredCount === 0 && (
          <div className="p-8 text-center text-sm text-zinc-400">
            Nenhum cliente cadastrado no banco de dados.
          </div>
        )}
      </div>
    </Card>
  );
}
