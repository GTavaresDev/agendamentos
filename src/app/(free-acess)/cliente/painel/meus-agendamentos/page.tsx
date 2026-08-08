import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, ChevronRight } from "lucide-react";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { getClientAppointmentsAction } from "../../../_actions/portal-appointment-actions";
import { AppointmentCard } from "../../../_components/appointment-card";
import {
  clientStatusLabel,
  formatDate,
  getStatusBadgeVariant,
} from "../../../_components/portal-format";
import { PortalShell, requireCompletePortalSession } from "../../../_components/portal-shell";

export const metadata: Metadata = {
  title: "Meus agendamentos",
};

export default async function MyAppointmentsPage() {
  const session = await requireCompletePortalSession();
  const { upcoming, past } = await getClientAppointmentsAction();

  return (
    <PortalShell
      session={session}
      title="Meus agendamentos"
      subtitle="Consulte e gerencie seus atendimentos agendados e passados."
    >
      <div className="w-full">
        <div className="flex items-center justify-end">
          <Button size="sm" asChild>
            <Link href="/cliente/painel/agendar">
              <CalendarPlus className="size-4 mr-1.5" /> Novo agendamento
            </Link>
          </Button>
        </div>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">Próximos</h2>
          {upcoming.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {upcoming.map((appointment) => (
                <li key={appointment.id}>
                  <AppointmentCard appointment={appointment} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
              Você não tem atendimentos marcados.
            </p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">Anteriores</h2>
          {past.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-xs">
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-5 py-3.5">Data e Hora</th>
                    <th className="px-5 py-3.5">Serviço</th>
                    <th className="px-5 py-3.5">Profissional</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {past.map((appointment) => (
                    <tr key={appointment.id} className="transition hover:bg-zinc-50/80">
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-zinc-950">
                        {formatDate(appointment.date)} às {appointment.time}
                      </td>
                      <td className="px-5 py-4 font-medium text-zinc-900">
                        {appointment.serviceName}
                        <span className="ml-2 text-xs text-zinc-400 font-normal">
                          ({appointment.duration})
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-600">
                        {appointment.professionalName || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {clientStatusLabel(appointment.status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/cliente/painel/meus-agendamentos/${appointment.id}`}>
                            Ver detalhes <ChevronRight className="size-3.5 ml-1" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
              Nenhum atendimento anterior por aqui.
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
