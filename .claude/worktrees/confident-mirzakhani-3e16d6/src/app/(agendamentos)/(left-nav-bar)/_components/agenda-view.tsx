"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MoreVertical,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { ListPagination } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination";
import { cn } from "@/lib/utils";
import {
  paginateItems,
  TABLE_BODY_MIN_HEIGHT_CLASS,
  TABLE_ROW_MIN_HEIGHT_CLASS,
} from "@/lib/pagination";
import { AppointmentProps } from "@core/domain/appointments/Appointment";
import { appointmentChannels } from "@/app/(agendamentos)/mocks/scheduling";
import { appointmentAttendantLabel } from "@/lib/appointment-attendant";
import { generateWeek, getCurrentWeekIndex, getTodayIsoString, type WeekDay } from "@/lib/week-generator";

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
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(getCurrentWeekIndex());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [agendaScope, setAgendaScope] = useState("Geral");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const weekDays = useMemo(() => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + weekOffset * 7);
    return generateWeek(baseDate);
  }, [weekOffset]);

  const filteredAppointments = useMemo(() => {
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
        if (
          appt.userName !== agendaScope &&
          appt.userId !== agendaScope
        ) {
          return false;
        }
      }

      const targetIso = weekDays[selectedDay]?.iso;
      const matchDate = !targetIso || appt.date === targetIso;

      const matchSearch =
        appt.name.toLowerCase().includes(search.toLowerCase()) ||
        appt.service?.toLowerCase().includes(search.toLowerCase()) ||
        (appt.userName || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "Todos" || appt.status === statusFilter;
      return matchDate && matchSearch && matchStatus;
    });
  }, [
    appointments,
    search,
    statusFilter,
    currentUserRole,
    currentUserName,
    currentUserId,
    agendaScope,
    selectedDay,
  ]);

  const pagedAppointments = useMemo(
    () => paginateItems(filteredAppointments, page),
    [filteredAppointments, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, agendaScope, selectedDay]);

  const channelMap = useMemo(() => {
    const map = new Map<string, string>();
    appointmentChannels.forEach((c) => map.set(c.id, c.name));
    return map;
  }, []);

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      {/* Top Header Controls */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
            Agenda Completa do Dia
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {weekDays[selectedDay].full} — Visão da agenda ({currentUserRole})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-zinc-200 bg-white p-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => {
                if (selectedDay > 0) {
                  setSelectedDay((prev) => prev - 1);
                } else {
                  setWeekOffset((prev) => prev - 1);
                  setSelectedDay(6);
                }
              }}
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-32 text-center text-xs font-semibold">
              {weekDays[selectedDay]?.full || "Carregando..."}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => {
                if (selectedDay < 6) {
                  setSelectedDay((prev) => prev + 1);
                } else {
                  setWeekOffset((prev) => prev + 1);
                  setSelectedDay(0);
                }
              }}
            >
              <ChevronRight />
            </Button>
          </div>
          <Button onClick={onNew}>
            <Plus /> Novo agendamento
          </Button>
        </div>
      </div>

      {/* Week Day Selector Cards */}
      <div className="mb-6 grid grid-cols-7 gap-2">
        {weekDays.map((item, index) => {
          const isToday = item.iso === getTodayIsoString();
          const isSelected = selectedDay === index;

          return (
            <button
              key={item.date}
              onClick={() => setSelectedDay(index)}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center rounded-xl border px-2 py-3 transition",
                isSelected
                  ? "border-zinc-950 bg-zinc-950 text-white shadow-md"
                  : isToday
                    ? "border-zinc-950 bg-white text-zinc-950 shadow-md"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider",
                  isSelected ? "text-zinc-400" : isToday ? "text-zinc-950 font-bold" : "text-zinc-400",
                )}
              >
                {item.day}
              </span>
              <span className="mt-1 text-xl font-bold">{item.date}</span>
              {isToday && (
                <span
                  className={cn(
                    "mt-1 size-1 rounded-full",
                    isSelected ? "bg-white" : "bg-zinc-950",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, atendente ou serviço..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {currentUserRole !== "Funcionario" && (
            <div className="relative">
              <select
                value={agendaScope}
                onChange={(e) => setAgendaScope(e.target.value)}
                className="h-10 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 text-xs font-medium text-zinc-700 outline-none"
              >
                <option value="Geral">Visão: Toda a Agenda</option>
                {userList
                  .filter((u) => currentUserRole === "Administrador" || u.role !== "Administrador")
                  .map((u) => (
                    <option key={u.id || u.name} value={u.name}>
                      Agenda: {u.name} ({u.role || "Equipe"})
                    </option>
                  ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            </div>
          )}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 text-xs font-medium text-zinc-700 outline-none"
            >
              <option value="Todos">Status: Todos</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Pendente">Pendente</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          </div>
        </div>
      </div>

      {/* Main Agenda Table Card */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/70 p-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4" /> Horários e Atendimentos
            </CardTitle>
            <Badge variant="outline">
              {filteredAppointments.length} {filteredAppointments.length === 1 ? "compromisso" : "compromissos"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Header Row for desktop */}
          <div className="hidden grid-cols-[90px_1.6fr_1.4fr_1.5fr_0.9fr_0.9fr_40px] items-center gap-4 border-b border-zinc-200 bg-zinc-100/60 px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 lg:grid">
            <span>Horário</span>
            <span>Cliente</span>
            <span>Atendente</span>
            <span>Serviço & Duração</span>
            <span>Canal</span>
            <span>Status</span>
            <span />
          </div>

          <div className={cn("divide-y divide-zinc-100", TABLE_BODY_MIN_HEIGHT_CLASS)}>
            {pagedAppointments.map((item) => {
              const attendantLabel = appointmentAttendantLabel(item);
              const channelLabel = channelMap.get(item.channelId) || "Sistema";

              return (
              <div
                key={item.id || item.time}
                className={cn(
                  "group relative grid gap-3 p-4 transition hover:bg-zinc-50/80 sm:px-6 lg:grid-cols-[90px_1.6fr_1.4fr_1.5fr_0.9fr_0.9fr_40px] lg:items-center",
                  TABLE_ROW_MIN_HEIGHT_CLASS,
                )}
              >
                {/* Time Slot */}
                <div className="flex items-center gap-2 font-semibold text-zinc-950">
                  <Clock3 className="size-3.5 text-zinc-400 lg:hidden" />
                  <span className="text-sm">{item.time}</span>
                </div>

                {/* Client Avatar and Name */}
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={item.initials}
                    className="size-9 bg-zinc-900 text-white ring-0"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {item.name}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 text-xs font-medium text-zinc-700">
                  <p className="truncate lg:hidden text-[10px] uppercase tracking-wider text-zinc-400">
                    Atendente
                  </p>
                  <p className="truncate">{attendantLabel}</p>
                </div>

                {/* Service Details */}
                <div className="text-xs text-zinc-600">
                  <p className="font-medium text-zinc-800">{item.service}</p>
                  <p className="text-[11px] text-zinc-400">{item.duration}</p>
                </div>

                {/* Origin Channel */}
                <div className="text-xs font-medium text-zinc-500">
                  {channelLabel}
                </div>

                {/* Status Badge */}
                <div>
                  <Badge
                    variant={
                      item.status === "Confirmado"
                        ? "success"
                        : item.status === "Concluído"
                        ? "default"
                        : item.status === "Cancelado"
                        ? "destructive"
                        : "warning"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>

                {/* Actions Menu */}
                <div className="relative flex justify-end">
                  {(() => {
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

                    if (!canEdit) {
                      return (
                        <span className="text-[11px] font-medium text-zinc-400">
                          Somente leitura
                        </span>
                      );
                    }

                    return (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(openMenuId === item.id ? null : item.id)
                          }
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-black"
                        >
                          <MoreVertical className="size-4" />
                        </button>
                        {openMenuId === item.id && (
                          <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
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
                    );
                  })()}
                </div>
              </div>
              );
            })}

            {filteredAppointments.length === 0 && (
              <div className="p-12 text-center text-sm text-zinc-400">
                Nenhum agendamento encontrado para os filtros selecionados.
              </div>
            )}
          </div>
          <ListPagination
            page={page}
            totalItems={filteredAppointments.length}
            onPageChange={setPage}
            label="compromissos"
          />
        </CardContent>
      </Card>
    </div>
  );
}
