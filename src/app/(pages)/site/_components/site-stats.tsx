"use client";

import { AnimatedNumber } from "@/components/ui/animation/animated-number";
import { StaggerContainer, StaggerItem } from "@/components/ui/animation/stagger-container";

export function SiteStats() {
  return (
    <section className="bg-zinc-50/80 border-y border-zinc-200 py-16 backdrop-blur-xs">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <StaggerContainer
          staggerChildren={0.15}
          className="grid grid-cols-2 gap-8 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200"
        >
          {[
            { val: "250+", label: "Agendamentos registrados", detail: "Com horários e durações reais" },
            { val: "260+", label: "Vendas registradas", detail: "Integradas em Pix, Cartão e Dinheiro" },
            { val: "50", label: "Clientes cadastrados", detail: "Prontuários e histórico unificado" },
            { val: "100%", label: "Relatórios em tempo real", detail: "Indicadores operacionais e DRE" },
          ].map((stat, idx) => (
            <StaggerItem key={idx} variant="up" className="pt-6 sm:pt-0 sm:px-8 first:pl-0 last:pr-0">
              <div className="text-3xl font-extrabold text-zinc-950 sm:text-4xl tracking-tight">
                <AnimatedNumber value={stat.val} />
              </div>
              <div className="mt-2 text-sm font-semibold text-zinc-900">{stat.label}</div>
              <div className="mt-1 text-xs text-zinc-500">{stat.detail}</div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

