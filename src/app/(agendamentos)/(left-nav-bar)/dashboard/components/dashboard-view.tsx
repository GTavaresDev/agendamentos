"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  MoreVertical,
  Pencil,
  Plus,
  Power,
  Sparkles,
  Trash2,
  UserCheck,
  UsersRound,
  ShoppingCart,
} from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import {
  ViewLoadingSkeleton,
  LoadingOverlayCard,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons";
import { ServiceColorIndicator } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/service-color-indicator";
import { cn } from "@/lib/utils";
import { appointmentAttendantLabel } from "@/lib/appointment-attendant";
import { resolveServiceColor } from "@/lib/service-color";
import { getStatusBadgeVariant } from "@/lib/appointment-status";
import { getTodayIsoString, dateToIsoString } from "@/lib/week-generator";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";
import { useAppointments } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-appointments";
import { useUsers } from "@/app/(agendamentos)/(left-nav-bar)/usuarios/hooks/use-users";
import { useClients } from "@/app/(agendamentos)/(left-nav-bar)/clientes/hooks/use-clients";
import { useServices } from "@/app/(agendamentos)/(left-nav-bar)/servicos/hooks/use-services";
import { StatCard } from "./stat-card";

export function DashboardView() {
  const router = useRouter();
  const { currentUser, showToast } = useAppShell();
  const {
    appointmentList,
    isLoading: appointmentsLoading,
    handleAppointmentStatusChange,
    handleDeleteAppointment,
  } = useAppointments();
  const { userList, isLoading: usersLoading } = useUsers();
  const { clientList, isLoading: clientsLoading } = useClients();
  const { serviceList } = useServices();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const onNew = () => router.push("/agenda?novo=1");
  const onVerAgenda = () => router.push("/agenda");
  const appointments = appointmentList;
  const usersCount = userList.length;
  const clientsCount = clientList.length;
  const onStatusChange = handleAppointmentStatusChange;
  const onDeleteAppointment = handleDeleteAppointment;

  // Calculate weekly movement from database
  const bars = useMemo(() => {
    const dayMap = new Map<number, number>();
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      const dateStr = dateToIsoString(dayDate);

      const dayAppointments = appointments.filter((a) => a.date === dateStr);
      dayMap.set(i, dayAppointments.length);
    }

    const maxCount = Math.max(...Array.from(dayMap.values()), 1);
    return Array.from({ length: 7 }, (_, i) => {
      const count = dayMap.get(i) || 0;
      return Math.round((count / maxCount) * 100);
    });
  }, [appointments]);

  const todayIso = getTodayIsoString();

  const todayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.date === todayIso)
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 5);
  }, [appointments, todayIso]);

  const todayCount = todayAppointments.length;
  const todayCompletedCount = todayAppointments.filter((a) => a.status === "Concluído").length;
  const todayAttendanceRate = todayCount > 0
    ? Math.round((todayCompletedCount / todayCount) * 100)
    : 0;

  if (!currentUser) return null;

  if (appointmentsLoading || usersLoading || clientsLoading) {
    return (
      <div className="relative min-h-[calc(100vh-84px)]">
        <ViewLoadingSkeleton view="dashboard" />
        <LoadingOverlayCard label="Carregando dados..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] p-3.5 sm:p-6 lg:p-8 space-y-6">
      {/* Top Sections: Action Buttons + Stat Cards */}
      <div className="flex flex-col space-y-6">
        {/* Indicadores Principais (Primeiro no Desktop) */}
        <div className="order-2 sm:order-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="Agendamentos hoje"
              value={todayCount.toString().padStart(2, "0")}
              detail="de 8 horários"
              icon={CalendarDays}
              progress={Math.round((todayCount / 8) * 100)}
            />
            <StatCard
              label="Base de clientes"
              value={clientsCount.toString()}
              detail="clientes cadastrados"
              icon={UserCheck}
            />
            <StatCard
              label="Equipe do sistema"
              value={usersCount.toString()}
              detail="membros com acesso"
              icon={UsersRound}
            />
            <StatCard
              label="Taxa de presença"
              value={`${todayAttendanceRate}%`}
              detail={todayCount > 0 ? `${todayCompletedCount} de ${todayCount} agendamentos` : "sem agendamentos"}
              icon={Check}
              progress={todayAttendanceRate}
            />
          </div>
        </div>

        {/* Começar / Ações Rápidas (Abaixo dos cards no Desktop, Primeiro no Mobile) */}
        <div className="order-1 sm:order-2">
          <h2 className="mb-2.5 text-sm sm:text-base font-semibold tracking-tight text-zinc-950">
            Começar
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onNew}
              className="group @container/action flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-white p-[clamp(0.75rem,4.5cqw,1.25rem)] text-center shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50/60 hover:shadow-md active:scale-[0.98] min-h-[105px] sm:min-h-[125px] h-full"
            >
              <div className="flex size-[clamp(2.25rem,9cqw,3rem)] items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 transition-transform group-hover:scale-105">
                <Plus className="size-[clamp(1.125rem,4.5cqw,1.5rem)] stroke-[2]" />
              </div>
              <span className="mt-[clamp(0.375rem,2.5cqw,0.75rem)] text-[clamp(0.6875rem,3.2cqw,0.875rem)] font-semibold text-zinc-900 leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                Novo agendamento
              </span>
            </button>

            <button
              type="button"
              onClick={onVerAgenda}
              className="group @container/action flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-white p-[clamp(0.75rem,4.5cqw,1.25rem)] text-center shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50/60 hover:shadow-md active:scale-[0.98] min-h-[105px] sm:min-h-[125px] h-full"
            >
              <div className="flex size-[clamp(2.25rem,9cqw,3rem)] items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 transition-transform group-hover:scale-105">
                <CalendarDays className="size-[clamp(1.125rem,4.5cqw,1.5rem)] stroke-[1.75]" />
              </div>
              <span className="mt-[clamp(0.375rem,2.5cqw,0.75rem)] text-[clamp(0.6875rem,3.2cqw,0.875rem)] font-semibold text-zinc-900 leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                Ver agenda completa
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/clientes?novo=1")}
              className="group @container/action flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-white p-[clamp(0.75rem,4.5cqw,1.25rem)] text-center shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50/60 hover:shadow-md active:scale-[0.98] min-h-[105px] sm:min-h-[125px] h-full"
            >
              <div className="flex size-[clamp(2.25rem,9cqw,3rem)] items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 transition-transform group-hover:scale-105">
                <UserCheck className="size-[clamp(1.125rem,4.5cqw,1.5rem)] stroke-[1.75]" />
              </div>
              <span className="mt-[clamp(0.375rem,2.5cqw,0.75rem)] text-[clamp(0.6875rem,3.2cqw,0.875rem)] font-semibold text-zinc-900 leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                Cadastrar cliente
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/vendas?novo=1")}
              className="group @container/action flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-white p-[clamp(0.75rem,4.5cqw,1.25rem)] text-center shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50/60 hover:shadow-md active:scale-[0.98] min-h-[105px] sm:min-h-[125px] h-full"
            >
              <div className="flex size-[clamp(2.25rem,9cqw,3rem)] items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 transition-transform group-hover:scale-105">
                <ShoppingCart className="size-[clamp(1.125rem,4.5cqw,1.5rem)] stroke-[1.75]" />
              </div>
              <span className="mt-[clamp(0.375rem,2.5cqw,0.75rem)] text-[clamp(0.6875rem,3.2cqw,0.875rem)] font-semibold text-zinc-900 leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                Registrar venda
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Card className="min-h-[420px]">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Agenda de hoje</CardTitle>
              <CardDescription>
                Próximos atendimentos do banco de dados
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onVerAgenda || onNew}>
              Ver agenda <ArrowRight />
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <div className="min-h-[340px] divide-y divide-zinc-100">
              {todayAppointments.map((item) => {
                const attendantLabel = appointmentAttendantLabel(item);
                const serviceColor = resolveServiceColor(serviceList, item);

                return (
                  <div
                    key={item.id}
                    className="group relative flex h-[68px] items-center gap-2.5 sm:gap-4 px-3 sm:px-5 hover:bg-zinc-50"
                  >
                    <div className="w-12 text-sm font-semibold text-zinc-950">
                      {item.time}
                    </div>
                    <ServiceColorIndicator color={serviceColor} variant="bar" />
                    <Avatar initials={item.initials} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-zinc-400">
                        <span className="sm:hidden">{item.service} ({item.duration})</span>
                        <span className="hidden sm:inline">{item.service} · {item.duration} · Atendente: {attendantLabel}</span>
                      </p>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(item.status)}
                      className="hidden sm:inline-flex"
                    >
                      {item.status}
                    </Badge>
                    <div className="relative">
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
                              showToast(`Editar agendamento de ${item.name}`);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                          >
                            <Pencil className="size-4 shrink-0 text-zinc-500" /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              let nextStatus: "Confirmado" | "Concluído" =
                                "Confirmado";
                              if (item.status === "Confirmado") {
                                nextStatus = "Concluído";
                              }
                              await onStatusChange(item.id, nextStatus);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
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
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="size-4 shrink-0 text-red-500" /> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {appointments.length === 0 && (
                <div className="p-8 text-center text-sm text-zinc-400">
                  Nenhum agendamento cadastrado no banco de dados.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[420px]">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Movimento semanal</CardTitle>
              <CardDescription>Agendamentos por dia</CardDescription>
            </div>
            <Badge variant="outline">Esta semana</Badge>
          </CardHeader>
          <CardContent>
            {appointments.length > 0 ? (
              <>
                <div className="flex h-[190px] items-end gap-1.5 border-b border-zinc-200 pt-4 sm:gap-5">
                  {bars.map((height, index) => {
                    const today = new Date();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    const dayDate = new Date(startOfWeek);
                    dayDate.setDate(startOfWeek.getDate() + index);
                    const dateStr = dateToIsoString(dayDate);

                    const dayAppointments = appointments.filter((a) => a.date === dateStr).length;
                    const isToday = index === today.getDay();

                    return (
                      <div key={index} className="group flex h-full flex-1 flex-col items-center justify-end">
                        <div
                          className={cn(
                            "relative w-full rounded-t-md transition-all group-hover:bg-zinc-700",
                            isToday ? "bg-zinc-950" : "bg-zinc-200",
                          )}
                          style={{ height: `${height}%`, minHeight: height > 0 ? "8px" : "0px" }}
                        >
                          {dayAppointments > 0 && (
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-black px-1.5 py-0.5 text-[9px] font-semibold text-white">
                              {dayAppointments}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex justify-between text-[10px] font-medium text-zinc-400">
                  <span>SEG</span>
                  <span>TER</span>
                  <span>QUA</span>
                  <span>QUI</span>
                  <span>SEX</span>
                  <span className={new Date().getDay() === 6 ? "text-zinc-950" : ""}>SÁB</span>
                  <span>DOM</span>
                </div>
                {(() => {
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay());
                  const dayDate = new Date(startOfWeek);
                  dayDate.setDate(startOfWeek.getDate() + today.getDay());
                  const todayDateStr = dateToIsoString(dayDate);

                  const todayCount = appointments.filter((a) => a.date === todayDateStr).length;
                  const weekAvg = appointments.length / 7;
                  const diff = ((todayCount - weekAvg) / Math.max(weekAvg, 1)) * 100;

                  return (
                    <div className="mt-6 flex items-center gap-4 rounded-xl bg-zinc-50 p-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
                        <Sparkles className="size-4" />
                      </div>
                      <p className="text-xs leading-5 text-zinc-500">
                        <strong className="block text-sm text-zinc-900">
                          {todayCount > 0
                            ? `Hoje com ${Math.abs(Math.round(diff))}% ${diff >= 0 ? "mais" : "menos"} agendamentos`
                            : "Nenhum agendamento hoje"}
                        </strong>
                        {todayCount > 0
                          ? `comparado à média da semana (${Math.round(weekAvg)} por dia).`
                          : "Agenda vazia para hoje."}
                      </p>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-center text-zinc-400">
                <p>Nenhum agendamento na semana</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
