"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Clock,
  RefreshCw,
  Smartphone,
  UserRound,
} from "lucide-react";

/** Duas formas de agendar, uma única lista para o cliente. */
const sources = [
  {
    id: "cliente",
    icon: Smartphone,
    label: "O cliente agenda sozinho",
    description:
      "Ele acessa o portal pelo celular, escolhe o serviço, o profissional e um horário livre. O atendimento entra na sua agenda como pendente, esperando sua confirmação.",
    bullets: [
      "Conta própria, com e-mail e senha ou login pelo Google",
      "Só horários realmente livres aparecem para escolher",
      "Ele acompanha e cancela sozinho os atendimentos futuros",
    ],
  },
  {
    id: "clinica",
    icon: Building2,
    label: "Você agenda por ele",
    description:
      "A recepção marca pelo painel e escolhe o cliente na lista. O atendimento aparece no portal daquela pessoa na hora — sem você precisar avisar nem enviar nada.",
    bullets: [
      "Marcação por telefone, WhatsApp ou presencial segue igual",
      "O cliente vê serviço, data, horário e profissional",
      "Todo o histórico anterior dele continua no mesmo lugar",
    ],
  },
];

/** Prévia do portal: a lista do cliente mistura as duas origens. */
function PortalPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white p-3 shadow-xl">
        <div className="rounded-[20px] bg-zinc-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Portal do cliente
              </p>
              <p className="mt-1 text-base font-bold text-zinc-950">Meus agendamentos</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-zinc-950 text-[11px] font-bold text-white">
              MS
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            <article className="rounded-xl border border-zinc-200 bg-white p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-medium text-zinc-400">Sexta, 15 de agosto</p>
                  <p className="mt-0.5 text-xl font-bold leading-none text-zinc-950">14:30</p>
                </div>
                <span className="rounded-md bg-zinc-950 px-2 py-0.5 text-[9px] font-bold text-white">
                  CONFIRMADO
                </span>
              </div>
              <div className="mt-3 border-t border-zinc-100 pt-2.5">
                <p className="text-[13px] font-semibold text-zinc-950">Botox</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <Clock className="size-3" /> 45 min
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <UserRound className="size-3" /> Gabriel Tavares
                </p>
              </div>
              <p className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[9px] font-semibold text-zinc-600">
                <Building2 className="size-2.5" /> AGENDADO PELA CLÍNICA
              </p>
            </article>

            <article className="rounded-xl border border-zinc-200 bg-white p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-medium text-zinc-400">Sexta, 22 de agosto</p>
                  <p className="mt-0.5 text-xl font-bold leading-none text-zinc-950">10:00</p>
                </div>
                <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-[9px] font-bold text-zinc-600">
                  PENDENTE
                </span>
              </div>
              <div className="mt-3 border-t border-zinc-100 pt-2.5">
                <p className="text-[13px] font-semibold text-zinc-950">Limpeza de pele</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <Clock className="size-3" /> 60 min
                </p>
              </div>
              <p className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[9px] font-semibold text-zinc-600">
                <Smartphone className="size-2.5" /> AGENDADO PELO CLIENTE
              </p>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SiteClientPortal() {
  return (
    <section
      id="portal-do-cliente"
      className="border-b border-zinc-100 bg-zinc-50 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Portal do Cliente
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Seu cliente agenda sozinho.<br className="hidden sm:block" /> Você também agenda por ele.
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            Cada cliente tem sua própria área, com login próprio, para marcar horários
            e acompanhar os atendimentos. E o que a recepção marca no painel aparece
            lá também — é a mesma agenda, vista dos dois lados.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="grid gap-5 sm:grid-cols-2">
              {sources.map(({ id, icon: Icon, label, description, bullets }) => (
                <div
                  key={id}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-xs">
                    <Icon className="size-5 stroke-[2.2]" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-zinc-950">{label}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">
                    {description}
                  </p>
                  <div className="mt-4 space-y-2.5 border-t border-zinc-100 pt-4">
                    {bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="flex items-start gap-2.5 text-[12px] font-medium text-zinc-800"
                      >
                        <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-[9px] text-white">
                          ✓
                        </span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                <RefreshCw className="size-4" />
              </div>
              <p className="text-[13px] leading-relaxed text-zinc-600">
                <span className="font-semibold text-zinc-950">
                  Não são dois sistemas conversando.
                </span>{" "}
                É o mesmo cadastro e a mesma agenda. Por isso o cliente vê o que você
                marcou no instante em que você salva, e você vê o que ele marcou sem
                precisar atualizar nada.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cliente"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800"
              >
                <CalendarCheck className="size-4" /> Entrar no Portal do Cliente
              </Link>
              <Link
                href="/cliente/cadastro"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                Criar conta de cliente <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <PortalPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
