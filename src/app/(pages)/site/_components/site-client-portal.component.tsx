"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Clock,
  Plus,
  RefreshCw,
  Smartphone,
  UserRound,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/animation/fade-in.component";
import { TiltCard } from "@/components/ui/animation/tilt-card.component";
import { StaggerContainer, StaggerItem } from "@/components/ui/animation/stagger-container.component";

/** Duas formas de agendar, uma única lista para o cliente. */
const sources = [
  {
    id: "cliente",
    icon: Smartphone,
    label: "O cliente agenda sozinho",
    description:
      "Ele acessa o portal pelo celular ou computador, escolhe o serviço, o profissional e um horário livre. O atendimento entra na sua agenda instantaneamente.",
    bullets: [
      "Conta própria, com e-mail e senha ou login pelo Google",
      "Horários e dias realmente disponíveis em tempo real",
      "Acompanhamento autônomo e remarcações facilitadas",
    ],
  },
  {
    id: "clinica",
    icon: Building2,
    label: "Você também agenda por ele",
    description:
      "A recepção marca pelo painel e escolhe o cliente na lista. O atendimento aparece no portal daquela pessoa na hora — sem você precisar avisar nem enviar nada.",
    bullets: [
      "Marcação por WhatsApp, telefone ou presencial segue igual",
      "O cliente visualiza serviço, data, horário e profissional",
      "Histórico completo mantido de forma unificada no mesmo cadastro",
    ],
  },
];

/** Mockup completo do Portal do Cliente no estilo Browser Frame (idêntico ao ProductMockup do Hero) */
function ClientPortalMockup() {
  return (
    <FadeIn variant="blur" duration={0.7} delay={0.1}>
      <TiltCard maxTilt={5}>
        <div className="group mt-12 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-2 sm:p-3 shadow-xl transition-shadow duration-500 hover:shadow-2xl">
          {/* Top Browser Bar */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 pb-2.5 pt-1 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 sm:size-3 rounded-full bg-red-400/80" />
              <div className="size-2.5 sm:size-3 rounded-full bg-amber-400/80" />
              <div className="size-2.5 sm:size-3 rounded-full bg-emerald-400/80" />
            </div>
            <div className="rounded-lg bg-zinc-100 px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-zinc-500 transition-colors group-hover:text-zinc-900">
              app.agendamentos.com.br/cliente/painel
            </div>
            <div className="w-10" />
          </div>

          {/* Portal UI Preview Frame */}
          <div className="rounded-xl bg-zinc-50/80 p-4 sm:p-6 border border-zinc-100">
            {/* Top Portal Nav inside Mockup */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-zinc-950 text-sm font-bold text-white shadow-xs">
                  MS
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-950">Olá, Maria Silva</h3>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      Conta Ativa
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">Seus agendamentos sincronizados em tempo real</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-xs">
                  <Plus className="size-3.5" /> Novo Agendamento
                </div>
              </div>
            </div>

            {/* Tab Selection */}
            <div className="mt-4 flex items-center gap-2 border-b border-zinc-200/60 pb-3 text-xs font-semibold">
              <span className="rounded-lg bg-white px-3 py-1.5 text-zinc-950 shadow-xs border border-zinc-200">
                Meus Agendamentos (2)
              </span>
              <span className="px-3 py-1.5 text-zinc-500 hover:text-zinc-900 cursor-pointer">
                Histórico Concluído
              </span>
              <span className="px-3 py-1.5 text-zinc-500 hover:text-zinc-900 cursor-pointer">
                Meus Dados
              </span>
            </div>

            {/* Active Appointments Cards */}
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {/* Card 1: Agendado pela Clínica */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs transition hover:border-zinc-300">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400">Sexta-feira, 15 de Agosto</span>
                    <p className="text-2xl font-extrabold text-zinc-950">14:30</p>
                  </div>
                  <span className="rounded-md bg-zinc-950 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
                    CONFIRMADO
                  </span>
                </div>

                <div className="mt-3 border-t border-zinc-100 pt-3">
                  <h4 className="text-sm font-bold text-zinc-950">Botox Facial & Harmonização</h4>
                  <div className="mt-2 space-y-1 text-xs text-zinc-600">
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 text-zinc-400" />
                      <span>Duração: 45 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserRound className="size-3.5 text-zinc-400" />
                      <span>Profissional: Dra. Camila Rocha</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold text-zinc-700">
                    <Building2 className="size-3 text-zinc-600" /> AGENDADO PELA CLÍNICA
                  </span>
                  <span className="text-[11px] font-medium text-zinc-400">ID #8492</span>
                </div>
              </div>

              {/* Card 2: Agendado pelo Cliente */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs transition hover:border-zinc-300">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400">Sexta-feira, 22 de Agosto</span>
                    <p className="text-2xl font-extrabold text-zinc-950">10:00</p>
                  </div>
                  <span className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-amber-900">
                    PENDENTE
                  </span>
                </div>

                <div className="mt-3 border-t border-zinc-100 pt-3">
                  <h4 className="text-sm font-bold text-zinc-950">Limpeza de Pele Profunda</h4>
                  <div className="mt-2 space-y-1 text-xs text-zinc-600">
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 text-zinc-400" />
                      <span>Duração: 60 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserRound className="size-3.5 text-zinc-400" />
                      <span>Profissional: Gabriel Tavares</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold text-zinc-700">
                    <Smartphone className="size-3 text-zinc-600" /> AGENDADO PELO CLIENTE
                  </span>
                  <span className="text-[11px] font-medium text-zinc-400">ID #8501</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TiltCard>
    </FadeIn>
  );
}

export function SiteClientPortal() {
  return (
    <section
      id="portal-do-cliente"
      className="border-b border-zinc-100 bg-zinc-50 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header Centralizado */}
        <FadeIn variant="up">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 shadow-xs">
              <span className="size-1.5 rounded-full bg-zinc-950" />
              Portal do Cliente & Autoatendimento
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl lg:text-5xl leading-[1.15]">
              Seu cliente agenda sozinho.<br className="hidden sm:block" />
              Você também agenda por ele.
            </h2>

            <p className="mt-6 text-base leading-relaxed text-zinc-600 sm:text-lg">
              Cada cliente tem sua própria área, com login próprio, para marcar horários em segundos
              e acompanhar atendimentos. E tudo o que a recepção marca no painel aparece lá instantaneamente — é a mesma agenda em tempo real, vista dos dois lados.
            </p>

            {/* Botões de Ação Principais */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/cliente"
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-8 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800 sm:w-auto"
                >
                  <CalendarCheck className="size-4" /> Entrar no Portal do Cliente <ArrowRight className="size-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  href="/cliente/cadastro"
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-8 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 sm:w-auto"
                >
                  Criar Conta de Cliente
                </Link>
              </motion.div>
            </div>
          </div>
        </FadeIn>

        {/* Card Mockup Principal em Destaque */}
        <ClientPortalMockup />

        {/* Grade de Recursos e Sincronização Unificada */}
        <div className="mt-14 space-y-6">
          <StaggerContainer staggerChildren={0.15} className="grid gap-6 sm:grid-cols-2">
            {sources.map(({ id, icon: Icon, label, description, bullets }) => (
              <StaggerItem key={id} variant="up">
                <div className="h-full rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs transition-shadow duration-300 hover:shadow-md">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-xs">
                    <Icon className="size-5.5 stroke-[2.2]" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-zinc-950">{label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    {description}
                  </p>
                  <div className="mt-5 space-y-3 border-t border-zinc-100 pt-5">
                    {bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="flex items-start gap-3 text-xs font-medium text-zinc-800"
                      >
                        <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-[10px] text-white font-bold">
                          <Check className="size-3 stroke-[2.5]" />
                        </span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn variant="up" delay={0.2}>
            <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-950">
                <RefreshCw className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-950">Sincronização Nativa e Instantânea</h4>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-600">
                  <span className="font-semibold text-zinc-950">
                    Não são dois sistemas distintos conversando por APIs lentas.
                  </span>{" "}
                  Trata-se do mesmo banco de dados PostgreSQL e da mesma grade de horários. Quando a recepção agenda ou altera um horário no painel, o cliente enxerga no mesmo instante em seu portal — e vice-versa.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}


