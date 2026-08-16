"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  MoreVertical,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar.component";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge.component";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { Calendar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/calendar.component";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import { ServiceBadge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/service-color-indicator.component";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";
import { useServices } from "@/app/(agendamentos)/(left-nav-bar)/servicos/hooks/use-services";
import { ListPagination } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination.component";
import { cn } from "@/lib/utils";
import {
  paginateItems,
  TABLE_BODY_MIN_HEIGHT_CLASS,
  TABLE_ROW_MIN_HEIGHT_CLASS,
} from "@/lib/pagination";
import { resolveServiceColor } from "@/lib/service-color";
import { getStatusBadgeVariant } from "@/lib/appointment-status";
import { AppointmentProps } from "@core/domain/appointments/appointment.entity";
import { appointmentChannels } from "@/app/(agendamentos)/mocks/scheduling";
import { appointmentAttendantLabel } from "@/lib/appointment-attendant";
import { dateToIsoString } from "@/lib/week-generator";

const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function AgendaView({
  appointments,
  onStatusChange,
  onDeleteAppointment,
  onNew,
  showToast,
  currentUserRole = "Administrador",
  currentUserName = "",
  currentUserId = "",
  userList = [],
}: {
  appointments: AppointmentProps[];
  onStatusChange: (id: string, status: "Confirmado" | "Cancelado" | "Concluído") => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
  onNew: () => void;
  showToast: (message: string) => void;
  currentUserRole?: "Administrador" | "Gestor" | "Funcionario";
  currentUserName?: string;
  currentUserId?: string;
  userList?: { id?: string; name: string; role?: string }[];
}) {
  const { setPageHeader } = useAppShell();
  const { serviceList } = useServices();

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [agendaScope, setAgendaScope] = useState("Geral");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const selectedIso = dateToIsoString(selectedDate);

  useEffect(() => {
    setPageHeader({
      title: "Agenda Completa do Dia",
      subtitle: `${fullDateFormatter.format(selectedDate)} — Visão da agenda (${currentUserRole})`,
    });
    return () => setPageHeader(null);
  }, [selectedDate, currentUserRole, setPageHeader]);

  // Compromissos visíveis para o usuário atual, independente da data selecionada
  const visibleAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      if (currentUserRole === "Funcionario") {
        const isMine =
          appt.userId === currentUserId ||
          (!appt.userId && appt.userName === currentUserName);
        if (!isMine) return false;
      } else if (currentUserRole === "Gestor") {
        if (appt.userRole === "Administrador") return false;
      }

      if (agendaScope !== "Geral") {
        if (appt.userName !== agendaScope && appt.userId !== agendaScope) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, currentUserRole, currentUserName, currentUserId, agendaScope]);

  const markedDates = useMemo(() => {
    return new Set(visibleAppointments.map((appt) => appt.date));
  }, [visibleAppointments]);

  const filteredAppointments = useMemo(() => {
    return visibleAppointments.filter((appt) => {
      const matchDate = appt.date === selectedIso;

      const matchSearch =
        appt.name.toLowerCase().includes(search.toLowerCase()) ||
        appt.service?.toLowerCase().includes(search.toLowerCase()) ||
        (appt.userName || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "Todos" || appt.status === statusFilter;
      return matchDate && matchSearch && matchStatus;
    });
  }, [visibleAppointments, search, statusFilter, selectedIso]);

  const pagedAppointments = useMemo(
    () => paginateItems(filteredAppointments, page),
    [filteredAppointments, page],
  );

  const channelMap = useMemo(() => {
    const map = new Map<string, string>();
    appointmentChannels.forEach((c) => map.set(c.id, c.name));
    return map;
  }, []);

  return (
    <div className="mx-auto max-w-[1500px] p-3.5 sm:p-6 lg:p-8">
      {/* Search and Action Button on top row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por cliente, atendente ou serviço..."
            className="pl-9 w-full"
          />
        </div>
        <Button onClick={onNew} className="w-full sm:w-48 shrink-0 gap-2 justify-center">
          <Plus className="size-4" /> Novo agendamento
        </Button>
      </div>

      {/* Calendar */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-5">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return;
              setSelectedDate(date);
              setPage(1);
            }}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            markedDates={markedDates}
          />
        </CardContent>
      </Card>

      {/* Main Agenda Table Card */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/70 p-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4" /> Horários e Atendimentos
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {currentUserRole !== "Funcionario" && (
                <div className="relative shrink-0">
                  <select
                    value={agendaScope}
                    onChange={(e) => {
                      setAgendaScope(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 max-w-[155px] truncate appearance-none rounded-lg border border-zinc-200 bg-white pl-2.5 pr-7 text-xs font-medium text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400"
                  >
                    <option value="Geral">Todas</option>
                    {userList
                      .filter((u) => currentUserRole === "Administrador" || u.role !== "Administrador")
                      .map((u) => (
                        <option key={u.id || u.name} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
                </div>
              )}
              <div className="relative shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 max-w-[140px] truncate appearance-none rounded-lg border border-zinc-200 bg-white pl-2.5 pr-7 text-xs font-medium text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400"
                >
                  <option value="Todos">Status: Todos</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
              </div>
              <Badge variant="outline" className="h-8 px-2.5 text-xs font-normal">
                {filteredAppointments.length} {filteredAppointments.length === 1 ? "compromisso" : "compromissos"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Header Row for desktop */}
          <div className="hidden grid-cols-[70px_1.6fr_1.1fr_2.0fr_0.8fr_0.9fr_40px] items-center gap-4 border-b border-zinc-200 bg-zinc-100/60 px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 lg:grid">
            <span>Horário</span>
            <span>Cliente</span>
            <span>Atendente</span>
            <span>Serviço & Duração</span>
            <span>Canal</span>
            <span>Status</span>
            <span />
          </div>

          <div className="max-h-[290px] overflow-y-auto divide-y divide-zinc-100 min-h-[260px]">
            {filteredAppointments.map((item) => {
              const attendantLabel = appointmentAttendantLabel(item);
              const channelLabel = channelMap.get(item.channelId) || "Sistema";
              const serviceColor = resolveServiceColor(serviceList, item);

              const isMine =
                item.userId === currentUserId ||
                (!item.userId && item.userName === currentUserName);
              const isTargetAdmin = item.userRole === "Administrador";
              const isTargetGestor = item.userRole === "Gestor";

              const canEdit =
                currentUserRole === "Administrador" ||
                (currentUserRole === "Gestor" &&
                  (isMine || (!isTargetAdmin && !isTargetGestor))) ||
                (currentUserRole === "Funcionario" && isMine);

              const actionMenuNode = canEdit ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(openMenuId === item.id ? null : item.id)
                    }
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-black transition-colors"
                  >
                    <MoreVertical className="size-4" />
                  </button>
                  {openMenuId === item.id && (
                    <div className="absolute right-0 top-8 z-50 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          showToast(`Edição do agendamento de ${item.name}`);
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                      >
                        <Pencil className="size-4 shrink-0 text-zinc-500" /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          let newStatus: "Confirmado" | "Concluído" =
                            "Confirmado";
                          if (item.status === "Confirmado") {
                            newStatus = "Concluído";
                          }
                          await onStatusChange(item.id, newStatus);
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
                          await onDeleteAppointment(item.id);
                          showToast(
                            `Agendamento de ${item.name} excluído do banco`,
                          );
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="size-4 shrink-0 text-red-500" /> Excluir
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <span className="text-[11px] font-medium text-zinc-400">
                  Somente leitura
                </span>
              );

              return (
                <div
                  key={item.id || item.time}
                  className="group relative flex flex-col gap-1.5 p-3 sm:p-3.5 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors lg:grid lg:grid-cols-[70px_1.6fr_1.1fr_2.0fr_0.8fr_0.9fr_40px] lg:items-center lg:py-2.5 lg:px-6 lg:border-b-0 lg:gap-3"
                >
                  {/* Line 1 for Mobile (< lg): Avatar + Name on left, Time + Status + Menu on right */}
                  <div className="flex items-center justify-between gap-2 lg:hidden">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        initials={item.initials}
                        className="size-8 bg-zinc-900 text-white shrink-0 text-xs font-semibold"
                      />
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {item.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-950">
                        <Clock3 className="size-3 text-zinc-500" />
                        {item.time}
                      </span>
                      <Badge variant={getStatusBadgeVariant(item.status)} className="text-[11px] px-2 py-0.5">
                        {item.status}
                      </Badge>
                      <div className="relative">{actionMenuNode}</div>
                    </div>
                  </div>

                  {/* Line 2 for Mobile (< lg): Service, Duration, Attendant indented under name */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-0 overflow-hidden whitespace-nowrap pl-[42px] lg:hidden">
                    {item.service && <ServiceBadge color={serviceColor} name={item.service} className="shrink-0" />}
                    <span className="text-zinc-300 shrink-0">•</span>
                    <span className="shrink-0">{item.duration}</span>
                    <span className="text-zinc-300 shrink-0">•</span>
                    <span className="text-zinc-600 font-medium truncate min-w-0">{attendantLabel}</span>
                  </div>

                  {/* Desktop Time (lg:flex) */}
                  <div className="hidden lg:flex items-center gap-2 font-semibold text-zinc-950">
                    <span className="text-sm">{item.time}</span>
                  </div>

                  {/* Desktop Client Info */}
                  <div className="hidden lg:flex items-center gap-2.5 min-w-0">
                    <Avatar
                      initials={item.initials}
                      className="size-8 bg-zinc-900 text-white shrink-0 text-xs font-semibold"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {item.name}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Column 3: Attendant */}
                  <div className="hidden lg:block min-w-0 text-xs font-medium text-zinc-700">
                    <p className="truncate">{attendantLabel}</p>
                  </div>

                  {/* Desktop Column 4: Service & Duration */}
                  <div className="hidden lg:flex min-w-0 items-center gap-1.5 text-xs text-zinc-500 whitespace-nowrap">
                    {item.service && <ServiceBadge color={serviceColor} name={item.service} />}
                    <span aria-hidden className="text-zinc-400">•</span>
                    <span>{item.duration}</span>
                  </div>

                  {/* Desktop Column 5: Channel */}
                  <div className="hidden lg:block text-xs font-medium text-zinc-500">
                    {channelLabel}
                  </div>

                  {/* Desktop Column 6: Status */}
                  <div className="hidden lg:block">
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </div>

                  {/* Desktop Column 7: Actions Menu */}
                  <div className="hidden lg:flex relative justify-end">
                    {actionMenuNode}
                  </div>
                </div>
              );
            })}

            {filteredAppointments.length === 0 && (
              <div className="p-8 text-center text-sm text-zinc-400">
                Nenhum agendamento encontrado para os filtros selecionados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
