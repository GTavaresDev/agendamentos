import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import { getClientAppointmentAction } from "../../../_actions/portal-appointment-actions";
import { CancelAppointmentButton } from "../../../_components/cancel-appointment-button";
import {
  clientStatusLabel,
  formatDate,
  formatFriendlyDate,
  getStatusBadgeVariant,
} from "../../../_components/portal-format";
import { PortalShell, requireCompletePortalSession } from "../../../_components/portal-shell";

export const metadata: Metadata = {
  title: "Detalhes do agendamento",
};

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCompletePortalSession();
  const { id } = await params;

  // A consulta filtra por cliente autenticado: id de outra pessoa vira 404.
  const appointment = await getClientAppointmentAction(id);
  if (!appointment) {
    notFound();
  }

  return (
    <PortalShell session={session}>
      <Link
        href="/cliente/meus-agendamentos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
      >
        <ArrowLeft className="size-4" /> Meus agendamentos
      </Link>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              {formatFriendlyDate(appointment.date)}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-zinc-950">
              {appointment.time}
            </p>
          </div>
          <Badge variant={getStatusBadgeVariant(appointment.status)}>
            {clientStatusLabel(appointment.status)}
          </Badge>
        </div>

        <dl className="mt-5 divide-y divide-zinc-100 border-t border-zinc-100">
          <DetailRow label="Serviço" value={appointment.serviceName} />
          <DetailRow label="Duração" value={appointment.duration} />
          <DetailRow label="Data" value={formatDate(appointment.date)} />
          <DetailRow label="Horário" value={appointment.time} />
          <DetailRow label="Profissional" value={appointment.professionalName ?? "A definir"} />
        </dl>
      </div>

      <div className="mt-4">
        {appointment.canCancel ? (
          <CancelAppointmentButton appointmentId={appointment.id} />
        ) : (
          <p className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
            Este agendamento não pode mais ser cancelado pelo portal. Entre em contato com
            a clínica se precisar de ajuda.
          </p>
        )}
      </div>
    </PortalShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-zinc-950">{value}</dd>
    </div>
  );
}
