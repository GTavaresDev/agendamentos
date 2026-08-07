"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChartNoAxesCombined,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "agenda",
    title: "Agenda organizada",
    subtitle: "Gerencie todos os atendimentos em um único lugar",
    description: "Grade de horários por profissional respeitando o tempo de cada procedimento (30min, 45min, 90min) com status de confirmação e origens de captação.",
    icon: CalendarDays,
    bullets: [
      "Visão em lista e grade por profissional",
      "Ciclo de vida: Pendente, Confirmado, Concluído e Cancelado",
      "Categorização de origens (Digital, WhatsApp, Presencial, Telefone)",
      "Trava configurável contra alteração de horários passados",
    ],
  },
  {
    id: "clientes",
    title: "Gestão de clientes",
    subtitle: "Tenha acesso rápido aos dados e histórico dos seus clientes",
    description: "Prontuário unificado contendo contatos, CPF, iniciais automáticas e histórico consolidado de atendimentos e compras no balcão.",
    icon: UserCheck,
    bullets: [
      "Prontuário unificado com iniciais automáticas",
      "Histórico completo de atendimentos e serviços",
      "Registro de compras de produtos no balcão",
      "Métricas para identificação de clientes novos e recorrentes",
    ],
  },
  {
    id: "vendas",
    title: "Vendas e produtos",
    subtitle: "Controle vendas, produtos e serviços de forma integrada",
    description: "Checkout rápido de recepção para venda cruzada de cosméticos pós-procedimento com baixa em estoque e múltiplos métodos de pagamento.",
    icon: ShoppingBag,
    bullets: [
      "Catálogo de produtos precificados e categorizados",
      "Venda cruzada pós-procedimento na recepção",
      "Suporte a Pix, Cartão de Crédito, Débito e Dinheiro",
      "Baixa automática de estoque e cálculo de ticket médio",
    ],
  },
  {
    id: "relatorios",
    title: "Relatórios e DRE",
    subtitle: "Acompanhe indicadores e resultados do estabelecimento",
    description: "Métricas consolidadas de faturamento em tempo real, ticket médio, mapa de calor de ocupação semanal e produtividade por profissional.",
    icon: ChartNoAxesCombined,
    bullets: [
      "Faturamento total e DRE em tempo real",
      "Mapa de calor de ocupação nos dias da semana",
      "Ranking dos procedimentos e produtos mais vendidos",
      "Carga de trabalho e faturamento por profissional",
    ],
  },
  {
    id: "equipe",
    title: "Gestão de equipe",
    subtitle: "Controle de acesso granular adaptado à sua clínica",
    description: "Perfis diferenciados para Administradores, Gestores, Esteticistas e Recepção, garantindo segurança e foco em cada função.",
    icon: ShieldCheck,
    bullets: [
      "Perfis de acesso: Admin, Gestor, Profissional e Recepção",
      "Permissões customizáveis de relatórios e acessos",
      "Visão focada na agenda própria para profissionais",
      "Bloqueio de segurança temporário contra acessos inválidos",
    ],
  },
];

export function SiteFeatures() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="recursos" className="py-20 lg:py-28 bg-white border-b border-zinc-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Recursos da Plataforma</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Tudo o que seu estabelecimento precisa
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            Desenvolvido com foco na rotina de recepções, profissionais de saúde/estética e gestores.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="mt-12 flex justify-start md:justify-center overflow-x-auto pb-2 gap-2.5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            const active = activeTab === idx;
            return (
              <button
                key={feat.id}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold transition-all",
                  active
                    ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                )}
              >
                <Icon className="size-4" />
                <span>{feat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Detail Card */}
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 lg:p-12 shadow-xs">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <span className="inline-block rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                {features[activeTab].subtitle}
              </span>
              <h3 className="mt-4 text-2xl font-bold text-zinc-950 sm:text-3xl">
                {features[activeTab].title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                {features[activeTab].description}
              </p>

              <div className="mt-6 space-y-3">
                {features[activeTab].bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs font-medium text-zinc-800">
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white text-[9px]">
                      ✓
                    </span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 text-xs font-semibold text-white transition hover:bg-zinc-800"
                >
                  Testar no Sistema <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 lg:col-span-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-xs">
                  <CalendarDays className="size-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-950">Visualização de Módulo</h4>
                  <p className="text-[11px] text-zinc-400">{features[activeTab].title}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="rounded-lg bg-zinc-50 p-4 border border-zinc-100 text-zinc-700">
                  <span className="font-semibold text-zinc-950 block mb-1.5">Destaques da Funcionalidade:</span>
                  <ul className="list-disc list-inside space-y-1.5 text-[11px] text-zinc-600">
                    <li>Integrado ao banco de dados PostgreSQL</li>
                    <li>Atualização instantânea no painel</li>
                    <li>Histórico mantido com segurança</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
