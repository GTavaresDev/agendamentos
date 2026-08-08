import Link from "next/link";
import { ChevronRight, Clock, UserRound } from "lucide-react";
import type { ClientAppointmentDTO } from "@core/application/portal/client-appointments.usecase";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import { clientStatusLabel, formatDayMonth, getStatusBadgeVariant } from "./portal-format";

/** Cartão do agendamento na visão do cliente: sem preço, sem notas, sem ids. */
export function AppointmentCard({ appointment }: { appointment: ClientAppointmentDTO }) {
  return (
    <Link
      href={`/cliente/painel/meus-agendamentos/${appointment.id}`}
      className="flex items-stretch gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-md"
    >
      <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-zinc-50/80 py-4 ring-1 ring-inset ring-zinc-200 self-stretch">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {formatDayMonth(appointment.date)}
        </span>
        <span className="mt-0.5 text-lg font-bold text-zinc-950">{appointment.time}</span>
      </div>

      <div className="min-w-0 flex-1 py-0.5 flex flex-col justify-between">
        <div>
          <p className="truncate text-base font-semibold text-zinc-950">
            {appointment.serviceName}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock className="size-3.5 text-zinc-400" />
            {appointment.duration}
          </p>
          {appointment.professionalName ? (
            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-zinc-600">
              <UserRound className="size-3.5 shrink-0 text-zinc-400" />
              {appointment.professionalName}
            </p>
          ) : null}
        </div>
        <div className="mt-3">
          <Badge variant={getStatusBadgeVariant(appointment.status)}>
            {clientStatusLabel(appointment.status)}
          </Badge>
        </div>
      </div>

      <ChevronRight className="size-4 shrink-0 text-zinc-400 self-center" />
    </Link>
  );
}
