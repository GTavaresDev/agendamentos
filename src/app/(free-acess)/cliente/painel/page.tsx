import Link from "next/link";
import { cookies } from "next/headers";
import { CalendarPlus, ChevronRight, Clock, ListChecks, UserRound } from "lucide-react";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { getClientAppointmentsAction } from "../../_actions/portal-appointment-actions";
import { getClientAccountStatusAction } from "../../_actions/portal-auth-actions";
import { getClientProfileStatusAction } from "../../_actions/portal-profile-actions";
import { CompleteProfileForm } from "../../_components/complete-profile-form";
import { PASSWORD_NUDGE_COOKIE } from "../../_components/password-nudge";
import { SetPasswordCard } from "../../_components/set-password-card";
import {
  clientStatusLabel,
  firstName,
  formatDate,
  formatFriendlyDate,
  getStatusBadgeVariant,
} from "../../_components/portal-format";
import { PortalShell, requirePortalSession } from "../../_components/portal-shell";

export default async function ClientHomePage() {
  const session = await requirePortalSession();
  const profile = await getClientProfileStatusAction();

  // Cadastro incompleto: nada do portal é montado — nem agendamentos, nem
  // navegação. O formulário ocupa o lugar do conteúdo.
  if (!profile.complete) {
    return (
      <PortalShell
        session={session}
        locked
        title="Complete seu cadastro"
        subtitle="Faltam alguns dados para liberar seus agendamentos."
      >
        <CompleteProfileForm profile={profile} />
      </PortalShell>
    );
  }

  const [{ next }, { hasPassword }, cookieStore] = await Promise.all([
    getClientAppointmentsAction(),
    getClientAccountStatusAction(),
    cookies(),
  ]);

  // Decidido no servidor: dispensado não vem no HTML, então não pisca.
  const showPasswordNudge =
    !hasPassword && cookieStore.get(PASSWORD_NUDGE_COOKIE)?.value !== "1";

  return (
    <PortalShell
      session={session}
      title={`Olá, ${firstName(session.name)}!`}
      subtitle="Gerencie seus agendamentos e acompanhe seus próximos horários."
    >
      <section className="grid gap-3 sm:grid-cols-2">
        <Button size="lg" className="h-12 text-base font-medium gap-2" asChild>
          <Link href="/cliente/painel/agendar">
            <CalendarPlus className="size-5" /> Novo agendamento
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="h-12 text-base font-medium gap-2" asChild>
          <Link href="/cliente/painel/meus-agendamentos">
            <ListChecks className="size-5" /> Meus agendamentos
          </Link>
        </Button>
      </section>

      {/* Flutuante: fica no canto, fora do fluxo do conteúdo. */}
      {showPasswordNudge ? <SetPasswordCard /> : null}

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">Seu próximo atendimento</h2>

        {next ? (
          <Link
            href={`/cliente/painel/meus-agendamentos/${next.id}`}
            className="block rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  {formatFriendlyDate(next.date)}
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-zinc-950">
                  {next.time}
                </p>
                <p className="text-sm text-zinc-500">{formatDate(next.date)}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(next.status)}>
                {clientStatusLabel(next.status)}
              </Badge>
            </div>

            <div className="mt-4 border-t border-zinc-100 pt-4">
              <p className="text-base font-semibold text-zinc-950">{next.serviceName}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                <Clock className="size-4" />
                {next.duration}
              </p>
              {next.professionalName ? (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-600">
                  <UserRound className="size-4" />
                  Profissional: {next.professionalName}
                </p>
              ) : null}
            </div>

            <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-950">
              Ver detalhes <ChevronRight className="size-4" />
            </p>
          </Link>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center">
            <p className="text-sm font-medium text-zinc-950">
              Você não tem atendimentos marcados.
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Escolha um serviço e reserve o melhor horário para você.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/cliente/painel/agendar">
                <CalendarPlus /> Agendar agora
              </Link>
            </Button>
          </div>
        )}
      </section>
    </PortalShell>
  );
}
